// modules/extensions/rewrite-constraints-ext.js

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    this.process(function (_doc, reader) {
      const originalLines = reader.lines;                  // get all lines of the current document :contentReference[oaicite:0]{index=0}
      const rewrittenLines = [];

      for (let i = 0; i < originalLines.length; i++) {
        let line = originalLines[i];

        // As long as the current line ends with a backslash, remove it and append the next line (trimmed)
        while (line.endsWith('\\')) {                      // String.prototype.endsWith :contentReference[oaicite:1]{index=1}
          // Strip the trailing backslash, then append the next physical line trimmed of leading/trailing whitespace
          line = line.slice(0, -1) + originalLines[++i].trim();
        }

        rewrittenLines.push(line);
      }

      reader.lines = rewrittenLines;                       // replace the reader buffer with our collapsed lines
      return reader;
    });
  });
};
