const fs = require('fs');
const puppeteer = require('puppeteer');

//Make this run every 24h

function extractItems() {
  const extractedElements = document.querySelectorAll('a.vod-audio');
  const items = [];
  for (let element of extractedElements) {
    const el = {
      title: element.children[0].children[0].children[0].innerText,
      duration: element.children[0].children[0].children[1].innerText,
      id: element.href
        .replace('https://www.rtp.pt/play/p257/', '')
        .replace('/indiegente', '')
    };
    items.push(el);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      await page.waitFor(scrollDelay);
    }
  } catch (e) {}
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto('https://www.rtp.pt/play/p257/indiegente');

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 20);

  let podsData = fs.readFileSync('./indiegente-be/podcasts/pods.json');
  let pods = JSON.parse(podsData);

  // Remove latest 100 elements from pods
  let lastHundred = pods.pods
    .reverse()
    .slice(Math.max([pods.pods.length - 100]));

  let missingPods = [];
  items.forEach(pod => {
    if (!lastHundred.find(p => p.id === pod.id)) {
      // console.log('added', pod);
      missingPods.push(pod);
    }
  });

  pods.pods = [...pods.pods, ...missingPods.reverse()];

  // Save extracted items to a file.
  fs.writeFileSync('./indiegente-be/podcasts/pods.json', JSON.stringify(pods));

  // Close the browser.
  await browser.close();
})();
