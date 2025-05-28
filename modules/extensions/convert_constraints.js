// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints (registry) {
  // Register a preprocessor that runs before each document is parsed
  registry.preprocessor(function () {
    const self = this
    self.process(function (doc, reader) {
      // Get the lines from the reader
      const lines = reader.getLines()
      if (!lines || !lines.length) return reader

      // Process each line
      const processedLines = lines.map(line => {
        // Match the constraint pattern
        const match = line.match(/^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\]/)
        if (match) {
          // Convert to role="underline" format
          return `[role="underline"]#${match[2]}#`
        }
        return line
      })

      // Create a new reader with the processed lines
      return self.createReader(processedLines.join('\n'), reader)
    })
  })
}
