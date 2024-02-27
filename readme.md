# ∴ spræ [![tests](https://github.com/dy/sprae/actions/workflows/node.js.yml/badge.svg)](https://github.com/dy/sprae/actions/workflows/node.js.yml) [![size](https://img.shields.io/bundlephobia/minzip/sprae?label=size)](https://bundlephobia.com/result?p=sprae) [![npm](https://img.shields.io/npm/v/sprae?color=orange)](https://npmjs.org/sprae)

> DOM tree microhydration

_Sprae_ is a compact & ergonomic progressive enhancement framework.<br/>
It provides `:`-attributes for inline markup logic based on _signals_.<br/>
Perfect for small-scale websites, prototypes, or lightweight UI.<br/>

## Usage

```html
<div id="container" :if="user">
  Hello <span :text="user.name">World</span>.
</div>

<script type="module">
  import sprae, { signal } from '//unpkg.com/sprae'

  const name = signal('Kitty')
  sprae(container, { user: { name } }); // init

  name.value = 'Dolly'; // update
</script>
```

Sprae evaluates `:`-directives and evaporates them, attaching state to html.

## Directives

Following directives are shipped by default.

#### `:if="condition"`, `:else`

Control flow of elements.

```html
<span :if="foo">foo</span>
<span :else :if="bar">bar</span>
<span :else>baz</span>

<!-- fragment -->
<template :if="foo">
  foo <span>bar</span> baz
</template>
```

#### `:each="item, index in items"`

Multiply element.

```html
<ul><li :each="item in items" :text="item"/></ul>

<!-- cases -->
<li :each="item, idx in list" />
<li :each="val, key in obj" />
<li :each="idx in number" />

<!-- by condition -->
<li :if="items" :each="item in items" :text="item" />
<li :else>Empty list</li>

<!-- fragment -->
<template :each="item in items">
  <dt :text="item.term"/>
  <dd :text="item.definition"/>
</template>

<!-- prevent FOUC -->
<style>[:each] {visibility: hidden}</style>
```

#### `:text="value"`

Set text content of an element.

```html
Welcome, <span :text="user.name">Guest</span>.

<!-- fragment -->
Welcome, <template :text="user.name">Guest</template>.
```

#### `:class="value"`

Set class value, extends existing `class`.

```html
<!-- string with interpolation -->
<div :class="'foo $<bar>'"></div>

<!-- array a-la clsx -->
<div :class="['foo', bar]"></div>
```

#### `:style="value"`

Set style value, extends existing `style`.

```html
<!-- string with interpolation -->
<div :style="'foo: $<bar>'"></div>

<!-- object -->
<div :style="{foo: 'bar'}"></div>

<!-- CSS variable -->
<div :style="{'--baz': qux}"></div>
```

#### `:value="value"`

Set value of an input, textarea or select. Takes handle of `checked` and `selected` attributes.

```html
<input :value="value" />
<textarea :value="value" />

<!-- selects right option -->
<select :value="selected">
  <option :each="i in 5" :value="i" :text="i"></option>
</select>
```

#### `:<prop>="value"`, `:="values"`

Set attribute(s).

```html
<label :for="name" :text="name" />

<!-- multiple attributes -->
<input :id:name="name" />

<!-- spread attributes -->
<input :="{ id: name, name, type: 'text', value }" />
```

#### `:on<event>.<modifier>="handler"`, `:on<in>..on<out>="handler"`

Attach event(s) listener with possible modifiers.

```html
<input type="checkbox" :onchange="e => isChecked = e.target.value">

<!-- multiple events -->
<input :value="text" :oninput:onchange="e => text = e.target.value">

<!-- events sequence -->
<button :onfocus..onblur="e => ( handleFocus(), e => handleBlur())">

<!-- event modifiers -->
<button :onclick.throttle-500="handler">Not too often</button>
```

###### Modifiers:

* `.once`, `.passive`, `.capture` – listener [options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options).
* `.prevent`, `.stop` – prevent default or stop propagation.
* `.window`, `.document`, `.outside`, `.self` – specify event target.
* `.throttle-<ms>`, `.debounce-<ms>` – defer function call with one of the methods.
* `.ctrl`, `.shift`, `.alt`, `.meta`, `.arrow`, `.enter`, `.escape`, `.tab`, `.space`, `.backspace`, `.delete`, `.digit`, `.letter`, `.character` – filter by [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values).
* `.ctrl-<key>, .alt-<key>, .meta-<key>, .shift-<key>` – key combinations, eg. `.ctrl-alt-delete` or `.meta-x`.
* `.*` – any other modifier has no effect, but allows binding multiple handlers to same event (like jQuery event classes).


#### `:scope="data"`

Define or extend data scope for a subtree.

