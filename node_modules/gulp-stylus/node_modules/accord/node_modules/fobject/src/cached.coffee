File = require './'
W = require 'when'

# TODO: add support for non-utf8 files
class CachedFile extends File
  ###*
   * The content of the file. Can be modified directly and if it is edited
     File.save() will be needed to persist the changes on disk.
   * @type {String}
  ###
  content: ''

  ###*
   * The content loaded from the disk (cannot be modified because we need this
     when saving to avoid needing to re-read the file).
   * @type {String}
   * @private
  ###
  _savedContent: undefined

  ###*
   * The time at which the file was last loaded. Used to determine if we are
     overwriting new data.
   * @type {Integer}
   * @private
  ###
  _loadTime: undefined

  ###*
   * Check the file mod-time to see if the file has been edited since the last
     time we loaded it. Also, make sure that we've loaded the file.
   * @return {Promise}
  ###
  _isFileNewerOnDisk: ->
    @stat().then((stat) =>
      return @_loadTime? and stat.mtime > @_loadTime
    )

  ###*
   * Write CachedFile.content to the disk, using optimizations like appending
     rather than overwriting entirely.
   * @param {Boolean} [overwrite=true] Even if the file has been modified since
     the last load, overwrite it.
   * @return {Promise}
  ###
  save: (overwrite = true) ->
    promise = W.resolve()
    if not overwrite
      promise.then(
        @_isFileNewerOnDisk
      ).then((isFileNewerOnDisk) ->
        if isFileNewerOnDisk
          throw new Error('File has been modified since last load')
      )

    promise.then( =>
      # check if we can just append, rather than a full write
      if @_savedContent? and @content[0...@_savedContent.length] is @_savedContent
        if not overwrite
          # we just checked that the file hasn't been modified, so an append
          # will result in the content that we'd expect
          @append(@content[@_savedContent.length..])
        else
          @_isFileNewerOnDisk().then((isFileNewerOnDisk) =>
            if isFileNewerOnDisk
              # we need to do a full overwrite because the file on the disk may
              # have changed
              @write(@content)
            else
              @append(@content[@_savedContent.length..])
            )
      else
        @write(@content)
    ).then( =>
      @_loadTime = Date.now()
      @_savedContent = @content
      return
    )

  ###*
   * Load the file from the disk, overwriting anything in CachedFile.content
   * @return {Promise}
  ###
  load: ->
    @read(encoding: 'utf8').then((data) =>
      _loadTime = Date.now()
      @_savedContent = @content = data
    )


module.exports = CachedFile
