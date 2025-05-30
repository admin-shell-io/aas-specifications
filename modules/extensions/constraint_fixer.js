// modules/extensions/constraint_fixer.js

module.exports = function (registry) {
  // 1) Preprocessor: fire before ANY parsing
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      console.log('::group::constraint-fixer PRE');
      const content = reader.read();
      if (typeof content !== 'string') {
        console.warn('Skipping processing: content is not a string');
        return reader;
      }

      const lines = content.split('\n');
      const cleaned = lines.map((line, idx) => {
        const after = line
          .replace(/<span class="underline">(.*?)<\/span>/g, '+++<u>$1</u>+++')
          .replace(
            /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
            (_, lbl, rest) => {
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
      });

      // Create a new reader with the cleaned content
      const newReader = reader.$dup();
      newReader.pushInclude(cleaned.join('\n'), '', null);
      console.log(`::debug:: injected ${cleaned.length} lines`);
      console.log('::endgroup::');
      return newReader;
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
      const lines = reader.getLines();
      const cleaned = lines.map((line, idx) => {
        const after = line
          .replace(/<span class="underline">(.*?)<\/span>/g, '+++<u>$1</u>+++')
          .replace(
            /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
            (_, lbl, rest) => {
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
      });
      console.log(`::debug:: injecting ${cleaned.length} lines into include`);
      console.log('::endgroup::');
      
      // Return the cleaned content in the format AsciiDoctor expects
      return { content: cleaned };
    });
  });
};
