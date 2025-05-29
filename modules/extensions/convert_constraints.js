// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
  registry.preprocessor('convert-constraints', function () {
    this.process((doc, reader) => {
      if (!reader || !reader.file) {
        return reader;
      }

      try {
        // 1. Read the entire source into an array
        const lines = [];
        let line;
        while ((line = reader.readLine()) !== undefined) {
          lines.push(line || '');
        }

        // 2. Rewrite only the constraint attributes
        const out = lines.map((l) => {
          if (!l) return '';
          const m = l.match(
            /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\](.*)/
          );
          if (m) {
            // Unwrap the pass:q and rebuild the attribute
            return `:${m[1]}: ${m[2]}${m[3]}`;
          }
          return l;
        }).filter(Boolean); // Remove any empty lines

        // 3. Push the rewritten content back
        if (out.length > 0) {
          const content = out.join('\n');
          if (content) {
            reader.pushInclude(
              content,
              reader.file,
              reader.file,
              1,
              { 'convert-constraints': true }
            );
          }
        }

        return reader;
      } catch (error) {
        console.error('Error in constraint converter:', error);
        // Return the original reader without modifications
        return reader;
      }
    });
  });
};