```html
<x :scope="{ foo: signal('bar') }">
  <!-- extends parent scope -->
  <y :scope="{ baz: 'qux' }" :text="foo + baz"></y>
</x>
```

#### `:ref="name"`

Expose element to current scope with `name`.

```html
<textarea :ref="text" placeholder="Enter text..."></textarea>

<!-- iterable items -->
<li :each="item in items" :ref="item">
  <input :onfocus..onblur=="e => (item.classList.add('editing'), e => item.classList.remove('editing'))"/>
</li>
```


#### `:fx="values"`

Run effect.

```html
<div :fx="foo.value ? bar() : baz();" />
```



## Additional Directives

The following directives aren't shipped by default, and can be plugged in as:

```js
import sprae from 'sprae'
import 'sprae/directive/<directive>'
```

#### `:html="element"`

Set html content of an element or instantiate a template.

```html
Hello, <span :html="userElement">Guest</span>.

<!-- fragment -->
Hello, <template :html="user.name">Guest</template>.

<!-- instantiate template -->
<template :ref="tpl"><span :text="foo"></span></template>
<div :html="tpl" :scope="{foo:'bar'}">...inserted here...</div>
```

#### `:data="values"`

Set `data-*` attributes. CamelCase is converted to dash-case.

```html
<input :data="{foo: 1, barBaz: true}" />
```

#### `:aria="values"`

Set `aria-*` attributes. Boolean values are stringified.

```html
<input role="combobox" :aria="{
  controls: 'joketypes',
  autocomplete: 'list',
  expanded: false,
  activeOption: 'item1',
  activedescendant: ''
}" />
```

#### `:item="values"`

Set data schema values:

```html
<div :item="{type:a, scope:b}"/>
```

#### `:onvisible..oninvisible="e => e => {}"`

Trigger when element is in/out of the screen.

#### `:onmount..onunmount="e => e => {}"`

Trigger when element is connected / disconnected from DOM.


<!--
_Sprae_ directives can be extended as `sprae.directive.name = (el, expr, state) => {}`.
-->


## Reactivity

_Sprae_ uses signals for reactivity.
By default it ships [minimorum signals](./src/signal.js), but it can be reconfigured to any other signals lib:

```js
import sprae, { signal, computed, effect, batch } from 'sprae';
import * as signals from '@preact/signals-core';

sprae.use(preact)

sprae(el, { name: signal('Kitty') })
```

###### Signals providers:

