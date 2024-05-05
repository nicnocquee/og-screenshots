import React, { useEffect } from 'react'
import { Box, Text } from 'ink'
import { findUrls, takeScreenshots } from './screenshot.js'
import Spinner from 'ink-spinner'

type Props = {
  url: string
  outputDir: string
  chromePath: string
  imageMagickPath: string
  extension: string
  timeout: number
  concurrency: number
  recommendedSize: { width: number; height: number }
  quality: number
  transformOrigin: boolean
  inputURLOrigin: string
  windowSize: string
  maxScreenshots: number
  overwrite: boolean
}

const abortController = new AbortController()

process.on('SIGINT', () => {
  abortController.abort()
})

process.on('SIGTERM', () => {
  abortController.abort()
})

process.on('SIGHUP', () => {
  abortController.abort()
})

export default function App({ url, ...rest }: Props) {
  const [urls, setUrls] = React.useState<string[]>([])
  const [startedWorks, setStartedWorks] = React.useState<string[][]>([])
  const [finisedWorks, setFinisedWorks] = React.useState<string[]>([])
  const [errorWorks, setErrorWorks] = React.useState<string[]>([])
  const [skippedWorks, setSkippedWorks] = React.useState<string[]>([])
  const [allFinished, setAllFinished] = React.useState<(string | null)[]>([])

  useEffect(() => {
    ;(async () => {
      const theUrls = await findUrls(url)
      setUrls(rest.maxScreenshots > 0 ? theUrls.filter((_, i) => i < rest.maxScreenshots) : theUrls)
    })()
  }, [url])

  useEffect(() => {
    ;(async () => {
      if (urls.length > 0) {
        await takeScreenshots(
          {
            urls,
            ...rest,
          },
          (url, outputPath, transformedUrl) => {
            setStartedWorks((prev) => [...prev, [transformedUrl || url, outputPath]])
          },
          (url, _outputPath, transformedUrl) => {
            setFinisedWorks((prev) => [...prev, transformedUrl || url])
          },
          (url, _error, transformedUrl) => {
            setErrorWorks((prev) => [...prev, transformedUrl || url])
          },
          (url, _outputPath, transformedUrl) => {
            setSkippedWorks((prev) => [...prev, transformedUrl || url])
          },
          (results) => {
            setAllFinished(results)
            // sometimes the process is not exited
            setTimeout(() => {
              process.exit(0)
            }, 2000)
          },
          abortController
        )
      }
    })()
  }, [urls])

  return (
    <>
      {urls.length > 0 && <Text>Processing {urls.length} URLs</Text>}
      {startedWorks.map(([url, outputPath]) => {
        const isFinished = finisedWorks.includes(url!)
        const isSkipped = skippedWorks.includes(url!)
        const isError = errorWorks.includes(url!)
        const isProcessing = !isFinished && !isError && !isSkipped
        return (
          <Box key={url} gap={1}>
            {isProcessing && <Spinner type="dots" />}
            <Text color={isFinished ? 'green' : isError ? 'red' : isSkipped ? 'yellow' : 'gray'}>
              {url} {'->'} {outputPath}
            </Text>
          </Box>
        )
      })}
      {allFinished && allFinished.length > 0 && (
        <Text>
          ✨ Finished processing {allFinished.length} URLs.
          {skippedWorks.length > 0 &&
            ' Skipped ' +
              skippedWorks.length +
              ' URLs because they already exist. Run the command with the --overwrite option to overwrite them.'}
        </Text>
      )}
    </>
  )
}
