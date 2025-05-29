const { extname } = require('path')

module.exports = function constraintFormatter () {
  return {
    name: 'constraint-formatter',
    process ({ content, file }) {
      if (extname(file.src.path) !== '.adoc') return content
      
      // Replace the pass:q[[underline]# formatting with simple text
      return content.replace(/pass:q\[\[underline\]#(.*?)#\]\]/g, '$1')
    }
  }
} 