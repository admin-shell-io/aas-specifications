// modules/extensions/convert_underlines.js
'use strict'

module.exports.register = function (registry) {
  if (typeof registry === 'undefined') {
    throw new Error('Registry is undefined')
  }

  registry.preprocessor(function () {
    const self = this
    const originalRead = this.reader.readLines
    this.reader.readLines = function () {
      const lines = originalRead.call(this)
      if (!lines) return lines
      
      return lines.map((line) => {
        if (typeof line !== 'string') return line
        return line
          // convert raw HTML spans → [underline]#…#
          .replace(/<span class="underline">([^<]*)<\/span>/g, '[underline]#$1#')
          // convert pass:q[[underline]#…#]] → [role="underline"]#…#
          .replace(/pass:q\[\[underline\]#([^#]+)#\]\]/g, '[role="underline"]#$1#')
      })
    }
  })
}
