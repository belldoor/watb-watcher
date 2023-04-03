# watb-watcher

[WATB Naver cafe](https://cafe.naver.com/chelseasupporters) crawler for search using abuse keyword in article

## Install

```sh
➜  watb-watcher git:(main) ✗ npm install
```

## How to run

### Set .env

```sh
➜  watb-watcher git:(main) ✗ cp .env.sample .env
```

And set `.env` file for upload result to [Google Spread Sheet](https://docs.google.com/spreadsheets)

### Google Service Account Key File

[Google Service Account key file](https://console.cloud.google.com/iam-admin/serviceaccounts) for Google Sheet API requests is located in the top-level path.

### Run Chrome with debugging port for Puppeteer detached mode

```sh
➜  watb-watcher git:(main) ✗ sudo /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

DevTools listening on ws://127.0.0.1:9222/devtools/browser/b7279b33-2013-4b65-9792-62a89f8d6bdf
...
```

### Log in with NAVER WATB cafe staff privilege account

After accessing Naver with a browser, log in in advance with an account that has a WATB staff account.

### Run crawler script

```sh
➜  watb-watcher git:(main) ✗ npm run start

> watb-watcher@1.0.0 start
> node src/index.js

# Checking [ (1/5) page of (1/50) article ] in progres..
# Checking [ (1/5) page of (2/50) article ] in progres..
# Checking [ (1/5) page of (3/50) article ] in progres..
# Checking [ (1/5) page of (4/50) article ] in progres..
# Checking [ (1/5) page of (5/50) article ] in progres..
...
{
        "type": "comment",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=5&userDisplay=50&boardtype=L&articleid=345030&referrerAllArticles=true",
        "nickname": "AJR",
        "text": "아아.. 포복절... 드디어...",
        "keyword": "포복절"
    },
    {
        "type": "comment",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=5&userDisplay=50&boardtype=L&articleid=345030&referrerAllArticles=true",
        "nickname": "메이슨캉테",
        "text": "포경완료~~~ 아 물론 포터경질이요~~",
        "keyword": "포경"
    },
    {
        "type": "comment",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=5&userDisplay=50&boardtype=L&articleid=345030&referrerAllArticles=true",
        "nickname": "사리생김",
        "text": "포복절 그 날이 오면",
        "keyword": "포복절"
    },
    {
        "type": "comment",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=5&userDisplay=50&boardtype=L&articleid=345024&referrerAllArticles=true",
        "nickname": "릴러말즈",
        "text": "이미 대망한 시즌 하루빨리 재앙같은 감독 경질되길",
        "keyword": "재앙"
    },
    {
        "type": "comment",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=5&userDisplay=50&boardtype=L&articleid=345012&referrerAllArticles=true",
        "nickname": "링크",
        "text": "진짜 축구를 아예 안봐왔던 걸까요 어떻게 이렇게 생각이 없는지 재앙그자체인데 경기들이 ㅠ",
        "keyword": "재앙"
    }
]
```

### Check your google sheet

OR check `result/*` path for results
