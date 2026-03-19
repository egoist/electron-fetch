# @egoist/electron-fetch

An anlternative way to get rid of CORS in Electron renderer process by exposing a `fetch` function backed by `electron.net.fetch`

## Install

Install as dev dependency, make sure your bundler would bundle it:

```bash
npm i @egoist/electron-fetch -D
```

## Usage

In Main process:

```ts
import { registerElectronFetchMain } from "@egoist/electron-fetch/main"

registerElectronFetchMain()
```

In preload script:

```ts
import { registerElectronFetchPreload } from "@egoist/electron-fetch/preload"

registerElectronFetchPreload()
```

In renderer process:

```ts
import { fetch } from "@egoist/electron-fetch/renderer"

const response = await fetch("https://example.com")
const text = await response.text()
```
