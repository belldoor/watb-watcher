const puppeteer = require("puppeteer");
const fs = require("fs");
const dayjs = require("dayjs");
const _ = require("lodash");
const { google } = require("googleapis");
require("dotenv").config();

const googleKeyPath = "watb-secret.json";
if (!fs.existsSync(googleKeyPath)) {
  throw new Error("# Google Key File Not Exists!");
}

const spreadSheetId = process.env.GOOGLE_SPREAD_SHEET_ID;
if (_.isNil(spreadSheetId) || spreadSheetId === "SHEET_ID") {
  throw new Error("# Check Your Google Sheet ID!");
}

// Check recent 50 articles per page
// So, 2 page = 100 articles
const checkPageRange = 2;
// Keywords
const blackListedKeywords = [
  "포복절",
  "포터강점기",
  "첼복절",
  "포경",
  "포터종신",
  "재앙",
];
const sheetName = dayjs().format("YYYY-MM-DDTHH:mm");
const selectors = {
  iframe: "#cafe_main",
  title: ".title_text",
  paragraph: ".se-text-paragraph",
  comment: ".CommentItem",
  nickname: ".nickname",
};

const result = [];

function checkKeyword(text) {
  return blackListedKeywords.find((keyword) => text.includes(keyword));
}

function normalizeText(text) {
  return text.replace(/\s/g, "");
}

(async () => {
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 800,
    height: 1300,
  });

  const pageRange = _.range(1, checkPageRange + 1);
  for (const pageIdx of pageRange) {
    const listUrl = `https://cafe.naver.com/chelseasupporters?iframe_url=/ArticleList.nhn%3Fsearch.clubid=15448608%26userDisplay=50%26search.boardtype=L%26search.specialmenutype=%26search.totalCount=501%26search.cafeId=15448608%26search.page=${pageIdx}`;

    await page.goto(listUrl);
    await page.waitForSelector(selectors.iframe);
    await page.waitForTimeout(300);

    const iframeElement = await page.$(selectors.iframe);
    const iframe = await iframeElement.contentFrame();

    const links = await iframe.$$eval("a.article", (elements) => {
      return elements.map((el) => el.href);
    });

    // Except notices
    const filteredLinks = links.filter(
      (d) => d.indexOf("specialmenutype") === -1
    );

    for (const [idx, link] of filteredLinks.entries()) {
      console.info(
        `# Checking [ (${pageIdx}/${checkPageRange}) page of (${idx + 1}/${
          filteredLinks.length
        }) article ] in progres..`
      );
      await page.goto(link);
      await page.waitForSelector(selectors.iframe);
      await page.waitForTimeout(500);
      const iframeElement = await page.$(selectors.iframe);
      const iframe = await iframeElement.contentFrame();
      try {
        // Check title
        await iframe.waitForSelector(selectors.title);
        const title = await iframe.$(selectors.title);
        const text = await iframe.evaluate(
          (title) => title.textContent.trim(),
          title
        );
        const trimmedText = normalizeText(text);
        const found = checkKeyword(trimmedText);
        if (found) {
          const element = await iframe.$(selectors.nickname);
          const nickname = await iframe.evaluate(
            (element) => element.innerText,
            element
          );
          result.push({
            type: "title",
            link,
            nickname,
            text,
            keyword: found,
          });
        }

        // Check paragraph
        await iframe.waitForSelector(selectors.paragraph);
        const paragraphList = await iframe.$$(selectors.paragraph);

        for (const paragraph of paragraphList) {
          const text = await iframe.evaluate(
            (paragraph) => paragraph.textContent.trim(),
            paragraph
          );
          const trimmedText = normalizeText(text);
          const found = checkKeyword(trimmedText);
          if (found) {
            const element = await iframe.$(selectors.nickname);
            const nickname = await iframe.evaluate(
              (element) => element.innerText,
              element
            );
            result.push({
              type: "paragraph",
              link,
              nickname,
              text,
              keyword: found,
            });
          }
        }

        // Check comments
        await iframe.waitForSelector(selectors.comment);
        const commentList = await iframe.$$(selectors.comment);
        for (const comment of commentList) {
          const text = await comment.$eval(".text_comment", (el) =>
            el.textContent.trim()
          );
          const trimmedText = normalizeText(text);
          const nickname = await comment.$eval(".comment_nickname", (el) =>
            el.textContent.trim()
          );
          const found = checkKeyword(trimmedText);
          if (found) {
            result.push({
              type: "comment",
              link,
              nickname,
              text,
              keyword: found,
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
    fs.writeFileSync(
      `result/${sheetName}.json`,
      JSON.stringify(result, null, 4)
    );
  } catch (err) {
    console.error(err);
  }

  await page.close();

  const auth = new google.auth.GoogleAuth({
    keyFile: googleKeyPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Create a new sheet with the specified name
  await sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadSheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });

  // Update the new sheet with data
  await sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: spreadSheetId,
    range: `${sheetName}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        ["type", "link", "nickname", "text", "keyword"],
        ...result.map((d) => [d.type, d.link, d.nickname, d.text, d.keyword]),
      ],
    },
  });

  process.exit(1);
})();
