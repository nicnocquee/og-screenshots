# og-screenshots [BETA]

A CLI to take screenshots of websites and generate [open graph images](https://ogp.me) from your own computer. Having a website with a screenshot as an open graph image is a great way to promote your website and attract more visitors.

## Why?

- Existing solutions are expensive and subscription based. You usually only need to take the screenshots once. You don't have to pay for a monthly subscription.
- Running your own open graph image generator in the cloud is also expensive. If you use a serverless platform, you'll have to pay for the computing power. If you use a self-hosted server, you'll have to pay for storage and bandwidth.

## Features

- Screenshot a single URL
- Capture screenshots of multiple URLs from a sitemap or RSS feed

## Requirements

- [Chrome browser](https://www.google.com/chrome/)
- [ImageMagick (convert)](https://formulae.brew.sh/formula/imagemagick)
- [Node.js 16+](https://nodejs.org/en/)

**Note that I only tested this on macOS.**

## Install

```bash
npm i -g og-screenshots
```

Or you can also directly execute the command:

```shell
npx og-screenshots --url "https://example.com"
```

## CLI

```
  Usage
    $ og-screenshots [input]

  Options
    --url, -u <type> Input URL (required). Can be a sitemap, RSS feed or a single URL. When using a sitemap or RSS feed, this command will automatically detect the URLs in the feed or sitemap and process them.
    --transform, -t Transform origin [Default: false]
    --timeout, -T <type> Timeout in milliseconds [Default: 60000]
    --extension, -e <type> File extension [Default: webp]
    --concurrency, -c <type> Concurrency level [Default: 3]
    --quality, -q <type> Image quality [Default: 100]
    --max-screenshots, -m <type> Maximum number of screenshots [Default: 0]
    --recommended-size, -r <type> Recommended image size [Default: {"width":1200,"height":630}]
    --output-dir, -o <type> Output directory [Default: ./public/screenshots]
    --window-size, -w <type> Browser window size [Default: 1300,1300]
    --chrome-path <type> Path to Chrome [Default: detected Chrome path]
    --imagemagick-path <type> Path to ImageMagick [Default: detected ImageMagick path]
    --overwrite Overwrite existing files [Default: false]. By default, the command will not take screenshots if the output file already exists.


  Examples
    $ og-screenshots --url "http://example.com"
```

## Development

Run

```bash
npx tsx source/cli.tsx --url "https://example.com"
```

## Known issues

- Sometimes the process hangs. You can try to kill the process manually.

## License

Affero General Public License v3.0
