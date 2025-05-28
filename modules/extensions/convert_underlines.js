// modules/extensions/convert_underlines.js
'use strict'

module.exports.register = function (registry) {
  registry.preprocessor(function (doc, reader) {
    const lines = reader.getLines().map((line) =>
      line
        // convert any raw HTML underline spans
        .replace(/<span class="underline">([^<]*)<\/span>/g, '[underline]#$1#')
        // convert any pass:q[[underline]#…#]] wrappers
        .replace(/pass:q\[\[underline\]#([^#]+)#\]\]/g, '[role="underline"]#$1#')
    )
    reader.setLines(lines)
  })
}
