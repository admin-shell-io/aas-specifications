// modules/extensions/patch-aggregator.js

module.exports.register = function () {
    this.once('contextStarted', () => {
      // Grab the low-level aggregateAsciiDoc step
      const { produceAggregateDocument: originalProduce } = this.getFunctions();
this.replaceFunctions({
  async produceAggregateDocument(playbook, contentAggregate, siteAsciiDocConfig) {
    // coalesce undefined src.id here on the aggregated pages list:
    contentAggregate.pagesByComponent.forEach((pages, component) => {
      pages.forEach(page => {
        page.src.id = page.src.id ?? '';
      });
    });
    return originalProduce.call(this, playbook, contentAggregate, siteAsciiDocConfig);
  }
});
    });
  };
  