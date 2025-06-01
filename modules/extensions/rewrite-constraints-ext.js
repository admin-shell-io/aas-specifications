// modules/extensions/rewrite-constraints-ext.js

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    this.process(function (_doc, reader) {
      console.log('Starting constraint transformation...');
      const originalLines = reader.lines;
      const rewrittenLines = [];

      let inTable = false;
      for (let i = 0; i < originalLines.length; i++) {
        let line = originalLines[i];

        // Detect table block start/end
        if (line.trim() === '|===') {
          inTable = !inTable;
          rewrittenLines.push(line);
          continue;
        }

        if (!inTable) {
          // Only process constraint attribute lines outside tables
          const constraintAttrMatch = line.match(/^:aasd(\d+):\s*Constraint AASd-(\d+):\s*(.*)$/);
          if (constraintAttrMatch) {
            const [, attrNum, constraintNum, constraintTextRaw] = constraintAttrMatch;
            const constraintText = constraintTextRaw || '';
            console.log(`\nProcessing constraint attribute: :aasd${attrNum}: Constraint AASd-${constraintNum}: ${constraintText}`);

            // Convert xrefs and <em> tags
            let processedText = constraintText.replace(/<<spec-metamodel::([^>]+)>>/g, 'xref:ROOT:spec-metamodel/$1');
            processedText = processedText.replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_');

            // Wrap constraint number in underline (no pass:q[])
            line = `:aasd${attrNum}: [underline]#Constraint AASd-${constraintNum}:# ${processedText}`;
            console.log('Transformed constraint attribute:', line);
            rewrittenLines.push(line);
            continue;
          }
        }
        // For all other lines (including inside tables), leave unchanged
        rewrittenLines.push(line);
      }

      // Join the lines and push back to reader
      const content = rewrittenLines.join('\n');
      console.log('\nTransformation complete. Total lines processed:', originalLines.length);
      reader.pushInclude(content, reader.file, reader.file, 1, {});

      return reader;
    });
  });
};
