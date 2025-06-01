// modules/extensions/rewrite-constraints-ext.js

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    this.process(function (_doc, reader) {
      const originalLines = reader.lines;
      const rewrittenLines = [];

      for (let i = 0; i < originalLines.length; i++) {
        let line = originalLines[i];

        // 1. Collapse backslash‐terminated lines
        while (line.endsWith('\\')) {
          line = line.slice(0, -1) + originalLines[++i].trim();
        }

        // 2. Convert <span class="underline">…</span> → [.underline]#…#
        line = line.replace(
          /<span\s+class="underline">([\s\S]*?)<\/span>/gi,
          '[.underline]#$1#'
        );

        // 3. Convert <em>…</em> → *…*
        line = line.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');

        rewrittenLines.push(line);
      }

      reader.lines = rewrittenLines;
      return reader;
    });
  });
};
