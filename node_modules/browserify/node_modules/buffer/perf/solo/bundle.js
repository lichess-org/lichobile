(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  assert(Buffer.isBuffer(buf), 'buffer must be a Buffer instance')
  assert(value <= max && value >= min, 'value is out of bounds')
  assert(offset + ext <= buf.length, 'index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  assert(value <= max && value >= min, 'value is out of bounds')
  assert(offset + ext <= buf.length, 'index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(this, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":2,"ieee754":5}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],3:[function(require,module,exports){
(function (process,global){
/*!
 * Benchmark.js v1.0.0 <http://benchmarkjs.com/>
 * Copyright 2010-2012 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function(window, undefined) {
  'use strict';

  /** Used to assign each benchmark an incrimented id */
  var counter = 0;

  /** Detect DOM document object */
  var doc = isHostType(window, 'document') && document;

  /** Detect free variable `define` */
  var freeDefine = typeof define == 'function' &&
    typeof define.amd == 'object' && define.amd && define;

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports &&
    (typeof global == 'object' && global && global == global.global && (window = global), exports);

  /** Detect free variable `require` */
  var freeRequire = typeof require == 'function' && require;

  /** Used to crawl all properties regardless of enumerability */
  var getAllKeys = Object.getOwnPropertyNames;

  /** Used to get property descriptors */
  var getDescriptor = Object.getOwnPropertyDescriptor;

  /** Used in case an object doesn't have its own method */
  var hasOwnProperty = {}.hasOwnProperty;

  /** Used to check if an object is extensible */
  var isExtensible = Object.isExtensible || function() { return true; };

  /** Used to access Wade Simmons' Node microtime module */
  var microtimeObject = req('microtime');

  /** Used to access the browser's high resolution timer */
  var perfObject = isHostType(window, 'performance') && performance;

  /** Used to call the browser's high resolution timer */
  var perfName = perfObject && (
    perfObject.now && 'now' ||
    perfObject.webkitNow && 'webkitNow'
  );

  /** Used to access Node's high resolution timer */
  var processObject = isHostType(window, 'process') && process;

  /** Used to check if an own property is enumerable */
  var propertyIsEnumerable = {}.propertyIsEnumerable;

  /** Used to set property descriptors */
  var setDescriptor = Object.defineProperty;

  /** Used to resolve a value's internal [[Class]] */
  var toString = {}.toString;

  /** Used to prevent a `removeChild` memory leak in IE < 9 */
  var trash = doc && doc.createElement('div');

  /** Used to integrity check compiled tests */
  var uid = 'uid' + (+new Date);

  /** Used to avoid infinite recursion when methods call each other */
  var calledBy = {};

  /** Used to avoid hz of Infinity */
  var divisors = {
    '1': 4096,
    '2': 512,
    '3': 64,
    '4': 8,
    '5': 0
  };

  /**
   * T-Distribution two-tailed critical values for 95% confidence
   * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
   */
  var tTable = {
    '1':  12.706,'2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
    '7':  2.365, '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
    '13': 2.16,  '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
    '19': 2.093, '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
    '25': 2.06,  '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
    'infinity': 1.96
  };

  /**
   * Critical Mann-Whitney U-values for 95% confidence
   * http://www.saburchill.com/IBbiology/stats/003.html
   */
  var uTable = {
    '5':  [0, 1, 2],
    '6':  [1, 2, 3, 5],
    '7':  [1, 3, 5, 6, 8],
    '8':  [2, 4, 6, 8, 10, 13],
    '9':  [2, 4, 7, 10, 12, 15, 17],
    '10': [3, 5, 8, 11, 14, 17, 20, 23],
    '11': [3, 6, 9, 13, 16, 19, 23, 26, 30],
    '12': [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
    '13': [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
    '14': [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
    '15': [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
    '16': [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
    '17': [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
    '18': [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
    '19': [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
    '20': [8, 14, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 98, 105, 112, 119, 127],
    '21': [8, 15, 22, 29, 36, 43, 50, 58, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142],
    '22': [9, 16, 23, 30, 38, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 150, 158],
    '23': [9, 17, 24, 32, 40, 48, 56, 64, 73, 81, 89, 98, 106, 115, 123, 132, 140, 149, 157, 166, 175],
    '24': [10, 17, 25, 33, 42, 50, 59, 67, 76, 85, 94, 102, 111, 120, 129, 138, 147, 156, 165, 174, 183, 192],
    '25': [10, 18, 27, 35, 44, 53, 62, 71, 80, 89, 98, 107, 117, 126, 135, 145, 154, 163, 173, 182, 192, 201, 211],
    '26': [11, 19, 28, 37, 46, 55, 64, 74, 83, 93, 102, 112, 122, 132, 141, 151, 161, 171, 181, 191, 200, 210, 220, 230],
    '27': [11, 20, 29, 38, 48, 57, 67, 77, 87, 97, 107, 118, 125, 138, 147, 158, 168, 178, 188, 199, 209, 219, 230, 240, 250],
    '28': [12, 21, 30, 40, 50, 60, 70, 80, 90, 101, 111, 122, 132, 143, 154, 164, 175, 186, 196, 207, 218, 228, 239, 250, 261, 272],
    '29': [13, 22, 32, 42, 52, 62, 73, 83, 94, 105, 116, 127, 138, 149, 160, 171, 182, 193, 204, 215, 226, 238, 249, 260, 271, 282, 294],
    '30': [13, 23, 33, 43, 54, 65, 76, 87, 98, 109, 120, 131, 143, 154, 166, 177, 189, 200, 212, 223, 235, 247, 258, 270, 282, 293, 305, 317]
  };

  /**
   * An object used to flag environments/features.
   *
   * @static
   * @memberOf Benchmark
   * @type Object
   */
  var support = {};

  (function() {

    /**
     * Detect Adobe AIR.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.air = isClassOf(window.runtime, 'ScriptBridgingProxyObject');

    /**
     * Detect if `arguments` objects have the correct internal [[Class]] value.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.argumentsClass = isClassOf(arguments, 'Arguments');

    /**
     * Detect if in a browser environment.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.browser = doc && isHostType(window, 'navigator');

    /**
     * Detect if strings support accessing characters by index.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.charByIndex =
      // IE 8 supports indexes on string literals but not string objects
      ('x'[0] + Object('x')[0]) == 'xx';

    /**
     * Detect if strings have indexes as own properties.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.charByOwnIndex =
      // Narwhal, Rhino, RingoJS, IE 8, and Opera < 10.52 support indexes on
      // strings but don't detect them as own properties
      support.charByIndex && hasKey('x', '0');

    /**
     * Detect if Java is enabled/exposed.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.java = isClassOf(window.java, 'JavaPackage');

    /**
     * Detect if the Timers API exists.
     *
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.timeout = isHostType(window, 'setTimeout') && isHostType(window, 'clearTimeout');

    /**
     * Detect if functions support decompilation.
     *
     * @name decompilation
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      // Safari 2.x removes commas in object literals
      // from Function#toString results
      // http://webk.it/11609
      // Firefox 3.6 and Opera 9.25 strip grouping
      // parentheses from Function#toString results
      // http://bugzil.la/559438
      support.decompilation = Function(
        'return (' + (function(x) { return { 'x': '' + (1 + x) + '', 'y': 0 }; }) + ')'
      )()(0).x === '1';
    } catch(e) {
      support.decompilation = false;
    }

    /**
     * Detect ES5+ property descriptor API.
     *
     * @name descriptors
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      var o = {};
      support.descriptors = (setDescriptor(o, o, o), 'value' in getDescriptor(o, o));
    } catch(e) {
      support.descriptors = false;
    }

    /**
     * Detect ES5+ Object.getOwnPropertyNames().
     *
     * @name getAllKeys
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      support.getAllKeys = /\bvalueOf\b/.test(getAllKeys(Object.prototype));
    } catch(e) {
      support.getAllKeys = false;
    }

    /**
     * Detect if own properties are iterated before inherited properties (all but IE < 9).
     *
     * @name iteratesOwnLast
     * @memberOf Benchmark.support
     * @type Boolean
     */
    support.iteratesOwnFirst = (function() {
      var props = [];
      function ctor() { this.x = 1; }
      ctor.prototype = { 'y': 1 };
      for (var prop in new ctor) { props.push(prop); }
      return props[0] == 'x';
    }());

    /**
     * Detect if a node's [[Class]] is resolvable (all but IE < 9)
     * and that the JS engine errors when attempting to coerce an object to a
     * string without a `toString` property value of `typeof` "function".
     *
     * @name nodeClass
     * @memberOf Benchmark.support
     * @type Boolean
     */
    try {
      support.nodeClass = ({ 'toString': 0 } + '', toString.call(doc || 0) != '[object Object]');
    } catch(e) {
      support.nodeClass = true;
    }
  }());

  /**
   * Timer object used by `clock()` and `Deferred#resolve`.
   *
   * @private
   * @type Object
   */
  var timer = {

   /**
    * The timer namespace object or constructor.
    *
    * @private
    * @memberOf timer
    * @type Function|Object
    */
    'ns': Date,

   /**
    * Starts the deferred timer.
    *
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'start': null, // lazy defined in `clock()`

   /**
    * Stops the deferred timer.
    *
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'stop': null // lazy defined in `clock()`
  };

  /** Shortcut for inverse results */
  var noArgumentsClass = !support.argumentsClass,
      noCharByIndex = !support.charByIndex,
      noCharByOwnIndex = !support.charByOwnIndex;

  /** Math shortcuts */
  var abs   = Math.abs,
      floor = Math.floor,
      max   = Math.max,
      min   = Math.min,
      pow   = Math.pow,
      sqrt  = Math.sqrt;

  /*--------------------------------------------------------------------------*/

  /**
   * The Benchmark constructor.
   *
   * @constructor
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var bench = new Benchmark(fn);
   *
   * // or using a name first
   * var bench = new Benchmark('foo', fn);
   *
   * // or with options
   * var bench = new Benchmark('foo', fn, {
   *
   *   // displayed by Benchmark#toString if `name` is not available
   *   'id': 'xyz',
   *
   *   // called when the benchmark starts running
   *   'onStart': onStart,
   *
   *   // called after each run cycle
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the benchmark completes running
   *   'onComplete': onComplete,
   *
   *   // compiled/called before the test loop
   *   'setup': setup,
   *
   *   // compiled/called after the test loop
   *   'teardown': teardown
   * });
   *
   * // or name and options
   * var bench = new Benchmark('foo', {
   *
   *   // a flag to indicate the benchmark is deferred
   *   'defer': true,
   *
   *   // benchmark test function
   *   'fn': function(deferred) {
   *     // call resolve() when the deferred test is finished
   *     deferred.resolve();
   *   }
   * });
   *
   * // or options only
   * var bench = new Benchmark({
   *
   *   // benchmark name
   *   'name': 'foo',
   *
   *   // benchmark test as a string
   *   'fn': '[1,2,3,4].sort()'
   * });
   *
   * // a test's `this` binding is set to the benchmark instance
   * var bench = new Benchmark('foo', function() {
   *   'My name is '.concat(this.name); // My name is foo
   * });
   */
  function Benchmark(name, fn, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me == null || me.constructor != Benchmark) {
      return new Benchmark(name, fn, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    }
    else if (isClassOf(name, 'Function')) {
      // 2 arguments (fn, options)
      options = fn;
      fn = name;
    }
    else if (isClassOf(fn, 'Object')) {
      // 2 arguments (name, options)
      options = fn;
      fn = null;
      me.name = name;
    }
    else {
      // 3 arguments (name, fn [, options])
      me.name = name;
    }
    setOptions(me, options);
    me.id || (me.id = ++counter);
    me.fn == null && (me.fn = fn);
    me.stats = deepClone(me.stats);
    me.times = deepClone(me.times);
  }

  /**
   * The Deferred constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {Object} clone The cloned benchmark instance.
   */
  function Deferred(clone) {
    var me = this;
    if (me == null || me.constructor != Deferred) {
      return new Deferred(clone);
    }
    me.benchmark = clone;
    clock(me);
  }

  /**
   * The Event constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String|Object} type The event type.
   */
  function Event(type) {
    var me = this;
    return (me == null || me.constructor != Event)
      ? new Event(type)
      : (type instanceof Event)
          ? type
          : extend(me, { 'timeStamp': +new Date }, typeof type == 'string' ? { 'type': type } : type);
  }

  /**
   * The Suite constructor.
   *
   * @constructor
   * @memberOf Benchmark
   * @param {String} name A name to identify the suite.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var suite = new Benchmark.Suite;
   *
   * // or using a name first
   * var suite = new Benchmark.Suite('foo');
   *
   * // or with options
   * var suite = new Benchmark.Suite('foo', {
   *
   *   // called when the suite starts running
   *   'onStart': onStart,
   *
   *   // called between running benchmarks
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the suite completes running
   *   'onComplete': onComplete
   * });
   */
  function Suite(name, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me == null || me.constructor != Suite) {
      return new Suite(name, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    } else {
      // 2 arguments (name [, options])
      me.name = name;
    }
    setOptions(me, options);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Note: Some array methods have been implemented in plain JavaScript to avoid
   * bugs in IE, Opera, Rhino, and Mobile Safari.
   *
   * IE compatibility mode and IE < 9 have buggy Array `shift()` and `splice()`
   * functions that fail to remove the last element, `object[0]`, of
   * array-like-objects even though the `length` property is set to `0`.
   * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
   * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
   *
   * In Opera < 9.50 and some older/beta Mobile Safari versions using `unshift()`
   * generically to augment the `arguments` object will pave the value at index 0
   * without incrimenting the other values's indexes.
   * https://github.com/documentcloud/underscore/issues/9
   *
   * Rhino and environments it powers, like Narwhal and RingoJS, may have
   * buggy Array `concat()`, `reverse()`, `shift()`, `slice()`, `splice()` and
   * `unshift()` functions that make sparse arrays non-sparse by assigning the
   * undefined indexes a value of undefined.
   * https://github.com/mozilla/rhino/commit/702abfed3f8ca043b2636efd31c14ba7552603dd
   */

  /**
   * Creates an array containing the elements of the host array followed by the
   * elements of each argument in order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The new array.
   */
  function concat() {
    var value,
        j = -1,
        length = arguments.length,
        result = slice.call(this),
        index = result.length;

    while (++j < length) {
      value = arguments[j];
      if (isClassOf(value, 'Array')) {
        for (var k = 0, l = value.length; k < l; k++, index++) {
          if (k in value) {
            result[index] = value[k];
          }
        }
      } else {
        result[index++] = value;
      }
    }
    return result;
  }

  /**
   * Utility function used by `shift()`, `splice()`, and `unshift()`.
   *
   * @private
   * @param {Number} start The index to start inserting elements.
   * @param {Number} deleteCount The number of elements to delete from the insert point.
   * @param {Array} elements The elements to insert.
   * @returns {Array} An array of deleted elements.
   */
  function insert(start, deleteCount, elements) {
    // `result` should have its length set to the `deleteCount`
    // see https://bugs.ecmascript.org/show_bug.cgi?id=332
    var deleteEnd = start + deleteCount,
        elementCount = elements ? elements.length : 0,
        index = start - 1,
        length = start + elementCount,
        object = this,
        result = Array(deleteCount),
        tail = slice.call(object, deleteEnd);

    // delete elements from the array
    while (++index < deleteEnd) {
      if (index in object) {
        result[index - start] = object[index];
        delete object[index];
      }
    }
    // insert elements
    index = start - 1;
    while (++index < length) {
      object[index] = elements[index - start];
    }
    // append tail elements
    start = index--;
    length = max(0, (object.length >>> 0) - deleteCount + elementCount);
    while (++index < length) {
      if ((index - start) in tail) {
        object[index] = tail[index - start];
      } else if (index in object) {
        delete object[index];
      }
    }
    // delete excess elements
    deleteCount = deleteCount > elementCount ? deleteCount - elementCount : 0;
    while (deleteCount--) {
      index = length + deleteCount;
      if (index in object) {
        delete object[index];
      }
    }
    object.length = length;
    return result;
  }

  /**
   * Rearrange the host array's elements in reverse order.
   *
   * @memberOf Benchmark.Suite
   * @returns {Array} The reversed array.
   */
  function reverse() {
    var upperIndex,
        value,
        index = -1,
        object = Object(this),
        length = object.length >>> 0,
        middle = floor(length / 2);

    if (length > 1) {
      while (++index < middle) {
        upperIndex = length - index - 1;
        value = upperIndex in object ? object[upperIndex] : uid;
        if (index in object) {
          object[upperIndex] = object[index];
        } else {
          delete object[upperIndex];
        }
        if (value != uid) {
          object[index] = value;
        } else {
          delete object[index];
        }
      }
    }
    return object;
  }

  /**
   * Removes the first element of the host array and returns it.
   *
   * @memberOf Benchmark.Suite
   * @returns {Mixed} The first element of the array.
   */
  function shift() {
    return insert.call(this, 0, 1)[0];
  }

  /**
   * Creates an array of the host array's elements from the start index up to,
   * but not including, the end index.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The starting index.
   * @param {Number} end The end index.
   * @returns {Array} The new array.
   */
  function slice(start, end) {
    var index = -1,
        object = Object(this),
        length = object.length >>> 0,
        result = [];

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);
    start--;
    end = end == null ? length : toInteger(end);
    end = end < 0 ? max(length + end, 0) : min(end, length);

    while ((++index, ++start) < end) {
      if (start in object) {
        result[index] = object[start];
      }
    }
    return result;
  }

  /**
   * Allows removing a range of elements and/or inserting elements into the
   * host array.
   *
   * @memberOf Benchmark.Suite
   * @param {Number} start The start index.
   * @param {Number} deleteCount The number of elements to delete.
   * @param {Mixed} [val1, val2, ...] values to insert at the `start` index.
   * @returns {Array} An array of removed elements.
   */
  function splice(start, deleteCount) {
    var object = Object(this),
        length = object.length >>> 0;

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);

    // support the de-facto SpiderMonkey extension
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice#Parameters
    // https://bugs.ecmascript.org/show_bug.cgi?id=429
    deleteCount = arguments.length == 1
      ? length - start
      : min(max(toInteger(deleteCount), 0), length - start);

    return insert.call(object, start, deleteCount, slice.call(arguments, 2));
  }

  /**
   * Converts the specified `value` to an integer.
   *
   * @private
   * @param {Mixed} value The value to convert.
   * @returns {Number} The resulting integer.
   */
  function toInteger(value) {
    value = +value;
    return value === 0 || !isFinite(value) ? value || 0 : value - (value % 1);
  }

  /**
   * Appends arguments to the host array.
   *
   * @memberOf Benchmark.Suite
   * @returns {Number} The new length.
   */
  function unshift() {
    var object = Object(this);
    insert.call(object, 0, 0, arguments);
    return object.length;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * A generic `Function#bind` like method.
   *
   * @private
   * @param {Function} fn The function to be bound to `thisArg`.
   * @param {Mixed} thisArg The `this` binding for the given function.
   * @returns {Function} The bound function.
   */
  function bind(fn, thisArg) {
    return function() { fn.apply(thisArg, arguments); };
  }

  /**
   * Creates a function from the given arguments string and body.
   *
   * @private
   * @param {String} args The comma separated function arguments.
   * @param {String} body The function body.
   * @returns {Function} The new function.
   */
  function createFunction() {
    // lazy define
    createFunction = function(args, body) {
      var result,
          anchor = freeDefine ? define.amd : Benchmark,
          prop = uid + 'createFunction';

      runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
      result = anchor[prop];
      delete anchor[prop];
      return result;
    };
    // fix JaegerMonkey bug
    // http://bugzil.la/639720
    createFunction = support.browser && (createFunction('', 'return"' + uid + '"') || noop)() == uid ? createFunction : Function;
    return createFunction.apply(null, arguments);
  }

  /**
   * Delay the execution of a function based on the benchmark's `delay` property.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} fn The function to execute.
   */
  function delay(bench, fn) {
    bench._timerId = setTimeout(fn, bench.delay * 1e3);
  }

  /**
   * Destroys the given element.
   *
   * @private
   * @param {Element} element The element to destroy.
   */
  function destroyElement(element) {
    trash.appendChild(element);
    trash.innerHTML = '';
  }

  /**
   * Iterates over an object's properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Object} options The options object.
   * @returns {Object} Returns the object iterated over.
   */
  function forProps() {
    var forShadowed,
        skipSeen,
        forArgs = true,
        shadowed = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

    (function(enumFlag, key) {
      // must use a non-native constructor to catch the Safari 2 issue
      function Klass() { this.valueOf = 0; };
      Klass.prototype.valueOf = 0;
      // check various for-in bugs
      for (key in new Klass) {
        enumFlag += key == 'valueOf' ? 1 : 0;
      }
      // check if `arguments` objects have non-enumerable indexes
      for (key in arguments) {
        key == '0' && (forArgs = false);
      }
      // Safari 2 iterates over shadowed properties twice
      // http://replay.waybackmachine.org/20090428222941/http://tobielangel.com/2007/1/29/for-in-loop-broken-in-safari/
      skipSeen = enumFlag == 2;
      // IE < 9 incorrectly makes an object's properties non-enumerable if they have
      // the same name as other non-enumerable properties in its prototype chain.
      forShadowed = !enumFlag;
    }(0));

    // lazy define
    forProps = function(object, callback, options) {
      options || (options = {});

      var result = object;
      object = Object(object);

      var ctor,
          key,
          keys,
          skipCtor,
          done = !result,
          which = options.which,
          allFlag = which == 'all',
          index = -1,
          iteratee = object,
          length = object.length,
          ownFlag = allFlag || which == 'own',
          seen = {},
          skipProto = isClassOf(object, 'Function'),
          thisArg = options.bind;

      if (thisArg !== undefined) {
        callback = bind(callback, thisArg);
      }
      // iterate all properties
      if (allFlag && support.getAllKeys) {
        for (index = 0, keys = getAllKeys(object), length = keys.length; index < length; index++) {
          key = keys[index];
          if (callback(object[key], key, object) === false) {
            break;
          }
        }
      }
      // else iterate only enumerable properties
      else {
        for (key in object) {
          // Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
          // (if the prototype or a property on the prototype has been set)
          // incorrectly set a function's `prototype` property [[Enumerable]] value
          // to `true`. Because of this we standardize on skipping the `prototype`
          // property of functions regardless of their [[Enumerable]] value.
          if ((done =
              !(skipProto && key == 'prototype') &&
              !(skipSeen && (hasKey(seen, key) || !(seen[key] = true))) &&
              (!ownFlag || ownFlag && hasKey(object, key)) &&
              callback(object[key], key, object) === false)) {
            break;
          }
        }
        // in IE < 9 strings don't support accessing characters by index
        if (!done && (forArgs && isArguments(object) ||
            ((noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String') &&
              (iteratee = noCharByIndex ? object.split('') : object)))) {
          while (++index < length) {
            if ((done =
                callback(iteratee[index], String(index), object) === false)) {
              break;
            }
          }
        }
        if (!done && forShadowed) {
          // Because IE < 9 can't set the `[[Enumerable]]` attribute of an existing
          // property and the `constructor` property of a prototype defaults to
          // non-enumerable, we manually skip the `constructor` property when we
          // think we are iterating over a `prototype` object.
          ctor = object.constructor;
          skipCtor = ctor && ctor.prototype && ctor.prototype.constructor === ctor;
          for (index = 0; index < 7; index++) {
            key = shadowed[index];
            if (!(skipCtor && key == 'constructor') &&
                hasKey(object, key) &&
                callback(object[key], key, object) === false) {
              break;
            }
          }
        }
      }
      return result;
    };
    return forProps.apply(null, arguments);
  }

  /**
   * Gets the name of the first argument from a function's source.
   *
   * @private
   * @param {Function} fn The function.
   * @returns {String} The argument name.
   */
  function getFirstArgument(fn) {
    return (!hasKey(fn, 'toString') &&
      (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1]) || '';
  }

  /**
   * Computes the arithmetic mean of a sample.
   *
   * @private
   * @param {Array} sample The sample.
   * @returns {Number} The mean.
   */
  function getMean(sample) {
    return reduce(sample, function(sum, x) {
      return sum + x;
    }) / sample.length || 0;
  }

  /**
   * Gets the source code of a function.
   *
   * @private
   * @param {Function} fn The function.
   * @param {String} altSource A string used when a function's source code is unretrievable.
   * @returns {String} The function's source code.
   */
  function getSource(fn, altSource) {
    var result = altSource;
    if (isStringable(fn)) {
      result = String(fn);
    } else if (support.decompilation) {
      // escape the `{` for Firefox 1
      result = (/^[^{]+\{([\s\S]*)}\s*$/.exec(fn) || 0)[1];
    }
    // trim string
    result = (result || '').replace(/^\s+|\s+$/g, '');

    // detect strings containing only the "use strict" directive
    return /^(?:\/\*+[\w|\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result)
      ? ''
      : result;
  }

  /**
   * Checks if a value is an `arguments` object.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value is an `arguments` object, else `false`.
   */
  function isArguments() {
    // lazy define
    isArguments = function(value) {
      return toString.call(value) == '[object Arguments]';
    };
    if (noArgumentsClass) {
      isArguments = function(value) {
        return hasKey(value, 'callee') &&
          !(propertyIsEnumerable && propertyIsEnumerable.call(value, 'callee'));
      };
    }
    return isArguments(arguments[0]);
  }

  /**
   * Checks if an object is of the specified class.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @param {String} name The name of the class.
   * @returns {Boolean} Returns `true` if the value is of the specified class, else `false`.
   */
  function isClassOf(value, name) {
    return value != null && toString.call(value) == '[object ' + name + ']';
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
   *
   * @private
   * @param {Mixed} object The owner of the property.
   * @param {String} property The property to check.
   * @returns {Boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Checks if a given `value` is an object created by the `Object` constructor
   * assuming objects created by the `Object` constructor have no inherited
   * enumerable properties and that there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a plain `Object` object, else `false`.
   */
  function isPlainObject(value) {
    // avoid non-objects and false positives for `arguments` objects in IE < 9
    var result = false;
    if (!(value && typeof value == 'object') || (noArgumentsClass && isArguments(value))) {
      return result;
    }
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings.
    // Also check that the constructor is `Object` (i.e. `Object instanceof Object`)
    var ctor = value.constructor;
    if ((support.nodeClass || !(typeof value.toString != 'function' && typeof (value + '') == 'string')) &&
        (!isClassOf(ctor, 'Function') || ctor instanceof ctor)) {
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      if (support.iteratesOwnFirst) {
        forProps(value, function(subValue, subKey) {
          result = subKey;
        });
        return result === false || hasKey(value, result);
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      forProps(value, function(subValue, subKey) {
        result = !hasKey(value, subKey);
        return false;
      });
      return result === false;
    }
    return result;
  }

  /**
   * Checks if a value can be safely coerced to a string.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value can be coerced, else `false`.
   */
  function isStringable(value) {
    return hasKey(value, 'toString') || isClassOf(value, 'String');
  }

  /**
   * Wraps a function and passes `this` to the original function as the
   * first argument.
   *
   * @private
   * @param {Function} fn The function to be wrapped.
   * @returns {Function} The new function.
   */
  function methodize(fn) {
    return function() {
      var args = [this];
      args.push.apply(args, arguments);
      return fn.apply(null, args);
    };
  }

  /**
   * A no-operation function.
   *
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * A wrapper around require() to suppress `module missing` errors.
   *
   * @private
   * @param {String} id The module id.
   * @returns {Mixed} The exported module or `null`.
   */
  function req(id) {
    try {
      var result = freeExports && freeRequire(id);
    } catch(e) { }
    return result || null;
  }

  /**
   * Runs a snippet of JavaScript via script injection.
   *
   * @private
   * @param {String} code The code to run.
   */
  function runScript(code) {
    var anchor = freeDefine ? define.amd : Benchmark,
        script = doc.createElement('script'),
        sibling = doc.getElementsByTagName('script')[0],
        parent = sibling.parentNode,
        prop = uid + 'runScript',
        prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';

    // Firefox 2.0.0.2 cannot use script injection as intended because it executes
    // asynchronously, but that's OK because script injection is only used to avoid
    // the previously commented JaegerMonkey bug.
    try {
      // remove the inserted script *before* running the code to avoid differences
      // in the expected script element count/order of the document.
      script.appendChild(doc.createTextNode(prefix + code));
      anchor[prop] = function() { destroyElement(script); };
    } catch(e) {
      parent = parent.cloneNode(false);
      sibling = null;
      script.text = code;
    }
    parent.insertBefore(script, sibling);
    delete anchor[prop];
  }

  /**
   * A helper function for setting options/event handlers.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} [options={}] Options object.
   */
  function setOptions(bench, options) {
    options = extend({}, bench.constructor.options, options);
    bench.options = forOwn(options, function(value, key) {
      if (value != null) {
        // add event listeners
        if (/^on[A-Z]/.test(key)) {
          forEach(key.split(' '), function(key) {
            bench.on(key.slice(2).toLowerCase(), value);
          });
        } else if (!hasKey(bench, key)) {
          bench[key] = deepClone(value);
        }
      }
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Handles cycling/completing the deferred benchmark.
   *
   * @memberOf Benchmark.Deferred
   */
  function resolve() {
    var me = this,
        clone = me.benchmark,
        bench = clone._original;

    if (bench.aborted) {
      // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete
      me.teardown();
      clone.running = false;
      cycle(me);
    }
    else if (++me.cycles < clone.count) {
      // continue the test loop
      if (support.timeout) {
        // use setTimeout to avoid a call stack overflow if called recursively
        setTimeout(function() { clone.compiled.call(me, timer); }, 0);
      } else {
        clone.compiled.call(me, timer);
      }
    }
    else {
      timer.stop(me);
      me.teardown();
      delay(clone, function() { cycle(me); });
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * A deep clone utility.
   *
   * @static
   * @memberOf Benchmark
   * @param {Mixed} value The value to clone.
   * @returns {Mixed} The cloned value.
   */
  function deepClone(value) {
    var accessor,
        circular,
        clone,
        ctor,
        descriptor,
        extensible,
        key,
        length,
        markerKey,
        parent,
        result,
        source,
        subIndex,
        data = { 'value': value },
        index = 0,
        marked = [],
        queue = { 'length': 0 },
        unmarked = [];

    /**
     * An easily detectable decorator for cloned values.
     */
    function Marker(object) {
      this.raw = object;
    }

    /**
     * The callback used by `forProps()`.
     */
    function forPropsCallback(subValue, subKey) {
      // exit early to avoid cloning the marker
      if (subValue && subValue.constructor == Marker) {
        return;
      }
      // add objects to the queue
      if (subValue === Object(subValue)) {
        queue[queue.length++] = { 'key': subKey, 'parent': clone, 'source': value };
      }
      // assign non-objects
      else {
        try {
          // will throw an error in strict mode if the property is read-only
          clone[subKey] = subValue;
        } catch(e) { }
      }
    }

    /**
     * Gets an available marker key for the given object.
     */
    function getMarkerKey(object) {
      // avoid collisions with existing keys
      var result = uid;
      while (object[result] && object[result].constructor != Marker) {
        result += 1;
      }
      return result;
    }

    do {
      key = data.key;
      parent = data.parent;
      source = data.source;
      clone = value = source ? source[key] : data.value;
      accessor = circular = descriptor = false;

      // create a basic clone to filter out functions, DOM elements, and
      // other non `Object` objects
      if (value === Object(value)) {
        // use custom deep clone function if available
        if (isClassOf(value.deepClone, 'Function')) {
          clone = value.deepClone();
        } else {
          ctor = value.constructor;
          switch (toString.call(value)) {
            case '[object Array]':
              clone = new ctor(value.length);
              break;

            case '[object Boolean]':
              clone = new ctor(value == true);
              break;

            case '[object Date]':
              clone = new ctor(+value);
              break;

            case '[object Object]':
              isPlainObject(value) && (clone = {});
              break;

            case '[object Number]':
            case '[object String]':
              clone = new ctor(value);
              break;

            case '[object RegExp]':
              clone = ctor(value.source,
                (value.global     ? 'g' : '') +
                (value.ignoreCase ? 'i' : '') +
                (value.multiline  ? 'm' : ''));
          }
        }
        // continue clone if `value` doesn't have an accessor descriptor
        // http://es5.github.com/#x8.10.1
        if (clone && clone != value &&
            !(descriptor = source && support.descriptors && getDescriptor(source, key),
              accessor = descriptor && (descriptor.get || descriptor.set))) {
          // use an existing clone (circular reference)
          if ((extensible = isExtensible(value))) {
            markerKey = getMarkerKey(value);
            if (value[markerKey]) {
              circular = clone = value[markerKey].raw;
            }
          } else {
            // for frozen/sealed objects
            for (subIndex = 0, length = unmarked.length; subIndex < length; subIndex++) {
              data = unmarked[subIndex];
              if (data.object === value) {
                circular = clone = data.clone;
                break;
              }
            }
          }
          if (!circular) {
            // mark object to allow quickly detecting circular references and tie it to its clone
            if (extensible) {
              value[markerKey] = new Marker(clone);
              marked.push({ 'key': markerKey, 'object': value });
            } else {
              // for frozen/sealed objects
              unmarked.push({ 'clone': clone, 'object': value });
            }
            // iterate over object properties
            forProps(value, forPropsCallback, { 'which': 'all' });
          }
        }
      }
      if (parent) {
        // for custom property descriptors
        if (accessor || (descriptor && !(descriptor.configurable && descriptor.enumerable && descriptor.writable))) {
          if ('value' in descriptor) {
            descriptor.value = clone;
          }
          setDescriptor(parent, key, descriptor);
        }
        // for default property descriptors
        else {
          parent[key] = clone;
        }
      } else {
        result = clone;
      }
    } while ((data = queue[index++]));

    // remove markers
    for (index = 0, length = marked.length; index < length; index++) {
      data = marked[index];
      delete data.object[data.key];
    }
    return result;
  }

  /**
   * An iteration utility for arrays and objects.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array|Object} Returns the object iterated over.
   */
  function each(object, callback, thisArg) {
    var result = object;
    object = Object(object);

    var fn = callback,
        index = -1,
        length = object.length,
        isSnapshot = !!(object.snapshotItem && (length = object.snapshotLength)),
        isSplittable = (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String'),
        isConvertable = isSnapshot || isSplittable || 'item' in object,
        origObject = object;

    // in Opera < 10.5 `hasKey(object, 'length')` returns `false` for NodeLists
    if (length === length >>> 0) {
      if (isConvertable) {
        // the third argument of the callback is the original non-array object
        callback = function(value, index) {
          return fn.call(this, value, index, origObject);
        };
        // in IE < 9 strings don't support accessing characters by index
        if (isSplittable) {
          object = object.split('');
        } else {
          object = [];
          while (++index < length) {
            // in Safari 2 `index in object` is always `false` for NodeLists
            object[index] = isSnapshot ? result.snapshotItem(index) : result[index];
          }
        }
      }
      forEach(object, callback, thisArg);
    } else {
      forOwn(object, callback, thisArg);
    }
    return result;
  }

  /**
   * Copies enumerable properties from the source(s) object to the destination object.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} destination The destination object.
   * @param {Object} [source={}] The source object.
   * @returns {Object} The destination object.
   */
  function extend(destination, source) {
    // Chrome < 14 incorrectly sets `destination` to `undefined` when we `delete arguments[0]`
    // http://code.google.com/p/v8/issues/detail?id=839
    var result = destination;
    delete arguments[0];

    forEach(arguments, function(source) {
      forProps(source, function(value, key) {
        result[key] = value;
      });
    });
    return result;
  }

  /**
   * A generic `Array#filter` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function|String} callback The function/alias called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} A new array of values that passed callback filter.
   * @example
   *
   * // get odd numbers
   * Benchmark.filter([1, 2, 3, 4, 5], function(n) {
   *   return n % 2;
   * }); // -> [1, 3, 5];
   *
   * // get fastest benchmarks
   * Benchmark.filter(benches, 'fastest');
   *
   * // get slowest benchmarks
   * Benchmark.filter(benches, 'slowest');
   *
   * // get benchmarks that completed without erroring
   * Benchmark.filter(benches, 'successful');
   */
  function filter(array, callback, thisArg) {
    var result;

    if (callback == 'successful') {
      // callback to exclude those that are errored, unrun, or have hz of Infinity
      callback = function(bench) { return bench.cycles && isFinite(bench.hz); };
    }
    else if (callback == 'fastest' || callback == 'slowest') {
      // get successful, sort by period + margin of error, and filter fastest/slowest
      result = filter(array, 'successful').sort(function(a, b) {
        a = a.stats; b = b.stats;
        return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback == 'fastest' ? 1 : -1);
      });
      result = filter(result, function(bench) {
        return result[0].compare(bench) == 0;
      });
    }
    return result || reduce(array, function(result, value, index) {
      return callback.call(thisArg, value, index, array) ? (result.push(value), result) : result;
    }, []);
  }

  /**
   * A generic `Array#forEach` like method.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} Returns the array iterated over.
   */
  function forEach(array, callback, thisArg) {
    var index = -1,
        length = (array = Object(array)).length >>> 0;

    if (thisArg !== undefined) {
      callback = bind(callback, thisArg);
    }
    while (++index < length) {
      if (index in array &&
          callback(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Object} Returns the object iterated over.
   */
  function forOwn(object, callback, thisArg) {
    return forProps(object, callback, { 'bind': thisArg, 'which': 'own' });
  }

  /**
   * Converts a number to a more readable comma-separated string representation.
   *
   * @static
   * @memberOf Benchmark
   * @param {Number} number The number to convert.
   * @returns {String} The more readable string representation.
   */
  function formatNumber(number) {
    number = String(number).split('.');
    return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
      (number[1] ? '.' + number[1] : '');
  }

  /**
   * Checks if an object has the specified key as a direct property.
   *
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */
  function hasKey() {
    // lazy define for worst case fallback (not as accurate)
    hasKey = function(object, key) {
      var parent = object != null && (object.constructor || Object).prototype;
      return !!parent && key in Object(object) && !(key in parent && object[key] === parent[key]);
    };
    // for modern browsers
    if (isClassOf(hasOwnProperty, 'Function')) {
      hasKey = function(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      };
    }
    // for Safari 2
    else if ({}.__proto__ == Object.prototype) {
      hasKey = function(object, key) {
        var result = false;
        if (object != null) {
          object = Object(object);
          object.__proto__ = [object.__proto__, object.__proto__ = null, result = key in object][0];
        }
        return result;
      };
    }
    return hasKey.apply(this, arguments);
  }

  /**
   * A generic `Array#indexOf` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to start searching from.
   * @returns {Number} The index of the matched value or `-1`.
   */
  function indexOf(array, value, fromIndex) {
    var index = toInteger(fromIndex),
        length = (array = Object(array)).length >>> 0;

    index = (index < 0 ? max(0, length + index) : index) - 1;
    while (++index < length) {
      if (index in array && value === array[index]) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Modify a string by replacing named tokens with matching object property values.
   *
   * @static
   * @memberOf Benchmark
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */
  function interpolate(string, object) {
    forOwn(object, function(value, key) {
      // escape regexp special characters in `key`
      string = string.replace(RegExp('#\\{' + key.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '\\}', 'g'), value);
    });
    return string;
  }

  /**
   * Invokes a method on all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} benches Array of benchmarks to iterate over.
   * @param {String|Object} name The name of the method to invoke OR options object.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
   * @returns {Array} A new array of values returned from each method invoked.
   * @example
   *
   * // invoke `reset` on all benchmarks
   * Benchmark.invoke(benches, 'reset');
   *
   * // invoke `emit` with arguments
   * Benchmark.invoke(benches, 'emit', 'complete', listener);
   *
   * // invoke `run(true)`, treat benchmarks as a queue, and register invoke callbacks
   * Benchmark.invoke(benches, {
   *
   *   // invoke the `run` method
   *   'name': 'run',
   *
   *   // pass a single argument
   *   'args': true,
   *
   *   // treat as queue, removing benchmarks from front of `benches` until empty
   *   'queued': true,
   *
   *   // called before any benchmarks have been invoked.
   *   'onStart': onStart,
   *
   *   // called between invoking benchmarks
   *   'onCycle': onCycle,
   *
   *   // called after all benchmarks have been invoked.
   *   'onComplete': onComplete
   * });
   */
  function invoke(benches, name) {
    var args,
        bench,
        queued,
        index = -1,
        eventProps = { 'currentTarget': benches },
        options = { 'onStart': noop, 'onCycle': noop, 'onComplete': noop },
        result = map(benches, function(bench) { return bench; });

    /**
     * Invokes the method of the current object and if synchronous, fetches the next.
     */
    function execute() {
      var listeners,
          async = isAsync(bench);

      if (async) {
        // use `getNext` as the first listener
        bench.on('complete', getNext);
        listeners = bench.events.complete;
        listeners.splice(0, 0, listeners.pop());
      }
      // execute method
      result[index] = isClassOf(bench && bench[name], 'Function') ? bench[name].apply(bench, args) : undefined;
      // if synchronous return true until finished
      return !async && getNext();
    }

    /**
     * Fetches the next bench or executes `onComplete` callback.
     */
    function getNext(event) {
      var cycleEvent,
          last = bench,
          async = isAsync(last);

      if (async) {
        last.off('complete', getNext);
        last.emit('complete');
      }
      // emit "cycle" event
      eventProps.type = 'cycle';
      eventProps.target = last;
      cycleEvent = Event(eventProps);
      options.onCycle.call(benches, cycleEvent);

      // choose next benchmark if not exiting early
      if (!cycleEvent.aborted && raiseIndex() !== false) {
        bench = queued ? benches[0] : result[index];
        if (isAsync(bench)) {
          delay(bench, execute);
        }
        else if (async) {
          // resume execution if previously asynchronous but now synchronous
          while (execute()) { }
        }
        else {
          // continue synchronous execution
          return true;
        }
      } else {
        // emit "complete" event
        eventProps.type = 'complete';
        options.onComplete.call(benches, Event(eventProps));
      }
      // When used as a listener `event.aborted = true` will cancel the rest of
      // the "complete" listeners because they were already called above and when
      // used as part of `getNext` the `return false` will exit the execution while-loop.
      if (event) {
        event.aborted = true;
      } else {
        return false;
      }
    }

    /**
     * Checks if invoking `Benchmark#run` with asynchronous cycles.
     */
    function isAsync(object) {
      // avoid using `instanceof` here because of IE memory leak issues with host objects
      var async = args[0] && args[0].async;
      return Object(object).constructor == Benchmark && name == 'run' &&
        ((async == null ? object.options.async : async) && support.timeout || object.defer);
    }

    /**
     * Raises `index` to the next defined index or returns `false`.
     */
    function raiseIndex() {
      var length = result.length;
      if (queued) {
        // if queued remove the previous bench and subsequent skipped non-entries
        do {
          ++index > 0 && shift.call(benches);
        } while ((length = benches.length) && !('0' in benches));
      }
      else {
        while (++index < length && !(index in result)) { }
      }
      // if we reached the last index then return `false`
      return (queued ? length : index < length) ? index : (index = false);
    }

    // juggle arguments
    if (isClassOf(name, 'String')) {
      // 2 arguments (array, name)
      args = slice.call(arguments, 2);
    } else {
      // 2 arguments (array, options)
      options = extend(options, name);
      name = options.name;
      args = isClassOf(args = 'args' in options ? options.args : [], 'Array') ? args : [args];
      queued = options.queued;
    }

    // start iterating over the array
    if (raiseIndex() !== false) {
      // emit "start" event
      bench = result[index];
      eventProps.type = 'start';
      eventProps.target = bench;
      options.onStart.call(benches, Event(eventProps));

      // end early if the suite was aborted in an "onStart" listener
      if (benches.aborted && benches.constructor == Suite && name == 'run') {
        // emit "cycle" event
        eventProps.type = 'cycle';
        options.onCycle.call(benches, Event(eventProps));
        // emit "complete" event
        eventProps.type = 'complete';
        options.onComplete.call(benches, Event(eventProps));
      }
      // else start
      else {
        if (isAsync(bench)) {
          delay(bench, execute);
        } else {
          while (execute()) { }
        }
      }
    }
    return result;
  }

  /**
   * Creates a string of joined array values or object key-value pairs.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to operate on.
   * @param {String} [separator1=','] The separator used between key-value pairs.
   * @param {String} [separator2=': '] The separator used between keys and values.
   * @returns {String} The joined result.
   */
  function join(object, separator1, separator2) {
    var result = [],
        length = (object = Object(object)).length,
        arrayLike = length === length >>> 0;

    separator2 || (separator2 = ': ');
    each(object, function(value, key) {
      result.push(arrayLike ? value : key + separator2 + value);
    });
    return result.join(separator1 || ',');
  }

  /**
   * A generic `Array#map` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} thisArg The `this` binding for the callback.
   * @returns {Array} A new array of values returned by the callback.
   */
  function map(array, callback, thisArg) {
    return reduce(array, function(result, value, index) {
      result[index] = callback.call(thisArg, value, index, array);
      return result;
    }, Array(Object(array).length >>> 0));
  }

  /**
   * Retrieves the value of a specified property from all items in an array.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {String} property The property to pluck.
   * @returns {Array} A new array of property values.
   */
  function pluck(array, property) {
    return map(array, function(object) {
      return object == null ? undefined : object[property];
    });
  }

  /**
   * A generic `Array#reduce` like method.
   *
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} accumulator Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */
  function reduce(array, callback, accumulator) {
    var noaccum = arguments.length < 3;
    forEach(array, function(value, index) {
      accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts all benchmarks in the suite.
   *
   * @name abort
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function abortSuite() {
    var event,
        me = this,
        resetting = calledBy.resetSuite;

    if (me.running) {
      event = Event('abort');
      me.emit(event);
      if (!event.cancelled || resetting) {
        // avoid infinite recursion
        calledBy.abortSuite = true;
        me.reset();
        delete calledBy.abortSuite;

        if (!resetting) {
          me.aborted = true;
          invoke(me, 'abort');
        }
      }
    }
    return me;
  }

  /**
   * Adds a test to the benchmark suite.
   *
   * @memberOf Benchmark.Suite
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * suite.add(fn);
   *
   * // or using a name first
   * suite.add('foo', fn);
   *
   * // or with options
   * suite.add('foo', fn, {
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   *
   * // or name and options
   * suite.add('foo', {
   *   'fn': fn,
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   *
   * // or options only
   * suite.add({
   *   'name': 'foo',
   *   'fn': fn,
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   */
  function add(name, fn, options) {
    var me = this,
        bench = Benchmark(name, fn, options),
        event = Event({ 'type': 'add', 'target': bench });

    if (me.emit(event), !event.cancelled) {
      me.push(bench);
    }
    return me;
  }

  /**
   * Creates a new suite with cloned benchmarks.
   *
   * @name clone
   * @memberOf Benchmark.Suite
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new suite instance.
   */
  function cloneSuite(options) {
    var me = this,
        result = new me.constructor(extend({}, me.options, options));

    // copy own properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = value && isClassOf(value.clone, 'Function')
          ? value.clone()
          : deepClone(value);
      }
    });
    return result;
  }

  /**
   * An `Array#filter` like method.
   *
   * @name filter
   * @memberOf Benchmark.Suite
   * @param {Function|String} callback The function/alias called per iteration.
   * @returns {Object} A new suite of benchmarks that passed callback filter.
   */
  function filterSuite(callback) {
    var me = this,
        result = new me.constructor;

    result.push.apply(result, filter(me, callback));
    return result;
  }

  /**
   * Resets all benchmarks in the suite.
   *
   * @name reset
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function resetSuite() {
    var event,
        me = this,
        aborting = calledBy.abortSuite;

    if (me.running && !aborting) {
      // no worries, `resetSuite()` is called within `abortSuite()`
      calledBy.resetSuite = true;
      me.abort();
      delete calledBy.resetSuite;
    }
    // reset if the state has changed
    else if ((me.aborted || me.running) &&
        (me.emit(event = Event('reset')), !event.cancelled)) {
      me.running = false;
      if (!aborting) {
        invoke(me, 'reset');
      }
    }
    return me;
  }

  /**
   * Runs the suite.
   *
   * @name run
   * @memberOf Benchmark.Suite
   * @param {Object} [options={}] Options object.
   * @returns {Object} The suite instance.
   * @example
   *
   * // basic usage
   * suite.run();
   *
   * // or with options
   * suite.run({ 'async': true, 'queued': true });
   */
  function runSuite(options) {
    var me = this;

    me.reset();
    me.running = true;
    options || (options = {});

    invoke(me, {
      'name': 'run',
      'args': options,
      'queued': options.queued,
      'onStart': function(event) {
        me.emit(event);
      },
      'onCycle': function(event) {
        var bench = event.target;
        if (bench.error) {
          me.emit({ 'type': 'error', 'target': bench });
        }
        me.emit(event);
        event.aborted = me.aborted;
      },
      'onComplete': function(event) {
        me.running = false;
        me.emit(event);
      }
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Executes all registered listeners of the specified event type.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String|Object} type The event type or object.
   * @returns {Mixed} Returns the return value of the last listener executed.
   */
  function emit(type) {
    var listeners,
        me = this,
        event = Event(type),
        events = me.events,
        args = (arguments[0] = event, arguments);

    event.currentTarget || (event.currentTarget = me);
    event.target || (event.target = me);
    delete event.result;

    if (events && (listeners = hasKey(events, event.type) && events[event.type])) {
      forEach(listeners.slice(), function(listener) {
        if ((event.result = listener.apply(me, args)) === false) {
          event.cancelled = true;
        }
        return !event.aborted;
      });
    }
    return event.result;
  }

  /**
   * Returns an array of event listeners for a given type that can be manipulated
   * to add or remove listeners.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @returns {Array} The listeners array.
   */
  function listeners(type) {
    var me = this,
        events = me.events || (me.events = {});

    return hasKey(events, type) ? events[type] : (events[type] = []);
  }

  /**
   * Unregisters a listener for the specified event type(s),
   * or unregisters all listeners for the specified event type(s),
   * or unregisters all listeners for all event types.
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} [type] The event type.
   * @param {Function} [listener] The function to unregister.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // unregister a listener for an event type
   * bench.off('cycle', listener);
   *
   * // unregister a listener for multiple event types
   * bench.off('start cycle', listener);
   *
   * // unregister all listeners for an event type
   * bench.off('cycle');
   *
   * // unregister all listeners for multiple event types
   * bench.off('start cycle complete');
   *
   * // unregister all listeners for all event types
   * bench.off();
   */
  function off(type, listener) {
    var me = this,
        events = me.events;

    events && each(type ? type.split(' ') : events, function(listeners, type) {
      var index;
      if (typeof listeners == 'string') {
        type = listeners;
        listeners = hasKey(events, type) && events[type];
      }
      if (listeners) {
        if (listener) {
          index = indexOf(listeners, listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        } else {
          listeners.length = 0;
        }
      }
    });
    return me;
  }

  /**
   * Registers a listener for the specified event type(s).
   *
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @param {Function} listener The function to register.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // register a listener for an event type
   * bench.on('cycle', listener);
   *
   * // register a listener for multiple event types
   * bench.on('start cycle', listener);
   */
  function on(type, listener) {
    var me = this,
        events = me.events || (me.events = {});

    forEach(type.split(' '), function(type) {
      (hasKey(events, type)
        ? events[type]
        : (events[type] = [])
      ).push(listener);
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts the benchmark without recording times.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function abort() {
    var event,
        me = this,
        resetting = calledBy.reset;

    if (me.running) {
      event = Event('abort');
      me.emit(event);
      if (!event.cancelled || resetting) {
        // avoid infinite recursion
        calledBy.abort = true;
        me.reset();
        delete calledBy.abort;

        if (support.timeout) {
          clearTimeout(me._timerId);
          delete me._timerId;
        }
        if (!resetting) {
          me.aborted = true;
          me.running = false;
        }
      }
    }
    return me;
  }

  /**
   * Creates a new benchmark using the same test and options.
   *
   * @memberOf Benchmark
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new benchmark instance.
   * @example
   *
   * var bizarro = bench.clone({
   *   'name': 'doppelganger'
   * });
   */
  function clone(options) {
    var me = this,
        result = new me.constructor(extend({}, me, options));

    // correct the `options` object
    result.options = extend({}, me.options, options);

    // copy own custom properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = deepClone(value);
      }
    });
    return result;
  }

  /**
   * Determines if a benchmark is faster than another.
   *
   * @memberOf Benchmark
   * @param {Object} other The benchmark to compare.
   * @returns {Number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
   */
  function compare(other) {
    var critical,
        zStat,
        me = this,
        sample1 = me.stats.sample,
        sample2 = other.stats.sample,
        size1 = sample1.length,
        size2 = sample2.length,
        maxSize = max(size1, size2),
        minSize = min(size1, size2),
        u1 = getU(sample1, sample2),
        u2 = getU(sample2, sample1),
        u = min(u1, u2);

    function getScore(xA, sampleB) {
      return reduce(sampleB, function(total, xB) {
        return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
      }, 0);
    }

    function getU(sampleA, sampleB) {
      return reduce(sampleA, function(total, xA) {
        return total + getScore(xA, sampleB);
      }, 0);
    }

    function getZ(u) {
      return (u - ((size1 * size2) / 2)) / sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
    }

    // exit early if comparing the same benchmark
    if (me == other) {
      return 0;
    }
    // reject the null hyphothesis the two samples come from the
    // same population (i.e. have the same median) if...
    if (size1 + size2 > 30) {
      // ...the z-stat is greater than 1.96 or less than -1.96
      // http://www.statisticslectures.com/topics/mannwhitneyu/
      zStat = getZ(u);
      return abs(zStat) > 1.96 ? (zStat > 0 ? -1 : 1) : 0;
    }
    // ...the U value is less than or equal the critical U value
    // http://www.geoib.com/mann-whitney-u-test.html
    critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
    return u <= critical ? (u == u1 ? 1 : -1) : 0;
  }

  /**
   * Reset properties and abort if running.
   *
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function reset() {
    var data,
        event,
        me = this,
        index = 0,
        changes = { 'length': 0 },
        queue = { 'length': 0 };

    if (me.running && !calledBy.abort) {
      // no worries, `reset()` is called within `abort()`
      calledBy.reset = true;
      me.abort();
      delete calledBy.reset;
    }
    else {
      // a non-recursive solution to check if properties have changed
      // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
      data = { 'destination': me, 'source': extend({}, me.constructor.prototype, me.options) };
      do {
        forOwn(data.source, function(value, key) {
          var changed,
              destination = data.destination,
              currValue = destination[key];

          if (value && typeof value == 'object') {
            if (isClassOf(value, 'Array')) {
              // check if an array value has changed to a non-array value
              if (!isClassOf(currValue, 'Array')) {
                changed = currValue = [];
              }
              // or has changed its length
              if (currValue.length != value.length) {
                changed = currValue = currValue.slice(0, value.length);
                currValue.length = value.length;
              }
            }
            // check if an object has changed to a non-object value
            else if (!currValue || typeof currValue != 'object') {
              changed = currValue = {};
            }
            // register a changed object
            if (changed) {
              changes[changes.length++] = { 'destination': destination, 'key': key, 'value': currValue };
            }
            queue[queue.length++] = { 'destination': currValue, 'source': value };
          }
          // register a changed primitive
          else if (value !== currValue && !(value == null || isClassOf(value, 'Function'))) {
            changes[changes.length++] = { 'destination': destination, 'key': key, 'value': value };
          }
        });
      }
      while ((data = queue[index++]));

      // if changed emit the `reset` event and if it isn't cancelled reset the benchmark
      if (changes.length && (me.emit(event = Event('reset')), !event.cancelled)) {
        forEach(changes, function(data) {
          data.destination[data.key] = data.value;
        });
      }
    }
    return me;
  }

  /**
   * Displays relevant benchmark information when coerced to a string.
   *
   * @name toString
   * @memberOf Benchmark
   * @returns {String} A string representation of the benchmark instance.
   */
  function toStringBench() {
    var me = this,
        error = me.error,
        hz = me.hz,
        id = me.id,
        stats = me.stats,
        size = stats.sample.length,
        pm = support.java ? '+/-' : '\xb1',
        result = me.name || (isNaN(id) ? id : '<Test #' + id + '>');

    if (error) {
      result += ': ' + join(error);
    } else {
      result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
        stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Clocks the time taken to execute a test per cycle (secs).
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @returns {Number} The time taken.
   */
  function clock() {
    var applet,
        options = Benchmark.options,
        template = { 'begin': 's$=new n$', 'end': 'r$=(new n$-s$)/1e3', 'uid': uid },
        timers = [{ 'ns': timer.ns, 'res': max(0.0015, getRes('ms')), 'unit': 'ms' }];

    // lazy define for hi-res timers
    clock = function(clone) {
      var deferred;
      if (clone instanceof Deferred) {
        deferred = clone;
        clone = deferred.benchmark;
      }

      var bench = clone._original,
          fn = bench.fn,
          fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '',
          stringable = isStringable(fn);

      var source = {
        'setup': getSource(bench.setup, preprocess('m$.setup()')),
        'fn': getSource(fn, preprocess('m$.fn(' + fnArg + ')')),
        'fnArg': fnArg,
        'teardown': getSource(bench.teardown, preprocess('m$.teardown()'))
      };

      var count = bench.count = clone.count,
          decompilable = support.decompilation || stringable,
          id = bench.id,
          isEmpty = !(source.fn || stringable),
          name = bench.name || (typeof id == 'number' ? '<Test #' + id + '>' : id),
          ns = timer.ns,
          result = 0;

      // init `minTime` if needed
      clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);

      // repair nanosecond timer
      // (some Chrome builds erase the `ns` variable after millions of executions)
      if (applet) {
        try {
          ns.nanoTime();
        } catch(e) {
          // use non-element to avoid issues with libs that augment them
          ns = timer.ns = new applet.Packages.nano;
        }
      }

      // Compile in setup/teardown functions and the test loop.
      // Create a new compiled test, instead of using the cached `bench.compiled`,
      // to avoid potential engine optimizations enabled over the life of the test.
      var compiled = bench.compiled = createFunction(preprocess('t$'), interpolate(
        preprocess(deferred
          ? 'var d$=this,#{fnArg}=d$,m$=d$.benchmark._original,f$=m$.fn,su$=m$.setup,td$=m$.teardown;' +
            // when `deferred.cycles` is `0` then...
            'if(!d$.cycles){' +
            // set `deferred.fn`
            'd$.fn=function(){var #{fnArg}=d$;if(typeof f$=="function"){try{#{fn}\n}catch(e$){f$(d$)}}else{#{fn}\n}};' +
            // set `deferred.teardown`
            'd$.teardown=function(){d$.cycles=0;if(typeof td$=="function"){try{#{teardown}\n}catch(e$){td$()}}else{#{teardown}\n}};' +
            // execute the benchmark's `setup`
            'if(typeof su$=="function"){try{#{setup}\n}catch(e$){su$()}}else{#{setup}\n};' +
            // start timer
            't$.start(d$);' +
            // execute `deferred.fn` and return a dummy object
            '}d$.fn();return{}'

          : 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count,n$=t$.ns;#{setup}\n#{begin};' +
            'while(i$--){#{fn}\n}#{end};#{teardown}\nreturn{elapsed:r$,uid:"#{uid}"}'),
        source
      ));

      try {
        if (isEmpty) {
          // Firefox may remove dead code from Function#toString results
          // http://bugzil.la/536085
          throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
        }
        else if (!deferred) {
          // pretest to determine if compiled code is exits early, usually by a
          // rogue `return` statement, by checking for a return object with the uid
          bench.count = 1;
          compiled = (compiled.call(bench, timer) || {}).uid == uid && compiled;
          bench.count = count;
        }
      } catch(e) {
        compiled = null;
        clone.error = e || new Error(String(e));
        bench.count = count;
      }
      // fallback when a test exits early or errors during pretest
      if (decompilable && !compiled && !deferred && !isEmpty) {
        compiled = createFunction(preprocess('t$'), interpolate(
          preprocess(
            (clone.error && !stringable
              ? 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count'
              : 'function f$(){#{fn}\n}var r$,s$,m$=this,i$=m$.count'
            ) +
            ',n$=t$.ns;#{setup}\n#{begin};m$.f$=f$;while(i$--){m$.f$()}#{end};' +
            'delete m$.f$;#{teardown}\nreturn{elapsed:r$}'
          ),
          source
        ));

        try {
          // pretest one more time to check for errors
          bench.count = 1;
          compiled.call(bench, timer);
          bench.compiled = compiled;
          bench.count = count;
          delete clone.error;
        }
        catch(e) {
          bench.count = count;
          if (clone.error) {
            compiled = null;
          } else {
            bench.compiled = compiled;
            clone.error = e || new Error(String(e));
          }
        }
      }
      // assign `compiled` to `clone` before calling in case a deferred benchmark
      // immediately calls `deferred.resolve()`
      clone.compiled = compiled;
      // if no errors run the full test loop
      if (!clone.error) {
        result = compiled.call(deferred || bench, timer).elapsed;
      }
      return result;
    };

    /*------------------------------------------------------------------------*/

    /**
     * Gets the current timer's minimum resolution (secs).
     */
    function getRes(unit) {
      var measured,
          begin,
          count = 30,
          divisor = 1e3,
          ns = timer.ns,
          sample = [];

      // get average smallest measurable time
      while (count--) {
        if (unit == 'us') {
          divisor = 1e6;
          if (ns.stop) {
            ns.start();
            while (!(measured = ns.microseconds())) { }
          } else if (ns[perfName]) {
            divisor = 1e3;
            measured = Function('n', 'var r,s=n.' + perfName + '();while(!(r=n.' + perfName + '()-s)){};return r')(ns);
          } else {
            begin = ns();
            while (!(measured = ns() - begin)) { }
          }
        }
        else if (unit == 'ns') {
          divisor = 1e9;
          if (ns.nanoTime) {
            begin = ns.nanoTime();
            while (!(measured = ns.nanoTime() - begin)) { }
          } else {
            begin = (begin = ns())[0] + (begin[1] / divisor);
            while (!(measured = ((measured = ns())[0] + (measured[1] / divisor)) - begin)) { }
            divisor = 1;
          }
        }
        else {
          begin = new ns;
          while (!(measured = new ns - begin)) { }
        }
        // check for broken timers (nanoTime may have issues)
        // http://alivebutsleepy.srnet.cz/unreliable-system-nanotime/
        if (measured > 0) {
          sample.push(measured);
        } else {
          sample.push(Infinity);
          break;
        }
      }
      // convert to seconds
      return getMean(sample) / divisor;
    }

    /**
     * Replaces all occurrences of `$` with a unique number and
     * template tokens with content.
     */
    function preprocess(code) {
      return interpolate(code, template).replace(/\$/g, /\d+/.exec(uid));
    }

    /*------------------------------------------------------------------------*/

    // detect nanosecond support from a Java applet
    each(doc && doc.applets || [], function(element) {
      return !(timer.ns = applet = 'nanoTime' in element && element);
    });

    // check type in case Safari returns an object instead of a number
    try {
      if (typeof timer.ns.nanoTime() == 'number') {
        timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
      }
    } catch(e) { }

    // detect Chrome's microsecond timer:
    // enable benchmarking via the --enable-benchmarking command
    // line switch in at least Chrome 7 to use chrome.Interval
    try {
      if ((timer.ns = new (window.chrome || window.chromium).Interval)) {
        timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
      }
    } catch(e) { }

    // detect `performance.now` microsecond resolution timer
    if ((timer.ns = perfName && perfObject)) {
      timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
    }

    // detect Node's nanosecond resolution timer available in Node >= 0.8
    if (processObject && typeof (timer.ns = processObject.hrtime) == 'function') {
      timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
    }

    // detect Wade Simmons' Node microtime module
    if (microtimeObject && typeof (timer.ns = microtimeObject.now) == 'function') {
      timers.push({ 'ns': timer.ns,  'res': getRes('us'), 'unit': 'us' });
    }

    // pick timer with highest resolution
    timer = reduce(timers, function(timer, other) {
      return other.res < timer.res ? other : timer;
    });

    // remove unused applet
    if (timer.unit != 'ns' && applet) {
      applet = destroyElement(applet);
    }
    // error if there are no working timers
    if (timer.res == Infinity) {
      throw new Error('Benchmark.js was unable to find a working timer.');
    }
    // use API of chosen timer
    if (timer.unit == 'ns') {
      if (timer.ns.nanoTime) {
        extend(template, {
          'begin': 's$=n$.nanoTime()',
          'end': 'r$=(n$.nanoTime()-s$)/1e9'
        });
      } else {
        extend(template, {
          'begin': 's$=n$()',
          'end': 'r$=n$(s$);r$=r$[0]+(r$[1]/1e9)'
        });
      }
    }
    else if (timer.unit == 'us') {
      if (timer.ns.stop) {
        extend(template, {
          'begin': 's$=n$.start()',
          'end': 'r$=n$.microseconds()/1e6'
        });
      } else if (perfName) {
        extend(template, {
          'begin': 's$=n$.' + perfName + '()',
          'end': 'r$=(n$.' + perfName + '()-s$)/1e3'
        });
      } else {
        extend(template, {
          'begin': 's$=n$()',
          'end': 'r$=(n$()-s$)/1e6'
        });
      }
    }

    // define `timer` methods
    timer.start = createFunction(preprocess('o$'),
      preprocess('var n$=this.ns,#{begin};o$.elapsed=0;o$.timeStamp=s$'));

    timer.stop = createFunction(preprocess('o$'),
      preprocess('var n$=this.ns,s$=o$.timeStamp,#{end};o$.elapsed=r$'));

    // resolve time span required to achieve a percent uncertainty of at most 1%
    // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
    options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
    return clock.apply(null, arguments);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Computes stats on benchmark results.
   *
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} options The options object.
   */
  function compute(bench, options) {
    options || (options = {});

    var async = options.async,
        elapsed = 0,
        initCount = bench.initCount,
        minSamples = bench.minSamples,
        queue = [],
        sample = bench.stats.sample;

    /**
     * Adds a clone to the queue.
     */
    function enqueue() {
      queue.push(bench.clone({
        '_original': bench,
        'events': {
          'abort': [update],
          'cycle': [update],
          'error': [update],
          'start': [update]
        }
      }));
    }

    /**
     * Updates the clone/original benchmarks to keep their data in sync.
     */
    function update(event) {
      var clone = this,
          type = event.type;

      if (bench.running) {
        if (type == 'start') {
          // Note: `clone.minTime` prop is inited in `clock()`
          clone.count = bench.initCount;
        }
        else {
          if (type == 'error') {
            bench.error = clone.error;
          }
          if (type == 'abort') {
            bench.abort();
            bench.emit('cycle');
          } else {
            event.currentTarget = event.target = bench;
            bench.emit(event);
          }
        }
      } else if (bench.aborted) {
        // clear abort listeners to avoid triggering bench's abort/cycle again
        clone.events.abort.length = 0;
        clone.abort();
      }
    }

    /**
     * Determines if more clones should be queued or if cycling should stop.
     */
    function evaluate(event) {
      var critical,
          df,
          mean,
          moe,
          rme,
          sd,
          sem,
          variance,
          clone = event.target,
          done = bench.aborted,
          now = +new Date,
          size = sample.push(clone.times.period),
          maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime,
          times = bench.times,
          varOf = function(sum, x) { return sum + pow(x - mean, 2); };

      // exit early for aborted or unclockable tests
      if (done || clone.hz == Infinity) {
        maxedOut = !(size = sample.length = queue.length = 0);
      }

      if (!done) {
        // sample mean (estimate of the population mean)
        mean = getMean(sample);
        // sample variance (estimate of the population variance)
        variance = reduce(sample, varOf, 0) / (size - 1) || 0;
        // sample standard deviation (estimate of the population standard deviation)
        sd = sqrt(variance);
        // standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
        sem = sd / sqrt(size);
        // degrees of freedom
        df = size - 1;
        // critical value
        critical = tTable[Math.round(df) || 1] || tTable.infinity;
        // margin of error
        moe = sem * critical;
        // relative margin of error
        rme = (moe / mean) * 100 || 0;

        extend(bench.stats, {
          'deviation': sd,
          'mean': mean,
          'moe': moe,
          'rme': rme,
          'sem': sem,
          'variance': variance
        });

        // Abort the cycle loop when the minimum sample size has been collected
        // and the elapsed time exceeds the maximum time allowed per benchmark.
        // We don't count cycle delays toward the max time because delays may be
        // increased by browsers that clamp timeouts for inactive tabs.
        // https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs
        if (maxedOut) {
          // reset the `initCount` in case the benchmark is rerun
          bench.initCount = initCount;
          bench.running = false;
          done = true;
          times.elapsed = (now - times.timeStamp) / 1e3;
        }
        if (bench.hz != Infinity) {
          bench.hz = 1 / mean;
          times.cycle = mean * bench.count;
          times.period = mean;
        }
      }
      // if time permits, increase sample size to reduce the margin of error
      if (queue.length < 2 && !maxedOut) {
        enqueue();
      }
      // abort the invoke cycle when done
      event.aborted = done;
    }

    // init queue and begin
    enqueue();
    invoke(queue, {
      'name': 'run',
      'args': { 'async': async },
      'queued': true,
      'onCycle': evaluate,
      'onComplete': function() { bench.emit('complete'); }
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Cycles a benchmark until a run `count` can be established.
   *
   * @private
   * @param {Object} clone The cloned benchmark instance.
   * @param {Object} options The options object.
   */
  function cycle(clone, options) {
    options || (options = {});

    var deferred;
    if (clone instanceof Deferred) {
      deferred = clone;
      clone = clone.benchmark;
    }

    var clocked,
        cycles,
        divisor,
        event,
        minTime,
        period,
        async = options.async,
        bench = clone._original,
        count = clone.count,
        times = clone.times;

    // continue, if not aborted between cycles
    if (clone.running) {
      // `minTime` is set to `Benchmark.options.minTime` in `clock()`
      cycles = ++clone.cycles;
      clocked = deferred ? deferred.elapsed : clock(clone);
      minTime = clone.minTime;

      if (cycles > bench.cycles) {
        bench.cycles = cycles;
      }
      if (clone.error) {
        event = Event('error');
        event.message = clone.error;
        clone.emit(event);
        if (!event.cancelled) {
          clone.abort();
        }
      }
    }

    // continue, if not errored
    if (clone.running) {
      // time taken to complete last test cycle
      bench.times.cycle = times.cycle = clocked;
      // seconds per operation
      period = bench.times.period = times.period = clocked / count;
      // ops per second
      bench.hz = clone.hz = 1 / period;
      // avoid working our way up to this next time
      bench.initCount = clone.initCount = count;
      // do we need to do another cycle?
      clone.running = clocked < minTime;

      if (clone.running) {
        // tests may clock at `0` when `initCount` is a small number,
        // to avoid that we set its count to something a bit higher
        if (!clocked && (divisor = divisors[clone.cycles]) != null) {
          count = floor(4e6 / divisor);
        }
        // calculate how many more iterations it will take to achive the `minTime`
        if (count <= clone.count) {
          count += Math.ceil((minTime - clocked) / period);
        }
        clone.running = count != Infinity;
      }
    }
    // should we exit early?
    event = Event('cycle');
    clone.emit(event);
    if (event.aborted) {
      clone.abort();
    }
    // figure out what to do next
    if (clone.running) {
      // start a new cycle
      clone.count = count;
      if (deferred) {
        clone.compiled.call(deferred, timer);
      } else if (async) {
        delay(clone, function() { cycle(clone, options); });
      } else {
        cycle(clone);
      }
    }
    else {
      // fix TraceMonkey bug associated with clock fallbacks
      // http://bugzil.la/509069
      if (support.browser) {
        runScript(uid + '=1;delete ' + uid);
      }
      // done
      clone.emit('complete');
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Runs the benchmark.
   *
   * @memberOf Benchmark
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * bench.run();
   *
   * // or with options
   * bench.run({ 'async': true });
   */
  function run(options) {
    var me = this,
        event = Event('start');

    // set `running` to `false` so `reset()` won't call `abort()`
    me.running = false;
    me.reset();
    me.running = true;

    me.count = me.initCount;
    me.times.timeStamp = +new Date;
    me.emit(event);

    if (!event.cancelled) {
      options = { 'async': ((options = options && options.async) == null ? me.async : options) && support.timeout };

      // for clones created within `compute()`
      if (me._original) {
        if (me.defer) {
          Deferred(me);
        } else {
          cycle(me, options);
        }
      }
      // for original benchmarks
      else {
        compute(me, options);
      }
    }
    return me;
  }

  /*--------------------------------------------------------------------------*/

  // Firefox 1 erroneously defines variable and argument names of functions on
  // the function itself as non-configurable properties with `undefined` values.
  // The bugginess continues as the `Benchmark` constructor has an argument
  // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
  // making it non-writable in the process, unless it is the first property
  // assigned by for-in loop of `extend()`.
  extend(Benchmark, {

    /**
     * The default options copied by benchmark instances.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'options': {

      /**
       * A flag to indicate that benchmark cycles will execute asynchronously
       * by default.
       *
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'async': false,

      /**
       * A flag to indicate that the benchmark clock is deferred.
       *
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'defer': false,

      /**
       * The delay between test cycles (secs).
       * @memberOf Benchmark.options
       * @type Number
       */
      'delay': 0.005,

      /**
       * Displayed by Benchmark#toString when a `name` is not available
       * (auto-generated if absent).
       *
       * @memberOf Benchmark.options
       * @type String
       */
      'id': undefined,

      /**
       * The default number of times to execute a test on a benchmark's first cycle.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'initCount': 1,

      /**
       * The maximum time a benchmark is allowed to run before finishing (secs).
       * Note: Cycle delays aren't counted toward the maximum time.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'maxTime': 5,

      /**
       * The minimum sample size required to perform statistical analysis.
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'minSamples': 5,

      /**
       * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
       *
       * @memberOf Benchmark.options
       * @type Number
       */
      'minTime': 0,

      /**
       * The name of the benchmark.
       *
       * @memberOf Benchmark.options
       * @type String
       */
      'name': undefined,

      /**
       * An event listener called when the benchmark is aborted.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onAbort': undefined,

      /**
       * An event listener called when the benchmark completes running.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onComplete': undefined,

      /**
       * An event listener called after each run cycle.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onCycle': undefined,

      /**
       * An event listener called when a test errors.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onError': undefined,

      /**
       * An event listener called when the benchmark is reset.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onReset': undefined,

      /**
       * An event listener called when the benchmark starts running.
       *
       * @memberOf Benchmark.options
       * @type Function
       */
      'onStart': undefined
    },

    /**
     * Platform object with properties describing things like browser name,
     * version, and operating system.
     *
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'platform': req('platform') || window.platform || {

      /**
       * The platform description.
       *
       * @memberOf Benchmark.platform
       * @type String
       */
      'description': window.navigator && navigator.userAgent || null,

      /**
       * The name of the browser layout engine.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'layout': null,

      /**
       * The name of the product hosting the browser.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'product': null,

      /**
       * The name of the browser/environment.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'name': null,

      /**
       * The name of the product's manufacturer.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'manufacturer': null,

      /**
       * The name of the operating system.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'os': null,

      /**
       * The alpha/beta release indicator.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'prerelease': null,

      /**
       * The browser/environment version.
       *
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'version': null,

      /**
       * Return platform description when the platform object is coerced to a string.
       *
       * @memberOf Benchmark.platform
       * @type Function
       * @returns {String} The platform description.
       */
      'toString': function() {
        return this.description || '';
      }
    },

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf Benchmark
     * @type String
     */
    'version': '1.0.0',

    // an object of environment/feature detection flags
    'support': support,

    // clone objects
    'deepClone': deepClone,

    // iteration utility
    'each': each,

    // augment objects
    'extend': extend,

    // generic Array#filter
    'filter': filter,

    // generic Array#forEach
    'forEach': forEach,

    // generic own property iteration utility
    'forOwn': forOwn,

    // converts a number to a comma-separated string
    'formatNumber': formatNumber,

    // generic Object#hasOwnProperty
    // (trigger hasKey's lazy define before assigning it to Benchmark)
    'hasKey': (hasKey(Benchmark, ''), hasKey),

    // generic Array#indexOf
    'indexOf': indexOf,

    // template utility
    'interpolate': interpolate,

    // invokes a method on each item in an array
    'invoke': invoke,

    // generic Array#join for arrays and objects
    'join': join,

    // generic Array#map
    'map': map,

    // retrieves a property value from each item in an array
    'pluck': pluck,

    // generic Array#reduce
    'reduce': reduce
  });

  /*--------------------------------------------------------------------------*/

  extend(Benchmark.prototype, {

    /**
     * The number of times a test was executed.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'count': 0,

    /**
     * The number of cycles performed while benchmarking.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'cycles': 0,

    /**
     * The number of executions per second.
     *
     * @memberOf Benchmark
     * @type Number
     */
    'hz': 0,

    /**
     * The compiled test function.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'compiled': undefined,

    /**
     * The error object if the test failed.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'error': undefined,

    /**
     * The test to benchmark.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'fn': undefined,

    /**
     * A flag to indicate if the benchmark is aborted.
     *
     * @memberOf Benchmark
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the benchmark is running.
     *
     * @memberOf Benchmark
     * @type Boolean
     */
    'running': false,

    /**
     * Compiled into the test and executed immediately **before** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
     * @example
     *
     * // basic usage
     * var bench = Benchmark({
     *   'setup': function() {
     *     var c = this.count,
     *         element = document.getElementById('container');
     *     while (c--) {
     *       element.appendChild(document.createElement('div'));
     *     }
     *   },
     *   'fn': function() {
     *     element.removeChild(element.lastChild);
     *   }
     * });
     *
     * // compiles to something like:
     * var c = this.count,
     *     element = document.getElementById('container');
     * while (c--) {
     *   element.appendChild(document.createElement('div'));
     * }
     * var start = new Date;
     * while (count--) {
     *   element.removeChild(element.lastChild);
     * }
     * var end = new Date - start;
     *
     * // or using strings
     * var bench = Benchmark({
     *   'setup': '\
     *     var a = 0;\n\
     *     (function() {\n\
     *       (function() {\n\
     *         (function() {',
     *   'fn': 'a += 1;',
     *   'teardown': '\
     *          }())\n\
     *        }())\n\
     *      }())'
     * });
     *
     * // compiles to something like:
     * var a = 0;
     * (function() {
     *   (function() {
     *     (function() {
     *       var start = new Date;
     *       while (count--) {
     *         a += 1;
     *       }
     *       var end = new Date - start;
     *     }())
     *   }())
     * }())
     */
    'setup': noop,

    /**
     * Compiled into the test and executed immediately **after** the test loop.
     *
     * @memberOf Benchmark
     * @type Function|String
     */
    'teardown': noop,

    /**
     * An object of stats including mean, margin or error, and standard deviation.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'stats': {

      /**
       * The margin of error.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'moe': 0,

      /**
       * The relative margin of error (expressed as a percentage of the mean).
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'rme': 0,

      /**
       * The standard error of the mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'sem': 0,

      /**
       * The sample standard deviation.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'deviation': 0,

      /**
       * The sample arithmetic mean.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'mean': 0,

      /**
       * The array of sampled periods.
       *
       * @memberOf Benchmark#stats
       * @type Array
       */
      'sample': [],

      /**
       * The sample variance.
       *
       * @memberOf Benchmark#stats
       * @type Number
       */
      'variance': 0
    },

    /**
     * An object of timing data including cycle, elapsed, period, start, and stop.
     *
     * @memberOf Benchmark
     * @type Object
     */
    'times': {

      /**
       * The time taken to complete the last cycle (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'cycle': 0,

      /**
       * The time taken to complete the benchmark (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'elapsed': 0,

      /**
       * The time taken to execute the test once (secs).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'period': 0,

      /**
       * A timestamp of when the benchmark started (ms).
       *
       * @memberOf Benchmark#times
       * @type Number
       */
      'timeStamp': 0
    },

    // aborts benchmark (does not record times)
    'abort': abort,

    // creates a new benchmark using the same test and options
    'clone': clone,

    // compares benchmark's hertz with another
    'compare': compare,

    // executes listeners
    'emit': emit,

    // get listeners
    'listeners': listeners,

    // unregister listeners
    'off': off,

    // register listeners
    'on': on,

    // reset benchmark properties
    'reset': reset,

    // runs the benchmark
    'run': run,

    // pretty print benchmark info
    'toString': toStringBench
  });

  /*--------------------------------------------------------------------------*/

  extend(Deferred.prototype, {

    /**
     * The deferred benchmark instance.
     *
     * @memberOf Benchmark.Deferred
     * @type Object
     */
    'benchmark': null,

    /**
     * The number of deferred cycles performed while benchmarking.
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'cycles': 0,

    /**
     * The time taken to complete the deferred benchmark (secs).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'elapsed': 0,

    /**
     * A timestamp of when the deferred benchmark started (ms).
     *
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'timeStamp': 0,

    // cycles/completes the deferred benchmark
    'resolve': resolve
  });

  /*--------------------------------------------------------------------------*/

  extend(Event.prototype, {

    /**
     * A flag to indicate if the emitters listener iteration is aborted.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the default action is cancelled.
     *
     * @memberOf Benchmark.Event
     * @type Boolean
     */
    'cancelled': false,

    /**
     * The object whose listeners are currently being processed.
     *
     * @memberOf Benchmark.Event
     * @type Object
     */
    'currentTarget': undefined,

    /**
     * The return value of the last executed listener.
     *
     * @memberOf Benchmark.Event
     * @type Mixed
     */
    'result': undefined,

    /**
     * The object to which the event was originally emitted.
     *
     * @memberOf Benchmark.Event
     * @type Object
     */
    'target': undefined,

    /**
     * A timestamp of when the event was created (ms).
     *
     * @memberOf Benchmark.Event
     * @type Number
     */
    'timeStamp': 0,

    /**
     * The event type.
     *
     * @memberOf Benchmark.Event
     * @type String
     */
    'type': ''
  });

  /*--------------------------------------------------------------------------*/

  /**
   * The default options copied by suite instances.
   *
   * @static
   * @memberOf Benchmark.Suite
   * @type Object
   */
  Suite.options = {

    /**
     * The name of the suite.
     *
     * @memberOf Benchmark.Suite.options
     * @type String
     */
    'name': undefined
  };

  /*--------------------------------------------------------------------------*/

  extend(Suite.prototype, {

    /**
     * The number of benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @type Number
     */
    'length': 0,

    /**
     * A flag to indicate if the suite is aborted.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the suite is running.
     *
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'running': false,

    /**
     * An `Array#forEach` like method.
     * Callbacks may terminate the loop by explicitly returning `false`.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Object} The suite iterated over.
     */
    'forEach': methodize(forEach),

    /**
     * An `Array#indexOf` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Mixed} value The value to search for.
     * @returns {Number} The index of the matched value or `-1`.
     */
    'indexOf': methodize(indexOf),

    /**
     * Invokes a method on all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String|Object} name The name of the method to invoke OR options object.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
     * @returns {Array} A new array of values returned from each method invoked.
     */
    'invoke': methodize(invoke),

    /**
     * Converts the suite of benchmarks to a string.
     *
     * @memberOf Benchmark.Suite
     * @param {String} [separator=','] A string to separate each element of the array.
     * @returns {String} The string.
     */
    'join': [].join,

    /**
     * An `Array#map` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Array} A new array of values returned by the callback.
     */
    'map': methodize(map),

    /**
     * Retrieves the value of a specified property from all benchmarks in the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {String} property The property to pluck.
     * @returns {Array} A new array of property values.
     */
    'pluck': methodize(pluck),

    /**
     * Removes the last benchmark from the suite and returns it.
     *
     * @memberOf Benchmark.Suite
     * @returns {Mixed} The removed benchmark.
     */
    'pop': [].pop,

    /**
     * Appends benchmarks to the suite.
     *
     * @memberOf Benchmark.Suite
     * @returns {Number} The suite's new length.
     */
    'push': [].push,

    /**
     * Sorts the benchmarks of the suite.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} [compareFn=null] A function that defines the sort order.
     * @returns {Object} The sorted suite.
     */
    'sort': [].sort,

    /**
     * An `Array#reduce` like method.
     *
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} accumulator Initial value of the accumulator.
     * @returns {Mixed} The accumulator.
     */
    'reduce': methodize(reduce),

    // aborts all benchmarks in the suite
    'abort': abortSuite,

    // adds a benchmark to the suite
    'add': add,

    // creates a new suite with cloned benchmarks
    'clone': cloneSuite,

    // executes listeners of a specified type
    'emit': emit,

    // creates a new suite of filtered benchmarks
    'filter': filterSuite,

    // get listeners
    'listeners': listeners,

    // unregister listeners
    'off': off,

   // register listeners
    'on': on,

    // resets all benchmarks in the suite
    'reset': resetSuite,

    // runs all benchmarks in the suite
    'run': runSuite,

    // array methods
    'concat': concat,

    'reverse': reverse,

    'shift': shift,

    'slice': slice,

    'splice': splice,

    'unshift': unshift
  });

  /*--------------------------------------------------------------------------*/

  // expose Deferred, Event and Suite
  extend(Benchmark, {
    'Deferred': Deferred,
    'Event': Event,
    'Suite': Suite
  });

  // expose Benchmark
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return Benchmark;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports) {
    // in Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      (module.exports = Benchmark).Benchmark = Benchmark;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports.Benchmark = Benchmark;
    }
  }
  // in a browser or Rhino
  else {
    // use square bracket notation so Closure Compiler won't munge `Benchmark`
    // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
    window['Benchmark'] = Benchmark;
  }

  // trigger clock's lazy define early to avoid a security error
  if (support.air) {
    clock({ '_original': { 'fn': noop, 'count': 1, 'options': {} } });
  }
}(this));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
(function (global){
var benchmark = require('benchmark')
var suite = new benchmark.Suite()

global.NewBuffer = require('../../').Buffer // native-buffer-browserify

var LENGTH = 20

var newTarget = NewBuffer(LENGTH * 4)

for (var i = 0; i < LENGTH; i++) {
  newTarget.writeUInt32LE(7000 + i, i * 4)
}

suite.add('NewBuffer#readUInt32BE', function () {
  for (var i = 0; i < LENGTH; i++) {
    var x = newTarget.readUInt32BE(i * 4)
  }
})
.on('error', function (event) {
  console.error(event.target.error.stack)
})
.on('cycle', function (event) {
  console.log(String(event.target))
})

.run({ 'async': true })

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../":1,"benchmark":3}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mZXJvc3MvY29kZS9idWZmZXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9mZXJvc3MvY29kZS9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvZmVyb3NzL2NvZGUvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9mZXJvc3MvY29kZS9idWZmZXIvbm9kZV9tb2R1bGVzL2JlbmNobWFyay9iZW5jaG1hcmsuanMiLCIvVXNlcnMvZmVyb3NzL2NvZGUvYnVmZmVyL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvZmVyb3NzL2NvZGUvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2Zlcm9zcy9jb2RlL2J1ZmZlci9wZXJmL3NvbG8vcmVhZFVJbnQzMkJFLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9oQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2gxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAtIEltcGxlbWVudGF0aW9uIG11c3Qgc3VwcG9ydCBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcy5cbiAqICAgRmlyZWZveCA0LTI5IGxhY2tlZCBzdXBwb3J0LCBmaXhlZCBpbiBGaXJlZm94IDMwKy5cbiAqICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cbiAqXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleSB3aWxsXG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCB3aWxsIHdvcmsgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IChmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBuZXcgVWludDhBcnJheSgxKS5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBzdWJqZWN0ID4gMCA/IHN1YmplY3QgPj4+IDAgOiAwXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JylcbiAgICAgIHN1YmplY3QgPSBiYXNlNjRjbGVhbihzdWJqZWN0KVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIHN1YmplY3QgIT09IG51bGwpIHsgLy8gYXNzdW1lIG9iamVjdCBpcyBhcnJheS1saWtlXG4gICAgaWYgKHN1YmplY3QudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShzdWJqZWN0LmRhdGEpKVxuICAgICAgc3ViamVjdCA9IHN1YmplY3QuZGF0YVxuICAgIGxlbmd0aCA9ICtzdWJqZWN0Lmxlbmd0aCA+IDAgPyBNYXRoLmZsb29yKCtzdWJqZWN0Lmxlbmd0aCkgOiAwXG4gIH0gZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKylcbiAgICAgICAgYnVmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ci50b1N0cmluZygpXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0WywgbGVuZ3RoXSknKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHRvdGFsTGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGFzc2VydChCdWZmZXIuaXNCdWZmZXIoYSkgJiYgQnVmZmVyLmlzQnVmZmVyKGIpLCAnQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW4gJiYgYVtpXSA9PT0gYltpXTsgaSsrKSB7fVxuICBpZiAoaSAhPT0gbGVuKSB7XG4gICAgeCA9IGFbaV1cbiAgICB5ID0gYltpXVxuICB9XG4gIGlmICh4IDwgeSkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmICh5IDwgeCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IGJpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCA9PT0gdW5kZWZpbmVkKSA/IHNlbGYubGVuZ3RoIDogTnVtYmVyKGVuZClcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChiKSB7XG4gIGFzc2VydChCdWZmZXIuaXNCdWZmZXIoYiksICdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChiKSB7XG4gIGFzc2VydChCdWZmZXIuaXNCdWZmZXIoYiksICdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlbjtcbiAgICBpZiAoc3RhcnQgPCAwKVxuICAgICAgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApXG4gICAgICBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpXG4gICAgZW5kID0gc3RhcnRcblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSlcbiAgICByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGFzc2VydChCdWZmZXIuaXNCdWZmZXIoYnVmKSwgJ2J1ZmZlciBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCAmJiB2YWx1ZSA+PSBtaW4sICd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KG9mZnNldCArIGV4dCA8PSBidWYubGVuZ3RoLCAnaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCAmJiB2YWx1ZSA+PSBtaW4sICd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KG9mZnNldCArIGV4dCA8PSBidWYubGVuZ3RoLCAnaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpc1tpXSA9IHZhbHVlXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IHV0ZjhUb0J5dGVzKHZhbHVlLnRvU3RyaW5nKCkpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIH1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuZXF1YWxzID0gQlAuZXF1YWxzXG4gIGFyci5jb21wYXJlID0gQlAuY29tcGFyZVxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtel0vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICBieXRlQXJyYXkucHVzaChiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cbiIsInZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgWkVSTyAgID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdG1vZHVsZS5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KCkpXG4iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8qIVxuICogQmVuY2htYXJrLmpzIHYxLjAuMCA8aHR0cDovL2JlbmNobWFya2pzLmNvbS8+XG4gKiBDb3B5cmlnaHQgMjAxMC0yMDEyIE1hdGhpYXMgQnluZW5zIDxodHRwOi8vbXRocy5iZS8+XG4gKiBCYXNlZCBvbiBKU0xpdG11cy5qcywgY29weXJpZ2h0IFJvYmVydCBLaWVmZmVyIDxodHRwOi8vYnJvb2ZhLmNvbS8+XG4gKiBNb2RpZmllZCBieSBKb2huLURhdmlkIERhbHRvbiA8aHR0cDovL2FsbHlvdWNhbmxlZXQuY29tLz5cbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL210aHMuYmUvbWl0PlxuICovXG47KGZ1bmN0aW9uKHdpbmRvdywgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiogVXNlZCB0byBhc3NpZ24gZWFjaCBiZW5jaG1hcmsgYW4gaW5jcmltZW50ZWQgaWQgKi9cbiAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gIC8qKiBEZXRlY3QgRE9NIGRvY3VtZW50IG9iamVjdCAqL1xuICB2YXIgZG9jID0gaXNIb3N0VHlwZSh3aW5kb3csICdkb2N1bWVudCcpICYmIGRvY3VtZW50O1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZGVmaW5lYCAqL1xuICB2YXIgZnJlZURlZmluZSA9IHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQgJiYgZGVmaW5lO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AgKi9cbiAgdmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuICAgICh0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwgPT0gZ2xvYmFsLmdsb2JhbCAmJiAod2luZG93ID0gZ2xvYmFsKSwgZXhwb3J0cyk7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGByZXF1aXJlYCAqL1xuICB2YXIgZnJlZVJlcXVpcmUgPSB0eXBlb2YgcmVxdWlyZSA9PSAnZnVuY3Rpb24nICYmIHJlcXVpcmU7XG5cbiAgLyoqIFVzZWQgdG8gY3Jhd2wgYWxsIHByb3BlcnRpZXMgcmVnYXJkbGVzcyBvZiBlbnVtZXJhYmlsaXR5ICovXG4gIHZhciBnZXRBbGxLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG5cbiAgLyoqIFVzZWQgdG8gZ2V0IHByb3BlcnR5IGRlc2NyaXB0b3JzICovXG4gIHZhciBnZXREZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuICAvKiogVXNlZCBpbiBjYXNlIGFuIG9iamVjdCBkb2Vzbid0IGhhdmUgaXRzIG93biBtZXRob2QgKi9cbiAgdmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiAgLyoqIFVzZWQgdG8gY2hlY2sgaWYgYW4gb2JqZWN0IGlzIGV4dGVuc2libGUgKi9cbiAgdmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9O1xuXG4gIC8qKiBVc2VkIHRvIGFjY2VzcyBXYWRlIFNpbW1vbnMnIE5vZGUgbWljcm90aW1lIG1vZHVsZSAqL1xuICB2YXIgbWljcm90aW1lT2JqZWN0ID0gcmVxKCdtaWNyb3RpbWUnKTtcblxuICAvKiogVXNlZCB0byBhY2Nlc3MgdGhlIGJyb3dzZXIncyBoaWdoIHJlc29sdXRpb24gdGltZXIgKi9cbiAgdmFyIHBlcmZPYmplY3QgPSBpc0hvc3RUeXBlKHdpbmRvdywgJ3BlcmZvcm1hbmNlJykgJiYgcGVyZm9ybWFuY2U7XG5cbiAgLyoqIFVzZWQgdG8gY2FsbCB0aGUgYnJvd3NlcidzIGhpZ2ggcmVzb2x1dGlvbiB0aW1lciAqL1xuICB2YXIgcGVyZk5hbWUgPSBwZXJmT2JqZWN0ICYmIChcbiAgICBwZXJmT2JqZWN0Lm5vdyAmJiAnbm93JyB8fFxuICAgIHBlcmZPYmplY3Qud2Via2l0Tm93ICYmICd3ZWJraXROb3cnXG4gICk7XG5cbiAgLyoqIFVzZWQgdG8gYWNjZXNzIE5vZGUncyBoaWdoIHJlc29sdXRpb24gdGltZXIgKi9cbiAgdmFyIHByb2Nlc3NPYmplY3QgPSBpc0hvc3RUeXBlKHdpbmRvdywgJ3Byb2Nlc3MnKSAmJiBwcm9jZXNzO1xuXG4gIC8qKiBVc2VkIHRvIGNoZWNrIGlmIGFuIG93biBwcm9wZXJ0eSBpcyBlbnVtZXJhYmxlICovXG4gIHZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4gIC8qKiBVc2VkIHRvIHNldCBwcm9wZXJ0eSBkZXNjcmlwdG9ycyAqL1xuICB2YXIgc2V0RGVzY3JpcHRvciA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuICAvKiogVXNlZCB0byByZXNvbHZlIGEgdmFsdWUncyBpbnRlcm5hbCBbW0NsYXNzXV0gKi9cbiAgdmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbiAgLyoqIFVzZWQgdG8gcHJldmVudCBhIGByZW1vdmVDaGlsZGAgbWVtb3J5IGxlYWsgaW4gSUUgPCA5ICovXG4gIHZhciB0cmFzaCA9IGRvYyAmJiBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgLyoqIFVzZWQgdG8gaW50ZWdyaXR5IGNoZWNrIGNvbXBpbGVkIHRlc3RzICovXG4gIHZhciB1aWQgPSAndWlkJyArICgrbmV3IERhdGUpO1xuXG4gIC8qKiBVc2VkIHRvIGF2b2lkIGluZmluaXRlIHJlY3Vyc2lvbiB3aGVuIG1ldGhvZHMgY2FsbCBlYWNoIG90aGVyICovXG4gIHZhciBjYWxsZWRCeSA9IHt9O1xuXG4gIC8qKiBVc2VkIHRvIGF2b2lkIGh6IG9mIEluZmluaXR5ICovXG4gIHZhciBkaXZpc29ycyA9IHtcbiAgICAnMSc6IDQwOTYsXG4gICAgJzInOiA1MTIsXG4gICAgJzMnOiA2NCxcbiAgICAnNCc6IDgsXG4gICAgJzUnOiAwXG4gIH07XG5cbiAgLyoqXG4gICAqIFQtRGlzdHJpYnV0aW9uIHR3by10YWlsZWQgY3JpdGljYWwgdmFsdWVzIGZvciA5NSUgY29uZmlkZW5jZVxuICAgKiBodHRwOi8vd3d3Lml0bC5uaXN0Lmdvdi9kaXY4OTgvaGFuZGJvb2svZWRhL3NlY3Rpb24zL2VkYTM2NzIuaHRtXG4gICAqL1xuICB2YXIgdFRhYmxlID0ge1xuICAgICcxJzogIDEyLjcwNiwnMic6ICA0LjMwMywgJzMnOiAgMy4xODIsICc0JzogIDIuNzc2LCAnNSc6ICAyLjU3MSwgJzYnOiAgMi40NDcsXG4gICAgJzcnOiAgMi4zNjUsICc4JzogIDIuMzA2LCAnOSc6ICAyLjI2MiwgJzEwJzogMi4yMjgsICcxMSc6IDIuMjAxLCAnMTInOiAyLjE3OSxcbiAgICAnMTMnOiAyLjE2LCAgJzE0JzogMi4xNDUsICcxNSc6IDIuMTMxLCAnMTYnOiAyLjEyLCAgJzE3JzogMi4xMSwgICcxOCc6IDIuMTAxLFxuICAgICcxOSc6IDIuMDkzLCAnMjAnOiAyLjA4NiwgJzIxJzogMi4wOCwgICcyMic6IDIuMDc0LCAnMjMnOiAyLjA2OSwgJzI0JzogMi4wNjQsXG4gICAgJzI1JzogMi4wNiwgICcyNic6IDIuMDU2LCAnMjcnOiAyLjA1MiwgJzI4JzogMi4wNDgsICcyOSc6IDIuMDQ1LCAnMzAnOiAyLjA0MixcbiAgICAnaW5maW5pdHknOiAxLjk2XG4gIH07XG5cbiAgLyoqXG4gICAqIENyaXRpY2FsIE1hbm4tV2hpdG5leSBVLXZhbHVlcyBmb3IgOTUlIGNvbmZpZGVuY2VcbiAgICogaHR0cDovL3d3dy5zYWJ1cmNoaWxsLmNvbS9JQmJpb2xvZ3kvc3RhdHMvMDAzLmh0bWxcbiAgICovXG4gIHZhciB1VGFibGUgPSB7XG4gICAgJzUnOiAgWzAsIDEsIDJdLFxuICAgICc2JzogIFsxLCAyLCAzLCA1XSxcbiAgICAnNyc6ICBbMSwgMywgNSwgNiwgOF0sXG4gICAgJzgnOiAgWzIsIDQsIDYsIDgsIDEwLCAxM10sXG4gICAgJzknOiAgWzIsIDQsIDcsIDEwLCAxMiwgMTUsIDE3XSxcbiAgICAnMTAnOiBbMywgNSwgOCwgMTEsIDE0LCAxNywgMjAsIDIzXSxcbiAgICAnMTEnOiBbMywgNiwgOSwgMTMsIDE2LCAxOSwgMjMsIDI2LCAzMF0sXG4gICAgJzEyJzogWzQsIDcsIDExLCAxNCwgMTgsIDIyLCAyNiwgMjksIDMzLCAzN10sXG4gICAgJzEzJzogWzQsIDgsIDEyLCAxNiwgMjAsIDI0LCAyOCwgMzMsIDM3LCA0MSwgNDVdLFxuICAgICcxNCc6IFs1LCA5LCAxMywgMTcsIDIyLCAyNiwgMzEsIDM2LCA0MCwgNDUsIDUwLCA1NV0sXG4gICAgJzE1JzogWzUsIDEwLCAxNCwgMTksIDI0LCAyOSwgMzQsIDM5LCA0NCwgNDksIDU0LCA1OSwgNjRdLFxuICAgICcxNic6IFs2LCAxMSwgMTUsIDIxLCAyNiwgMzEsIDM3LCA0MiwgNDcsIDUzLCA1OSwgNjQsIDcwLCA3NV0sXG4gICAgJzE3JzogWzYsIDExLCAxNywgMjIsIDI4LCAzNCwgMzksIDQ1LCA1MSwgNTcsIDYzLCA2NywgNzUsIDgxLCA4N10sXG4gICAgJzE4JzogWzcsIDEyLCAxOCwgMjQsIDMwLCAzNiwgNDIsIDQ4LCA1NSwgNjEsIDY3LCA3NCwgODAsIDg2LCA5MywgOTldLFxuICAgICcxOSc6IFs3LCAxMywgMTksIDI1LCAzMiwgMzgsIDQ1LCA1MiwgNTgsIDY1LCA3MiwgNzgsIDg1LCA5MiwgOTksIDEwNiwgMTEzXSxcbiAgICAnMjAnOiBbOCwgMTQsIDIwLCAyNywgMzQsIDQxLCA0OCwgNTUsIDYyLCA2OSwgNzYsIDgzLCA5MCwgOTgsIDEwNSwgMTEyLCAxMTksIDEyN10sXG4gICAgJzIxJzogWzgsIDE1LCAyMiwgMjksIDM2LCA0MywgNTAsIDU4LCA2NSwgNzMsIDgwLCA4OCwgOTYsIDEwMywgMTExLCAxMTksIDEyNiwgMTM0LCAxNDJdLFxuICAgICcyMic6IFs5LCAxNiwgMjMsIDMwLCAzOCwgNDUsIDUzLCA2MSwgNjksIDc3LCA4NSwgOTMsIDEwMSwgMTA5LCAxMTcsIDEyNSwgMTMzLCAxNDEsIDE1MCwgMTU4XSxcbiAgICAnMjMnOiBbOSwgMTcsIDI0LCAzMiwgNDAsIDQ4LCA1NiwgNjQsIDczLCA4MSwgODksIDk4LCAxMDYsIDExNSwgMTIzLCAxMzIsIDE0MCwgMTQ5LCAxNTcsIDE2NiwgMTc1XSxcbiAgICAnMjQnOiBbMTAsIDE3LCAyNSwgMzMsIDQyLCA1MCwgNTksIDY3LCA3NiwgODUsIDk0LCAxMDIsIDExMSwgMTIwLCAxMjksIDEzOCwgMTQ3LCAxNTYsIDE2NSwgMTc0LCAxODMsIDE5Ml0sXG4gICAgJzI1JzogWzEwLCAxOCwgMjcsIDM1LCA0NCwgNTMsIDYyLCA3MSwgODAsIDg5LCA5OCwgMTA3LCAxMTcsIDEyNiwgMTM1LCAxNDUsIDE1NCwgMTYzLCAxNzMsIDE4MiwgMTkyLCAyMDEsIDIxMV0sXG4gICAgJzI2JzogWzExLCAxOSwgMjgsIDM3LCA0NiwgNTUsIDY0LCA3NCwgODMsIDkzLCAxMDIsIDExMiwgMTIyLCAxMzIsIDE0MSwgMTUxLCAxNjEsIDE3MSwgMTgxLCAxOTEsIDIwMCwgMjEwLCAyMjAsIDIzMF0sXG4gICAgJzI3JzogWzExLCAyMCwgMjksIDM4LCA0OCwgNTcsIDY3LCA3NywgODcsIDk3LCAxMDcsIDExOCwgMTI1LCAxMzgsIDE0NywgMTU4LCAxNjgsIDE3OCwgMTg4LCAxOTksIDIwOSwgMjE5LCAyMzAsIDI0MCwgMjUwXSxcbiAgICAnMjgnOiBbMTIsIDIxLCAzMCwgNDAsIDUwLCA2MCwgNzAsIDgwLCA5MCwgMTAxLCAxMTEsIDEyMiwgMTMyLCAxNDMsIDE1NCwgMTY0LCAxNzUsIDE4NiwgMTk2LCAyMDcsIDIxOCwgMjI4LCAyMzksIDI1MCwgMjYxLCAyNzJdLFxuICAgICcyOSc6IFsxMywgMjIsIDMyLCA0MiwgNTIsIDYyLCA3MywgODMsIDk0LCAxMDUsIDExNiwgMTI3LCAxMzgsIDE0OSwgMTYwLCAxNzEsIDE4MiwgMTkzLCAyMDQsIDIxNSwgMjI2LCAyMzgsIDI0OSwgMjYwLCAyNzEsIDI4MiwgMjk0XSxcbiAgICAnMzAnOiBbMTMsIDIzLCAzMywgNDMsIDU0LCA2NSwgNzYsIDg3LCA5OCwgMTA5LCAxMjAsIDEzMSwgMTQzLCAxNTQsIDE2NiwgMTc3LCAxODksIDIwMCwgMjEyLCAyMjMsIDIzNSwgMjQ3LCAyNTgsIDI3MCwgMjgyLCAyOTMsIDMwNSwgMzE3XVxuICB9O1xuXG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cy9mZWF0dXJlcy5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgdmFyIHN1cHBvcnQgPSB7fTtcblxuICAoZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgQWRvYmUgQUlSLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuYWlyID0gaXNDbGFzc09mKHdpbmRvdy5ydW50aW1lLCAnU2NyaXB0QnJpZGdpbmdQcm94eU9iamVjdCcpO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGlmIGBhcmd1bWVudHNgIG9iamVjdHMgaGF2ZSB0aGUgY29ycmVjdCBpbnRlcm5hbCBbW0NsYXNzXV0gdmFsdWUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5hcmd1bWVudHNDbGFzcyA9IGlzQ2xhc3NPZihhcmd1bWVudHMsICdBcmd1bWVudHMnKTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5icm93c2VyID0gZG9jICYmIGlzSG9zdFR5cGUod2luZG93LCAnbmF2aWdhdG9yJyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgc3RyaW5ncyBzdXBwb3J0IGFjY2Vzc2luZyBjaGFyYWN0ZXJzIGJ5IGluZGV4LlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuY2hhckJ5SW5kZXggPVxuICAgICAgLy8gSUUgOCBzdXBwb3J0cyBpbmRleGVzIG9uIHN0cmluZyBsaXRlcmFscyBidXQgbm90IHN0cmluZyBvYmplY3RzXG4gICAgICAoJ3gnWzBdICsgT2JqZWN0KCd4JylbMF0pID09ICd4eCc7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgc3RyaW5ncyBoYXZlIGluZGV4ZXMgYXMgb3duIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5jaGFyQnlPd25JbmRleCA9XG4gICAgICAvLyBOYXJ3aGFsLCBSaGlubywgUmluZ29KUywgSUUgOCwgYW5kIE9wZXJhIDwgMTAuNTIgc3VwcG9ydCBpbmRleGVzIG9uXG4gICAgICAvLyBzdHJpbmdzIGJ1dCBkb24ndCBkZXRlY3QgdGhlbSBhcyBvd24gcHJvcGVydGllc1xuICAgICAgc3VwcG9ydC5jaGFyQnlJbmRleCAmJiBoYXNLZXkoJ3gnLCAnMCcpO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGlmIEphdmEgaXMgZW5hYmxlZC9leHBvc2VkLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuamF2YSA9IGlzQ2xhc3NPZih3aW5kb3cuamF2YSwgJ0phdmFQYWNrYWdlJyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgdGhlIFRpbWVycyBBUEkgZXhpc3RzLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQudGltZW91dCA9IGlzSG9zdFR5cGUod2luZG93LCAnc2V0VGltZW91dCcpICYmIGlzSG9zdFR5cGUod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgZnVuY3Rpb25zIHN1cHBvcnQgZGVjb21waWxhdGlvbi5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRlY29tcGlsYXRpb25cbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmFyaSAyLnggcmVtb3ZlcyBjb21tYXMgaW4gb2JqZWN0IGxpdGVyYWxzXG4gICAgICAvLyBmcm9tIEZ1bmN0aW9uI3RvU3RyaW5nIHJlc3VsdHNcbiAgICAgIC8vIGh0dHA6Ly93ZWJrLml0LzExNjA5XG4gICAgICAvLyBGaXJlZm94IDMuNiBhbmQgT3BlcmEgOS4yNSBzdHJpcCBncm91cGluZ1xuICAgICAgLy8gcGFyZW50aGVzZXMgZnJvbSBGdW5jdGlvbiN0b1N0cmluZyByZXN1bHRzXG4gICAgICAvLyBodHRwOi8vYnVnemlsLmxhLzU1OTQzOFxuICAgICAgc3VwcG9ydC5kZWNvbXBpbGF0aW9uID0gRnVuY3Rpb24oXG4gICAgICAgICdyZXR1cm4gKCcgKyAoZnVuY3Rpb24oeCkgeyByZXR1cm4geyAneCc6ICcnICsgKDEgKyB4KSArICcnLCAneSc6IDAgfTsgfSkgKyAnKSdcbiAgICAgICkoKSgwKS54ID09PSAnMSc7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBzdXBwb3J0LmRlY29tcGlsYXRpb24gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgRVM1KyBwcm9wZXJ0eSBkZXNjcmlwdG9yIEFQSS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRlc2NyaXB0b3JzXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICB2YXIgbyA9IHt9O1xuICAgICAgc3VwcG9ydC5kZXNjcmlwdG9ycyA9IChzZXREZXNjcmlwdG9yKG8sIG8sIG8pLCAndmFsdWUnIGluIGdldERlc2NyaXB0b3IobywgbykpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgc3VwcG9ydC5kZXNjcmlwdG9ycyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVjdCBFUzUrIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCkuXG4gICAgICpcbiAgICAgKiBAbmFtZSBnZXRBbGxLZXlzXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5zdXBwb3J0XG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICBzdXBwb3J0LmdldEFsbEtleXMgPSAvXFxidmFsdWVPZlxcYi8udGVzdChnZXRBbGxLZXlzKE9iamVjdC5wcm90b3R5cGUpKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHN1cHBvcnQuZ2V0QWxsS2V5cyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBvd24gcHJvcGVydGllcyBhcmUgaXRlcmF0ZWQgYmVmb3JlIGluaGVyaXRlZCBwcm9wZXJ0aWVzIChhbGwgYnV0IElFIDwgOSkuXG4gICAgICpcbiAgICAgKiBAbmFtZSBpdGVyYXRlc093bkxhc3RcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgc3VwcG9ydC5pdGVyYXRlc093bkZpcnN0ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLnggPSAxOyB9XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IHsgJ3knOiAxIH07XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5ldyBjdG9yKSB7IHByb3BzLnB1c2gocHJvcCk7IH1cbiAgICAgIHJldHVybiBwcm9wc1swXSA9PSAneCc7XG4gICAgfSgpKTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBhIG5vZGUncyBbW0NsYXNzXV0gaXMgcmVzb2x2YWJsZSAoYWxsIGJ1dCBJRSA8IDkpXG4gICAgICogYW5kIHRoYXQgdGhlIEpTIGVuZ2luZSBlcnJvcnMgd2hlbiBhdHRlbXB0aW5nIHRvIGNvZXJjZSBhbiBvYmplY3QgdG8gYVxuICAgICAqIHN0cmluZyB3aXRob3V0IGEgYHRvU3RyaW5nYCBwcm9wZXJ0eSB2YWx1ZSBvZiBgdHlwZW9mYCBcImZ1bmN0aW9uXCIuXG4gICAgICpcbiAgICAgKiBAbmFtZSBub2RlQ2xhc3NcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnN1cHBvcnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgdHJ5IHtcbiAgICAgIHN1cHBvcnQubm9kZUNsYXNzID0gKHsgJ3RvU3RyaW5nJzogMCB9ICsgJycsIHRvU3RyaW5nLmNhbGwoZG9jIHx8IDApICE9ICdbb2JqZWN0IE9iamVjdF0nKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHN1cHBvcnQubm9kZUNsYXNzID0gdHJ1ZTtcbiAgICB9XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIFRpbWVyIG9iamVjdCB1c2VkIGJ5IGBjbG9jaygpYCBhbmQgYERlZmVycmVkI3Jlc29sdmVgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gIHZhciB0aW1lciA9IHtcblxuICAgLyoqXG4gICAgKiBUaGUgdGltZXIgbmFtZXNwYWNlIG9iamVjdCBvciBjb25zdHJ1Y3Rvci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAdHlwZSBGdW5jdGlvbnxPYmplY3RcbiAgICAqL1xuICAgICducyc6IERhdGUsXG5cbiAgIC8qKlxuICAgICogU3RhcnRzIHRoZSBkZWZlcnJlZCB0aW1lci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVmZXJyZWQgVGhlIGRlZmVycmVkIGluc3RhbmNlLlxuICAgICovXG4gICAgJ3N0YXJ0JzogbnVsbCwgLy8gbGF6eSBkZWZpbmVkIGluIGBjbG9jaygpYFxuXG4gICAvKipcbiAgICAqIFN0b3BzIHRoZSBkZWZlcnJlZCB0aW1lci5cbiAgICAqXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQG1lbWJlck9mIHRpbWVyXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVmZXJyZWQgVGhlIGRlZmVycmVkIGluc3RhbmNlLlxuICAgICovXG4gICAgJ3N0b3AnOiBudWxsIC8vIGxhenkgZGVmaW5lZCBpbiBgY2xvY2soKWBcbiAgfTtcblxuICAvKiogU2hvcnRjdXQgZm9yIGludmVyc2UgcmVzdWx0cyAqL1xuICB2YXIgbm9Bcmd1bWVudHNDbGFzcyA9ICFzdXBwb3J0LmFyZ3VtZW50c0NsYXNzLFxuICAgICAgbm9DaGFyQnlJbmRleCA9ICFzdXBwb3J0LmNoYXJCeUluZGV4LFxuICAgICAgbm9DaGFyQnlPd25JbmRleCA9ICFzdXBwb3J0LmNoYXJCeU93bkluZGV4O1xuXG4gIC8qKiBNYXRoIHNob3J0Y3V0cyAqL1xuICB2YXIgYWJzICAgPSBNYXRoLmFicyxcbiAgICAgIGZsb29yID0gTWF0aC5mbG9vcixcbiAgICAgIG1heCAgID0gTWF0aC5tYXgsXG4gICAgICBtaW4gICA9IE1hdGgubWluLFxuICAgICAgcG93ICAgPSBNYXRoLnBvdyxcbiAgICAgIHNxcnQgID0gTWF0aC5zcXJ0O1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUaGUgQmVuY2htYXJrIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgQSBuYW1lIHRvIGlkZW50aWZ5IHRoZSBiZW5jaG1hcmsuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBUaGUgdGVzdCB0byBiZW5jaG1hcmsuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlICh0aGUgYG5ld2Agb3BlcmF0b3IgaXMgb3B0aW9uYWwpXG4gICAqIHZhciBiZW5jaCA9IG5ldyBCZW5jaG1hcmsoZm4pO1xuICAgKlxuICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyaygnZm9vJywgZm4pO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyaygnZm9vJywgZm4sIHtcbiAgICpcbiAgICogICAvLyBkaXNwbGF5ZWQgYnkgQmVuY2htYXJrI3RvU3RyaW5nIGlmIGBuYW1lYCBpcyBub3QgYXZhaWxhYmxlXG4gICAqICAgJ2lkJzogJ3h5eicsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIGJlbmNobWFyayBzdGFydHMgcnVubmluZ1xuICAgKiAgICdvblN0YXJ0Jzogb25TdGFydCxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgYWZ0ZXIgZWFjaCBydW4gY3ljbGVcbiAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gYWJvcnRlZFxuICAgKiAgICdvbkFib3J0Jzogb25BYm9ydCxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgd2hlbiBhIHRlc3QgZXJyb3JzXG4gICAqICAgJ29uRXJyb3InOiBvbkVycm9yLFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIHJlc2V0XG4gICAqICAgJ29uUmVzZXQnOiBvblJlc2V0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIHRoZSBiZW5jaG1hcmsgY29tcGxldGVzIHJ1bm5pbmdcbiAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGUsXG4gICAqXG4gICAqICAgLy8gY29tcGlsZWQvY2FsbGVkIGJlZm9yZSB0aGUgdGVzdCBsb29wXG4gICAqICAgJ3NldHVwJzogc2V0dXAsXG4gICAqXG4gICAqICAgLy8gY29tcGlsZWQvY2FsbGVkIGFmdGVyIHRoZSB0ZXN0IGxvb3BcbiAgICogICAndGVhcmRvd24nOiB0ZWFyZG93blxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gb3IgbmFtZSBhbmQgb3B0aW9uc1xuICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCB7XG4gICAqXG4gICAqICAgLy8gYSBmbGFnIHRvIGluZGljYXRlIHRoZSBiZW5jaG1hcmsgaXMgZGVmZXJyZWRcbiAgICogICAnZGVmZXInOiB0cnVlLFxuICAgKlxuICAgKiAgIC8vIGJlbmNobWFyayB0ZXN0IGZ1bmN0aW9uXG4gICAqICAgJ2ZuJzogZnVuY3Rpb24oZGVmZXJyZWQpIHtcbiAgICogICAgIC8vIGNhbGwgcmVzb2x2ZSgpIHdoZW4gdGhlIGRlZmVycmVkIHRlc3QgaXMgZmluaXNoZWRcbiAgICogICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICogICB9XG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBvciBvcHRpb25zIG9ubHlcbiAgICogdmFyIGJlbmNoID0gbmV3IEJlbmNobWFyayh7XG4gICAqXG4gICAqICAgLy8gYmVuY2htYXJrIG5hbWVcbiAgICogICAnbmFtZSc6ICdmb28nLFxuICAgKlxuICAgKiAgIC8vIGJlbmNobWFyayB0ZXN0IGFzIGEgc3RyaW5nXG4gICAqICAgJ2ZuJzogJ1sxLDIsMyw0XS5zb3J0KCknXG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBhIHRlc3QncyBgdGhpc2AgYmluZGluZyBpcyBzZXQgdG8gdGhlIGJlbmNobWFyayBpbnN0YW5jZVxuICAgKiB2YXIgYmVuY2ggPSBuZXcgQmVuY2htYXJrKCdmb28nLCBmdW5jdGlvbigpIHtcbiAgICogICAnTXkgbmFtZSBpcyAnLmNvbmNhdCh0aGlzLm5hbWUpOyAvLyBNeSBuYW1lIGlzIGZvb1xuICAgKiB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIEJlbmNobWFyayhuYW1lLCBmbiwgb3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICAvLyBhbGxvdyBpbnN0YW5jZSBjcmVhdGlvbiB3aXRob3V0IHRoZSBgbmV3YCBvcGVyYXRvclxuICAgIGlmIChtZSA9PSBudWxsIHx8IG1lLmNvbnN0cnVjdG9yICE9IEJlbmNobWFyaykge1xuICAgICAgcmV0dXJuIG5ldyBCZW5jaG1hcmsobmFtZSwgZm4sIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgaWYgKGlzQ2xhc3NPZihuYW1lLCAnT2JqZWN0JykpIHtcbiAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNDbGFzc09mKG5hbWUsICdGdW5jdGlvbicpKSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAoZm4sIG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gZm47XG4gICAgICBmbiA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQ2xhc3NPZihmbiwgJ09iamVjdCcpKSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAobmFtZSwgb3B0aW9ucylcbiAgICAgIG9wdGlvbnMgPSBmbjtcbiAgICAgIGZuID0gbnVsbDtcbiAgICAgIG1lLm5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIDMgYXJndW1lbnRzIChuYW1lLCBmbiBbLCBvcHRpb25zXSlcbiAgICAgIG1lLm5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBzZXRPcHRpb25zKG1lLCBvcHRpb25zKTtcbiAgICBtZS5pZCB8fCAobWUuaWQgPSArK2NvdW50ZXIpO1xuICAgIG1lLmZuID09IG51bGwgJiYgKG1lLmZuID0gZm4pO1xuICAgIG1lLnN0YXRzID0gZGVlcENsb25lKG1lLnN0YXRzKTtcbiAgICBtZS50aW1lcyA9IGRlZXBDbG9uZShtZS50aW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIERlZmVycmVkIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gY2xvbmUgVGhlIGNsb25lZCBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiBEZWZlcnJlZChjbG9uZSkge1xuICAgIHZhciBtZSA9IHRoaXM7XG4gICAgaWYgKG1lID09IG51bGwgfHwgbWUuY29uc3RydWN0b3IgIT0gRGVmZXJyZWQpIHtcbiAgICAgIHJldHVybiBuZXcgRGVmZXJyZWQoY2xvbmUpO1xuICAgIH1cbiAgICBtZS5iZW5jaG1hcmsgPSBjbG9uZTtcbiAgICBjbG9jayhtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIEV2ZW50IGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAqL1xuICBmdW5jdGlvbiBFdmVudCh0eXBlKSB7XG4gICAgdmFyIG1lID0gdGhpcztcbiAgICByZXR1cm4gKG1lID09IG51bGwgfHwgbWUuY29uc3RydWN0b3IgIT0gRXZlbnQpXG4gICAgICA/IG5ldyBFdmVudCh0eXBlKVxuICAgICAgOiAodHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgID8gdHlwZVxuICAgICAgICAgIDogZXh0ZW5kKG1lLCB7ICd0aW1lU3RhbXAnOiArbmV3IERhdGUgfSwgdHlwZW9mIHR5cGUgPT0gJ3N0cmluZycgPyB7ICd0eXBlJzogdHlwZSB9IDogdHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIFN1aXRlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBBIG5hbWUgdG8gaWRlbnRpZnkgdGhlIHN1aXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvLyBiYXNpYyB1c2FnZSAodGhlIGBuZXdgIG9wZXJhdG9yIGlzIG9wdGlvbmFsKVxuICAgKiB2YXIgc3VpdGUgPSBuZXcgQmVuY2htYXJrLlN1aXRlO1xuICAgKlxuICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICogdmFyIHN1aXRlID0gbmV3IEJlbmNobWFyay5TdWl0ZSgnZm9vJyk7XG4gICAqXG4gICAqIC8vIG9yIHdpdGggb3B0aW9uc1xuICAgKiB2YXIgc3VpdGUgPSBuZXcgQmVuY2htYXJrLlN1aXRlKCdmb28nLCB7XG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIHN1aXRlIHN0YXJ0cyBydW5uaW5nXG4gICAqICAgJ29uU3RhcnQnOiBvblN0YXJ0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCBiZXR3ZWVuIHJ1bm5pbmcgYmVuY2htYXJrc1xuICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgd2hlbiBhYm9ydGVkXG4gICAqICAgJ29uQWJvcnQnOiBvbkFib3J0LFxuICAgKlxuICAgKiAgIC8vIGNhbGxlZCB3aGVuIGEgdGVzdCBlcnJvcnNcbiAgICogICAnb25FcnJvcic6IG9uRXJyb3IsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gcmVzZXRcbiAgICogICAnb25SZXNldCc6IG9uUmVzZXQsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIHdoZW4gdGhlIHN1aXRlIGNvbXBsZXRlcyBydW5uaW5nXG4gICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gU3VpdGUobmFtZSwgb3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICAvLyBhbGxvdyBpbnN0YW5jZSBjcmVhdGlvbiB3aXRob3V0IHRoZSBgbmV3YCBvcGVyYXRvclxuICAgIGlmIChtZSA9PSBudWxsIHx8IG1lLmNvbnN0cnVjdG9yICE9IFN1aXRlKSB7XG4gICAgICByZXR1cm4gbmV3IFN1aXRlKG5hbWUsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgaWYgKGlzQ2xhc3NPZihuYW1lLCAnT2JqZWN0JykpIHtcbiAgICAgIC8vIDEgYXJndW1lbnQgKG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gMiBhcmd1bWVudHMgKG5hbWUgWywgb3B0aW9uc10pXG4gICAgICBtZS5uYW1lID0gbmFtZTtcbiAgICB9XG4gICAgc2V0T3B0aW9ucyhtZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogTm90ZTogU29tZSBhcnJheSBtZXRob2RzIGhhdmUgYmVlbiBpbXBsZW1lbnRlZCBpbiBwbGFpbiBKYXZhU2NyaXB0IHRvIGF2b2lkXG4gICAqIGJ1Z3MgaW4gSUUsIE9wZXJhLCBSaGlubywgYW5kIE1vYmlsZSBTYWZhcmkuXG4gICAqXG4gICAqIElFIGNvbXBhdGliaWxpdHkgbW9kZSBhbmQgSUUgPCA5IGhhdmUgYnVnZ3kgQXJyYXkgYHNoaWZ0KClgIGFuZCBgc3BsaWNlKClgXG4gICAqIGZ1bmN0aW9ucyB0aGF0IGZhaWwgdG8gcmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQsIGBvYmplY3RbMF1gLCBvZlxuICAgKiBhcnJheS1saWtlLW9iamVjdHMgZXZlbiB0aG91Z2ggdGhlIGBsZW5ndGhgIHByb3BlcnR5IGlzIHNldCB0byBgMGAuXG4gICAqIFRoZSBgc2hpZnQoKWAgbWV0aG9kIGlzIGJ1Z2d5IGluIElFIDggY29tcGF0aWJpbGl0eSBtb2RlLCB3aGlsZSBgc3BsaWNlKClgXG4gICAqIGlzIGJ1Z2d5IHJlZ2FyZGxlc3Mgb2YgbW9kZSBpbiBJRSA8IDkgYW5kIGJ1Z2d5IGluIGNvbXBhdGliaWxpdHkgbW9kZSBpbiBJRSA5LlxuICAgKlxuICAgKiBJbiBPcGVyYSA8IDkuNTAgYW5kIHNvbWUgb2xkZXIvYmV0YSBNb2JpbGUgU2FmYXJpIHZlcnNpb25zIHVzaW5nIGB1bnNoaWZ0KClgXG4gICAqIGdlbmVyaWNhbGx5IHRvIGF1Z21lbnQgdGhlIGBhcmd1bWVudHNgIG9iamVjdCB3aWxsIHBhdmUgdGhlIHZhbHVlIGF0IGluZGV4IDBcbiAgICogd2l0aG91dCBpbmNyaW1lbnRpbmcgdGhlIG90aGVyIHZhbHVlcydzIGluZGV4ZXMuXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGNsb3VkL3VuZGVyc2NvcmUvaXNzdWVzLzlcbiAgICpcbiAgICogUmhpbm8gYW5kIGVudmlyb25tZW50cyBpdCBwb3dlcnMsIGxpa2UgTmFyd2hhbCBhbmQgUmluZ29KUywgbWF5IGhhdmVcbiAgICogYnVnZ3kgQXJyYXkgYGNvbmNhdCgpYCwgYHJldmVyc2UoKWAsIGBzaGlmdCgpYCwgYHNsaWNlKClgLCBgc3BsaWNlKClgIGFuZFxuICAgKiBgdW5zaGlmdCgpYCBmdW5jdGlvbnMgdGhhdCBtYWtlIHNwYXJzZSBhcnJheXMgbm9uLXNwYXJzZSBieSBhc3NpZ25pbmcgdGhlXG4gICAqIHVuZGVmaW5lZCBpbmRleGVzIGEgdmFsdWUgb2YgdW5kZWZpbmVkLlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9jb21taXQvNzAyYWJmZWQzZjhjYTA0M2IyNjM2ZWZkMzFjMTRiYTc1NTI2MDNkZFxuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBlbGVtZW50cyBvZiB0aGUgaG9zdCBhcnJheSBmb2xsb3dlZCBieSB0aGVcbiAgICogZWxlbWVudHMgb2YgZWFjaCBhcmd1bWVudCBpbiBvcmRlci5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBjb25jYXQoKSB7XG4gICAgdmFyIHZhbHVlLFxuICAgICAgICBqID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG4gICAgICAgIHJlc3VsdCA9IHNsaWNlLmNhbGwodGhpcyksXG4gICAgICAgIGluZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2ogPCBsZW5ndGgpIHtcbiAgICAgIHZhbHVlID0gYXJndW1lbnRzW2pdO1xuICAgICAgaWYgKGlzQ2xhc3NPZih2YWx1ZSwgJ0FycmF5JykpIHtcbiAgICAgICAgZm9yICh2YXIgayA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGsgPCBsOyBrKyssIGluZGV4KyspIHtcbiAgICAgICAgICBpZiAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHZhbHVlW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2luZGV4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB1c2VkIGJ5IGBzaGlmdCgpYCwgYHNwbGljZSgpYCwgYW5kIGB1bnNoaWZ0KClgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnQgVGhlIGluZGV4IHRvIHN0YXJ0IGluc2VydGluZyBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGV0ZUNvdW50IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gZGVsZXRlIGZyb20gdGhlIGluc2VydCBwb2ludC5cbiAgICogQHBhcmFtIHtBcnJheX0gZWxlbWVudHMgVGhlIGVsZW1lbnRzIHRvIGluc2VydC5cbiAgICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBkZWxldGVkIGVsZW1lbnRzLlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zZXJ0KHN0YXJ0LCBkZWxldGVDb3VudCwgZWxlbWVudHMpIHtcbiAgICAvLyBgcmVzdWx0YCBzaG91bGQgaGF2ZSBpdHMgbGVuZ3RoIHNldCB0byB0aGUgYGRlbGV0ZUNvdW50YFxuICAgIC8vIHNlZSBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTMzMlxuICAgIHZhciBkZWxldGVFbmQgPSBzdGFydCArIGRlbGV0ZUNvdW50LFxuICAgICAgICBlbGVtZW50Q291bnQgPSBlbGVtZW50cyA/IGVsZW1lbnRzLmxlbmd0aCA6IDAsXG4gICAgICAgIGluZGV4ID0gc3RhcnQgLSAxLFxuICAgICAgICBsZW5ndGggPSBzdGFydCArIGVsZW1lbnRDb3VudCxcbiAgICAgICAgb2JqZWN0ID0gdGhpcyxcbiAgICAgICAgcmVzdWx0ID0gQXJyYXkoZGVsZXRlQ291bnQpLFxuICAgICAgICB0YWlsID0gc2xpY2UuY2FsbChvYmplY3QsIGRlbGV0ZUVuZCk7XG5cbiAgICAvLyBkZWxldGUgZWxlbWVudHMgZnJvbSB0aGUgYXJyYXlcbiAgICB3aGlsZSAoKytpbmRleCA8IGRlbGV0ZUVuZCkge1xuICAgICAgaWYgKGluZGV4IGluIG9iamVjdCkge1xuICAgICAgICByZXN1bHRbaW5kZXggLSBzdGFydF0gPSBvYmplY3RbaW5kZXhdO1xuICAgICAgICBkZWxldGUgb2JqZWN0W2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gaW5zZXJ0IGVsZW1lbnRzXG4gICAgaW5kZXggPSBzdGFydCAtIDE7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIG9iamVjdFtpbmRleF0gPSBlbGVtZW50c1tpbmRleCAtIHN0YXJ0XTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHRhaWwgZWxlbWVudHNcbiAgICBzdGFydCA9IGluZGV4LS07XG4gICAgbGVuZ3RoID0gbWF4KDAsIChvYmplY3QubGVuZ3RoID4+PiAwKSAtIGRlbGV0ZUNvdW50ICsgZWxlbWVudENvdW50KTtcbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKChpbmRleCAtIHN0YXJ0KSBpbiB0YWlsKSB7XG4gICAgICAgIG9iamVjdFtpbmRleF0gPSB0YWlsW2luZGV4IC0gc3RhcnRdO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCBpbiBvYmplY3QpIHtcbiAgICAgICAgZGVsZXRlIG9iamVjdFtpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGRlbGV0ZSBleGNlc3MgZWxlbWVudHNcbiAgICBkZWxldGVDb3VudCA9IGRlbGV0ZUNvdW50ID4gZWxlbWVudENvdW50ID8gZGVsZXRlQ291bnQgLSBlbGVtZW50Q291bnQgOiAwO1xuICAgIHdoaWxlIChkZWxldGVDb3VudC0tKSB7XG4gICAgICBpbmRleCA9IGxlbmd0aCArIGRlbGV0ZUNvdW50O1xuICAgICAgaWYgKGluZGV4IGluIG9iamVjdCkge1xuICAgICAgICBkZWxldGUgb2JqZWN0W2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgb2JqZWN0Lmxlbmd0aCA9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYXJyYW5nZSB0aGUgaG9zdCBhcnJheSdzIGVsZW1lbnRzIGluIHJldmVyc2Ugb3JkZXIuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgcmV2ZXJzZWQgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiByZXZlcnNlKCkge1xuICAgIHZhciB1cHBlckluZGV4LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgb2JqZWN0ID0gT2JqZWN0KHRoaXMpLFxuICAgICAgICBsZW5ndGggPSBvYmplY3QubGVuZ3RoID4+PiAwLFxuICAgICAgICBtaWRkbGUgPSBmbG9vcihsZW5ndGggLyAyKTtcblxuICAgIGlmIChsZW5ndGggPiAxKSB7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IG1pZGRsZSkge1xuICAgICAgICB1cHBlckluZGV4ID0gbGVuZ3RoIC0gaW5kZXggLSAxO1xuICAgICAgICB2YWx1ZSA9IHVwcGVySW5kZXggaW4gb2JqZWN0ID8gb2JqZWN0W3VwcGVySW5kZXhdIDogdWlkO1xuICAgICAgICBpZiAoaW5kZXggaW4gb2JqZWN0KSB7XG4gICAgICAgICAgb2JqZWN0W3VwcGVySW5kZXhdID0gb2JqZWN0W2luZGV4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb2JqZWN0W3VwcGVySW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSAhPSB1aWQpIHtcbiAgICAgICAgICBvYmplY3RbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIG9iamVjdFtpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBob3N0IGFycmF5IGFuZCByZXR1cm5zIGl0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gc2hpZnQoKSB7XG4gICAgcmV0dXJuIGluc2VydC5jYWxsKHRoaXMsIDAsIDEpWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGhvc3QgYXJyYXkncyBlbGVtZW50cyBmcm9tIHRoZSBzdGFydCBpbmRleCB1cCB0byxcbiAgICogYnV0IG5vdCBpbmNsdWRpbmcsIHRoZSBlbmQgaW5kZXguXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0IFRoZSBzdGFydGluZyBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGVuZCBUaGUgZW5kIGluZGV4LlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIG9iamVjdCA9IE9iamVjdCh0aGlzKSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCA+Pj4gMCxcbiAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICBzdGFydCA9IHRvSW50ZWdlcihzdGFydCk7XG4gICAgc3RhcnQgPSBzdGFydCA8IDAgPyBtYXgobGVuZ3RoICsgc3RhcnQsIDApIDogbWluKHN0YXJ0LCBsZW5ndGgpO1xuICAgIHN0YXJ0LS07XG4gICAgZW5kID0gZW5kID09IG51bGwgPyBsZW5ndGggOiB0b0ludGVnZXIoZW5kKTtcbiAgICBlbmQgPSBlbmQgPCAwID8gbWF4KGxlbmd0aCArIGVuZCwgMCkgOiBtaW4oZW5kLCBsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCgrK2luZGV4LCArK3N0YXJ0KSA8IGVuZCkge1xuICAgICAgaWYgKHN0YXJ0IGluIG9iamVjdCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gb2JqZWN0W3N0YXJ0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgcmVtb3ZpbmcgYSByYW5nZSBvZiBlbGVtZW50cyBhbmQvb3IgaW5zZXJ0aW5nIGVsZW1lbnRzIGludG8gdGhlXG4gICAqIGhvc3QgYXJyYXkuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGV0ZUNvdW50IFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gZGVsZXRlLlxuICAgKiBAcGFyYW0ge01peGVkfSBbdmFsMSwgdmFsMiwgLi4uXSB2YWx1ZXMgdG8gaW5zZXJ0IGF0IHRoZSBgc3RhcnRgIGluZGV4LlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMuXG4gICAqL1xuICBmdW5jdGlvbiBzcGxpY2Uoc3RhcnQsIGRlbGV0ZUNvdW50KSB7XG4gICAgdmFyIG9iamVjdCA9IE9iamVjdCh0aGlzKSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCA+Pj4gMDtcblxuICAgIHN0YXJ0ID0gdG9JbnRlZ2VyKHN0YXJ0KTtcbiAgICBzdGFydCA9IHN0YXJ0IDwgMCA/IG1heChsZW5ndGggKyBzdGFydCwgMCkgOiBtaW4oc3RhcnQsIGxlbmd0aCk7XG5cbiAgICAvLyBzdXBwb3J0IHRoZSBkZS1mYWN0byBTcGlkZXJNb25rZXkgZXh0ZW5zaW9uXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvc3BsaWNlI1BhcmFtZXRlcnNcbiAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTQyOVxuICAgIGRlbGV0ZUNvdW50ID0gYXJndW1lbnRzLmxlbmd0aCA9PSAxXG4gICAgICA/IGxlbmd0aCAtIHN0YXJ0XG4gICAgICA6IG1pbihtYXgodG9JbnRlZ2VyKGRlbGV0ZUNvdW50KSwgMCksIGxlbmd0aCAtIHN0YXJ0KTtcblxuICAgIHJldHVybiBpbnNlcnQuY2FsbChvYmplY3QsIHN0YXJ0LCBkZWxldGVDb3VudCwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIGB2YWx1ZWAgdG8gYW4gaW50ZWdlci5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSByZXN1bHRpbmcgaW50ZWdlci5cbiAgICovXG4gIGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgIHZhbHVlID0gK3ZhbHVlO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCB8fCAhaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgfHwgMCA6IHZhbHVlIC0gKHZhbHVlICUgMSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhcmd1bWVudHMgdG8gdGhlIGhvc3QgYXJyYXkuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIG5ldyBsZW5ndGguXG4gICAqL1xuICBmdW5jdGlvbiB1bnNoaWZ0KCkge1xuICAgIHZhciBvYmplY3QgPSBPYmplY3QodGhpcyk7XG4gICAgaW5zZXJ0LmNhbGwob2JqZWN0LCAwLCAwLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBvYmplY3QubGVuZ3RoO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEEgZ2VuZXJpYyBgRnVuY3Rpb24jYmluZGAgbGlrZSBtZXRob2QuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBiZSBib3VuZCB0byBgdGhpc0FyZ2AuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIGZvciB0aGUgZ2l2ZW4gZnVuY3Rpb24uXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIGJvdW5kIGZ1bmN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHsgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTsgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gYXJndW1lbnRzIHN0cmluZyBhbmQgYm9keS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ3MgVGhlIGNvbW1hIHNlcGFyYXRlZCBmdW5jdGlvbiBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBib2R5IFRoZSBmdW5jdGlvbiBib2R5LlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBuZXcgZnVuY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVGdW5jdGlvbigpIHtcbiAgICAvLyBsYXp5IGRlZmluZVxuICAgIGNyZWF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24oYXJncywgYm9keSkge1xuICAgICAgdmFyIHJlc3VsdCxcbiAgICAgICAgICBhbmNob3IgPSBmcmVlRGVmaW5lID8gZGVmaW5lLmFtZCA6IEJlbmNobWFyayxcbiAgICAgICAgICBwcm9wID0gdWlkICsgJ2NyZWF0ZUZ1bmN0aW9uJztcblxuICAgICAgcnVuU2NyaXB0KChmcmVlRGVmaW5lID8gJ2RlZmluZS5hbWQuJyA6ICdCZW5jaG1hcmsuJykgKyBwcm9wICsgJz1mdW5jdGlvbignICsgYXJncyArICcpeycgKyBib2R5ICsgJ30nKTtcbiAgICAgIHJlc3VsdCA9IGFuY2hvcltwcm9wXTtcbiAgICAgIGRlbGV0ZSBhbmNob3JbcHJvcF07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLy8gZml4IEphZWdlck1vbmtleSBidWdcbiAgICAvLyBodHRwOi8vYnVnemlsLmxhLzYzOTcyMFxuICAgIGNyZWF0ZUZ1bmN0aW9uID0gc3VwcG9ydC5icm93c2VyICYmIChjcmVhdGVGdW5jdGlvbignJywgJ3JldHVyblwiJyArIHVpZCArICdcIicpIHx8IG5vb3ApKCkgPT0gdWlkID8gY3JlYXRlRnVuY3Rpb24gOiBGdW5jdGlvbjtcbiAgICByZXR1cm4gY3JlYXRlRnVuY3Rpb24uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxheSB0aGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24gYmFzZWQgb24gdGhlIGJlbmNobWFyaydzIGBkZWxheWAgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiZW5jaCBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZm4gVGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUuXG4gICAqL1xuICBmdW5jdGlvbiBkZWxheShiZW5jaCwgZm4pIHtcbiAgICBiZW5jaC5fdGltZXJJZCA9IHNldFRpbWVvdXQoZm4sIGJlbmNoLmRlbGF5ICogMWUzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGRlc3Ryb3kuXG4gICAqL1xuICBmdW5jdGlvbiBkZXN0cm95RWxlbWVudChlbGVtZW50KSB7XG4gICAgdHJhc2guYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgdHJhc2guaW5uZXJIVE1MID0gJyc7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgb3ZlciBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLCBleGVjdXRpbmcgdGhlIGBjYWxsYmFja2AgZm9yIGVhY2guXG4gICAqIENhbGxiYWNrcyBtYXkgdGVybWluYXRlIHRoZSBsb29wIGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBleGVjdXRlZCBwZXIgb3duIHByb3BlcnR5LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgb3B0aW9ucyBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG9iamVjdCBpdGVyYXRlZCBvdmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gZm9yUHJvcHMoKSB7XG4gICAgdmFyIGZvclNoYWRvd2VkLFxuICAgICAgICBza2lwU2VlbixcbiAgICAgICAgZm9yQXJncyA9IHRydWUsXG4gICAgICAgIHNoYWRvd2VkID0gWydjb25zdHJ1Y3RvcicsICdoYXNPd25Qcm9wZXJ0eScsICdpc1Byb3RvdHlwZU9mJywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ3RvTG9jYWxlU3RyaW5nJywgJ3RvU3RyaW5nJywgJ3ZhbHVlT2YnXTtcblxuICAgIChmdW5jdGlvbihlbnVtRmxhZywga2V5KSB7XG4gICAgICAvLyBtdXN0IHVzZSBhIG5vbi1uYXRpdmUgY29uc3RydWN0b3IgdG8gY2F0Y2ggdGhlIFNhZmFyaSAyIGlzc3VlXG4gICAgICBmdW5jdGlvbiBLbGFzcygpIHsgdGhpcy52YWx1ZU9mID0gMDsgfTtcbiAgICAgIEtsYXNzLnByb3RvdHlwZS52YWx1ZU9mID0gMDtcbiAgICAgIC8vIGNoZWNrIHZhcmlvdXMgZm9yLWluIGJ1Z3NcbiAgICAgIGZvciAoa2V5IGluIG5ldyBLbGFzcykge1xuICAgICAgICBlbnVtRmxhZyArPSBrZXkgPT0gJ3ZhbHVlT2YnID8gMSA6IDA7XG4gICAgICB9XG4gICAgICAvLyBjaGVjayBpZiBgYXJndW1lbnRzYCBvYmplY3RzIGhhdmUgbm9uLWVudW1lcmFibGUgaW5kZXhlc1xuICAgICAgZm9yIChrZXkgaW4gYXJndW1lbnRzKSB7XG4gICAgICAgIGtleSA9PSAnMCcgJiYgKGZvckFyZ3MgPSBmYWxzZSk7XG4gICAgICB9XG4gICAgICAvLyBTYWZhcmkgMiBpdGVyYXRlcyBvdmVyIHNoYWRvd2VkIHByb3BlcnRpZXMgdHdpY2VcbiAgICAgIC8vIGh0dHA6Ly9yZXBsYXkud2F5YmFja21hY2hpbmUub3JnLzIwMDkwNDI4MjIyOTQxL2h0dHA6Ly90b2JpZWxhbmdlbC5jb20vMjAwNy8xLzI5L2Zvci1pbi1sb29wLWJyb2tlbi1pbi1zYWZhcmkvXG4gICAgICBza2lwU2VlbiA9IGVudW1GbGFnID09IDI7XG4gICAgICAvLyBJRSA8IDkgaW5jb3JyZWN0bHkgbWFrZXMgYW4gb2JqZWN0J3MgcHJvcGVydGllcyBub24tZW51bWVyYWJsZSBpZiB0aGV5IGhhdmVcbiAgICAgIC8vIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgbm9uLWVudW1lcmFibGUgcHJvcGVydGllcyBpbiBpdHMgcHJvdG90eXBlIGNoYWluLlxuICAgICAgZm9yU2hhZG93ZWQgPSAhZW51bUZsYWc7XG4gICAgfSgwKSk7XG5cbiAgICAvLyBsYXp5IGRlZmluZVxuICAgIGZvclByb3BzID0gZnVuY3Rpb24ob2JqZWN0LCBjYWxsYmFjaywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgICAgdmFyIHJlc3VsdCA9IG9iamVjdDtcbiAgICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuXG4gICAgICB2YXIgY3RvcixcbiAgICAgICAgICBrZXksXG4gICAgICAgICAga2V5cyxcbiAgICAgICAgICBza2lwQ3RvcixcbiAgICAgICAgICBkb25lID0gIXJlc3VsdCxcbiAgICAgICAgICB3aGljaCA9IG9wdGlvbnMud2hpY2gsXG4gICAgICAgICAgYWxsRmxhZyA9IHdoaWNoID09ICdhbGwnLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgaXRlcmF0ZWUgPSBvYmplY3QsXG4gICAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgICBvd25GbGFnID0gYWxsRmxhZyB8fCB3aGljaCA9PSAnb3duJyxcbiAgICAgICAgICBzZWVuID0ge30sXG4gICAgICAgICAgc2tpcFByb3RvID0gaXNDbGFzc09mKG9iamVjdCwgJ0Z1bmN0aW9uJyksXG4gICAgICAgICAgdGhpc0FyZyA9IG9wdGlvbnMuYmluZDtcblxuICAgICAgaWYgKHRoaXNBcmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYWxsYmFjayA9IGJpbmQoY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgICAgfVxuICAgICAgLy8gaXRlcmF0ZSBhbGwgcHJvcGVydGllc1xuICAgICAgaWYgKGFsbEZsYWcgJiYgc3VwcG9ydC5nZXRBbGxLZXlzKSB7XG4gICAgICAgIGZvciAoaW5kZXggPSAwLCBrZXlzID0gZ2V0QWxsS2V5cyhvYmplY3QpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sob2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gZWxzZSBpdGVyYXRlIG9ubHkgZW51bWVyYWJsZSBwcm9wZXJ0aWVzXG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgLy8gRmlyZWZveCA8IDMuNiwgT3BlcmEgPiA5LjUwIC0gT3BlcmEgPCAxMS42MCwgYW5kIFNhZmFyaSA8IDUuMVxuICAgICAgICAgIC8vIChpZiB0aGUgcHJvdG90eXBlIG9yIGEgcHJvcGVydHkgb24gdGhlIHByb3RvdHlwZSBoYXMgYmVlbiBzZXQpXG4gICAgICAgICAgLy8gaW5jb3JyZWN0bHkgc2V0IGEgZnVuY3Rpb24ncyBgcHJvdG90eXBlYCBwcm9wZXJ0eSBbW0VudW1lcmFibGVdXSB2YWx1ZVxuICAgICAgICAgIC8vIHRvIGB0cnVlYC4gQmVjYXVzZSBvZiB0aGlzIHdlIHN0YW5kYXJkaXplIG9uIHNraXBwaW5nIHRoZSBgcHJvdG90eXBlYFxuICAgICAgICAgIC8vIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyByZWdhcmRsZXNzIG9mIHRoZWlyIFtbRW51bWVyYWJsZV1dIHZhbHVlLlxuICAgICAgICAgIGlmICgoZG9uZSA9XG4gICAgICAgICAgICAgICEoc2tpcFByb3RvICYmIGtleSA9PSAncHJvdG90eXBlJykgJiZcbiAgICAgICAgICAgICAgIShza2lwU2VlbiAmJiAoaGFzS2V5KHNlZW4sIGtleSkgfHwgIShzZWVuW2tleV0gPSB0cnVlKSkpICYmXG4gICAgICAgICAgICAgICghb3duRmxhZyB8fCBvd25GbGFnICYmIGhhc0tleShvYmplY3QsIGtleSkpICYmXG4gICAgICAgICAgICAgIGNhbGxiYWNrKG9iamVjdFtrZXldLCBrZXksIG9iamVjdCkgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGluIElFIDwgOSBzdHJpbmdzIGRvbid0IHN1cHBvcnQgYWNjZXNzaW5nIGNoYXJhY3RlcnMgYnkgaW5kZXhcbiAgICAgICAgaWYgKCFkb25lICYmIChmb3JBcmdzICYmIGlzQXJndW1lbnRzKG9iamVjdCkgfHxcbiAgICAgICAgICAgICgobm9DaGFyQnlJbmRleCB8fCBub0NoYXJCeU93bkluZGV4KSAmJiBpc0NsYXNzT2Yob2JqZWN0LCAnU3RyaW5nJykgJiZcbiAgICAgICAgICAgICAgKGl0ZXJhdGVlID0gbm9DaGFyQnlJbmRleCA/IG9iamVjdC5zcGxpdCgnJykgOiBvYmplY3QpKSkpIHtcbiAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKChkb25lID1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhpdGVyYXRlZVtpbmRleF0sIFN0cmluZyhpbmRleCksIG9iamVjdCkgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkb25lICYmIGZvclNoYWRvd2VkKSB7XG4gICAgICAgICAgLy8gQmVjYXVzZSBJRSA8IDkgY2FuJ3Qgc2V0IHRoZSBgW1tFbnVtZXJhYmxlXV1gIGF0dHJpYnV0ZSBvZiBhbiBleGlzdGluZ1xuICAgICAgICAgIC8vIHByb3BlcnR5IGFuZCB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSBvZiBhIHByb3RvdHlwZSBkZWZhdWx0cyB0b1xuICAgICAgICAgIC8vIG5vbi1lbnVtZXJhYmxlLCB3ZSBtYW51YWxseSBza2lwIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IHdoZW4gd2VcbiAgICAgICAgICAvLyB0aGluayB3ZSBhcmUgaXRlcmF0aW5nIG92ZXIgYSBgcHJvdG90eXBlYCBvYmplY3QuXG4gICAgICAgICAgY3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICBza2lwQ3RvciA9IGN0b3IgJiYgY3Rvci5wcm90b3R5cGUgJiYgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IGN0b3I7XG4gICAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgNzsgaW5kZXgrKykge1xuICAgICAgICAgICAga2V5ID0gc2hhZG93ZWRbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKCEoc2tpcEN0b3IgJiYga2V5ID09ICdjb25zdHJ1Y3RvcicpICYmXG4gICAgICAgICAgICAgICAgaGFzS2V5KG9iamVjdCwga2V5KSAmJlxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG9iamVjdFtrZXldLCBrZXksIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIHJldHVybiBmb3JQcm9wcy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGZpcnN0IGFyZ3VtZW50IGZyb20gYSBmdW5jdGlvbidzIHNvdXJjZS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgYXJndW1lbnQgbmFtZS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldEZpcnN0QXJndW1lbnQoZm4pIHtcbiAgICByZXR1cm4gKCFoYXNLZXkoZm4sICd0b1N0cmluZycpICYmXG4gICAgICAoL15bXFxzKF0qZnVuY3Rpb25bXihdKlxcKChbXlxccywpXSspLy5leGVjKGZuKSB8fCAwKVsxXSkgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGFyaXRobWV0aWMgbWVhbiBvZiBhIHNhbXBsZS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gc2FtcGxlIFRoZSBzYW1wbGUuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBtZWFuLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TWVhbihzYW1wbGUpIHtcbiAgICByZXR1cm4gcmVkdWNlKHNhbXBsZSwgZnVuY3Rpb24oc3VtLCB4KSB7XG4gICAgICByZXR1cm4gc3VtICsgeDtcbiAgICB9KSAvIHNhbXBsZS5sZW5ndGggfHwgMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzb3VyY2UgY29kZSBvZiBhIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhbHRTb3VyY2UgQSBzdHJpbmcgdXNlZCB3aGVuIGEgZnVuY3Rpb24ncyBzb3VyY2UgY29kZSBpcyB1bnJldHJpZXZhYmxlLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgZnVuY3Rpb24ncyBzb3VyY2UgY29kZS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldFNvdXJjZShmbiwgYWx0U291cmNlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGFsdFNvdXJjZTtcbiAgICBpZiAoaXNTdHJpbmdhYmxlKGZuKSkge1xuICAgICAgcmVzdWx0ID0gU3RyaW5nKGZuKTtcbiAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZGVjb21waWxhdGlvbikge1xuICAgICAgLy8gZXNjYXBlIHRoZSBge2AgZm9yIEZpcmVmb3ggMVxuICAgICAgcmVzdWx0ID0gKC9eW157XStcXHsoW1xcc1xcU10qKX1cXHMqJC8uZXhlYyhmbikgfHwgMClbMV07XG4gICAgfVxuICAgIC8vIHRyaW0gc3RyaW5nXG4gICAgcmVzdWx0ID0gKHJlc3VsdCB8fCAnJykucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXG4gICAgLy8gZGV0ZWN0IHN0cmluZ3MgY29udGFpbmluZyBvbmx5IHRoZSBcInVzZSBzdHJpY3RcIiBkaXJlY3RpdmVcbiAgICByZXR1cm4gL14oPzpcXC9cXCorW1xcd3xcXFddKj9cXCpcXC98XFwvXFwvLio/W1xcblxcclxcdTIwMjhcXHUyMDI5XXxcXHMpKihbXCInXSl1c2Ugc3RyaWN0XFwxOz8kLy50ZXN0KHJlc3VsdClcbiAgICAgID8gJydcbiAgICAgIDogcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNBcmd1bWVudHMoKSB7XG4gICAgLy8gbGF6eSBkZWZpbmVcbiAgICBpc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG4gICAgfTtcbiAgICBpZiAobm9Bcmd1bWVudHNDbGFzcykge1xuICAgICAgaXNBcmd1bWVudHMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gaGFzS2V5KHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAgICAgICAhKHByb3BlcnR5SXNFbnVtZXJhYmxlICYmIHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gaXNBcmd1bWVudHMoYXJndW1lbnRzWzBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gb2JqZWN0IGlzIG9mIHRoZSBzcGVjaWZpZWQgY2xhc3MuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNsYXNzLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIG9mIHRoZSBzcGVjaWZpZWQgY2xhc3MsIGVsc2UgYGZhbHNlYC5cbiAgICovXG4gIGZ1bmN0aW9uIGlzQ2xhc3NPZih2YWx1ZSwgbmFtZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICB9XG5cbiAgLyoqXG4gICAqIEhvc3Qgb2JqZWN0cyBjYW4gcmV0dXJuIHR5cGUgdmFsdWVzIHRoYXQgYXJlIGRpZmZlcmVudCBmcm9tIHRoZWlyIGFjdHVhbFxuICAgKiBkYXRhIHR5cGUuIFRoZSBvYmplY3RzIHdlIGFyZSBjb25jZXJuZWQgd2l0aCB1c3VhbGx5IHJldHVybiBub24tcHJpbWl0aXZlXG4gICAqIHR5cGVzIG9mIG9iamVjdCwgZnVuY3Rpb24sIG9yIHVua25vd24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TWl4ZWR9IG9iamVjdCBUaGUgb3duZXIgb2YgdGhlIHByb3BlcnR5LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGlzIGEgbm9uLXByaW1pdGl2ZSwgZWxzZSBgZmFsc2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNIb3N0VHlwZShvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgdmFyIHR5cGUgPSBvYmplY3QgIT0gbnVsbCA/IHR5cGVvZiBvYmplY3RbcHJvcGVydHldIDogJ251bWJlcic7XG4gICAgcmV0dXJuICEvXig/OmJvb2xlYW58bnVtYmVyfHN0cmluZ3x1bmRlZmluZWQpJC8udGVzdCh0eXBlKSAmJlxuICAgICAgKHR5cGUgPT0gJ29iamVjdCcgPyAhIW9iamVjdFtwcm9wZXJ0eV0gOiB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSBnaXZlbiBgdmFsdWVgIGlzIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3RvclxuICAgKiBhc3N1bWluZyBvYmplY3RzIGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yIGhhdmUgbm8gaW5oZXJpdGVkXG4gICAqIGVudW1lcmFibGUgcHJvcGVydGllcyBhbmQgdGhhdCB0aGVyZSBhcmUgbm8gYE9iamVjdC5wcm90b3R5cGVgIGV4dGVuc2lvbnMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgcGxhaW4gYE9iamVjdGAgb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAqL1xuICBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gICAgLy8gYXZvaWQgbm9uLW9iamVjdHMgYW5kIGZhbHNlIHBvc2l0aXZlcyBmb3IgYGFyZ3VtZW50c2Agb2JqZWN0cyBpbiBJRSA8IDlcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKCEodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKSB8fCAobm9Bcmd1bWVudHNDbGFzcyAmJiBpc0FyZ3VtZW50cyh2YWx1ZSkpKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvLyBJRSA8IDkgcHJlc2VudHMgRE9NIG5vZGVzIGFzIGBPYmplY3RgIG9iamVjdHMgZXhjZXB0IHRoZXkgaGF2ZSBgdG9TdHJpbmdgXG4gICAgLy8gbWV0aG9kcyB0aGF0IGFyZSBgdHlwZW9mYCBcInN0cmluZ1wiIGFuZCBzdGlsbCBjYW4gY29lcmNlIG5vZGVzIHRvIHN0cmluZ3MuXG4gICAgLy8gQWxzbyBjaGVjayB0aGF0IHRoZSBjb25zdHJ1Y3RvciBpcyBgT2JqZWN0YCAoaS5lLiBgT2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0YClcbiAgICB2YXIgY3RvciA9IHZhbHVlLmNvbnN0cnVjdG9yO1xuICAgIGlmICgoc3VwcG9ydC5ub2RlQ2xhc3MgfHwgISh0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgKHZhbHVlICsgJycpID09ICdzdHJpbmcnKSkgJiZcbiAgICAgICAgKCFpc0NsYXNzT2YoY3RvciwgJ0Z1bmN0aW9uJykgfHwgY3RvciBpbnN0YW5jZW9mIGN0b3IpKSB7XG4gICAgICAvLyBJbiBtb3N0IGVudmlyb25tZW50cyBhbiBvYmplY3QncyBvd24gcHJvcGVydGllcyBhcmUgaXRlcmF0ZWQgYmVmb3JlXG4gICAgICAvLyBpdHMgaW5oZXJpdGVkIHByb3BlcnRpZXMuIElmIHRoZSBsYXN0IGl0ZXJhdGVkIHByb3BlcnR5IGlzIGFuIG9iamVjdCdzXG4gICAgICAvLyBvd24gcHJvcGVydHkgdGhlbiB0aGVyZSBhcmUgbm8gaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAgICAgIGlmIChzdXBwb3J0Lml0ZXJhdGVzT3duRmlyc3QpIHtcbiAgICAgICAgZm9yUHJvcHModmFsdWUsIGZ1bmN0aW9uKHN1YlZhbHVlLCBzdWJLZXkpIHtcbiAgICAgICAgICByZXN1bHQgPSBzdWJLZXk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0ID09PSBmYWxzZSB8fCBoYXNLZXkodmFsdWUsIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICAvLyBJRSA8IDkgaXRlcmF0ZXMgaW5oZXJpdGVkIHByb3BlcnRpZXMgYmVmb3JlIG93biBwcm9wZXJ0aWVzLiBJZiB0aGUgZmlyc3RcbiAgICAgIC8vIGl0ZXJhdGVkIHByb3BlcnR5IGlzIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0eSB0aGVuIHRoZXJlIGFyZSBubyBpbmhlcml0ZWRcbiAgICAgIC8vIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAgICAgIGZvclByb3BzKHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwgc3ViS2V5KSB7XG4gICAgICAgIHJlc3VsdCA9ICFoYXNLZXkodmFsdWUsIHN1YktleSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgdmFsdWUgY2FuIGJlIHNhZmVseSBjb2VyY2VkIHRvIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgY2FuIGJlIGNvZXJjZWQsIGVsc2UgYGZhbHNlYC5cbiAgICovXG4gIGZ1bmN0aW9uIGlzU3RyaW5nYWJsZSh2YWx1ZSkge1xuICAgIHJldHVybiBoYXNLZXkodmFsdWUsICd0b1N0cmluZycpIHx8IGlzQ2xhc3NPZih2YWx1ZSwgJ1N0cmluZycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyYXBzIGEgZnVuY3Rpb24gYW5kIHBhc3NlcyBgdGhpc2AgdG8gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIGFzIHRoZVxuICAgKiBmaXJzdCBhcmd1bWVudC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGJlIHdyYXBwZWQuXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIG5ldyBmdW5jdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG1ldGhvZGl6ZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW3RoaXNdO1xuICAgICAgYXJncy5wdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG5vLW9wZXJhdGlvbiBmdW5jdGlvbi5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIG5vb3AoKSB7XG4gICAgLy8gbm8gb3BlcmF0aW9uIHBlcmZvcm1lZFxuICB9XG5cbiAgLyoqXG4gICAqIEEgd3JhcHBlciBhcm91bmQgcmVxdWlyZSgpIHRvIHN1cHByZXNzIGBtb2R1bGUgbWlzc2luZ2AgZXJyb3JzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgVGhlIG1vZHVsZSBpZC5cbiAgICogQHJldHVybnMge01peGVkfSBUaGUgZXhwb3J0ZWQgbW9kdWxlIG9yIGBudWxsYC5cbiAgICovXG4gIGZ1bmN0aW9uIHJlcShpZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZnJlZUV4cG9ydHMgJiYgZnJlZVJlcXVpcmUoaWQpO1xuICAgIH0gY2F0Y2goZSkgeyB9XG4gICAgcmV0dXJuIHJlc3VsdCB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYSBzbmlwcGV0IG9mIEphdmFTY3JpcHQgdmlhIHNjcmlwdCBpbmplY3Rpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIFRoZSBjb2RlIHRvIHJ1bi5cbiAgICovXG4gIGZ1bmN0aW9uIHJ1blNjcmlwdChjb2RlKSB7XG4gICAgdmFyIGFuY2hvciA9IGZyZWVEZWZpbmUgPyBkZWZpbmUuYW1kIDogQmVuY2htYXJrLFxuICAgICAgICBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksXG4gICAgICAgIHNpYmxpbmcgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICBwYXJlbnQgPSBzaWJsaW5nLnBhcmVudE5vZGUsXG4gICAgICAgIHByb3AgPSB1aWQgKyAncnVuU2NyaXB0JyxcbiAgICAgICAgcHJlZml4ID0gJygnICsgKGZyZWVEZWZpbmUgPyAnZGVmaW5lLmFtZC4nIDogJ0JlbmNobWFyay4nKSArIHByb3AgKyAnfHxmdW5jdGlvbigpe30pKCk7JztcblxuICAgIC8vIEZpcmVmb3ggMi4wLjAuMiBjYW5ub3QgdXNlIHNjcmlwdCBpbmplY3Rpb24gYXMgaW50ZW5kZWQgYmVjYXVzZSBpdCBleGVjdXRlc1xuICAgIC8vIGFzeW5jaHJvbm91c2x5LCBidXQgdGhhdCdzIE9LIGJlY2F1c2Ugc2NyaXB0IGluamVjdGlvbiBpcyBvbmx5IHVzZWQgdG8gYXZvaWRcbiAgICAvLyB0aGUgcHJldmlvdXNseSBjb21tZW50ZWQgSmFlZ2VyTW9ua2V5IGJ1Zy5cbiAgICB0cnkge1xuICAgICAgLy8gcmVtb3ZlIHRoZSBpbnNlcnRlZCBzY3JpcHQgKmJlZm9yZSogcnVubmluZyB0aGUgY29kZSB0byBhdm9pZCBkaWZmZXJlbmNlc1xuICAgICAgLy8gaW4gdGhlIGV4cGVjdGVkIHNjcmlwdCBlbGVtZW50IGNvdW50L29yZGVyIG9mIHRoZSBkb2N1bWVudC5cbiAgICAgIHNjcmlwdC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUocHJlZml4ICsgY29kZSkpO1xuICAgICAgYW5jaG9yW3Byb3BdID0gZnVuY3Rpb24oKSB7IGRlc3Ryb3lFbGVtZW50KHNjcmlwdCk7IH07XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBwYXJlbnQgPSBwYXJlbnQuY2xvbmVOb2RlKGZhbHNlKTtcbiAgICAgIHNpYmxpbmcgPSBudWxsO1xuICAgICAgc2NyaXB0LnRleHQgPSBjb2RlO1xuICAgIH1cbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgc2libGluZyk7XG4gICAgZGVsZXRlIGFuY2hvcltwcm9wXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGhlbHBlciBmdW5jdGlvbiBmb3Igc2V0dGluZyBvcHRpb25zL2V2ZW50IGhhbmRsZXJzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gYmVuY2ggVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25zIG9iamVjdC5cbiAgICovXG4gIGZ1bmN0aW9uIHNldE9wdGlvbnMoYmVuY2gsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gZXh0ZW5kKHt9LCBiZW5jaC5jb25zdHJ1Y3Rvci5vcHRpb25zLCBvcHRpb25zKTtcbiAgICBiZW5jaC5vcHRpb25zID0gZm9yT3duKG9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIGFkZCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgaWYgKC9eb25bQS1aXS8udGVzdChrZXkpKSB7XG4gICAgICAgICAgZm9yRWFjaChrZXkuc3BsaXQoJyAnKSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBiZW5jaC5vbihrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSwgdmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCFoYXNLZXkoYmVuY2gsIGtleSkpIHtcbiAgICAgICAgICBiZW5jaFtrZXldID0gZGVlcENsb25lKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY3ljbGluZy9jb21wbGV0aW5nIHRoZSBkZWZlcnJlZCBiZW5jaG1hcmsuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICovXG4gIGZ1bmN0aW9uIHJlc29sdmUoKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgY2xvbmUgPSBtZS5iZW5jaG1hcmssXG4gICAgICAgIGJlbmNoID0gY2xvbmUuX29yaWdpbmFsO1xuXG4gICAgaWYgKGJlbmNoLmFib3J0ZWQpIHtcbiAgICAgIC8vIGN5Y2xlKCkgLT4gY2xvbmUgY3ljbGUvY29tcGxldGUgZXZlbnQgLT4gY29tcHV0ZSgpJ3MgaW52b2tlZCBiZW5jaC5ydW4oKSBjeWNsZS9jb21wbGV0ZVxuICAgICAgbWUudGVhcmRvd24oKTtcbiAgICAgIGNsb25lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIGN5Y2xlKG1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKyttZS5jeWNsZXMgPCBjbG9uZS5jb3VudCkge1xuICAgICAgLy8gY29udGludWUgdGhlIHRlc3QgbG9vcFxuICAgICAgaWYgKHN1cHBvcnQudGltZW91dCkge1xuICAgICAgICAvLyB1c2Ugc2V0VGltZW91dCB0byBhdm9pZCBhIGNhbGwgc3RhY2sgb3ZlcmZsb3cgaWYgY2FsbGVkIHJlY3Vyc2l2ZWx5XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNsb25lLmNvbXBpbGVkLmNhbGwobWUsIHRpbWVyKTsgfSwgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbG9uZS5jb21waWxlZC5jYWxsKG1lLCB0aW1lcik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGltZXIuc3RvcChtZSk7XG4gICAgICBtZS50ZWFyZG93bigpO1xuICAgICAgZGVsYXkoY2xvbmUsIGZ1bmN0aW9uKCkgeyBjeWNsZShtZSk7IH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBBIGRlZXAgY2xvbmUgdXRpbGl0eS5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAgICogQHJldHVybnMge01peGVkfSBUaGUgY2xvbmVkIHZhbHVlLlxuICAgKi9cbiAgZnVuY3Rpb24gZGVlcENsb25lKHZhbHVlKSB7XG4gICAgdmFyIGFjY2Vzc29yLFxuICAgICAgICBjaXJjdWxhcixcbiAgICAgICAgY2xvbmUsXG4gICAgICAgIGN0b3IsXG4gICAgICAgIGRlc2NyaXB0b3IsXG4gICAgICAgIGV4dGVuc2libGUsXG4gICAgICAgIGtleSxcbiAgICAgICAgbGVuZ3RoLFxuICAgICAgICBtYXJrZXJLZXksXG4gICAgICAgIHBhcmVudCxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHN1YkluZGV4LFxuICAgICAgICBkYXRhID0geyAndmFsdWUnOiB2YWx1ZSB9LFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIG1hcmtlZCA9IFtdLFxuICAgICAgICBxdWV1ZSA9IHsgJ2xlbmd0aCc6IDAgfSxcbiAgICAgICAgdW5tYXJrZWQgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEFuIGVhc2lseSBkZXRlY3RhYmxlIGRlY29yYXRvciBmb3IgY2xvbmVkIHZhbHVlcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBNYXJrZXIob2JqZWN0KSB7XG4gICAgICB0aGlzLnJhdyA9IG9iamVjdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgdXNlZCBieSBgZm9yUHJvcHMoKWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9yUHJvcHNDYWxsYmFjayhzdWJWYWx1ZSwgc3ViS2V5KSB7XG4gICAgICAvLyBleGl0IGVhcmx5IHRvIGF2b2lkIGNsb25pbmcgdGhlIG1hcmtlclxuICAgICAgaWYgKHN1YlZhbHVlICYmIHN1YlZhbHVlLmNvbnN0cnVjdG9yID09IE1hcmtlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBhZGQgb2JqZWN0cyB0byB0aGUgcXVldWVcbiAgICAgIGlmIChzdWJWYWx1ZSA9PT0gT2JqZWN0KHN1YlZhbHVlKSkge1xuICAgICAgICBxdWV1ZVtxdWV1ZS5sZW5ndGgrK10gPSB7ICdrZXknOiBzdWJLZXksICdwYXJlbnQnOiBjbG9uZSwgJ3NvdXJjZSc6IHZhbHVlIH07XG4gICAgICB9XG4gICAgICAvLyBhc3NpZ24gbm9uLW9iamVjdHNcbiAgICAgIGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIHdpbGwgdGhyb3cgYW4gZXJyb3IgaW4gc3RyaWN0IG1vZGUgaWYgdGhlIHByb3BlcnR5IGlzIHJlYWQtb25seVxuICAgICAgICAgIGNsb25lW3N1YktleV0gPSBzdWJWYWx1ZTtcbiAgICAgICAgfSBjYXRjaChlKSB7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFuIGF2YWlsYWJsZSBtYXJrZXIga2V5IGZvciB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE1hcmtlcktleShvYmplY3QpIHtcbiAgICAgIC8vIGF2b2lkIGNvbGxpc2lvbnMgd2l0aCBleGlzdGluZyBrZXlzXG4gICAgICB2YXIgcmVzdWx0ID0gdWlkO1xuICAgICAgd2hpbGUgKG9iamVjdFtyZXN1bHRdICYmIG9iamVjdFtyZXN1bHRdLmNvbnN0cnVjdG9yICE9IE1hcmtlcikge1xuICAgICAgICByZXN1bHQgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAga2V5ID0gZGF0YS5rZXk7XG4gICAgICBwYXJlbnQgPSBkYXRhLnBhcmVudDtcbiAgICAgIHNvdXJjZSA9IGRhdGEuc291cmNlO1xuICAgICAgY2xvbmUgPSB2YWx1ZSA9IHNvdXJjZSA/IHNvdXJjZVtrZXldIDogZGF0YS52YWx1ZTtcbiAgICAgIGFjY2Vzc29yID0gY2lyY3VsYXIgPSBkZXNjcmlwdG9yID0gZmFsc2U7XG5cbiAgICAgIC8vIGNyZWF0ZSBhIGJhc2ljIGNsb25lIHRvIGZpbHRlciBvdXQgZnVuY3Rpb25zLCBET00gZWxlbWVudHMsIGFuZFxuICAgICAgLy8gb3RoZXIgbm9uIGBPYmplY3RgIG9iamVjdHNcbiAgICAgIGlmICh2YWx1ZSA9PT0gT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAvLyB1c2UgY3VzdG9tIGRlZXAgY2xvbmUgZnVuY3Rpb24gaWYgYXZhaWxhYmxlXG4gICAgICAgIGlmIChpc0NsYXNzT2YodmFsdWUuZGVlcENsb25lLCAnRnVuY3Rpb24nKSkge1xuICAgICAgICAgIGNsb25lID0gdmFsdWUuZGVlcENsb25lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3RvciA9IHZhbHVlLmNvbnN0cnVjdG9yO1xuICAgICAgICAgIHN3aXRjaCAodG9TdHJpbmcuY2FsbCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzpcbiAgICAgICAgICAgICAgY2xvbmUgPSBuZXcgY3Rvcih2YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgICAgICAgIGNsb25lID0gbmV3IGN0b3IodmFsdWUgPT0gdHJ1ZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgICAgICAgICAgY2xvbmUgPSBuZXcgY3RvcigrdmFsdWUpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgICAgICAgICAgaXNQbGFpbk9iamVjdCh2YWx1ZSkgJiYgKGNsb25lID0ge30pO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgICAgICAgIGNsb25lID0gbmV3IGN0b3IodmFsdWUpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgICAgICAgICAgY2xvbmUgPSBjdG9yKHZhbHVlLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAodmFsdWUuZ2xvYmFsICAgICA/ICdnJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKHZhbHVlLmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICh2YWx1ZS5tdWx0aWxpbmUgID8gJ20nIDogJycpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29udGludWUgY2xvbmUgaWYgYHZhbHVlYCBkb2Vzbid0IGhhdmUgYW4gYWNjZXNzb3IgZGVzY3JpcHRvclxuICAgICAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g4LjEwLjFcbiAgICAgICAgaWYgKGNsb25lICYmIGNsb25lICE9IHZhbHVlICYmXG4gICAgICAgICAgICAhKGRlc2NyaXB0b3IgPSBzb3VyY2UgJiYgc3VwcG9ydC5kZXNjcmlwdG9ycyAmJiBnZXREZXNjcmlwdG9yKHNvdXJjZSwga2V5KSxcbiAgICAgICAgICAgICAgYWNjZXNzb3IgPSBkZXNjcmlwdG9yICYmIChkZXNjcmlwdG9yLmdldCB8fCBkZXNjcmlwdG9yLnNldCkpKSB7XG4gICAgICAgICAgLy8gdXNlIGFuIGV4aXN0aW5nIGNsb25lIChjaXJjdWxhciByZWZlcmVuY2UpXG4gICAgICAgICAgaWYgKChleHRlbnNpYmxlID0gaXNFeHRlbnNpYmxlKHZhbHVlKSkpIHtcbiAgICAgICAgICAgIG1hcmtlcktleSA9IGdldE1hcmtlcktleSh2YWx1ZSk7XG4gICAgICAgICAgICBpZiAodmFsdWVbbWFya2VyS2V5XSkge1xuICAgICAgICAgICAgICBjaXJjdWxhciA9IGNsb25lID0gdmFsdWVbbWFya2VyS2V5XS5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGZvciBmcm96ZW4vc2VhbGVkIG9iamVjdHNcbiAgICAgICAgICAgIGZvciAoc3ViSW5kZXggPSAwLCBsZW5ndGggPSB1bm1hcmtlZC5sZW5ndGg7IHN1YkluZGV4IDwgbGVuZ3RoOyBzdWJJbmRleCsrKSB7XG4gICAgICAgICAgICAgIGRhdGEgPSB1bm1hcmtlZFtzdWJJbmRleF07XG4gICAgICAgICAgICAgIGlmIChkYXRhLm9iamVjdCA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjaXJjdWxhciA9IGNsb25lID0gZGF0YS5jbG9uZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWNpcmN1bGFyKSB7XG4gICAgICAgICAgICAvLyBtYXJrIG9iamVjdCB0byBhbGxvdyBxdWlja2x5IGRldGVjdGluZyBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCB0aWUgaXQgdG8gaXRzIGNsb25lXG4gICAgICAgICAgICBpZiAoZXh0ZW5zaWJsZSkge1xuICAgICAgICAgICAgICB2YWx1ZVttYXJrZXJLZXldID0gbmV3IE1hcmtlcihjbG9uZSk7XG4gICAgICAgICAgICAgIG1hcmtlZC5wdXNoKHsgJ2tleSc6IG1hcmtlcktleSwgJ29iamVjdCc6IHZhbHVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gZm9yIGZyb3plbi9zZWFsZWQgb2JqZWN0c1xuICAgICAgICAgICAgICB1bm1hcmtlZC5wdXNoKHsgJ2Nsb25lJzogY2xvbmUsICdvYmplY3QnOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgb3ZlciBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICAgICAgZm9yUHJvcHModmFsdWUsIGZvclByb3BzQ2FsbGJhY2ssIHsgJ3doaWNoJzogJ2FsbCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIC8vIGZvciBjdXN0b20gcHJvcGVydHkgZGVzY3JpcHRvcnNcbiAgICAgICAgaWYgKGFjY2Vzc29yIHx8IChkZXNjcmlwdG9yICYmICEoZGVzY3JpcHRvci5jb25maWd1cmFibGUgJiYgZGVzY3JpcHRvci5lbnVtZXJhYmxlICYmIGRlc2NyaXB0b3Iud3JpdGFibGUpKSkge1xuICAgICAgICAgIGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBjbG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0RGVzY3JpcHRvcihwYXJlbnQsIGtleSwgZGVzY3JpcHRvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9yIGRlZmF1bHQgcHJvcGVydHkgZGVzY3JpcHRvcnNcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcGFyZW50W2tleV0gPSBjbG9uZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gY2xvbmU7XG4gICAgICB9XG4gICAgfSB3aGlsZSAoKGRhdGEgPSBxdWV1ZVtpbmRleCsrXSkpO1xuXG4gICAgLy8gcmVtb3ZlIG1hcmtlcnNcbiAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gbWFya2VkLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGRhdGEgPSBtYXJrZWRbaW5kZXhdO1xuICAgICAgZGVsZXRlIGRhdGEub2JqZWN0W2RhdGEua2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpdGVyYXRpb24gdXRpbGl0eSBmb3IgYXJyYXlzIGFuZCBvYmplY3RzLlxuICAgKiBDYWxsYmFja3MgbWF5IHRlcm1pbmF0ZSB0aGUgbG9vcCBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgKiBAcGFyYW0ge01peGVkfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBmb3IgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIHRoZSBvYmplY3QgaXRlcmF0ZWQgb3Zlci5cbiAgICovXG4gIGZ1bmN0aW9uIGVhY2gob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIHZhciByZXN1bHQgPSBvYmplY3Q7XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG5cbiAgICB2YXIgZm4gPSBjYWxsYmFjayxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgaXNTbmFwc2hvdCA9ICEhKG9iamVjdC5zbmFwc2hvdEl0ZW0gJiYgKGxlbmd0aCA9IG9iamVjdC5zbmFwc2hvdExlbmd0aCkpLFxuICAgICAgICBpc1NwbGl0dGFibGUgPSAobm9DaGFyQnlJbmRleCB8fCBub0NoYXJCeU93bkluZGV4KSAmJiBpc0NsYXNzT2Yob2JqZWN0LCAnU3RyaW5nJyksXG4gICAgICAgIGlzQ29udmVydGFibGUgPSBpc1NuYXBzaG90IHx8IGlzU3BsaXR0YWJsZSB8fCAnaXRlbScgaW4gb2JqZWN0LFxuICAgICAgICBvcmlnT2JqZWN0ID0gb2JqZWN0O1xuXG4gICAgLy8gaW4gT3BlcmEgPCAxMC41IGBoYXNLZXkob2JqZWN0LCAnbGVuZ3RoJylgIHJldHVybnMgYGZhbHNlYCBmb3IgTm9kZUxpc3RzXG4gICAgaWYgKGxlbmd0aCA9PT0gbGVuZ3RoID4+PiAwKSB7XG4gICAgICBpZiAoaXNDb252ZXJ0YWJsZSkge1xuICAgICAgICAvLyB0aGUgdGhpcmQgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrIGlzIHRoZSBvcmlnaW5hbCBub24tYXJyYXkgb2JqZWN0XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgdmFsdWUsIGluZGV4LCBvcmlnT2JqZWN0KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gaW4gSUUgPCA5IHN0cmluZ3MgZG9uJ3Qgc3VwcG9ydCBhY2Nlc3NpbmcgY2hhcmFjdGVycyBieSBpbmRleFxuICAgICAgICBpZiAoaXNTcGxpdHRhYmxlKSB7XG4gICAgICAgICAgb2JqZWN0ID0gb2JqZWN0LnNwbGl0KCcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmplY3QgPSBbXTtcbiAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgLy8gaW4gU2FmYXJpIDIgYGluZGV4IGluIG9iamVjdGAgaXMgYWx3YXlzIGBmYWxzZWAgZm9yIE5vZGVMaXN0c1xuICAgICAgICAgICAgb2JqZWN0W2luZGV4XSA9IGlzU25hcHNob3QgPyByZXN1bHQuc25hcHNob3RJdGVtKGluZGV4KSA6IHJlc3VsdFtpbmRleF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3JFYWNoKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3JPd24ob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGVudW1lcmFibGUgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2Uocykgb2JqZWN0IHRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gZGVzdGluYXRpb24gVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtzb3VyY2U9e31dIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZnVuY3Rpb24gZXh0ZW5kKGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgICAvLyBDaHJvbWUgPCAxNCBpbmNvcnJlY3RseSBzZXRzIGBkZXN0aW5hdGlvbmAgdG8gYHVuZGVmaW5lZGAgd2hlbiB3ZSBgZGVsZXRlIGFyZ3VtZW50c1swXWBcbiAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD04MzlcbiAgICB2YXIgcmVzdWx0ID0gZGVzdGluYXRpb247XG4gICAgZGVsZXRlIGFyZ3VtZW50c1swXTtcblxuICAgIGZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGZvclByb3BzKHNvdXJjZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgYEFycmF5I2ZpbHRlcmAgbGlrZSBtZXRob2QuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uL2FsaWFzIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgKiBAcGFyYW0ge01peGVkfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBmb3IgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyB0aGF0IHBhc3NlZCBjYWxsYmFjayBmaWx0ZXIuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGdldCBvZGQgbnVtYmVyc1xuICAgKiBCZW5jaG1hcmsuZmlsdGVyKFsxLCAyLCAzLCA0LCA1XSwgZnVuY3Rpb24obikge1xuICAgKiAgIHJldHVybiBuICUgMjtcbiAgICogfSk7IC8vIC0+IFsxLCAzLCA1XTtcbiAgICpcbiAgICogLy8gZ2V0IGZhc3Rlc3QgYmVuY2htYXJrc1xuICAgKiBCZW5jaG1hcmsuZmlsdGVyKGJlbmNoZXMsICdmYXN0ZXN0Jyk7XG4gICAqXG4gICAqIC8vIGdldCBzbG93ZXN0IGJlbmNobWFya3NcbiAgICogQmVuY2htYXJrLmZpbHRlcihiZW5jaGVzLCAnc2xvd2VzdCcpO1xuICAgKlxuICAgKiAvLyBnZXQgYmVuY2htYXJrcyB0aGF0IGNvbXBsZXRlZCB3aXRob3V0IGVycm9yaW5nXG4gICAqIEJlbmNobWFyay5maWx0ZXIoYmVuY2hlcywgJ3N1Y2Nlc3NmdWwnKTtcbiAgICovXG4gIGZ1bmN0aW9uIGZpbHRlcihhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKGNhbGxiYWNrID09ICdzdWNjZXNzZnVsJykge1xuICAgICAgLy8gY2FsbGJhY2sgdG8gZXhjbHVkZSB0aG9zZSB0aGF0IGFyZSBlcnJvcmVkLCB1bnJ1biwgb3IgaGF2ZSBoeiBvZiBJbmZpbml0eVxuICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbihiZW5jaCkgeyByZXR1cm4gYmVuY2guY3ljbGVzICYmIGlzRmluaXRlKGJlbmNoLmh6KTsgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gJ2Zhc3Rlc3QnIHx8IGNhbGxiYWNrID09ICdzbG93ZXN0Jykge1xuICAgICAgLy8gZ2V0IHN1Y2Nlc3NmdWwsIHNvcnQgYnkgcGVyaW9kICsgbWFyZ2luIG9mIGVycm9yLCBhbmQgZmlsdGVyIGZhc3Rlc3Qvc2xvd2VzdFxuICAgICAgcmVzdWx0ID0gZmlsdGVyKGFycmF5LCAnc3VjY2Vzc2Z1bCcpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBhID0gYS5zdGF0czsgYiA9IGIuc3RhdHM7XG4gICAgICAgIHJldHVybiAoYS5tZWFuICsgYS5tb2UgPiBiLm1lYW4gKyBiLm1vZSA/IDEgOiAtMSkgKiAoY2FsbGJhY2sgPT0gJ2Zhc3Rlc3QnID8gMSA6IC0xKTtcbiAgICAgIH0pO1xuICAgICAgcmVzdWx0ID0gZmlsdGVyKHJlc3VsdCwgZnVuY3Rpb24oYmVuY2gpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdFswXS5jb21wYXJlKGJlbmNoKSA9PSAwO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgfHwgcmVkdWNlKGFycmF5LCBmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBhcnJheSkgPyAocmVzdWx0LnB1c2godmFsdWUpLCByZXN1bHQpIDogcmVzdWx0O1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgYEFycmF5I2ZvckVhY2hgIGxpa2UgbWV0aG9kLlxuICAgKiBDYWxsYmFja3MgbWF5IHRlcm1pbmF0ZSB0aGUgbG9vcCBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgKiBAcGFyYW0ge01peGVkfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBmb3IgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IGl0ZXJhdGVkIG92ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBmb3JFYWNoKGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSAoYXJyYXkgPSBPYmplY3QoYXJyYXkpKS5sZW5ndGggPj4+IDA7XG5cbiAgICBpZiAodGhpc0FyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjYWxsYmFjayA9IGJpbmQoY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgIH1cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKGluZGV4IGluIGFycmF5ICYmXG4gICAgICAgICAgY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGVzIG92ZXIgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMsIGV4ZWN1dGluZyB0aGUgYGNhbGxiYWNrYCBmb3IgZWFjaC5cbiAgICogQ2FsbGJhY2tzIG1heSB0ZXJtaW5hdGUgdGhlIGxvb3AgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBleGVjdXRlZCBwZXIgb3duIHByb3BlcnR5LlxuICAgKiBAcGFyYW0ge01peGVkfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBmb3IgdGhlIGNhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBvYmplY3QgaXRlcmF0ZWQgb3Zlci5cbiAgICovXG4gIGZ1bmN0aW9uIGZvck93bihvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgcmV0dXJuIGZvclByb3BzKG9iamVjdCwgY2FsbGJhY2ssIHsgJ2JpbmQnOiB0aGlzQXJnLCAnd2hpY2gnOiAnb3duJyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG51bWJlciB0byBhIG1vcmUgcmVhZGFibGUgY29tbWEtc2VwYXJhdGVkIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXIgVGhlIG51bWJlciB0byBjb252ZXJ0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbW9yZSByZWFkYWJsZSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBmb3JtYXROdW1iZXIobnVtYmVyKSB7XG4gICAgbnVtYmVyID0gU3RyaW5nKG51bWJlcikuc3BsaXQoJy4nKTtcbiAgICByZXR1cm4gbnVtYmVyWzBdLnJlcGxhY2UoLyg/PSg/OlxcZHszfSkrJCkoPyFcXGIpL2csICcsJykgK1xuICAgICAgKG51bWJlclsxXSA/ICcuJyArIG51bWJlclsxXSA6ICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gb2JqZWN0IGhhcyB0aGUgc3BlY2lmaWVkIGtleSBhcyBhIGRpcmVjdCBwcm9wZXJ0eS5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjaGVjay5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrIGZvci5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGtleSBpcyBhIGRpcmVjdCBwcm9wZXJ0eSwgZWxzZSBgZmFsc2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gaGFzS2V5KCkge1xuICAgIC8vIGxhenkgZGVmaW5lIGZvciB3b3JzdCBjYXNlIGZhbGxiYWNrIChub3QgYXMgYWNjdXJhdGUpXG4gICAgaGFzS2V5ID0gZnVuY3Rpb24ob2JqZWN0LCBrZXkpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBvYmplY3QgIT0gbnVsbCAmJiAob2JqZWN0LmNvbnN0cnVjdG9yIHx8IE9iamVjdCkucHJvdG90eXBlO1xuICAgICAgcmV0dXJuICEhcGFyZW50ICYmIGtleSBpbiBPYmplY3Qob2JqZWN0KSAmJiAhKGtleSBpbiBwYXJlbnQgJiYgb2JqZWN0W2tleV0gPT09IHBhcmVudFtrZXldKTtcbiAgICB9O1xuICAgIC8vIGZvciBtb2Rlcm4gYnJvd3NlcnNcbiAgICBpZiAoaXNDbGFzc09mKGhhc093blByb3BlcnR5LCAnRnVuY3Rpb24nKSkge1xuICAgICAgaGFzS2V5ID0gZnVuY3Rpb24ob2JqZWN0LCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgLy8gZm9yIFNhZmFyaSAyXG4gICAgZWxzZSBpZiAoe30uX19wcm90b19fID09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgIGhhc0tleSA9IGZ1bmN0aW9uKG9iamVjdCwga2V5KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgICAgICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgICAgICAgb2JqZWN0Ll9fcHJvdG9fXyA9IFtvYmplY3QuX19wcm90b19fLCBvYmplY3QuX19wcm90b19fID0gbnVsbCwgcmVzdWx0ID0ga2V5IGluIG9iamVjdF1bMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBoYXNLZXkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgYEFycmF5I2luZGV4T2ZgIGxpa2UgbWV0aG9kLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzdGFydCBzZWFyY2hpbmcgZnJvbS5cbiAgICogQHJldHVybnMge051bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlIG9yIGAtMWAuXG4gICAqL1xuICBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gICAgdmFyIGluZGV4ID0gdG9JbnRlZ2VyKGZyb21JbmRleCksXG4gICAgICAgIGxlbmd0aCA9IChhcnJheSA9IE9iamVjdChhcnJheSkpLmxlbmd0aCA+Pj4gMDtcblxuICAgIGluZGV4ID0gKGluZGV4IDwgMCA/IG1heCgwLCBsZW5ndGggKyBpbmRleCkgOiBpbmRleCkgLSAxO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoaW5kZXggaW4gYXJyYXkgJiYgdmFsdWUgPT09IGFycmF5W2luZGV4XSkge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZnkgYSBzdHJpbmcgYnkgcmVwbGFjaW5nIG5hbWVkIHRva2VucyB3aXRoIG1hdGNoaW5nIG9iamVjdCBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gbW9kaWZ5LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSB0ZW1wbGF0ZSBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBtb2RpZmllZCBzdHJpbmcuXG4gICAqL1xuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShzdHJpbmcsIG9iamVjdCkge1xuICAgIGZvck93bihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIC8vIGVzY2FwZSByZWdleHAgc3BlY2lhbCBjaGFyYWN0ZXJzIGluIGBrZXlgXG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShSZWdFeHAoJyNcXFxceycgKyBrZXkucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpICsgJ1xcXFx9JywgJ2cnKSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyBhIG1ldGhvZCBvbiBhbGwgaXRlbXMgaW4gYW4gYXJyYXkuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge0FycmF5fSBiZW5jaGVzIEFycmF5IG9mIGJlbmNobWFya3MgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBpbnZva2UgT1Igb3B0aW9ucyBvYmplY3QuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IFthcmcxLCBhcmcyLCAuLi5dIEFyZ3VtZW50cyB0byBpbnZva2UgdGhlIG1ldGhvZCB3aXRoLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBmcm9tIGVhY2ggbWV0aG9kIGludm9rZWQuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGludm9rZSBgcmVzZXRgIG9uIGFsbCBiZW5jaG1hcmtzXG4gICAqIEJlbmNobWFyay5pbnZva2UoYmVuY2hlcywgJ3Jlc2V0Jyk7XG4gICAqXG4gICAqIC8vIGludm9rZSBgZW1pdGAgd2l0aCBhcmd1bWVudHNcbiAgICogQmVuY2htYXJrLmludm9rZShiZW5jaGVzLCAnZW1pdCcsICdjb21wbGV0ZScsIGxpc3RlbmVyKTtcbiAgICpcbiAgICogLy8gaW52b2tlIGBydW4odHJ1ZSlgLCB0cmVhdCBiZW5jaG1hcmtzIGFzIGEgcXVldWUsIGFuZCByZWdpc3RlciBpbnZva2UgY2FsbGJhY2tzXG4gICAqIEJlbmNobWFyay5pbnZva2UoYmVuY2hlcywge1xuICAgKlxuICAgKiAgIC8vIGludm9rZSB0aGUgYHJ1bmAgbWV0aG9kXG4gICAqICAgJ25hbWUnOiAncnVuJyxcbiAgICpcbiAgICogICAvLyBwYXNzIGEgc2luZ2xlIGFyZ3VtZW50XG4gICAqICAgJ2FyZ3MnOiB0cnVlLFxuICAgKlxuICAgKiAgIC8vIHRyZWF0IGFzIHF1ZXVlLCByZW1vdmluZyBiZW5jaG1hcmtzIGZyb20gZnJvbnQgb2YgYGJlbmNoZXNgIHVudGlsIGVtcHR5XG4gICAqICAgJ3F1ZXVlZCc6IHRydWUsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIGJlZm9yZSBhbnkgYmVuY2htYXJrcyBoYXZlIGJlZW4gaW52b2tlZC5cbiAgICogICAnb25TdGFydCc6IG9uU3RhcnQsXG4gICAqXG4gICAqICAgLy8gY2FsbGVkIGJldHdlZW4gaW52b2tpbmcgYmVuY2htYXJrc1xuICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICpcbiAgICogICAvLyBjYWxsZWQgYWZ0ZXIgYWxsIGJlbmNobWFya3MgaGF2ZSBiZWVuIGludm9rZWQuXG4gICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gaW52b2tlKGJlbmNoZXMsIG5hbWUpIHtcbiAgICB2YXIgYXJncyxcbiAgICAgICAgYmVuY2gsXG4gICAgICAgIHF1ZXVlZCxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgZXZlbnRQcm9wcyA9IHsgJ2N1cnJlbnRUYXJnZXQnOiBiZW5jaGVzIH0sXG4gICAgICAgIG9wdGlvbnMgPSB7ICdvblN0YXJ0Jzogbm9vcCwgJ29uQ3ljbGUnOiBub29wLCAnb25Db21wbGV0ZSc6IG5vb3AgfSxcbiAgICAgICAgcmVzdWx0ID0gbWFwKGJlbmNoZXMsIGZ1bmN0aW9uKGJlbmNoKSB7IHJldHVybiBiZW5jaDsgfSk7XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIHRoZSBtZXRob2Qgb2YgdGhlIGN1cnJlbnQgb2JqZWN0IGFuZCBpZiBzeW5jaHJvbm91cywgZmV0Y2hlcyB0aGUgbmV4dC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBleGVjdXRlKCkge1xuICAgICAgdmFyIGxpc3RlbmVycyxcbiAgICAgICAgICBhc3luYyA9IGlzQXN5bmMoYmVuY2gpO1xuXG4gICAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgLy8gdXNlIGBnZXROZXh0YCBhcyB0aGUgZmlyc3QgbGlzdGVuZXJcbiAgICAgICAgYmVuY2gub24oJ2NvbXBsZXRlJywgZ2V0TmV4dCk7XG4gICAgICAgIGxpc3RlbmVycyA9IGJlbmNoLmV2ZW50cy5jb21wbGV0ZTtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZSgwLCAwLCBsaXN0ZW5lcnMucG9wKCkpO1xuICAgICAgfVxuICAgICAgLy8gZXhlY3V0ZSBtZXRob2RcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBpc0NsYXNzT2YoYmVuY2ggJiYgYmVuY2hbbmFtZV0sICdGdW5jdGlvbicpID8gYmVuY2hbbmFtZV0uYXBwbHkoYmVuY2gsIGFyZ3MpIDogdW5kZWZpbmVkO1xuICAgICAgLy8gaWYgc3luY2hyb25vdXMgcmV0dXJuIHRydWUgdW50aWwgZmluaXNoZWRcbiAgICAgIHJldHVybiAhYXN5bmMgJiYgZ2V0TmV4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZldGNoZXMgdGhlIG5leHQgYmVuY2ggb3IgZXhlY3V0ZXMgYG9uQ29tcGxldGVgIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE5leHQoZXZlbnQpIHtcbiAgICAgIHZhciBjeWNsZUV2ZW50LFxuICAgICAgICAgIGxhc3QgPSBiZW5jaCxcbiAgICAgICAgICBhc3luYyA9IGlzQXN5bmMobGFzdCk7XG5cbiAgICAgIGlmIChhc3luYykge1xuICAgICAgICBsYXN0Lm9mZignY29tcGxldGUnLCBnZXROZXh0KTtcbiAgICAgICAgbGFzdC5lbWl0KCdjb21wbGV0ZScpO1xuICAgICAgfVxuICAgICAgLy8gZW1pdCBcImN5Y2xlXCIgZXZlbnRcbiAgICAgIGV2ZW50UHJvcHMudHlwZSA9ICdjeWNsZSc7XG4gICAgICBldmVudFByb3BzLnRhcmdldCA9IGxhc3Q7XG4gICAgICBjeWNsZUV2ZW50ID0gRXZlbnQoZXZlbnRQcm9wcyk7XG4gICAgICBvcHRpb25zLm9uQ3ljbGUuY2FsbChiZW5jaGVzLCBjeWNsZUV2ZW50KTtcblxuICAgICAgLy8gY2hvb3NlIG5leHQgYmVuY2htYXJrIGlmIG5vdCBleGl0aW5nIGVhcmx5XG4gICAgICBpZiAoIWN5Y2xlRXZlbnQuYWJvcnRlZCAmJiByYWlzZUluZGV4KCkgIT09IGZhbHNlKSB7XG4gICAgICAgIGJlbmNoID0gcXVldWVkID8gYmVuY2hlc1swXSA6IHJlc3VsdFtpbmRleF07XG4gICAgICAgIGlmIChpc0FzeW5jKGJlbmNoKSkge1xuICAgICAgICAgIGRlbGF5KGJlbmNoLCBleGVjdXRlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3luYykge1xuICAgICAgICAgIC8vIHJlc3VtZSBleGVjdXRpb24gaWYgcHJldmlvdXNseSBhc3luY2hyb25vdXMgYnV0IG5vdyBzeW5jaHJvbm91c1xuICAgICAgICAgIHdoaWxlIChleGVjdXRlKCkpIHsgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGNvbnRpbnVlIHN5bmNocm9ub3VzIGV4ZWN1dGlvblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbWl0IFwiY29tcGxldGVcIiBldmVudFxuICAgICAgICBldmVudFByb3BzLnR5cGUgPSAnY29tcGxldGUnO1xuICAgICAgICBvcHRpb25zLm9uQ29tcGxldGUuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG4gICAgICB9XG4gICAgICAvLyBXaGVuIHVzZWQgYXMgYSBsaXN0ZW5lciBgZXZlbnQuYWJvcnRlZCA9IHRydWVgIHdpbGwgY2FuY2VsIHRoZSByZXN0IG9mXG4gICAgICAvLyB0aGUgXCJjb21wbGV0ZVwiIGxpc3RlbmVycyBiZWNhdXNlIHRoZXkgd2VyZSBhbHJlYWR5IGNhbGxlZCBhYm92ZSBhbmQgd2hlblxuICAgICAgLy8gdXNlZCBhcyBwYXJ0IG9mIGBnZXROZXh0YCB0aGUgYHJldHVybiBmYWxzZWAgd2lsbCBleGl0IHRoZSBleGVjdXRpb24gd2hpbGUtbG9vcC5cbiAgICAgIGlmIChldmVudCkge1xuICAgICAgICBldmVudC5hYm9ydGVkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgaW52b2tpbmcgYEJlbmNobWFyayNydW5gIHdpdGggYXN5bmNocm9ub3VzIGN5Y2xlcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0FzeW5jKG9iamVjdCkge1xuICAgICAgLy8gYXZvaWQgdXNpbmcgYGluc3RhbmNlb2ZgIGhlcmUgYmVjYXVzZSBvZiBJRSBtZW1vcnkgbGVhayBpc3N1ZXMgd2l0aCBob3N0IG9iamVjdHNcbiAgICAgIHZhciBhc3luYyA9IGFyZ3NbMF0gJiYgYXJnc1swXS5hc3luYztcbiAgICAgIHJldHVybiBPYmplY3Qob2JqZWN0KS5jb25zdHJ1Y3RvciA9PSBCZW5jaG1hcmsgJiYgbmFtZSA9PSAncnVuJyAmJlxuICAgICAgICAoKGFzeW5jID09IG51bGwgPyBvYmplY3Qub3B0aW9ucy5hc3luYyA6IGFzeW5jKSAmJiBzdXBwb3J0LnRpbWVvdXQgfHwgb2JqZWN0LmRlZmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSYWlzZXMgYGluZGV4YCB0byB0aGUgbmV4dCBkZWZpbmVkIGluZGV4IG9yIHJldHVybnMgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByYWlzZUluZGV4KCkge1xuICAgICAgdmFyIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG4gICAgICBpZiAocXVldWVkKSB7XG4gICAgICAgIC8vIGlmIHF1ZXVlZCByZW1vdmUgdGhlIHByZXZpb3VzIGJlbmNoIGFuZCBzdWJzZXF1ZW50IHNraXBwZWQgbm9uLWVudHJpZXNcbiAgICAgICAgZG8ge1xuICAgICAgICAgICsraW5kZXggPiAwICYmIHNoaWZ0LmNhbGwoYmVuY2hlcyk7XG4gICAgICAgIH0gd2hpbGUgKChsZW5ndGggPSBiZW5jaGVzLmxlbmd0aCkgJiYgISgnMCcgaW4gYmVuY2hlcykpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoICYmICEoaW5kZXggaW4gcmVzdWx0KSkgeyB9XG4gICAgICB9XG4gICAgICAvLyBpZiB3ZSByZWFjaGVkIHRoZSBsYXN0IGluZGV4IHRoZW4gcmV0dXJuIGBmYWxzZWBcbiAgICAgIHJldHVybiAocXVldWVkID8gbGVuZ3RoIDogaW5kZXggPCBsZW5ndGgpID8gaW5kZXggOiAoaW5kZXggPSBmYWxzZSk7XG4gICAgfVxuXG4gICAgLy8ganVnZ2xlIGFyZ3VtZW50c1xuICAgIGlmIChpc0NsYXNzT2YobmFtZSwgJ1N0cmluZycpKSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAoYXJyYXksIG5hbWUpXG4gICAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyAyIGFyZ3VtZW50cyAoYXJyYXksIG9wdGlvbnMpXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKG9wdGlvbnMsIG5hbWUpO1xuICAgICAgbmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIGFyZ3MgPSBpc0NsYXNzT2YoYXJncyA9ICdhcmdzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5hcmdzIDogW10sICdBcnJheScpID8gYXJncyA6IFthcmdzXTtcbiAgICAgIHF1ZXVlZCA9IG9wdGlvbnMucXVldWVkO1xuICAgIH1cblxuICAgIC8vIHN0YXJ0IGl0ZXJhdGluZyBvdmVyIHRoZSBhcnJheVxuICAgIGlmIChyYWlzZUluZGV4KCkgIT09IGZhbHNlKSB7XG4gICAgICAvLyBlbWl0IFwic3RhcnRcIiBldmVudFxuICAgICAgYmVuY2ggPSByZXN1bHRbaW5kZXhdO1xuICAgICAgZXZlbnRQcm9wcy50eXBlID0gJ3N0YXJ0JztcbiAgICAgIGV2ZW50UHJvcHMudGFyZ2V0ID0gYmVuY2g7XG4gICAgICBvcHRpb25zLm9uU3RhcnQuY2FsbChiZW5jaGVzLCBFdmVudChldmVudFByb3BzKSk7XG5cbiAgICAgIC8vIGVuZCBlYXJseSBpZiB0aGUgc3VpdGUgd2FzIGFib3J0ZWQgaW4gYW4gXCJvblN0YXJ0XCIgbGlzdGVuZXJcbiAgICAgIGlmIChiZW5jaGVzLmFib3J0ZWQgJiYgYmVuY2hlcy5jb25zdHJ1Y3RvciA9PSBTdWl0ZSAmJiBuYW1lID09ICdydW4nKSB7XG4gICAgICAgIC8vIGVtaXQgXCJjeWNsZVwiIGV2ZW50XG4gICAgICAgIGV2ZW50UHJvcHMudHlwZSA9ICdjeWNsZSc7XG4gICAgICAgIG9wdGlvbnMub25DeWNsZS5jYWxsKGJlbmNoZXMsIEV2ZW50KGV2ZW50UHJvcHMpKTtcbiAgICAgICAgLy8gZW1pdCBcImNvbXBsZXRlXCIgZXZlbnRcbiAgICAgICAgZXZlbnRQcm9wcy50eXBlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgb3B0aW9ucy5vbkNvbXBsZXRlLmNhbGwoYmVuY2hlcywgRXZlbnQoZXZlbnRQcm9wcykpO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBzdGFydFxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChpc0FzeW5jKGJlbmNoKSkge1xuICAgICAgICAgIGRlbGF5KGJlbmNoLCBleGVjdXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aGlsZSAoZXhlY3V0ZSgpKSB7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBzdHJpbmcgb2Ygam9pbmVkIGFycmF5IHZhbHVlcyBvciBvYmplY3Qga2V5LXZhbHVlIHBhaXJzLlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG9wZXJhdGUgb24uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbc2VwYXJhdG9yMT0nLCddIFRoZSBzZXBhcmF0b3IgdXNlZCBiZXR3ZWVuIGtleS12YWx1ZSBwYWlycy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtzZXBhcmF0b3IyPSc6ICddIFRoZSBzZXBhcmF0b3IgdXNlZCBiZXR3ZWVuIGtleXMgYW5kIHZhbHVlcy5cbiAgICogQHJldHVybnMge1N0cmluZ30gVGhlIGpvaW5lZCByZXN1bHQuXG4gICAqL1xuICBmdW5jdGlvbiBqb2luKG9iamVjdCwgc2VwYXJhdG9yMSwgc2VwYXJhdG9yMikge1xuICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgbGVuZ3RoID0gKG9iamVjdCA9IE9iamVjdChvYmplY3QpKS5sZW5ndGgsXG4gICAgICAgIGFycmF5TGlrZSA9IGxlbmd0aCA9PT0gbGVuZ3RoID4+PiAwO1xuXG4gICAgc2VwYXJhdG9yMiB8fCAoc2VwYXJhdG9yMiA9ICc6ICcpO1xuICAgIGVhY2gob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICByZXN1bHQucHVzaChhcnJheUxpa2UgPyB2YWx1ZSA6IGtleSArIHNlcGFyYXRvcjIgKyB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKHNlcGFyYXRvcjEgfHwgJywnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgbGlrZSBtZXRob2QuXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIGZvciB0aGUgY2FsbGJhY2suXG4gICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjay5cbiAgICovXG4gIGZ1bmN0aW9uIG1hcChhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gcmVkdWNlKGFycmF5LCBmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBhcnJheSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIEFycmF5KE9iamVjdChhcnJheSkubGVuZ3RoID4+PiAwKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBwcm9wZXJ0eSBmcm9tIGFsbCBpdGVtcyBpbiBhbiBhcnJheS5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gcGx1Y2suXG4gICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gcGx1Y2soYXJyYXksIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZ2VuZXJpYyBgQXJyYXkjcmVkdWNlYCBsaWtlIG1ldGhvZC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHBhcmFtIHtNaXhlZH0gYWNjdW11bGF0b3IgSW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIGFjY3VtdWxhdG9yLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVkdWNlKGFycmF5LCBjYWxsYmFjaywgYWNjdW11bGF0b3IpIHtcbiAgICB2YXIgbm9hY2N1bSA9IGFyZ3VtZW50cy5sZW5ndGggPCAzO1xuICAgIGZvckVhY2goYXJyYXksIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgYWNjdW11bGF0b3IgPSBub2FjY3VtID8gKG5vYWNjdW0gPSBmYWxzZSwgdmFsdWUpIDogY2FsbGJhY2soYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgYXJyYXkpO1xuICAgIH0pO1xuICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBBYm9ydHMgYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlLlxuICAgKlxuICAgKiBAbmFtZSBhYm9ydFxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBzdWl0ZSBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGFib3J0U3VpdGUoKSB7XG4gICAgdmFyIGV2ZW50LFxuICAgICAgICBtZSA9IHRoaXMsXG4gICAgICAgIHJlc2V0dGluZyA9IGNhbGxlZEJ5LnJlc2V0U3VpdGU7XG5cbiAgICBpZiAobWUucnVubmluZykge1xuICAgICAgZXZlbnQgPSBFdmVudCgnYWJvcnQnKTtcbiAgICAgIG1lLmVtaXQoZXZlbnQpO1xuICAgICAgaWYgKCFldmVudC5jYW5jZWxsZWQgfHwgcmVzZXR0aW5nKSB7XG4gICAgICAgIC8vIGF2b2lkIGluZmluaXRlIHJlY3Vyc2lvblxuICAgICAgICBjYWxsZWRCeS5hYm9ydFN1aXRlID0gdHJ1ZTtcbiAgICAgICAgbWUucmVzZXQoKTtcbiAgICAgICAgZGVsZXRlIGNhbGxlZEJ5LmFib3J0U3VpdGU7XG5cbiAgICAgICAgaWYgKCFyZXNldHRpbmcpIHtcbiAgICAgICAgICBtZS5hYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICBpbnZva2UobWUsICdhYm9ydCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdGVzdCB0byB0aGUgYmVuY2htYXJrIHN1aXRlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIEEgbmFtZSB0byBpZGVudGlmeSB0aGUgYmVuY2htYXJrLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gVGhlIHRlc3QgdG8gYmVuY2htYXJrLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAvLyBiYXNpYyB1c2FnZVxuICAgKiBzdWl0ZS5hZGQoZm4pO1xuICAgKlxuICAgKiAvLyBvciB1c2luZyBhIG5hbWUgZmlyc3RcbiAgICogc3VpdGUuYWRkKCdmb28nLCBmbik7XG4gICAqXG4gICAqIC8vIG9yIHdpdGggb3B0aW9uc1xuICAgKiBzdWl0ZS5hZGQoJ2ZvbycsIGZuLCB7XG4gICAqICAgJ29uQ3ljbGUnOiBvbkN5Y2xlLFxuICAgKiAgICdvbkNvbXBsZXRlJzogb25Db21wbGV0ZVxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gb3IgbmFtZSBhbmQgb3B0aW9uc1xuICAgKiBzdWl0ZS5hZGQoJ2ZvbycsIHtcbiAgICogICAnZm4nOiBmbixcbiAgICogICAnb25DeWNsZSc6IG9uQ3ljbGUsXG4gICAqICAgJ29uQ29tcGxldGUnOiBvbkNvbXBsZXRlXG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBvciBvcHRpb25zIG9ubHlcbiAgICogc3VpdGUuYWRkKHtcbiAgICogICAnbmFtZSc6ICdmb28nLFxuICAgKiAgICdmbic6IGZuLFxuICAgKiAgICdvbkN5Y2xlJzogb25DeWNsZSxcbiAgICogICAnb25Db21wbGV0ZSc6IG9uQ29tcGxldGVcbiAgICogfSk7XG4gICAqL1xuICBmdW5jdGlvbiBhZGQobmFtZSwgZm4sIG9wdGlvbnMpIHtcbiAgICB2YXIgbWUgPSB0aGlzLFxuICAgICAgICBiZW5jaCA9IEJlbmNobWFyayhuYW1lLCBmbiwgb3B0aW9ucyksXG4gICAgICAgIGV2ZW50ID0gRXZlbnQoeyAndHlwZSc6ICdhZGQnLCAndGFyZ2V0JzogYmVuY2ggfSk7XG5cbiAgICBpZiAobWUuZW1pdChldmVudCksICFldmVudC5jYW5jZWxsZWQpIHtcbiAgICAgIG1lLnB1c2goYmVuY2gpO1xuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBzdWl0ZSB3aXRoIGNsb25lZCBiZW5jaG1hcmtzLlxuICAgKlxuICAgKiBAbmFtZSBjbG9uZVxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0IHRvIG92ZXJ3cml0ZSBjbG9uZWQgb3B0aW9ucy5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIG5ldyBzdWl0ZSBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNsb25lU3VpdGUob3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBtZS5jb25zdHJ1Y3RvcihleHRlbmQoe30sIG1lLm9wdGlvbnMsIG9wdGlvbnMpKTtcblxuICAgIC8vIGNvcHkgb3duIHByb3BlcnRpZXNcbiAgICBmb3JPd24obWUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghaGFzS2V5KHJlc3VsdCwga2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlICYmIGlzQ2xhc3NPZih2YWx1ZS5jbG9uZSwgJ0Z1bmN0aW9uJylcbiAgICAgICAgICA/IHZhbHVlLmNsb25lKClcbiAgICAgICAgICA6IGRlZXBDbG9uZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBgQXJyYXkjZmlsdGVyYCBsaWtlIG1ldGhvZC5cbiAgICpcbiAgICogQG5hbWUgZmlsdGVyXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGNhbGxiYWNrIFRoZSBmdW5jdGlvbi9hbGlhcyBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHJldHVybnMge09iamVjdH0gQSBuZXcgc3VpdGUgb2YgYmVuY2htYXJrcyB0aGF0IHBhc3NlZCBjYWxsYmFjayBmaWx0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBmaWx0ZXJTdWl0ZShjYWxsYmFjaykge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBtZS5jb25zdHJ1Y3RvcjtcblxuICAgIHJlc3VsdC5wdXNoLmFwcGx5KHJlc3VsdCwgZmlsdGVyKG1lLCBjYWxsYmFjaykpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICpcbiAgICogQG5hbWUgcmVzZXRcbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiByZXNldFN1aXRlKCkge1xuICAgIHZhciBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICBhYm9ydGluZyA9IGNhbGxlZEJ5LmFib3J0U3VpdGU7XG5cbiAgICBpZiAobWUucnVubmluZyAmJiAhYWJvcnRpbmcpIHtcbiAgICAgIC8vIG5vIHdvcnJpZXMsIGByZXNldFN1aXRlKClgIGlzIGNhbGxlZCB3aXRoaW4gYGFib3J0U3VpdGUoKWBcbiAgICAgIGNhbGxlZEJ5LnJlc2V0U3VpdGUgPSB0cnVlO1xuICAgICAgbWUuYWJvcnQoKTtcbiAgICAgIGRlbGV0ZSBjYWxsZWRCeS5yZXNldFN1aXRlO1xuICAgIH1cbiAgICAvLyByZXNldCBpZiB0aGUgc3RhdGUgaGFzIGNoYW5nZWRcbiAgICBlbHNlIGlmICgobWUuYWJvcnRlZCB8fCBtZS5ydW5uaW5nKSAmJlxuICAgICAgICAobWUuZW1pdChldmVudCA9IEV2ZW50KCdyZXNldCcpKSwgIWV2ZW50LmNhbmNlbGxlZCkpIHtcbiAgICAgIG1lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIGlmICghYWJvcnRpbmcpIHtcbiAgICAgICAgaW52b2tlKG1lLCAncmVzZXQnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIHN1aXRlLlxuICAgKlxuICAgKiBAbmFtZSBydW5cbiAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlXG4gICAqIHN1aXRlLnJ1bigpO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogc3VpdGUucnVuKHsgJ2FzeW5jJzogdHJ1ZSwgJ3F1ZXVlZCc6IHRydWUgfSk7XG4gICAqL1xuICBmdW5jdGlvbiBydW5TdWl0ZShvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcztcblxuICAgIG1lLnJlc2V0KCk7XG4gICAgbWUucnVubmluZyA9IHRydWU7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIGludm9rZShtZSwge1xuICAgICAgJ25hbWUnOiAncnVuJyxcbiAgICAgICdhcmdzJzogb3B0aW9ucyxcbiAgICAgICdxdWV1ZWQnOiBvcHRpb25zLnF1ZXVlZCxcbiAgICAgICdvblN0YXJ0JzogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbWUuZW1pdChldmVudCk7XG4gICAgICB9LFxuICAgICAgJ29uQ3ljbGUnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgYmVuY2ggPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmIChiZW5jaC5lcnJvcikge1xuICAgICAgICAgIG1lLmVtaXQoeyAndHlwZSc6ICdlcnJvcicsICd0YXJnZXQnOiBiZW5jaCB9KTtcbiAgICAgICAgfVxuICAgICAgICBtZS5lbWl0KGV2ZW50KTtcbiAgICAgICAgZXZlbnQuYWJvcnRlZCA9IG1lLmFib3J0ZWQ7XG4gICAgICB9LFxuICAgICAgJ29uQ29tcGxldGUnOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBtZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIG1lLmVtaXQoZXZlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgb2YgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLCBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0eXBlIFRoZSBldmVudCB0eXBlIG9yIG9iamVjdC5cbiAgICogQHJldHVybnMge01peGVkfSBSZXR1cm5zIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhc3QgbGlzdGVuZXIgZXhlY3V0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgICB2YXIgbGlzdGVuZXJzLFxuICAgICAgICBtZSA9IHRoaXMsXG4gICAgICAgIGV2ZW50ID0gRXZlbnQodHlwZSksXG4gICAgICAgIGV2ZW50cyA9IG1lLmV2ZW50cyxcbiAgICAgICAgYXJncyA9IChhcmd1bWVudHNbMF0gPSBldmVudCwgYXJndW1lbnRzKTtcblxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgfHwgKGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBtZSk7XG4gICAgZXZlbnQudGFyZ2V0IHx8IChldmVudC50YXJnZXQgPSBtZSk7XG4gICAgZGVsZXRlIGV2ZW50LnJlc3VsdDtcblxuICAgIGlmIChldmVudHMgJiYgKGxpc3RlbmVycyA9IGhhc0tleShldmVudHMsIGV2ZW50LnR5cGUpICYmIGV2ZW50c1tldmVudC50eXBlXSkpIHtcbiAgICAgIGZvckVhY2gobGlzdGVuZXJzLnNsaWNlKCksIGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgoZXZlbnQucmVzdWx0ID0gbGlzdGVuZXIuYXBwbHkobWUsIGFyZ3MpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBldmVudC5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhZXZlbnQuYWJvcnRlZDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZXZlbnQucmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgZXZlbnQgbGlzdGVuZXJzIGZvciBhIGdpdmVuIHR5cGUgdGhhdCBjYW4gYmUgbWFuaXB1bGF0ZWRcbiAgICogdG8gYWRkIG9yIHJlbW92ZSBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmssIEJlbmNobWFyay5TdWl0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgbGlzdGVuZXJzIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgICB2YXIgbWUgPSB0aGlzLFxuICAgICAgICBldmVudHMgPSBtZS5ldmVudHMgfHwgKG1lLmV2ZW50cyA9IHt9KTtcblxuICAgIHJldHVybiBoYXNLZXkoZXZlbnRzLCB0eXBlKSA/IGV2ZW50c1t0eXBlXSA6IChldmVudHNbdHlwZV0gPSBbXSk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlKHMpLFxuICAgKiBvciB1bnJlZ2lzdGVycyBhbGwgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUocyksXG4gICAqIG9yIHVucmVnaXN0ZXJzIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlcy5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFyaywgQmVuY2htYXJrLlN1aXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtsaXN0ZW5lcl0gVGhlIGZ1bmN0aW9uIHRvIHVucmVnaXN0ZXIuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vZmYoJ2N5Y2xlJywgbGlzdGVuZXIpO1xuICAgKlxuICAgKiAvLyB1bnJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAqIGJlbmNoLm9mZignc3RhcnQgY3ljbGUnLCBsaXN0ZW5lcik7XG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vZmYoJ2N5Y2xlJyk7XG4gICAqXG4gICAqIC8vIHVucmVnaXN0ZXIgYWxsIGxpc3RlbmVycyBmb3IgbXVsdGlwbGUgZXZlbnQgdHlwZXNcbiAgICogYmVuY2gub2ZmKCdzdGFydCBjeWNsZSBjb21wbGV0ZScpO1xuICAgKlxuICAgKiAvLyB1bnJlZ2lzdGVyIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBldmVudCB0eXBlc1xuICAgKiBiZW5jaC5vZmYoKTtcbiAgICovXG4gIGZ1bmN0aW9uIG9mZih0eXBlLCBsaXN0ZW5lcikge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIGV2ZW50cyA9IG1lLmV2ZW50cztcblxuICAgIGV2ZW50cyAmJiBlYWNoKHR5cGUgPyB0eXBlLnNwbGl0KCcgJykgOiBldmVudHMsIGZ1bmN0aW9uKGxpc3RlbmVycywgdHlwZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHlwZSA9IGxpc3RlbmVycztcbiAgICAgICAgbGlzdGVuZXJzID0gaGFzS2V5KGV2ZW50cywgdHlwZSkgJiYgZXZlbnRzW3R5cGVdO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICBpbmRleCA9IGluZGV4T2YobGlzdGVuZXJzLCBsaXN0ZW5lcik7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5lcnMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlKHMpLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLCBCZW5jaG1hcmsuU3VpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byByZWdpc3Rlci5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogLy8gcmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdHlwZVxuICAgKiBiZW5jaC5vbignY3ljbGUnLCBsaXN0ZW5lcik7XG4gICAqXG4gICAqIC8vIHJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIG11bHRpcGxlIGV2ZW50IHR5cGVzXG4gICAqIGJlbmNoLm9uKCdzdGFydCBjeWNsZScsIGxpc3RlbmVyKTtcbiAgICovXG4gIGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgZXZlbnRzID0gbWUuZXZlbnRzIHx8IChtZS5ldmVudHMgPSB7fSk7XG5cbiAgICBmb3JFYWNoKHR5cGUuc3BsaXQoJyAnKSwgZnVuY3Rpb24odHlwZSkge1xuICAgICAgKGhhc0tleShldmVudHMsIHR5cGUpXG4gICAgICAgID8gZXZlbnRzW3R5cGVdXG4gICAgICAgIDogKGV2ZW50c1t0eXBlXSA9IFtdKVxuICAgICAgKS5wdXNoKGxpc3RlbmVyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQWJvcnRzIHRoZSBiZW5jaG1hcmsgd2l0aG91dCByZWNvcmRpbmcgdGltZXMuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGJlbmNobWFyayBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGFib3J0KCkge1xuICAgIHZhciBldmVudCxcbiAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICByZXNldHRpbmcgPSBjYWxsZWRCeS5yZXNldDtcblxuICAgIGlmIChtZS5ydW5uaW5nKSB7XG4gICAgICBldmVudCA9IEV2ZW50KCdhYm9ydCcpO1xuICAgICAgbWUuZW1pdChldmVudCk7XG4gICAgICBpZiAoIWV2ZW50LmNhbmNlbGxlZCB8fCByZXNldHRpbmcpIHtcbiAgICAgICAgLy8gYXZvaWQgaW5maW5pdGUgcmVjdXJzaW9uXG4gICAgICAgIGNhbGxlZEJ5LmFib3J0ID0gdHJ1ZTtcbiAgICAgICAgbWUucmVzZXQoKTtcbiAgICAgICAgZGVsZXRlIGNhbGxlZEJ5LmFib3J0O1xuXG4gICAgICAgIGlmIChzdXBwb3J0LnRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQobWUuX3RpbWVySWQpO1xuICAgICAgICAgIGRlbGV0ZSBtZS5fdGltZXJJZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc2V0dGluZykge1xuICAgICAgICAgIG1lLmFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIG1lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBiZW5jaG1hcmsgdXNpbmcgdGhlIHNhbWUgdGVzdCBhbmQgb3B0aW9ucy5cbiAgICpcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdCB0byBvdmVyd3JpdGUgY2xvbmVkIG9wdGlvbnMuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBuZXcgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiB2YXIgYml6YXJybyA9IGJlbmNoLmNsb25lKHtcbiAgICogICAnbmFtZSc6ICdkb3BwZWxnYW5nZXInXG4gICAqIH0pO1xuICAgKi9cbiAgZnVuY3Rpb24gY2xvbmUob3B0aW9ucykge1xuICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgIHJlc3VsdCA9IG5ldyBtZS5jb25zdHJ1Y3RvcihleHRlbmQoe30sIG1lLCBvcHRpb25zKSk7XG5cbiAgICAvLyBjb3JyZWN0IHRoZSBgb3B0aW9uc2Agb2JqZWN0XG4gICAgcmVzdWx0Lm9wdGlvbnMgPSBleHRlbmQoe30sIG1lLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgLy8gY29weSBvd24gY3VzdG9tIHByb3BlcnRpZXNcbiAgICBmb3JPd24obWUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghaGFzS2V5KHJlc3VsdCwga2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGRlZXBDbG9uZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGEgYmVuY2htYXJrIGlzIGZhc3RlciB0aGFuIGFub3RoZXIuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBiZW5jaG1hcmsgdG8gY29tcGFyZS5cbiAgICogQHJldHVybnMge051bWJlcn0gUmV0dXJucyBgLTFgIGlmIHNsb3dlciwgYDFgIGlmIGZhc3RlciwgYW5kIGAwYCBpZiBpbmRldGVybWluYXRlLlxuICAgKi9cbiAgZnVuY3Rpb24gY29tcGFyZShvdGhlcikge1xuICAgIHZhciBjcml0aWNhbCxcbiAgICAgICAgelN0YXQsXG4gICAgICAgIG1lID0gdGhpcyxcbiAgICAgICAgc2FtcGxlMSA9IG1lLnN0YXRzLnNhbXBsZSxcbiAgICAgICAgc2FtcGxlMiA9IG90aGVyLnN0YXRzLnNhbXBsZSxcbiAgICAgICAgc2l6ZTEgPSBzYW1wbGUxLmxlbmd0aCxcbiAgICAgICAgc2l6ZTIgPSBzYW1wbGUyLmxlbmd0aCxcbiAgICAgICAgbWF4U2l6ZSA9IG1heChzaXplMSwgc2l6ZTIpLFxuICAgICAgICBtaW5TaXplID0gbWluKHNpemUxLCBzaXplMiksXG4gICAgICAgIHUxID0gZ2V0VShzYW1wbGUxLCBzYW1wbGUyKSxcbiAgICAgICAgdTIgPSBnZXRVKHNhbXBsZTIsIHNhbXBsZTEpLFxuICAgICAgICB1ID0gbWluKHUxLCB1Mik7XG5cbiAgICBmdW5jdGlvbiBnZXRTY29yZSh4QSwgc2FtcGxlQikge1xuICAgICAgcmV0dXJuIHJlZHVjZShzYW1wbGVCLCBmdW5jdGlvbih0b3RhbCwgeEIpIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgKHhCID4geEEgPyAwIDogeEIgPCB4QSA/IDEgOiAwLjUpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VShzYW1wbGVBLCBzYW1wbGVCKSB7XG4gICAgICByZXR1cm4gcmVkdWNlKHNhbXBsZUEsIGZ1bmN0aW9uKHRvdGFsLCB4QSkge1xuICAgICAgICByZXR1cm4gdG90YWwgKyBnZXRTY29yZSh4QSwgc2FtcGxlQik7XG4gICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRaKHUpIHtcbiAgICAgIHJldHVybiAodSAtICgoc2l6ZTEgKiBzaXplMikgLyAyKSkgLyBzcXJ0KChzaXplMSAqIHNpemUyICogKHNpemUxICsgc2l6ZTIgKyAxKSkgLyAxMik7XG4gICAgfVxuXG4gICAgLy8gZXhpdCBlYXJseSBpZiBjb21wYXJpbmcgdGhlIHNhbWUgYmVuY2htYXJrXG4gICAgaWYgKG1lID09IG90aGVyKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgLy8gcmVqZWN0IHRoZSBudWxsIGh5cGhvdGhlc2lzIHRoZSB0d28gc2FtcGxlcyBjb21lIGZyb20gdGhlXG4gICAgLy8gc2FtZSBwb3B1bGF0aW9uIChpLmUuIGhhdmUgdGhlIHNhbWUgbWVkaWFuKSBpZi4uLlxuICAgIGlmIChzaXplMSArIHNpemUyID4gMzApIHtcbiAgICAgIC8vIC4uLnRoZSB6LXN0YXQgaXMgZ3JlYXRlciB0aGFuIDEuOTYgb3IgbGVzcyB0aGFuIC0xLjk2XG4gICAgICAvLyBodHRwOi8vd3d3LnN0YXRpc3RpY3NsZWN0dXJlcy5jb20vdG9waWNzL21hbm53aGl0bmV5dS9cbiAgICAgIHpTdGF0ID0gZ2V0Wih1KTtcbiAgICAgIHJldHVybiBhYnMoelN0YXQpID4gMS45NiA/ICh6U3RhdCA+IDAgPyAtMSA6IDEpIDogMDtcbiAgICB9XG4gICAgLy8gLi4udGhlIFUgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBjcml0aWNhbCBVIHZhbHVlXG4gICAgLy8gaHR0cDovL3d3dy5nZW9pYi5jb20vbWFubi13aGl0bmV5LXUtdGVzdC5odG1sXG4gICAgY3JpdGljYWwgPSBtYXhTaXplIDwgNSB8fCBtaW5TaXplIDwgMyA/IDAgOiB1VGFibGVbbWF4U2l6ZV1bbWluU2l6ZSAtIDNdO1xuICAgIHJldHVybiB1IDw9IGNyaXRpY2FsID8gKHUgPT0gdTEgPyAxIDogLTEpIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBwcm9wZXJ0aWVzIGFuZCBhYm9ydCBpZiBydW5uaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICB2YXIgZGF0YSxcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIG1lID0gdGhpcyxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBjaGFuZ2VzID0geyAnbGVuZ3RoJzogMCB9LFxuICAgICAgICBxdWV1ZSA9IHsgJ2xlbmd0aCc6IDAgfTtcblxuICAgIGlmIChtZS5ydW5uaW5nICYmICFjYWxsZWRCeS5hYm9ydCkge1xuICAgICAgLy8gbm8gd29ycmllcywgYHJlc2V0KClgIGlzIGNhbGxlZCB3aXRoaW4gYGFib3J0KClgXG4gICAgICBjYWxsZWRCeS5yZXNldCA9IHRydWU7XG4gICAgICBtZS5hYm9ydCgpO1xuICAgICAgZGVsZXRlIGNhbGxlZEJ5LnJlc2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGEgbm9uLXJlY3Vyc2l2ZSBzb2x1dGlvbiB0byBjaGVjayBpZiBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZFxuICAgICAgLy8gaHR0cDovL3d3dy5qc2xhYi5kay9hcnRpY2xlcy9ub24ucmVjdXJzaXZlLnByZW9yZGVyLnRyYXZlcnNhbC5wYXJ0NFxuICAgICAgZGF0YSA9IHsgJ2Rlc3RpbmF0aW9uJzogbWUsICdzb3VyY2UnOiBleHRlbmQoe30sIG1lLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgbWUub3B0aW9ucykgfTtcbiAgICAgIGRvIHtcbiAgICAgICAgZm9yT3duKGRhdGEuc291cmNlLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdmFyIGNoYW5nZWQsXG4gICAgICAgICAgICAgIGRlc3RpbmF0aW9uID0gZGF0YS5kZXN0aW5hdGlvbixcbiAgICAgICAgICAgICAgY3VyclZhbHVlID0gZGVzdGluYXRpb25ba2V5XTtcblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGlmIChpc0NsYXNzT2YodmFsdWUsICdBcnJheScpKSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGFuIGFycmF5IHZhbHVlIGhhcyBjaGFuZ2VkIHRvIGEgbm9uLWFycmF5IHZhbHVlXG4gICAgICAgICAgICAgIGlmICghaXNDbGFzc09mKGN1cnJWYWx1ZSwgJ0FycmF5JykpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gY3VyclZhbHVlID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gb3IgaGFzIGNoYW5nZWQgaXRzIGxlbmd0aFxuICAgICAgICAgICAgICBpZiAoY3VyclZhbHVlLmxlbmd0aCAhPSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gY3VyclZhbHVlID0gY3VyclZhbHVlLnNsaWNlKDAsIHZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgY3VyclZhbHVlLmxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgYW4gb2JqZWN0IGhhcyBjaGFuZ2VkIHRvIGEgbm9uLW9iamVjdCB2YWx1ZVxuICAgICAgICAgICAgZWxzZSBpZiAoIWN1cnJWYWx1ZSB8fCB0eXBlb2YgY3VyclZhbHVlICE9ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGNoYW5nZWQgPSBjdXJyVmFsdWUgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlZ2lzdGVyIGEgY2hhbmdlZCBvYmplY3RcbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgIGNoYW5nZXNbY2hhbmdlcy5sZW5ndGgrK10gPSB7ICdkZXN0aW5hdGlvbic6IGRlc3RpbmF0aW9uLCAna2V5Jzoga2V5LCAndmFsdWUnOiBjdXJyVmFsdWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlW3F1ZXVlLmxlbmd0aCsrXSA9IHsgJ2Rlc3RpbmF0aW9uJzogY3VyclZhbHVlLCAnc291cmNlJzogdmFsdWUgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gcmVnaXN0ZXIgYSBjaGFuZ2VkIHByaW1pdGl2ZVxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlICE9PSBjdXJyVmFsdWUgJiYgISh2YWx1ZSA9PSBudWxsIHx8IGlzQ2xhc3NPZih2YWx1ZSwgJ0Z1bmN0aW9uJykpKSB7XG4gICAgICAgICAgICBjaGFuZ2VzW2NoYW5nZXMubGVuZ3RoKytdID0geyAnZGVzdGluYXRpb24nOiBkZXN0aW5hdGlvbiwgJ2tleSc6IGtleSwgJ3ZhbHVlJzogdmFsdWUgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgd2hpbGUgKChkYXRhID0gcXVldWVbaW5kZXgrK10pKTtcblxuICAgICAgLy8gaWYgY2hhbmdlZCBlbWl0IHRoZSBgcmVzZXRgIGV2ZW50IGFuZCBpZiBpdCBpc24ndCBjYW5jZWxsZWQgcmVzZXQgdGhlIGJlbmNobWFya1xuICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoICYmIChtZS5lbWl0KGV2ZW50ID0gRXZlbnQoJ3Jlc2V0JykpLCAhZXZlbnQuY2FuY2VsbGVkKSkge1xuICAgICAgICBmb3JFYWNoKGNoYW5nZXMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBkYXRhLmRlc3RpbmF0aW9uW2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgcmVsZXZhbnQgYmVuY2htYXJrIGluZm9ybWF0aW9uIHdoZW4gY29lcmNlZCB0byBhIHN0cmluZy5cbiAgICpcbiAgICogQG5hbWUgdG9TdHJpbmdcbiAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gdG9TdHJpbmdCZW5jaCgpIHtcbiAgICB2YXIgbWUgPSB0aGlzLFxuICAgICAgICBlcnJvciA9IG1lLmVycm9yLFxuICAgICAgICBoeiA9IG1lLmh6LFxuICAgICAgICBpZCA9IG1lLmlkLFxuICAgICAgICBzdGF0cyA9IG1lLnN0YXRzLFxuICAgICAgICBzaXplID0gc3RhdHMuc2FtcGxlLmxlbmd0aCxcbiAgICAgICAgcG0gPSBzdXBwb3J0LmphdmEgPyAnKy8tJyA6ICdcXHhiMScsXG4gICAgICAgIHJlc3VsdCA9IG1lLm5hbWUgfHwgKGlzTmFOKGlkKSA/IGlkIDogJzxUZXN0ICMnICsgaWQgKyAnPicpO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXN1bHQgKz0gJzogJyArIGpvaW4oZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gJyB4ICcgKyBmb3JtYXROdW1iZXIoaHoudG9GaXhlZChoeiA8IDEwMCA/IDIgOiAwKSkgKyAnIG9wcy9zZWMgJyArIHBtICtcbiAgICAgICAgc3RhdHMucm1lLnRvRml4ZWQoMikgKyAnJSAoJyArIHNpemUgKyAnIHJ1bicgKyAoc2l6ZSA9PSAxID8gJycgOiAncycpICsgJyBzYW1wbGVkKSc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ2xvY2tzIHRoZSB0aW1lIHRha2VuIHRvIGV4ZWN1dGUgYSB0ZXN0IHBlciBjeWNsZSAoc2VjcykuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiZW5jaCBUaGUgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgdGltZSB0YWtlbi5cbiAgICovXG4gIGZ1bmN0aW9uIGNsb2NrKCkge1xuICAgIHZhciBhcHBsZXQsXG4gICAgICAgIG9wdGlvbnMgPSBCZW5jaG1hcmsub3B0aW9ucyxcbiAgICAgICAgdGVtcGxhdGUgPSB7ICdiZWdpbic6ICdzJD1uZXcgbiQnLCAnZW5kJzogJ3IkPShuZXcgbiQtcyQpLzFlMycsICd1aWQnOiB1aWQgfSxcbiAgICAgICAgdGltZXJzID0gW3sgJ25zJzogdGltZXIubnMsICdyZXMnOiBtYXgoMC4wMDE1LCBnZXRSZXMoJ21zJykpLCAndW5pdCc6ICdtcycgfV07XG5cbiAgICAvLyBsYXp5IGRlZmluZSBmb3IgaGktcmVzIHRpbWVyc1xuICAgIGNsb2NrID0gZnVuY3Rpb24oY2xvbmUpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIGlmIChjbG9uZSBpbnN0YW5jZW9mIERlZmVycmVkKSB7XG4gICAgICAgIGRlZmVycmVkID0gY2xvbmU7XG4gICAgICAgIGNsb25lID0gZGVmZXJyZWQuYmVuY2htYXJrO1xuICAgICAgfVxuXG4gICAgICB2YXIgYmVuY2ggPSBjbG9uZS5fb3JpZ2luYWwsXG4gICAgICAgICAgZm4gPSBiZW5jaC5mbixcbiAgICAgICAgICBmbkFyZyA9IGRlZmVycmVkID8gZ2V0Rmlyc3RBcmd1bWVudChmbikgfHwgJ2RlZmVycmVkJyA6ICcnLFxuICAgICAgICAgIHN0cmluZ2FibGUgPSBpc1N0cmluZ2FibGUoZm4pO1xuXG4gICAgICB2YXIgc291cmNlID0ge1xuICAgICAgICAnc2V0dXAnOiBnZXRTb3VyY2UoYmVuY2guc2V0dXAsIHByZXByb2Nlc3MoJ20kLnNldHVwKCknKSksXG4gICAgICAgICdmbic6IGdldFNvdXJjZShmbiwgcHJlcHJvY2VzcygnbSQuZm4oJyArIGZuQXJnICsgJyknKSksXG4gICAgICAgICdmbkFyZyc6IGZuQXJnLFxuICAgICAgICAndGVhcmRvd24nOiBnZXRTb3VyY2UoYmVuY2gudGVhcmRvd24sIHByZXByb2Nlc3MoJ20kLnRlYXJkb3duKCknKSlcbiAgICAgIH07XG5cbiAgICAgIHZhciBjb3VudCA9IGJlbmNoLmNvdW50ID0gY2xvbmUuY291bnQsXG4gICAgICAgICAgZGVjb21waWxhYmxlID0gc3VwcG9ydC5kZWNvbXBpbGF0aW9uIHx8IHN0cmluZ2FibGUsXG4gICAgICAgICAgaWQgPSBiZW5jaC5pZCxcbiAgICAgICAgICBpc0VtcHR5ID0gIShzb3VyY2UuZm4gfHwgc3RyaW5nYWJsZSksXG4gICAgICAgICAgbmFtZSA9IGJlbmNoLm5hbWUgfHwgKHR5cGVvZiBpZCA9PSAnbnVtYmVyJyA/ICc8VGVzdCAjJyArIGlkICsgJz4nIDogaWQpLFxuICAgICAgICAgIG5zID0gdGltZXIubnMsXG4gICAgICAgICAgcmVzdWx0ID0gMDtcblxuICAgICAgLy8gaW5pdCBgbWluVGltZWAgaWYgbmVlZGVkXG4gICAgICBjbG9uZS5taW5UaW1lID0gYmVuY2gubWluVGltZSB8fCAoYmVuY2gubWluVGltZSA9IGJlbmNoLm9wdGlvbnMubWluVGltZSA9IG9wdGlvbnMubWluVGltZSk7XG5cbiAgICAgIC8vIHJlcGFpciBuYW5vc2Vjb25kIHRpbWVyXG4gICAgICAvLyAoc29tZSBDaHJvbWUgYnVpbGRzIGVyYXNlIHRoZSBgbnNgIHZhcmlhYmxlIGFmdGVyIG1pbGxpb25zIG9mIGV4ZWN1dGlvbnMpXG4gICAgICBpZiAoYXBwbGV0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbnMubmFub1RpbWUoKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgLy8gdXNlIG5vbi1lbGVtZW50IHRvIGF2b2lkIGlzc3VlcyB3aXRoIGxpYnMgdGhhdCBhdWdtZW50IHRoZW1cbiAgICAgICAgICBucyA9IHRpbWVyLm5zID0gbmV3IGFwcGxldC5QYWNrYWdlcy5uYW5vO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXBpbGUgaW4gc2V0dXAvdGVhcmRvd24gZnVuY3Rpb25zIGFuZCB0aGUgdGVzdCBsb29wLlxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IGNvbXBpbGVkIHRlc3QsIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNhY2hlZCBgYmVuY2guY29tcGlsZWRgLFxuICAgICAgLy8gdG8gYXZvaWQgcG90ZW50aWFsIGVuZ2luZSBvcHRpbWl6YXRpb25zIGVuYWJsZWQgb3ZlciB0aGUgbGlmZSBvZiB0aGUgdGVzdC5cbiAgICAgIHZhciBjb21waWxlZCA9IGJlbmNoLmNvbXBpbGVkID0gY3JlYXRlRnVuY3Rpb24ocHJlcHJvY2VzcygndCQnKSwgaW50ZXJwb2xhdGUoXG4gICAgICAgIHByZXByb2Nlc3MoZGVmZXJyZWRcbiAgICAgICAgICA/ICd2YXIgZCQ9dGhpcywje2ZuQXJnfT1kJCxtJD1kJC5iZW5jaG1hcmsuX29yaWdpbmFsLGYkPW0kLmZuLHN1JD1tJC5zZXR1cCx0ZCQ9bSQudGVhcmRvd247JyArXG4gICAgICAgICAgICAvLyB3aGVuIGBkZWZlcnJlZC5jeWNsZXNgIGlzIGAwYCB0aGVuLi4uXG4gICAgICAgICAgICAnaWYoIWQkLmN5Y2xlcyl7JyArXG4gICAgICAgICAgICAvLyBzZXQgYGRlZmVycmVkLmZuYFxuICAgICAgICAgICAgJ2QkLmZuPWZ1bmN0aW9uKCl7dmFyICN7Zm5Bcmd9PWQkO2lmKHR5cGVvZiBmJD09XCJmdW5jdGlvblwiKXt0cnl7I3tmbn1cXG59Y2F0Y2goZSQpe2YkKGQkKX19ZWxzZXsje2ZufVxcbn19OycgK1xuICAgICAgICAgICAgLy8gc2V0IGBkZWZlcnJlZC50ZWFyZG93bmBcbiAgICAgICAgICAgICdkJC50ZWFyZG93bj1mdW5jdGlvbigpe2QkLmN5Y2xlcz0wO2lmKHR5cGVvZiB0ZCQ9PVwiZnVuY3Rpb25cIil7dHJ5eyN7dGVhcmRvd259XFxufWNhdGNoKGUkKXt0ZCQoKX19ZWxzZXsje3RlYXJkb3dufVxcbn19OycgK1xuICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgYmVuY2htYXJrJ3MgYHNldHVwYFxuICAgICAgICAgICAgJ2lmKHR5cGVvZiBzdSQ9PVwiZnVuY3Rpb25cIil7dHJ5eyN7c2V0dXB9XFxufWNhdGNoKGUkKXtzdSQoKX19ZWxzZXsje3NldHVwfVxcbn07JyArXG4gICAgICAgICAgICAvLyBzdGFydCB0aW1lclxuICAgICAgICAgICAgJ3QkLnN0YXJ0KGQkKTsnICtcbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgYGRlZmVycmVkLmZuYCBhbmQgcmV0dXJuIGEgZHVtbXkgb2JqZWN0XG4gICAgICAgICAgICAnfWQkLmZuKCk7cmV0dXJue30nXG5cbiAgICAgICAgICA6ICd2YXIgciQscyQsbSQ9dGhpcyxmJD1tJC5mbixpJD1tJC5jb3VudCxuJD10JC5uczsje3NldHVwfVxcbiN7YmVnaW59OycgK1xuICAgICAgICAgICAgJ3doaWxlKGkkLS0peyN7Zm59XFxufSN7ZW5kfTsje3RlYXJkb3dufVxcbnJldHVybntlbGFwc2VkOnIkLHVpZDpcIiN7dWlkfVwifScpLFxuICAgICAgICBzb3VyY2VcbiAgICAgICkpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgIC8vIEZpcmVmb3ggbWF5IHJlbW92ZSBkZWFkIGNvZGUgZnJvbSBGdW5jdGlvbiN0b1N0cmluZyByZXN1bHRzXG4gICAgICAgICAgLy8gaHR0cDovL2J1Z3ppbC5sYS81MzYwODVcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB0ZXN0IFwiJyArIG5hbWUgKyAnXCIgaXMgZW1wdHkuIFRoaXMgbWF5IGJlIHRoZSByZXN1bHQgb2YgZGVhZCBjb2RlIHJlbW92YWwuJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgICAgLy8gcHJldGVzdCB0byBkZXRlcm1pbmUgaWYgY29tcGlsZWQgY29kZSBpcyBleGl0cyBlYXJseSwgdXN1YWxseSBieSBhXG4gICAgICAgICAgLy8gcm9ndWUgYHJldHVybmAgc3RhdGVtZW50LCBieSBjaGVja2luZyBmb3IgYSByZXR1cm4gb2JqZWN0IHdpdGggdGhlIHVpZFxuICAgICAgICAgIGJlbmNoLmNvdW50ID0gMTtcbiAgICAgICAgICBjb21waWxlZCA9IChjb21waWxlZC5jYWxsKGJlbmNoLCB0aW1lcikgfHwge30pLnVpZCA9PSB1aWQgJiYgY29tcGlsZWQ7XG4gICAgICAgICAgYmVuY2guY291bnQgPSBjb3VudDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGNvbXBpbGVkID0gbnVsbDtcbiAgICAgICAgY2xvbmUuZXJyb3IgPSBlIHx8IG5ldyBFcnJvcihTdHJpbmcoZSkpO1xuICAgICAgICBiZW5jaC5jb3VudCA9IGNvdW50O1xuICAgICAgfVxuICAgICAgLy8gZmFsbGJhY2sgd2hlbiBhIHRlc3QgZXhpdHMgZWFybHkgb3IgZXJyb3JzIGR1cmluZyBwcmV0ZXN0XG4gICAgICBpZiAoZGVjb21waWxhYmxlICYmICFjb21waWxlZCAmJiAhZGVmZXJyZWQgJiYgIWlzRW1wdHkpIHtcbiAgICAgICAgY29tcGlsZWQgPSBjcmVhdGVGdW5jdGlvbihwcmVwcm9jZXNzKCd0JCcpLCBpbnRlcnBvbGF0ZShcbiAgICAgICAgICBwcmVwcm9jZXNzKFxuICAgICAgICAgICAgKGNsb25lLmVycm9yICYmICFzdHJpbmdhYmxlXG4gICAgICAgICAgICAgID8gJ3ZhciByJCxzJCxtJD10aGlzLGYkPW0kLmZuLGkkPW0kLmNvdW50J1xuICAgICAgICAgICAgICA6ICdmdW5jdGlvbiBmJCgpeyN7Zm59XFxufXZhciByJCxzJCxtJD10aGlzLGkkPW0kLmNvdW50J1xuICAgICAgICAgICAgKSArXG4gICAgICAgICAgICAnLG4kPXQkLm5zOyN7c2V0dXB9XFxuI3tiZWdpbn07bSQuZiQ9ZiQ7d2hpbGUoaSQtLSl7bSQuZiQoKX0je2VuZH07JyArXG4gICAgICAgICAgICAnZGVsZXRlIG0kLmYkOyN7dGVhcmRvd259XFxucmV0dXJue2VsYXBzZWQ6ciR9J1xuICAgICAgICAgICksXG4gICAgICAgICAgc291cmNlXG4gICAgICAgICkpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gcHJldGVzdCBvbmUgbW9yZSB0aW1lIHRvIGNoZWNrIGZvciBlcnJvcnNcbiAgICAgICAgICBiZW5jaC5jb3VudCA9IDE7XG4gICAgICAgICAgY29tcGlsZWQuY2FsbChiZW5jaCwgdGltZXIpO1xuICAgICAgICAgIGJlbmNoLmNvbXBpbGVkID0gY29tcGlsZWQ7XG4gICAgICAgICAgYmVuY2guY291bnQgPSBjb3VudDtcbiAgICAgICAgICBkZWxldGUgY2xvbmUuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgIGJlbmNoLmNvdW50ID0gY291bnQ7XG4gICAgICAgICAgaWYgKGNsb25lLmVycm9yKSB7XG4gICAgICAgICAgICBjb21waWxlZCA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJlbmNoLmNvbXBpbGVkID0gY29tcGlsZWQ7XG4gICAgICAgICAgICBjbG9uZS5lcnJvciA9IGUgfHwgbmV3IEVycm9yKFN0cmluZyhlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBhc3NpZ24gYGNvbXBpbGVkYCB0byBgY2xvbmVgIGJlZm9yZSBjYWxsaW5nIGluIGNhc2UgYSBkZWZlcnJlZCBiZW5jaG1hcmtcbiAgICAgIC8vIGltbWVkaWF0ZWx5IGNhbGxzIGBkZWZlcnJlZC5yZXNvbHZlKClgXG4gICAgICBjbG9uZS5jb21waWxlZCA9IGNvbXBpbGVkO1xuICAgICAgLy8gaWYgbm8gZXJyb3JzIHJ1biB0aGUgZnVsbCB0ZXN0IGxvb3BcbiAgICAgIGlmICghY2xvbmUuZXJyb3IpIHtcbiAgICAgICAgcmVzdWx0ID0gY29tcGlsZWQuY2FsbChkZWZlcnJlZCB8fCBiZW5jaCwgdGltZXIpLmVsYXBzZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IHRpbWVyJ3MgbWluaW11bSByZXNvbHV0aW9uIChzZWNzKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRSZXModW5pdCkge1xuICAgICAgdmFyIG1lYXN1cmVkLFxuICAgICAgICAgIGJlZ2luLFxuICAgICAgICAgIGNvdW50ID0gMzAsXG4gICAgICAgICAgZGl2aXNvciA9IDFlMyxcbiAgICAgICAgICBucyA9IHRpbWVyLm5zLFxuICAgICAgICAgIHNhbXBsZSA9IFtdO1xuXG4gICAgICAvLyBnZXQgYXZlcmFnZSBzbWFsbGVzdCBtZWFzdXJhYmxlIHRpbWVcbiAgICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICAgIGlmICh1bml0ID09ICd1cycpIHtcbiAgICAgICAgICBkaXZpc29yID0gMWU2O1xuICAgICAgICAgIGlmIChucy5zdG9wKSB7XG4gICAgICAgICAgICBucy5zdGFydCgpO1xuICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSBucy5taWNyb3NlY29uZHMoKSkpIHsgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobnNbcGVyZk5hbWVdKSB7XG4gICAgICAgICAgICBkaXZpc29yID0gMWUzO1xuICAgICAgICAgICAgbWVhc3VyZWQgPSBGdW5jdGlvbignbicsICd2YXIgcixzPW4uJyArIHBlcmZOYW1lICsgJygpO3doaWxlKCEocj1uLicgKyBwZXJmTmFtZSArICcoKS1zKSl7fTtyZXR1cm4gcicpKG5zKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmVnaW4gPSBucygpO1xuICAgICAgICAgICAgd2hpbGUgKCEobWVhc3VyZWQgPSBucygpIC0gYmVnaW4pKSB7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodW5pdCA9PSAnbnMnKSB7XG4gICAgICAgICAgZGl2aXNvciA9IDFlOTtcbiAgICAgICAgICBpZiAobnMubmFub1RpbWUpIHtcbiAgICAgICAgICAgIGJlZ2luID0gbnMubmFub1RpbWUoKTtcbiAgICAgICAgICAgIHdoaWxlICghKG1lYXN1cmVkID0gbnMubmFub1RpbWUoKSAtIGJlZ2luKSkgeyB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJlZ2luID0gKGJlZ2luID0gbnMoKSlbMF0gKyAoYmVnaW5bMV0gLyBkaXZpc29yKTtcbiAgICAgICAgICAgIHdoaWxlICghKG1lYXN1cmVkID0gKChtZWFzdXJlZCA9IG5zKCkpWzBdICsgKG1lYXN1cmVkWzFdIC8gZGl2aXNvcikpIC0gYmVnaW4pKSB7IH1cbiAgICAgICAgICAgIGRpdmlzb3IgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBiZWdpbiA9IG5ldyBucztcbiAgICAgICAgICB3aGlsZSAoIShtZWFzdXJlZCA9IG5ldyBucyAtIGJlZ2luKSkgeyB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgZm9yIGJyb2tlbiB0aW1lcnMgKG5hbm9UaW1lIG1heSBoYXZlIGlzc3VlcylcbiAgICAgICAgLy8gaHR0cDovL2FsaXZlYnV0c2xlZXB5LnNybmV0LmN6L3VucmVsaWFibGUtc3lzdGVtLW5hbm90aW1lL1xuICAgICAgICBpZiAobWVhc3VyZWQgPiAwKSB7XG4gICAgICAgICAgc2FtcGxlLnB1c2gobWVhc3VyZWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNhbXBsZS5wdXNoKEluZmluaXR5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gY29udmVydCB0byBzZWNvbmRzXG4gICAgICByZXR1cm4gZ2V0TWVhbihzYW1wbGUpIC8gZGl2aXNvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlcyBhbGwgb2NjdXJyZW5jZXMgb2YgYCRgIHdpdGggYSB1bmlxdWUgbnVtYmVyIGFuZFxuICAgICAqIHRlbXBsYXRlIHRva2VucyB3aXRoIGNvbnRlbnQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJlcHJvY2Vzcyhjb2RlKSB7XG4gICAgICByZXR1cm4gaW50ZXJwb2xhdGUoY29kZSwgdGVtcGxhdGUpLnJlcGxhY2UoL1xcJC9nLCAvXFxkKy8uZXhlYyh1aWQpKTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBkZXRlY3QgbmFub3NlY29uZCBzdXBwb3J0IGZyb20gYSBKYXZhIGFwcGxldFxuICAgIGVhY2goZG9jICYmIGRvYy5hcHBsZXRzIHx8IFtdLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gISh0aW1lci5ucyA9IGFwcGxldCA9ICduYW5vVGltZScgaW4gZWxlbWVudCAmJiBlbGVtZW50KTtcbiAgICB9KTtcblxuICAgIC8vIGNoZWNrIHR5cGUgaW4gY2FzZSBTYWZhcmkgcmV0dXJucyBhbiBvYmplY3QgaW5zdGVhZCBvZiBhIG51bWJlclxuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIHRpbWVyLm5zLm5hbm9UaW1lKCkgPT0gJ251bWJlcicpIHtcbiAgICAgICAgdGltZXJzLnB1c2goeyAnbnMnOiB0aW1lci5ucywgJ3Jlcyc6IGdldFJlcygnbnMnKSwgJ3VuaXQnOiAnbnMnIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkgeyB9XG5cbiAgICAvLyBkZXRlY3QgQ2hyb21lJ3MgbWljcm9zZWNvbmQgdGltZXI6XG4gICAgLy8gZW5hYmxlIGJlbmNobWFya2luZyB2aWEgdGhlIC0tZW5hYmxlLWJlbmNobWFya2luZyBjb21tYW5kXG4gICAgLy8gbGluZSBzd2l0Y2ggaW4gYXQgbGVhc3QgQ2hyb21lIDcgdG8gdXNlIGNocm9tZS5JbnRlcnZhbFxuICAgIHRyeSB7XG4gICAgICBpZiAoKHRpbWVyLm5zID0gbmV3ICh3aW5kb3cuY2hyb21lIHx8IHdpbmRvdy5jaHJvbWl1bSkuSW50ZXJ2YWwpKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKHsgJ25zJzogdGltZXIubnMsICdyZXMnOiBnZXRSZXMoJ3VzJyksICd1bml0JzogJ3VzJyB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHsgfVxuXG4gICAgLy8gZGV0ZWN0IGBwZXJmb3JtYW5jZS5ub3dgIG1pY3Jvc2Vjb25kIHJlc29sdXRpb24gdGltZXJcbiAgICBpZiAoKHRpbWVyLm5zID0gcGVyZk5hbWUgJiYgcGVyZk9iamVjdCkpIHtcbiAgICAgIHRpbWVycy5wdXNoKHsgJ25zJzogdGltZXIubnMsICdyZXMnOiBnZXRSZXMoJ3VzJyksICd1bml0JzogJ3VzJyB9KTtcbiAgICB9XG5cbiAgICAvLyBkZXRlY3QgTm9kZSdzIG5hbm9zZWNvbmQgcmVzb2x1dGlvbiB0aW1lciBhdmFpbGFibGUgaW4gTm9kZSA+PSAwLjhcbiAgICBpZiAocHJvY2Vzc09iamVjdCAmJiB0eXBlb2YgKHRpbWVyLm5zID0gcHJvY2Vzc09iamVjdC5ocnRpbWUpID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRpbWVycy5wdXNoKHsgJ25zJzogdGltZXIubnMsICdyZXMnOiBnZXRSZXMoJ25zJyksICd1bml0JzogJ25zJyB9KTtcbiAgICB9XG5cbiAgICAvLyBkZXRlY3QgV2FkZSBTaW1tb25zJyBOb2RlIG1pY3JvdGltZSBtb2R1bGVcbiAgICBpZiAobWljcm90aW1lT2JqZWN0ICYmIHR5cGVvZiAodGltZXIubnMgPSBtaWNyb3RpbWVPYmplY3Qubm93KSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aW1lcnMucHVzaCh7ICducyc6IHRpbWVyLm5zLCAgJ3Jlcyc6IGdldFJlcygndXMnKSwgJ3VuaXQnOiAndXMnIH0pO1xuICAgIH1cblxuICAgIC8vIHBpY2sgdGltZXIgd2l0aCBoaWdoZXN0IHJlc29sdXRpb25cbiAgICB0aW1lciA9IHJlZHVjZSh0aW1lcnMsIGZ1bmN0aW9uKHRpbWVyLCBvdGhlcikge1xuICAgICAgcmV0dXJuIG90aGVyLnJlcyA8IHRpbWVyLnJlcyA/IG90aGVyIDogdGltZXI7XG4gICAgfSk7XG5cbiAgICAvLyByZW1vdmUgdW51c2VkIGFwcGxldFxuICAgIGlmICh0aW1lci51bml0ICE9ICducycgJiYgYXBwbGV0KSB7XG4gICAgICBhcHBsZXQgPSBkZXN0cm95RWxlbWVudChhcHBsZXQpO1xuICAgIH1cbiAgICAvLyBlcnJvciBpZiB0aGVyZSBhcmUgbm8gd29ya2luZyB0aW1lcnNcbiAgICBpZiAodGltZXIucmVzID09IEluZmluaXR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JlbmNobWFyay5qcyB3YXMgdW5hYmxlIHRvIGZpbmQgYSB3b3JraW5nIHRpbWVyLicpO1xuICAgIH1cbiAgICAvLyB1c2UgQVBJIG9mIGNob3NlbiB0aW1lclxuICAgIGlmICh0aW1lci51bml0ID09ICducycpIHtcbiAgICAgIGlmICh0aW1lci5ucy5uYW5vVGltZSkge1xuICAgICAgICBleHRlbmQodGVtcGxhdGUsIHtcbiAgICAgICAgICAnYmVnaW4nOiAncyQ9biQubmFub1RpbWUoKScsXG4gICAgICAgICAgJ2VuZCc6ICdyJD0obiQubmFub1RpbWUoKS1zJCkvMWU5J1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4dGVuZCh0ZW1wbGF0ZSwge1xuICAgICAgICAgICdiZWdpbic6ICdzJD1uJCgpJyxcbiAgICAgICAgICAnZW5kJzogJ3IkPW4kKHMkKTtyJD1yJFswXSsociRbMV0vMWU5KSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbWVyLnVuaXQgPT0gJ3VzJykge1xuICAgICAgaWYgKHRpbWVyLm5zLnN0b3ApIHtcbiAgICAgICAgZXh0ZW5kKHRlbXBsYXRlLCB7XG4gICAgICAgICAgJ2JlZ2luJzogJ3MkPW4kLnN0YXJ0KCknLFxuICAgICAgICAgICdlbmQnOiAnciQ9biQubWljcm9zZWNvbmRzKCkvMWU2J1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAocGVyZk5hbWUpIHtcbiAgICAgICAgZXh0ZW5kKHRlbXBsYXRlLCB7XG4gICAgICAgICAgJ2JlZ2luJzogJ3MkPW4kLicgKyBwZXJmTmFtZSArICcoKScsXG4gICAgICAgICAgJ2VuZCc6ICdyJD0obiQuJyArIHBlcmZOYW1lICsgJygpLXMkKS8xZTMnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0ZW5kKHRlbXBsYXRlLCB7XG4gICAgICAgICAgJ2JlZ2luJzogJ3MkPW4kKCknLFxuICAgICAgICAgICdlbmQnOiAnciQ9KG4kKCktcyQpLzFlNidcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGVmaW5lIGB0aW1lcmAgbWV0aG9kc1xuICAgIHRpbWVyLnN0YXJ0ID0gY3JlYXRlRnVuY3Rpb24ocHJlcHJvY2VzcygnbyQnKSxcbiAgICAgIHByZXByb2Nlc3MoJ3ZhciBuJD10aGlzLm5zLCN7YmVnaW59O28kLmVsYXBzZWQ9MDtvJC50aW1lU3RhbXA9cyQnKSk7XG5cbiAgICB0aW1lci5zdG9wID0gY3JlYXRlRnVuY3Rpb24ocHJlcHJvY2VzcygnbyQnKSxcbiAgICAgIHByZXByb2Nlc3MoJ3ZhciBuJD10aGlzLm5zLHMkPW8kLnRpbWVTdGFtcCwje2VuZH07byQuZWxhcHNlZD1yJCcpKTtcblxuICAgIC8vIHJlc29sdmUgdGltZSBzcGFuIHJlcXVpcmVkIHRvIGFjaGlldmUgYSBwZXJjZW50IHVuY2VydGFpbnR5IG9mIGF0IG1vc3QgMSVcbiAgICAvLyBodHRwOi8vc3BpZmYucml0LmVkdS9jbGFzc2VzL3BoeXMyNzMvdW5jZXJ0L3VuY2VydC5odG1sXG4gICAgb3B0aW9ucy5taW5UaW1lIHx8IChvcHRpb25zLm1pblRpbWUgPSBtYXgodGltZXIucmVzIC8gMiAvIDAuMDEsIDAuMDUpKTtcbiAgICByZXR1cm4gY2xvY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBzdGF0cyBvbiBiZW5jaG1hcmsgcmVzdWx0cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGJlbmNoIFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICovXG4gIGZ1bmN0aW9uIGNvbXB1dGUoYmVuY2gsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgdmFyIGFzeW5jID0gb3B0aW9ucy5hc3luYyxcbiAgICAgICAgZWxhcHNlZCA9IDAsXG4gICAgICAgIGluaXRDb3VudCA9IGJlbmNoLmluaXRDb3VudCxcbiAgICAgICAgbWluU2FtcGxlcyA9IGJlbmNoLm1pblNhbXBsZXMsXG4gICAgICAgIHF1ZXVlID0gW10sXG4gICAgICAgIHNhbXBsZSA9IGJlbmNoLnN0YXRzLnNhbXBsZTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjbG9uZSB0byB0aGUgcXVldWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW5xdWV1ZSgpIHtcbiAgICAgIHF1ZXVlLnB1c2goYmVuY2guY2xvbmUoe1xuICAgICAgICAnX29yaWdpbmFsJzogYmVuY2gsXG4gICAgICAgICdldmVudHMnOiB7XG4gICAgICAgICAgJ2Fib3J0JzogW3VwZGF0ZV0sXG4gICAgICAgICAgJ2N5Y2xlJzogW3VwZGF0ZV0sXG4gICAgICAgICAgJ2Vycm9yJzogW3VwZGF0ZV0sXG4gICAgICAgICAgJ3N0YXJ0JzogW3VwZGF0ZV1cbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNsb25lL29yaWdpbmFsIGJlbmNobWFya3MgdG8ga2VlcCB0aGVpciBkYXRhIGluIHN5bmMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdXBkYXRlKGV2ZW50KSB7XG4gICAgICB2YXIgY2xvbmUgPSB0aGlzLFxuICAgICAgICAgIHR5cGUgPSBldmVudC50eXBlO1xuXG4gICAgICBpZiAoYmVuY2gucnVubmluZykge1xuICAgICAgICBpZiAodHlwZSA9PSAnc3RhcnQnKSB7XG4gICAgICAgICAgLy8gTm90ZTogYGNsb25lLm1pblRpbWVgIHByb3AgaXMgaW5pdGVkIGluIGBjbG9jaygpYFxuICAgICAgICAgIGNsb25lLmNvdW50ID0gYmVuY2guaW5pdENvdW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICh0eXBlID09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIGJlbmNoLmVycm9yID0gY2xvbmUuZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlID09ICdhYm9ydCcpIHtcbiAgICAgICAgICAgIGJlbmNoLmFib3J0KCk7XG4gICAgICAgICAgICBiZW5jaC5lbWl0KCdjeWNsZScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gZXZlbnQudGFyZ2V0ID0gYmVuY2g7XG4gICAgICAgICAgICBiZW5jaC5lbWl0KGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYmVuY2guYWJvcnRlZCkge1xuICAgICAgICAvLyBjbGVhciBhYm9ydCBsaXN0ZW5lcnMgdG8gYXZvaWQgdHJpZ2dlcmluZyBiZW5jaCdzIGFib3J0L2N5Y2xlIGFnYWluXG4gICAgICAgIGNsb25lLmV2ZW50cy5hYm9ydC5sZW5ndGggPSAwO1xuICAgICAgICBjbG9uZS5hYm9ydCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgaWYgbW9yZSBjbG9uZXMgc2hvdWxkIGJlIHF1ZXVlZCBvciBpZiBjeWNsaW5nIHNob3VsZCBzdG9wLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGV2YWx1YXRlKGV2ZW50KSB7XG4gICAgICB2YXIgY3JpdGljYWwsXG4gICAgICAgICAgZGYsXG4gICAgICAgICAgbWVhbixcbiAgICAgICAgICBtb2UsXG4gICAgICAgICAgcm1lLFxuICAgICAgICAgIHNkLFxuICAgICAgICAgIHNlbSxcbiAgICAgICAgICB2YXJpYW5jZSxcbiAgICAgICAgICBjbG9uZSA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICBkb25lID0gYmVuY2guYWJvcnRlZCxcbiAgICAgICAgICBub3cgPSArbmV3IERhdGUsXG4gICAgICAgICAgc2l6ZSA9IHNhbXBsZS5wdXNoKGNsb25lLnRpbWVzLnBlcmlvZCksXG4gICAgICAgICAgbWF4ZWRPdXQgPSBzaXplID49IG1pblNhbXBsZXMgJiYgKGVsYXBzZWQgKz0gbm93IC0gY2xvbmUudGltZXMudGltZVN0YW1wKSAvIDFlMyA+IGJlbmNoLm1heFRpbWUsXG4gICAgICAgICAgdGltZXMgPSBiZW5jaC50aW1lcyxcbiAgICAgICAgICB2YXJPZiA9IGZ1bmN0aW9uKHN1bSwgeCkgeyByZXR1cm4gc3VtICsgcG93KHggLSBtZWFuLCAyKTsgfTtcblxuICAgICAgLy8gZXhpdCBlYXJseSBmb3IgYWJvcnRlZCBvciB1bmNsb2NrYWJsZSB0ZXN0c1xuICAgICAgaWYgKGRvbmUgfHwgY2xvbmUuaHogPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbWF4ZWRPdXQgPSAhKHNpemUgPSBzYW1wbGUubGVuZ3RoID0gcXVldWUubGVuZ3RoID0gMCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAvLyBzYW1wbGUgbWVhbiAoZXN0aW1hdGUgb2YgdGhlIHBvcHVsYXRpb24gbWVhbilcbiAgICAgICAgbWVhbiA9IGdldE1lYW4oc2FtcGxlKTtcbiAgICAgICAgLy8gc2FtcGxlIHZhcmlhbmNlIChlc3RpbWF0ZSBvZiB0aGUgcG9wdWxhdGlvbiB2YXJpYW5jZSlcbiAgICAgICAgdmFyaWFuY2UgPSByZWR1Y2Uoc2FtcGxlLCB2YXJPZiwgMCkgLyAoc2l6ZSAtIDEpIHx8IDA7XG4gICAgICAgIC8vIHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb24gKGVzdGltYXRlIG9mIHRoZSBwb3B1bGF0aW9uIHN0YW5kYXJkIGRldmlhdGlvbilcbiAgICAgICAgc2QgPSBzcXJ0KHZhcmlhbmNlKTtcbiAgICAgICAgLy8gc3RhbmRhcmQgZXJyb3Igb2YgdGhlIG1lYW4gKGEuay5hLiB0aGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBzYW1wbGluZyBkaXN0cmlidXRpb24gb2YgdGhlIHNhbXBsZSBtZWFuKVxuICAgICAgICBzZW0gPSBzZCAvIHNxcnQoc2l6ZSk7XG4gICAgICAgIC8vIGRlZ3JlZXMgb2YgZnJlZWRvbVxuICAgICAgICBkZiA9IHNpemUgLSAxO1xuICAgICAgICAvLyBjcml0aWNhbCB2YWx1ZVxuICAgICAgICBjcml0aWNhbCA9IHRUYWJsZVtNYXRoLnJvdW5kKGRmKSB8fCAxXSB8fCB0VGFibGUuaW5maW5pdHk7XG4gICAgICAgIC8vIG1hcmdpbiBvZiBlcnJvclxuICAgICAgICBtb2UgPSBzZW0gKiBjcml0aWNhbDtcbiAgICAgICAgLy8gcmVsYXRpdmUgbWFyZ2luIG9mIGVycm9yXG4gICAgICAgIHJtZSA9IChtb2UgLyBtZWFuKSAqIDEwMCB8fCAwO1xuXG4gICAgICAgIGV4dGVuZChiZW5jaC5zdGF0cywge1xuICAgICAgICAgICdkZXZpYXRpb24nOiBzZCxcbiAgICAgICAgICAnbWVhbic6IG1lYW4sXG4gICAgICAgICAgJ21vZSc6IG1vZSxcbiAgICAgICAgICAncm1lJzogcm1lLFxuICAgICAgICAgICdzZW0nOiBzZW0sXG4gICAgICAgICAgJ3ZhcmlhbmNlJzogdmFyaWFuY2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWJvcnQgdGhlIGN5Y2xlIGxvb3Agd2hlbiB0aGUgbWluaW11bSBzYW1wbGUgc2l6ZSBoYXMgYmVlbiBjb2xsZWN0ZWRcbiAgICAgICAgLy8gYW5kIHRoZSBlbGFwc2VkIHRpbWUgZXhjZWVkcyB0aGUgbWF4aW11bSB0aW1lIGFsbG93ZWQgcGVyIGJlbmNobWFyay5cbiAgICAgICAgLy8gV2UgZG9uJ3QgY291bnQgY3ljbGUgZGVsYXlzIHRvd2FyZCB0aGUgbWF4IHRpbWUgYmVjYXVzZSBkZWxheXMgbWF5IGJlXG4gICAgICAgIC8vIGluY3JlYXNlZCBieSBicm93c2VycyB0aGF0IGNsYW1wIHRpbWVvdXRzIGZvciBpbmFjdGl2ZSB0YWJzLlxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi93aW5kb3cuc2V0VGltZW91dCNJbmFjdGl2ZV90YWJzXG4gICAgICAgIGlmIChtYXhlZE91dCkge1xuICAgICAgICAgIC8vIHJlc2V0IHRoZSBgaW5pdENvdW50YCBpbiBjYXNlIHRoZSBiZW5jaG1hcmsgaXMgcmVydW5cbiAgICAgICAgICBiZW5jaC5pbml0Q291bnQgPSBpbml0Q291bnQ7XG4gICAgICAgICAgYmVuY2gucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgIHRpbWVzLmVsYXBzZWQgPSAobm93IC0gdGltZXMudGltZVN0YW1wKSAvIDFlMztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmVuY2guaHogIT0gSW5maW5pdHkpIHtcbiAgICAgICAgICBiZW5jaC5oeiA9IDEgLyBtZWFuO1xuICAgICAgICAgIHRpbWVzLmN5Y2xlID0gbWVhbiAqIGJlbmNoLmNvdW50O1xuICAgICAgICAgIHRpbWVzLnBlcmlvZCA9IG1lYW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlmIHRpbWUgcGVybWl0cywgaW5jcmVhc2Ugc2FtcGxlIHNpemUgdG8gcmVkdWNlIHRoZSBtYXJnaW4gb2YgZXJyb3JcbiAgICAgIGlmIChxdWV1ZS5sZW5ndGggPCAyICYmICFtYXhlZE91dCkge1xuICAgICAgICBlbnF1ZXVlKCk7XG4gICAgICB9XG4gICAgICAvLyBhYm9ydCB0aGUgaW52b2tlIGN5Y2xlIHdoZW4gZG9uZVxuICAgICAgZXZlbnQuYWJvcnRlZCA9IGRvbmU7XG4gICAgfVxuXG4gICAgLy8gaW5pdCBxdWV1ZSBhbmQgYmVnaW5cbiAgICBlbnF1ZXVlKCk7XG4gICAgaW52b2tlKHF1ZXVlLCB7XG4gICAgICAnbmFtZSc6ICdydW4nLFxuICAgICAgJ2FyZ3MnOiB7ICdhc3luYyc6IGFzeW5jIH0sXG4gICAgICAncXVldWVkJzogdHJ1ZSxcbiAgICAgICdvbkN5Y2xlJzogZXZhbHVhdGUsXG4gICAgICAnb25Db21wbGV0ZSc6IGZ1bmN0aW9uKCkgeyBiZW5jaC5lbWl0KCdjb21wbGV0ZScpOyB9XG4gICAgfSk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3ljbGVzIGEgYmVuY2htYXJrIHVudGlsIGEgcnVuIGBjb3VudGAgY2FuIGJlIGVzdGFibGlzaGVkLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY2xvbmUgVGhlIGNsb25lZCBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICovXG4gIGZ1bmN0aW9uIGN5Y2xlKGNsb25lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIHZhciBkZWZlcnJlZDtcbiAgICBpZiAoY2xvbmUgaW5zdGFuY2VvZiBEZWZlcnJlZCkge1xuICAgICAgZGVmZXJyZWQgPSBjbG9uZTtcbiAgICAgIGNsb25lID0gY2xvbmUuYmVuY2htYXJrO1xuICAgIH1cblxuICAgIHZhciBjbG9ja2VkLFxuICAgICAgICBjeWNsZXMsXG4gICAgICAgIGRpdmlzb3IsXG4gICAgICAgIGV2ZW50LFxuICAgICAgICBtaW5UaW1lLFxuICAgICAgICBwZXJpb2QsXG4gICAgICAgIGFzeW5jID0gb3B0aW9ucy5hc3luYyxcbiAgICAgICAgYmVuY2ggPSBjbG9uZS5fb3JpZ2luYWwsXG4gICAgICAgIGNvdW50ID0gY2xvbmUuY291bnQsXG4gICAgICAgIHRpbWVzID0gY2xvbmUudGltZXM7XG5cbiAgICAvLyBjb250aW51ZSwgaWYgbm90IGFib3J0ZWQgYmV0d2VlbiBjeWNsZXNcbiAgICBpZiAoY2xvbmUucnVubmluZykge1xuICAgICAgLy8gYG1pblRpbWVgIGlzIHNldCB0byBgQmVuY2htYXJrLm9wdGlvbnMubWluVGltZWAgaW4gYGNsb2NrKClgXG4gICAgICBjeWNsZXMgPSArK2Nsb25lLmN5Y2xlcztcbiAgICAgIGNsb2NrZWQgPSBkZWZlcnJlZCA/IGRlZmVycmVkLmVsYXBzZWQgOiBjbG9jayhjbG9uZSk7XG4gICAgICBtaW5UaW1lID0gY2xvbmUubWluVGltZTtcblxuICAgICAgaWYgKGN5Y2xlcyA+IGJlbmNoLmN5Y2xlcykge1xuICAgICAgICBiZW5jaC5jeWNsZXMgPSBjeWNsZXM7XG4gICAgICB9XG4gICAgICBpZiAoY2xvbmUuZXJyb3IpIHtcbiAgICAgICAgZXZlbnQgPSBFdmVudCgnZXJyb3InKTtcbiAgICAgICAgZXZlbnQubWVzc2FnZSA9IGNsb25lLmVycm9yO1xuICAgICAgICBjbG9uZS5lbWl0KGV2ZW50KTtcbiAgICAgICAgaWYgKCFldmVudC5jYW5jZWxsZWQpIHtcbiAgICAgICAgICBjbG9uZS5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29udGludWUsIGlmIG5vdCBlcnJvcmVkXG4gICAgaWYgKGNsb25lLnJ1bm5pbmcpIHtcbiAgICAgIC8vIHRpbWUgdGFrZW4gdG8gY29tcGxldGUgbGFzdCB0ZXN0IGN5Y2xlXG4gICAgICBiZW5jaC50aW1lcy5jeWNsZSA9IHRpbWVzLmN5Y2xlID0gY2xvY2tlZDtcbiAgICAgIC8vIHNlY29uZHMgcGVyIG9wZXJhdGlvblxuICAgICAgcGVyaW9kID0gYmVuY2gudGltZXMucGVyaW9kID0gdGltZXMucGVyaW9kID0gY2xvY2tlZCAvIGNvdW50O1xuICAgICAgLy8gb3BzIHBlciBzZWNvbmRcbiAgICAgIGJlbmNoLmh6ID0gY2xvbmUuaHogPSAxIC8gcGVyaW9kO1xuICAgICAgLy8gYXZvaWQgd29ya2luZyBvdXIgd2F5IHVwIHRvIHRoaXMgbmV4dCB0aW1lXG4gICAgICBiZW5jaC5pbml0Q291bnQgPSBjbG9uZS5pbml0Q291bnQgPSBjb3VudDtcbiAgICAgIC8vIGRvIHdlIG5lZWQgdG8gZG8gYW5vdGhlciBjeWNsZT9cbiAgICAgIGNsb25lLnJ1bm5pbmcgPSBjbG9ja2VkIDwgbWluVGltZTtcblxuICAgICAgaWYgKGNsb25lLnJ1bm5pbmcpIHtcbiAgICAgICAgLy8gdGVzdHMgbWF5IGNsb2NrIGF0IGAwYCB3aGVuIGBpbml0Q291bnRgIGlzIGEgc21hbGwgbnVtYmVyLFxuICAgICAgICAvLyB0byBhdm9pZCB0aGF0IHdlIHNldCBpdHMgY291bnQgdG8gc29tZXRoaW5nIGEgYml0IGhpZ2hlclxuICAgICAgICBpZiAoIWNsb2NrZWQgJiYgKGRpdmlzb3IgPSBkaXZpc29yc1tjbG9uZS5jeWNsZXNdKSAhPSBudWxsKSB7XG4gICAgICAgICAgY291bnQgPSBmbG9vcig0ZTYgLyBkaXZpc29yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjYWxjdWxhdGUgaG93IG1hbnkgbW9yZSBpdGVyYXRpb25zIGl0IHdpbGwgdGFrZSB0byBhY2hpdmUgdGhlIGBtaW5UaW1lYFxuICAgICAgICBpZiAoY291bnQgPD0gY2xvbmUuY291bnQpIHtcbiAgICAgICAgICBjb3VudCArPSBNYXRoLmNlaWwoKG1pblRpbWUgLSBjbG9ja2VkKSAvIHBlcmlvZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2xvbmUucnVubmluZyA9IGNvdW50ICE9IEluZmluaXR5O1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBzaG91bGQgd2UgZXhpdCBlYXJseT9cbiAgICBldmVudCA9IEV2ZW50KCdjeWNsZScpO1xuICAgIGNsb25lLmVtaXQoZXZlbnQpO1xuICAgIGlmIChldmVudC5hYm9ydGVkKSB7XG4gICAgICBjbG9uZS5hYm9ydCgpO1xuICAgIH1cbiAgICAvLyBmaWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dFxuICAgIGlmIChjbG9uZS5ydW5uaW5nKSB7XG4gICAgICAvLyBzdGFydCBhIG5ldyBjeWNsZVxuICAgICAgY2xvbmUuY291bnQgPSBjb3VudDtcbiAgICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgICBjbG9uZS5jb21waWxlZC5jYWxsKGRlZmVycmVkLCB0aW1lcik7XG4gICAgICB9IGVsc2UgaWYgKGFzeW5jKSB7XG4gICAgICAgIGRlbGF5KGNsb25lLCBmdW5jdGlvbigpIHsgY3ljbGUoY2xvbmUsIG9wdGlvbnMpOyB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN5Y2xlKGNsb25lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBmaXggVHJhY2VNb25rZXkgYnVnIGFzc29jaWF0ZWQgd2l0aCBjbG9jayBmYWxsYmFja3NcbiAgICAgIC8vIGh0dHA6Ly9idWd6aWwubGEvNTA5MDY5XG4gICAgICBpZiAoc3VwcG9ydC5icm93c2VyKSB7XG4gICAgICAgIHJ1blNjcmlwdCh1aWQgKyAnPTE7ZGVsZXRlICcgKyB1aWQpO1xuICAgICAgfVxuICAgICAgLy8gZG9uZVxuICAgICAgY2xvbmUuZW1pdCgnY29tcGxldGUnKTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogUnVucyB0aGUgYmVuY2htYXJrLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBiZW5jaG1hcmsgaW5zdGFuY2UuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIC8vIGJhc2ljIHVzYWdlXG4gICAqIGJlbmNoLnJ1bigpO1xuICAgKlxuICAgKiAvLyBvciB3aXRoIG9wdGlvbnNcbiAgICogYmVuY2gucnVuKHsgJ2FzeW5jJzogdHJ1ZSB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIHJ1bihvcHRpb25zKSB7XG4gICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgZXZlbnQgPSBFdmVudCgnc3RhcnQnKTtcblxuICAgIC8vIHNldCBgcnVubmluZ2AgdG8gYGZhbHNlYCBzbyBgcmVzZXQoKWAgd29uJ3QgY2FsbCBgYWJvcnQoKWBcbiAgICBtZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgbWUucmVzZXQoKTtcbiAgICBtZS5ydW5uaW5nID0gdHJ1ZTtcblxuICAgIG1lLmNvdW50ID0gbWUuaW5pdENvdW50O1xuICAgIG1lLnRpbWVzLnRpbWVTdGFtcCA9ICtuZXcgRGF0ZTtcbiAgICBtZS5lbWl0KGV2ZW50KTtcblxuICAgIGlmICghZXZlbnQuY2FuY2VsbGVkKSB7XG4gICAgICBvcHRpb25zID0geyAnYXN5bmMnOiAoKG9wdGlvbnMgPSBvcHRpb25zICYmIG9wdGlvbnMuYXN5bmMpID09IG51bGwgPyBtZS5hc3luYyA6IG9wdGlvbnMpICYmIHN1cHBvcnQudGltZW91dCB9O1xuXG4gICAgICAvLyBmb3IgY2xvbmVzIGNyZWF0ZWQgd2l0aGluIGBjb21wdXRlKClgXG4gICAgICBpZiAobWUuX29yaWdpbmFsKSB7XG4gICAgICAgIGlmIChtZS5kZWZlcikge1xuICAgICAgICAgIERlZmVycmVkKG1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeWNsZShtZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGZvciBvcmlnaW5hbCBiZW5jaG1hcmtzXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29tcHV0ZShtZSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8vIEZpcmVmb3ggMSBlcnJvbmVvdXNseSBkZWZpbmVzIHZhcmlhYmxlIGFuZCBhcmd1bWVudCBuYW1lcyBvZiBmdW5jdGlvbnMgb25cbiAgLy8gdGhlIGZ1bmN0aW9uIGl0c2VsZiBhcyBub24tY29uZmlndXJhYmxlIHByb3BlcnRpZXMgd2l0aCBgdW5kZWZpbmVkYCB2YWx1ZXMuXG4gIC8vIFRoZSBidWdnaW5lc3MgY29udGludWVzIGFzIHRoZSBgQmVuY2htYXJrYCBjb25zdHJ1Y3RvciBoYXMgYW4gYXJndW1lbnRcbiAgLy8gbmFtZWQgYG9wdGlvbnNgIGFuZCBGaXJlZm94IDEgd2lsbCBub3QgYXNzaWduIGEgdmFsdWUgdG8gYEJlbmNobWFyay5vcHRpb25zYCxcbiAgLy8gbWFraW5nIGl0IG5vbi13cml0YWJsZSBpbiB0aGUgcHJvY2VzcywgdW5sZXNzIGl0IGlzIHRoZSBmaXJzdCBwcm9wZXJ0eVxuICAvLyBhc3NpZ25lZCBieSBmb3ItaW4gbG9vcCBvZiBgZXh0ZW5kKClgLlxuICBleHRlbmQoQmVuY2htYXJrLCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBvcHRpb25zIGNvcGllZCBieSBiZW5jaG1hcmsgaW5zdGFuY2VzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnb3B0aW9ucyc6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBiZW5jaG1hcmsgY3ljbGVzIHdpbGwgZXhlY3V0ZSBhc3luY2hyb25vdXNseVxuICAgICAgICogYnkgZGVmYXVsdC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgICAqL1xuICAgICAgJ2FzeW5jJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIGJlbmNobWFyayBjbG9jayBpcyBkZWZlcnJlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgICAqL1xuICAgICAgJ2RlZmVyJzogZmFsc2UsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlbGF5IGJldHdlZW4gdGVzdCBjeWNsZXMgKHNlY3MpLlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ2RlbGF5JzogMC4wMDUsXG5cbiAgICAgIC8qKlxuICAgICAgICogRGlzcGxheWVkIGJ5IEJlbmNobWFyayN0b1N0cmluZyB3aGVuIGEgYG5hbWVgIGlzIG5vdCBhdmFpbGFibGVcbiAgICAgICAqIChhdXRvLWdlbmVyYXRlZCBpZiBhYnNlbnQpLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgU3RyaW5nXG4gICAgICAgKi9cbiAgICAgICdpZCc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZGVmYXVsdCBudW1iZXIgb2YgdGltZXMgdG8gZXhlY3V0ZSBhIHRlc3Qgb24gYSBiZW5jaG1hcmsncyBmaXJzdCBjeWNsZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnaW5pdENvdW50JzogMSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWF4aW11bSB0aW1lIGEgYmVuY2htYXJrIGlzIGFsbG93ZWQgdG8gcnVuIGJlZm9yZSBmaW5pc2hpbmcgKHNlY3MpLlxuICAgICAgICogTm90ZTogQ3ljbGUgZGVsYXlzIGFyZW4ndCBjb3VudGVkIHRvd2FyZCB0aGUgbWF4aW11bSB0aW1lLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdtYXhUaW1lJzogNSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWluaW11bSBzYW1wbGUgc2l6ZSByZXF1aXJlZCB0byBwZXJmb3JtIHN0YXRpc3RpY2FsIGFuYWx5c2lzLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdtaW5TYW1wbGVzJzogNSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGltZSBuZWVkZWQgdG8gcmVkdWNlIHRoZSBwZXJjZW50IHVuY2VydGFpbnR5IG9mIG1lYXN1cmVtZW50IHRvIDElIChzZWNzKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnbWluVGltZSc6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGJlbmNobWFyay5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICovXG4gICAgICAnbmFtZSc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIGlzIGFib3J0ZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICovXG4gICAgICAnb25BYm9ydCc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIGNvbXBsZXRlcyBydW5uaW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ29uQ29tcGxldGUnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIGFmdGVyIGVhY2ggcnVuIGN5Y2xlLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ29uQ3ljbGUnOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQW4gZXZlbnQgbGlzdGVuZXIgY2FsbGVkIHdoZW4gYSB0ZXN0IGVycm9ycy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLm9wdGlvbnNcbiAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgKi9cbiAgICAgICdvbkVycm9yJzogdW5kZWZpbmVkLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFuIGV2ZW50IGxpc3RlbmVyIGNhbGxlZCB3aGVuIHRoZSBiZW5jaG1hcmsgaXMgcmVzZXQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5vcHRpb25zXG4gICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICovXG4gICAgICAnb25SZXNldCc6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBBbiBldmVudCBsaXN0ZW5lciBjYWxsZWQgd2hlbiB0aGUgYmVuY2htYXJrIHN0YXJ0cyBydW5uaW5nLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsub3B0aW9uc1xuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ29uU3RhcnQnOiB1bmRlZmluZWRcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGxhdGZvcm0gb2JqZWN0IHdpdGggcHJvcGVydGllcyBkZXNjcmliaW5nIHRoaW5ncyBsaWtlIGJyb3dzZXIgbmFtZSxcbiAgICAgKiB2ZXJzaW9uLCBhbmQgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgJ3BsYXRmb3JtJzogcmVxKCdwbGF0Zm9ybScpIHx8IHdpbmRvdy5wbGF0Zm9ybSB8fCB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHBsYXRmb3JtIGRlc2NyaXB0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICovXG4gICAgICAnZGVzY3JpcHRpb24nOiB3aW5kb3cubmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgYnJvd3NlciBsYXlvdXQgZW5naW5lLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ3xOdWxsXG4gICAgICAgKi9cbiAgICAgICdsYXlvdXQnOiBudWxsLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBwcm9kdWN0IGhvc3RpbmcgdGhlIGJyb3dzZXIuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5wbGF0Zm9ybVxuICAgICAgICogQHR5cGUgU3RyaW5nfE51bGxcbiAgICAgICAqL1xuICAgICAgJ3Byb2R1Y3QnOiBudWxsLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBicm93c2VyL2Vudmlyb25tZW50LlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ3xOdWxsXG4gICAgICAgKi9cbiAgICAgICduYW1lJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgcHJvZHVjdCdzIG1hbnVmYWN0dXJlci5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAnbWFudWZhY3R1cmVyJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLnBsYXRmb3JtXG4gICAgICAgKiBAdHlwZSBTdHJpbmd8TnVsbFxuICAgICAgICovXG4gICAgICAnb3MnOiBudWxsLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBhbHBoYS9iZXRhIHJlbGVhc2UgaW5kaWNhdG9yLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ3xOdWxsXG4gICAgICAgKi9cbiAgICAgICdwcmVyZWxlYXNlJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgYnJvd3Nlci9lbnZpcm9ubWVudCB2ZXJzaW9uLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsucGxhdGZvcm1cbiAgICAgICAqIEB0eXBlIFN0cmluZ3xOdWxsXG4gICAgICAgKi9cbiAgICAgICd2ZXJzaW9uJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm4gcGxhdGZvcm0gZGVzY3JpcHRpb24gd2hlbiB0aGUgcGxhdGZvcm0gb2JqZWN0IGlzIGNvZXJjZWQgdG8gYSBzdHJpbmcuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyay5wbGF0Zm9ybVxuICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBwbGF0Zm9ybSBkZXNjcmlwdGlvbi5cbiAgICAgICAqL1xuICAgICAgJ3RvU3RyaW5nJzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlc2NyaXB0aW9uIHx8ICcnO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VtYW50aWMgdmVyc2lvbiBudW1iZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAqL1xuICAgICd2ZXJzaW9uJzogJzEuMC4wJyxcblxuICAgIC8vIGFuIG9iamVjdCBvZiBlbnZpcm9ubWVudC9mZWF0dXJlIGRldGVjdGlvbiBmbGFnc1xuICAgICdzdXBwb3J0Jzogc3VwcG9ydCxcblxuICAgIC8vIGNsb25lIG9iamVjdHNcbiAgICAnZGVlcENsb25lJzogZGVlcENsb25lLFxuXG4gICAgLy8gaXRlcmF0aW9uIHV0aWxpdHlcbiAgICAnZWFjaCc6IGVhY2gsXG5cbiAgICAvLyBhdWdtZW50IG9iamVjdHNcbiAgICAnZXh0ZW5kJzogZXh0ZW5kLFxuXG4gICAgLy8gZ2VuZXJpYyBBcnJheSNmaWx0ZXJcbiAgICAnZmlsdGVyJzogZmlsdGVyLFxuXG4gICAgLy8gZ2VuZXJpYyBBcnJheSNmb3JFYWNoXG4gICAgJ2ZvckVhY2gnOiBmb3JFYWNoLFxuXG4gICAgLy8gZ2VuZXJpYyBvd24gcHJvcGVydHkgaXRlcmF0aW9uIHV0aWxpdHlcbiAgICAnZm9yT3duJzogZm9yT3duLFxuXG4gICAgLy8gY29udmVydHMgYSBudW1iZXIgdG8gYSBjb21tYS1zZXBhcmF0ZWQgc3RyaW5nXG4gICAgJ2Zvcm1hdE51bWJlcic6IGZvcm1hdE51bWJlcixcblxuICAgIC8vIGdlbmVyaWMgT2JqZWN0I2hhc093blByb3BlcnR5XG4gICAgLy8gKHRyaWdnZXIgaGFzS2V5J3MgbGF6eSBkZWZpbmUgYmVmb3JlIGFzc2lnbmluZyBpdCB0byBCZW5jaG1hcmspXG4gICAgJ2hhc0tleSc6IChoYXNLZXkoQmVuY2htYXJrLCAnJyksIGhhc0tleSksXG5cbiAgICAvLyBnZW5lcmljIEFycmF5I2luZGV4T2ZcbiAgICAnaW5kZXhPZic6IGluZGV4T2YsXG5cbiAgICAvLyB0ZW1wbGF0ZSB1dGlsaXR5XG4gICAgJ2ludGVycG9sYXRlJzogaW50ZXJwb2xhdGUsXG5cbiAgICAvLyBpbnZva2VzIGEgbWV0aG9kIG9uIGVhY2ggaXRlbSBpbiBhbiBhcnJheVxuICAgICdpbnZva2UnOiBpbnZva2UsXG5cbiAgICAvLyBnZW5lcmljIEFycmF5I2pvaW4gZm9yIGFycmF5cyBhbmQgb2JqZWN0c1xuICAgICdqb2luJzogam9pbixcblxuICAgIC8vIGdlbmVyaWMgQXJyYXkjbWFwXG4gICAgJ21hcCc6IG1hcCxcblxuICAgIC8vIHJldHJpZXZlcyBhIHByb3BlcnR5IHZhbHVlIGZyb20gZWFjaCBpdGVtIGluIGFuIGFycmF5XG4gICAgJ3BsdWNrJzogcGx1Y2ssXG5cbiAgICAvLyBnZW5lcmljIEFycmF5I3JlZHVjZVxuICAgICdyZWR1Y2UnOiByZWR1Y2VcbiAgfSk7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgZXh0ZW5kKEJlbmNobWFyay5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgdGltZXMgYSB0ZXN0IHdhcyBleGVjdXRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnY291bnQnOiAwLFxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBjeWNsZXMgcGVyZm9ybWVkIHdoaWxlIGJlbmNobWFya2luZy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnY3ljbGVzJzogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgZXhlY3V0aW9ucyBwZXIgc2Vjb25kLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIE51bWJlclxuICAgICAqL1xuICAgICdoeic6IDAsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcGlsZWQgdGVzdCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBGdW5jdGlvbnxTdHJpbmdcbiAgICAgKi9cbiAgICAnY29tcGlsZWQnOiB1bmRlZmluZWQsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXJyb3Igb2JqZWN0IGlmIHRoZSB0ZXN0IGZhaWxlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnZXJyb3InOiB1bmRlZmluZWQsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGVzdCB0byBiZW5jaG1hcmsuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgRnVuY3Rpb258U3RyaW5nXG4gICAgICovXG4gICAgJ2ZuJzogdW5kZWZpbmVkLFxuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIHRoZSBiZW5jaG1hcmsgaXMgYWJvcnRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgJ2Fib3J0ZWQnOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgYmVuY2htYXJrIGlzIHJ1bm5pbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgQm9vbGVhblxuICAgICAqL1xuICAgICdydW5uaW5nJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBDb21waWxlZCBpbnRvIHRoZSB0ZXN0IGFuZCBleGVjdXRlZCBpbW1lZGlhdGVseSAqKmJlZm9yZSoqIHRoZSB0ZXN0IGxvb3AuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrXG4gICAgICogQHR5cGUgRnVuY3Rpb258U3RyaW5nXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGJhc2ljIHVzYWdlXG4gICAgICogdmFyIGJlbmNoID0gQmVuY2htYXJrKHtcbiAgICAgKiAgICdzZXR1cCc6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICB2YXIgYyA9IHRoaXMuY291bnQsXG4gICAgICogICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAqICAgICB3aGlsZSAoYy0tKSB7XG4gICAgICogICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XG4gICAgICogICAgIH1cbiAgICAgKiAgIH0sXG4gICAgICogICAnZm4nOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBjb21waWxlcyB0byBzb21ldGhpbmcgbGlrZTpcbiAgICAgKiB2YXIgYyA9IHRoaXMuY291bnQsXG4gICAgICogICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICogd2hpbGUgKGMtLSkge1xuICAgICAqICAgZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XG4gICAgICogfVxuICAgICAqIHZhciBzdGFydCA9IG5ldyBEYXRlO1xuICAgICAqIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICogICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQubGFzdENoaWxkKTtcbiAgICAgKiB9XG4gICAgICogdmFyIGVuZCA9IG5ldyBEYXRlIC0gc3RhcnQ7XG4gICAgICpcbiAgICAgKiAvLyBvciB1c2luZyBzdHJpbmdzXG4gICAgICogdmFyIGJlbmNoID0gQmVuY2htYXJrKHtcbiAgICAgKiAgICdzZXR1cCc6ICdcXFxuICAgICAqICAgICB2YXIgYSA9IDA7XFxuXFxcbiAgICAgKiAgICAgKGZ1bmN0aW9uKCkge1xcblxcXG4gICAgICogICAgICAgKGZ1bmN0aW9uKCkge1xcblxcXG4gICAgICogICAgICAgICAoZnVuY3Rpb24oKSB7JyxcbiAgICAgKiAgICdmbic6ICdhICs9IDE7JyxcbiAgICAgKiAgICd0ZWFyZG93bic6ICdcXFxuICAgICAqICAgICAgICAgIH0oKSlcXG5cXFxuICAgICAqICAgICAgICB9KCkpXFxuXFxcbiAgICAgKiAgICAgIH0oKSknXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBjb21waWxlcyB0byBzb21ldGhpbmcgbGlrZTpcbiAgICAgKiB2YXIgYSA9IDA7XG4gICAgICogKGZ1bmN0aW9uKCkge1xuICAgICAqICAgKGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgdmFyIHN0YXJ0ID0gbmV3IERhdGU7XG4gICAgICogICAgICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgKiAgICAgICAgIGEgKz0gMTtcbiAgICAgKiAgICAgICB9XG4gICAgICogICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlIC0gc3RhcnQ7XG4gICAgICogICAgIH0oKSlcbiAgICAgKiAgIH0oKSlcbiAgICAgKiB9KCkpXG4gICAgICovXG4gICAgJ3NldHVwJzogbm9vcCxcblxuICAgIC8qKlxuICAgICAqIENvbXBpbGVkIGludG8gdGhlIHRlc3QgYW5kIGV4ZWN1dGVkIGltbWVkaWF0ZWx5ICoqYWZ0ZXIqKiB0aGUgdGVzdCBsb29wLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFya1xuICAgICAqIEB0eXBlIEZ1bmN0aW9ufFN0cmluZ1xuICAgICAqL1xuICAgICd0ZWFyZG93bic6IG5vb3AsXG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3Qgb2Ygc3RhdHMgaW5jbHVkaW5nIG1lYW4sIG1hcmdpbiBvciBlcnJvciwgYW5kIHN0YW5kYXJkIGRldmlhdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnc3RhdHMnOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1hcmdpbiBvZiBlcnJvci5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ21vZSc6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHJlbGF0aXZlIG1hcmdpbiBvZiBlcnJvciAoZXhwcmVzc2VkIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgbWVhbikuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdybWUnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBzdGFuZGFyZCBlcnJvciBvZiB0aGUgbWVhbi5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ3NlbSc6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb24uXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIEJlbmNobWFyayNzdGF0c1xuICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgKi9cbiAgICAgICdkZXZpYXRpb24nOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBzYW1wbGUgYXJpdGhtZXRpYyBtZWFuLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjc3RhdHNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnbWVhbic6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGFycmF5IG9mIHNhbXBsZWQgcGVyaW9kcy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgKiBAdHlwZSBBcnJheVxuICAgICAgICovXG4gICAgICAnc2FtcGxlJzogW10sXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHNhbXBsZSB2YXJpYW5jZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3N0YXRzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ3ZhcmlhbmNlJzogMFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3Qgb2YgdGltaW5nIGRhdGEgaW5jbHVkaW5nIGN5Y2xlLCBlbGFwc2VkLCBwZXJpb2QsIHN0YXJ0LCBhbmQgc3RvcC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmtcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAndGltZXMnOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHRpbWUgdGFrZW4gdG8gY29tcGxldGUgdGhlIGxhc3QgY3ljbGUgKHNlY3MpLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjdGltZXNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnY3ljbGUnOiAwLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIHRoZSBiZW5jaG1hcmsgKHNlY3MpLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsjdGltZXNcbiAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICovXG4gICAgICAnZWxhcHNlZCc6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHRpbWUgdGFrZW4gdG8gZXhlY3V0ZSB0aGUgdGVzdCBvbmNlIChzZWNzKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ3BlcmlvZCc6IDAsXG5cbiAgICAgIC8qKlxuICAgICAgICogQSB0aW1lc3RhbXAgb2Ygd2hlbiB0aGUgYmVuY2htYXJrIHN0YXJ0ZWQgKG1zKS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrI3RpbWVzXG4gICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAqL1xuICAgICAgJ3RpbWVTdGFtcCc6IDBcbiAgICB9LFxuXG4gICAgLy8gYWJvcnRzIGJlbmNobWFyayAoZG9lcyBub3QgcmVjb3JkIHRpbWVzKVxuICAgICdhYm9ydCc6IGFib3J0LFxuXG4gICAgLy8gY3JlYXRlcyBhIG5ldyBiZW5jaG1hcmsgdXNpbmcgdGhlIHNhbWUgdGVzdCBhbmQgb3B0aW9uc1xuICAgICdjbG9uZSc6IGNsb25lLFxuXG4gICAgLy8gY29tcGFyZXMgYmVuY2htYXJrJ3MgaGVydHogd2l0aCBhbm90aGVyXG4gICAgJ2NvbXBhcmUnOiBjb21wYXJlLFxuXG4gICAgLy8gZXhlY3V0ZXMgbGlzdGVuZXJzXG4gICAgJ2VtaXQnOiBlbWl0LFxuXG4gICAgLy8gZ2V0IGxpc3RlbmVyc1xuICAgICdsaXN0ZW5lcnMnOiBsaXN0ZW5lcnMsXG5cbiAgICAvLyB1bnJlZ2lzdGVyIGxpc3RlbmVyc1xuICAgICdvZmYnOiBvZmYsXG5cbiAgICAvLyByZWdpc3RlciBsaXN0ZW5lcnNcbiAgICAnb24nOiBvbixcblxuICAgIC8vIHJlc2V0IGJlbmNobWFyayBwcm9wZXJ0aWVzXG4gICAgJ3Jlc2V0JzogcmVzZXQsXG5cbiAgICAvLyBydW5zIHRoZSBiZW5jaG1hcmtcbiAgICAncnVuJzogcnVuLFxuXG4gICAgLy8gcHJldHR5IHByaW50IGJlbmNobWFyayBpbmZvXG4gICAgJ3RvU3RyaW5nJzogdG9TdHJpbmdCZW5jaFxuICB9KTtcblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICBleHRlbmQoRGVmZXJyZWQucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmZXJyZWQgYmVuY2htYXJrIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5EZWZlcnJlZFxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgICdiZW5jaG1hcmsnOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBkZWZlcnJlZCBjeWNsZXMgcGVyZm9ybWVkIHdoaWxlIGJlbmNobWFya2luZy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRGVmZXJyZWRcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnY3ljbGVzJzogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lIHRha2VuIHRvIGNvbXBsZXRlIHRoZSBkZWZlcnJlZCBiZW5jaG1hcmsgKHNlY3MpLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5EZWZlcnJlZFxuICAgICAqIEB0eXBlIE51bWJlclxuICAgICAqL1xuICAgICdlbGFwc2VkJzogMCxcblxuICAgIC8qKlxuICAgICAqIEEgdGltZXN0YW1wIG9mIHdoZW4gdGhlIGRlZmVycmVkIGJlbmNobWFyayBzdGFydGVkIChtcykuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkRlZmVycmVkXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgJ3RpbWVTdGFtcCc6IDAsXG5cbiAgICAvLyBjeWNsZXMvY29tcGxldGVzIHRoZSBkZWZlcnJlZCBiZW5jaG1hcmtcbiAgICAncmVzb2x2ZSc6IHJlc29sdmVcbiAgfSk7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgZXh0ZW5kKEV2ZW50LnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRvIGluZGljYXRlIGlmIHRoZSBlbWl0dGVycyBsaXN0ZW5lciBpdGVyYXRpb24gaXMgYWJvcnRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgJ2Fib3J0ZWQnOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgZGVmYXVsdCBhY3Rpb24gaXMgY2FuY2VsbGVkLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgKi9cbiAgICAnY2FuY2VsbGVkJzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgb2JqZWN0IHdob3NlIGxpc3RlbmVycyBhcmUgY3VycmVudGx5IGJlaW5nIHByb2Nlc3NlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAnY3VycmVudFRhcmdldCc6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGxhc3QgZXhlY3V0ZWQgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLkV2ZW50XG4gICAgICogQHR5cGUgTWl4ZWRcbiAgICAgKi9cbiAgICAncmVzdWx0JzogdW5kZWZpbmVkLFxuXG4gICAgLyoqXG4gICAgICogVGhlIG9iamVjdCB0byB3aGljaCB0aGUgZXZlbnQgd2FzIG9yaWdpbmFsbHkgZW1pdHRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICAndGFyZ2V0JzogdW5kZWZpbmVkLFxuXG4gICAgLyoqXG4gICAgICogQSB0aW1lc3RhbXAgb2Ygd2hlbiB0aGUgZXZlbnQgd2FzIGNyZWF0ZWQgKG1zKS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuRXZlbnRcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAndGltZVN0YW1wJzogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5FdmVudFxuICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAqL1xuICAgICd0eXBlJzogJydcbiAgfSk7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IG9wdGlvbnMgY29waWVkIGJ5IHN1aXRlIGluc3RhbmNlcy5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgU3VpdGUub3B0aW9ucyA9IHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGUub3B0aW9uc1xuICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAqL1xuICAgICduYW1lJzogdW5kZWZpbmVkXG4gIH07XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgZXh0ZW5kKFN1aXRlLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICAnbGVuZ3RoJzogMCxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgc3VpdGUgaXMgYWJvcnRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgJ2Fib3J0ZWQnOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgc3VpdGUgaXMgcnVubmluZy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICovXG4gICAgJ3J1bm5pbmcnOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEFuIGBBcnJheSNmb3JFYWNoYCBsaWtlIG1ldGhvZC5cbiAgICAgKiBDYWxsYmFja3MgbWF5IHRlcm1pbmF0ZSB0aGUgbG9vcCBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3VpdGUgaXRlcmF0ZWQgb3Zlci5cbiAgICAgKi9cbiAgICAnZm9yRWFjaCc6IG1ldGhvZGl6ZShmb3JFYWNoKSxcblxuICAgIC8qKlxuICAgICAqIEFuIGBBcnJheSNpbmRleE9mYCBsaWtlIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUgb3IgYC0xYC5cbiAgICAgKi9cbiAgICAnaW5kZXhPZic6IG1ldGhvZGl6ZShpbmRleE9mKSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgYSBtZXRob2Qgb24gYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGludm9rZSBPUiBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge01peGVkfSBbYXJnMSwgYXJnMiwgLi4uXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBtZXRob2Qgd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBmcm9tIGVhY2ggbWV0aG9kIGludm9rZWQuXG4gICAgICovXG4gICAgJ2ludm9rZSc6IG1ldGhvZGl6ZShpbnZva2UpLFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIHN1aXRlIG9mIGJlbmNobWFya3MgdG8gYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtzZXBhcmF0b3I9JywnXSBBIHN0cmluZyB0byBzZXBhcmF0ZSBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcuXG4gICAgICovXG4gICAgJ2pvaW4nOiBbXS5qb2luLFxuXG4gICAgLyoqXG4gICAgICogQW4gYEFycmF5I21hcGAgbGlrZSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgQmVuY2htYXJrLlN1aXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjay5cbiAgICAgKi9cbiAgICAnbWFwJzogbWV0aG9kaXplKG1hcCksXG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIHByb3BlcnR5IGZyb20gYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gcGx1Y2suXG4gICAgICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICovXG4gICAgJ3BsdWNrJzogbWV0aG9kaXplKHBsdWNrKSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGxhc3QgYmVuY2htYXJrIGZyb20gdGhlIHN1aXRlIGFuZCByZXR1cm5zIGl0LlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEByZXR1cm5zIHtNaXhlZH0gVGhlIHJlbW92ZWQgYmVuY2htYXJrLlxuICAgICAqL1xuICAgICdwb3AnOiBbXS5wb3AsXG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIGJlbmNobWFya3MgdG8gdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBzdWl0ZSdzIG5ldyBsZW5ndGguXG4gICAgICovXG4gICAgJ3B1c2gnOiBbXS5wdXNoLFxuXG4gICAgLyoqXG4gICAgICogU29ydHMgdGhlIGJlbmNobWFya3Mgb2YgdGhlIHN1aXRlLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIEJlbmNobWFyay5TdWl0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb21wYXJlRm49bnVsbF0gQSBmdW5jdGlvbiB0aGF0IGRlZmluZXMgdGhlIHNvcnQgb3JkZXIuXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHNvcnRlZCBzdWl0ZS5cbiAgICAgKi9cbiAgICAnc29ydCc6IFtdLnNvcnQsXG5cbiAgICAvKipcbiAgICAgKiBBbiBgQXJyYXkjcmVkdWNlYCBsaWtlIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBCZW5jaG1hcmsuU3VpdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtNaXhlZH0gYWNjdW11bGF0b3IgSW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gICAgICogQHJldHVybnMge01peGVkfSBUaGUgYWNjdW11bGF0b3IuXG4gICAgICovXG4gICAgJ3JlZHVjZSc6IG1ldGhvZGl6ZShyZWR1Y2UpLFxuXG4gICAgLy8gYWJvcnRzIGFsbCBiZW5jaG1hcmtzIGluIHRoZSBzdWl0ZVxuICAgICdhYm9ydCc6IGFib3J0U3VpdGUsXG5cbiAgICAvLyBhZGRzIGEgYmVuY2htYXJrIHRvIHRoZSBzdWl0ZVxuICAgICdhZGQnOiBhZGQsXG5cbiAgICAvLyBjcmVhdGVzIGEgbmV3IHN1aXRlIHdpdGggY2xvbmVkIGJlbmNobWFya3NcbiAgICAnY2xvbmUnOiBjbG9uZVN1aXRlLFxuXG4gICAgLy8gZXhlY3V0ZXMgbGlzdGVuZXJzIG9mIGEgc3BlY2lmaWVkIHR5cGVcbiAgICAnZW1pdCc6IGVtaXQsXG5cbiAgICAvLyBjcmVhdGVzIGEgbmV3IHN1aXRlIG9mIGZpbHRlcmVkIGJlbmNobWFya3NcbiAgICAnZmlsdGVyJzogZmlsdGVyU3VpdGUsXG5cbiAgICAvLyBnZXQgbGlzdGVuZXJzXG4gICAgJ2xpc3RlbmVycyc6IGxpc3RlbmVycyxcblxuICAgIC8vIHVucmVnaXN0ZXIgbGlzdGVuZXJzXG4gICAgJ29mZic6IG9mZixcblxuICAgLy8gcmVnaXN0ZXIgbGlzdGVuZXJzXG4gICAgJ29uJzogb24sXG5cbiAgICAvLyByZXNldHMgYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlXG4gICAgJ3Jlc2V0JzogcmVzZXRTdWl0ZSxcblxuICAgIC8vIHJ1bnMgYWxsIGJlbmNobWFya3MgaW4gdGhlIHN1aXRlXG4gICAgJ3J1bic6IHJ1blN1aXRlLFxuXG4gICAgLy8gYXJyYXkgbWV0aG9kc1xuICAgICdjb25jYXQnOiBjb25jYXQsXG5cbiAgICAncmV2ZXJzZSc6IHJldmVyc2UsXG5cbiAgICAnc2hpZnQnOiBzaGlmdCxcblxuICAgICdzbGljZSc6IHNsaWNlLFxuXG4gICAgJ3NwbGljZSc6IHNwbGljZSxcblxuICAgICd1bnNoaWZ0JzogdW5zaGlmdFxuICB9KTtcblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvLyBleHBvc2UgRGVmZXJyZWQsIEV2ZW50IGFuZCBTdWl0ZVxuICBleHRlbmQoQmVuY2htYXJrLCB7XG4gICAgJ0RlZmVycmVkJzogRGVmZXJyZWQsXG4gICAgJ0V2ZW50JzogRXZlbnQsXG4gICAgJ1N1aXRlJzogU3VpdGVcbiAgfSk7XG5cbiAgLy8gZXhwb3NlIEJlbmNobWFya1xuICAvLyBzb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnMgbGlrZSB0aGUgZm9sbG93aW5nOlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBkZWZpbmUgYXMgYW4gYW5vbnltb3VzIG1vZHVsZSBzbywgdGhyb3VnaCBwYXRoIG1hcHBpbmcsIGl0IGNhbiBiZSBhbGlhc2VkXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEJlbmNobWFyaztcbiAgICB9KTtcbiAgfVxuICAvLyBjaGVjayBmb3IgYGV4cG9ydHNgIGFmdGVyIGBkZWZpbmVgIGluIGNhc2UgYSBidWlsZCBvcHRpbWl6ZXIgYWRkcyBhbiBgZXhwb3J0c2Agb2JqZWN0XG4gIGVsc2UgaWYgKGZyZWVFeHBvcnRzKSB7XG4gICAgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcbiAgICAgIChtb2R1bGUuZXhwb3J0cyA9IEJlbmNobWFyaykuQmVuY2htYXJrID0gQmVuY2htYXJrO1xuICAgIH1cbiAgICAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuICAgIGVsc2Uge1xuICAgICAgZnJlZUV4cG9ydHMuQmVuY2htYXJrID0gQmVuY2htYXJrO1xuICAgIH1cbiAgfVxuICAvLyBpbiBhIGJyb3dzZXIgb3IgUmhpbm9cbiAgZWxzZSB7XG4gICAgLy8gdXNlIHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHNvIENsb3N1cmUgQ29tcGlsZXIgd29uJ3QgbXVuZ2UgYEJlbmNobWFya2BcbiAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL2Nsb3N1cmUvY29tcGlsZXIvZG9jcy9hcGktdHV0b3JpYWwzLmh0bWwjZXhwb3J0XG4gICAgd2luZG93WydCZW5jaG1hcmsnXSA9IEJlbmNobWFyaztcbiAgfVxuXG4gIC8vIHRyaWdnZXIgY2xvY2sncyBsYXp5IGRlZmluZSBlYXJseSB0byBhdm9pZCBhIHNlY3VyaXR5IGVycm9yXG4gIGlmIChzdXBwb3J0LmFpcikge1xuICAgIGNsb2NrKHsgJ19vcmlnaW5hbCc6IHsgJ2ZuJzogbm9vcCwgJ2NvdW50JzogMSwgJ29wdGlvbnMnOiB7fSB9IH0pO1xuICB9XG59KHRoaXMpKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0xFID8gLTEgOiAxLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXTtcblxuICBpICs9IGQ7XG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIHMgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBlTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgZSA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IG1MZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhcztcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpO1xuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbik7XG4gICAgZSA9IGUgLSBlQmlhcztcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKTtcbn07XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgYyxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMCksXG4gICAgICBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNMRSA/IDEgOiAtMSxcbiAgICAgIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDA7XG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSk7XG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDA7XG4gICAgZSA9IGVNYXg7XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpO1xuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLTtcbiAgICAgIGMgKj0gMjtcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKys7XG4gICAgICBjIC89IDI7XG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMDtcbiAgICAgIGUgPSBlTWF4O1xuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSBlICsgZUJpYXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSAwO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpO1xuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG07XG4gIGVMZW4gKz0gbUxlbjtcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KTtcblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjg7XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIGJlbmNobWFyayA9IHJlcXVpcmUoJ2JlbmNobWFyaycpXG52YXIgc3VpdGUgPSBuZXcgYmVuY2htYXJrLlN1aXRlKClcblxuZ2xvYmFsLk5ld0J1ZmZlciA9IHJlcXVpcmUoJy4uLy4uLycpLkJ1ZmZlciAvLyBuYXRpdmUtYnVmZmVyLWJyb3dzZXJpZnlcblxudmFyIExFTkdUSCA9IDIwXG5cbnZhciBuZXdUYXJnZXQgPSBOZXdCdWZmZXIoTEVOR1RIICogNClcblxuZm9yICh2YXIgaSA9IDA7IGkgPCBMRU5HVEg7IGkrKykge1xuICBuZXdUYXJnZXQud3JpdGVVSW50MzJMRSg3MDAwICsgaSwgaSAqIDQpXG59XG5cbnN1aXRlLmFkZCgnTmV3QnVmZmVyI3JlYWRVSW50MzJCRScsIGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBMRU5HVEg7IGkrKykge1xuICAgIHZhciB4ID0gbmV3VGFyZ2V0LnJlYWRVSW50MzJCRShpICogNClcbiAgfVxufSlcbi5vbignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc29sZS5lcnJvcihldmVudC50YXJnZXQuZXJyb3Iuc3RhY2spXG59KVxuLm9uKCdjeWNsZScsIGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zb2xlLmxvZyhTdHJpbmcoZXZlbnQudGFyZ2V0KSlcbn0pXG5cbi5ydW4oeyAnYXN5bmMnOiB0cnVlIH0pXG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSJdfQ==
