import React, { useEffect } from 'react'
import { Text } from 'ink'
import { findUrls, takeScreenshots } from './screenshot.js'

type Props = {
  url: string
  outputDir: string
  chromePath: string
  extension: string
  timeout: number
  concurrency: number
  recommendedSize: { width: number; height: number }
  quality: number
  transformOrigin: boolean
  inputURLOrigin: string
  windowSize: string
  maxScreenshots: number
}

const abortController = new AbortController()

process.on('SIGINT', () => {
  abortController.abort()
})

export default function App({ url, ...rest }: Props) {
  const [urls, setUrls] = React.useState<string[]>([])
  const [startedWorks, setStartedWorks] = React.useState<string[][]>([])
  const [finisedWorks, setFinisedWorks] = React.useState<string[]>([])
  const [errorWorks, setErrorWorks] = React.useState<string[]>([])
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
          (results) => {
            setAllFinished(results)
          },
          abortController
        )
      }
    })()
  }, [urls])

  return (
    <>
      <Text>Processing {urls.length} URLs</Text>
      {startedWorks.map(([url, outputPath]) => (
        <Text
          key={url}
          color={finisedWorks.includes(url!) ? 'green' : errorWorks.includes(url!) ? 'red' : 'gray'}
        >
          {url} {'->'} {outputPath}
        </Text>
      ))}
      {allFinished && allFinished.length > 0 && (
        <Text>✨ Finished processing {allFinished.length} URLs</Text>
      )}
    </>
  )
}