* [`sprae/signal`](./src/signal.js) (default) – 0Kb, basic performance, good for simple states (<10 deps).
* [`@webreflection/signal`](https://ghib.io/@webreflection/signal) – +1Kb, good performance, good for average states (10-20 deps).
* [`usignal`](https://ghib.io/usignal) – +1.8Kb, better performance, good for average states (20-50 deps).
* [`@preact/signals-core`](https://ghub.io/@preact/signals-core) – +4Kb, best performance, good for complex states.


## CSP

_Sprae_ evaluates expressions via `new Function`, which is simple, compact and performant way.<br/>
It supports full JS syntax, but violates "unsafe-eval" policy and allows unrestricted access to globals (no sandboxing).

[`sprae.csp.js`](./sprae.csp.js) provides safe eval & sandbox at price of more restrictive syntax and +2kb to bundle size.

```js
import sprae from './sprae.csp.js'
```

Expressions use _justin_ language, a [minimal subset of JS](https://github.com/dy/subscript?tab=readme-ov-file#justin):

###### Operators:
```
++ -- ! - + ** * / %  && || ??
= < <= > >= == != === !==
<< >> & ^ | ~ ?: . ?. []
() => {}
in
```

###### Primitives:
```
[] {} "" ''
1 2.34 -5e6 0x7a
true false null undefined NaN
```

<!-- ## Dispose

To destroy state and detach sprae handlers, call `element[Symbol.dispose]()`. -->


## Migration to v9

* No default globals: provide manually to state (`console`, `setTimeout` etc).
* ``:class="`abc ${def}`"`` → `:class="'abc $<def>'"`
* `:with={x:foo}` → `:scope={x:foo}`
* `:render="tpl"` → `:html="tpl"`
* No autoinit → use manual init.
* No reactive store → use signals for reactive values, read `a.value` where applicable.
* `@click="event.target"` → `:onclick="event => event.target"`
* Async props / events are prohibited, pass async functions via state.
* Directives order matters, eg. `<a :if :each :scope />` !== `<a :scope :each :if />`


## Justification

[Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks ([parsing table](https://github.com/github/template-parts/issues/24), [SVG attributes](https://github.com/github/template-parts/issues/25), [liquid syntax](https://shopify.github.io/liquid/tags/template/#raw) conflict etc). [Alpine](https://github.com/alpinejs/alpine) / [petite-vue](https://github.com/vuejs/petite-vue) / [lucia](https://github.com/aidenyabi/lucia) escape native HTML quirks, but the API is excessive and [self-encapsulated](https://github.com/alpinejs/alpine/discussions/3223).

_Sprae_ mixes _templize_ / _alpine_ / _vue_ directives with _signals_ reactivity & _no-keywords_ evaluation.

|                       | [AlpineJS](https://github.com/alpinejs/alpine)          | [Petite-Vue](https://github.com/vuejs/petite-vue)        | Sprae            |
|-----------------------|-------------------|-------------------|------------------|
| _Size_              | ~10KB             | ~6KB              | ~5KB             |
| _Memory_            | 5.05             | 3.16              | 2.78             |
| _Performance_       | 2.64             | 2.43              | 1.76             |
| _CSP_               | No                | No                | Yes              |
| _SSR_ | No | No | No |
| _Evaluation_        | [`new AsyncFunction`](https://github.com/alpinejs/alpine/blob/main/packages/alpinejs/src/evaluator.js#L81) | [`new Function`](https://github.com/vuejs/petite-vue/blob/main/src/eval.ts#L20) | [justin](https://github.com/dy/subscript)           |
| _Reactivity_        | `Alpine.store`    | _@vue/reactivity_   | _signals_ |
| _Sandboxing_        | No                | No                | Yes              |
| _Directives_ | `:`, `x-`, `{}` | `:`, `v-`, `@`, `{}` | `:` |
| _Magic_               | `$data` | `$app`   | - |
| _Fragments_ | Yes | No | Yes |
| _Plugins_ | Yes | No | Yes |
| _Modifiers_ | Yes | No | Yes |

<!--
<details>
<summary><strong>Benchmark</strong></summary>

See [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/current.html#eyJmcmFtZXdvcmtzIjpbIm5vbi1rZXllZC9wZXRpdGUtdnVlIiwibm9uLWtleWVkL3NwcmFlIl0sImJlbmNobWFya3MiOlsiMDFfcnVuMWsiLCIwMl9yZXBsYWNlMWsiLCIwM191cGRhdGUxMHRoMWtfeDE2IiwiMDRfc2VsZWN0MWsiLCIwNV9zd2FwMWsiLCIwNl9yZW1vdmUtb25lLTFrIiwiMDdfY3JlYXRlMTBrIiwiMDhfY3JlYXRlMWstYWZ0ZXIxa194MiIsIjA5X2NsZWFyMWtfeDgiLCIyMV9yZWFkeS1tZW1vcnkiLCIyMl9ydW4tbWVtb3J5IiwiMjNfdXBkYXRlNS1tZW1vcnkiLCIyNV9ydW4tY2xlYXItbWVtb3J5IiwiMjZfcnVuLTEway1tZW1vcnkiLCIzMV9zdGFydHVwLWNpIiwiMzRfc3RhcnR1cC10b3RhbGJ5dGVzIiwiNDFfc2l6ZS11bmNvbXByZXNzZWQiLCI0Ml9zaXplLWNvbXByZXNzZWQiXSwiZGlzcGxheU1vZGUiOjF9).

![Benchmark](./bench.png)
</details>
-->

<!--
<details>
<summary>How to run</summary>

```sh
# prerequisite
npm ci
npm run install-server
npm start

# build
cd frameworks/non-keyed/sprae
npm ci
npm run build-prod

# bench
cd ../../..
cd webdriver-ts
npm ci
npm run compile
npm run bench keyed/sprae

# show results
cd ..
cd webdriver-ts-results
npm ci
cd ..
cd webdriver-ts
npm run results
```
</details>
-->

<!-- ## See also -->

<!--
## Alternatives

* [Alpine](https://github.com/alpinejs/alpine)
* ~~[Lucia](https://github.com/aidenybai/lucia)~~ deprecated
* [Petite-vue](https://github.com/vuejs/petite-vue)
* [nuejs](https://github.com/nuejs/nuejs)
 -->


## Examples

* ToDo MVC: [demo](https://dy.github.io/sprae/examples/todomvc), [code](https://github.com/dy/sprae/blob/main/examples/todomvc.html)
* JS Framework Benchmark: [demo](https://dy.github.io/sprae/examples/js-framework-benchmark), [code](https://github.com/dy/sprae/blob/main/examples/js-framework-benchmark.html)
* Wavearea: [demo](https://dy.github.io/wavearea?src=//cdn.freesound.org/previews/586/586281_2332564-lq.mp3), [code](https://github.com/dy/wavearea)
* Prostogreen [demo](http://web-being.org/prostogreen/), [code](https://github.com/web-being/prostogreen/)

## See Also

* [nadi](https://github.com/dy/nadi) - 101 signals.


<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
