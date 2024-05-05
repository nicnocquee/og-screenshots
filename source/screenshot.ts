/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from 'fs'
import { exec } from 'child_process'
import Parser from 'rss-parser'
import util from 'util'
import pMap from 'p-map'
import Sitemapper from 'sitemapper'

// @ts-expect-error
const sitemapper = new Sitemapper({ timeout: 5000 })
const parser: Parser = new Parser()
const asyncExec = util.promisify(exec)

const replaceDomain = (url: string, newBase: string) => {
  const oldUrl = new URL(url)
  const newUrl = new URL(oldUrl.pathname + oldUrl.search, newBase)
  return newUrl
}

export async function takeScreenshots(
  {
    urls,
    outputDir,
    chromePath,
    extension,
    timeout,
    concurrency,
    recommendedSize,
    quality,
    transformOrigin,
    inputURLOrigin,
    windowSize,
  }: {
    urls: string[]
    outputDir: string
    chromePath: string
    extension: string
    timeout: number
    concurrency: number
    recommendedSize: any
    quality: number
    transformOrigin: boolean
    inputURLOrigin: string
    windowSize: string
  },
  onStart?: (url: string, outputPath: string, transformedUrl?: string) => void,
  onSuccess?: (url: string, outputPath: string, transformedUrl?: string) => void,
  onError?: (url: string, error: Error, transformedUrl?: string) => void,
  onFinishAll?: (results: (string | null)[]) => void,
  abortController?: AbortController
) {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true })

    const mapper = async (url: string) => {
      const theUrl = transformOrigin ? replaceDomain(url, inputURLOrigin) : new URL(url)
      try {
        const pathname = theUrl.pathname
        const paths = pathname.split('/')
        paths.pop()
        const theOutputDir = `${outputDir}${paths.join('/')}`
        await fs.mkdir(theOutputDir, { recursive: true })
        const outputPath = `${outputDir}${pathname}.${extension}`

        onStart?.(url, outputPath, transformOrigin ? theUrl.toString() : undefined)

        const command = `${chromePath} --headless=new --force-device-scale-factor=1 --screenshot="${outputPath}" --window-size=${windowSize} "${theUrl.toString()}"`
        // // console.log(`Started screenshot for: ${theUrl.toString()}`)
        await asyncExec(command)

        const imageCommand = `convert ${outputPath} -gravity North -crop ${recommendedSize.width}x${recommendedSize.height}+0+0 +repage -quality ${quality} ${outputPath}`

        // await new Promise((resolve) => setTimeout(resolve, 2000))
        await asyncExec(imageCommand)

        onSuccess?.(url, outputPath, transformOrigin ? theUrl.toString() : undefined)

        return outputPath
      } catch (error) {
        onError?.(url, error as Error, transformOrigin ? theUrl.toString() : undefined)
      }
      return null
    }

    const results = await pMap(urls, mapper, {
      concurrency,
      // @ts-expect-error
      signal: AbortSignal.any([abortController?.signal, AbortSignal.timeout(timeout)]),
    })
    onFinishAll?.(results)
  } catch (error) {}
}

export async function findUrls(inputURL: string) {
  const pathsTouse: string[] = []

  try {
    const feed = await parser.parseURL(inputURL)

    feed.items.forEach((item) => {
      if (item.link) {
        const url = new URL(item.link)
        const newOrigin = new URL(inputURL)
        const modifiedUrl = new URL(url.pathname + url.search + url.hash, newOrigin)
        pathsTouse.push(modifiedUrl.toString())
      }
    })
  } catch (error) {}

  try {
    const result = await sitemapper.fetch(inputURL)
    if (result.sites && result.sites.length > 0) {
      pathsTouse.push(...result.sites)
    }
  } catch (error) {}

  let baseUrl: string = ''
  if (pathsTouse.length === 0) {
    try {
      const theURL = new URL(inputURL)
      baseUrl = theURL.origin
    } catch (error) {
      console.error('Invalid URL')
      process.exit(1)
    }
  }

  pathsTouse.push(inputURL)
  if (baseUrl !== '' && baseUrl !== inputURL) {
    pathsTouse.push(baseUrl)
  }

  // remove duplicates
  return [...new Set(pathsTouse)]
}
