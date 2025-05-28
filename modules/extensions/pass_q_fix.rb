# extensions/pass_q_fix.rb
require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  preprocessor do
    process do |_doc, reader|
      lines = reader.readlines.map do |line|
        line
          # convert any raw HTML spans to Asciidoctor underline role
          .gsub(/<span class="underline">([^<]*)<\/span>/, '[role="underline"]#\1#')
          # convert pass:q[[underline]#…#]] to the same
          .gsub(/pass:q\[\[underline\]#([^#]+)#\]\]/, '[role="underline"]#\1#')
      end
      reader.restore(lines)
      reader
    end
  end
end
