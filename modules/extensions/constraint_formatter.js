// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
    registry.preprocessor('convert-constraints', function () {
      this.process((doc, reader) => {
        const srcPath = doc.getAttribute('docfile');
        const filename = srcPath && srcPath.split(/[\\/]/).pop();
        
        // Check for constraints.adoc in either location
        if (filename !== 'constraints.adoc' || 
            (!srcPath.includes('spec-metamodel/constraints.adoc') && 
             !srcPath.includes('includes/constraints.adoc'))) {
          return reader;
        }

        // Set doctype to book if not already set
        if (!doc.getAttribute('doctype')) {
          doc.setAttribute('doctype', 'book');
        }
  
        // Read original lines
        const lines = [];
        let line;
        while ((line = reader.readLine()) !== undefined) {
          lines.push(line);
        }

        // Transform constraint lines
        let transformedCount = 0;
        lines.forEach((l, index) => {
          // Match constraint pattern - keep original format
          const match = l.match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
          if (match) {
            const [, attr, label, content] = match;
            
            // Only transform if content exists
            if (content) {
              // Fix xref format by adding # before section reference
              const fixedContent = content.replace(
                /xref:ROOT:spec-metamodel\/([^.]+)\.adoc([^[]+)\[([^\]]+)\]/g,
                'xref:ROOT:spec-metamodel/$1.adoc#$2[$3]'
              );
              
              // Keep original format with fixed xrefs
              const newLine = `:${attr}: ${label}: ${fixedContent.trim()}`;
              
              // Define the attribute for this constraint
              doc.setAttribute(attr, newLine);
              
              // Add constraint to content
              lines[index] = newLine;
              
              transformedCount++;
            }
          }
        });
  
        // Overwrite lines buffer in-place with transformed content
        reader.lines = lines;
        return reader;
      });
    });
  };
  