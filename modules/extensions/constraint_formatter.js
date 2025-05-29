const { extname, basename, dirname } = require('path')

module.exports = function constraintFormatter () {
  process.stdout.write('::notice::Constraint formatter extension is being loaded\n')
  
  return {
    name: 'constraint-formatter',
    preprocessor ({ content, file }) {
      try {
        // Log detailed file information
        process.stdout.write(`::debug::Processing file: ${file.src.path}\n`)
        process.stdout.write(`::debug::File basename: ${basename(file.src.path)}\n`)
        process.stdout.write(`::debug::File dirname: ${dirname(file.src.path)}\n`)
        
        // Check for constraints file in various locations
        const isConstraintsFile = 
          basename(file.src.path) === 'constraints.adoc' ||
          file.src.path.includes('/includes/constraints.adoc') ||
          file.src.path.includes('/pages/includes/constraints.adoc')
        
        if (!isConstraintsFile) {
          process.stdout.write(`::debug::Skipping non-constraints file: ${file.src.path}\n`)
          return content
        }
        
        process.stdout.write(`::notice::Found constraints file: ${file.src.path}\n`)
        process.stdout.write(`::debug::Content preview: ${content.substring(0, 200)}...\n`)
        
        // First, protect cross-references
        const protectedContent = content.replace(/<<(.*?)>>/g, 'PROTECTED_REF_$1_PROTECTED')
        
        // Handle the formatting
        let formattedContent = protectedContent
        
        // Define patterns to handle
        const patterns = [
          { name: 'pass:q underline', pattern: /pass:q\[\[underline\]#(.*?)#\]\]/g },
          { name: 'span underline', pattern: /<span class="underline">(.*?)<\/span>/g },
          { name: 'em tags', pattern: /<em>(.*?)<\/em>/g },
          { name: 'asciidoc underline', pattern: /\[underline\]#(.*?)#/g },
          { name: 'asciidoc underline class', pattern: /\[.underline\]#(.*?)#/g }
        ]
        
        // Apply patterns and log changes
        patterns.forEach(({ name, pattern }) => {
          const matches = formattedContent.match(pattern)
          if (matches) {
            process.stdout.write(`::notice::Found ${matches.length} matches of ${name} pattern\n`)
            matches.forEach((match, i) => {
              process.stdout.write(`::debug::Match ${i + 1}: ${match}\n`)
            })
          }
          
          const before = formattedContent
          formattedContent = formattedContent.replace(pattern, '$1')
          if (before !== formattedContent) {
            process.stdout.write(`::notice::Applied ${name} pattern\n`)
            // Log a sample of the change
            const diff = before.substring(0, 100) + '... -> ' + formattedContent.substring(0, 100) + '...'
            process.stdout.write(`::debug::Change sample: ${diff}\n`)
          }
        })
        
        // Remove any remaining HTML tags while preserving their content
        formattedContent = formattedContent.replace(/<[^>]+>/g, '')
        
        // Restore cross-references
        const result = formattedContent.replace(/PROTECTED_REF_(.*?)_PROTECTED/g, '<<$1>>')
        
        // Log final result
        if (result !== content) {
          process.stdout.write(`::notice::Successfully modified constraints file\n`)
          process.stdout.write(`::debug::Original length: ${content.length}, Modified length: ${result.length}\n`)
          process.stdout.write(`::debug::First 200 chars of result: ${result.substring(0, 200)}...\n`)
        } else {
          process.stdout.write(`::debug::No changes needed in constraints file\n`)
        }
        
        return result
      } catch (error) {
        process.stdout.write(`::error::Error processing constraints file: ${error.message}\n`)
        process.stdout.write(`::error::Stack trace: ${error.stack}\n`)
        return content
      }
    }
  }
} 