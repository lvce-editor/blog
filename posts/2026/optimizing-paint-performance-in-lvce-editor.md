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
<span class="Token TokenKeyword">function</span>
<span class="Token TokenWhitespace"> </span>
<span class="Token TokenFunction">add</span>
```

The token classnames make it possible to style each token and give it a color that makes sense.

One optimization here is to merge the whitespace tokens with the previous token when rendering the html.

Since the text color of the whitespace doesn't matter anyway, it still looks the same. But renders one less html node, one less text node. And there are fewer `drawTextBlob` paint calls.

```html
<span class="Token TokenKeyword">function </span>
<span class="Token TokenFunction">add</span>
```

## Painting details

| Editor                             | Paint events | Paint time | Painted area | Largest paint | Paint commands | Layers | Content layers |
| ---------------------------------- | -----------: | ---------: | -----------: | ------------: | -------------: | -----: | -------------: |
| LVCE Editor Only v19.60.2          |            5 |    1.95 ms |    4.61 Mpx² |    921.6 Kpx² |            268 |      5 |              2 |
| LVCE Editor Single Thread v19.60.2 |            3 |    1.83 ms |    2.76 Mpx² |    921.6 Kpx² |            268 |      5 |              2 |
| Monaco Editor v0.56.0              |           13 |    7.98 ms |    52.2 Mpx² |     24.6 Mpx² |            805 |     13 |              6 |
| CodeMirror 6 v6.0.2                |            3 |    1.44 ms |    2.76 Mpx² |    921.6 Kpx² |            200 |      5 |              2 |
| CodeMirror 5 v5.65.21              |         3.35 |    3.82 ms |    3.09 Mpx² |    921.6 Kpx² |            247 |      5 |              2 |
| CodeJar v4.3.0 + Prism v1.30.0     |          3.1 |    1.51 ms |    2.86 Mpx² |    921.6 Kpx² |            238 |      5 |              2 |
| Ace Editor v1.44.0                 |          3.1 |    3.42 ms |    2.86 Mpx² |    921.6 Kpx² |            521 |      5 |              2 |

## Paint command breakdown

<div class="paint-command-grid">
<article class="paint-command-card">
        <h3 id="paint-editor-0">LVCE Editor Only <span>v19.60.2</span></h3>
        <p>268 commands per load · 6 command types</p>
        <table aria-labelledby="paint-editor-0">
          <thead><tr><th scope="col">Command method</th><th scope="col">Average</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead>
          <tbody><tr>
  <th scope="row"><code>drawTextBlob</code></th>
  <td>248</td>
  <td>248</td>
  <td>248</td>
</tr>
<tr>
  <th scope="row"><code>clipRect</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>restore</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>save</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>drawRect</code></th>
  <td>4</td>
  <td>4</td>
  <td>4</td>
</tr>
<tr>
  <th scope="row"><code>drawPaint</code></th>
  <td>1</td>
  <td>1</td>
  <td>1</td>
</tr></tbody>
        </table>
      </article>
<article class="paint-command-card">
        <h3 id="paint-editor-1">LVCE Editor Single Thread <span>v19.60.2</span></h3>
        <p>268 commands per load · 6 command types</p>
        <table aria-labelledby="paint-editor-1">
          <thead><tr><th scope="col">Command method</th><th scope="col">Average</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead>
          <tbody><tr>
  <th scope="row"><code>drawTextBlob</code></th>
  <td>248</td>
  <td>248</td>
  <td>248</td>
</tr>
<tr>
  <th scope="row"><code>clipRect</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>restore</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>save</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>drawRect</code></th>
  <td>4</td>
  <td>4</td>
  <td>4</td>
</tr>
<tr>
  <th scope="row"><code>drawPaint</code></th>
  <td>1</td>
  <td>1</td>
  <td>1</td>
</tr></tbody>
        </table>
      </article>
<article class="paint-command-card">
        <h3 id="paint-editor-2">Monaco Editor <span>v0.56.0</span></h3>
        <p>805 commands per load · 8 command types</p>
        <table aria-labelledby="paint-editor-2">
          <thead><tr><th scope="col">Command method</th><th scope="col">Average</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead>
          <tbody><tr>
  <th scope="row"><code>restore</code></th>
  <td>206</td>
  <td>206</td>
  <td>206</td>
</tr>
<tr>
  <th scope="row"><code>save</code></th>
  <td>206</td>
  <td>206</td>
  <td>206</td>
</tr>
<tr>
  <th scope="row"><code>clipRect</code></th>
  <td>103</td>
  <td>103</td>
  <td>103</td>
</tr>
<tr>
  <th scope="row"><code>translate</code></th>
  <td>103</td>
  <td>103</td>
  <td>103</td>
</tr>
<tr>
  <th scope="row"><code>drawDRRect</code></th>
  <td>101</td>
  <td>101</td>
  <td>101</td>
</tr>
<tr>
  <th scope="row"><code>drawTextBlob</code></th>
  <td>77</td>
  <td>77</td>
  <td>77</td>
</tr>
<tr>
  <th scope="row"><code>drawRect</code></th>
  <td>5</td>
  <td>5</td>
  <td>5</td>
</tr>
<tr>
  <th scope="row"><code>drawPaint</code></th>
  <td>4</td>
  <td>4</td>
  <td>4</td>
</tr></tbody>
        </table>
      </article>
<article class="paint-command-card">
        <h3 id="paint-editor-3">CodeMirror 6 <span>v6.0.2</span></h3>
        <p>200 commands per load · 6 command types</p>
        <table aria-labelledby="paint-editor-3">
          <thead><tr><th scope="col">Command method</th><th scope="col">Average</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead>
          <tbody><tr>
  <th scope="row"><code>drawTextBlob</code></th>
  <td>184</td>
  <td>184</td>
  <td>184</td>
</tr>
<tr>
  <th scope="row"><code>drawRect</code></th>
  <td>6</td>
  <td>6</td>
  <td>6</td>
</tr>
<tr>
  <th scope="row"><code>clipRect</code></th>
  <td>3</td>
  <td>3</td>
  <td>3</td>
</tr>
<tr>
  <th scope="row"><code>restore</code></th>
  <td>3</td>
  <td>3</td>
  <td>3</td>
</tr>
<tr>
  <th scope="row"><code>save</code></th>
  <td>3</td>
  <td>3</td>
  <td>3</td>
</tr>
<tr>
  <th scope="row"><code>drawPaint</code></th>
  <td>1</td>
  <td>1</td>
  <td>1</td>
</tr></tbody>
        </table>
      </article>
</div>

<style scoped>
.paint-command-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.paint-command-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.paint-command-card h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.paint-command-card h3 span {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 400;
}

.paint-command-card p {
  margin: 12px 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.paint-command-card table {
  display: table;
  width: 100%;
  margin: 0;
  font-size: 12px;
}

.paint-command-card th,
.paint-command-card td {
  padding: 8px 4px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.paint-command-card th:first-child {
  text-align: left;
}

.paint-command-card thead th {
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.paint-command-card tr {
  background: transparent;
}

.paint-command-card code {
  padding: 2px;
  font-size: 11px;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .paint-command-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 359px) {
  .paint-command-card table {
    display: block;
    overflow-x: auto;
  }
}
</style>
