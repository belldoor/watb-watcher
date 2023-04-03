const puppeteer = require('puppeteer');
const fs = require('fs');
const dayjs = require('dayjs');
const _ = require('lodash');
const { google } = require('googleapis');
require("dotenv").config();

const googleKeyPath = 'watb-secret.json';
if (!fs.existsSync(googleKeyPath)) {
  throw new Error('# Google Key File Not Exists!');
}

const spreadSheetId = process.env.GOOGLE_SPREAD_SHEET_ID;
if (_.isNil(spreadSheetId) || spreadSheetId === 'SHEET_ID') {
  throw new Error('# Check Your Google Sheet ID!');
}

const sheetName = dayjs().format('YYYY-MM-DDTHH:mm');

// Check recent 50 articles per page
// So, 2 page = 100 articles
const checkPageRange = 2;

// Keywords
const blackListedKeywords = ["포복절", "포터강점기", "첼복절", "포경", "포터종신", "재앙"];

const result = [];

(async () => {
  const iframeSelector = '#cafe_main';
  const commentSelector = '.CommentItem';
  const browser = await puppeteer.connect({browserURL: 'http://localhost:9222'});
  const page = await browser.newPage();
  await page.setViewport({
    width: 800,
    height: 1300
  })

  const pageRange = _.range(1, checkPageRange + 1);
  for (const pageIdx of pageRange) {
    const listUrl = `https://cafe.naver.com/chelseasupporters?iframe_url=/ArticleList.nhn%3Fsearch.clubid=15448608%26userDisplay=50%26search.boardtype=L%26search.specialmenutype=%26search.totalCount=501%26search.cafeId=15448608%26search.page=${pageIdx}`;

    await page.goto(listUrl);
    await page.waitForSelector(iframeSelector);
    await page.waitForTimeout(500);

    const iframeElement = await page.$(iframeSelector);
    const iframe = await iframeElement.contentFrame();


    const links = await iframe.$$eval('a.article', (elements) => {
      return elements.map((el) => el.href);
    });

    // Except notices
    const filteredLinks = links.filter(d => d.indexOf('specialmenutype') === -1);

    for (const [idx, link] of filteredLinks.entries()) {
      console.info(`# Checking [ (${pageIdx}/${checkPageRange}) page of (${idx + 1}/${filteredLinks.length}) article ] in progres..`)
      await page.goto(link);
      await page.waitForSelector(iframeSelector);
      await page.waitForTimeout(3000);
      const iframeElement = await page.$(iframeSelector);
      const iframe = await iframeElement.contentFrame();
      try {
        // Check article
        await iframe.waitForSelector('.se-text-paragraph');
        const articleList = await iframe.$$('.se-text-paragraph');

        for (const article of articleList) {
          const text = await iframe.evaluate(article => article.textContent.trim(), article);
          const trimmedText = text.replace(/\s/g, '');
          if (blackListedKeywords.some(word => trimmedText.includes(word))) {
            const element = await iframe.$('.nickname');
            const nickname = await iframe.evaluate(element => element.innerText, element);
            result.push({
              type: 'article',
              link,
              nickname,
              text,
            });
            break;
          }
        }

        // Check comments
        await iframe.waitForSelector(commentSelector);
        const commentList = await iframe.$$(commentSelector);
        for (const comment of commentList) {
          const text = await comment.$eval('.text_comment', el => el.textContent.trim());
          const trimmedText = text.replace(/\s/g, '');
          const nickname = await comment.$eval('.comment_nickname', el => el.textContent.trim());

          if (blackListedKeywords.some(word => trimmedText.includes(word))) {
            result.push({
              type: 'comment',
              link,
              nickname,
              text,
            });
          }
        }
      } catch (_e) {
        // Ignore timeout error
      }
    }
  }


  console.info(JSON.stringify(result, null, 4));

  try {
    fs.writeFileSync(`result/${sheetName}.json`, JSON.stringify(result, null, 4));
  } catch (err) {
    console.error(err);
  }

  await page.close();

  const auth = new google.auth.GoogleAuth({
    keyFile: googleKeyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({version: 'v4', auth});

  // Create a new sheet with the specified name
  await sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadSheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: sheetName,
          },
        },
      }],
    },
  });

  // Update the new sheet with data
  await sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadSheetId,
    range: `${sheetName}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['type', 'link', 'nickname', 'text'],
        ...result.map(d => [d.type, d.link, d.nickname, d.text])
      ],
    },
  });

  process.exit(1);
})();