'use strict'

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    const lines = this.reader.getLines().map((line) =>
      line
        // convert any raw HTML underline spans
        .replace(/<span class="underline">([^<]*)<\/span>/g, '[underline]#$1#')
        // convert any pass:q[[underline]#…#]] wrappers
        .replace(/pass:q\[\[underline\]#([^#]+)#\]\]/g, '[role="underline"]#$1#')
    )
    this.reader.setLines(lines)
  })
}