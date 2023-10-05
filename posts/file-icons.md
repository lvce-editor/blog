# File Icons

Similar to VSCode, Extensions can contribute file icon themes using `icon-theme.json` files, for example

```json
{
  "iconDefinitions": {
    "_file": "/icons/default_file.svg",
    "_folder": "/icons/default_folder.svg",
    "_folder_open": "/icons/default_folder_opened.svg",
    "_root_folder": "/icons/default_root_folder.svg",
    "_root_folder_open": "/icons/default_root_folder_opened.svg"
  },
  "languageIds": {
    "ada": "_f_ada",
    "json": "_f_json"
  }
}
```

In the `iconDefinitions` section, each icon id is assigned a path.
In the `languageIds` section, each language id is assigned an icon id.

## Old Implementation

Using the `icon-theme.json` file from from above, icon theme css was generated in the renderer worker

```css
.FileIcon_file {
  background-image: url(/0ef093c/file-icons/default_file.svg);
}
.FileIcon_folder {
  background-image: url(/0ef093c/file-icons/default_folder.svg);
}
.FileIcon_folder_open {
  background-image: url(/0ef093c/file-icons/default_folder_opened.svg);
}
.FileIcon_root_folder {
  background-image: url(/0ef093c/file-icons/default_root_folder.svg);
}
.FileIcon_root_folder_open {
  background-image: url(/0ef093c/file-icons/default_root_folder_opened.svg);
}
```

The css was then sent to the renderer-process using `postMessage`.

```js
const addCssStyleSheet = async (id, css) => {
  await RendererProcess.invoke('Css.addCssStyleSheet', id, css)
}
```

In the renderer process, a `CssStyleSheet` is created and added to `document.adoptedStyleSheets`

```js
const addCssStyleSheet = async (text) => {
  const sheet = new CSSStyleSheet({})
  await sheet.replace(text)
  document.adoptedStyleSheets.push(sheet)
}
```

It worked very well, but it was always bothering a bit. Generating the css from json every time the page is loaded and sending the generated css (~100kB) to the renderer-process doesn't seem well. Additionally having large amounts of css could increase the duration of recalculate style/layout/update-layer-tree.

## New Implementation

Instead of background images and css, the new implementation uses `img` elements instead, for example

```html
<img class="FileIcon" src="/0ef093c/file-icons/default_file.svg" />
```

It seems to avoid all issues from before: No css needs to be generated on every page load, no large message needs to be sent to the renderer-process and no large css exists that could increase the duration of recalculate style.

The new icon theme implementation will be available in v0.18.9.
