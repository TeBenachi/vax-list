// This file is to fetch data from 厚生労働省 using the command node index.js 
// 愛知県西尾市接種会場 厚生労働省 https://v-sys.mhlw.go.jp/search/list.html?id=232131&keyword=&vaccineMaker=pf&page=1
// 利用規約 https://v-sys.mhlw.go.jp/terms.html

const puppeteer = require("puppeteer");

(async () => {

  const extractPartners = async url => {

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

        await page.goto(url);
        await page.waitForSelector( '.m-searchlist-item' );

        const partnersOnPage = await page.evaluate(() =>
          Array.from(document.querySelectorAll(".m-searchlist-item")).map(compact => ({
            title:   compact.querySelector("h3").innerText.trim(),
            address: compact.querySelector(".m-searchlist-item__address").innerText.trim(),
            //phone:   compact.querySelector(".m-searchlist-item__body__inner").innerText.trim(),
            maker:   compact.querySelector(".m-searchlist-item__data__maker").innerText.trim(),
            status:  compact.querySelector("p.mb-0 img.m-text-5xl").src
          }))
        );
        await page.close();

        // Recursively scrape the next page
        if (partnersOnPage.length < 1) {
          // Terminate if no partners exist
          return partnersOnPage
        } else {
          // Go fetch the next page ?page=X+1
          const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
          const nextUrl = `https://v-sys.mhlw.go.jp/search/list.html?id=232131&keyword=&vaccineMaker=pf&page=${nextPageNumber}`;
          console.log(nextPageNumber);
          return partnersOnPage.concat(await extractPartners(nextUrl))
        }
    } catch(e) {
      console.log('my error', e);
    }

  };

  const browser = await puppeteer.launch();
  const firstUrl =
    "https://v-sys.mhlw.go.jp/search/list.html?id=232131&keyword=&vaccineMaker=pf&page=1";
  const partners = await extractPartners(firstUrl);

  // Todo: Update database with partners
  console.log(partners);

  const fs = require('fs');
  fs.writeFile('./partners.json', JSON.stringify(partners), err => err ? console.log(err): null);
  
  await browser.close();

})();
