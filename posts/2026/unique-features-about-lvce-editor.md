# Unique features about Lvce Editor

Here are some unique features about Lvce Editor compared to other text editors or IDEs.

## Completely isolated extensions

Each extension runs completely isolated in its own webworker. This has the advantage that one bad or slow extension can't affect other extensions. But also it makes it easier to for example inspect memory usage of a single extension using chrome devtools or run a performance profile measuring that single extension / webworker.

### Extensions Permissions

Webworkers can also act as a sandbox for extensions. For example, using Content-Security-Policy, one can configure an extension to ensure it isn't allowed to make network requests to the internet. And also restrict what scripts it can load or not.

### Small Memory Footprint

Since Lvce Editor consists of multiple webworkers, and each worker is loaded on demand when it's needed, the javascript memory usage can be lower than other web based editors / IDEs. This also benefits startup performance, since less javascript code needs to be loaded and executed compared to if it were a bundled into a single large javascript file.

### Virtual DOM

Lvce Editor uses a custom virtual DOM implementation, which allows components to be split into WebWorkers. Each component renders its own virtual DOM and when changes occur does virtual DOM diffing and sends an array of patches to be applied to the renderer process. This means the renderer process can be quite lightweight. And it aims to reduce potential renderer-process slowness, e.g. with almost all of the logic in webworkers, the renderer process can focus on doing css layouts, applying minimal dom changes and forwarding things like click events to web workers.
