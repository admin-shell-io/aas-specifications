const asciidoctor = require('@asciidoctor/core')()

// Register a Preprocessor that runs before parsing each AsciiDoc file
asciidoctor.Extensions.register(function () {
  this.preprocessor(() => {
    return {
      process: function (doc, reader) {
        // Retrieve all source lines
        const lines = reader.getLines()
        // Transform any constraint line of the form:
        // :aasd002: pass:q[[underline]#Constraint AASd-002:# …]
        // into a plain constraint definition:
        // :aasd002: Constraint AASd-002: …
        const newLines = lines.map(line =>
          line.replace(
            /^:(aasd\d{3}):\s*pass:q\[\[underline\]#(.*?)#\]\]/,
            (_match, id, text) => `:${id}: ${text}`
          )
        )
        // Overwrite the reader’s lines & hand it back to Asciidoctor
        reader.setLines(newLines)
        return reader
      }
    }
  })
})
