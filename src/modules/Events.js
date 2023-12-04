// 3: events.js
// 综合参考 http://clappr.github.io/files/src_base_events.js.html#l56
import _ from 'lodash'
const slice = Array.prototype.slice

const eventSplitter = /\s+/

const eventsApi = function(obj, action, name, rest) {
  if (!name) {
    return true
  }

 // Handle event maps.
  if (typeof name === 'object') {
    for (const key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest))
    }
    return false
  }

 // Handle space separated event names.
  if (eventSplitter.test(name)) {
    const names = name.split(eventSplitter)
    for (let i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest))
    }
    return false
  }

  return true
}

const triggerEvents = function(events, args, klass, name) {
  let ev
  let i = -1
  const l = events.length
  const a1 = args[0]
  const a2 = args[1]
  const a3 = args[2]

  switch (args.length) {
    case 0: while (++i < l) { (ev = events[i]).callback.call(ev.ctx) } return
    case 1: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1) } return
    case 2: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2) } return
    case 3: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2, a3) } return
    default: while (++i < l) { (ev = events[i]).callback.apply(ev.ctx, args) } return
  }
}

const Events = function() {}
Events.prototype = {
  constructor: Events,
 /**
  * listen to an event indefinitely, if you want to stop you need to call `off`
  * @method on
  * @param {String} name
  * @param {Function} callback
  * @param {Object} context
  */
  on: function(name, callback, context) {
    if (!eventsApi(this, 'on', name, [callback, context]) || !callback) { return this }
    this._events || (this._events = {})
    const events = this._events[name] || (this._events[name] = [])
    events.push({callback: callback, context: context, ctx: context || this})
    return this
  },

 /**
  * listen to an event only once
  * @method once
  * @param {String} name
  * @param {Function} callback
  * @param {Object} context
  */
  once: function(name, callback, context) {
    if (!eventsApi(this, 'once', name, [callback, context]) || !callback) { return this }
    const once = () => {
      this.off(name, once)
      callback.apply(context || this, arguments)
    }
    once._callback = callback
    return this.on(name, once, context)
  },

 /**
  * stop listening to an event
  * @method off
  * @param {String} name
  * @param {Function} callback
  * @param {Object} context
  */
  off: function(name, callback, context) {
    let retain, ev, events, names, i, l, j, k
    if (!this._events || !eventsApi(this, 'off', name, [callback, context])) { return this }
    if (!name && !callback && !context) {
      this._events = void 0
      return this
    }
    names = name ? [name] : Object.keys(this._events)
   // jshint maxdepth:5
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i]
      events = this._events[name]
      if (events) {
        this._events[name] = retain = []
        if (callback || context) {
          for (j = 0, k = events.length; j < k; j++) {
            ev = events[j]
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
               (context && context !== ev.context)) {
              retain.push(ev)
            }
          }
        }
        if (!retain.length) { delete this._events[name] }
      }
    }
    return this
  },

 /**
  * triggers an event given its `name`
  * @method trigger
  * @param {String} name
  */
  trigger: function(name) {
    if (!this._events) { return this }
    const args = slice.call(arguments, 1)
    if (!eventsApi(this, 'trigger', name, args)) { return this }
    const events = this._events[name]
    const allEvents = this._events.all
    if (events) { triggerEvents(events, args) }
    if (allEvents) { triggerEvents(allEvents, arguments) }
    return this
  },

 /**
  * stop listening an event for a given object
  * @method stopListening
  * @param {Object} obj
  * @param {String} name
  * @param {Function} callback
  */
  stopListening: function(obj, name, callback) {
    let listeningTo = this._listeningTo
    if (!listeningTo) { return this }
    const remove = !name && !callback
    if (!callback && typeof name === 'object') { callback = this }
    if (obj) { (listeningTo = {})[obj._listenId] = obj }
    for (const id in listeningTo) {
      obj = listeningTo[id]
      obj.off(name, callback, this)
      if (remove || Object.keys(obj._events).length === 0) { delete this._listeningTo[id] }
    }
    return this
  }
}

/**
* listen to an event indefinitely for a given `obj`
* @method listenTo
* @param {Object} obj
* @param {String} name
* @param {Function} callback
* @param {Object} context
* @example
* ```javascript
* this.listenTo(this.core.playback, Events.PLAYBACK_PAUSE, this.callback)
* ```
*/
/**
* listen to an event once for a given `obj`
* @method listenToOnce
* @param {Object} obj
* @param {String} name
* @param {Function} callback
* @param {Object} context
* @example
* ```javascript
* this.listenToOnce(this.core.playback, Events.PLAYBACK_PAUSE, this.callback)
* ```
*/
const listenMethods = {listenTo: 'on', listenToOnce: 'once'}

Object.keys(listenMethods).forEach(function(method) {
  Events.prototype[method] = function(obj, name, callback) {
    const listeningTo = this._listeningTo || (this._listeningTo = {})
    const id = obj._listenId || (obj._listenId = _.uniqueId('l'))
    listeningTo[id] = obj
    if (!callback && typeof name === 'object') { callback = this }
    obj[listenMethods[method]](name, callback, this)
    return this
  }.bind(this)
})
export default Events
