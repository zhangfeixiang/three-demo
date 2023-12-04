const jQueryTap = function (t, e) {
    var n, i, r, o = "._tap",
        a = "._tapActive",
        s = "tap",
        c = "clientX clientY screenX screenY pageX pageY".split(" "),
        u = {
            count: 0,
            event: 0
        },
        l = function (t, n) {
            var i = n.originalEvent,
                r = e.Event(i);
            r.type = t;
            for (var o = 0,
                    a = c.length; a > o; o++) r[c[o]] = n[c[o]];
            return r
        },
        h = function (t) {
            if (t.isTrigger) return !1;
            var n = u.event,
                i = Math.abs(t.pageX - n.pageX),
                r = Math.abs(t.pageY - n.pageY),
                o = Math.max(i, r);
            return t.timeStamp - n.timeStamp < e.tap.TIME_DELTA && o < e.tap.POSITION_DELTA && (!n.touches || 1 === u.count) && d.isTracking
        },
        f = function (t) {
            if (!r) return !1;
            var n = Math.abs(t.pageX - r.pageX),
                i = Math.abs(t.pageY - r.pageY),
                o = Math.max(n, i);
            return Math.abs(t.timeStamp - r.timeStamp) < 750 && o < e.tap.POSITION_DELTA
        },
        p = function (t) {
            if (0 === t.type.indexOf("touch")) {
                t.touches = t.originalEvent.changedTouches;
                for (var e = t.touches[0], n = 0, i = c.length; i > n; n++) t[c[n]] = e[c[n]]
            }
            t.timeStamp = Date.now ? Date.now() : +new Date
        },
        d = {
            isEnabled: !1,
            isTracking: !1,
            enable: function () {
                d.isEnabled || (d.isEnabled = !0, n = e(t.body).on("touchstart" + o, d.onStart).on("mousedown" + o, d.onStart).on("click" + o, d.onClick))
            },
            disable: function () {
                d.isEnabled && (d.isEnabled = !1, n.off(o))
            },
            onStart: function (t) {
                t.isTrigger || (p(t), e.tap.LEFT_BUTTON_ONLY && !t.touches && 1 !== t.which || (t.touches && (u.count = t.touches.length), d.isTracking || !t.touches && f(t) || (d.isTracking = !0, u.event = t, t.touches ? (r = t, n.on("touchend" + o + a, d.onEnd).on("touchcancel" + o + a, d.onCancel)) : n.on("mouseup" + o + a, d.onEnd))))
            },
            onEnd: function (t) {
                var n;
                t.isTrigger || (p(t), h(t) && (n = l(s, t), i = n, e(u.event.target).trigger(n)), d.onCancel(t))
            },
            onCancel: function (t) {
                t && "touchcancel" === t.type && t.preventDefault(),
                    d.isTracking = !1,
                    n.off(a)
            },
            onClick: function (t) {
                return !t.isTrigger && i && i.isDefaultPrevented() && i.target === t.target && i.pageX === t.pageX && i.pageY === t.pageY && t.timeStamp - i.timeStamp < 750 ? (i = null, !1) : void 0
            }
        };
    e(t).ready(d.enable);
    return {
        POSITION_DELTA: 10,
        TIME_DELTA: 400,
        LEFT_BUTTON_ONLY: !0
    }
}
export default jQueryTap