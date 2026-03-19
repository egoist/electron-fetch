export async function fetch(url: string | URL, requestInit?: RequestInit) {
  const id = crypto.randomUUID()
  const req = new Request(url, requestInit)

  const { responseInit, streamRef } = await new Promise<{
    responseInit: ResponseInit
    streamRef: ReadableStream | null
  }>(async (resolve) => {
    req.signal?.addEventListener(
      "abort",
      () => {
        __electronFetchInternal.abort(id)
      },
      { once: true },
    )

    const streamRef = new ReadableStream({
      start(controller) {
        let closed = false
        __electronFetchInternal.onStream(id, (message) => {
          if (message.type === "response") {
            resolve({
              responseInit: {
                status: message.status,
                statusText: message.statusText,
                headers: new Headers(message.headers),
              },
              streamRef,
            })
          } else if (message.type === "chunk") {
            controller.enqueue(message.value)
          } else if (message.type === "error") {
            if (!closed) {
              closed = true
              controller.error(
                message.error === "__aborted__"
                  ? new AbortError()
                  : message.error,
              )
            }
          } else if (message.type === "end") {
            if (!closed) {
              closed = true
              controller.close()
            }
          }
        })
      },
      cancel() {
        __electronFetchInternal.abort(id)
      },
    })

    __electronFetchInternal.request({
      id,
      url: req.url,
      init: {
        ...req,
        method: req.method,
        headers: [...req.headers.entries()],
        body: req.body == null ? undefined : await req.arrayBuffer(),
        signal: null,
      },
    })
  })

  return new Response(streamRef, responseInit)
}

class AbortError extends Error {
  constructor() {
    super("aborted")
    this.name = "AbortError"
  }
}
