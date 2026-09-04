# Angular compatibility tests

Run `npm run test:compat:all` from the workspace root, or
`npm run test:compat -- 20` for one environment. Each environment's manifest and
lockfile provide an isolated installation of the same library test suite.

Angular 20's framework and compiler remain pinned to **20.0.2**, the minimum
supported version. Its build tool uses 20.3 because the original 20.0.2 Vitest
builder initializes TestBed before Zone's testing polyfills and lacks setup-file
support.

The `zone-vitest` development dependency is an alias for a newer Zone.js package.
Only its Vitest adapter is loaded by `test-setup.ts`; the runtime remains the
`zone.js` version supported by the tested Angular framework. The runner copies
this setup file into the temporary test source tree. No tests are excluded.

Temporary workspaces use canonical paths to avoid Windows short-name aliases
disagreeing with Vite's module resolution.
