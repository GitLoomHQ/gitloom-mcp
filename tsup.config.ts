import { defineConfig } from 'tsup'

// The banner is why this file exists rather than a flag in the build script:
// `--banner:js` is esbuild's, not tsup's, and tsup's CLI rejects it outright.
// Without the shebang the bin is not executable, so `npx @gitloomhq/mcp`
// silently does nothing.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
})
