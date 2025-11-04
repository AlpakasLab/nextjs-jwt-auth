import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ['index.ts', 'src/session.ts'],
    format: ['esm', 'cjs'],
    exports: true
})
