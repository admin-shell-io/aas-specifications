// modules/extensions/rewrite-constraints-ext.js

module.exports.register = function (registry) {
  registry.preprocessor(function () {
    this.process(function (_doc, reader) {
      console.log('Starting constraint transformation…');
      const originalLines = reader.lines;
      const rewrittenLines = [];
      let inTable = false;

      for (let i = 0; i < originalLines.length; i++) {
        let line = originalLines[i];

        // Toggle inTable when encountering a table delimiter (|===)
        if (line.trim() === '|===') {
          inTable = !inTable;
          rewrittenLines.push(line);
          continue;
        }

        // Only process “:aasdXXX:” constraint lines when not inside a table
        if (!inTable) {
          const match = line.match(/^:aasd(\d+):\s*Constraint AASd-(\d+):\s*(.*)$/);
          if (match) {
            const [, attrNum, constraintNum, rawText] = match;
            if (typeof rawText !== 'string') {
              rewrittenLines.push(line);
              continue;
            }

            // 1) Convert <<spec-metamodel::…>> to xref:ROOT:…[…]
            let processed = rawText.replace(
              /<<spec-metamodel::([^,>]+),([^>]+)>>/g,
              (_all, modulePath, anchor) => {
                // modulePath might be something like "core::AssetInformation"
                // anchor might be "AssetInformation/globalAssetId"
                // Split at “::” into [pkg, …rest]
                const [pkg, ...rest] = modulePath.split('::');
                // Reassemble the AAS-asciidoc reference: e.g. “xref:ROOT:spec-metamodel/core.adoc#AssetInformation/globalAssetId[]”
                return `xref:ROOT:spec-metamodel/${pkg}.adoc#${anchor}[]`;
              }
            );

            // 2) Replace <em>…</em> with _…_
            processed = processed.replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_');

            // 3) Wrap “Constraint AASd-XYZ:” in [underline]#…#
            const replacement =
              `:aasd${attrNum}: [underline]#Constraint AASd-${constraintNum}:# ${processed}`;
            console.log(`Transformed :aasd${attrNum}: → ${replacement}`);
            rewrittenLines.push(replacement);
            continue;
          }
        }

        // If not a constraint line, or inside a table, leave it unchanged
        rewrittenLines.push(line);
      }

      // Overwrite reader.lines directly so Antora never sees undefined entries
      reader.lines = rewrittenLines;
      console.log(
        'Transformation complete. Total lines processed:',
        originalLines.length
      );
      return reader;
    });
  });
};
