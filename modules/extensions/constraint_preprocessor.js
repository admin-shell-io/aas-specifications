// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // 1) Slurp every remaining line into an array
      const lines = [];
      while (reader.hasMoreLines()) {
        lines.push(reader.readLine());
      }

      // 2) Run your two regex replacements on each String line
      const cleaned = lines.map((line) =>
        line
          .replace(
            /<span class="underline">(.*?)<\/span>/g,
            '+++<u>$1</u>+++'
          )
          .replace(
            /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
            (_, label, rest) =>
              `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
          )
      );

      // 3) Re-inject the cleaned lines, preserving file/path/lineno
      const cursor = reader.getCursor();
      reader.pushInclude(
        cleaned,          // Array<String>
        cursor.file,      // original filename
        cursor.path,      // original include path
        cursor.lineno,    // original line number
        {}                // attributes map
      );

      // 4) Tell Asciidoctor to carry on with our updated reader
      return null;
    });
  });
};
