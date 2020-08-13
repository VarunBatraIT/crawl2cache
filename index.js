const Apify = require('apify')

const domain = process.env.DOMAIN || 'https://webapplicationconsultant.com'

Apify.main(async () => {
  const requestQueue = await Apify.openRequestQueue();
  await requestQueue.addRequest({ url: domain + '/sitemap.xml' });
  const pseudoUrlsSitemap = [
    new Apify.PseudoUrl(domain + '/sitemap[.*].xml'),
  ];
  const pseudoUrlsLinks = [
    new Apify.PseudoUrl(domain + '/[.*]\/'),
  ];
  const crawler = new Apify.PuppeteerCrawler({
    requestQueue,
    launchPuppeteerOptions: {
      headless: true,
      stealth: true,
      useChrome: true,
      defaultViewport:{"width":1920,"height":2160},
      args: [
        '--start-maximized',
      ]
    },
    handlePageFunction: async ({ request, page }) => {
      const title = await page.title();
      console.log(`Title of ${request.url}: ${title}`);
      if(request.url.endsWith(".xml")){
        await Apify.utils.enqueueLinks({
          page,
          selector: 'a',
          pseudoUrls: pseudoUrlsSitemap.concat(pseudoUrlsLinks),
          requestQueue,
        });
      }else{
        await page.waitFor(2000)
        await Apify.utils.enqueueLinks({
          page,
          selector: 'a',
          pseudoUrls: pseudoUrlsLinks,
          requestQueue,
        });
      }
    },
    maxRequestsPerCrawl: 1000,
    maxConcurrency: 1,
  });

  await crawler.run();
});


