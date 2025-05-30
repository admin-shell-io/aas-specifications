// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // 1) Read all pending lines
      const lines = [];
      while (reader.hasMoreLines()) {
        lines.push(reader.readLine());
      }
      // 2) Clean up underline spans and pass:q macros
      const cleanedText = lines
        .filter(line => line != null)
        .map(line =>
          String(line)
            .replace(
              /<span class="underline">(.*?)<\/span>/g,
              '+++<u>$1</u>+++'
            )
            .replace(
              /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
              (_, label, rest) =>
                `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
            )
        )
        .join('\n');

      // 3) Re-inject using the correct reader.file() and reader.path() methods
      reader.pushInclude(
        cleanedText,      // the modified content
        reader.file(),    // ← correct: returns filename string :contentReference[oaicite:2]{index=2}
        reader.path(),    // ← correct: returns include path string :contentReference[oaicite:3]{index=3}
        1,                // line offset
        {}                // empty attributes map
      );

      return null; // continue parsing with the updated reader
    });
  });
};
