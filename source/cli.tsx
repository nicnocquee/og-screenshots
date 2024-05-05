#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'
import fs from 'fs'

const cli = meow(
  `
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
`,
  {
    importMeta: import.meta,
    flags: {
      url: { type: 'string', shortFlag: 'u', isRequired: true },
      transformOrigin: { type: 'boolean', shortFlag: 't', default: true },
      timeout: { type: 'number', shortFlag: 'T', default: 180000 },
      extension: { type: 'string', shortFlag: 'e', default: 'webp' },
      concurrency: { type: 'number', shortFlag: 'c', default: 3 },
      quality: { type: 'number', shortFlag: 'q', default: 100 },
      maxScreenshots: { type: 'number', shortFlag: 'm', default: 0 },
      recommendedSize: {
        type: 'string',
        shortFlag: 'r',
        default: JSON.stringify({ width: 1200, height: 630 }),
      },
      outputDir: { type: 'string', shortFlag: 'o', default: './public/screenshots' },
      windowSize: { type: 'string', shortFlag: 'w', default: '1300,1300' },
      chromePath: {
        type: 'string',
        shortFlag: 'p',
        default: `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome`,
      },
    },
  }
)

// check chrome path exists
const chromePath = cli.flags.chromePath
if (!fs.existsSync(chromePath)) {
  console.error(
    `Chrome not found at ${chromePath}. Please download Chrome browser first. Or set the path to the Chrome executable in the CLI options.`
  )
  process.exit(1)
}

const inputURLOrigin = new URL(cli.flags.url).origin
const { recommendedSize, ...rest } = cli.flags

render(
  <App inputURLOrigin={inputURLOrigin} recommendedSize={JSON.parse(recommendedSize)} {...rest} />,
  {
    exitOnCtrlC: true,
  }
)
