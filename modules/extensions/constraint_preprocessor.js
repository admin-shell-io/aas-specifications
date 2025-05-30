// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // 1) Read all (already-include-processed) lines
      const lines = [];
      while (reader.hasMoreLines()) {
        lines.push(reader.readLine());
      }

      // 2) Clean up spans and pass:q macros
      const cleaned = lines.map((line) =>
        line
          // convert <span class="underline">…</span>
          .replace(
            /<span class="underline">(.*?)<\/span>/g,
            '+++<u>$1</u>+++'
          )
          // convert pass:q[[underline]#Label:# content]
          .replace(
            /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/g,
            (_, label, rest) => `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
          )
      );

      // 3) Re-inject the cleaned lines (now with a valid empty-attributes object)
      reader.pushInclude(
        cleaned,
        reader.file,  // current filename (string)
        reader.path,  // current include path (string)
        1,            // starting line number
        {}            // attributes map (must be provided)
      );

      // Returning null tells Asciidoctor.js to continue with the modified reader
      return null;
    });
  });
};
