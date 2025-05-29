#!/usr/bin/env node

// scripts/test-formatter.js
// Test the formatter with sample problematic content from your error log

const { formatAsciiDoc } = require('./standalone-formatter.js');

// Sample problematic content from your error log
const testContent = `
:doctype: book

= Test Document

<span class="underline">Constraint AASd-127:</span> For model references, i.e. <<spec-metamodel::referencing:::Reference,Reference>>s with <em>Reference/type</em> = <<spec-metamodel::referencing:::ReferenceTypes,ModelReference>> with more than one key in <em>Reference/keys,</em> a key with <<spec-metamodel::referencing:::Key,Key/type>> <em>FragmentReference</em> shall be preceded by a key with <<spec-metamodel::referencing:::Key,Key/type>> <em>File</em> or <em>Blob</em>.

:aasd127: pass:q[[underline]#Constraint AASd-127:#] For model references, i.e. <<spec-metamodel::referencing:::Reference,Reference>>s with _Reference/type_ = <<spec-metamodel::referencing:::ReferenceTypes,ModelReference>> with more than one key in _Reference/keys,_ a key with <<spec-metamodel::referencing:::Key,Key/type>> _FragmentReference_ shall be preceded by a key with <<spec-metamodel::referencing:::Key,Key/type>> _File_ or _Blob_.

<span class="underline">Constraint AASd-128:</span> For model references, i.e. <<spec-metamodel::referencing:::Reference,Reference>>s with <em>Reference/type</em> = <<spec-metamodel::referencing:::ReferenceTypes,ModelReference>>, the <<spec-metamodel::referencing:::Key,Key/value>> of a <<spec-metamodel::referencing:::Key,Key>> preceded by a <<spec-metamodel::referencing:::Key,Key>> with <<spec-metamodel::referencing:::Key,Key/type>> = <<spec-metamodel::submodel-elements:::SubmodelElementList,SubmodelElementList>> is an integer number denoting the position in the array of the submodel element list.

Some regular content with xref:ROOT:spec-metamodel/common.adoc[Common] and xref:ROOT:spec-metamodel/core.adoc#Submodel[Submodel].
`;

console.log('=== ORIGINAL CONTENT ===');
console.log(testContent);

console.log('\n=== FORMATTED CONTENT ===');
const formatted = formatAsciiDoc(testContent);
console.log(formatted);

console.log('\n=== ANALYSIS ===');
const originalLines = testContent.split('\n');
const formattedLines = formatted.split('\n');

console.log(`Original lines: ${originalLines.length}`);
console.log(`Formatted lines: ${formattedLines.length}`);

// Check for problematic patterns that should be fixed
const problematicPatterns = [
  /<span class="underline">/,
  /<\/span>/,
  /<em>/,
  /<\/em>/,
  /<<[^>]*:::[^>]*>>>/
];

let foundProblems = false;
problematicPatterns.forEach((pattern, index) => {
  const originalMatches = (testContent.match(pattern) || []).length;
  const formattedMatches = (formatted.match(pattern) || []).length;
  
  if (formattedMatches > 0) {
    console.log(`❌ Pattern ${index + 1} still present: ${pattern} (${formattedMatches} matches)`);
    foundProblems = true;
  } else if (originalMatches > 0) {
    console.log(`✅ Pattern ${index + 1} fixed: ${pattern} (was ${originalMatches} matches)`);
  }
});

if (!foundProblems) {
  console.log('\n🎉 All problematic patterns have been fixed!');
} else {
  console.log('\n⚠️  Some patterns still need fixing.');
}

// Check for good patterns that should be present
const goodPatterns = [
  /\+\+\+<u>[^<]+<\/u>\+\+\+/, // Fixed underlines
  /_[^_]+_/, // Fixed emphasis
  /xref:ROOT:spec-metamodel\/[^.]+\.adoc(?:#[^[]+)?\[[^\]]+\]/ // Fixed xrefs
];

console.log('\n=== GOOD PATTERNS ===');
goodPatterns.forEach((pattern, index) => {
  const matches = (formatted.match(pattern) || []).length;
  if (matches > 0) {
    console.log(`✅ Good pattern ${index + 1} found: ${matches} matches`);
  }
});

console.log('\n=== TESTING COMPLETE ===');