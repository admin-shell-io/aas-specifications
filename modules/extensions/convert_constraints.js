// modules/extensions/convert_constraints.js

module.exports = function registerConvertConstraints(registry) {
  // Register a preprocessor named 'convert-constraints'
  registry.preprocessor('convert-constraints', {
    /**
     * @param {Document} doc    The Asciidoctor document
     * @param {PreprocessorReader} reader
     * @returns {PreprocessorReader}
     */
    process(doc, reader) {
      // Grab all the lines from the reader
      const lines = reader.getLines();
      if (!lines || !lines.length) return reader;

      // Transform lines matching the constraint attribute syntax
      const out = lines.map((line) => {
        // :aasd002: pass:q[[underline]#Constraint AASd-002:# …]
        const m = line.match(
          /^:(aasd\d+):\s*pass:q\[\[underline\]#(.+?)#\]\](.*)/
        );
        if (m) {
          // Rebuild as a plain attribute with the inner text
          // Note: m[1] = aasd002, m[2] = 'Constraint AASd-002:', m[3] = ' rest of text…'
          return `:${m[1]}: ${m[2]}${m[3]}`;
        }
        return line;
      });

      // Replace the reader’s lines in one go
      // (this replaces the entire content of the reader)
      return reader.replace(out);
    },
  });
};
