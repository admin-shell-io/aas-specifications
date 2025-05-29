// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
    console.log('::debug::Registering constraint formatter extension');
    
    registry.preprocessor('convert-constraints', function () {
      console.log('::debug::Preprocessor registered');
      
      this.process((doc, reader) => {
        const srcPath = doc.getAttribute('docfile');
        const filename = srcPath && srcPath.split(/[\\/]/).pop();
        
        console.log(`::debug::Processing file: ${srcPath}`);
        console.log(`::debug::File attributes:`, doc.getAttributes());
        
        if (filename !== 'constraints.adoc') {
          console.log(`::debug::Skipping non-constraints file: ${filename}`);
          return reader;
        }
  
        // Read original lines
        const lines = [];
        let line;
        while ((line = reader.readLine()) !== undefined) {
          lines.push(line);
        }
  
        console.log(`::debug::Found ${lines.length} lines in ${srcPath}`);
        console.log(`::debug::First few lines before transformation:`);
        lines.slice(0, 3).forEach((l, i) => {
          console.log(`::debug::Line ${i + 1}: ${l.trim()}`);
        });
  
        // Transform constraint lines
        let transformedCount = 0;
        const transformed = lines.map((l) => {
          // Match constraint pattern - keep original format
          const match = l.match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
          if (match) {
            const [, attr, label, content] = match;
            
            // Fix xref format by adding # before section reference
            const fixedContent = content.replace(
              /xref:ROOT:spec-metamodel\/([^.]+)\.adoc([^[]+)\[([^\]]+)\]/g,
              'xref:ROOT:spec-metamodel/$1.adoc#$2[$3]'
            );
            
            // Keep original format with fixed xrefs
            const newLine = `:${attr}: ${label}: ${fixedContent.trim()}`;
            transformedCount++;
            console.log(`::debug::Transformed constraint: ${attr}`);
            console.log(`::debug::From: ${l.trim()}`);
            console.log(`::debug::To: ${newLine.trim()}`);
            return newLine;
          }
          return l;
        });
  
        console.log(`::notice::Transformed ${transformedCount} constraints in ${srcPath}`);
        console.log(`::debug::First few lines after transformation:`);
        transformed.slice(0, 3).forEach((l, i) => {
          console.log(`::debug::Line ${i + 1}: ${l.trim()}`);
        });
  
        // Overwrite lines buffer in-place
        reader.lines = transformed;
        return reader;
      });
    });
  };
  