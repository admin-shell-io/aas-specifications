// modules/extensions/constraint_fixer.js

module.exports = function (registry) {
  // 1) Preprocessor: fire before ANY parsing
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      console.log('::group::constraint-fixer PRE');
      
      try {
        // Get content using a more reliable method
        let content = '';
        if (reader && typeof reader.read === 'function') {
          content = reader.read();
        } else if (reader && typeof reader.getLines === 'function') {
          content = reader.getLines().join('\n');
        } else {
          console.warn('Reader does not have expected methods');
          return reader;
        }

        // Ensure we have valid content
        if (!content || typeof content !== 'string') {
          console.warn('Skipping processing: invalid content');
          return reader;
        }

        // Process the content
        const lines = content.split('\n');
        const cleaned = lines.map((line, idx) => {
          if (!line || typeof line !== 'string') return line;
          
          try {
            const after = line
              .replace(/<span class="underline">(.*?)<\/span>/g, '+++<u>$1</u>+++')
              .replace(
                /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
                (_, lbl, rest) => {
                  if (!lbl || !rest) return line;
                  // Fix closing brackets in xref links
                  const fixedRest = rest.replace(/\[([^\]]+)\]/g, (_, link) => {
                    return `[${link}]`;
                  });
                  return `+++<u>${lbl.trim()}</u>+++ ${fixedRest.trim()}`;
                }
              );
            if (line !== after) {
              console.log(`::debug:: PRE L${idx+1} before: ${line}`);
              console.log(`::debug:: PRE L${idx+1}  after: ${after}`);
            }
            return after;
          } catch (err) {
            console.warn(`Error processing line ${idx + 1}: ${err.message}`);
            return line;
          }
        });

        // Create a new reader with the cleaned content
        const newReader = reader.$dup();
        if (newReader && typeof newReader.pushInclude === 'function') {
          newReader.pushInclude(cleaned.join('\n'), '', null);
          console.log(`::debug:: injected ${cleaned.length} lines`);
          console.log('::endgroup::');
          return newReader;
        } else {
          console.warn('New reader does not have pushInclude method');
          return reader;
        }
      } catch (err) {
        console.error('Error in preprocessor:', err);
        return reader;
      }
    });
  });

  // 2) Include-processor: catch any includes of your constraint files
  registry.includeProcessor(function () {
    this.handles(function (target) {
      const ok =
        target.endsWith('constraints.adoc') ||
        (target.includes('spec-metamodel/') && target.endsWith('.adoc'));
      console.log(`::debug:: INC handles(${target}) → ${ok}`);
      return ok;
    });
    this.process(function (_doc, reader, target, _attrs) {
      console.log(`::group::constraint-fixer INC ${target}`);
      try {
        const lines = reader.getLines();
        if (!lines || !Array.isArray(lines)) {
          console.warn('Skipping processing: no lines to process');
          return { content: '' };
        }
        
        const cleaned = lines.map((line, idx) => {
          if (!line || typeof line !== 'string') return line;
          
          try {
            const after = line
              .replace(/<span class="underline">(.*?)<\/span>/g, '+++<u>$1</u>+++')
              .replace(
                /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
                (_, lbl, rest) => {
                  if (!lbl || !rest) return line;
                  // Fix closing brackets in xref links
                  const fixedRest = rest.replace(/\[([^\]]+)\]/g, (_, link) => {
                    return `[${link}]`;
                  });
                  return `+++<u>${lbl.trim()}</u>+++ ${fixedRest.trim()}`;
                }
              );
            if (line !== after) {
              console.log(`::debug:: INC L${idx+1} before: ${line}`);
              console.log(`::debug:: INC L${idx+1}  after: ${after}`);
            }
            return after;
          } catch (err) {
            console.warn(`Error processing line ${idx + 1}: ${err.message}`);
            return line;
          }
        });
        console.log(`::debug:: injecting ${cleaned.length} lines into include`);
        console.log('::endgroup::');
        
        return { content: cleaned };
      } catch (err) {
        console.error('Error in include processor:', err);
        return { content: '' };
      }
    });
  });
};
