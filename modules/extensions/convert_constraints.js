// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints (registry) {
  // Register a preprocessor that runs before each document is parsed
  registry.preprocessor(function () {
    const self = this
    self.process(function (doc, reader) {
      // Grab all lines from the reader
      let lines = reader.getLines()                                             // :contentReference[oaicite:0]{index=0}
      // Rewrite any :aasd###: pass:q[[underline]#…#] entries
      const newLines = lines.map(line =>
        line.replace(
          /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\]/,
          // drop the "pass:q[[underline]#…#]]", emit plain text and preserve xrefs
          (_, id, text) => `${text}`                                             
        )
      )
      // Update the reader with rewritten lines
      reader.setLines(newLines)                                                  // :contentReference[oaicite:1]{index=1}
      return reader
    })
  })
}
