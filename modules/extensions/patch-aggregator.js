// modules/extensions/patch-aggregator.js

/**
 * Antora extension to guard against undefined page IDs
 * at the slugification step in produceAggregateDocument.
 */
module.exports.register = function registerPatchAggregator() {
    this.once('contextStarted', () => {
      // 1. Grab the original function
      const {
        produceAggregateDocument: originalProduce
      } = this.getFunctions();
  
      // 2. Replace it with a wrapper
      this.replaceFunctions({
        /**
         * @param {Object} playbook
         * @param {Object} contentAggregate - result of aggregateContent()
         * @param {Object} siteAsciiDocConfig
         */
        async produceAggregateDocument(playbook, contentAggregate, siteAsciiDocConfig) {
          // 3. Sanitize every entry.id before slugify
          // The pages are grouped by component: pagesByComponent is a Map<string, Page[]>
          contentAggregate.pagesByComponent.forEach((pages) => {
            pages.forEach((entry) => {
              // Coalesce undefined or null to empty string
              entry.id = entry.id ?? '';
            });
          });
          // 4. Delegate to original implementation
          return originalProduce.call(
            this,
            playbook,
            contentAggregate,
            siteAsciiDocConfig
          );
        },
      });
    });
  };
  