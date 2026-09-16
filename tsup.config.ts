import { readFileSync } from 'node:fs'

import { defineConfig } from 'tsup'

const { version } = JSON.parse(
  readFileSync(new URL('package.json', import.meta.url), 'utf8'),
) as { version: string }

// The banner is why this file exists rather than a flag in the build script:
// `--banner:js` is esbuild's, not tsup's, and tsup's CLI rejects it outright.
// Without the shebang the bin is not executable, so `npx @gitloomhq/mcp`
// silently does nothing.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
  define: { __VERSION__: JSON.stringify(version) },
})
