#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Default paths for different operating systems
const chromePaths = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
  win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows
  linux: '/usr/bin/google-chrome', // Linux (may need adjustments based on distribution)
} as const

// Get default Chrome path based on the OS
// @ts-expect-error
const defaultChromePath = chromePaths[os.platform()] || chromePaths['linux'] // Default to Linux path if unknown OS

// Default paths for different operating systems
const imageMagickPaths = {
  darwin: '/opt/homebrew/bin/convert', // macOS
  win32: 'C:\\Program Files\\ImageMagick-7.1.0-Q16\\convert.exe', // Windows
  linux: '/usr/bin/convert', // Linux (may need adjustments based on distribution)
} as const

// Get default Chrome path based on the OS
// @ts-expect-error
const defaultImageMagickPath = imageMagickPaths[os.platform()] || imageMagickPaths['linux'] // Default to Linux path if unknown OS

const cli = meow(
  `
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
    --chrome-path <type> Path to Chrome [Default: ${defaultChromePath}]
    --imagemagick-path <type> Path to ImageMagick [Default: ${defaultImageMagickPath}]
    --overwrite Overwrite existing files [Default: false]. By default, the command will not take screenshots if the output file already exists.

  Examples
    $ og-screenshots --url "http://example.com"
`,
  {
    importMeta: import.meta,
    flags: {
      url: { type: 'string', shortFlag: 'u', isRequired: true },
      transformOrigin: { type: 'boolean', shortFlag: 't', default: true },
      timeout: { type: 'number', shortFlag: 'T', default: 60000 },
      extension: { type: 'string', shortFlag: 'e', default: 'webp' },
      concurrency: { type: 'number', shortFlag: 'c', default: 3 },
      quality: { type: 'number', shortFlag: 'q', default: 100 },
      maxScreenshots: { type: 'number', shortFlag: 'm', default: 0 },
      recommendedSize: {
        type: 'string',
        shortFlag: 'r',
        default: JSON.stringify({ width: 1200, height: 630 }),
      },
      overwrite: { type: 'boolean', default: false },
      outputDir: { type: 'string', shortFlag: 'o', default: './public/screenshots' },
      windowSize: { type: 'string', shortFlag: 'w', default: '1300,1300' },
      chromePath: {
        type: 'string',
        default: defaultChromePath,
      },
      imageMagickPath: {
        type: 'string',
        default: defaultImageMagickPath,
      },
    },
  }
)

// check chrome path exists
const chromePathToUse = path.resolve(cli.flags.chromePath)
if (!fs.existsSync(chromePathToUse)) {
  console.error(
    `Chrome not found at ${chromePathToUse}. Please download Chrome browser first https://www.google.com/chrome/. Or set the path to the Chrome executable in the CLI options.`
  )
  process.exit(1)
}

// check chrome path exists
const imageMagickPathToUse = path.resolve(cli.flags.imageMagickPath)
if (!fs.existsSync(imageMagickPathToUse)) {
  console.error(
    `ImageMagick (convert) not found at ${imageMagickPathToUse}. Please install ImageMagick first https://formulae.brew.sh/formula/imagemagick. Or set the path to the ImageMagick executable in the CLI options.`
  )
  process.exit(1)
}

const inputURLOrigin = new URL(cli.flags.url).origin
const { recommendedSize, chromePath, imageMagickPath, ...rest } = cli.flags

render(
  <App
    inputURLOrigin={inputURLOrigin}
    chromePath={chromePathToUse}
    imageMagickPath={imageMagickPathToUse}
    recommendedSize={JSON.parse(recommendedSize)}
    {...rest}
  />,
  {
    exitOnCtrlC: true,
  }
)
