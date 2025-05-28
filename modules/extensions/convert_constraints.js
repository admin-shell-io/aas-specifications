// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints (registry) {
  // Register a tree processor that runs after the document is parsed
  registry.treeProcessor(function () {
    const self = this
    self.process(function (doc) {
      // Find all blocks (paragraphs, open, listing, etc.)
      const blocks = doc.findBy({ context: 'paragraph' })
      blocks.forEach(block => {
        // Rewrite each line in the block
        const lines = block.getLines()
        const rewritten = lines.map(line => {
          // Match your constraint pattern
          const m = line.match(/^\s*:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\]\s*$/)
          if (m) {
            // Convert to [role="underline"]#Constraint AASd-002:# …
            return `[role="underline"]#${m[2]}#`
          }
          return line
        })
        block.setLines(rewritten)
      })
      return doc
    })
  })
}
