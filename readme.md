# og-screenshots BETA

A CLI to take screenshots of websites and generate [open graph images](https://ogp.me) from your own computer. Having a website with a screenshot as an open graph image is a great way to promote your website and attract more visitors.

## Why?

- Existing solutions are expensive and subscription based. You usually only need to take the screenshots once. You don't have to pay for a monthly subscription.
- Running your own open graph image generator in the cloud is also expensive. If you use a serverless platform, you'll have to pay for the computing power. If you use a self-hosted server, you'll have to pay for storage and bandwidth.

## Features

- Screenshot a single URL
- Capture screenshots of multiple URLs from a sitemap or RSS feed

## Requirements

- Chrome browser
- Node.js 16+

## Install

```bash
$ npm install --global og-screenshots
```

## CLI

```
  Usage
    $ og-screenshots [input]

  Options
    --url, -u <type> Input URL (required). Can be a sitemap, RSS feed or a single URL. When using a sitemap or RSS feed, this command will automatically detect the URLs in the feed or sitemap and process them.
    --transform, -t Transform origin [Default: false]
    --timeout, -T <type> Timeout in milliseconds [Default: 180000]
    --extension, -e <type> File extension [Default: webp]
    --concurrency, -c <type> Concurrency level [Default: 3]
    --quality, -q <type> Image quality [Default: 100]
    --max-screenshots, -m <type> Maximum number of screenshots [Default: 0]
    --recommended-size, -r <type> Recommended image size [Default: {"width":1200,"height":630}]
    --output-dir, -o <type> Output directory [Default: ./public/screenshots]
    --window-size, -w <type> Browser window size [Default: 1300,1300]
    --chrome-path, -p <type> Path to Chrome [Default: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome]

  Examples
    $ og-screenshots --url "http://example.com"
```
