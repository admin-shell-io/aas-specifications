// modules/extensions/constraint_include_processor.js

module.exports = function (registry) {
  registry.includeProcessor(function () {
    this.handles(function () {
      // Only process our constraint files
      return this.target.endsWith('constraints.adoc') ||
             this.target.includes('spec-metamodel/') && this.target.endsWith('.adoc');
    });
    this.process(function () {
      // reader.getLines() returns a String[]—no undefined entries :contentReference[oaicite:2]{index=2}
      const lines = this.reader.getLines();
      return lines.map((line) =>
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
    });
  });
};
