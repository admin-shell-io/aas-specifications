// modules/extensions/constraint_formatter.js

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
        
        // Skip if already processed
        if (processedFiles.has(srcPath)) {
          return reader;
        }

        console.log(`::debug::[Constraint Formatter] Processing: ${srcPath}`);
        processedFiles.add(srcPath);

        // Read all lines from the reader
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
        
        const transformedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          
          if (!l || typeof l !== 'string') {
            transformedLines.push(l);
            continue;
          }

          let transformedLine = l;
          let wasTransformed = false;

          // 1. Fix malformed HTML-like underlines
          // Convert <span class="underline">text</span> to +++<u>text</u>+++
          if (transformedLine.includes('<span class="underline">') || transformedLine.includes('</span>')) {
            transformedLine = transformedLine.replace(
              /<span class="underline">(.*?)<\/span>/g,
              '+++<u>$1</u>+++'
            );
            wasTransformed = true;
            console.log('::debug::[Constraint Formatter] Fixed underline span');
          }

          // 2. Fix malformed HTML emphasis tags
          if (transformedLine.includes('<em>') || transformedLine.includes('</em>')) {
            transformedLine = transformedLine.replace(/<em>(.*?)<\/em>/g, '_$1_');
            wasTransformed = true;
            console.log('::debug::[Constraint Formatter] Fixed emphasis tags');
          }

          // 3. Fix malformed cross-references with <<>>
          // Convert <<module:::section:::Class,DisplayText>> to proper xref format
          const xrefMatches = transformedLine.match(/<<([^>]+)>>/g);
          if (xrefMatches) {
            xrefMatches.forEach(match => {
              const content = match.slice(2, -2); // Remove << >>
              const parts = content.split(',');
              if (parts.length === 2) {
                const [path, displayText] = parts;
                const pathParts = path.split(':::');
                if (pathParts.length >= 3) {
                  const [module, section, className] = pathParts;
                  // Convert to proper xref format
                  const newXref = `xref:ROOT:spec-metamodel/${section}.adoc#${className}[${displayText}]`;
                  transformedLine = transformedLine.replace(match, newXref);
                  wasTransformed = true;
                }
              }
            });
          }

          // 4. Extract constraint definitions and convert to attributes
          const constraintMatch = transformedLine.match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
          if (constraintMatch) {
            const [, constraintId, label, content] = constraintMatch;
            // Store constraint for later registration (clean text only)
            constraints.set(constraintId, `${label}: ${content.trim()}`);
            // Skip adding this line to output - it will be added as an attribute
            console.log(`::debug::[Constraint Formatter] Extracted constraint: ${constraintId}`);
            continue;
          }

          // 5. Fix existing xref format issues
          const xrefFixed = transformedLine.replace(
            /xref:ROOT:spec-metamodel\/([^.]+)\.adoc([^[]*)\[([^\]]+)\]/g,
            (match, mod, anchor, label) => {
              if (!mod || !label) return match;
              // Clean up anchor: ensure it starts with # if not empty
              let anc = anchor.trim();
              if (anc && !anc.startsWith('#')) anc = `#${anc}`;
              else if (!anc) anc = '';
              wasTransformed = true;
              return `xref:ROOT:spec-metamodel/${mod}.adoc${anc}[${label}]`;
            }
          );
          
          if (xrefFixed !== transformedLine) {
            transformedLine = xrefFixed;
            wasTransformed = true;
          }

          if (wasTransformed) {
            transformedCount++;
          }

          transformedLines.push(transformedLine);
        }

        // Inject constraint attributes into the document header
        if (constraints.size > 0) {
          const attributeLines = [];
          constraints.forEach((content, id) => {
            attributeLines.push(`:${id}: ${content}`);
          });
          
          // Find insertion point (after doctype or at the beginning)
          let insertIndex = transformedLines.findIndex(l => l.trim().startsWith(':doctype:'));
          if (insertIndex === -1) {
            insertIndex = 0;
          } else {
            insertIndex += 1;
          }
          
          transformedLines.splice(insertIndex, 0, ...attributeLines);
          console.log(`::notice::[Constraint Formatter] Injected ${constraints.size} constraint attributes`);
        }

        // Register missing attributes with empty values to prevent warnings
        const missingAttrs = ['aasd080', 'aasd081', 'aasd090'];
        missingAttrs.forEach(id => {
          if (!transformedLines.some(l => l.startsWith(`:${id}:`))) {
            transformedLines.unshift(`:${id}: `);
            console.log(`::debug::[Constraint Formatter] Added missing attribute: ${id}`);
          }
        });

        if (transformedCount > 0) {
          console.log(`::notice::[Constraint Formatter] Applied ${transformedCount} transformations in ${srcPath}`);
        }

        // Create a new reader with the transformed content
        const Opal = global.Opal || require('opal-runtime').Opal;
        const transformedReader = Opal.Asciidoctor.Reader.$new(transformedLines);
        
        // Replace the original reader's content
        reader.lines = transformedLines;
        reader.lineno = 1;
        
        return reader;
      });
    });

    // Also register a tree processor as a fallback for any remaining issues
    registry.treeProcessor('constraint-tree-processor', function () {
      this.process((doc) => {
        // Walk through the document and fix any remaining formatting issues
        const blocks = doc.findBy();
        blocks.forEach(block => {
          if (block.getContext() === 'paragraph') {
            const source = block.getSource();
            if (source && source.includes('<span class="underline">')) {
              const fixed = source.replace(
                /<span class="underline">(.*?)<\/span>/g,
                '+++<u>$1</u>+++'
              );
              block.lines = [fixed];
            }
          }
        });
        return doc;
      });
    });
};