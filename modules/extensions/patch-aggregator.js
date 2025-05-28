// modules/extensions/patch-aggregator.js

module.exports.register = function () {
    this.once('contextStarted', () => {
      // Grab the low-level aggregateAsciiDoc step
      const { aggregateAsciiDoc: originalAggregate } = this.getFunctions();
  
      // Replace it with a version that coalesces undefined IDs
      this.replaceFunctions({
        async aggregateAsciiDoc(pages, navigation, siteAsciiDocConfig) {
          pages.forEach((entry) => {
            // Ensure entry.id is always a string
            entry.id = entry.id ?? '';
          });
          // Delegate back to the original implementation
          return originalAggregate.call(this, pages, navigation, siteAsciiDocConfig);
        },
      });
    });
  };
  