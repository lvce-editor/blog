# Optimizing Paint Performance in Lvce Editor

Recently we added a repo for benchmarking typing performance in Lvce Editor.

Comparing it with other editors like monaco editor and Codemirror.

## 1. Avoiding use of translate

What stood out in the paint commands, was the monaco editor and lvce editor used quite a lot of `restore`, `save`, `clipRect` and `translate` paint commands.

Whereas codemirror has zero of those.

After some investigation it turned out that the css translate was responsible for those calls.

```html
<div class="EditorRow" style="translate(0)">Row 1</div>
```

Removing the translate usage reduced the number of paint commands significantly from 600 (TODO?) to 268.

## Reducing Text Nodes

Another thing that stood out was, that codemirror used way less `drawTextBlob` calls.

For syntax highlighted code, the syntax highlighter tokenizes each line into an array of tokens. Then, each token gets rendered as a `span` element.

```html
<span class="Token TokenKeyword">function</span
><span class="Token TokenWhitespace"> </span> ><span class="Token TokenFunction"
  >add</span
>
```

The token classnames make it possible to style each token and give it a color that makes sense.
