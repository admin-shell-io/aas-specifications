// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
  // Register a preprocessor named 'convert-constraints'
  registry.preprocessor('convert-constraints', function () {
    this.process((doc, reader) => {
      // Read all lines from the reader
      const lines = [];
      let line;
      while ((line = reader.readLine()) !== undefined) {
        lines.push(line);
      }

      // Transform lines matching the constraint attribute syntax
      const out = lines.map((line) => {
        const m = line.match(
          /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\](.*)/
        );
        if (m) {
          return `:${m[1]}: ${m[2]}${m[3]}`;
        }
        return line;
      });

      // Replace the reader's content using pushInclude
      reader.pushInclude(
        out.join('\n'),
        'virtual.adoc',
        1
      );
      return reader;
    });
  });
};
