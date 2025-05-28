// modules/extensions/convert_underlines.js
'use strict'

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    // read all lines
    const lines = this.reader.getLines().map((line) =>
      line
        // convert raw HTML spans → [underline]#…#
        .replace(/<span class="underline">([^<]*)<\/span>/g, '[underline]#$1#')
        // convert pass:q[[underline]#…#]] → [role="underline"]#…#
        .replace(/pass:q\[\[underline\]#([^#]+)#\]\]/g, '[role="underline"]#$1#')
    )
    // push them back
    this.reader.setLines(lines)
  })
}
