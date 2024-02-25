# Functional extension architecture

Extensions are an important part of every text editor, adding syntax highlighting and language support for many programming languages.

But often, extensions are also tightly coupled to the text editor, making them difficult to unit test, integration test or reusing the same functionality elsewhere.

Language server protocol was created to solve this problem for providing language support across different text editors.

## Web Workers

In Lvce Editor, extensions are running in webworkers. Each extension can

## Same inputs, same outputs

Each function should have rehturn the same outputs given the same inputs. For extensions, this means sending the same events to the extension webworker, the webworker should send back the same output events.

For example:

```js
// extension.js
const rpc = await createRpc({ path: 'greetingsWorker.js' })
await rpc.invoke('Greet.greet')
```

```js

// greetingsWorker.js
const greet = ()=>{
  await rpc.invoke('Dialog.showNotification', 'hello world')
}

export const CommandMap = {
  'Greet.greet': greet
}
```

In the above example, the extension creates a worker `greetingsWorker` and sends a message `Greet.greet` to the worker. The worker executes the `greet` function, which sends a `Dialog.showNotification` message with `hello world` to the extension.

## Counter example

This is an example of a not functional webworker:

```js
// extension.js
const rpc = await createRpc({ path: 'todosWorker.js' })
await rpc.invoke('Todos.getTodos')
```

```js
// todosWorker.js
const getTodos = ()=>{
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    const json=await response.json()
    return json
  } catch(error){
    throw new VError(error, `Failed to get todos`)
  }
}

export const CommandMap = {
  'Todos.getTodos': getTodos
}
```

A integration test for the worker could look like this:

```js
test('getTodos', () => {
  globalThis.fetch = async () => {
    return {
      json(){
         return [
          {
            title: 'abc',
            completed: false,
          },
        ]
      }
    }
  }
  const todosWorker = await startWorker({
    path: 'todosWorker.js',
    commands: {
      'Ajax.getJson': getJson,
    },
  })
  expect(await todosWorker.invoke('Todos.getTodos')).toEqual([
    {
      title: 'abc',
      completed: false,
    },
  ])
})

test('getTodos - error', ()=>{
  globalThis.fetch = async () => {
    throw new TypeError(`x is not a function`)
  }

  const todosWorker = await startWorker({
    path: 'todosWorker.js',
    commands: {
      'Ajax.getJson': getJson,
    },
  })
  await expect(todosWorker.invoke('Todos.getTodos')).rejects.toThrow(
    new Error(`failed to get todos: TypeError: x is not a function`)
  ])
})
```

## Changing the counter example to make it more functional

This is the same example, more functional:

```js
// extension.js
const getJson = (url)=>{
  const response = await fetch(url)
  const json = await response.json()
  return json
}

const rpc = await createRpc({ path: 'todosWorker.js',
  commands:{
    'Ajax.getJson':getJson
  }
})
await rpc.invoke('Todos.getTodos')
```

```js
// todosWorker.js
const getTodos = ()=>{
  try{
    const json = await rpc.invoke('Ajax.getJson', 'https://jsonplaceholder.typicode.com/todos/1')
    return json
  } catch(error){
    throw new VError(error, `failed to get todos`)
  }
}

export const CommandMap = {
   'Todos.getTodos': getTodos
}
```

The changes here is that the `todosWorker` does not have any side effects. The same input events send to the `todosWorker` will result in the same output events.

A integration test for the worker could look like this:

```js
test('getTodos', ()=>{
  const getJson = () => {
    return [
      {
        title: 'abc',
        completed: false,
      },
    ]
  }
  const todosWorker = await startWorker({
    path: 'todosWorker.js',
    commands: {
      'Ajax.getJson': getJson,
    },
  })
  expect(await todosWorker.invoke('Todos.getTodos')).toEqual([
    {
      title: 'abc',
      completed: false,
    },
  ])
})

test('getTodos - error', ()=>{
  const getJson = () => {
    throw new TypeError(`x is not a function`)
  }
  const todosWorker = await startWorker({
    path: 'todosWorker.js',
    commands: {
      'Ajax.getJson': getJson,
    },
  })
  await expect(todosWorker.invoke('Todos.getTodos')).rejects.toThrow(
    new Error(`failed to get todos: TypeError: x is not a function`)
  ])
})
```

## Summary

As extensions grow larger, state management becomes more difficult and race conditions can occur. Extensions are often tighly coupled to the extension api, making it hard to reuse the extension code in other contexts as well as making changes to the extension api more difficult.

Creating a functional web worker can faciltate integration testing even large parts of the application without relying on whitebox testing. By consistently producing identical outputs for the same inputs, functional web workers enhance predictability and minimize unintended side effects.
