module.exports = function registerUnderlinePassthrough(registry) {
  registry.preprocessor('underline-passthrough', function () {
    this.process((doc, reader) => {
      // Read all lines from the reader
      const lines = [];
      let line;
      while ((line = reader.readLine()) !== undefined) {
        // Transform lines containing span.underline
        const transformedLine = line.replace(/<span class="underline">(.+?)<\/span>/g, (match, content) => {
          return `pass:[+++<span class="underline">${content}</span>+++]`;
        });
        lines.push(transformedLine);
      }

      // Replace the reader's content
      reader.pushInclude(
        lines.join('\n'),
        'virtual.adoc',
        1
      );
      return reader;
    });
  });
}; 