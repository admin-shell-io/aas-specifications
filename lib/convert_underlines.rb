# lib/convert_underlines.rb
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'

# register the preprocessor
Asciidoctor::Extensions.register do
  preprocessor ConvertUnderlinePreprocessor
end

class ConvertUnderlinePreprocessor < Asciidoctor::Extensions::Preprocessor
  def process(document, reader)
    # pull in every line, transform it, then reset the reader
    new_lines = reader.read_lines.map do |line|
      # 1) convert HTML spans and <u> tags to the constraint role
      line = line
        .gsub(%r{<span class="underline">(.*?)</span>}, '[.constraint]#\1#')
        .gsub(%r{<u>(.*?)</u>},                   '[.constraint]#\1#')
      # 2) if it now starts with [.constraint]#Constraint AASd-XXX:, inject an anchor
      if line =~ /\[\.constraint\]#(Constraint\s+AASd-\d+):/
        id = $1.
          downcase.
          gsub(/[^a-z0-9]+/, '-').         # e.g. "constraint-aasd-130-"
          sub(/-$/, '')                    # drop trailing dash
        line = "[[#{id}]]\n" + line
      end
      line
    end
    # reset the reader so parsing continues with our patched lines
    reader.reset new_lines
    reader
  end
end
