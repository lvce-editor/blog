# Optimizing Paint Performance in Lvce Editor

Recently we added a repo for [benchmarking typing performance](https://github.com/levivilet/lvce-typing-benchmark) in Lvce Editor.

Comparing the typing performance with other editors like monaco editor and Codemirror.

## Avoiding use of translate

What stood out in the paint commands, was the monaco editor and lvce editor used quite a lot of `restore`, `save`, `clipRect` and `translate` paint commands.

Whereas CodeMirror 6 has zero `translate` commands and only three of `save`, `restore`, and `clipRect` commands.

After some investigation it turned out that the css translate was responsible for those calls.

```html
<div class="EditorRow" style="translate: 0px">Row 1</div>
```

Removing the translate usage reduced the number of paint commands significantly from 407 to 268.

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

<div class="paint-benchmarks">

## Painting details

<div class="painting-table" role="region" aria-label="Painting details" tabindex="0">

| Editor                             | Paint events | Paint time | Painted area | Largest paint | Paint commands | Layers | Content layers |
| ---------------------------------- | -----------: | ---------: | -----------: | ------------: | -------------: | -----: | -------------: |
| LVCE Editor Only v19.60.2          |            5 |    1.95 ms |    4.61 Mpx² |    921.6 Kpx² |            268 |      5 |              2 |
| LVCE Editor Single Thread v19.60.2 |            3 |    1.83 ms |    2.76 Mpx² |    921.6 Kpx² |            268 |      5 |              2 |
| Monaco Editor v0.56.0              |           13 |    7.98 ms |    52.2 Mpx² |     24.6 Mpx² |            805 |     13 |              6 |
| CodeMirror 6 v6.0.2                |            3 |    1.44 ms |    2.76 Mpx² |    921.6 Kpx² |            200 |      5 |              2 |
| CodeMirror 5 v5.65.21              |         3.35 |    3.82 ms |    3.09 Mpx² |    921.6 Kpx² |            247 |      5 |              2 |
| CodeJar v4.3.0 + Prism v1.30.0     |          3.1 |    1.51 ms |    2.86 Mpx² |    921.6 Kpx² |            238 |      5 |              2 |
| Ace Editor v1.44.0                 |          3.1 |    3.42 ms |    2.86 Mpx² |    921.6 Kpx² |            521 |      5 |              2 |

</div>

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

</div>

<style scoped>
.paint-benchmarks {
  --paint-border: #d8e0ec;
  --paint-muted: #64748b;
  --paint-heading: #475569;
  --paint-code-bg: #eef2f7;
  margin-top: 48px;
}

:global(.dark .paint-benchmarks) {
  --paint-border: #353d4b;
  --paint-muted: #a6b3c5;
  --paint-heading: #bbc7d8;
  --paint-code-bg: #272f3c;
}

.painting-table {
  overflow-x: auto;
  margin: 24px 0;
  padding: 8px 20px;
  border: 1px solid var(--paint-border);
  border-radius: 12px;
}

.paint-benchmarks table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: 15px;
  line-height: 1.5;
  white-space: nowrap;
}

.paint-benchmarks tr,
.paint-benchmarks th,
.paint-benchmarks td {
  border: 0;
  background: transparent;
}

.paint-benchmarks th,
.paint-benchmarks td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--paint-border);
  text-align: left;
  font-variant-numeric: tabular-nums;
}

.paint-benchmarks td {
  font-size: 15px;
}

.paint-benchmarks thead th {
  color: var(--paint-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.painting-table td:first-child {
  font-weight: 500;
}

.painting-table tbody tr:last-child td {
  border-bottom: 0;
}

.paint-command-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.paint-command-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--paint-border);
  border-radius: 10px;
}

.paint-command-card h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.5;
}

.paint-command-card h3 span {
  display: inline-block;
  color: var(--paint-muted);
  font-size: 16px;
  font-weight: 400;
}

.paint-command-card p {
  margin: 12px 0 20px;
  color: var(--paint-muted);
  font-size: 16px;
  line-height: 1.5;
}

.paint-command-card code {
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--paint-code-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

@media (min-width: 960px) {
  .paint-benchmarks {
    width: min(1320px, calc(100vw - 64px));
    margin-left: calc((100% - min(1320px, calc(100vw - 64px))) / 2);
  }
}

@media (max-width: 1099px) {
  .paint-command-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 599px) {
  .painting-table {
    padding: 8px;
  }

  .paint-command-card {
    padding: 16px;
  }

  .paint-command-card table {
    display: block;
    overflow-x: auto;
  }

  .paint-command-card h3 {
    font-size: 18px;
  }

  .paint-command-card p,
  .paint-command-card td {
    font-size: 14px;
  }

  .paint-command-card th,
  .paint-command-card td {
    padding: 12px 5px;
  }

  .paint-command-card thead th {
    font-size: 10px;
    letter-spacing: 0;
  }

  .paint-command-card code {
    padding: 2px 4px;
    font-size: 12px;
  }
}
</style>
