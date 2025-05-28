module.exports = function registerSignatureLine (registry) {
  registry.inlineMacro('signature-line', function () {
    const self = this
    self.process(function (parent, target, attrs) {
      const width = attrs.width || 25
      const spaces = '　'.repeat(width) // Using full-width spaces for better alignment
      return self.createInline(parent, 'quoted', spaces, { role: 'underline' })
    })
  })
} 