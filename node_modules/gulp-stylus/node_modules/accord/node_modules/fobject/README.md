# fobject
[![Build Status](https://travis-ci.org/slang800/fobject.svg?branch=master)](https://travis-ci.org/slang800/fobject)

A simple promise-based wrapper for file operations that treats files as objects.

```coffee
File = require 'fobject'
configFile = new File('config.json')
configFile.read().done((data) ->
	console.log "contents of #{configFile.path}: #{data}"
)
```

Also, this includes a 2nd wrapper that extends the first and lets you cache the contents of the file directly in the object

```coffee
File = require 'fobject/cached'
logFile = new File('log')
logFile.load().then( ->
  console.log logFile.content # print out the logs
  logFile.content += 'this is a demo\n' # add a line
).then(
  logFile.save
).done( ->
  console.log('the logs are saved, and since we only added to the string, the
  `File.save()` call was optimized into a single `append()`')
)
```

## docs
Read the source code for now... it's all well annotated in JSDoc.
