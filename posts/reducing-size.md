# Reducing size

## Initial size 88.9 MB

Starting with version 0.14.15, the deb size was 88.9 MB

## Remove unused locales 82.1 MB

Chromium and electron include support for several languages. Unused locales files are removed during build since v0.15.23.

## Remove unused dependencies 81 MB

Some node_modules included in the electron build were not necessary to include on all platforms, for example `windows-process-tree` and some `node-pty` files are needed only for windows. More dependencies like `@types/` or `type-fest` or `ws` are also removed during the electron build since v0.16.8.

## Higher compression 65.7 MB

Higher xz compression, reducing size, is enabled since v0.18.1.
