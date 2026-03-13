---
"pnpm": patch
---

Upgrade bundled `node-gyp` from `^11.5.0` to `^12.2.0` to fix multiple security vulnerabilities in transitive dependencies bundled into `dist/node_modules`. Add `pnpm.overrides` in `pnpm/package.json` to enforce minimum secure versions of transitive dependencies (tar, tough-cookie, minimist, y18n, json-schema) for the `pnpm deploy` step that creates the bundled distribution.
