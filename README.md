# watb-watcher

[WATB Naver cafe](https://cafe.naver.com/chelseasupporters) crawler for search using abuse keyword in article

## Install

```sh
~/workspace/watb-watcher
> npm install
```

## How to run

### Set .env

```sh
~/workspace/watb-watcher
> mv .env.sample .env
```

And set `.env` file for upload result to Google Spread Sheet

### Run Chrome with debugging port for Puppeteer detached mode

```sh
~/workspace/watb-watcher
> sudo /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

DevTools listening on ws://127.0.0.1:9222/devtools/browser/b7279b33-2013-4b65-9792-62a89f8d6bdf
...
```

### Log in with NAVER WATB cafe staff privilege account

After accessing Naver with a browser, log in in advance with an account that has a WATB staff account.

### Run crawler script

```sh
~/workspace/watb-watcher
> npm run start
[
    {
        "type": "article",
        "link": "https://cafe.naver.com/ArticleRead.nhn?clubid=15448608&page=1&userDisplay=50&boardtype=L&articleid=345192&referrerAllArticles=true",
        "nickname": "Vic721",
        "text": "사우스햄튼전 패배에도 불구, 보드진은 포재앙에게 발전하는 모습을 요구했고, 여전히 그를 지지하는 태도를 보였다. 하지만 결과적으로 보드진이 그를 지지할 수 없고, 더이상 감독직을 유지할 수 없게 만든 것은 다름 아닌 포터 본인의 결정들이었다."
    },
    ...
```

### Check your google sheet

OR check `result` path for results
