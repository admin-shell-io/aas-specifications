// modules/extensions/rewrite-constraints-ext.js
console.log('Loading rewrite-constraints-ext.js extension...');

function transformConstraints(source, docfile) {
  let transformedSource = source;
  // Match the actual format: :aasdXXX: pass:q[[underline]#Constraint AASd-XXX:# content...]
  const originalMatches = (source.match(/^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*)$/gm) || []);
  
  if (originalMatches.length > 0) {
    console.log(`\n=== TRANSFORMING ${originalMatches.length} constraint(s) in ${docfile} ===`);
    
    transformedSource = transformedSource.replace(
      /^:aasd(\d+):\s*pass:q\[\[underline\]#Constraint AASd-(\d+):#\s*(.*)$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const replacement = `:aasd${attrNum}: Constraint AASd-${constraintNum}: ${rawText}`;
        console.log(`BEFORE: ${match.substring(0, 80)}...`);
        console.log(`AFTER:  ${replacement.substring(0, 80)}...`);
        return replacement;
      }
    );
    console.log(`=== TRANSFORMATION COMPLETE for ${docfile} ===\n`);
  } else {
    // Check if file has any aasd references at all
    const anyAasd = source.match(/aasd/gi);
    if (anyAasd && anyAasd.length > 0) {
      console.log(`Note: ${docfile} contains ${anyAasd.length} 'aasd' references but no constraint lines matching pattern`);
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
      
      var lines = reader.lines;
      var source = lines.join('\n');
      var transformedSource = transformConstraints(source, docfile);
      
      if (source !== transformedSource) {
        console.log(`*** APPLYING TRANSFORMATIONS to ${docfile} ***`);
        var newLines = transformedSource.split('\n');
        // Clear and replace the lines array
        lines.length = 0;
        lines.push.apply(lines, newLines);
      }
      
      return reader;
    });
  });
  
  console.log('Preprocessor registered successfully');
};