// modules/extensions/constraint_include_processor.js

module.exports = function (registry) {
  registry.includeProcessor(function () {
    this.handles(function (target) {
      return target.endsWith('constraints.adoc') ||
        (target.includes('spec-metamodel/') && target.endsWith('.adoc'));
    });

    this.process(function (doc, reader, target, attributes) {
      const lines = reader.getLines();
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
      // return an object with a content array
      return { content: cleaned };
    });
  });
};
