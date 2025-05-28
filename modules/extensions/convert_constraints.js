// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
  registry.preprocessor(() => {
    const self = this
    self.process((doc, reader) => {
      // reader.lines is an array of all source lines (Asciidoctor.js PreprocessorReader API) :contentReference[oaicite:0]{index=0}
      const lines = reader.lines || []
      const processed = lines.map((line) => {
        // match lines like:
        // :aasd002: pass:q[[underline]#Constraint AASd-002:# …]
        const m = line.match(
          /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\](?:\s*(.*))?$/
        )
        if (m) {
          // rebuild as a real AsciiDoc role span, preserving any trailing text
          // e.g. [role="underline"]#Constraint AASd-002:# remaining text…
          return `[role="underline"]#${m[2]}#${m[3] ? ' ' + m[3] : ''}`
        }
        return line
      })
      // push the new lines back into the reader
      reader.lines = processed
      return reader
    })
  })
}
