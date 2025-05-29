#!/usr/bin/env node

// standalone-formatter.js
// Preprocesses AsciiDoc files to fix formatting issues before AsciiDoctor parsing

const fs = require('fs');
const path = require('path');

function formatAsciiDoc(content) {
  const lines = content.split('\n');
  const transformedLines = [];
  const constraints = new Map();
  let transformedCount = 0;

  // Add doctype if not present
  if (!lines.some(l => l.trim().startsWith(':doctype:'))) {
    transformedLines.push(':doctype: book');
    transformedLines.push('');
    console.log('Added doctype: book');
  }

  for (const line of lines) {
    if (!line || typeof line !== 'string') {
      transformedLines.push(line);
      continue;
    }

    let transformedLine = line;
    let wasTransformed = false;

    // 1. Fix malformed HTML-like underlines
    if (transformedLine.includes('<span class="underline">') || transformedLine.includes('</span>')) {
      transformedLine = transformedLine.replace(
        /<span class="underline">(.*?)<\/span>/g,
        '+++<u>$1</u>+++'
      );
      wasTransformed = true;
      console.log('Fixed underline span in:', line.substring(0, 50) + '...');
    }

    // 2. Fix malformed HTML emphasis tags
    if (transformedLine.includes('<em>') || transformedLine.includes('</em>')) {
      transformedLine = transformedLine.replace(/<em>(.*?)<\/em>/g, '_$1_');
      wasTransformed = true;
      console.log('Fixed emphasis tags in:', line.substring(0, 50) + '...');
    }

    // 3. Fix malformed cross-references with <<>>
    const xrefMatches = transformedLine.match(/<<([^>]+)>>/g);
    if (xrefMatches) {
      xrefMatches.forEach(match => {
        const content = match.slice(2, -2); // Remove << >>
        const parts = content.split(',');
        if (parts.length === 2) {
          const [path, displayText] = parts;
          const pathParts = path.split(':::');
          if (pathParts.length >= 3) {
            const [module, section, className] = pathParts;
            // Convert to proper xref format
            const newXref = `xref:ROOT:spec-metamodel/${section}.adoc#${className}[${displayText}]`;
            transformedLine = transformedLine.replace(match, newXref);
            wasTransformed = true;
            console.log('Fixed xref:', match, '->', newXref);
          }
        }
      });
    }

    // 4. Extract constraint definitions
    const constraintMatch = transformedLine.match(/^:(aasd\d+):\s*(?:pass:q\[\[underline\]#)?(Constraint AASd-\d+):#?\s*(.*?)(?:#)?$/);
    if (constraintMatch) {
      const [, constraintId, label, content] = constraintMatch;
      constraints.set(constraintId, `${label}: ${content.trim()}`);
      console.log('Extracted constraint:', constraintId);
      continue; // Skip adding this line - will be added as attribute
    }

    // 5. Fix existing xref format issues
    const xrefFixed = transformedLine.replace(
      /xref:ROOT:spec-metamodel\/([^.]+)\.adoc([^[]*)\[([^\]]+)\]/g,
      (match, mod, anchor, label) => {
        if (!mod || !label) return match;
        let anc = anchor.trim();
        if (anc && !anc.startsWith('#')) anc = `#${anc}`;
        else if (!anc) anc = '';
        wasTransformed = true;
        return `xref:ROOT:spec-metamodel/${mod}.adoc${anc}[${label}]`;
      }
    );
    
    if (xrefFixed !== transformedLine) {
      transformedLine = xrefFixed;
      wasTransformed = true;
    }

    if (wasTransformed) {
      transformedCount++;
    }

    transformedLines.push(transformedLine);
  }

  // Inject constraint attributes
  if (constraints.size > 0) {
    const attributeLines = [];
    constraints.forEach((content, id) => {
      attributeLines.push(`:${id}: ${content}`);
    });
    
    let insertIndex = transformedLines.findIndex(l => l.trim().startsWith(':doctype:'));
    if (insertIndex === -1) {
      insertIndex = 0;
    } else {
      insertIndex += 1;
    }
    
    transformedLines.splice(insertIndex, 0, ...attributeLines);
    console.log(`Injected ${constraints.size} constraint attributes`);
  }

  // Add missing attributes
  const missingAttrs = ['aasd080', 'aasd081', 'aasd090'];
  missingAttrs.forEach(id => {
    if (!transformedLines.some(l => l.startsWith(`:${id}:`))) {
      transformedLines.unshift(`:${id}: `);
      console.log(`Added missing attribute: ${id}`);
    }
  });

  console.log(`Applied ${transformedCount} total transformations`);
  return transformedLines.join('\n');
}

function processFile(inputPath, outputPath) {
  try {
    console.log(`Processing: ${inputPath}`);
    const content = fs.readFileSync(inputPath, 'utf8');
    const formatted = formatAsciiDoc(content);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, formatted, 'utf8');
      console.log(`Written to: ${outputPath}`);
      
      // Verify the file was actually created
      if (fs.existsSync(outputPath)) {
        console.log(`Confirmed: ${outputPath} exists`);
      } else {
        console.error(`Error: ${outputPath} was not created`);
        process.exit(1);
      }
    } else {
      console.log('Formatted content:');
      console.log(formatted);
    }
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    process.exit(1);
  }
}

function processDirectory(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);
  files.forEach(file => {
    if (path.extname(file) === '.adoc') {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      processFile(inputPath, outputPath);
    }
  });
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node standalone-formatter.js <input.adoc> [output.adoc]');
    console.log('  node standalone-formatter.js <input-dir> <output-dir>');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1];

  if (fs.statSync(inputPath).isDirectory()) {
    if (!outputPath) {
      console.error('Output directory required when input is a directory');
      process.exit(1);
    }
    processDirectory(inputPath, outputPath);
  } else {
    processFile(inputPath, outputPath);
  }
}

module.exports = { formatAsciiDoc, processFile, processDirectory };