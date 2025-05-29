const { extname } = require('path')

module.exports = function constraintFormatter () {
  return {
    name: 'constraint-formatter',
    preprocessor ({ content, file }) {
      // Log which file is being processed
      console.log(`Preprocessing file: ${file.src.path}`)
      
      // Process all .adoc files
      if (extname(file.src.path) !== '.adoc') return content
      
      // First, protect cross-references
      const protectedContent = content.replace(/<<(.*?)>>/g, 'PROTECTED_REF_$1_PROTECTED')
      
      // Handle the formatting
      const formattedContent = protectedContent
        // Remove pass:q[[underline]# formatting
        .replace(/pass:q\[\[underline\]#(.*?)#\]\]/g, '$1')
        // Convert HTML span with underline class to AsciiDoc underline
        .replace(/<span class="underline">(.*?)<\/span>/g, '[.underline]#$1#')
        // Convert HTML em tags to AsciiDoc emphasis
        .replace(/<em>(.*?)<\/em>/g, '_$1_')
      
      // Restore cross-references
      const result = formattedContent.replace(/PROTECTED_REF_(.*?)_PROTECTED/g, '<<$1>>')
      
      // Log if any changes were made
      if (result !== content) {
        console.log(`Modified formatting in: ${file.src.path}`)
      }
      
      return result
    }
  }
} 