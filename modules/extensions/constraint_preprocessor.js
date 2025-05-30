// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // 1) Grab the reader’s cursor so we can preserve real file/path/lineno
      const cursor = reader.getCursor();  
      // Cursor methods:
      //   cursor.getFile()      → current filename (String) :contentReference[oaicite:0]{index=0}
      //   cursor.getPath()      → current include path (String) :contentReference[oaicite:1]{index=1}
      //   cursor.getLineNumber()→ current line number (Number) :contentReference[oaicite:2]{index=2}

      // 2) Read all remaining lines as an Array of String
      const lines = reader.getLines();      // returns String[] :contentReference[oaicite:3]{index=3}

      // 3) Apply your regex transforms
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
              (_, label, rest) => `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
            )
        )
        .join('\n');

      // 4) Push the cleaned text back into the reader with the correct context
      reader.pushInclude(
        cleanedText,           // must be a String so internal .replace() calls succeed :contentReference[oaicite:4]{index=4}
        cursor.getFile(),      // real filename, never undefined :contentReference[oaicite:5]{index=5}
        cursor.getPath(),      // real include path, never undefined :contentReference[oaicite:6]{index=6}
        cursor.getLineNumber(),// real line offset, never undefined :contentReference[oaicite:7]{index=7}
        {}                     // attributes map
      );

      return null; // continue parsing with your transformed content in place
    });
  });
};
