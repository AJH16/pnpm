---
"@pnpm/cafs-types": patch
"@pnpm/core": patch
"@pnpm/create-cafs-store": patch
"@pnpm/fs.indexed-pkg-importer": patch
"@pnpm/headless": patch
"@pnpm/store-controller-types": patch
"@pnpm/worker": patch
"pnpm": patch
---

Fixed a race condition when multiple processes run `pnpm dlx` for the same package with the global virtual store enabled. The import now uses a `safeToSkip` approach: when the target directory already contains the expected content (placed by a concurrent process), the current process skips its own swap-rename instead of replacing existing content. This eliminates the brief window where the target directory doesn't exist, preventing `ENOENT` errors in concurrent readers.
