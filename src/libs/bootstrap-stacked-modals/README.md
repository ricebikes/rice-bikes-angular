# bootstrap-multimodal
A Bootstrap plugin that adds support for multiple stacked modals.

## Installation
This package is available via npm:
```shell
npm i bootstrap-stacked-modals
```

## Demo
See [the demo page](https://aleho.github.io/bootstrap-multimodal/) for a sample implementation.


## Usage
Include `dist/bootstrap-multimodal.js` (or the minified version).

Please note that a modal element has to be inserted into the DOM before calling
`.modal()`, as Bootstrap first triggers the event and only later inserts it,
which makes the listener on `$(document)` miss the event.

### Disable for certain modals
If you need to override or prevent the behavior on certain modals, add a
data-attribute to the `.modal` element:

```HTML
<div class="modal fade" data-multimodal="disabled">…
```

### Disable globally
You can also disable / enable multimodal by calling methods on the global object:

```JS
BootstrapMultimodal.disable();
BootstrapMultimodal.enable();
```
