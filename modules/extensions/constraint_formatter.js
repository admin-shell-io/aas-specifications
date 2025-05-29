// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
    registry.preprocessor('convert-constraints', function () {
      this.process((doc, reader) => {
        const srcPath = doc.getAttribute('docfile');
        const filename = srcPath && srcPath.split(/[\\/]/).pop();
  
        // Only transform constraints.adoc under spec-metamodel or includes
        if (
          filename !== 'constraints.adoc' ||
          (!srcPath.includes('spec-metamodel/constraints.adoc') &&
           !srcPath.includes('includes/constraints.adoc'))
        ) {
          return reader;
        }
  
        // Read all lines
        const lines = [];
        let line;
        while ((line = reader.readLine()) !== undefined) {
          lines.push(line);
        }
  
        const transformedLines = lines.map((l) => {
          let s = l;
  
          // 1) Strip AsciiDoc passthrough underline: pass:q[[underline]#…#]
          s = s.replace(
            /pass:q\[\[underline\]#(.*?)#\]\]/g,
            '$1'
          );
  
          // 2) Strip HTML underline spans
          s = s.replace(
            /<span\s+class="underline">(.*?)<\/span>/g,
            '$1'
          );
  
          // 3) Normalize xref syntax: ensure module.adoc#anchor[label]
          s = s.replace(
            /xref:([\w\-\/]+)\.adoc([^[]*)\[(.*?)\]/g,
            (match, mod, anchor, label) => {
              // if anchor already starts with '#', leave it
              const anc = anchor.startsWith('#') ? anchor : `#${anchor.trim()}`;
              return `xref:${mod}.adoc${anc}[${label}]`;
            }
          );
  
          return s;
        });
  
        // Overwrite in-place so Asciidoctor and Antora see the clean source
        reader.lines = transformedLines;
        return reader;
      });
    });
  };
  