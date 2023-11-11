# ∴ spræ [![tests](https://github.com/dy/sprae/actions/workflows/node.js.yml/badge.svg)](https://github.com/dy/sprae/actions/workflows/node.js.yml) [![size](https://img.shields.io/bundlephobia/minzip/sprae?label=size)](https://bundlephobia.com/result?p=sprae) [![npm](https://img.shields.io/npm/v/sprae?color=orange)](https://npmjs.org/sprae)

> DOM tree hydration with reactivity.

_Sprae_ is progressive enhancement framework, a tiny essential alternative to [alpine](https://github.com/alpinejs/alpine), [petite-vue](https://github.com/vuejs/petite-vue) or [template-parts](https://github.com/github/template-parts) with enhanced ergonomics[*](#justification--alternatives). It enables simple markup logic without external scripts. Perfect for small websites, prototypes or UI logic.

## Usage

### Autoinit

To autoinit document, include [`sprae.auto.js`](./sprae.auto.js):

```html
<!-- <script src="https://cdn.jsdelivr.net/npm/sprae/sprae.auto.js" defer></script> -->
<script defer src="./path/to/sprae.auto.js"></script>

<ul>
  <li :each="item in ['apple', 'bananas', 'citrus']"">
    <a :href="`#${item}`" :text="item" />
  </li>
</ul>
```

### Manual init

To init manually as module, import [`sprae.js`](./sprae.js):

```html
<div id="container" :if="user">
  Logged in as <span :text="user.name">Guest.</span>
</div>

<script type="module">
  // import sprae from 'https://cdn.jsdelivr.net/npm/sprae/sprae.js';
  import sprae from './path/to/sprae.js';

  const state = sprae(container, { user: { name: 'Dmitry Ivanov' } });
  state.user.name = 'dy'; // updates DOM
</script>
```

Sprae evaluates `:`-attributes and evaporates them.<br/>

## State

Sprae creates reactive state representing current values in rendered DOM.<br/>
It is based on [preact signals](https://github.com/preactjs/signals) and can take them as inputs.

```js
const version = signal('alpha')
const state = sprae(container, { foo: 'bar', version })

// Updating state properties rerenders the DOM.
state.foo = 'baz'

// Updating input signal rerenders the DOM.
version.value = 'beta'

// To batch-update, reinitialize sprae
sprae(container, { foo: 'qux', version: 'gamma' })
```

## Attributes

#### `:if="condition"`, `:else`

Control flow of elements.

```html
<span :if="foo">foo</span>
<span :else :if="bar">bar</span>
<span :else>baz</span>
```

#### `:each="item, index in items"`

Multiply element. `index` value starts from 1.

```html
<ul><li :each="item in items" :text="item"></ul>

<!-- Cases -->
<li :each="item, idx in list" />
<li :each="val, key in obj" />
<li :each="idx0, idx in number" />

<!-- Loop by condition -->
<li :if="items" :each="item in items" :text="item" />
<li :else>Empty list</li>

<!-- Key items to reuse elements -->
<li :each="item in items" :key="item.id" :text="item.value" />
```

#### `:text="value"`

Set text content of an element. Default text can be used as fallback:

```html
Welcome, <span :text="user.name">Guest</span>.
```

#### `:class="value"`

Set class value from either a string, array or object.

```html
<!-- set from string -->
<div :class="`foo ${bar}`"></div>

<!-- extends existing class as "foo bar" -->
<div class="foo" :class="`bar`"></div>

<!-- object with values -->
<div :class="{foo:true, bar: false}"></div>
```

#### `:style="value"`

Set style value from an object or a string. Extends existing `style` attribute, if any.

```html
<!-- from string -->
<div :style="`foo: ${bar}`"></div>

<!-- from object -->
<div :style="{foo: 'bar'}"></div>

<!-- set CSS variable -->
<div :style="{'--baz': qux}"></div>
```

#### `:value="value"`

Set value of an input, textarea or select. Takes handle of `checked` and `selected` attributes.

```html
<!-- set from value -->
<input :value="value" />
<textarea :value="value" />

<!-- selects right option -->
<select :value="selected">
  <option :each="i in 5" :value="i" :text="i"></option>
</select>
```

#### `:with="data"`

Define or extend data scope for a subtree.

```html
<!-- Inline data -->
<x :with="{ foo: 'bar' }" :text="foo"></x>

<!-- External data -->
<y :with="data"></y>

<!-- Extend scope -->
<x :with="{ foo: 'bar' }">
  <y :with="{ baz: 'qux' }" :text="foo + baz"></y>
</x>
```

#### `:<prop>="value?"`

Set any attribute value or run an effect.

```html
<!-- Single property -->
<label :for="name" :text="name" />

<!-- Multiple properties -->
<input :id:name="name" />

<!-- Effect - returns undefined, triggers any time bar changes -->
<div :fx="void bar()" ></div>

<!-- Raw event listener (see events) -->
<div :onclick="e=>e.preventDefault()"></div>
```

#### `:="props?"`

Spread multiple attibures.

```html
<input :="{ id: name, name, type:'text', value }" />
```

#### `:ref="id"`

Expose element to current data scope with the `id`:

```html
<!-- single item -->
<textarea :ref="text" placeholder="Enter text..."></textarea>
<span :text="text.value"></span>

<!-- iterable items -->
<ul>
  <li :each="item in items" :ref="item">
    <input @focus="item.classList.add('editing')" @blur="item.classList.remove('editing')"/>
  </li>
</ul>
```

#### `:render="ref"`

Include template as element content.

```html
<!-- assign template element to foo variable -->
<template :ref="foo"><span :text="foo"></span></template>

<!-- rended template as content -->
<div :render="foo" :with="{foo:'bar'}">...inserted here...</div>
<div :render="foo" :with="{foo:'baz'}">...inserted here...</div>
```


## Events

#### `@<event>="handle"`, `@<foo>@<bar>.<baz>="handle"`

Attach event(s) listener with possible modifiers. `event` variable holds current event. Allows async handlers.

```html
<!-- Single event -->
<input type="checkbox" @change="isChecked = event.target.value">

<!-- Multiple events -->
<input :value="text" @input@change="text = event.target.value">

<!-- Event modifiers -->
<button @click.throttle-500="handler(event)">Not too often</button>
```

##### Event modifiers

* `.once`, `.passive`, `.capture` – listener [options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options).
* `.prevent`, `.stop` – prevent default or stop propagation.
* `.window`, `.document`, `.outside`, `.self` – specify event target.
* `.throttle-<ms>`, `.debounce-<ms>` – defer function call with one of the methods.
* `.ctrl`, `.shift`, `.alt`, `.meta`, `.arrow`, `.enter`, `.escape`, `.tab`, `.space`, `.backspace`, `.delete`, `.digit`, `.letter`, `.character` – filter by [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values).
* `.ctrl-<key>, .alt-<key>, .meta-<key>, .shift-<key>` – key combinations, eg. `.ctrl-alt-delete` or `.meta-x`.
* `.*` – any other modifier has no effect, but allows binding multiple handlers to same event (like jQuery event classes).


## Sandbox

Expressions are sandboxed, ie. don't access global/window scope by default (since sprae can be run in server environment).

```html
<div :x="scrollY"></div>
<!-- scrollY is undefined -->
```

Default sandbox provides most popular global objects: _Array_, _Object_, _Number_, _String_, _Boolean_, _Date_,
  _console_, _window_, _document_, _history_, _navigator_, _location_, _screen_, _localStorage_, _sessionStorage_,
  _alert_, _prompt_, _confirm_, _fetch_, _performance_,
  _setTimeout_, _setInterval_, _requestAnimationFrame_.

Sandbox can be extended as `Object.assign(sprae.globals, { BigInt })`.

## FOUC

To avoid _flash of unstyled content_, you can hide sprae attribute or add a custom effect, eg. `:hidden` - that will be removed once sprae is initialized:

```html
<div :hidden></div>
<style>[:each],[:hidden] {visibility: hidden}</style>
```

## Dispose

To destroy state and detach sprae handlers, call `element[Symbol.dispose]()`.

## Benchmark

Done via [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark).

<details>
<summary>How to run</summary>

```sh
# prerequisite
npm ci
npm run install-server
npm start

# build
cd frameworks/keyed/sprae
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

## Examples

* TODO MVC: [demo](https://dy.github.io/sprae/examples/todomvc), [code](https://github.com/dy/sprae/blob/main/examples/todomvc.html)
* Wavearea: [demo](https://dy.github.io/wavearea?src=//cdn.freesound.org/previews/586/586281_2332564-lq.mp3), [code](https://github.com/dy/wavearea)
* Prostogreen [demo](http://web-being.org/prostogreen/), [code](https://github.com/web-being/prostogreen/)


## Justification

* [Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks ([parsing table](https://github.com/github/template-parts/issues/24), [SVG attributes](https://github.com/github/template-parts/issues/25), [liquid syntax](https://shopify.github.io/liquid/tags/template/#raw) conflict etc). Also ergonomics of `attr="{{}}"` is inferior to `:attr=""` since it creates flash of uninitialized values. Also it's just nice to keep `{{}}` generic, regardless of markup, and attributes as part of markup.
* [Alpine](https://github.com/alpinejs/alpine) / [vue](https://github.com/vuejs/petite-vue) / [lit](https://github.com/lit/lit/tree/main/packages/lit-html) escape native HTML quirks, but the syntax space (`:attr`, `v-*`,`x-*`, `l-*` `@evt`, `{{}}`) is too broad, as well as functionality. Perfection is when there's nothing to take away, not add (c). Also they tend to [self-encapsulate](https://github.com/alpinejs/alpine/discussions/3223) making interop hard, invent own tooling or complex reactivity.
* React / [preact](https://ghub.io/preact) does the job wiring up JS to HTML, but with an extreme of migrating HTML to JSX and enforcing SPA, which is not organic for HTML. Also it doesn't support reactive fields (needs render call).

_Sprae_ takes idea of _templize_ / _alpine_ / _vue_ attributes and builds simple reactive state based on [_@preact/signals_](https://ghub.io/@preact/signals).

* It doesn't break or modify static html markup.
* It falls back to element content if uninitialized.
* It doesn't enforce SPA nor JSX.
* It enables island hydration.
* It reserves minimal syntax space as `:` convention (keeping tree neatly decorated, not scattered).
* Expressions are naturally reactive and incur minimal updates.
* Elements / data API is open and enable easy interop.

It is reminiscent of [XSLT](https://www.w3schools.com/xml/xsl_intro.asp), considered a [buried treasure](https://github.com/bahrus/be-restated) by web-connoisseurs.

## Alternatives

* [Alpine](https://github.com/alpinejs/alpine)
* ~~[Lucia](https://github.com/aidenybai/lucia)~~ deprecated
* [Petite-vue](https://github.com/vuejs/petite-vue)
* [nuejs](https://github.com/nuejs/nuejs)

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
