import { loadPyodide } from 'pyodide'

const pyodideVersion = '0.28.3'
const rdflibVersion = '7.2.1'

const pythonCode = `
import rdflib
from rdflib import Graph

print(f"RDFLib version: {rdflib.__version__}")

def prettify(data: str):
    graph = Graph()
    graph.parse(data=data, format="turtle")
    return graph.serialize(format="longturtle", canon=True)
`

const pyodideReady = (async () => {
  const py = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
  })
  await py.loadPackage('micropip')
  const micropip = py.pyimport('micropip')
  await micropip.install(`rdflib==${rdflibVersion}`)
  py.runPython(pythonCode)
  return py
})()

self.onmessage = async (event) => {
  const { id, data } = event.data
  try {
    const py = await pyodideReady
    const prettify = py.globals.get('prettify')
    console.log('Prettifying...')

    const start = performance.now()
    const result = prettify(data)
    const end = performance.now()

    const durationSeconds = (end - start) / 1000
    console.log(`Done prettifying! Took ${durationSeconds.toFixed(3)} seconds.`)

    self.postMessage({ id, ok: true, data: result, duration: durationSeconds })
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err) })
  }
}
