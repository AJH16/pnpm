---
"pnpm": patch
---

Upgrade bundled `node-gyp` from `^11.5.0` to `^12.2.0` to fix multiple security vulnerabilities in transitive dependencies bundled into `dist/node_modules`. Add security overrides in `pnpm-workspace.yaml` to enforce minimum secure versions of transitive dependencies (tar >=7.5.11, tough-cookie >=4.1.3, minimist >=1.2.6, y18n >=5.0.8, json-schema >=0.4.0) for the `pnpm deploy` step that creates the bundled distribution.
