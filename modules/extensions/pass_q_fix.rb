# extensions/pass_q_fix.rb
require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  preprocessor do
    process do |document, reader|
      new_lines = reader.lines.map do |line|
        line.gsub(
          # 1: capture attribute name (aasd002, aasd005, etc.)
          # 2: capture everything between the #…# delimiters
          # 3: capture any trailing text (e.g. a period) after ]]
          /^:(aasd\d+):\s*pass:q\[\[underline\]#(.*?)#\]\](.*)$/,
          # rewrite as :aasdXXX: [role="underline"]#…# plus the trailing text
          ':\1: [role="underline"]#\2#\3'
        )
      end
      reader.restore new_lines
      reader
    end
  end
end
