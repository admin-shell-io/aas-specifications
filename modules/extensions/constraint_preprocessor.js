// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // Read all pre-included lines
      const lines = [];
      while (reader.hasMoreLines()) {
        lines.push(reader.readLine());
      }
      // Apply regex transforms on each String line
      const cleaned = lines.map((line) =>
        line
          .replace(
            /<span class="underline">(.*?)<\/span>/g,
            '+++<u>$1</u>+++'
          )
          .replace(
            /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
            (_, label, rest) => `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
          )
      );
      // Join into a single String so pushInclude(data) works
      const cleanedText = cleaned.join('\n');
      reader.pushInclude(
        cleanedText,   // String data (required) 
        reader.file,   // current filename (String) 
        reader.path,   // current include path (String) 
        1,             // starting line number
        {}             // attributes map (required)
      );
      return null;     // continue with modified reader
    });
  });
};
