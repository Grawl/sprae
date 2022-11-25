# ∴ spræ [![size](https://img.shields.io/bundlephobia/minzip/sprae?label=size)](https://bundlephobia.com/result?p=sprae)

> Soft DOM hydration with reactive microdirectives

A lightweight essential alternative to [alpine](https://github.com/alpinejs/alpine), [petite-vue](https://github.com/vuejs/petite-vue), [templize](https://github.com/dy/templize) or JSX with better ergonomics[*](#justification).


## Usage

Directives (spraedrops) are attributes starting with `:`. Once initialized, they immediately evaporate.

```html
<div id="container" :if="user">
  Logged in as <span :text="user.displayName">Guest.</span>
</div>

<script type="module">
  import sprae from 'sprae';

  const state = sprae(container, { user: { displayName: 'Dmitry Ivanov' } });
  state.user.displayName = 'dy'; // automatically updates DOM
</script>
```

* `sprae` initializes directives within subtree with data (can include [signals](https://github.com/preactjs/signals) or [reactive values](https://github.com/dy/sube)).
* `state` is object reflecting directives values, changing any of its props updates corresponding directives.

<!--
<details>
<summary><strong>Autoinit</strong></summary>

Sprae can be used without build step or JS, autoinitializing document:

```html
<script src="./sprae.js" defer init="{ count: 0 }"></script>

<span :text="count">
<button :on="{ click: e => count++ }">inc</button>
```

* `:with` defines data for regions of the tree to autoinit sprae on.
* `init` attribute tells sprae to automatically initialize document.

</details>
-->

## Directives

#### `:if="condition"`, `:else`

Controls flow of elements.

```html
<span :if="foo">foo</span>
<span :else :if="bar">bar</span>
<span :else>baz</span>
```

#### `:each="item, idx? in items"`

Create multiple instances of element from list or number range.
Index value starts from 1.

```html
<ul>
  <li :each="item, i in items" :id="`item-${i}`" :data="item" :text="item.label">Untitled</li>
</ul>

<!-- Cases -->
<li :each="item in list" />
<li :each="val, key in obj" />
<li :each="idx in 10" />

<!-- Loop by condition -->
<span :if="items" :each="item in items">...</span>
<span :else>Empty list</span>
```

#### `:text="any"`

Set text content of an element. Rewrites default text content of an element, so that can be used as fallback value:

```html
Welcome, <span :text="user.name">Guest</span>.
```

#### `:value="value"`

Bind value to input, textarea or select.

```html
<div :with="{text: ''}">
  <input :value="text" />
</div>
```

#### `:class="string|array"`

Set class value from either string, array or object.

```html
<div :class="`foo ${bar}`"></div>
<div :class="['foo', 'bar']"></div>
<div :class="{foo: true, bar: false}"></div>
```

#### `:style="string|array|object"`

Set style from object or a string.

```html
<div :style="foo: bar"></div>
<div :style="{foo: 'bar'}"></div>
```

#### `:<prop>="any"`, `:="{...props}"`

Any other directive sets prop value. Noname directive spreads props.

```html
<label :for="name" :text="name" />
<input :="{id:name, name, type, disabled:!name, value}" />
```

#### `:on="{ ...events }"`

Add event listeners.

```html
<button :onclick="handler">Submit</button>
<button :on="{ click(e){}, touch(e){} }">Submit</button>
```

#### `:data="{ foo:1, barBaz:2 }"`

Set [data-*](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) attributes. CamelCase is converted to dash-case.

```html
<input :data="{foo: 1, barBaz: true}" />
```

#### `:aria="{ role:'progressbar' }"`

Set [aria-role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) attributes.

```html
<input type="text" id="jokes" role="combobox" :aria="{
  controls:'joketypes',
  autocomplete:'list',
  expanded:false,
  activeOption:'item1',
  activedescendant:''
}" />
```

#### `:with="data"`

Data scope for a subtree fragment.

```html
<x :with="{ foo: 'bar' }">
  <y :with="{ baz: 'qux' }" :text="foo + baz"></y>
</x>
```

<!--
### Reactive values

Directive expressions are natively reactive, ie. data may contain any async/reactive values, such as:

* _Promise_ / _Thenable_
* _Observable_ / _Subject_ / _Subscribable_
* _AsyncIterable_
* _observ-*_
* etc., see [sube](https://github.com/dy/sube/blob/main/README.md) for the full list.

This way, for example, _@preact/signals_ or _rxjs_ can be connected directly bypassing subscription or reading value.

Update happens when any value changes:

```html
<div id="done" :text="loading ? 'loading' : result">...</div>

<script>
  import sprae from 'sprae';
  import { signals } from '@preact/signals';

  // <div id="done">...</div>

  const loading = signal(true), result = signal(false);

  sprae(done, { loading, result })

  // <div id="done">loading</div>

  setTimeout(() => (loading.value = true, result.value = 'done'), 1000)

  // ... 1s after
  // <div id="done">done</div>
</script>
```

Internally directives trigger updates only for used properties change. They subscribe in weak fashion and get disposed when element is disposed.
-->


## Justification

* [Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks ([parsing table](https://github.com/github/template-parts/issues/24), [svg attributes](https://github.com/github/template-parts/issues/25), [liquid syntax](https://shopify.github.io/liquid/tags/template/#raw) conflict etc). Also ergonomics of `attr="{{}}"` is inferior to `:attr=""` since it creates flash of uninitialized values.
* [Alpine](https://github.com/alpinejs/alpine) / [vue](https://github.com/vuejs/petite-vue) / [lit](https://github.com/lit/lit/tree/main/packages/lit-html) escapes native HTML quirks, but the syntax is a bit scattered: `:attr`, `v-*`,`x-*`, `@evt`, `{{}}` can be expressed with single convention. Besides, functionality is too broad and can be reduced to essence. Also they tend to [self-encapsulate](https://github.com/alpinejs/alpine/discussions/3223), making interop hard.
* [preact](https://ghub.io/preact) with HTML as JSX is a nice way to wire JS to templates, but it doesn't really support reactive fields (needs render call). Also migrating all HTML to JS is an extreme: SPAs are not organic for HTML.

_Sprae_ takes elegant syntax convention of _alpine_ and method of _templize_ to connect any reactive values (like [@preact/signals](https://ghub.io/@preact/signals) or observables) to static HTML.

* It doesn't break static html markup.
* It doesn't intrude native syntax space.
* It falls back to element content if uninitialized.
* It provides means for island hydration.
* It doesn'y introduce syntax scatter.
* It supports simple expressions with exposed reactive data types.


<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
