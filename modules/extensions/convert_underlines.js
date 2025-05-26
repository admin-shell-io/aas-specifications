// modules/ROOT/_extensions/convert_underlines.js
require('asciidoctor.js').Extensions.register(function () {
    this.preprocessor(function () {
      this.process(function (document, reader) {
        // read all lines, transform them, then reset the reader
        const lines = reader.getLines()
        const out = []
        for (let line of lines) {
          // 1) swap out HTML spans/u tags for the .constraint role
          line = line
            .replace(/<span class="underline">(.*?)<\/span>/g, '[.constraint]#$1#')
            .replace(/<u>(.*?)<\/u>/g,                   '[.constraint]#$1#')
          // 2) if it now begins with [.constraint]#Constraint AASd-123:
          //    inject an [[constraint-aasd-123]] anchor
          const m = line.match(/^\[\.constraint\]#(Constraint\s+AASd-(\d+)):/)
          if (m) {
            const anchorId = m[1]
              .toLowerCase()
              .replace(/\s+/g, '-')        // spaces → hyphens
              .replace(/[^a-z0-9-]/g, '')  // drop any other char
            out.push(`[[${anchorId}]]`)
          }
          out.push(line)
        }
        reader.reset(out)
        return reader
      })
    })
  })
  