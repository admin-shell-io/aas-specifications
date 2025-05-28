# underline_passthrough.rb
require 'asciidoctor'
require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  preprocessor do
    process do |document, reader|
      # Transform every span. Adjust the regex if your spans span multiple lines.
      new_lines = reader.lines.map do |line|
        line.gsub(/<span class="underline">(.+?)<\/span>/) do
          content = Regexp.last_match(1)
          # Wrap in triple-plus passthrough to inhibit all substitutions
          "pass:[+++<span class=\"underline\">#{content}</span>+++]"
        end
      end
      Asciidoctor::Reader.new(new_lines, document)
    end
  end
end
