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

        // Toggle inTable when encountering a table delimiter
        if (line.trim() === '|===') {
          inTable = !inTable;
          rewrittenLines.push(line);
          continue;
        }

        // 1) First, catch any literal <span class="underline">Constraint AASd-XYZ:</span> in the body
        //    and replace it with [underline]#Constraint AASd-XYZ:# 
        //    (so that no <span> remains for AsciiDoctor to choke on).
        //    We use a global regex here; it will fire anywhere, even if the line was already rewritten.
        line = line.replace(
          /<span\s+class=["']underline["']\s*>\s*(Constraint\s+AASd-(\d+):)\s*<\/span>/g,
          (_all, text, num) => `[underline]#${text}#`
        );

        // 2) Next, if we're _not_ inside a table block, look for attribute lines that start with ":aasdNNN:"
        if (!inTable) {
          // match something like:
          //   :aasd007: Constraint AASd-007: If both the <<spec-metamodel::submodel-elements:::Property,Property/value>> …
          const attrMatch = line.match(
            /^:aasd(\d+):\s*Constraint AASd-(\d+):\s*(.*)$/
          );
          if (attrMatch) {
            const [, attrNum, constraintNum, rawText] = attrMatch;
            if (typeof rawText !== 'string') {
              rewrittenLines.push(line);
              continue;
            }

            console.log(
              `Processing attribute :aasd${attrNum}: Constraint AASd-${constraintNum}`
            );
            let processed = rawText;

            // 2a) Replace all <<spec-metamodel::Module:::Anchor>> → xref:ROOT:spec-metamodel/Module.adoc#Anchor[]
            processed = processed.replace(
              /<<spec-metamodel::([^:>]+)(?:::)?([^,>]+)?(?:,([^>]+))?>>/g,
              (_all, modulePath, maybeAnchor, maybeSuffix) => {
                // Some variants of your constraints use "core::AssetInformation,globalAssetId"
                // and some use "submodel-elements:::Property,value". We want to extract both parts.
                //
                // modulePath might be like "core" or "submodel-elements"
                // maybeAnchor might be "AssetInformation" or "Property"
                // maybeSuffix might be "globalAssetId" or "value"
                //
                // We will rebuild as: xref:ROOT:spec-metamodel/{modulePath}.adoc#{maybeAnchor}/{maybeSuffix}[]
                if (maybeAnchor && maybeSuffix) {
                  return `xref:ROOT:spec-metamodel/${modulePath}.adoc#${maybeAnchor}/${maybeSuffix}[]`;
                } else if (maybeAnchor) {
                  // if there's no comma, just treat maybeAnchor as the full Anchor
                  return `xref:ROOT:spec-metamodel/${modulePath}.adoc#${maybeAnchor}[]`;
                }
                // fallback—should not really happen
                return `xref:ROOT:spec-metamodel/${modulePath}.adoc#[]`;
              }
            );

            // 2b) Replace any <em>…</em> with _…_
            processed = processed.replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_');

            // 2c) Finally wrap "Constraint AASd-XYZ:" itself in underline
            const replacedAttrLine =
              `:aasd${attrNum}: [underline]#Constraint AASd-${constraintNum}:# ${processed}`;
            console.log(` → rewritten to: ${replacedAttrLine}`);
            rewrittenLines.push(replacedAttrLine);
            continue;
          }
        }

        // 3) If no special case matched, just leave the line as-is
        rewrittenLines.push(line);
      }

      // Overwrite reader.lines so that Antora/AsciiDoctor never sees any <span>
      reader.lines = rewrittenLines;
      console.log(
        `Transformation complete. Total lines processed: ${originalLines.length}`
      );
      return reader;
    });
  });
};
