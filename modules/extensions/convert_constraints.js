// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints (registry) {
  // Register a preprocessor that runs before each document is parsed
  registry.preprocessor(function () {
    const self = this
    self.process(function (doc, reader) {
      // Get the source lines
      const source = reader.source
      // Rewrite any :aasd###: pass:q[[underline]#…#] entries
      const newSource = source.replace(
        /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\]/gm,
        // Convert to role="underline" format
        (_, id, text) => `[role="underline"]#${text}#`
      )
      // Update the reader with rewritten source
      reader.source = newSource
      return reader
    })
  })
}
