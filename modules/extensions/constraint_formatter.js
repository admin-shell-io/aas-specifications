// modules/extensions/convert_constraints.js

// Track processed files to avoid duplicate transformations
const processedFiles = new Set();

module.exports = function registerConvertConstraints(registry) {
    // Only log extension loading once
    if (!global._constraintFormatterLoaded) {
        console.log('::debug::[Constraint Formatter] Extension loaded');
        global._constraintFormatterLoaded = true;
    }
    
    // Register as a preprocessor to handle the initial transformation
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

        // Skip if already processed - no need to log this
        if (processedFiles.has(srcPath)) {
          return reader;
        }

        console.log(`::debug::[Constraint Formatter] Processing: ${srcPath}`);
        processedFiles.add(srcPath);

        // Read all lines
        const lines = [];
        let line;
        while ((line = reader.readLine()) !== undefined) {
          lines.push(line);
        }

        // Add doctype if not present
        if (!lines.some(l => l.trim().startsWith(':doctype:'))) {
          console.log('::debug::[Constraint Formatter] Adding doctype: book');
          lines.unshift(':doctype: book');
          lines.unshift('');
        }

        // Transform lines and collect constraints
        let transformedCount = 0;
        const constraints = new Map();
        
        const transformedLines = lines.map((l) => {
          if (!l || typeof l !== 'string') return l;

          // Extract constraint ID and content
          const constraintMatch = l.match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
          if (constraintMatch) {
            const [, constraintId, label, content] = constraintMatch;
            // Store constraint for later registration
            constraints.set(constraintId, `[underline]#${label}:# ${content.trim()}`);
          }

          // Fix xref format by ensuring # before section reference
          const transformed = l.replace(
            /xref:ROOT:spec-metamodel\/([^.]+)\.adoc([^[]+)\[([^\]]+)\]/g,
            (match, mod, anchor, label) => {
              // Skip if any part is undefined
              if (!mod || !anchor || !label) return match;
              
              // if anchor already starts with '#', leave it
              const anc = anchor.startsWith('#') ? anchor : `#${anchor.trim()}`;
              transformedCount++;
              return `xref:ROOT:spec-metamodel/${mod}.adoc${anc}[${label}]`;
            }
          );

          return transformed;
        });

        // Inject attribute lines into the AsciiDoc source after the doctype
        if (constraints.size > 0) {
          const attributeLines = [];
          constraints.forEach((content, id) => {
            attributeLines.push(`:${id}: ${content}`);
          });
          // Insert after doctype or at the top
          let insertIndex = transformedLines.findIndex(l => l.trim().startsWith(':doctype:'));
          if (insertIndex === -1) insertIndex = 0;
          else insertIndex += 1;
          transformedLines.splice(insertIndex, 0, ...attributeLines);
          console.log(`::notice::[Constraint Formatter] Injected ${constraints.size} attribute lines in ${srcPath}`);
        }

        // Register missing attributes with empty values to prevent warnings
        ['aasd080', 'aasd081', 'aasd090'].forEach(id => {
          if (!transformedLines.some(l => l.startsWith(`:${id}:`))) {
            transformedLines.unshift(`:${id}: `);
            console.log(`::debug::[Constraint Formatter] Injected missing attribute: ${id}`);
          }
        });

        if (transformedCount > 0) {
          console.log(`::notice::[Constraint Formatter] Transformed ${transformedCount} xref links in ${srcPath}`);
          // Only show first transformed xref as example
          const firstXref = transformedLines.find(l => l.includes('xref:'));
          if (firstXref) {
            console.log(`::debug::[Constraint Formatter] Example xref: ${firstXref.trim()}`);
          }
        }

        // Overwrite in-place so Asciidoctor and Antora see the clean source
        reader.lines = transformedLines;
        return reader;
      });
    });

    // Register a block processor to handle constraint blocks
    registry.block('constraint', function () {
      const self = this;
      self.named('constraint');
      self.onContext('paragraph');
      self.process(function (parent, reader) {
        const lines = reader.getLines();
        const constraintMatch = lines[0].match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
        
        if (constraintMatch) {
          const [, constraintId, label, content] = constraintMatch;
          // Register the constraint as a document attribute
          parent.getDocument().setAttribute(constraintId, `${label}: ${content.trim()}`);
          console.log(`::debug::[Constraint Formatter] Registered constraint in block processor: ${constraintId}`);
        }
        
        return self.createBlock(parent, 'paragraph', lines);
      });
    });
  };
  