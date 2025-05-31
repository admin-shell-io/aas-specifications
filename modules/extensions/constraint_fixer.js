// modules/extensions/constraint_fixer.js

module.exports = function (registry) {
  //
  // 1) Helper: demote any single-`=` heading after the first line into a level-1 heading
  //
  function transformLevel0ToLevel1(line, index) {
    // Only lines beyond index 0 can be demoted
    // A valid level-0 heading is exactly: "= Title" (single '=' followed by space)
    if (index > 0 && line.startsWith('= ') && !line.startsWith('== ')) {
      // Replace the leading "= " with "== "
      return line.replace(/^= /, '== ');
    }
    // Otherwise, return the line unchanged
    return line;
  }

  //
  // 2) Helper: transform any <span class="underline">…</span> or pass:q[[… underline…]] blocks
  //    into +++<u>…</u>+++ as before.
  //
  function transformUnderline(line) {
    if (typeof line !== 'string') {
      return line;
    }

    // 2a) Skip PlantUML blocks if present
    if (line.includes('plantuml') || line.includes('@startuml') || line.includes('@enduml')) {
      return line;
    }

    let result = line;

    // 2b) Handle <span class="underline">…</span> → +++<u>…</u>+++
    if (line.includes('<span class="underline">')) {
      const parts = line.split('<span class="underline">');
      for (let i = 1; i < parts.length; i++) {
        const endIndex = parts[i].indexOf('</span>');
        if (endIndex !== -1) {
          const content = parts[i].substring(0, endIndex);
          const rest = parts[i].substring(endIndex + 7);
          parts[i] = `+++<u>${content}</u>+++${rest}`;
        }
      }
      result = parts.join('');
    }

    // 2c) Handle pass:q[[… underline …]] → +++<u>…</u>+++ …
    if (line.includes('pass:q[[') && line.includes('underline')) {
      const parts = line.split('pass:q[[');
      for (let i = 1; i < parts.length; i++) {
        const afterOpen = parts[i];
        const underlineTagIndex = afterOpen.indexOf('underline]');
        if (underlineTagIndex !== -1) {
          const labelStart = afterOpen.indexOf('#') + 1;
          const labelEnd = afterOpen.indexOf('#', labelStart);
          if (labelStart > 0 && labelEnd > labelStart) {
            const label = afterOpen.substring(labelStart, labelEnd).trim();
            const rest = afterOpen.substring(labelEnd + 1).trim();
            parts[i] = `+++<u>${label}</u>+++ ${rest}`;
          }
        }
      }
      result = parts.join('');
    }

    return result;
  }

  //
  // 3) PREPROCESSOR: runs before the Asciidoctor parser
  //
  registry.preprocessor(function () {
    this.process(function (_doc, reader) {
      // 3a. Retrieve all lines (Asciidoctor.js v2+ guaranteed getLines())
      const lines = typeof reader.getLines === 'function'
        ? reader.getLines()
        : reader.lines || [];

      // 3b. For each line, first demote invalid level-0 headings, then apply underline transforms
      const transformedLines = lines.map((line, idx) => {
        const demoted = transformLevel0ToLevel1(line, idx);
        return transformUnderline(demoted);
      });

      // 3c. Join transformed lines into one string so Asciidoctor can re-split properly
      const joined = transformedLines.join('\n');

      // 3d. Replace the current reader’s content with our fixed content
      //     Arguments: (contentString, filePath, virtualPath, insertionIndex, attrs)
      reader.pushInclude(joined, reader.file, reader.file, 1, {});

      // Finally, return the reader back to the pipeline
      return reader;
    });
  });

  //
  // 4) INCLUDE-PROCESSOR: intercept any includes of “constraints.adoc” or “spec-metamodel/*.adoc”
  //
  registry.includeProcessor(function () {
    this.handles(function (target) {
      return (
        target.endsWith('constraints.adoc') ||
        (target.includes('spec-metamodel/') && target.endsWith('.adoc'))
      );
    });

    this.process(function (_doc, reader, target, attrs) {
      // 4a. Get the lines of the included file
      const lines = typeof reader.getLines === 'function'
        ? reader.getLines()
        : reader.lines || [];

      // 4b. Apply the same two-step transform (demote + underline) to the included lines
      const transformedLines = lines.map((line, idx) => {
        const demoted = transformLevel0ToLevel1(line, idx);
        return transformUnderline(demoted);
      });

      // 4c. Join into one string and call pushInclude so Asciidoctor doesn’t see illegal sections
      const joined = transformedLines.join('\n');
      return reader.pushInclude(joined, target, target, 1, attrs);
    });
  });

  //
  // 5) POSTPROCESSOR: after conversion, just return the output unchanged
  //
  registry.postprocessor(function () {
    this.process(function (_doc, output) {
      return output;
    });
  });
};
