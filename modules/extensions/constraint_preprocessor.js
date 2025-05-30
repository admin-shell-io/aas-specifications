// modules/extensions/constraint_preprocessor.js

module.exports = function (registry) {
  registry.preprocessor(function () {
    this.process(function (doc, reader) {
      // 1) Slurp the rest of the document
      const content = reader.read();
      if (typeof content !== 'string') {
        console.warn('Skipping processing: content is not a string');
        return null;
      }

      // 2) Run your regex fixes
      const cleaned = content
        .replace(/<span class="underline">(.*?)<\/span>/gs, '+++<u>$1</u>+++')
        .replace(
          /pass:q\[\[underline\]#([^#]+)#\s*(.*?)\]/gs,
          (_, label, rest) => `+++<u>${label.trim()}</u>+++ ${rest.trim()}`
        );

      // 3) Re-inject the cleaned text in place of the old
      //    reader.getCursor() gives us file, dir, lineno context
      const cursor = reader.getCursor();
      reader.pushInclude(
        cleaned,                  // String or String[] of cleaned lines
        cursor.getFile(),         // original filename
        cursor.getPath(),         // original include path
        cursor.getLineNumber(),   // original line offset
        {}                        // attributes map
      );

      return null; // continue parsing
    });
  });
};
