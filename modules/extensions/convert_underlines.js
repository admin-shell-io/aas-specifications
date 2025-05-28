// modules/extensions/convert_underlines.js

module.exports = function () {
  // `this` is the Asciidoctor.js Extensions registry
  this.preprocessor(() => ({
    process: function (document, reader) {
      // reader.getLines() will now exist
      const lines = reader.getLines()
      const newLines = lines.map(line =>
        line.replace(
          // strip out the pass:q[[underline]#…#]] wrapper
          /^:(aasd\d{3}):\s*pass:q\[\[underline\]#(.*?)#\]\]/,
          (_m, id, text) => `:${id}: ${text}`
        )
      )
      reader.setLines(newLines)
      return reader
    }
  }))
}
