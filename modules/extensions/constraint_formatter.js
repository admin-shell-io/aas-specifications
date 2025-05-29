const { extname } = require('path')

module.exports = function constraintFormatter () {
  return {
    name: 'constraint-formatter',
    process ({ content, file }) {
      // Log which file is being processed
      console.log(`Processing file: ${file.src.path}`)
      
      // Process all .adoc files, not just constraints
      if (extname(file.src.path) !== '.adoc') return content
      
      // First, protect the cross-references
      const protectedContent = content.replace(/<<(.*?)>>/g, 'PROTECTED_REF_$1_PROTECTED')
      
      // Then handle the formatting
      const formattedContent = protectedContent
        .replace(/pass:q\[\[underline\]#(.*?)#\]\]/g, '$1')
        .replace(/<span class="underline">(.*?)<\/span>/g, '$1')
        .replace(/<em>(.*?)<\/em>/g, '_$1_')
      
      // Finally, restore the cross-references
      const result = formattedContent.replace(/PROTECTED_REF_(.*?)_PROTECTED/g, '<<$1>>')
      
      // Log if any changes were made
      if (result !== content) {
        console.log(`Modified formatting in: ${file.src.path}`)
      }
      
      return result
    }
  }
} 