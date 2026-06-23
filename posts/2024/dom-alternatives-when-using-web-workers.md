# Dom Alternatives when using Webworkers

It's no secreat that Webworkers can make an application more performant by not blocking the main rendering thread.

Webworkers also support many Web Apis like DomMatrix, OffscreenCanvas, the Cache Api, IndexedDB.

For other Web Apis, that are not available in Web Workers, these alternatives can be useful.

## Dom

HTML Elements are not available. Virtual Dom can provide a good alternative.

The virtual dom nodes can be created in a webworker and sent to the renderer process.

For example:

```js
// worker
const dom = {
  type: 'button',
  className: 'Button',
  children: [],
}
await rendererProcess.invoke('setDom', dom)
```

```js
// renderer process
const renderElement = (dom) => {
  const $Element = document.createElement(dom.type)
  $Element.className = dom.className
  $Element.append(...dom.children.map(renderElement))
}

const setDom = (dom) => {
  const $Node = renderElement(dom)
  document.body.append($Node)
}
```

## Local Storage

LocalStorage can be used by asking the renderer process for localStorage data.

```js
// worker
const item = await RendererProcess.invoke('LocalStorage.getItem', 'key')
```

```js
// renderer process
const LocalStorage = {
  getItem(key) {
    return localStorage.getItem(key)
  },
}
```

## Event Listeners

Event Listeners can be a bit tricky, since event.preventDefault needs to be called synchronously or the parameters that need to be sent to the worker

```js
// worker
const dom = {
  type: 'button',
  className: 'Button',
  eventListeners: [
    {
      type: 'click',
      method: 'handleClick',
      args: ['clientX', 'clientY'],
      preventDefault: false,
    },
  ],
  children: [],
}
await rendererProcess.invoke('setDom', dom)
```

```js
// renderer process
const setEventListener = ($Element, info) => {
  const fn = async (event) => {
    const { target } = event
    const values = info.args.map((arg) => event[arg])
    await RendererWorker.invoke(info.method, ...values)
  }
  $Element.addEventListener(info.type, fn)
}
```

To reuse event listener functions between rendering, a hash can be used as the event listener key.

```js
// worker
const eventListener = {
  type: 'click',
  method: 'handleClick',
  args: ['clientX', 'clientY'],
  preventDefault: false,
}
const eventListenerHash = '938c2cc0dc'
await RendererProcess.invoke(
  'createEventListener',
  eventListenerHash,
  eventListener,
)

const dom = {
  type: 'button',
  className: 'Button',
  eventListeners: ['938c2cc0dc'],
  children: [],
}
await rendererProcess.invoke('setDom', dom)
```

```js
// renderer process
const eventListeners = Object.create(null)

const createEventListener = (hash, info) => {
  const fn = async (event) => {
    const { target } = event
    const values = info.args.map((arg) => event[arg])
    await RendererWorker.invoke(info.method, ...values)
  }
  eventListeners[hash] = { type: info.type, fn }
}

const setEventListener = ($Element, hash) => {
  const { type, fn } = eventListeners[hash]
  $Element.addEventListener(type, fn)
}
```

## Measuring Text Width

For measuring text width, Offscreencanvas can be used in a webWorker.

```js
const canvas = new OffscreenCanvas()
const ctx = canvas.getContext('2d')
ctx.letterSpacing = '0.5px'
ctx.font = '15px sans-serif'
const metrics = ctx.measureText('abc')
const width = metrics.width
```

## GetBoundingClientRect

Sometimes, one needs to know how tall some text or html element is. Similar to localStorage, by asking the renderer process for the information.

```js
// worker
const bounds = await RendererProcess.invoke(
  'Dom.getBoudingClientRect',
  'element-id',
)
```

```js
// renderer process
const Dom = {
  getBoundingClientRect(id) {
    const $Element = document.getElementById(id)
    const bounds = getBoundingClientRect($Element)
    return bounds
  },
}
```

## Drag and Drop

For drag and drop, the data for event.dataTransfer needs to be set synchronously in the dragstart event.

In case the drag and drop data only needs to work within the same window, the data id can be sent to the renderer process with the data still being stored in the renderer worker.

```js
// worker
const dragAndDropData = Object.create(null)

const tab = {
  id: 5,
  uri: '/test/file.txt',
}

dragAndDropData[tab.id] = tab

const dom = {
  type: 'button',
  className: 'Button',
  dragAndDrop: 5,
  children: [],
}
```

```js
// renderer process
const setDragEventListeners = ($Element, info) => {
  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', event.target.id)
  }
  const handleDrop = async (event) => {
    const id = event.dataTransfer.getData('text/plain')
    await RendererWorker.invoke('handleDrop', id)
  }
  $Element.addEventListener('dragstart', handleDragStart)
  $Element.addEventListener('drop', handleDrop)
}
```
