!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.chessground=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = require('react');
var interact = require('interact');
if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

var k;
function p(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var aa="closure_uid_"+(1E9*Math.random()>>>0),ba=0;function ca(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function da(a,b){null!=a&&this.append.apply(this,arguments)}da.prototype.Ma="";da.prototype.set=function(a){this.Ma=""+a};da.prototype.append=function(a,b,c){this.Ma+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Ma+=arguments[d];return this};da.prototype.toString=function(){return this.Ma};var ea=null;function fa(){return new ha(null,5,[ia,!0,ja,!0,la,!1,ma,!1,na,null],null)}function r(a){return null!=a&&!1!==a}function pa(a){return r(a)?!1:!0}function v(a,b){return a[p(null==b?null:b)]?!0:a._?!0:!1}function qa(a){return null==a?null:a.constructor}function w(a,b){var c=qa(b),c=r(r(c)?c.hb:c)?c.gb:p(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function sa(a){var b=a.gb;return r(b)?b:""+x.d(a)}
function ta(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}function ua(a){return Array.prototype.slice.call(arguments)}var va={},xa={};function za(a){if(a?a.R:a)return a.R(a);var b;b=za[p(null==a?null:a)];if(!b&&(b=za._,!b))throw w("ICounted.-count",a);return b.call(null,a)}function Aa(a){if(a?a.S:a)return a.S(a);var b;b=Aa[p(null==a?null:a)];if(!b&&(b=Aa._,!b))throw w("IEmptyableCollection.-empty",a);return b.call(null,a)}var Ba={};
function Fa(a,b){if(a?a.O:a)return a.O(a,b);var c;c=Fa[p(null==a?null:a)];if(!c&&(c=Fa._,!c))throw w("ICollection.-conj",a);return c.call(null,a,b)}
var Ga={},y=function(){function a(a,b,c){if(a?a.$:a)return a.$(a,b,c);var g;g=y[p(null==a?null:a)];if(!g&&(g=y._,!g))throw w("IIndexed.-nth",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.P:a)return a.P(a,b);var c;c=y[p(null==a?null:a)];if(!c&&(c=y._,!c))throw w("IIndexed.-nth",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}(),
Ha={};function Ia(a){if(a?a.Y:a)return a.Y(a);var b;b=Ia[p(null==a?null:a)];if(!b&&(b=Ia._,!b))throw w("ISeq.-first",a);return b.call(null,a)}function Ja(a){if(a?a.Z:a)return a.Z(a);var b;b=Ja[p(null==a?null:a)];if(!b&&(b=Ja._,!b))throw w("ISeq.-rest",a);return b.call(null,a)}
var Ka={},Ma={},Na=function(){function a(a,b,c){if(a?a.U:a)return a.U(a,b,c);var g;g=Na[p(null==a?null:a)];if(!g&&(g=Na._,!g))throw w("ILookup.-lookup",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.T:a)return a.T(a,b);var c;c=Na[p(null==a?null:a)];if(!c&&(c=Na._,!c))throw w("ILookup.-lookup",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=
a;return c}();function Oa(a,b,c){if(a?a.Qa:a)return a.Qa(a,b,c);var d;d=Oa[p(null==a?null:a)];if(!d&&(d=Oa._,!d))throw w("IAssociative.-assoc",a);return d.call(null,a,b,c)}var Pa={},Ra={};function Sa(a){if(a?a.nb:a)return a.nb();var b;b=Sa[p(null==a?null:a)];if(!b&&(b=Sa._,!b))throw w("IMapEntry.-key",a);return b.call(null,a)}function Ta(a){if(a?a.wb:a)return a.wb();var b;b=Ta[p(null==a?null:a)];if(!b&&(b=Ta._,!b))throw w("IMapEntry.-val",a);return b.call(null,a)}var Ua={};
function Va(a,b,c){if(a?a.ob:a)return a.ob(a,b,c);var d;d=Va[p(null==a?null:a)];if(!d&&(d=Va._,!d))throw w("IVector.-assoc-n",a);return d.call(null,a,b,c)}function Xa(a){if(a?a.Ya:a)return a.Ya(a);var b;b=Xa[p(null==a?null:a)];if(!b&&(b=Xa._,!b))throw w("IDeref.-deref",a);return b.call(null,a)}var Ya={};function Za(a){if(a?a.J:a)return a.J(a);var b;b=Za[p(null==a?null:a)];if(!b&&(b=Za._,!b))throw w("IMeta.-meta",a);return b.call(null,a)}var $a={};
function ab(a,b){if(a?a.K:a)return a.K(a,b);var c;c=ab[p(null==a?null:a)];if(!c&&(c=ab._,!c))throw w("IWithMeta.-with-meta",a);return c.call(null,a,b)}
var bb={},cb=function(){function a(a,b,c){if(a?a.W:a)return a.W(a,b,c);var g;g=cb[p(null==a?null:a)];if(!g&&(g=cb._,!g))throw w("IReduce.-reduce",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.V:a)return a.V(a,b);var c;c=cb[p(null==a?null:a)];if(!c&&(c=cb._,!c))throw w("IReduce.-reduce",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}();
function db(a,b){if(a?a.H:a)return a.H(a,b);var c;c=db[p(null==a?null:a)];if(!c&&(c=db._,!c))throw w("IEquiv.-equiv",a);return c.call(null,a,b)}function eb(a){if(a?a.I:a)return a.I(a);var b;b=eb[p(null==a?null:a)];if(!b&&(b=eb._,!b))throw w("IHash.-hash",a);return b.call(null,a)}var fb={};function gb(a){if(a?a.L:a)return a.L(a);var b;b=gb[p(null==a?null:a)];if(!b&&(b=gb._,!b))throw w("ISeqable.-seq",a);return b.call(null,a)}var hb={},jb={};
function kb(a){if(a?a.ab:a)return a.ab(a);var b;b=kb[p(null==a?null:a)];if(!b&&(b=kb._,!b))throw w("IReversible.-rseq",a);return b.call(null,a)}function A(a,b){if(a?a.Ab:a)return a.Ab(0,b);var c;c=A[p(null==a?null:a)];if(!c&&(c=A._,!c))throw w("IWriter.-write",a);return c.call(null,a,b)}var lb={};function mb(a,b,c){if(a?a.F:a)return a.F(a,b,c);var d;d=mb[p(null==a?null:a)];if(!d&&(d=mb._,!d))throw w("IPrintWithWriter.-pr-writer",a);return d.call(null,a,b,c)}
function nb(a,b,c){if(a?a.zb:a)return a.zb(0,b,c);var d;d=nb[p(null==a?null:a)];if(!d&&(d=nb._,!d))throw w("IWatchable.-notify-watches",a);return d.call(null,a,b,c)}function ob(a){if(a?a.Za:a)return a.Za(a);var b;b=ob[p(null==a?null:a)];if(!b&&(b=ob._,!b))throw w("IEditableCollection.-as-transient",a);return b.call(null,a)}function pb(a,b){if(a?a.bb:a)return a.bb(a,b);var c;c=pb[p(null==a?null:a)];if(!c&&(c=pb._,!c))throw w("ITransientCollection.-conj!",a);return c.call(null,a,b)}
function qb(a){if(a?a.cb:a)return a.cb(a);var b;b=qb[p(null==a?null:a)];if(!b&&(b=qb._,!b))throw w("ITransientCollection.-persistent!",a);return b.call(null,a)}function rb(a,b,c){if(a?a.Sa:a)return a.Sa(a,b,c);var d;d=rb[p(null==a?null:a)];if(!d&&(d=rb._,!d))throw w("ITransientAssociative.-assoc!",a);return d.call(null,a,b,c)}function sb(a,b,c){if(a?a.yb:a)return a.yb(0,b,c);var d;d=sb[p(null==a?null:a)];if(!d&&(d=sb._,!d))throw w("ITransientVector.-assoc-n!",a);return d.call(null,a,b,c)}
function tb(a){if(a?a.tb:a)return a.tb();var b;b=tb[p(null==a?null:a)];if(!b&&(b=tb._,!b))throw w("IChunk.-drop-first",a);return b.call(null,a)}function ub(a){if(a?a.lb:a)return a.lb(a);var b;b=ub[p(null==a?null:a)];if(!b&&(b=ub._,!b))throw w("IChunkedSeq.-chunked-first",a);return b.call(null,a)}function vb(a){if(a?a.mb:a)return a.mb(a);var b;b=vb[p(null==a?null:a)];if(!b&&(b=vb._,!b))throw w("IChunkedSeq.-chunked-rest",a);return b.call(null,a)}
function xb(a){if(a?a.kb:a)return a.kb(a);var b;b=xb[p(null==a?null:a)];if(!b&&(b=xb._,!b))throw w("IChunkedNext.-chunked-next",a);return b.call(null,a)}function yb(a,b){if(a?a.Rb:a)return a.Rb(a,b);var c;c=yb[p(null==a?null:a)];if(!c&&(c=yb._,!c))throw w("IReset.-reset!",a);return c.call(null,a,b)}
var zb=function(){function a(a,b,c,d,e){if(a?a.Wb:a)return a.Wb(a,b,c,d,e);var n;n=zb[p(null==a?null:a)];if(!n&&(n=zb._,!n))throw w("ISwap.-swap!",a);return n.call(null,a,b,c,d,e)}function b(a,b,c,d){if(a?a.Vb:a)return a.Vb(a,b,c,d);var e;e=zb[p(null==a?null:a)];if(!e&&(e=zb._,!e))throw w("ISwap.-swap!",a);return e.call(null,a,b,c,d)}function c(a,b,c){if(a?a.Ub:a)return a.Ub(a,b,c);var d;d=zb[p(null==a?null:a)];if(!d&&(d=zb._,!d))throw w("ISwap.-swap!",a);return d.call(null,a,b,c)}function d(a,b){if(a?
a.Tb:a)return a.Tb(a,b);var c;c=zb[p(null==a?null:a)];if(!c&&(c=zb._,!c))throw w("ISwap.-swap!",a);return c.call(null,a,b)}var e=null,e=function(e,g,h,l,m){switch(arguments.length){case 2:return d.call(this,e,g);case 3:return c.call(this,e,g,h);case 4:return b.call(this,e,g,h,l);case 5:return a.call(this,e,g,h,l,m)}throw Error("Invalid arity: "+arguments.length);};e.c=d;e.e=c;e.o=b;e.w=a;return e}();function Ab(a){this.bc=a;this.v=0;this.l=1073741824}Ab.prototype.Ab=function(a,b){return this.bc.append(b)};
function Bb(a){var b=new da;a.F(null,new Ab(b),fa());return""+x.d(b)}var Cb="undefined"!==typeof Math.imul&&0!==(Math.imul.c?Math.imul.c(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul.c?Math.imul.c(a,b):Math.imul.call(null,a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function Db(a){a=Cb(a,3432918353);return Cb(a<<15|a>>>-15,461845907)}function Eb(a,b){var c=a^b;return Cb(c<<13|c>>>-13,5)+3864292196}
function Fb(a,b){var c=a^b,c=Cb(c^c>>>16,2246822507),c=Cb(c^c>>>13,3266489909);return c^c>>>16}function Gb(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=Eb(c,Db(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}b=void 0}b=1===(a.length&1)?b^Db(a.charCodeAt(a.length-1)):b;return Fb(b,Cb(2,a.length))}var Hb={},Ib=0;
function Jb(a){255<Ib&&(Hb={},Ib=0);var b=Hb[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b){for(var c=0,d=0;;)if(c<b)var e=c+1,d=Cb(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}b=void 0}else b=0;else b=0;Hb[a]=b;Ib+=1}return a=b}function Mb(a){a&&(a.l&4194304||a.gc)?a=a.I(null):"number"===typeof a?a=(Math.floor.d?Math.floor.d(a):Math.floor.call(null,a))%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=Jb(a),0!==a&&(a=Db(a),a=Eb(0,a),a=Fb(a,4))):a=null==a?0:eb(a);return a}
function Nb(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function Ob(a,b){if(r(B.c?B.c(a,b):B.call(null,a,b)))return 0;var c=pa(a.ca);if(r(c?b.ca:c))return-1;if(r(a.ca)){if(pa(b.ca))return 1;c=Pb.c?Pb.c(a.ca,b.ca):Pb.call(null,a.ca,b.ca);return 0===c?Pb.c?Pb.c(a.name,b.name):Pb.call(null,a.name,b.name):c}return Pb.c?Pb.c(a.name,b.name):Pb.call(null,a.name,b.name)}function C(a,b,c,d,e){this.ca=a;this.name=b;this.Ha=c;this.La=d;this.ja=e;this.l=2154168321;this.v=4096}k=C.prototype;
k.F=function(a,b){return A(b,this.Ha)};k.I=function(){var a=this.La;return null!=a?a:this.La=a=Nb(Gb(this.name),Jb(this.ca))};k.K=function(a,b){return new C(this.ca,this.name,this.Ha,this.La,b)};k.J=function(){return this.ja};k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return Na.e(c,this,null);case 3:return Na.e(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return Na.e(c,this,null)};a.e=function(a,c,d){return Na.e(c,this,d)};return a}();
k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return Na.e(a,this,null)};k.c=function(a,b){return Na.e(a,this,b)};k.H=function(a,b){return b instanceof C?this.Ha===b.Ha:!1};k.toString=function(){return this.Ha};function E(a){if(null==a)return null;if(a&&(a.l&8388608||a.Sb))return a.L(null);if(a instanceof Array||"string"===typeof a)return 0===a.length?null:new Qb(a,0);if(v(fb,a))return gb(a);throw Error(""+x.d(a)+" is not ISeqable");}
function F(a){if(null==a)return null;if(a&&(a.l&64||a.Ra))return a.Y(null);a=E(a);return null==a?null:Ia(a)}function H(a){return null!=a?a&&(a.l&64||a.Ra)?a.Z(null):(a=E(a))?Ja(a):I:I}function J(a){return null==a?null:a&&(a.l&128||a.xb)?a.aa(null):E(H(a))}
var B=function(){function a(a,b){return null==a?null==b:a===b||db(a,b)}var b=null,c=function(){function a(b,d,h){var l=null;2<arguments.length&&(l=K(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(b.c(a,d))if(J(e))a=d,d=F(e),e=J(e);else return b.c(d,F(e));else return!1}a.r=2;a.k=function(a){var b=F(a);a=J(a);var d=F(a);a=H(a);return c(b,d,a)};a.j=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!0;case 2:return a.call(this,b,e);
default:return c.j(b,e,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.d=function(){return!0};b.c=a;b.j=c.j;return b}();function Rb(a,b){var c=Db(a),c=Eb(0,c);return Fb(c,b)}function Sb(a){var b=0,c=1;for(a=E(a);;)if(null!=a)b+=1,c=Cb(31,c)+Mb(F(a))|0,a=J(a);else return Rb(c,b)}function Tb(a){var b=0,c=0;for(a=E(a);;)if(null!=a)b+=1,c=c+Mb(F(a))|0,a=J(a);else return Rb(c,b)}xa["null"]=!0;za["null"]=function(){return 0};
Date.prototype.H=function(a,b){return b instanceof Date&&this.toString()===b.toString()};db.number=function(a,b){return a===b};Ya["function"]=!0;Za["function"]=function(){return null};va["function"]=!0;eb._=function(a){return a[aa]||(a[aa]=++ba)};function Ub(a){this.M=a;this.v=0;this.l=32768}Ub.prototype.Ya=function(){return this.M};function Vb(a){return a instanceof Ub}function Wb(a){return Xa(a)}
var Xb=function(){function a(a,b,c,d){for(var l=za(a);;)if(d<l){c=b.c?b.c(c,y.c(a,d)):b.call(null,c,y.c(a,d));if(Vb(c))return Xa(c);d+=1}else return c}function b(a,b,c){for(var d=za(a),l=0;;)if(l<d){c=b.c?b.c(c,y.c(a,l)):b.call(null,c,y.c(a,l));if(Vb(c))return Xa(c);l+=1}else return c}function c(a,b){var c=za(a);if(0===c)return b.n?b.n():b.call(null);for(var d=y.c(a,0),l=1;;)if(l<c){d=b.c?b.c(d,y.c(a,l)):b.call(null,d,y.c(a,l));if(Vb(d))return Xa(d);l+=1}else return d}var d=null,d=function(d,f,g,
h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.e=b;d.o=a;return d}(),Yb=function(){function a(a,b,c,d){for(var l=a.length;;)if(d<l){c=b.c?b.c(c,a[d]):b.call(null,c,a[d]);if(Vb(c))return Xa(c);d+=1}else return c}function b(a,b,c){for(var d=a.length,l=0;;)if(l<d){c=b.c?b.c(c,a[l]):b.call(null,c,a[l]);if(Vb(c))return Xa(c);l+=1}else return c}function c(a,b){var c=
a.length;if(0===a.length)return b.n?b.n():b.call(null);for(var d=a[0],l=1;;)if(l<c){d=b.c?b.c(d,a[l]):b.call(null,d,a[l]);if(Vb(d))return Xa(d);l+=1}else return d}var d=null,d=function(d,f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.e=b;d.o=a;return d}();function Zb(a){return a?a.l&2||a.Hb?!0:a.l?!1:v(xa,a):v(xa,a)}
function $b(a){return a?a.l&16||a.ub?!0:a.l?!1:v(Ga,a):v(Ga,a)}function Qb(a,b){this.f=a;this.i=b;this.l=166199550;this.v=8192}k=Qb.prototype;k.toString=function(){return Bb(this)};k.P=function(a,b){var c=b+this.i;return c<this.f.length?this.f[c]:null};k.$=function(a,b,c){a=b+this.i;return a<this.f.length?this.f[a]:c};k.aa=function(){return this.i+1<this.f.length?new Qb(this.f,this.i+1):null};k.R=function(){return this.f.length-this.i};
k.ab=function(){var a=za(this);return 0<a?new ac(this,a-1,null):null};k.I=function(){return Sb(this)};k.H=function(a,b){return cc.c?cc.c(this,b):cc.call(null,this,b)};k.S=function(){return I};k.V=function(a,b){return Yb.o(this.f,b,this.f[this.i],this.i+1)};k.W=function(a,b,c){return Yb.o(this.f,b,c,this.i)};k.Y=function(){return this.f[this.i]};k.Z=function(){return this.i+1<this.f.length?new Qb(this.f,this.i+1):I};k.L=function(){return this};
k.O=function(a,b){return L.c?L.c(b,this):L.call(null,b,this)};
var dc=function(){function a(a,b){return b<a.length?new Qb(a,b):null}function b(a){return c.c(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),K=function(){function a(a,b){return dc.c(a,b)}function b(a){return dc.c(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.d=b;c.c=a;return c}();function ac(a,b,c){this.Va=a;this.i=b;this.meta=c;this.l=32374990;this.v=8192}k=ac.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.aa=function(){return 0<this.i?new ac(this.Va,this.i-1,null):null};k.R=function(){return this.i+1};k.I=function(){return Sb(this)};k.H=function(a,b){return cc.c?cc.c(this,b):cc.call(null,this,b)};k.S=function(){return ec.c?ec.c(I,this.meta):ec.call(null,I,this.meta)};
k.V=function(a,b){return N.c?N.c(b,this):N.call(null,b,this)};k.W=function(a,b,c){return N.e?N.e(b,c,this):N.call(null,b,c,this)};k.Y=function(){return y.c(this.Va,this.i)};k.Z=function(){return 0<this.i?new ac(this.Va,this.i-1,null):I};k.L=function(){return this};k.K=function(a,b){return new ac(this.Va,this.i,b)};k.O=function(a,b){return L.c?L.c(b,this):L.call(null,b,this)};function fc(a){return F(J(a))}db._=function(a,b){return a===b};
var hc=function(){function a(a,b){return null!=a?Fa(a,b):Fa(I,b)}var b=null,c=function(){function a(b,d,h){var l=null;2<arguments.length&&(l=K(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(r(e))a=b.c(a,d),d=F(e),e=J(e);else return b.c(a,d)}a.r=2;a.k=function(a){var b=F(a);a=J(a);var d=F(a);a=H(a);return c(b,d,a)};a.j=c;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return gc;case 1:return b;case 2:return a.call(this,b,e);default:return c.j(b,
e,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.n=function(){return gc};b.d=function(a){return a};b.c=a;b.j=c.j;return b}();function O(a){if(null!=a)if(a&&(a.l&2||a.Hb))a=a.R(null);else if(a instanceof Array)a=a.length;else if("string"===typeof a)a=a.length;else if(v(xa,a))a=za(a);else a:{a=E(a);for(var b=0;;){if(Zb(a)){a=b+za(a);break a}a=J(a);b+=1}a=void 0}else a=0;return a}
var ic=function(){function a(a,b,c){for(;;){if(null==a)return c;if(0===b)return E(a)?F(a):c;if($b(a))return y.e(a,b,c);if(E(a))a=J(a),b-=1;else return c}}function b(a,b){for(;;){if(null==a)throw Error("Index out of bounds");if(0===b){if(E(a))return F(a);throw Error("Index out of bounds");}if($b(a))return y.c(a,b);if(E(a)){var c=J(a),g=b-1;a=c;b=g}else throw Error("Index out of bounds");}}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}(),Q=function(){function a(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(a&&(a.l&16||a.ub))return a.$(null,b,c);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:c;if(v(Ga,a))return y.c(a,b);if(a?a.l&64||a.Ra||(a.l?0:v(Ha,a)):v(Ha,a))return ic.e(a,b,c);throw Error("nth not supported on this type "+x.d(sa(qa(a))));}function b(a,b){if("number"!==
typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.l&16||a.ub))return a.P(null,b);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:null;if(v(Ga,a))return y.c(a,b);if(a?a.l&64||a.Ra||(a.l?0:v(Ha,a)):v(Ha,a))return ic.c(a,b);throw Error("nth not supported on this type "+x.d(sa(qa(a))));}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);
};c.c=b;c.e=a;return c}(),R=function(){function a(a,b,c){return null!=a?a&&(a.l&256||a.vb)?a.U(null,b,c):a instanceof Array?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:v(Ma,a)?Na.e(a,b,c):c:c}function b(a,b){return null==a?null:a&&(a.l&256||a.vb)?a.T(null,b):a instanceof Array?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:v(Ma,a)?Na.c(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+
arguments.length);};c.c=b;c.e=a;return c}(),S=function(){function a(a,b,c){return null!=a?Oa(a,b,c):jc([b],[c])}var b=null,c=function(){function a(b,d,h,l){var m=null;3<arguments.length&&(m=K(Array.prototype.slice.call(arguments,3),0));return c.call(this,b,d,h,m)}function c(a,d,e,l){for(;;)if(a=b.e(a,d,e),r(l))d=F(l),e=fc(l),l=J(J(l));else return a}a.r=3;a.k=function(a){var b=F(a);a=J(a);var d=F(a);a=J(a);var l=F(a);a=H(a);return c(b,d,l,a)};a.j=c;return a}(),b=function(b,e,f,g){switch(arguments.length){case 3:return a.call(this,
b,e,f);default:return c.j(b,e,f,K(arguments,3))}throw Error("Invalid arity: "+arguments.length);};b.r=3;b.k=c.k;b.e=a;b.j=c.j;return b}();function kc(a){var b="function"==p(a);return b?b:a?r(r(null)?null:a.Gb)?!0:a.rb?!1:v(va,a):v(va,a)}function lc(a,b){this.h=a;this.meta=b;this.v=0;this.l=393217}k=lc.prototype;
k.call=function(){function a(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$,Z){a=this;return T.$a?T.$a(a.h,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$,Z):T.call(null,a.h,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$,Z)}function b(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$){a=this;return a.h.za?a.h.za(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D,$)}function c(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D){a=this;return a.h.ya?a.h.ya(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D):
a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P,D)}function d(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P){a=this;return a.h.xa?a.h.xa(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M,P)}function e(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M){a=this;return a.h.wa?a.h.wa(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G,M)}function f(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G){a=this;return a.h.va?a.h.va(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z,G):a.h.call(null,b,
c,d,e,f,g,h,l,m,n,q,t,s,u,z,G)}function g(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z){a=this;return a.h.ua?a.h.ua(b,c,d,e,f,g,h,l,m,n,q,t,s,u,z):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u,z)}function h(a,b,c,d,e,f,g,h,l,m,n,q,t,s,u){a=this;return a.h.ta?a.h.ta(b,c,d,e,f,g,h,l,m,n,q,t,s,u):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s,u)}function l(a,b,c,d,e,f,g,h,l,m,n,q,t,s){a=this;return a.h.sa?a.h.sa(b,c,d,e,f,g,h,l,m,n,q,t,s):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t,s)}function m(a,b,c,d,e,f,g,h,l,m,n,q,t){a=this;
return a.h.ra?a.h.ra(b,c,d,e,f,g,h,l,m,n,q,t):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q,t)}function n(a,b,c,d,e,f,g,h,l,m,n,q){a=this;return a.h.qa?a.h.qa(b,c,d,e,f,g,h,l,m,n,q):a.h.call(null,b,c,d,e,f,g,h,l,m,n,q)}function q(a,b,c,d,e,f,g,h,l,m,n){a=this;return a.h.pa?a.h.pa(b,c,d,e,f,g,h,l,m,n):a.h.call(null,b,c,d,e,f,g,h,l,m,n)}function s(a,b,c,d,e,f,g,h,l,m){a=this;return a.h.Ba?a.h.Ba(b,c,d,e,f,g,h,l,m):a.h.call(null,b,c,d,e,f,g,h,l,m)}function t(a,b,c,d,e,f,g,h,l){a=this;return a.h.Aa?a.h.Aa(b,c,
d,e,f,g,h,l):a.h.call(null,b,c,d,e,f,g,h,l)}function u(a,b,c,d,e,f,g,h){a=this;return a.h.fa?a.h.fa(b,c,d,e,f,g,h):a.h.call(null,b,c,d,e,f,g,h)}function z(a,b,c,d,e,f,g){a=this;return a.h.X?a.h.X(b,c,d,e,f,g):a.h.call(null,b,c,d,e,f,g)}function G(a,b,c,d,e,f){a=this;return a.h.w?a.h.w(b,c,d,e,f):a.h.call(null,b,c,d,e,f)}function M(a,b,c,d,e){a=this;return a.h.o?a.h.o(b,c,d,e):a.h.call(null,b,c,d,e)}function P(a,b,c,d){a=this;return a.h.e?a.h.e(b,c,d):a.h.call(null,b,c,d)}function Z(a,b,c){a=this;
return a.h.c?a.h.c(b,c):a.h.call(null,b,c)}function $(a,b){a=this;return a.h.d?a.h.d(b):a.h.call(null,b)}function Ea(a){a=this;return a.h.n?a.h.n():a.h.call(null)}var D=null,D=function(D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec,ld,re,xf,Wg){switch(arguments.length){case 1:return Ea.call(this,D);case 2:return $.call(this,D,Y);case 3:return Z.call(this,D,Y,ga);case 4:return P.call(this,D,Y,ga,ka);case 5:return M.call(this,D,Y,ga,ka,oa);case 6:return G.call(this,D,Y,ga,ka,oa,ra);case 7:return z.call(this,
D,Y,ga,ka,oa,ra,wa);case 8:return u.call(this,D,Y,ga,ka,oa,ra,wa,ya);case 9:return t.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca);case 10:return s.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da);case 11:return q.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La);case 12:return n.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa);case 13:return m.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa);case 14:return l.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib);case 15:return h.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb);
case 16:return g.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb);case 17:return f.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc);case 18:return e.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec);case 19:return d.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec,ld);case 20:return c.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec,ld,re);case 21:return b.call(this,D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec,ld,re,xf);case 22:return a.call(this,
D,Y,ga,ka,oa,ra,wa,ya,Ca,Da,La,Qa,Wa,ib,wb,Lb,bc,Ec,ld,re,xf,Wg)}throw Error("Invalid arity: "+arguments.length);};D.d=Ea;D.c=$;D.e=Z;D.o=P;D.w=M;D.X=G;D.fa=z;D.Aa=u;D.Ba=t;D.pa=s;D.qa=q;D.ra=n;D.sa=m;D.ta=l;D.ua=h;D.va=g;D.wa=f;D.xa=e;D.ya=d;D.za=c;D.Mb=b;D.$a=a;return D}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.n=function(){return this.h.n?this.h.n():this.h.call(null)};k.d=function(a){return this.h.d?this.h.d(a):this.h.call(null,a)};
k.c=function(a,b){return this.h.c?this.h.c(a,b):this.h.call(null,a,b)};k.e=function(a,b,c){return this.h.e?this.h.e(a,b,c):this.h.call(null,a,b,c)};k.o=function(a,b,c,d){return this.h.o?this.h.o(a,b,c,d):this.h.call(null,a,b,c,d)};k.w=function(a,b,c,d,e){return this.h.w?this.h.w(a,b,c,d,e):this.h.call(null,a,b,c,d,e)};k.X=function(a,b,c,d,e,f){return this.h.X?this.h.X(a,b,c,d,e,f):this.h.call(null,a,b,c,d,e,f)};
k.fa=function(a,b,c,d,e,f,g){return this.h.fa?this.h.fa(a,b,c,d,e,f,g):this.h.call(null,a,b,c,d,e,f,g)};k.Aa=function(a,b,c,d,e,f,g,h){return this.h.Aa?this.h.Aa(a,b,c,d,e,f,g,h):this.h.call(null,a,b,c,d,e,f,g,h)};k.Ba=function(a,b,c,d,e,f,g,h,l){return this.h.Ba?this.h.Ba(a,b,c,d,e,f,g,h,l):this.h.call(null,a,b,c,d,e,f,g,h,l)};k.pa=function(a,b,c,d,e,f,g,h,l,m){return this.h.pa?this.h.pa(a,b,c,d,e,f,g,h,l,m):this.h.call(null,a,b,c,d,e,f,g,h,l,m)};
k.qa=function(a,b,c,d,e,f,g,h,l,m,n){return this.h.qa?this.h.qa(a,b,c,d,e,f,g,h,l,m,n):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n)};k.ra=function(a,b,c,d,e,f,g,h,l,m,n,q){return this.h.ra?this.h.ra(a,b,c,d,e,f,g,h,l,m,n,q):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q)};k.sa=function(a,b,c,d,e,f,g,h,l,m,n,q,s){return this.h.sa?this.h.sa(a,b,c,d,e,f,g,h,l,m,n,q,s):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s)};
k.ta=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t){return this.h.ta?this.h.ta(a,b,c,d,e,f,g,h,l,m,n,q,s,t):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t)};k.ua=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u){return this.h.ua?this.h.ua(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u)};k.va=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z){return this.h.va?this.h.va(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z)};
k.wa=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G){return this.h.wa?this.h.wa(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G)};k.xa=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M){return this.h.xa?this.h.xa(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M)};
k.ya=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P){return this.h.ya?this.h.ya(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P)};k.za=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z){return this.h.za?this.h.za(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z):this.h.call(null,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z)};
k.Mb=function(a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$){return T.$a?T.$a(this.h,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$):T.call(null,this.h,a,b,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$)};k.Gb=!0;k.K=function(a,b){return new lc(this.h,b)};k.J=function(){return this.meta};function ec(a,b){return kc(a)&&!(a?a.l&262144||a.lc||(a.l?0:v($a,a)):v($a,a))?new lc(a,b):null==a?null:ab(a,b)}function mc(a){var b=null!=a;return(b?a?a.l&131072||a.Ob||(a.l?0:v(Ya,a)):v(Ya,a):b)?Za(a):null}
function nc(a){return null==a?!1:a?a.l&8||a.ec?!0:a.l?!1:v(Ba,a):v(Ba,a)}function oc(a){return null==a?!1:a?a.l&1024||a.hc?!0:a.l?!1:v(Pa,a):v(Pa,a)}function pc(a){return a?a.l&16384||a.kc?!0:a.l?!1:v(Ua,a):v(Ua,a)}function qc(a){return a?a.v&512||a.dc?!0:!1:!1}function rc(a){var b=[];ca(a,function(a){return function(b,e){return a.push(e)}}(b));return b}function sc(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,e-=1,b+=1}var tc={};function uc(a){return null==a?!1:a?a.l&64||a.Ra?!0:a.l?!1:v(Ha,a):v(Ha,a)}
function vc(a){return r(a)?!0:!1}function Pb(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(qa(a)===qa(b))return a&&(a.v&2048||a.Wa)?a.Xa(null,b):a>b?1:a<b?-1:0;throw Error("compare on non-nil objects of different types");}
var wc=function(){function a(a,b,c,g){for(;;){var h=Pb(Q.c(a,g),Q.c(b,g));if(0===h&&g+1<c)g+=1;else return h}}function b(a,b){var f=O(a),g=O(b);return f<g?-1:f>g?1:c.o(a,b,f,0)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 2:return b.call(this,c,e);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.o=a;return c}(),N=function(){function a(a,b,c){for(c=E(c);;)if(c){b=a.c?a.c(b,F(c)):a.call(null,b,F(c));if(Vb(b))return Xa(b);c=J(c)}else return b}
function b(a,b){var c=E(b);return c?xc.e?xc.e(a,F(c),J(c)):xc.call(null,a,F(c),J(c)):a.n?a.n():a.call(null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}(),xc=function(){function a(a,b,c){return c&&(c.l&524288||c.Qb)?c.W(null,a,b):c instanceof Array?Yb.e(c,a,b):"string"===typeof c?Yb.e(c,a,b):v(bb,c)?cb.e(c,a,b):N.e(a,b,c)}function b(a,b){return b&&(b.l&524288||
b.Qb)?b.V(null,a):b instanceof Array?Yb.c(b,a):"string"===typeof b?Yb.c(b,a):v(bb,b)?cb.c(b,a):N.c(a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}();
function yc(a){return function(){function b(b,c){return a.c?a.c(b,c):a.call(null,b,c)}function c(){return a.n?a.n():a.call(null)}var d=null,d=function(a,d){switch(arguments.length){case 0:return c.call(this);case 1:return a;case 2:return b.call(this,a,d)}throw Error("Invalid arity: "+arguments.length);};d.n=c;d.d=function(a){return a};d.c=b;return d}()}
var zc=function(){function a(a,b,c,g){a=a.d?a.d(yc(b)):a.call(null,yc(b));c=xc.e(a,c,g);c=a.d?a.d(Vb(c)?Xa(c):c):a.call(null,Vb(c)?Xa(c):c);return Vb(c)?Xa(c):c}function b(a,b,f){return c.o(a,b,b.n?b.n():b.call(null),f)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 3:return b.call(this,c,e,f);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.e=b;c.o=a;return c}();function Ac(a){return a-1}
function Bc(a){a=(a-a%2)/2;return 0<=a?Math.floor.d?Math.floor.d(a):Math.floor.call(null,a):Math.ceil.d?Math.ceil.d(a):Math.ceil.call(null,a)}function Cc(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Dc(a){var b=1;for(a=E(a);;)if(a&&0<b)b-=1,a=J(a);else return a}
var x=function(){function a(a){return null==a?"":a.toString()}var b=null,c=function(){function a(b,d){var h=null;1<arguments.length&&(h=K(Array.prototype.slice.call(arguments,1),0));return c.call(this,b,h)}function c(a,d){for(var e=new da(b.d(a)),l=d;;)if(r(l))e=e.append(b.d(F(l))),l=J(l);else return e.toString()}a.r=1;a.k=function(a){var b=F(a);a=H(a);return c(b,a)};a.j=c;return a}(),b=function(b,e){switch(arguments.length){case 0:return"";case 1:return a.call(this,b);default:return c.j(b,K(arguments,
1))}throw Error("Invalid arity: "+arguments.length);};b.r=1;b.k=c.k;b.n=function(){return""};b.d=a;b.j=c.j;return b}();function cc(a,b){var c;if(b?b.l&16777216||b.jc||(b.l?0:v(hb,b)):v(hb,b))if(Zb(a)&&Zb(b)&&O(a)!==O(b))c=!1;else a:{c=E(a);for(var d=E(b);;){if(null==c){c=null==d;break a}if(null!=d&&B.c(F(c),F(d)))c=J(c),d=J(d);else{c=!1;break a}}c=void 0}else c=null;return vc(c)}function Fc(a,b,c,d,e){this.meta=a;this.first=b;this.Da=c;this.count=d;this.t=e;this.l=65937646;this.v=8192}k=Fc.prototype;
k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.aa=function(){return 1===this.count?null:this.Da};k.R=function(){return this.count};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return I};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return this.first};k.Z=function(){return 1===this.count?I:this.Da};k.L=function(){return this};
k.K=function(a,b){return new Fc(b,this.first,this.Da,this.count,this.t)};k.O=function(a,b){return new Fc(this.meta,b,this,this.count+1,null)};function Gc(a){this.meta=a;this.l=65937614;this.v=8192}k=Gc.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.aa=function(){return null};k.R=function(){return 0};k.I=function(){return 0};k.H=function(a,b){return cc(this,b)};k.S=function(){return this};k.V=function(a,b){return N.c(b,this)};
k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return null};k.Z=function(){return I};k.L=function(){return null};k.K=function(a,b){return new Gc(b)};k.O=function(a,b){return new Fc(this.meta,b,null,1,null)};var I=new Gc(null);function Hc(a){return(a?a.l&134217728||a.ic||(a.l?0:v(jb,a)):v(jb,a))?kb(a):xc.e(hc,I,a)}
var Ic=function(){function a(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b;if(a instanceof Qb&&0===a.i)b=a.f;else a:{for(b=[];;)if(null!=a)b.push(a.Y(null)),a=a.aa(null);else break a;b=void 0}a=b.length;for(var e=I;;)if(0<a){var f=a-1,e=e.O(null,b[a-1]);a=f}else return e}a.r=0;a.k=function(a){a=E(a);return b(a)};a.j=b;return a}();
function Jc(a,b,c,d){this.meta=a;this.first=b;this.Da=c;this.t=d;this.l=65929452;this.v=8192}k=Jc.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.aa=function(){return null==this.Da?null:E(this.Da)};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(I,this.meta)};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return this.first};
k.Z=function(){return null==this.Da?I:this.Da};k.L=function(){return this};k.K=function(a,b){return new Jc(b,this.first,this.Da,this.t)};k.O=function(a,b){return new Jc(null,b,this,this.t)};function L(a,b){var c=null==b;return(c?c:b&&(b.l&64||b.Ra))?new Jc(null,a,b,null):new Jc(null,a,E(b),null)}function U(a,b,c,d){this.ca=a;this.name=b;this.Ca=c;this.La=d;this.l=2153775105;this.v=4096}k=U.prototype;k.F=function(a,b){return A(b,":"+x.d(this.Ca))};
k.I=function(){var a=this.La;return null!=a?a:this.La=a=Nb(Gb(this.name),Jb(this.ca))+2654435769|0};k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return R.c(c,this);case 3:return R.e(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return R.c(c,this)};a.e=function(a,c,d){return R.e(c,this,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return R.c(a,this)};
k.c=function(a,b){return R.e(a,this,b)};k.H=function(a,b){return b instanceof U?this.Ca===b.Ca:!1};k.toString=function(){return":"+x.d(this.Ca)};function Kc(a,b){return a===b?!0:a instanceof U&&b instanceof U?a.Ca===b.Ca:!1}
var Mc=function(){function a(a,b){return new U(a,b,""+x.d(r(a)?""+x.d(a)+"/":null)+x.d(b),null)}function b(a){if(a instanceof U)return a;if(a instanceof C){var b;if(a&&(a.v&4096||a.Pb))b=a.ca;else throw Error("Doesn't support namespace: "+x.d(a));return new U(b,Lc.d?Lc.d(a):Lc.call(null,a),a.Ha,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new U(b[0],b[1],a,null):new U(null,b[0],a,null)):null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,
c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}();function V(a,b,c,d){this.meta=a;this.Pa=b;this.s=c;this.t=d;this.v=0;this.l=32374988}k=V.prototype;k.toString=function(){return Bb(this)};function Nc(a){null!=a.Pa&&(a.s=a.Pa.n?a.Pa.n():a.Pa.call(null),a.Pa=null);return a.s}k.J=function(){return this.meta};k.aa=function(){gb(this);return null==this.s?null:J(this.s)};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};
k.S=function(){return ec(I,this.meta)};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){gb(this);return null==this.s?null:F(this.s)};k.Z=function(){gb(this);return null!=this.s?H(this.s):I};k.L=function(){Nc(this);if(null==this.s)return null;for(var a=this.s;;)if(a instanceof V)a=Nc(a);else return this.s=a,E(this.s)};k.K=function(a,b){return new V(b,this.Pa,this.s,this.t)};k.O=function(a,b){return L(b,this)};
function Oc(a,b){this.A=a;this.end=b;this.v=0;this.l=2}Oc.prototype.R=function(){return this.end};Oc.prototype.add=function(a){this.A[this.end]=a;return this.end+=1};Oc.prototype.D=function(){var a=new Pc(this.A,0,this.end);this.A=null;return a};function Qc(a){return new Oc(Array(a),0)}function Pc(a,b,c){this.f=a;this.off=b;this.end=c;this.v=0;this.l=524306}k=Pc.prototype;k.V=function(a,b){return Yb.o(this.f,b,this.f[this.off],this.off+1)};k.W=function(a,b,c){return Yb.o(this.f,b,c,this.off)};
k.tb=function(){if(this.off===this.end)throw Error("-drop-first of empty chunk");return new Pc(this.f,this.off+1,this.end)};k.P=function(a,b){return this.f[this.off+b]};k.$=function(a,b,c){return 0<=b&&b<this.end-this.off?this.f[this.off+b]:c};k.R=function(){return this.end-this.off};
var Rc=function(){function a(a,b,c){return new Pc(a,b,c)}function b(a,b){return new Pc(a,b,a.length)}function c(a){return new Pc(a,0,a.length)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.c=b;d.e=a;return d}();function Sc(a,b,c,d){this.D=a;this.na=b;this.meta=c;this.t=d;this.l=31850732;this.v=1536}k=Sc.prototype;k.toString=function(){return Bb(this)};
k.J=function(){return this.meta};k.aa=function(){if(1<za(this.D))return new Sc(tb(this.D),this.na,this.meta,null);var a=gb(this.na);return null==a?null:a};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(I,this.meta)};k.Y=function(){return y.c(this.D,0)};k.Z=function(){return 1<za(this.D)?new Sc(tb(this.D),this.na,this.meta,null):null==this.na?I:this.na};k.L=function(){return this};k.lb=function(){return this.D};
k.mb=function(){return null==this.na?I:this.na};k.K=function(a,b){return new Sc(this.D,this.na,b,this.t)};k.O=function(a,b){return L(b,this)};k.kb=function(){return null==this.na?null:this.na};function Tc(a,b){return 0===za(a)?b:new Sc(a,b,null,null)}function Uc(a,b){a.add(b)}function Vc(a){for(var b=[];;)if(E(a))b.push(F(a)),a=J(a);else return b}function Wc(a,b){if(Zb(a))return O(a);for(var c=a,d=b,e=0;;)if(0<d&&E(c))c=J(c),d-=1,e+=1;else return e}
var Yc=function Xc(b){return null==b?null:null==J(b)?E(F(b)):L(F(b),Xc(J(b)))},Zc=function(){function a(a,b){return new V(null,function(){var c=E(a);return c?qc(c)?Tc(ub(c),d.c(vb(c),b)):L(F(c),d.c(H(c),b)):b},null,null)}function b(a){return new V(null,function(){return a},null,null)}function c(){return new V(null,function(){return null},null,null)}var d=null,e=function(){function a(c,d,e){var f=null;2<arguments.length&&(f=K(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,f)}function b(a,
c,e){return function q(a,b){return new V(null,function(){var c=E(a);return c?qc(c)?Tc(ub(c),q(vb(c),b)):L(F(c),q(H(c),b)):r(b)?q(F(b),J(b)):null},null,null)}(d.c(a,c),e)}a.r=2;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=H(a);return b(c,d,a)};a.j=b;return a}(),d=function(d,g,h){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,d);case 2:return a.call(this,d,g);default:return e.j(d,g,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};d.r=2;d.k=e.k;d.n=c;
d.d=b;d.c=a;d.j=e.j;return d}(),$c=function(){function a(a,b,c,d){return L(a,L(b,L(c,d)))}function b(a,b,c){return L(a,L(b,c))}var c=null,d=function(){function a(c,d,e,m,n){var q=null;4<arguments.length&&(q=K(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,m,q)}function b(a,c,d,e,f){return L(a,L(c,L(d,L(e,Yc(f)))))}a.r=4;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var n=F(a);a=H(a);return b(c,d,e,n,a)};a.j=b;return a}(),c=function(c,f,g,h,l){switch(arguments.length){case 1:return E(c);
case 2:return L(c,f);case 3:return b.call(this,c,f,g);case 4:return a.call(this,c,f,g,h);default:return d.j(c,f,g,h,K(arguments,4))}throw Error("Invalid arity: "+arguments.length);};c.r=4;c.k=d.k;c.d=function(a){return E(a)};c.c=function(a,b){return L(a,b)};c.e=b;c.o=a;c.j=d.j;return c}(),ad=function(){var a=null,b=function(){function a(c,f,g,h){var l=null;3<arguments.length&&(l=K(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,f,g,l)}function b(a,c,d,h){for(;;)if(a=rb(a,c,d),r(h))c=
F(h),d=fc(h),h=J(J(h));else return a}a.r=3;a.k=function(a){var c=F(a);a=J(a);var g=F(a);a=J(a);var h=F(a);a=H(a);return b(c,g,h,a)};a.j=b;return a}(),a=function(a,d,e,f){switch(arguments.length){case 3:return rb(a,d,e);default:return b.j(a,d,e,K(arguments,3))}throw Error("Invalid arity: "+arguments.length);};a.r=3;a.k=b.k;a.e=function(a,b,e){return rb(a,b,e)};a.j=b.j;return a}();
function bd(a,b,c){var d=E(c);if(0===b)return a.n?a.n():a.call(null);c=Ia(d);var e=Ja(d);if(1===b)return a.d?a.d(c):a.d?a.d(c):a.call(null,c);var d=Ia(e),f=Ja(e);if(2===b)return a.c?a.c(c,d):a.c?a.c(c,d):a.call(null,c,d);var e=Ia(f),g=Ja(f);if(3===b)return a.e?a.e(c,d,e):a.e?a.e(c,d,e):a.call(null,c,d,e);var f=Ia(g),h=Ja(g);if(4===b)return a.o?a.o(c,d,e,f):a.o?a.o(c,d,e,f):a.call(null,c,d,e,f);var g=Ia(h),l=Ja(h);if(5===b)return a.w?a.w(c,d,e,f,g):a.w?a.w(c,d,e,f,g):a.call(null,c,d,e,f,g);var h=Ia(l),
m=Ja(l);if(6===b)return a.X?a.X(c,d,e,f,g,h):a.X?a.X(c,d,e,f,g,h):a.call(null,c,d,e,f,g,h);var l=Ia(m),n=Ja(m);if(7===b)return a.fa?a.fa(c,d,e,f,g,h,l):a.fa?a.fa(c,d,e,f,g,h,l):a.call(null,c,d,e,f,g,h,l);var m=Ia(n),q=Ja(n);if(8===b)return a.Aa?a.Aa(c,d,e,f,g,h,l,m):a.Aa?a.Aa(c,d,e,f,g,h,l,m):a.call(null,c,d,e,f,g,h,l,m);var n=Ia(q),s=Ja(q);if(9===b)return a.Ba?a.Ba(c,d,e,f,g,h,l,m,n):a.Ba?a.Ba(c,d,e,f,g,h,l,m,n):a.call(null,c,d,e,f,g,h,l,m,n);var q=Ia(s),t=Ja(s);if(10===b)return a.pa?a.pa(c,d,e,
f,g,h,l,m,n,q):a.pa?a.pa(c,d,e,f,g,h,l,m,n,q):a.call(null,c,d,e,f,g,h,l,m,n,q);var s=Ia(t),u=Ja(t);if(11===b)return a.qa?a.qa(c,d,e,f,g,h,l,m,n,q,s):a.qa?a.qa(c,d,e,f,g,h,l,m,n,q,s):a.call(null,c,d,e,f,g,h,l,m,n,q,s);var t=Ia(u),z=Ja(u);if(12===b)return a.ra?a.ra(c,d,e,f,g,h,l,m,n,q,s,t):a.ra?a.ra(c,d,e,f,g,h,l,m,n,q,s,t):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t);var u=Ia(z),G=Ja(z);if(13===b)return a.sa?a.sa(c,d,e,f,g,h,l,m,n,q,s,t,u):a.sa?a.sa(c,d,e,f,g,h,l,m,n,q,s,t,u):a.call(null,c,d,e,f,g,h,l,m,n,
q,s,t,u);var z=Ia(G),M=Ja(G);if(14===b)return a.ta?a.ta(c,d,e,f,g,h,l,m,n,q,s,t,u,z):a.ta?a.ta(c,d,e,f,g,h,l,m,n,q,s,t,u,z):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z);var G=Ia(M),P=Ja(M);if(15===b)return a.ua?a.ua(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G):a.ua?a.ua(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G);var M=Ia(P),Z=Ja(P);if(16===b)return a.va?a.va(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M):a.va?a.va(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M);var P=
Ia(Z),$=Ja(Z);if(17===b)return a.wa?a.wa(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P):a.wa?a.wa(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P);var Z=Ia($),Ea=Ja($);if(18===b)return a.xa?a.xa(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z):a.xa?a.xa(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z);$=Ia(Ea);Ea=Ja(Ea);if(19===b)return a.ya?a.ya(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$):a.ya?a.ya(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$):a.call(null,c,d,e,
f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$);var D=Ia(Ea);Ja(Ea);if(20===b)return a.za?a.za(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$,D):a.za?a.za(c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$,D):a.call(null,c,d,e,f,g,h,l,m,n,q,s,t,u,z,G,M,P,Z,$,D);throw Error("Only up to 20 arguments supported on functions");}
var T=function(){function a(a,b,c,d,e){b=$c.o(b,c,d,e);c=a.r;return a.k?(d=Wc(b,c+1),d<=c?bd(a,d,b):a.k(b)):a.apply(a,Vc(b))}function b(a,b,c,d){b=$c.e(b,c,d);c=a.r;return a.k?(d=Wc(b,c+1),d<=c?bd(a,d,b):a.k(b)):a.apply(a,Vc(b))}function c(a,b,c){b=$c.c(b,c);c=a.r;if(a.k){var d=Wc(b,c+1);return d<=c?bd(a,d,b):a.k(b)}return a.apply(a,Vc(b))}function d(a,b){var c=a.r;if(a.k){var d=Wc(b,c+1);return d<=c?bd(a,d,b):a.k(b)}return a.apply(a,Vc(b))}var e=null,f=function(){function a(c,d,e,f,g,t){var u=null;
5<arguments.length&&(u=K(Array.prototype.slice.call(arguments,5),0));return b.call(this,c,d,e,f,g,u)}function b(a,c,d,e,f,g){c=L(c,L(d,L(e,L(f,Yc(g)))));d=a.r;return a.k?(e=Wc(c,d+1),e<=d?bd(a,e,c):a.k(c)):a.apply(a,Vc(c))}a.r=5;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var f=F(a);a=J(a);var g=F(a);a=H(a);return b(c,d,e,f,g,a)};a.j=b;return a}(),e=function(e,h,l,m,n,q){switch(arguments.length){case 2:return d.call(this,e,h);case 3:return c.call(this,e,h,l);case 4:return b.call(this,
e,h,l,m);case 5:return a.call(this,e,h,l,m,n);default:return f.j(e,h,l,m,n,K(arguments,5))}throw Error("Invalid arity: "+arguments.length);};e.r=5;e.k=f.k;e.c=d;e.e=c;e.o=b;e.w=a;e.j=f.j;return e}(),cd=function(){function a(a,b){return!B.c(a,b)}var b=null,c=function(){function a(c,d,h){var l=null;2<arguments.length&&(l=K(Array.prototype.slice.call(arguments,2),0));return b.call(this,c,d,l)}function b(a,c,d){return pa(T.o(B,a,c,d))}a.r=2;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=H(a);return b(c,
d,a)};a.j=b;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!1;case 2:return a.call(this,b,e);default:return c.j(b,e,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.d=function(){return!1};b.c=a;b.j=c.j;return b}();function dd(a,b){for(;;){if(null==E(b))return!0;if(r(a.d?a.d(F(b)):a.call(null,F(b)))){var c=a,d=J(b);a=c;b=d}else return!1}}
function ed(a,b){for(;;)if(E(b)){var c=a.d?a.d(F(b)):a.call(null,F(b));if(r(c))return c;var c=a,d=J(b);a=c;b=d}else return null}function fd(a){return a}
function gd(a){return function(){function b(b,c){return pa(a.c?a.c(b,c):a.call(null,b,c))}function c(b){return pa(a.d?a.d(b):a.call(null,b))}function d(){return pa(a.n?a.n():a.call(null))}var e=null,f=function(){function b(a,d,e){var f=null;2<arguments.length&&(f=K(Array.prototype.slice.call(arguments,2),0));return c.call(this,a,d,f)}function c(b,d,e){return pa(T.o(a,b,d,e))}b.r=2;b.k=function(a){var b=F(a);a=J(a);var d=F(a);a=H(a);return c(b,d,a)};b.j=c;return b}(),e=function(a,e,l){switch(arguments.length){case 0:return d.call(this);
case 1:return c.call(this,a);case 2:return b.call(this,a,e);default:return f.j(a,e,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};e.r=2;e.k=f.k;e.n=d;e.d=c;e.c=b;e.j=f.j;return e}()}function hd(){return function(){function a(a){0<arguments.length&&K(Array.prototype.slice.call(arguments,0),0);return!1}a.r=0;a.k=function(a){E(a);return!1};a.j=function(){return!1};return a}()}
var id=function(){function a(a,b,c){return function(){function d(h,l,m){return a.d?a.d(b.d?b.d(c.e?c.e(h,l,m):c.call(null,h,l,m)):b.call(null,c.e?c.e(h,l,m):c.call(null,h,l,m))):a.call(null,b.d?b.d(c.e?c.e(h,l,m):c.call(null,h,l,m)):b.call(null,c.e?c.e(h,l,m):c.call(null,h,l,m)))}function l(d,h){return a.d?a.d(b.d?b.d(c.c?c.c(d,h):c.call(null,d,h)):b.call(null,c.c?c.c(d,h):c.call(null,d,h))):a.call(null,b.d?b.d(c.c?c.c(d,h):c.call(null,d,h)):b.call(null,c.c?c.c(d,h):c.call(null,d,h)))}function m(d){return a.d?
a.d(b.d?b.d(c.d?c.d(d):c.call(null,d)):b.call(null,c.d?c.d(d):c.call(null,d))):a.call(null,b.d?b.d(c.d?c.d(d):c.call(null,d)):b.call(null,c.d?c.d(d):c.call(null,d)))}function n(){return a.d?a.d(b.d?b.d(c.n?c.n():c.call(null)):b.call(null,c.n?c.n():c.call(null))):a.call(null,b.d?b.d(c.n?c.n():c.call(null)):b.call(null,c.n?c.n():c.call(null)))}var q=null,s=function(){function d(a,b,c,e){var f=null;3<arguments.length&&(f=K(Array.prototype.slice.call(arguments,3),0));return h.call(this,a,b,c,f)}function h(d,
l,m,n){return a.d?a.d(b.d?b.d(T.w(c,d,l,m,n)):b.call(null,T.w(c,d,l,m,n))):a.call(null,b.d?b.d(T.w(c,d,l,m,n)):b.call(null,T.w(c,d,l,m,n)))}d.r=3;d.k=function(a){var b=F(a);a=J(a);var c=F(a);a=J(a);var d=F(a);a=H(a);return h(b,c,d,a)};d.j=h;return d}(),q=function(a,b,c,e){switch(arguments.length){case 0:return n.call(this);case 1:return m.call(this,a);case 2:return l.call(this,a,b);case 3:return d.call(this,a,b,c);default:return s.j(a,b,c,K(arguments,3))}throw Error("Invalid arity: "+arguments.length);
};q.r=3;q.k=s.k;q.n=n;q.d=m;q.c=l;q.e=d;q.j=s.j;return q}()}function b(a,b){return function(){function c(d,g,h){return a.d?a.d(b.e?b.e(d,g,h):b.call(null,d,g,h)):a.call(null,b.e?b.e(d,g,h):b.call(null,d,g,h))}function d(c,g){return a.d?a.d(b.c?b.c(c,g):b.call(null,c,g)):a.call(null,b.c?b.c(c,g):b.call(null,c,g))}function l(c){return a.d?a.d(b.d?b.d(c):b.call(null,c)):a.call(null,b.d?b.d(c):b.call(null,c))}function m(){return a.d?a.d(b.n?b.n():b.call(null)):a.call(null,b.n?b.n():b.call(null))}var n=
null,q=function(){function c(a,b,e,f){var g=null;3<arguments.length&&(g=K(Array.prototype.slice.call(arguments,3),0));return d.call(this,a,b,e,g)}function d(c,g,h,l){return a.d?a.d(T.w(b,c,g,h,l)):a.call(null,T.w(b,c,g,h,l))}c.r=3;c.k=function(a){var b=F(a);a=J(a);var c=F(a);a=J(a);var e=F(a);a=H(a);return d(b,c,e,a)};c.j=d;return c}(),n=function(a,b,e,f){switch(arguments.length){case 0:return m.call(this);case 1:return l.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,e);
default:return q.j(a,b,e,K(arguments,3))}throw Error("Invalid arity: "+arguments.length);};n.r=3;n.k=q.k;n.n=m;n.d=l;n.c=d;n.e=c;n.j=q.j;return n}()}var c=null,d=function(){function a(c,d,e,m){var n=null;3<arguments.length&&(n=K(Array.prototype.slice.call(arguments,3),0));return b.call(this,c,d,e,n)}function b(a,c,d,e){return function(a){return function(){function b(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return c.call(this,d)}function c(b){b=T.c(F(a),b);
for(var d=J(a);;)if(d)b=F(d).call(null,b),d=J(d);else return b}b.r=0;b.k=function(a){a=E(a);return c(a)};b.j=c;return b}()}(Hc($c.o(a,c,d,e)))}a.r=3;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=H(a);return b(c,d,e,a)};a.j=b;return a}(),c=function(c,f,g,h){switch(arguments.length){case 0:return fd;case 1:return c;case 2:return b.call(this,c,f);case 3:return a.call(this,c,f,g);default:return d.j(c,f,g,K(arguments,3))}throw Error("Invalid arity: "+arguments.length);};c.r=3;c.k=d.k;
c.n=function(){return fd};c.d=function(a){return a};c.c=b;c.e=a;c.j=d.j;return c}(),jd=function(){function a(a,b,c,d){return function(){function e(a){var b=null;0<arguments.length&&(b=K(Array.prototype.slice.call(arguments,0),0));return n.call(this,b)}function n(e){return T.w(a,b,c,d,e)}e.r=0;e.k=function(a){a=E(a);return n(a)};e.j=n;return e}()}function b(a,b,c){return function(){function d(a){var b=null;0<arguments.length&&(b=K(Array.prototype.slice.call(arguments,0),0));return e.call(this,b)}function e(d){return T.o(a,
b,c,d)}d.r=0;d.k=function(a){a=E(a);return e(a)};d.j=e;return d}()}function c(a,b){return function(){function c(a){var b=null;0<arguments.length&&(b=K(Array.prototype.slice.call(arguments,0),0));return d.call(this,b)}function d(c){return T.e(a,b,c)}c.r=0;c.k=function(a){a=E(a);return d(a)};c.j=d;return c}()}var d=null,e=function(){function a(c,d,e,f,q){var s=null;4<arguments.length&&(s=K(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,s)}function b(a,c,d,e,f){return function(){function b(a){var c=
null;0<arguments.length&&(c=K(Array.prototype.slice.call(arguments,0),0));return g.call(this,c)}function g(b){return T.w(a,c,d,e,Zc.c(f,b))}b.r=0;b.k=function(a){a=E(a);return g(a)};b.j=g;return b}()}a.r=4;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var f=F(a);a=H(a);return b(c,d,e,f,a)};a.j=b;return a}(),d=function(d,g,h,l,m){switch(arguments.length){case 1:return d;case 2:return c.call(this,d,g);case 3:return b.call(this,d,g,h);case 4:return a.call(this,d,g,h,l);default:return e.j(d,
g,h,l,K(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.r=4;d.k=e.k;d.d=function(a){return a};d.c=c;d.e=b;d.o=a;d.j=e.j;return d}();function kd(a,b,c,d){this.state=a;this.meta=b;this.cc=c;this.Fb=d;this.l=6455296;this.v=16386}k=kd.prototype;k.I=function(){return this[aa]||(this[aa]=++ba)};
k.zb=function(a,b,c){a=E(this.Fb);for(var d=null,e=0,f=0;;)if(f<e){var g=d.P(null,f),h=Q.e(g,0,null),g=Q.e(g,1,null);g.o?g.o(h,this,b,c):g.call(null,h,this,b,c);f+=1}else if(a=E(a))qc(a)?(d=ub(a),a=vb(a),h=d,e=O(d),d=h):(d=F(a),h=Q.e(d,0,null),g=Q.e(d,1,null),g.o?g.o(h,this,b,c):g.call(null,h,this,b,c),a=J(a),d=null,e=0),f=0;else return null};k.J=function(){return this.meta};k.Ya=function(){return this.state};k.H=function(a,b){return this===b};
var od=function(){function a(a){return new kd(a,null,null,null)}var b=null,c=function(){function a(c,d){var h=null;1<arguments.length&&(h=K(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,h)}function b(a,c){var d=uc(c)?T.c(md,c):c,e=R.c(d,nd),d=R.c(d,la);return new kd(a,d,e,null)}a.r=1;a.k=function(a){var c=F(a);a=H(a);return b(c,a)};a.j=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.j(b,K(arguments,1))}throw Error("Invalid arity: "+
arguments.length);};b.r=1;b.k=c.k;b.d=a;b.j=c.j;return b}();
function pd(a,b){if(a instanceof kd){var c=a.cc;if(null!=c&&!r(c.d?c.d(b):c.call(null,b)))throw Error("Assert failed: Validator rejected reference state\n"+x.d(qd.d?qd.d(Ic(new C(null,"validate","validate",1439230700,null),new C(null,"new-value","new-value",-1567397401,null))):qd.call(null,Ic(new C(null,"validate","validate",1439230700,null),new C(null,"new-value","new-value",-1567397401,null)))));c=a.state;a.state=b;null!=a.Fb&&nb(a,c,b);return b}return yb(a,b)}
var rd=function(){function a(a,b,c,d){return a instanceof kd?pd(a,b.e?b.e(a.state,c,d):b.call(null,a.state,c,d)):zb.o(a,b,c,d)}function b(a,b,c){return a instanceof kd?pd(a,b.c?b.c(a.state,c):b.call(null,a.state,c)):zb.e(a,b,c)}function c(a,b){return a instanceof kd?pd(a,b.d?b.d(a.state):b.call(null,a.state)):zb.c(a,b)}var d=null,e=function(){function a(c,d,e,f,q){var s=null;4<arguments.length&&(s=K(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,s)}function b(a,c,d,e,f){return a instanceof
kd?pd(a,T.w(c,a.state,d,e,f)):zb.w(a,c,d,e,f)}a.r=4;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var f=F(a);a=H(a);return b(c,d,e,f,a)};a.j=b;return a}(),d=function(d,g,h,l,m){switch(arguments.length){case 2:return c.call(this,d,g);case 3:return b.call(this,d,g,h);case 4:return a.call(this,d,g,h,l);default:return e.j(d,g,h,l,K(arguments,4))}throw Error("Invalid arity: "+arguments.length);};d.r=4;d.k=e.k;d.c=c;d.e=b;d.o=a;d.j=e.j;return d}(),sd=function(){function a(a,b,c,
d){return new V(null,function(){var f=E(b),q=E(c),s=E(d);return f&&q&&s?L(a.e?a.e(F(f),F(q),F(s)):a.call(null,F(f),F(q),F(s)),e.o(a,H(f),H(q),H(s))):null},null,null)}function b(a,b,c){return new V(null,function(){var d=E(b),f=E(c);return d&&f?L(a.c?a.c(F(d),F(f)):a.call(null,F(d),F(f)),e.e(a,H(d),H(f))):null},null,null)}function c(a,b){return new V(null,function(){var c=E(b);if(c){if(qc(c)){for(var d=ub(c),f=O(d),q=Qc(f),s=0;;)if(s<f){var t=a.d?a.d(y.c(d,s)):a.call(null,y.c(d,s));q.add(t);s+=1}else break;
return Tc(q.D(),e.c(a,vb(c)))}return L(a.d?a.d(F(c)):a.call(null,F(c)),e.c(a,H(c)))}return null},null,null)}function d(a){return function(b){return function(){function c(d,e){return b.c?b.c(d,a.d?a.d(e):a.call(null,e)):b.call(null,d,a.d?a.d(e):a.call(null,e))}function d(a){return b.d?b.d(a):b.call(null,a)}function e(){return b.n?b.n():b.call(null)}var f=null,s=function(){function c(a,b,e){var f=null;2<arguments.length&&(f=K(Array.prototype.slice.call(arguments,2),0));return d.call(this,a,b,f)}function d(c,
e,f){return b.c?b.c(c,T.e(a,e,f)):b.call(null,c,T.e(a,e,f))}c.r=2;c.k=function(a){var b=F(a);a=J(a);var c=F(a);a=H(a);return d(b,c,a)};c.j=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:return s.j(a,b,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};f.r=2;f.k=s.k;f.n=e;f.d=d;f.c=c;f.j=s.j;return f}()}}var e=null,f=function(){function a(c,d,e,f,g){var t=null;4<arguments.length&&
(t=K(Array.prototype.slice.call(arguments,4),0));return b.call(this,c,d,e,f,t)}function b(a,c,d,f,g){var h=function z(a){return new V(null,function(){var b=e.c(E,a);return dd(fd,b)?L(e.c(F,b),z(e.c(H,b))):null},null,null)};return e.c(function(){return function(b){return T.c(a,b)}}(h),h(hc.j(g,f,K([d,c],0))))}a.r=4;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var f=F(a);a=H(a);return b(c,d,e,f,a)};a.j=b;return a}(),e=function(e,h,l,m,n){switch(arguments.length){case 1:return d.call(this,
e);case 2:return c.call(this,e,h);case 3:return b.call(this,e,h,l);case 4:return a.call(this,e,h,l,m);default:return f.j(e,h,l,m,K(arguments,4))}throw Error("Invalid arity: "+arguments.length);};e.r=4;e.k=f.k;e.d=d;e.c=c;e.e=b;e.o=a;e.j=f.j;return e}(),td=function(){function a(a,b){return new V(null,function(){if(0<a){var f=E(b);return f?L(F(f),c.c(a-1,H(f))):null}return null},null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var h=Xa(a),l=rd.c(a,Ac),
h=0<h?b.c?b.c(d,g):b.call(null,d,g):d;return 0<l?h:new Ub(h)}function d(a){return b.d?b.d(a):b.call(null,a)}function l(){return b.n?b.n():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.n=l;m.d=d;m.c=c;return m}()}(od.d(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.d=b;c.c=a;return c}(),ud=function(){function a(a,b){return new V(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var c=E(b);if(0<a&&c){var d=a-1,c=H(c);a=d;b=c}else return c}}),null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var h=Xa(a);rd.c(a,Ac);return 0<h?d:b.c?b.c(d,g):b.call(null,d,g)}function d(a){return b.d?b.d(a):b.call(null,a)}function l(){return b.n?b.n():b.call(null)}var m=null,m=function(a,
b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.n=l;m.d=d;m.c=c;return m}()}(od.d(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),vd=function(){function a(a,b){return td.c(a,c.d(b))}function b(a){return new V(null,function(){return L(a,c.d(a))},
null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),wd=function(){function a(a,c){return new V(null,function(){var f=E(a),g=E(c);return f&&g?L(F(f),L(F(g),b.c(H(f),H(g)))):null},null,null)}var b=null,c=function(){function a(b,d,h){var l=null;2<arguments.length&&(l=K(Array.prototype.slice.call(arguments,2),0));return c.call(this,b,d,l)}function c(a,d,e){return new V(null,
function(){var c=sd.c(E,hc.j(e,d,K([a],0)));return dd(fd,c)?Zc.c(sd.c(F,c),T.c(b,sd.c(H,c))):null},null,null)}a.r=2;a.k=function(a){var b=F(a);a=J(a);var d=F(a);a=H(a);return c(b,d,a)};a.j=c;return a}(),b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:return c.j(b,e,K(arguments,2))}throw Error("Invalid arity: "+arguments.length);};b.r=2;b.k=c.k;b.c=a;b.j=c.j;return b}();function xd(a,b){return ud.c(1,wd.c(vd.d(a),b))}
var yd=function(){function a(a,b){return new V(null,function(){var f=E(b);if(f){if(qc(f)){for(var g=ub(f),h=O(g),l=Qc(h),m=0;;)if(m<h){if(r(a.d?a.d(y.c(g,m)):a.call(null,y.c(g,m)))){var n=y.c(g,m);l.add(n)}m+=1}else break;return Tc(l.D(),c.c(a,vb(f)))}g=F(f);f=H(f);return r(a.d?a.d(g):a.call(null,g))?L(g,c.c(a,f)):c.c(a,f)}return null},null,null)}function b(a){return function(b){return function(){function c(f,g){return r(a.d?a.d(g):a.call(null,g))?b.c?b.c(f,g):b.call(null,f,g):f}function g(a){return b.d?
b.d(a):b.call(null,a)}function h(){return b.n?b.n():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.n=h;l.d=g;l.c=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),zd=function(){function a(a,b){return yd.c(gd(a),
b)}function b(a){return yd.d(gd(a))}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),Ad=function(){function a(a,b,c){a&&(a.v&4||a.Ib)?(b=zc.o(b,pb,ob(a),c),b=qb(b),a=ec(b,mc(a))):a=zc.o(b,hc,a,c);return a}function b(a,b){var c;null!=a?a&&(a.v&4||a.Ib)?(c=xc.e(pb,ob(a),b),c=qb(c),c=ec(c,mc(a))):c=xc.e(Fa,a,b):c=xc.e(hc,I,b);return c}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}(),Bd=function(){function a(a,b,c){var g=tc;for(b=E(b);;)if(b){var h=a;if(h?h.l&256||h.vb||(h.l?0:v(Ma,h)):v(Ma,h)){a=R.e(a,F(b),g);if(g===a)return c;b=J(b)}else return c}else return a}function b(a,b){return c.e(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=
b;c.e=a;return c}(),Dd=function Cd(b,c,d){var e=Q.e(c,0,null);return(c=Dc(c))?S.e(b,e,Cd(R.c(b,e),c,d)):S.e(b,e,d)},Ed=function(){function a(a,b,c,d,f,q){var s=Q.e(b,0,null);return(b=Dc(b))?S.e(a,s,e.X(R.c(a,s),b,c,d,f,q)):S.e(a,s,c.o?c.o(R.c(a,s),d,f,q):c.call(null,R.c(a,s),d,f,q))}function b(a,b,c,d,f){var q=Q.e(b,0,null);return(b=Dc(b))?S.e(a,q,e.w(R.c(a,q),b,c,d,f)):S.e(a,q,c.e?c.e(R.c(a,q),d,f):c.call(null,R.c(a,q),d,f))}function c(a,b,c,d){var f=Q.e(b,0,null);return(b=Dc(b))?S.e(a,f,e.o(R.c(a,
f),b,c,d)):S.e(a,f,c.c?c.c(R.c(a,f),d):c.call(null,R.c(a,f),d))}function d(a,b,c){var d=Q.e(b,0,null);return(b=Dc(b))?S.e(a,d,e.e(R.c(a,d),b,c)):S.e(a,d,c.d?c.d(R.c(a,d)):c.call(null,R.c(a,d)))}var e=null,f=function(){function a(c,d,e,f,g,t,u){var z=null;6<arguments.length&&(z=K(Array.prototype.slice.call(arguments,6),0));return b.call(this,c,d,e,f,g,t,z)}function b(a,c,d,f,g,h,u){var z=Q.e(c,0,null);return(c=Dc(c))?S.e(a,z,T.j(e,R.c(a,z),c,d,f,K([g,h,u],0))):S.e(a,z,T.j(d,R.c(a,z),f,g,h,K([u],0)))}
a.r=6;a.k=function(a){var c=F(a);a=J(a);var d=F(a);a=J(a);var e=F(a);a=J(a);var f=F(a);a=J(a);var g=F(a);a=J(a);var u=F(a);a=H(a);return b(c,d,e,f,g,u,a)};a.j=b;return a}(),e=function(e,h,l,m,n,q,s){switch(arguments.length){case 3:return d.call(this,e,h,l);case 4:return c.call(this,e,h,l,m);case 5:return b.call(this,e,h,l,m,n);case 6:return a.call(this,e,h,l,m,n,q);default:return f.j(e,h,l,m,n,q,K(arguments,6))}throw Error("Invalid arity: "+arguments.length);};e.r=6;e.k=f.k;e.e=d;e.o=c;e.w=b;e.X=
a;e.j=f.j;return e}();function Fd(a,b){this.C=a;this.f=b}function Gd(a){return new Fd(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function Hd(a){a=a.m;return 32>a?0:a-1>>>5<<5}function Id(a,b,c){for(;;){if(0===b)return c;var d=Gd(a);d.f[0]=c;c=d;b-=5}}
var Kd=function Jd(b,c,d,e){var f=new Fd(d.C,ta(d.f)),g=b.m-1>>>c&31;5===c?f.f[g]=e:(d=d.f[g],b=null!=d?Jd(b,c-5,d,e):Id(null,c-5,e),f.f[g]=b);return f};function Ld(a,b){throw Error("No item "+x.d(a)+" in vector of length "+x.d(b));}function Md(a){var b=a.root;for(a=a.shift;;)if(0<a)a-=5,b=b.f[0];else return b.f}function Nd(a,b){if(b>=Hd(a))return a.B;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.f[b>>>d&31],d=e;else return c.f}function Od(a,b){return 0<=b&&b<a.m?Nd(a,b):Ld(b,a.m)}
var Qd=function Pd(b,c,d,e,f){var g=new Fd(d.C,ta(d.f));if(0===c)g.f[e&31]=f;else{var h=e>>>c&31;b=Pd(b,c-5,d.f[h],e,f);g.f[h]=b}return g};function W(a,b,c,d,e,f){this.meta=a;this.m=b;this.shift=c;this.root=d;this.B=e;this.t=f;this.l=167668511;this.v=8196}k=W.prototype;k.toString=function(){return Bb(this)};k.T=function(a,b){return Na.e(this,b,null)};k.U=function(a,b,c){return"number"===typeof b?y.e(this,b,c):c};k.P=function(a,b){return Od(this,b)[b&31]};
k.$=function(a,b,c){return 0<=b&&b<this.m?Nd(this,b)[b&31]:c};k.ob=function(a,b,c){if(0<=b&&b<this.m)return Hd(this)<=b?(a=ta(this.B),a[b&31]=c,new W(this.meta,this.m,this.shift,this.root,a,null)):new W(this.meta,this.m,this.shift,Qd(this,this.shift,this.root,b,c),this.B,null);if(b===this.m)return Fa(this,c);throw Error("Index "+x.d(b)+" out of bounds  [0,"+x.d(this.m)+"]");};k.J=function(){return this.meta};k.R=function(){return this.m};k.nb=function(){return y.c(this,0)};
k.wb=function(){return y.c(this,1)};k.ab=function(){return 0<this.m?new ac(this,this.m-1,null):null};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.Za=function(){return new Rd(this.m,this.shift,Sd.d?Sd.d(this.root):Sd.call(null,this.root),Td.d?Td.d(this.B):Td.call(null,this.B))};k.S=function(){return ec(gc,this.meta)};k.V=function(a,b){return Xb.c(this,b)};k.W=function(a,b,c){return Xb.e(this,b,c)};
k.Qa=function(a,b,c){if("number"===typeof b)return Va(this,b,c);throw Error("Vector's key for assoc must be a number.");};k.L=function(){return 0===this.m?null:32>=this.m?new Qb(this.B,0):Ud.o?Ud.o(this,Md(this),0,0):Ud.call(null,this,Md(this),0,0)};k.K=function(a,b){return new W(b,this.m,this.shift,this.root,this.B,this.t)};
k.O=function(a,b){if(32>this.m-Hd(this)){for(var c=this.B.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.B[e],e+=1;else break;d[c]=b;return new W(this.meta,this.m+1,this.shift,this.root,d,null)}c=(d=this.m>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Gd(null),d.f[0]=this.root,e=Id(null,this.shift,new Fd(null,this.B)),d.f[1]=e):d=Kd(this,this.shift,this.root,new Fd(null,this.B));return new W(this.meta,this.m+1,c,d,[b],null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.P(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.P(null,c)};a.e=function(a,c,d){return this.$(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return this.P(null,a)};k.c=function(a,b){return this.$(null,a,b)};
var X=new Fd(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),gc=new W(null,0,5,X,[],0);function Vd(a){return qb(xc.e(pb,ob(gc),a))}function Wd(a,b,c,d,e,f){this.G=a;this.ia=b;this.i=c;this.off=d;this.meta=e;this.t=f;this.l=32243948;this.v=1536}k=Wd.prototype;k.toString=function(){return Bb(this)};
k.aa=function(){if(this.off+1<this.ia.length){var a=Ud.o?Ud.o(this.G,this.ia,this.i,this.off+1):Ud.call(null,this.G,this.ia,this.i,this.off+1);return null==a?null:a}return xb(this)};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(gc,this.meta)};k.V=function(a,b){return Xb.c(Xd.e?Xd.e(this.G,this.i+this.off,O(this.G)):Xd.call(null,this.G,this.i+this.off,O(this.G)),b)};
k.W=function(a,b,c){return Xb.e(Xd.e?Xd.e(this.G,this.i+this.off,O(this.G)):Xd.call(null,this.G,this.i+this.off,O(this.G)),b,c)};k.Y=function(){return this.ia[this.off]};k.Z=function(){if(this.off+1<this.ia.length){var a=Ud.o?Ud.o(this.G,this.ia,this.i,this.off+1):Ud.call(null,this.G,this.ia,this.i,this.off+1);return null==a?I:a}return vb(this)};k.L=function(){return this};k.lb=function(){return Rc.c(this.ia,this.off)};
k.mb=function(){var a=this.i+this.ia.length;return a<za(this.G)?Ud.o?Ud.o(this.G,Nd(this.G,a),a,0):Ud.call(null,this.G,Nd(this.G,a),a,0):I};k.K=function(a,b){return Ud.w?Ud.w(this.G,this.ia,this.i,this.off,b):Ud.call(null,this.G,this.ia,this.i,this.off,b)};k.O=function(a,b){return L(b,this)};k.kb=function(){var a=this.i+this.ia.length;return a<za(this.G)?Ud.o?Ud.o(this.G,Nd(this.G,a),a,0):Ud.call(null,this.G,Nd(this.G,a),a,0):null};
var Ud=function(){function a(a,b,c,d,l){return new Wd(a,b,c,d,l,null)}function b(a,b,c,d){return new Wd(a,b,c,d,null,null)}function c(a,b,c){return new Wd(a,Od(a,b),b,c,null,null)}var d=null,d=function(d,f,g,h,l){switch(arguments.length){case 3:return c.call(this,d,f,g);case 4:return b.call(this,d,f,g,h);case 5:return a.call(this,d,f,g,h,l)}throw Error("Invalid arity: "+arguments.length);};d.e=c;d.o=b;d.w=a;return d}();
function Yd(a,b,c,d,e){this.meta=a;this.oa=b;this.start=c;this.end=d;this.t=e;this.l=166617887;this.v=8192}k=Yd.prototype;k.toString=function(){return Bb(this)};k.T=function(a,b){return Na.e(this,b,null)};k.U=function(a,b,c){return"number"===typeof b?y.e(this,b,c):c};k.P=function(a,b){return 0>b||this.end<=this.start+b?Ld(b,this.end-this.start):y.c(this.oa,this.start+b)};k.$=function(a,b,c){return 0>b||this.end<=this.start+b?c:y.e(this.oa,this.start+b,c)};
k.ob=function(a,b,c){var d=this,e=d.start+b;return Zd.w?Zd.w(d.meta,S.e(d.oa,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null):Zd.call(null,d.meta,S.e(d.oa,e,c),d.start,function(){var a=d.end,b=e+1;return a>b?a:b}(),null)};k.J=function(){return this.meta};k.R=function(){return this.end-this.start};k.ab=function(){return this.start!==this.end?new ac(this,this.end-this.start-1,null):null};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};
k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(gc,this.meta)};k.V=function(a,b){return Xb.c(this,b)};k.W=function(a,b,c){return Xb.e(this,b,c)};k.Qa=function(a,b,c){if("number"===typeof b)return Va(this,b,c);throw Error("Subvec's key for assoc must be a number.");};k.L=function(){var a=this;return function(b){return function d(e){return e===a.end?null:L(y.c(a.oa,e),new V(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};
k.K=function(a,b){return Zd.w?Zd.w(b,this.oa,this.start,this.end,this.t):Zd.call(null,b,this.oa,this.start,this.end,this.t)};k.O=function(a,b){return Zd.w?Zd.w(this.meta,Va(this.oa,this.end,b),this.start,this.end+1,null):Zd.call(null,this.meta,Va(this.oa,this.end,b),this.start,this.end+1,null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.P(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.P(null,c)};a.e=function(a,c,d){return this.$(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return this.P(null,a)};k.c=function(a,b){return this.$(null,a,b)};
function Zd(a,b,c,d,e){for(;;)if(b instanceof Yd)c=b.start+c,d=b.start+d,b=b.oa;else{var f=O(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new Yd(a,b,c,d,e)}}var Xd=function(){function a(a,b,c){return Zd(null,a,b,c,null)}function b(a,b){return c.e(a,b,O(a))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.e=a;return c}();
function $d(a,b){return a===b.C?b:new Fd(a,ta(b.f))}function Sd(a){return new Fd({},ta(a.f))}function Td(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];sc(a,0,b,0,a.length);return b}var be=function ae(b,c,d,e){d=$d(b.root.C,d);var f=b.m-1>>>c&31;if(5===c)b=e;else{var g=d.f[f];b=null!=g?ae(b,c-5,g,e):Id(b.root.C,c-5,e)}d.f[f]=b;return d};
function Rd(a,b,c,d){this.m=a;this.shift=b;this.root=c;this.B=d;this.l=275;this.v=88}k=Rd.prototype;k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.T(null,c);case 3:return this.U(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.T(null,c)};a.e=function(a,c,d){return this.U(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return this.T(null,a)};
k.c=function(a,b){return this.U(null,a,b)};k.T=function(a,b){return Na.e(this,b,null)};k.U=function(a,b,c){return"number"===typeof b?y.e(this,b,c):c};k.P=function(a,b){if(this.root.C)return Od(this,b)[b&31];throw Error("nth after persistent!");};k.$=function(a,b,c){return 0<=b&&b<this.m?y.c(this,b):c};k.R=function(){if(this.root.C)return this.m;throw Error("count after persistent!");};
k.yb=function(a,b,c){var d=this;if(d.root.C){if(0<=b&&b<d.m)return Hd(this)<=b?d.B[b&31]=c:(a=function(){return function f(a,h){var l=$d(d.root.C,h);if(0===a)l.f[b&31]=c;else{var m=b>>>a&31,n=f(a-5,l.f[m]);l.f[m]=n}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.m)return pb(this,c);throw Error("Index "+x.d(b)+" out of bounds for TransientVector of length"+x.d(d.m));}throw Error("assoc! after persistent!");};
k.Sa=function(a,b,c){if("number"===typeof b)return sb(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
k.bb=function(a,b){if(this.root.C){if(32>this.m-Hd(this))this.B[this.m&31]=b;else{var c=new Fd(this.root.C,this.B),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.B=d;if(this.m>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=Id(this.root.C,this.shift,c);this.root=new Fd(this.root.C,d);this.shift=e}else this.root=be(this,this.shift,this.root,c)}this.m+=1;return this}throw Error("conj! after persistent!");};k.cb=function(){if(this.root.C){this.root.C=null;var a=this.m-Hd(this),b=Array(a);sc(this.B,0,b,0,a);return new W(null,this.m,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function ce(){this.v=0;this.l=2097152}ce.prototype.H=function(){return!1};var de=new ce;
function ee(a,b){return vc(oc(b)?O(a)===O(b)?dd(fd,sd.c(function(a){return B.c(R.e(b,F(a),de),fc(a))},a)):null:null)}function fe(a){this.s=a}function ge(a){return new fe(E(a))}
function he(a,b){var c=a.f;if(b instanceof U)a:{for(var d=c.length,e=b.Ca,f=0;;){if(d<=f){c=-1;break a}var g=c[f];if(g instanceof U&&e===g.Ca){c=f;break a}f+=2}c=void 0}else if("string"==typeof b||"number"===typeof b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(b===c[e]){c=e;break a}e+=2}c=void 0}else if(b instanceof C)a:{d=c.length;e=b.Ha;for(f=0;;){if(d<=f){c=-1;break a}g=c[f];if(g instanceof C&&e===g.Ha){c=f;break a}f+=2}c=void 0}else if(null==b)a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(null==
c[e]){c=e;break a}e+=2}c=void 0}else a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(B.c(b,c[e])){c=e;break a}e+=2}c=void 0}return c}function ie(a,b,c){this.f=a;this.i=b;this.ja=c;this.v=0;this.l=32374990}k=ie.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.ja};k.aa=function(){return this.i<this.f.length-2?new ie(this.f,this.i+2,this.ja):null};k.R=function(){return(this.f.length-this.i)/2};k.I=function(){return Sb(this)};k.H=function(a,b){return cc(this,b)};
k.S=function(){return ec(I,this.ja)};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return new W(null,2,5,X,[this.f[this.i],this.f[this.i+1]],null)};k.Z=function(){return this.i<this.f.length-2?new ie(this.f,this.i+2,this.ja):I};k.L=function(){return this};k.K=function(a,b){return new ie(this.f,this.i,b)};k.O=function(a,b){return L(b,this)};function ha(a,b,c,d){this.meta=a;this.m=b;this.f=c;this.t=d;this.l=16647951;this.v=8196}k=ha.prototype;
k.toString=function(){return Bb(this)};k.keys=function(){return ge(je.d?je.d(this):je.call(null,this))};k.T=function(a,b){return Na.e(this,b,null)};k.U=function(a,b,c){a=he(this,b);return-1===a?c:this.f[a+1]};k.J=function(){return this.meta};k.R=function(){return this.m};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Tb(this)};k.H=function(a,b){return ee(this,b)};k.Za=function(){return new ke({},this.f.length,ta(this.f))};k.S=function(){return ab(le,this.meta)};
k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Qa=function(a,b,c){a=he(this,b);if(-1===a){if(this.m<me){a=this.f;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new ha(this.meta,this.m+1,e,null)}return ab(Oa(Ad.c(ne,this),b,c),this.meta)}if(c===this.f[a+1])return this;b=ta(this.f);b[a+1]=c;return new ha(this.meta,this.m,b,null)};k.L=function(){var a=this.f;return 0<=a.length-2?new ie(a,0,null):null};
k.K=function(a,b){return new ha(b,this.m,this.f,this.t)};k.O=function(a,b){if(pc(b))return Oa(this,y.c(b,0),y.c(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(pc(e))c=Oa(c,y.c(e,0),y.c(e,1)),d=J(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.T(null,c);case 3:return this.U(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.T(null,c)};a.e=function(a,c,d){return this.U(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return this.T(null,a)};k.c=function(a,b){return this.U(null,a,b)};var le=new ha(null,0,[],null),me=8;
function oe(a){for(var b=a.length,c=0,d=ob(le);;)if(c<b)var e=c+2,d=rb(d,a[c],a[c+1]),c=e;else return qb(d)}function ke(a,b,c){this.Na=a;this.Ja=b;this.f=c;this.v=56;this.l=258}k=ke.prototype;k.Sa=function(a,b,c){if(r(this.Na)){a=he(this,b);if(-1===a)return this.Ja+2<=2*me?(this.Ja+=2,this.f.push(b),this.f.push(c),this):ad.e(pe.c?pe.c(this.Ja,this.f):pe.call(null,this.Ja,this.f),b,c);c!==this.f[a+1]&&(this.f[a+1]=c);return this}throw Error("assoc! after persistent!");};
k.bb=function(a,b){if(r(this.Na)){if(b?b.l&2048||b.Nb||(b.l?0:v(Ra,b)):v(Ra,b))return rb(this,qe.d?qe.d(b):qe.call(null,b),se.d?se.d(b):se.call(null,b));for(var c=E(b),d=this;;){var e=F(c);if(r(e))c=J(c),d=rb(d,qe.d?qe.d(e):qe.call(null,e),se.d?se.d(e):se.call(null,e));else return d}}else throw Error("conj! after persistent!");};k.cb=function(){if(r(this.Na))return this.Na=!1,new ha(null,Bc(this.Ja),this.f,null);throw Error("persistent! called twice");};k.T=function(a,b){return Na.e(this,b,null)};
k.U=function(a,b,c){if(r(this.Na))return a=he(this,b),-1===a?c:this.f[a+1];throw Error("lookup after persistent!");};k.R=function(){if(r(this.Na))return Bc(this.Ja);throw Error("count after persistent!");};function pe(a,b){for(var c=ob(ne),d=0;;)if(d<a)c=ad.e(c,b[d],b[d+1]),d+=2;else return c}function te(){this.M=!1}function ue(a,b){return a===b?!0:Kc(a,b)?!0:B.c(a,b)}
var ve=function(){function a(a,b,c,g,h){a=ta(a);a[b]=c;a[g]=h;return a}function b(a,b,c){a=ta(a);a[b]=c;return a}var c=null,c=function(c,e,f,g,h){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,g,h)}throw Error("Invalid arity: "+arguments.length);};c.e=b;c.w=a;return c}(),we=function(){function a(a,b,c,g,h,l){a=a.Oa(b);a.f[c]=g;a.f[h]=l;return a}function b(a,b,c,g){a=a.Oa(b);a.f[c]=g;return a}var c=null,c=function(c,e,f,g,h,l){switch(arguments.length){case 4:return b.call(this,
c,e,f,g);case 6:return a.call(this,c,e,f,g,h,l)}throw Error("Invalid arity: "+arguments.length);};c.o=b;c.X=a;return c}();function xe(a,b,c){this.C=a;this.N=b;this.f=c}k=xe.prototype;k.Oa=function(a){if(a===this.C)return this;var b=Cc(this.N),c=Array(0>b?4:2*(b+1));sc(this.f,0,c,0,2*b);return new xe(a,this.N,c)};k.Ua=function(){return ye.d?ye.d(this.f):ye.call(null,this.f)};
k.Ia=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.N&e))return d;var f=Cc(this.N&e-1),e=this.f[2*f],f=this.f[2*f+1];return null==e?f.Ia(a+5,b,c,d):ue(c,e)?f:d};
k.la=function(a,b,c,d,e,f){var g=1<<(c>>>b&31),h=Cc(this.N&g-1);if(0===(this.N&g)){var l=Cc(this.N);if(2*l<this.f.length){a=this.Oa(a);b=a.f;f.M=!0;a:for(c=2*(l-h),f=2*h+(c-1),l=2*(h+1)+(c-1);;){if(0===c)break a;b[l]=b[f];l-=1;c-=1;f-=1}b[2*h]=d;b[2*h+1]=e;a.N|=g;return a}if(16<=l){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[c>>>b&31]=ze.la(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.N>>>d&1)&&(h[d]=null!=this.f[e]?ze.la(a,b+5,Mb(this.f[e]),this.f[e],this.f[e+1],f):this.f[e+1],e+=2),d+=1;else break;return new Ae(a,l+1,h)}b=Array(2*(l+4));sc(this.f,0,b,0,2*h);b[2*h]=d;b[2*h+1]=e;sc(this.f,2*h,b,2*(h+1),2*(l-h));f.M=!0;a=this.Oa(a);a.f=b;a.N|=g;return a}l=this.f[2*h];g=this.f[2*h+1];if(null==l)return l=g.la(a,b+5,c,d,e,f),l===g?this:we.o(this,a,2*h+1,l);if(ue(d,l))return e===g?this:we.o(this,a,2*h+1,e);f.M=!0;return we.X(this,a,2*h,null,2*h+1,Be.fa?Be.fa(a,b+5,l,g,c,d,e):
Be.call(null,a,b+5,l,g,c,d,e))};
k.ka=function(a,b,c,d,e){var f=1<<(b>>>a&31),g=Cc(this.N&f-1);if(0===(this.N&f)){var h=Cc(this.N);if(16<=h){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[b>>>a&31]=ze.ka(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.N>>>c&1)&&(g[c]=null!=this.f[d]?ze.ka(a+5,Mb(this.f[d]),this.f[d],this.f[d+1],e):this.f[d+1],d+=2),c+=1;else break;return new Ae(null,h+1,g)}a=Array(2*(h+1));sc(this.f,
0,a,0,2*g);a[2*g]=c;a[2*g+1]=d;sc(this.f,2*g,a,2*(g+1),2*(h-g));e.M=!0;return new xe(null,this.N|f,a)}h=this.f[2*g];f=this.f[2*g+1];if(null==h)return h=f.ka(a+5,b,c,d,e),h===f?this:new xe(null,this.N,ve.e(this.f,2*g+1,h));if(ue(c,h))return d===f?this:new xe(null,this.N,ve.e(this.f,2*g+1,d));e.M=!0;return new xe(null,this.N,ve.w(this.f,2*g,null,2*g+1,Be.X?Be.X(a+5,h,f,b,c,d):Be.call(null,a+5,h,f,b,c,d)))};var ze=new xe(null,0,[]);function Ae(a,b,c){this.C=a;this.m=b;this.f=c}k=Ae.prototype;
k.Oa=function(a){return a===this.C?this:new Ae(a,this.m,ta(this.f))};k.Ua=function(){return Ce.d?Ce.d(this.f):Ce.call(null,this.f)};k.Ia=function(a,b,c,d){var e=this.f[b>>>a&31];return null!=e?e.Ia(a+5,b,c,d):d};k.la=function(a,b,c,d,e,f){var g=c>>>b&31,h=this.f[g];if(null==h)return a=we.o(this,a,g,ze.la(a,b+5,c,d,e,f)),a.m+=1,a;b=h.la(a,b+5,c,d,e,f);return b===h?this:we.o(this,a,g,b)};
k.ka=function(a,b,c,d,e){var f=b>>>a&31,g=this.f[f];if(null==g)return new Ae(null,this.m+1,ve.e(this.f,f,ze.ka(a+5,b,c,d,e)));a=g.ka(a+5,b,c,d,e);return a===g?this:new Ae(null,this.m,ve.e(this.f,f,a))};function De(a,b,c){b*=2;for(var d=0;;)if(d<b){if(ue(c,a[d]))return d;d+=2}else return-1}function Ee(a,b,c,d){this.C=a;this.Ea=b;this.m=c;this.f=d}k=Ee.prototype;k.Oa=function(a){if(a===this.C)return this;var b=Array(2*(this.m+1));sc(this.f,0,b,0,2*this.m);return new Ee(a,this.Ea,this.m,b)};
k.Ua=function(){return ye.d?ye.d(this.f):ye.call(null,this.f)};k.Ia=function(a,b,c,d){a=De(this.f,this.m,c);return 0>a?d:ue(c,this.f[a])?this.f[a+1]:d};
k.la=function(a,b,c,d,e,f){if(c===this.Ea){b=De(this.f,this.m,d);if(-1===b){if(this.f.length>2*this.m)return a=we.X(this,a,2*this.m,d,2*this.m+1,e),f.M=!0,a.m+=1,a;c=this.f.length;b=Array(c+2);sc(this.f,0,b,0,c);b[c]=d;b[c+1]=e;f.M=!0;f=this.m+1;a===this.C?(this.f=b,this.m=f,a=this):a=new Ee(this.C,this.Ea,f,b);return a}return this.f[b+1]===e?this:we.o(this,a,b+1,e)}return(new xe(a,1<<(this.Ea>>>b&31),[null,this,null,null])).la(a,b,c,d,e,f)};
k.ka=function(a,b,c,d,e){return b===this.Ea?(a=De(this.f,this.m,c),-1===a?(a=2*this.m,b=Array(a+2),sc(this.f,0,b,0,a),b[a]=c,b[a+1]=d,e.M=!0,new Ee(null,this.Ea,this.m+1,b)):B.c(this.f[a],d)?this:new Ee(null,this.Ea,this.m,ve.e(this.f,a+1,d))):(new xe(null,1<<(this.Ea>>>a&31),[null,this])).ka(a,b,c,d,e)};
var Be=function(){function a(a,b,c,g,h,l,m){var n=Mb(c);if(n===h)return new Ee(null,n,2,[c,g,l,m]);var q=new te;return ze.la(a,b,n,c,g,q).la(a,b,h,l,m,q)}function b(a,b,c,g,h,l){var m=Mb(b);if(m===g)return new Ee(null,m,2,[b,c,h,l]);var n=new te;return ze.ka(a,m,b,c,n).ka(a,g,h,l,n)}var c=null,c=function(c,e,f,g,h,l,m){switch(arguments.length){case 6:return b.call(this,c,e,f,g,h,l);case 7:return a.call(this,c,e,f,g,h,l,m)}throw Error("Invalid arity: "+arguments.length);};c.X=b;c.fa=a;return c}();
function Fe(a,b,c,d,e){this.meta=a;this.ma=b;this.i=c;this.s=d;this.t=e;this.v=0;this.l=32374860}k=Fe.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(I,this.meta)};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return null==this.s?new W(null,2,5,X,[this.ma[this.i],this.ma[this.i+1]],null):F(this.s)};
k.Z=function(){return null==this.s?ye.e?ye.e(this.ma,this.i+2,null):ye.call(null,this.ma,this.i+2,null):ye.e?ye.e(this.ma,this.i,J(this.s)):ye.call(null,this.ma,this.i,J(this.s))};k.L=function(){return this};k.K=function(a,b){return new Fe(b,this.ma,this.i,this.s,this.t)};k.O=function(a,b){return L(b,this)};
var ye=function(){function a(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new Fe(null,a,b,null,null);var g=a[b+1];if(r(g)&&(g=g.Ua(),r(g)))return new Fe(null,a,b+2,g,null);b+=2}else return null;else return new Fe(null,a,b,c,null)}function b(a){return c.e(a,0,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c}();
function Ge(a,b,c,d,e){this.meta=a;this.ma=b;this.i=c;this.s=d;this.t=e;this.v=0;this.l=32374860}k=Ge.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.meta};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(I,this.meta)};k.V=function(a,b){return N.c(b,this)};k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return F(this.s)};
k.Z=function(){return Ce.o?Ce.o(null,this.ma,this.i,J(this.s)):Ce.call(null,null,this.ma,this.i,J(this.s))};k.L=function(){return this};k.K=function(a,b){return new Ge(b,this.ma,this.i,this.s,this.t)};k.O=function(a,b){return L(b,this)};
var Ce=function(){function a(a,b,c,g){if(null==g)for(g=b.length;;)if(c<g){var h=b[c];if(r(h)&&(h=h.Ua(),r(h)))return new Ge(a,b,c+1,h,null);c+=1}else return null;else return new Ge(a,b,c,g,null)}function b(a){return c.o(null,a,0,null)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 1:return b.call(this,c);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.o=a;return c}();
function He(a,b,c,d,e,f){this.meta=a;this.m=b;this.root=c;this.ba=d;this.ha=e;this.t=f;this.l=16123663;this.v=8196}k=He.prototype;k.toString=function(){return Bb(this)};k.keys=function(){return ge(je.d?je.d(this):je.call(null,this))};k.T=function(a,b){return Na.e(this,b,null)};k.U=function(a,b,c){return null==b?this.ba?this.ha:c:null==this.root?c:this.root.Ia(0,Mb(b),b,c)};k.J=function(){return this.meta};k.R=function(){return this.m};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Tb(this)};
k.H=function(a,b){return ee(this,b)};k.Za=function(){return new Ie({},this.root,this.m,this.ba,this.ha)};k.S=function(){return ab(ne,this.meta)};k.Qa=function(a,b,c){if(null==b)return this.ba&&c===this.ha?this:new He(this.meta,this.ba?this.m:this.m+1,this.root,!0,c,null);a=new te;b=(null==this.root?ze:this.root).ka(0,Mb(b),b,c,a);return b===this.root?this:new He(this.meta,a.M?this.m+1:this.m,b,this.ba,this.ha,null)};
k.L=function(){if(0<this.m){var a=null!=this.root?this.root.Ua():null;return this.ba?L(new W(null,2,5,X,[null,this.ha],null),a):a}return null};k.K=function(a,b){return new He(b,this.m,this.root,this.ba,this.ha,this.t)};k.O=function(a,b){if(pc(b))return Oa(this,y.c(b,0),y.c(b,1));for(var c=this,d=E(b);;){if(null==d)return c;var e=F(d);if(pc(e))c=Oa(c,y.c(e,0),y.c(e,1)),d=J(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.T(null,c);case 3:return this.U(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.T(null,c)};a.e=function(a,c,d){return this.U(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(ta(b)))};k.d=function(a){return this.T(null,a)};k.c=function(a,b){return this.U(null,a,b)};var ne=new He(null,0,null,!1,null,0);
function jc(a,b){for(var c=a.length,d=0,e=ob(ne);;)if(d<c)var f=d+1,e=e.Sa(null,a[d],b[d]),d=f;else return qb(e)}function Ie(a,b,c,d,e){this.C=a;this.root=b;this.count=c;this.ba=d;this.ha=e;this.v=56;this.l=258}k=Ie.prototype;k.Sa=function(a,b,c){return Je(this,b,c)};
k.bb=function(a,b){var c;a:{if(this.C){if(b?b.l&2048||b.Nb||(b.l?0:v(Ra,b)):v(Ra,b)){c=Je(this,qe.d?qe.d(b):qe.call(null,b),se.d?se.d(b):se.call(null,b));break a}c=E(b);for(var d=this;;){var e=F(c);if(r(e))c=J(c),d=Je(d,qe.d?qe.d(e):qe.call(null,e),se.d?se.d(e):se.call(null,e));else{c=d;break a}}}else throw Error("conj! after persistent");c=void 0}return c};
k.cb=function(){var a;if(this.C)this.C=null,a=new He(null,this.count,this.root,this.ba,this.ha,null);else throw Error("persistent! called twice");return a};k.T=function(a,b){return null==b?this.ba?this.ha:null:null==this.root?null:this.root.Ia(0,Mb(b),b)};k.U=function(a,b,c){return null==b?this.ba?this.ha:c:null==this.root?c:this.root.Ia(0,Mb(b),b,c)};k.R=function(){if(this.C)return this.count;throw Error("count after persistent!");};
function Je(a,b,c){if(a.C){if(null==b)a.ha!==c&&(a.ha=c),a.ba||(a.count+=1,a.ba=!0);else{var d=new te;b=(null==a.root?ze:a.root).la(a.C,0,Mb(b),b,c,d);b!==a.root&&(a.root=b);d.M&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}
var md=function(){function a(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){a=E(a);for(var b=ob(ne);;)if(a){var e=J(J(a)),b=ad.e(b,F(a),fc(a));a=e}else return qb(b)}a.r=0;a.k=function(a){a=E(a);return b(a)};a.j=b;return a}(),Ke=function(){function a(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return new ha(null,Bc(O(a)),T.c(ua,a),null)}a.r=0;a.k=function(a){a=
E(a);return b(a)};a.j=b;return a}();function Le(a,b){this.Fa=a;this.ja=b;this.v=0;this.l=32374988}k=Le.prototype;k.toString=function(){return Bb(this)};k.J=function(){return this.ja};k.aa=function(){var a=this.Fa,a=(a?a.l&128||a.xb||(a.l?0:v(Ka,a)):v(Ka,a))?this.Fa.aa(null):J(this.Fa);return null==a?null:new Le(a,this.ja)};k.I=function(){return Sb(this)};k.H=function(a,b){return cc(this,b)};k.S=function(){return ec(I,this.ja)};k.V=function(a,b){return N.c(b,this)};
k.W=function(a,b,c){return N.e(b,c,this)};k.Y=function(){return this.Fa.Y(null).nb()};k.Z=function(){var a=this.Fa,a=(a?a.l&128||a.xb||(a.l?0:v(Ka,a)):v(Ka,a))?this.Fa.aa(null):J(this.Fa);return null!=a?new Le(a,this.ja):I};k.L=function(){return this};k.K=function(a,b){return new Le(this.Fa,b)};k.O=function(a,b){return L(b,this)};function je(a){return(a=E(a))?new Le(a,null):null}function qe(a){return Sa(a)}function se(a){return Ta(a)}
var Me=function(){function a(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){return r(ed(fd,a))?xc.c(function(a,b){return hc.c(r(a)?a:le,b)},a):null}a.r=0;a.k=function(a){a=E(a);return b(a)};a.j=b;return a}();function Lc(a){if(a&&(a.v&4096||a.Pb))return a.name;if("string"===typeof a)return a;throw Error("Doesn't support name: "+x.d(a));}
var Ne=function(){function a(a,b){return new V(null,function(){var f=E(b);return f?r(a.d?a.d(F(f)):a.call(null,F(f)))?L(F(f),c.c(a,H(f))):null:null},null,null)}function b(a){return function(b){return function(){function c(f,g){return r(a.d?a.d(g):a.call(null,g))?b.c?b.c(f,g):b.call(null,f,g):new Ub(f)}function g(a){return b.d?b.d(a):b.call(null,a)}function h(){return b.n?b.n():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);
case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.n=h;l.d=g;l.c=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}();function Oe(a,b,c,d,e){this.meta=a;this.start=b;this.end=c;this.step=d;this.t=e;this.l=32375006;this.v=8192}k=Oe.prototype;k.toString=function(){return Bb(this)};
k.P=function(a,b){if(b<za(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};k.$=function(a,b,c){return b<za(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};k.J=function(){return this.meta};
k.aa=function(){return 0<this.step?this.start+this.step<this.end?new Oe(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new Oe(this.meta,this.start+this.step,this.end,this.step,null):null};k.R=function(){return pa(gb(this))?0:Math.ceil.d?Math.ceil.d((this.end-this.start)/this.step):Math.ceil.call(null,(this.end-this.start)/this.step)};k.I=function(){var a=this.t;return null!=a?a:this.t=a=Sb(this)};k.H=function(a,b){return cc(this,b)};
k.S=function(){return ec(I,this.meta)};k.V=function(a,b){return Xb.c(this,b)};k.W=function(a,b,c){return Xb.e(this,b,c)};k.Y=function(){return null==gb(this)?null:this.start};k.Z=function(){return null!=gb(this)?new Oe(this.meta,this.start+this.step,this.end,this.step,null):I};k.L=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};k.K=function(a,b){return new Oe(b,this.start,this.end,this.step,this.t)};k.O=function(a,b){return L(b,this)};
var Pe=function(){function a(a,b,c){return new Oe(null,a,b,c,null)}function b(a,b){return e.e(a,b,1)}function c(a){return e.e(0,a,1)}function d(){return e.e(0,Number.MAX_VALUE,1)}var e=null,e=function(e,g,h){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,g);case 3:return a.call(this,e,g,h)}throw Error("Invalid arity: "+arguments.length);};e.n=d;e.d=c;e.c=b;e.e=a;return e}(),Qe=function(){function a(a,b){for(;;)if(E(b)&&0<a){var c=a-1,g=
J(b);a=c;b=g}else return null}function b(a){for(;;)if(E(a))a=J(a);else return null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}(),Re=function(){function a(a,b){Qe.c(a,b);return b}function b(a){Qe.d(a);return a}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);
};c.d=b;c.c=a;return c}();function Se(a,b,c,d,e,f,g){var h=ea;try{ea=null==ea?null:ea-1;if(null!=ea&&0>ea)return A(a,"#");A(a,c);E(g)&&(b.e?b.e(F(g),a,f):b.call(null,F(g),a,f));for(var l=J(g),m=na.d(f)-1;;)if(!l||null!=m&&0===m){E(l)&&0===m&&(A(a,d),A(a,"..."));break}else{A(a,d);b.e?b.e(F(l),a,f):b.call(null,F(l),a,f);var n=J(l);c=m-1;l=n;m=c}return A(a,e)}finally{ea=h}}
var Te=function(){function a(a,d){var e=null;1<arguments.length&&(e=K(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){for(var e=E(b),f=null,g=0,h=0;;)if(h<g){var l=f.P(null,h);A(a,l);h+=1}else if(e=E(e))f=e,qc(f)?(e=ub(f),g=vb(f),f=e,l=O(e),e=g,g=l):(l=F(f),A(a,l),e=J(f),f=null,g=0),h=0;else return null}a.r=1;a.k=function(a){var d=F(a);a=H(a);return b(d,a)};a.j=b;return a}(),Ue={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};
function Ve(a){return'"'+x.d(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return Ue[a]}))+'"'}
var Ye=function We(b,c,d){if(null==b)return A(c,"nil");if(void 0===b)return A(c,"#\x3cundefined\x3e");r(function(){var c=R.c(d,la);return r(c)?(c=b?b.l&131072||b.Ob?!0:b.l?!1:v(Ya,b):v(Ya,b))?mc(b):c:c}())&&(A(c,"^"),We(mc(b),c,d),A(c," "));if(null==b)return A(c,"nil");if(b.hb)return b.qb(b,c,d);if(b&&(b.l&2147483648||b.Q))return b.F(null,c,d);if(qa(b)===Boolean||"number"===typeof b)return A(c,""+x.d(b));if(null!=b&&b.constructor===Object)return A(c,"#js "),Xe.o?Xe.o(sd.c(function(c){return new W(null,
2,5,X,[Mc.d(c),b[c]],null)},rc(b)),We,c,d):Xe.call(null,sd.c(function(c){return new W(null,2,5,X,[Mc.d(c),b[c]],null)},rc(b)),We,c,d);if(b instanceof Array)return Se(c,We,"#js ["," ","]",d,b);if("string"==typeof b)return r(ja.d(d))?A(c,Ve(b)):A(c,b);if(kc(b))return Te.j(c,K(["#\x3c",""+x.d(b),"\x3e"],0));if(b instanceof Date){var e=function(b,c){for(var d=""+x.d(b);;)if(O(d)<c)d="0"+x.d(d);else return d};return Te.j(c,K(['#inst "',""+x.d(b.getUTCFullYear()),"-",e(b.getUTCMonth()+1,2),"-",e(b.getUTCDate(),
2),"T",e(b.getUTCHours(),2),":",e(b.getUTCMinutes(),2),":",e(b.getUTCSeconds(),2),".",e(b.getUTCMilliseconds(),3),"-",'00:00"'],0))}return b instanceof RegExp?Te.j(c,K(['#"',b.source,'"'],0)):(b?b.l&2147483648||b.Q||(b.l?0:v(lb,b)):v(lb,b))?mb(b,c,d):Te.j(c,K(["#\x3c",""+x.d(b),"\x3e"],0))};
function Ze(a,b){var c=new da;a:{var d=new Ab(c);Ye(F(a),d,b);for(var e=E(J(a)),f=null,g=0,h=0;;)if(h<g){var l=f.P(null,h);A(d," ");Ye(l,d,b);h+=1}else if(e=E(e))f=e,qc(f)?(e=ub(f),g=vb(f),f=e,l=O(e),e=g,g=l):(l=F(f),A(d," "),Ye(l,d,b),e=J(f),f=null,g=0),h=0;else break a}return c}
var qd=function(){function a(a){var d=null;0<arguments.length&&(d=K(Array.prototype.slice.call(arguments,0),0));return b.call(this,d)}function b(a){var b=fa();return null==a||pa(E(a))?"":""+x.d(Ze(a,b))}a.r=0;a.k=function(a){a=E(a);return b(a)};a.j=b;return a}();function Xe(a,b,c,d){return Se(c,function(a,c,d){b.e?b.e(Sa(a),c,d):b.call(null,Sa(a),c,d);A(c," ");return b.e?b.e(Ta(a),c,d):b.call(null,Ta(a),c,d)},"{",", ","}",d,E(a))}Qb.prototype.Q=!0;
Qb.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};V.prototype.Q=!0;V.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Fe.prototype.Q=!0;Fe.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};ie.prototype.Q=!0;ie.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Wd.prototype.Q=!0;Wd.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Jc.prototype.Q=!0;Jc.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};
ac.prototype.Q=!0;ac.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};He.prototype.Q=!0;He.prototype.F=function(a,b,c){return Xe(this,Ye,b,c)};Ge.prototype.Q=!0;Ge.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Yd.prototype.Q=!0;Yd.prototype.F=function(a,b,c){return Se(b,Ye,"["," ","]",c,this)};Sc.prototype.Q=!0;Sc.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};kd.prototype.Q=!0;
kd.prototype.F=function(a,b,c){A(b,"#\x3cAtom: ");Ye(this.state,b,c);return A(b,"\x3e")};W.prototype.Q=!0;W.prototype.F=function(a,b,c){return Se(b,Ye,"["," ","]",c,this)};Gc.prototype.Q=!0;Gc.prototype.F=function(a,b){return A(b,"()")};ha.prototype.Q=!0;ha.prototype.F=function(a,b,c){return Xe(this,Ye,b,c)};Oe.prototype.Q=!0;Oe.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Le.prototype.Q=!0;Le.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};Fc.prototype.Q=!0;
Fc.prototype.F=function(a,b,c){return Se(b,Ye,"("," ",")",c,this)};W.prototype.Wa=!0;W.prototype.Xa=function(a,b){return wc.c(this,b)};Yd.prototype.Wa=!0;Yd.prototype.Xa=function(a,b){return wc.c(this,b)};U.prototype.Wa=!0;U.prototype.Xa=function(a,b){return Ob(this,b)};C.prototype.Wa=!0;C.prototype.Xa=function(a,b){return Ob(this,b)};var $e={};function af(a){if(a?a.Lb:a)return a.Lb(a);var b;b=af[p(null==a?null:a)];if(!b&&(b=af._,!b))throw w("IEncodeJS.-clj-\x3ejs",a);return b.call(null,a)}
function bf(a){return(a?r(r(null)?null:a.Kb)||(a.rb?0:v($e,a)):v($e,a))?af(a):"string"===typeof a||"number"===typeof a||a instanceof U||a instanceof C?cf.d?cf.d(a):cf.call(null,a):qd.j(K([a],0))}
var cf=function df(b){if(null==b)return null;if(b?r(r(null)?null:b.Kb)||(b.rb?0:v($e,b)):v($e,b))return af(b);if(b instanceof U)return Lc(b);if(b instanceof C)return""+x.d(b);if(oc(b)){var c={};b=E(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.P(null,f),h=Q.e(g,0,null),g=Q.e(g,1,null);c[bf(h)]=df(g);f+=1}else if(b=E(b))qc(b)?(e=ub(b),b=vb(b),d=e,e=O(e)):(e=F(b),d=Q.e(e,0,null),e=Q.e(e,1,null),c[bf(d)]=df(e),b=J(b),d=null,e=0),f=0;else break;return c}if(nc(b)){c=[];b=E(sd.c(df,b));d=null;for(f=e=0;;)if(f<
e)h=d.P(null,f),c.push(h),f+=1;else if(b=E(b))d=b,qc(d)?(b=ub(d),f=vb(d),d=b,e=O(b),b=f):(b=F(d),c.push(b),b=J(d),d=null,e=0),f=0;else break;return c}return b},ef={};function ff(a,b){if(a?a.Jb:a)return a.Jb(a,b);var c;c=ff[p(null==a?null:a)];if(!c&&(c=ff._,!c))throw w("IEncodeClojure.-js-\x3eclj",a);return c.call(null,a,b)}
var hf=function(){function a(a){return b.j(a,K([new ha(null,1,[gf,!1],null)],0))}var b=null,c=function(){function a(c,d){var h=null;1<arguments.length&&(h=K(Array.prototype.slice.call(arguments,1),0));return b.call(this,c,h)}function b(a,c){if(a?r(r(null)?null:a.fc)||(a.rb?0:v(ef,a)):v(ef,a))return ff(a,T.c(Ke,c));if(E(c)){var d=uc(c)?T.c(md,c):c,e=R.c(d,gf);return function(a,b,c,d){return function u(e){return uc(e)?Re.d(sd.c(u,e)):nc(e)?Ad.c(null==e?null:Aa(e),sd.c(u,e)):e instanceof Array?Vd(sd.c(u,
e)):qa(e)===Object?Ad.c(le,function(){return function(a,b,c,d){return function Ea(f){return new V(null,function(a,b,c,d){return function(){for(;;){var a=E(f);if(a){if(qc(a)){var b=ub(a),c=O(b),g=Qc(c);a:{for(var h=0;;)if(h<c){var l=y.c(b,h),l=new W(null,2,5,X,[d.d?d.d(l):d.call(null,l),u(e[l])],null);g.add(l);h+=1}else{b=!0;break a}b=void 0}return b?Tc(g.D(),Ea(vb(a))):Tc(g.D(),null)}g=F(a);return L(new W(null,2,5,X,[d.d?d.d(g):d.call(null,g),u(e[g])],null),Ea(H(a)))}return null}}}(a,b,c,d),null,
null)}}(a,b,c,d)(rc(e))}()):e}}(c,d,e,r(e)?Mc:x)(a)}return null}a.r=1;a.k=function(a){var c=F(a);a=H(a);return b(c,a)};a.j=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:return c.j(b,K(arguments,1))}throw Error("Invalid arity: "+arguments.length);};b.r=1;b.k=c.k;b.d=a;b.j=c.j;return b}();var jf=new U(null,"y","y",-1757859776),kf=new U(null,"role","role",-736691072),lf=new U(null,"fen","fen",1034199872),mf=new U(null,"free?","free?",-1621026686),nf=new U(null,"turnColor","turnColor",272360995),of=new U(null,"last-move","last-move",2069214404),la=new U(null,"meta","meta",1499536964),pf=new U(null,"selected","selected",574897764),qf=new U(null,"color","color",1011675173),ma=new U(null,"dup","dup",556298533),rf=new U(null,"toggle-orientation","toggle-orientation",879565349),sf=new U(null,
"bottom","bottom",-1550509018),tf=new U(null,"chess","chess",-371830393),uf=new U(null,"top","top",-1856271961),nd=new U(null,"validator","validator",-1966190681),vf=new U(null,"check","check",1226308904),wf=new U(null,"free","free",801364328),yf=new U(null,"finally-block","finally-block",832982472),zf=new U(null,"premovable","premovable",-170784152),Af=new U(null,"playPremove","playPremove",1749369480),Bf=new U(null,"get-state","get-state",1572463657),Cf=new U(null,"set-pieces","set-pieces",-1527661431),
Df=new U(null,"events","events",1792552201),Ef=new U(null,"drop-on","drop-on",-1182816150),Ff=new U(null,"width","width",-384071477),Gf=new U(null,"move","move",-2110884309),Hf=new U(null,"get-current-premove","get-current-premove",-1501203829),If=new U(null,"orientation","orientation",623557579),Jf=new U(null,"recur","recur",-437573268),Kf=new U(null,"catch-block","catch-block",1175212748),ia=new U(null,"flush-on-newline","flush-on-newline",-151457939),Lf=new U(null,"get-position","get-position",
-1531208561),Mf=new U(null,"get-orientation","get-orientation",1685724751),Nf=new U(null,"enabled?","enabled?",-1376075057),Of=new U(null,"api-move","api-move",-1712244016),ja=new U(null,"readably","readably",1129599760),Pf=new U(null,"turn-color","turn-color",1287772690),Qf=new U(null,"after","after",594996914),Rf=new U(null,"play-premove","play-premove",-1929541741),na=new U(null,"print-length","print-length",1931866356),Sf=new U(null,"getFen","getFen",503274164),Tf=new U(null,"select-square","select-square",
1973035732),Uf=new U(null,"catch-exception","catch-exception",-1997306795),Vf=new U(null,"current","current",-1088038603),Wf=new U(null,"setPieces","setPieces",2113691477),Xf=new U(null,"prev","prev",-1597069226),Yf=new U(null,"continue-block","continue-block",-1852047850),Zf=new U(null,"getPosition","getPosition",-555166697),$f=new U(null,"right","right",-452581833),ag=new U(null,"get-fen","get-fen",-228898089),bg=new U(null,"lastMove","lastMove",803889592),cg=new U(null,"dests","dests",259411416),
dg=new U(null,"drop-off","drop-off",1624574584),eg=new U(null,"x","x",2099068185),fg=new U(null,"toggleOrientation","toggleOrientation",-660239975),gg=new U(null,"set","set",304602554),hg=new U(null,"getCurrentPremove","getCurrentPremove",1574475803),ig=new U(null,"movable","movable",277477435),jg=new U(null,"getOrientation","getOrientation",1715006427),kg=new U(null,"enabled","enabled",1195909756),gf=new U(null,"keywordize-keys","keywordize-keys",1310784252),lg=new U(null,"height","height",1025178622),
mg=new U(null,"left","left",-399115937),ng=new U(null,"getState","getState",-27320929),og=new U(null,"dropOff","dropOff",-1476240929);function pg(a){return"abcdefgh".indexOf(F(a))+1}function qg(a){return new W(null,2,5,X,[pg(F(a)),parseInt(fc(a))],null)}function rg(a){return""+x.d(R.c("abcdefgh",F(a)-1))+x.d(fc(a))}function sg(a){switch(a){case "white":return"black";case "black":return"white";default:return null}}function tg(a,b){return ed(function(a){return b===a},a)}var vg=function ug(b,c){if(r(b)){var d=b.hasOwnProperty(c);return r(d)?d:ug(b.__proto__,c)}return b},wg=vg(document,"ontouchstart");
function xg(a,b){return Ad.c(le,function(){return function d(b){return new V(null,function(){for(;;){var f=E(b);if(f){if(qc(f)){var g=ub(f),h=O(g),l=Qc(h);a:{for(var m=0;;)if(m<h){var n=y.c(g,m),q=Q.e(n,0,null),n=Q.e(n,1,null),q=new W(null,2,5,X,[q,a.d?a.d(n):a.call(null,n)],null);l.add(q);m+=1}else{g=!0;break a}g=void 0}return g?Tc(l.D(),d(vb(f))):Tc(l.D(),null)}g=F(f);l=Q.e(g,0,null);g=Q.e(g,1,null);return L(new W(null,2,5,X,[l,a.d?a.d(g):a.call(null,g)],null),d(H(f)))}return null}},null,null)}(b)}())}
function yg(a,b){return r(a)?Ad.c(le,function(){return function d(a){return new V(null,function(){for(;;){var f=E(a);if(f){if(qc(f)){var g=ub(f),h=O(g),l=Qc(h);a:{for(var m=0;;)if(m<h){var n=y.c(g,m),q=Q.e(n,0,null),n=Q.e(n,1,null),q=new W(null,2,5,X,[b.d?b.d(q):b.call(null,q),n],null);l.add(q);m+=1}else{g=!0;break a}g=void 0}return g?Tc(l.D(),d(vb(f))):Tc(l.D(),null)}g=F(f);l=Q.e(g,0,null);g=Q.e(g,1,null);return L(new W(null,2,5,X,[b.d?b.d(l):b.call(null,l),g],null),d(H(f)))}return null}},null,null)}(a)}()):
null}function zg(a){return yg(a,Mc)}function Ag(a){return yg(a,Lc)};var Bg=function(){function a(a,b){return T.c(x,xd(a,b))}function b(a){return T.c(x,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.c=a;return c}();var Cg=new ha(null,6,"p pawn r rook n knight b bishop q queen k king".split(" "),null),Dg=Ad.c(le,sd.c(function(a){var b=Q.e(a,0,null);a=Q.e(a,1,null);return new W(null,2,5,X,[a,b],null)},Cg));
function Eg(a){Q.e(a,0,null);Dc(a);for(var b=le,c=0,d=a;;){a=c;var c=d,d=Q.e(c,0,null),c=Dc(c),e=parseInt(d),e=r(isNaN(e))?null:e;if(63<a)return b;if(!B.c(d,"/"))if(null!=e)a+=e;else{var e=a,e=""+x.d(R.c("abcdefgh",(e%8+8)%8))+x.d(8-(e/8|0)),f=d.toLowerCase(),d=new ha(null,2,[kf,R.c(Cg,f),qf,B.c(d,f)?"black":"white"],null),b=S.e(b,e,d);a+=1}d=c;c=a}}
function Fg(a){return Eg(Ne.c(function(a){return cd.c(" ",a)},zd.c(function(a){return B.c("/",a)},r(a)?a:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")))}function Gg(a){var b=R.c(Dg,kf.d(a));return B.c("white",qf.d(a))?b.toUpperCase():b}
function Hg(a){return xc.e(function(a,c){return a.replace(new RegExp(T.c(x,vd.c(c,1)),"g"),c)},Bg.c("/",function(){return function c(d){return new V(null,function(){for(;;){var e=E(d);if(e){var f=e;if(qc(f)){var g=ub(f),h=O(g),l=Qc(h);return function(){for(var c=0;;)if(c<h){var d=y.c(g,c);Uc(l,T.c(x,function(){return function(c,d,e,f,g,h,l){return function $(m){return new V(null,function(c,d){return function(){for(;;){var c=E(m);if(c){if(qc(c)){var e=ub(c),f=O(e),g=Qc(f);return function(){for(var c=
0;;)if(c<f){var h=y.c(e,c),l=g,h=R.c(a,""+x.d(h)+x.d(d)),h=r(h)?Gg(h):1;l.add(h);c+=1}else return!0}()?Tc(g.D(),$(vb(c))):Tc(g.D(),null)}var h=F(c);return L(function(){var c=R.c(a,""+x.d(h)+x.d(d));return r(c)?Gg(c):1}(),$(H(c)))}return null}}}(c,d,e,f,g,h,l),null,null)}}(c,d,g,h,l,f,e)("abcdefgh")}()));c+=1}else return!0}()?Tc(l.D(),c(vb(f))):Tc(l.D(),null)}var m=F(f);return L(T.c(x,function(){return function(c,d,e){return function u(f){return new V(null,function(c){return function(){for(;;){var d=
E(f);if(d){if(qc(d)){var e=ub(d),g=O(e),h=Qc(g);return function(){for(var d=0;;)if(d<g){var f=y.c(e,d),l=h,f=R.c(a,""+x.d(f)+x.d(c)),f=r(f)?Gg(f):1;l.add(f);d+=1}else return!0}()?Tc(h.D(),u(vb(d))):Tc(h.D(),null)}var l=F(d);return L(function(){var d=R.c(a,""+x.d(l)+x.d(c));return r(d)?Gg(d):1}(),u(H(d)))}return null}}}(c,d,e),null,null)}}(m,f,e)("abcdefgh")}()),c(H(f)))}return null}},null,null)}(Pe.e(8,0,-1))}()),Pe.e(8,1,-1))};function Ig(a,b,c){var d=Q.e(b,0,null);b=Q.e(b,1,null);var e=Q.e(c,0,null);c=Q.e(c,1,null);var f=2>Math.abs(d-e);return f?B.c(a,"white")?B.c(c,b+1)||B.c(b,2)&&B.c(c,4)&&B.c(d,e):B.c(c,b-1)||B.c(b,7)&&B.c(c,5)&&B.c(d,e):f}function Jg(a,b){var c=Q.e(a,0,null),d=Q.e(a,1,null),e=Q.e(b,0,null),f=Q.e(b,1,null),c=Math.abs(c-e),d=Math.abs(d-f);return B.c(1,c)&&B.c(2,d)||B.c(2,c)&&B.c(1,d)}
function Kg(a,b){var c=Q.e(a,0,null),d=Q.e(a,1,null),e=Q.e(b,0,null),f=Q.e(b,1,null);return B.c(Math.abs(c-e),Math.abs(d-f))}function Lg(a,b){var c=Q.e(a,0,null),d=Q.e(a,1,null),e=Q.e(b,0,null),f=Q.e(b,1,null);return B.c(c,e)||B.c(d,f)}function Mg(a,b){return Kg(a,b)||Lg(a,b)}function Ng(a,b){return sd.c(id.e(pg,F,F),yd.c(function(a){Q.e(a,0,null);a=Q.e(a,1,null);return B.c(kf.d(a),"rook")&&B.c(qf.d(a),b)},a))}
function Og(a,b,c,d){var e=Q.e(c,0,null),f=Q.e(c,1,null);c=Q.e(d,0,null);d=Q.e(d,1,null);var g=2>Math.abs(e-c)&&2>Math.abs(f-d);return g?g:(b=B.j(f,d,K([B.c(b,"white")?1:8],0)))?(e=B.c(e,5)&&(B.c(c,3)||B.c(c,7)))?e:tg(a,c):b}
function Pg(a,b,c){b=qg(b);var d=function(){switch(kf.d(c)){case "pawn":return jd.c(Ig,qf.d(c));case "knight":return Jg;case "bishop":return Kg;case "rook":return Lg;case "queen":return Mg;case "king":var b=qf.d(c);return jd.e(Og,Ng(a,b),b);default:throw Error("No matching clause: "+x.d(kf.d(c)));}}();return function(a,b){return function h(c){return new V(null,function(a,b){return function(){for(var d=c;;){var e=E(d);if(e){var f=e,u=F(f);if(e=E(function(a,b,c,d,e,f){return function D(h){return new V(null,
function(a,b,c,d,e,f){return function(){for(var a=h;;)if(a=E(a)){if(qc(a)){var c=ub(a),d=O(c),l=Qc(d);a:{for(var m=0;;)if(m<d){var n=y.c(c,m);r(f.c?f.c(e,new W(null,2,5,X,[b,n],null)):f.call(null,e,new W(null,2,5,X,[b,n],null)))&&(n=rg(new W(null,2,5,X,[b,n],null)),l.add(n));m+=1}else{c=!0;break a}c=void 0}return c?Tc(l.D(),D(vb(a))):Tc(l.D(),null)}l=F(a);if(r(f.c?f.c(e,new W(null,2,5,X,[b,l],null)):f.call(null,e,new W(null,2,5,X,[b,l],null))))return L(rg(new W(null,2,5,X,[b,l],null)),D(H(a)));a=
H(a)}else return null}}(a,b,c,d,e,f),null,null)}}(d,u,f,e,a,b)(Pe.c(1,9))))return Zc.c(e,h(H(d)));d=H(d)}else return null}}}(a,b),null,null)}}(b,d)(Pe.c(1,9))};var Qg=new W(null,2,5,X,["white","black"],null),Sg=Ad.c(le,function Rg(b){return new V(null,function(){for(var c=b;;){var d=E(c);if(d){var e=d,f=F(e);if(d=E(function(b,c,d,e){return function q(f){return new V(null,function(b,c){return function(){for(;;){var b=E(f);if(b){if(qc(b)){var d=ub(b),e=O(d),g=Qc(e);a:{for(var h=0;;)if(h<e){var l=y.c(d,h),l=""+x.d(l)+x.d(c);g.add(new W(null,2,5,X,[l,null],null));h+=1}else{d=!0;break a}d=void 0}return d?Tc(g.D(),q(vb(b))):Tc(g.D(),null)}g=F(b);g=""+x.d(g)+x.d(c);
return L(new W(null,2,5,X,[g,null],null),q(H(b)))}return null}}}(b,c,d,e),null,null)}}(c,f,e,d)(new W(null,8,5,X,"abcdefgh".split(""),null))))return Zc.c(d,Rg(H(c)));c=H(c)}else return null}},null,null)}(Pe.c(1,9)));function Tg(a){return Me.j(K([Sg,Fg(B.c(a,"start")?"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1":a)],0))}function Ug(a){return Ad.c(le,yd.c(fc,a))}function Vg(a,b){return xc.e(function(a,b){var e=Q.e(b,0,null),f=Q.e(b,1,null);return r(f)?S.e(a,e,f):S.e(a,e,null)},a,b)}
function Xg(a,b){var c=Q.e(b,0,null),d=Q.e(b,1,null);if(cd.c(c,d)){var e=R.c(a,c);r(e)?(c=S.e(a,c,null),d=S.e(c,d,e)):d=null}else d=null;return r(d)?d:a};var Yg;function Zg(a,b,c){if(a?a.pb:a)return a.pb(0,b,c);var d;d=Zg[p(null==a?null:a)];if(!d&&(d=Zg._,!d))throw w("WritePort.put!",a);return d.call(null,a,b,c)}function $g(a){if(a?a.fb:a)return a.fb();var b;b=$g[p(null==a?null:a)];if(!b&&(b=$g._,!b))throw w("Channel.close!",a);return b.call(null,a)}function ah(a){if(a?a.Db:a)return!0;var b;b=ah[p(null==a?null:a)];if(!b&&(b=ah._,!b))throw w("Handler.active?",a);return b.call(null,a)}
function bh(a){if(a?a.Eb:a)return a.ga;var b;b=bh[p(null==a?null:a)];if(!b&&(b=bh._,!b))throw w("Handler.commit",a);return b.call(null,a)}function ch(a,b){if(a?a.Cb:a)return a.Cb(0,b);var c;c=ch[p(null==a?null:a)];if(!c&&(c=ch._,!c))throw w("Buffer.add!*",a);return c.call(null,a,b)}
var dh=function(){function a(a,b){if(null==b)throw Error("Assert failed: "+x.d(qd.j(K([Ic(new C(null,"not","not",1044554643,null),Ic(new C(null,"nil?","nil?",1612038930,null),new C(null,"itm","itm",-713282527,null)))],0))));return ch(a,b)}var b=null,b=function(b,d){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,d)}throw Error("Invalid arity: "+arguments.length);};b.d=function(a){return a};b.c=a;return b}();function eh(a,b,c,d,e){for(var f=0;;)if(f<e)c[d+f]=a[b+f],f+=1;else break}function fh(a,b,c,d){this.head=a;this.B=b;this.length=c;this.f=d}fh.prototype.pop=function(){if(0===this.length)return null;var a=this.f[this.B];this.f[this.B]=null;this.B=(this.B+1)%this.f.length;this.length-=1;return a};fh.prototype.unshift=function(a){this.f[this.head]=a;this.head=(this.head+1)%this.f.length;this.length+=1;return null};function gh(a,b){a.length+1===a.f.length&&a.resize();a.unshift(b)}
fh.prototype.resize=function(){var a=Array(2*this.f.length);return this.B<this.head?(eh(this.f,this.B,a,0,this.length),this.B=0,this.head=this.length,this.f=a):this.B>this.head?(eh(this.f,this.B,a,0,this.f.length-this.B),eh(this.f,0,a,this.f.length-this.B,this.head),this.B=0,this.head=this.length,this.f=a):this.B===this.head?(this.head=this.B=0,this.f=a):null};function hh(a,b){for(var c=a.length,d=0;;)if(d<c){var e=a.pop();(b.d?b.d(e):b.call(null,e))&&a.unshift(e);d+=1}else break}
function ih(a){if(!(0<a))throw Error("Assert failed: Can't create a ring buffer of size 0\n"+x.d(qd.j(K([Ic(new C(null,"\x3e","\x3e",1085014381,null),new C(null,"n","n",-2092305744,null),0)],0))));return new fh(0,0,0,Array(a))}function jh(a,b){this.A=a;this.ac=b;this.v=0;this.l=2}jh.prototype.R=function(){return this.A.length};function kh(a){return a.A.length===a.ac}jh.prototype.eb=function(){return this.A.pop()};jh.prototype.Cb=function(a,b){gh(this.A,b);return this};
function lh(a){return new jh(ih(a),a)};var mh=null,nh=ih(32),oh=!1,ph=!1;function qh(){oh=!0;ph=!1;for(var a=0;;){var b=nh.pop();if(null!=b&&(b.n?b.n():b.call(null),1024>a)){a+=1;continue}break}oh=!1;return 0<nh.length?rh.n?rh.n():rh.call(null):null}"undefined"!==typeof MessageChannel&&(mh=new MessageChannel,mh.port1.onmessage=function(){return qh()});
function rh(){var a=ph;if(r(a?oh:a))return null;ph=!0;return"undefined"!==typeof MessageChannel?mh.port2.postMessage(0):"undefined"!==typeof setImmediate?setImmediate(qh):setTimeout(qh,0)}function sh(a){gh(nh,a);rh()};var th,vh=function uh(b){"undefined"===typeof th&&(th=function(b,d,e){this.M=b;this.box=d;this.$b=e;this.v=0;this.l=425984},th.hb=!0,th.gb="cljs.core.async.impl.channels/t14059",th.qb=function(b,d){return A(d,"cljs.core.async.impl.channels/t14059")},th.prototype.Ya=function(){return this.M},th.prototype.J=function(){return this.$b},th.prototype.K=function(b,d){return new th(this.M,this.box,d)});return new th(b,uh,null)};function wh(a,b){this.Ta=a;this.M=b}function xh(a){return ah(a.Ta)}
function yh(a){if(a?a.Bb:a)return a.Bb();var b;b=yh[p(null==a?null:a)];if(!b&&(b=yh._,!b))throw w("MMC.abort",a);return b.call(null,a)}function zh(a,b,c,d,e,f,g){this.Ka=a;this.jb=b;this.Ga=c;this.ib=d;this.A=e;this.closed=f;this.ea=g}
zh.prototype.fb=function(){var a=this;if(!a.closed)for(a.closed=!0,r(function(){var b=a.A;return r(b)?0===a.Ga.length:b}())&&(a.ea.d?a.ea.d(a.A):a.ea.call(null,a.A));;){var b=a.Ka.pop();if(null!=b){var c=b.ga,d=r(function(){var b=a.A;return r(b)?0<O(a.A):b}())?a.A.eb():null;sh(function(a,b){return function(){return a.d?a.d(b):a.call(null,b)}}(c,d,b,this))}else break}return null};
zh.prototype.Xb=function(a){var b=this;if(null!=b.A&&0<O(b.A)){var c=a.ga;for(a=vh(b.A.eb());;){if(!r(kh(b.A))){var d=b.Ga.pop();if(null!=d){var e=d.Ta,f=d.M;sh(function(a){return function(){return a.d?a.d(!0):a.call(null,!0)}}(e.ga,e,f,d,c,a,this));Vb(b.ea.c?b.ea.c(b.A,f):b.ea.call(null,b.A,f))&&yh(this);continue}}break}return a}c=function(){for(;;){var a=b.Ga.pop();if(r(a)){if(ah(a.Ta))return a}else return null}}();if(r(c))return a=bh(c.Ta),sh(function(a){return function(){return a.d?a.d(!0):a.call(null,
!0)}}(a,c,this)),vh(c.M);if(r(b.closed))return r(b.A)&&(b.ea.d?b.ea.d(b.A):b.ea.call(null,b.A)),r(r(!0)?a.ga:!0)?(c=function(){var a=b.A;return r(a)?0<O(b.A):a}(),c=r(c)?b.A.eb():null,vh(c)):null;64<b.jb?(b.jb=0,hh(b.Ka,ah)):b.jb+=1;if(!(1024>b.Ka.length))throw Error("Assert failed: "+x.d("No more than "+x.d(1024)+" pending takes are allowed on a single channel.")+"\n"+x.d(qd.j(K([Ic(new C(null,"\x3c","\x3c",993667236,null),Ic(new C(null,".-length",".-length",-280799999,null),new C(null,"takes","takes",
298247964,null)),new C("impl","MAX-QUEUE-SIZE","impl/MAX-QUEUE-SIZE",1508600732,null))],0))));gh(b.Ka,a);return null};
zh.prototype.pb=function(a,b,c){var d=this;if(null==b)throw Error("Assert failed: Can't put nil in on a channel\n"+x.d(qd.j(K([Ic(new C(null,"not","not",1044554643,null),Ic(new C(null,"nil?","nil?",1612038930,null),new C(null,"val","val",1769233139,null)))],0))));if(a=d.closed)return vh(!a);if(r(function(){var a=d.A;return r(a)?pa(kh(d.A)):a}())){for(c=Vb(d.ea.c?d.ea.c(d.A,b):d.ea.call(null,d.A,b));;){if(0<d.Ka.length&&0<O(d.A)){var e=d.Ka.pop(),f=e.ga,g=d.A.eb();sh(function(a,b){return function(){return a.d?
a.d(b):a.call(null,b)}}(f,g,e,c,a,this))}break}c&&yh(this);return vh(!0)}e=function(){for(;;){var a=d.Ka.pop();if(r(a)){if(r(!0))return a}else return null}}();if(r(e))return c=bh(e),sh(function(a){return function(){return a.d?a.d(b):a.call(null,b)}}(c,e,a,this)),vh(!0);64<d.ib?(d.ib=0,hh(d.Ga,xh)):d.ib+=1;if(!(1024>d.Ga.length))throw Error("Assert failed: "+x.d("No more than "+x.d(1024)+" pending puts are allowed on a single channel. Consider using a windowed buffer.")+"\n"+x.d(qd.j(K([Ic(new C(null,
"\x3c","\x3c",993667236,null),Ic(new C(null,".-length",".-length",-280799999,null),new C(null,"puts","puts",-1883877054,null)),new C("impl","MAX-QUEUE-SIZE","impl/MAX-QUEUE-SIZE",1508600732,null))],0))));gh(d.Ga,new wh(c,b));return null};zh.prototype.Bb=function(){for(;;){var a=this.Ga.pop();if(null!=a){var b=a.Ta;sh(function(a){return function(){return a.d?a.d(!0):a.call(null,!0)}}(b.ga,b,a.M,a,this))}break}hh(this.Ga,hd());return $g(this)};function Ah(a){console.log(a);return null}
function Bh(a,b,c){b=(r(b)?b:Ah).call(null,c);return null==b?a:dh.c(a,b)}
var Ch=function(){function a(a,b,c){return new zh(ih(32),0,ih(32),0,a,!1,function(){return function(a){return function(){function b(d,e){try{return a.c?a.c(d,e):a.call(null,d,e)}catch(f){return Bh(d,c,f)}}function d(b){try{return a.d?a.d(b):a.call(null,b)}catch(e){return Bh(b,c,e)}}var e=null,e=function(a,c){switch(arguments.length){case 1:return d.call(this,a);case 2:return b.call(this,a,c)}throw Error("Invalid arity: "+arguments.length);};e.d=d;e.c=b;return e}()}(r(b)?b.d?b.d(dh):b.call(null,dh):
dh)}())}function b(a,b){return d.e(a,b,null)}function c(a){return d.c(a,null)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.d=c;d.c=b;d.e=a;return d}();var Dh,Fh=function Eh(b){"undefined"===typeof Dh&&(Dh=function(b,d,e){this.ga=b;this.sb=d;this.Zb=e;this.v=0;this.l=393216},Dh.hb=!0,Dh.gb="cljs.core.async.impl.ioc-helpers/t13986",Dh.qb=function(b,d){return A(d,"cljs.core.async.impl.ioc-helpers/t13986")},Dh.prototype.Db=function(){return!0},Dh.prototype.Eb=function(){return this.ga},Dh.prototype.J=function(){return this.Zb},Dh.prototype.K=function(b,d){return new Dh(this.ga,this.sb,d)});return new Dh(b,Eh,null)};
function Gh(a){try{return a[0].call(null,a)}catch(b){throw b instanceof Object&&a[6].fb(),b;}}function Hh(a,b,c){c=c.Xb(Fh(function(c){a[2]=c;a[1]=b;return Gh(a)}));return r(c)?(a[2]=Wb.d?Wb.d(c):Wb.call(null,c),a[1]=b,Jf):null}function Ih(a,b){var c=a[6];null!=b&&c.pb(0,b,Fh(function(){return function(){return null}}(c)));c.fb();return c}
function Jh(a){for(;;){var b=a[4],c=Kf.d(b),d=Uf.d(b),e=a[5];if(r(function(){var a=e;return r(a)?pa(b):a}()))throw e;if(r(function(){var a=e;return r(a)?(a=c,r(a)?e instanceof d:a):a}())){a[1]=c;a[2]=e;a[5]=null;a[4]=S.j(b,Kf,null,K([Uf,null],0));break}if(r(function(){var a=e;return r(a)?pa(c)&&pa(yf.d(b)):a}()))a[4]=Xf.d(b);else{if(r(function(){var a=e;return r(a)?(a=pa(c))?yf.d(b):a:a}())){a[1]=yf.d(b);a[4]=S.e(b,yf,null);break}if(r(function(){var a=pa(e);return a?yf.d(b):a}())){a[1]=yf.d(b);a[4]=
S.e(b,yf,null);break}if(pa(e)&&pa(yf.d(b))){a[1]=Yf.d(b);a[4]=Xf.d(b);break}throw Error("No matching clause");}}};function Kh(a,b,c){this.key=a;this.M=b;this.forward=c;this.v=0;this.l=2155872256}Kh.prototype.F=function(a,b,c){return Se(b,Ye,"["," ","]",c,this)};Kh.prototype.L=function(){return Fa(Fa(I,this.M),this.key)};
(function(){function a(a,b,c){c=Array(c+1);for(var g=0;;)if(g<c.length)c[g]=null,g+=1;else break;return new Kh(a,b,c)}function b(a){return c.e(null,null,a)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.e=a;return c})().d(0);var Mh=function Lh(b){"undefined"===typeof Yg&&(Yg=function(b,d,e){this.ga=b;this.sb=d;this.Yb=e;this.v=0;this.l=393216},Yg.hb=!0,Yg.gb="cljs.core.async/t10887",Yg.qb=function(b,d){return A(d,"cljs.core.async/t10887")},Yg.prototype.Db=function(){return!0},Yg.prototype.Eb=function(){return this.ga},Yg.prototype.J=function(){return this.Yb},Yg.prototype.K=function(b,d){return new Yg(this.ga,this.sb,d)});return new Yg(b,Lh,null)},Nh=function(){function a(a,b,c){a=B.c(a,0)?null:a;if(r(b)&&!r(a))throw Error("Assert failed: buffer must be supplied when transducer is\n"+
x.d(qd.j(K([new C(null,"buf-or-n","buf-or-n",-1646815050,null)],0))));return Ch.e("number"===typeof a?lh(a):a,b,c)}function b(a,b){return e.e(a,b,null)}function c(a){return e.e(a,null,null)}function d(){return e.d(null)}var e=null,e=function(e,g,h){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,g);case 3:return a.call(this,e,g,h)}throw Error("Invalid arity: "+arguments.length);};e.n=d;e.d=c;e.c=b;e.e=a;return e}(),Oh=Mh(function(){return null}),
Ph=function(){function a(a,b,c,d){a=Zg(a,b,Mh(c));return r(a)?(b=Wb.d?Wb.d(a):Wb.call(null,a),r(d)?c.d?c.d(b):c.call(null,b):sh(function(a){return function(){return c.d?c.d(a):c.call(null,a)}}(b,a,a)),b):!0}function b(a,b,c){return d.o(a,b,c,!0)}function c(a,b){var c=Zg(a,b,Oh);return r(c)?Wb.d?Wb.d(c):Wb.call(null,c):!0}var d=null,d=function(d,f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+
arguments.length);};d.c=c;d.e=b;d.o=a;return d}();var Qh=new ha(null,8,[tf,Tg("start"),If,"white",Pf,"white",vf,null,of,null,pf,null,ig,new ha(null,5,[mf,!0,qf,"both",cg,null,dg,"revert",Df,new ha(null,1,[Qf,function(){return null}],null)],null),zf,new ha(null,2,[Nf,!0,Vf,null],null)],null),Rh=function(){function a(a,d){var e=null;1<arguments.length&&(e=K(Array.prototype.slice.call(arguments,1),0));return b.call(this,a,e)}function b(a,b){return r(a)?setTimeout(function(){return T.c(a,sd.c(cf,b))},50):null}a.r=1;a.k=function(a){var d=F(a);a=H(a);
return b(d,a)};a.j=b;return a}();function Sh(a,b){return S.e(a,tf,Tg(r(b)?b:"start"))}function Th(a,b){var c;c=tf.d(a);c=R.c(c,b);return r(c)?B.c(qf.d(ig.d(a)),"both")||B.j(qf.d(ig.d(a)),Pf.d(a),K([qf.d(c)],0)):null}function Uh(a,b){var c;c=tf.d(a);c=R.c(c,b);if(r(c)){var d=Nf.d(zf.d(a));return r(d)?B.j(qf.d(ig.d(a)),sg(Pf.d(a)),K([qf.d(c)],0)):d}return null}function Vh(a){var b=qf.d(ig.d(a)),c=Pf.d(a);return B.c(b,"both")?"both":r(r(b)?c:b)?B.c(b,c)?c:r(Nf.d(zf.d(a)))?sg(c):null:null}
function Wh(a,b,c){var d=Th(a,b);return r(d)?(d=mf.d(ig.d(a)),r(d)?d:tg(Bd.c(a,new W(null,3,5,X,[ig,cg,b],null)),c)):d}function Xh(a,b){return Dd(a,new W(null,2,5,X,[ig,mf],null),b)}function Yh(a,b){return Dd(Dd(a,new W(null,2,5,X,[ig,cg],null),b),new W(null,2,5,X,[ig,mf],null),!1)}function Zh(a,b){return r(tg(Qg,b))?S.e(a,Pf,b):a}function $h(a,b){return r(tg(hc.c(Qg,"both"),b))?Dd(a,new W(null,2,5,X,[ig,qf],null),b):a}function ai(a,b){return Dd(a,new W(null,2,5,X,[zf,Nf],null),vc(b))}
function bi(a,b){return Dd(a,new W(null,2,5,X,[zf,Vf],null),b)}function ci(a,b){return r(tg(Qg,b))?S.e(a,If,b):a}function di(a){return ci(a,B.c(If.d(a),"white")?"black":"white")}function ei(a,b){return S.e(a,pf,b)}function fi(a,b){return S.e(a,vf,b)}function gi(a,b){return S.e(a,of,b)}function hi(a,b){return Dd(a,new W(null,2,5,X,[ig,dg],null),b)}function ii(a,b){return Dd(a,new W(null,3,5,X,[ig,Df,Qf],null),b)}
function ji(a,b,c){var d=Xg(tf.d(a),new W(null,2,5,X,[b,c],null));r(d)&&(a=gi(fi(Dd(S.e(a,tf,d),new W(null,2,5,X,[ig,cg],null),null),null),new W(null,2,5,X,[b,c],null)),Rh.j(Qf.d(Df.d(ig.d(a))),K([b,c,d],0)));return a}function ki(a){var b;var c=Vf.d(zf.d(a));r(c)?(b=Q.e(c,0,null),c=Q.e(c,1,null),b=r(Wh(a,b,c))?ji(a,b,c):null):b=null;return bi(r(b)?b:a,null)};function li(a){function b(b,d){var e=Nh.n(),f=Nh.d(1);sh(function(e,f){return function(){var l=function(){return function(a){return function(){function b(c){for(;;){var d;a:{try{for(;;){var e=a(c);if(!Kc(e,Jf)){d=e;break a}}}catch(f){if(f instanceof Object){c[5]=f;Jh(c);d=Jf;break a}throw f;}d=void 0}if(!Kc(d,Jf))return d}}function c(){var a=[null,null,null,null,null,null,null,null,null];a[0]=d;a[1]=1;return a}var d=null,d=function(a){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,
a)}throw Error("Invalid arity: "+arguments.length);};d.n=c;d.d=b;return d}()}(function(e,f){return function(e){var g=e[1];if(2===g){var g=cf(e[2]),g=d.d?d.d(g):d.call(null,g),h=$g(f);e[7]=g;return Ih(e,h)}return 1===g?(g=a.c?a.c(b,f):a.call(null,b,f),e[8]=g,Hh(e,2,f)):null}}(e,f),e,f)}(),m=function(){var a=l.n?l.n():l.call(null);a[6]=e;return a}();return Gh(m)}}(f,e));return null}return cf(jc([Af,Gf,Sf,Wf,Zf,fg,gg,hg,jg,ng],[function(){return a.c?a.c(Rf,null):a.call(null,Rf,null)},function(b,d){return a.c?
a.c(Of,new W(null,2,5,X,[b,d],null)):a.call(null,Of,new W(null,2,5,X,[b,d],null))},function(a){return b(ag,a)},function(b){return a.c?a.c(Cf,xg(zg,hf.d(b))):a.call(null,Cf,xg(zg,hf.d(b)))},function(a){return b(Lf,a)},function(){return a.c?a.c(rf,null):a.call(null,rf,null)},function(b){return a.c?a.c(gg,hf.j(b,K([gf,!0],0))):a.call(null,gg,hf.j(b,K([gf,!0],0)))},function(a){return b(Hf,a)},function(a){return b(Mf,a)},function(a){return b(Bf,a)}]))}
function mi(a,b){var c=r(Bd.c(b,new W(null,2,5,X,[ig,cg],null)))?Ed.e(b,new W(null,2,5,X,[ig,cg],null),Ag):b;return xc.e(function(){return function(a,b){var c=Q.e(b,0,null),g=Q.e(b,1,null),h=Q.e(b,2,null);return R.e(c,g,tc)!==tc?h.c?h.c(a,R.c(c,g)):h.call(null,a,R.c(c,g)):a}}(c),a,new W(null,13,5,X,[new W(null,3,5,X,[c,lf,Sh],null),new W(null,3,5,X,[c,If,ci],null),new W(null,3,5,X,[c,nf,Zh],null),new W(null,3,5,X,[c,vf,fi],null),new W(null,3,5,X,[c,bg,gi],null),new W(null,3,5,X,[c,pf,ei],null),new W(null,
3,5,X,[ig.d(c),wf,Xh],null),new W(null,3,5,X,[ig.d(c),qf,$h],null),new W(null,3,5,X,[ig.d(c),cg,Yh],null),new W(null,3,5,X,[ig.d(c),og,hi],null),new W(null,3,5,X,[Bd.c(c,new W(null,2,5,X,[ig,Df],null)),Qf,ii],null),new W(null,3,5,X,[zf.d(c),kg,ai],null),new W(null,3,5,X,[zf.d(c),Vf,bi],null)],null))}function ni(a){return mi(Qh,a)};var oi=od.d?od.d(le):od.call(null,le),pi=function(){if(!r(document.body))throw"chessground must be included in the \x3cbody\x3e tag!";var a=document.body.style,b=new W(null,4,5,X,["transform","webkitTransform","mozTransform","oTransform"],null);return F(function(){var c=yd.c(function(a){return function(b){return vg(a,b)}}(a,b),b);return r(c)?c:b}())}();r(wg)&&document.addEventListener("DOMContentLoaded",function(){var a=document.createElement("div");a.id="cg-moving-square";return document.body.appendChild(a)});
var qi=scrollY,ri=scrollX,si=new ha(null,2,[eg,r(ri)?ri:document.documentElement.scrollLeft,jf,r(qi)?qi:document.documentElement.scrollTop],null),ti=r((new RegExp("ipad|iphone|ipod".source,"i")).test(navigator.userAgent))?new ha(null,2,[eg,0,jf,0],null):si;
function ui(a){var b=a.getBoundingClientRect();return new ha(null,6,[mg,b.left+eg.d(ti),$f,b.right+eg.d(ti),uf,b.top+jf.d(ti),sf,b.bottom+jf.d(ti),Ff,function(){var a=b.width;return r(a)?a:b.right-b.left}(),lg,function(){var a=b.height;return r(a)?a:b.bottom-b.top}()],null)}function vi(a){var b=a.target,c=function(){var a=b.x;return r(a)?a:0}()+a.dx;a=function(){var a=b.y;return r(a)?a:0}()+a.dy;var d="translate3d("+x.d(c)+"px, "+x.d(a)+"px, 0)";b.x=c;b.y=a;return b.style[pi]=d}
function wi(a,b){var c=a.target,d=c.parentNode,e=a.dropzone,f=document.getElementById("cg-moving-square");r(f)&&(f.style.display="none");r(e)&&e.classList.remove("drag-over");c.classList.remove("dragging");window.setTimeout(function(a){return function(){a.x=0;a.y=0;return a.style[pi]=""}}(c,d,e),20);return r(r(e)?B.c(d.parentNode,e.parentNode):e)?b.c?b.c(Ef,e.getAttribute("data-key")):b.call(null,Ef,e.getAttribute("data-key")):b.d?b.d(dg):b.call(null,dg)}
function xi(a){return a.target.classList.add("drag-over")}function yi(a){return a.target.classList.remove("drag-over")}
function zi(a){var b=ui(a.target),c=lg.d(b)-1,d=Ff.d(b)-1,e=2*c,f=2*d;a=document.getElementById("cg-moving-square");pa(a.offsetParent)&&(a.style.height=""+x.d(e)+"px",a.style.width=""+x.d(f)+"px",a.style.left=""+x.d(mg.d(b)-d/2)+"px",a.style.top=""+x.d(uf.d(b)-c/2)+"px",a.style.display="block",pd.c?pd.c(oi,b):pd.call(null,oi,b));d=Wb.d?Wb.d(oi):Wb.call(null,oi);c=mg.d(b)-mg.d(d);b=uf.d(b)-uf.d(d);return a.style[pi]="translate3d("+x.d(c)+"px, "+x.d(b)+"px, 0)"}function Ai(){return null}
function Bi(a,b,c){return interact(a).draggable(c).on("dragstart",function(a){var b=a.target;b.classList.add("dragging");if(r(!0)){var c,g=b.getBoundingClientRect();c=new ha(null,2,[uf,g.top+document.body.scrollTop,mg,g.left+document.body.scrollLeft],null);g=mg.d(c)+b.offsetWidth/2;c=uf.d(c)+b.offsetHeight/2;c=a.pageY-c;b.x=a.pageX-g;a=b.y=c}else a=null;return a}).on("dragmove",vi).on("dragend",function(a){return wi(a,b)})};var Ci=React.DOM.div;function Di(a){return Object.keys(a).filter(function(b){return a[b]}).join(" ")}function Ei(a){return r(a)?[a.color,a.role,a["draggable?"]].join(""):null}function Fi(a,b){return function(c){return a[c]!==b[c]}}
for(var Gi=React.createClass({render:function(){return Ci.d?Ci.d({className:["cg-piece",this.props.color,this.props.role].join(" ")}):Ci.call(null,{className:["cg-piece",this.props.color,this.props.role].join(" ")})},componentWillUnmount:function(){return this.state["draggable-instance"].unset()},componentWillUpdate:function(a){return cd.c(a["draggable?"],this.props["draggable?"])?this.state["draggable-instance"].set({draggable:a["draggable?"]}):null},componentDidMount:function(){return this.setState({"draggable-instance":Bi(this.getDOMNode(),
this.props.ctrl,this.props["draggable?"])})},shouldComponentUpdate:function(a){return Ei(this.props)!==Ei(a)},displayName:"Piece"}),Hi=React.createClass({render:function(){var a=function(a){return function(b){return a.props[b]}}(this),b=a("orientation");a("ctrl");var c=a("key"),b=B.c(b,"white"),d="abcdefgh".indexOf(R.c(c,0))+1,e=parseInt(R.c(c,1)),f=""+x.d(12.5*(d-1))+"%",g=""+x.d(12.5*(e-1))+"%";return Ci.c?Ci.c({"data-coord-y":d===(b?8:1)?e:null,"data-coord-x":e===(b?1:8)?R.c(c,0):null,"data-key":c,
className:Di({"current-premove":a("current-premove?"),"premove-dest":a("premove-dest?"),"move-dest":a("move-dest?"),"last-move":a("last-move?"),check:a("check?"),selected:a("selected?"),"cg-square":!0}),style:b?{bottom:g,left:f}:{top:g,right:f}},function(){var b=a("piece");return r(b)?Gi.d?Gi.d(b):Gi.call(null,b):null}()):Ci.call(null,{"data-coord-y":d===(b?8:1)?e:null,"data-coord-x":e===(b?1:8)?R.c(c,0):null,"data-key":c,className:Di({"current-premove":a("current-premove?"),"premove-dest":a("premove-dest?"),
"move-dest":a("move-dest?"),"last-move":a("last-move?"),check:a("check?"),selected:a("selected?"),"cg-square":!0}),style:b?{bottom:g,left:f}:{top:g,right:f}},function(){var b=a("piece");return r(b)?Gi.d?Gi.d(b):Gi.call(null,b):null}())},componentDidMount:function(){var a=this.getDOMNode(),b=r(wg)?"touchstart":"mousedown";a.addEventListener(b,function(a,b,e,f){return function(a){a.preventDefault();return f.c?f.c(Tf,e):f.call(null,Tf,e)}}(b,a,this.props.key,this.props.ctrl,this));return interact(a).dropzone(!0).on("dragenter",
r(wg)?zi:xi).on("dragleave",r(wg)?Ai:yi)},shouldComponentUpdate:function(a){var b=Fi(this.props,a),c=b.d?b.d("selected?"):b.call(null,"selected?");if(r(c))return c;c=b.d?b.d("move-dest?"):b.call(null,"move-dest?");if(r(c))return c;c=b.d?b.d("premove-dest?"):b.call(null,"premove-dest?");if(r(c))return c;c=b.d?b.d("check?"):b.call(null,"check?");if(r(c))return c;c=b.d?b.d("last-move?"):b.call(null,"last-move?");if(r(c))return c;c=b.d?b.d("current-premove?"):b.call(null,"current-premove?");if(r(c))return c;
b=b.d?b.d("orientation"):b.call(null,"orientation");return r(b)?b:Ei(this.props.piece)!==Ei(a.piece)},displayName:"Square"}),Ii=React.createClass({render:function(){return Ci.c?Ci.c({className:"cg-board"},this.props.chess.map(Hi)):Ci.call(null,{className:"cg-board"},this.props.chess.map(Hi))},displayName:"Board"}),Ji=[],Ki=1;;){for(var Li=1;;)if(Ji.push(""+x.d("abcdefgh"[Li-1])+x.d(Ki)),8>Li)Li+=1;else break;if(8>Ki)Ki+=1;else break}function Mi(a){return r(a)?cf(a):[]}
function Ni(a,b){var c=R.c(a,If),d=R.c(a,tf),e=Vh(a),f=Mi(R.c(a,of)),g=R.c(a,pf),h=R.c(a,vf),l=Mi(R.c(R.c(a,zf),Vf)),m=Mi(function(){var b=R.c(a,pf);return r(b)?r(Th(a,b))?Bd.c(a,new W(null,3,5,X,[ig,cg,b],null)):null:null}()),n=Mi(function(){var b=R.c(a,pf);if(r(b)&&r(Uh(a,b))){var c=R.c(d,b);return r(c)?Pg(d,b,c):null}return null}());return{chess:Ji.map(function(a,c,d,e,f,g,h,l,m){return function(n){var Ea=-1!==m.indexOf(n),D=-1!==e.indexOf(n),Kb;Kb=R.c(c,n);if(r(Kb)){var Y=R.c(Kb,qf);Kb={"draggable?":B.c(d,
"both")||B.c(d,Y),role:R.c(Kb,kf),color:Y,ctrl:b}}else Kb=null;return{"premove-dest?":Ea,key:n,"last-move?":D,piece:Kb,orientation:a,ctrl:b,"current-premove?":-1!==h.indexOf(n),"move-dest?":-1!==l.indexOf(n),"selected?":f===n,"check?":g===n}}}(c,d,e,f,g,h,l,m,n))}};function Oi(a,b){var c=Q.e(b,0,null),d=Q.e(b,1,null);if(B.c(c,d))return a;var e;r(Wh(a,c,d))?(e=ji(a,c,d),e=ei(e,null)):e=null;if(r(e))return e;e=Uh(a,c);if(r(e)){e=tf.d(a);var f=R.c(e,c);e=tg(Pg(e,c,f),d)}r(e)?(c=bi(a,new W(null,2,5,X,[c,d],null)),c=ei(c,null)):c=null;r(c)?d=c:(c=Th(a,d),c=r(c)?c:Uh(a,d),d=ei(a,r(c)?d:null));return d}function Pi(a){var b;B.c("trash",dg.d(ig.d(a)))?(b=pf.d(a),b=r(b)?Ed.o(a,new W(null,1,5,X,[tf],null),Vg,new oe([b,null])):null):b=null;return ei(r(b)?b:a,null)};function Qi(a,b){var c=a instanceof U?a.Ca:null;switch(c){case "toggle-orientation":return di;case "get-state":return function(){return function(a){return Ph.c(b,a)}}(c);case "set-pieces":return function(a){return function(c){return Ed.e(c,new W(null,1,5,X,[tf],null),function(){return function(a){return Vg(a,b)}}(a))}}(c);case "drop-on":return function(){return function(a){var c=pf.d(a);return r(c)?Oi(a,new W(null,2,5,X,[c,b],null)):Pi(a)}}(c);case "get-current-premove":return function(){return function(a){return Ph.c(b,
Vf.d(zf.d(a)))}}(c);case "get-position":return function(){return function(a){return Ph.c(b,Ug(tf.d(a)))}}(c);case "get-orientation":return function(){return function(a){return Ph.c(b,If.d(a))}}(c);case "api-move":return function(){return function(a){var c=Q.e(b,0,null),f=Q.e(b,1,null),g=Xg(tf.d(a),new W(null,2,5,X,[c,f],null));return r(g)?gi(fi(S.e(a,tf,g),null),new W(null,2,5,X,[c,f],null)):a}}(c);case "play-premove":return ki;case "select-square":return function(){return function(a){var c=pf.d(a);
r(c)?a=Oi(a,new W(null,2,5,X,[c,b],null)):(c=Th(a,b),c=r(c)?c:Uh(a,b),a=r(c)?ei(a,b):bi(a,null));return a}}(c);case "get-fen":return function(){return function(a){return Ph.c(b,Hg(tf.d(a)))}}(c);case "drop-off":return Pi;case "set":return function(){return function(a){return mi(a,b)}}(c);default:throw Error("No matching clause: "+x.d(a));}}function Ri(a,b){return function(c){var d=Qi(a,b).call(null,c);return R.e(d,tf,tc)!==tc?d:c}};NodeList.prototype.Sb=!0;NodeList.prototype.L=function(){return K.c(this,0)};
function Si(a,b){var c=Nh.n(),d=function(a){return function(b,c){return Ph.c(a,new W(null,2,5,X,[b,c],null))}}(c),e=ni(function(){var a=hf.j(b,K([gf,!0],0));return r(a)?a:le}()),f=od.d?od.d(e):od.call(null,e),g=function(b,c){return function(b){return React.renderComponent(Ii.d?Ii.d(Ni(b,c)):Ii.call(null,Ni(b,c)),a)}}(c,d,e,f);g(e);var h=Nh.d(1);sh(function(a,b,c,d,e,f){return function(){var g=function(){return function(a){return function(){function b(c){for(;;){var d;a:{try{for(;;){var e=a(c);if(!Kc(e,
Jf)){d=e;break a}}}catch(f){if(f instanceof Object){c[5]=f;Jh(c);d=Jf;break a}throw f;}d=void 0}if(!Kc(d,Jf))return d}}function c(){var a=[null,null,null,null,null,null,null,null];a[0]=d;a[1]=1;return a}var d=null,d=function(a){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,a)}throw Error("Invalid arity: "+arguments.length);};d.n=c;d.d=b;return d}()}(function(a,b,c,d,e,f){return function(a){var c=a[1];if(4===c){var d=a[2],c=Q.e(d,0,null),d=Q.e(d,1,null),c=rd.c(e,Ri(c,
d)),c=f(c);a[7]=c;a[2]=null;a[1]=2;return Jf}return 3===c?(c=a[2],Ih(a,c)):2===c?Hh(a,4,b):1===c?(a[2]=null,a[1]=2,Jf):null}}(a,b,c,d,e,f),a,b,c,d,e,f)}(),h=function(){var b=g.n?g.n():g.call(null);b[6]=a;return b}();return Gh(h)}}(h,c,d,e,f,g));return li(d)}var Ti=["chessground","main"],Ui=this;Ti[0]in Ui||!Ui.execScript||Ui.execScript("var "+Ti[0]);for(var Vi;Ti.length&&(Vi=Ti.shift());)Ti.length||void 0===Si?Ui=Ui[Vi]?Ui[Vi]:Ui[Vi]={}:Ui[Vi]=Si;module.exports = this.chessground;

},{"interact":3,"react":147}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/**
 * interact.js v1.0.25
 *
 * Copyright (c) 2012, 2013, 2014 Taye Adeyemi <dev@taye.me>
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact.js/master/LICENSE
 */
(function () {
    'use strict';

    var document           = window.document,
        console            = window.console,
        SVGElement         = window.SVGElement         || blank,
        SVGSVGElement      = window.SVGSVGElement      || blank,
        SVGElementInstance = window.SVGElementInstance || blank,
        HTMLElement        = window.HTMLElement        || window.Element,

        // Use PointerEvents only if the Gesture API is also available
        Gesture      = window.Gesture || window.MSGesture,
        PointerEvent = Gesture && (window.PointerEvent || window.MSPointerEvent),
        GestureEvent = Gesture && (window.GestureEvent || window.MSGestureEvent),
        pEventTypes,
        gEventTypes,

        hypot = Math.hypot || function (x, y) { return Math.sqrt(x * x + y * y); },

        // Previous native pointer move event coordinates
        prevCoords = {
            pageX    : 0, pageY  : 0,
            clientX  : 0, clientY: 0,
            timeStamp: 0
        },
        // current native pointer move event coordinates
        curCoords = {
            pageX    : 0, pageY  : 0,
            clientX  : 0, clientY: 0,
            timeStamp: 0
        },

        // Starting InteractEvent pointer coordinates
        startCoords = {
            pageX    : 0, pageY  : 0,
            clientX  : 0, clientY: 0,
            timeStamp: 0
        },

        // Change in coordinates and time of the pointer
        pointerDelta = {
            pageX    : 0, pageY      : 0,
            clientX  : 0, clientY    : 0,
            pageSpeed: 0, clientSpeed: 0,
            timeStamp: 0
        },

        // keep track of added PointerEvents or touches
        pointerIds   = [],
        pointerMoves = [],

        downTime  = 0,         // the timeStamp of the starting event
        downEvent = null,      // gesturestart/mousedown/touchstart event
        prevEvent = null,      // previous action event
        tapTime   = 0,         // time of the most recent tap event
        prevTap   = null,

        startOffset    = { left: 0, right: 0, top: 0, bottom: 0 },
        restrictOffset = { left: 0, right: 0, top: 0, bottom: 0 },
        snapOffset     = { x: 0, y: 0},

        tmpXY = {},     // reduce object creation in getXY()

        inertiaStatus = {
            active       : false,
            smoothEnd    : false,
            target       : null,
            targetElement: null,

            startEvent: null,
            pointerUp : {},

            xe: 0, ye: 0,
            sx: 0, sy: 0,

            t0: 0,
            vx0: 0, vys: 0,
            duration: 0,

            resumeDx: 0,
            resumeDy: 0,

            lambda_v0: 0,
            one_ve_v0: 0,
            i  : null
        },

        gesture = {
            start: { x: 0, y: 0 },

            startDistance: 0,   // distance between two touches of touchStart
            prevDistance : 0,
            distance     : 0,

            scale: 1,           // gesture.distance / gesture.startDistance

            startAngle: 0,      // angle of line joining two touches
            prevAngle : 0       // angle of the previous gesture event
        },

        interactables   = [],   // all set interactables
        dropzones       = [],   // all dropzone element interactables

        activeDrops     = {
            dropzones: [],      // the dropzones that are mentioned below
            elements : [],      // elements of dropzones that accept the target draggable
            rects    : []       // the rects of the elements mentioned above
        },

        matches         = [],   // all selectors that are matched by target element
        selectorGesture = null, // MSGesture object for selector PointerEvents

        // {
        //      type: {
        //          selectors: ['selector', ...],
        //          contexts : [document, ...],
        //          listeners: [[listener, useCapture], ...]
        //      }
        //  }
        delegatedEvents = {},

        target          = null, // current interactable being interacted with
        dropTarget      = null, // the dropzone a drag target might be dropped into
        dropElement     = null, // the element at the time of checking
        prevDropTarget  = null, // the dropzone that was recently dragged away from
        prevDropElement = null, // the element at the time of checking

        defaultOptions = {
            draggable   : false,
            dragAxis    : 'xy',
            dropzone    : false,
            accept      : null,
            resizable   : false,
            squareResize: false,
            resizeAxis  : 'xy',
            gesturable  : false,

            pointerMoveTolerance: 1,

            actionChecker: null,

            styleCursor: true,
            preventDefault: 'auto',

            // aww snap
            snap: {
                mode        : 'grid',
                endOnly     : false,
                actions     : ['drag'],
                range       : Infinity,
                grid        : { x: 100, y: 100 },
                gridOffset  : { x:   0, y:   0 },
                anchors     : [],
                paths       : [],

                elementOrigin: null,

                arrayTypes  : /^anchors$|^paths$|^actions$/,
                objectTypes : /^grid$|^gridOffset$|^elementOrigin$/,
                stringTypes : /^mode$/,
                numberTypes : /^range$/,
                boolTypes   :  /^endOnly$/
            },
            snapEnabled: false,

            restrict: {
                drag: null,
                resize: null,
                gesture: null,
                endOnly: false
            },
            restrictEnabled: false,

            autoScroll: {
                container   : window,  // the item that is scrolled (Window or HTMLElement)
                margin      : 60,
                speed       : 300,      // the scroll speed in pixels per second

                numberTypes : /^margin$|^speed$/
            },
            autoScrollEnabled: false,

            inertia: {
                resistance       : 10,    // the lambda in exponential decay
                minSpeed         : 100,   // target speed must be above this for inertia to start
                endSpeed         : 10,    // the speed at which inertia is slow enough to stop
                zeroResumeDelta  : false, // if an action is resumed after launch, set dx/dy to 0
                smoothEndDuration: 300,   // animate to snap/restrict endOnly if there's no inertia
                actions          : ['drag', 'resize'],  // allow inertia on these actions. gesture might not work

                numberTypes: /^resistance$|^minSpeed$|^endSpeed$|^smoothEndDuration$/,
                arrayTypes : /^actions$/,
                boolTypes  : /^zeroResumeDelta$/
            },
            inertiaEnabled: false,

            origin      : { x: 0, y: 0 },
            deltaSource : 'page',

            context     : document        // the Node on which querySelector will be called
        },

        snapStatus = {
            x       : 0, y       : 0,
            dx      : 0, dy      : 0,
            realX   : 0, realY   : 0,
            snappedX: 0, snappedY: 0,
            anchors : [],
            paths   : [],
            locked  : false,
            changed : false
        },

        restrictStatus = {
            dx         : 0, dy         : 0,
            restrictedX: 0, restrictedY: 0,
            snap       : snapStatus,
            restricted : false,
            changed    : false
        },

        // Things related to autoScroll
        autoScroll = {
            target: null,
            i: null,    // the handle returned by window.setInterval
            x: 0, y: 0, // Direction each pulse is to scroll in

            // scroll the window by the values in scroll.x/y
            scroll: function () {
                var options = autoScroll.target.options.autoScroll,
                    container = options.container,
                    now = new Date().getTime(),
                    // change in time in seconds
                    dt = (now - autoScroll.prevTime) / 1000,
                    // displacement
                    s = options.speed * dt;

                if (s >= 1) {
                    if (container instanceof window.Window) {
                        container.scrollBy(autoScroll.x * s, autoScroll.y * s);
                    }
                    else if (container) {
                        container.scrollLeft += autoScroll.x * s;
                        container.scrollTop  += autoScroll.y * s;
                    }

                    autoScroll.prevTime = now;
                }

                if (autoScroll.isScrolling) {
                    cancelFrame(autoScroll.i);
                    autoScroll.i = reqFrame(autoScroll.scroll);
                }
            },

            edgeMove: function (event) {
                if (target && target.options.autoScrollEnabled && (dragging || resizing)) {
                    var top,
                        right,
                        bottom,
                        left,
                        options = target.options.autoScroll;

                    if (options.container instanceof window.Window) {
                        left   = event.clientX < autoScroll.margin;
                        top    = event.clientY < autoScroll.margin;
                        right  = event.clientX > options.container.innerWidth  - autoScroll.margin;
                        bottom = event.clientY > options.container.innerHeight - autoScroll.margin;
                    }
                    else {
                        var rect = getElementRect(options.container);

                        left   = event.clientX < rect.left   + autoScroll.margin;
                        top    = event.clientY < rect.top    + autoScroll.margin;
                        right  = event.clientX > rect.right  - autoScroll.margin;
                        bottom = event.clientY > rect.bottom - autoScroll.margin;
                    }

                    autoScroll.x = (right ? 1: left? -1: 0);
                    autoScroll.y = (bottom? 1:  top? -1: 0);

                    if (!autoScroll.isScrolling) {
                        // set the autoScroll properties to those of the target
                        autoScroll.margin = options.margin;
                        autoScroll.speed  = options.speed;

                        autoScroll.start(target);
                    }
                }
            },

            isScrolling: false,
            prevTime: 0,

            start: function (target) {
                autoScroll.isScrolling = true;
                cancelFrame(autoScroll.i);

                autoScroll.target = target;
                autoScroll.prevTime = new Date().getTime();
                autoScroll.i = reqFrame(autoScroll.scroll);
            },

            stop: function () {
                autoScroll.isScrolling = false;
                cancelFrame(autoScroll.i);
            }
        },

        // Does the browser support touch input?
        supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),

        // Less Precision with touch input
        margin = supportsTouch? 20: 10,

        pointerIsDown   = false,
        pointerWasMoved = false,
        gesturing       = false,
        dragging        = false,
        dynamicDrop     = false,
        resizing        = false,
        resizeAxes      = 'xy',

        // What to do depending on action returned by getAction() of interactable
        // Dictates what styles should be used and what pointerMove event Listner
        // is to be added after pointerDown
        actions = {
            drag: {
                cursor: 'move',
                start : dragStart,
                move  : dragMove
            },
            resizex: {
                cursor: 'e-resize',
                start : resizeStart,
                move  : resizeMove
            },
            resizey: {
                cursor: 's-resize',
                start : resizeStart,
                move  : resizeMove
            },
            resizexy: {
                cursor: 'se-resize',
                start : resizeStart,
                move  : resizeMove
            },
            gesture: {
                cursor: '',
                start : gestureStart,
                move  : gestureMove
            }
        },

        actionIsEnabled = {
            drag   : true,
            resize : true,
            gesture: true
        },

        // Action that's ready to be fired on next move event
        prepared = null,

        // because Webkit and Opera still use 'mousewheel' event type
        wheelEvent = 'onmousewheel' in document? 'mousewheel': 'wheel',

        eventTypes = [
            'dragstart',
            'dragmove',
            'draginertiastart',
            'dragend',
            'dragenter',
            'dragleave',
            'dropactivate',
            'dropdeactivate',
            'dropmove',
            'drop',
            'resizestart',
            'resizemove',
            'resizeinertiastart',
            'resizeend',
            'gesturestart',
            'gesturemove',
            'gestureinertiastart',
            'gestureend',

            'tap',
            'doubletap'
        ],

        globalEvents = {},

        fireStates = {
            directBind: 0,
            onevent   : 1,
            globalBind: 2
        },

        // Opera Mobile must be handled differently
        isOperaMobile = navigator.appName == 'Opera' &&
            supportsTouch &&
            navigator.userAgent.match('Presto'),

        // prefix matchesSelector
        prefixedMatchesSelector = 'matchesSelector' in Element.prototype?
                'matchesSelector': 'webkitMatchesSelector' in Element.prototype?
                    'webkitMatchesSelector': 'mozMatchesSelector' in Element.prototype?
                        'mozMatchesSelector': 'oMatchesSelector' in Element.prototype?
                            'oMatchesSelector': 'msMatchesSelector',

        // will be polyfill function if browser is IE8
        ie8MatchesSelector,

        // native requestAnimationFrame or polyfill
        reqFrame = window.requestAnimationFrame,
        cancelFrame = window.cancelAnimationFrame,

        // used for adding event listeners to window and document
        windowTarget       = { _element: window       , events  : {} },
        docTarget          = { _element: document     , events  : {} },
        parentWindowTarget = { _element: window.parent, events  : {} },
        parentDocTarget    = { _element: null         , events  : {} },

        // Events wrapper
        events = (function () {
            var useAttachEvent = ('attachEvent' in window) && !('addEventListener' in window),
                addEvent       = useAttachEvent?  'attachEvent': 'addEventListener',
                removeEvent    = useAttachEvent?  'detachEvent': 'removeEventListener',
                on             = useAttachEvent? 'on': '',

                elements          = [],
                targets           = [],
                attachedListeners = [];

            function add (element, type, listener, useCapture) {
                var elementIndex = indexOf(elements, element),
                    target = targets[elementIndex];

                if (!target) {
                    target = {
                        events: {},
                        typeCount: 0
                    };

                    elementIndex = elements.push(element) - 1;
                    targets.push(target);

                    attachedListeners.push((useAttachEvent ? {
                            supplied: [],
                            wrapped : [],
                            useCount: []
                        } : null));
                }

                if (!target.events[type]) {
                    target.events[type] = [];
                    target.typeCount++;
                }

                if (!contains(target.events[type], listener)) {
                    var ret;

                    if (useAttachEvent) {
                        var listeners = attachedListeners[elementIndex],
                            listenerIndex = indexOf(listeners.supplied, listener);

                        var wrapped = listeners.wrapped[listenerIndex] || function (event) {
                            if (!event.immediatePropagationStopped) {
                                event.target = event.srcElement;
                                event.currentTarget = element;

                                event.preventDefault = event.preventDefault || preventDef;
                                event.stopPropagation = event.stopPropagation || stopProp;
                                event.stopImmediatePropagation = event.stopImmediatePropagation || stopImmProp;

                                if (/mouse|click/.test(event.type)) {
                                    event.pageX = event.clientX + document.documentElement.scrollLeft;
                                    event.pageY = event.clientY + document.documentElement.scrollTop;
                                }

                                listener(event);
                            }
                        };

                        ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

                        if (listenerIndex === -1) {
                            listeners.supplied.push(listener);
                            listeners.wrapped.push(wrapped);
                            listeners.useCount.push(1);
                        }
                        else {
                            listeners.useCount[listenerIndex]++;
                        }
                    }
                    else {
                        ret = element[addEvent](type, listener, useCapture || false);
                    }
                    target.events[type].push(listener);

                    return ret;
                }
            }

            function remove (element, type, listener, useCapture) {
                var i,
                    elementIndex = indexOf(elements, element),
                    target = targets[elementIndex],
                    listeners,
                    listenerIndex,
                    wrapped = listener;

                if (!target || !target.events) {
                    return;
                }

                if (useAttachEvent) {
                    listeners = attachedListeners[elementIndex];
                    listenerIndex = indexOf(listeners.supplied, listener);
                    wrapped = listeners.wrapped[listenerIndex];
                }

                if (type === 'all') {
                    for (type in target.events) {
                        if (target.events.hasOwnProperty(type)) {
                            remove(element, type, 'all');
                        }
                    }
                    return;
                }

                if (target.events[type]) {
                    var len = target.events[type].length;

                    if (listener === 'all') {
                        for (i = 0; i < len; i++) {
                            remove(element, type, target.events[type][i], Boolean(useCapture));
                        }
                    } else {
                        for (i = 0; i < len; i++) {
                            if (target.events[type][i] === listener) {
                                element[removeEvent](on + type, wrapped, useCapture || false);
                                target.events[type].splice(i, 1);

                                if (useAttachEvent && listeners) {
                                    listeners.useCount[listenerIndex]--;
                                    if (listeners.useCount[listenerIndex] === 0) {
                                        listeners.supplied.splice(listenerIndex, 1);
                                        listeners.wrapped.splice(listenerIndex, 1);
                                        listeners.useCount.splice(listenerIndex, 1);
                                    }
                                }

                                break;
                            }
                        }
                    }

                    if (target.events[type] && target.events[type].length === 0) {
                        target.events[type] = null;
                        target.typeCount--;
                    }
                }

                if (!target.typeCount) {
                    targets.splice(elementIndex);
                    elements.splice(elementIndex);
                    attachedListeners.splice(elementIndex);
                }
            }

            function preventDef () {
                this.returnValue = false;
            }

            function stopProp () {
                this.cancelBubble = true;
            }

            function stopImmProp () {
                this.cancelBubble = true;
                this.immediatePropagationStopped = true;
            }

            return {
                add: function (target, type, listener, useCapture) {
                    add(target._element, type, listener, useCapture);
                },
                remove: function (target, type, listener, useCapture) {
                    remove(target._element, type, listener, useCapture);
                },
                addToElement: add,
                removeFromElement: remove,
                useAttachEvent: useAttachEvent,

                indexOf: indexOf
            };
        }());

    function blank () {}

    function isElement (o) {
        return !!o && (typeof o === 'object') && (
            /object|function/.test(typeof Element)
                ? o instanceof Element //DOM2
                : o.nodeType === 1 && typeof o.nodeName === "string");
    }
    function isObject   (thing) { return thing instanceof Object; }
    function isArray    (thing) { return thing instanceof Array ; }
    function isFunction (thing) { return typeof thing === 'function'; }
    function isNumber   (thing) { return typeof thing === 'number'  ; }
    function isBool     (thing) { return typeof thing === 'boolean' ; }
    function isString   (thing) { return typeof thing === 'string'  ; }

    function extend (dest, source) {
        for (var prop in source) {
            dest[prop] = source[prop];
        }
        return dest;
    }

    function cloneEvent (event) {
        var clone = extend({}, event),
            i;

        clone.constructor = event.constructor;

        if (event.touches) {
            clone.touches = [];
            clone.changedTouches = [];

            for (i = 0; i < event.touches.length; i++) {
                clone.touches.push(extend({}, event.touches[i]));
            }
            for (i = 0; i < event.touches.length; i++) {
                clone.changedTouches.push(extend({}, event.changedTouches[i]));
            }
        }

        return clone;
    }

    function setEventXY (targetObj, source) {
        getPageXY(source, tmpXY);
        targetObj.pageX = tmpXY.x;
        targetObj.pageY = tmpXY.y;

        getClientXY(source, tmpXY);
        targetObj.clientX = tmpXY.x;
        targetObj.clientY = tmpXY.y;

        targetObj.timeStamp = new Date().getTime();
    }

    function setEventDeltas (targetObj, prev, cur) {
        targetObj.pageX     = cur.pageX      - prev.pageX;
        targetObj.pageY     = cur.pageY      - prev.pageY;
        targetObj.clientX   = cur.clientX    - prev.clientX;
        targetObj.clientY   = cur.clientY    - prev.clientY;
        targetObj.timeStamp = new Date().getTime() - prev.timeStamp;

        // set pointer velocity
        var dt = Math.max(targetObj.timeStamp / 1000, 0.001);
        targetObj.pageSpeed   = hypot(targetObj.pageX, targetObj.pageY) / dt;
        targetObj.pageVX      = targetObj.pageX / dt;
        targetObj.pageVY      = targetObj.pageY / dt;

        targetObj.clientSpeed = hypot(targetObj.clientX, targetObj.pageY) / dt;
        targetObj.clientVX    = targetObj.clientX / dt;
        targetObj.clientVY    = targetObj.clientY / dt;
    }

    // Get specified X/Y coords for mouse or event.touches[0]
    function getXY (type, event, xy) {
        var touch,
            x,
            y;

        xy = xy || {};
        type = type || 'page';

        if (/touch/.test(event.type) && event.touches) {
            touch = (event.touches.length)?
                event.touches[0]:
                event.changedTouches[0];
            x = touch[type + 'X'];
            y = touch[type + 'Y'];
        }
        else {
            x = event[type + 'X'];
            y = event[type + 'Y'];
        }

        xy.x = x;
        xy.y = y;

        return xy;
    }

    function getPageXY (event, page) {
        page = page || {};

        if (event instanceof InteractEvent) {
            if (/inertiastart/.test(event.type)) {
                getPageXY(inertiaStatus.pointerUp, page);

                page.x += inertiaStatus.sx;
                page.y += inertiaStatus.sy;
            }
            else {
                page.x = event.pageX;
                page.y = event.pageY;
            }
        }
        // Opera Mobile handles the viewport and scrolling oddly
        else if (isOperaMobile) {
            getXY('screen', event, page);

            page.x += window.scrollX;
            page.y += window.scrollY;
        }
        // MSGesture events don't have pageX/Y
        else if (/gesture|inertia/i.test(event.type)) {
            getXY('client', event, page);

            page.x += document.documentElement.scrollLeft;
            page.y += document.documentElement.scrollTop;
        }
        else {
            getXY('page', event, page);
        }

        return page;
    }

    function getClientXY (event, client) {
        client = client || {};

        if (event instanceof InteractEvent) {
            if (/inertiastart/.test(event.type)) {
                getClientXY(inertiaStatus.pointerUp, client);

                client.x += inertiaStatus.sx;
                client.y += inertiaStatus.sy;
            }
            else {
                client.x = event.clientX;
                client.y = event.clientY;
            }
        }
        else {
            // Opera Mobile handles the viewport and scrolling oddly
            getXY(isOperaMobile? 'screen': 'client', event, client);
        }

        return client;
    }

    function getScrollXY () {
        return {
            x: window.scrollX || document.documentElement.scrollLeft,
            y: window.scrollY || document.documentElement.scrollTop
        };
    }

    function getElementRect (element) {
        var scroll = /ipad|iphone|ipod/i.test(navigator.userAgent)
                ? { x: 0, y: 0 }
                : getScrollXY(),
            clientRect = (element instanceof SVGElement)?
                element.getBoundingClientRect():
                element.getClientRects()[0];

        return clientRect && {
            left  : clientRect.left   + scroll.x,
            right : clientRect.right  + scroll.x,
            top   : clientRect.top    + scroll.y,
            bottom: clientRect.bottom + scroll.y,
            width : clientRect.width || clientRect.right - clientRect.left,
            height: clientRect.heigh || clientRect.bottom - clientRect.top
        };
    }

    function getTouchPair (event) {
        var touches = [];

        // array of touches is supplied
        if (isArray(event)) {
            touches[0] = event[0];
            touches[1] = event[1];
        }
        // an event
        else {
            if (event.type === 'touchend') {
                if (event.touches.length === 1) {
                    touches[0] = event.touches[0];
                    touches[1] = event.changedTouches[0];
                }
                else if (event.touches.length === 0) {
                    touches[0] = event.changedTouches[0];
                    touches[1] = event.changedTouches[1];
                }
            }
            else {
                touches[0] = event.touches[0];
                touches[1] = event.touches[1];
            }
        }

        return touches;
    }

    function touchAverage (event) {
        var touches = getTouchPair(event);

        return {
            pageX: (touches[0].pageX + touches[1].pageX) / 2,
            pageY: (touches[0].pageY + touches[1].pageY) / 2,
            clientX: (touches[0].clientX + touches[1].clientX) / 2,
            clientY: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    function touchBBox (event) {
        if (!(event.touches && event.touches.length) && !(pointerMoves.length)) {
            return;
        }

        var touches = getTouchPair(event),
            minX = Math.min(touches[0].pageX, touches[1].pageX),
            minY = Math.min(touches[0].pageY, touches[1].pageY),
            maxX = Math.max(touches[0].pageX, touches[1].pageX),
            maxY = Math.max(touches[0].pageY, touches[1].pageY);

        return {
            x: minX,
            y: minY,
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    function touchDistance (event) {
        var deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event);


        var dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY];

        return hypot(dx, dy);
    }

    function touchAngle (event, prevAngle) {
        var deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event),
            dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY],
            angle = 180 * Math.atan(dy / dx) / Math.PI;

        if (isNumber(prevAngle)) {
            var dr = angle - prevAngle,
                drClamped = dr % 360;

            if (drClamped > 315) {
                angle -= 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped > 135) {
                angle -= 180 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -315) {
                angle += 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -135) {
                angle += 180 + (angle / 360)|0 * 360;
            }
        }

        return  angle;
    }

    function getOriginXY (interactable, element) {
        interactable = interactable || target;

        var origin = interactable
                ? interactable.options.origin
                : defaultOptions.origin;

        element = element || interactable._element;

        if (origin === 'parent') {
            origin = element.parentNode;
        }
        else if (origin === 'self') {
            origin = element;
        }

        if (isElement(origin))  {
            origin = getElementRect(origin);

            origin.x = origin.left;
            origin.y = origin.top;
        }
        else if (isFunction(origin)) {
            origin = origin(interactable && element);
        }

        return origin;
    }

    function calcInertia (status) {
        var inertiaOptions = status.target.options.inertia,
            lambda = inertiaOptions.resistance,
            inertiaDur = -Math.log(inertiaOptions.endSpeed / status.v0) / lambda;

        status.x0 = prevEvent.pageX;
        status.y0 = prevEvent.pageY;
        status.t0 = status.startEvent.timeStamp / 1000;
        status.sx = status.sy = 0;

        status.modifiedXe = status.xe = (status.vx0 - inertiaDur) / lambda;
        status.modifiedYe = status.ye = (status.vy0 - inertiaDur) / lambda;
        status.te = inertiaDur;

        status.lambda_v0 = lambda / status.v0;
        status.one_ve_v0 = 1 - inertiaOptions.endSpeed / status.v0;
    }

    function inertiaFrame () {
        var options = inertiaStatus.target.options.inertia,
            lambda = options.resistance,
            t = new Date().getTime() / 1000 - inertiaStatus.t0;

        if (t < inertiaStatus.te) {

            var progress =  1 - (Math.exp(-lambda * t) - inertiaStatus.lambda_v0) / inertiaStatus.one_ve_v0;

            if (inertiaStatus.modifiedXe === inertiaStatus.xe && inertiaStatus.modifiedYe === inertiaStatus.ye) {
                inertiaStatus.sx = inertiaStatus.xe * progress;
                inertiaStatus.sy = inertiaStatus.ye * progress;
            }
            else {
                var quadPoint = getQuadraticCurvePoint(
                        0, 0,
                        inertiaStatus.xe, inertiaStatus.ye,
                        inertiaStatus.modifiedXe, inertiaStatus.modifiedYe,
                        progress);

                inertiaStatus.sx = quadPoint.x;
                inertiaStatus.sy = quadPoint.y;
            }

            pointerMove(inertiaStatus.startEvent);

            inertiaStatus.i = reqFrame(inertiaFrame);
        }
        else {
            inertiaStatus.sx = inertiaStatus.modifiedXe;
            inertiaStatus.sy = inertiaStatus.modifiedYe;

            pointerMove(inertiaStatus.startEvent);

            inertiaStatus.active = false;
            pointerUp(inertiaStatus.startEvent);
        }
    }

    function smoothEndFrame () {
        var t = new Date().getTime() - inertiaStatus.t0,
            duration = inertiaStatus.target.options.inertia.smoothEndDuration;

        if (t < duration) {
            inertiaStatus.sx = easeOutQuad(t, 0, inertiaStatus.xe, duration);
            inertiaStatus.sy = easeOutQuad(t, 0, inertiaStatus.ye, duration);

            pointerMove(inertiaStatus.startEvent);

            inertiaStatus.i = reqFrame(smoothEndFrame);
        }
        else {
            inertiaStatus.active = false;
            inertiaStatus.smoothEnd = false;

            pointerMove(inertiaStatus.startEvent);
            pointerUp(inertiaStatus.startEvent);
        }
    }

    function _getQBezierValue(t, p1, p2, p3) {
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    }

    function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
        return {
            x:  _getQBezierValue(position, startX, cpX, endX),
            y:  _getQBezierValue(position, startY, cpY, endY)
        };
    }

    // http://gizma.com/easing/
    function easeOutQuad (t, b, c, d) {
        t /= d;
        return -c * t*(t-2) + b;
    }

    function nodeContains (parent, child) {
        while ((child = child.parentNode)) {

            if (child === parent) {
                return true;
            }
        }

        return false;
    }

    function inContext (interactable, element) {
        return interactable._context === document
                || nodeContains(interactable._context, element);
    }

    function testIgnore (interactable, element) {
        var ignoreFrom = interactable.options.ignoreFrom;

        if (!ignoreFrom
            // limit test to the interactable's element and its children
            || !isElement(element) || element === interactable._element.parentNode) {
            return false;
        }

        if (isString(ignoreFrom)) {
            return matchesSelector(element, ignoreFrom) || testIgnore(interactable, element.parentNode);
        }
        else if (isElement(ignoreFrom)) {
            return element === ignoreFrom || nodeContains(ignoreFrom, element);
        }

        return false;
    }

    function testAllow (interactable, element) {
        var allowFrom = interactable.options.allowFrom;

        if (!allowFrom) { return true; }

        // limit test to the interactable's element and its children
        if (!isElement(element) || element === interactable._element.parentNode) {
            return false;
        }

        if (isString(allowFrom)) {
            return matchesSelector(element, allowFrom) || testAllow(interactable, element.parentNode);
        }
        else if (isElement(allowFrom)) {
            return element === allowFrom || nodeContains(allowFrom, element);
        }

        return false;
    }

    function checkAndPreventDefault (event, interactable) {
        if (!interactable) { return; }

        var options = interactable.options,
            prevent = options.preventDefault;

        if (prevent === 'auto' && !/^input$|^textarea$/i.test(target._element.nodeName)) {
            // do not preventDefault on pointerdown if the prepared action is a drag
            // and dragging can only start from a certain direction - this allows
            // a touch to pan the viewport if a drag isn't in the right direction
            if (/down|start/i.test(event.type)
                && prepared === 'drag' && options.dragAxis !== 'xy') {

                return;
            }

            event.preventDefault();
            return;
        }

        if (prevent === true) {
            event.preventDefault();
            return;
        }
    }

    function checkAxis (axis, interactable) {
        if (!interactable) { return false; }

        var thisAxis = interactable.options.dragAxis;

        return (axis === 'xy' || thisAxis === 'xy' || thisAxis === axis);
    }

    function checkSnap (interactable, action) {
        var options = interactable.options;

        action = action || prepared;

        if (/^resize/.test(action)) {
            action = 'resize';
        }

        return (options.snapEnabled && contains(options.snap.actions, action));
    }

    function checkRestrict (interactable, action) {
        var options = interactable.options;

        action = action || prepared;

        if (/^resize/.test(action)) {
            action = 'resize';
        }

        return options.restrictEnabled && options.restrict[action];
    }

    function collectDrops (element) {
        var drops = [],
            elements = [],
            i;

        element = element || target._element;

        // collect all dropzones and their elements which qualify for a drop
        for (i = 0; i < dropzones.length; i++) {
            var current = dropzones[i];

            // test the draggable element against the dropzone's accept setting
            if ((isElement(current.options.accept) && current.options.accept !== element)
                || (isString(current.options.accept)
                    && !matchesSelector(element, current.options.accept))) {

                continue;
            }

            // query for new elements if necessary
            if (current.selector) {
                current._dropElements = current._context.querySelectorAll(current.selector);
            }

            for (var j = 0, len = current._dropElements.length; j < len; j++) {
                var currentElement = current._dropElements[j];

                if (currentElement === element) {
                    continue;
                }

                drops.push(current);
                elements.push(currentElement);
            }
        }

        return {
            dropzones: drops,
            elements: elements
        };
    }

    function fireActiveDrops(event) {
        var i,
            current,
            currentElement,
            prevElement;

        // loop through all active dropzones and trigger event
        for (i = 0; i < activeDrops.dropzones.length; i++) {
            current = activeDrops.dropzones[i];
            currentElement = activeDrops.elements [i];

            // prevent trigger of duplicate events on same element
            if (currentElement !== prevElement) {
                // set current element as event target
                event.target = currentElement;
                current.fire(event);
            }
            prevElement = currentElement;
        }
    }

    // Test for the element that's "above" all other qualifiers
    function indexOfDeepestElement (elements) {
        var dropzone,
            deepestZone = elements[0],
            index = deepestZone? 0: -1,
            parent,
            deepestZoneParents = [],
            dropzoneParents = [],
            child,
            i,
            n;

        for (i = 1; i < elements.length; i++) {
            dropzone = elements[i];

            // an element might belong to multiple selector dropzones
            if (!dropzone || dropzone === deepestZone) {
                continue;
            }

            if (!deepestZone) {
                deepestZone = dropzone;
                index = i;
                continue;
            }

            // check if the deepest or current are document.documentElement or document.rootElement
            // - if the current dropzone is, do nothing and continue
            if (dropzone.parentNode === document) {
                continue;
            }
            // - if deepest is, update with the current dropzone and continue to next
            else if (deepestZone.parentNode === document) {
                deepestZone = dropzone;
                index = i;
                continue;
            }

            if (!deepestZoneParents.length) {
                parent = deepestZone;
                while (parent.parentNode && parent.parentNode !== document) {
                    deepestZoneParents.unshift(parent);
                    parent = parent.parentNode;
                }
            }

            // if this element is an svg element and the current deepest is
            // an HTMLElement
            if (deepestZone instanceof HTMLElement
                && dropzone instanceof SVGElement
                && !(dropzone instanceof SVGSVGElement)) {

                if (dropzone === deepestZone.parentNode) {
                    continue;
                }

                parent = dropzone.ownerSVGElement;
            }
            else {
                parent = dropzone;
            }

            dropzoneParents = [];

            while (parent.parentNode !== document) {
                dropzoneParents.unshift(parent);
                parent = parent.parentNode;
            }

            n = 0;

            // get (position of last common ancestor) + 1
            while (dropzoneParents[n] && dropzoneParents[n] === deepestZoneParents[n]) {
                n++;
            }

            var parents = [
                dropzoneParents[n - 1],
                dropzoneParents[n],
                deepestZoneParents[n]
            ];

            child = parents[0].lastChild;

            while (child) {
                if (child === parents[1]) {
                    deepestZone = dropzone;
                    index = i;
                    deepestZoneParents = [];

                    break;
                }
                else if (child === parents[2]) {
                    break;
                }

                child = child.previousSibling;
            }
        }

        return index;
    }

    // Collect a new set of possible drops and save them in activeDrops.
    // setActiveDrops should always be called when a drag has just started or a
    // drag event happens while dynamicDrop is true
    function setActiveDrops (dragElement) {
        // get dropzones and their elements that could recieve the draggable
        var possibleDrops = collectDrops(dragElement, true);

        activeDrops.dropzones = possibleDrops.dropzones;
        activeDrops.elements  = possibleDrops.elements;
        activeDrops.rects     = [];

        for (var i = 0; i < activeDrops.dropzones.length; i++) {
            activeDrops.rects[i] = activeDrops.dropzones[i].getRect(activeDrops.elements[i]);
        }
    }

    function getDrop (event, dragElement) {
        var validDrops = [];

        if (dynamicDrop) {
            setActiveDrops(dragElement);
        }

        // collect all dropzones and their elements which qualify for a drop
        for (var j = 0; j < activeDrops.dropzones.length; j++) {
            var current        = activeDrops.dropzones[j],
                currentElement = activeDrops.elements [j],
                rect           = activeDrops.rects    [j];

            validDrops.push(current.dropCheck(event, target, dragElement, rect)
                            ? currentElement
                            : null);
        }

        // get the most apprpriate dropzone based on DOM depth and order
        var dropIndex = indexOfDeepestElement(validDrops),
            dropzone  = activeDrops.dropzones[dropIndex] || null,
            element   = activeDrops.elements [dropIndex] || null;

        if (dropzone && dropzone.selector) {
            dropzone._element = element;
        }

        return {
            dropzone: dropzone,
            element: element
        };
    }

    function getDropEvents (pointerEvent, dragEvent, starting) {
        var dragLeaveEvent = null,
            dragEnterEvent = null,
            dropActivateEvent = null,
            dropDectivateEvent = null,
            dropMoveEvent = null,
            dropEvent = null;

        if (dropElement !== prevDropElement) {
            // if there was a prevDropTarget, create a dragleave event
            if (prevDropTarget) {
                dragLeaveEvent = new InteractEvent(pointerEvent, 'drag', 'leave', prevDropElement, dragEvent.target);
                dragEvent.dragLeave = prevDropElement;
            }
            // if the dropTarget is not null, create a dragenter event
            if (dropTarget) {
                dragEnterEvent = new InteractEvent(pointerEvent, 'drag', 'enter', dropElement, dragEvent.target);
                dragEvent.dragEnter = dropElement;
            }
        }

        if (dragEvent.type === 'dragend' && dropTarget) {
            dropEvent = new InteractEvent(pointerEvent, 'drop', null, dropElement, dragEvent.target);
        }
        if (dragEvent.type === 'dragstart') {
            dropActivateEvent = new InteractEvent(pointerEvent, 'drop', 'activate', null, dragEvent.target);
        }
        if (dragEvent.type === 'dragend') {
            dropDectivateEvent = new InteractEvent(pointerEvent, 'drop', 'deactivate', null, dragEvent.target);
        }
        if (dragEvent.type === 'dragmove' && dropTarget) {
            dropMoveEvent = {
                target       : dropElement,
                relatedTarget: dragEvent.target,
                dragmove     : dragEvent,
                type         : 'dropmove',
                timeStamp    : dragEvent.timeStamp
            };
        }

        return {
            enter       : dragEnterEvent,
            leave       : dragLeaveEvent,
            activate    : dropActivateEvent,
            deactivate  : dropDectivateEvent,
            move        : dropMoveEvent,
            drop        : dropEvent
        };
    }

    function InteractEvent (event, action, phase, element, related) {
        var client,
            page,
            deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX     = deltaSource + 'X',
            sourceY     = deltaSource + 'Y',
            options     = target? target.options: defaultOptions,
            origin      = getOriginXY(target, element),
            starting    = phase === 'start',
            ending      = phase === 'end';

        element = element || target._element;

        if (action === 'gesture') {
            var average = touchAverage(pointerMoves);

            page   = { x: (average.pageX   - origin.x), y: (average.pageY   - origin.y) };
            client = { x: (average.clientX - origin.x), y: (average.clientY - origin.y) };
        }
        else {

            page   = getPageXY(event);
            client = getClientXY(event);

            page.x -= origin.x;
            page.y -= origin.y;

            client.x -= origin.x;
            client.y -= origin.y;

            if (checkSnap(target) && !(starting && options.snap.elementOrigin)) {

                this.snap = {
                    range  : snapStatus.range,
                    locked : snapStatus.locked,
                    x      : snapStatus.snappedX,
                    y      : snapStatus.snappedY,
                    realX  : snapStatus.realX,
                    realY  : snapStatus.realY,
                    dx     : snapStatus.dx,
                    dy     : snapStatus.dy
                };

                if (snapStatus.locked) {
                    page.x += snapStatus.dx;
                    page.y += snapStatus.dy;
                    client.x += snapStatus.dx;
                    client.y += snapStatus.dy;
                }
            }
        }

        if (checkRestrict(target) && !(starting && options.restrict.elementRect) && restrictStatus.restricted) {
            page.x += restrictStatus.dx;
            page.y += restrictStatus.dy;
            client.x += restrictStatus.dx;
            client.y += restrictStatus.dy;

            this.restrict = {
                dx: restrictStatus.dx,
                dy: restrictStatus.dy
            };
        }

        this.pageX     = page.x;
        this.pageY     = page.y;
        this.clientX   = client.x;
        this.clientY   = client.y;

        this.x0        = startCoords.pageX;
        this.y0        = startCoords.pageY;
        this.clientX0  = startCoords.clientX;
        this.clientY0  = startCoords.clientY;
        this.ctrlKey   = event.ctrlKey;
        this.altKey    = event.altKey;
        this.shiftKey  = event.shiftKey;
        this.metaKey   = event.metaKey;
        this.button    = event.button;
        this.target    = element;
        this.t0        = downTime;
        this.type      = action + (phase || '');

        this.interactable = target;

        if (inertiaStatus.active) {
            this.detail = 'inertia';
        }

        if (related) {
            this.relatedTarget = related;
        }

        // end event dx, dy is difference between start and end points
        if (ending || action === 'drop') {
            if (deltaSource === 'client') {
                this.dx = client.x - startCoords.clientX;
                this.dy = client.y - startCoords.clientY;
            }
            else {
                this.dx = page.x - startCoords.pageX;
                this.dy = page.y - startCoords.pageY;
            }
        }
        // copy properties from previousmove if starting inertia
        else if (phase === 'inertiastart') {
            this.dx = prevEvent.dx;
            this.dy = prevEvent.dy;
        }
        else {
            if (deltaSource === 'client') {
                this.dx = client.x - prevEvent.clientX;
                this.dy = client.y - prevEvent.clientY;
            }
            else {
                this.dx = page.x - prevEvent.pageX;
                this.dy = page.y - prevEvent.pageY;
            }
        }
        if (prevEvent && prevEvent.detail === 'inertia'
            && !inertiaStatus.active && options.inertia.zeroResumeDelta) {

            inertiaStatus.resumeDx += this.dx;
            inertiaStatus.resumeDy += this.dy;

            this.dx = this.dy = 0;
        }

        if (action === 'resize') {
            if (options.squareResize || event.shiftKey) {
                if (resizeAxes === 'y') {
                    this.dx = this.dy;
                }
                else {
                    this.dy = this.dx;
                }
                this.axes = 'xy';
            }
            else {
                this.axes = resizeAxes;

                if (resizeAxes === 'x') {
                    this.dy = 0;
                }
                else if (resizeAxes === 'y') {
                    this.dx = 0;
                }
            }
        }
        else if (action === 'gesture') {
            this.touches = (PointerEvent
                            ? [pointerMoves[0], pointerMoves[1]]
                            : event.touches);

            if (starting) {
                this.distance = touchDistance(pointerMoves);
                this.box      = touchBBox(pointerMoves);
                this.scale    = 1;
                this.ds       = 0;
                this.angle    = touchAngle(pointerMoves);
                this.da       = 0;
            }
            else if (ending || event instanceof InteractEvent) {
                this.distance = prevEvent.distance;
                this.box      = prevEvent.box;
                this.scale    = prevEvent.scale;
                this.ds       = this.scale - 1;
                this.angle    = prevEvent.angle;
                this.da       = this.angle - gesture.startAngle;
            }
            else {
                this.distance = touchDistance(pointerMoves);
                this.box      = touchBBox(pointerMoves);
                this.scale    = this.distance / gesture.startDistance;
                this.angle    = touchAngle(pointerMoves, gesture.prevAngle);

                this.ds = this.scale - gesture.prevScale;
                this.da = this.angle - gesture.prevAngle;
            }
        }

        if (starting) {
            this.timeStamp = downTime;
            this.dt        = 0;
            this.duration  = 0;
            this.speed     = 0;
            this.velocityX = 0;
            this.velocityY = 0;
        }
        else if (phase === 'inertiastart') {
            this.timeStamp = new Date().getTime();
            this.dt        = prevEvent.dt;
            this.duration  = prevEvent.duration;
            this.speed     = prevEvent.speed;
            this.velocityX = prevEvent.velocityX;
            this.velocityY = prevEvent.velocityY;
        }
        else {
            this.timeStamp = new Date().getTime();
            this.dt        = this.timeStamp - prevEvent.timeStamp;
            this.duration  = this.timeStamp - downTime;

            var dx, dy, dt;

            // Use natural event coordinates (without snapping/restricions)
            // subtract modifications from previous event if event given is
            // not a native event
            if (ending || event instanceof InteractEvent) {
                // change in time in seconds
                // use event sequence duration for end events
                // => average speed of the event sequence
                // (minimum dt of 1ms)
                dt = Math.max((ending? this.duration: this.dt) / 1000, 0.001);
                dx = this[sourceX] - prevEvent[sourceX];
                dy = this[sourceY] - prevEvent[sourceY];

                if (this.snap && this.snap.locked) {
                    dx -= this.snap.dx;
                    dy -= this.snap.dy;
                }

                if (this.restrict) {
                    dx -= this.restrict.dx;
                    dy -= this.restrict.dy;
                }

                if (prevEvent.snap && prevEvent.snap.locked) {
                    dx -= (prevEvent[sourceX] - prevEvent.snap.dx);
                    dy -= (prevEvent[sourceY] - prevEvent.snap.dy);
                }

                if (prevEvent.restrict) {
                    dx += prevEvent.restrict.dx;
                    dy += prevEvent.restrict.dy;
                }

                // speed and velocity in pixels per second
                this.speed = hypot(dx, dy) / dt;
                this.velocityX = dx / dt;
                this.velocityY = dy / dt;
            }
            // if normal move event, use previous user event coords
            else {
                this.speed = pointerDelta[deltaSource + 'Speed'];
                this.velocityX = pointerDelta[deltaSource + 'VX'];
                this.velocityY = pointerDelta[deltaSource + 'VY'];
            }
        }

        if ((ending || phase === 'inertiastart')
            && prevEvent.speed > 600 && this.timeStamp - prevEvent.timeStamp < 150) {

            var angle = 180 * Math.atan2(prevEvent.velocityY, prevEvent.velocityX) / Math.PI,
                overlap = 22.5;

            if (angle < 0) {
                angle += 360;
            }

            var left = 135 - overlap <= angle && angle < 225 + overlap,
                up   = 225 - overlap <= angle && angle < 315 + overlap,

                right = !left && (315 - overlap <= angle || angle <  45 + overlap),
                down  = !up   &&   45 - overlap <= angle && angle < 135 + overlap;

            this.swipe = {
                up   : up,
                down : down,
                left : left,
                right: right,
                angle: angle,
                speed: prevEvent.speed,
                velocity: {
                    x: prevEvent.velocityX,
                    y: prevEvent.velocityY
                }
            };
        }
    }

    InteractEvent.prototype = {
        preventDefault: blank,
        stopImmediatePropagation: function () {
            this.immediatePropagationStopped = this.propagationStopped = true;
        },
        stopPropagation: function () {
            this.propagationStopped = true;
        }
    };

    function preventOriginalDefault () {
        this.originalEvent.preventDefault();
    }

    function fireTaps (event, targets, elements) {
        var tap = {},
            i;

        extend(tap, event);

        tap.preventDefault           = preventOriginalDefault;
        tap.stopPropagation          = InteractEvent.prototype.stopPropagation;
        tap.stopImmediatePropagation = InteractEvent.prototype.stopImmediatePropagation;

        tap.timeStamp     = new Date().getTime();
        tap.originalEvent = event;
        tap.dt            = tap.timeStamp - downTime;
        tap.type          = 'tap';

        var interval = tap.timeStamp - tapTime,
            dbl = (prevTap && prevTap.type !== 'doubletap'
                   && prevTap.target === tap.target
                   && interval < 500);

        tapTime = tap.timeStamp;

        for (i = 0; i < targets.length; i++) {
            var origin = getOriginXY(targets[i], elements[i]);

            tap.pageX -= origin.x;
            tap.pageY -= origin.y;
            tap.clientX -= origin.x;
            tap.clientY -= origin.y;

            tap.currentTarget = elements[i];
            targets[i].fire(tap);

            if (tap.immediatePropagationStopped
                ||(tap.propagationStopped && targets[i + 1] !== tap.currentTarget)) {
                break;
            }
        }

        if (dbl) {
            var doubleTap = {};

            extend(doubleTap, tap);

            doubleTap.dt   = interval;
            doubleTap.type = 'doubletap';

            for (i = 0; i < targets.length; i++) {
                doubleTap.currentTarget = elements[i];
                targets[i].fire(doubleTap);

                if (doubleTap.immediatePropagationStopped
                    ||(doubleTap.propagationStopped && targets[i + 1] !== doubleTap.currentTarget)) {
                    break;
                }
            }

            prevTap = doubleTap;
        }
        else {
            prevTap = tap;
        }
    }

    function collectTaps (event) {
        if(downEvent) {
            if (pointerWasMoved
                || !(event instanceof downEvent.constructor)
                || downEvent.target !== event.target) {
                return;
            }
        }

        var tapTargets = [],
            tapElements = [];

        var eventTarget = (event.target instanceof SVGElementInstance
                ? event.target.correspondingUseElement
                : event.target),
            element = eventTarget;

        function collectSelectorTaps (interactable, selector, context) {
            var elements = ie8MatchesSelector
                    ? context.querySelectorAll(selector)
                    : undefined;

            if (element !== document
                && inContext(interactable, element)
                && !testIgnore(interactable, eventTarget)
                && testAllow(interactable, eventTarget)
                && matchesSelector(element, selector, elements)) {

                tapTargets.push(interactable);
                tapElements.push(element);
            }
        }

        while (element) {
            if (interact.isSet(element)) {
                tapTargets.push(interact(element));
                tapElements.push(element);
            }

            interactables.forEachSelector(collectSelectorTaps);

            element = element.parentNode;
        }

        if (tapTargets.length) {
            fireTaps(event, tapTargets, tapElements);
        }
    }

    function defaultActionChecker (event) {
        var rect = this.getRect(),
            right,
            bottom,
            action = null,
            page = getPageXY(event),
            options = this.options;

        if (!rect) { return null; }

        if (actionIsEnabled.resize && options.resizable) {
            right  = options.resizeAxis !== 'y' && page.x > (rect.right  - margin);
            bottom = options.resizeAxis !== 'x' && page.y > (rect.bottom - margin);
        }

        resizeAxes = (right?'x': '') + (bottom?'y': '');

        action = (resizeAxes)?
            'resize' + resizeAxes:
            actionIsEnabled.drag && options.draggable?
                'drag':
                null;

        if (actionIsEnabled.gesture
            && pointerIds.length >=2
            && !(dragging || resizing)) {
            action = 'gesture';
        }

        return action;
    }

    // Check if action is enabled globally and the current target supports it
    // If so, return the validated action. Otherwise, return null
    function validateAction (action, interactable) {
        if (!isString(action)) { return null; }

        interactable = interactable || target;

        var actionType = action.search('resize') !== -1? 'resize': action,
            options = (interactable || target).options;

        if ((  (actionType  === 'resize'   && options.resizable )
            || (action      === 'drag'     && options.draggable  )
            || (action      === 'gesture'  && options.gesturable))
            && actionIsEnabled[actionType]) {

            if (action === 'resize' || action === 'resizeyx') {
                action = 'resizexy';
            }

            return action;
        }
        return null;
    }

    function selectorDown (event) {
        if (prepared && downEvent && event.type !== downEvent.type) {
            checkAndPreventDefault(event, target);
            return;
        }

        // try to ignore browser simulated mouse after touch
        if (downEvent
            && event.type === 'mousedown' && downEvent.type === 'touchstart'
            && event.timeStamp - downEvent.timeStamp < 300) {
            return;
        }

        pointerIsDown = true;

        var eventTarget = (event.target instanceof SVGElementInstance
            ? event.target.correspondingUseElement
            : event.target),
            element = eventTarget,
            action;

        addPointer(event);

        // Check if the down event hits the current inertia target
        if (inertiaStatus.active && target.selector) {
            // climb up the DOM tree from the event target
            while (element && element !== document) {

                // if this element is the current inertia target element
                if (element === inertiaStatus.targetElement
                    // and the prospective action is the same as the ongoing one
                    && validateAction(target.getAction(event)) === prepared) {

                    // stop inertia so that the next move will be a normal one
                    cancelFrame(inertiaStatus.i);
                    inertiaStatus.active = false;

                    // add the pointer to the gesture object
                    addPointer(event, selectorGesture);

                    return;
                }
                element = element.parentNode;
            }
        }

        // do nothing if interacting
        if (dragging || resizing || gesturing) {
            return;
        }

        function pushMatches (interactable, selector, context) {
            var elements = ie8MatchesSelector
                ? context.querySelectorAll(selector)
                : undefined;

            if (inContext(interactable, element)
                && !testIgnore(interactable, eventTarget)
                && testAllow(interactable, eventTarget)
                && matchesSelector(element, selector, elements)) {

                interactable._element = element;
                matches.push(interactable);
            }
        }

        if (matches.length && /mousedown|pointerdown/i.test(event.type)) {
            action = validateSelector(event, matches);
        }
        else {
            while (element && element !== document && !action) {
                matches = [];

                interactables.forEachSelector(pushMatches);

                action = validateSelector(event, matches);
                element = element.parentNode;
            }
        }

        if (action) {
            prepared = action;

            return pointerDown(event, action);
        }
        else {
            // do these now since pointerDown isn't being called from here
            downTime = new Date().getTime();
            downEvent = cloneEvent(event);

            setEventXY(prevCoords, event);
            pointerWasMoved = false;
        }
    }

    // Determine action to be performed on next pointerMove and add appropriate
    // style and event Liseners
    function pointerDown (event, forceAction) {
        if (!forceAction && pointerIsDown && downEvent && event.type !== downEvent.type) {
            checkAndPreventDefault(event, target);

            return;
        }

        pointerIsDown = true;

        addPointer(event);

        // If it is the second touch of a multi-touch gesture, keep the target
        // the same if a target was set by the first touch
        // Otherwise, set the target if there is no action prepared
        if ((((event.touches && event.touches.length < 2) || (pointerIds && pointerIds.length < 2)) && !target)
            || !prepared) {

            var interactable = interactables.get(event.currentTarget);

            if (!testIgnore(interactable, event.target)
                && testAllow(interactable, event.target)) {
                target = interactable;
            }
        }

        var options = target && target.options;

        if (target && !(dragging || resizing || gesturing)) {
            var action = validateAction(forceAction || target.getAction(event));

            setEventXY(startCoords, event);

            if (PointerEvent && event instanceof PointerEvent) {
                // Dom modification seems to reset the gesture target
                if (!target._gesture.target) {
                    target._gesture.target = target._element;
                }

                addPointer(event, target._gesture);
            }

            if (!action) {
                return event;
            }

            if (options.styleCursor) {
                document.documentElement.style.cursor = actions[action].cursor;
            }

            resizeAxes = action === 'resizexy'?
                    'xy':
                    action === 'resizex'?
                        'x':
                        action === 'resizey'?
                            'y':
                            '';

            if (action === 'gesture'
                && ((event.touches && event.touches.length < 2)
                    || PointerEvent && pointerIds.length < 2)) {
                        action = null;
            }

            prepared = action;

            snapStatus.snappedX = snapStatus.snappedY =
                restrictStatus.restrictedX = restrictStatus.restrictedY = NaN;

            downTime = new Date().getTime();
            downEvent = cloneEvent(event);

            setEventXY(prevCoords, event);
            pointerWasMoved = false;

            checkAndPreventDefault(event, target);
        }
        // if inertia is active try to resume action
        else if (inertiaStatus.active
            && event.currentTarget === inertiaStatus.targetElement
            && target === inertiaStatus.target
            && validateAction(target.getAction(event)) === prepared) {

            cancelFrame(inertiaStatus.i);
            inertiaStatus.active = false;

            if (PointerEvent) {
                if (!target._gesture.target) {
                    target._gesture.target = target._element;
                }
                // add the pointer to the gesture object
                addPointer(event, target._gesture);
            }
        }
    }

    function setSnapping (event, status) {
        var snap = target.options.snap,
            anchors = snap.anchors,
            page,
            closest,
            range,
            inRange,
            snapChanged,
            dx,
            dy,
            distance,
            i, len;

        status = status || snapStatus;

        if (status.useStatusXY) {
            page = { x: status.x, y: status.y };
        }
        else {
            var origin = getOriginXY(target);

            page = getPageXY(event);

            page.x -= origin.x;
            page.y -= origin.y;
        }

        page.x -= inertiaStatus.resumeDx;
        page.y -= inertiaStatus.resumeDy;

        status.realX = page.x;
        status.realY = page.y;

        // change to infinite range when range is negative
        if (snap.range < 0) { snap.range = Infinity; }

        // create an anchor representative for each path's returned point
        if (snap.mode === 'path') {
            anchors = [];

            for (i = 0, len = snap.paths.length; i < len; i++) {
                var path = snap.paths[i];

                if (isFunction(path)) {
                    path = path(page.x, page.y);
                }

                anchors.push({
                    x: isNumber(path.x) ? path.x : page.x,
                    y: isNumber(path.y) ? path.y : page.y,

                    range: isNumber(path.range)? path.range: snap.range
                });
            }
        }

        if ((snap.mode === 'anchor' || snap.mode === 'path') && anchors.length) {
            closest = {
                anchor: null,
                distance: 0,
                range: 0,
                dx: 0,
                dy: 0
            };

            for (i = 0, len = anchors.length; i < len; i++) {
                var anchor = anchors[i];

                range = isNumber(anchor.range)? anchor.range: snap.range;

                dx = anchor.x - page.x + snapOffset.x;
                dy = anchor.y - page.y + snapOffset.y;
                distance = hypot(dx, dy);

                inRange = distance < range;

                // Infinite anchors count as being out of range
                // compared to non infinite ones that are in range
                if (range === Infinity && closest.inRange && closest.range !== Infinity) {
                    inRange = false;
                }

                if (!closest.anchor || (inRange?
                    // is the closest anchor in range?
                    (closest.inRange && range !== Infinity)?
                        // the pointer is relatively deeper in this anchor
                        distance / range < closest.distance / closest.range:
                        //the pointer is closer to this anchor
                        distance < closest.distance:
                    // The other is not in range and the pointer is closer to this anchor
                    (!closest.inRange && distance < closest.distance))) {

                    if (range === Infinity) {
                        inRange = true;
                    }

                    closest.anchor = anchor;
                    closest.distance = distance;
                    closest.range = range;
                    closest.inRange = inRange;
                    closest.dx = dx;
                    closest.dy = dy;

                    status.range = range;
                }
            }

            inRange = closest.inRange;
            snapChanged = (closest.anchor.x !== status.x || closest.anchor.y !== status.y);

            status.snappedX = closest.anchor.x;
            status.snappedY = closest.anchor.y;
            status.dx = closest.dx;
            status.dy = closest.dy;
        }
        else if (snap.mode === 'grid') {
            var gridx = Math.round((page.x - snap.gridOffset.x - snapOffset.x) / snap.grid.x),
                gridy = Math.round((page.y - snap.gridOffset.y - snapOffset.y) / snap.grid.y),

                newX = gridx * snap.grid.x + snap.gridOffset.x + snapOffset.x,
                newY = gridy * snap.grid.y + snap.gridOffset.y + snapOffset.y;

            dx = newX - page.x;
            dy = newY - page.y;

            distance = hypot(dx, dy);

            inRange = distance < snap.range;
            snapChanged = (newX !== status.snappedX || newY !== status.snappedY);

            status.snappedX = newX;
            status.snappedY = newY;
            status.dx = dx;
            status.dy = dy;

            status.range = snap.range;
        }

        status.changed = (snapChanged || (inRange && !status.locked));
        status.locked = inRange;

        return status;
    }

    function setRestriction (event, status) {
        var restrict = target && target.options.restrict,
            restriction = restrict && restrict[prepared],
            page;

        if (!restriction) {
            return status;
        }

        status = status || restrictStatus;

        page = status.useStatusXY
                ? page = { x: status.x, y: status.y }
                : page = getPageXY(event);

        if (status.snap && status.snap.locked) {
            page.x += status.snap.dx || 0;
            page.y += status.snap.dy || 0;
        }

        page.x -= inertiaStatus.resumeDx;
        page.y -= inertiaStatus.resumeDy;

        status.dx = 0;
        status.dy = 0;
        status.restricted = false;

        var rect;

        if (restriction === 'parent') {
            restriction = target._element.parentNode;
        }
        else if (restriction === 'self') {
            restriction = target._element;
        }

        if (isElement(restriction)) {
            rect = getElementRect(restriction);
        }
        else {
            if (isFunction(restriction)) {
                restriction = restriction(page.x, page.y, target._element);
            }

            rect = restriction;

            // object is assumed to have
            // x, y, width, height or
            // left, top, right, bottom
            if ('x' in restriction && 'y' in restriction) {
                rect = {
                    left  : restriction.x,
                    top   : restriction.y,
                    right : restriction.x + restriction.width,
                    bottom: restriction.y + restriction.height
                };
            }
        }

        var restrictedX = Math.max(Math.min(rect.right  - restrictOffset.right , page.x), rect.left + restrictOffset.left),
            restrictedY = Math.max(Math.min(rect.bottom - restrictOffset.bottom, page.y), rect.top  + restrictOffset.top );

        status.dx = restrictedX - page.x;
        status.dy = restrictedY - page.y;

        status.changed = status.restrictedX !== restrictedX || status.restrictedY !== restrictedY;
        status.restricted = !!(status.dx || status.dy);

        status.restrictedX = restrictedX;
        status.restrictedY = restrictedY;

        return status;
    }

    function pointerMove (event, preEnd) {
        if (!pointerIsDown) { return; }

        if (!(event instanceof InteractEvent)) {
            setEventXY(curCoords, event);
        }

        var dx, dy;

        // register movement of more than 1 pixel
        if (!pointerWasMoved) {
            dx = curCoords.clientX - startCoords.clientX;
            dy = curCoords.clientY - startCoords.clientY;

            pointerWasMoved = hypot(dx, dy) > defaultOptions.pointerMoveTolerance;
        }

        // return if there is no prepared action
        if (!prepared
            // or this is a mousemove event but the down event was a touch
            || (event.type === 'mousemove' && downEvent.type === 'touchstart')) {

            return;
        }

        if (pointerWasMoved
            // ignore movement while inertia is active
            && (!inertiaStatus.active || (event instanceof InteractEvent && /inertiastart/.test(event.type)))) {

            // if just starting an action, calculate the pointer speed now
            if (!(dragging || resizing || gesturing)) {
                setEventDeltas(pointerDelta, prevCoords, curCoords);

                // check if a drag is in the correct axis
                if (prepared === 'drag') {
                    var absX = Math.abs(dx),
                        absY = Math.abs(dy),
                        targetAxis = target.options.dragAxis,
                        axis = (absX > absY ? 'x' : absX < absY ? 'y' : 'xy');

                    // if the movement isn't in the axis of the interactable
                    if (axis !== 'xy' && targetAxis !== 'xy' && targetAxis !== axis) {
                        // cancel the prepared action
                        prepared = null;

                        // then try to get a drag from another ineractable

                        var eventTarget = (event.target instanceof SVGElementInstance
                                ? event.target.correspondingUseElement
                                : event.target),
                            element = eventTarget;

                        // check element interactables
                        while (element && element !== document) {
                            var elementInteractable = interactables.get(element);

                            if (elementInteractable
                                && elementInteractable !== target
                                && elementInteractable.getAction(downEvent) === 'drag'
                                && checkAxis(axis, elementInteractable)) {
                                prepared = 'drag';
                                target = elementInteractable;
                                break;
                            }

                            element = element.parentNode;
                        }

                        // if there's no drag from element interactables,
                        // check the selector interactables
                        if (!prepared) {
                            var getDraggable = function (interactable, selector, context) {
                                var elements = ie8MatchesSelector
                                    ? context.querySelectorAll(selector)
                                    : undefined;

                                if (interactable === target) { return; }

                                interactable._element = element;

                                if (inContext(interactable, eventTarget)
                                    && !testIgnore(interactable, eventTarget)
                                    && testAllow(interactable, eventTarget)
                                    && matchesSelector(element, selector, elements)
                                    && interactable.getAction(downEvent) === 'drag'
                                    && checkAxis(axis, interactable)) {

                                    return interactable;
                                }
                            };

                            element = eventTarget;

                            while (element && element !== document) {
                                var selectorInteractable = interactables.forEachSelector(getDraggable);

                                if (selectorInteractable) {
                                    prepared = 'drag';
                                    target = selectorInteractable;
                                    break;
                                }

                                element = element.parentNode;
                            }
                        }
                    }
                }
            }

            if (prepared && target) {
                var shouldSnap     = checkSnap(target)     && (!target.options.snap.endOnly     || preEnd),
                    shouldRestrict = checkRestrict(target) && (!target.options.restrict.endOnly || preEnd),

                    starting = !(dragging || resizing || gesturing),
                    snapEvent = starting? downEvent: event;

                if (starting) {
                    prevEvent = downEvent;

                    var rect = target.getRect(),
                        snap = target.options.snap,
                        restrict = target.options.restrict;

                    if (rect) {
                        startOffset.left = startCoords.pageX - rect.left;
                        startOffset.top  = startCoords.pageY - rect.top;

                        startOffset.right  = rect.right  - startCoords.pageX;
                        startOffset.bottom = rect.bottom - startCoords.pageY;
                    }
                    else {
                        startOffset.left = startOffset.top = startOffset.right = startOffset.bottom = 0;
                    }

                    if (rect && snap.elementOrigin) {
                        snapOffset.x = startOffset.left - (rect.width  * snap.elementOrigin.x);
                        snapOffset.y = startOffset.top  - (rect.height * snap.elementOrigin.y);
                    }
                    else {
                        snapOffset.x = snapOffset.y = 0;
                    }

                    if (rect && restrict.elementRect) {
                        restrictOffset.left = startOffset.left - (rect.width  * restrict.elementRect.left);
                        restrictOffset.top  = startOffset.top  - (rect.height * restrict.elementRect.top);

                        restrictOffset.right  = startOffset.right  - (rect.width  * (1 - restrict.elementRect.right));
                        restrictOffset.bottom = startOffset.bottom - (rect.height * (1 - restrict.elementRect.bottom));
                    }
                    else {
                        restrictOffset.left = restrictOffset.top = restrictOffset.right = restrictOffset.bottom = 0;
                    }
                }

                if (shouldSnap    ) { setSnapping   (snapEvent); } else { snapStatus    .locked     = false; }
                if (shouldRestrict) { setRestriction(snapEvent); } else { restrictStatus.restricted = false; }

                var shouldMove = (shouldSnap? (snapStatus.changed || !snapStatus.locked): true)
                                 && (shouldRestrict? (!restrictStatus.restricted || (restrictStatus.restricted && restrictStatus.changed)): true);

                // move if snapping or restriction doesn't prevent it
                if (shouldMove) {
                    if (starting) {
                        prevEvent = actions[prepared].start(downEvent);

                        // set snapping and restriction for the move event
                        if (shouldSnap    ) { setSnapping   (event); }
                        if (shouldRestrict) { setRestriction(event); }
                    }

                    prevEvent = actions[prepared].move(event);
                }
            }
        }

        if (!(event instanceof InteractEvent)) {
            // set pointer coordinate, time changes and speeds
            setEventDeltas(pointerDelta, prevCoords, curCoords);
            setEventXY(prevCoords, event);
        }

        if (dragging || resizing) {
            autoScroll.edgeMove(event);
        }
    }

    function addPointer (event, gesture, type) {
        type = type || event.type;

        if (/touch/.test(event.type)) {
            var touches = (/cancel|touchend/.test(type)
                           ? event.changedTouches
                           : event.touches);

            for (var i = 0; i < touches.length; i++) {
                addPointer(touches[i], gesture, type);
            }

            return;
        }

        // dont add the event if it's not the same pointer type as the previous event
        if (pointerIds.length && pointerMoves[0].pointerType !== event.pointerType) {
            return;
        }

        var id = event.pointerId || event.identifier || 0;

        if (gesture) {
            gesture.addPointer(id);
        }

        var index = indexOf(pointerIds, id);

        if (index === -1) {
            pointerIds.push(id);

            // move events are kept so that multi-touch properties can still be
            // calculated at the end of a gesture; use pointerIds index
            pointerMoves[pointerIds.length - 1] = event;
        }
        else {
            pointerMoves[index] = event;
        }
    }

    function removePointer (event) {
        var index = indexOf(pointerIds, event.pointerId || event.identifier || 0);

        if (index === -1) { return; }

        pointerIds.splice(index, 1);

        // move events are kept so that multi-touch properties can still be
        // calculated at the end of a GestureEvnt sequence
        //pointerMoves.splice(index, 1);
    }

    function recordPointers (event, type) {
        var index = indexOf(pointerIds, event.pointerId || event.identifier || 0);

        if (index === -1) { return; }

        type = type || event.type;

        if (/move/i.test(type)) {
            pointerMoves[index] = event;
        }
        else if (/up|end|cancel/i.test(type)) {
            removePointer(event);

            // End the gesture InteractEvent if there are
            // fewer than 2 active pointers
            if (gesturing && target._gesture && pointerIds.length < 2) {
                target._gesture.stop();
            }
        }
    }

    function recordTouches (event) {
        var touches = (/cancel|touchend/.test(event.type)
                       ? event.changedTouches
                       : event.touches);

        for (var i = 0; i < touches.length; i++) {
            recordPointers(touches[i], event.type);
        }

        return;
    }

    function dragStart (event) {
        var dragEvent = new InteractEvent(event, 'drag', 'start');

        dragging = true;

        target.fire(dragEvent);

        // reset active dropzones
        activeDrops.dropzones = [];
        activeDrops.elements  = [];
        activeDrops.rects     = [];

        if (!dynamicDrop) {
            setActiveDrops(target._element);
        }

        var dropEvents = getDropEvents(event, dragEvent);

        if (dropEvents.activate) {
            fireActiveDrops(dropEvents.activate);
        }

        return dragEvent;
    }

    function dragMove (event) {
        checkAndPreventDefault(event, target);

        var dragEvent  = new InteractEvent(event, 'drag', 'move'),
            draggableElement = target._element,
            drop = getDrop(dragEvent, draggableElement);

        dropTarget = drop.dropzone;
        dropElement = drop.element;

        // Make sure that the target selector draggable's element is
        // restored after dropChecks
        target._element = draggableElement;

        var dropEvents = getDropEvents(event, dragEvent);

        target.fire(dragEvent);

        if (dropEvents.leave) { prevDropTarget.fire(dropEvents.leave); }
        if (dropEvents.enter) {     dropTarget.fire(dropEvents.enter); }
        if (dropEvents.move ) {     dropTarget.fire(dropEvents.move ); }

        prevDropTarget  = dropTarget;
        prevDropElement = dropElement;

        return dragEvent;
    }

    function resizeStart (event) {
        var resizeEvent = new InteractEvent(event, 'resize', 'start');

        target.fire(resizeEvent);

        target.fire(resizeEvent);
        resizing = true;

        return resizeEvent;
    }

    function resizeMove (event) {
        checkAndPreventDefault(event, target);

        var resizeEvent;

        resizeEvent = new InteractEvent(event, 'resize', 'move');
        target.fire(resizeEvent);

        return resizeEvent;
    }

    function gestureStart (event) {
        var gestureEvent = new InteractEvent(event, 'gesture', 'start');

        gestureEvent.ds = 0;

        gesture.startDistance = gesture.prevDistance = gestureEvent.distance;
        gesture.startAngle = gesture.prevAngle = gestureEvent.angle;
        gesture.scale = 1;

        gesturing = true;

        target.fire(gestureEvent);

        return gestureEvent;
    }

    function gestureMove (event) {
        if (!pointerIds.length) {
            return prevEvent;
        }

        checkAndPreventDefault(event, target);

        var gestureEvent;

        gestureEvent = new InteractEvent(event, 'gesture', 'move');
        gestureEvent.ds = gestureEvent.scale - gesture.scale;

        target.fire(gestureEvent);

        gesture.prevAngle = gestureEvent.angle;
        gesture.prevDistance = gestureEvent.distance;

        if (gestureEvent.scale !== Infinity &&
            gestureEvent.scale !== null &&
            gestureEvent.scale !== undefined  &&
            !isNaN(gestureEvent.scale)) {

            gesture.scale = gestureEvent.scale;
        }

        return gestureEvent;
    }

    function validateSelector (event, matches) {
        for (var i = 0, len = matches.length; i < len; i++) {
            var match = matches[i],
                action = validateAction(match.getAction(event, match), match);

            if (action) {
                target = match;

                return action;
            }
        }
    }

    function pointerOver (event) {
        if (prepared) { return; }

        var curMatches = [],
            prevTargetElement = target && target._element,
            eventTarget = (event.target instanceof SVGElementInstance
                ? event.target.correspondingUseElement
                : event.target);

        if (target
            && (testIgnore(target, eventTarget) || !testAllow(target, eventTarget))) {
            // if the eventTarget should be ignored or shouldn't be allowed
            // clear the previous target
            target = null;
            matches = [];
        }

        var elementInteractable = interactables.get(eventTarget),
            elementAction = (elementInteractable
                             && !testIgnore(elementInteractable, eventTarget)
                             && testAllow(elementInteractable, eventTarget)
                             && validateAction(
                                 elementInteractable.getAction(event),
                                 elementInteractable));

        function pushCurMatches (interactable, selector) {
            if (interactable
                && inContext(interactable, eventTarget)
                && !testIgnore(interactable, eventTarget)
                && testAllow(interactable, eventTarget)
                && matchesSelector(eventTarget, selector)) {

                interactable._element = eventTarget;
                curMatches.push(interactable);
            }
        }

        if (elementAction) {
            target = elementInteractable;
            matches = [];
        }
        else {
            interactables.forEachSelector(pushCurMatches);

            if (validateSelector(event, curMatches)) {
                matches = curMatches;

                pointerHover(event, matches);
                events.addToElement(eventTarget, 'mousemove', pointerHover);
            }
            else if (target) {
                var prevTargetChildren = prevTargetElement.querySelectorAll('*');

                if (contains(prevTargetChildren, eventTarget)) {

                    // reset the elements of the matches to the old target
                    for (var i = 0; i < matches.length; i++) {
                        matches[i]._element = prevTargetElement;
                    }

                    pointerHover(event, matches);
                    events.addToElement(target._element, 'mousemove', pointerHover);
                }
                else {
                    target = null;
                    matches = [];
                }
            }
        }
    }

    function pointerOut (event) {
        if (prepared) { return; }

        // Remove temporary event listeners for selector Interactables
        var eventTarget = (event.target instanceof SVGElementInstance
            ? event.target.correspondingUseElement
            : event.target);

        if (!interactables.get(eventTarget)) {
            events.removeFromElement(eventTarget, pointerHover);
        }

        if (target && target.options.styleCursor && !(dragging || resizing || gesturing)) {
            document.documentElement.style.cursor = '';
        }
    }

    // Check what action would be performed on pointerMove target if a mouse
    // button were pressed and change the cursor accordingly
    function pointerHover (event, matches) {
        if (!prepared) {

            var action;

            if (matches) {
                action = validateSelector(event, matches);
            }
            else if (target) {
                action = validateAction(target.getAction(event));
            }

            if (target && target.options.styleCursor) {
                if (action) {
                    document.documentElement.style.cursor = actions[action].cursor;
                }
                else {
                    document.documentElement.style.cursor = '';
                }
            }
        }
        else if (prepared) {
            checkAndPreventDefault(event, target);
        }
    }

    // End interact move events and stop auto-scroll unless inertia is enabled
    function pointerUp (event) {
        // don't return if the event is an InteractEvent (in the case of inertia end)
        // or if the browser uses PointerEvents (event would always be a gestureend)
        if (!(event instanceof InteractEvent || PointerEvent)
            && pointerIsDown && downEvent
            && !(event instanceof downEvent.constructor)) {

            return;
        }

        if (event.touches && event.touches.length >= 2) {
            return;
        }

        // Stop native GestureEvent inertia
        if (GestureEvent && (event instanceof GestureEvent) && /inertiastart/i.test(event.type)) {
            event.gestureObject.stop();
            return;
        }

        var endEvent,
            options = target && target.options,
            inertiaOptions = options && options.inertia;

        if (dragging || resizing || gesturing) {

            if (inertiaStatus.active) { return; }

            var deltaSource = options.deltaSource,
                pointerSpeed = pointerDelta[deltaSource + 'Speed'],
                now = new Date().getTime(),
                inertiaPossible = false,
                inertia = false,
                smoothEnd = false,
                endSnap = checkSnap(target) && options.snap.endOnly,
                endRestrict = checkRestrict(target) && options.restrict.endOnly,
                dx = 0,
                dy = 0,
                startEvent;

            // check if inertia should be started
            inertiaPossible = (options.inertiaEnabled
                               && prepared !== 'gesture'
                               && contains(inertiaOptions.actions, prepared)
                               && event !== inertiaStatus.startEvent);

            inertia = (inertiaPossible
                       && (now - curCoords.timeStamp) < 50
                       && pointerSpeed > inertiaOptions.minSpeed
                       && pointerSpeed > inertiaOptions.endSpeed);

            if (inertiaPossible && !inertia && (endSnap || endRestrict)) {

                var snapRestrict = {};

                snapRestrict.snap = snapRestrict.restrict = snapRestrict;

                if (endSnap) {
                    setSnapping(event, snapRestrict);
                    if (snapRestrict.locked) {
                        dx += snapRestrict.dx;
                        dy += snapRestrict.dy;
                    }
                }

                if (endRestrict) {
                    setRestriction(event, snapRestrict);
                    if (snapRestrict.restricted) {
                        dx += snapRestrict.dx;
                        dy += snapRestrict.dy;
                    }
                }

                if (dx || dy) {
                    smoothEnd = true;
                }
            }

            if (inertia || smoothEnd) {
                if (events.useAttachEvent) {
                    // make a copy of the pointerdown event because IE8
                    // http://stackoverflow.com/a/3533725/2280888
                    extend(inertiaStatus.pointerUp, event);
                }
                else {
                    inertiaStatus.pointerUp = event;
                }

                inertiaStatus.startEvent = startEvent = new InteractEvent(event, prepared, 'inertiastart');
                target.fire(inertiaStatus.startEvent);

                inertiaStatus.target = target;
                inertiaStatus.targetElement = target._element;
                inertiaStatus.t0 = now;

                if (inertia) {
                    inertiaStatus.vx0 = pointerDelta[deltaSource + 'VX'];
                    inertiaStatus.vy0 = pointerDelta[deltaSource + 'VY'];
                    inertiaStatus.v0 = pointerSpeed;

                    calcInertia(inertiaStatus);

                    var page = getPageXY(event),
                        origin = getOriginXY(target, target._element),
                        statusObject;

                    page.x = page.x + (inertia? inertiaStatus.xe: 0) - origin.x;
                    page.y = page.y + (inertia? inertiaStatus.ye: 0) - origin.y;

                    statusObject = {
                        useStatusXY: true,
                        x: page.x,
                        y: page.y,
                        dx: 0,
                        dy: 0,
                        snap: null
                    };

                    statusObject.snap = statusObject;

                    dx = dy = 0;

                    if (endSnap) {
                        var snap = setSnapping(event, statusObject);

                        if (snap.locked) {
                            dx += snap.dx;
                            dy += snap.dy;
                        }
                    }

                    if (endRestrict) {
                        var restrict = setRestriction(event, statusObject);

                        if (restrict.restricted) {
                            dx += restrict.dx;
                            dy += restrict.dy;
                        }
                    }

                    inertiaStatus.modifiedXe += dx;
                    inertiaStatus.modifiedYe += dy;

                    inertiaStatus.i = reqFrame(inertiaFrame);
                }
                else {
                    inertiaStatus.smoothEnd = true;
                    inertiaStatus.xe = dx;
                    inertiaStatus.ye = dy;

                    inertiaStatus.sx = inertiaStatus.sy = 0;

                    inertiaStatus.i = reqFrame(smoothEndFrame);
                }

                inertiaStatus.active = true;
                return;
            }

            if (endSnap || endRestrict) {
                // fire a move event at the snapped coordinates
                pointerMove(event, true);
            }
        }

        if (dragging) {
            endEvent = new InteractEvent(event, 'drag', 'end');

            var dropEvent,
                draggableElement = target._element,
                drop = getDrop(endEvent, draggableElement);

            dropTarget = drop.dropzone;
            dropElement = drop.element;

            // getDrop changes target._element
            target._element = draggableElement;

            // get the most apprpriate dropzone based on DOM depth and order
            if (dropTarget) {
                dropEvent = new InteractEvent(event, 'drop', null, dropElement, draggableElement);

                endEvent.dropzone = dropElement;
            }

            // if there was a prevDropTarget (perhaps if for some reason this
            // dragend happens without the mouse moving of the previous drop
            // target)
            else if (prevDropTarget) {
                var dragLeaveEvent = new InteractEvent(event, 'drag', 'leave', dropElement, draggableElement);

                prevDropTarget.fire(dragLeaveEvent, draggableElement);

                endEvent.dragLeave = prevDropElement;
            }

            var dropEvents = getDropEvents(event, endEvent);

            target.fire(endEvent);

            if (dropEvents.leave) { prevDropTarget.fire(dropEvents.leave); }
            if (dropEvents.enter) {     dropTarget.fire(dropEvents.enter); }
            if (dropEvents.drop ) {     dropTarget.fire(dropEvents.drop ); }
            if (dropEvents.deactivate) {
                fireActiveDrops(dropEvents.deactivate);
            }
        }
        else if (resizing) {
            endEvent = new InteractEvent(event, 'resize', 'end');
            target.fire(endEvent);
        }
        else if (gesturing) {
            endEvent = new InteractEvent(event, 'gesture', 'end');
            target.fire(endEvent);
        }

        interact.stop();
    }

    // bound to the interactable context when a DOM event
    // listener is added to a selector interactable
    function delegateListener (event, useCapture) {
        var fakeEvent = {},
            delegated = delegatedEvents[event.type],
            element = event.target;

        useCapture = useCapture? true: false;

        // duplicate the event so that currentTarget can be changed
        for (var prop in event) {
            fakeEvent[prop] = event[prop];
        }

        fakeEvent.originalEvent = event;
        fakeEvent.preventDefault = preventOriginalDefault;

        // climb up document tree looking for selector matches
        while (element && element !== document) {
            for (var i = 0; i < delegated.selectors.length; i++) {
                var selector = delegated.selectors[i],
                    context = delegated.contexts[i];

                if (matchesSelector(element, selector)
                    && context === event.currentTarget
                    && nodeContains(context, element)) {

                    var listeners = delegated.listeners[i];

                    fakeEvent.currentTarget = element;

                    for (var j = 0; j < listeners.length; j++) {
                        if (listeners[j][1] !== useCapture) { continue; }

                        try {
                            listeners[j][0](fakeEvent);
                        }
                        catch (error) {
                            console.error('Error thrown from delegated listener: ' +
                                          '"' + selector + '" ' + event.type + ' ' +
                                          (listeners[j][0].name? listeners[j][0].name: ''));
                            console.log(error);
                        }
                    }
                }
            }

            element = element.parentNode;
        }
    }

    function delegateUseCapture (event) {
        return delegateListener.call(this, event, true);
    }

    interactables.indexOfElement = dropzones.indexOfElement = function indexOfElement (element, context) {
        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if ((interactable.selector === element
                && (interactable._context === (context || document)))

                || (!interactable.selector && interactable._element === element)) {

                return i;
            }
        }
        return -1;
    };

    interactables.get = dropzones.get = function interactableGet (element, options) {
        return this[this.indexOfElement(element, options && options.context)];
    };

    interactables.forEachSelector = function (callback) {
        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if (!interactable.selector) {
                continue;
            }

            var ret = callback(interactable, interactable.selector, interactable._context, i, this);

            if (ret !== undefined) {
                return ret;
            }
        }
    };

    function clearTargets () {
        if (target && !target.selector) {
            target = null;
        }

        dropTarget = dropElement = prevDropTarget = prevDropElement = null;
    }

    /*\
     * interact
     [ method ]
     *
     * The methods of this variable can be used to set elements as
     * interactables and also to change various default settings.
     *
     * Calling it as a function and passing an element or a valid CSS selector
     * string returns an Interactable object which has various methods to
     * configure it.
     *
     - element (Element | string) The HTML or SVG Element to interact with or CSS selector
     = (object) An @Interactable
     *
     > Usage
     | interact(document.getElementById('draggable')).draggable(true);
     |
     | var rectables = interact('rect');
     | rectables
     |     .gesturable(true)
     |     .on('gesturemove', function (event) {
     |         // something cool...
     |     })
     |     .autoScroll(true);
    \*/
    function interact (element, options) {
        return interactables.get(element, options) || new Interactable(element, options);
    }

    // A class for easy inheritance and setting of an Interactable's options
    function IOptions (options) {
        for (var option in defaultOptions) {
            if (options.hasOwnProperty(option)
                && typeof options[option] === typeof defaultOptions[option]) {
                this[option] = options[option];
            }
        }
    }

    IOptions.prototype = defaultOptions;

    /*\
     * Interactable
     [ property ]
     **
     * Object type returned by @interact
    \*/
    function Interactable (element, options) {
        this._element = element;
        this._iEvents = this._iEvents || {};

        if (isString(element)) {
            // if the selector is invalid,
            // an exception will be raised
            document.querySelector(element);

            this.selector = element;
            this._gesture = selectorGesture;

            if (options && options.context
                && (window.Node
                    ? options.context instanceof window.Node
                    : (isElement(options.context) || options.context === document))) {
                this._context = options.context;
            }
        }
        else if (isElement(element)) {
            if (PointerEvent) {
                events.add(this, pEventTypes.down, pointerDown );
                events.add(this, pEventTypes.move, pointerHover);

                this._gesture = new Gesture();
                this._gesture.target = element;
            }
            else {
                events.add(this, 'mousedown' , pointerDown );
                events.add(this, 'mousemove' , pointerHover);
                events.add(this, 'touchstart', pointerDown );
                events.add(this, 'touchmove' , pointerHover);
            }
        }

        interactables.push(this);

        this.set(options);
    }

    Interactable.prototype = {
        setOnEvents: function (action, phases) {
            if (action === 'drop') {
                var drop            = phases.ondrop             || phases.onDrop            || phases.drop,
                    dropactivate    = phases.ondropactivate     || phases.onDropActivate    || phases.dropactivate,
                    dropdeactivate  = phases.ondropdeactivate   || phases.onDropDeactivate  || phases.dropdeactivate,
                    dragenter       = phases.ondragenter        || phases.onDropEnter       || phases.dragenter,
                    dragleave       = phases.ondragleave        || phases.onDropLeave       || phases.dragleave,
                    dropmove        = phases.ondropmove         || phases.onDropMove        || phases.dropmove;

                if (isFunction(drop)          ) { this.ondrop           = drop          ; }
                if (isFunction(dropactivate)  ) { this.ondropactivate   = dropactivate  ; }
                if (isFunction(dropdeactivate)) { this.ondropdeactivate = dropdeactivate; }
                if (isFunction(dragenter)     ) { this.ondragenter      = dragenter     ; }
                if (isFunction(dragleave)     ) { this.ondragleave      = dragleave     ; }
                if (isFunction(dropmove)      ) { this.ondropmove       = dropmove      ; }
            }
            else {
                var start        = phases.onstart        || phases.onStart        || phases.start,
                    move         = phases.onmove         || phases.onMove         || phases.move,
                    end          = phases.onend          || phases.onEnd          || phases.end,
                    inertiastart = phases.oninertiastart || phases.onInertiaStart || phases.inertiastart;

                action = 'on' + action;

                if (isFunction(start)       ) { this[action + 'start'         ] = start         ; }
                if (isFunction(move)        ) { this[action + 'move'          ] = move          ; }
                if (isFunction(end)         ) { this[action + 'end'           ] = end           ; }
                if (isFunction(inertiastart)) { this[action + 'inertiastart'  ] = inertiastart  ; }
            }

            return this;
        },

        /*\
         * Interactable.draggable
         [ method ]
         *
         * Gets or sets whether drag actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of drag events
         | var isDraggable = interact('ul li').draggable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on drag events (object makes the Interactable draggable)
         = (object) This Interactable
         | interact(element).draggable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     // the axis in which the first movement must be
         |     // for the drag sequence to start
         |     // 'xy' by default - any direction
         |     axis: 'x' || 'y' || 'xy'
         | });
        \*/
        draggable: function (options) {
            if (isObject(options)) {
                this.options.draggable = true;
                this.setOnEvents('drag', options);

                if (/^x$|^y$|^xy$/.test(options.axis)) {
                    this.options.dragAxis = options.axis;
                }
                else if (options.axis === null) {
                    delete this.options.dragAxis;
                }

                return this;
            }

            if (isBool(options)) {
                this.options.draggable = options;

                return this;
            }

            if (options === null) {
                delete this.options.draggable;

                return this;
            }

            return this.options.draggable;
        },

        /*\
         * Interactable.dropzone
         [ method ]
         *
         * Returns or sets whether elements can be dropped onto this
         * Interactable to trigger drop events
         *
         - options (boolean | object | null) #optional The new value to be set.
         = (boolean | object) The current setting or this Interactable
        \*/
        dropzone: function (options) {
            if (isObject(options)) {
                this.options.dropzone = true;
                this.setOnEvents('drop', options);
                this.accept(options.accept);

                this._dropElements = this.selector? null: [this._element];
                dropzones.push(this);

                return this;
            }

            if (isBool(options)) {
                if (options) {
                    this._dropElements = this.selector? null: [this._element];
                    dropzones.push(this);
                }
                else {
                    var index = indexOf(dropzones, this);

                    if (index !== -1) {
                        dropzones.splice(index, 1);
                    }
                }

                this.options.dropzone = options;

                return this;
            }

            if (options === null) {
                delete this.options.dropzone;

                return this;
            }

            return this.options.dropzone;
        },

        /*\
         * Interactable.dropCheck
         [ method ]
         *
         * The default function to determine if a dragend event occured over
         * this Interactable's element. Can be overridden using
         * @Interactable.dropChecker.
         *
         - event (MouseEvent | TouchEvent) The event that ends a drag
         = (boolean) whether the pointer was over this Interactable
        \*/
        dropCheck: function (event, draggable, draggableElement, rect) {
            if (!(rect = rect || this.getRect())) {
                return false;
            }

            var page = getPageXY(event),
                origin = getOriginXY(draggable, draggableElement),
                horizontal,
                vertical;

            page.x += origin.x;
            page.y += origin.y;

            horizontal = (page.x > rect.left) && (page.x < rect.right);
            vertical   = (page.y > rect.top ) && (page.y < rect.bottom);

            return horizontal && vertical;
        },

        /*\
         * Interactable.dropChecker
         [ method ]
         *
         * Gets or sets the function used to check if a dragged element is
         * over this Interactable. See @Interactable.dropCheck.
         *
         - checker (function) #optional
         * The checker is a function which takes a mouseUp/touchEnd event as a
         * parameter and returns true or false to indicate if the the current
         * draggable can be dropped into this Interactable
         *
         = (Function | Interactable) The checker function or this Interactable
        \*/
        dropChecker: function (newValue) {
            if (isFunction(newValue)) {
                this.dropCheck = newValue;

                return this;
            }
            return this.dropCheck;
        },

        /*\
         * Interactable.accept
         [ method ]
         *
         * Gets or sets the Element or CSS selector match that this
         * Interactable accepts if it is a dropzone.
         *
         - newValue (Element | string | null) #optional
         * If it is an Element, then only that element can be dropped into this dropzone.
         * If it is a string, the element being dragged must match it as a selector.
         * If it is null, the accept options is cleared - it accepts any element.
         *
         = (string | Element | null | Interactable) The current accept option if given `undefined` or this Interactable
        \*/
        accept: function (newValue) {
            if (isElement(newValue)) {
                this.options.accept = newValue;

                return this;
            }

            if (isString(newValue)) {
                // test if it is a valid CSS selector
                document.querySelector(newValue);
                this.options.accept = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.accept;

                return this;
            }

            return this.options.accept;
        },

        /*\
         * Interactable.resizable
         [ method ]
         *
         * Gets or sets whether resize actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of resize elements
         | var isResizeable = interact('input[type=text]').resizable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on resize events (object makes the Interactable resizable)
         = (object) This Interactable
         | interact(element).resizable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     axis   : 'x' || 'y' || 'xy' // default is 'xy'
         | });
        \*/
        resizable: function (options) {
            if (isObject(options)) {
                this.options.resizable = true;
                this.setOnEvents('resize', options);

                if (/^x$|^y$|^xy$/.test(options.axis)) {
                    this.options.resizeAxis = options.axis;
                }
                else if (options.axis === null) {
                    this.options.resizeAxis = defaultOptions.resizeAxis;
                }

                return this;
            }
            if (isBool(options)) {
                this.options.resizable = options;

                return this;
            }
            return this.options.resizable;
        },

        // misspelled alias
        resizeable: blank,

        /*\
         * Interactable.squareResize
         [ method ]
         *
         * Gets or sets whether resizing is forced 1:1 aspect
         *
         = (boolean) Current setting
         *
         * or
         *
         - newValue (boolean) #optional
         = (object) this Interactable
        \*/
        squareResize: function (newValue) {
            if (isBool(newValue)) {
                this.options.squareResize = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.squareResize;

                return this;
            }

            return this.options.squareResize;
        },

        /*\
         * Interactable.gesturable
         [ method ]
         *
         * Gets or sets whether multitouch gestures can be performed on the
         * Interactable's element
         *
         = (boolean) Indicates if this can be the target of gesture events
         | var isGestureable = interact(element).gesturable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on gesture events (makes the Interactable gesturable)
         = (object) this Interactable
         | interact(element).gesturable({
         |     onmove: function (event) {}
         | });
        \*/
        gesturable: function (options) {
            if (isObject(options)) {
                this.options.gesturable = true;
                this.setOnEvents('gesture', options);

                return this;
            }

            if (isBool(options)) {
                this.options.gesturable = options;

                return this;
            }

            if (options === null) {
                delete this.options.gesturable;

                return this;
            }

            return this.options.gesturable;
        },

        // misspelled alias
        gestureable: blank,

        /*\
         * Interactable.autoScroll
         [ method ]
         *
         * Returns or sets whether or not any actions near the edges of the
         * window/container trigger autoScroll for this Interactable
         *
         = (boolean | object)
         * `false` if autoScroll is disabled; object with autoScroll properties
         * if autoScroll is enabled
         *
         * or
         *
         - options (object | boolean | null) #optional
         * options can be:
         * - an object with margin, distance and interval properties,
         * - true or false to enable or disable autoScroll or
         * - null to use default settings
         = (Interactable) this Interactable
        \*/
        autoScroll: function (options) {
            var defaults = defaultOptions.autoScroll;

            if (isObject(options)) {
                var autoScroll = this.options.autoScroll;

                if (autoScroll === defaults) {
                   autoScroll = this.options.autoScroll = {
                       margin   : defaults.margin,
                       distance : defaults.distance,
                       interval : defaults.interval,
                       container: defaults.container
                   };
                }

                autoScroll.margin = this.validateSetting('autoScroll', 'margin', options.margin);
                autoScroll.speed  = this.validateSetting('autoScroll', 'speed' , options.speed);

                autoScroll.container =
                    (isElement(options.container) || options.container instanceof window.Window
                     ? options.container
                     : defaults.container);


                this.options.autoScrollEnabled = true;
                this.options.autoScroll = autoScroll;

                return this;
            }

            if (isBool(options)) {
                this.options.autoScrollEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.autoScrollEnabled;
                delete this.options.autoScroll;

                return this;
            }

            return (this.options.autoScrollEnabled
                ? this.options.autoScroll
                : false);
        },

        /*\
         * Interactable.snap
         [ method ]
         **
         * Returns or sets if and how action coordinates are snapped. By
         * default, snapping is relative to the pointer coordinates. You can
         * change this by setting the
         * [`elementOrigin`](https://github.com/taye/interact.js/pull/72).
         **
         = (boolean | object) `false` if snap is disabled; object with snap properties if snap is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | interact('.handle').snap({
         |     mode        : 'grid',                // event coords should snap to the corners of a grid
         |     range       : Infinity,              // the effective distance of snap ponts
         |     grid        : { x: 100, y: 100 },    // the x and y spacing of the grid points
         |     gridOffset  : { x:   0, y:   0 },    // the offset of the grid points
         | });
         |
         | interact('.handle').snap({
         |     mode        : 'anchor',              // snap to specified points
         |     anchors     : [
         |         { x: 100, y: 100, range: 25 },   // a point with x, y and a specific range
         |         { x: 200, y: 200 }               // a point with x and y. it uses the default range
         |     ]
         | });
         |
         | interact(document.querySelector('#thing')).snap({
         |     mode : 'path',
         |     paths: [
         |         {            // snap to points on these x and y axes
         |             x: 100,
         |             y: 100,
         |             range: 25
         |         },
         |         // give this function the x and y page coords and snap to the object returned
         |         function (x, y) {
         |             return {
         |                 x: x,
         |                 y: (75 + 50 * Math.sin(x * 0.04)),
         |                 range: 40
         |             };
         |         }]
         | })
         |
         | interact(element).snap({
         |     // do not snap during normal movement.
         |     // Instead, trigger only one snapped move event
         |     // immediately before the end event.
         |     endOnly: true,
         |
         |     // https://github.com/taye/interact.js/pull/72#issue-41813493
         |     elementOrigin: { x: 0, y: 0 }
         | });
        \*/
        snap: function (options) {
            var defaults = defaultOptions.snap;

            if (isObject(options)) {
                var snap = this.options.snap;

                if (snap === defaults) {
                   snap = {};
                }

                snap.mode          = this.validateSetting('snap', 'mode'         , options.mode);
                snap.endOnly       = this.validateSetting('snap', 'endOnly'      , options.endOnly);
                snap.actions       = this.validateSetting('snap', 'actions'      , options.actions);
                snap.range         = this.validateSetting('snap', 'range'        , options.range);
                snap.paths         = this.validateSetting('snap', 'paths'        , options.paths);
                snap.grid          = this.validateSetting('snap', 'grid'         , options.grid);
                snap.gridOffset    = this.validateSetting('snap', 'gridOffset'   , options.gridOffset);
                snap.anchors       = this.validateSetting('snap', 'anchors'      , options.anchors);
                snap.elementOrigin = this.validateSetting('snap', 'elementOrigin', options.elementOrigin);

                this.options.snapEnabled = true;
                this.options.snap = snap;

                return this;
            }

            if (isBool(options)) {
                this.options.snapEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.snapEnabled;
                delete this.options.snap;

                return this;
            }

            return (this.options.snapEnabled
                ? this.options.snap
                : false);
        },

        /*\
         * Interactable.inertia
         [ method ]
         **
         * Returns or sets if and how events continue to run after the pointer is released
         **
         = (boolean | object) `false` if inertia is disabled; `object` with inertia properties if inertia is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | // enable and use default settings
         | interact(element).inertia(true);
         |
         | // enable and use custom settings
         | interact(element).inertia({
         |     // value greater than 0
         |     // high values slow the object down more quickly
         |     resistance     : 16,
         |
         |     // the minimum launch speed (pixels per second) that results in inertiastart
         |     minSpeed       : 200,
         |
         |     // inertia will stop when the object slows down to this speed
         |     endSpeed       : 20,
         |
         |     // boolean; should the jump when resuming from inertia be ignored in event.dx/dy
         |     zeroResumeDelta: false,
         |
         |     // if snap/restrict are set to be endOnly and inertia is enabled, releasing
         |     // the pointer without triggering inertia will animate from the release
         |     // point to the snaped/restricted point in the given amount of time (ms)
         |     smoothEndDuration: 300,
         |
         |     // an array of action types that can have inertia (no gesture)
         |     actions        : ['drag', 'resize']
         | });
         |
         | // reset custom settings and use all defaults
         | interact(element).inertia(null);
        \*/
        inertia: function (options) {
            var defaults = defaultOptions.inertia;

            if (isObject(options)) {
                var inertia = this.options.inertia;

                if (inertia === defaults) {
                   inertia = this.options.inertia = {
                       resistance       : defaults.resistance,
                       minSpeed         : defaults.minSpeed,
                       endSpeed         : defaults.endSpeed,
                       actions          : defaults.actions,
                       zeroResumeDelta  : defaults.zeroResumeDelta,
                       smoothEndDuration: defaults.smoothEndDuration
                   };
                }

                inertia.resistance        = this.validateSetting('inertia', 'resistance'       , options.resistance);
                inertia.minSpeed          = this.validateSetting('inertia', 'minSpeed'         , options.minSpeed);
                inertia.endSpeed          = this.validateSetting('inertia', 'endSpeed'         , options.endSpeed);
                inertia.actions           = this.validateSetting('inertia', 'actions'          , options.actions);
                inertia.zeroResumeDelta   = this.validateSetting('inertia', 'zeroResumeDelta'  , options.zeroResumeDelta);
                inertia.smoothEndDuration = this.validateSetting('inertia', 'smoothEndDuration', options.smoothEndDuration);

                this.options.inertiaEnabled = true;
                this.options.inertia = inertia;

                return this;
            }

            if (isBool(options)) {
                this.options.inertiaEnabled = options;

                return this;
            }

            if (options === null) {
                delete this.options.inertiaEnabled;
                delete this.options.inertia;

                return this;
            }

            return (this.options.inertiaEnabled
                ? this.options.inertia
                : false);
        },

        getAction: function (event) {
            var action = this.defaultActionChecker(event);

            if (this.options.actionChecker) {
                action = this.options.actionChecker(event, action, this);
            }

            return action;
        },

        defaultActionChecker: defaultActionChecker,

        /*\
         * Interactable.actionChecker
         [ method ]
         *
         * Gets or sets the function used to check action to be performed on
         * pointerDown
         *
         - checker (function | null) #optional A function which takes a pointer event, defaultAction string and an interactable as parameters and returns 'drag' 'resize[axes]' or 'gesture' or null.
         = (Function | Interactable) The checker function or this Interactable
        \*/
        actionChecker: function (newValue) {
            if (isFunction(newValue)) {
                this.options.actionChecker = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.actionChecker;

                return this;
            }

            return this.options.actionChecker;
        },

        /*\
         * Interactable.getRect
         [ method ]
         *
         * The default function to get an Interactables bounding rect. Can be
         * overridden using @Interactable.rectChecker.
         *
         - element (Element) #optional The element to measure. Meant to be used for selector Interactables which don't have a specific element.
         = (object) The object's bounding rectangle.
         o {
         o     top   : 0,
         o     left  : 0,
         o     bottom: 0,
         o     right : 0,
         o     width : 0,
         o     height: 0
         o }
        \*/
        getRect: function rectCheck (element) {
            element = element || this._element;

            if (this.selector && !(isElement(element))) {
                element = this._context.querySelector(this.selector);
            }

            return getElementRect(element);
        },

        /*\
         * Interactable.rectChecker
         [ method ]
         *
         * Returns or sets the function used to calculate the interactable's
         * element's rectangle
         *
         - checker (function) #optional A function which returns this Interactable's bounding rectangle. See @Interactable.getRect
         = (function | object) The checker function or this Interactable
        \*/
        rectChecker: function (newValue) {
            if (isFunction(newValue)) {
                this.getRect = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.getRect;

                return this;
            }

            return this.getRect;
        },

        /*\
         * Interactable.styleCursor
         [ method ]
         *
         * Returns or sets whether the action that would be performed when the
         * mouse on the element are checked on `mousemove` so that the cursor
         * may be styled appropriately
         *
         - newValue (boolean) #optional
         = (boolean | Interactable) The current setting or this Interactable
        \*/
        styleCursor: function (newValue) {
            if (isBool(newValue)) {
                this.options.styleCursor = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.styleCursor;

                return this;
            }

            return this.options.styleCursor;
        },

        /*\
         * Interactable.preventDefault
         [ method ]
         *
         * Returns or sets whether to prevent the browser's default behaviour
         * in response to pointer events. Can be set to
         *  - `true` to always prevent
         *  - `false` to never prevent
         *  - `'auto'` to allow interact.js to try to guess what would be best
         *  - `null` to set to the default ('auto')
         *
         - newValue (boolean | string | null) #optional `true`, `false` or `'auto'`
         = (boolean | string | Interactable) The current setting or this Interactable
        \*/
        preventDefault: function (newValue) {
            if (isBool(newValue) || newValue === 'auto') {
                this.options.preventDefault = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.preventDefault;

                return this;
            }

            return this.options.preventDefault;
        },

        /*\
         * Interactable.origin
         [ method ]
         *
         * Gets or sets the origin of the Interactable's element.  The x and y
         * of the origin will be subtracted from action event coordinates.
         *
         - origin (object) #optional An object with x and y properties which are numbers
         * OR
         - origin (Element) #optional An HTML or SVG Element whose rect will be used
         **
         = (object) The current origin or this Interactable
        \*/
        origin: function (newValue) {
            if (isObject(newValue) || /^parent$|^self$/.test(newValue)) {
                this.options.origin = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.origin;

                return this;
            }

            return this.options.origin;
        },

        /*\
         * Interactable.deltaSource
         [ method ]
         *
         * Returns or sets the mouse coordinate types used to calculate the
         * movement of the pointer.
         *
         - source (string) #optional Use 'client' if you will be scrolling while interacting; Use 'page' if you want autoScroll to work
         = (string | object) The current deltaSource or this Interactable
        \*/
        deltaSource: function (newValue) {
            if (newValue === 'page' || newValue === 'client') {
                this.options.deltaSource = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.deltaSource;

                return this;
            }

            return this.options.deltaSource;
        },

        /*\
         * Interactable.restrict
         [ method ]
         **
         * Returns or sets the rectangles within which actions on this
         * interactable (after snap calculations) are restricted. By default,
         * restricting is relative to the pointer coordinates. You can change
         * this by setting the
         * [`elementRect`](https://github.com/taye/interact.js/pull/72).
         **
         - newValue (object) #optional an object with keys drag, resize, and/or gesture and rects or Elements as values
         = (object) The current restrictions object or this Interactable
         **
         | interact(element).restrict({
         |     // the rect will be `interact.getElementRect(element.parentNode)`
         |     drag: element.parentNode,
         |
         |     // x and y are relative to the the interactable's origin
         |     resize: { x: 100, y: 100, width: 200, height: 200 }
         | })
         |
         | interact('.draggable').restrict({
         |     // the rect will be the selected element's parent
         |     drag: 'parent',
         |
         |     // do not restrict during normal movement.
         |     // Instead, trigger only one restricted move event
         |     // immediately before the end event.
         |     endOnly: true,
         |
         |     // https://github.com/taye/interact.js/pull/72#issue-41813493
         |     elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
         | });
        \*/
        restrict: function (newValue) {
            if (newValue === undefined) {
                return this.options.restrict;
            }

            if (isBool(newValue)) {
                defaultOptions.restrictEnabled = newValue;
            }
            else if (isObject(newValue)) {
                var newRestrictions = {};

                if (isObject(newValue.drag) || /^parent$|^self$/.test(newValue.drag)) {
                    newRestrictions.drag = newValue.drag;
                }
                if (isObject(newValue.resize) || /^parent$|^self$/.test(newValue.resize)) {
                    newRestrictions.resize = newValue.resize;
                }
                if (isObject(newValue.gesture) || /^parent$|^self$/.test(newValue.gesture)) {
                    newRestrictions.gesture = newValue.gesture;
                }

                if (isBool(newValue.endOnly)) {
                    newRestrictions.endOnly = newValue.endOnly;
                }

                if (isObject(newValue.elementRect)) {
                    newRestrictions.elementRect = newValue.elementRect;
                }

                this.options.restrictEnabled = true;
                this.options.restrict = newRestrictions;
            }
            else if (newValue === null) {
               delete this.options.restrict;
               delete this.options.restrictEnabled;
            }

            return this;
        },

        /*\
         * Interactable.context
         [ method ]
         *
         * Get's the selector context Node of the Interactable. The default is `window.document`.
         *
         = (Node) The context Node of this Interactable
         **
        \*/
        context: function () {
            return this._context;
        },

        _context: document,

        /*\
         * Interactable.ignoreFrom
         [ method ]
         *
         * If the target of the `mousedown`, `pointerdown` or `touchstart`
         * event or any of it's parents match the given CSS selector or
         * Element, no drag/resize/gesture is started.
         *
         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to not ignore any elements
         = (string | Element | object) The current ignoreFrom value or this Interactable
         **
         | interact(element, { ignoreFrom: document.getElementById('no-action') });
         | // or
         | interact(element).ignoreFrom('input, textarea, a');
        \*/
        ignoreFrom: function (newValue) {
            if (isString(newValue)) {     // CSS selector to match event.target
                document.querySelector(newValue);   // test the selector
                this.options.ignoreFrom = newValue;
                return this;
            }

            if (isElement(newValue)) {              // specific element
                this.options.ignoreFrom = newValue;
                return this;
            }

            if (newValue === null) {
                delete this.options.ignoreFrom;
                return this;
            }

            return this.options.ignoreFrom;
        },

        /*\
         * Interactable.allowFrom
         [ method ]
         *
         * A drag/resize/gesture is started only If the target of the
         * `mousedown`, `pointerdown` or `touchstart` event or any of it's
         * parents match the given CSS selector or Element.
         *
         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to allow from any element
         = (string | Element | object) The current allowFrom value or this Interactable
         **
         | interact(element, { allowFrom: document.getElementById('drag-handle') });
         | // or
         | interact(element).allowFrom('.handle');
        \*/
        allowFrom: function (newValue) {
            if (isString(newValue)) {     // CSS selector to match event.target
                document.querySelector(newValue);   // test the selector
                this.options.allowFrom = newValue;
                return this;
            }

            if (isElement(newValue)) {              // specific element
                this.options.allowFrom = newValue;
                return this;
            }

            if (newValue === null) {
                delete this.options.allowFrom;
                return this;
            }

            return this.options.allowFrom;
        },

        /*\
         * Interactable.validateSetting
         [ method ]
         *
         - context (string) eg. 'snap', 'autoScroll'
         - option (string) The name of the value being set
         - value (any type) The value being validated
         *
         = (typeof value) A valid value for the give context-option pair
         * - null if defaultOptions[context][value] is undefined
         * - value if it is the same type as defaultOptions[context][value],
         * - this.options[context][value] if it is the same type as defaultOptions[context][value],
         * - or defaultOptions[context][value]
        \*/
        validateSetting: function (context, option, value) {
            var defaults = defaultOptions[context],
                current = this.options[context];

            if (defaults !== undefined && defaults[option] !== undefined) {
                if ('objectTypes' in defaults && defaults.objectTypes.test(option)) {
                    if (isObject(value)) { return value; }
                    else {
                        return (option in current && isObject(current[option])
                            ? current [option]
                            : defaults[option]);
                    }
                }

                if ('arrayTypes' in defaults && defaults.arrayTypes.test(option)) {
                    if (isArray(value)) { return value; }
                    else {
                        return (option in current && isArray(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('stringTypes' in defaults && defaults.stringTypes.test(option)) {
                    if (isString(value)) { return value; }
                    else {
                        return (option in current && isString(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('numberTypes' in defaults && defaults.numberTypes.test(option)) {
                    if (isNumber(value)) { return value; }
                    else {
                        return (option in current && isNumber(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('boolTypes' in defaults && defaults.boolTypes.test(option)) {
                    if (isBool(value)) { return value; }
                    else {
                        return (option in current && isBool(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }

                if ('elementTypes' in defaults && defaults.elementTypes.test(option)) {
                    if (isElement(value)) { return value; }
                    else {
                        return (option in current && isElement(current[option])
                            ? current[option]
                            : defaults[option]);
                    }
                }
            }

            return null;
        },

        /*\
         * Interactable.element
         [ method ]
         *
         * If this is not a selector Interactable, it returns the element this
         * interactable represents
         *
         = (Element) HTML / SVG Element
        \*/
        element: function () {
            return this._element;
        },

        /*\
         * Interactable.fire
         [ method ]
         *
         * Calls listeners for the given InteractEvent type bound globablly
         * and directly to this Interactable
         *
         - iEvent (InteractEvent) The InteractEvent object to be fired on this Interactable
         = (Interactable) this Interactable
        \*/
        fire: function (iEvent) {
            if (!(iEvent && iEvent.type) || !contains(eventTypes, iEvent.type)) {
                return this;
            }

            var listeners,
                fireState = 0,
                i = 0,
                len,
                onEvent = 'on' + iEvent.type;

            // Try-catch and loop so an exception thrown from a listener
            // doesn't ruin everything for everyone
            while (fireState < 3) {
                try {
                    switch (fireState) {
                        // Interactable#on() listeners
                        case fireStates.directBind:
                            if (iEvent.type in this._iEvents) {
                            listeners = this._iEvents[iEvent.type];

                            for (len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                                listeners[i](iEvent);
                            }
                            break;
                        }

                        break;

                        // interactable.onevent listener
                        case fireStates.onevent:
                            if (isFunction(this[onEvent])) {
                            this[onEvent](iEvent);
                        }
                        break;

                        // interact.on() listeners
                        case fireStates.globalBind:
                            if (iEvent.type in globalEvents && (listeners = globalEvents[iEvent.type]))  {

                            for (len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                                listeners[i](iEvent);
                            }
                        }
                    }

                    if (iEvent.propagationStopped) {
                        break;
                    }

                    i = 0;
                    fireState++;
                }
                catch (error) {
                    console.error('Error thrown from ' + iEvent.type + ' listener');
                    console.error(error);
                    i++;

                    if (fireState === fireStates.onevent) {
                        fireState++;
                    }
                }
            }

            return this;
        },

        /*\
         * Interactable.on
         [ method ]
         *
         * Binds a listener for an InteractEvent or DOM event.
         *
         - eventType  (string)   The type of event to listen for
         - listener   (function) The function to be called on that event
         - useCapture (boolean) #optional useCapture flag for addEventListener
         = (object) This Interactable
        \*/
        on: function (eventType, listener, useCapture) {
            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // convert to boolean
            useCapture = useCapture? true: false;

            if (contains(eventTypes, eventType)) {
                // if this type of event was never bound to this Interactable
                if (!(eventType in this._iEvents)) {
                    this._iEvents[eventType] = [listener];
                }
                // if the event listener is not already bound for this type
                else if (!contains(this._iEvents[eventType], listener)) {
                    this._iEvents[eventType].push(listener);
                }
            }
            // delegated event for selector
            else if (this.selector) {
                if (!delegatedEvents[eventType]) {
                    delegatedEvents[eventType] = {
                        selectors: [],
                        contexts : [],
                        listeners: []
                    };

                    // add delegate listener functions
                    events.addToElement(this._context, eventType, delegateListener);
                    events.addToElement(this._context, eventType, delegateUseCapture, true);
                }

                var delegated = delegatedEvents[eventType],
                    index;

                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {
                        break;
                    }
                }

                if (index === -1) {
                    index = delegated.selectors.length;

                    delegated.selectors.push(this.selector);
                    delegated.contexts .push(this._context);
                    delegated.listeners.push([]);
                }

                // keep listener and useCapture flag
                delegated.listeners[index].push([listener, useCapture]);
            }
            else {
                events.add(this, eventType, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.off
         [ method ]
         *
         * Removes an InteractEvent or DOM event listener
         *
         - eventType  (string)   The type of event that was listened for
         - listener   (function) The listener function to be removed
         - useCapture (boolean) #optional useCapture flag for removeEventListener
         = (object) This Interactable
        \*/
        off: function (eventType, listener, useCapture) {
            var eventList,
                index = -1;

            // convert to boolean
            useCapture = useCapture? true: false;

            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // if it is an action event type
            if (contains(eventTypes, eventType)) {
                eventList = this._iEvents[eventType];

                if (eventList && (index = indexOf(eventList, listener)) !== -1) {
                    this._iEvents[eventType].splice(index, 1);
                }
            }
            // delegated event
            else if (this.selector) {
                var delegated = delegatedEvents[eventType],
                    matchFound = false;

                if (!delegated) { return this; }

                // count from last index of delegated to 0
                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    // look for matching selector and context Node
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {

                        var listeners = delegated.listeners[index];

                        // each item of the listeners array is an array: [function, useCaptureFlag]
                        for (var i = listeners.length - 1; i >= 0; i--) {
                            var fn = listeners[i][0],
                                useCap = listeners[i][1];

                            // check if the listener functions and useCapture flags match
                            if (fn === listener && useCap === useCapture) {
                                // remove the listener from the array of listeners
                                listeners.splice(i, 1);

                                // if all listeners for this interactable have been removed
                                // remove the interactable from the delegated arrays
                                if (!listeners.length) {
                                    delegated.selectors.splice(index, 1);
                                    delegated.contexts .splice(index, 1);
                                    delegated.listeners.splice(index, 1);

                                    // remove delegate function from context
                                    events.removeFromElement(this._context, eventType, delegateListener);
                                    events.removeFromElement(this._context, eventType, delegateUseCapture, true);

                                    // remove the arrays if they are empty
                                    if (!delegated.selectors.length) {
                                        delegatedEvents[eventType] = null;
                                    }
                                }

                                // only remove one listener
                                matchFound = true;
                                break;
                            }
                        }

                        if (matchFound) { break; }
                    }
                }
            }
            // remove listener from this Interatable's element
            else {
                events.remove(this, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.set
         [ method ]
         *
         * Reset the options of this Interactable
         - options (object) The new settings to apply
         = (object) This Interactablw
        \*/
        set: function (options) {
            if (!options || !isObject(options)) {
                options = {};
            }
            this.options = new IOptions(options);

            this.draggable ('draggable'  in options? options.draggable : this.options.draggable );
            this.dropzone  ('dropzone'   in options? options.dropzone  : this.options.dropzone  );
            this.resizable ('resizable'  in options? options.resizable : this.options.resizable );
            this.gesturable('gesturable' in options? options.gesturable: this.options.gesturable);

            var settings = [
                    'accept', 'actionChecker', 'allowFrom', 'autoScroll', 'deltaSource',
                    'dropChecker', 'ignoreFrom', 'inertia', 'origin', 'preventDefault',
                    'rectChecker', 'restrict', 'snap', 'styleCursor'
                ];

            for (var i = 0, len = settings.length; i < len; i++) {
                var setting = settings[i];

                if (setting in options) {
                    this[setting](options[setting]);
                }
            }

            return this;
        },

        /*\
         * Interactable.unset
         [ method ]
         *
         * Remove this interactable from the list of interactables and remove
         * it's drag, drop, resize and gesture capabilities
         *
         = (object) @interact
        \*/
        unset: function () {
            events.remove(this, 'all');

            if (!isString(this.selector)) {
                events.remove(this, 'all');
                if (this.options.styleCursor) {
                    this._element.style.cursor = '';
                }

                if (this._gesture) {
                    this._gesture.target = null;
                }
            }
            else {
                // remove delegated events
                for (var type in delegatedEvents) {
                    var delegated = delegatedEvents[type];

                    for (var i = 0; i < delegated.selectors.length; i++) {
                        if (delegated.selectors[i] === this.selector
                            && delegated.contexts[i] === this._context) {

                            delegated.selectors.splice(i, 1);
                            delegated.contexts .splice(i, 1);
                            delegated.listeners.splice(i, 1);

                            // remove the arrays if they are empty
                            if (!delegated.selectors.length) {
                                delegatedEvents[type] = null;
                            }
                        }

                        events.removeFromElement(this._context, type, delegateListener);
                        events.removeFromElement(this._context, type, delegateUseCapture, true);

                        break;
                    }
                }
            }

            this.dropzone(false);

            interactables.splice(indexOf(interactables, this), 1);

            return interact;
        }
    };

    Interactable.prototype.gestureable = Interactable.prototype.gesturable;
    Interactable.prototype.resizeable = Interactable.prototype.resizable;

    /*\
     * interact.isSet
     [ method ]
     *
     * Check if an element has been set
     - element (Element) The Element being searched for
     = (boolean) Indicates if the element or CSS selector was previously passed to interact
    \*/
    interact.isSet = function(element, options) {
        return interactables.indexOfElement(element, options && options.context) !== -1;
    };

    /*\
     * interact.on
     [ method ]
     *
     * Adds a global listener for an InteractEvent or adds a DOM event to
     * `document`
     *
     - type       (string)   The type of event to listen for
     - listener   (function) The function to be called on that event
     - useCapture (boolean) #optional useCapture flag for addEventListener
     = (object) interact
    \*/
    interact.on = function (type, listener, useCapture) {
        // if it is an InteractEvent type, add listener to globalEvents
        if (contains(eventTypes, type)) {
            // if this type of event was never bound
            if (!globalEvents[type]) {
                globalEvents[type] = [listener];
            }

            // if the event listener is not already bound for this type
            else if (!contains(globalEvents[type], listener)) {

                globalEvents[type].push(listener);
            }
        }
        // If non InteratEvent type, addEventListener to document
        else {
            events.add(docTarget, type, listener, useCapture);
        }

        return interact;
    };

    /*\
     * interact.off
     [ method ]
     *
     * Removes a global InteractEvent listener or DOM event from `document`
     *
     - type       (string)   The type of event that was listened for
     - listener   (function) The listener function to be removed
     - useCapture (boolean) #optional useCapture flag for removeEventListener
     = (object) interact
    \*/
    interact.off = function (type, listener, useCapture) {
        if (!contains(eventTypes, type)) {
            events.remove(docTarget, type, listener, useCapture);
        }
        else {
            var index;

            if (type in globalEvents
                && (index = indexOf(globalEvents[type], listener)) !== -1) {
                globalEvents[type].splice(index, 1);
            }
        }

        return interact;
    };

    /*\
     * interact.simulate
     [ method ]
     *
     * Simulate pointer down to begin to interact with an interactable element
     - action       (string)  The action to be performed - drag, resize, etc.
     - element      (Element) The DOM Element to resize/drag
     - pointerEvent (object) #optional Pointer event whose pageX/Y coordinates will be the starting point of the interact drag/resize
     = (object) interact
    \*/
    interact.simulate = function (action, element, pointerEvent) {
        var event = {},
            clientRect;

        if (action === 'resize') {
            action = 'resizexy';
        }
        // return if the action is not recognised
        if (!(action in actions)) {
            return interact;
        }

        if (pointerEvent) {
            extend(event, pointerEvent);
        }
        else {
            clientRect = (target._element instanceof SVGElement)?
                element.getBoundingClientRect():
                clientRect = element.getClientRects()[0];

            if (action === 'drag') {
                event.pageX = clientRect.left + clientRect.width / 2;
                event.pageY = clientRect.top + clientRect.height / 2;
            }
            else {
                event.pageX = clientRect.right;
                event.pageY = clientRect.bottom;
            }
        }

        event.target = event.currentTarget = element;
        event.preventDefault = event.stopPropagation = blank;

        pointerDown(event, action);

        return interact;
    };

    /*\
     * interact.enableDragging
     [ method ]
     *
     * Returns or sets whether dragging is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableDragging = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.drag = newValue;

            return interact;
        }
        return actionIsEnabled.drag;
    };

    /*\
     * interact.enableResizing
     [ method ]
     *
     * Returns or sets whether resizing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableResizing = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.resize = newValue;

            return interact;
        }
        return actionIsEnabled.resize;
    };

    /*\
     * interact.enableGesturing
     [ method ]
     *
     * Returns or sets whether gesturing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableGesturing = function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.gesture = newValue;

            return interact;
        }
        return actionIsEnabled.gesture;
    };

    interact.eventTypes = eventTypes;

    /*\
     * interact.debug
     [ method ]
     *
     * Returns debugging data
     = (object) An object with properties that outline the current state and expose internal functions and variables
    \*/
    interact.debug = function () {
        return {
            target                : target,
            dragging              : dragging,
            resizing              : resizing,
            gesturing             : gesturing,
            prepared              : prepared,
            matches               : matches,

            prevCoords            : prevCoords,
            downCoords            : startCoords,

            pointerIds            : pointerIds,
            pointerMoves          : pointerMoves,
            addPointer            : addPointer,
            removePointer         : removePointer,
            recordPointers        : recordPointers,
            recordTouches         : recordTouches,

            snap                  : snapStatus,
            restrict              : restrictStatus,
            inertia               : inertiaStatus,

            downTime              : downTime,
            downEvent             : downEvent,
            prevEvent             : prevEvent,

            Interactable          : Interactable,
            IOptions              : IOptions,
            interactables         : interactables,
            dropzones             : dropzones,
            pointerIsDown         : pointerIsDown,
            defaultOptions        : defaultOptions,
            defaultActionChecker  : defaultActionChecker,

            actions               : actions,
            dragMove              : dragMove,
            resizeMove            : resizeMove,
            gestureMove           : gestureMove,
            pointerUp             : pointerUp,
            pointerDown           : pointerDown,
            pointerMove           : pointerMove,
            pointerHover          : pointerHover,

            events                : events,
            globalEvents          : globalEvents,
            delegatedEvents       : delegatedEvents
        };
    };

    // expose the functions used to caluclate multi-touch properties
    interact.getTouchAverage  = touchAverage;
    interact.getTouchBBox     = touchBBox;
    interact.getTouchDistance = touchDistance;
    interact.getTouchAngle    = touchAngle;

    interact.getElementRect   = getElementRect;

    /*\
     * interact.margin
     [ method ]
     *
     * Returns or sets the margin for autocheck resizing used in
     * @Interactable.getAction. That is the distance from the bottom and right
     * edges of an element clicking in which will start resizing
     *
     - newValue (number) #optional
     = (number | interact) The current margin value or interact
    \*/
    interact.margin = function (newvalue) {
        if (isNumber(newvalue)) {
            margin = newvalue;

            return interact;
        }
        return margin;
    };

    /*\
     * interact.styleCursor
     [ styleCursor ]
     *
     * Returns or sets whether the cursor style of the document is changed
     * depending on what action is being performed
     *
     - newValue (boolean) #optional
     = (boolean | interact) The current setting of interact
    \*/
    interact.styleCursor = function (newValue) {
        if (isBool(newValue)) {
            defaultOptions.styleCursor = newValue;

            return interact;
        }
        return defaultOptions.styleCursor;
    };

    /*\
     * interact.autoScroll
     [ method ]
     *
     * Returns or sets whether or not actions near the edges of the window or
     * specified container element trigger autoScroll by default
     *
     - options (boolean | object) true or false to simply enable or disable or an object with margin, distance, container and interval properties
     = (object) interact
     * or
     = (boolean | object) `false` if autoscroll is disabled and the default autoScroll settings if it is enabled
    \*/
    interact.autoScroll = function (options) {
        var defaults = defaultOptions.autoScroll;

        if (isObject(options)) {
            defaultOptions.autoScrollEnabled = true;

            if (isNumber(options.margin)) { defaults.margin = options.margin;}
            if (isNumber(options.speed) ) { defaults.speed  = options.speed ;}

            defaults.container =
                (isElement(options.container) || options.container instanceof window.Window
                 ? options.container
                 : defaults.container);

            return interact;
        }

        if (isBool(options)) {
            defaultOptions.autoScrollEnabled = options;

            return interact;
        }

        // return the autoScroll settings if autoScroll is enabled
        // otherwise, return false
        return defaultOptions.autoScrollEnabled? defaults: false;
    };

    /*\
     * interact.snap
     [ method ]
     *
     * Returns or sets whether actions are constrained to a grid or a
     * collection of coordinates
     *
     - options (boolean | object) #optional New settings
     * `true` or `false` to simply enable or disable
     * or an object with some of the following properties
     o {
     o     mode   : 'grid', 'anchor' or 'path',
     o     range  : the distance within which snapping to a point occurs,
     o     actions: ['drag', 'resizex', 'resizey', 'resizexy'], an array of action types that can snapped (['drag'] by default) (no gesture)
     o     grid   : {
     o         x, y: the distances between the grid lines,
     o     },
     o     gridOffset: {
     o             x, y: the x/y-axis values of the grid origin
     o     },
     o     anchors: [
     o         {
     o             x: x coordinate to snap to,
     o             y: y coordinate to snap to,
     o             range: optional range for this anchor
     o         }
     o         {
     o             another anchor
     o         }
     o     ]
     o }
     *
     = (object | interact) The default snap settings object or interact
    \*/
    interact.snap = function (options) {
        var snap = defaultOptions.snap;

        if (isObject(options)) {
            defaultOptions.snapEnabled = true;

            if (isString(options.mode)         ) { snap.mode          = options.mode;          }
            if (isBool  (options.endOnly)      ) { snap.endOnly       = options.endOnly;       }
            if (isNumber(options.range)        ) { snap.range         = options.range;         }
            if (isArray (options.actions)      ) { snap.actions       = options.actions;       }
            if (isArray (options.anchors)      ) { snap.anchors       = options.anchors;       }
            if (isObject(options.grid)         ) { snap.grid          = options.grid;          }
            if (isObject(options.gridOffset)   ) { snap.gridOffset    = options.gridOffset;    }
            if (isObject(options.elementOrigin)) { snap.elementOrigin = options.elementOrigin; }

            return interact;
        }
        if (isBool(options)) {
            defaultOptions.snapEnabled = options;

            return interact;
        }

        return {
            enabled   : defaultOptions.snapEnabled,
            mode      : snap.mode,
            actions   : snap.actions,
            grid      : snap.grid,
            gridOffset: snap.gridOffset,
            anchors   : snap.anchors,
            paths     : snap.paths,
            range     : snap.range,
            locked    : snapStatus.locked,
            x         : snapStatus.snappedX,
            y         : snapStatus.snappedY,
            realX     : snapStatus.realX,
            realY     : snapStatus.realY,
            dx        : snapStatus.dx,
            dy        : snapStatus.dy
        };
    };

    /*\
     * interact.inertia
     [ method ]
     *
     * Returns or sets inertia settings.
     *
     * See @Interactable.inertia
     *
     - options (boolean | object) #optional New settings
     * `true` or `false` to simply enable or disable
     * or an object of inertia options
     = (object | interact) The default inertia settings object or interact
    \*/
    interact.inertia = function (options) {
        var inertia = defaultOptions.inertia;

        if (isObject(options)) {
            defaultOptions.inertiaEnabled = true;

            if (isNumber(options.resistance)       ) { inertia.resistance        = options.resistance       ; }
            if (isNumber(options.minSpeed)         ) { inertia.minSpeed          = options.minSpeed         ; }
            if (isNumber(options.endSpeed)         ) { inertia.endSpeed          = options.endSpeed         ; }
            if (isNumber(options.smoothEndDuration)) { inertia.smoothEndDuration = options.smoothEndDuration; }
            if (isBool  (options.zeroResumeDelta)  ) { inertia.zeroResumeDelta   = options.zeroResumeDelta  ; }
            if (isArray (options.actions)          ) { inertia.actions           = options.actions          ; }

            return interact;
        }
        if (isBool(options)) {
            defaultOptions.inertiaEnabled = options;

            return interact;
        }

        return {
            enabled: defaultOptions.inertiaEnabled,
            resistance: inertia.resistance,
            minSpeed: inertia.minSpeed,
            endSpeed: inertia.endSpeed,
            actions: inertia.actions,
            zeroResumeDelta: inertia.zeroResumeDelta
        };
    };

    /*\
     * interact.supportsTouch
     [ method ]
     *
     = (boolean) Whether or not the browser supports touch input
    \*/
    interact.supportsTouch = function () {
        return supportsTouch;
    };

    /*\
     * interact.currentAction
     [ method ]
     *
     = (string) What action is currently being performed
    \*/
    interact.currentAction = function () {
        return (dragging && 'drag') || (resizing && 'resize') || (gesturing && 'gesture') || null;
    };

    /*\
     * interact.stop
     [ method ]
     *
     * Ends the current interaction
     *
     - event (Event) An event on which to call preventDefault()
     = (object) interact
    \*/
    interact.stop = function (event) {
        if (dragging || resizing || gesturing) {
            autoScroll.stop();
            matches = [];

            if (target.options.styleCursor) {
                document.documentElement.style.cursor = '';
            }

            if (target._gesture) {
                target._gesture.stop();
            }

            // prevent Default only if were previously interacting
            if (event && isFunction(event.preventDefault)) {
                checkAndPreventDefault(event, target);
            }

            if (dragging) {
                activeDrops.dropzones = activeDrops.elements = activeDrops.rects = null;

                for (var i = 0; i < dropzones.length; i++) {
                    if (dropzones[i].selector) {
                        dropzones[i]._dropElements = null;
                    }
                }
            }

            clearTargets();
        }

        pointerIds.splice(0);
        pointerMoves.splice(0);

        pointerIsDown = snapStatus.locked = dragging = resizing = gesturing = false;
        prepared = prevEvent = null;
        inertiaStatus.resumeDx = inertiaStatus.resumeDy = 0;

        return interact;
    };

    /*\
     * interact.dynamicDrop
     [ method ]
     *
     * Returns or sets whether the dimensions of dropzone elements are
     * calculated on every dragmove or only on dragstart for the default
     * dropChecker
     *
     - newValue (boolean) #optional True to check on each move. False to check only before start
     = (boolean | interact) The current setting or interact
    \*/
    interact.dynamicDrop = function (newValue) {
        if (isBool(newValue)) {
            //if (dragging && dynamicDrop !== newValue && !newValue) {
                //calcRects(dropzones);
            //}

            dynamicDrop = newValue;

            return interact;
        }
        return dynamicDrop;
    };

    /*\
     * interact.deltaSource
     [ method ]
     * Returns or sets weather pageX/Y or clientX/Y is used to calculate dx/dy.
     *
     * See @Interactable.deltaSource
     *
     - newValue (string) #optional 'page' or 'client'
     = (string | Interactable) The current setting or interact
    \*/
    interact.deltaSource = function (newValue) {
        if (newValue === 'page' || newValue === 'client') {
            defaultOptions.deltaSource = newValue;

            return this;
        }
        return defaultOptions.deltaSource;
    };


    /*\
     * interact.restrict
     [ method ]
     *
     * Returns or sets the default rectangles within which actions (after snap
     * calculations) are restricted.
     *
     * See @Interactable.restrict
     *
     - newValue (object) #optional an object with keys drag, resize, and/or gesture and rects or Elements as values
     = (object) The current restrictions object or interact
    \*/
    interact.restrict = function (newValue) {
        var defaults = defaultOptions.restrict;

        if (newValue === undefined) {
            return defaultOptions.restrict;
        }

        if (isBool(newValue)) {
            defaultOptions.restrictEnabled = newValue;
        }
        else if (isObject(newValue)) {
            if (isObject(newValue.drag) || /^parent$|^self$/.test(newValue.drag)) {
                defaults.drag = newValue.drag;
            }
            if (isObject(newValue.resize) || /^parent$|^self$/.test(newValue.resize)) {
                defaults.resize = newValue.resize;
            }
            if (isObject(newValue.gesture) || /^parent$|^self$/.test(newValue.gesture)) {
                defaults.gesture = newValue.gesture;
            }

            if (isBool(newValue.endOnly)) {
                defaults.endOnly = newValue.endOnly;
            }

            if (isObject(newValue.elementRect)) {
                defaults.elementRect = newValue.elementRect;
            }

            defaultOptions.restrictEnabled = true;
        }
        else if (newValue === null) {
           defaults.drag = defaults.resize = defaults.gesture = null;
           defaults.endOnly = false;
        }

        return this;
    };

    /*\
     * interact.pointerMoveTolerance
     [ method ]
     * Returns or sets the distance the pointer must be moved before an action
     * sequence occurs. This also affects tolerance for tap events.
     *
     - newValue (number) #optional The movement from the start position must be greater than this value
     = (number | Interactable) The current setting or interact
    \*/
    interact.pointerMoveTolerance = function (newValue) {
        if (isNumber(newValue)) {
            defaultOptions.pointerMoveTolerance = newValue;

            return this;
        }

        return defaultOptions.pointerMoveTolerance;
    };

    if (PointerEvent) {
        if (PointerEvent === window.MSPointerEvent) {
            pEventTypes = {
                up: 'MSPointerUp', down: 'MSPointerDown', over: 'MSPointerOver',
                out: 'MSPointerOut', move: 'MSPointerMove', cancel: 'MSPointerCancel' };
        }
        else {
            pEventTypes = {
                up: 'pointerup', down: 'pointerdown', over: 'pointerover',
                out: 'pointerout', move: 'pointermove', cancel: 'pointercancel' };
        }

        if (GestureEvent === window.MSGestureEvent) {
            gEventTypes = {
                start: 'MSGestureStart', change: 'MSGestureChange', inertia: 'MSInertiaStart', end: 'MSGestureEnd' };
        }
        else {
            gEventTypes = {
                start: 'gesturestart', change: 'gesturechange', inertia: 'inertiastart', end: 'gestureend' };
        }


        events.add(docTarget, pEventTypes.up, collectTaps);

        events.add(docTarget, pEventTypes.down   , selectorDown);
        events.add(docTarget, gEventTypes.change , pointerMove );
        events.add(docTarget, gEventTypes.end    , pointerUp   );
        events.add(docTarget, gEventTypes.inertia, pointerUp   );
        events.add(docTarget, pEventTypes.over   , pointerOver );
        events.add(docTarget, pEventTypes.out    , pointerOut  );

        events.add(docTarget, pEventTypes.move  , recordPointers);
        events.add(docTarget, pEventTypes.up    , recordPointers);
        events.add(docTarget, pEventTypes.cancel, recordPointers);

        // fix problems of wrong targets in IE
        events.add(docTarget, pEventTypes.up, function () {
            if (!(dragging || resizing || gesturing)) {
                pointerIsDown = false;
            }
        });

        selectorGesture = new Gesture();
        selectorGesture.target = document.documentElement;
    }
    else {
        events.add(docTarget, 'mouseup' , collectTaps);
        events.add(docTarget, 'touchend', collectTaps);

        events.add(docTarget, 'mousedown', selectorDown);
        events.add(docTarget, 'mousemove', pointerMove );
        events.add(docTarget, 'mouseup'  , pointerUp   );
        events.add(docTarget, 'mouseover', pointerOver );
        events.add(docTarget, 'mouseout' , pointerOut  );

        events.add(docTarget, 'touchmove'  , recordTouches);
        events.add(docTarget, 'touchend'   , recordTouches);
        events.add(docTarget, 'touchcancel', recordTouches);

        events.add(docTarget, 'touchstart' , selectorDown);
        events.add(docTarget, 'touchmove'  , pointerMove );
        events.add(docTarget, 'touchend'   , pointerUp   );
        events.add(docTarget, 'touchcancel', pointerUp   );
    }

    events.add(windowTarget, 'blur', pointerUp);

    try {
        if (window.frameElement) {
            parentDocTarget._element = window.frameElement.ownerDocument;

            events.add(parentDocTarget   , 'mouseup'      , pointerUp);
            events.add(parentDocTarget   , 'touchend'     , pointerUp);
            events.add(parentDocTarget   , 'touchcancel'  , pointerUp);
            events.add(parentDocTarget   , 'pointerup'    , pointerUp);
            events.add(parentDocTarget   , 'MSPointerUp'  , pointerUp);
            events.add(parentWindowTarget, 'blur'         , pointerUp);
        }
    }
    catch (error) {
        interact.windowParentError = error;
    }

    function indexOf (array, target) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === target) {
                return i;
            }
        }

        return -1;
    }

    function contains (array, target) {
        return indexOf(array, target) !== -1;
    }

    // For IE's lack of Event#preventDefault
    events.add(docTarget, 'selectstart', function (event) {
        if (dragging || resizing || gesturing) {
            checkAndPreventDefault(event, target);
        }
    });

    function matchesSelector (element, selector, nodeList) {
        if (ie8MatchesSelector) {
            return ie8MatchesSelector(element, selector, nodeList);
        }

        return element[prefixedMatchesSelector](selector);
    }

    // For IE8's lack of an Element#matchesSelector
    // taken from http://tanalin.com/en/blog/2012/12/matches-selector-ie8/ and modified
    if (!(prefixedMatchesSelector in Element.prototype) || !isFunction(Element.prototype[prefixedMatchesSelector])) {
        ie8MatchesSelector = function (element, selector, elems) {
            elems = elems || element.parentNode.querySelectorAll(selector);

            for (var i = 0, len = elems.length; i < len; i++) {
                if (elems[i] === element) {
                    return true;
                }
            }

            return false;
        };
    }

    // requestAnimationFrame polyfill
    (function() {
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];

        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            reqFrame = window[vendors[x]+'RequestAnimationFrame'];
            cancelFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!reqFrame) {
            reqFrame = function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!cancelFrame) {
            cancelFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    /* global exports: true, module, define */

    // http://documentcloud.github.io/underscore/docs/underscore.html#section-11
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = interact;
        }
        exports.interact = interact;
    }
    // AMD
    else if (typeof define === 'function' && define.amd) {
        define('interact', function() {
            return interact;
        });
    }
    else {
        window.interact = interact;
    }

} ());

},{}],4:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule AutoFocusMixin
 * @typechecks static-only
 */

"use strict";

var focusNode = require("./focusNode");

var AutoFocusMixin = {
  componentDidMount: function() {
    if (this.props.autoFocus) {
      focusNode(this.getDOMNode());
    }
  }
};

module.exports = AutoFocusMixin;

},{"./focusNode":109}],5:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule BeforeInputEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var SyntheticInputEvent = require("./SyntheticInputEvent");

var keyOf = require("./keyOf");

var canUseTextInputEvent = (
  ExecutionEnvironment.canUseDOM &&
  'TextEvent' in window &&
  !('documentMode' in document || isPresto())
);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
function isPresto() {
  var opera = window.opera;
  return (
    typeof opera === 'object' &&
    typeof opera.version === 'function' &&
    parseInt(opera.version(), 10) <= 12
  );
}

var SPACEBAR_CODE = 32;
var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

var topLevelTypes = EventConstants.topLevelTypes;

// Events and their corresponding property names.
var eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBeforeInput: null}),
      captured: keyOf({onBeforeInputCapture: null})
    },
    dependencies: [
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyPress,
      topLevelTypes.topTextInput,
      topLevelTypes.topPaste
    ]
  }
};

// Track characters inserted via keypress and composition events.
var fallbackChars = null;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
  return (
    (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
    // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    !(nativeEvent.ctrlKey && nativeEvent.altKey)
  );
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 */
var BeforeInputEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var chars;

    if (canUseTextInputEvent) {
      switch (topLevelType) {
        case topLevelTypes.topKeyPress:
          /**
           * If native `textInput` events are available, our goal is to make
           * use of them. However, there is a special case: the spacebar key.
           * In Webkit, preventing default on a spacebar `textInput` event
           * cancels character insertion, but it *also* causes the browser
           * to fall back to its default spacebar behavior of scrolling the
           * page.
           *
           * Tracking at:
           * https://code.google.com/p/chromium/issues/detail?id=355103
           *
           * To avoid this issue, use the keypress event as if no `textInput`
           * event is available.
           */
          var which = nativeEvent.which;
          if (which !== SPACEBAR_CODE) {
            return;
          }

          chars = String.fromCharCode(which);
          break;

        case topLevelTypes.topTextInput:
          // Record the characters to be added to the DOM.
          chars = nativeEvent.data;

          // If it's a spacebar character, assume that we have already handled
          // it at the keypress level and bail immediately.
          if (chars === SPACEBAR_CHAR) {
            return;
          }

          // Otherwise, carry on.
          break;

        default:
          // For other native event types, do nothing.
          return;
      }
    } else {
      switch (topLevelType) {
        case topLevelTypes.topPaste:
          // If a paste event occurs after a keypress, throw out the input
          // chars. Paste events should not lead to BeforeInput events.
          fallbackChars = null;
          break;
        case topLevelTypes.topKeyPress:
          /**
           * As of v27, Firefox may fire keypress events even when no character
           * will be inserted. A few possibilities:
           *
           * - `which` is `0`. Arrow keys, Esc key, etc.
           *
           * - `which` is the pressed key code, but no char is available.
           *   Ex: 'AltGr + d` in Polish. There is no modified character for
           *   this key combination and no character is inserted into the
           *   document, but FF fires the keypress for char code `100` anyway.
           *   No `input` event will occur.
           *
           * - `which` is the pressed key code, but a command combination is
           *   being used. Ex: `Cmd+C`. No character is inserted, and no
           *   `input` event will occur.
           */
          if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
            fallbackChars = String.fromCharCode(nativeEvent.which);
          }
          break;
        case topLevelTypes.topCompositionEnd:
          fallbackChars = nativeEvent.data;
          break;
      }

      // If no changes have occurred to the fallback string, no relevant
      // event has fired and we're done.
      if (fallbackChars === null) {
        return;
      }

      chars = fallbackChars;
    }

    // If no characters are being inserted, no BeforeInput event should
    // be fired.
    if (!chars) {
      return;
    }

    var event = SyntheticInputEvent.getPooled(
      eventTypes.beforeInput,
      topLevelTargetID,
      nativeEvent
    );

    event.data = chars;
    fallbackChars = null;
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }
};

module.exports = BeforeInputEventPlugin;

},{"./EventConstants":18,"./EventPropagators":23,"./ExecutionEnvironment":24,"./SyntheticInputEvent":89,"./keyOf":130}],6:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSProperty
 */

"use strict";

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  columnCount: true,
  fillOpacity: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
var shorthandPropertyExpansions = {
  background: {
    backgroundImage: true,
    backgroundPosition: true,
    backgroundRepeat: true,
    backgroundColor: true
  },
  border: {
    borderWidth: true,
    borderStyle: true,
    borderColor: true
  },
  borderBottom: {
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true
  },
  borderLeft: {
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true
  },
  borderRight: {
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true
  },
  borderTop: {
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true
  },
  font: {
    fontStyle: true,
    fontVariant: true,
    fontWeight: true,
    fontSize: true,
    lineHeight: true,
    fontFamily: true
  }
};

var CSSProperty = {
  isUnitlessNumber: isUnitlessNumber,
  shorthandPropertyExpansions: shorthandPropertyExpansions
};

module.exports = CSSProperty;

},{}],7:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

var dangerousStyleValue = require("./dangerousStyleValue");
var hyphenateStyleName = require("./hyphenateStyleName");
var memoizeStringOnly = require("./memoizeStringOnly");

var processStyleName = memoizeStringOnly(function(styleName) {
  return hyphenateStyleName(styleName);
});

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   * The result should be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function(styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
  setValueForStyles: function(node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
        if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
          for (var individualStyleName in expansion) {
            style[individualStyleName] = '';
          }
        } else {
          style[styleName] = '';
        }
      }
    }
  }

};

module.exports = CSSPropertyOperations;

},{"./CSSProperty":6,"./dangerousStyleValue":104,"./hyphenateStyleName":121,"./memoizeStringOnly":132}],8:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CallbackQueue
 */

"use strict";

var PooledClass = require("./PooledClass");

var invariant = require("./invariant");
var mixInto = require("./mixInto");

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `CallbackQueue.getPooled()`.
 *
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */
function CallbackQueue() {
  this._callbacks = null;
  this._contexts = null;
}

mixInto(CallbackQueue, {

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked.
   *
   * @param {function} callback Invoked when `notifyAll` is invoked.
   * @param {?object} context Context to call `callback` with.
   * @internal
   */
  enqueue: function(callback, context) {
    this._callbacks = this._callbacks || [];
    this._contexts = this._contexts || [];
    this._callbacks.push(callback);
    this._contexts.push(context);
  },

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */
  notifyAll: function() {
    var callbacks = this._callbacks;
    var contexts = this._contexts;
    if (callbacks) {
      ("production" !== process.env.NODE_ENV ? invariant(
        callbacks.length === contexts.length,
        "Mismatched list of contexts in callback queue"
      ) : invariant(callbacks.length === contexts.length));
      this._callbacks = null;
      this._contexts = null;
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i].call(contexts[i]);
      }
      callbacks.length = 0;
      contexts.length = 0;
    }
  },

  /**
   * Resets the internal queue.
   *
   * @internal
   */
  reset: function() {
    this._callbacks = null;
    this._contexts = null;
  },

  /**
   * `PooledClass` looks for this.
   */
  destructor: function() {
    this.reset();
  }

});

PooledClass.addPoolingTo(CallbackQueue);

module.exports = CallbackQueue;

}).call(this,require('_process'))
},{"./PooledClass":29,"./invariant":123,"./mixInto":136,"_process":2}],9:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ChangeEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactUpdates = require("./ReactUpdates");
var SyntheticEvent = require("./SyntheticEvent");

var isEventSupported = require("./isEventSupported");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: keyOf({onChange: null}),
      captured: keyOf({onChangeCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topChange,
      topLevelTypes.topClick,
      topLevelTypes.topFocus,
      topLevelTypes.topInput,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

/**
 * For IE shims
 */
var activeElement = null;
var activeElementID = null;
var activeElementValue = null;
var activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  return (
    elem.nodeName === 'SELECT' ||
    (elem.nodeName === 'INPUT' && elem.type === 'file')
  );
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble = isEventSupported('change') && (
    !('documentMode' in document) || document.documentMode > 8
  );
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = SyntheticEvent.getPooled(
    eventTypes.change,
    activeElementID,
    nativeEvent
  );
  EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  ReactUpdates.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue();
}

function startWatchingForChangeEventIE8(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementID = null;
}

function getTargetIDForChangeEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topChange) {
    return topLevelTargetID;
  }
}
function handleEventsForChangeEventIE8(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForChangeEventIE8();
  }
}


/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  isInputEventSupported = isEventSupported('input') && (
    !('documentMode' in document) || document.documentMode > 9
  );
}

/**
 * (For old IE.) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
var newValueProp =  {
  get: function() {
    return activeElementValueProp.get.call(this);
  },
  set: function(val) {
    // Cast to a string so we can do equality checks.
    activeElementValue = '' + val;
    activeElementValueProp.set.call(this, val);
  }
};

/**
 * (For old IE.) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElementValue = target.value;
  activeElementValueProp = Object.getOwnPropertyDescriptor(
    target.constructor.prototype,
    'value'
  );

  Object.defineProperty(activeElement, 'value', newValueProp);
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For old IE.) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }

  // delete restores the original property definition
  delete activeElement.value;
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementID = null;
  activeElementValue = null;
  activeElementValueProp = null;
}

/**
 * (For old IE.) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  var value = nativeEvent.srcElement.value;
  if (value === activeElementValue) {
    return;
  }
  activeElementValue = value;

  manualDispatchChangeEvent(nativeEvent);
}

/**
 * If a `change` event should be fired, returns the target's ID.
 */
function getTargetIDForInputEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topInput) {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
    return topLevelTargetID;
  }
}

// For IE8 and IE9.
function handleEventsForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetIDForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topSelectionChange ||
      topLevelType === topLevelTypes.topKeyUp ||
      topLevelType === topLevelTypes.topKeyDown) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    if (activeElement && activeElement.value !== activeElementValue) {
      activeElementValue = activeElement.value;
      return activeElementID;
    }
  }
}


/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  return (
    elem.nodeName === 'INPUT' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getTargetIDForClickEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topClick) {
    return topLevelTargetID;
  }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var getTargetIDFunc, handleEventFunc;
    if (shouldUseChangeEvent(topLevelTarget)) {
      if (doesChangeEventBubble) {
        getTargetIDFunc = getTargetIDForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(topLevelTarget)) {
      if (isInputEventSupported) {
        getTargetIDFunc = getTargetIDForInputEvent;
      } else {
        getTargetIDFunc = getTargetIDForInputEventIE;
        handleEventFunc = handleEventsForInputEventIE;
      }
    } else if (shouldUseClickEvent(topLevelTarget)) {
      getTargetIDFunc = getTargetIDForClickEvent;
    }

    if (getTargetIDFunc) {
      var targetID = getTargetIDFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
      if (targetID) {
        var event = SyntheticEvent.getPooled(
          eventTypes.change,
          targetID,
          nativeEvent
        );
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
    }
  }

};

module.exports = ChangeEventPlugin;

},{"./EventConstants":18,"./EventPluginHub":20,"./EventPropagators":23,"./ExecutionEnvironment":24,"./ReactUpdates":79,"./SyntheticEvent":87,"./isEventSupported":124,"./isTextInputElement":126,"./keyOf":130}],10:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ClientReactRootIndex
 * @typechecks
 */

"use strict";

var nextReactRootIndex = 0;

var ClientReactRootIndex = {
  createReactRootIndex: function() {
    return nextReactRootIndex++;
  }
};

module.exports = ClientReactRootIndex;

},{}],11:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CompositionEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticCompositionEvent = require("./SyntheticCompositionEvent");

var getTextContentAccessor = require("./getTextContentAccessor");
var keyOf = require("./keyOf");

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var useCompositionEvent = (
  ExecutionEnvironment.canUseDOM &&
  'CompositionEvent' in window
);

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. In Korean, for example,
// the compositionend event contains only one character regardless of
// how many characters have been composed since compositionstart.
// We therefore use the fallback data while still using the native
// events as triggers.
var useFallbackData = (
  !useCompositionEvent ||
  (
    'documentMode' in document &&
    document.documentMode > 8 &&
    document.documentMode <= 11
  )
);

var topLevelTypes = EventConstants.topLevelTypes;
var currentComposition = null;

// Events and their corresponding property names.
var eventTypes = {
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionEnd: null}),
      captured: keyOf({onCompositionEndCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionEnd,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionStart: null}),
      captured: keyOf({onCompositionStartCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionStart,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionUpdate: null}),
      captured: keyOf({onCompositionUpdateCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topCompositionUpdate,
      topLevelTypes.topKeyDown,
      topLevelTypes.topKeyPress,
      topLevelTypes.topKeyUp,
      topLevelTypes.topMouseDown
    ]
  }
};

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionStart:
      return eventTypes.compositionStart;
    case topLevelTypes.topCompositionEnd:
      return eventTypes.compositionEnd;
    case topLevelTypes.topCompositionUpdate:
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackStart(topLevelType, nativeEvent) {
  return (
    topLevelType === topLevelTypes.topKeyDown &&
    nativeEvent.keyCode === START_KEYCODE
  );
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topKeyUp:
      // Command keys insert or clear IME input.
      return (END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1);
    case topLevelTypes.topKeyDown:
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return (nativeEvent.keyCode !== START_KEYCODE);
    case topLevelTypes.topKeyPress:
    case topLevelTypes.topMouseDown:
    case topLevelTypes.topBlur:
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Helper class stores information about selection and document state
 * so we can figure out what changed at a later date.
 *
 * @param {DOMEventTarget} root
 */
function FallbackCompositionState(root) {
  this.root = root;
  this.startSelection = ReactInputSelection.getSelection(root);
  this.startValue = this.getText();
}

/**
 * Get current text of input.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getText = function() {
  return this.root.value || this.root[getTextContentAccessor()];
};

/**
 * Text that has changed since the start of composition.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getData = function() {
  var endValue = this.getText();
  var prefixLength = this.startSelection.start;
  var suffixLength = this.startValue.length - this.startSelection.end;

  return endValue.substr(
    prefixLength,
    endValue.length - suffixLength - prefixLength
  );
};

/**
 * This plugin creates `onCompositionStart`, `onCompositionUpdate` and
 * `onCompositionEnd` events on inputs, textareas and contentEditable
 * nodes.
 */
var CompositionEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var eventType;
    var data;

    if (useCompositionEvent) {
      eventType = getCompositionEventType(topLevelType);
    } else if (!currentComposition) {
      if (isFallbackStart(topLevelType, nativeEvent)) {
        eventType = eventTypes.compositionStart;
      }
    } else if (isFallbackEnd(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionEnd;
    }

    if (useFallbackData) {
      // The current composition is stored statically and must not be
      // overwritten while composition continues.
      if (!currentComposition && eventType === eventTypes.compositionStart) {
        currentComposition = new FallbackCompositionState(topLevelTarget);
      } else if (eventType === eventTypes.compositionEnd) {
        if (currentComposition) {
          data = currentComposition.getData();
          currentComposition = null;
        }
      }
    }

    if (eventType) {
      var event = SyntheticCompositionEvent.getPooled(
        eventType,
        topLevelTargetID,
        nativeEvent
      );
      if (data) {
        // Inject data generated from fallback path into the synthetic event.
        // This matches the property of native CompositionEventInterface.
        event.data = data;
      }
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }
  }
};

module.exports = CompositionEventPlugin;

},{"./EventConstants":18,"./EventPropagators":23,"./ExecutionEnvironment":24,"./ReactInputSelection":61,"./SyntheticCompositionEvent":85,"./getTextContentAccessor":118,"./keyOf":130}],12:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

"use strict";

var Danger = require("./Danger");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var getTextContentAccessor = require("./getTextContentAccessor");
var invariant = require("./invariant");

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor();

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  // By exploiting arrays returning `undefined` for an undefined index, we can
  // rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. However, using `undefined` is not allowed by all
  // browsers so we must replace it with `null`.
  parentNode.insertBefore(
    childNode,
    parentNode.childNodes[index] || null
  );
}

var updateTextContent;
if (textContentAccessor === 'textContent') {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    node.textContent = text;
  };
} else {
  /**
   * Sets the text content of `node` to `text`.
   *
   * @param {DOMElement} node Node to change
   * @param {string} text New text content
   */
  updateTextContent = function(node, text) {
    // In order to preserve newlines correctly, we can't use .innerText to set
    // the contents (see #1080), so we empty the element then append a text node
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    if (text) {
      var doc = node.ownerDocument || document;
      node.appendChild(doc.createTextNode(text));
    }
  };
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  updateTextContent: updateTextContent,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function(updates, markupList) {
    var update;
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    for (var i = 0; update = updates[i]; i++) {
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
          update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex;
        var updatedChild = update.parentNode.childNodes[updatedIndex];
        var parentID = update.parentID;

        ("production" !== process.env.NODE_ENV ? invariant(
          updatedChild,
          'processUpdates(): Unable to find child %s of element. This ' +
          'probably means the DOM was unexpectedly mutated (e.g., by the ' +
          'browser), usually due to forgetting a <tbody> when using tables, ' +
          'nesting <p> or <a> tags, or using non-SVG elements in an <svg> '+
          'parent. Try inspecting the child nodes of the element with React ' +
          'ID `%s`.',
          updatedIndex,
          parentID
        ) : invariant(updatedChild));

        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][updatedIndex] = updatedChild;

        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
      }
    }

    for (var k = 0; update = updates[k]; k++) {
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(
            update.parentNode,
            renderedMarkup[update.markupIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(
            update.parentNode,
            initialChildren[update.parentID][update.fromIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          updateTextContent(
            update.parentNode,
            update.textContent
          );
          break;
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break;
      }
    }
  }

};

module.exports = DOMChildrenOperations;

}).call(this,require('_process'))
},{"./Danger":15,"./ReactMultiChildUpdateTypes":66,"./getTextContentAccessor":118,"./invariant":123,"_process":2}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMProperty
 * @typechecks static-only
 */

/*jslint bitwise: true */

"use strict";

var invariant = require("./invariant");

var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_SIDE_EFFECTS: 0x4,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_NUMERIC_VALUE: 0x10,
  HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
  HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
  injectDOMPropertyConfig: function(domPropertyConfig) {
    var Properties = domPropertyConfig.Properties || {};
    var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
    var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
    var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

    if (domPropertyConfig.isCustomAttribute) {
      DOMProperty._isCustomAttributeFunctions.push(
        domPropertyConfig.isCustomAttribute
      );
    }

    for (var propName in Properties) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.isStandardName.hasOwnProperty(propName),
        'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' +
        '\'%s\' which has already been injected. You may be accidentally ' +
        'injecting the same DOM property config twice, or you may be ' +
        'injecting two configs that have conflicting property names.',
        propName
      ) : invariant(!DOMProperty.isStandardName.hasOwnProperty(propName)));

      DOMProperty.isStandardName[propName] = true;

      var lowerCased = propName.toLowerCase();
      DOMProperty.getPossibleStandardName[lowerCased] = propName;

      if (DOMAttributeNames.hasOwnProperty(propName)) {
        var attributeName = DOMAttributeNames[propName];
        DOMProperty.getPossibleStandardName[attributeName] = propName;
        DOMProperty.getAttributeName[propName] = attributeName;
      } else {
        DOMProperty.getAttributeName[propName] = lowerCased;
      }

      DOMProperty.getPropertyName[propName] =
        DOMPropertyNames.hasOwnProperty(propName) ?
          DOMPropertyNames[propName] :
          propName;

      if (DOMMutationMethods.hasOwnProperty(propName)) {
        DOMProperty.getMutationMethod[propName] = DOMMutationMethods[propName];
      } else {
        DOMProperty.getMutationMethod[propName] = null;
      }

      var propConfig = Properties[propName];
      DOMProperty.mustUseAttribute[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_ATTRIBUTE;
      DOMProperty.mustUseProperty[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_PROPERTY;
      DOMProperty.hasSideEffects[propName] =
        propConfig & DOMPropertyInjection.HAS_SIDE_EFFECTS;
      DOMProperty.hasBooleanValue[propName] =
        propConfig & DOMPropertyInjection.HAS_BOOLEAN_VALUE;
      DOMProperty.hasNumericValue[propName] =
        propConfig & DOMPropertyInjection.HAS_NUMERIC_VALUE;
      DOMProperty.hasPositiveNumericValue[propName] =
        propConfig & DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE;
      DOMProperty.hasOverloadedBooleanValue[propName] =
        propConfig & DOMPropertyInjection.HAS_OVERLOADED_BOOLEAN_VALUE;

      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.mustUseAttribute[propName] ||
          !DOMProperty.mustUseProperty[propName],
        'DOMProperty: Cannot require using both attribute and property: %s',
        propName
      ) : invariant(!DOMProperty.mustUseAttribute[propName] ||
        !DOMProperty.mustUseProperty[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        DOMProperty.mustUseProperty[propName] ||
          !DOMProperty.hasSideEffects[propName],
        'DOMProperty: Properties that have side effects must use property: %s',
        propName
      ) : invariant(DOMProperty.mustUseProperty[propName] ||
        !DOMProperty.hasSideEffects[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        !!DOMProperty.hasBooleanValue[propName] +
          !!DOMProperty.hasNumericValue[propName] +
          !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1,
        'DOMProperty: Value can be one of boolean, overloaded boolean, or ' +
        'numeric value, but not a combination: %s',
        propName
      ) : invariant(!!DOMProperty.hasBooleanValue[propName] +
        !!DOMProperty.hasNumericValue[propName] +
        !!DOMProperty.hasOverloadedBooleanValue[propName] <= 1));
    }
  }
};
var defaultValueCache = {};

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
var DOMProperty = {

  ID_ATTRIBUTE_NAME: 'data-reactid',

  /**
   * Checks whether a property name is a standard property.
   * @type {Object}
   */
  isStandardName: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties.
   * @type {Object}
   */
  getPossibleStandardName: {},

  /**
   * Mapping from normalized names to attribute names that differ. Attribute
   * names are used when rendering markup or with `*Attribute()`.
   * @type {Object}
   */
  getAttributeName: {},

  /**
   * Mapping from normalized names to properties on DOM node instances.
   * (This includes properties that mutate due to external factors.)
   * @type {Object}
   */
  getPropertyName: {},

  /**
   * Mapping from normalized names to mutation methods. This will only exist if
   * mutation cannot be set simply by the property or `setAttribute()`.
   * @type {Object}
   */
  getMutationMethod: {},

  /**
   * Whether the property must be accessed and mutated as an object property.
   * @type {Object}
   */
  mustUseAttribute: {},

  /**
   * Whether the property must be accessed and mutated using `*Attribute()`.
   * (This includes anything that fails `<propName> in <element>`.)
   * @type {Object}
   */
  mustUseProperty: {},

  /**
   * Whether or not setting a value causes side effects such as triggering
   * resources to be loaded or text selection changes. We must ensure that
   * the value is only set if it has changed.
   * @type {Object}
   */
  hasSideEffects: {},

  /**
   * Whether the property should be removed when set to a falsey value.
   * @type {Object}
   */
  hasBooleanValue: {},

  /**
   * Whether the property must be numeric or parse as a
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasNumericValue: {},

  /**
   * Whether the property must be positive numeric or parse as a positive
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasPositiveNumericValue: {},

  /**
   * Whether the property can be used as a flag as well as with a value. Removed
   * when strictly equal to false; present without a value when strictly equal
   * to true; present with a value otherwise.
   * @type {Object}
   */
  hasOverloadedBooleanValue: {},

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
  _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
  isCustomAttribute: function(attributeName) {
    for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
      var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
      if (isCustomAttributeFn(attributeName)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns the default property value for a DOM property (i.e., not an
   * attribute). Most default values are '' or false, but not all. Worse yet,
   * some (in particular, `type`) vary depending on the type of element.
   *
   * TODO: Is it better to grab all the possible properties when creating an
   * element to avoid having to create the same element twice?
   */
  getDefaultValueForProperty: function(nodeName, prop) {
    var nodeDefaults = defaultValueCache[nodeName];
    var testElement;
    if (!nodeDefaults) {
      defaultValueCache[nodeName] = nodeDefaults = {};
    }
    if (!(prop in nodeDefaults)) {
      testElement = document.createElement(nodeName);
      nodeDefaults[prop] = testElement[prop];
    }
    return nodeDefaults[prop];
  },

  injection: DOMPropertyInjection
};

module.exports = DOMProperty;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMPropertyOperations
 * @typechecks static-only
 */

"use strict";

var DOMProperty = require("./DOMProperty");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var memoizeStringOnly = require("./memoizeStringOnly");
var warning = require("./warning");

function shouldIgnoreValue(name, value) {
  return value == null ||
    (DOMProperty.hasBooleanValue[name] && !value) ||
    (DOMProperty.hasNumericValue[name] && isNaN(value)) ||
    (DOMProperty.hasPositiveNumericValue[name] && (value < 1)) ||
    (DOMProperty.hasOverloadedBooleanValue[name] && value === false);
}

var processAttributeNameAndPrefix = memoizeStringOnly(function(name) {
  return escapeTextForBrowser(name) + '="';
});

if ("production" !== process.env.NODE_ENV) {
  var reactProps = {
    children: true,
    dangerouslySetInnerHTML: true,
    key: true,
    ref: true
  };
  var warnedProperties = {};

  var warnUnknownProperty = function(name) {
    if (reactProps.hasOwnProperty(name) && reactProps[name] ||
        warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
      return;
    }

    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
    var standardName = (
      DOMProperty.isCustomAttribute(lowerCasedName) ?
        lowerCasedName :
      DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ?
        DOMProperty.getPossibleStandardName[lowerCasedName] :
        null
    );

    // For now, only warn when we have a suggested correction. This prevents
    // logging too much when using transferPropsTo.
    ("production" !== process.env.NODE_ENV ? warning(
      standardName == null,
      'Unknown DOM property ' + name + '. Did you mean ' + standardName + '?'
    ) : null);

  };
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {

  /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
  createMarkupForID: function(id) {
    return processAttributeNameAndPrefix(DOMProperty.ID_ATTRIBUTE_NAME) +
      escapeTextForBrowser(id) + '"';
  },

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
  createMarkupForProperty: function(name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      if (shouldIgnoreValue(name, value)) {
        return '';
      }
      var attributeName = DOMProperty.getAttributeName[name];
      if (DOMProperty.hasBooleanValue[name] ||
          (DOMProperty.hasOverloadedBooleanValue[name] && value === true)) {
        return escapeTextForBrowser(attributeName);
      }
      return processAttributeNameAndPrefix(attributeName) +
        escapeTextForBrowser(value) + '"';
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }
      return processAttributeNameAndPrefix(name) +
        escapeTextForBrowser(value) + '"';
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
    return null;
  },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
  setValueForProperty: function(node, name, value) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(name, value)) {
        this.deleteValueForProperty(node, name);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.setAttribute(DOMProperty.getAttributeName[name], '' + value);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        if (!DOMProperty.hasSideEffects[name] || node[propName] !== value) {
          node[propName] = value;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        node.removeAttribute(name);
      } else {
        node.setAttribute(name, '' + value);
      }
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
  deleteValueForProperty: function(node, name) {
    if (DOMProperty.isStandardName.hasOwnProperty(name) &&
        DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.removeAttribute(DOMProperty.getAttributeName[name]);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        var defaultValue = DOMProperty.getDefaultValueForProperty(
          node.nodeName,
          propName
        );
        if (!DOMProperty.hasSideEffects[name] ||
            node[propName] !== defaultValue) {
          node[propName] = defaultValue;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  }

};

module.exports = DOMPropertyOperations;

}).call(this,require('_process'))
},{"./DOMProperty":13,"./escapeTextForBrowser":107,"./memoizeStringOnly":132,"./warning":146,"_process":2}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Danger
 * @typechecks static-only
 */

/*jslint evil: true, sub: true */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createNodesFromMarkup = require("./createNodesFromMarkup");
var emptyFunction = require("./emptyFunction");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
var RESULT_INDEX_ATTR = 'data-danger-index';

/**
 * Extracts the `nodeName` from a string of markup.
 *
 * NOTE: Extracting the `nodeName` does not require a regular expression match
 * because we make assumptions about React-generated markup (i.e. there are no
 * spaces surrounding the opening tag and there is at least one attribute).
 *
 * @param {string} markup String of markup.
 * @return {string} Node name of the supplied markup.
 * @see http://jsperf.com/extract-nodename
 */
function getNodeName(markup) {
  return markup.substring(1, markup.indexOf(' '));
}

var Danger = {

  /**
   * Renders markup into an array of nodes. The markup is expected to render
   * into a list of root nodes. Also, the length of `resultList` and
   * `markupList` should be the same.
   *
   * @param {array<string>} markupList List of markup strings to render.
   * @return {array<DOMElement>} List of rendered nodes.
   * @internal
   */
  dangerouslyRenderMarkup: function(markupList) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyRenderMarkup(...): Cannot render markup in a Worker ' +
      'thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    var nodeName;
    var markupByNodeName = {};
    // Group markup by `nodeName` if a wrap is necessary, else by '*'.
    for (var i = 0; i < markupList.length; i++) {
      ("production" !== process.env.NODE_ENV ? invariant(
        markupList[i],
        'dangerouslyRenderMarkup(...): Missing markup.'
      ) : invariant(markupList[i]));
      nodeName = getNodeName(markupList[i]);
      nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
      markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
      markupByNodeName[nodeName][i] = markupList[i];
    }
    var resultList = [];
    var resultListAssignmentCount = 0;
    for (nodeName in markupByNodeName) {
      if (!markupByNodeName.hasOwnProperty(nodeName)) {
        continue;
      }
      var markupListByNodeName = markupByNodeName[nodeName];

      // This for-in loop skips the holes of the sparse array. The order of
      // iteration should follow the order of assignment, which happens to match
      // numerical index order, but we don't rely on that.
      for (var resultIndex in markupListByNodeName) {
        if (markupListByNodeName.hasOwnProperty(resultIndex)) {
          var markup = markupListByNodeName[resultIndex];

          // Push the requested markup with an additional RESULT_INDEX_ATTR
          // attribute.  If the markup does not start with a < character, it
          // will be discarded below (with an appropriate console.error).
          markupListByNodeName[resultIndex] = markup.replace(
            OPEN_TAG_NAME_EXP,
            // This index will be parsed back out below.
            '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" '
          );
        }
      }

      // Render each group of markup with similar wrapping `nodeName`.
      var renderNodes = createNodesFromMarkup(
        markupListByNodeName.join(''),
        emptyFunction // Do nothing special with <script> tags.
      );

      for (i = 0; i < renderNodes.length; ++i) {
        var renderNode = renderNodes[i];
        if (renderNode.hasAttribute &&
            renderNode.hasAttribute(RESULT_INDEX_ATTR)) {

          resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
          renderNode.removeAttribute(RESULT_INDEX_ATTR);

          ("production" !== process.env.NODE_ENV ? invariant(
            !resultList.hasOwnProperty(resultIndex),
            'Danger: Assigning to an already-occupied result index.'
          ) : invariant(!resultList.hasOwnProperty(resultIndex)));

          resultList[resultIndex] = renderNode;

          // This should match resultList.length and markupList.length when
          // we're done.
          resultListAssignmentCount += 1;

        } else if ("production" !== process.env.NODE_ENV) {
          console.error(
            "Danger: Discarding unexpected node:",
            renderNode
          );
        }
      }
    }

    // Although resultList was populated out of order, it should now be a dense
    // array.
    ("production" !== process.env.NODE_ENV ? invariant(
      resultListAssignmentCount === resultList.length,
      'Danger: Did not assign to every index of resultList.'
    ) : invariant(resultListAssignmentCount === resultList.length));

    ("production" !== process.env.NODE_ENV ? invariant(
      resultList.length === markupList.length,
      'Danger: Expected markup to render %s nodes, but rendered %s.',
      markupList.length,
      resultList.length
    ) : invariant(resultList.length === markupList.length));

    return resultList;
  },

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
  dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' +
      'worker thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    ("production" !== process.env.NODE_ENV ? invariant(markup, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(markup));
    ("production" !== process.env.NODE_ENV ? invariant(
      oldChild.tagName.toLowerCase() !== 'html',
      'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' +
      '<html> node. This is because browser quirks make this unreliable ' +
      'and/or slow. If you want to render to the root you must use ' +
      'server rendering. See renderComponentToString().'
    ) : invariant(oldChild.tagName.toLowerCase() !== 'html'));

    var newChild = createNodesFromMarkup(markup, emptyFunction)[0];
    oldChild.parentNode.replaceChild(newChild, oldChild);
  }

};

module.exports = Danger;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":24,"./createNodesFromMarkup":103,"./emptyFunction":105,"./getMarkupWrap":115,"./invariant":123,"_process":2}],16:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DefaultEventPluginOrder
 */

"use strict";

 var keyOf = require("./keyOf");

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DefaultEventPluginOrder = [
  keyOf({ResponderEventPlugin: null}),
  keyOf({SimpleEventPlugin: null}),
  keyOf({TapEventPlugin: null}),
  keyOf({EnterLeaveEventPlugin: null}),
  keyOf({ChangeEventPlugin: null}),
  keyOf({SelectEventPlugin: null}),
  keyOf({CompositionEventPlugin: null}),
  keyOf({BeforeInputEventPlugin: null}),
  keyOf({AnalyticsEventPlugin: null}),
  keyOf({MobileSafariClickEventPlugin: null})
];

module.exports = DefaultEventPluginOrder;

},{"./keyOf":130}],17:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EnterLeaveEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");

var ReactMount = require("./ReactMount");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;

var eventTypes = {
  mouseEnter: {
    registrationName: keyOf({onMouseEnter: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  },
  mouseLeave: {
    registrationName: keyOf({onMouseLeave: null}),
    dependencies: [
      topLevelTypes.topMouseOut,
      topLevelTypes.topMouseOver
    ]
  }
};

var extractedEvents = [null, null];

var EnterLeaveEventPlugin = {

  eventTypes: eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topMouseOver &&
        (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut &&
        topLevelType !== topLevelTypes.topMouseOver) {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var win;
    if (topLevelTarget.window === topLevelTarget) {
      // `topLevelTarget` is probably a window object.
      win = topLevelTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = topLevelTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from, to;
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      to =
        getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement) ||
        win;
    } else {
      from = win;
      to = topLevelTarget;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var fromID = from ? ReactMount.getID(from) : '';
    var toID = to ? ReactMount.getID(to) : '';

    var leave = SyntheticMouseEvent.getPooled(
      eventTypes.mouseLeave,
      fromID,
      nativeEvent
    );
    leave.type = 'mouseleave';
    leave.target = from;
    leave.relatedTarget = to;

    var enter = SyntheticMouseEvent.getPooled(
      eventTypes.mouseEnter,
      toID,
      nativeEvent
    );
    enter.type = 'mouseenter';
    enter.target = to;
    enter.relatedTarget = from;

    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);

    extractedEvents[0] = leave;
    extractedEvents[1] = enter;

    return extractedEvents;
  }

};

module.exports = EnterLeaveEventPlugin;

},{"./EventConstants":18,"./EventPropagators":23,"./ReactMount":64,"./SyntheticMouseEvent":91,"./keyOf":130}],18:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventConstants
 */

"use strict";

var keyMirror = require("./keyMirror");

var PropagationPhases = keyMirror({bubbled: null, captured: null});

/**
 * Types of raw signals from the browser caught at the top level.
 */
var topLevelTypes = keyMirror({
  topBlur: null,
  topChange: null,
  topClick: null,
  topCompositionEnd: null,
  topCompositionStart: null,
  topCompositionUpdate: null,
  topContextMenu: null,
  topCopy: null,
  topCut: null,
  topDoubleClick: null,
  topDrag: null,
  topDragEnd: null,
  topDragEnter: null,
  topDragExit: null,
  topDragLeave: null,
  topDragOver: null,
  topDragStart: null,
  topDrop: null,
  topError: null,
  topFocus: null,
  topInput: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topLoad: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topPaste: null,
  topReset: null,
  topScroll: null,
  topSelectionChange: null,
  topSubmit: null,
  topTextInput: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
  topWheel: null
});

var EventConstants = {
  topLevelTypes: topLevelTypes,
  PropagationPhases: PropagationPhases
};

module.exports = EventConstants;

},{"./keyMirror":129}],19:[function(require,module,exports){
(function (process){
/**
 * @providesModule EventListener
 * @typechecks
 */

var emptyFunction = require("./emptyFunction");

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen: function(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  capture: function(target, eventType, callback) {
    if (!target.addEventListener) {
      if ("production" !== process.env.NODE_ENV) {
        console.error(
          'Attempted to listen to events during the capture phase on a ' +
          'browser that does not support the capture phase. Your application ' +
          'will not receive some events.'
        );
      }
      return {
        remove: emptyFunction
      };
    } else {
      target.addEventListener(eventType, callback, true);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, true);
        }
      };
    }
  },

  registerDefault: function() {}
};

module.exports = EventListener;

}).call(this,require('_process'))
},{"./emptyFunction":105,"_process":2}],20:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginHub
 */

"use strict";

var EventPluginRegistry = require("./EventPluginRegistry");
var EventPluginUtils = require("./EventPluginUtils");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");
var isEventSupported = require("./isEventSupported");
var monitorCodeUse = require("./monitorCodeUse");

/**
 * Internal store for event listeners
 */
var listenerBank = {};

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @private
 */
var executeDispatchesAndRelease = function(event) {
  if (event) {
    var executeDispatch = EventPluginUtils.executeDispatch;
    // Plugins can provide custom behavior when dispatching events.
    var PluginModule = EventPluginRegistry.getPluginModuleForEvent(event);
    if (PluginModule && PluginModule.executeDispatch) {
      executeDispatch = PluginModule.executeDispatch;
    }
    EventPluginUtils.executeDispatchesInOrder(event, executeDispatch);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var InstanceHandle = null;

function validateInstanceHandle() {
  var invalid = !InstanceHandle||
    !InstanceHandle.traverseTwoPhase ||
    !InstanceHandle.traverseEnterLeave;
  if (invalid) {
    throw new Error('InstanceHandle not injected before use!');
  }
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
  injection: {

    /**
     * @param {object} InjectedMount
     * @public
     */
    injectMount: EventPluginUtils.injection.injectMount,

    /**
     * @param {object} InjectedInstanceHandle
     * @public
     */
    injectInstanceHandle: function(InjectedInstanceHandle) {
      InstanceHandle = InjectedInstanceHandle;
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
    },

    getInstanceHandle: function() {
      if ("production" !== process.env.NODE_ENV) {
        validateInstanceHandle();
      }
      return InstanceHandle;
    },

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName

  },

  eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,

  registrationNameModules: EventPluginRegistry.registrationNameModules,

  /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
  putListener: function(id, registrationName, listener) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !listener || typeof listener === 'function',
      'Expected %s listener to be a function, instead got type %s',
      registrationName, typeof listener
    ) : invariant(!listener || typeof listener === 'function'));

    if ("production" !== process.env.NODE_ENV) {
      // IE8 has no API for event capturing and the `onScroll` event doesn't
      // bubble.
      if (registrationName === 'onScroll' &&
          !isEventSupported('scroll', true)) {
        monitorCodeUse('react_no_scroll_event');
        console.warn('This browser doesn\'t support the `onScroll` event');
      }
    }
    var bankForRegistrationName =
      listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[id] = listener;
  },

  /**
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
  getListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    return bankForRegistrationName && bankForRegistrationName[id];
  },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
  deleteListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    if (bankForRegistrationName) {
      delete bankForRegistrationName[id];
    }
  },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {string} id ID of the DOM element.
   */
  deleteAllListeners: function(id) {
    for (var registrationName in listenerBank) {
      delete listenerBank[registrationName][id];
    }
  },

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0, l = plugins.length; i < l; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(
          topLevelType,
          topLevelTarget,
          topLevelTargetID,
          nativeEvent
        );
        if (extractedEvents) {
          events = accumulate(events, extractedEvents);
        }
      }
    }
    return events;
  },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
  enqueueEvents: function(events) {
    if (events) {
      eventQueue = accumulate(eventQueue, events);
    }
  },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
  processEventQueue: function() {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
    var processingEventQueue = eventQueue;
    eventQueue = null;
    forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
    ("production" !== process.env.NODE_ENV ? invariant(
      !eventQueue,
      'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.'
    ) : invariant(!eventQueue));
  },

  /**
   * These are needed for tests only. Do not use!
   */
  __purge: function() {
    listenerBank = {};
  },

  __getListenerBank: function() {
    return listenerBank;
  }

};

module.exports = EventPluginHub;

}).call(this,require('_process'))
},{"./EventPluginRegistry":21,"./EventPluginUtils":22,"./accumulate":97,"./forEachAccumulated":110,"./invariant":123,"./isEventSupported":124,"./monitorCodeUse":137,"_process":2}],21:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginRegistry
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Injectable ordering of event plugins.
 */
var EventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!EventPluginOrder) {
    // Wait until an `EventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var PluginModule = namesToPlugins[pluginName];
    var pluginIndex = EventPluginOrder.indexOf(pluginName);
    ("production" !== process.env.NODE_ENV ? invariant(
      pluginIndex > -1,
      'EventPluginRegistry: Cannot inject event plugins that do not exist in ' +
      'the plugin ordering, `%s`.',
      pluginName
    ) : invariant(pluginIndex > -1));
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      PluginModule.extractEvents,
      'EventPluginRegistry: Event plugins must implement an `extractEvents` ' +
      'method, but `%s` does not.',
      pluginName
    ) : invariant(PluginModule.extractEvents));
    EventPluginRegistry.plugins[pluginIndex] = PluginModule;
    var publishedEvents = PluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      ("production" !== process.env.NODE_ENV ? invariant(
        publishEventForPlugin(
          publishedEvents[eventName],
          PluginModule,
          eventName
        ),
        'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.',
        eventName,
        pluginName
      ) : invariant(publishEventForPlugin(
        publishedEvents[eventName],
        PluginModule,
        eventName
      )));
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName),
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'event name, `%s`.',
    eventName
  ) : invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName)));
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(
          phasedRegistrationName,
          PluginModule,
          eventName
        );
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      PluginModule,
      eventName
    );
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, PluginModule, eventName) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.registrationNameModules[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'registration name, `%s`.',
    registrationName
  ) : invariant(!EventPluginRegistry.registrationNameModules[registrationName]));
  EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
  EventPluginRegistry.registrationNameDependencies[registrationName] =
    PluginModule.eventTypes[eventName].dependencies;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
  plugins: [],

  /**
   * Mapping from event name to dispatch config
   */
  eventNameDispatchConfigs: {},

  /**
   * Mapping from registration name to plugin module
   */
  registrationNameModules: {},

  /**
   * Mapping from registration name to event name
   */
  registrationNameDependencies: {},

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
  injectEventPluginOrder: function(InjectedEventPluginOrder) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !EventPluginOrder,
      'EventPluginRegistry: Cannot inject event plugin ordering more than ' +
      'once. You are likely trying to load more than one copy of React.'
    ) : invariant(!EventPluginOrder));
    // Clone the ordering so it cannot be dynamically mutated.
    EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
    recomputePluginOrdering();
  },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
  injectEventPluginsByName: function(injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var PluginModule = injectedNamesToPlugins[pluginName];
      if (!namesToPlugins.hasOwnProperty(pluginName) ||
          namesToPlugins[pluginName] !== PluginModule) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !namesToPlugins[pluginName],
          'EventPluginRegistry: Cannot inject two different event plugins ' +
          'using the same name, `%s`.',
          pluginName
        ) : invariant(!namesToPlugins[pluginName]));
        namesToPlugins[pluginName] = PluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
  getPluginModuleForEvent: function(event) {
    var dispatchConfig = event.dispatchConfig;
    if (dispatchConfig.registrationName) {
      return EventPluginRegistry.registrationNameModules[
        dispatchConfig.registrationName
      ] || null;
    }
    for (var phase in dispatchConfig.phasedRegistrationNames) {
      if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue;
      }
      var PluginModule = EventPluginRegistry.registrationNameModules[
        dispatchConfig.phasedRegistrationNames[phase]
      ];
      if (PluginModule) {
        return PluginModule;
      }
    }
    return null;
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _resetEventPlugins: function() {
    EventPluginOrder = null;
    for (var pluginName in namesToPlugins) {
      if (namesToPlugins.hasOwnProperty(pluginName)) {
        delete namesToPlugins[pluginName];
      }
    }
    EventPluginRegistry.plugins.length = 0;

    var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
    for (var eventName in eventNameDispatchConfigs) {
      if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
        delete eventNameDispatchConfigs[eventName];
      }
    }

    var registrationNameModules = EventPluginRegistry.registrationNameModules;
    for (var registrationName in registrationNameModules) {
      if (registrationNameModules.hasOwnProperty(registrationName)) {
        delete registrationNameModules[registrationName];
      }
    }
  }

};

module.exports = EventPluginRegistry;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],22:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginUtils
 */

"use strict";

var EventConstants = require("./EventConstants");

var invariant = require("./invariant");

/**
 * Injected dependencies:
 */

/**
 * - `Mount`: [required] Module that can convert between React dom IDs and
 *   actual node references.
 */
var injection = {
  Mount: null,
  injectMount: function(InjectedMount) {
    injection.Mount = InjectedMount;
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? invariant(
        InjectedMount && InjectedMount.getNode,
        'EventPluginUtils.injection.injectMount(...): Injected Mount module ' +
        'is missing getNode.'
      ) : invariant(InjectedMount && InjectedMount.getNode));
    }
  }
};

var topLevelTypes = EventConstants.topLevelTypes;

function isEndish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseUp ||
         topLevelType === topLevelTypes.topTouchEnd ||
         topLevelType === topLevelTypes.topTouchCancel;
}

function isMoveish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseMove ||
         topLevelType === topLevelTypes.topTouchMove;
}
function isStartish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseDown ||
         topLevelType === topLevelTypes.topTouchStart;
}


var validateEventDispatches;
if ("production" !== process.env.NODE_ENV) {
  validateEventDispatches = function(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var idsIsArr = Array.isArray(dispatchIDs);
    var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
    var listenersLen = listenersIsArr ?
      dispatchListeners.length :
      dispatchListeners ? 1 : 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      idsIsArr === listenersIsArr && IDsLen === listenersLen,
      'EventPluginUtils: Invalid `event`.'
    ) : invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen));
  };
}

/**
 * Invokes `cb(event, listener, id)`. Avoids using call if no scope is
 * provided. The `(listener,id)` pair effectively forms the "dispatch" but are
 * kept separate to conserve memory.
 */
function forEachEventDispatch(event, cb) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      cb(event, dispatchListeners[i], dispatchIDs[i]);
    }
  } else if (dispatchListeners) {
    cb(event, dispatchListeners, dispatchIDs);
  }
}

/**
 * Default implementation of PluginModule.executeDispatch().
 * @param {SyntheticEvent} SyntheticEvent to handle
 * @param {function} Application-level callback
 * @param {string} domID DOM id to pass to the callback.
 */
function executeDispatch(event, listener, domID) {
  event.currentTarget = injection.Mount.getNode(domID);
  var returnValue = listener(event, domID);
  event.currentTarget = null;
  return returnValue;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, executeDispatch) {
  forEachEventDispatch(event, executeDispatch);
  event._dispatchListeners = null;
  event._dispatchIDs = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return id of the first dispatch execution who's listener returns true, or
 * null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchIDs[i])) {
        return dispatchIDs[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchIDs)) {
      return dispatchIDs;
    }
  }
  return null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
function executeDispatchesInOrderStopAtTrue(event) {
  var ret = executeDispatchesInOrderStopAtTrueImpl(event);
  event._dispatchIDs = null;
  event._dispatchListeners = null;
  return ret;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  var dispatchListener = event._dispatchListeners;
  var dispatchID = event._dispatchIDs;
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `event`.'
  ) : invariant(!Array.isArray(dispatchListener)));
  var res = dispatchListener ?
    dispatchListener(event, dispatchID) :
    null;
  event._dispatchListeners = null;
  event._dispatchIDs = null;
  return res;
}

/**
 * @param {SyntheticEvent} event
 * @return {bool} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
  return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
  isEndish: isEndish,
  isMoveish: isMoveish,
  isStartish: isStartish,

  executeDirectDispatch: executeDirectDispatch,
  executeDispatch: executeDispatch,
  executeDispatchesInOrder: executeDispatchesInOrder,
  executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
  hasDispatches: hasDispatches,
  injection: injection,
  useTouchEvents: false
};

module.exports = EventPluginUtils;

}).call(this,require('_process'))
},{"./EventConstants":18,"./invariant":123,"_process":2}],23:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPropagators
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");

var PropagationPhases = EventConstants.PropagationPhases;
var getListener = EventPluginHub.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, event, propagationPhase) {
  var registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, event) {
  if ("production" !== process.env.NODE_ENV) {
    if (!domID) {
      throw new Error('Dispatching id must not be null');
    }
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, event, phase);
  if (listener) {
    event._dispatchListeners = accumulate(event._dispatchListeners, listener);
    event._dispatchIDs = accumulate(event._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We can not perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(
      event.dispatchMarker,
      accumulateDirectionalDispatches,
      event
    );
  }
}


/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, event) {
  if (event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(id, registrationName);
    if (listener) {
      event._dispatchListeners = accumulate(event._dispatchListeners, listener);
      event._dispatchIDs = accumulate(event._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event.dispatchMarker, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  );
}


function accumulateDirectDispatches(events) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}



/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches
};

module.exports = EventPropagators;

}).call(this,require('_process'))
},{"./EventConstants":18,"./EventPluginHub":20,"./accumulate":97,"./forEachAccumulated":110,"_process":2}],24:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],25:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule HTMLDOMPropertyConfig
 */

/*jslint bitwise: true*/

"use strict";

var DOMProperty = require("./DOMProperty");
var ExecutionEnvironment = require("./ExecutionEnvironment");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
var HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
var HAS_POSITIVE_NUMERIC_VALUE =
  DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
var HAS_OVERLOADED_BOOLEAN_VALUE =
  DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;

var hasSVG;
if (ExecutionEnvironment.canUseDOM) {
  var implementation = document.implementation;
  hasSVG = (
    implementation &&
    implementation.hasFeature &&
    implementation.hasFeature(
      'http://www.w3.org/TR/SVG11/feature#BasicStructure',
      '1.1'
    )
  );
}


var HTMLDOMPropertyConfig = {
  isCustomAttribute: RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
  ),
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    // autoFocus is polyfilled/normalized by AutoFocusMixin
    // autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    // To set className on SVG elements, it's necessary to use .setAttribute;
    // this works on HTML elements too in all browsers except IE8. Conveniently,
    // IE8 doesn't support SVG and so we can simply use the attribute in
    // browsers that support SVG and the property in browsers that don't,
    // regardless of whether the element is HTML or SVG.
    className: hasSVG ? MUST_USE_ATTRIBUTE : MUST_USE_PROPERTY,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    frameBorder: MUST_USE_ATTRIBUTE,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    label: null,
    lang: null,
    list: null,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scrollLeft: MUST_USE_PROPERTY,
    scrolling: null,
    scrollTop: MUST_USE_PROPERTY,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcSet: null,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    autoCapitalize: null, // Supported in Mobile Safari for keyboard hints
    autoCorrect: null, // Supported in Mobile Safari for keyboard hints
    itemProp: MUST_USE_ATTRIBUTE, // Microdata: http://schema.org/docs/gs.html
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE, // Microdata: http://schema.org/docs/gs.html
    itemType: MUST_USE_ATTRIBUTE, // Microdata: http://schema.org/docs/gs.html
    property: null // Supports OG in meta tags
  },
  DOMAttributeNames: {
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
  },
  DOMPropertyNames: {
    autoCapitalize: 'autocapitalize',
    autoComplete: 'autocomplete',
    autoCorrect: 'autocorrect',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    encType: 'enctype',
    hrefLang: 'hreflang',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck',
    srcDoc: 'srcdoc',
    srcSet: 'srcset'
  }
};

module.exports = HTMLDOMPropertyConfig;

},{"./DOMProperty":13,"./ExecutionEnvironment":24}],26:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LinkedValueUtils
 * @typechecks static-only
 */

"use strict";

var ReactPropTypes = require("./ReactPropTypes");

var invariant = require("./invariant");

var hasReadOnlyValue = {
  'button': true,
  'checkbox': true,
  'image': true,
  'hidden': true,
  'radio': true,
  'reset': true,
  'submit': true
};

function _assertSingleLink(input) {
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checkedLink == null || input.props.valueLink == null,
    'Cannot provide a checkedLink and a valueLink. If you want to use ' +
    'checkedLink, you probably don\'t want to use valueLink and vice versa.'
  ) : invariant(input.props.checkedLink == null || input.props.valueLink == null));
}
function _assertValueLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.value == null && input.props.onChange == null,
    'Cannot provide a valueLink and a value or onChange event. If you want ' +
    'to use value or onChange, you probably don\'t want to use valueLink.'
  ) : invariant(input.props.value == null && input.props.onChange == null));
}

function _assertCheckedLink(input) {
  _assertSingleLink(input);
  ("production" !== process.env.NODE_ENV ? invariant(
    input.props.checked == null && input.props.onChange == null,
    'Cannot provide a checkedLink and a checked property or onChange event. ' +
    'If you want to use checked or onChange, you probably don\'t want to ' +
    'use checkedLink'
  ) : invariant(input.props.checked == null && input.props.onChange == null));
}

/**
 * @param {SyntheticEvent} e change event to handle
 */
function _handleLinkedValueChange(e) {
  /*jshint validthis:true */
  this.props.valueLink.requestChange(e.target.value);
}

/**
  * @param {SyntheticEvent} e change event to handle
  */
function _handleLinkedCheckChange(e) {
  /*jshint validthis:true */
  this.props.checkedLink.requestChange(e.target.checked);
}

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueUtils = {
  Mixin: {
    propTypes: {
      value: function(props, propName, componentName) {
        if (!props[propName] ||
            hasReadOnlyValue[props.type] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return;
        }
        return new Error(
          'You provided a `value` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultValue`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      checked: function(props, propName, componentName) {
        if (!props[propName] ||
            props.onChange ||
            props.readOnly ||
            props.disabled) {
          return;
        }
        return new Error(
          'You provided a `checked` prop to a form field without an ' +
          '`onChange` handler. This will render a read-only field. If ' +
          'the field should be mutable use `defaultChecked`. Otherwise, ' +
          'set either `onChange` or `readOnly`.'
        );
      },
      onChange: ReactPropTypes.func
    }
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return input.props.valueLink.value;
    }
    return input.props.value;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
  getChecked: function(input) {
    if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return input.props.checkedLink.value;
    }
    return input.props.checked;
  },

  /**
   * @param {ReactComponent} input Form component
   * @return {function} change callback either from onChange prop or link.
   */
  getOnChange: function(input) {
    if (input.props.valueLink) {
      _assertValueLink(input);
      return _handleLinkedValueChange;
    } else if (input.props.checkedLink) {
      _assertCheckedLink(input);
      return _handleLinkedCheckChange;
    }
    return input.props.onChange;
  }
};

module.exports = LinkedValueUtils;

}).call(this,require('_process'))
},{"./ReactPropTypes":72,"./invariant":123,"_process":2}],27:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LocalEventTrapMixin
 */

"use strict";

var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");

function remove(event) {
  event.remove();
}

var LocalEventTrapMixin = {
  trapBubbledEvent:function(topLevelType, handlerBaseName) {
    ("production" !== process.env.NODE_ENV ? invariant(this.isMounted(), 'Must be mounted to trap events') : invariant(this.isMounted()));
    var listener = ReactBrowserEventEmitter.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      this.getDOMNode()
    );
    this._localEventListeners = accumulate(this._localEventListeners, listener);
  },

  // trapCapturedEvent would look nearly identical. We don't implement that
  // method because it isn't currently needed.

  componentWillUnmount:function() {
    if (this._localEventListeners) {
      forEachAccumulated(this._localEventListeners, remove);
    }
  }
};

module.exports = LocalEventTrapMixin;

}).call(this,require('_process'))
},{"./ReactBrowserEventEmitter":32,"./accumulate":97,"./forEachAccumulated":110,"./invariant":123,"_process":2}],28:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule MobileSafariClickEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");

var emptyFunction = require("./emptyFunction");

var topLevelTypes = EventConstants.topLevelTypes;

/**
 * Mobile Safari does not fire properly bubble click events on non-interactive
 * elements, which means delegated click listeners do not fire. The workaround
 * for this bug involves attaching an empty click listener on the target node.
 *
 * This particular plugin works around the bug by attaching an empty click
 * listener on `touchstart` (which does fire on every element).
 */
var MobileSafariClickEventPlugin = {

  eventTypes: null,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topTouchStart) {
      var target = nativeEvent.target;
      if (target && !target.onclick) {
        target.onclick = emptyFunction;
      }
    }
  }

};

module.exports = MobileSafariClickEventPlugin;

},{"./EventConstants":18,"./emptyFunction":105}],29:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule PooledClass
 */

"use strict";

var invariant = require("./invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function(a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function(a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance instanceof Klass,
    'Trying to release an instance into a pool of a different type.'
  ) : invariant(instance instanceof Klass));
  if (instance.destructor) {
    instance.destructor();
  }
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],30:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule React
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var EventPluginUtils = require("./EventPluginUtils");
var ReactChildren = require("./ReactChildren");
var ReactComponent = require("./ReactComponent");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactDOM = require("./ReactDOM");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");
var ReactPropTypes = require("./ReactPropTypes");
var ReactServerRendering = require("./ReactServerRendering");
var ReactTextComponent = require("./ReactTextComponent");

var onlyChild = require("./onlyChild");

ReactDefaultInjection.inject();

var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    only: onlyChild
  },
  DOM: ReactDOM,
  PropTypes: ReactPropTypes,
  initializeTouchEvents: function(shouldUseTouch) {
    EventPluginUtils.useTouchEvents = shouldUseTouch;
  },
  createClass: ReactCompositeComponent.createClass,
  createDescriptor: function(type, props, children) {
    var args = Array.prototype.slice.call(arguments, 1);
    return type.apply(null, args);
  },
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  renderComponent: ReactPerf.measure(
    'React',
    'renderComponent',
    ReactMount.renderComponent
  ),
  renderComponentToString: ReactServerRendering.renderComponentToString,
  renderComponentToStaticMarkup:
    ReactServerRendering.renderComponentToStaticMarkup,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  isValidClass: ReactDescriptor.isValidFactory,
  isValidComponent: ReactDescriptor.isValidDescriptor,
  withContext: ReactContext.withContext,
  __internals: {
    Component: ReactComponent,
    CurrentOwner: ReactCurrentOwner,
    DOMComponent: ReactDOMComponent,
    DOMPropertyOperations: DOMPropertyOperations,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    MultiChild: ReactMultiChild,
    TextComponent: ReactTextComponent
  }
};

if ("production" !== process.env.NODE_ENV) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  if (ExecutionEnvironment.canUseDOM &&
      window.top === window.self &&
      navigator.userAgent.indexOf('Chrome') > -1) {
    console.debug(
      'Download the React DevTools for a better development experience: ' +
      'http://fb.me/react-devtools'
    );

    var expectedFeatures = [
      // shims
      Array.isArray,
      Array.prototype.every,
      Array.prototype.forEach,
      Array.prototype.indexOf,
      Array.prototype.map,
      Date.now,
      Function.prototype.bind,
      Object.keys,
      String.prototype.split,
      String.prototype.trim,

      // shams
      Object.create,
      Object.freeze
    ];

    for (var i in expectedFeatures) {
      if (!expectedFeatures[i]) {
        console.error(
          'One or more ES5 shim/shams expected by React are not available: ' +
          'http://fb.me/react-warning-polyfills'
        );
        break;
      }
    }
  }
}

// Version exists only in the open-source version of React, not in Facebook's
// internal version.
React.version = '0.11.1';

module.exports = React;

}).call(this,require('_process'))
},{"./DOMPropertyOperations":14,"./EventPluginUtils":22,"./ExecutionEnvironment":24,"./ReactChildren":33,"./ReactComponent":34,"./ReactCompositeComponent":36,"./ReactContext":37,"./ReactCurrentOwner":38,"./ReactDOM":39,"./ReactDOMComponent":41,"./ReactDefaultInjection":51,"./ReactDescriptor":54,"./ReactInstanceHandles":62,"./ReactMount":64,"./ReactMultiChild":65,"./ReactPerf":68,"./ReactPropTypes":72,"./ReactServerRendering":76,"./ReactTextComponent":78,"./onlyChild":138,"_process":2}],31:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactBrowserComponentMixin
 */

"use strict";

var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");

var ReactBrowserComponentMixin = {
  /**
   * Returns the DOM node rendered by this component.
   *
   * @return {DOMElement} The root node of this component.
   * @final
   * @protected
   */
  getDOMNode: function() {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isMounted(),
      'getDOMNode(): A component must be mounted to have a DOM node.'
    ) : invariant(this.isMounted()));
    if (ReactEmptyComponent.isNullComponentID(this._rootNodeID)) {
      return null;
    }
    return ReactMount.getNode(this._rootNodeID);
  }
};

module.exports = ReactBrowserComponentMixin;

}).call(this,require('_process'))
},{"./ReactEmptyComponent":56,"./ReactMount":64,"./invariant":123,"_process":2}],32:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactBrowserEventEmitter
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPluginRegistry = require("./EventPluginRegistry");
var ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
var ViewportMetrics = require("./ViewportMetrics");

var isEventSupported = require("./isEventSupported");
var merge = require("./merge");

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactEventListener, which is injected and can therefore support pluggable
 *    event sources. This is the only work that occurs in the main thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

var alreadyListeningTo = {};
var isMonitoringScrollValue = false;
var reactTopListenersCounter = 0;

// For events like 'submit' which don't consistently bubble (which we trap at a
// lower node than `document`), binding at `document` would cause duplicate
// events so we don't include them here
var topEventMapping = {
  topBlur: 'blur',
  topChange: 'change',
  topClick: 'click',
  topCompositionEnd: 'compositionend',
  topCompositionStart: 'compositionstart',
  topCompositionUpdate: 'compositionupdate',
  topContextMenu: 'contextmenu',
  topCopy: 'copy',
  topCut: 'cut',
  topDoubleClick: 'dblclick',
  topDrag: 'drag',
  topDragEnd: 'dragend',
  topDragEnter: 'dragenter',
  topDragExit: 'dragexit',
  topDragLeave: 'dragleave',
  topDragOver: 'dragover',
  topDragStart: 'dragstart',
  topDrop: 'drop',
  topFocus: 'focus',
  topInput: 'input',
  topKeyDown: 'keydown',
  topKeyPress: 'keypress',
  topKeyUp: 'keyup',
  topMouseDown: 'mousedown',
  topMouseMove: 'mousemove',
  topMouseOut: 'mouseout',
  topMouseOver: 'mouseover',
  topMouseUp: 'mouseup',
  topPaste: 'paste',
  topScroll: 'scroll',
  topSelectionChange: 'selectionchange',
  topTextInput: 'textInput',
  topTouchCancel: 'touchcancel',
  topTouchEnd: 'touchend',
  topTouchMove: 'touchmove',
  topTouchStart: 'touchstart',
  topWheel: 'wheel'
};

/**
 * To ensure no conflicts with other potential React instances on the page
 */
var topListenersIDKey = "_reactListenersID" + String(Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * `ReactBrowserEventEmitter` is used to attach top-level event listeners. For
 * example:
 *
 *   ReactBrowserEventEmitter.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
var ReactBrowserEventEmitter = merge(ReactEventEmitterMixin, {

  /**
   * Injectable event backend
   */
  ReactEventListener: null,

  injection: {
    /**
     * @param {object} ReactEventListener
     */
    injectReactEventListener: function(ReactEventListener) {
      ReactEventListener.setHandleTopLevel(
        ReactBrowserEventEmitter.handleTopLevel
      );
      ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
    }
  },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function(enabled) {
    if (ReactBrowserEventEmitter.ReactEventListener) {
      ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
    }
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function() {
    return !!(
      ReactBrowserEventEmitter.ReactEventListener &&
      ReactBrowserEventEmitter.ReactEventListener.isEnabled()
    );
  },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
  listenTo: function(registrationName, contentDocumentHandle) {
    var mountAt = contentDocumentHandle;
    var isListening = getListeningForDocument(mountAt);
    var dependencies = EventPluginRegistry.
      registrationNameDependencies[registrationName];

    var topLevelTypes = EventConstants.topLevelTypes;
    for (var i = 0, l = dependencies.length; i < l; i++) {
      var dependency = dependencies[i];
      if (!(
            isListening.hasOwnProperty(dependency) &&
            isListening[dependency]
          )) {
        if (dependency === topLevelTypes.topWheel) {
          if (isEventSupported('wheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'wheel',
              mountAt
            );
          } else if (isEventSupported('mousewheel')) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'mousewheel',
              mountAt
            );
          } else {
            // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topWheel,
              'DOMMouseScroll',
              mountAt
            );
          }
        } else if (dependency === topLevelTypes.topScroll) {

          if (isEventSupported('scroll', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topScroll,
              'scroll',
              mountAt
            );
          } else {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topScroll,
              'scroll',
              ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE
            );
          }
        } else if (dependency === topLevelTypes.topFocus ||
            dependency === topLevelTypes.topBlur) {

          if (isEventSupported('focus', true)) {
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topFocus,
              'focus',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
              topLevelTypes.topBlur,
              'blur',
              mountAt
            );
          } else if (isEventSupported('focusin')) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topFocus,
              'focusin',
              mountAt
            );
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
              topLevelTypes.topBlur,
              'focusout',
              mountAt
            );
          }

          // to make sure blur and focus event listeners are only attached once
          isListening[topLevelTypes.topBlur] = true;
          isListening[topLevelTypes.topFocus] = true;
        } else if (topEventMapping.hasOwnProperty(dependency)) {
          ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
            dependency,
            topEventMapping[dependency],
            mountAt
          );
        }

        isListening[dependency] = true;
      }
    }
  },

  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
      topLevelType,
      handlerBaseName,
      handle
    );
  },

  /**
   * Listens to window scroll and resize events. We cache scroll values so that
   * application code can access them without triggering reflows.
   *
   * NOTE: Scroll events do not bubble.
   *
   * @see http://www.quirksmode.org/dom/events/scroll.html
   */
  ensureScrollValueMonitoring: function(){
    if (!isMonitoringScrollValue) {
      var refresh = ViewportMetrics.refreshScrollValues;
      ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
      isMonitoringScrollValue = true;
    }
  },

  eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,

  registrationNameModules: EventPluginHub.registrationNameModules,

  putListener: EventPluginHub.putListener,

  getListener: EventPluginHub.getListener,

  deleteListener: EventPluginHub.deleteListener,

  deleteAllListeners: EventPluginHub.deleteAllListeners

});

module.exports = ReactBrowserEventEmitter;

},{"./EventConstants":18,"./EventPluginHub":20,"./EventPluginRegistry":21,"./ReactEventEmitterMixin":58,"./ViewportMetrics":96,"./isEventSupported":124,"./merge":133}],33:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactChildren
 */

"use strict";

var PooledClass = require("./PooledClass");

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var threeArgumentPooler = PooledClass.threeArgumentPooler;

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.forEachFunction = forEachFunction;
  this.forEachContext = forEachContext;
}
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(traverseContext, child, name, i) {
  var forEachBookKeeping = traverseContext;
  forEachBookKeeping.forEachFunction.call(
    forEachBookKeeping.forEachContext, child, i);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc.
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }

  var traverseContext =
    ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, mapFunction, mapContext) {
  this.mapResult = mapResult;
  this.mapFunction = mapFunction;
  this.mapContext = mapContext;
}
PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);

function mapSingleChildIntoContext(traverseContext, child, name, i) {
  var mapBookKeeping = traverseContext;
  var mapResult = mapBookKeeping.mapResult;

  var keyUnique = !mapResult.hasOwnProperty(name);
  ("production" !== process.env.NODE_ENV ? warning(
    keyUnique,
    'ReactChildren.map(...): Encountered two children with the same key, ' +
    '`%s`. Child keys must be unique; when two children share a key, only ' +
    'the first child will be used.',
    name
  ) : null);

  if (keyUnique) {
    var mappedChild =
      mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
    mapResult[name] = mappedChild;
  }
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * TODO: This may likely break any calls to `ReactChildren.map` that were
 * previously relying on the fact that we guarded against null children.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} mapFunction.
 * @param {*} mapContext Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }

  var mapResult = {};
  var traverseContext = MapBookKeeping.getPooled(mapResult, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
  return mapResult;
}

function forEachSingleChildDummy(traverseContext, child, name, i) {
  return null;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, forEachSingleChildDummy, null);
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  count: countChildren
};

module.exports = ReactChildren;

}).call(this,require('_process'))
},{"./PooledClass":29,"./traverseAllChildren":145,"./warning":146,"_process":2}],34:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponent
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactOwner = require("./ReactOwner");
var ReactUpdates = require("./ReactUpdates");

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");

/**
 * Every React component is in one of these life cycles.
 */
var ComponentLifeCycle = keyMirror({
  /**
   * Mounted components have a DOM node representation and are capable of
   * receiving new props.
   */
  MOUNTED: null,
  /**
   * Unmounted components are inactive and cannot receive new props.
   */
  UNMOUNTED: null
});

var injected = false;

/**
 * Optionally injectable environment dependent cleanup hook. (server vs.
 * browser etc). Example: A browser system caches DOM nodes based on component
 * ID and must remove that cache entry when this instance is unmounted.
 *
 * @private
 */
var unmountIDFromEnvironment = null;

/**
 * The "image" of a component tree, is the platform specific (typically
 * serialized) data that represents a tree of lower level UI building blocks.
 * On the web, this "image" is HTML markup which describes a construction of
 * low level `div` and `span` nodes. Other platforms may have different
 * encoding of this "image". This must be injected.
 *
 * @private
 */
var mountImageIntoNode = null;

/**
 * Components are the basic units of composition in React.
 *
 * Every component accepts a set of keyed input parameters known as "props" that
 * are initialized by the constructor. Once a component is mounted, the props
 * can be mutated using `setProps` or `replaceProps`.
 *
 * Every component is capable of the following operations:
 *
 *   `mountComponent`
 *     Initializes the component, renders markup, and registers event listeners.
 *
 *   `receiveComponent`
 *     Updates the rendered DOM nodes to match the given component.
 *
 *   `unmountComponent`
 *     Releases any resources allocated by this component.
 *
 * Components can also be "owned" by other components. Being owned by another
 * component means being constructed by that component. This is different from
 * being the child of a component, which means having a DOM representation that
 * is a child of the DOM representation of that component.
 *
 * @class ReactComponent
 */
var ReactComponent = {

  injection: {
    injectEnvironment: function(ReactComponentEnvironment) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !injected,
        'ReactComponent: injectEnvironment() can only be called once.'
      ) : invariant(!injected));
      mountImageIntoNode = ReactComponentEnvironment.mountImageIntoNode;
      unmountIDFromEnvironment =
        ReactComponentEnvironment.unmountIDFromEnvironment;
      ReactComponent.BackendIDOperations =
        ReactComponentEnvironment.BackendIDOperations;
      injected = true;
    }
  },

  /**
   * @internal
   */
  LifeCycle: ComponentLifeCycle,

  /**
   * Injected module that provides ability to mutate individual properties.
   * Injected into the base class because many different subclasses need access
   * to this.
   *
   * @internal
   */
  BackendIDOperations: null,

  /**
   * Base functionality for every ReactComponent constructor. Mixed into the
   * `ReactComponent` prototype, but exposed statically for easy access.
   *
   * @lends {ReactComponent.prototype}
   */
  Mixin: {

    /**
     * Checks whether or not this component is mounted.
     *
     * @return {boolean} True if mounted, false otherwise.
     * @final
     * @protected
     */
    isMounted: function() {
      return this._lifeCycleState === ComponentLifeCycle.MOUNTED;
    },

    /**
     * Sets a subset of the props.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    setProps: function(partialProps, callback) {
      // Merge with the pending descriptor if it exists, otherwise with existing
      // descriptor props.
      var descriptor = this._pendingDescriptor || this._descriptor;
      this.replaceProps(
        merge(descriptor.props, partialProps),
        callback
      );
    },

    /**
     * Replaces all of the props.
     *
     * @param {object} props New props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    replaceProps: function(props, callback) {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'replaceProps(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      ("production" !== process.env.NODE_ENV ? invariant(
        this._mountDepth === 0,
        'replaceProps(...): You called `setProps` or `replaceProps` on a ' +
        'component with a parent. This is an anti-pattern since props will ' +
        'get reactively updated when rendered. Instead, change the owner\'s ' +
        '`render` method to pass the correct value as props to the component ' +
        'where it is created.'
      ) : invariant(this._mountDepth === 0));
      // This is a deoptimized path. We optimize for always having a descriptor.
      // This creates an extra internal descriptor.
      this._pendingDescriptor = ReactDescriptor.cloneAndReplaceProps(
        this._pendingDescriptor || this._descriptor,
        props
      );
      ReactUpdates.enqueueUpdate(this, callback);
    },

    /**
     * Schedule a partial update to the props. Only used for internal testing.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @internal
     */
    _setPropsInternal: function(partialProps, callback) {
      // This is a deoptimized path. We optimize for always having a descriptor.
      // This creates an extra internal descriptor.
      var descriptor = this._pendingDescriptor || this._descriptor;
      this._pendingDescriptor = ReactDescriptor.cloneAndReplaceProps(
        descriptor,
        merge(descriptor.props, partialProps)
      );
      ReactUpdates.enqueueUpdate(this, callback);
    },

    /**
     * Base constructor for all React components.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.construct.call(this, ...)`.
     *
     * @param {ReactDescriptor} descriptor
     * @internal
     */
    construct: function(descriptor) {
      // This is the public exposed props object after it has been processed
      // with default props. The descriptor's props represents the true internal
      // state of the props.
      this.props = descriptor.props;
      // Record the component responsible for creating this component.
      // This is accessible through the descriptor but we maintain an extra
      // field for compatibility with devtools and as a way to make an
      // incremental update. TODO: Consider deprecating this field.
      this._owner = descriptor._owner;

      // All components start unmounted.
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;

      // See ReactUpdates.
      this._pendingCallbacks = null;

      // We keep the old descriptor and a reference to the pending descriptor
      // to track updates.
      this._descriptor = descriptor;
      this._pendingDescriptor = null;
    },

    /**
     * Initializes the component, renders markup, and registers event listeners.
     *
     * NOTE: This does not insert any nodes into the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.mountComponent.call(this, ...)`.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
     * @param {number} mountDepth number of components in the owner hierarchy.
     * @return {?string} Rendered markup to be inserted into the DOM.
     * @internal
     */
    mountComponent: function(rootID, transaction, mountDepth) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !this.isMounted(),
        'mountComponent(%s, ...): Can only mount an unmounted component. ' +
        'Make sure to avoid storing components between renders or reusing a ' +
        'single component instance in multiple places.',
        rootID
      ) : invariant(!this.isMounted()));
      var props = this._descriptor.props;
      if (props.ref != null) {
        var owner = this._descriptor._owner;
        ReactOwner.addComponentAsRefTo(this, props.ref, owner);
      }
      this._rootNodeID = rootID;
      this._lifeCycleState = ComponentLifeCycle.MOUNTED;
      this._mountDepth = mountDepth;
      // Effectively: return '';
    },

    /**
     * Releases any resources allocated by `mountComponent`.
     *
     * NOTE: This does not remove any nodes from the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.unmountComponent.call(this)`.
     *
     * @internal
     */
    unmountComponent: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'unmountComponent(): Can only unmount a mounted component.'
      ) : invariant(this.isMounted()));
      var props = this.props;
      if (props.ref != null) {
        ReactOwner.removeComponentAsRefFrom(this, props.ref, this._owner);
      }
      unmountIDFromEnvironment(this._rootNodeID);
      this._rootNodeID = null;
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;
    },

    /**
     * Given a new instance of this component, updates the rendered DOM nodes
     * as if that instance was rendered instead.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.receiveComponent.call(this, ...)`.
     *
     * @param {object} nextComponent Next set of properties.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    receiveComponent: function(nextDescriptor, transaction) {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'receiveComponent(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      this._pendingDescriptor = nextDescriptor;
      this.performUpdateIfNecessary(transaction);
    },

    /**
     * If `_pendingDescriptor` is set, update the component.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    performUpdateIfNecessary: function(transaction) {
      if (this._pendingDescriptor == null) {
        return;
      }
      var prevDescriptor = this._descriptor;
      var nextDescriptor = this._pendingDescriptor;
      this._descriptor = nextDescriptor;
      this.props = nextDescriptor.props;
      this._owner = nextDescriptor._owner;
      this._pendingDescriptor = null;
      this.updateComponent(transaction, prevDescriptor);
    },

    /**
     * Updates the component's currently mounted representation.
     *
     * @param {ReactReconcileTransaction} transaction
     * @param {object} prevDescriptor
     * @internal
     */
    updateComponent: function(transaction, prevDescriptor) {
      var nextDescriptor = this._descriptor;

      // If either the owner or a `ref` has changed, make sure the newest owner
      // has stored a reference to `this`, and the previous owner (if different)
      // has forgotten the reference to `this`. We use the descriptor instead
      // of the public this.props because the post processing cannot determine
      // a ref. The ref conceptually lives on the descriptor.

      // TODO: Should this even be possible? The owner cannot change because
      // it's forbidden by shouldUpdateReactComponent. The ref can change
      // if you swap the keys of but not the refs. Reconsider where this check
      // is made. It probably belongs where the key checking and
      // instantiateReactComponent is done.

      if (nextDescriptor._owner !== prevDescriptor._owner ||
          nextDescriptor.props.ref !== prevDescriptor.props.ref) {
        if (prevDescriptor.props.ref != null) {
          ReactOwner.removeComponentAsRefFrom(
            this, prevDescriptor.props.ref, prevDescriptor._owner
          );
        }
        // Correct, even if the owner is the same, and only the ref has changed.
        if (nextDescriptor.props.ref != null) {
          ReactOwner.addComponentAsRefTo(
            this,
            nextDescriptor.props.ref,
            nextDescriptor._owner
          );
        }
      }
    },

    /**
     * Mounts this component and inserts it into the DOM.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @internal
     * @see {ReactMount.renderComponent}
     */
    mountComponentIntoNode: function(rootID, container, shouldReuseMarkup) {
      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(
        this._mountComponentIntoNode,
        this,
        rootID,
        container,
        transaction,
        shouldReuseMarkup
      );
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    },

    /**
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {ReactReconcileTransaction} transaction
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @private
     */
    _mountComponentIntoNode: function(
        rootID,
        container,
        transaction,
        shouldReuseMarkup) {
      var markup = this.mountComponent(rootID, transaction, 0);
      mountImageIntoNode(markup, container, shouldReuseMarkup);
    },

    /**
     * Checks if this component is owned by the supplied `owner` component.
     *
     * @param {ReactComponent} owner Component to check.
     * @return {boolean} True if `owners` owns this component.
     * @final
     * @internal
     */
    isOwnedBy: function(owner) {
      return this._owner === owner;
    },

    /**
     * Gets another component, that shares the same owner as this one, by ref.
     *
     * @param {string} ref of a sibling Component.
     * @return {?ReactComponent} the actual sibling Component.
     * @final
     * @internal
     */
    getSiblingByRef: function(ref) {
      var owner = this._owner;
      if (!owner || !owner.refs) {
        return null;
      }
      return owner.refs[ref];
    }
  }
};

module.exports = ReactComponent;

}).call(this,require('_process'))
},{"./ReactDescriptor":54,"./ReactOwner":67,"./ReactUpdates":79,"./invariant":123,"./keyMirror":129,"./merge":133,"_process":2}],35:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponentBrowserEnvironment
 */

/*jslint evil: true */

"use strict";

var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");

var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");


var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;


/**
 * Abstracts away all functionality of `ReactComponent` requires knowledge of
 * the browser context.
 */
var ReactComponentBrowserEnvironment = {
  ReactReconcileTransaction: ReactReconcileTransaction,

  BackendIDOperations: ReactDOMIDOperations,

  /**
   * If a particular environment requires that some resources be cleaned up,
   * specify this in the injected Mixin. In the DOM, we would likely want to
   * purge any cached node ID lookups.
   *
   * @private
   */
  unmountIDFromEnvironment: function(rootNodeID) {
    ReactMount.purgeID(rootNodeID);
  },

  /**
   * @param {string} markup Markup string to place into the DOM Element.
   * @param {DOMElement} container DOM Element to insert markup into.
   * @param {boolean} shouldReuseMarkup Should reuse the existing markup in the
   * container if possible.
   */
  mountImageIntoNode: ReactPerf.measure(
    'ReactComponentBrowserEnvironment',
    'mountImageIntoNode',
    function(markup, container, shouldReuseMarkup) {
      ("production" !== process.env.NODE_ENV ? invariant(
        container && (
          container.nodeType === ELEMENT_NODE_TYPE ||
            container.nodeType === DOC_NODE_TYPE
        ),
        'mountComponentIntoNode(...): Target container is not valid.'
      ) : invariant(container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
          container.nodeType === DOC_NODE_TYPE
      )));

      if (shouldReuseMarkup) {
        if (ReactMarkupChecksum.canReuseMarkup(
          markup,
          getReactRootElementInContainer(container))) {
          return;
        } else {
          ("production" !== process.env.NODE_ENV ? invariant(
            container.nodeType !== DOC_NODE_TYPE,
            'You\'re trying to render a component to the document using ' +
            'server rendering but the checksum was invalid. This usually ' +
            'means you rendered a different component type or props on ' +
            'the client from the one on the server, or your render() ' +
            'methods are impure. React cannot handle this case due to ' +
            'cross-browser quirks by rendering at the document root. You ' +
            'should look for environment dependent code in your components ' +
            'and ensure the props are the same client and server side.'
          ) : invariant(container.nodeType !== DOC_NODE_TYPE));

          if ("production" !== process.env.NODE_ENV) {
            console.warn(
              'React attempted to use reuse markup in a container but the ' +
              'checksum was invalid. This generally means that you are ' +
              'using server rendering and the markup generated on the ' +
              'server was not what the client was expecting. React injected ' +
              'new markup to compensate which works but you have lost many ' +
              'of the benefits of server rendering. Instead, figure out ' +
              'why the markup being generated is different on the client ' +
              'or server.'
            );
          }
        }
      }

      ("production" !== process.env.NODE_ENV ? invariant(
        container.nodeType !== DOC_NODE_TYPE,
        'You\'re trying to render a component to the document but ' +
          'you didn\'t use server rendering. We can\'t do this ' +
          'without using server rendering due to cross-browser quirks. ' +
          'See renderComponentToString() for server rendering.'
      ) : invariant(container.nodeType !== DOC_NODE_TYPE));

      setInnerHTML(container, markup);
    }
  )
};

module.exports = ReactComponentBrowserEnvironment;

}).call(this,require('_process'))
},{"./ReactDOMIDOperations":43,"./ReactMarkupChecksum":63,"./ReactMount":64,"./ReactPerf":68,"./ReactReconcileTransaction":74,"./getReactRootElementInContainer":117,"./invariant":123,"./setInnerHTML":141,"_process":2}],36:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCompositeComponent
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactDescriptorValidator = require("./ReactDescriptorValidator");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactErrorUtils = require("./ReactErrorUtils");
var ReactOwner = require("./ReactOwner");
var ReactPerf = require("./ReactPerf");
var ReactPropTransferer = require("./ReactPropTransferer");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
var ReactUpdates = require("./ReactUpdates");

var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");
var mixInto = require("./mixInto");
var monitorCodeUse = require("./monitorCodeUse");
var mapObject = require("./mapObject");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

/**
 * Policies that describe methods in `ReactCompositeComponentInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base ReactCompositeComponent class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});


var injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactCompositeComponent`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactCompositeComponentInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will available on the prototype.
 *
 * @interface ReactCompositeComponentInterface
 * @internal
 */
var ReactCompositeComponentInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
  statics: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
  contextTypes: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
  childContextTypes: SpecPolicy.DEFINE_MANY,

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * @return {object}
   * @optional
   */
  getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,



  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,



  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function(Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function(Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  childContextTypes: function(Constructor, childContextTypes) {
    validateTypeDef(
      Constructor,
      childContextTypes,
      ReactPropTypeLocations.childContext
    );
    Constructor.childContextTypes = merge(
      Constructor.childContextTypes,
      childContextTypes
    );
  },
  contextTypes: function(Constructor, contextTypes) {
    validateTypeDef(
      Constructor,
      contextTypes,
      ReactPropTypeLocations.context
    );
    Constructor.contextTypes = merge(Constructor.contextTypes, contextTypes);
  },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
  getDefaultProps: function(Constructor, getDefaultProps) {
    if (Constructor.getDefaultProps) {
      Constructor.getDefaultProps = createMergedResultFunction(
        Constructor.getDefaultProps,
        getDefaultProps
      );
    } else {
      Constructor.getDefaultProps = getDefaultProps;
    }
  },
  propTypes: function(Constructor, propTypes) {
    validateTypeDef(
      Constructor,
      propTypes,
      ReactPropTypeLocations.prop
    );
    Constructor.propTypes = merge(Constructor.propTypes, propTypes);
  },
  statics: function(Constructor, statics) {
    mixStaticSpecIntoComponent(Constructor, statics);
  }
};

function getDeclarationErrorAddendum(component) {
  var owner = component._owner || null;
  if (owner && owner.constructor && owner.constructor.displayName) {
    return ' Check the render method of `' + owner.constructor.displayName +
      '`.';
  }
  return '';
}

function validateTypeDef(Constructor, typeDef, location) {
  for (var propName in typeDef) {
    if (typeDef.hasOwnProperty(propName)) {
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof typeDef[propName] == 'function',
        '%s: %s type `%s` is invalid; it must be a function, usually from ' +
        'React.PropTypes.',
        Constructor.displayName || 'ReactCompositeComponent',
        ReactPropTypeLocationNames[location],
        propName
      ) : invariant(typeof typeDef[propName] == 'function'));
    }
  }
}

function validateMethodOverride(proto, name) {
  var specPolicy = ReactCompositeComponentInterface.hasOwnProperty(name) ?
    ReactCompositeComponentInterface[name] :
    null;

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactCompositeComponentMixin.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.OVERRIDE_BASE,
      'ReactCompositeComponentInterface: You are attempting to override ' +
      '`%s` from your class specification. Ensure that your method names ' +
      'do not overlap with React methods.',
      name
    ) : invariant(specPolicy === SpecPolicy.OVERRIDE_BASE));
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (proto.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.DEFINE_MANY ||
      specPolicy === SpecPolicy.DEFINE_MANY_MERGED,
      'ReactCompositeComponentInterface: You are attempting to define ' +
      '`%s` on your component more than once. This conflict may be due ' +
      'to a mixin.',
      name
    ) : invariant(specPolicy === SpecPolicy.DEFINE_MANY ||
    specPolicy === SpecPolicy.DEFINE_MANY_MERGED));
  }
}

function validateLifeCycleOnReplaceState(instance) {
  var compositeLifeCycleState = instance._compositeLifeCycleState;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
    'replaceState(...): Can only update a mounted or mounting component.'
  ) : invariant(instance.isMounted() ||
    compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE,
    'replaceState(...): Cannot update during an existing state transition ' +
    '(such as within `render`). This could potentially cause an infinite ' +
    'loop so it is forbidden.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
    'replaceState(...): Cannot update while unmounting component. This ' +
    'usually means you called setState() on an unmounted component.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
}

/**
 * Custom version of `mixInto` which handles policy validation and reserved
 * specification keys when building `ReactCompositeComponent` classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !ReactDescriptor.isValidFactory(spec),
    'ReactCompositeComponent: You\'re attempting to ' +
    'use a component class as a mixin. Instead, just use a regular object.'
  ) : invariant(!ReactDescriptor.isValidFactory(spec)));
  ("production" !== process.env.NODE_ENV ? invariant(
    !ReactDescriptor.isValidDescriptor(spec),
    'ReactCompositeComponent: You\'re attempting to ' +
    'use a component as a mixin. Instead, just use a regular object.'
  ) : invariant(!ReactDescriptor.isValidDescriptor(spec)));

  var proto = Constructor.prototype;
  for (var name in spec) {
    var property = spec[name];
    if (!spec.hasOwnProperty(name)) {
      continue;
    }

    validateMethodOverride(proto, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactCompositeComponent methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isCompositeComponentMethod =
        ReactCompositeComponentInterface.hasOwnProperty(name);
      var isAlreadyDefined = proto.hasOwnProperty(name);
      var markedDontBind = property && property.__reactDontBind;
      var isFunction = typeof property === 'function';
      var shouldAutoBind =
        isFunction &&
        !isCompositeComponentMethod &&
        !isAlreadyDefined &&
        !markedDontBind;

      if (shouldAutoBind) {
        if (!proto.__reactAutoBindMap) {
          proto.__reactAutoBindMap = {};
        }
        proto.__reactAutoBindMap[name] = property;
        proto[name] = property;
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactCompositeComponentInterface[name];

          // These cases should already be caught by validateMethodOverride
          ("production" !== process.env.NODE_ENV ? invariant(
            isCompositeComponentMethod && (
              specPolicy === SpecPolicy.DEFINE_MANY_MERGED ||
              specPolicy === SpecPolicy.DEFINE_MANY
            ),
            'ReactCompositeComponent: Unexpected spec policy %s for key %s ' +
            'when mixing in component specs.',
            specPolicy,
            name
          ) : invariant(isCompositeComponentMethod && (
            specPolicy === SpecPolicy.DEFINE_MANY_MERGED ||
            specPolicy === SpecPolicy.DEFINE_MANY
          )));

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
          if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          if ("production" !== process.env.NODE_ENV) {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
            if (typeof property === 'function' && spec.displayName) {
              proto[name].displayName = spec.displayName + '_' + name;
            }
          }
        }
      }
    }
  }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
  if (!statics) {
    return;
  }
  for (var name in statics) {
    var property = statics[name];
    if (!statics.hasOwnProperty(name)) {
      continue;
    }

    var isInherited = name in Constructor;
    var result = property;
    if (isInherited) {
      var existingProperty = Constructor[name];
      var existingType = typeof existingProperty;
      var propertyType = typeof property;
      ("production" !== process.env.NODE_ENV ? invariant(
        existingType === 'function' && propertyType === 'function',
        'ReactCompositeComponent: You are attempting to define ' +
        '`%s` on your component more than once, but that is only supported ' +
        'for functions, which are chained together. This conflict may be ' +
        'due to a mixin.',
        name
      ) : invariant(existingType === 'function' && propertyType === 'function'));
      result = createChainedFunction(existingProperty, property);
    }
    Constructor[name] = result;
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeObjectsWithNoDuplicateKeys(one, two) {
  ("production" !== process.env.NODE_ENV ? invariant(
    one && two && typeof one === 'object' && typeof two === 'object',
    'mergeObjectsWithNoDuplicateKeys(): Cannot merge non-objects'
  ) : invariant(one && two && typeof one === 'object' && typeof two === 'object'));

  mapObject(two, function(value, key) {
    ("production" !== process.env.NODE_ENV ? invariant(
      one[key] === undefined,
      'mergeObjectsWithNoDuplicateKeys(): ' +
      'Tried to merge two objects with the same key: %s',
      key
    ) : invariant(one[key] === undefined));
    one[key] = value;
  });
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    var a = one.apply(this, arguments);
    var b = two.apply(this, arguments);
    if (a == null) {
      return b;
    } else if (b == null) {
      return a;
    }
    return mergeObjectsWithNoDuplicateKeys(a, b);
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * `ReactCompositeComponent` maintains an auxiliary life cycle state in
 * `this._compositeLifeCycleState` (which can be null).
 *
 * This is different from the life cycle state maintained by `ReactComponent` in
 * `this._lifeCycleState`. The following diagram shows how the states overlap in
 * time. There are times when the CompositeLifeCycle is null - at those times it
 * is only meaningful to look at ComponentLifeCycle alone.
 *
 * Top Row: ReactComponent.ComponentLifeCycle
 * Low Row: ReactComponent.CompositeLifeCycle
 *
 * +-------+------------------------------------------------------+--------+
 * |  UN   |                    MOUNTED                           |   UN   |
 * |MOUNTED|                                                      | MOUNTED|
 * +-------+------------------------------------------------------+--------+
 * |       ^--------+   +------+   +------+   +------+   +--------^        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |    0--|MOUNTING|-0-|RECEIV|-0-|RECEIV|-0-|RECEIV|-0-|   UN   |--->0   |
 * |       |        |   |PROPS |   | PROPS|   | STATE|   |MOUNTING|        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       +--------+   +------+   +------+   +------+   +--------+        |
 * |       |                                                      |        |
 * +-------+------------------------------------------------------+--------+
 */
var CompositeLifeCycle = keyMirror({
  /**
   * Components in the process of being mounted respond to state changes
   * differently.
   */
  MOUNTING: null,
  /**
   * Components in the process of being unmounted are guarded against state
   * changes.
   */
  UNMOUNTING: null,
  /**
   * Components that are mounted and receiving new props respond to state
   * changes differently.
   */
  RECEIVING_PROPS: null,
  /**
   * Components that are mounted and receiving new state are guarded against
   * additional state changes.
   */
  RECEIVING_STATE: null
});

/**
 * @lends {ReactCompositeComponent.prototype}
 */
var ReactCompositeComponentMixin = {

  /**
   * Base constructor for all composite component.
   *
   * @param {ReactDescriptor} descriptor
   * @final
   * @internal
   */
  construct: function(descriptor) {
    // Children can be either an array or more than one argument
    ReactComponent.Mixin.construct.apply(this, arguments);
    ReactOwner.Mixin.construct.apply(this, arguments);

    this.state = null;
    this._pendingState = null;

    // This is the public post-processed context. The real context and pending
    // context lives on the descriptor.
    this.context = null;

    this._compositeLifeCycleState = null;
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function() {
    return ReactComponent.Mixin.isMounted.call(this) &&
      this._compositeLifeCycleState !== CompositeLifeCycle.MOUNTING;
  },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING;

      if (this.__reactAutoBindMap) {
        this._bindAutoBindMethods();
      }

      this.context = this._processContext(this._descriptor._context);
      this.props = this._processProps(this.props);

      this.state = this.getInitialState ? this.getInitialState() : null;
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof this.state === 'object' && !Array.isArray(this.state),
        '%s.getInitialState(): must return an object or null',
        this.constructor.displayName || 'ReactCompositeComponent'
      ) : invariant(typeof this.state === 'object' && !Array.isArray(this.state)));

      this._pendingState = null;
      this._pendingForceUpdate = false;

      if (this.componentWillMount) {
        this.componentWillMount();
        // When mounting, calls to `setState` by `componentWillMount` will set
        // `this._pendingState` without triggering a re-render.
        if (this._pendingState) {
          this.state = this._pendingState;
          this._pendingState = null;
        }
      }

      this._renderedComponent = instantiateReactComponent(
        this._renderValidatedComponent()
      );

      // Done with mounting, `setState` will now trigger UI changes.
      this._compositeLifeCycleState = null;
      var markup = this._renderedComponent.mountComponent(
        rootID,
        transaction,
        mountDepth + 1
      );
      if (this.componentDidMount) {
        transaction.getReactMountReady().enqueue(this.componentDidMount, this);
      }
      return markup;
    }
  ),

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function() {
    this._compositeLifeCycleState = CompositeLifeCycle.UNMOUNTING;
    if (this.componentWillUnmount) {
      this.componentWillUnmount();
    }
    this._compositeLifeCycleState = null;

    this._renderedComponent.unmountComponent();
    this._renderedComponent = null;

    ReactComponent.Mixin.unmountComponent.call(this);

    // Some existing components rely on this.props even after they've been
    // destroyed (in event handlers).
    // TODO: this.props = null;
    // TODO: this.state = null;
  },

  /**
   * Sets a subset of the state. Always use this or `replaceState` to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  setState: function(partialState, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof partialState === 'object' || partialState == null,
      'setState(...): takes an object of state variables to update.'
    ) : invariant(typeof partialState === 'object' || partialState == null));
    if ("production" !== process.env.NODE_ENV){
      ("production" !== process.env.NODE_ENV ? warning(
        partialState != null,
        'setState(...): You passed an undefined or null state object; ' +
        'instead, use forceUpdate().'
      ) : null);
    }
    // Merge with `_pendingState` if it exists, otherwise with existing state.
    this.replaceState(
      merge(this._pendingState || this.state, partialState),
      callback
    );
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {object} completeState Next state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  replaceState: function(completeState, callback) {
    validateLifeCycleOnReplaceState(this);
    this._pendingState = completeState;
    if (this._compositeLifeCycleState !== CompositeLifeCycle.MOUNTING) {
      // If we're in a componentWillMount handler, don't enqueue a rerender
      // because ReactUpdates assumes we're in a browser context (which is wrong
      // for server rendering) and we're about to do a render anyway.
      // TODO: The callback here is ignored when setState is called from
      // componentWillMount. Either fix it or disallow doing so completely in
      // favor of getInitialState.
      ReactUpdates.enqueueUpdate(this, callback);
    }
  },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`, and asserts that they are valid.
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
  _processContext: function(context) {
    var maskedContext = null;
    var contextTypes = this.constructor.contextTypes;
    if (contextTypes) {
      maskedContext = {};
      for (var contextName in contextTypes) {
        maskedContext[contextName] = context[contextName];
      }
      if ("production" !== process.env.NODE_ENV) {
        this._checkPropTypes(
          contextTypes,
          maskedContext,
          ReactPropTypeLocations.context
        );
      }
    }
    return maskedContext;
  },

  /**
   * @param {object} currentContext
   * @return {object}
   * @private
   */
  _processChildContext: function(currentContext) {
    var childContext = this.getChildContext && this.getChildContext();
    var displayName = this.constructor.displayName || 'ReactCompositeComponent';
    if (childContext) {
      ("production" !== process.env.NODE_ENV ? invariant(
        typeof this.constructor.childContextTypes === 'object',
        '%s.getChildContext(): childContextTypes must be defined in order to ' +
        'use getChildContext().',
        displayName
      ) : invariant(typeof this.constructor.childContextTypes === 'object'));
      if ("production" !== process.env.NODE_ENV) {
        this._checkPropTypes(
          this.constructor.childContextTypes,
          childContext,
          ReactPropTypeLocations.childContext
        );
      }
      for (var name in childContext) {
        ("production" !== process.env.NODE_ENV ? invariant(
          name in this.constructor.childContextTypes,
          '%s.getChildContext(): key "%s" is not defined in childContextTypes.',
          displayName,
          name
        ) : invariant(name in this.constructor.childContextTypes));
      }
      return merge(currentContext, childContext);
    }
    return currentContext;
  },

  /**
   * Processes props by setting default values for unspecified props and
   * asserting that the props are valid. Does not mutate its argument; returns
   * a new props object with defaults merged in.
   *
   * @param {object} newProps
   * @return {object}
   * @private
   */
  _processProps: function(newProps) {
    var defaultProps = this.constructor.defaultProps;
    var props;
    if (defaultProps) {
      props = merge(newProps);
      for (var propName in defaultProps) {
        if (typeof props[propName] === 'undefined') {
          props[propName] = defaultProps[propName];
        }
      }
    } else {
      props = newProps;
    }
    if ("production" !== process.env.NODE_ENV) {
      var propTypes = this.constructor.propTypes;
      if (propTypes) {
        this._checkPropTypes(propTypes, props, ReactPropTypeLocations.prop);
      }
    }
    return props;
  },

  /**
   * Assert that the props are valid
   *
   * @param {object} propTypes Map of prop name to a ReactPropType
   * @param {object} props
   * @param {string} location e.g. "prop", "context", "child context"
   * @private
   */
  _checkPropTypes: function(propTypes, props, location) {
    // TODO: Stop validating prop types here and only use the descriptor
    // validation.
    var componentName = this.constructor.displayName;
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error =
          propTypes[propName](props, propName, componentName, location);
        if (error instanceof Error) {
          // We may want to extend this logic for similar errors in
          // renderComponent calls, so I'm abstracting it away into
          // a function to minimize refactoring in the future
          var addendum = getDeclarationErrorAddendum(this);
          ("production" !== process.env.NODE_ENV ? warning(false, error.message + addendum) : null);
        }
      }
    }
  },

  /**
   * If any of `_pendingDescriptor`, `_pendingState`, or `_pendingForceUpdate`
   * is set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  performUpdateIfNecessary: function(transaction) {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    // Do not trigger a state transition if we are in the middle of mounting or
    // receiving props because both of those will already be doing this.
    if (compositeLifeCycleState === CompositeLifeCycle.MOUNTING ||
        compositeLifeCycleState === CompositeLifeCycle.RECEIVING_PROPS) {
      return;
    }

    if (this._pendingDescriptor == null &&
        this._pendingState == null &&
        !this._pendingForceUpdate) {
      return;
    }

    var nextContext = this.context;
    var nextProps = this.props;
    var nextDescriptor = this._descriptor;
    if (this._pendingDescriptor != null) {
      nextDescriptor = this._pendingDescriptor;
      nextContext = this._processContext(nextDescriptor._context);
      nextProps = this._processProps(nextDescriptor.props);
      this._pendingDescriptor = null;

      this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_PROPS;
      if (this.componentWillReceiveProps) {
        this.componentWillReceiveProps(nextProps, nextContext);
      }
    }

    this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_STATE;

    var nextState = this._pendingState || this.state;
    this._pendingState = null;

    try {
      var shouldUpdate =
        this._pendingForceUpdate ||
        !this.shouldComponentUpdate ||
        this.shouldComponentUpdate(nextProps, nextState, nextContext);

      if ("production" !== process.env.NODE_ENV) {
        if (typeof shouldUpdate === "undefined") {
          console.warn(
            (this.constructor.displayName || 'ReactCompositeComponent') +
            '.shouldComponentUpdate(): Returned undefined instead of a ' +
            'boolean value. Make sure to return true or false.'
          );
        }
      }

      if (shouldUpdate) {
        this._pendingForceUpdate = false;
        // Will set `this.props`, `this.state` and `this.context`.
        this._performComponentUpdate(
          nextDescriptor,
          nextProps,
          nextState,
          nextContext,
          transaction
        );
      } else {
        // If it's determined that a component should not update, we still want
        // to set props and state.
        this._descriptor = nextDescriptor;
        this.props = nextProps;
        this.state = nextState;
        this.context = nextContext;

        // Owner cannot change because shouldUpdateReactComponent doesn't allow
        // it. TODO: Remove this._owner completely.
        this._owner = nextDescriptor._owner;
      }
    } finally {
      this._compositeLifeCycleState = null;
    }
  },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {ReactDescriptor} nextDescriptor Next descriptor
   * @param {object} nextProps Next public object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {?object} nextContext Next public object to set as context.
   * @param {ReactReconcileTransaction} transaction
   * @private
   */
  _performComponentUpdate: function(
    nextDescriptor,
    nextProps,
    nextState,
    nextContext,
    transaction
  ) {
    var prevDescriptor = this._descriptor;
    var prevProps = this.props;
    var prevState = this.state;
    var prevContext = this.context;

    if (this.componentWillUpdate) {
      this.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._descriptor = nextDescriptor;
    this.props = nextProps;
    this.state = nextState;
    this.context = nextContext;

    // Owner cannot change because shouldUpdateReactComponent doesn't allow
    // it. TODO: Remove this._owner completely.
    this._owner = nextDescriptor._owner;

    this.updateComponent(
      transaction,
      prevDescriptor
    );

    if (this.componentDidUpdate) {
      transaction.getReactMountReady().enqueue(
        this.componentDidUpdate.bind(this, prevProps, prevState, prevContext),
        this
      );
    }
  },

  receiveComponent: function(nextDescriptor, transaction) {
    if (nextDescriptor === this._descriptor &&
        nextDescriptor._owner != null) {
      // Since descriptors are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the descriptor. We explicitly check for the existence of an owner since
      // it's possible for a descriptor created outside a composite to be
      // deeply mutated and reused.
      return;
    }

    ReactComponent.Mixin.receiveComponent.call(
      this,
      nextDescriptor,
      transaction
    );
  },

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactDescriptor} prevDescriptor
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'updateComponent',
    function(transaction, prevParentDescriptor) {
      ReactComponent.Mixin.updateComponent.call(
        this,
        transaction,
        prevParentDescriptor
      );

      var prevComponentInstance = this._renderedComponent;
      var prevDescriptor = prevComponentInstance._descriptor;
      var nextDescriptor = this._renderValidatedComponent();
      if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
        prevComponentInstance.receiveComponent(nextDescriptor, transaction);
      } else {
        // These two IDs are actually the same! But nothing should rely on that.
        var thisID = this._rootNodeID;
        var prevComponentID = prevComponentInstance._rootNodeID;
        prevComponentInstance.unmountComponent();
        this._renderedComponent = instantiateReactComponent(nextDescriptor);
        var nextMarkup = this._renderedComponent.mountComponent(
          thisID,
          transaction,
          this._mountDepth + 1
        );
        ReactComponent.BackendIDOperations.dangerouslyReplaceNodeWithMarkupByID(
          prevComponentID,
          nextMarkup
        );
      }
    }
  ),

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldUpdateComponent`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {?function} callback Called after update is complete.
   * @final
   * @protected
   */
  forceUpdate: function(callback) {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isMounted() ||
        compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
      'forceUpdate(...): Can only force an update on mounted or mounting ' +
        'components.'
    ) : invariant(this.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
    ("production" !== process.env.NODE_ENV ? invariant(
      compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
      compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
      'forceUpdate(...): Cannot force an update while unmounting component ' +
      'or during an existing state transition (such as within `render`).'
    ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
    compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
    this._pendingForceUpdate = true;
    ReactUpdates.enqueueUpdate(this, callback);
  },

  /**
   * @private
   */
  _renderValidatedComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    '_renderValidatedComponent',
    function() {
      var renderedComponent;
      var previousContext = ReactContext.current;
      ReactContext.current = this._processChildContext(
        this._descriptor._context
      );
      ReactCurrentOwner.current = this;
      try {
        renderedComponent = this.render();
        if (renderedComponent === null || renderedComponent === false) {
          renderedComponent = ReactEmptyComponent.getEmptyComponent();
          ReactEmptyComponent.registerNullComponentID(this._rootNodeID);
        } else {
          ReactEmptyComponent.deregisterNullComponentID(this._rootNodeID);
        }
      } finally {
        ReactContext.current = previousContext;
        ReactCurrentOwner.current = null;
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        ReactDescriptor.isValidDescriptor(renderedComponent),
        '%s.render(): A valid ReactComponent must be returned. You may have ' +
          'returned undefined, an array or some other invalid object.',
        this.constructor.displayName || 'ReactCompositeComponent'
      ) : invariant(ReactDescriptor.isValidDescriptor(renderedComponent)));
      return renderedComponent;
    }
  ),

  /**
   * @private
   */
  _bindAutoBindMethods: function() {
    for (var autoBindKey in this.__reactAutoBindMap) {
      if (!this.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
        continue;
      }
      var method = this.__reactAutoBindMap[autoBindKey];
      this[autoBindKey] = this._bindAutoBindMethod(ReactErrorUtils.guard(
        method,
        this.constructor.displayName + '.' + autoBindKey
      ));
    }
  },

  /**
   * Binds a method to the component.
   *
   * @param {function} method Method to be bound.
   * @private
   */
  _bindAutoBindMethod: function(method) {
    var component = this;
    var boundMethod = function() {
      return method.apply(component, arguments);
    };
    if ("production" !== process.env.NODE_ENV) {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis ) {var args=Array.prototype.slice.call(arguments,1);
        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          monitorCodeUse('react_bind_warning', { component: componentName });
          console.warn(
            'bind(): React component methods may only be bound to the ' +
            'component instance. See ' + componentName
          );
        } else if (!args.length) {
          monitorCodeUse('react_bind_warning', { component: componentName });
          console.warn(
            'bind(): You are binding a component method to the component. ' +
            'React does this for you automatically in a high-performance ' +
            'way, so you can safely remove this call. See ' + componentName
          );
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }
};

var ReactCompositeComponentBase = function() {};
mixInto(ReactCompositeComponentBase, ReactComponent.Mixin);
mixInto(ReactCompositeComponentBase, ReactOwner.Mixin);
mixInto(ReactCompositeComponentBase, ReactPropTransferer.Mixin);
mixInto(ReactCompositeComponentBase, ReactCompositeComponentMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactCompositeComponent
 * @extends ReactComponent
 * @extends ReactOwner
 * @extends ReactPropTransferer
 */
var ReactCompositeComponent = {

  LifeCycle: CompositeLifeCycle,

  Base: ReactCompositeComponentBase,

  /**
   * Creates a composite component class given a class specification.
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function(spec) {
    var Constructor = function(props, owner) {
      this.construct(props, owner);
    };
    Constructor.prototype = new ReactCompositeComponentBase();
    Constructor.prototype.constructor = Constructor;

    injectedMixins.forEach(
      mixSpecIntoComponent.bind(null, Constructor)
    );

    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    ("production" !== process.env.NODE_ENV ? invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    ) : invariant(Constructor.prototype.render));

    if ("production" !== process.env.NODE_ENV) {
      if (Constructor.prototype.componentShouldUpdate) {
        monitorCodeUse(
          'react_component_should_update_warning',
          { component: spec.displayName }
        );
        console.warn(
          (spec.displayName || 'A component') + ' has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.'
         );
      }
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactCompositeComponentInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    var descriptorFactory = ReactDescriptor.createFactory(Constructor);

    if ("production" !== process.env.NODE_ENV) {
      return ReactDescriptorValidator.createFactory(
        descriptorFactory,
        Constructor.propTypes,
        Constructor.contextTypes
      );
    }

    return descriptorFactory;
  },

  injection: {
    injectMixin: function(mixin) {
      injectedMixins.push(mixin);
    }
  }
};

module.exports = ReactCompositeComponent;

}).call(this,require('_process'))
},{"./ReactComponent":34,"./ReactContext":37,"./ReactCurrentOwner":38,"./ReactDescriptor":54,"./ReactDescriptorValidator":55,"./ReactEmptyComponent":56,"./ReactErrorUtils":57,"./ReactOwner":67,"./ReactPerf":68,"./ReactPropTransferer":69,"./ReactPropTypeLocationNames":70,"./ReactPropTypeLocations":71,"./ReactUpdates":79,"./instantiateReactComponent":122,"./invariant":123,"./keyMirror":129,"./mapObject":131,"./merge":133,"./mixInto":136,"./monitorCodeUse":137,"./shouldUpdateReactComponent":143,"./warning":146,"_process":2}],37:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactContext
 */

"use strict";

var merge = require("./merge");

/**
 * Keeps track of the current context.
 *
 * The context is automatically passed down the component ownership hierarchy
 * and is accessible via `this.context` on ReactCompositeComponents.
 */
var ReactContext = {

  /**
   * @internal
   * @type {object}
   */
  current: {},

  /**
   * Temporarily extends the current context while executing scopedCallback.
   *
   * A typical use case might look like
   *
   *  render: function() {
   *    var children = ReactContext.withContext({foo: 'foo'} () => (
   *
   *    ));
   *    return <div>{children}</div>;
   *  }
   *
   * @param {object} newContext New context to merge into the existing context
   * @param {function} scopedCallback Callback to run with the new context
   * @return {ReactComponent|array<ReactComponent>}
   */
  withContext: function(newContext, scopedCallback) {
    var result;
    var previousContext = ReactContext.current;
    ReactContext.current = merge(previousContext, newContext);
    try {
      result = scopedCallback();
    } finally {
      ReactContext.current = previousContext;
    }
    return result;
  }

};

module.exports = ReactContext;

},{"./merge":133}],38:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCurrentOwner
 */

"use strict";

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 *
 * The depth indicate how many composite components are above this render level.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;

},{}],39:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOM
 * @typechecks static-only
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactDescriptorValidator = require("./ReactDescriptorValidator");
var ReactDOMComponent = require("./ReactDOMComponent");

var mergeInto = require("./mergeInto");
var mapObject = require("./mapObject");

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @param {boolean} omitClose True if the close tag should be omitted.
 * @param {string} tag Tag name (e.g. `div`).
 * @private
 */
function createDOMComponentClass(omitClose, tag) {
  var Constructor = function(descriptor) {
    this.construct(descriptor);
  };
  Constructor.prototype = new ReactDOMComponent(tag, omitClose);
  Constructor.prototype.constructor = Constructor;
  Constructor.displayName = tag;

  var ConvenienceConstructor = ReactDescriptor.createFactory(Constructor);

  if ("production" !== process.env.NODE_ENV) {
    return ReactDescriptorValidator.createFactory(
      ConvenienceConstructor
    );
  }

  return ConvenienceConstructor;
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOM = mapObject({
  a: false,
  abbr: false,
  address: false,
  area: true,
  article: false,
  aside: false,
  audio: false,
  b: false,
  base: true,
  bdi: false,
  bdo: false,
  big: false,
  blockquote: false,
  body: false,
  br: true,
  button: false,
  canvas: false,
  caption: false,
  cite: false,
  code: false,
  col: true,
  colgroup: false,
  data: false,
  datalist: false,
  dd: false,
  del: false,
  details: false,
  dfn: false,
  div: false,
  dl: false,
  dt: false,
  em: false,
  embed: true,
  fieldset: false,
  figcaption: false,
  figure: false,
  footer: false,
  form: false, // NOTE: Injected, see `ReactDOMForm`.
  h1: false,
  h2: false,
  h3: false,
  h4: false,
  h5: false,
  h6: false,
  head: false,
  header: false,
  hr: true,
  html: false,
  i: false,
  iframe: false,
  img: true,
  input: true,
  ins: false,
  kbd: false,
  keygen: true,
  label: false,
  legend: false,
  li: false,
  link: true,
  main: false,
  map: false,
  mark: false,
  menu: false,
  menuitem: false, // NOTE: Close tag should be omitted, but causes problems.
  meta: true,
  meter: false,
  nav: false,
  noscript: false,
  object: false,
  ol: false,
  optgroup: false,
  option: false,
  output: false,
  p: false,
  param: true,
  pre: false,
  progress: false,
  q: false,
  rp: false,
  rt: false,
  ruby: false,
  s: false,
  samp: false,
  script: false,
  section: false,
  select: false,
  small: false,
  source: true,
  span: false,
  strong: false,
  style: false,
  sub: false,
  summary: false,
  sup: false,
  table: false,
  tbody: false,
  td: false,
  textarea: false, // NOTE: Injected, see `ReactDOMTextarea`.
  tfoot: false,
  th: false,
  thead: false,
  time: false,
  title: false,
  tr: false,
  track: true,
  u: false,
  ul: false,
  'var': false,
  video: false,
  wbr: true,

  // SVG
  circle: false,
  defs: false,
  ellipse: false,
  g: false,
  line: false,
  linearGradient: false,
  mask: false,
  path: false,
  pattern: false,
  polygon: false,
  polyline: false,
  radialGradient: false,
  rect: false,
  stop: false,
  svg: false,
  text: false,
  tspan: false
}, createDOMComponentClass);

var injection = {
  injectComponentClasses: function(componentClasses) {
    mergeInto(ReactDOM, componentClasses);
  }
};

ReactDOM.injection = injection;

module.exports = ReactDOM;

}).call(this,require('_process'))
},{"./ReactDOMComponent":41,"./ReactDescriptor":54,"./ReactDescriptorValidator":55,"./mapObject":131,"./mergeInto":135,"_process":2}],40:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMButton
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var keyMirror = require("./keyMirror");

// Store a reference to the <button> `ReactDOMComponent`.
var button = ReactDOM.button;

var mouseListenerNames = keyMirror({
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,
  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
});

/**
 * Implements a <button> native component that does not receive mouse events
 * when `disabled` is set.
 */
var ReactDOMButton = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMButton',

  mixins: [AutoFocusMixin, ReactBrowserComponentMixin],

  render: function() {
    var props = {};

    // Copy the props; except the mouse listeners if we're disabled
    for (var key in this.props) {
      if (this.props.hasOwnProperty(key) &&
          (!this.props.disabled || !mouseListenerNames[key])) {
        props[key] = this.props[key];
      }
    }

    return button(props, this.props.children);
  }

});

module.exports = ReactDOMButton;

},{"./AutoFocusMixin":4,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39,"./keyMirror":129}],41:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMComponent
 * @typechecks static-only
 */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMProperty = require("./DOMProperty");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponent = require("./ReactComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var invariant = require("./invariant");
var keyOf = require("./keyOf");
var merge = require("./merge");
var mixInto = require("./mixInto");

var deleteListener = ReactBrowserEventEmitter.deleteListener;
var listenTo = ReactBrowserEventEmitter.listenTo;
var registrationNameModules = ReactBrowserEventEmitter.registrationNameModules;

// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = {'string': true, 'number': true};

var STYLE = keyOf({style: null});

var ELEMENT_NODE_TYPE = 1;

/**
 * @param {?object} props
 */
function assertValidProps(props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  ("production" !== process.env.NODE_ENV ? invariant(
    props.children == null || props.dangerouslySetInnerHTML == null,
    'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
  ) : invariant(props.children == null || props.dangerouslySetInnerHTML == null));
  ("production" !== process.env.NODE_ENV ? invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
    'not a string.'
  ) : invariant(props.style == null || typeof props.style === 'object'));
}

function putListener(id, registrationName, listener, transaction) {
  var container = ReactMount.findReactContainerForID(id);
  if (container) {
    var doc = container.nodeType === ELEMENT_NODE_TYPE ?
      container.ownerDocument :
      container;
    listenTo(registrationName, doc);
  }
  transaction.getPutListenerQueue().enqueuePutListener(
    id,
    registrationName,
    listener
  );
}


/**
 * @constructor ReactDOMComponent
 * @extends ReactComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(tag, omitClose) {
  this._tagOpen = '<' + tag;
  this._tagClose = omitClose ? '' : '</' + tag + '>';
  this.tagName = tag.toUpperCase();
}

ReactDOMComponent.Mixin = {

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} The computed markup.
   */
  mountComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      assertValidProps(this.props);
      return (
        this._createOpenTagMarkupAndPutListeners(transaction) +
        this._createContentMarkup(transaction) +
        this._tagClose
      );
    }
  ),

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup of opening tag.
   */
  _createOpenTagMarkupAndPutListeners: function(transaction) {
    var props = this.props;
    var ret = this._tagOpen;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, propValue, transaction);
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            propValue = props.style = merge(props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
          DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
      return ret + '>';
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(this._rootNodeID);
    return ret + ' ' + markupForID + '>';
  },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Content markup.
   */
  _createContentMarkup: function(transaction) {
    // Intentional use of != to avoid catching zero/false.
    var innerHTML = this.props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        return innerHTML.__html;
      }
    } else {
      var contentToUse =
        CONTENT_TYPES[typeof this.props.children] ? this.props.children : null;
      var childrenToUse = contentToUse != null ? null : this.props.children;
      if (contentToUse != null) {
        return escapeTextForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(
          childrenToUse,
          transaction
        );
        return mountImages.join('');
      }
    }
    return '';
  },

  receiveComponent: function(nextDescriptor, transaction) {
    if (nextDescriptor === this._descriptor &&
        nextDescriptor._owner != null) {
      // Since descriptors are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the descriptor. We explicitly check for the existence of an owner since
      // it's possible for a descriptor created outside a composite to be
      // deeply mutated and reused.
      return;
    }

    ReactComponent.Mixin.receiveComponent.call(
      this,
      nextDescriptor,
      transaction
    );
  },

  /**
   * Updates a native DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactDescriptor} prevDescriptor
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'updateComponent',
    function(transaction, prevDescriptor) {
      assertValidProps(this._descriptor.props);
      ReactComponent.Mixin.updateComponent.call(
        this,
        transaction,
        prevDescriptor
      );
      this._updateDOMProperties(prevDescriptor.props, transaction);
      this._updateDOMChildren(prevDescriptor.props, transaction);
    }
  ),

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMProperties: function(lastProps, transaction) {
    var nextProps = this.props;
    var propKey;
    var styleName;
    var styleUpdates;
    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) ||
         !lastProps.hasOwnProperty(propKey)) {
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = lastProps[propKey];
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        deleteListener(this._rootNodeID, propKey);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.BackendIDOperations.deletePropertyByID(
          this._rootNodeID,
          propKey
        );
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = lastProps[propKey];
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue;
      }
      if (propKey === STYLE) {
        if (nextProp) {
          nextProp = nextProps.style = merge(nextProp);
        }
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (lastProp.hasOwnProperty(styleName) &&
                (!nextProp || !nextProp.hasOwnProperty(styleName))) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) &&
                lastProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          styleUpdates = nextProp;
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        putListener(this._rootNodeID, propKey, nextProp, transaction);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.BackendIDOperations.updatePropertyByID(
          this._rootNodeID,
          propKey,
          nextProp
        );
      }
    }
    if (styleUpdates) {
      ReactComponent.BackendIDOperations.updateStylesByID(
        this._rootNodeID,
        styleUpdates
      );
    }
  },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMChildren: function(lastProps, transaction) {
    var nextProps = this.props;

    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml =
      lastProps.dangerouslySetInnerHTML &&
      lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml =
      nextProps.dangerouslySetInnerHTML &&
      nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        ReactComponent.BackendIDOperations.updateInnerHTMLByID(
          this._rootNodeID,
          nextHtml
        );
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction);
    }
  },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent: function() {
    this.unmountChildren();
    ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
    ReactComponent.Mixin.unmountComponent.call(this);
  }

};

mixInto(ReactDOMComponent, ReactComponent.Mixin);
mixInto(ReactDOMComponent, ReactDOMComponent.Mixin);
mixInto(ReactDOMComponent, ReactMultiChild.Mixin);
mixInto(ReactDOMComponent, ReactBrowserComponentMixin);

module.exports = ReactDOMComponent;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":7,"./DOMProperty":13,"./DOMPropertyOperations":14,"./ReactBrowserComponentMixin":31,"./ReactBrowserEventEmitter":32,"./ReactComponent":34,"./ReactMount":64,"./ReactMultiChild":65,"./ReactPerf":68,"./escapeTextForBrowser":107,"./invariant":123,"./keyOf":130,"./merge":133,"./mixInto":136,"_process":2}],42:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMForm
 */

"use strict";

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

// Store a reference to the <form> `ReactDOMComponent`.
var form = ReactDOM.form;

/**
 * Since onSubmit doesn't bubble OR capture on the top level in IE8, we need
 * to capture it on the <form> element itself. There are lots of hacks we could
 * do to accomplish this, but the most reliable is to make <form> a
 * composite component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMForm = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMForm',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    // TODO: Instead of using `ReactDOM` directly, we should use JSX. However,
    // `jshint` fails to parse JSX so in order for linting to work in the open
    // source repo, we need to just use `ReactDOM.form`.
    return this.transferPropsTo(form(null, this.props.children));
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topReset, 'reset');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topSubmit, 'submit');
  }
});

module.exports = ReactDOMForm;

},{"./EventConstants":18,"./LocalEventTrapMixin":27,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39}],43:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMIDOperations
 * @typechecks static-only
 */

/*jslint evil: true */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMChildrenOperations = require("./DOMChildrenOperations");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var invariant = require("./invariant");
var setInnerHTML = require("./setInnerHTML");

/**
 * Errors for properties that should not be updated with `updatePropertyById()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * Operations used to process updates to DOM nodes. This is made injectable via
 * `ReactComponent.BackendIDOperations`.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updatePropertyByID',
    function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(
        !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
        'updatePropertyByID(...): %s',
        INVALID_PROPERTY_ERRORS[name]
      ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));

      // If we're updating to null or undefined, we should remove the property
      // from the DOM node instead of inadvertantly setting to a string. This
      // brings us in line with the same behavior we have on initial render.
      if (value != null) {
        DOMPropertyOperations.setValueForProperty(node, name, value);
      } else {
        DOMPropertyOperations.deleteValueForProperty(node, name);
      }
    }
  ),

  /**
   * Updates a DOM node to remove a property. This should only be used to remove
   * DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A property name to remove, see `DOMProperty`.
   * @internal
   */
  deletePropertyByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'deletePropertyByID',
    function(id, name, value) {
      var node = ReactMount.getNode(id);
      ("production" !== process.env.NODE_ENV ? invariant(
        !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
        'updatePropertyByID(...): %s',
        INVALID_PROPERTY_ERRORS[name]
      ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
      DOMPropertyOperations.deleteValueForProperty(node, name, value);
    }
  ),

  /**
   * Updates a DOM node with new style values. If a value is specified as '',
   * the corresponding style property will be unset.
   *
   * @param {string} id ID of the node to update.
   * @param {object} styles Mapping from styles to values.
   * @internal
   */
  updateStylesByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateStylesByID',
    function(id, styles) {
      var node = ReactMount.getNode(id);
      CSSPropertyOperations.setValueForStyles(node, styles);
    }
  ),

  /**
   * Updates a DOM node's innerHTML.
   *
   * @param {string} id ID of the node to update.
   * @param {string} html An HTML string.
   * @internal
   */
  updateInnerHTMLByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateInnerHTMLByID',
    function(id, html) {
      var node = ReactMount.getNode(id);
      setInnerHTML(node, html);
    }
  ),

  /**
   * Updates a DOM node's text content set by `props.content`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} content Text content.
   * @internal
   */
  updateTextContentByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'updateTextContentByID',
    function(id, content) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.updateTextContent(node, content);
    }
  ),

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: ReactPerf.measure(
    'ReactDOMIDOperations',
    'dangerouslyReplaceNodeWithMarkupByID',
    function(id, markup) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
    }
  ),

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markup List of markup strings.
   * @internal
   */
  dangerouslyProcessChildrenUpdates: ReactPerf.measure(
    'ReactDOMIDOperations',
    'dangerouslyProcessChildrenUpdates',
    function(updates, markup) {
      for (var i = 0; i < updates.length; i++) {
        updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
      }
      DOMChildrenOperations.processUpdates(updates, markup);
    }
  )
};

module.exports = ReactDOMIDOperations;

}).call(this,require('_process'))
},{"./CSSPropertyOperations":7,"./DOMChildrenOperations":12,"./DOMPropertyOperations":14,"./ReactMount":64,"./ReactPerf":68,"./invariant":123,"./setInnerHTML":141,"_process":2}],44:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMImg
 */

"use strict";

var EventConstants = require("./EventConstants");
var LocalEventTrapMixin = require("./LocalEventTrapMixin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

// Store a reference to the <img> `ReactDOMComponent`.
var img = ReactDOM.img;

/**
 * Since onLoad doesn't bubble OR capture on the top level in IE8, we need to
 * capture it on the <img> element itself. There are lots of hacks we could do
 * to accomplish this, but the most reliable is to make <img> a composite
 * component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMImg = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMImg',
  tagName: 'IMG',

  mixins: [ReactBrowserComponentMixin, LocalEventTrapMixin],

  render: function() {
    return img(this.props);
  },

  componentDidMount: function() {
    this.trapBubbledEvent(EventConstants.topLevelTypes.topLoad, 'load');
    this.trapBubbledEvent(EventConstants.topLevelTypes.topError, 'error');
  }
});

module.exports = ReactDOMImg;

},{"./EventConstants":18,"./LocalEventTrapMixin":27,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39}],45:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMInput
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");
var merge = require("./merge");

// Store a reference to the <input> `ReactDOMComponent`.
var input = ReactDOM.input;

var instancesByReactID = {};

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMInput',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    return {
      checked: this.props.defaultChecked || false,
      value: defaultValue != null ? defaultValue : null
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.defaultChecked = null;
    props.defaultValue = null;

    var value = LinkedValueUtils.getValue(this);
    props.value = value != null ? value : this.state.value;

    var checked = LinkedValueUtils.getChecked(this);
    props.checked = checked != null ? checked : this.state.checked;

    props.onChange = this._handleChange;

    return input(props, this.props.children);
  },

  componentDidMount: function() {
    var id = ReactMount.getID(this.getDOMNode());
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var rootNode = this.getDOMNode();
    if (this.props.checked != null) {
      DOMPropertyOperations.setValueForProperty(
        rootNode,
        'checked',
        this.props.checked || false
      );
    }

    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }
    this.setState({
      checked: event.target.checked,
      value: event.target.value
    });

    var name = this.props.name;
    if (this.props.type === 'radio' && name != null) {
      var rootNode = this.getDOMNode();
      var queryRoot = rootNode;

      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      }

      // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form, let's just use the global
      // `querySelectorAll` to ensure we don't miss anything.
      var group = queryRoot.querySelectorAll(
        'input[name=' + JSON.stringify('' + name) + '][type="radio"]');

      for (var i = 0, groupLen = group.length; i < groupLen; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode ||
            otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        ("production" !== process.env.NODE_ENV ? invariant(
          otherID,
          'ReactDOMInput: Mixing React and non-React radio inputs with the ' +
          'same `name` is not supported.'
        ) : invariant(otherID));
        var otherInstance = instancesByReactID[otherID];
        ("production" !== process.env.NODE_ENV ? invariant(
          otherInstance,
          'ReactDOMInput: Unknown radio button ID %s.',
          otherID
        ) : invariant(otherInstance));
        // In some cases, this will actually change the `checked` state value.
        // In other cases, there's no change but this forces a reconcile upon
        // which componentDidUpdate will reset the DOM property to whatever it
        // should be.
        otherInstance.setState({
          checked: false
        });
      }
    }

    return returnValue;
  }

});

module.exports = ReactDOMInput;

}).call(this,require('_process'))
},{"./AutoFocusMixin":4,"./DOMPropertyOperations":14,"./LinkedValueUtils":26,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39,"./ReactMount":64,"./invariant":123,"./merge":133,"_process":2}],46:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMOption
 */

"use strict";

var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var warning = require("./warning");

// Store a reference to the <option> `ReactDOMComponent`.
var option = ReactDOM.option;

/**
 * Implements an <option> native component that warns when `selected` is set.
 */
var ReactDOMOption = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMOption',

  mixins: [ReactBrowserComponentMixin],

  componentWillMount: function() {
    // TODO (yungsters): Remove support for `selected` in <option>.
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(
        this.props.selected == null,
        'Use the `defaultValue` or `value` props on <select> instead of ' +
        'setting `selected` on <option>.'
      ) : null);
    }
  },

  render: function() {
    return option(this.props, this.props.children);
  }

});

module.exports = ReactDOMOption;

}).call(this,require('_process'))
},{"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39,"./warning":146,"_process":2}],47:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelect
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var merge = require("./merge");

// Store a reference to the <select> `ReactDOMComponent`.
var select = ReactDOM.select;

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
function selectValueType(props, propName, componentName) {
  if (props[propName] == null) {
    return;
  }
  if (props.multiple) {
    if (!Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be an array if ") +
        ("`multiple` is true.")
      );
    }
  } else {
    if (Array.isArray(props[propName])) {
      return new Error(
        ("The `" + propName + "` prop supplied to <select> must be a scalar ") +
        ("value if `multiple` is false.")
      );
    }
  }
}

/**
 * If `value` is supplied, updates <option> elements on mount and update.
 * @param {ReactComponent} component Instance of ReactDOMSelect
 * @param {?*} propValue For uncontrolled components, null/undefined. For
 * controlled components, a string (or with `multiple`, a list of strings).
 * @private
 */
function updateOptions(component, propValue) {
  var multiple = component.props.multiple;
  var value = propValue != null ? propValue : component.state.value;
  var options = component.getDOMNode().options;
  var selectedValue, i, l;
  if (multiple) {
    selectedValue = {};
    for (i = 0, l = value.length; i < l; ++i) {
      selectedValue['' + value[i]] = true;
    }
  } else {
    selectedValue = '' + value;
  }
  for (i = 0, l = options.length; i < l; i++) {
    var selected = multiple ?
      selectedValue.hasOwnProperty(options[i].value) :
      options[i].value === selectedValue;

    if (selected !== options[i].selected) {
      options[i].selected = selected;
    }
  }
}

/**
 * Implements a <select> native component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * string. If `multiple` is true, the prop must be an array of strings.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMSelect',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  propTypes: {
    defaultValue: selectValueType,
    value: selectValueType
  },

  getInitialState: function() {
    return {value: this.props.defaultValue || (this.props.multiple ? [] : '')};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.multiple && nextProps.multiple) {
      this.setState({value: [this.state.value]});
    } else if (this.props.multiple && !nextProps.multiple) {
      this.setState({value: this.state.value[0]});
    }
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.onChange = this._handleChange;
    props.value = null;

    return select(props, this.props.children);
  },

  componentDidMount: function() {
    updateOptions(this, LinkedValueUtils.getValue(this));
  },

  componentDidUpdate: function(prevProps) {
    var value = LinkedValueUtils.getValue(this);
    var prevMultiple = !!prevProps.multiple;
    var multiple = !!this.props.multiple;
    if (value != null || prevMultiple !== multiple) {
      updateOptions(this, value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }

    var selectedValue;
    if (this.props.multiple) {
      selectedValue = [];
      var options = event.target.options;
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectedValue.push(options[i].value);
        }
      }
    } else {
      selectedValue = event.target.value;
    }

    this.setState({value: selectedValue});
    return returnValue;
  }

});

module.exports = ReactDOMSelect;

},{"./AutoFocusMixin":4,"./LinkedValueUtils":26,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39,"./merge":133}],48:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelection
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection();

  if (selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
  var isSelectionCollapsed = isCollapsed(
    selection.anchorNode,
    selection.anchorOffset,
    selection.focusNode,
    selection.focusOffset
  );

  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var isTempRangeCollapsed = isCollapsed(
    tempRange.startContainer,
    tempRange.startOffset,
    tempRange.endContainer,
    tempRange.endOffset
  );

  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;
  detectionRange.detach();

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  var selection = window.getSelection();

  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ?
            start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }

    range.detach();
  }
}

var useIEOffsets = ExecutionEnvironment.canUseDOM && document.selection;

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};

module.exports = ReactDOMSelection;

},{"./ExecutionEnvironment":24,"./getNodeForCharacterOffset":116,"./getTextContentAccessor":118}],49:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMTextarea
 */

"use strict";

var AutoFocusMixin = require("./AutoFocusMixin");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueUtils = require("./LinkedValueUtils");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var invariant = require("./invariant");
var merge = require("./merge");

var warning = require("./warning");

// Store a reference to the <textarea> `ReactDOMComponent`.
var textarea = ReactDOM.textarea;

/**
 * Implements a <textarea> native component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
var ReactDOMTextarea = ReactCompositeComponent.createClass({
  displayName: 'ReactDOMTextarea',

  mixins: [AutoFocusMixin, LinkedValueUtils.Mixin, ReactBrowserComponentMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = this.props.children;
    if (children != null) {
      if ("production" !== process.env.NODE_ENV) {
        ("production" !== process.env.NODE_ENV ? warning(
          false,
          'Use the `defaultValue` or `value` props instead of setting ' +
          'children on <textarea>.'
        ) : null);
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        defaultValue == null,
        'If you supply `defaultValue` on a <textarea>, do not pass children.'
      ) : invariant(defaultValue == null));
      if (Array.isArray(children)) {
        ("production" !== process.env.NODE_ENV ? invariant(
          children.length <= 1,
          '<textarea> can only have at most one child.'
        ) : invariant(children.length <= 1));
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    var value = LinkedValueUtils.getValue(this);
    return {
      // We save the initial value so that `ReactDOMComponent` doesn't update
      // `textContent` (unnecessary since we update value).
      // The initial value can be a boolean or object so that's why it's
      // forced to be a string.
      initialValue: '' + (value != null ? value : defaultValue)
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    ("production" !== process.env.NODE_ENV ? invariant(
      props.dangerouslySetInnerHTML == null,
      '`dangerouslySetInnerHTML` does not make sense on <textarea>.'
    ) : invariant(props.dangerouslySetInnerHTML == null));

    props.defaultValue = null;
    props.value = null;
    props.onChange = this._handleChange;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.
    return textarea(props, this.state.initialValue);
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      var rootNode = this.getDOMNode();
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange.call(this, event);
      this._isChanging = false;
    }
    this.setState({value: event.target.value});
    return returnValue;
  }

});

module.exports = ReactDOMTextarea;

}).call(this,require('_process'))
},{"./AutoFocusMixin":4,"./DOMPropertyOperations":14,"./LinkedValueUtils":26,"./ReactBrowserComponentMixin":31,"./ReactCompositeComponent":36,"./ReactDOM":39,"./invariant":123,"./merge":133,"./warning":146,"_process":2}],50:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

"use strict";

var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");

var emptyFunction = require("./emptyFunction");
var mixInto = require("./mixInto");

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

mixInto(ReactDefaultBatchingStrategyTransaction, Transaction.Mixin);
mixInto(ReactDefaultBatchingStrategyTransaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  }
});

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(a, b);
    } else {
      transaction.perform(callback, null, a, b);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;

},{"./ReactUpdates":79,"./Transaction":95,"./emptyFunction":105,"./mixInto":136}],51:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultInjection
 */

"use strict";

var BeforeInputEventPlugin = require("./BeforeInputEventPlugin");
var ChangeEventPlugin = require("./ChangeEventPlugin");
var ClientReactRootIndex = require("./ClientReactRootIndex");
var CompositionEventPlugin = require("./CompositionEventPlugin");
var DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
var EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var HTMLDOMPropertyConfig = require("./HTMLDOMPropertyConfig");
var MobileSafariClickEventPlugin = require("./MobileSafariClickEventPlugin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
var ReactDOM = require("./ReactDOM");
var ReactDOMButton = require("./ReactDOMButton");
var ReactDOMForm = require("./ReactDOMForm");
var ReactDOMImg = require("./ReactDOMImg");
var ReactDOMInput = require("./ReactDOMInput");
var ReactDOMOption = require("./ReactDOMOption");
var ReactDOMSelect = require("./ReactDOMSelect");
var ReactDOMTextarea = require("./ReactDOMTextarea");
var ReactEventListener = require("./ReactEventListener");
var ReactInjection = require("./ReactInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var SelectEventPlugin = require("./SelectEventPlugin");
var ServerReactRootIndex = require("./ServerReactRootIndex");
var SimpleEventPlugin = require("./SimpleEventPlugin");
var SVGDOMPropertyConfig = require("./SVGDOMPropertyConfig");

var createFullPageComponent = require("./createFullPageComponent");

function inject() {
  ReactInjection.EventEmitter.injectReactEventListener(
    ReactEventListener
  );

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    CompositionEventPlugin: CompositionEventPlugin,
    MobileSafariClickEventPlugin: MobileSafariClickEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.DOM.injectComponentClasses({
    button: ReactDOMButton,
    form: ReactDOMForm,
    img: ReactDOMImg,
    input: ReactDOMInput,
    option: ReactDOMOption,
    select: ReactDOMSelect,
    textarea: ReactDOMTextarea,

    html: createFullPageComponent(ReactDOM.html),
    head: createFullPageComponent(ReactDOM.head),
    body: createFullPageComponent(ReactDOM.body)
  });

  // This needs to happen after createFullPageComponent() otherwise the mixin
  // gets double injected.
  ReactInjection.CompositeComponent.injectMixin(ReactBrowserComponentMixin);

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent(ReactDOM.noscript);

  ReactInjection.Updates.injectReconcileTransaction(
    ReactComponentBrowserEnvironment.ReactReconcileTransaction
  );
  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );

  ReactInjection.RootIndex.injectCreateReactRootIndex(
    ExecutionEnvironment.canUseDOM ?
      ClientReactRootIndex.createReactRootIndex :
      ServerReactRootIndex.createReactRootIndex
  );

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);

  if ("production" !== process.env.NODE_ENV) {
    var url = (ExecutionEnvironment.canUseDOM && window.location.href) || '';
    if ((/[?&]react_perf\b/).test(url)) {
      var ReactDefaultPerf = require("./ReactDefaultPerf");
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};

}).call(this,require('_process'))
},{"./BeforeInputEventPlugin":5,"./ChangeEventPlugin":9,"./ClientReactRootIndex":10,"./CompositionEventPlugin":11,"./DefaultEventPluginOrder":16,"./EnterLeaveEventPlugin":17,"./ExecutionEnvironment":24,"./HTMLDOMPropertyConfig":25,"./MobileSafariClickEventPlugin":28,"./ReactBrowserComponentMixin":31,"./ReactComponentBrowserEnvironment":35,"./ReactDOM":39,"./ReactDOMButton":40,"./ReactDOMForm":42,"./ReactDOMImg":44,"./ReactDOMInput":45,"./ReactDOMOption":46,"./ReactDOMSelect":47,"./ReactDOMTextarea":49,"./ReactDefaultBatchingStrategy":50,"./ReactDefaultPerf":52,"./ReactEventListener":59,"./ReactInjection":60,"./ReactInstanceHandles":62,"./ReactMount":64,"./SVGDOMPropertyConfig":80,"./SelectEventPlugin":81,"./ServerReactRootIndex":82,"./SimpleEventPlugin":83,"./createFullPageComponent":102,"_process":2}],52:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var ReactDefaultPerfAnalysis = require("./ReactDefaultPerfAnalysis");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var performanceNow = require("./performanceNow");

function roundFloat(val) {
  return Math.floor(val * 100) / 100;
}

function addValue(obj, key, val) {
  obj[key] = (obj[key] || 0) + val;
}

var ReactDefaultPerf = {
  _allMeasurements: [], // last item in the list is the current one
  _mountStack: [0],
  _injected: false,

  start: function() {
    if (!ReactDefaultPerf._injected) {
      ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
    }

    ReactDefaultPerf._allMeasurements.length = 0;
    ReactPerf.enableMeasure = true;
  },

  stop: function() {
    ReactPerf.enableMeasure = false;
  },

  getLastMeasurements: function() {
    return ReactDefaultPerf._allMeasurements;
  },

  printExclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Component class name': item.componentName,
        'Total inclusive time (ms)': roundFloat(item.inclusive),
        'Exclusive mount time (ms)': roundFloat(item.exclusive),
        'Exclusive render time (ms)': roundFloat(item.render),
        'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
        'Render time per instance (ms)': roundFloat(item.render / item.count),
        'Instances': item.count
      };
    }));
    // TODO: ReactDefaultPerfAnalysis.getTotalTime() does not return the correct
    // number.
  },

  printInclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Inclusive time (ms)': roundFloat(item.time),
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printWasted: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(
      measurements,
      true
    );
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Wasted time (ms)': item.time,
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printDOM: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
    console.table(summary.map(function(item) {
      var result = {};
      result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
      result['type'] = item.type;
      result['args'] = JSON.stringify(item.args);
      return result;
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  _recordWrite: function(id, fnName, totalTime, args) {
    // TODO: totalTime isn't that useful since it doesn't count paints/reflows
    var writes =
      ReactDefaultPerf
        ._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1]
        .writes;
    writes[id] = writes[id] || [];
    writes[id].push({
      type: fnName,
      time: totalTime,
      args: args
    });
  },

  measure: function(moduleName, fnName, func) {
    return function() {var args=Array.prototype.slice.call(arguments,0);
      var totalTime;
      var rv;
      var start;

      if (fnName === '_renderNewRootComponent' ||
          fnName === 'flushBatchedUpdates') {
        // A "measurement" is a set of metrics recorded for each flush. We want
        // to group the metrics for a given flush together so we can look at the
        // components that rendered and the DOM operations that actually
        // happened to determine the amount of "wasted work" performed.
        ReactDefaultPerf._allMeasurements.push({
          exclusive: {},
          inclusive: {},
          render: {},
          counts: {},
          writes: {},
          displayNames: {},
          totalTime: 0
        });
        start = performanceNow();
        rv = func.apply(this, args);
        ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ].totalTime = performanceNow() - start;
        return rv;
      } else if (moduleName === 'ReactDOMIDOperations' ||
        moduleName === 'ReactComponentBrowserEnvironment') {
        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (fnName === 'mountImageIntoNode') {
          var mountID = ReactMount.getID(args[1]);
          ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
        } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
          // special format
          args[0].forEach(function(update) {
            var writeArgs = {};
            if (update.fromIndex !== null) {
              writeArgs.fromIndex = update.fromIndex;
            }
            if (update.toIndex !== null) {
              writeArgs.toIndex = update.toIndex;
            }
            if (update.textContent !== null) {
              writeArgs.textContent = update.textContent;
            }
            if (update.markupIndex !== null) {
              writeArgs.markup = args[1][update.markupIndex];
            }
            ReactDefaultPerf._recordWrite(
              update.parentID,
              update.type,
              totalTime,
              writeArgs
            );
          });
        } else {
          // basic format
          ReactDefaultPerf._recordWrite(
            args[0],
            fnName,
            totalTime,
            Array.prototype.slice.call(args, 1)
          );
        }
        return rv;
      } else if (moduleName === 'ReactCompositeComponent' && (
        fnName === 'mountComponent' ||
        fnName === 'updateComponent' || // TODO: receiveComponent()?
        fnName === '_renderValidatedComponent')) {

        var rootNodeID = fnName === 'mountComponent' ?
          args[0] :
          this._rootNodeID;
        var isRender = fnName === '_renderValidatedComponent';
        var isMount = fnName === 'mountComponent';

        var mountStack = ReactDefaultPerf._mountStack;
        var entry = ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ];

        if (isRender) {
          addValue(entry.counts, rootNodeID, 1);
        } else if (isMount) {
          mountStack.push(0);
        }

        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (isRender) {
          addValue(entry.render, rootNodeID, totalTime);
        } else if (isMount) {
          var subMountTime = mountStack.pop();
          mountStack[mountStack.length - 1] += totalTime;
          addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
          addValue(entry.inclusive, rootNodeID, totalTime);
        } else {
          addValue(entry.inclusive, rootNodeID, totalTime);
        }

        entry.displayNames[rootNodeID] = {
          current: this.constructor.displayName,
          owner: this._owner ? this._owner.constructor.displayName : '<root>'
        };

        return rv;
      } else {
        return func.apply(this, args);
      }
    };
  }
};

module.exports = ReactDefaultPerf;

},{"./DOMProperty":13,"./ReactDefaultPerfAnalysis":53,"./ReactMount":64,"./ReactPerf":68,"./performanceNow":140}],53:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultPerfAnalysis
 */

var merge = require("./merge");

// Don't try to save users less than 1.2ms (a number I made up)
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  'mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  TEXT_CONTENT: 'set textContent',
  'updatePropertyByID': 'update attribute',
  'deletePropertyByID': 'delete attribute',
  'updateStylesByID': 'update styles',
  'updateInnerHTMLByID': 'set innerHTML',
  'dangerouslyReplaceNodeWithMarkupByID': 'replace'
};

function getTotalTime(measurements) {
  // TODO: return number of DOM ops? could be misleading.
  // TODO: measure dropped frames after reconcile?
  // TODO: log total time of each reconcile and the top-level component
  // class that triggered it.
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}

function getDOMSummary(measurements) {
  var items = [];
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var id;

    for (id in measurement.writes) {
      measurement.writes[id].forEach(function(write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    }
  }
  return items;
}

function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = merge(measurement.exclusive, measurement.inclusive);

    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;

      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }

  arr.sort(function(a, b) {
    return b.exclusive - a.exclusive;
  });

  return arr;
}

function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = merge(measurement.exclusive, measurement.inclusive);
    var cleanComponents;

    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }

    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }

      var displayName = measurement.displayNames[id];

      // Inclusive time is not useful for many components without knowing where
      // they are instantiated. So we aggregate inclusive time with both the
      // owner and current displayName as the key.
      inclusiveKey = displayName.owner + ' > ' + displayName.current;

      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };

      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }

  arr.sort(function(a, b) {
    return b.time - a.time;
  });

  return arr;
}

function getUnchangedComponents(measurement) {
  // For a given reconcile, look at which components did not actually
  // render anything to the DOM and return a mapping of their ID to
  // the amount of time it took to render the entire subtree.
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = merge(measurement.exclusive, measurement.inclusive);

  for (var id in allIDs) {
    var isDirty = false;
    // For each component that rendered, see if a component that triggerd
    // a DOM op is in its subtree.
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}

var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};

module.exports = ReactDefaultPerfAnalysis;

},{"./merge":133}],54:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDescriptor
 */

"use strict";

var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");

var merge = require("./merge");
var warning = require("./warning");

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} object
 * @param {string} key
 */
function defineWarningProperty(object, key) {
  Object.defineProperty(object, key, {

    configurable: false,
    enumerable: true,

    get: function() {
      if (!this._store) {
        return null;
      }
      return this._store[key];
    },

    set: function(value) {
      ("production" !== process.env.NODE_ENV ? warning(
        false,
        'Don\'t set the ' + key + ' property of the component. ' +
        'Mutate the existing props object instead.'
      ) : null);
      this._store[key] = value;
    }

  });
}

/**
 * This is updated to true if the membrane is successfully created.
 */
var useMutationMembrane = false;

/**
 * Warn for mutations.
 *
 * @internal
 * @param {object} descriptor
 */
function defineMutationMembrane(prototype) {
  try {
    var pseudoFrozenProperties = {
      props: true
    };
    for (var key in pseudoFrozenProperties) {
      defineWarningProperty(prototype, key);
    }
    useMutationMembrane = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

/**
 * Transfer static properties from the source to the target. Functions are
 * rebound to have this reflect the original source.
 */
function proxyStaticMethods(target, source) {
  if (typeof source !== 'function') {
    return;
  }
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      var value = source[key];
      if (typeof value === 'function') {
        var bound = value.bind(source);
        // Copy any properties defined on the function, such as `isRequired` on
        // a PropTypes validator. (mergeInto refuses to work on functions.)
        for (var k in value) {
          if (value.hasOwnProperty(k)) {
            bound[k] = value[k];
          }
        }
        target[key] = bound;
      } else {
        target[key] = value;
      }
    }
  }
}

/**
 * Base constructor for all React descriptors. This is only used to make this
 * work with a dynamic instanceof check. Nothing should live on this prototype.
 *
 * @param {*} type
 * @internal
 */
var ReactDescriptor = function() {};

if ("production" !== process.env.NODE_ENV) {
  defineMutationMembrane(ReactDescriptor.prototype);
}

ReactDescriptor.createFactory = function(type) {

  var descriptorPrototype = Object.create(ReactDescriptor.prototype);

  var factory = function(props, children) {
    // For consistency we currently allocate a new object for every descriptor.
    // This protects the descriptor from being mutated by the original props
    // object being mutated. It also protects the original props object from
    // being mutated by children arguments and default props. This behavior
    // comes with a performance cost and could be deprecated in the future.
    // It could also be optimized with a smarter JSX transform.
    if (props == null) {
      props = {};
    } else if (typeof props === 'object') {
      props = merge(props);
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    var childrenLength = arguments.length - 1;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 1];
      }
      props.children = childArray;
    }

    // Initialize the descriptor object
    var descriptor = Object.create(descriptorPrototype);

    // Record the component responsible for creating this descriptor.
    descriptor._owner = ReactCurrentOwner.current;

    // TODO: Deprecate withContext, and then the context becomes accessible
    // through the owner.
    descriptor._context = ReactContext.current;

    if ("production" !== process.env.NODE_ENV) {
      // The validation flag and props are currently mutative. We put them on
      // an external backing store so that we can freeze the whole object.
      // This can be replaced with a WeakMap once they are implemented in
      // commonly used development environments.
      descriptor._store = { validated: false, props: props };

      // We're not allowed to set props directly on the object so we early
      // return and rely on the prototype membrane to forward to the backing
      // store.
      if (useMutationMembrane) {
        Object.freeze(descriptor);
        return descriptor;
      }
    }

    descriptor.props = props;
    return descriptor;
  };

  // Currently we expose the prototype of the descriptor so that
  // <Foo /> instanceof Foo works. This is controversial pattern.
  factory.prototype = descriptorPrototype;

  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on descriptors. E.g. <Foo />.type === Foo.type and for
  // static methods like <Foo />.type.staticMethod();
  // This should not be named constructor since this may not be the function
  // that created the descriptor, and it may not even be a constructor.
  factory.type = type;
  descriptorPrototype.type = type;

  proxyStaticMethods(factory, type);

  // Expose a unique constructor on the prototype is that this works with type
  // systems that compare constructor properties: <Foo />.constructor === Foo
  // This may be controversial since it requires a known factory function.
  descriptorPrototype.constructor = factory;

  return factory;

};

ReactDescriptor.cloneAndReplaceProps = function(oldDescriptor, newProps) {
  var newDescriptor = Object.create(oldDescriptor.constructor.prototype);
  // It's important that this property order matches the hidden class of the
  // original descriptor to maintain perf.
  newDescriptor._owner = oldDescriptor._owner;
  newDescriptor._context = oldDescriptor._context;

  if ("production" !== process.env.NODE_ENV) {
    newDescriptor._store = {
      validated: oldDescriptor._store.validated,
      props: newProps
    };
    if (useMutationMembrane) {
      Object.freeze(newDescriptor);
      return newDescriptor;
    }
  }

  newDescriptor.props = newProps;
  return newDescriptor;
};

/**
 * Checks if a value is a valid descriptor constructor.
 *
 * @param {*}
 * @return {boolean}
 * @public
 */
ReactDescriptor.isValidFactory = function(factory) {
  return typeof factory === 'function' &&
         factory.prototype instanceof ReactDescriptor;
};

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactDescriptor.isValidDescriptor = function(object) {
  return object instanceof ReactDescriptor;
};

module.exports = ReactDescriptor;

}).call(this,require('_process'))
},{"./ReactContext":37,"./ReactCurrentOwner":38,"./merge":133,"./warning":146,"_process":2}],55:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDescriptorValidator
 */

/**
 * ReactDescriptorValidator provides a wrapper around a descriptor factory
 * which validates the props passed to the descriptor. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactPropTypeLocations = require("./ReactPropTypeLocations");
var ReactCurrentOwner = require("./ReactCurrentOwner");

var monitorCodeUse = require("./monitorCodeUse");

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {
  'react_key_warning': {},
  'react_numeric_key_warning': {}
};
var ownerHasMonitoredObjectMap = {};

var loggedTypeFailures = {};

var NUMERIC_PROPERTY_REGEX = /^\d+$/;

/**
 * Gets the current owner's displayName for use in warnings.
 *
 * @internal
 * @return {?string} Display name or undefined
 */
function getCurrentOwnerDisplayName() {
  var current = ReactCurrentOwner.current;
  return current && current.constructor.displayName || undefined;
}

/**
 * Warn if the component doesn't have an explicit key assigned to it.
 * This component is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it.
 *
 * @internal
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function validateExplicitKey(component, parentType) {
  if (component._store.validated || component.props.key != null) {
    return;
  }
  component._store.validated = true;

  warnAndMonitorForKeyUse(
    'react_key_warning',
    'Each child in an array should have a unique "key" prop.',
    component,
    parentType
  );
}

/**
 * Warn if the key is being defined as an object property but has an incorrect
 * value.
 *
 * @internal
 * @param {string} name Property name of the key.
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function validatePropertyKey(name, component, parentType) {
  if (!NUMERIC_PROPERTY_REGEX.test(name)) {
    return;
  }
  warnAndMonitorForKeyUse(
    'react_numeric_key_warning',
    'Child objects should have non-numeric keys so ordering is preserved.',
    component,
    parentType
  );
}

/**
 * Shared warning and monitoring code for the key warnings.
 *
 * @internal
 * @param {string} warningID The id used when logging.
 * @param {string} message The base warning that gets output.
 * @param {ReactComponent} component Component that requires a key.
 * @param {*} parentType component's parent's type.
 */
function warnAndMonitorForKeyUse(warningID, message, component, parentType) {
  var ownerName = getCurrentOwnerDisplayName();
  var parentName = parentType.displayName;

  var useName = ownerName || parentName;
  var memoizer = ownerHasKeyUseWarning[warningID];
  if (memoizer.hasOwnProperty(useName)) {
    return;
  }
  memoizer[useName] = true;

  message += ownerName ?
    (" Check the render method of " + ownerName + ".") :
    (" Check the renderComponent call using <" + parentName + ">.");

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwnerName = null;
  if (component._owner && component._owner !== ReactCurrentOwner.current) {
    // Name of the component that originally created this child.
    childOwnerName = component._owner.constructor.displayName;

    message += (" It was passed a child from " + childOwnerName + ".");
  }

  message += ' See http://fb.me/react-warning-keys for more information.';
  monitorCodeUse(warningID, {
    component: useName,
    componentOwner: childOwnerName
  });
  console.warn(message);
}

/**
 * Log that we're using an object map. We're considering deprecating this
 * feature and replace it with proper Map and ImmutableMap data structures.
 *
 * @internal
 */
function monitorUseOfObjectMap() {
  var currentName = getCurrentOwnerDisplayName() || '';
  if (ownerHasMonitoredObjectMap.hasOwnProperty(currentName)) {
    return;
  }
  ownerHasMonitoredObjectMap[currentName] = true;
  monitorCodeUse('react_object_map_children');
}

/**
 * Ensure that every component either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {*} component Statically passed child of any type.
 * @param {*} parentType component's parent's type.
 * @return {boolean}
 */
function validateChildKeys(component, parentType) {
  if (Array.isArray(component)) {
    for (var i = 0; i < component.length; i++) {
      var child = component[i];
      if (ReactDescriptor.isValidDescriptor(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (ReactDescriptor.isValidDescriptor(component)) {
    // This component was passed in a valid location.
    component._store.validated = true;
  } else if (component && typeof component === 'object') {
    monitorUseOfObjectMap();
    for (var name in component) {
      validatePropertyKey(name, component[name], parentType);
    }
  }
}

/**
 * Assert that the props are valid
 *
 * @param {string} componentName Name of the component for error messages.
 * @param {object} propTypes Map of prop name to a ReactPropType
 * @param {object} props
 * @param {string} location e.g. "prop", "context", "child context"
 * @private
 */
function checkPropTypes(componentName, propTypes, props, location) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        error = propTypes[propName](props, propName, componentName, location);
      } catch (ex) {
        error = ex;
      }
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;
        // This will soon use the warning module
        monitorCodeUse(
          'react_failed_descriptor_type_check',
          { message: error.message }
        );
      }
    }
  }
}

var ReactDescriptorValidator = {

  /**
   * Wraps a descriptor factory function in another function which validates
   * the props and context of the descriptor and warns about any failed type
   * checks.
   *
   * @param {function} factory The original descriptor factory
   * @param {object?} propTypes A prop type definition set
   * @param {object?} contextTypes A context type definition set
   * @return {object} The component descriptor, which may be invalid.
   * @private
   */
  createFactory: function(factory, propTypes, contextTypes) {
    var validatedFactory = function(props, children) {
      var descriptor = factory.apply(this, arguments);

      for (var i = 1; i < arguments.length; i++) {
        validateChildKeys(arguments[i], descriptor.type);
      }

      var name = descriptor.type.displayName;
      if (propTypes) {
        checkPropTypes(
          name,
          propTypes,
          descriptor.props,
          ReactPropTypeLocations.prop
        );
      }
      if (contextTypes) {
        checkPropTypes(
          name,
          contextTypes,
          descriptor._context,
          ReactPropTypeLocations.context
        );
      }
      return descriptor;
    };

    validatedFactory.prototype = factory.prototype;
    validatedFactory.type = factory.type;

    // Copy static properties
    for (var key in factory) {
      if (factory.hasOwnProperty(key)) {
        validatedFactory[key] = factory[key];
      }
    }

    return validatedFactory;
  }

};

module.exports = ReactDescriptorValidator;

},{"./ReactCurrentOwner":38,"./ReactDescriptor":54,"./ReactPropTypeLocations":71,"./monitorCodeUse":137}],56:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEmptyComponent
 */

"use strict";

var invariant = require("./invariant");

var component;
// This registry keeps track of the React IDs of the components that rendered to
// `null` (in reality a placeholder such as `noscript`)
var nullComponentIdsRegistry = {};

var ReactEmptyComponentInjection = {
  injectEmptyComponent: function(emptyComponent) {
    component = emptyComponent;
  }
};

/**
 * @return {ReactComponent} component The injected empty component.
 */
function getEmptyComponent() {
  ("production" !== process.env.NODE_ENV ? invariant(
    component,
    'Trying to return null from a render, but no null placeholder component ' +
    'was injected.'
  ) : invariant(component));
  return component();
}

/**
 * Mark the component as having rendered to null.
 * @param {string} id Component's `_rootNodeID`.
 */
function registerNullComponentID(id) {
  nullComponentIdsRegistry[id] = true;
}

/**
 * Unmark the component as having rendered to null: it renders to something now.
 * @param {string} id Component's `_rootNodeID`.
 */
function deregisterNullComponentID(id) {
  delete nullComponentIdsRegistry[id];
}

/**
 * @param {string} id Component's `_rootNodeID`.
 * @return {boolean} True if the component is rendered to null.
 */
function isNullComponentID(id) {
  return nullComponentIdsRegistry[id];
}

var ReactEmptyComponent = {
  deregisterNullComponentID: deregisterNullComponentID,
  getEmptyComponent: getEmptyComponent,
  injection: ReactEmptyComponentInjection,
  isNullComponentID: isNullComponentID,
  registerNullComponentID: registerNullComponentID
};

module.exports = ReactEmptyComponent;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],57:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactErrorUtils
 * @typechecks
 */

"use strict";

var ReactErrorUtils = {
  /**
   * Creates a guarded version of a function. This is supposed to make debugging
   * of event handlers easier. To aid debugging with the browser's debugger,
   * this currently simply returns the original function.
   *
   * @param {function} func Function to be executed
   * @param {string} name The name of the guard
   * @return {function}
   */
  guard: function(func, name) {
    return func;
  }
};

module.exports = ReactErrorUtils;

},{}],58:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventEmitterMixin
 */

"use strict";

var EventPluginHub = require("./EventPluginHub");

function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue();
}

var ReactEventEmitterMixin = {

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {object} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native environment event.
   */
  handleTopLevel: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events = EventPluginHub.extractEvents(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent
    );

    runEventQueueInBatch(events);
  }
};

module.exports = ReactEventEmitterMixin;

},{"./EventPluginHub":20}],59:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventListener
 * @typechecks static-only
 */

"use strict";

var EventListener = require("./EventListener");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var PooledClass = require("./PooledClass");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");

var getEventTarget = require("./getEventTarget");
var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");
var mixInto = require("./mixInto");

/**
 * Finds the parent React component of `node`.
 *
 * @param {*} node
 * @return {?DOMEventTarget} Parent container, or `null` if the specified node
 *                           is not nested.
 */
function findParent(node) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  var nodeID = ReactMount.getID(node);
  var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
  var container = ReactMount.findReactContainerForID(rootID);
  var parent = ReactMount.getFirstReactDOM(container);
  return parent;
}

// Used to store ancestor hierarchy in top level callback
function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
  this.topLevelType = topLevelType;
  this.nativeEvent = nativeEvent;
  this.ancestors = [];
}
mixInto(TopLevelCallbackBookKeeping, {
  destructor: function() {
    this.topLevelType = null;
    this.nativeEvent = null;
    this.ancestors.length = 0;
  }
});
PooledClass.addPoolingTo(
  TopLevelCallbackBookKeeping,
  PooledClass.twoArgumentPooler
);

function handleTopLevelImpl(bookKeeping) {
  var topLevelTarget = ReactMount.getFirstReactDOM(
    getEventTarget(bookKeeping.nativeEvent)
  ) || window;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = topLevelTarget;
  while (ancestor) {
    bookKeeping.ancestors.push(ancestor);
    ancestor = findParent(ancestor);
  }

  for (var i = 0, l = bookKeeping.ancestors.length; i < l; i++) {
    topLevelTarget = bookKeeping.ancestors[i];
    var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
    ReactEventListener._handleTopLevel(
      bookKeeping.topLevelType,
      topLevelTarget,
      topLevelTargetID,
      bookKeeping.nativeEvent
    );
  }
}

function scrollValueMonitor(cb) {
  var scrollPosition = getUnboundedScrollPosition(window);
  cb(scrollPosition);
}

var ReactEventListener = {
  _enabled: true,
  _handleTopLevel: null,

  WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

  setHandleTopLevel: function(handleTopLevel) {
    ReactEventListener._handleTopLevel = handleTopLevel;
  },

  setEnabled: function(enabled) {
    ReactEventListener._enabled = !!enabled;
  },

  isEnabled: function() {
    return ReactEventListener._enabled;
  },


  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return;
    }
    return EventListener.listen(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return;
    }
    return EventListener.capture(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  monitorScrollValue: function(refresh) {
    var callback = scrollValueMonitor.bind(null, refresh);
    EventListener.listen(window, 'scroll', callback);
    EventListener.listen(window, 'resize', callback);
  },

  dispatchEvent: function(topLevelType, nativeEvent) {
    if (!ReactEventListener._enabled) {
      return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(
      topLevelType,
      nativeEvent
    );
    try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
      ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
      TopLevelCallbackBookKeeping.release(bookKeeping);
    }
  }
};

module.exports = ReactEventListener;

},{"./EventListener":19,"./ExecutionEnvironment":24,"./PooledClass":29,"./ReactInstanceHandles":62,"./ReactMount":64,"./ReactUpdates":79,"./getEventTarget":114,"./getUnboundedScrollPosition":119,"./mixInto":136}],60:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInjection
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var EventPluginHub = require("./EventPluginHub");
var ReactComponent = require("./ReactComponent");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactPerf = require("./ReactPerf");
var ReactRootIndex = require("./ReactRootIndex");
var ReactUpdates = require("./ReactUpdates");

var ReactInjection = {
  Component: ReactComponent.injection,
  CompositeComponent: ReactCompositeComponent.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  DOM: ReactDOM.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;

},{"./DOMProperty":13,"./EventPluginHub":20,"./ReactBrowserEventEmitter":32,"./ReactComponent":34,"./ReactCompositeComponent":36,"./ReactDOM":39,"./ReactEmptyComponent":56,"./ReactPerf":68,"./ReactRootIndex":75,"./ReactUpdates":79}],61:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInputSelection
 */

"use strict";

var ReactDOMSelection = require("./ReactDOMSelection");

var containsNode = require("./containsNode");
var focusNode = require("./focusNode");
var getActiveElement = require("./getActiveElement");

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function(elem) {
    return elem && (
      (elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' ||
      elem.contentEditable === 'true'
    );
  },

  getSelectionInformation: function() {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange:
          ReactInputSelection.hasSelectionCapabilities(focusedElem) ?
          ReactInputSelection.getSelection(focusedElem) :
          null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function(priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem &&
        isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        );
      }
      focusNode(priorFocusedElem);
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function(input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && input.nodeName === 'INPUT') {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || {start: 0, end: 0};
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function(input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && input.nodeName === 'INPUT') {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;

},{"./ReactDOMSelection":48,"./containsNode":99,"./focusNode":109,"./getActiveElement":111}],62:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInstanceHandles
 * @typechecks static-only
 */

"use strict";

var ReactRootIndex = require("./ReactRootIndex");

var invariant = require("./invariant");

var SEPARATOR = '.';
var SEPARATOR_LENGTH = SEPARATOR.length;

/**
 * Maximum depth of traversals before we consider the possibility of a bad ID.
 */
var MAX_TREE_DEPTH = 100;

/**
 * Creates a DOM ID prefix to use when mounting React components.
 *
 * @param {number} index A unique integer
 * @return {string} React root ID.
 * @internal
 */
function getReactRootIDString(index) {
  return SEPARATOR + index.toString(36);
}

/**
 * Checks if a character in the supplied ID is a separator or the end.
 *
 * @param {string} id A React DOM ID.
 * @param {number} index Index of the character to check.
 * @return {boolean} True if the character is a separator or end of the ID.
 * @private
 */
function isBoundary(id, index) {
  return id.charAt(index) === SEPARATOR || index === id.length;
}

/**
 * Checks if the supplied string is a valid React DOM ID.
 *
 * @param {string} id A React DOM ID, maybe.
 * @return {boolean} True if the string is a valid React DOM ID.
 * @private
 */
function isValidID(id) {
  return id === '' || (
    id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR
  );
}

/**
 * Checks if the first ID is an ancestor of or equal to the second ID.
 *
 * @param {string} ancestorID
 * @param {string} descendantID
 * @return {boolean} True if `ancestorID` is an ancestor of `descendantID`.
 * @internal
 */
function isAncestorIDOf(ancestorID, descendantID) {
  return (
    descendantID.indexOf(ancestorID) === 0 &&
    isBoundary(descendantID, ancestorID.length)
  );
}

/**
 * Gets the parent ID of the supplied React DOM ID, `id`.
 *
 * @param {string} id ID of a component.
 * @return {string} ID of the parent, or an empty string.
 * @private
 */
function getParentID(id) {
  return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
}

/**
 * Gets the next DOM ID on the tree path from the supplied `ancestorID` to the
 * supplied `destinationID`. If they are equal, the ID is returned.
 *
 * @param {string} ancestorID ID of an ancestor node of `destinationID`.
 * @param {string} destinationID ID of the destination node.
 * @return {string} Next ID on the path from `ancestorID` to `destinationID`.
 * @private
 */
function getNextDescendantID(ancestorID, destinationID) {
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(ancestorID) && isValidID(destinationID),
    'getNextDescendantID(%s, %s): Received an invalid React DOM ID.',
    ancestorID,
    destinationID
  ) : invariant(isValidID(ancestorID) && isValidID(destinationID)));
  ("production" !== process.env.NODE_ENV ? invariant(
    isAncestorIDOf(ancestorID, destinationID),
    'getNextDescendantID(...): React has made an invalid assumption about ' +
    'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.',
    ancestorID,
    destinationID
  ) : invariant(isAncestorIDOf(ancestorID, destinationID)));
  if (ancestorID === destinationID) {
    return ancestorID;
  }
  // Skip over the ancestor and the immediate separator. Traverse until we hit
  // another separator or we reach the end of `destinationID`.
  var start = ancestorID.length + SEPARATOR_LENGTH;
  for (var i = start; i < destinationID.length; i++) {
    if (isBoundary(destinationID, i)) {
      break;
    }
  }
  return destinationID.substr(0, i);
}

/**
 * Gets the nearest common ancestor ID of two IDs.
 *
 * Using this ID scheme, the nearest common ancestor ID is the longest common
 * prefix of the two IDs that immediately preceded a "marker" in both strings.
 *
 * @param {string} oneID
 * @param {string} twoID
 * @return {string} Nearest common ancestor ID, or the empty string if none.
 * @private
 */
function getFirstCommonAncestorID(oneID, twoID) {
  var minLength = Math.min(oneID.length, twoID.length);
  if (minLength === 0) {
    return '';
  }
  var lastCommonMarkerIndex = 0;
  // Use `<=` to traverse until the "EOL" of the shorter string.
  for (var i = 0; i <= minLength; i++) {
    if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
      lastCommonMarkerIndex = i;
    } else if (oneID.charAt(i) !== twoID.charAt(i)) {
      break;
    }
  }
  var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(longestCommonID),
    'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s',
    oneID,
    twoID,
    longestCommonID
  ) : invariant(isValidID(longestCommonID)));
  return longestCommonID;
}

/**
 * Traverses the parent path between two IDs (either up or down). The IDs must
 * not be the same, and there must exist a parent path between them. If the
 * callback returns `false`, traversal is stopped.
 *
 * @param {?string} start ID at which to start traversal.
 * @param {?string} stop ID at which to end traversal.
 * @param {function} cb Callback to invoke each ID with.
 * @param {?boolean} skipFirst Whether or not to skip the first node.
 * @param {?boolean} skipLast Whether or not to skip the last node.
 * @private
 */
function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
  start = start || '';
  stop = stop || '';
  ("production" !== process.env.NODE_ENV ? invariant(
    start !== stop,
    'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.',
    start
  ) : invariant(start !== stop));
  var traverseUp = isAncestorIDOf(stop, start);
  ("production" !== process.env.NODE_ENV ? invariant(
    traverseUp || isAncestorIDOf(start, stop),
    'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' +
    'not have a parent path.',
    start,
    stop
  ) : invariant(traverseUp || isAncestorIDOf(start, stop)));
  // Traverse from `start` to `stop` one depth at a time.
  var depth = 0;
  var traverse = traverseUp ? getParentID : getNextDescendantID;
  for (var id = start; /* until break */; id = traverse(id, stop)) {
    var ret;
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      ret = cb(id, traverseUp, arg);
    }
    if (ret === false || id === stop) {
      // Only break //after// visiting `stop`.
      break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      depth++ < MAX_TREE_DEPTH,
      'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' +
      'traversing the React DOM ID tree. This may be due to malformed IDs: %s',
      start, stop
    ) : invariant(depth++ < MAX_TREE_DEPTH));
  }
}

/**
 * Manages the IDs assigned to DOM representations of React components. This
 * uses a specific scheme in order to traverse the DOM efficiently (e.g. in
 * order to simulate events).
 *
 * @internal
 */
var ReactInstanceHandles = {

  /**
   * Constructs a React root ID
   * @return {string} A React root ID.
   */
  createReactRootID: function() {
    return getReactRootIDString(ReactRootIndex.createReactRootIndex());
  },

  /**
   * Constructs a React ID by joining a root ID with a name.
   *
   * @param {string} rootID Root ID of a parent component.
   * @param {string} name A component's name (as flattened children).
   * @return {string} A React ID.
   * @internal
   */
  createReactID: function(rootID, name) {
    return rootID + name;
  },

  /**
   * Gets the DOM ID of the React component that is the root of the tree that
   * contains the React component with the supplied DOM ID.
   *
   * @param {string} id DOM ID of a React component.
   * @return {?string} DOM ID of the React component that is the root.
   * @internal
   */
  getReactRootIDFromNodeID: function(id) {
    if (id && id.charAt(0) === SEPARATOR && id.length > 1) {
      var index = id.indexOf(SEPARATOR, 1);
      return index > -1 ? id.substr(0, index) : id;
    }
    return null;
  },

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * NOTE: Does not invoke the callback on the nearest common ancestor because
   * nothing "entered" or "left" that element.
   *
   * @param {string} leaveID ID being left.
   * @param {string} enterID ID being entered.
   * @param {function} cb Callback to invoke on each entered/left ID.
   * @param {*} upArg Argument to invoke the callback with on left IDs.
   * @param {*} downArg Argument to invoke the callback with on entered IDs.
   * @internal
   */
  traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
    var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
    if (ancestorID !== leaveID) {
      traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
    }
    if (ancestorID !== enterID) {
      traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
    }
  },

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseTwoPhase: function(targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false);
      traverseParentPath(targetID, '', cb, arg, false, true);
    }
  },

  /**
   * Traverse a node ID, calling the supplied `cb` for each ancestor ID. For
   * example, passing `.0.$row-0.1` would result in `cb` getting called
   * with `.0`, `.0.$row-0`, and `.0.$row-0.1`.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseAncestors: function(targetID, cb, arg) {
    traverseParentPath('', targetID, cb, arg, true, false);
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _getFirstCommonAncestorID: getFirstCommonAncestorID,

  /**
   * Exposed for unit testing.
   * @private
   */
  _getNextDescendantID: getNextDescendantID,

  isAncestorIDOf: isAncestorIDOf,

  SEPARATOR: SEPARATOR

};

module.exports = ReactInstanceHandles;

}).call(this,require('_process'))
},{"./ReactRootIndex":75,"./invariant":123,"_process":2}],63:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMarkupChecksum
 */

"use strict";

var adler32 = require("./adler32");

var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
  addChecksumToMarkup: function(markup) {
    var checksum = adler32(markup);
    return markup.replace(
      '>',
      ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '">'
    );
  },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
  canReuseMarkup: function(markup, element) {
    var existingChecksum = element.getAttribute(
      ReactMarkupChecksum.CHECKSUM_ATTR_NAME
    );
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};

module.exports = ReactMarkupChecksum;

},{"./adler32":98}],64:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMount
 */

"use strict";

var DOMProperty = require("./DOMProperty");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDescriptor = require("./ReactDescriptor");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactPerf = require("./ReactPerf");

var containsNode = require("./containsNode");
var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
var warning = require("./warning");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;

var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
var nodeCache = {};

var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if ("production" !== process.env.NODE_ENV) {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

// Used to store breadth-first search state in findComponentRoot.
var findComponentRootReusableArray = [];

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */
function getReactRootID(container) {
  var rootElement = getReactRootElementInContainer(container);
  return rootElement && ReactMount.getID(rootElement);
}

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !isValid(cached, id),
          'ReactMount: Two valid but unequal nodes with the same `%s`: %s',
          ATTR_NAME, id
        ) : invariant(!isValid(cached, id)));

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = internalGetID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * A node is "valid" if it is contained by a currently mounted container.
 *
 * This means that the node does not have to be contained by a document in
 * order to be considered valid.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @param {string} id The expected ID of the node.
 * @return {boolean} Whether the node is contained by a mounted container.
 */
function isValid(node, id) {
  if (node) {
    ("production" !== process.env.NODE_ENV ? invariant(
      internalGetID(node) === id,
      'ReactMount: Unexpected modification of `%s`',
      ATTR_NAME
    ) : invariant(internalGetID(node) === id));

    var container = ReactMount.findReactContainerForID(id);
    if (container && containsNode(container, node)) {
      return true;
    }
  }

  return false;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

var deepestNodeSoFar = null;
function findDeepestCachedAncestorImpl(ancestorID) {
  var ancestor = nodeCache[ancestorID];
  if (ancestor && isValid(ancestor, ancestorID)) {
    deepestNodeSoFar = ancestor;
  } else {
    // This node isn't populated in the cache, so presumably none of its
    // descendants are. Break out of the loop.
    return false;
  }
}

/**
 * Return the deepest cached node whose ID is a prefix of `targetID`.
 */
function findDeepestCachedAncestor(targetID) {
  deepestNodeSoFar = null;
  ReactInstanceHandles.traverseAncestors(
    targetID,
    findDeepestCachedAncestorImpl
  );

  var foundNode = deepestNodeSoFar;
  deepestNodeSoFar = null;
  return foundNode;
}

/**
 * Mounting is the process of initializing a React component by creatings its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.renderComponent(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {
  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function(container, renderCallback) {
    renderCallback();
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function(
      prevComponent,
      nextComponent,
      container,
      callback) {
    var nextProps = nextComponent.props;
    ReactMount.scrollMonitor(container, function() {
      prevComponent.replaceProps(nextProps, callback);
    });

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[getReactRootID(container)] =
        getReactRootElementInContainer(container);
    }

    return prevComponent;
  },

  /**
   * Register a component into the instance map and starts scroll value
   * monitoring
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @return {string} reactRoot ID prefix
   */
  _registerComponent: function(nextComponent, container) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
        container.nodeType === DOC_NODE_TYPE
      ),
      '_registerComponent(...): Target container is not a DOM element.'
    ) : invariant(container && (
      container.nodeType === ELEMENT_NODE_TYPE ||
      container.nodeType === DOC_NODE_TYPE
    )));

    ReactBrowserEventEmitter.ensureScrollValueMonitoring();

    var reactRootID = ReactMount.registerContainer(container);
    instancesByReactRootID[reactRootID] = nextComponent;
    return reactRootID;
  },

  /**
   * Render a new component into the DOM.
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: ReactPerf.measure(
    'ReactMount',
    '_renderNewRootComponent',
    function(
        nextComponent,
        container,
        shouldReuseMarkup) {
      // Various parts of our code (such as ReactCompositeComponent's
      // _renderValidatedComponent) assume that calls to render aren't nested;
      // verify that that's the case.
      ("production" !== process.env.NODE_ENV ? warning(
        ReactCurrentOwner.current == null,
        '_renderNewRootComponent(): Render methods should be a pure function ' +
        'of props and state; triggering nested component updates from ' +
        'render is not allowed. If necessary, trigger nested updates in ' +
        'componentDidUpdate.'
      ) : null);

      var componentInstance = instantiateReactComponent(nextComponent);
      var reactRootID = ReactMount._registerComponent(
        componentInstance,
        container
      );
      componentInstance.mountComponentIntoNode(
        reactRootID,
        container,
        shouldReuseMarkup
      );

      if ("production" !== process.env.NODE_ENV) {
        // Record the root element in case it later gets transplanted.
        rootElementsByReactRootID[reactRootID] =
          getReactRootElementInContainer(container);
      }

      return componentInstance;
    }
  ),

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactDescriptor} nextDescriptor Component descriptor to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  renderComponent: function(nextDescriptor, container, callback) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactDescriptor.isValidDescriptor(nextDescriptor),
      'renderComponent(): Invalid component descriptor.%s',
      (
        ReactDescriptor.isValidFactory(nextDescriptor) ?
          ' Instead of passing a component class, make sure to instantiate ' +
          'it first by calling it with props.' :
        // Check if it quacks like a descriptor
        typeof nextDescriptor.props !== "undefined" ?
          ' This may be caused by unintentionally loading two independent ' +
          'copies of React.' :
          ''
      )
    ) : invariant(ReactDescriptor.isValidDescriptor(nextDescriptor)));

    var prevComponent = instancesByReactRootID[getReactRootID(container)];

    if (prevComponent) {
      var prevDescriptor = prevComponent._descriptor;
      if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
        return ReactMount._updateRootComponent(
          prevComponent,
          nextDescriptor,
          container,
          callback
        );
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup =
      reactRootElement && ReactMount.isRenderedByReact(reactRootElement);

    var shouldReuseMarkup = containerHasReactMarkup && !prevComponent;

    var component = ReactMount._renderNewRootComponent(
      nextDescriptor,
      container,
      shouldReuseMarkup
    );
    callback && callback.call(component);
    return component;
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into the supplied `container`.
   *
   * @param {function} constructor React component constructor.
   * @param {?object} props Initial props of the component instance.
   * @param {DOMElement} container DOM element to render into.
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  constructAndRenderComponent: function(constructor, props, container) {
    return ReactMount.renderComponent(constructor(props), container);
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into a container node identified by supplied `id`.
   *
   * @param {function} componentConstructor React component constructor
   * @param {?object} props Initial props of the component instance.
   * @param {string} id ID of the DOM element to render into.
   * @return {ReactComponent} Component instance rendered in the container node.
   */
  constructAndRenderComponentByID: function(constructor, props, id) {
    var domNode = document.getElementById(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      domNode,
      'Tried to get element with id of "%s" but it is not present on the page.',
      id
    ) : invariant(domNode));
    return ReactMount.constructAndRenderComponent(constructor, props, domNode);
  },

  /**
   * Registers a container node into which React components will be rendered.
   * This also creates the "reactRoot" ID that will be assigned to the element
   * rendered within.
   *
   * @param {DOMElement} container DOM element to register as a container.
   * @return {string} The "reactRoot" ID of elements rendered within.
   */
  registerContainer: function(container) {
    var reactRootID = getReactRootID(container);
    if (reactRootID) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
    }
    if (!reactRootID) {
      // No valid "reactRoot" ID found, create one.
      reactRootID = ReactInstanceHandles.createReactRootID();
    }
    containersByReactRootID[reactRootID] = container;
    return reactRootID;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function(container) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case. (Strictly speaking, unmounting won't cause a
    // render but we still don't expect to be in a render call here.)
    ("production" !== process.env.NODE_ENV ? warning(
      ReactCurrentOwner.current == null,
      'unmountComponentAtNode(): Render methods should be a pure function of ' +
      'props and state; triggering nested component updates from render is ' +
      'not allowed. If necessary, trigger nested updates in ' +
      'componentDidUpdate.'
    ) : null);

    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];
    if (!component) {
      return false;
    }
    ReactMount.unmountComponentFromNode(component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if ("production" !== process.env.NODE_ENV) {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  /**
   * Unmounts a component and removes it from the DOM.
   *
   * @param {ReactComponent} instance React component instance.
   * @param {DOMElement} container DOM element to unmount from.
   * @final
   * @internal
   * @see {ReactMount.unmountComponentAtNode}
   */
  unmountComponentFromNode: function(instance, container) {
    instance.unmountComponent();

    if (container.nodeType === DOC_NODE_TYPE) {
      container = container.documentElement;
    }

    // http://jsperf.com/emptying-a-node
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  },

  /**
   * Finds the container DOM element that contains React component to which the
   * supplied DOM `id` belongs.
   *
   * @param {string} id The ID of an element rendered by a React component.
   * @return {?DOMElement} DOM element that contains the `id`.
   */
  findReactContainerForID: function(id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];

    if ("production" !== process.env.NODE_ENV) {
      var rootElement = rootElementsByReactRootID[reactRootID];
      if (rootElement && rootElement.parentNode !== container) {
        ("production" !== process.env.NODE_ENV ? invariant(
          // Call internalGetID here because getID calls isValid which calls
          // findReactContainerForID (this function).
          internalGetID(rootElement) === reactRootID,
          'ReactMount: Root element ID differed from reactRootID.'
        ) : invariant(// Call internalGetID here because getID calls isValid which calls
        // findReactContainerForID (this function).
        internalGetID(rootElement) === reactRootID));

        var containerChild = container.firstChild;
        if (containerChild &&
            reactRootID === internalGetID(containerChild)) {
          // If the container has a new child with the same ID as the old
          // root element, then rootElementsByReactRootID[reactRootID] is
          // just stale and needs to be updated. The case that deserves a
          // warning is when the container is empty.
          rootElementsByReactRootID[reactRootID] = containerChild;
        } else {
          console.warn(
            'ReactMount: Root element has been removed from its original ' +
            'container. New container:', rootElement.parentNode
          );
        }
      }
    }

    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function(id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * True if the supplied `node` is rendered by React.
   *
   * @param {*} node DOM Element to check.
   * @return {boolean} True if the DOM Element appears to be rendered by React.
   * @internal
   */
  isRenderedByReact: function(node) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      return false;
    }
    var id = ReactMount.getID(node);
    return id ? id.charAt(0) === SEPARATOR : false;
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function(node) {
    var current = node;
    while (current && current.parentNode !== current) {
      if (ReactMount.isRenderedByReact(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  },

  /**
   * Finds a node with the supplied `targetID` inside of the supplied
   * `ancestorNode`.  Exploits the ID naming scheme to perform the search
   * quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} targetID ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `targetID`.
   * @internal
   */
  findComponentRoot: function(ancestorNode, targetID) {
    var firstChildren = findComponentRootReusableArray;
    var childIndex = 0;

    var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;

    firstChildren[0] = deepestAncestor.firstChild;
    firstChildren.length = 1;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      var targetChild;

      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          // Even if we find the node we're looking for, we finish looping
          // through its siblings to ensure they're cached so that we don't have
          // to revisit this node again. Otherwise, we make n^2 calls to getID
          // when visiting the many children of a single node in order.

          if (targetID === childID) {
            targetChild = child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
          }

        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }

        child = child.nextSibling;
      }

      if (targetChild) {
        // Emptying firstChildren/findComponentRootReusableArray is
        // not necessary for correctness, but it helps the GC reclaim
        // any nodes that were left at the end of the search.
        firstChildren.length = 0;

        return targetChild;
      }
    }

    firstChildren.length = 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      false,
      'findComponentRoot(..., %s): Unable to find element. This probably ' +
      'means the DOM was unexpectedly mutated (e.g., by the browser), ' +
      'usually due to forgetting a <tbody> when using tables, nesting <p> ' +
      'or <a> tags, or using non-SVG elements in an <svg> parent. Try ' +
      'inspecting the child nodes of the element with React ID `%s`.',
      targetID,
      ReactMount.getID(ancestorNode)
    ) : invariant(false));
  },


  /**
   * React ID utilities.
   */

  getReactRootID: getReactRootID,

  getID: getID,

  setID: setID,

  getNode: getNode,

  purgeID: purgeID
};

module.exports = ReactMount;

}).call(this,require('_process'))
},{"./DOMProperty":13,"./ReactBrowserEventEmitter":32,"./ReactCurrentOwner":38,"./ReactDescriptor":54,"./ReactInstanceHandles":62,"./ReactPerf":68,"./containsNode":99,"./getReactRootElementInContainer":117,"./instantiateReactComponent":122,"./invariant":123,"./shouldUpdateReactComponent":143,"./warning":146,"_process":2}],65:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChild
 * @typechecks static-only
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var flattenChildren = require("./flattenChildren");
var instantiateReactComponent = require("./instantiateReactComponent");
var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");

/**
 * Updating children of a component may trigger recursive updates. The depth is
 * used to batch recursive updates to render markup more efficiently.
 *
 * @type {number}
 * @private
 */
var updateDepth = 0;

/**
 * Queue of update configuration objects.
 *
 * Each object has a `type` property that is in `ReactMultiChildUpdateTypes`.
 *
 * @type {array<object>}
 * @private
 */
var updateQueue = [];

/**
 * Queue of markup to be rendered.
 *
 * @type {array<string>}
 * @private
 */
var markupQueue = [];

/**
 * Enqueues markup to be rendered and inserted at a supplied index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function enqueueMarkup(parentID, markup, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
    markupIndex: markupQueue.push(markup) - 1,
    textContent: null,
    fromIndex: null,
    toIndex: toIndex
  });
}

/**
 * Enqueues moving an existing element to another index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function enqueueMove(parentID, fromIndex, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: toIndex
  });
}

/**
 * Enqueues removing an element at an index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function enqueueRemove(parentID, fromIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.REMOVE_NODE,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: null
  });
}

/**
 * Enqueues setting the text content.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} textContent Text content to set.
 * @private
 */
function enqueueTextContent(parentID, textContent) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
    markupIndex: null,
    textContent: textContent,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue() {
  if (updateQueue.length) {
    ReactComponent.BackendIDOperations.dangerouslyProcessChildrenUpdates(
      updateQueue,
      markupQueue
    );
    clearQueue();
  }
}

/**
 * Clears any enqueued updates.
 *
 * @private
 */
function clearQueue() {
  updateQueue.length = 0;
  markupQueue.length = 0;
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function(nestedChildren, transaction) {
      var children = flattenChildren(nestedChildren);
      var mountImages = [];
      var index = 0;
      this._renderedChildren = children;
      for (var name in children) {
        var child = children[name];
        if (children.hasOwnProperty(name)) {
          // The rendered children must be turned into instances as they're
          // mounted.
          var childInstance = instantiateReactComponent(child);
          children[name] = childInstance;
          // Inlined for performance, see `ReactInstanceHandles.createReactID`.
          var rootID = this._rootNodeID + name;
          var mountImage = childInstance.mountComponent(
            rootID,
            transaction,
            this._mountDepth + 1
          );
          childInstance._mountIndex = index;
          mountImages.push(mountImage);
          index++;
        }
      }
      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function(nextContent) {
      updateDepth++;
      var errorThrown = true;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name)) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
        // Set new text content.
        this.setTextContent(nextContent);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          errorThrown ? clearQueue() : processQueue();
        }
      }
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function(nextNestedChildren, transaction) {
      updateDepth++;
      var errorThrown = true;
      try {
        this._updateChildren(nextNestedChildren, transaction);
        errorThrown = false;
      } finally {
        updateDepth--;
        if (!updateDepth) {
          errorThrown ? clearQueue() : processQueue();
        }
      }
    },

    /**
     * Improve performance by isolating this hot code path from the try/catch
     * block in `updateChildren`.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function(nextNestedChildren, transaction) {
      var nextChildren = flattenChildren(nextNestedChildren);
      var prevChildren = this._renderedChildren;
      if (!nextChildren && !prevChildren) {
        return;
      }
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var lastIndex = 0;
      var nextIndex = 0;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var prevDescriptor = prevChild && prevChild._descriptor;
        var nextDescriptor = nextChildren[name];
        if (shouldUpdateReactComponent(prevDescriptor, nextDescriptor)) {
          this.moveChild(prevChild, nextIndex, lastIndex);
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild.receiveComponent(nextDescriptor, transaction);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            this._unmountChildByName(prevChild, name);
          }
          // The child must be instantiated before it's mounted.
          var nextChildInstance = instantiateReactComponent(nextDescriptor);
          this._mountChildByNameAtIndex(
            nextChildInstance, name, nextIndex, transaction
          );
        }
        nextIndex++;
      }
      // Remove children that are no longer present.
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) &&
            !(nextChildren && nextChildren[name])) {
          this._unmountChildByName(prevChildren[name], name);
        }
      }
    },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted.
     *
     * @internal
     */
    unmountChildren: function() {
      var renderedChildren = this._renderedChildren;
      for (var name in renderedChildren) {
        var renderedChild = renderedChildren[name];
        // TODO: When is this not true?
        if (renderedChild.unmountComponent) {
          renderedChild.unmountComponent();
        }
      }
      this._renderedChildren = null;
    },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
    moveChild: function(child, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
      if (child._mountIndex < lastIndex) {
        enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
      }
    },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @param {string} mountImage Markup to insert.
     * @protected
     */
    createChild: function(child, mountImage) {
      enqueueMarkup(this._rootNodeID, mountImage, child._mountIndex);
    },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
    removeChild: function(child) {
      enqueueRemove(this._rootNodeID, child._mountIndex);
    },

    /**
     * Sets this text content string.
     *
     * @param {string} textContent Text content to set.
     * @protected
     */
    setTextContent: function(textContent) {
      enqueueTextContent(this._rootNodeID, textContent);
    },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
    _mountChildByNameAtIndex: function(child, name, index, transaction) {
      // Inlined for performance, see `ReactInstanceHandles.createReactID`.
      var rootID = this._rootNodeID + name;
      var mountImage = child.mountComponent(
        rootID,
        transaction,
        this._mountDepth + 1
      );
      child._mountIndex = index;
      this.createChild(child, mountImage);
      this._renderedChildren = this._renderedChildren || {};
      this._renderedChildren[name] = child;
    },

    /**
     * Unmounts a rendered child by name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @param {string} name Name of the child in `this._renderedChildren`.
     * @private
     */
    _unmountChildByName: function(child, name) {
      this.removeChild(child);
      child._mountIndex = null;
      child.unmountComponent();
      delete this._renderedChildren[name];
    }

  }

};

module.exports = ReactMultiChild;

},{"./ReactComponent":34,"./ReactMultiChildUpdateTypes":66,"./flattenChildren":108,"./instantiateReactComponent":122,"./shouldUpdateReactComponent":143}],66:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChildUpdateTypes
 */

"use strict";

var keyMirror = require("./keyMirror");

/**
 * When a component's children are updated, a series of update configuration
 * objects are created in order to batch and serialize the required changes.
 *
 * Enumerates all the possible types of update configurations.
 *
 * @internal
 */
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  TEXT_CONTENT: null
});

module.exports = ReactMultiChildUpdateTypes;

},{"./keyMirror":129}],67:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactOwner
 */

"use strict";

var emptyObject = require("./emptyObject");
var invariant = require("./invariant");

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid owner.
   * @final
   */
  isValidOwner: function(object) {
    return !!(
      object &&
      typeof object.attachRef === 'function' &&
      typeof object.detachRef === 'function'
    );
  },

  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
  addComponentAsRefTo: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'addComponentAsRefTo(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to add a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    owner.attachRef(ref, component);
  },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
  removeComponentAsRefFrom: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. This ' +
      'usually means that you\'re trying to remove a ref to a component that ' +
      'doesn\'t have an owner (that is, was not created inside of another ' +
      'component\'s `render` method). Try rendering this component inside of ' +
      'a new top-level component which will hold the ref.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.refs[ref] === component) {
      owner.detachRef(ref);
    }
  },

  /**
   * A ReactComponent must mix this in to have refs.
   *
   * @lends {ReactOwner.prototype}
   */
  Mixin: {

    construct: function() {
      this.refs = emptyObject;
    },

    /**
     * Lazily allocates the refs object and stores `component` as `ref`.
     *
     * @param {string} ref Reference name.
     * @param {component} component Component to store as `ref`.
     * @final
     * @private
     */
    attachRef: function(ref, component) {
      ("production" !== process.env.NODE_ENV ? invariant(
        component.isOwnedBy(this),
        'attachRef(%s, ...): Only a component\'s owner can store a ref to it.',
        ref
      ) : invariant(component.isOwnedBy(this)));
      var refs = this.refs === emptyObject ? (this.refs = {}) : this.refs;
      refs[ref] = component;
    },

    /**
     * Detaches a reference name.
     *
     * @param {string} ref Name to dereference.
     * @final
     * @private
     */
    detachRef: function(ref) {
      delete this.refs[ref];
    }

  }

};

module.exports = ReactOwner;

}).call(this,require('_process'))
},{"./emptyObject":106,"./invariant":123,"_process":2}],68:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPerf
 * @typechecks static-only
 */

"use strict";

/**
 * ReactPerf is a general AOP system designed to measure performance. This
 * module only has the hooks: see ReactDefaultPerf for the analysis tool.
 */
var ReactPerf = {
  /**
   * Boolean to enable/disable measurement. Set to false by default to prevent
   * accidental logging and perf loss.
   */
  enableMeasure: false,

  /**
   * Holds onto the measure function in use. By default, don't measure
   * anything, but we'll override this if we inject a measure function.
   */
  storedMeasure: _noMeasure,

  /**
   * Use this to wrap methods you want to measure. Zero overhead in production.
   *
   * @param {string} objName
   * @param {string} fnName
   * @param {function} func
   * @return {function}
   */
  measure: function(objName, fnName, func) {
    if ("production" !== process.env.NODE_ENV) {
      var measuredFunc = null;
      return function() {
        if (ReactPerf.enableMeasure) {
          if (!measuredFunc) {
            measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
          }
          return measuredFunc.apply(this, arguments);
        }
        return func.apply(this, arguments);
      };
    }
    return func;
  },

  injection: {
    /**
     * @param {function} measure
     */
    injectMeasure: function(measure) {
      ReactPerf.storedMeasure = measure;
    }
  }
};

/**
 * Simply passes through the measured function, without measuring it.
 *
 * @param {string} objName
 * @param {string} fnName
 * @param {function} func
 * @return {function}
 */
function _noMeasure(objName, fnName, func) {
  return func;
}

module.exports = ReactPerf;

}).call(this,require('_process'))
},{"_process":2}],69:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTransferer
 */

"use strict";

var emptyFunction = require("./emptyFunction");
var invariant = require("./invariant");
var joinClasses = require("./joinClasses");
var merge = require("./merge");

/**
 * Creates a transfer strategy that will merge prop values using the supplied
 * `mergeStrategy`. If a prop was previously unset, this just sets it.
 *
 * @param {function} mergeStrategy
 * @return {function}
 */
function createTransferStrategy(mergeStrategy) {
  return function(props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value;
    } else {
      props[key] = mergeStrategy(props[key], value);
    }
  };
}

var transferStrategyMerge = createTransferStrategy(function(a, b) {
  // `merge` overrides the first object's (`props[key]` above) keys using the
  // second object's (`value`) keys. An object's style's existing `propA` would
  // get overridden. Flip the order here.
  return merge(b, a);
});

/**
 * Transfer strategies dictate how props are transferred by `transferPropsTo`.
 * NOTE: if you add any more exceptions to this list you should be sure to
 * update `cloneWithProps()` accordingly.
 */
var TransferStrategies = {
  /**
   * Never transfer `children`.
   */
  children: emptyFunction,
  /**
   * Transfer the `className` prop by merging them.
   */
  className: createTransferStrategy(joinClasses),
  /**
   * Never transfer the `key` prop.
   */
  key: emptyFunction,
  /**
   * Never transfer the `ref` prop.
   */
  ref: emptyFunction,
  /**
   * Transfer the `style` prop (which is an object) by merging them.
   */
  style: transferStrategyMerge
};

/**
 * Mutates the first argument by transferring the properties from the second
 * argument.
 *
 * @param {object} props
 * @param {object} newProps
 * @return {object}
 */
function transferInto(props, newProps) {
  for (var thisKey in newProps) {
    if (!newProps.hasOwnProperty(thisKey)) {
      continue;
    }

    var transferStrategy = TransferStrategies[thisKey];

    if (transferStrategy && TransferStrategies.hasOwnProperty(thisKey)) {
      transferStrategy(props, thisKey, newProps[thisKey]);
    } else if (!props.hasOwnProperty(thisKey)) {
      props[thisKey] = newProps[thisKey];
    }
  }
  return props;
}

/**
 * ReactPropTransferer are capable of transferring props to another component
 * using a `transferPropsTo` method.
 *
 * @class ReactPropTransferer
 */
var ReactPropTransferer = {

  TransferStrategies: TransferStrategies,

  /**
   * Merge two props objects using TransferStrategies.
   *
   * @param {object} oldProps original props (they take precedence)
   * @param {object} newProps new props to merge in
   * @return {object} a new object containing both sets of props merged.
   */
  mergeProps: function(oldProps, newProps) {
    return transferInto(merge(oldProps), newProps);
  },

  /**
   * @lends {ReactPropTransferer.prototype}
   */
  Mixin: {

    /**
     * Transfer props from this component to a target component.
     *
     * Props that do not have an explicit transfer strategy will be transferred
     * only if the target component does not already have the prop set.
     *
     * This is usually used to pass down props to a returned root component.
     *
     * @param {ReactDescriptor} descriptor Component receiving the properties.
     * @return {ReactDescriptor} The supplied `component`.
     * @final
     * @protected
     */
    transferPropsTo: function(descriptor) {
      ("production" !== process.env.NODE_ENV ? invariant(
        descriptor._owner === this,
        '%s: You can\'t call transferPropsTo() on a component that you ' +
        'don\'t own, %s. This usually means you are calling ' +
        'transferPropsTo() on a component passed in as props or children.',
        this.constructor.displayName,
        descriptor.type.displayName
      ) : invariant(descriptor._owner === this));

      // Because descriptors are immutable we have to merge into the existing
      // props object rather than clone it.
      transferInto(descriptor.props, this.props);

      return descriptor;
    }

  }
};

module.exports = ReactPropTransferer;

}).call(this,require('_process'))
},{"./emptyFunction":105,"./invariant":123,"./joinClasses":128,"./merge":133,"_process":2}],70:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypeLocationNames
 */

"use strict";

var ReactPropTypeLocationNames = {};

if ("production" !== process.env.NODE_ENV) {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
}

module.exports = ReactPropTypeLocationNames;

}).call(this,require('_process'))
},{"_process":2}],71:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypeLocations
 */

"use strict";

var keyMirror = require("./keyMirror");

var ReactPropTypeLocations = keyMirror({
  prop: null,
  context: null,
  childContext: null
});

module.exports = ReactPropTypeLocations;

},{"./keyMirror":129}],72:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypes
 */

"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");

var emptyFunction = require("./emptyFunction");

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

var ANONYMOUS = '<<anonymous>>';

var ReactPropTypes = {
  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  any: createAnyTypeChecker(),
  arrayOf: createArrayOfTypeChecker,
  component: createComponentTypeChecker(),
  instanceOf: createInstanceTypeChecker,
  objectOf: createObjectOfTypeChecker,
  oneOf: createEnumTypeChecker,
  oneOfType: createUnionTypeChecker,
  renderable: createRenderableTypeChecker(),
  shape: createShapeTypeChecker
};

function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error(
          ("Required " + locationName + " `" + propName + "` was not specified in ")+
          ("`" + componentName + "`.")
        );
      }
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== expectedType) {
      var locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
      var preciseType = getPreciseType(propValue);

      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + preciseType + "` ") +
        ("supplied to `" + componentName + "`, expected `" + expectedType + "`.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createAnyTypeChecker() {
  return createChainableTypeChecker(emptyFunction.thatReturns());
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    if (!Array.isArray(propValue)) {
      var locationName = ReactPropTypeLocationNames[location];
      var propType = getPropType(propValue);
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an array.")
      );
    }
    for (var i = 0; i < propValue.length; i++) {
      var error = typeChecker(propValue, i, componentName, location);
      if (error instanceof Error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createComponentTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!ReactDescriptor.isValidDescriptor(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a React component.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createInstanceTypeChecker(expectedClass) {
  function validate(props, propName, componentName, location) {
    if (!(props[propName] instanceof expectedClass)) {
      var locationName = ReactPropTypeLocationNames[location];
      var expectedClassName = expectedClass.name || ANONYMOUS;
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected instance of `" + expectedClassName + "`.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createEnumTypeChecker(expectedValues) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    for (var i = 0; i < expectedValues.length; i++) {
      if (propValue === expectedValues[i]) {
        return;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    var valuesString = JSON.stringify(expectedValues);
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` of value `" + propValue + "` ") +
      ("supplied to `" + componentName + "`, expected one of " + valuesString + ".")
    );
  }
  return createChainableTypeChecker(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type ") +
        ("`" + propType + "` supplied to `" + componentName + "`, expected an object.")
      );
    }
    for (var key in propValue) {
      if (propValue.hasOwnProperty(key)) {
        var error = typeChecker(propValue, key, componentName, location);
        if (error instanceof Error) {
          return error;
        }
      }
    }
  }
  return createChainableTypeChecker(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  function validate(props, propName, componentName, location) {
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (checker(props, propName, componentName, location) == null) {
        return;
      }
    }

    var locationName = ReactPropTypeLocationNames[location];
    return new Error(
      ("Invalid " + locationName + " `" + propName + "` supplied to ") +
      ("`" + componentName + "`.")
    );
  }
  return createChainableTypeChecker(validate);
}

function createRenderableTypeChecker() {
  function validate(props, propName, componentName, location) {
    if (!isRenderable(props[propName])) {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` supplied to ") +
        ("`" + componentName + "`, expected a renderable prop.")
      );
    }
  }
  return createChainableTypeChecker(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(props, propName, componentName, location) {
    var propValue = props[propName];
    var propType = getPropType(propValue);
    if (propType !== 'object') {
      var locationName = ReactPropTypeLocationNames[location];
      return new Error(
        ("Invalid " + locationName + " `" + propName + "` of type `" + propType + "` ") +
        ("supplied to `" + componentName + "`, expected `object`.")
      );
    }
    for (var key in shapeTypes) {
      var checker = shapeTypes[key];
      if (!checker) {
        continue;
      }
      var error = checker(propValue, key, componentName, location);
      if (error) {
        return error;
      }
    }
  }
  return createChainableTypeChecker(validate, 'expected `object`');
}

function isRenderable(propValue) {
  switch(typeof propValue) {
    // TODO: this was probably written with the assumption that we're not
    // returning `this.props.component` directly from `render`. This is
    // currently not supported but we should, to make it consistent.
    case 'number':
    case 'string':
      return true;
    case 'boolean':
      return !propValue;
    case 'object':
      if (Array.isArray(propValue)) {
        return propValue.every(isRenderable);
      }
      if (ReactDescriptor.isValidDescriptor(propValue)) {
        return true;
      }
      for (var k in propValue) {
        if (!isRenderable(propValue[k])) {
          return false;
        }
      }
      return true;
    default:
      return false;
  }
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType(propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
function getPreciseType(propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}

module.exports = ReactPropTypes;

},{"./ReactDescriptor":54,"./ReactPropTypeLocationNames":70,"./emptyFunction":105}],73:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPutListenerQueue
 */

"use strict";

var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var mixInto = require("./mixInto");

function ReactPutListenerQueue() {
  this.listenersToPut = [];
}

mixInto(ReactPutListenerQueue, {
  enqueuePutListener: function(rootNodeID, propKey, propValue) {
    this.listenersToPut.push({
      rootNodeID: rootNodeID,
      propKey: propKey,
      propValue: propValue
    });
  },

  putListeners: function() {
    for (var i = 0; i < this.listenersToPut.length; i++) {
      var listenerToPut = this.listenersToPut[i];
      ReactBrowserEventEmitter.putListener(
        listenerToPut.rootNodeID,
        listenerToPut.propKey,
        listenerToPut.propValue
      );
    }
  },

  reset: function() {
    this.listenersToPut.length = 0;
  },

  destructor: function() {
    this.reset();
  }
});

PooledClass.addPoolingTo(ReactPutListenerQueue);

module.exports = ReactPutListenerQueue;

},{"./PooledClass":29,"./ReactBrowserEventEmitter":32,"./mixInto":136}],74:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

"use strict";

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactInputSelection = require("./ReactInputSelection");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var mixInto = require("./mixInto");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occured. `close`
   *   restores the previous value.
   */
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: function() {
    this.putListenerQueue.putListeners();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction() {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap proceedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


mixInto(ReactReconcileTransaction, Transaction.Mixin);
mixInto(ReactReconcileTransaction, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

},{"./CallbackQueue":8,"./PooledClass":29,"./ReactBrowserEventEmitter":32,"./ReactInputSelection":61,"./ReactPutListenerQueue":73,"./Transaction":95,"./mixInto":136}],75:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactRootIndex
 * @typechecks
 */

"use strict";

var ReactRootIndexInjection = {
  /**
   * @param {function} _createReactRootIndex
   */
  injectCreateReactRootIndex: function(_createReactRootIndex) {
    ReactRootIndex.createReactRootIndex = _createReactRootIndex;
  }
};

var ReactRootIndex = {
  createReactRootIndex: null,
  injection: ReactRootIndexInjection
};

module.exports = ReactRootIndex;

},{}],76:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
"use strict";

var ReactDescriptor = require("./ReactDescriptor");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactServerRenderingTransaction =
  require("./ReactServerRenderingTransaction");

var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");

/**
 * @param {ReactComponent} component
 * @return {string} the HTML markup
 */
function renderComponentToString(component) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(component),
    'renderComponentToString(): You must pass a valid ReactComponent.'
  ) : invariant(ReactDescriptor.isValidDescriptor(component)));

  ("production" !== process.env.NODE_ENV ? invariant(
    !(arguments.length === 2 && typeof arguments[1] === 'function'),
    'renderComponentToString(): This function became synchronous and now ' +
    'returns the generated markup. Please remove the second parameter.'
  ) : invariant(!(arguments.length === 2 && typeof arguments[1] === 'function')));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(false);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(component);
      var markup = componentInstance.mountComponent(id, transaction, 0);
      return ReactMarkupChecksum.addChecksumToMarkup(markup);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

/**
 * @param {ReactComponent} component
 * @return {string} the HTML markup, without the extra React ID and checksum
* (for generating static pages)
 */
function renderComponentToStaticMarkup(component) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(component),
    'renderComponentToStaticMarkup(): You must pass a valid ReactComponent.'
  ) : invariant(ReactDescriptor.isValidDescriptor(component)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(true);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(component);
      return componentInstance.mountComponent(id, transaction, 0);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

module.exports = {
  renderComponentToString: renderComponentToString,
  renderComponentToStaticMarkup: renderComponentToStaticMarkup
};

}).call(this,require('_process'))
},{"./ReactDescriptor":54,"./ReactInstanceHandles":62,"./ReactMarkupChecksum":63,"./ReactServerRenderingTransaction":77,"./instantiateReactComponent":122,"./invariant":123,"_process":2}],77:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactServerRenderingTransaction
 * @typechecks
 */

"use strict";

var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var emptyFunction = require("./emptyFunction");
var mixInto = require("./mixInto");

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  close: emptyFunction
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: emptyFunction
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  ON_DOM_READY_QUEUEING
];

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap proceedures.
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


mixInto(ReactServerRenderingTransaction, Transaction.Mixin);
mixInto(ReactServerRenderingTransaction, Mixin);

PooledClass.addPoolingTo(ReactServerRenderingTransaction);

module.exports = ReactServerRenderingTransaction;

},{"./CallbackQueue":8,"./PooledClass":29,"./ReactPutListenerQueue":73,"./Transaction":95,"./emptyFunction":105,"./mixInto":136}],78:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTextComponent
 * @typechecks static-only
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactComponent = require("./ReactComponent");
var ReactDescriptor = require("./ReactDescriptor");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var mixInto = require("./mixInto");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactTextComponent
 * @extends ReactComponent
 * @internal
 */
var ReactTextComponent = function(descriptor) {
  this.construct(descriptor);
};

mixInto(ReactTextComponent, ReactComponent.Mixin);
mixInto(ReactTextComponent, ReactBrowserComponentMixin);
mixInto(ReactTextComponent, {

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent: function(rootID, transaction, mountDepth) {
    ReactComponent.Mixin.mountComponent.call(
      this,
      rootID,
      transaction,
      mountDepth
    );

    var escapedText = escapeTextForBrowser(this.props);

    if (transaction.renderToStaticMarkup) {
      // Normally we'd wrap this in a `span` for the reasons stated above, but
      // since this is a situation where React won't take over (static pages),
      // we can simply return the text as it is.
      return escapedText;
    }

    return (
      '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' +
        escapedText +
      '</span>'
    );
  },

  /**
   * Updates this component by updating the text content.
   *
   * @param {object} nextComponent Contains the next text content.
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent: function(nextComponent, transaction) {
    var nextProps = nextComponent.props;
    if (nextProps !== this.props) {
      this.props = nextProps;
      ReactComponent.BackendIDOperations.updateTextContentByID(
        this._rootNodeID,
        nextProps
      );
    }
  }

});

module.exports = ReactDescriptor.createFactory(ReactTextComponent);

},{"./DOMPropertyOperations":14,"./ReactBrowserComponentMixin":31,"./ReactComponent":34,"./ReactDescriptor":54,"./escapeTextForBrowser":107,"./mixInto":136}],79:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactUpdates
 */

"use strict";

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactPerf = require("./ReactPerf");
var Transaction = require("./Transaction");

var invariant = require("./invariant");
var mixInto = require("./mixInto");
var warning = require("./warning");

var dirtyComponents = [];

var batchingStrategy = null;

function ensureInjected() {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactUpdates.ReactReconcileTransaction && batchingStrategy,
    'ReactUpdates: must inject a reconcile transaction class and batching ' +
    'strategy'
  ) : invariant(ReactUpdates.ReactReconcileTransaction && batchingStrategy));
}

var NESTED_UPDATES = {
  initialize: function() {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close: function() {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      // Additional updates were enqueued by componentDidUpdate handlers or
      // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
      // these new updates so that if A's componentDidUpdate calls setState on
      // B, B will update before the callback A's updater provided when calling
      // setState.
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  }
};

var UPDATE_QUEUEING = {
  initialize: function() {
    this.callbackQueue.reset();
  },
  close: function() {
    this.callbackQueue.notifyAll();
  }
};

var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

function ReactUpdatesFlushTransaction() {
  this.reinitializeTransaction();
  this.dirtyComponentsLength = null;
  this.callbackQueue = CallbackQueue.getPooled(null);
  this.reconcileTransaction =
    ReactUpdates.ReactReconcileTransaction.getPooled();
}

mixInto(ReactUpdatesFlushTransaction, Transaction.Mixin);
mixInto(ReactUpdatesFlushTransaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  destructor: function() {
    this.dirtyComponentsLength = null;
    CallbackQueue.release(this.callbackQueue);
    this.callbackQueue = null;
    ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
    this.reconcileTransaction = null;
  },

  perform: function(method, scope, a) {
    // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
    // with this transaction's wrappers around it.
    return Transaction.Mixin.perform.call(
      this,
      this.reconcileTransaction.perform,
      this.reconcileTransaction,
      method,
      scope,
      a
    );
  }
});

PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

function batchedUpdates(callback, a, b) {
  ensureInjected();
  batchingStrategy.batchedUpdates(callback, a, b);
}

/**
 * Array comparator for ReactComponents by owner depth
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountDepthComparator(c1, c2) {
  return c1._mountDepth - c2._mountDepth;
}

function runBatchedUpdates(transaction) {
  var len = transaction.dirtyComponentsLength;
  ("production" !== process.env.NODE_ENV ? invariant(
    len === dirtyComponents.length,
    'Expected flush transaction\'s stored dirty-components length (%s) to ' +
    'match dirty-components array length (%s).',
    len,
    dirtyComponents.length
  ) : invariant(len === dirtyComponents.length));

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
  dirtyComponents.sort(mountDepthComparator);

  for (var i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, ignore them
    // TODO: Queue unmounts in the same list to avoid this happening at all
    var component = dirtyComponents[i];
    if (component.isMounted()) {
      // If performUpdateIfNecessary happens to enqueue any new updates, we
      // shouldn't execute the callbacks until the next render happens, so
      // stash the callbacks first
      var callbacks = component._pendingCallbacks;
      component._pendingCallbacks = null;
      component.performUpdateIfNecessary(transaction.reconcileTransaction);

      if (callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          transaction.callbackQueue.enqueue(
            callbacks[j],
            component
          );
        }
      }
    }
  }
}

var flushBatchedUpdates = ReactPerf.measure(
  'ReactUpdates',
  'flushBatchedUpdates',
  function() {
    // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
    // array and perform any updates enqueued by mount-ready handlers (i.e.,
    // componentDidUpdate) but we need to check here too in order to catch
    // updates enqueued by setState callbacks.
    while (dirtyComponents.length) {
      var transaction = ReactUpdatesFlushTransaction.getPooled();
      transaction.perform(runBatchedUpdates, null, transaction);
      ReactUpdatesFlushTransaction.release(transaction);
    }
  }
);

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
function enqueueUpdate(component, callback) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !callback || typeof callback === "function",
    'enqueueUpdate(...): You called `setProps`, `replaceProps`, ' +
    '`setState`, `replaceState`, or `forceUpdate` with a callback that ' +
    'isn\'t callable.'
  ) : invariant(!callback || typeof callback === "function"));
  ensureInjected();

  // Various parts of our code (such as ReactCompositeComponent's
  // _renderValidatedComponent) assume that calls to render aren't nested;
  // verify that that's the case. (This is called by each top-level update
  // function, like setProps, setState, forceUpdate, etc.; creation and
  // destruction of top-level components is guarded in ReactMount.)
  ("production" !== process.env.NODE_ENV ? warning(
    ReactCurrentOwner.current == null,
    'enqueueUpdate(): Render methods should be a pure function of props ' +
    'and state; triggering nested component updates from render is not ' +
    'allowed. If necessary, trigger nested updates in ' +
    'componentDidUpdate.'
  ) : null);

  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component, callback);
    return;
  }

  dirtyComponents.push(component);

  if (callback) {
    if (component._pendingCallbacks) {
      component._pendingCallbacks.push(callback);
    } else {
      component._pendingCallbacks = [callback];
    }
  }
}

var ReactUpdatesInjection = {
  injectReconcileTransaction: function(ReconcileTransaction) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReconcileTransaction,
      'ReactUpdates: must provide a reconcile transaction class'
    ) : invariant(ReconcileTransaction));
    ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
  },

  injectBatchingStrategy: function(_batchingStrategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      _batchingStrategy,
      'ReactUpdates: must provide a batching strategy'
    ) : invariant(_batchingStrategy));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.batchedUpdates === 'function',
      'ReactUpdates: must provide a batchedUpdates() function'
    ) : invariant(typeof _batchingStrategy.batchedUpdates === 'function'));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.isBatchingUpdates === 'boolean',
      'ReactUpdates: must provide an isBatchingUpdates boolean attribute'
    ) : invariant(typeof _batchingStrategy.isBatchingUpdates === 'boolean'));
    batchingStrategy = _batchingStrategy;
  }
};

var ReactUpdates = {
  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
  ReactReconcileTransaction: null,

  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection
};

module.exports = ReactUpdates;

}).call(this,require('_process'))
},{"./CallbackQueue":8,"./PooledClass":29,"./ReactCurrentOwner":38,"./ReactPerf":68,"./Transaction":95,"./invariant":123,"./mixInto":136,"./warning":146,"_process":2}],80:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SVGDOMPropertyConfig
 */

/*jslint bitwise: true*/

"use strict";

var DOMProperty = require("./DOMProperty");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

var SVGDOMPropertyConfig = {
  Properties: {
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    dx: MUST_USE_ATTRIBUTE,
    dy: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fillOpacity: MUST_USE_ATTRIBUTE,
    fontFamily: MUST_USE_ATTRIBUTE,
    fontSize: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    markerEnd: MUST_USE_ATTRIBUTE,
    markerMid: MUST_USE_ATTRIBUTE,
    markerStart: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    opacity: MUST_USE_ATTRIBUTE,
    patternContentUnits: MUST_USE_ATTRIBUTE,
    patternUnits: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    preserveAspectRatio: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeDasharray: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeOpacity: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    textAnchor: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    fillOpacity: 'fill-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    patternContentUnits: 'patternContentUnits',
    patternUnits: 'patternUnits',
    preserveAspectRatio: 'preserveAspectRatio',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeDasharray: 'stroke-dasharray',
    strokeLinecap: 'stroke-linecap',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    viewBox: 'viewBox'
  }
};

module.exports = SVGDOMPropertyConfig;

},{"./DOMProperty":13}],81:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SelectEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");

var getActiveElement = require("./getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");
var shallowEqual = require("./shallowEqual");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topContextMenu,
      topLevelTypes.topFocus,
      topLevelTypes.topKeyDown,
      topLevelTypes.topMouseDown,
      topLevelTypes.topMouseUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @param {object}
 */
function getSelection(node) {
  if ('selectionStart' in node &&
      ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  } else {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown ||
      activeElement == null ||
      activeElement != getActiveElement()) {
    return;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(
      eventTypes.select,
      activeElementID,
      nativeEvent
    );

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) ||
            topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't).
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      case topLevelTypes.topSelectionChange:
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent);
    }
  }
};

module.exports = SelectEventPlugin;

},{"./EventConstants":18,"./EventPropagators":23,"./ReactInputSelection":61,"./SyntheticEvent":87,"./getActiveElement":111,"./isTextInputElement":126,"./keyOf":130,"./shallowEqual":142}],82:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ServerReactRootIndex
 * @typechecks
 */

"use strict";

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. In the future we need a way to generate GUIDs but for
 * now this will work on a smaller scale.
 */
var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);

var ServerReactRootIndex = {
  createReactRootIndex: function() {
    return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
  }
};

module.exports = ServerReactRootIndex;

},{}],83:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SimpleEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
var SyntheticEvent = require("./SyntheticEvent");
var SyntheticFocusEvent = require("./SyntheticFocusEvent");
var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var SyntheticDragEvent = require("./SyntheticDragEvent");
var SyntheticTouchEvent = require("./SyntheticTouchEvent");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var SyntheticWheelEvent = require("./SyntheticWheelEvent");

var invariant = require("./invariant");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBlur: true}),
      captured: keyOf({onBlurCapture: true})
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({onClick: true}),
      captured: keyOf({onClickCapture: true})
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({onContextMenu: true}),
      captured: keyOf({onContextMenuCapture: true})
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCopy: true}),
      captured: keyOf({onCopyCapture: true})
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCut: true}),
      captured: keyOf({onCutCapture: true})
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDoubleClick: true}),
      captured: keyOf({onDoubleClickCapture: true})
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrag: true}),
      captured: keyOf({onDragCapture: true})
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnd: true}),
      captured: keyOf({onDragEndCapture: true})
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnter: true}),
      captured: keyOf({onDragEnterCapture: true})
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragExit: true}),
      captured: keyOf({onDragExitCapture: true})
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragLeave: true}),
      captured: keyOf({onDragLeaveCapture: true})
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragOver: true}),
      captured: keyOf({onDragOverCapture: true})
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragStart: true}),
      captured: keyOf({onDragStartCapture: true})
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrop: true}),
      captured: keyOf({onDropCapture: true})
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({onFocus: true}),
      captured: keyOf({onFocusCapture: true})
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({onInput: true}),
      captured: keyOf({onInputCapture: true})
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyDown: true}),
      captured: keyOf({onKeyDownCapture: true})
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyPress: true}),
      captured: keyOf({onKeyPressCapture: true})
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyUp: true}),
      captured: keyOf({onKeyUpCapture: true})
    }
  },
  load: {
    phasedRegistrationNames: {
      bubbled: keyOf({onLoad: true}),
      captured: keyOf({onLoadCapture: true})
    }
  },
  error: {
    phasedRegistrationNames: {
      bubbled: keyOf({onError: true}),
      captured: keyOf({onErrorCapture: true})
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseDown: true}),
      captured: keyOf({onMouseDownCapture: true})
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseMove: true}),
      captured: keyOf({onMouseMoveCapture: true})
    }
  },
  mouseOut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOut: true}),
      captured: keyOf({onMouseOutCapture: true})
    }
  },
  mouseOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOver: true}),
      captured: keyOf({onMouseOverCapture: true})
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseUp: true}),
      captured: keyOf({onMouseUpCapture: true})
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({onPaste: true}),
      captured: keyOf({onPasteCapture: true})
    }
  },
  reset: {
    phasedRegistrationNames: {
      bubbled: keyOf({onReset: true}),
      captured: keyOf({onResetCapture: true})
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({onScroll: true}),
      captured: keyOf({onScrollCapture: true})
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSubmit: true}),
      captured: keyOf({onSubmitCapture: true})
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchCancel: true}),
      captured: keyOf({onTouchCancelCapture: true})
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchEnd: true}),
      captured: keyOf({onTouchEndCapture: true})
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchMove: true}),
      captured: keyOf({onTouchMoveCapture: true})
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchStart: true}),
      captured: keyOf({onTouchStartCapture: true})
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onWheel: true}),
      captured: keyOf({onWheelCapture: true})
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topBlur:        eventTypes.blur,
  topClick:       eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy:        eventTypes.copy,
  topCut:         eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag:        eventTypes.drag,
  topDragEnd:     eventTypes.dragEnd,
  topDragEnter:   eventTypes.dragEnter,
  topDragExit:    eventTypes.dragExit,
  topDragLeave:   eventTypes.dragLeave,
  topDragOver:    eventTypes.dragOver,
  topDragStart:   eventTypes.dragStart,
  topDrop:        eventTypes.drop,
  topError:       eventTypes.error,
  topFocus:       eventTypes.focus,
  topInput:       eventTypes.input,
  topKeyDown:     eventTypes.keyDown,
  topKeyPress:    eventTypes.keyPress,
  topKeyUp:       eventTypes.keyUp,
  topLoad:        eventTypes.load,
  topMouseDown:   eventTypes.mouseDown,
  topMouseMove:   eventTypes.mouseMove,
  topMouseOut:    eventTypes.mouseOut,
  topMouseOver:   eventTypes.mouseOver,
  topMouseUp:     eventTypes.mouseUp,
  topPaste:       eventTypes.paste,
  topReset:       eventTypes.reset,
  topScroll:      eventTypes.scroll,
  topSubmit:      eventTypes.submit,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd:    eventTypes.touchEnd,
  topTouchMove:   eventTypes.touchMove,
  topTouchStart:  eventTypes.touchStart,
  topWheel:       eventTypes.wheel
};

for (var topLevelType in topLevelEventsToDispatchConfig) {
  topLevelEventsToDispatchConfig[topLevelType].dependencies = [topLevelType];
}

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false.
   *
   * @param {object} Event to be dispatched.
   * @param {function} Application-level callback.
   * @param {string} domID DOM ID to pass to the callback.
   */
  executeDispatch: function(event, listener, domID) {
    var returnValue = EventPluginUtils.executeDispatch(event, listener, domID);
    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch (topLevelType) {
      case topLevelTypes.topInput:
      case topLevelTypes.topLoad:
      case topLevelTypes.topError:
      case topLevelTypes.topReset:
      case topLevelTypes.topSubmit:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyPress:
        // FireFox creates a keypress event for function keys too. This removes
        // the unwanted keypress events.
        if (nativeEvent.charCode === 0) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseOut:
      case topLevelTypes.topMouseOver:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
        EventConstructor = SyntheticDragEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      EventConstructor,
      'SimpleEventPlugin: Unhandled event type, `%s`.',
      topLevelType
    ) : invariant(EventConstructor));
    var event = EventConstructor.getPooled(
      dispatchConfig,
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }

};

module.exports = SimpleEventPlugin;

}).call(this,require('_process'))
},{"./EventConstants":18,"./EventPluginUtils":22,"./EventPropagators":23,"./SyntheticClipboardEvent":84,"./SyntheticDragEvent":86,"./SyntheticEvent":87,"./SyntheticFocusEvent":88,"./SyntheticKeyboardEvent":90,"./SyntheticMouseEvent":91,"./SyntheticTouchEvent":92,"./SyntheticUIEvent":93,"./SyntheticWheelEvent":94,"./invariant":123,"./keyOf":130,"_process":2}],84:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: function(event) {
    return (
      'clipboardData' in event ?
        event.clipboardData :
        window.clipboardData
    );
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;


},{"./SyntheticEvent":87}],85:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticCompositionEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticCompositionEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticCompositionEvent,
  CompositionEventInterface
);

module.exports = SyntheticCompositionEvent;


},{"./SyntheticEvent":87}],86:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticDragEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

module.exports = SyntheticDragEvent;

},{"./SyntheticMouseEvent":91}],87:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

"use strict";

var PooledClass = require("./PooledClass");

var emptyFunction = require("./emptyFunction");
var getEventTarget = require("./getEventTarget");
var merge = require("./merge");
var mergeInto = require("./mergeInto");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: getEventTarget,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      this[propName] = nativeEvent[propName];
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ?
    nativeEvent.defaultPrevented :
    nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

mergeInto(SyntheticEvent.prototype, {

  preventDefault: function() {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function() {
    var event = this.nativeEvent;
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function() {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function() {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  mergeInto(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = merge(Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;

},{"./PooledClass":29,"./emptyFunction":105,"./getEventTarget":114,"./merge":133,"./mergeInto":135}],88:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;

},{"./SyntheticUIEvent":93}],89:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticInputEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
var InputEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticInputEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticInputEvent,
  InputEventInterface
);

module.exports = SyntheticInputEvent;


},{"./SyntheticEvent":87}],90:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventKey = require("./getEventKey");
var getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated but its replacement is not yet final and not
    // implemented in any major browser.
    if (event.type === 'keypress') {
      // IE8 does not implement "charCode", but "keyCode" has the correct value.
      return 'charCode' in event ? event.charCode : event.keyCode;
    }
    return 0;
  },
  keyCode: function(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event. There is no need to determine the type of the event
    // as `keyCode` and `charCode` are either aliased or default to zero.
    return event.keyCode || event.charCode;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":93,"./getEventKey":112,"./getEventModifierState":113}],91:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticMouseEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");
var ViewportMetrics = require("./ViewportMetrics");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: function(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function(event) {
    return event.relatedTarget || (
      event.fromElement === event.srcElement ?
        event.toElement :
        event.fromElement
    );
  },
  // "Proprietary" Interface.
  pageX: function(event) {
    return 'pageX' in event ?
      event.pageX :
      event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function(event) {
    return 'pageY' in event ?
      event.pageY :
      event.clientY + ViewportMetrics.currentScrollTop;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

module.exports = SyntheticMouseEvent;

},{"./SyntheticUIEvent":93,"./ViewportMetrics":96,"./getEventModifierState":113}],92:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;

},{"./SyntheticUIEvent":93,"./getEventModifierState":113}],93:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

var getEventTarget = require("./getEventTarget");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: function(event) {
    if (event.view) {
      return event.view;
    }

    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      // target is a window object
      return target;
    }

    var doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function(event) {
    return event.detail || 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;

},{"./SyntheticEvent":87,"./getEventTarget":114}],94:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function(event) {
    return (
      'deltaX' in event ? event.deltaX :
      // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0
    );
  },
  deltaY: function(event) {
    return (
      'deltaY' in event ? event.deltaY :
      // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      'wheelDeltaY' in event ? -event.wheelDeltaY :
      // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event ? -event.wheelDelta : 0
    );
  },
  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;

},{"./SyntheticMouseEvent":91}],95:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Transaction
 */

"use strict";

var invariant = require("./invariant");

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM upates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var Mixin = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction: function() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (!this.wrapperInitData) {
      this.wrapperInitData = [];
    } else {
      this.wrapperInitData.length = 0;
    }
    this._isInTransaction = false;
  },

  _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers: null,

  isInTransaction: function() {
    return !!this._isInTransaction;
  },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} args... Arguments to pass to the method (optional).
   *                           Helps prevent need to bind in many cases.
   * @return Return value from `method`.
   */
  perform: function(method, scope, a, b, c, d, e, f) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !this.isInTransaction(),
      'Transaction.perform(...): Cannot initialize a transaction when there ' +
      'is already an outstanding transaction.'
    ) : invariant(!this.isInTransaction()));
    var errorThrown;
    var ret;
    try {
      this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
      errorThrown = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
          try {
            this.closeAll(0);
          } catch (err) {
          }
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  },

  initializeAll: function(startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
        this.wrapperInitData[i] = wrapper.initialize ?
          wrapper.initialize.call(this) :
          null;
      } finally {
        if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
          try {
            this.initializeAll(i + 1);
          } catch (err) {
          }
        }
      }
    }
  },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll: function(startIndex) {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isInTransaction(),
      'Transaction.closeAll(): Cannot close transaction when none are open.'
    ) : invariant(this.isInTransaction()));
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
        errorThrown = true;
        if (initData !== Transaction.OBSERVED_ERROR) {
          wrapper.close && wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {
          }
        }
      }
    }
    this.wrapperInitData.length = 0;
  }
};

var Transaction = {

  Mixin: Mixin,

  /**
   * Token to look for to determine if an error occured.
   */
  OBSERVED_ERROR: {}

};

module.exports = Transaction;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],96:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ViewportMetrics
 */

"use strict";

var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");

var ViewportMetrics = {

  currentScrollLeft: 0,

  currentScrollTop: 0,

  refreshScrollValues: function() {
    var scrollPosition = getUnboundedScrollPosition(window);
    ViewportMetrics.currentScrollLeft = scrollPosition.x;
    ViewportMetrics.currentScrollTop = scrollPosition.y;
  }

};

module.exports = ViewportMetrics;

},{"./getUnboundedScrollPosition":119}],97:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule accumulate
 */

"use strict";

var invariant = require("./invariant");

/**
 * Accumulates items that must not be null or undefined.
 *
 * This is used to conserve memory by avoiding array allocations.
 *
 * @return {*|array<*>} An accumulation of items.
 */
function accumulate(current, next) {
  ("production" !== process.env.NODE_ENV ? invariant(
    next != null,
    'accumulate(...): Accumulated items must be not be null or undefined.'
  ) : invariant(next != null));
  if (current == null) {
    return next;
  } else {
    // Both are not empty. Warning: Never call x.concat(y) when you are not
    // certain that x is an Array (x could be a string with concat method).
    var currentIsArray = Array.isArray(current);
    var nextIsArray = Array.isArray(next);
    if (currentIsArray) {
      return current.concat(next);
    } else {
      if (nextIsArray) {
        return [current].concat(next);
      } else {
        return [current, next];
      }
    }
  }
}

module.exports = accumulate;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],98:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule adler32
 */

/* jslint bitwise:true */

"use strict";

var MOD = 65521;

// This is a clean-room implementation of adler32 designed for detecting
// if markup is not what we expect it to be. It does not need to be
// cryptographically strong, only reasonable good at detecting if markup
// generated on the server is different than that on the client.
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return a | (b << 16);
}

module.exports = adler32;

},{}],99:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule containsNode
 * @typechecks
 */

var isTextNode = require("./isTextNode");

/*jslint bitwise:true */

/**
 * Checks if a given DOM node contains or is another DOM node.
 *
 * @param {?DOMNode} outerNode Outer DOM node.
 * @param {?DOMNode} innerNode Inner DOM node.
 * @return {boolean} True if `outerNode` contains or is `innerNode`.
 */
function containsNode(outerNode, innerNode) {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if (outerNode.contains) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

module.exports = containsNode;

},{"./isTextNode":127}],100:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule copyProperties
 */

/**
 * Copy properties from one or more objects (up to 5) into the first object.
 * This is a shallow copy. It mutates the first object and also returns it.
 *
 * NOTE: `arguments` has a very significant performance penalty, which is why
 * we don't support unlimited arguments.
 */
function copyProperties(obj, a, b, c, d, e, f) {
  obj = obj || {};

  if ("production" !== process.env.NODE_ENV) {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  var args = [a, b, c, d, e];
  var ii = 0, v;
  while (args[ii]) {
    v = args[ii++];
    for (var k in v) {
      obj[k] = v[k];
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
        (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString;
    }
  }

  return obj;
}

module.exports = copyProperties;

}).call(this,require('_process'))
},{"_process":2}],101:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createArrayFrom
 * @typechecks
 */

var toArray = require("./toArray");

/**
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * It will return false for other array-like objects like Filelist.
 *
 * @param {*} obj
 * @return {boolean}
 */
function hasArrayNature(obj) {
  return (
    // not null/false
    !!obj &&
    // arrays are objects, NodeLists are functions in Safari
    (typeof obj == 'object' || typeof obj == 'function') &&
    // quacks like an array
    ('length' in obj) &&
    // not window
    !('setInterval' in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    (typeof obj.nodeType != 'number') &&
    (
      // a real array
      (// HTMLCollection/NodeList
      (Array.isArray(obj) ||
      // arguments
      ('callee' in obj) || 'item' in obj))
    )
  );
}

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFrom = require('createArrayFrom');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFrom(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * If you need to convert an array-like object, like `arguments`, into an array
 * use toArray instead.
 *
 * @param {*} obj
 * @return {array}
 */
function createArrayFrom(obj) {
  if (!hasArrayNature(obj)) {
    return [obj];
  } else if (Array.isArray(obj)) {
    return obj.slice();
  } else {
    return toArray(obj);
  }
}

module.exports = createArrayFrom;

},{"./toArray":144}],102:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createFullPageComponent
 * @typechecks
 */

"use strict";

// Defeat circular references by requiring this directly.
var ReactCompositeComponent = require("./ReactCompositeComponent");

var invariant = require("./invariant");

/**
 * Create a component that will throw an exception when unmounted.
 *
 * Components like <html> <head> and <body> can't be removed or added
 * easily in a cross-browser way, however it's valuable to be able to
 * take advantage of React's reconciliation for styling and <title>
 * management. So we just document it and throw in dangerous cases.
 *
 * @param {function} componentClass convenience constructor to wrap
 * @return {function} convenience constructor of new component
 */
function createFullPageComponent(componentClass) {
  var FullPageComponent = ReactCompositeComponent.createClass({
    displayName: 'ReactFullPageComponent' + (
      componentClass.type.displayName || ''
    ),

    componentWillUnmount: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        false,
        '%s tried to unmount. Because of cross-browser quirks it is ' +
        'impossible to unmount some top-level components (eg <html>, <head>, ' +
        'and <body>) reliably and efficiently. To fix this, have a single ' +
        'top-level component that never unmounts render these elements.',
        this.constructor.displayName
      ) : invariant(false));
    },

    render: function() {
      return this.transferPropsTo(componentClass(null, this.props.children));
    }
  });

  return FullPageComponent;
}

module.exports = createFullPageComponent;

}).call(this,require('_process'))
},{"./ReactCompositeComponent":36,"./invariant":123,"_process":2}],103:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*jslint evil: true, sub: true */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createArrayFrom = require("./createArrayFrom");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

/**
 * Dummy container used to render all markup.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Pattern used by `getNodeName`.
 */
var nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  var nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
function createNodesFromMarkup(markup, handleScript) {
  var node = dummyNode;
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'createNodesFromMarkup dummy not initialized') : invariant(!!dummyNode));
  var nodeName = getNodeName(markup);

  var wrap = nodeName && getMarkupWrap(nodeName);
  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];

    var wrapDepth = wrap[0];
    while (wrapDepth--) {
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  var scripts = node.getElementsByTagName('script');
  if (scripts.length) {
    ("production" !== process.env.NODE_ENV ? invariant(
      handleScript,
      'createNodesFromMarkup(...): Unexpected <script> element rendered.'
    ) : invariant(handleScript));
    createArrayFrom(scripts).forEach(handleScript);
  }

  var nodes = createArrayFrom(node.childNodes);
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
  return nodes;
}

module.exports = createNodesFromMarkup;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":24,"./createArrayFrom":101,"./getMarkupWrap":115,"./invariant":123,"_process":2}],104:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule dangerousStyleValue
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

var isUnitlessNumber = CSSProperty.isUnitlessNumber;

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 ||
      isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value; // cast to string
  }

  if (typeof value === 'string') {
    value = value.trim();
  }
  return value + 'px';
}

module.exports = dangerousStyleValue;

},{"./CSSProperty":6}],105:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyFunction
 */

var copyProperties = require("./copyProperties");

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

copyProperties(emptyFunction, {
  thatReturns: makeEmptyFunction,
  thatReturnsFalse: makeEmptyFunction(false),
  thatReturnsTrue: makeEmptyFunction(true),
  thatReturnsNull: makeEmptyFunction(null),
  thatReturnsThis: function() { return this; },
  thatReturnsArgument: function(arg) { return arg; }
});

module.exports = emptyFunction;

},{"./copyProperties":100}],106:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyObject
 */

"use strict";

var emptyObject = {};

if ("production" !== process.env.NODE_ENV) {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;

}).call(this,require('_process'))
},{"_process":2}],107:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule escapeTextForBrowser
 * @typechecks static-only
 */

"use strict";

var ESCAPE_LOOKUP = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  "\"": "&quot;",
  "'": "&#x27;"
};

var ESCAPE_REGEX = /[&><"']/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextForBrowser(text) {
  return ('' + text).replace(ESCAPE_REGEX, escaper);
}

module.exports = escapeTextForBrowser;

},{}],108:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule flattenChildren
 */

"use strict";

var traverseAllChildren = require("./traverseAllChildren");
var warning = require("./warning");

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 */
function flattenSingleChildIntoContext(traverseContext, child, name) {
  // We found a component instance.
  var result = traverseContext;
  var keyUnique = !result.hasOwnProperty(name);
  ("production" !== process.env.NODE_ENV ? warning(
    keyUnique,
    'flattenChildren(...): Encountered two children with the same key, ' +
    '`%s`. Child keys must be unique; when two children share a key, only ' +
    'the first child will be used.',
    name
  ) : null);
  if (keyUnique && child != null) {
    result[name] = child;
  }
}

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children == null) {
    return children;
  }
  var result = {};
  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

module.exports = flattenChildren;

}).call(this,require('_process'))
},{"./traverseAllChildren":145,"./warning":146,"_process":2}],109:[function(require,module,exports){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule focusNode
 */

"use strict";

/**
 * IE8 throws if an input/textarea is disabled and we try to focus it.
 * Focus only when necessary.
 *
 * @param {DOMElement} node input/textarea to focus
 */
function focusNode(node) {
  if (!node.disabled) {
    node.focus();
  }
}

module.exports = focusNode;

},{}],110:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule forEachAccumulated
 */

"use strict";

/**
 * @param {array} an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */
var forEachAccumulated = function(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
};

module.exports = forEachAccumulated;

},{}],111:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document body is not yet defined.
 */
function getActiveElement() /*?DOMElement*/ {
  try {
    return document.activeElement || document.body;
  } catch (e) {
    return document.body;
  }
}

module.exports = getActiveElement;

},{}],112:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `which`/`keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    // Create the character from the `charCode` ourselves and use as an almost
    // perfect replacement.
    var charCode = 'charCode' in nativeEvent ?
      nativeEvent.charCode :
      nativeEvent.keyCode;

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }

  ("production" !== process.env.NODE_ENV ? invariant(false, "Unexpected keyboard event type: %s", nativeEvent.type) : invariant(false));
}

module.exports = getEventKey;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],113:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventModifierState
 * @typechecks static-only
 */

"use strict";

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  /*jshint validthis:true */
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

module.exports = getEventModifierState;

},{}],114:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

"use strict";

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;

},{}],115:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getMarkupWrap
 */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var invariant = require("./invariant");

/**
 * Dummy container used to detect which wraps are necessary.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */
var shouldWrap = {
  // Force wrapping for SVG elements because if they get created inside a <div>,
  // they will be initialized in the wrong namespace (and will not display).
  'circle': true,
  'defs': true,
  'ellipse': true,
  'g': true,
  'line': true,
  'linearGradient': true,
  'path': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'text': true
};

var selectWrap = [1, '<select multiple="true">', '</select>'];
var tableWrap = [1, '<table>', '</table>'];
var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

var svgWrap = [1, '<svg>', '</svg>'];

var markupWrap = {
  '*': [1, '?<div>', '</div>'],

  'area': [1, '<map>', '</map>'],
  'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  'legend': [1, '<fieldset>', '</fieldset>'],
  'param': [1, '<object>', '</object>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],

  'optgroup': selectWrap,
  'option': selectWrap,

  'caption': tableWrap,
  'colgroup': tableWrap,
  'tbody': tableWrap,
  'tfoot': tableWrap,
  'thead': tableWrap,

  'td': trWrap,
  'th': trWrap,

  'circle': svgWrap,
  'defs': svgWrap,
  'ellipse': svgWrap,
  'g': svgWrap,
  'line': svgWrap,
  'linearGradient': svgWrap,
  'path': svgWrap,
  'polygon': svgWrap,
  'polyline': svgWrap,
  'radialGradient': svgWrap,
  'rect': svgWrap,
  'stop': svgWrap,
  'text': svgWrap
};

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
function getMarkupWrap(nodeName) {
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'Markup wrapping node not initialized') : invariant(!!dummyNode));
  if (!markupWrap.hasOwnProperty(nodeName)) {
    nodeName = '*';
  }
  if (!shouldWrap.hasOwnProperty(nodeName)) {
    if (nodeName === '*') {
      dummyNode.innerHTML = '<link />';
    } else {
      dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
    }
    shouldWrap[nodeName] = !dummyNode.firstChild;
  }
  return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
}


module.exports = getMarkupWrap;

}).call(this,require('_process'))
},{"./ExecutionEnvironment":24,"./invariant":123,"_process":2}],116:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getNodeForCharacterOffset
 */

"use strict";

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType == 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;

},{}],117:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getReactRootElementInContainer
 */

"use strict";

var DOC_NODE_TYPE = 9;

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 *                                           a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

module.exports = getReactRootElementInContainer;

},{}],118:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getTextContentAccessor
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey = 'textContent' in document.documentElement ?
      'textContent' :
      'innerText';
  }
  return contentKey;
}

module.exports = getTextContentAccessor;

},{"./ExecutionEnvironment":24}],119:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

"use strict";

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;

},{}],120:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule hyphenate
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;

},{}],121:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule hyphenateStyleName
 * @typechecks
 */

"use strict";

var hyphenate = require("./hyphenate");

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *   > hyphenate('MozTransition')
 *   < "-moz-transition"
 *   > hyphenate('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

},{"./hyphenate":120}],122:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule instantiateReactComponent
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Validate a `componentDescriptor`. This should be exposed publicly in a follow
 * up diff.
 *
 * @param {object} descriptor
 * @return {boolean} Returns true if this is a valid descriptor of a Component.
 */
function isValidComponentDescriptor(descriptor) {
  return (
    descriptor &&
    typeof descriptor.type === 'function' &&
    typeof descriptor.type.prototype.mountComponent === 'function' &&
    typeof descriptor.type.prototype.receiveComponent === 'function'
  );
}

/**
 * Given a `componentDescriptor` create an instance that will actually be
 * mounted. Currently it just extracts an existing clone from composite
 * components but this is an implementation detail which will change.
 *
 * @param {object} descriptor
 * @return {object} A new instance of componentDescriptor's constructor.
 * @protected
 */
function instantiateReactComponent(descriptor) {

  // TODO: Make warning
  // if (__DEV__) {
    ("production" !== process.env.NODE_ENV ? invariant(
      isValidComponentDescriptor(descriptor),
      'Only React Components are valid for mounting.'
    ) : invariant(isValidComponentDescriptor(descriptor)));
  // }

  return new descriptor.type(descriptor);
}

module.exports = instantiateReactComponent;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],123:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":2}],124:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isEventSupported
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM ||
      capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in document;

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

module.exports = isEventSupported;

},{"./ExecutionEnvironment":24}],125:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isNode
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
function isNode(object) {
  return !!(object && (
    typeof Node === 'function' ? object instanceof Node :
      typeof object === 'object' &&
      typeof object.nodeType === 'number' &&
      typeof object.nodeName === 'string'
  ));
}

module.exports = isNode;

},{}],126:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextInputElement
 */

"use strict";

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  'color': true,
  'date': true,
  'datetime': true,
  'datetime-local': true,
  'email': true,
  'month': true,
  'number': true,
  'password': true,
  'range': true,
  'search': true,
  'tel': true,
  'text': true,
  'time': true,
  'url': true,
  'week': true
};

function isTextInputElement(elem) {
  return elem && (
    (elem.nodeName === 'INPUT' && supportedInputTypes[elem.type]) ||
    elem.nodeName === 'TEXTAREA'
  );
}

module.exports = isTextInputElement;

},{}],127:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextNode
 * @typechecks
 */

var isNode = require("./isNode");

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;

},{"./isNode":125}],128:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule joinClasses
 * @typechecks static-only
 */

"use strict";

/**
 * Combines multiple className strings into one.
 * http://jsperf.com/joinclasses-args-vs-array
 *
 * @param {...?string} classes
 * @return {string}
 */
function joinClasses(className/*, ... */) {
  if (!className) {
    className = '';
  }
  var nextClass;
  var argLength = arguments.length;
  if (argLength > 1) {
    for (var ii = 1; ii < argLength; ii++) {
      nextClass = arguments[ii];
      nextClass && (className += ' ' + nextClass);
    }
  }
  return className;
}

module.exports = joinClasses;

},{}],129:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  ("production" !== process.env.NODE_ENV ? invariant(
    obj instanceof Object && !Array.isArray(obj),
    'keyMirror(...): Argument must be an object.'
  ) : invariant(obj instanceof Object && !Array.isArray(obj)));
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],130:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],131:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mapObject
 */

"use strict";

/**
 * For each key/value pair, invokes callback func and constructs a resulting
 * object which contains, for every key in obj, values that are the result of
 * of invoking the function:
 *
 *   func(value, key, iteration)
 *
 * Grepable names:
 *
 *   function objectMap()
 *   function objMap()
 *
 * @param {?object} obj Object to map keys over
 * @param {function} func Invoked for each key/val pair.
 * @param {?*} context
 * @return {?object} Result of mapping or null if obj is falsey
 */
function mapObject(obj, func, context) {
  if (!obj) {
    return null;
  }
  var i = 0;
  var ret = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = func.call(context, obj[key], key, i++);
    }
  }
  return ret;
}

module.exports = mapObject;

},{}],132:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule memoizeStringOnly
 * @typechecks static-only
 */

"use strict";

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
function memoizeStringOnly(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}

module.exports = memoizeStringOnly;

},{}],133:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule merge
 */

"use strict";

var mergeInto = require("./mergeInto");

/**
 * Shallow merges two structures into a return value, without mutating either.
 *
 * @param {?object} one Optional object with properties to merge from.
 * @param {?object} two Optional object with properties to merge from.
 * @return {object} The shallow extension of one by two.
 */
var merge = function(one, two) {
  var result = {};
  mergeInto(result, one);
  mergeInto(result, two);
  return result;
};

module.exports = merge;

},{"./mergeInto":135}],134:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeHelpers
 *
 * requiresPolyfills: Array.isArray
 */

"use strict";

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");

/**
 * Maximum number of levels to traverse. Will catch circular structures.
 * @const
 */
var MAX_MERGE_DEPTH = 36;

/**
 * We won't worry about edge cases like new String('x') or new Boolean(true).
 * Functions are considered terminals, and arrays are not.
 * @param {*} o The item/object/value to test.
 * @return {boolean} true iff the argument is a terminal.
 */
var isTerminal = function(o) {
  return typeof o !== 'object' || o === null;
};

var mergeHelpers = {

  MAX_MERGE_DEPTH: MAX_MERGE_DEPTH,

  isTerminal: isTerminal,

  /**
   * Converts null/undefined values into empty object.
   *
   * @param {?Object=} arg Argument to be normalized (nullable optional)
   * @return {!Object}
   */
  normalizeMergeArg: function(arg) {
    return arg === undefined || arg === null ? {} : arg;
  },

  /**
   * If merging Arrays, a merge strategy *must* be supplied. If not, it is
   * likely the caller's fault. If this function is ever called with anything
   * but `one` and `two` being `Array`s, it is the fault of the merge utilities.
   *
   * @param {*} one Array to merge into.
   * @param {*} two Array to merge from.
   */
  checkMergeArrayArgs: function(one, two) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(one) && Array.isArray(two),
      'Tried to merge arrays, instead got %s and %s.',
      one,
      two
    ) : invariant(Array.isArray(one) && Array.isArray(two)));
  },

  /**
   * @param {*} one Object to merge into.
   * @param {*} two Object to merge from.
   */
  checkMergeObjectArgs: function(one, two) {
    mergeHelpers.checkMergeObjectArg(one);
    mergeHelpers.checkMergeObjectArg(two);
  },

  /**
   * @param {*} arg
   */
  checkMergeObjectArg: function(arg) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !isTerminal(arg) && !Array.isArray(arg),
      'Tried to merge an object, instead got %s.',
      arg
    ) : invariant(!isTerminal(arg) && !Array.isArray(arg)));
  },

  /**
   * @param {*} arg
   */
  checkMergeIntoObjectArg: function(arg) {
    ("production" !== process.env.NODE_ENV ? invariant(
      (!isTerminal(arg) || typeof arg === 'function') && !Array.isArray(arg),
      'Tried to merge into an object, instead got %s.',
      arg
    ) : invariant((!isTerminal(arg) || typeof arg === 'function') && !Array.isArray(arg)));
  },

  /**
   * Checks that a merge was not given a circular object or an object that had
   * too great of depth.
   *
   * @param {number} Level of recursion to validate against maximum.
   */
  checkMergeLevel: function(level) {
    ("production" !== process.env.NODE_ENV ? invariant(
      level < MAX_MERGE_DEPTH,
      'Maximum deep merge depth exceeded. You may be attempting to merge ' +
      'circular structures in an unsupported way.'
    ) : invariant(level < MAX_MERGE_DEPTH));
  },

  /**
   * Checks that the supplied merge strategy is valid.
   *
   * @param {string} Array merge strategy.
   */
  checkArrayStrategy: function(strategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      strategy === undefined || strategy in mergeHelpers.ArrayStrategies,
      'You must provide an array strategy to deep merge functions to ' +
      'instruct the deep merge how to resolve merging two arrays.'
    ) : invariant(strategy === undefined || strategy in mergeHelpers.ArrayStrategies));
  },

  /**
   * Set of possible behaviors of merge algorithms when encountering two Arrays
   * that must be merged together.
   * - `clobber`: The left `Array` is ignored.
   * - `indexByIndex`: The result is achieved by recursively deep merging at
   *   each index. (not yet supported.)
   */
  ArrayStrategies: keyMirror({
    Clobber: true,
    IndexByIndex: true
  })

};

module.exports = mergeHelpers;

}).call(this,require('_process'))
},{"./invariant":123,"./keyMirror":129,"_process":2}],135:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeInto
 * @typechecks static-only
 */

"use strict";

var mergeHelpers = require("./mergeHelpers");

var checkMergeObjectArg = mergeHelpers.checkMergeObjectArg;
var checkMergeIntoObjectArg = mergeHelpers.checkMergeIntoObjectArg;

/**
 * Shallow merges two structures by mutating the first parameter.
 *
 * @param {object|function} one Object to be merged into.
 * @param {?object} two Optional object with properties to merge from.
 */
function mergeInto(one, two) {
  checkMergeIntoObjectArg(one);
  if (two != null) {
    checkMergeObjectArg(two);
    for (var key in two) {
      if (!two.hasOwnProperty(key)) {
        continue;
      }
      one[key] = two[key];
    }
  }
}

module.exports = mergeInto;

},{"./mergeHelpers":134}],136:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mixInto
 */

"use strict";

/**
 * Simply copies properties to the prototype.
 */
var mixInto = function(constructor, methodBag) {
  var methodName;
  for (methodName in methodBag) {
    if (!methodBag.hasOwnProperty(methodName)) {
      continue;
    }
    constructor.prototype[methodName] = methodBag[methodName];
  }
};

module.exports = mixInto;

},{}],137:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule monitorCodeUse
 */

"use strict";

var invariant = require("./invariant");

/**
 * Provides open-source compatible instrumentation for monitoring certain API
 * uses before we're ready to issue a warning or refactor. It accepts an event
 * name which may only contain the characters [a-z0-9_] and an optional data
 * object with further information.
 */

function monitorCodeUse(eventName, data) {
  ("production" !== process.env.NODE_ENV ? invariant(
    eventName && !/[^a-z0-9_]/.test(eventName),
    'You must provide an eventName using only the characters [a-z0-9_]'
  ) : invariant(eventName && !/[^a-z0-9_]/.test(eventName)));
}

module.exports = monitorCodeUse;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],138:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule onlyChild
 */
"use strict";

var ReactDescriptor = require("./ReactDescriptor");

var invariant = require("./invariant");

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection. The current implementation of this
 * function assumes that a single child gets passed without a wrapper, but the
 * purpose of this helper function is to abstract away the particular structure
 * of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactComponent} The first and only `ReactComponent` contained in the
 * structure.
 */
function onlyChild(children) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactDescriptor.isValidDescriptor(children),
    'onlyChild must be passed a children with exactly one child.'
  ) : invariant(ReactDescriptor.isValidDescriptor(children)));
  return children;
}

module.exports = onlyChild;

}).call(this,require('_process'))
},{"./ReactDescriptor":54,"./invariant":123,"_process":2}],139:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule performance
 * @typechecks
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var performance;

if (ExecutionEnvironment.canUseDOM) {
  performance =
    window.performance ||
    window.msPerformance ||
    window.webkitPerformance;
}

module.exports = performance || {};

},{"./ExecutionEnvironment":24}],140:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule performanceNow
 * @typechecks
 */

var performance = require("./performance");

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (!performance || !performance.now) {
  performance = Date;
}

var performanceNow = performance.now.bind(performance);

module.exports = performanceNow;

},{"./performance":139}],141:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule setInnerHTML
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

/**
 * Set the innerHTML property of a node, ensuring that whitespace is preserved
 * even in IE8.
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
var setInnerHTML = function(node, html) {
  node.innerHTML = html;
};

if (ExecutionEnvironment.canUseDOM) {
  // IE8: When updating a just created node with innerHTML only leading
  // whitespace is removed. When updating an existing node with innerHTML
  // whitespace in root TextNodes is also collapsed.
  // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html

  // Feature detection; only IE8 is known to behave improperly like this.
  var testElement = document.createElement('div');
  testElement.innerHTML = ' ';
  if (testElement.innerHTML === '') {
    setInnerHTML = function(node, html) {
      // Magic theory: IE8 supposedly differentiates between added and updated
      // nodes when processing innerHTML, innerHTML on updated nodes suffers
      // from worse whitespace behavior. Re-adding a node like this triggers
      // the initial and more favorable whitespace behavior.
      // TODO: What to do on a detached node?
      if (node.parentNode) {
        node.parentNode.replaceChild(node, node);
      }

      // We also implement a workaround for non-visible tags disappearing into
      // thin air on IE8, this only happens if there is no visible text
      // in-front of the non-visible tags. Piggyback on the whitespace fix
      // and simply check if any non-visible tags appear in the source.
      if (html.match(/^[ \r\n\t\f]/) ||
          html[0] === '<' && (
            html.indexOf('<noscript') !== -1 ||
            html.indexOf('<script') !== -1 ||
            html.indexOf('<style') !== -1 ||
            html.indexOf('<meta') !== -1 ||
            html.indexOf('<link') !== -1)) {
        // Recover leading whitespace by temporarily prepending any character.
        // \uFEFF has the potential advantage of being zero-width/invisible.
        node.innerHTML = '\uFEFF' + html;

        // deleteData leaves an empty `TextNode` which offsets the index of all
        // children. Definitely want to avoid this.
        var textNode = node.firstChild;
        if (textNode.data.length === 1) {
          node.removeChild(textNode);
        } else {
          textNode.deleteData(0, 1);
        }
      } else {
        node.innerHTML = html;
      }
    };
  }
}

module.exports = setInnerHTML;

},{"./ExecutionEnvironment":24}],142:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule shallowEqual
 */

"use strict";

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B'a keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],143:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule shouldUpdateReactComponent
 * @typechecks static-only
 */

"use strict";

/**
 * Given a `prevDescriptor` and `nextDescriptor`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are descriptors. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * @param {?object} prevDescriptor
 * @param {?object} nextDescriptor
 * @return {boolean} True if the existing instance should be updated.
 * @protected
 */
function shouldUpdateReactComponent(prevDescriptor, nextDescriptor) {
  if (prevDescriptor && nextDescriptor &&
      prevDescriptor.type === nextDescriptor.type && (
        (prevDescriptor.props && prevDescriptor.props.key) ===
        (nextDescriptor.props && nextDescriptor.props.key)
      ) && prevDescriptor._owner === nextDescriptor._owner) {
    return true;
  }
  return false;
}

module.exports = shouldUpdateReactComponent;

},{}],144:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule toArray
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * Convert array-like objects to arrays.
 *
 * This API assumes the caller knows the contents of the data type. For less
 * well defined inputs use createArrayFrom.
 *
 * @param {object|function|filelist} obj
 * @return {array}
 */
function toArray(obj) {
  var length = obj.length;

  // Some browse builtin objects can report typeof 'function' (e.g. NodeList in
  // old versions of Safari).
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(obj) &&
    (typeof obj === 'object' || typeof obj === 'function'),
    'toArray: Array-like object expected'
  ) : invariant(!Array.isArray(obj) &&
  (typeof obj === 'object' || typeof obj === 'function')));

  ("production" !== process.env.NODE_ENV ? invariant(
    typeof length === 'number',
    'toArray: Object needs a length property'
  ) : invariant(typeof length === 'number'));

  ("production" !== process.env.NODE_ENV ? invariant(
    length === 0 ||
    (length - 1) in obj,
    'toArray: Object should have keys for indices'
  ) : invariant(length === 0 ||
  (length - 1) in obj));

  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
  // without method will throw during the slice call and skip straight to the
  // fallback.
  if (obj.hasOwnProperty) {
    try {
      return Array.prototype.slice.call(obj);
    } catch (e) {
      // IE < 9 does not support Array#slice on collections objects
    }
  }

  // Fall back to copying key by key. This assumes all keys have a value,
  // so will not preserve sparsely populated inputs.
  var ret = Array(length);
  for (var ii = 0; ii < length; ii++) {
    ret[ii] = obj[ii];
  }
  return ret;
}

module.exports = toArray;

}).call(this,require('_process'))
},{"./invariant":123,"_process":2}],145:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule traverseAllChildren
 */

"use strict";

var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactTextComponent = require("./ReactTextComponent");

var invariant = require("./invariant");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;
var SUBSEPARATOR = ':';

/**
 * TODO: Test that:
 * 1. `mapChildren` transforms strings and numbers into `ReactTextComponent`.
 * 2. it('should fail when supplied duplicate key', function() {
 * 3. That a single child and an array with one item have the same key pattern.
 * });
 */

var userProvidedKeyEscaperLookup = {
  '=': '=0',
  '.': '=1',
  ':': '=2'
};

var userProvidedKeyEscapeRegex = /[=.:]/g;

function userProvidedKeyEscaper(match) {
  return userProvidedKeyEscaperLookup[match];
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  if (component && component.props && component.props.key != null) {
    // Explicit key
    return wrapUserProvidedKey(component.props.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

/**
 * Escape a component key so that it is safe to use in a reactid.
 *
 * @param {*} key Component key to be escaped.
 * @return {string} An escaped string.
 */
function escapeUserProvidedKey(text) {
  return ('' + text).replace(
    userProvidedKeyEscapeRegex,
    userProvidedKeyEscaper
  );
}

/**
 * Wrap a `key` value explicitly provided by the user to distinguish it from
 * implicitly-generated keys generated by a component's index in its parent.
 *
 * @param {string} key Value of a user-provided `key` attribute
 * @return {string}
 */
function wrapUserProvidedKey(key) {
  return '$' + escapeUserProvidedKey(key);
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!number} indexSoFar Number of children encountered until this point.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
var traverseAllChildrenImpl =
  function(children, nameSoFar, indexSoFar, callback, traverseContext) {
    var subtreeCount = 0;  // Count of children found in the current subtree.
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var nextName = (
          nameSoFar +
          (nameSoFar ? SUBSEPARATOR : SEPARATOR) +
          getComponentKey(child, i)
        );
        var nextIndex = indexSoFar + subtreeCount;
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          nextIndex,
          callback,
          traverseContext
        );
      }
    } else {
      var type = typeof children;
      var isOnlyChild = nameSoFar === '';
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows
      var storageName =
        isOnlyChild ? SEPARATOR + getComponentKey(children, 0) : nameSoFar;
      if (children == null || type === 'boolean') {
        // All of the above are perceived as null.
        callback(traverseContext, null, storageName, indexSoFar);
        subtreeCount = 1;
      } else if (children.type && children.type.prototype &&
                 children.type.prototype.mountComponentIntoNode) {
        callback(traverseContext, children, storageName, indexSoFar);
        subtreeCount = 1;
      } else {
        if (type === 'object') {
          ("production" !== process.env.NODE_ENV ? invariant(
            !children || children.nodeType !== 1,
            'traverseAllChildren(...): Encountered an invalid child; DOM ' +
            'elements are not valid children of React components.'
          ) : invariant(!children || children.nodeType !== 1));
          for (var key in children) {
            if (children.hasOwnProperty(key)) {
              subtreeCount += traverseAllChildrenImpl(
                children[key],
                (
                  nameSoFar + (nameSoFar ? SUBSEPARATOR : SEPARATOR) +
                  wrapUserProvidedKey(key) + SUBSEPARATOR +
                  getComponentKey(children[key], 0)
                ),
                indexSoFar + subtreeCount,
                callback,
                traverseContext
              );
            }
          }
        } else if (type === 'string') {
          var normalizedText = ReactTextComponent(children);
          callback(traverseContext, normalizedText, storageName, indexSoFar);
          subtreeCount += 1;
        } else if (type === 'number') {
          var normalizedNumber = ReactTextComponent('' + children);
          callback(traverseContext, normalizedNumber, storageName, indexSoFar);
          subtreeCount += 1;
        }
      }
    }
    return subtreeCount;
  };

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', 0, callback, traverseContext);
}

module.exports = traverseAllChildren;

}).call(this,require('_process'))
},{"./ReactInstanceHandles":62,"./ReactTextComponent":78,"./invariant":123,"_process":2}],146:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== process.env.NODE_ENV) {
  warning = function(condition, format ) {var args=Array.prototype.slice.call(arguments,2);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (!condition) {
      var argIndex = 0;
      console.warn('Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];}));
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))
},{"./emptyFunction":105,"_process":2}],147:[function(require,module,exports){
module.exports = require('./lib/React');

},{"./lib/React":30}]},{},[1])(1)
});