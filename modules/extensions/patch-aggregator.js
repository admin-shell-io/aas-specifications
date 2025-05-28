// modules/extensions/patch-aggregator.js

/**
 * Antora extension to guard against undefined page IDs
 * during aggregation by slugifying only string IDs.
 */
module.exports.register = function registerPatchAggregator() {
    // Listen once the generator context is ready
    this.once('contextStarted', () => {
      // Capture the original aggregation function
      const { produceAggregateDocument: originalProduce } = this.getFunctions();
  
      // Replace it with a version that defaults missing IDs to ''
      this.replaceFunctions({
        /**
         * Guarded produceAggregateDocument:
         * Ensures page.src.id is always a string before calling replace().
         */
        async produceAggregateDocument(playbook, siteCatalog) {
          siteCatalog.findPages().forEach((page) => {
            // Default undefined or null IDs to an empty string
            page.src.id = page.src.id ?? '';
          });
          // Delegate back to the original implementation
          return originalProduce.call(this, playbook, siteCatalog);
        },
      });
    });
  };
  