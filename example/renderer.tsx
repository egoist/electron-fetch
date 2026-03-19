import { createRoot } from "react-dom/client"
import { fetch } from "../src/renderer"

createRoot(document.getElementById("root")!).render(<App />)

function App() {
  let abortController = new AbortController()

  async function handleStream() {
    const output = document.getElementById("output")!
    output.textContent = ""
    abortController = new AbortController()

    try {
      const response = await fetch("http://localhost:3333/sse", {
        signal: abortController.signal,
      })
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        output.textContent += decoder.decode(value, { stream: true })
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        output.textContent += "\n[Aborted]"
      } else {
        output.textContent += `\n[Error: ${e}]`
      }
    }
  }

  async function handleText() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const response = await fetch("http://localhost:3333/plaintext", {
        method: "POST",
        body: "Hello, this is plain text!",
      })
      const text = await response.text()
      output.textContent = text
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  async function handleJson() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const response = await fetch("http://localhost:3333/json", {
        method: "POST",
        body: JSON.stringify({ message: "Hello, JSON!", data: [1, 2, 3] }),
      })
      const json = await response.json()
      output.textContent = JSON.stringify(json, null, 2)
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  async function handleBlob() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])
      const response = await fetch("http://localhost:3333/binary", {
        method: "POST",
        body: data,
      })
      const blob = await response.blob()
      output.textContent = `Blob size: ${blob.size} bytes, type: ${blob.type}`
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  async function handleArrayBuffer() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])

      const response = await fetch("http://localhost:3333/binary", {
        method: "POST",
        body: data,
      })

      const buffer = await response.arrayBuffer()
      output.textContent = `ArrayBuffer size: ${buffer.byteLength} bytes`
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  async function handleFormData() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const form = new FormData()
      form.append("field1", "value1")
      form.append("field2", "value2")
      const response = await fetch("http://localhost:3333/formdata", {
        method: "POST",
        body: form,
      })
      const text = await response.text()
      output.textContent = text
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  async function handleUrlSearchParams() {
    const output = document.getElementById("output")!
    output.textContent = "Loading..."

    try {
      const params = new URLSearchParams({ foo: "bar", baz: "qux" })
      const response = await fetch("http://localhost:3333/urlsearchparams", {
        method: "POST",
        body: params,
      })
      const text = await response.text()
      output.textContent = text
    } catch (e) {
      output.textContent = `Error: ${e}`
    }
  }

  function handleAbort() {
    abortController.abort()
  }

  return (
    <div>
      <h1>Body Format Tests</h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button onClick={handleStream}>Stream (SSE)</button>
        <button onClick={handleText}>Text</button>
        <button onClick={handleJson}>JSON</button>
        <button onClick={handleBlob}>Blob</button>
        <button onClick={handleArrayBuffer}>ArrayBuffer</button>
        <button onClick={handleFormData}>FormData</button>
        <button onClick={handleUrlSearchParams}>URLSearchParams</button>
        <button onClick={handleAbort}>Abort</button>
      </div>
      <pre id="output" />
    </div>
  )
}
