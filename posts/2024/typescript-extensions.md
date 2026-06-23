# TypeScript extensions

Since v0.24.0 LVCE Editor extensions can now be written in typescript. When a `.ts` file is requested, the server uses `typescript` to transpile the requested file to javascript.

Currently this works only for webworkers, not node yet. Nevertheless many extensions could benefit from this automatic typescript support.

The prettier and git extensions are already in the process of being converted to typescript.
