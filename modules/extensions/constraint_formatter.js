// modules/extensions/convert_constraints.js

// Track processed files to avoid duplicate transformations
const processedFiles = new Set();

module.exports = function registerConvertConstraints(registry) {
    // Only log extension loading once
    if (!global._constraintFormatterLoaded) {
        console.log('::debug::[Constraint Formatter] Extension loaded');
        global._constraintFormatterLoaded = true;
    }
    
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
            constraints.set(constraintId, `${label}: ${content.trim()}`);
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

        // Register all constraints as document attributes
        if (constraints.size > 0) {
          constraints.forEach((content, id) => {
            doc.setAttribute(id, content);
          });
          console.log(`::notice::[Constraint Formatter] Registered ${constraints.size} constraints in ${srcPath}`);
          // Show first and last constraint IDs as a range
          const constraintIds = Array.from(constraints.keys()).sort();
          if (constraintIds.length > 0) {
            const first = constraintIds[0];
            const last = constraintIds[constraintIds.length - 1];
            console.log(`::debug::[Constraint Formatter] Constraint range: ${first} to ${last}`);
          }
        }

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
  };
  