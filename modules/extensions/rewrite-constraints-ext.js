// modules/extensions/rewrite-constraints-ext.js
console.log('Loading rewrite-constraints-ext.js extension...');

function transformConstraints(source, docfile) {
  let transformedSource = source;
  let totalTransformations = 0;
  
  // Pattern 1: :aasdXXX: pass:q[[underline]#Constraint AASd-XXX:# content...]
  const aasdMatches = (source.match(/^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aasdMatches.length > 0) {
    transformedSource = transformedSource.replace(
      /^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasd${attrNum}: Constraint AASd-${constraintNum}: ${cleanedText}`;
        console.log(`AASd BEFORE: ${match.substring(0, 80)}...`);
        console.log(`AASd AFTER:  ${replacement.substring(0, 80)}...`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  // Pattern 2: <span class="underline">Constraint AASa-XXX:</span> content
  const aasaMatches = (source.match(/<span class="underline">Constraint AASa-([^<]+):<\/span>\s*(.*?)(?=\n|$)/gm) || []);
  if (aasaMatches.length > 0) {
    transformedSource = transformedSource.replace(
      /<span class="underline">Constraint AASa-([^<]+):<\/span>\s*(.*?)(?=\n|$)/gm,
      (match, constraintNum, content) => {
        const cleanedContent = content.trim();
        const replacement = `Constraint AASa-${constraintNum}: ${cleanedContent}`;
        console.log(`AASa BEFORE: ${match.substring(0, 80)}...`);
        console.log(`AASa AFTER:  ${replacement.substring(0, 80)}...`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  // Pattern 3: <span class="underline">Constraint AASc-XXX:</span> content
  const aascMatches = (source.match(/<span class="underline">Constraint AASc-([^<]+):<\/span>\s*(.*?)(?=\n|$)/gm) || []);
  if (aascMatches.length > 0) {
    transformedSource = transformedSource.replace(
      /<span class="underline">Constraint AASc-([^<]+):<\/span>\s*(.*?)(?=\n|$)/gm,
      (match, constraintNum, content) => {
        const cleanedContent = content.trim();
        const replacement = `Constraint AASc-${constraintNum}: ${cleanedContent}`;
        console.log(`AASc BEFORE: ${match.substring(0, 80)}...`);
        console.log(`AASc AFTER:  ${replacement.substring(0, 80)}...`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  if (totalTransformations > 0) {
    console.log(`\n=== TRANSFORMED ${totalTransformations} total constraint(s) in ${docfile} ===`);
    console.log(`  - AASd: ${aasdMatches.length} constraints`);
    console.log(`  - AASa: ${aasaMatches.length} constraints`);
    console.log(`  - AASc: ${aascMatches.length} constraints`);
    console.log(`=== TRANSFORMATION COMPLETE for ${docfile} ===\n`);
  } else {
    // Check if file has any constraint references at all
    const anyConstraint = source.match(/aas[dac]/gi);
    if (anyConstraint && anyConstraint.length > 0) {
      console.log(`Note: ${docfile} contains ${anyConstraint.length} constraint references but no constraint lines matching patterns`);
    }
  }
  
  return transformedSource;
}

module.exports = function (registry) {
  console.log('Registering rewrite-constraints-ext...');
  
  registry.preprocessor(function () {
    var self = this;
    self.process(function (doc, reader) {
      var docfile = doc.getAttribute('docfile') || '[unknown file]';
      console.log('Processing file:', docfile);
      
      // Get the entire source content
      var source = reader.getString();
      var transformedSource = transformConstraints(source, docfile);
      
      if (source !== transformedSource) {
        console.log(`*** APPLYING TRANSFORMATIONS to ${docfile} ***`);
        
        // Create a completely new reader with the transformed content
        var Asciidoctor = require('@asciidoctor/core')();
        var newReader = Asciidoctor.Reader.$new(transformedSource.split('\n'));
        
        console.log(`Created new reader with transformed content`);
        return newReader;
      }
      
      return reader;
    });
  });
  
  console.log('Preprocessor registered successfully');
};