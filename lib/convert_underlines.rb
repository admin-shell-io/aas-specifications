require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  treeprocessor do
    process do |doc|
      doc.find_by(context: :inline).each do |node|
        next unless node.text?
        text = node.text
        # Replace <u>...</u> with [.underline]#...#
        if text.include?('<u>')
          new_text = text.gsub(/<u>(.*?)<\/u>/, '[.underline]#\1#')
          node.replace Asciidoctor::Inline.new(doc, :quoted, new_text, type: :unquoted)
        end
      end
      doc
    end
  end
end 