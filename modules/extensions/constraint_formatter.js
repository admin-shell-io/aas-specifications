// modules/extensions/convert_constraints.js

// Cache to prevent multiple processing of the same file
const processedFiles = new Set();

module.exports = function registerConvertConstraints(registry) {
    registry.preprocessor('convert-constraints', function () {
      this.process((doc, reader) => {
        try {
          // Only target files literally named "constraints.adoc"
          const srcPath = doc.getAttribute('docfile');        // e.g., "modules/ROOT/pages/constraints.adoc"
          const filename = srcPath && srcPath.split(/[\\/]/).pop();
          if (filename !== 'constraints.adoc') {
            return reader;                                    // leave other files untouched
          }
  
          // Skip if already processed
          if (processedFiles.has(srcPath)) {
            return reader;
          }
  
          console.log(`::notice::Processing constraints file: ${srcPath}`);
          processedFiles.add(srcPath);
  
          // Read all lines from the reader
          const originalLines = [];
          let line;
          while ((line = reader.readLine()) !== undefined) {
            originalLines.push(line);
          }
  
          console.log(`::debug::Found ${originalLines.length} lines in ${srcPath}`);
  
          // Log first few lines to see what we're dealing with
          console.log(`::debug::First few lines in ${srcPath}:`);
          originalLines.slice(0, 5).forEach((l, i) => {
            console.log(`::debug::Line ${i + 1}: ${l.trim()}`);
          });
  
          // Rewrite only the constraint attribute lines
          let transformedCount = 0;
          const transformedLines = originalLines.map((l) => {
            // Match the constraint pattern - either with or without pass:q formatting
            const match = l.match(
              /^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#(.*)/
            );
            if (match) {
              // Extract the parts
              const [, attr, label, rest] = match;
              // Remove any leading/trailing whitespace from the label
              const cleanLabel = label.trim();
              
              // Process xref references in the content
              const processedContent = rest.replace(
                /xref:([^:]+):([^[]+)\[([^\]]+)\]/g,
                'xref:$1:$2[$3]'
              );
              
              // Create the new line with just the constraint number and content
              const newLine = `:${attr}: ${cleanLabel}:${processedContent}`;
              transformedCount++;
              console.log(`::debug::Found match in ${srcPath}: ${l.trim()} -> ${newLine.trim()}`);
              return newLine;
            }
            return l;
          });
  
          // Overwrite the reader's lines in-place
          reader.lines = transformedLines;
  
          if (transformedCount > 0) {
            console.log(`::notice::Transformed ${transformedCount} lines in ${srcPath}`);
          } else {
            console.log(`::notice::No transformations needed in ${srcPath}`);
          }
          return reader;
        } catch (error) {
          console.error(`::error::Error processing constraints file: ${error.message}`);
          console.error(`::error::Stack trace: ${error.stack}`);
          return reader;
        }
      });
    });
  };
  