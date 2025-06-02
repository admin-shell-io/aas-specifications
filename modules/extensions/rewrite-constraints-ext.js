// modules/extensions/rewrite-constraints-ext.js
console.log('Loading rewrite-constraints-ext.js extension...');

function transformConstraints(source, docfile) {
  let transformedSource = source;
  let totalTransformations = 0;
  
  // Add debug logging to see what files are being processed
  if (source.includes('aasa') || source.includes('aasc') || source.includes('aasd')) {
    console.log(`\n🔍 CHECKING FILE: ${docfile} for constraints...`);
  }
  
  // Pattern 1: :aasdXXX: pass:q[[underline]#Constraint AASd-XXX:# content...]
  const aasdMatches = (source.match(/^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aasdMatches.length > 0) {
    console.log(`🎯 FOUND ${aasdMatches.length} AASd constraints in ${docfile}`);
    transformedSource = transformedSource.replace(
      /^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasd${attrNum}: Constraint AASd-${constraintNum}: ${cleanedText}`;
        console.log(`✅ AASd-${constraintNum} TRANSFORMED`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  // Pattern 2: :aasaXXX: pass:q[[underline]#Constraint AASa-XXX:# content...]
  const aasaMatches = (source.match(/^:aasa(\d+):\s*pass:q\[\[underline\]#Constraint AASa-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aasaMatches.length > 0) {
    console.log(`🎯 FOUND ${aasaMatches.length} AASa constraints in ${docfile}`);
    transformedSource = transformedSource.replace(
      /^:aasa(\d+):\s*pass:q\[\[underline\]#Constraint AASa-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasa${attrNum}: Constraint AASa-${constraintNum}: ${cleanedText}`;
        console.log(`✅ AASa-${constraintNum} TRANSFORMED`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  // Pattern 3: :aasc3aXXX: pass:q[[underline]#Constraint AASc-3a-XXX:# content...]
  const aascMatches = (source.match(/^:aasc3a(\d+):\s*pass:q\[\[underline\]#Constraint AASc-3a-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aascMatches.length > 0) {
    console.log(`🎯 FOUND ${aascMatches.length} AASc constraints in ${docfile}`);
    transformedSource = transformedSource.replace(
      /^:aasc3a(\d+):\s*pass:q\[\[underline\]#Constraint AASc-3a-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasc3a${attrNum}: Constraint AASc-3a-${constraintNum}: ${cleanedText}`;
        console.log(`✅ AASc-3a-${constraintNum} TRANSFORMED`);
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  if (totalTransformations > 0) {
    console.log(`\n🎉 === TRANSFORMED ${totalTransformations} total constraint(s) in ${docfile} ===`);
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
        console.log(`\n🔄 *** APPLYING TRANSFORMATIONS to ${docfile} ***`);
        console.log(`📝 Original source length: ${source.length} characters`);
        console.log(`📝 Transformed source length: ${transformedSource.length} characters`);
        
        // Create a completely new reader with the transformed content
        var Asciidoctor = require('@asciidoctor/core')();
        var newReader = Asciidoctor.Reader.$new(transformedSource.split('\n'));
        
        console.log(`✅ Created new reader with transformed content for ${docfile}`);
        console.log(`🔄 READER UPDATED - Asciidoctor will use transformed content\n`);
        return newReader;
      }
      
      return reader;
    });
  });
  
  console.log('Preprocessor registered successfully');
};