###ngInject
Set to false to disable processing of the @ngInject annotation.

###ngProvide
Set to false to disable processing of the @ngProvide annotation.

###sourceMap
Set to true to process source maps. Defaults to false.

###sourceFileName
Set to the name/path of the input file. Required for source maps.
Usually handled by plugins.

###sourceMapName
Where to output the map file (doesn't actually write out the file).
Defaults to sourceFileName + ".map".

###inputSourceMap
An object that represents the incoming sourcemap. Will be merged with the changes
resulting from manipulating this file.

###readSourceMapComments
If sourceMaps are enabled, and no inputSourceMap is provided, it will attempt
to scan the source file for a sourceMap comment. Set to false to disable
this behavior.

###appendSourceMapComments
Will append a sourcemap comment to the outgoing file
