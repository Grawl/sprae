// signals-based proxy
import { signal, computed, effect, batch, untracked } from './signal.js'

export const _signals = Symbol('signals'), _change = Symbol('length');

// object store is not lazy
export default function store(values, signals) {
  // redirect for optimized array store
  if (Array.isArray(values)) return list(values)

  // ignore non-objects
  if (!values || (values.constructor !== Object)) return values;

  // ignore existing state as argument
  if (values[_signals] && !signals) return values;

  // NOTE: if you decide to unlazy values, think about large arrays - init upfront can be costly
  let _len = signal(Object.values(values).length)

  signals ||= {}
  signals[_signals] = signals
  signals[_change] = _len

  // proxy conducts prop access to signals
  const state = new Proxy(signals, {
    get: (_, key) => signals[key]?.valueOf(),

    set(_, key, v) {
      console.log('set', key, v)
      if (signals[key]) set(signals[key], v)
      else signals[key] = signal(v)

      return true
    },

    deleteProperty: (_, key) => del(signals, key) && _len.value--
  })

  // take over existing store signals instead of creating new ones
  if (values[_signals]) {
    for (let key in values) signals[key] = values[_signals][key];
  }
  else for (let key in values) {
    // create signal from descriptor
    let desc = Object.getOwnPropertyDescriptor(values, key), s

    if (desc) {
      // getter turns into computed
      if (desc?.get) {
        // stash setter
        (s = computed(desc.get.bind(state)))._set = desc.set?.bind(state);
      }
      else s = desc.value?.peek ? desc.value : signal(store(desc.value))
    }
    else s = signal(store(values[key]))

    signals[key] = s
  };

  return state
}


// array store - signals are lazy since arrays can be very large & expensive
export function list(values) {
  // track last accessed property to find out if .length was directly accessed from expression or via .push/etc method
  let lastProp

  // ignore existing state as argument
  if (values[_signals]) return values;

  // .length signal is stored separately, since it cannot be replaced on array
  let _len = signal(values.length),
    // gotta fill with null since proto methods like .reduce may fail
    signals = Array(values.length).fill(null);

  signals[_signals] = signals
  signals[_change] = _len

  // proxy conducts prop access to signals
  const state = new Proxy(signals, {
    get(_, key) {
      // console.log('get', key)
      // if .length is read within .push/etc - peek signal to avoid recursive subscription
      if (key === 'length') return (Array.prototype[lastProp]) ? _len.peek() : _len.value;

      lastProp = key;

      if (signals[key]) return signals[key].valueOf()

      // I hope reading values here won't diverge from signals
      if (key < signals.length) return (signals[key] = signal(store(values[key]))).value
    },

    set(_, key, v) {
      console.log('set', key, v)
      // .length
      if (key === 'length') {
        // force cleaning up tail
        for (let i = v, l = signals.length; i < l; i++) delete state[i]
        _len.value = signals.length = v;
        return true
      }

      if (signals[key]) set(signals[key], v)
      else signals[key] = signal(store(v))

      // force changing length, if eg. a=[]; a[1]=1 - need to come after setting the item
      if (key >= _len.peek()) _len.value = signals.length = Number(key) + 1

      return true
    },

    deleteProperty: (_, key) => (del(signals, key), true)
  })

  return state

}

// update signal value
function set(s, v) {
  // skip unchanged (although can be handled by last condition - we skip a few checks this way)
  if (v === s.peek());
  // stashed _set for value with getter/setter
  else if (s._set) s._set(v)
  // patch array
  else if (Array.isArray(v) && Array.isArray(s.peek())) {
    const cur = s.peek()
    // if we update plain array (stored in signal) - take over value instead
    if (_change in cur) untracked(() => {
      batch(() => {
        let i = 0, l = v.length;
        for (; i < l; i++) cur[i] = v[i]
        cur.length = l // forces deleting tail signals
      })
    })
    else {
      s.value = v
    }
  }
  // .x = y
  else {
    s.value = store(v)
  }
}

// delete signal
function del(signals, key) {
  // console.log('delete', key)
  const s = signals[key]
  if (s) {
    const del = s[Symbol.dispose]
    if (del) delete s[Symbol.dispose]
    delete signals[key]
    del?.()
    return true
  }
}
