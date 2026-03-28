export const APIFY_ACTORS = {
  webScraper: "apify/web-scraper",
  cheerioScraper: "apify/cheerio-scraper",
  puppeteerScraper: "apify/puppeteer-scraper",
} as const;

export function buildAdvisoryScrapingInput(url: string) {
  return {
    startUrls: [{ url }],
    maxCrawlPages: 10,
    maxConcurrency: 5,
  };
}

export function buildChangelogInput(packageName: string) {
  return {
    startUrls: [
      { url: `https://github.com/search?q=${packageName}+changelog&type=repositories` },
      { url: `https://www.npmjs.com/package/${packageName}` },
    ],
    maxCrawlPages: 5,
  };
}
