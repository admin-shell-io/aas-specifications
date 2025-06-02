// modules/extensions/rewrite-constraints-ext.js
console.log('Loading rewrite-constraints-ext.js extension...');

function transformConstraints(source, docfile) {
  let transformedSource = source;
  let totalTransformations = 0;
  
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
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  const aasaMatches = (source.match(/^:aasa(\d+):\s*pass:q\[\[underline\]#Constraint AASa-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aasaMatches.length > 0) {
    transformedSource = transformedSource.replace(
      /^:aasa(\d+):\s*pass:q\[\[underline\]#Constraint AASa-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasa${attrNum}: Constraint AASa-${constraintNum}: ${cleanedText}`;
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  const aascMatches = (source.match(/^:aasc3a(\d+):\s*pass:q\[\[underline\]#Constraint AASc-3a-(\d+):#\s*(.*?)\]$/gm) || []);
  if (aascMatches.length > 0) {
    transformedSource = transformedSource.replace(
      /^:aasc3a(\d+):\s*pass:q\[\[underline\]#Constraint AASc-3a-(\d+):#\s*(.*?)\]$/gm,
      (match, attrNum, constraintNum, rawText) => {
        const cleanedText = rawText
          .replace(/__/g, '_')
          .replace(/\]\s*$/, '')
          .trim();
        const replacement = `:aasc3a${attrNum}: Constraint AASc-3a-${constraintNum}: ${cleanedText}`;
        totalTransformations++;
        return replacement;
      }
    );
  }
  
  return transformedSource;
}

module.exports = function (registry) {
  console.log('Registering rewrite-constraints-ext...');
  
  registry.preprocessor(function () {
    var self = this;
    self.process(function (doc, reader) {
      var docfile = doc.getAttribute('docfile') || '[unknown file]';
      var source = reader.getString();
      var transformedSource = transformConstraints(source, docfile);
      
      if (source !== transformedSource) {
        var Asciidoctor = require('@asciidoctor/core')();
        var newReader = Asciidoctor.Reader.$new(transformedSource.split('\n'));
        return newReader;
      }
      
      return reader;
    });
  });
  
  console.log('Preprocessor registered successfully');
};  