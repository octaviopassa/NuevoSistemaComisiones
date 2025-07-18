import jQuery from "jquery";
import $ from "jquery";
import bootbox from "bootbox";
(function () {
  var AjaxMonitor,
    Bar,
    DocumentMonitor,
    ElementMonitor,
    ElementTracker,
    EventLagMonitor,
    Evented,
    Events,
    NoTargetError,
    Pace,
    RequestIntercept,
    SOURCE_KEYS,
    Scaler,
    SocketRequestTracker,
    XHRRequestTracker,
    animation,
    avgAmplitude,
    bar,
    cancelAnimation,
    cancelAnimationFrame,
    defaultOptions,
    extend,
    extendNative,
    getFromDOM,
    getIntercept,
    handlePushState,
    ignoreStack,
    init,
    now,
    options,
    requestAnimationFrame,
    result,
    runAnimation,
    scalers,
    shouldIgnoreURL,
    shouldTrack,
    source,
    sources,
    uniScaler,
    _WebSocket,
    _XDomainRequest,
    _XMLHttpRequest,
    _i,
    _intercept,
    _len,
    _pushState,
    _ref,
    _ref1,
    _replaceState,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    },
    __indexOf =
      [].indexOf ||
      function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      };

  defaultOptions = {
    catchupTime: 100,
    initialRate: 0.03,
    minTime: 250,
    ghostTime: 100,
    maxProgressPerFrame: 20,
    easeFactor: 1.25,
    startOnPageLoad: true,
    restartOnPushState: true,
    restartOnRequestAfter: 500,
    target: "body",
    elements: {
      checkInterval: 100,
      selectors: ["body"],
    },
    eventLag: {
      minSamples: 10,
      sampleCount: 3,
      lagThreshold: 3,
    },
    ajax: {
      trackMethods: ["GET"],
      trackWebSockets: true,
      ignoreURLs: [],
    },
  };

  now = function () {
    var _ref;
    return (_ref =
      typeof performance !== "undefined" && performance !== null
        ? typeof performance.now === "function"
          ? performance.now()
          : void 0
        : void 0) != null
      ? _ref
      : +new Date();
  };

  requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  cancelAnimationFrame =
    window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  if (requestAnimationFrame == null) {
    requestAnimationFrame = function (fn) {
      return setTimeout(fn, 50);
    };
    cancelAnimationFrame = function (id) {
      return clearTimeout(id);
    };
  }

  runAnimation = function (fn) {
    var last, tick;
    last = now();
    tick = function () {
      var diff;
      diff = now() - last;
      if (diff >= 33) {
        last = now();
        return fn(diff, function () {
          return requestAnimationFrame(tick);
        });
      } else {
        return setTimeout(tick, 33 - diff);
      }
    };
    return tick();
  };

  result = function () {
    var args, key, obj;
    (obj = arguments[0]),
      (key = arguments[1]),
      (args = 3 <= arguments.length ? __slice.call(arguments, 2) : []);
    if (typeof obj[key] === "function") {
      return obj[key].apply(obj, args);
    } else {
      return obj[key];
    }
  };

  extend = function () {
    var key, out, source, sources, val, _i, _len;
    (out = arguments[0]),
      (sources = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      if (source) {
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          val = source[key];
          if (
            out[key] != null &&
            typeof out[key] === "object" &&
            val != null &&
            typeof val === "object"
          ) {
            extend(out[key], val);
          } else {
            out[key] = val;
          }
        }
      }
    }
    return out;
  };

  avgAmplitude = function (arr) {
    var count, sum, v, _i, _len;
    sum = count = 0;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      v = arr[_i];
      sum += Math.abs(v);
      count++;
    }
    return sum / count;
  };

  getFromDOM = function (key, json) {
    var data, e, el;
    if (key == null) {
      key = "options";
    }
    if (json == null) {
      json = true;
    }
    el = document.querySelector("[data-pace-" + key + "]");
    if (!el) {
      return;
    }
    data = el.getAttribute("data-pace-" + key);
    if (!json) {
      return data;
    }
    try {
      return JSON.parse(data);
    } catch (_error) {
      e = _error;
      return typeof console !== "undefined" && console !== null
        ? console.error("Error parsing inline pace options", e)
        : void 0;
    }
  };

  Evented = (function () {
    function Evented() {}

    Evented.prototype.on = function (event, handler, ctx, once) {
      var _base;
      if (once == null) {
        once = false;
      }
      if (this.bindings == null) {
        this.bindings = {};
      }
      if ((_base = this.bindings)[event] == null) {
        _base[event] = [];
      }
      return this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once,
      });
    };

    Evented.prototype.once = function (event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    Evented.prototype.off = function (event, handler) {
      var i, _ref, _results;
      if (((_ref = this.bindings) != null ? _ref[event] : void 0) == null) {
        return;
      }
      if (handler == null) {
        return delete this.bindings[event];
      } else {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    Evented.prototype.trigger = function () {
      var args, ctx, event, handler, i, once, _ref, _ref1, _results;
      (event = arguments[0]),
        (args = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
      if ((_ref = this.bindings) != null ? _ref[event] : void 0) {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          (_ref1 = this.bindings[event][i]),
            (handler = _ref1.handler),
            (ctx = _ref1.ctx),
            (once = _ref1.once);
          handler.apply(ctx != null ? ctx : this, args);
          if (once) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    return Evented;
  })();

  Pace = window.Pace || {};

  window.Pace = Pace;

  extend(Pace, Evented.prototype);

  options = Pace.options = extend(
    {},
    defaultOptions,
    window.paceOptions,
    getFromDOM()
  );

  _ref = ["ajax", "document", "eventLag", "elements"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (options[source] === true) {
      options[source] = defaultOptions[source];
    }
  }

  NoTargetError = (function (_super) {
    __extends(NoTargetError, _super);

    function NoTargetError() {
      _ref1 = NoTargetError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return NoTargetError;
  })(Error);

  Bar = (function () {
    function Bar() {
      this.progress = 0;
    }

    Bar.prototype.getElement = function () {
      var targetElement;
      if (this.el == null) {
        targetElement = document.querySelector(options.target);
        if (!targetElement) {
          throw new NoTargetError();
        }
        this.el = document.createElement("div");
        this.el.className = "pace pace-active";
        document.body.className = document.body.className.replace(
          /pace-done/g,
          ""
        );
        document.body.className += " pace-running";
        this.el.innerHTML =
          '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>';
        if (targetElement.firstChild != null) {
          targetElement.insertBefore(this.el, targetElement.firstChild);
        } else {
          targetElement.appendChild(this.el);
        }
      }
      return this.el;
    };

    Bar.prototype.finish = function () {
      var el;
      el = this.getElement();
      el.className = el.className.replace("pace-active", "");
      el.className += " pace-inactive";
      document.body.className = document.body.className.replace(
        "pace-running",
        ""
      );
      return (document.body.className += " pace-done");
    };

    Bar.prototype.update = function (prog) {
      this.progress = prog;
      return this.render();
    };

    Bar.prototype.destroy = function () {
      try {
        this.getElement().parentNode.removeChild(this.getElement());
      } catch (_error) {
        NoTargetError = _error;
      }
      return (this.el = void 0);
    };

    Bar.prototype.render = function () {
      var el, key, progressStr, transform, _j, _len1, _ref2;
      if (document.querySelector(options.target) == null) {
        return false;
      }
      el = this.getElement();
      transform = "translate3d(" + this.progress + "%, 0, 0)";
      _ref2 = ["webkitTransform", "msTransform", "transform"];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        key = _ref2[_j];
        el.children[0].style[key] = transform;
      }
      if (
        !this.lastRenderedProgress ||
        this.lastRenderedProgress | (0 !== this.progress) | 0
      ) {
        el.children[0].setAttribute(
          "data-progress-text",
          "" + (this.progress | 0) + "%"
        );
        if (this.progress >= 100) {
          progressStr = "99";
        } else {
          progressStr = this.progress < 10 ? "0" : "";
          progressStr += this.progress | 0;
        }
        el.children[0].setAttribute("data-progress", "" + progressStr);
      }
      return (this.lastRenderedProgress = this.progress);
    };

    Bar.prototype.done = function () {
      return this.progress >= 100;
    };

    return Bar;
  })();

  Events = (function () {
    function Events() {
      this.bindings = {};
    }

    Events.prototype.trigger = function (name, val) {
      var binding, _j, _len1, _ref2, _results;
      if (this.bindings[name] != null) {
        _ref2 = this.bindings[name];
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          binding = _ref2[_j];
          _results.push(binding.call(this, val));
        }
        return _results;
      }
    };

    Events.prototype.on = function (name, fn) {
      var _base;
      if ((_base = this.bindings)[name] == null) {
        _base[name] = [];
      }
      return this.bindings[name].push(fn);
    };

    return Events;
  })();

  _XMLHttpRequest = window.XMLHttpRequest;

  _XDomainRequest = window.XDomainRequest;

  _WebSocket = window.WebSocket;

  extendNative = function (to, from) {
    var e, key, _results;
    _results = [];
    for (key in from.prototype) {
      try {
        if (to[key] == null && typeof from[key] !== "function") {
          if (typeof Object.defineProperty === "function") {
            _results.push(
              Object.defineProperty(to, key, {
                get: function () {
                  return from.prototype[key];
                },
                configurable: true,
                enumerable: true,
              })
            );
          } else {
            _results.push((to[key] = from.prototype[key]));
          }
        } else {
          _results.push(void 0);
        }
      } catch (_error) {
        e = _error;
      }
    }
    return _results;
  };

  ignoreStack = [];

  Pace.ignore = function () {
    var args, fn, ret;
    (fn = arguments[0]),
      (args = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
    ignoreStack.unshift("ignore");
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  Pace.track = function () {
    var args, fn, ret;
    (fn = arguments[0]),
      (args = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
    ignoreStack.unshift("track");
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  shouldTrack = function (method) {
    var _ref2;
    if (method == null) {
      method = "GET";
    }
    if (ignoreStack[0] === "track") {
      return "force";
    }
    if (!ignoreStack.length && options.ajax) {
      if (method === "socket" && options.ajax.trackWebSockets) {
        return true;
      } else if (
        ((_ref2 = method.toUpperCase()),
        __indexOf.call(options.ajax.trackMethods, _ref2) >= 0)
      ) {
        return true;
      }
    }
    return false;
  };

  RequestIntercept = (function (_super) {
    __extends(RequestIntercept, _super);

    function RequestIntercept() {
      var monitorXHR,
        _this = this;
      RequestIntercept.__super__.constructor.apply(this, arguments);
      monitorXHR = function (req) {
        var _open;
        _open = req.open;
        return (req.open = function (type, url, async) {
          if (shouldTrack(type)) {
            _this.trigger("request", {
              type: type,
              url: url,
              request: req,
            });
          }
          return _open.apply(req, arguments);
        });
      };
      window.XMLHttpRequest = function (flags) {
        var req;
        req = new _XMLHttpRequest(flags);
        monitorXHR(req);
        return req;
      };
      try {
        extendNative(window.XMLHttpRequest, _XMLHttpRequest);
      } catch (_error) {}
      if (_XDomainRequest != null) {
        window.XDomainRequest = function () {
          var req;
          req = new _XDomainRequest();
          monitorXHR(req);
          return req;
        };
        try {
          extendNative(window.XDomainRequest, _XDomainRequest);
        } catch (_error) {}
      }
      if (_WebSocket != null && options.ajax.trackWebSockets) {
        window.WebSocket = function (url, protocols) {
          var req;
          if (protocols != null) {
            req = new _WebSocket(url, protocols);
          } else {
            req = new _WebSocket(url);
          }
          if (shouldTrack("socket")) {
            _this.trigger("request", {
              type: "socket",
              url: url,
              protocols: protocols,
              request: req,
            });
          }
          return req;
        };
        try {
          extendNative(window.WebSocket, _WebSocket);
        } catch (_error) {}
      }
    }

    return RequestIntercept;
  })(Events);

  _intercept = null;

  getIntercept = function () {
    if (_intercept == null) {
      _intercept = new RequestIntercept();
    }
    return _intercept;
  };

  shouldIgnoreURL = function (url) {
    var pattern, _j, _len1, _ref2;
    _ref2 = options.ajax.ignoreURLs;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      pattern = _ref2[_j];
      if (typeof pattern === "string") {
        if (url.indexOf(pattern) !== -1) {
          return true;
        }
      } else {
        if (pattern.test(url)) {
          return true;
        }
      }
    }
    return false;
  };

  getIntercept().on("request", function (_arg) {
    var after, args, request, type, url;
    (type = _arg.type), (request = _arg.request), (url = _arg.url);
    if (shouldIgnoreURL(url)) {
      return;
    }
    if (
      !Pace.running &&
      (options.restartOnRequestAfter !== false || shouldTrack(type) === "force")
    ) {
      args = arguments;
      after = options.restartOnRequestAfter || 0;
      if (typeof after === "boolean") {
        after = 0;
      }
      return setTimeout(function () {
        var stillActive, _j, _len1, _ref2, _ref3, _results;
        if (type === "socket") {
          stillActive = request.readyState < 2;
        } else {
          stillActive = 0 < (_ref2 = request.readyState) && _ref2 < 4;
        }
        if (stillActive) {
          Pace.restart();
          _ref3 = Pace.sources;
          _results = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            source = _ref3[_j];
            if (source instanceof AjaxMonitor) {
              source.watch.apply(source, args);
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }, after);
    }
  });

  AjaxMonitor = (function () {
    function AjaxMonitor() {
      var _this = this;
      this.elements = [];
      getIntercept().on("request", function () {
        return _this.watch.apply(_this, arguments);
      });
    }

    AjaxMonitor.prototype.watch = function (_arg) {
      var request, tracker, type, url;
      (type = _arg.type), (request = _arg.request), (url = _arg.url);
      if (shouldIgnoreURL(url)) {
        return;
      }
      if (type === "socket") {
        tracker = new SocketRequestTracker(request);
      } else {
        tracker = new XHRRequestTracker(request);
      }
      return this.elements.push(tracker);
    };

    return AjaxMonitor;
  })();

  XHRRequestTracker = (function () {
    function XHRRequestTracker(request) {
      var event,
        size,
        _j,
        _len1,
        _onreadystatechange,
        _ref2,
        _this = this;
      this.progress = 0;
      if (window.ProgressEvent != null) {
        size = null;
        request.addEventListener(
          "progress",
          function (evt) {
            if (evt.lengthComputable) {
              return (_this.progress = (100 * evt.loaded) / evt.total);
            } else {
              return (_this.progress =
                _this.progress + (100 - _this.progress) / 2);
            }
          },
          false
        );
        _ref2 = ["load", "abort", "timeout", "error"];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          event = _ref2[_j];
          request.addEventListener(
            event,
            function () {
              return (_this.progress = 100);
            },
            false
          );
        }
      } else {
        _onreadystatechange = request.onreadystatechange;
        request.onreadystatechange = function () {
          var _ref3;
          if ((_ref3 = request.readyState) === 0 || _ref3 === 4) {
            _this.progress = 100;
          } else if (request.readyState === 3) {
            _this.progress = 50;
          }
          return typeof _onreadystatechange === "function"
            ? _onreadystatechange.apply(null, arguments)
            : void 0;
        };
      }
    }

    return XHRRequestTracker;
  })();

  SocketRequestTracker = (function () {
    function SocketRequestTracker(request) {
      var event,
        _j,
        _len1,
        _ref2,
        _this = this;
      this.progress = 0;
      _ref2 = ["error", "open"];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        event = _ref2[_j];
        request.addEventListener(
          event,
          function () {
            return (_this.progress = 100);
          },
          false
        );
      }
    }

    return SocketRequestTracker;
  })();

  ElementMonitor = (function () {
    function ElementMonitor(options) {
      var selector, _j, _len1, _ref2;
      if (options == null) {
        options = {};
      }
      this.elements = [];
      if (options.selectors == null) {
        options.selectors = [];
      }
      _ref2 = options.selectors;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        selector = _ref2[_j];
        this.elements.push(new ElementTracker(selector));
      }
    }

    return ElementMonitor;
  })();

  ElementTracker = (function () {
    function ElementTracker(selector) {
      this.selector = selector;
      this.progress = 0;
      this.check();
    }

    ElementTracker.prototype.check = function () {
      var _this = this;
      if (document.querySelector(this.selector)) {
        return this.done();
      } else {
        return setTimeout(function () {
          return _this.check();
        }, options.elements.checkInterval);
      }
    };

    ElementTracker.prototype.done = function () {
      return (this.progress = 100);
    };

    return ElementTracker;
  })();

  DocumentMonitor = (function () {
    DocumentMonitor.prototype.states = {
      loading: 0,
      interactive: 50,
      complete: 100,
    };

    function DocumentMonitor() {
      var _onreadystatechange,
        _ref2,
        _this = this;
      this.progress =
        (_ref2 = this.states[document.readyState]) != null ? _ref2 : 100;
      _onreadystatechange = document.onreadystatechange;
      document.onreadystatechange = function () {
        if (_this.states[document.readyState] != null) {
          _this.progress = _this.states[document.readyState];
        }
        return typeof _onreadystatechange === "function"
          ? _onreadystatechange.apply(null, arguments)
          : void 0;
      };
    }

    return DocumentMonitor;
  })();

  EventLagMonitor = (function () {
    function EventLagMonitor() {
      var avg,
        interval,
        last,
        points,
        samples,
        _this = this;
      this.progress = 0;
      avg = 0;
      samples = [];
      points = 0;
      last = now();
      interval = setInterval(function () {
        var diff;
        diff = now() - last - 50;
        last = now();
        samples.push(diff);
        if (samples.length > options.eventLag.sampleCount) {
          samples.shift();
        }
        avg = avgAmplitude(samples);
        if (
          ++points >= options.eventLag.minSamples &&
          avg < options.eventLag.lagThreshold
        ) {
          _this.progress = 100;
          return clearInterval(interval);
        } else {
          return (_this.progress = 100 * (3 / (avg + 3)));
        }
      }, 50);
    }

    return EventLagMonitor;
  })();

  Scaler = (function () {
    function Scaler(source) {
      this.source = source;
      this.last = this.sinceLastUpdate = 0;
      this.rate = options.initialRate;
      this.catchup = 0;
      this.progress = this.lastProgress = 0;
      if (this.source != null) {
        this.progress = result(this.source, "progress");
      }
    }

    Scaler.prototype.tick = function (frameTime, val) {
      var scaling;
      if (val == null) {
        val = result(this.source, "progress");
      }
      if (val >= 100) {
        this.done = true;
      }
      if (val === this.last) {
        this.sinceLastUpdate += frameTime;
      } else {
        if (this.sinceLastUpdate) {
          this.rate = (val - this.last) / this.sinceLastUpdate;
        }
        this.catchup = (val - this.progress) / options.catchupTime;
        this.sinceLastUpdate = 0;
        this.last = val;
      }
      if (val > this.progress) {
        this.progress += this.catchup * frameTime;
      }
      scaling = 1 - Math.pow(this.progress / 100, options.easeFactor);
      this.progress += scaling * this.rate * frameTime;
      this.progress = Math.min(
        this.lastProgress + options.maxProgressPerFrame,
        this.progress
      );
      this.progress = Math.max(0, this.progress);
      this.progress = Math.min(100, this.progress);
      this.lastProgress = this.progress;
      return this.progress;
    };

    return Scaler;
  })();

  sources = null;

  scalers = null;

  bar = null;

  uniScaler = null;

  animation = null;

  cancelAnimation = null;

  Pace.running = false;

  handlePushState = function () {
    if (options.restartOnPushState) {
      return Pace.restart();
    }
  };

  if (window.history.pushState != null) {
    _pushState = window.history.pushState;
    window.history.pushState = function () {
      handlePushState();
      return _pushState.apply(window.history, arguments);
    };
  }

  if (window.history.replaceState != null) {
    _replaceState = window.history.replaceState;
    window.history.replaceState = function () {
      handlePushState();
      return _replaceState.apply(window.history, arguments);
    };
  }

  SOURCE_KEYS = {
    ajax: AjaxMonitor,
    elements: ElementMonitor,
    document: DocumentMonitor,
    eventLag: EventLagMonitor,
  };

  (init = function () {
    var type, _j, _k, _len1, _len2, _ref2, _ref3, _ref4;
    Pace.sources = sources = [];
    _ref2 = ["ajax", "elements", "document", "eventLag"];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      type = _ref2[_j];
      if (options[type] !== false) {
        sources.push(new SOURCE_KEYS[type](options[type]));
      }
    }
    _ref4 = (_ref3 = options.extraSources) != null ? _ref3 : [];
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      source = _ref4[_k];
      sources.push(new source(options));
    }
    Pace.bar = bar = new Bar();
    scalers = [];
    return (uniScaler = new Scaler());
  })();

  Pace.stop = function () {
    Pace.trigger("stop");
    Pace.running = false;
    bar.destroy();
    cancelAnimation = true;
    if (animation != null) {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animation);
      }
      animation = null;
    }
    return init();
  };

  Pace.restart = function () {
    Pace.trigger("restart");
    Pace.stop();
    return Pace.start();
  };

  Pace.go = function () {
    var start;
    Pace.running = true;
    bar.render();
    start = now();
    cancelAnimation = false;
    return (animation = runAnimation(function (frameTime, enqueueNextFrame) {
      var avg,
        count,
        done,
        element,
        elements,
        i,
        j,
        remaining,
        scaler,
        scalerList,
        sum,
        _j,
        _k,
        _len1,
        _len2,
        _ref2;
      remaining = 100 - bar.progress;
      count = sum = 0;
      done = true;
      for (i = _j = 0, _len1 = sources.length; _j < _len1; i = ++_j) {
        source = sources[i];
        scalerList = scalers[i] != null ? scalers[i] : (scalers[i] = []);
        elements = (_ref2 = source.elements) != null ? _ref2 : [source];
        for (j = _k = 0, _len2 = elements.length; _k < _len2; j = ++_k) {
          element = elements[j];
          scaler =
            scalerList[j] != null
              ? scalerList[j]
              : (scalerList[j] = new Scaler(element));
          done &= scaler.done;
          if (scaler.done) {
            continue;
          }
          count++;
          sum += scaler.tick(frameTime);
        }
      }
      avg = sum / count;
      bar.update(uniScaler.tick(frameTime, avg));
      if (bar.done() || done || cancelAnimation) {
        bar.update(100);
        Pace.trigger("done");
        return setTimeout(function () {
          bar.finish();
          Pace.running = false;
          return Pace.trigger("hide");
        }, Math.max(
          options.ghostTime,
          Math.max(options.minTime - (now() - start), 0)
        ));
      } else {
        return enqueueNextFrame();
      }
    }));
  };

  Pace.start = function (_options) {
    extend(options, _options);
    Pace.running = true;
    try {
      bar.render();
    } catch (_error) {
      NoTargetError = _error;
    }
    if (!document.querySelector(".pace")) {
      return setTimeout(Pace.start, 50);
    } else {
      Pace.trigger("start");
      return Pace.go();
    }
  };

  if (typeof define === "function" && define.amd) {
    define(["pace"], function () {
      return Pace;
    });
  } else if (typeof exports === "object") {
    module.exports = Pace;
  } else {
    if (options.startOnPageLoad) {
      Pace.start();
    }
  }
}).call(this);

/*!
 * jQuery JavaScript Library v3.5.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2020-05-04T22:49Z
 */
(function (global, factory) {
  "use strict";

  if (typeof module === "object" && typeof module.exports === "object") {
    // For CommonJS and CommonJS-like environments where a proper `window`
    // is present, execute the factory and get jQuery.
    // For environments that do not have a `window` with a `document`
    // (such as Node.js), expose a factory as module.exports.
    // This accentuates the need for the creation of a real `window`.
    // e.g. var jQuery = require("jquery")(window);
    // See ticket #14549 for more info.
    module.exports = global.document
      ? factory(global, true)
      : function (w) {
          if (!w.document) {
            throw new Error("jQuery requires a window with a document");
          }
          return factory(w);
        };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
  // Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
  // throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
  // arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
  // enough that all such attempts are guarded in a try block.
  "use strict";

  var arr = [];

  var getProto = Object.getPrototypeOf;

  var slice = arr.slice;

  var flat = arr.flat
    ? function (array) {
        return arr.flat.call(array);
      }
    : function (array) {
        return arr.concat.apply([], array);
      };

  var push = arr.push;

  var indexOf = arr.indexOf;

  var class2type = {};

  var toString = class2type.toString;

  var hasOwn = class2type.hasOwnProperty;

  var fnToString = hasOwn.toString;

  var ObjectFunctionString = fnToString.call(Object);

  var support = {};

  var isFunction = function isFunction(obj) {
    // Support: Chrome <=57, Firefox <=52
    // In some browsers, typeof returns "function" for HTML <object> elements
    // (i.e., `typeof document.createElement( "object" ) === "function"`).
    // We don't want to classify *any* DOM node as a function.
    return typeof obj === "function" && typeof obj.nodeType !== "number";
  };

  var isWindow = function isWindow(obj) {
    return obj != null && obj === obj.window;
  };

  var document = window.document;

  var preservedScriptAttributes = {
    type: true,
    src: true,
    nonce: true,
    noModule: true,
  };

  function DOMEval(code, node, doc) {
    doc = doc || document;

    var i,
      val,
      script = doc.createElement("script");

    script.text = code;
    if (node) {
      for (i in preservedScriptAttributes) {
        // Support: Firefox 64+, Edge 18+
        // Some browsers don't support the "nonce" property on scripts.
        // On the other hand, just using `getAttribute` is not enough as
        // the `nonce` attribute is reset to an empty string whenever it
        // becomes browsing-context connected.
        // See https://github.com/whatwg/html/issues/2369
        // See https://html.spec.whatwg.org/#nonce-attributes
        // The `node.getAttribute` check was added for the sake of
        // `jQuery.globalEval` so that it can fake a nonce-containing node
        // via an object.
        val = node[i] || (node.getAttribute && node.getAttribute(i));
        if (val) {
          script.setAttribute(i, val);
        }
      }
    }
    doc.head.appendChild(script).parentNode.removeChild(script);
  }

  function toType(obj) {
    if (obj == null) {
      return obj + "";
    }

    // Support: Android <=2.3 only (functionish RegExp)
    return typeof obj === "object" || typeof obj === "function"
      ? class2type[toString.call(obj)] || "object"
      : typeof obj;
  }
  /* global Symbol */
  // Defining this global in .eslintrc.json would create a danger of using the global
  // unguarded in another place, it seems safer to define global only for this module

  var version = "3.5.1",
    // Define a local copy of jQuery
    jQuery = function (selector, context) {
      // The jQuery object is actually just the init constructor 'enhanced'
      // Need init if jQuery is called (just allow error to be thrown if not included)
      return new jQuery.fn.init(selector, context);
    };

  jQuery.fn = jQuery.prototype = {
    // The current version of jQuery being used
    jquery: version,

    constructor: jQuery,

    // The default length of a jQuery object is 0
    length: 0,

    toArray: function () {
      return slice.call(this);
    },

    // Get the Nth element in the matched element set OR
    // Get the whole matched element set as a clean array
    get: function (num) {
      // Return all the elements in a clean array
      if (num == null) {
        return slice.call(this);
      }

      // Return just the one element from the set
      return num < 0 ? this[num + this.length] : this[num];
    },

    // Take an array of elements and push it onto the stack
    // (returning the new matched element set)
    pushStack: function (elems) {
      // Build a new jQuery matched element set
      var ret = jQuery.merge(this.constructor(), elems);

      // Add the old object onto the stack (as a reference)
      ret.prevObject = this;

      // Return the newly-formed element set
      return ret;
    },

    // Execute a callback for every element in the matched set.
    each: function (callback) {
      return jQuery.each(this, callback);
    },

    map: function (callback) {
      return this.pushStack(
        jQuery.map(this, function (elem, i) {
          return callback.call(elem, i, elem);
        })
      );
    },

    slice: function () {
      return this.pushStack(slice.apply(this, arguments));
    },

    first: function () {
      return this.eq(0);
    },

    last: function () {
      return this.eq(-1);
    },

    even: function () {
      return this.pushStack(
        jQuery.grep(this, function (_elem, i) {
          return (i + 1) % 2;
        })
      );
    },

    odd: function () {
      return this.pushStack(
        jQuery.grep(this, function (_elem, i) {
          return i % 2;
        })
      );
    },

    eq: function (i) {
      var len = this.length,
        j = +i + (i < 0 ? len : 0);
      return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
    },

    end: function () {
      return this.prevObject || this.constructor();
    },

    // For internal use only.
    // Behaves like an Array's method, not like a jQuery method.
    push: push,
    sort: arr.sort,
    splice: arr.splice,
  };

  jQuery.extend = jQuery.fn.extend = function () {
    var options,
      name,
      src,
      copy,
      copyIsArray,
      clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
      deep = target;

      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !isFunction(target)) {
      target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }

    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          copy = options[name];

          // Prevent Object.prototype pollution
          // Prevent never-ending loop
          if (name === "__proto__" || target === copy) {
            continue;
          }

          // Recurse if we're merging plain objects or arrays
          if (
            deep &&
            copy &&
            (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
          ) {
            src = target[name];

            // Ensure proper type for the source value
            if (copyIsArray && !Array.isArray(src)) {
              clone = [];
            } else if (!copyIsArray && !jQuery.isPlainObject(src)) {
              clone = {};
            } else {
              clone = src;
            }
            copyIsArray = false;

            // Never move original objects, clone them
            target[name] = jQuery.extend(deep, clone, copy);

            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
  };

  jQuery.extend({
    // Unique for each copy of jQuery on the page
    expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

    // Assume jQuery is ready without the ready module
    isReady: true,

    error: function (msg) {
      throw new Error(msg);
    },

    noop: function () {},

    isPlainObject: function (obj) {
      var proto, Ctor;

      // Detect obvious negatives
      // Use toString instead of jQuery.type to catch host objects
      if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
      }

      proto = getProto(obj);

      // Objects with no prototype (e.g., `Object.create( null )`) are plain
      if (!proto) {
        return true;
      }

      // Objects with prototype are plain iff they were constructed by a global Object function
      Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
      return (
        typeof Ctor === "function" &&
        fnToString.call(Ctor) === ObjectFunctionString
      );
    },

    isEmptyObject: function (obj) {
      var name;

      for (name in obj) {
        return false;
      }
      return true;
    },

    // Evaluates a script in a provided context; falls back to the global one
    // if not specified.
    globalEval: function (code, options, doc) {
      DOMEval(code, { nonce: options && options.nonce }, doc);
    },

    each: function (obj, callback) {
      var length,
        i = 0;

      if (isArrayLike(obj)) {
        length = obj.length;
        for (; i < length; i++) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break;
          }
        }
      } else {
        for (i in obj) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break;
          }
        }
      }

      return obj;
    },

    // results is for internal usage only
    makeArray: function (arr, results) {
      var ret = results || [];

      if (arr != null) {
        if (isArrayLike(Object(arr))) {
          jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
        } else {
          push.call(ret, arr);
        }
      }

      return ret;
    },

    inArray: function (elem, arr, i) {
      return arr == null ? -1 : indexOf.call(arr, elem, i);
    },

    // Support: Android <=4.0 only, PhantomJS 1 only
    // push.apply(_, arraylike) throws on ancient WebKit
    merge: function (first, second) {
      var len = +second.length,
        j = 0,
        i = first.length;

      for (; j < len; j++) {
        first[i++] = second[j];
      }

      first.length = i;

      return first;
    },

    grep: function (elems, callback, invert) {
      var callbackInverse,
        matches = [],
        i = 0,
        length = elems.length,
        callbackExpect = !invert;

      // Go through the array, only saving the items
      // that pass the validator function
      for (; i < length; i++) {
        callbackInverse = !callback(elems[i], i);
        if (callbackInverse !== callbackExpect) {
          matches.push(elems[i]);
        }
      }

      return matches;
    },

    // arg is for internal usage only
    map: function (elems, callback, arg) {
      var length,
        value,
        i = 0,
        ret = [];

      // Go through the array, translating each of the items to their new values
      if (isArrayLike(elems)) {
        length = elems.length;
        for (; i < length; i++) {
          value = callback(elems[i], i, arg);

          if (value != null) {
            ret.push(value);
          }
        }

        // Go through every key on the object,
      } else {
        for (i in elems) {
          value = callback(elems[i], i, arg);

          if (value != null) {
            ret.push(value);
          }
        }
      }

      // Flatten any nested arrays
      return flat(ret);
    },

    // A global GUID counter for objects
    guid: 1,

    // jQuery.support is not used in Core but other projects attach their
    // properties to it so it needs to exist.
    support: support,
  });

  if (typeof Symbol === "function") {
    jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
  }

  // Populate the class2type map
  jQuery.each(
    "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
      " "
    ),
    function (_i, name) {
      class2type["[object " + name + "]"] = name.toLowerCase();
    }
  );

  function isArrayLike(obj) {
    // Support: real iOS 8.2 only (not reproducible in simulator)
    // `in` check used to prevent JIT error (gh-2145)
    // hasOwn isn't used here due to false negatives
    // regarding Nodelist length in IE
    var length = !!obj && "length" in obj && obj.length,
      type = toType(obj);

    if (isFunction(obj) || isWindow(obj)) {
      return false;
    }

    return (
      type === "array" ||
      length === 0 ||
      (typeof length === "number" && length > 0 && length - 1 in obj)
    );
  }
  var Sizzle =
    /*!
     * Sizzle CSS Selector Engine v2.3.5
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://js.foundation/
     *
     * Date: 2020-03-14
     */
    (function (window) {
      var i,
        support,
        Expr,
        getText,
        isXML,
        tokenize,
        compile,
        select,
        outermostContext,
        sortInput,
        hasDuplicate,
        // Local document vars
        setDocument,
        document,
        docElem,
        documentIsHTML,
        rbuggyQSA,
        rbuggyMatches,
        matches,
        contains,
        // Instance-specific data
        expando = "sizzle" + 1 * new Date(),
        preferredDoc = window.document,
        dirruns = 0,
        done = 0,
        classCache = createCache(),
        tokenCache = createCache(),
        compilerCache = createCache(),
        nonnativeSelectorCache = createCache(),
        sortOrder = function (a, b) {
          if (a === b) {
            hasDuplicate = true;
          }
          return 0;
        },
        // Instance methods
        hasOwn = {}.hasOwnProperty,
        arr = [],
        pop = arr.pop,
        pushNative = arr.push,
        push = arr.push,
        slice = arr.slice,
        // Use a stripped-down indexOf as it's faster than native
        // https://jsperf.com/thor-indexof-vs-for/5
        indexOf = function (list, elem) {
          var i = 0,
            len = list.length;
          for (; i < len; i++) {
            if (list[i] === elem) {
              return i;
            }
          }
          return -1;
        },
        booleans =
          "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
          "ismap|loop|multiple|open|readonly|required|scoped",
        // Regular expressions

        // http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",
        // https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
        identifier =
          "(?:\\\\[\\da-fA-F]{1,6}" +
          whitespace +
          "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
        // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
        attributes =
          "\\[" +
          whitespace +
          "*(" +
          identifier +
          ")(?:" +
          whitespace +
          // Operator (capture 2)
          "*([*^$|!~]?=)" +
          whitespace +
          // "Attribute values must be CSS identifiers [capture 5]
          // or strings [capture 3 or capture 4]"
          "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
          identifier +
          "))|)" +
          whitespace +
          "*\\]",
        pseudos =
          ":(" +
          identifier +
          ")(?:\\((" +
          // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
          // 1. quoted (capture 3; capture 4 or capture 5)
          "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
          // 2. simple (capture 6)
          "((?:\\\\.|[^\\\\()[\\]]|" +
          attributes +
          ")*)|" +
          // 3. anything else (capture 2)
          ".*" +
          ")\\)|)",
        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rwhitespace = new RegExp(whitespace + "+", "g"),
        rtrim = new RegExp(
          "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
          "g"
        ),
        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
        rcombinators = new RegExp(
          "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"
        ),
        rdescend = new RegExp(whitespace + "|>"),
        rpseudo = new RegExp(pseudos),
        ridentifier = new RegExp("^" + identifier + "$"),
        matchExpr = {
          ID: new RegExp("^#(" + identifier + ")"),
          CLASS: new RegExp("^\\.(" + identifier + ")"),
          TAG: new RegExp("^(" + identifier + "|[*])"),
          ATTR: new RegExp("^" + attributes),
          PSEUDO: new RegExp("^" + pseudos),
          CHILD: new RegExp(
            "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
              whitespace +
              "*(even|odd|(([+-]|)(\\d*)n|)" +
              whitespace +
              "*(?:([+-]|)" +
              whitespace +
              "*(\\d+)|))" +
              whitespace +
              "*\\)|)",
            "i"
          ),
          bool: new RegExp("^(?:" + booleans + ")$", "i"),

          // For use in libraries implementing .is()
          // We use this for POS matching in `select`
          needsContext: new RegExp(
            "^" +
              whitespace +
              "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
              whitespace +
              "*((?:-\\d)?\\d*)" +
              whitespace +
              "*\\)|)(?=[^-]|$)",
            "i"
          ),
        },
        rhtml = /HTML$/i,
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        rnative = /^[^{]+\{\s*\[native \w/,
        // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        rsibling = /[+~]/,
        // CSS escapes
        // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp(
          "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])",
          "g"
        ),
        funescape = function (escape, nonHex) {
          var high = "0x" + escape.slice(1) - 0x10000;

          return nonHex
            ? // Strip the backslash prefix from a non-hex escape sequence
              nonHex
            : // Replace a hexadecimal escape sequence with the encoded Unicode code point
            // Support: IE <=11+
            // For values outside the Basic Multilingual Plane (BMP), manually construct a
            // surrogate pair
            high < 0
            ? String.fromCharCode(high + 0x10000)
            : String.fromCharCode(
                (high >> 10) | 0xd800,
                (high & 0x3ff) | 0xdc00
              );
        },
        // CSS string/identifier serialization
        // https://drafts.csswg.org/cssom/#common-serializing-idioms
        rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
        fcssescape = function (ch, asCodePoint) {
          if (asCodePoint) {
            // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
            if (ch === "\0") {
              return "\uFFFD";
            }

            // Control characters and (dependent upon position) numbers get escaped as code points
            return (
              ch.slice(0, -1) +
              "\\" +
              ch.charCodeAt(ch.length - 1).toString(16) +
              " "
            );
          }

          // Other potentially-special ASCII characters get backslash-escaped
          return "\\" + ch;
        },
        // Used for iframes
        // See setDocument()
        // Removing the function wrapper causes a "Permission Denied"
        // error in IE
        unloadHandler = function () {
          setDocument();
        },
        inDisabledFieldset = addCombinator(
          function (elem) {
            return (
              elem.disabled === true &&
              elem.nodeName.toLowerCase() === "fieldset"
            );
          },
          { dir: "parentNode", next: "legend" }
        );

      // Optimize for push.apply( _, NodeList )
      try {
        push.apply(
          (arr = slice.call(preferredDoc.childNodes)),
          preferredDoc.childNodes
        );

        // Support: Android<4.0
        // Detect silently failing push.apply
        // eslint-disable-next-line no-unused-expressions
        arr[preferredDoc.childNodes.length].nodeType;
      } catch (e) {
        push = {
          apply: arr.length
            ? // Leverage slice if possible
              function (target, els) {
                pushNative.apply(target, slice.call(els));
              }
            : // Support: IE<9
              // Otherwise append directly
              function (target, els) {
                var j = target.length,
                  i = 0;

                // Can't trust NodeList.length
                while ((target[j++] = els[i++])) {}
                target.length = j - 1;
              },
        };
      }

      function Sizzle(selector, context, results, seed) {
        var m,
          i,
          elem,
          nid,
          match,
          groups,
          newSelector,
          newContext = context && context.ownerDocument,
          // nodeType defaults to 9, since context defaults to document
          nodeType = context ? context.nodeType : 9;

        results = results || [];

        // Return early from calls with invalid selector or context
        if (
          typeof selector !== "string" ||
          !selector ||
          (nodeType !== 1 && nodeType !== 9 && nodeType !== 11)
        ) {
          return results;
        }

        // Try to shortcut find operations (as opposed to filters) in HTML documents
        if (!seed) {
          setDocument(context);
          context = context || document;

          if (documentIsHTML) {
            // If the selector is sufficiently simple, try using a "get*By*" DOM method
            // (excepting DocumentFragment context, where the methods don't exist)
            if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
              // ID selector
              if ((m = match[1])) {
                // Document context
                if (nodeType === 9) {
                  if ((elem = context.getElementById(m))) {
                    // Support: IE, Opera, Webkit
                    // TODO: identify versions
                    // getElementById can match elements by name instead of ID
                    if (elem.id === m) {
                      results.push(elem);
                      return results;
                    }
                  } else {
                    return results;
                  }

                  // Element context
                } else {
                  // Support: IE, Opera, Webkit
                  // TODO: identify versions
                  // getElementById can match elements by name instead of ID
                  if (
                    newContext &&
                    (elem = newContext.getElementById(m)) &&
                    contains(context, elem) &&
                    elem.id === m
                  ) {
                    results.push(elem);
                    return results;
                  }
                }

                // Type selector
              } else if (match[2]) {
                push.apply(results, context.getElementsByTagName(selector));
                return results;

                // Class selector
              } else if (
                (m = match[3]) &&
                support.getElementsByClassName &&
                context.getElementsByClassName
              ) {
                push.apply(results, context.getElementsByClassName(m));
                return results;
              }
            }

            // Take advantage of querySelectorAll
            if (
              support.qsa &&
              !nonnativeSelectorCache[selector + " "] &&
              (!rbuggyQSA || !rbuggyQSA.test(selector)) &&
              // Support: IE 8 only
              // Exclude object elements
              (nodeType !== 1 || context.nodeName.toLowerCase() !== "object")
            ) {
              newSelector = selector;
              newContext = context;

              // qSA considers elements outside a scoping root when evaluating child or
              // descendant combinators, which is not what we want.
              // In such cases, we work around the behavior by prefixing every selector in the
              // list with an ID selector referencing the scope context.
              // The technique has to be used as well when a leading combinator is used
              // as such selectors are not recognized by querySelectorAll.
              // Thanks to Andrew Dupont for this technique.
              if (
                nodeType === 1 &&
                (rdescend.test(selector) || rcombinators.test(selector))
              ) {
                // Expand context for sibling selectors
                newContext =
                  (rsibling.test(selector) &&
                    testContext(context.parentNode)) ||
                  context;

                // We can use :scope instead of the ID hack if the browser
                // supports it & if we're not changing the context.
                if (newContext !== context || !support.scope) {
                  // Capture the context ID, setting it first if necessary
                  if ((nid = context.getAttribute("id"))) {
                    nid = nid.replace(rcssescape, fcssescape);
                  } else {
                    context.setAttribute("id", (nid = expando));
                  }
                }

                // Prefix every selector in the list
                groups = tokenize(selector);
                i = groups.length;
                while (i--) {
                  groups[i] =
                    (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i]);
                }
                newSelector = groups.join(",");
              }

              try {
                push.apply(results, newContext.querySelectorAll(newSelector));
                return results;
              } catch (qsaError) {
                nonnativeSelectorCache(selector, true);
              } finally {
                if (nid === expando) {
                  context.removeAttribute("id");
                }
              }
            }
          }
        }

        // All others
        return select(selector.replace(rtrim, "$1"), context, results, seed);
      }

      /**
       * Create key-value caches of limited size
       * @returns {function(string, object)} Returns the Object data after storing it on itself with
       *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
       *	deleting the oldest entry
       */
      function createCache() {
        var keys = [];

        function cache(key, value) {
          // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
          if (keys.push(key + " ") > Expr.cacheLength) {
            // Only keep the most recent entries
            delete cache[keys.shift()];
          }
          return (cache[key + " "] = value);
        }
        return cache;
      }

      /**
       * Mark a function for special use by Sizzle
       * @param {Function} fn The function to mark
       */
      function markFunction(fn) {
        fn[expando] = true;
        return fn;
      }

      /**
       * Support testing using an element
       * @param {Function} fn Passed the created element and returns a boolean result
       */
      function assert(fn) {
        var el = document.createElement("fieldset");

        try {
          return !!fn(el);
        } catch (e) {
          return false;
        } finally {
          // Remove from its parent by default
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }

          // release memory in IE
          el = null;
        }
      }

      /**
       * Adds the same handler for all of the specified attrs
       * @param {String} attrs Pipe-separated list of attributes
       * @param {Function} handler The method that will be applied
       */
      function addHandle(attrs, handler) {
        var arr = attrs.split("|"),
          i = arr.length;

        while (i--) {
          Expr.attrHandle[arr[i]] = handler;
        }
      }

      /**
       * Checks document order of two siblings
       * @param {Element} a
       * @param {Element} b
       * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
       */
      function siblingCheck(a, b) {
        var cur = b && a,
          diff =
            cur &&
            a.nodeType === 1 &&
            b.nodeType === 1 &&
            a.sourceIndex - b.sourceIndex;

        // Use IE sourceIndex if available on both nodes
        if (diff) {
          return diff;
        }

        // Check if b follows a
        if (cur) {
          while ((cur = cur.nextSibling)) {
            if (cur === b) {
              return -1;
            }
          }
        }

        return a ? 1 : -1;
      }

      /**
       * Returns a function to use in pseudos for input types
       * @param {String} type
       */
      function createInputPseudo(type) {
        return function (elem) {
          var name = elem.nodeName.toLowerCase();
          return name === "input" && elem.type === type;
        };
      }

      /**
       * Returns a function to use in pseudos for buttons
       * @param {String} type
       */
      function createButtonPseudo(type) {
        return function (elem) {
          var name = elem.nodeName.toLowerCase();
          return (name === "input" || name === "button") && elem.type === type;
        };
      }

      /**
       * Returns a function to use in pseudos for :enabled/:disabled
       * @param {Boolean} disabled true for :disabled; false for :enabled
       */
      function createDisabledPseudo(disabled) {
        // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
        return function (elem) {
          // Only certain elements can match :enabled or :disabled
          // https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
          // https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
          if ("form" in elem) {
            // Check for inherited disabledness on relevant non-disabled elements:
            // * listed form-associated elements in a disabled fieldset
            //   https://html.spec.whatwg.org/multipage/forms.html#category-listed
            //   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
            // * option elements in a disabled optgroup
            //   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
            // All such elements have a "form" property.
            if (elem.parentNode && elem.disabled === false) {
              // Option elements defer to a parent optgroup if present
              if ("label" in elem) {
                if ("label" in elem.parentNode) {
                  return elem.parentNode.disabled === disabled;
                } else {
                  return elem.disabled === disabled;
                }
              }

              // Support: IE 6 - 11
              // Use the isDisabled shortcut property to check for disabled fieldset ancestors
              return (
                elem.isDisabled === disabled ||
                // Where there is no isDisabled, check manually
                /* jshint -W018 */
                (elem.isDisabled !== !disabled &&
                  inDisabledFieldset(elem) === disabled)
              );
            }

            return elem.disabled === disabled;

            // Try to winnow out elements that can't be disabled before trusting the disabled property.
            // Some victims get caught in our net (label, legend, menu, track), but it shouldn't
            // even exist on them, let alone have a boolean value.
          } else if ("label" in elem) {
            return elem.disabled === disabled;
          }

          // Remaining elements are neither :enabled nor :disabled
          return false;
        };
      }

      /**
       * Returns a function to use in pseudos for positionals
       * @param {Function} fn
       */
      function createPositionalPseudo(fn) {
        return markFunction(function (argument) {
          argument = +argument;
          return markFunction(function (seed, matches) {
            var j,
              matchIndexes = fn([], seed.length, argument),
              i = matchIndexes.length;

            // Match elements found at the specified indexes
            while (i--) {
              if (seed[(j = matchIndexes[i])]) {
                seed[j] = !(matches[j] = seed[j]);
              }
            }
          });
        });
      }

      /**
       * Checks a node for validity as a Sizzle context
       * @param {Element|Object=} context
       * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
       */
      function testContext(context) {
        return (
          context &&
          typeof context.getElementsByTagName !== "undefined" &&
          context
        );
      }

      // Expose support vars for convenience
      support = Sizzle.support = {};

      /**
       * Detects XML nodes
       * @param {Element|Object} elem An element or a document
       * @returns {Boolean} True iff elem is a non-HTML XML node
       */
      isXML = Sizzle.isXML = function (elem) {
        var namespace = elem.namespaceURI,
          docElem = (elem.ownerDocument || elem).documentElement;

        // Support: IE <=8
        // Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
        // https://bugs.jquery.com/ticket/4833
        return !rhtml.test(
          namespace || (docElem && docElem.nodeName) || "HTML"
        );
      };

      /**
       * Sets document-related variables once based on the current document
       * @param {Element|Object} [doc] An element or document object to use to set the document
       * @returns {Object} Returns the current document
       */
      setDocument = Sizzle.setDocument = function (node) {
        var hasCompare,
          subWindow,
          doc = node ? node.ownerDocument || node : preferredDoc;

        // Return early if doc is invalid or already selected
        // Support: IE 11+, Edge 17 - 18+
        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
        // two documents; shallow comparisons work.
        // eslint-disable-next-line eqeqeq
        if (doc == document || doc.nodeType !== 9 || !doc.documentElement) {
          return document;
        }

        // Update global variables
        document = doc;
        docElem = document.documentElement;
        documentIsHTML = !isXML(document);

        // Support: IE 9 - 11+, Edge 12 - 18+
        // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
        // Support: IE 11+, Edge 17 - 18+
        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
        // two documents; shallow comparisons work.
        // eslint-disable-next-line eqeqeq
        if (
          preferredDoc != document &&
          (subWindow = document.defaultView) &&
          subWindow.top !== subWindow
        ) {
          // Support: IE 11, Edge
          if (subWindow.addEventListener) {
            subWindow.addEventListener("unload", unloadHandler, false);

            // Support: IE 9 - 10 only
          } else if (subWindow.attachEvent) {
            subWindow.attachEvent("onunload", unloadHandler);
          }
        }

        // Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
        // Safari 4 - 5 only, Opera <=11.6 - 12.x only
        // IE/Edge & older browsers don't support the :scope pseudo-class.
        // Support: Safari 6.0 only
        // Safari 6.0 supports :scope but it's an alias of :root there.
        support.scope = assert(function (el) {
          docElem.appendChild(el).appendChild(document.createElement("div"));
          return (
            typeof el.querySelectorAll !== "undefined" &&
            !el.querySelectorAll(":scope fieldset div").length
          );
        });

        /* Attributes
	---------------------------------------------------------------------- */

        // Support: IE<8
        // Verify that getAttribute really returns attributes and not properties
        // (excepting IE8 booleans)
        support.attributes = assert(function (el) {
          el.className = "i";
          return !el.getAttribute("className");
        });

        /* getElement(s)By*
	---------------------------------------------------------------------- */

        // Check if getElementsByTagName("*") returns only elements
        support.getElementsByTagName = assert(function (el) {
          el.appendChild(document.createComment(""));
          return !el.getElementsByTagName("*").length;
        });

        // Support: IE<9
        support.getElementsByClassName = rnative.test(
          document.getElementsByClassName
        );

        // Support: IE<10
        // Check if getElementById returns elements by name
        // The broken getElementById methods don't pick up programmatically-set names,
        // so use a roundabout getElementsByName test
        support.getById = assert(function (el) {
          docElem.appendChild(el).id = expando;
          return (
            !document.getElementsByName ||
            !document.getElementsByName(expando).length
          );
        });

        // ID filter and find
        if (support.getById) {
          Expr.filter["ID"] = function (id) {
            var attrId = id.replace(runescape, funescape);
            return function (elem) {
              return elem.getAttribute("id") === attrId;
            };
          };
          Expr.find["ID"] = function (id, context) {
            if (
              typeof context.getElementById !== "undefined" &&
              documentIsHTML
            ) {
              var elem = context.getElementById(id);
              return elem ? [elem] : [];
            }
          };
        } else {
          Expr.filter["ID"] = function (id) {
            var attrId = id.replace(runescape, funescape);
            return function (elem) {
              var node =
                typeof elem.getAttributeNode !== "undefined" &&
                elem.getAttributeNode("id");
              return node && node.value === attrId;
            };
          };

          // Support: IE 6 - 7 only
          // getElementById is not reliable as a find shortcut
          Expr.find["ID"] = function (id, context) {
            if (
              typeof context.getElementById !== "undefined" &&
              documentIsHTML
            ) {
              var node,
                i,
                elems,
                elem = context.getElementById(id);

              if (elem) {
                // Verify the id attribute
                node = elem.getAttributeNode("id");
                if (node && node.value === id) {
                  return [elem];
                }

                // Fall back on getElementsByName
                elems = context.getElementsByName(id);
                i = 0;
                while ((elem = elems[i++])) {
                  node = elem.getAttributeNode("id");
                  if (node && node.value === id) {
                    return [elem];
                  }
                }
              }

              return [];
            }
          };
        }

        // Tag
        Expr.find["TAG"] = support.getElementsByTagName
          ? function (tag, context) {
              if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(tag);

                // DocumentFragment nodes don't have gEBTN
              } else if (support.qsa) {
                return context.querySelectorAll(tag);
              }
            }
          : function (tag, context) {
              var elem,
                tmp = [],
                i = 0,
                // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
                results = context.getElementsByTagName(tag);

              // Filter out possible comments
              if (tag === "*") {
                while ((elem = results[i++])) {
                  if (elem.nodeType === 1) {
                    tmp.push(elem);
                  }
                }

                return tmp;
              }
              return results;
            };

        // Class
        Expr.find["CLASS"] =
          support.getElementsByClassName &&
          function (className, context) {
            if (
              typeof context.getElementsByClassName !== "undefined" &&
              documentIsHTML
            ) {
              return context.getElementsByClassName(className);
            }
          };

        /* QSA/matchesSelector
	---------------------------------------------------------------------- */

        // QSA and matchesSelector support

        // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
        rbuggyMatches = [];

        // qSa(:focus) reports false when true (Chrome 21)
        // We allow this because of a bug in IE8/9 that throws an error
        // whenever `document.activeElement` is accessed on an iframe
        // So, we allow :focus to pass through QSA all the time to avoid the IE error
        // See https://bugs.jquery.com/ticket/13378
        rbuggyQSA = [];

        if ((support.qsa = rnative.test(document.querySelectorAll))) {
          // Build QSA regex
          // Regex strategy adopted from Diego Perini
          assert(function (el) {
            var input;

            // Select is set to empty string on purpose
            // This is to test IE's treatment of not explicitly
            // setting a boolean content attribute,
            // since its presence should be enough
            // https://bugs.jquery.com/ticket/12359
            docElem.appendChild(el).innerHTML =
              "<a id='" +
              expando +
              "'></a>" +
              "<select id='" +
              expando +
              "-\r\\' msallowcapture=''>" +
              "<option selected=''></option></select>";

            // Support: IE8, Opera 11-12.16
            // Nothing should be selected when empty strings follow ^= or $= or *=
            // The test attribute must be unknown in Opera but "safe" for WinRT
            // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
            if (el.querySelectorAll("[msallowcapture^='']").length) {
              rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
            }

            // Support: IE8
            // Boolean attributes and "value" are not treated correctly
            if (!el.querySelectorAll("[selected]").length) {
              rbuggyQSA.push(
                "\\[" + whitespace + "*(?:value|" + booleans + ")"
              );
            }

            // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
            if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
              rbuggyQSA.push("~=");
            }

            // Support: IE 11+, Edge 15 - 18+
            // IE 11/Edge don't find elements on a `[name='']` query in some cases.
            // Adding a temporary attribute to the document before the selection works
            // around the issue.
            // Interestingly, IE 10 & older don't seem to have the issue.
            input = document.createElement("input");
            input.setAttribute("name", "");
            el.appendChild(input);
            if (!el.querySelectorAll("[name='']").length) {
              rbuggyQSA.push(
                "\\[" +
                  whitespace +
                  "*name" +
                  whitespace +
                  "*=" +
                  whitespace +
                  "*(?:''|\"\")"
              );
            }

            // Webkit/Opera - :checked should return selected option elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            // IE8 throws error here and will not see later tests
            if (!el.querySelectorAll(":checked").length) {
              rbuggyQSA.push(":checked");
            }

            // Support: Safari 8+, iOS 8+
            // https://bugs.webkit.org/show_bug.cgi?id=136851
            // In-page `selector#id sibling-combinator selector` fails
            if (!el.querySelectorAll("a#" + expando + "+*").length) {
              rbuggyQSA.push(".#.+[+~]");
            }

            // Support: Firefox <=3.6 - 5 only
            // Old Firefox doesn't throw on a badly-escaped identifier.
            el.querySelectorAll("\\\f");
            rbuggyQSA.push("[\\r\\n\\f]");
          });

          assert(function (el) {
            el.innerHTML =
              "<a href='' disabled='disabled'></a>" +
              "<select disabled='disabled'><option/></select>";

            // Support: Windows 8 Native Apps
            // The type and name attributes are restricted during .innerHTML assignment
            var input = document.createElement("input");
            input.setAttribute("type", "hidden");
            el.appendChild(input).setAttribute("name", "D");

            // Support: IE8
            // Enforce case-sensitivity of name attribute
            if (el.querySelectorAll("[name=d]").length) {
              rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
            }

            // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
            // IE8 throws error here and will not see later tests
            if (el.querySelectorAll(":enabled").length !== 2) {
              rbuggyQSA.push(":enabled", ":disabled");
            }

            // Support: IE9-11+
            // IE's :disabled selector does not pick up the children of disabled fieldsets
            docElem.appendChild(el).disabled = true;
            if (el.querySelectorAll(":disabled").length !== 2) {
              rbuggyQSA.push(":enabled", ":disabled");
            }

            // Support: Opera 10 - 11 only
            // Opera 10-11 does not throw on post-comma invalid pseudos
            el.querySelectorAll("*,:x");
            rbuggyQSA.push(",.*:");
          });
        }

        if (
          (support.matchesSelector = rnative.test(
            (matches =
              docElem.matches ||
              docElem.webkitMatchesSelector ||
              docElem.mozMatchesSelector ||
              docElem.oMatchesSelector ||
              docElem.msMatchesSelector)
          ))
        ) {
          assert(function (el) {
            // Check to see if it's possible to do matchesSelector
            // on a disconnected node (IE 9)
            support.disconnectedMatch = matches.call(el, "*");

            // This should fail with an exception
            // Gecko does not error, returns false instead
            matches.call(el, "[s!='']:x");
            rbuggyMatches.push("!=", pseudos);
          });
        }

        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
        rbuggyMatches =
          rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

        /* Contains
	---------------------------------------------------------------------- */
        hasCompare = rnative.test(docElem.compareDocumentPosition);

        // Element contains another
        // Purposefully self-exclusive
        // As in, an element does not contain itself
        contains =
          hasCompare || rnative.test(docElem.contains)
            ? function (a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a,
                  bup = b && b.parentNode;
                return (
                  a === bup ||
                  !!(
                    bup &&
                    bup.nodeType === 1 &&
                    (adown.contains
                      ? adown.contains(bup)
                      : a.compareDocumentPosition &&
                        a.compareDocumentPosition(bup) & 16)
                  )
                );
              }
            : function (a, b) {
                if (b) {
                  while ((b = b.parentNode)) {
                    if (b === a) {
                      return true;
                    }
                  }
                }
                return false;
              };

        /* Sorting
	---------------------------------------------------------------------- */

        // Document order sorting
        sortOrder = hasCompare
          ? function (a, b) {
              // Flag for duplicate removal
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }

              // Sort on method existence if only one input has compareDocumentPosition
              var compare =
                !a.compareDocumentPosition - !b.compareDocumentPosition;
              if (compare) {
                return compare;
              }

              // Calculate position if both inputs belong to the same document
              // Support: IE 11+, Edge 17 - 18+
              // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
              // two documents; shallow comparisons work.
              // eslint-disable-next-line eqeqeq
              compare =
                (a.ownerDocument || a) == (b.ownerDocument || b)
                  ? a.compareDocumentPosition(b)
                  : // Otherwise we know they are disconnected
                    1;

              // Disconnected nodes
              if (
                compare & 1 ||
                (!support.sortDetached &&
                  b.compareDocumentPosition(a) === compare)
              ) {
                // Choose the first element that is related to our preferred document
                // Support: IE 11+, Edge 17 - 18+
                // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                // two documents; shallow comparisons work.
                // eslint-disable-next-line eqeqeq
                if (
                  a == document ||
                  (a.ownerDocument == preferredDoc && contains(preferredDoc, a))
                ) {
                  return -1;
                }

                // Support: IE 11+, Edge 17 - 18+
                // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                // two documents; shallow comparisons work.
                // eslint-disable-next-line eqeqeq
                if (
                  b == document ||
                  (b.ownerDocument == preferredDoc && contains(preferredDoc, b))
                ) {
                  return 1;
                }

                // Maintain original order
                return sortInput
                  ? indexOf(sortInput, a) - indexOf(sortInput, b)
                  : 0;
              }

              return compare & 4 ? -1 : 1;
            }
          : function (a, b) {
              // Exit early if the nodes are identical
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }

              var cur,
                i = 0,
                aup = a.parentNode,
                bup = b.parentNode,
                ap = [a],
                bp = [b];

              // Parentless nodes are either documents or disconnected
              if (!aup || !bup) {
                // Support: IE 11+, Edge 17 - 18+
                // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                // two documents; shallow comparisons work.
                /* eslint-disable eqeqeq */
                return a == document
                  ? -1
                  : b == document
                  ? 1
                  : /* eslint-enable eqeqeq */
                  aup
                  ? -1
                  : bup
                  ? 1
                  : sortInput
                  ? indexOf(sortInput, a) - indexOf(sortInput, b)
                  : 0;

                // If the nodes are siblings, we can do a quick check
              } else if (aup === bup) {
                return siblingCheck(a, b);
              }

              // Otherwise we need full lists of their ancestors for comparison
              cur = a;
              while ((cur = cur.parentNode)) {
                ap.unshift(cur);
              }
              cur = b;
              while ((cur = cur.parentNode)) {
                bp.unshift(cur);
              }

              // Walk down the tree looking for a discrepancy
              while (ap[i] === bp[i]) {
                i++;
              }

              return i
                ? // Do a sibling check if the nodes have a common ancestor
                  siblingCheck(ap[i], bp[i])
                : // Otherwise nodes in our document sort first
                // Support: IE 11+, Edge 17 - 18+
                // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                // two documents; shallow comparisons work.
                /* eslint-disable eqeqeq */
                ap[i] == preferredDoc
                ? -1
                : bp[i] == preferredDoc
                ? 1
                : /* eslint-enable eqeqeq */
                  0;
            };

        return document;
      };

      Sizzle.matches = function (expr, elements) {
        return Sizzle(expr, null, null, elements);
      };

      Sizzle.matchesSelector = function (elem, expr) {
        setDocument(elem);

        if (
          support.matchesSelector &&
          documentIsHTML &&
          !nonnativeSelectorCache[expr + " "] &&
          (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
          (!rbuggyQSA || !rbuggyQSA.test(expr))
        ) {
          try {
            var ret = matches.call(elem, expr);

            // IE 9's matchesSelector returns false on disconnected nodes
            if (
              ret ||
              support.disconnectedMatch ||
              // As well, disconnected nodes are said to be in a document
              // fragment in IE 9
              (elem.document && elem.document.nodeType !== 11)
            ) {
              return ret;
            }
          } catch (e) {
            nonnativeSelectorCache(expr, true);
          }
        }

        return Sizzle(expr, document, null, [elem]).length > 0;
      };

      Sizzle.contains = function (context, elem) {
        // Set document vars if needed
        // Support: IE 11+, Edge 17 - 18+
        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
        // two documents; shallow comparisons work.
        // eslint-disable-next-line eqeqeq
        if ((context.ownerDocument || context) != document) {
          setDocument(context);
        }
        return contains(context, elem);
      };

      Sizzle.attr = function (elem, name) {
        // Set document vars if needed
        // Support: IE 11+, Edge 17 - 18+
        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
        // two documents; shallow comparisons work.
        // eslint-disable-next-line eqeqeq
        if ((elem.ownerDocument || elem) != document) {
          setDocument(elem);
        }

        var fn = Expr.attrHandle[name.toLowerCase()],
          // Don't get fooled by Object.prototype properties (jQuery #13807)
          val =
            fn && hasOwn.call(Expr.attrHandle, name.toLowerCase())
              ? fn(elem, name, !documentIsHTML)
              : undefined;

        return val !== undefined
          ? val
          : support.attributes || !documentIsHTML
          ? elem.getAttribute(name)
          : (val = elem.getAttributeNode(name)) && val.specified
          ? val.value
          : null;
      };

      Sizzle.escape = function (sel) {
        return (sel + "").replace(rcssescape, fcssescape);
      };

      Sizzle.error = function (msg) {
        throw new Error("Syntax error, unrecognized expression: " + msg);
      };

      /**
       * Document sorting and removing duplicates
       * @param {ArrayLike} results
       */
      Sizzle.uniqueSort = function (results) {
        var elem,
          duplicates = [],
          j = 0,
          i = 0;

        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !support.detectDuplicates;
        sortInput = !support.sortStable && results.slice(0);
        results.sort(sortOrder);

        if (hasDuplicate) {
          while ((elem = results[i++])) {
            if (elem === results[i]) {
              j = duplicates.push(i);
            }
          }
          while (j--) {
            results.splice(duplicates[j], 1);
          }
        }

        // Clear input after sorting to release objects
        // See https://github.com/jquery/sizzle/pull/225
        sortInput = null;

        return results;
      };

      /**
       * Utility function for retrieving the text value of an array of DOM nodes
       * @param {Array|Element} elem
       */
      getText = Sizzle.getText = function (elem) {
        var node,
          ret = "",
          i = 0,
          nodeType = elem.nodeType;

        if (!nodeType) {
          // If no nodeType, this is expected to be an array
          while ((node = elem[i++])) {
            // Do not traverse comment nodes
            ret += getText(node);
          }
        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
          // Use textContent for elements
          // innerText usage removed for consistency of new lines (jQuery #11153)
          if (typeof elem.textContent === "string") {
            return elem.textContent;
          } else {
            // Traverse its children
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
              ret += getText(elem);
            }
          }
        } else if (nodeType === 3 || nodeType === 4) {
          return elem.nodeValue;
        }

        // Do not include comment or processing instruction nodes

        return ret;
      };

      Expr = Sizzle.selectors = {
        // Can be adjusted by the user
        cacheLength: 50,

        createPseudo: markFunction,

        match: matchExpr,

        attrHandle: {},

        find: {},

        relative: {
          ">": { dir: "parentNode", first: true },
          " ": { dir: "parentNode" },
          "+": { dir: "previousSibling", first: true },
          "~": { dir: "previousSibling" },
        },

        preFilter: {
          ATTR: function (match) {
            match[1] = match[1].replace(runescape, funescape);

            // Move the given value to match[3] whether quoted or unquoted
            match[3] = (match[3] || match[4] || match[5] || "").replace(
              runescape,
              funescape
            );

            if (match[2] === "~=") {
              match[3] = " " + match[3] + " ";
            }

            return match.slice(0, 4);
          },

          CHILD: function (match) {
            /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
            match[1] = match[1].toLowerCase();

            if (match[1].slice(0, 3) === "nth") {
              // nth-* requires argument
              if (!match[3]) {
                Sizzle.error(match[0]);
              }

              // numeric x and y parameters for Expr.filter.CHILD
              // remember that false/true cast respectively to 0/1
              match[4] = +(match[4]
                ? match[5] + (match[6] || 1)
                : 2 * (match[3] === "even" || match[3] === "odd"));
              match[5] = +(match[7] + match[8] || match[3] === "odd");

              // other types prohibit arguments
            } else if (match[3]) {
              Sizzle.error(match[0]);
            }

            return match;
          },

          PSEUDO: function (match) {
            var excess,
              unquoted = !match[6] && match[2];

            if (matchExpr["CHILD"].test(match[0])) {
              return null;
            }

            // Accept quoted arguments as-is
            if (match[3]) {
              match[2] = match[4] || match[5] || "";

              // Strip excess characters from unquoted arguments
            } else if (
              unquoted &&
              rpseudo.test(unquoted) &&
              // Get excess from tokenize (recursively)
              (excess = tokenize(unquoted, true)) &&
              // advance to the next closing parenthesis
              (excess =
                unquoted.indexOf(")", unquoted.length - excess) -
                unquoted.length)
            ) {
              // excess is a negative index
              match[0] = match[0].slice(0, excess);
              match[2] = unquoted.slice(0, excess);
            }

            // Return only captures needed by the pseudo filter method (type and argument)
            return match.slice(0, 3);
          },
        },

        filter: {
          TAG: function (nodeNameSelector) {
            var nodeName = nodeNameSelector
              .replace(runescape, funescape)
              .toLowerCase();
            return nodeNameSelector === "*"
              ? function () {
                  return true;
                }
              : function (elem) {
                  return (
                    elem.nodeName && elem.nodeName.toLowerCase() === nodeName
                  );
                };
          },

          CLASS: function (className) {
            var pattern = classCache[className + " "];

            return (
              pattern ||
              ((pattern = new RegExp(
                "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)"
              )) &&
                classCache(className, function (elem) {
                  return pattern.test(
                    (typeof elem.className === "string" && elem.className) ||
                      (typeof elem.getAttribute !== "undefined" &&
                        elem.getAttribute("class")) ||
                      ""
                  );
                }))
            );
          },

          ATTR: function (name, operator, check) {
            return function (elem) {
              var result = Sizzle.attr(elem, name);

              if (result == null) {
                return operator === "!=";
              }
              if (!operator) {
                return true;
              }

              result += "";

              /* eslint-disable max-len */

              return operator === "="
                ? result === check
                : operator === "!="
                ? result !== check
                : operator === "^="
                ? check && result.indexOf(check) === 0
                : operator === "*="
                ? check && result.indexOf(check) > -1
                : operator === "$="
                ? check && result.slice(-check.length) === check
                : operator === "~="
                ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(
                    check
                  ) > -1
                : operator === "|="
                ? result === check ||
                  result.slice(0, check.length + 1) === check + "-"
                : false;
              /* eslint-enable max-len */
            };
          },

          CHILD: function (type, what, _argument, first, last) {
            var simple = type.slice(0, 3) !== "nth",
              forward = type.slice(-4) !== "last",
              ofType = what === "of-type";

            return first === 1 && last === 0
              ? // Shortcut for :nth-*(n)
                function (elem) {
                  return !!elem.parentNode;
                }
              : function (elem, _context, xml) {
                  var cache,
                    uniqueCache,
                    outerCache,
                    node,
                    nodeIndex,
                    start,
                    dir =
                      simple !== forward ? "nextSibling" : "previousSibling",
                    parent = elem.parentNode,
                    name = ofType && elem.nodeName.toLowerCase(),
                    useCache = !xml && !ofType,
                    diff = false;

                  if (parent) {
                    // :(first|last|only)-(child|of-type)
                    if (simple) {
                      while (dir) {
                        node = elem;
                        while ((node = node[dir])) {
                          if (
                            ofType
                              ? node.nodeName.toLowerCase() === name
                              : node.nodeType === 1
                          ) {
                            return false;
                          }
                        }

                        // Reverse direction for :only-* (if we haven't yet done so)
                        start = dir =
                          type === "only" && !start && "nextSibling";
                      }
                      return true;
                    }

                    start = [forward ? parent.firstChild : parent.lastChild];

                    // non-xml :nth-child(...) stores cache data on `parent`
                    if (forward && useCache) {
                      // Seek `elem` from a previously-cached index

                      // ...in a gzip-friendly way
                      node = parent;
                      outerCache = node[expando] || (node[expando] = {});

                      // Support: IE <9 only
                      // Defend against cloned attroperties (jQuery gh-1709)
                      uniqueCache =
                        outerCache[node.uniqueID] ||
                        (outerCache[node.uniqueID] = {});

                      cache = uniqueCache[type] || [];
                      nodeIndex = cache[0] === dirruns && cache[1];
                      diff = nodeIndex && cache[2];
                      node = nodeIndex && parent.childNodes[nodeIndex];

                      while (
                        (node =
                          (++nodeIndex && node && node[dir]) ||
                          // Fallback to seeking `elem` from the start
                          (diff = nodeIndex = 0) ||
                          start.pop())
                      ) {
                        // When found, cache indexes on `parent` and break
                        if (node.nodeType === 1 && ++diff && node === elem) {
                          uniqueCache[type] = [dirruns, nodeIndex, diff];
                          break;
                        }
                      }
                    } else {
                      // Use previously-cached element index if available
                      if (useCache) {
                        // ...in a gzip-friendly way
                        node = elem;
                        outerCache = node[expando] || (node[expando] = {});

                        // Support: IE <9 only
                        // Defend against cloned attroperties (jQuery gh-1709)
                        uniqueCache =
                          outerCache[node.uniqueID] ||
                          (outerCache[node.uniqueID] = {});

                        cache = uniqueCache[type] || [];
                        nodeIndex = cache[0] === dirruns && cache[1];
                        diff = nodeIndex;
                      }

                      // xml :nth-child(...)
                      // or :nth-last-child(...) or :nth(-last)?-of-type(...)
                      if (diff === false) {
                        // Use the same loop as above to seek `elem` from the start
                        while (
                          (node =
                            (++nodeIndex && node && node[dir]) ||
                            (diff = nodeIndex = 0) ||
                            start.pop())
                        ) {
                          if (
                            (ofType
                              ? node.nodeName.toLowerCase() === name
                              : node.nodeType === 1) &&
                            ++diff
                          ) {
                            // Cache the index of each encountered element
                            if (useCache) {
                              outerCache =
                                node[expando] || (node[expando] = {});

                              // Support: IE <9 only
                              // Defend against cloned attroperties (jQuery gh-1709)
                              uniqueCache =
                                outerCache[node.uniqueID] ||
                                (outerCache[node.uniqueID] = {});

                              uniqueCache[type] = [dirruns, diff];
                            }

                            if (node === elem) {
                              break;
                            }
                          }
                        }
                      }
                    }

                    // Incorporate the offset, then check against cycle size
                    diff -= last;
                    return (
                      diff === first ||
                      (diff % first === 0 && diff / first >= 0)
                    );
                  }
                };
          },

          PSEUDO: function (pseudo, argument) {
            // pseudo-class names are case-insensitive
            // http://www.w3.org/TR/selectors/#pseudo-classes
            // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
            // Remember that setFilters inherits from pseudos
            var args,
              fn =
                Expr.pseudos[pseudo] ||
                Expr.setFilters[pseudo.toLowerCase()] ||
                Sizzle.error("unsupported pseudo: " + pseudo);

            // The user may use createPseudo to indicate that
            // arguments are needed to create the filter function
            // just as Sizzle does
            if (fn[expando]) {
              return fn(argument);
            }

            // But maintain support for old signatures
            if (fn.length > 1) {
              args = [pseudo, pseudo, "", argument];
              return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase())
                ? markFunction(function (seed, matches) {
                    var idx,
                      matched = fn(seed, argument),
                      i = matched.length;
                    while (i--) {
                      idx = indexOf(seed, matched[i]);
                      seed[idx] = !(matches[idx] = matched[i]);
                    }
                  })
                : function (elem) {
                    return fn(elem, 0, args);
                  };
            }

            return fn;
          },
        },

        pseudos: {
          // Potentially complex pseudos
          not: markFunction(function (selector) {
            // Trim the selector passed to compile
            // to avoid treating leading and trailing
            // spaces as combinators
            var input = [],
              results = [],
              matcher = compile(selector.replace(rtrim, "$1"));

            return matcher[expando]
              ? markFunction(function (seed, matches, _context, xml) {
                  var elem,
                    unmatched = matcher(seed, null, xml, []),
                    i = seed.length;

                  // Match elements unmatched by `matcher`
                  while (i--) {
                    if ((elem = unmatched[i])) {
                      seed[i] = !(matches[i] = elem);
                    }
                  }
                })
              : function (elem, _context, xml) {
                  input[0] = elem;
                  matcher(input, null, xml, results);

                  // Don't keep the element (issue #299)
                  input[0] = null;
                  return !results.pop();
                };
          }),

          has: markFunction(function (selector) {
            return function (elem) {
              return Sizzle(selector, elem).length > 0;
            };
          }),

          contains: markFunction(function (text) {
            text = text.replace(runescape, funescape);
            return function (elem) {
              return (elem.textContent || getText(elem)).indexOf(text) > -1;
            };
          }),

          // "Whether an element is represented by a :lang() selector
          // is based solely on the element's language value
          // being equal to the identifier C,
          // or beginning with the identifier C immediately followed by "-".
          // The matching of C against the element's language value is performed case-insensitively.
          // The identifier C does not have to be a valid language name."
          // http://www.w3.org/TR/selectors/#lang-pseudo
          lang: markFunction(function (lang) {
            // lang value must be a valid identifier
            if (!ridentifier.test(lang || "")) {
              Sizzle.error("unsupported lang: " + lang);
            }
            lang = lang.replace(runescape, funescape).toLowerCase();
            return function (elem) {
              var elemLang;
              do {
                if (
                  (elemLang = documentIsHTML
                    ? elem.lang
                    : elem.getAttribute("xml:lang") ||
                      elem.getAttribute("lang"))
                ) {
                  elemLang = elemLang.toLowerCase();
                  return (
                    elemLang === lang || elemLang.indexOf(lang + "-") === 0
                  );
                }
              } while ((elem = elem.parentNode) && elem.nodeType === 1);
              return false;
            };
          }),

          // Miscellaneous
          target: function (elem) {
            var hash = window.location && window.location.hash;
            return hash && hash.slice(1) === elem.id;
          },

          root: function (elem) {
            return elem === docElem;
          },

          focus: function (elem) {
            return (
              elem === document.activeElement &&
              (!document.hasFocus || document.hasFocus()) &&
              !!(elem.type || elem.href || ~elem.tabIndex)
            );
          },

          // Boolean properties
          enabled: createDisabledPseudo(false),
          disabled: createDisabledPseudo(true),

          checked: function (elem) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            var nodeName = elem.nodeName.toLowerCase();
            return (
              (nodeName === "input" && !!elem.checked) ||
              (nodeName === "option" && !!elem.selected)
            );
          },

          selected: function (elem) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (elem.parentNode) {
              // eslint-disable-next-line no-unused-expressions
              elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
          },

          // Contents
          empty: function (elem) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
            //   but not by others (comment: 8; processing instruction: 7; etc.)
            // nodeType < 6 works because attributes (2) do not appear as children
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
              if (elem.nodeType < 6) {
                return false;
              }
            }
            return true;
          },

          parent: function (elem) {
            return !Expr.pseudos["empty"](elem);
          },

          // Element/input types
          header: function (elem) {
            return rheader.test(elem.nodeName);
          },

          input: function (elem) {
            return rinputs.test(elem.nodeName);
          },

          button: function (elem) {
            var name = elem.nodeName.toLowerCase();
            return (
              (name === "input" && elem.type === "button") || name === "button"
            );
          },

          text: function (elem) {
            var attr;
            return (
              elem.nodeName.toLowerCase() === "input" &&
              elem.type === "text" &&
              // Support: IE<8
              // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
              ((attr = elem.getAttribute("type")) == null ||
                attr.toLowerCase() === "text")
            );
          },

          // Position-in-collection
          first: createPositionalPseudo(function () {
            return [0];
          }),

          last: createPositionalPseudo(function (_matchIndexes, length) {
            return [length - 1];
          }),

          eq: createPositionalPseudo(function (
            _matchIndexes,
            length,
            argument
          ) {
            return [argument < 0 ? argument + length : argument];
          }),

          even: createPositionalPseudo(function (matchIndexes, length) {
            var i = 0;
            for (; i < length; i += 2) {
              matchIndexes.push(i);
            }
            return matchIndexes;
          }),

          odd: createPositionalPseudo(function (matchIndexes, length) {
            var i = 1;
            for (; i < length; i += 2) {
              matchIndexes.push(i);
            }
            return matchIndexes;
          }),

          lt: createPositionalPseudo(function (matchIndexes, length, argument) {
            var i =
              argument < 0
                ? argument + length
                : argument > length
                ? length
                : argument;
            for (; --i >= 0; ) {
              matchIndexes.push(i);
            }
            return matchIndexes;
          }),

          gt: createPositionalPseudo(function (matchIndexes, length, argument) {
            var i = argument < 0 ? argument + length : argument;
            for (; ++i < length; ) {
              matchIndexes.push(i);
            }
            return matchIndexes;
          }),
        },
      };

      Expr.pseudos["nth"] = Expr.pseudos["eq"];

      // Add button/input type pseudos
      for (i in {
        radio: true,
        checkbox: true,
        file: true,
        password: true,
        image: true,
      }) {
        Expr.pseudos[i] = createInputPseudo(i);
      }
      for (i in { submit: true, reset: true }) {
        Expr.pseudos[i] = createButtonPseudo(i);
      }

      // Easy API for creating new setFilters
      function setFilters() {}
      setFilters.prototype = Expr.filters = Expr.pseudos;
      Expr.setFilters = new setFilters();

      tokenize = Sizzle.tokenize = function (selector, parseOnly) {
        var matched,
          match,
          tokens,
          type,
          soFar,
          groups,
          preFilters,
          cached = tokenCache[selector + " "];

        if (cached) {
          return parseOnly ? 0 : cached.slice(0);
        }

        soFar = selector;
        groups = [];
        preFilters = Expr.preFilter;

        while (soFar) {
          // Comma and first run
          if (!matched || (match = rcomma.exec(soFar))) {
            if (match) {
              // Don't consume trailing commas as valid
              soFar = soFar.slice(match[0].length) || soFar;
            }
            groups.push((tokens = []));
          }

          matched = false;

          // Combinators
          if ((match = rcombinators.exec(soFar))) {
            matched = match.shift();
            tokens.push({
              value: matched,

              // Cast descendant combinators to space
              type: match[0].replace(rtrim, " "),
            });
            soFar = soFar.slice(matched.length);
          }

          // Filters
          for (type in Expr.filter) {
            if (
              (match = matchExpr[type].exec(soFar)) &&
              (!preFilters[type] || (match = preFilters[type](match)))
            ) {
              matched = match.shift();
              tokens.push({
                value: matched,
                type: type,
                matches: match,
              });
              soFar = soFar.slice(matched.length);
            }
          }

          if (!matched) {
            break;
          }
        }

        // Return the length of the invalid excess
        // if we're just parsing
        // Otherwise, throw an error or return tokens
        return parseOnly
          ? soFar.length
          : soFar
          ? Sizzle.error(selector)
          : // Cache the tokens
            tokenCache(selector, groups).slice(0);
      };

      function toSelector(tokens) {
        var i = 0,
          len = tokens.length,
          selector = "";
        for (; i < len; i++) {
          selector += tokens[i].value;
        }
        return selector;
      }

      function addCombinator(matcher, combinator, base) {
        var dir = combinator.dir,
          skip = combinator.next,
          key = skip || dir,
          checkNonElements = base && key === "parentNode",
          doneName = done++;

        return combinator.first
          ? // Check against closest ancestor/preceding element
            function (elem, context, xml) {
              while ((elem = elem[dir])) {
                if (elem.nodeType === 1 || checkNonElements) {
                  return matcher(elem, context, xml);
                }
              }
              return false;
            }
          : // Check against all ancestor/preceding elements
            function (elem, context, xml) {
              var oldCache,
                uniqueCache,
                outerCache,
                newCache = [dirruns, doneName];

              // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
              if (xml) {
                while ((elem = elem[dir])) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    if (matcher(elem, context, xml)) {
                      return true;
                    }
                  }
                }
              } else {
                while ((elem = elem[dir])) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    outerCache = elem[expando] || (elem[expando] = {});

                    // Support: IE <9 only
                    // Defend against cloned attroperties (jQuery gh-1709)
                    uniqueCache =
                      outerCache[elem.uniqueID] ||
                      (outerCache[elem.uniqueID] = {});

                    if (skip && skip === elem.nodeName.toLowerCase()) {
                      elem = elem[dir] || elem;
                    } else if (
                      (oldCache = uniqueCache[key]) &&
                      oldCache[0] === dirruns &&
                      oldCache[1] === doneName
                    ) {
                      // Assign to newCache so results back-propagate to previous elements
                      return (newCache[2] = oldCache[2]);
                    } else {
                      // Reuse newcache so results back-propagate to previous elements
                      uniqueCache[key] = newCache;

                      // A match means we're done; a fail means we have to keep checking
                      if ((newCache[2] = matcher(elem, context, xml))) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            };
      }

      function elementMatcher(matchers) {
        return matchers.length > 1
          ? function (elem, context, xml) {
              var i = matchers.length;
              while (i--) {
                if (!matchers[i](elem, context, xml)) {
                  return false;
                }
              }
              return true;
            }
          : matchers[0];
      }

      function multipleContexts(selector, contexts, results) {
        var i = 0,
          len = contexts.length;
        for (; i < len; i++) {
          Sizzle(selector, contexts[i], results);
        }
        return results;
      }

      function condense(unmatched, map, filter, context, xml) {
        var elem,
          newUnmatched = [],
          i = 0,
          len = unmatched.length,
          mapped = map != null;

        for (; i < len; i++) {
          if ((elem = unmatched[i])) {
            if (!filter || filter(elem, context, xml)) {
              newUnmatched.push(elem);
              if (mapped) {
                map.push(i);
              }
            }
          }
        }

        return newUnmatched;
      }

      function setMatcher(
        preFilter,
        selector,
        matcher,
        postFilter,
        postFinder,
        postSelector
      ) {
        if (postFilter && !postFilter[expando]) {
          postFilter = setMatcher(postFilter);
        }
        if (postFinder && !postFinder[expando]) {
          postFinder = setMatcher(postFinder, postSelector);
        }
        return markFunction(function (seed, results, context, xml) {
          var temp,
            i,
            elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,
            // Get initial elements from seed or context
            elems =
              seed ||
              multipleContexts(
                selector || "*",
                context.nodeType ? [context] : context,
                []
              ),
            // Prefilter to get matcher input, preserving a map for seed-results synchronization
            matcherIn =
              preFilter && (seed || !selector)
                ? condense(elems, preMap, preFilter, context, xml)
                : elems,
            matcherOut = matcher
              ? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                postFinder || (seed ? preFilter : preexisting || postFilter)
                ? // ...intermediate processing is necessary
                  []
                : // ...otherwise use results directly
                  results
              : matcherIn;

          // Find primary matches
          if (matcher) {
            matcher(matcherIn, matcherOut, context, xml);
          }

          // Apply postFilter
          if (postFilter) {
            temp = condense(matcherOut, postMap);
            postFilter(temp, [], context, xml);

            // Un-match failing elements by moving them back to matcherIn
            i = temp.length;
            while (i--) {
              if ((elem = temp[i])) {
                matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
              }
            }
          }

          if (seed) {
            if (postFinder || preFilter) {
              if (postFinder) {
                // Get the final matcherOut by condensing this intermediate into postFinder contexts
                temp = [];
                i = matcherOut.length;
                while (i--) {
                  if ((elem = matcherOut[i])) {
                    // Restore matcherIn since elem is not yet a final match
                    temp.push((matcherIn[i] = elem));
                  }
                }
                postFinder(null, (matcherOut = []), temp, xml);
              }

              // Move matched elements from seed to results to keep them synchronized
              i = matcherOut.length;
              while (i--) {
                if (
                  (elem = matcherOut[i]) &&
                  (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1
                ) {
                  seed[temp] = !(results[temp] = elem);
                }
              }
            }

            // Add elements to results, through postFinder if defined
          } else {
            matcherOut = condense(
              matcherOut === results
                ? matcherOut.splice(preexisting, matcherOut.length)
                : matcherOut
            );
            if (postFinder) {
              postFinder(null, results, matcherOut, xml);
            } else {
              push.apply(results, matcherOut);
            }
          }
        });
      }

      function matcherFromTokens(tokens) {
        var checkContext,
          matcher,
          j,
          len = tokens.length,
          leadingRelative = Expr.relative[tokens[0].type],
          implicitRelative = leadingRelative || Expr.relative[" "],
          i = leadingRelative ? 1 : 0,
          // The foundational matcher ensures that elements are reachable from top-level context(s)
          matchContext = addCombinator(
            function (elem) {
              return elem === checkContext;
            },
            implicitRelative,
            true
          ),
          matchAnyContext = addCombinator(
            function (elem) {
              return indexOf(checkContext, elem) > -1;
            },
            implicitRelative,
            true
          ),
          matchers = [
            function (elem, context, xml) {
              var ret =
                (!leadingRelative && (xml || context !== outermostContext)) ||
                ((checkContext = context).nodeType
                  ? matchContext(elem, context, xml)
                  : matchAnyContext(elem, context, xml));

              // Avoid hanging onto element (issue #299)
              checkContext = null;
              return ret;
            },
          ];

        for (; i < len; i++) {
          if ((matcher = Expr.relative[tokens[i].type])) {
            matchers = [addCombinator(elementMatcher(matchers), matcher)];
          } else {
            matcher = Expr.filter[tokens[i].type].apply(
              null,
              tokens[i].matches
            );

            // Return special upon seeing a positional matcher
            if (matcher[expando]) {
              // Find the next relative operator (if any) for proper handling
              j = ++i;
              for (; j < len; j++) {
                if (Expr.relative[tokens[j].type]) {
                  break;
                }
              }
              return setMatcher(
                i > 1 && elementMatcher(matchers),
                i > 1 &&
                  toSelector(
                    // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                    tokens
                      .slice(0, i - 1)
                      .concat({ value: tokens[i - 2].type === " " ? "*" : "" })
                  ).replace(rtrim, "$1"),
                matcher,
                i < j && matcherFromTokens(tokens.slice(i, j)),
                j < len && matcherFromTokens((tokens = tokens.slice(j))),
                j < len && toSelector(tokens)
              );
            }
            matchers.push(matcher);
          }
        }

        return elementMatcher(matchers);
      }

      function matcherFromGroupMatchers(elementMatchers, setMatchers) {
        var bySet = setMatchers.length > 0,
          byElement = elementMatchers.length > 0,
          superMatcher = function (seed, context, xml, results, outermost) {
            var elem,
              j,
              matcher,
              matchedCount = 0,
              i = "0",
              unmatched = seed && [],
              setMatched = [],
              contextBackup = outermostContext,
              // We must always have either seed elements or outermost context
              elems = seed || (byElement && Expr.find["TAG"]("*", outermost)),
              // Use integer dirruns iff this is the outermost matcher
              dirrunsUnique = (dirruns +=
                contextBackup == null ? 1 : Math.random() || 0.1),
              len = elems.length;

            if (outermost) {
              // Support: IE 11+, Edge 17 - 18+
              // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
              // two documents; shallow comparisons work.
              // eslint-disable-next-line eqeqeq
              outermostContext = context == document || context || outermost;
            }

            // Add elements passing elementMatchers directly to results
            // Support: IE<9, Safari
            // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
            for (; i !== len && (elem = elems[i]) != null; i++) {
              if (byElement && elem) {
                j = 0;

                // Support: IE 11+, Edge 17 - 18+
                // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                // two documents; shallow comparisons work.
                // eslint-disable-next-line eqeqeq
                if (!context && elem.ownerDocument != document) {
                  setDocument(elem);
                  xml = !documentIsHTML;
                }
                while ((matcher = elementMatchers[j++])) {
                  if (matcher(elem, context || document, xml)) {
                    results.push(elem);
                    break;
                  }
                }
                if (outermost) {
                  dirruns = dirrunsUnique;
                }
              }

              // Track unmatched elements for set filters
              if (bySet) {
                // They will have gone through all possible matchers
                if ((elem = !matcher && elem)) {
                  matchedCount--;
                }

                // Lengthen the array for every element, matched or not
                if (seed) {
                  unmatched.push(elem);
                }
              }
            }

            // `i` is now the count of elements visited above, and adding it to `matchedCount`
            // makes the latter nonnegative.
            matchedCount += i;

            // Apply set filters to unmatched elements
            // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
            // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
            // no element matchers and no seed.
            // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
            // case, which will result in a "00" `matchedCount` that differs from `i` but is also
            // numerically zero.
            if (bySet && i !== matchedCount) {
              j = 0;
              while ((matcher = setMatchers[j++])) {
                matcher(unmatched, setMatched, context, xml);
              }

              if (seed) {
                // Reintegrate element matches to eliminate the need for sorting
                if (matchedCount > 0) {
                  while (i--) {
                    if (!(unmatched[i] || setMatched[i])) {
                      setMatched[i] = pop.call(results);
                    }
                  }
                }

                // Discard index placeholder values to get only actual matches
                setMatched = condense(setMatched);
              }

              // Add matches to results
              push.apply(results, setMatched);

              // Seedless set matches succeeding multiple successful matchers stipulate sorting
              if (
                outermost &&
                !seed &&
                setMatched.length > 0 &&
                matchedCount + setMatchers.length > 1
              ) {
                Sizzle.uniqueSort(results);
              }
            }

            // Override manipulation of globals by nested matchers
            if (outermost) {
              dirruns = dirrunsUnique;
              outermostContext = contextBackup;
            }

            return unmatched;
          };

        return bySet ? markFunction(superMatcher) : superMatcher;
      }

      compile = Sizzle.compile = function (
        selector,
        match /* Internal Use Only */
      ) {
        var i,
          setMatchers = [],
          elementMatchers = [],
          cached = compilerCache[selector + " "];

        if (!cached) {
          // Generate a function of recursive functions that can be used to check each element
          if (!match) {
            match = tokenize(selector);
          }
          i = match.length;
          while (i--) {
            cached = matcherFromTokens(match[i]);
            if (cached[expando]) {
              setMatchers.push(cached);
            } else {
              elementMatchers.push(cached);
            }
          }

          // Cache the compiled function
          cached = compilerCache(
            selector,
            matcherFromGroupMatchers(elementMatchers, setMatchers)
          );

          // Save selector and tokenization
          cached.selector = selector;
        }
        return cached;
      };

      /**
       * A low-level selection function that works with Sizzle's compiled
       *  selector functions
       * @param {String|Function} selector A selector or a pre-compiled
       *  selector function built with Sizzle.compile
       * @param {Element} context
       * @param {Array} [results]
       * @param {Array} [seed] A set of elements to match against
       */
      select = Sizzle.select = function (selector, context, results, seed) {
        var i,
          tokens,
          token,
          type,
          find,
          compiled = typeof selector === "function" && selector,
          match = !seed && tokenize((selector = compiled.selector || selector));

        results = results || [];

        // Try to minimize operations if there is only one selector in the list and no seed
        // (the latter of which guarantees us context)
        if (match.length === 1) {
          // Reduce context if the leading compound selector is an ID
          tokens = match[0] = match[0].slice(0);
          if (
            tokens.length > 2 &&
            (token = tokens[0]).type === "ID" &&
            context.nodeType === 9 &&
            documentIsHTML &&
            Expr.relative[tokens[1].type]
          ) {
            context = (Expr.find["ID"](
              token.matches[0].replace(runescape, funescape),
              context
            ) || [])[0];
            if (!context) {
              return results;

              // Precompiled matchers will still verify ancestry, so step up a level
            } else if (compiled) {
              context = context.parentNode;
            }

            selector = selector.slice(tokens.shift().value.length);
          }

          // Fetch a seed set for right-to-left matching
          i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
          while (i--) {
            token = tokens[i];

            // Abort if we hit a combinator
            if (Expr.relative[(type = token.type)]) {
              break;
            }
            if ((find = Expr.find[type])) {
              // Search, expanding context for leading sibling combinators
              if (
                (seed = find(
                  token.matches[0].replace(runescape, funescape),
                  (rsibling.test(tokens[0].type) &&
                    testContext(context.parentNode)) ||
                    context
                ))
              ) {
                // If seed is empty or no tokens remain, we can return early
                tokens.splice(i, 1);
                selector = seed.length && toSelector(tokens);
                if (!selector) {
                  push.apply(results, seed);
                  return results;
                }

                break;
              }
            }
          }
        }

        // Compile and execute a filtering function if one is not provided
        // Provide `match` to avoid retokenization if we modified the selector above
        (compiled || compile(selector, match))(
          seed,
          context,
          !documentIsHTML,
          results,
          !context ||
            (rsibling.test(selector) && testContext(context.parentNode)) ||
            context
        );
        return results;
      };

      // One-time assignments

      // Sort stability
      support.sortStable =
        expando.split("").sort(sortOrder).join("") === expando;

      // Support: Chrome 14-35+
      // Always assume duplicates if they aren't passed to the comparison function
      support.detectDuplicates = !!hasDuplicate;

      // Initialize against the default document
      setDocument();

      // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
      // Detached nodes confoundingly follow *each other*
      support.sortDetached = assert(function (el) {
        // Should return 1, but returns 4 (following)
        return (
          el.compareDocumentPosition(document.createElement("fieldset")) & 1
        );
      });

      // Support: IE<8
      // Prevent attribute/property "interpolation"
      // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
      if (
        !assert(function (el) {
          el.innerHTML = "<a href='#'></a>";
          return el.firstChild.getAttribute("href") === "#";
        })
      ) {
        addHandle("type|href|height|width", function (elem, name, isXML) {
          if (!isXML) {
            return elem.getAttribute(
              name,
              name.toLowerCase() === "type" ? 1 : 2
            );
          }
        });
      }

      // Support: IE<9
      // Use defaultValue in place of getAttribute("value")
      if (
        !support.attributes ||
        !assert(function (el) {
          el.innerHTML = "<input/>";
          el.firstChild.setAttribute("value", "");
          return el.firstChild.getAttribute("value") === "";
        })
      ) {
        addHandle("value", function (elem, _name, isXML) {
          if (!isXML && elem.nodeName.toLowerCase() === "input") {
            return elem.defaultValue;
          }
        });
      }

      // Support: IE<9
      // Use getAttributeNode to fetch booleans when getAttribute lies
      if (
        !assert(function (el) {
          return el.getAttribute("disabled") == null;
        })
      ) {
        addHandle(booleans, function (elem, name, isXML) {
          var val;
          if (!isXML) {
            return elem[name] === true
              ? name.toLowerCase()
              : (val = elem.getAttributeNode(name)) && val.specified
              ? val.value
              : null;
          }
        });
      }

      return Sizzle;
    })(window);

  jQuery.find = Sizzle;
  jQuery.expr = Sizzle.selectors;

  // Deprecated
  jQuery.expr[":"] = jQuery.expr.pseudos;
  jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
  jQuery.text = Sizzle.getText;
  jQuery.isXMLDoc = Sizzle.isXML;
  jQuery.contains = Sizzle.contains;
  jQuery.escapeSelector = Sizzle.escape;

  var dir = function (elem, dir, until) {
    var matched = [],
      truncate = until !== undefined;

    while ((elem = elem[dir]) && elem.nodeType !== 9) {
      if (elem.nodeType === 1) {
        if (truncate && jQuery(elem).is(until)) {
          break;
        }
        matched.push(elem);
      }
    }
    return matched;
  };

  var siblings = function (n, elem) {
    var matched = [];

    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== elem) {
        matched.push(n);
      }
    }

    return matched;
  };

  var rneedsContext = jQuery.expr.match.needsContext;

  function nodeName(elem, name) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
  }
  var rsingleTag =
    /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;

  // Implement the identical functionality for filter and not
  function winnow(elements, qualifier, not) {
    if (isFunction(qualifier)) {
      return jQuery.grep(elements, function (elem, i) {
        return !!qualifier.call(elem, i, elem) !== not;
      });
    }

    // Single element
    if (qualifier.nodeType) {
      return jQuery.grep(elements, function (elem) {
        return (elem === qualifier) !== not;
      });
    }

    // Arraylike of elements (jQuery, arguments, Array)
    if (typeof qualifier !== "string") {
      return jQuery.grep(elements, function (elem) {
        return indexOf.call(qualifier, elem) > -1 !== not;
      });
    }

    // Filtered directly for both simple and complex selectors
    return jQuery.filter(qualifier, elements, not);
  }

  jQuery.filter = function (expr, elems, not) {
    var elem = elems[0];

    if (not) {
      expr = ":not(" + expr + ")";
    }

    if (elems.length === 1 && elem.nodeType === 1) {
      return jQuery.find.matchesSelector(elem, expr) ? [elem] : [];
    }

    return jQuery.find.matches(
      expr,
      jQuery.grep(elems, function (elem) {
        return elem.nodeType === 1;
      })
    );
  };

  jQuery.fn.extend({
    find: function (selector) {
      var i,
        ret,
        len = this.length,
        self = this;

      if (typeof selector !== "string") {
        return this.pushStack(
          jQuery(selector).filter(function () {
            for (i = 0; i < len; i++) {
              if (jQuery.contains(self[i], this)) {
                return true;
              }
            }
          })
        );
      }

      ret = this.pushStack([]);

      for (i = 0; i < len; i++) {
        jQuery.find(selector, self[i], ret);
      }

      return len > 1 ? jQuery.uniqueSort(ret) : ret;
    },
    filter: function (selector) {
      return this.pushStack(winnow(this, selector || [], false));
    },
    not: function (selector) {
      return this.pushStack(winnow(this, selector || [], true));
    },
    is: function (selector) {
      return !!winnow(
        this,

        // If this is a positional/relative selector, check membership in the returned set
        // so $("p:first").is("p:last") won't return true for a doc with two "p".
        typeof selector === "string" && rneedsContext.test(selector)
          ? jQuery(selector)
          : selector || [],
        false
      ).length;
    },
  });

  // Initialize a jQuery object

  // A central reference to the root jQuery(document)
  var rootjQuery,
    // A simple way to check for HTML strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    // Strict HTML recognition (#11290: must start with <)
    // Shortcut simple #id case for speed
    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
    init = (jQuery.fn.init = function (selector, context, root) {
      var match, elem;

      // HANDLE: $(""), $(null), $(undefined), $(false)
      if (!selector) {
        return this;
      }

      // Method init() accepts an alternate rootjQuery
      // so migrate can support jQuery.sub (gh-2101)
      root = root || rootjQuery;

      // Handle HTML strings
      if (typeof selector === "string") {
        if (
          selector[0] === "<" &&
          selector[selector.length - 1] === ">" &&
          selector.length >= 3
        ) {
          // Assume that strings that start and end with <> are HTML and skip the regex check
          match = [null, selector, null];
        } else {
          match = rquickExpr.exec(selector);
        }

        // Match html or make sure no context is specified for #id
        if (match && (match[1] || !context)) {
          // HANDLE: $(html) -> $(array)
          if (match[1]) {
            context = context instanceof jQuery ? context[0] : context;

            // Option to run scripts is true for back-compat
            // Intentionally let the error be thrown if parseHTML is not present
            jQuery.merge(
              this,
              jQuery.parseHTML(
                match[1],
                context && context.nodeType
                  ? context.ownerDocument || context
                  : document,
                true
              )
            );

            // HANDLE: $(html, props)
            if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
              for (match in context) {
                // Properties of context are called as methods if possible
                if (isFunction(this[match])) {
                  this[match](context[match]);

                  // ...and otherwise set as attributes
                } else {
                  this.attr(match, context[match]);
                }
              }
            }

            return this;

            // HANDLE: $(#id)
          } else {
            elem = document.getElementById(match[2]);

            if (elem) {
              // Inject the element directly into the jQuery object
              this[0] = elem;
              this.length = 1;
            }
            return this;
          }

          // HANDLE: $(expr, $(...))
        } else if (!context || context.jquery) {
          return (context || root).find(selector);

          // HANDLE: $(expr, context)
          // (which is just equivalent to: $(context).find(expr)
        } else {
          return this.constructor(context).find(selector);
        }

        // HANDLE: $(DOMElement)
      } else if (selector.nodeType) {
        this[0] = selector;
        this.length = 1;
        return this;

        // HANDLE: $(function)
        // Shortcut for document ready
      } else if (isFunction(selector)) {
        return root.ready !== undefined
          ? root.ready(selector)
          : // Execute immediately if ready is not present
            selector(jQuery);
      }

      return jQuery.makeArray(selector, this);
    });

  // Give the init function the jQuery prototype for later instantiation
  init.prototype = jQuery.fn;

  // Initialize central reference
  rootjQuery = jQuery(document);

  var rparentsprev = /^(?:parents|prev(?:Until|All))/,
    // Methods guaranteed to produce a unique set when starting from a unique set
    guaranteedUnique = {
      children: true,
      contents: true,
      next: true,
      prev: true,
    };

  jQuery.fn.extend({
    has: function (target) {
      var targets = jQuery(target, this),
        l = targets.length;

      return this.filter(function () {
        var i = 0;
        for (; i < l; i++) {
          if (jQuery.contains(this, targets[i])) {
            return true;
          }
        }
      });
    },

    closest: function (selectors, context) {
      var cur,
        i = 0,
        l = this.length,
        matched = [],
        targets = typeof selectors !== "string" && jQuery(selectors);

      // Positional selectors never match, since there's no _selection_ context
      if (!rneedsContext.test(selectors)) {
        for (; i < l; i++) {
          for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
            // Always skip document fragments
            if (
              cur.nodeType < 11 &&
              (targets
                ? targets.index(cur) > -1
                : // Don't pass non-elements to Sizzle
                  cur.nodeType === 1 &&
                  jQuery.find.matchesSelector(cur, selectors))
            ) {
              matched.push(cur);
              break;
            }
          }
        }
      }

      return this.pushStack(
        matched.length > 1 ? jQuery.uniqueSort(matched) : matched
      );
    },

    // Determine the position of an element within the set
    index: function (elem) {
      // No argument, return index in parent
      if (!elem) {
        return this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1;
      }

      // Index in selector
      if (typeof elem === "string") {
        return indexOf.call(jQuery(elem), this[0]);
      }

      // Locate the position of the desired element
      return indexOf.call(
        this,

        // If it receives a jQuery object, the first element is used
        elem.jquery ? elem[0] : elem
      );
    },

    add: function (selector, context) {
      return this.pushStack(
        jQuery.uniqueSort(jQuery.merge(this.get(), jQuery(selector, context)))
      );
    },

    addBack: function (selector) {
      return this.add(
        selector == null ? this.prevObject : this.prevObject.filter(selector)
      );
    },
  });

  function sibling(cur, dir) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur;
  }

  jQuery.each(
    {
      parent: function (elem) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
      },
      parents: function (elem) {
        return dir(elem, "parentNode");
      },
      parentsUntil: function (elem, _i, until) {
        return dir(elem, "parentNode", until);
      },
      next: function (elem) {
        return sibling(elem, "nextSibling");
      },
      prev: function (elem) {
        return sibling(elem, "previousSibling");
      },
      nextAll: function (elem) {
        return dir(elem, "nextSibling");
      },
      prevAll: function (elem) {
        return dir(elem, "previousSibling");
      },
      nextUntil: function (elem, _i, until) {
        return dir(elem, "nextSibling", until);
      },
      prevUntil: function (elem, _i, until) {
        return dir(elem, "previousSibling", until);
      },
      siblings: function (elem) {
        return siblings((elem.parentNode || {}).firstChild, elem);
      },
      children: function (elem) {
        return siblings(elem.firstChild);
      },
      contents: function (elem) {
        if (
          elem.contentDocument != null &&
          // Support: IE 11+
          // <object> elements with no `data` attribute has an object
          // `contentDocument` with a `null` prototype.
          getProto(elem.contentDocument)
        ) {
          return elem.contentDocument;
        }

        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
        // Treat the template element as a regular one in browsers that
        // don't support it.
        if (nodeName(elem, "template")) {
          elem = elem.content || elem;
        }

        return jQuery.merge([], elem.childNodes);
      },
    },
    function (name, fn) {
      jQuery.fn[name] = function (until, selector) {
        var matched = jQuery.map(this, fn, until);

        if (name.slice(-5) !== "Until") {
          selector = until;
        }

        if (selector && typeof selector === "string") {
          matched = jQuery.filter(selector, matched);
        }

        if (this.length > 1) {
          // Remove duplicates
          if (!guaranteedUnique[name]) {
            jQuery.uniqueSort(matched);
          }

          // Reverse order for parents* and prev-derivatives
          if (rparentsprev.test(name)) {
            matched.reverse();
          }
        }

        return this.pushStack(matched);
      };
    }
  );
  var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

  // Convert String-formatted options into Object-formatted ones
  function createOptions(options) {
    var object = {};
    jQuery.each(options.match(rnothtmlwhite) || [], function (_, flag) {
      object[flag] = true;
    });
    return object;
  }

  /*
   * Create a callback list using the following parameters:
   *
   *	options: an optional list of space-separated options that will change how
   *			the callback list behaves or a more traditional option object
   *
   * By default a callback list will act like an event callback list and can be
   * "fired" multiple times.
   *
   * Possible options:
   *
   *	once:			will ensure the callback list can only be fired once (like a Deferred)
   *
   *	memory:			will keep track of previous values and will call any callback added
   *					after the list has been fired right away with the latest "memorized"
   *					values (like a Deferred)
   *
   *	unique:			will ensure a callback can only be added once (no duplicate in the list)
   *
   *	stopOnFalse:	interrupt callings when a callback returns false
   *
   */
  jQuery.Callbacks = function (options) {
    // Convert options from String-formatted to Object-formatted if needed
    // (we check in cache first)
    options =
      typeof options === "string"
        ? createOptions(options)
        : jQuery.extend({}, options);

    var // Flag to know if list is currently firing
      firing,
      // Last fire value for non-forgettable lists
      memory,
      // Flag to know if list was already fired
      fired,
      // Flag to prevent firing
      locked,
      // Actual callback list
      list = [],
      // Queue of execution data for repeatable lists
      queue = [],
      // Index of currently firing callback (modified by add/remove as needed)
      firingIndex = -1,
      // Fire callbacks
      fire = function () {
        // Enforce single-firing
        locked = locked || options.once;

        // Execute callbacks for all pending executions,
        // respecting firingIndex overrides and runtime changes
        fired = firing = true;
        for (; queue.length; firingIndex = -1) {
          memory = queue.shift();
          while (++firingIndex < list.length) {
            // Run callback and check for early termination
            if (
              list[firingIndex].apply(memory[0], memory[1]) === false &&
              options.stopOnFalse
            ) {
              // Jump to end and forget the data so .add doesn't re-fire
              firingIndex = list.length;
              memory = false;
            }
          }
        }

        // Forget the data if we're done with it
        if (!options.memory) {
          memory = false;
        }

        firing = false;

        // Clean up if we're done firing for good
        if (locked) {
          // Keep an empty list if we have data for future add calls
          if (memory) {
            list = [];

            // Otherwise, this object is spent
          } else {
            list = "";
          }
        }
      },
      // Actual Callbacks object
      self = {
        // Add a callback or a collection of callbacks to the list
        add: function () {
          if (list) {
            // If we have memory from a past run, we should fire after adding
            if (memory && !firing) {
              firingIndex = list.length - 1;
              queue.push(memory);
            }

            (function add(args) {
              jQuery.each(args, function (_, arg) {
                if (isFunction(arg)) {
                  if (!options.unique || !self.has(arg)) {
                    list.push(arg);
                  }
                } else if (arg && arg.length && toType(arg) !== "string") {
                  // Inspect recursively
                  add(arg);
                }
              });
            })(arguments);

            if (memory && !firing) {
              fire();
            }
          }
          return this;
        },

        // Remove a callback from the list
        remove: function () {
          jQuery.each(arguments, function (_, arg) {
            var index;
            while ((index = jQuery.inArray(arg, list, index)) > -1) {
              list.splice(index, 1);

              // Handle firing indexes
              if (index <= firingIndex) {
                firingIndex--;
              }
            }
          });
          return this;
        },

        // Check if a given callback is in the list.
        // If no argument is given, return whether or not list has callbacks attached.
        has: function (fn) {
          return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0;
        },

        // Remove all callbacks from the list
        empty: function () {
          if (list) {
            list = [];
          }
          return this;
        },

        // Disable .fire and .add
        // Abort any current/pending executions
        // Clear all callbacks and values
        disable: function () {
          locked = queue = [];
          list = memory = "";
          return this;
        },
        disabled: function () {
          return !list;
        },

        // Disable .fire
        // Also disable .add unless we have memory (since it would have no effect)
        // Abort any pending executions
        lock: function () {
          locked = queue = [];
          if (!memory && !firing) {
            list = memory = "";
          }
          return this;
        },
        locked: function () {
          return !!locked;
        },

        // Call all callbacks with the given context and arguments
        fireWith: function (context, args) {
          if (!locked) {
            args = args || [];
            args = [context, args.slice ? args.slice() : args];
            queue.push(args);
            if (!firing) {
              fire();
            }
          }
          return this;
        },

        // Call all the callbacks with the given arguments
        fire: function () {
          self.fireWith(this, arguments);
          return this;
        },

        // To know if the callbacks have already been called at least once
        fired: function () {
          return !!fired;
        },
      };

    return self;
  };

  function Identity(v) {
    return v;
  }
  function Thrower(ex) {
    throw ex;
  }

  function adoptValue(value, resolve, reject, noValue) {
    var method;

    try {
      // Check for promise aspect first to privilege synchronous behavior
      if (value && isFunction((method = value.promise))) {
        method.call(value).done(resolve).fail(reject);

        // Other thenables
      } else if (value && isFunction((method = value.then))) {
        method.call(value, resolve, reject);

        // Other non-thenables
      } else {
        // Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
        // * false: [ value ].slice( 0 ) => resolve( value )
        // * true: [ value ].slice( 1 ) => resolve()
        resolve.apply(undefined, [value].slice(noValue));
      }

      // For Promises/A+, convert exceptions into rejections
      // Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
      // Deferred#then to conditionally suppress rejection.
    } catch (value) {
      // Support: Android 4.0 only
      // Strict mode functions invoked without .call/.apply get global-object context
      reject.apply(undefined, [value]);
    }
  }

  jQuery.extend({
    Deferred: function (func) {
      var tuples = [
          // action, add listener, callbacks,
          // ... .then handlers, argument index, [final state]
          [
            "notify",
            "progress",
            jQuery.Callbacks("memory"),
            jQuery.Callbacks("memory"),
            2,
          ],
          [
            "resolve",
            "done",
            jQuery.Callbacks("once memory"),
            jQuery.Callbacks("once memory"),
            0,
            "resolved",
          ],
          [
            "reject",
            "fail",
            jQuery.Callbacks("once memory"),
            jQuery.Callbacks("once memory"),
            1,
            "rejected",
          ],
        ],
        state = "pending",
        promise = {
          state: function () {
            return state;
          },
          always: function () {
            deferred.done(arguments).fail(arguments);
            return this;
          },
          catch: function (fn) {
            return promise.then(null, fn);
          },

          // Keep pipe for back-compat
          pipe: function (/* fnDone, fnFail, fnProgress */) {
            var fns = arguments;

            return jQuery
              .Deferred(function (newDefer) {
                jQuery.each(tuples, function (_i, tuple) {
                  // Map tuples (progress, done, fail) to arguments (done, fail, progress)
                  var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];

                  // deferred.progress(function() { bind to newDefer or newDefer.notify })
                  // deferred.done(function() { bind to newDefer or newDefer.resolve })
                  // deferred.fail(function() { bind to newDefer or newDefer.reject })
                  deferred[tuple[1]](function () {
                    var returned = fn && fn.apply(this, arguments);
                    if (returned && isFunction(returned.promise)) {
                      returned
                        .promise()
                        .progress(newDefer.notify)
                        .done(newDefer.resolve)
                        .fail(newDefer.reject);
                    } else {
                      newDefer[tuple[0] + "With"](
                        this,
                        fn ? [returned] : arguments
                      );
                    }
                  });
                });
                fns = null;
              })
              .promise();
          },
          then: function (onFulfilled, onRejected, onProgress) {
            var maxDepth = 0;
            function resolve(depth, deferred, handler, special) {
              return function () {
                var that = this,
                  args = arguments,
                  mightThrow = function () {
                    var returned, then;

                    // Support: Promises/A+ section 2.3.3.3.3
                    // https://promisesaplus.com/#point-59
                    // Ignore double-resolution attempts
                    if (depth < maxDepth) {
                      return;
                    }

                    returned = handler.apply(that, args);

                    // Support: Promises/A+ section 2.3.1
                    // https://promisesaplus.com/#point-48
                    if (returned === deferred.promise()) {
                      throw new TypeError("Thenable self-resolution");
                    }

                    // Support: Promises/A+ sections 2.3.3.1, 3.5
                    // https://promisesaplus.com/#point-54
                    // https://promisesaplus.com/#point-75
                    // Retrieve `then` only once
                    then =
                      returned &&
                      // Support: Promises/A+ section 2.3.4
                      // https://promisesaplus.com/#point-64
                      // Only check objects and functions for thenability
                      (typeof returned === "object" ||
                        typeof returned === "function") &&
                      returned.then;

                    // Handle a returned thenable
                    if (isFunction(then)) {
                      // Special processors (notify) just wait for resolution
                      if (special) {
                        then.call(
                          returned,
                          resolve(maxDepth, deferred, Identity, special),
                          resolve(maxDepth, deferred, Thrower, special)
                        );

                        // Normal processors (resolve) also hook into progress
                      } else {
                        // ...and disregard older resolution values
                        maxDepth++;

                        then.call(
                          returned,
                          resolve(maxDepth, deferred, Identity, special),
                          resolve(maxDepth, deferred, Thrower, special),
                          resolve(
                            maxDepth,
                            deferred,
                            Identity,
                            deferred.notifyWith
                          )
                        );
                      }

                      // Handle all other returned values
                    } else {
                      // Only substitute handlers pass on context
                      // and multiple values (non-spec behavior)
                      if (handler !== Identity) {
                        that = undefined;
                        args = [returned];
                      }

                      // Process the value(s)
                      // Default process is resolve
                      (special || deferred.resolveWith)(that, args);
                    }
                  },
                  // Only normal processors (resolve) catch and reject exceptions
                  process = special
                    ? mightThrow
                    : function () {
                        try {
                          mightThrow();
                        } catch (e) {
                          if (jQuery.Deferred.exceptionHook) {
                            jQuery.Deferred.exceptionHook(
                              e,
                              process.stackTrace
                            );
                          }

                          // Support: Promises/A+ section 2.3.3.3.4.1
                          // https://promisesaplus.com/#point-61
                          // Ignore post-resolution exceptions
                          if (depth + 1 >= maxDepth) {
                            // Only substitute handlers pass on context
                            // and multiple values (non-spec behavior)
                            if (handler !== Thrower) {
                              that = undefined;
                              args = [e];
                            }

                            deferred.rejectWith(that, args);
                          }
                        }
                      };

                // Support: Promises/A+ section 2.3.3.3.1
                // https://promisesaplus.com/#point-57
                // Re-resolve promises immediately to dodge false rejection from
                // subsequent errors
                if (depth) {
                  process();
                } else {
                  // Call an optional hook to record the stack, in case of exception
                  // since it's otherwise lost when execution goes async
                  if (jQuery.Deferred.getStackHook) {
                    process.stackTrace = jQuery.Deferred.getStackHook();
                  }
                  window.setTimeout(process);
                }
              };
            }

            return jQuery
              .Deferred(function (newDefer) {
                // progress_handlers.add( ... )
                tuples[0][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onProgress) ? onProgress : Identity,
                    newDefer.notifyWith
                  )
                );

                // fulfilled_handlers.add( ... )
                tuples[1][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onFulfilled) ? onFulfilled : Identity
                  )
                );

                // rejected_handlers.add( ... )
                tuples[2][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onRejected) ? onRejected : Thrower
                  )
                );
              })
              .promise();
          },

          // Get a promise for this deferred
          // If obj is provided, the promise aspect is added to the object
          promise: function (obj) {
            return obj != null ? jQuery.extend(obj, promise) : promise;
          },
        },
        deferred = {};

      // Add list-specific methods
      jQuery.each(tuples, function (i, tuple) {
        var list = tuple[2],
          stateString = tuple[5];

        // promise.progress = list.add
        // promise.done = list.add
        // promise.fail = list.add
        promise[tuple[1]] = list.add;

        // Handle state
        if (stateString) {
          list.add(
            function () {
              // state = "resolved" (i.e., fulfilled)
              // state = "rejected"
              state = stateString;
            },

            // rejected_callbacks.disable
            // fulfilled_callbacks.disable
            tuples[3 - i][2].disable,

            // rejected_handlers.disable
            // fulfilled_handlers.disable
            tuples[3 - i][3].disable,

            // progress_callbacks.lock
            tuples[0][2].lock,

            // progress_handlers.lock
            tuples[0][3].lock
          );
        }

        // progress_handlers.fire
        // fulfilled_handlers.fire
        // rejected_handlers.fire
        list.add(tuple[3].fire);

        // deferred.notify = function() { deferred.notifyWith(...) }
        // deferred.resolve = function() { deferred.resolveWith(...) }
        // deferred.reject = function() { deferred.rejectWith(...) }
        deferred[tuple[0]] = function () {
          deferred[tuple[0] + "With"](
            this === deferred ? undefined : this,
            arguments
          );
          return this;
        };

        // deferred.notifyWith = list.fireWith
        // deferred.resolveWith = list.fireWith
        // deferred.rejectWith = list.fireWith
        deferred[tuple[0] + "With"] = list.fireWith;
      });

      // Make the deferred a promise
      promise.promise(deferred);

      // Call given func if any
      if (func) {
        func.call(deferred, deferred);
      }

      // All done!
      return deferred;
    },

    // Deferred helper
    when: function (singleValue) {
      var // count of uncompleted subordinates
        remaining = arguments.length,
        // count of unprocessed arguments
        i = remaining,
        // subordinate fulfillment data
        resolveContexts = Array(i),
        resolveValues = slice.call(arguments),
        // the master Deferred
        master = jQuery.Deferred(),
        // subordinate callback factory
        updateFunc = function (i) {
          return function (value) {
            resolveContexts[i] = this;
            resolveValues[i] =
              arguments.length > 1 ? slice.call(arguments) : value;
            if (!--remaining) {
              master.resolveWith(resolveContexts, resolveValues);
            }
          };
        };

      // Single- and empty arguments are adopted like Promise.resolve
      if (remaining <= 1) {
        adoptValue(
          singleValue,
          master.done(updateFunc(i)).resolve,
          master.reject,
          !remaining
        );

        // Use .then() to unwrap secondary thenables (cf. gh-3000)
        if (
          master.state() === "pending" ||
          isFunction(resolveValues[i] && resolveValues[i].then)
        ) {
          return master.then();
        }
      }

      // Multiple arguments are aggregated like Promise.all array elements
      while (i--) {
        adoptValue(resolveValues[i], updateFunc(i), master.reject);
      }

      return master.promise();
    },
  });

  // These usually indicate a programmer mistake during development,
  // warn about them ASAP rather than swallowing them by default.
  var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

  jQuery.Deferred.exceptionHook = function (error, stack) {
    // Support: IE 8 - 9 only
    // Console exists when dev tools are open, which can happen at any time
    if (
      window.console &&
      window.console.warn &&
      error &&
      rerrorNames.test(error.name)
    ) {
      window.console.warn(
        "jQuery.Deferred exception: " + error.message,
        error.stack,
        stack
      );
    }
  };

  jQuery.readyException = function (error) {
    window.setTimeout(function () {
      throw error;
    });
  };

  // The deferred used on DOM ready
  var readyList = jQuery.Deferred();

  jQuery.fn.ready = function (fn) {
    readyList
      .then(fn)

      // Wrap jQuery.readyException in a function so that the lookup
      // happens at the time of error handling instead of callback
      // registration.
      .catch(function (error) {
        jQuery.readyException(error);
      });

    return this;
  };

  jQuery.extend({
    // Is the DOM ready to be used? Set to true once it occurs.
    isReady: false,

    // A counter to track how many items to wait for before
    // the ready event fires. See #6781
    readyWait: 1,

    // Handle when the DOM is ready
    ready: function (wait) {
      // Abort if there are pending holds or we're already ready
      if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
        return;
      }

      // Remember that the DOM is ready
      jQuery.isReady = true;

      // If a normal DOM Ready event fired, decrement, and wait if need be
      if (wait !== true && --jQuery.readyWait > 0) {
        return;
      }

      // If there are functions bound, to execute
      readyList.resolveWith(document, [jQuery]);
    },
  });

  jQuery.ready.then = readyList.then;

  // The ready event handler and self cleanup method
  function completed() {
    document.removeEventListener("DOMContentLoaded", completed);
    window.removeEventListener("load", completed);
    jQuery.ready();
  }

  // Catch cases where $(document).ready() is called
  // after the browser event has already occurred.
  // Support: IE <=9 - 10 only
  // Older IE sometimes signals "interactive" too soon
  if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    // Handle it asynchronously to allow scripts the opportunity to delay ready
    window.setTimeout(jQuery.ready);
  } else {
    // Use the handy event callback
    document.addEventListener("DOMContentLoaded", completed);

    // A fallback to window.onload, that will always work
    window.addEventListener("load", completed);
  }

  // Multifunctional method to get and set values of a collection
  // The value/s can optionally be executed if it's a function
  var access = function (elems, fn, key, value, chainable, emptyGet, raw) {
    var i = 0,
      len = elems.length,
      bulk = key == null;

    // Sets many values
    if (toType(key) === "object") {
      chainable = true;
      for (i in key) {
        access(elems, fn, i, key[i], true, emptyGet, raw);
      }

      // Sets one value
    } else if (value !== undefined) {
      chainable = true;

      if (!isFunction(value)) {
        raw = true;
      }

      if (bulk) {
        // Bulk operations run against the entire set
        if (raw) {
          fn.call(elems, value);
          fn = null;

          // ...except when executing function values
        } else {
          bulk = fn;
          fn = function (elem, _key, value) {
            return bulk.call(jQuery(elem), value);
          };
        }
      }

      if (fn) {
        for (; i < len; i++) {
          fn(
            elems[i],
            key,
            raw ? value : value.call(elems[i], i, fn(elems[i], key))
          );
        }
      }
    }

    if (chainable) {
      return elems;
    }

    // Gets
    if (bulk) {
      return fn.call(elems);
    }

    return len ? fn(elems[0], key) : emptyGet;
  };

  // Matches dashed string for camelizing
  var rmsPrefix = /^-ms-/,
    rdashAlpha = /-([a-z])/g;

  // Used by camelCase as callback to replace()
  function fcamelCase(_all, letter) {
    return letter.toUpperCase();
  }

  // Convert dashed to camelCase; used by the css and data modules
  // Support: IE <=9 - 11, Edge 12 - 15
  // Microsoft forgot to hump their vendor prefix (#9572)
  function camelCase(string) {
    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
  }
  var acceptData = function (owner) {
    // Accepts only:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    //  - Object
    //    - Any
    return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
  };

  function Data() {
    this.expando = jQuery.expando + Data.uid++;
  }

  Data.uid = 1;

  Data.prototype = {
    cache: function (owner) {
      // Check if the owner object already has a cache
      var value = owner[this.expando];

      // If not, create one
      if (!value) {
        value = {};

        // We can accept data for non-element nodes in modern browsers,
        // but we should not, see #8335.
        // Always return an empty object.
        if (acceptData(owner)) {
          // If it is a node unlikely to be stringify-ed or looped over
          // use plain assignment
          if (owner.nodeType) {
            owner[this.expando] = value;

            // Otherwise secure it in a non-enumerable property
            // configurable must be true to allow the property to be
            // deleted when data is removed
          } else {
            Object.defineProperty(owner, this.expando, {
              value: value,
              configurable: true,
            });
          }
        }
      }

      return value;
    },
    set: function (owner, data, value) {
      var prop,
        cache = this.cache(owner);

      // Handle: [ owner, key, value ] args
      // Always use camelCase key (gh-2257)
      if (typeof data === "string") {
        cache[camelCase(data)] = value;

        // Handle: [ owner, { properties } ] args
      } else {
        // Copy the properties one-by-one to the cache object
        for (prop in data) {
          cache[camelCase(prop)] = data[prop];
        }
      }
      return cache;
    },
    get: function (owner, key) {
      return key === undefined
        ? this.cache(owner)
        : // Always use camelCase key (gh-2257)
          owner[this.expando] && owner[this.expando][camelCase(key)];
    },
    access: function (owner, key, value) {
      // In cases where either:
      //
      //   1. No key was specified
      //   2. A string key was specified, but no value provided
      //
      // Take the "read" path and allow the get method to determine
      // which value to return, respectively either:
      //
      //   1. The entire cache object
      //   2. The data stored at the key
      //
      if (
        key === undefined ||
        (key && typeof key === "string" && value === undefined)
      ) {
        return this.get(owner, key);
      }

      // When the key is not a string, or both a key and value
      // are specified, set or extend (existing objects) with either:
      //
      //   1. An object of properties
      //   2. A key and value
      //
      this.set(owner, key, value);

      // Since the "set" path can have two possible entry points
      // return the expected data based on which path was taken[*]
      return value !== undefined ? value : key;
    },
    remove: function (owner, key) {
      var i,
        cache = owner[this.expando];

      if (cache === undefined) {
        return;
      }

      if (key !== undefined) {
        // Support array or space separated string of keys
        if (Array.isArray(key)) {
          // If key is an array of keys...
          // We always set camelCase keys, so remove that.
          key = key.map(camelCase);
        } else {
          key = camelCase(key);

          // If a key with the spaces exists, use it.
          // Otherwise, create an array by matching non-whitespace
          key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
        }

        i = key.length;

        while (i--) {
          delete cache[key[i]];
        }
      }

      // Remove the expando if there's no more data
      if (key === undefined || jQuery.isEmptyObject(cache)) {
        // Support: Chrome <=35 - 45
        // Webkit & Blink performance suffers when deleting properties
        // from DOM nodes, so set to undefined instead
        // https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
        if (owner.nodeType) {
          owner[this.expando] = undefined;
        } else {
          delete owner[this.expando];
        }
      }
    },
    hasData: function (owner) {
      var cache = owner[this.expando];
      return cache !== undefined && !jQuery.isEmptyObject(cache);
    },
  };
  var dataPriv = new Data();

  var dataUser = new Data();

  //	Implementation Summary
  //
  //	1. Enforce API surface and semantic compatibility with 1.9.x branch
  //	2. Improve the module's maintainability by reducing the storage
  //		paths to a single mechanism.
  //	3. Use the same single mechanism to support "private" and "user" data.
  //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
  //	5. Avoid exposing implementation details on user objects (eg. expando properties)
  //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

  var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    rmultiDash = /[A-Z]/g;

  function getData(data) {
    if (data === "true") {
      return true;
    }

    if (data === "false") {
      return false;
    }

    if (data === "null") {
      return null;
    }

    // Only convert to a number if it doesn't change the string
    if (data === +data + "") {
      return +data;
    }

    if (rbrace.test(data)) {
      return JSON.parse(data);
    }

    return data;
  }

  function dataAttr(elem, key, data) {
    var name;

    // If nothing was found internally, try to fetch any
    // data from the HTML5 data-* attribute
    if (data === undefined && elem.nodeType === 1) {
      name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
      data = elem.getAttribute(name);

      if (typeof data === "string") {
        try {
          data = getData(data);
        } catch (e) {}

        // Make sure we set the data so it isn't changed later
        dataUser.set(elem, key, data);
      } else {
        data = undefined;
      }
    }
    return data;
  }

  jQuery.extend({
    hasData: function (elem) {
      return dataUser.hasData(elem) || dataPriv.hasData(elem);
    },

    data: function (elem, name, data) {
      return dataUser.access(elem, name, data);
    },

    removeData: function (elem, name) {
      dataUser.remove(elem, name);
    },

    // TODO: Now that all calls to _data and _removeData have been replaced
    // with direct calls to dataPriv methods, these can be deprecated.
    _data: function (elem, name, data) {
      return dataPriv.access(elem, name, data);
    },

    _removeData: function (elem, name) {
      dataPriv.remove(elem, name);
    },
  });

  jQuery.fn.extend({
    data: function (key, value) {
      var i,
        name,
        data,
        elem = this[0],
        attrs = elem && elem.attributes;

      // Gets all values
      if (key === undefined) {
        if (this.length) {
          data = dataUser.get(elem);

          if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
            i = attrs.length;
            while (i--) {
              // Support: IE 11 only
              // The attrs elements can be null (#14894)
              if (attrs[i]) {
                name = attrs[i].name;
                if (name.indexOf("data-") === 0) {
                  name = camelCase(name.slice(5));
                  dataAttr(elem, name, data[name]);
                }
              }
            }
            dataPriv.set(elem, "hasDataAttrs", true);
          }
        }

        return data;
      }

      // Sets multiple values
      if (typeof key === "object") {
        return this.each(function () {
          dataUser.set(this, key);
        });
      }

      return access(
        this,
        function (value) {
          var data;

          // The calling jQuery object (element matches) is not empty
          // (and therefore has an element appears at this[ 0 ]) and the
          // `value` parameter was not undefined. An empty jQuery object
          // will result in `undefined` for elem = this[ 0 ] which will
          // throw an exception if an attempt to read a data cache is made.
          if (elem && value === undefined) {
            // Attempt to get data from the cache
            // The key will always be camelCased in Data
            data = dataUser.get(elem, key);
            if (data !== undefined) {
              return data;
            }

            // Attempt to "discover" the data in
            // HTML5 custom data-* attrs
            data = dataAttr(elem, key);
            if (data !== undefined) {
              return data;
            }

            // We tried really hard, but the data doesn't exist.
            return;
          }

          // Set the data...
          this.each(function () {
            // We always store the camelCased key
            dataUser.set(this, key, value);
          });
        },
        null,
        value,
        arguments.length > 1,
        null,
        true
      );
    },

    removeData: function (key) {
      return this.each(function () {
        dataUser.remove(this, key);
      });
    },
  });

  jQuery.extend({
    queue: function (elem, type, data) {
      var queue;

      if (elem) {
        type = (type || "fx") + "queue";
        queue = dataPriv.get(elem, type);

        // Speed up dequeue by getting out quickly if this is just a lookup
        if (data) {
          if (!queue || Array.isArray(data)) {
            queue = dataPriv.access(elem, type, jQuery.makeArray(data));
          } else {
            queue.push(data);
          }
        }
        return queue || [];
      }
    },

    dequeue: function (elem, type) {
      type = type || "fx";

      var queue = jQuery.queue(elem, type),
        startLength = queue.length,
        fn = queue.shift(),
        hooks = jQuery._queueHooks(elem, type),
        next = function () {
          jQuery.dequeue(elem, type);
        };

      // If the fx queue is dequeued, always remove the progress sentinel
      if (fn === "inprogress") {
        fn = queue.shift();
        startLength--;
      }

      if (fn) {
        // Add a progress sentinel to prevent the fx queue from being
        // automatically dequeued
        if (type === "fx") {
          queue.unshift("inprogress");
        }

        // Clear up the last queue stop function
        delete hooks.stop;
        fn.call(elem, next, hooks);
      }

      if (!startLength && hooks) {
        hooks.empty.fire();
      }
    },

    // Not public - generate a queueHooks object, or return the current one
    _queueHooks: function (elem, type) {
      var key = type + "queueHooks";
      return (
        dataPriv.get(elem, key) ||
        dataPriv.access(elem, key, {
          empty: jQuery.Callbacks("once memory").add(function () {
            dataPriv.remove(elem, [type + "queue", key]);
          }),
        })
      );
    },
  });

  jQuery.fn.extend({
    queue: function (type, data) {
      var setter = 2;

      if (typeof type !== "string") {
        data = type;
        type = "fx";
        setter--;
      }

      if (arguments.length < setter) {
        return jQuery.queue(this[0], type);
      }

      return data === undefined
        ? this
        : this.each(function () {
            var queue = jQuery.queue(this, type, data);

            // Ensure a hooks for this queue
            jQuery._queueHooks(this, type);

            if (type === "fx" && queue[0] !== "inprogress") {
              jQuery.dequeue(this, type);
            }
          });
    },
    dequeue: function (type) {
      return this.each(function () {
        jQuery.dequeue(this, type);
      });
    },
    clearQueue: function (type) {
      return this.queue(type || "fx", []);
    },

    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function (type, obj) {
      var tmp,
        count = 1,
        defer = jQuery.Deferred(),
        elements = this,
        i = this.length,
        resolve = function () {
          if (!--count) {
            defer.resolveWith(elements, [elements]);
          }
        };

      if (typeof type !== "string") {
        obj = type;
        type = undefined;
      }
      type = type || "fx";

      while (i--) {
        tmp = dataPriv.get(elements[i], type + "queueHooks");
        if (tmp && tmp.empty) {
          count++;
          tmp.empty.add(resolve);
        }
      }
      resolve();
      return defer.promise(obj);
    },
  });
  var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

  var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");

  var cssExpand = ["Top", "Right", "Bottom", "Left"];

  var documentElement = document.documentElement;

  var isAttached = function (elem) {
      return jQuery.contains(elem.ownerDocument, elem);
    },
    composed = { composed: true };

  // Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
  // Check attachment across shadow DOM boundaries when possible (gh-3504)
  // Support: iOS 10.0-10.2 only
  // Early iOS 10 versions support `attachShadow` but not `getRootNode`,
  // leading to errors. We need to check for `getRootNode`.
  if (documentElement.getRootNode) {
    isAttached = function (elem) {
      return (
        jQuery.contains(elem.ownerDocument, elem) ||
        elem.getRootNode(composed) === elem.ownerDocument
      );
    };
  }
  var isHiddenWithinTree = function (elem, el) {
    // isHiddenWithinTree might be called from jQuery#filter function;
    // in that case, element will be second argument
    elem = el || elem;

    // Inline style trumps all
    return (
      elem.style.display === "none" ||
      (elem.style.display === "" &&
        // Otherwise, check computed style
        // Support: Firefox <=43 - 45
        // Disconnected elements can have computed display: none, so first confirm that elem is
        // in the document.
        isAttached(elem) &&
        jQuery.css(elem, "display") === "none")
    );
  };

  function adjustCSS(elem, prop, valueParts, tween) {
    var adjusted,
      scale,
      maxIterations = 20,
      currentValue = tween
        ? function () {
            return tween.cur();
          }
        : function () {
            return jQuery.css(elem, prop, "");
          },
      initial = currentValue(),
      unit =
        (valueParts && valueParts[3]) || (jQuery.cssNumber[prop] ? "" : "px"),
      // Starting value computation is required for potential unit mismatches
      initialInUnit =
        elem.nodeType &&
        (jQuery.cssNumber[prop] || (unit !== "px" && +initial)) &&
        rcssNum.exec(jQuery.css(elem, prop));

    if (initialInUnit && initialInUnit[3] !== unit) {
      // Support: Firefox <=54
      // Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
      initial = initial / 2;

      // Trust units reported by jQuery.css
      unit = unit || initialInUnit[3];

      // Iteratively approximate from a nonzero starting point
      initialInUnit = +initial || 1;

      while (maxIterations--) {
        // Evaluate and update our best guess (doubling guesses that zero out).
        // Finish if the scale equals or crosses 1 (making the old*new product non-positive).
        jQuery.style(elem, prop, initialInUnit + unit);
        if (
          (1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <=
          0
        ) {
          maxIterations = 0;
        }
        initialInUnit = initialInUnit / scale;
      }

      initialInUnit = initialInUnit * 2;
      jQuery.style(elem, prop, initialInUnit + unit);

      // Make sure we update the tween properties later on
      valueParts = valueParts || [];
    }

    if (valueParts) {
      initialInUnit = +initialInUnit || +initial || 0;

      // Apply relative offset (+=/-=) if specified
      adjusted = valueParts[1]
        ? initialInUnit + (valueParts[1] + 1) * valueParts[2]
        : +valueParts[2];
      if (tween) {
        tween.unit = unit;
        tween.start = initialInUnit;
        tween.end = adjusted;
      }
    }
    return adjusted;
  }

  var defaultDisplayMap = {};

  function getDefaultDisplay(elem) {
    var temp,
      doc = elem.ownerDocument,
      nodeName = elem.nodeName,
      display = defaultDisplayMap[nodeName];

    if (display) {
      return display;
    }

    temp = doc.body.appendChild(doc.createElement(nodeName));
    display = jQuery.css(temp, "display");

    temp.parentNode.removeChild(temp);

    if (display === "none") {
      display = "block";
    }
    defaultDisplayMap[nodeName] = display;

    return display;
  }

  function showHide(elements, show) {
    var display,
      elem,
      values = [],
      index = 0,
      length = elements.length;

    // Determine new display value for elements that need to change
    for (; index < length; index++) {
      elem = elements[index];
      if (!elem.style) {
        continue;
      }

      display = elem.style.display;
      if (show) {
        // Since we force visibility upon cascade-hidden elements, an immediate (and slow)
        // check is required in this first loop unless we have a nonempty display value (either
        // inline or about-to-be-restored)
        if (display === "none") {
          values[index] = dataPriv.get(elem, "display") || null;
          if (!values[index]) {
            elem.style.display = "";
          }
        }
        if (elem.style.display === "" && isHiddenWithinTree(elem)) {
          values[index] = getDefaultDisplay(elem);
        }
      } else {
        if (display !== "none") {
          values[index] = "none";

          // Remember what we're overwriting
          dataPriv.set(elem, "display", display);
        }
      }
    }

    // Set the display of the elements in a second loop to avoid constant reflow
    for (index = 0; index < length; index++) {
      if (values[index] != null) {
        elements[index].style.display = values[index];
      }
    }

    return elements;
  }

  jQuery.fn.extend({
    show: function () {
      return showHide(this, true);
    },
    hide: function () {
      return showHide(this);
    },
    toggle: function (state) {
      if (typeof state === "boolean") {
        return state ? this.show() : this.hide();
      }

      return this.each(function () {
        if (isHiddenWithinTree(this)) {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
    },
  });
  var rcheckableType = /^(?:checkbox|radio)$/i;

  var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;

  var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;

  (function () {
    var fragment = document.createDocumentFragment(),
      div = fragment.appendChild(document.createElement("div")),
      input = document.createElement("input");

    // Support: Android 4.0 - 4.3 only
    // Check state lost if the name is set (#11217)
    // Support: Windows Web Apps (WWA)
    // `name` and `type` must use .setAttribute for WWA (#14901)
    input.setAttribute("type", "radio");
    input.setAttribute("checked", "checked");
    input.setAttribute("name", "t");

    div.appendChild(input);

    // Support: Android <=4.1 only
    // Older WebKit doesn't clone checked state correctly in fragments
    support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

    // Support: IE <=11 only
    // Make sure textarea (and checkbox) defaultValue is properly cloned
    div.innerHTML = "<textarea>x</textarea>";
    support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;

    // Support: IE <=9 only
    // IE <=9 replaces <option> tags with their contents when inserted outside of
    // the select element.
    div.innerHTML = "<option></option>";
    support.option = !!div.lastChild;
  })();

  // We have to close these tags to support XHTML (#13200)
  var wrapMap = {
    // XHTML parsers do not magically insert elements in the
    // same way that tag soup parsers do. So we cannot shorten
    // this by omitting <tbody> or other required elements.
    thead: [1, "<table>", "</table>"],
    col: [2, "<table><colgroup>", "</colgroup></table>"],
    tr: [2, "<table><tbody>", "</tbody></table>"],
    td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

    _default: [0, "", ""],
  };

  wrapMap.tbody =
    wrapMap.tfoot =
    wrapMap.colgroup =
    wrapMap.caption =
      wrapMap.thead;
  wrapMap.th = wrapMap.td;

  // Support: IE <=9 only
  if (!support.option) {
    wrapMap.optgroup = wrapMap.option = [
      1,
      "<select multiple='multiple'>",
      "</select>",
    ];
  }

  function getAll(context, tag) {
    // Support: IE <=9 - 11 only
    // Use typeof to avoid zero-argument method invocation on host objects (#15151)
    var ret;

    if (typeof context.getElementsByTagName !== "undefined") {
      ret = context.getElementsByTagName(tag || "*");
    } else if (typeof context.querySelectorAll !== "undefined") {
      ret = context.querySelectorAll(tag || "*");
    } else {
      ret = [];
    }

    if (tag === undefined || (tag && nodeName(context, tag))) {
      return jQuery.merge([context], ret);
    }

    return ret;
  }

  // Mark scripts as having already been evaluated
  function setGlobalEval(elems, refElements) {
    var i = 0,
      l = elems.length;

    for (; i < l; i++) {
      dataPriv.set(
        elems[i],
        "globalEval",
        !refElements || dataPriv.get(refElements[i], "globalEval")
      );
    }
  }

  var rhtml = /<|&#?\w+;/;

  function buildFragment(elems, context, scripts, selection, ignored) {
    var elem,
      tmp,
      tag,
      wrap,
      attached,
      j,
      fragment = context.createDocumentFragment(),
      nodes = [],
      i = 0,
      l = elems.length;

    for (; i < l; i++) {
      elem = elems[i];

      if (elem || elem === 0) {
        // Add nodes directly
        if (toType(elem) === "object") {
          // Support: Android <=4.0 only, PhantomJS 1 only
          // push.apply(_, arraylike) throws on ancient WebKit
          jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

          // Convert non-html into a text node
        } else if (!rhtml.test(elem)) {
          nodes.push(context.createTextNode(elem));

          // Convert html into DOM nodes
        } else {
          tmp = tmp || fragment.appendChild(context.createElement("div"));

          // Deserialize a standard representation
          tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
          wrap = wrapMap[tag] || wrapMap._default;
          tmp.innerHTML = wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2];

          // Descend through wrappers to the right content
          j = wrap[0];
          while (j--) {
            tmp = tmp.lastChild;
          }

          // Support: Android <=4.0 only, PhantomJS 1 only
          // push.apply(_, arraylike) throws on ancient WebKit
          jQuery.merge(nodes, tmp.childNodes);

          // Remember the top-level container
          tmp = fragment.firstChild;

          // Ensure the created nodes are orphaned (#12392)
          tmp.textContent = "";
        }
      }
    }

    // Remove wrapper from fragment
    fragment.textContent = "";

    i = 0;
    while ((elem = nodes[i++])) {
      // Skip elements already in the context collection (trac-4087)
      if (selection && jQuery.inArray(elem, selection) > -1) {
        if (ignored) {
          ignored.push(elem);
        }
        continue;
      }

      attached = isAttached(elem);

      // Append to fragment
      tmp = getAll(fragment.appendChild(elem), "script");

      // Preserve script evaluation history
      if (attached) {
        setGlobalEval(tmp);
      }

      // Capture executables
      if (scripts) {
        j = 0;
        while ((elem = tmp[j++])) {
          if (rscriptType.test(elem.type || "")) {
            scripts.push(elem);
          }
        }
      }
    }

    return fragment;
  }

  var rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
    rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

  function returnTrue() {
    return true;
  }

  function returnFalse() {
    return false;
  }

  // Support: IE <=9 - 11+
  // focus() and blur() are asynchronous, except when they are no-op.
  // So expect focus to be synchronous when the element is already active,
  // and blur to be synchronous when the element is not already active.
  // (focus and blur are always synchronous in other supported browsers,
  // this just defines when we can count on it).
  function expectSync(elem, type) {
    return (elem === safeActiveElement()) === (type === "focus");
  }

  // Support: IE <=9 only
  // Accessing document.activeElement can throw unexpectedly
  // https://bugs.jquery.com/ticket/13393
  function safeActiveElement() {
    try {
      return document.activeElement;
    } catch (err) {}
  }

  function on(elem, types, selector, data, fn, one) {
    var origFn, type;

    // Types can be a map of types/handlers
    if (typeof types === "object") {
      // ( types-Object, selector, data )
      if (typeof selector !== "string") {
        // ( types-Object, data )
        data = data || selector;
        selector = undefined;
      }
      for (type in types) {
        on(elem, type, selector, data, types[type], one);
      }
      return elem;
    }

    if (data == null && fn == null) {
      // ( types, fn )
      fn = selector;
      data = selector = undefined;
    } else if (fn == null) {
      if (typeof selector === "string") {
        // ( types, selector, fn )
        fn = data;
        data = undefined;
      } else {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if (fn === false) {
      fn = returnFalse;
    } else if (!fn) {
      return elem;
    }

    if (one === 1) {
      origFn = fn;
      fn = function (event) {
        // Can use an empty set, since event contains the info
        jQuery().off(event);
        return origFn.apply(this, arguments);
      };

      // Use same guid so caller can remove using origFn
      fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
    }
    return elem.each(function () {
      jQuery.event.add(this, types, fn, data, selector);
    });
  }

  /*
   * Helper functions for managing events -- not part of the public interface.
   * Props to Dean Edwards' addEvent library for many of the ideas.
   */
  jQuery.event = {
    global: {},

    add: function (elem, types, handler, data, selector) {
      var handleObjIn,
        eventHandle,
        tmp,
        events,
        t,
        handleObj,
        special,
        handlers,
        type,
        namespaces,
        origType,
        elemData = dataPriv.get(elem);

      // Only attach events to objects that accept data
      if (!acceptData(elem)) {
        return;
      }

      // Caller can pass in an object of custom data in lieu of the handler
      if (handler.handler) {
        handleObjIn = handler;
        handler = handleObjIn.handler;
        selector = handleObjIn.selector;
      }

      // Ensure that invalid selectors throw exceptions at attach time
      // Evaluate against documentElement in case elem is a non-element node (e.g., document)
      if (selector) {
        jQuery.find.matchesSelector(documentElement, selector);
      }

      // Make sure that the handler has a unique ID, used to find/remove it later
      if (!handler.guid) {
        handler.guid = jQuery.guid++;
      }

      // Init the element's event structure and main handler, if this is the first
      if (!(events = elemData.events)) {
        events = elemData.events = Object.create(null);
      }
      if (!(eventHandle = elemData.handle)) {
        eventHandle = elemData.handle = function (e) {
          // Discard the second event of a jQuery.event.trigger() and
          // when an event is called after a page has unloaded
          return typeof jQuery !== "undefined" &&
            jQuery.event.triggered !== e.type
            ? jQuery.event.dispatch.apply(elem, arguments)
            : undefined;
        };
      }

      // Handle multiple events separated by a space
      types = (types || "").match(rnothtmlwhite) || [""];
      t = types.length;
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || [];
        type = origType = tmp[1];
        namespaces = (tmp[2] || "").split(".").sort();

        // There *must* be a type, no attaching namespace-only handlers
        if (!type) {
          continue;
        }

        // If event changes its type, use the special event handlers for the changed type
        special = jQuery.event.special[type] || {};

        // If selector defined, determine special event api type, otherwise given type
        type = (selector ? special.delegateType : special.bindType) || type;

        // Update special based on newly reset type
        special = jQuery.event.special[type] || {};

        // handleObj is passed to all event handlers
        handleObj = jQuery.extend(
          {
            type: type,
            origType: origType,
            data: data,
            handler: handler,
            guid: handler.guid,
            selector: selector,
            needsContext:
              selector && jQuery.expr.match.needsContext.test(selector),
            namespace: namespaces.join("."),
          },
          handleObjIn
        );

        // Init the event handler queue if we're the first
        if (!(handlers = events[type])) {
          handlers = events[type] = [];
          handlers.delegateCount = 0;

          // Only use addEventListener if the special events handler returns false
          if (
            !special.setup ||
            special.setup.call(elem, data, namespaces, eventHandle) === false
          ) {
            if (elem.addEventListener) {
              elem.addEventListener(type, eventHandle);
            }
          }
        }

        if (special.add) {
          special.add.call(elem, handleObj);

          if (!handleObj.handler.guid) {
            handleObj.handler.guid = handler.guid;
          }
        }

        // Add to the element's handler list, delegates in front
        if (selector) {
          handlers.splice(handlers.delegateCount++, 0, handleObj);
        } else {
          handlers.push(handleObj);
        }

        // Keep track of which events have ever been used, for event optimization
        jQuery.event.global[type] = true;
      }
    },

    // Detach an event or set of events from an element
    remove: function (elem, types, handler, selector, mappedTypes) {
      var j,
        origCount,
        tmp,
        events,
        t,
        handleObj,
        special,
        handlers,
        type,
        namespaces,
        origType,
        elemData = dataPriv.hasData(elem) && dataPriv.get(elem);

      if (!elemData || !(events = elemData.events)) {
        return;
      }

      // Once for each type.namespace in types; type may be omitted
      types = (types || "").match(rnothtmlwhite) || [""];
      t = types.length;
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || [];
        type = origType = tmp[1];
        namespaces = (tmp[2] || "").split(".").sort();

        // Unbind all events (on this namespace, if provided) for the element
        if (!type) {
          for (type in events) {
            jQuery.event.remove(elem, type + types[t], handler, selector, true);
          }
          continue;
        }

        special = jQuery.event.special[type] || {};
        type = (selector ? special.delegateType : special.bindType) || type;
        handlers = events[type] || [];
        tmp =
          tmp[2] &&
          new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

        // Remove matching events
        origCount = j = handlers.length;
        while (j--) {
          handleObj = handlers[j];

          if (
            (mappedTypes || origType === handleObj.origType) &&
            (!handler || handler.guid === handleObj.guid) &&
            (!tmp || tmp.test(handleObj.namespace)) &&
            (!selector ||
              selector === handleObj.selector ||
              (selector === "**" && handleObj.selector))
          ) {
            handlers.splice(j, 1);

            if (handleObj.selector) {
              handlers.delegateCount--;
            }
            if (special.remove) {
              special.remove.call(elem, handleObj);
            }
          }
        }

        // Remove generic event handler if we removed something and no more handlers exist
        // (avoids potential for endless recursion during removal of special event handlers)
        if (origCount && !handlers.length) {
          if (
            !special.teardown ||
            special.teardown.call(elem, namespaces, elemData.handle) === false
          ) {
            jQuery.removeEvent(elem, type, elemData.handle);
          }

          delete events[type];
        }
      }

      // Remove data and the expando if it's no longer used
      if (jQuery.isEmptyObject(events)) {
        dataPriv.remove(elem, "handle events");
      }
    },

    dispatch: function (nativeEvent) {
      var i,
        j,
        ret,
        matched,
        handleObj,
        handlerQueue,
        args = new Array(arguments.length),
        // Make a writable jQuery.Event from the native event object
        event = jQuery.event.fix(nativeEvent),
        handlers =
          (dataPriv.get(this, "events") || Object.create(null))[event.type] ||
          [],
        special = jQuery.event.special[event.type] || {};

      // Use the fix-ed jQuery.Event rather than the (read-only) native event
      args[0] = event;

      for (i = 1; i < arguments.length; i++) {
        args[i] = arguments[i];
      }

      event.delegateTarget = this;

      // Call the preDispatch hook for the mapped type, and let it bail if desired
      if (
        special.preDispatch &&
        special.preDispatch.call(this, event) === false
      ) {
        return;
      }

      // Determine handlers
      handlerQueue = jQuery.event.handlers.call(this, event, handlers);

      // Run delegates first; they may want to stop propagation beneath us
      i = 0;
      while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
        event.currentTarget = matched.elem;

        j = 0;
        while (
          (handleObj = matched.handlers[j++]) &&
          !event.isImmediatePropagationStopped()
        ) {
          // If the event is namespaced, then each handler is only invoked if it is
          // specially universal or its namespaces are a superset of the event's.
          if (
            !event.rnamespace ||
            handleObj.namespace === false ||
            event.rnamespace.test(handleObj.namespace)
          ) {
            event.handleObj = handleObj;
            event.data = handleObj.data;

            ret = (
              (jQuery.event.special[handleObj.origType] || {}).handle ||
              handleObj.handler
            ).apply(matched.elem, args);

            if (ret !== undefined) {
              if ((event.result = ret) === false) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          }
        }
      }

      // Call the postDispatch hook for the mapped type
      if (special.postDispatch) {
        special.postDispatch.call(this, event);
      }

      return event.result;
    },

    handlers: function (event, handlers) {
      var i,
        handleObj,
        sel,
        matchedHandlers,
        matchedSelectors,
        handlerQueue = [],
        delegateCount = handlers.delegateCount,
        cur = event.target;

      // Find delegate handlers
      if (
        delegateCount &&
        // Support: IE <=9
        // Black-hole SVG <use> instance trees (trac-13180)
        cur.nodeType &&
        // Support: Firefox <=42
        // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
        // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
        // Support: IE 11 only
        // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
        !(event.type === "click" && event.button >= 1)
      ) {
        for (; cur !== this; cur = cur.parentNode || this) {
          // Don't check non-elements (#13208)
          // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
          if (
            cur.nodeType === 1 &&
            !(event.type === "click" && cur.disabled === true)
          ) {
            matchedHandlers = [];
            matchedSelectors = {};
            for (i = 0; i < delegateCount; i++) {
              handleObj = handlers[i];

              // Don't conflict with Object.prototype properties (#13203)
              sel = handleObj.selector + " ";

              if (matchedSelectors[sel] === undefined) {
                matchedSelectors[sel] = handleObj.needsContext
                  ? jQuery(sel, this).index(cur) > -1
                  : jQuery.find(sel, this, null, [cur]).length;
              }
              if (matchedSelectors[sel]) {
                matchedHandlers.push(handleObj);
              }
            }
            if (matchedHandlers.length) {
              handlerQueue.push({ elem: cur, handlers: matchedHandlers });
            }
          }
        }
      }

      // Add the remaining (directly-bound) handlers
      cur = this;
      if (delegateCount < handlers.length) {
        handlerQueue.push({
          elem: cur,
          handlers: handlers.slice(delegateCount),
        });
      }

      return handlerQueue;
    },

    addProp: function (name, hook) {
      Object.defineProperty(jQuery.Event.prototype, name, {
        enumerable: true,
        configurable: true,

        get: isFunction(hook)
          ? function () {
              if (this.originalEvent) {
                return hook(this.originalEvent);
              }
            }
          : function () {
              if (this.originalEvent) {
                return this.originalEvent[name];
              }
            },

        set: function (value) {
          Object.defineProperty(this, name, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value,
          });
        },
      });
    },

    fix: function (originalEvent) {
      return originalEvent[jQuery.expando]
        ? originalEvent
        : new jQuery.Event(originalEvent);
    },

    special: {
      load: {
        // Prevent triggered image.load events from bubbling to window.load
        noBubble: true,
      },
      click: {
        // Utilize native event to ensure correct state for checkable inputs
        setup: function (data) {
          // For mutual compressibility with _default, replace `this` access with a local var.
          // `|| data` is dead code meant only to preserve the variable through minification.
          var el = this || data;

          // Claim the first handler
          if (
            rcheckableType.test(el.type) &&
            el.click &&
            nodeName(el, "input")
          ) {
            // dataPriv.set( el, "click", ... )
            leverageNative(el, "click", returnTrue);
          }

          // Return false to allow normal processing in the caller
          return false;
        },
        trigger: function (data) {
          // For mutual compressibility with _default, replace `this` access with a local var.
          // `|| data` is dead code meant only to preserve the variable through minification.
          var el = this || data;

          // Force setup before triggering a click
          if (
            rcheckableType.test(el.type) &&
            el.click &&
            nodeName(el, "input")
          ) {
            leverageNative(el, "click");
          }

          // Return non-false to allow normal event-path propagation
          return true;
        },

        // For cross-browser consistency, suppress native .click() on links
        // Also prevent it if we're currently inside a leveraged native-event stack
        _default: function (event) {
          var target = event.target;
          return (
            (rcheckableType.test(target.type) &&
              target.click &&
              nodeName(target, "input") &&
              dataPriv.get(target, "click")) ||
            nodeName(target, "a")
          );
        },
      },

      beforeunload: {
        postDispatch: function (event) {
          // Support: Firefox 20+
          // Firefox doesn't alert if the returnValue field is not set.
          if (event.result !== undefined && event.originalEvent) {
            event.originalEvent.returnValue = event.result;
          }
        },
      },
    },
  };

  // Ensure the presence of an event listener that handles manually-triggered
  // synthetic events by interrupting progress until reinvoked in response to
  // *native* events that it fires directly, ensuring that state changes have
  // already occurred before other listeners are invoked.
  function leverageNative(el, type, expectSync) {
    // Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
    if (!expectSync) {
      if (dataPriv.get(el, type) === undefined) {
        jQuery.event.add(el, type, returnTrue);
      }
      return;
    }

    // Register the controller as a special universal handler for all event namespaces
    dataPriv.set(el, type, false);
    jQuery.event.add(el, type, {
      namespace: false,
      handler: function (event) {
        var notAsync,
          result,
          saved = dataPriv.get(this, type);

        if (event.isTrigger & 1 && this[type]) {
          // Interrupt processing of the outer synthetic .trigger()ed event
          // Saved data should be false in such cases, but might be a leftover capture object
          // from an async native handler (gh-4350)
          if (!saved.length) {
            // Store arguments for use when handling the inner native event
            // There will always be at least one argument (an event object), so this array
            // will not be confused with a leftover capture object.
            saved = slice.call(arguments);
            dataPriv.set(this, type, saved);

            // Trigger the native event and capture its result
            // Support: IE <=9 - 11+
            // focus() and blur() are asynchronous
            notAsync = expectSync(this, type);
            this[type]();
            result = dataPriv.get(this, type);
            if (saved !== result || notAsync) {
              dataPriv.set(this, type, false);
            } else {
              result = {};
            }
            if (saved !== result) {
              // Cancel the outer synthetic event
              event.stopImmediatePropagation();
              event.preventDefault();
              return result.value;
            }

            // If this is an inner synthetic event for an event with a bubbling surrogate
            // (focus or blur), assume that the surrogate already propagated from triggering the
            // native event and prevent that from happening again here.
            // This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
            // bubbling surrogate propagates *after* the non-bubbling base), but that seems
            // less bad than duplication.
          } else if ((jQuery.event.special[type] || {}).delegateType) {
            event.stopPropagation();
          }

          // If this is a native event triggered above, everything is now in order
          // Fire an inner synthetic event with the original arguments
        } else if (saved.length) {
          // ...and capture the result
          dataPriv.set(this, type, {
            value: jQuery.event.trigger(
              // Support: IE <=9 - 11+
              // Extend with the prototype to reset the above stopImmediatePropagation()
              jQuery.extend(saved[0], jQuery.Event.prototype),
              saved.slice(1),
              this
            ),
          });

          // Abort handling of the native event
          event.stopImmediatePropagation();
        }
      },
    });
  }

  jQuery.removeEvent = function (elem, type, handle) {
    // This "if" is needed for plain objects
    if (elem.removeEventListener) {
      elem.removeEventListener(type, handle);
    }
  };

  jQuery.Event = function (src, props) {
    // Allow instantiation without the 'new' keyword
    if (!(this instanceof jQuery.Event)) {
      return new jQuery.Event(src, props);
    }

    // Event object
    if (src && src.type) {
      this.originalEvent = src;
      this.type = src.type;

      // Events bubbling up the document may have been marked as prevented
      // by a handler lower down the tree; reflect the correct value.
      this.isDefaultPrevented =
        src.defaultPrevented ||
        (src.defaultPrevented === undefined &&
          // Support: Android <=2.3 only
          src.returnValue === false)
          ? returnTrue
          : returnFalse;

      // Create target properties
      // Support: Safari <=6 - 7 only
      // Target should not be a text node (#504, #13143)
      this.target =
        src.target && src.target.nodeType === 3
          ? src.target.parentNode
          : src.target;

      this.currentTarget = src.currentTarget;
      this.relatedTarget = src.relatedTarget;

      // Event type
    } else {
      this.type = src;
    }

    // Put explicitly provided properties onto the event object
    if (props) {
      jQuery.extend(this, props);
    }

    // Create a timestamp if incoming event doesn't have one
    this.timeStamp = (src && src.timeStamp) || Date.now();

    // Mark it as fixed
    this[jQuery.expando] = true;
  };

  // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
  // https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
  jQuery.Event.prototype = {
    constructor: jQuery.Event,
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,
    isSimulated: false,

    preventDefault: function () {
      var e = this.originalEvent;

      this.isDefaultPrevented = returnTrue;

      if (e && !this.isSimulated) {
        e.preventDefault();
      }
    },
    stopPropagation: function () {
      var e = this.originalEvent;

      this.isPropagationStopped = returnTrue;

      if (e && !this.isSimulated) {
        e.stopPropagation();
      }
    },
    stopImmediatePropagation: function () {
      var e = this.originalEvent;

      this.isImmediatePropagationStopped = returnTrue;

      if (e && !this.isSimulated) {
        e.stopImmediatePropagation();
      }

      this.stopPropagation();
    },
  };

  // Includes all common event props including KeyEvent and MouseEvent specific props
  jQuery.each(
    {
      altKey: true,
      bubbles: true,
      cancelable: true,
      changedTouches: true,
      ctrlKey: true,
      detail: true,
      eventPhase: true,
      metaKey: true,
      pageX: true,
      pageY: true,
      shiftKey: true,
      view: true,
      char: true,
      code: true,
      charCode: true,
      key: true,
      keyCode: true,
      button: true,
      buttons: true,
      clientX: true,
      clientY: true,
      offsetX: true,
      offsetY: true,
      pointerId: true,
      pointerType: true,
      screenX: true,
      screenY: true,
      targetTouches: true,
      toElement: true,
      touches: true,

      which: function (event) {
        var button = event.button;

        // Add which for key events
        if (event.which == null && rkeyEvent.test(event.type)) {
          return event.charCode != null ? event.charCode : event.keyCode;
        }

        // Add which for click: 1 === left; 2 === middle; 3 === right
        if (
          !event.which &&
          button !== undefined &&
          rmouseEvent.test(event.type)
        ) {
          if (button & 1) {
            return 1;
          }

          if (button & 2) {
            return 3;
          }

          if (button & 4) {
            return 2;
          }

          return 0;
        }

        return event.which;
      },
    },
    jQuery.event.addProp
  );

  jQuery.each(
    { focus: "focusin", blur: "focusout" },
    function (type, delegateType) {
      jQuery.event.special[type] = {
        // Utilize native event if possible so blur/focus sequence is correct
        setup: function () {
          // Claim the first handler
          // dataPriv.set( this, "focus", ... )
          // dataPriv.set( this, "blur", ... )
          leverageNative(this, type, expectSync);

          // Return false to allow normal processing in the caller
          return false;
        },
        trigger: function () {
          // Force setup before trigger
          leverageNative(this, type);

          // Return non-false to allow normal event-path propagation
          return true;
        },

        delegateType: delegateType,
      };
    }
  );

  // Create mouseenter/leave events using mouseover/out and event-time checks
  // so that event delegation works in jQuery.
  // Do the same for pointerenter/pointerleave and pointerover/pointerout
  //
  // Support: Safari 7 only
  // Safari sends mouseenter too often; see:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=470258
  // for the description of the bug (it existed in older Chrome versions as well).
  jQuery.each(
    {
      mouseenter: "mouseover",
      mouseleave: "mouseout",
      pointerenter: "pointerover",
      pointerleave: "pointerout",
    },
    function (orig, fix) {
      jQuery.event.special[orig] = {
        delegateType: fix,
        bindType: fix,

        handle: function (event) {
          var ret,
            target = this,
            related = event.relatedTarget,
            handleObj = event.handleObj;

          // For mouseenter/leave call the handler if related is outside the target.
          // NB: No relatedTarget if the mouse left/entered the browser window
          if (
            !related ||
            (related !== target && !jQuery.contains(target, related))
          ) {
            event.type = handleObj.origType;
            ret = handleObj.handler.apply(this, arguments);
            event.type = fix;
          }
          return ret;
        },
      };
    }
  );

  jQuery.fn.extend({
    on: function (types, selector, data, fn) {
      return on(this, types, selector, data, fn);
    },
    one: function (types, selector, data, fn) {
      return on(this, types, selector, data, fn, 1);
    },
    off: function (types, selector, fn) {
      var handleObj, type;
      if (types && types.preventDefault && types.handleObj) {
        // ( event )  dispatched jQuery.Event
        handleObj = types.handleObj;
        jQuery(types.delegateTarget).off(
          handleObj.namespace
            ? handleObj.origType + "." + handleObj.namespace
            : handleObj.origType,
          handleObj.selector,
          handleObj.handler
        );
        return this;
      }
      if (typeof types === "object") {
        // ( types-object [, selector] )
        for (type in types) {
          this.off(type, selector, types[type]);
        }
        return this;
      }
      if (selector === false || typeof selector === "function") {
        // ( types [, fn] )
        fn = selector;
        selector = undefined;
      }
      if (fn === false) {
        fn = returnFalse;
      }
      return this.each(function () {
        jQuery.event.remove(this, types, fn, selector);
      });
    },
  });

  var // Support: IE <=10 - 11, Edge 12 - 13 only
    // In IE/Edge using regex groups here causes severe slowdowns.
    // See https://connect.microsoft.com/IE/feedback/details/1736512/
    rnoInnerhtml = /<script|<style|<link/i,
    // checked="checked" or checked
    rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

  // Prefer a tbody over its parent table for containing new rows
  function manipulationTarget(elem, content) {
    if (
      nodeName(elem, "table") &&
      nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")
    ) {
      return jQuery(elem).children("tbody")[0] || elem;
    }

    return elem;
  }

  // Replace/restore the type attribute of script elements for safe DOM manipulation
  function disableScript(elem) {
    elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
    return elem;
  }
  function restoreScript(elem) {
    if ((elem.type || "").slice(0, 5) === "true/") {
      elem.type = elem.type.slice(5);
    } else {
      elem.removeAttribute("type");
    }

    return elem;
  }

  function cloneCopyEvent(src, dest) {
    var i, l, type, pdataOld, udataOld, udataCur, events;

    if (dest.nodeType !== 1) {
      return;
    }

    // 1. Copy private data: events, handlers, etc.
    if (dataPriv.hasData(src)) {
      pdataOld = dataPriv.get(src);
      events = pdataOld.events;

      if (events) {
        dataPriv.remove(dest, "handle events");

        for (type in events) {
          for (i = 0, l = events[type].length; i < l; i++) {
            jQuery.event.add(dest, type, events[type][i]);
          }
        }
      }
    }

    // 2. Copy user data
    if (dataUser.hasData(src)) {
      udataOld = dataUser.access(src);
      udataCur = jQuery.extend({}, udataOld);

      dataUser.set(dest, udataCur);
    }
  }

  // Fix IE bugs, see support tests
  function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();

    // Fails to persist the checked state of a cloned checkbox or radio button.
    if (nodeName === "input" && rcheckableType.test(src.type)) {
      dest.checked = src.checked;

      // Fails to return the selected option to the default selected state when cloning options
    } else if (nodeName === "input" || nodeName === "textarea") {
      dest.defaultValue = src.defaultValue;
    }
  }

  function domManip(collection, args, callback, ignored) {
    // Flatten any nested arrays
    args = flat(args);

    var fragment,
      first,
      scripts,
      hasScripts,
      node,
      doc,
      i = 0,
      l = collection.length,
      iNoClone = l - 1,
      value = args[0],
      valueIsFunction = isFunction(value);

    // We can't cloneNode fragments that contain checked, in WebKit
    if (
      valueIsFunction ||
      (l > 1 &&
        typeof value === "string" &&
        !support.checkClone &&
        rchecked.test(value))
    ) {
      return collection.each(function (index) {
        var self = collection.eq(index);
        if (valueIsFunction) {
          args[0] = value.call(this, index, self.html());
        }
        domManip(self, args, callback, ignored);
      });
    }

    if (l) {
      fragment = buildFragment(
        args,
        collection[0].ownerDocument,
        false,
        collection,
        ignored
      );
      first = fragment.firstChild;

      if (fragment.childNodes.length === 1) {
        fragment = first;
      }

      // Require either new content or an interest in ignored elements to invoke the callback
      if (first || ignored) {
        scripts = jQuery.map(getAll(fragment, "script"), disableScript);
        hasScripts = scripts.length;

        // Use the original fragment for the last item
        // instead of the first because it can end up
        // being emptied incorrectly in certain situations (#8070).
        for (; i < l; i++) {
          node = fragment;

          if (i !== iNoClone) {
            node = jQuery.clone(node, true, true);

            // Keep references to cloned scripts for later restoration
            if (hasScripts) {
              // Support: Android <=4.0 only, PhantomJS 1 only
              // push.apply(_, arraylike) throws on ancient WebKit
              jQuery.merge(scripts, getAll(node, "script"));
            }
          }

          callback.call(collection[i], node, i);
        }

        if (hasScripts) {
          doc = scripts[scripts.length - 1].ownerDocument;

          // Reenable scripts
          jQuery.map(scripts, restoreScript);

          // Evaluate executable scripts on first document insertion
          for (i = 0; i < hasScripts; i++) {
            node = scripts[i];
            if (
              rscriptType.test(node.type || "") &&
              !dataPriv.access(node, "globalEval") &&
              jQuery.contains(doc, node)
            ) {
              if (node.src && (node.type || "").toLowerCase() !== "module") {
                // Optional AJAX dependency, but won't run scripts if not present
                if (jQuery._evalUrl && !node.noModule) {
                  jQuery._evalUrl(
                    node.src,
                    {
                      nonce: node.nonce || node.getAttribute("nonce"),
                    },
                    doc
                  );
                }
              } else {
                DOMEval(node.textContent.replace(rcleanScript, ""), node, doc);
              }
            }
          }
        }
      }
    }

    return collection;
  }

  function remove(elem, selector, keepData) {
    var node,
      nodes = selector ? jQuery.filter(selector, elem) : elem,
      i = 0;

    for (; (node = nodes[i]) != null; i++) {
      if (!keepData && node.nodeType === 1) {
        jQuery.cleanData(getAll(node));
      }

      if (node.parentNode) {
        if (keepData && isAttached(node)) {
          setGlobalEval(getAll(node, "script"));
        }
        node.parentNode.removeChild(node);
      }
    }

    return elem;
  }

  jQuery.extend({
    htmlPrefilter: function (html) {
      return html;
    },

    clone: function (elem, dataAndEvents, deepDataAndEvents) {
      var i,
        l,
        srcElements,
        destElements,
        clone = elem.cloneNode(true),
        inPage = isAttached(elem);

      // Fix IE cloning issues
      if (
        !support.noCloneChecked &&
        (elem.nodeType === 1 || elem.nodeType === 11) &&
        !jQuery.isXMLDoc(elem)
      ) {
        // We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
        destElements = getAll(clone);
        srcElements = getAll(elem);

        for (i = 0, l = srcElements.length; i < l; i++) {
          fixInput(srcElements[i], destElements[i]);
        }
      }

      // Copy the events from the original to the clone
      if (dataAndEvents) {
        if (deepDataAndEvents) {
          srcElements = srcElements || getAll(elem);
          destElements = destElements || getAll(clone);

          for (i = 0, l = srcElements.length; i < l; i++) {
            cloneCopyEvent(srcElements[i], destElements[i]);
          }
        } else {
          cloneCopyEvent(elem, clone);
        }
      }

      // Preserve script evaluation history
      destElements = getAll(clone, "script");
      if (destElements.length > 0) {
        setGlobalEval(destElements, !inPage && getAll(elem, "script"));
      }

      // Return the cloned set
      return clone;
    },

    cleanData: function (elems) {
      var data,
        elem,
        type,
        special = jQuery.event.special,
        i = 0;

      for (; (elem = elems[i]) !== undefined; i++) {
        if (acceptData(elem)) {
          if ((data = elem[dataPriv.expando])) {
            if (data.events) {
              for (type in data.events) {
                if (special[type]) {
                  jQuery.event.remove(elem, type);

                  // This is a shortcut to avoid jQuery.event.remove's overhead
                } else {
                  jQuery.removeEvent(elem, type, data.handle);
                }
              }
            }

            // Support: Chrome <=35 - 45+
            // Assign undefined instead of using delete, see Data#remove
            elem[dataPriv.expando] = undefined;
          }
          if (elem[dataUser.expando]) {
            // Support: Chrome <=35 - 45+
            // Assign undefined instead of using delete, see Data#remove
            elem[dataUser.expando] = undefined;
          }
        }
      }
    },
  });

  jQuery.fn.extend({
    detach: function (selector) {
      return remove(this, selector, true);
    },

    remove: function (selector) {
      return remove(this, selector);
    },

    text: function (value) {
      return access(
        this,
        function (value) {
          return value === undefined
            ? jQuery.text(this)
            : this.empty().each(function () {
                if (
                  this.nodeType === 1 ||
                  this.nodeType === 11 ||
                  this.nodeType === 9
                ) {
                  this.textContent = value;
                }
              });
        },
        null,
        value,
        arguments.length
      );
    },

    append: function () {
      return domManip(this, arguments, function (elem) {
        if (
          this.nodeType === 1 ||
          this.nodeType === 11 ||
          this.nodeType === 9
        ) {
          var target = manipulationTarget(this, elem);
          target.appendChild(elem);
        }
      });
    },

    prepend: function () {
      return domManip(this, arguments, function (elem) {
        if (
          this.nodeType === 1 ||
          this.nodeType === 11 ||
          this.nodeType === 9
        ) {
          var target = manipulationTarget(this, elem);
          target.insertBefore(elem, target.firstChild);
        }
      });
    },

    before: function () {
      return domManip(this, arguments, function (elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this);
        }
      });
    },

    after: function () {
      return domManip(this, arguments, function (elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this.nextSibling);
        }
      });
    },

    empty: function () {
      var elem,
        i = 0;

      for (; (elem = this[i]) != null; i++) {
        if (elem.nodeType === 1) {
          // Prevent memory leaks
          jQuery.cleanData(getAll(elem, false));

          // Remove any remaining nodes
          elem.textContent = "";
        }
      }

      return this;
    },

    clone: function (dataAndEvents, deepDataAndEvents) {
      dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
      deepDataAndEvents =
        deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

      return this.map(function () {
        return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
      });
    },

    html: function (value) {
      return access(
        this,
        function (value) {
          var elem = this[0] || {},
            i = 0,
            l = this.length;

          if (value === undefined && elem.nodeType === 1) {
            return elem.innerHTML;
          }

          // See if we can take a shortcut and just use innerHTML
          if (
            typeof value === "string" &&
            !rnoInnerhtml.test(value) &&
            !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]
          ) {
            value = jQuery.htmlPrefilter(value);

            try {
              for (; i < l; i++) {
                elem = this[i] || {};

                // Remove element nodes and prevent memory leaks
                if (elem.nodeType === 1) {
                  jQuery.cleanData(getAll(elem, false));
                  elem.innerHTML = value;
                }
              }

              elem = 0;

              // If using innerHTML throws an exception, use the fallback method
            } catch (e) {}
          }

          if (elem) {
            this.empty().append(value);
          }
        },
        null,
        value,
        arguments.length
      );
    },

    replaceWith: function () {
      var ignored = [];

      // Make the changes, replacing each non-ignored context element with the new content
      return domManip(
        this,
        arguments,
        function (elem) {
          var parent = this.parentNode;

          if (jQuery.inArray(this, ignored) < 0) {
            jQuery.cleanData(getAll(this));
            if (parent) {
              parent.replaceChild(elem, this);
            }
          }

          // Force callback invocation
        },
        ignored
      );
    },
  });

  jQuery.each(
    {
      appendTo: "append",
      prependTo: "prepend",
      insertBefore: "before",
      insertAfter: "after",
      replaceAll: "replaceWith",
    },
    function (name, original) {
      jQuery.fn[name] = function (selector) {
        var elems,
          ret = [],
          insert = jQuery(selector),
          last = insert.length - 1,
          i = 0;

        for (; i <= last; i++) {
          elems = i === last ? this : this.clone(true);
          jQuery(insert[i])[original](elems);

          // Support: Android <=4.0 only, PhantomJS 1 only
          // .get() because push.apply(_, arraylike) throws on ancient WebKit
          push.apply(ret, elems.get());
        }

        return this.pushStack(ret);
      };
    }
  );
  var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

  var getStyles = function (elem) {
    // Support: IE <=11 only, Firefox <=30 (#15098, #14150)
    // IE throws on elements created in popups
    // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
    var view = elem.ownerDocument.defaultView;

    if (!view || !view.opener) {
      view = window;
    }

    return view.getComputedStyle(elem);
  };

  var swap = function (elem, options, callback) {
    var ret,
      name,
      old = {};

    // Remember the old values, and insert the new ones
    for (name in options) {
      old[name] = elem.style[name];
      elem.style[name] = options[name];
    }

    ret = callback.call(elem);

    // Revert the old values
    for (name in options) {
      elem.style[name] = old[name];
    }

    return ret;
  };

  var rboxStyle = new RegExp(cssExpand.join("|"), "i");

  (function () {
    // Executing both pixelPosition & boxSizingReliable tests require only one layout
    // so they're executed at the same time to save the second computation.
    function computeStyleTests() {
      // This is a singleton, we need to execute it only once
      if (!div) {
        return;
      }

      container.style.cssText =
        "position:absolute;left:-11111px;width:60px;" +
        "margin-top:1px;padding:0;border:0";
      div.style.cssText =
        "position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
        "margin:auto;border:1px;padding:1px;" +
        "width:60%;top:1%";
      documentElement.appendChild(container).appendChild(div);

      var divStyle = window.getComputedStyle(div);
      pixelPositionVal = divStyle.top !== "1%";

      // Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
      reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;

      // Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
      // Some styles come back with percentage values, even though they shouldn't
      div.style.right = "60%";
      pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;

      // Support: IE 9 - 11 only
      // Detect misreporting of content dimensions for box-sizing:border-box elements
      boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;

      // Support: IE 9 only
      // Detect overflow:scroll screwiness (gh-3699)
      // Support: Chrome <=64
      // Don't get tricked when zoom affects offsetWidth (gh-4029)
      div.style.position = "absolute";
      scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12;

      documentElement.removeChild(container);

      // Nullify the div so it wouldn't be stored in the memory and
      // it will also be a sign that checks already performed
      div = null;
    }

    function roundPixelMeasures(measure) {
      return Math.round(parseFloat(measure));
    }

    var pixelPositionVal,
      boxSizingReliableVal,
      scrollboxSizeVal,
      pixelBoxStylesVal,
      reliableTrDimensionsVal,
      reliableMarginLeftVal,
      container = document.createElement("div"),
      div = document.createElement("div");

    // Finish early in limited (non-browser) environments
    if (!div.style) {
      return;
    }

    // Support: IE <=9 - 11 only
    // Style of cloned element affects source element cloned (#8908)
    div.style.backgroundClip = "content-box";
    div.cloneNode(true).style.backgroundClip = "";
    support.clearCloneStyle = div.style.backgroundClip === "content-box";

    jQuery.extend(support, {
      boxSizingReliable: function () {
        computeStyleTests();
        return boxSizingReliableVal;
      },
      pixelBoxStyles: function () {
        computeStyleTests();
        return pixelBoxStylesVal;
      },
      pixelPosition: function () {
        computeStyleTests();
        return pixelPositionVal;
      },
      reliableMarginLeft: function () {
        computeStyleTests();
        return reliableMarginLeftVal;
      },
      scrollboxSize: function () {
        computeStyleTests();
        return scrollboxSizeVal;
      },

      // Support: IE 9 - 11+, Edge 15 - 18+
      // IE/Edge misreport `getComputedStyle` of table rows with width/height
      // set in CSS while `offset*` properties report correct values.
      // Behavior in IE 9 is more subtle than in newer versions & it passes
      // some versions of this test; make sure not to make it pass there!
      reliableTrDimensions: function () {
        var table, tr, trChild, trStyle;
        if (reliableTrDimensionsVal == null) {
          table = document.createElement("table");
          tr = document.createElement("tr");
          trChild = document.createElement("div");

          table.style.cssText = "position:absolute;left:-11111px";
          tr.style.height = "1px";
          trChild.style.height = "9px";

          documentElement
            .appendChild(table)
            .appendChild(tr)
            .appendChild(trChild);

          trStyle = window.getComputedStyle(tr);
          reliableTrDimensionsVal = parseInt(trStyle.height) > 3;

          documentElement.removeChild(table);
        }
        return reliableTrDimensionsVal;
      },
    });
  })();

  function curCSS(elem, name, computed) {
    var width,
      minWidth,
      maxWidth,
      ret,
      // Support: Firefox 51+
      // Retrieving style before computed somehow
      // fixes an issue with getting wrong values
      // on detached elements
      style = elem.style;

    computed = computed || getStyles(elem);

    // getPropertyValue is needed for:
    //   .css('filter') (IE 9 only, #12537)
    //   .css('--customProperty) (#3144)
    if (computed) {
      ret = computed.getPropertyValue(name) || computed[name];

      if (ret === "" && !isAttached(elem)) {
        ret = jQuery.style(elem, name);
      }

      // A tribute to the "awesome hack by Dean Edwards"
      // Android Browser returns percentage for some values,
      // but width seems to be reliably pixels.
      // This is against the CSSOM draft spec:
      // https://drafts.csswg.org/cssom/#resolved-values
      if (
        !support.pixelBoxStyles() &&
        rnumnonpx.test(ret) &&
        rboxStyle.test(name)
      ) {
        // Remember the original values
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;

        // Put in the new values to get a computed value out
        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;

        // Revert the changed values
        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }

    return ret !== undefined
      ? // Support: IE <=9 - 11 only
        // IE returns zIndex value as an integer.
        ret + ""
      : ret;
  }

  function addGetHookIf(conditionFn, hookFn) {
    // Define the hook, we'll check on the first run if it's really needed.
    return {
      get: function () {
        if (conditionFn()) {
          // Hook not needed (or it's not possible to use it due
          // to missing dependency), remove it.
          delete this.get;
          return;
        }

        // Hook needed; redefine it so that the support test is not executed again.
        return (this.get = hookFn).apply(this, arguments);
      },
    };
  }

  var cssPrefixes = ["Webkit", "Moz", "ms"],
    emptyStyle = document.createElement("div").style,
    vendorProps = {};

  // Return a vendor-prefixed property or undefined
  function vendorPropName(name) {
    // Check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
      i = cssPrefixes.length;

    while (i--) {
      name = cssPrefixes[i] + capName;
      if (name in emptyStyle) {
        return name;
      }
    }
  }

  // Return a potentially-mapped jQuery.cssProps or vendor prefixed property
  function finalPropName(name) {
    var final = jQuery.cssProps[name] || vendorProps[name];

    if (final) {
      return final;
    }
    if (name in emptyStyle) {
      return name;
    }
    return (vendorProps[name] = vendorPropName(name) || name);
  }

  var // Swappable if display is none or starts with table
    // except "table", "table-cell", or "table-caption"
    // See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(none|table(?!-c[ea]).+)/,
    rcustomProp = /^--/,
    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
    cssNormalTransform = {
      letterSpacing: "0",
      fontWeight: "400",
    };

  function setPositiveNumber(_elem, value, subtract) {
    // Any relative (+/-) values have already been
    // normalized at this point
    var matches = rcssNum.exec(value);
    return matches
      ? // Guard against undefined "subtract", e.g., when used as in cssHooks
        Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px")
      : value;
  }

  function boxModelAdjustment(
    elem,
    dimension,
    box,
    isBorderBox,
    styles,
    computedVal
  ) {
    var i = dimension === "width" ? 1 : 0,
      extra = 0,
      delta = 0;

    // Adjustment may not be necessary
    if (box === (isBorderBox ? "border" : "content")) {
      return 0;
    }

    for (; i < 4; i += 2) {
      // Both box models exclude margin
      if (box === "margin") {
        delta += jQuery.css(elem, box + cssExpand[i], true, styles);
      }

      // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
      if (!isBorderBox) {
        // Add padding
        delta += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

        // For "border" or "margin", add border
        if (box !== "padding") {
          delta += jQuery.css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          );

          // But still keep track of it otherwise
        } else {
          extra += jQuery.css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          );
        }

        // If we get here with a border-box (content + padding + border), we're seeking "content" or
        // "padding" or "margin"
      } else {
        // For "content", subtract padding
        if (box === "content") {
          delta -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
        }

        // For "content" or "padding", subtract border
        if (box !== "margin") {
          delta -= jQuery.css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          );
        }
      }
    }

    // Account for positive content-box scroll gutter when requested by providing computedVal
    if (!isBorderBox && computedVal >= 0) {
      // offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
      // Assuming integer scroll gutter, subtract the rest and round down
      delta +=
        Math.max(
          0,
          Math.ceil(
            elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
              computedVal -
              delta -
              extra -
              0.5

            // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
            // Use an explicit zero to avoid NaN (gh-3964)
          )
        ) || 0;
    }

    return delta;
  }

  function getWidthOrHeight(elem, dimension, extra) {
    // Start with computed style
    var styles = getStyles(elem),
      // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
      // Fake content-box until we know it's needed to know the true value.
      boxSizingNeeded = !support.boxSizingReliable() || extra,
      isBorderBox =
        boxSizingNeeded &&
        jQuery.css(elem, "boxSizing", false, styles) === "border-box",
      valueIsBorderBox = isBorderBox,
      val = curCSS(elem, dimension, styles),
      offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);

    // Support: Firefox <=54
    // Return a confounding non-pixel value or feign ignorance, as appropriate.
    if (rnumnonpx.test(val)) {
      if (!extra) {
        return val;
      }
      val = "auto";
    }

    // Support: IE 9 - 11 only
    // Use offsetWidth/offsetHeight for when box sizing is unreliable.
    // In those cases, the computed value can be trusted to be border-box.
    if (
      ((!support.boxSizingReliable() && isBorderBox) ||
        // Support: IE 10 - 11+, Edge 15 - 18+
        // IE/Edge misreport `getComputedStyle` of table rows with width/height
        // set in CSS while `offset*` properties report correct values.
        // Interestingly, in some cases IE 9 doesn't suffer from this issue.
        (!support.reliableTrDimensions() && nodeName(elem, "tr")) ||
        // Fall back to offsetWidth/offsetHeight when value is "auto"
        // This happens for inline elements with no explicit setting (gh-3571)
        val === "auto" ||
        // Support: Android <=4.1 - 4.3 only
        // Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
        (!parseFloat(val) &&
          jQuery.css(elem, "display", false, styles) === "inline")) &&
      // Make sure the element is visible & connected
      elem.getClientRects().length
    ) {
      isBorderBox =
        jQuery.css(elem, "boxSizing", false, styles) === "border-box";

      // Where available, offsetWidth/offsetHeight approximate border box dimensions.
      // Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
      // retrieved value as a content box dimension.
      valueIsBorderBox = offsetProp in elem;
      if (valueIsBorderBox) {
        val = elem[offsetProp];
      }
    }

    // Normalize "" and auto
    val = parseFloat(val) || 0;

    // Adjust for the element's box model
    return (
      val +
      boxModelAdjustment(
        elem,
        dimension,
        extra || (isBorderBox ? "border" : "content"),
        valueIsBorderBox,
        styles,

        // Provide the current computed size to request scroll gutter calculation (gh-3589)
        val
      ) +
      "px"
    );
  }

  jQuery.extend({
    // Add in style property hooks for overriding the default
    // behavior of getting and setting a style property
    cssHooks: {
      opacity: {
        get: function (elem, computed) {
          if (computed) {
            // We should always get a number back from opacity
            var ret = curCSS(elem, "opacity");
            return ret === "" ? "1" : ret;
          }
        },
      },
    },

    // Don't automatically add "px" to these possibly-unitless properties
    cssNumber: {
      animationIterationCount: true,
      columnCount: true,
      fillOpacity: true,
      flexGrow: true,
      flexShrink: true,
      fontWeight: true,
      gridArea: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnStart: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowStart: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      widows: true,
      zIndex: true,
      zoom: true,
    },

    // Add in properties whose names you wish to fix before
    // setting or getting the value
    cssProps: {},

    // Get and set the style property on a DOM Node
    style: function (elem, name, value, extra) {
      // Don't set styles on text and comment nodes
      if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return;
      }

      // Make sure that we're working with the right name
      var ret,
        type,
        hooks,
        origName = camelCase(name),
        isCustomProp = rcustomProp.test(name),
        style = elem.style;

      // Make sure that we're working with the right name. We don't
      // want to query the value if it is a CSS custom property
      // since they are user-defined.
      if (!isCustomProp) {
        name = finalPropName(origName);
      }

      // Gets hook for the prefixed version, then unprefixed version
      hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

      // Check if we're setting a value
      if (value !== undefined) {
        type = typeof value;

        // Convert "+=" or "-=" to relative numbers (#7345)
        if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
          value = adjustCSS(elem, name, ret);

          // Fixes bug #9237
          type = "number";
        }

        // Make sure that null and NaN values aren't set (#7116)
        if (value == null || value !== value) {
          return;
        }

        // If a number was passed in, add the unit (except for certain CSS properties)
        // The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
        // "px" to a few hardcoded values.
        if (type === "number" && !isCustomProp) {
          value += (ret && ret[3]) || (jQuery.cssNumber[origName] ? "" : "px");
        }

        // background-* props affect original clone's values
        if (
          !support.clearCloneStyle &&
          value === "" &&
          name.indexOf("background") === 0
        ) {
          style[name] = "inherit";
        }

        // If a hook was provided, use that value, otherwise just set the specified value
        if (
          !hooks ||
          !("set" in hooks) ||
          (value = hooks.set(elem, value, extra)) !== undefined
        ) {
          if (isCustomProp) {
            style.setProperty(name, value);
          } else {
            style[name] = value;
          }
        }
      } else {
        // If a hook was provided get the non-computed value from there
        if (
          hooks &&
          "get" in hooks &&
          (ret = hooks.get(elem, false, extra)) !== undefined
        ) {
          return ret;
        }

        // Otherwise just get the value from the style object
        return style[name];
      }
    },

    css: function (elem, name, extra, styles) {
      var val,
        num,
        hooks,
        origName = camelCase(name),
        isCustomProp = rcustomProp.test(name);

      // Make sure that we're working with the right name. We don't
      // want to modify the value if it is a CSS custom property
      // since they are user-defined.
      if (!isCustomProp) {
        name = finalPropName(origName);
      }

      // Try prefixed name followed by the unprefixed name
      hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

      // If a hook was provided get the computed value from there
      if (hooks && "get" in hooks) {
        val = hooks.get(elem, true, extra);
      }

      // Otherwise, if a way to get the computed value exists, use that
      if (val === undefined) {
        val = curCSS(elem, name, styles);
      }

      // Convert "normal" to computed value
      if (val === "normal" && name in cssNormalTransform) {
        val = cssNormalTransform[name];
      }

      // Make numeric if forced or a qualifier was provided and val looks numeric
      if (extra === "" || extra) {
        num = parseFloat(val);
        return extra === true || isFinite(num) ? num || 0 : val;
      }

      return val;
    },
  });

  jQuery.each(["height", "width"], function (_i, dimension) {
    jQuery.cssHooks[dimension] = {
      get: function (elem, computed, extra) {
        if (computed) {
          // Certain elements can have dimension info if we invisibly show them
          // but it must have a current display style that would benefit
          return rdisplayswap.test(jQuery.css(elem, "display")) &&
            // Support: Safari 8+
            // Table columns in Safari have non-zero offsetWidth & zero
            // getBoundingClientRect().width unless display is changed.
            // Support: IE <=11 only
            // Running getBoundingClientRect on a disconnected node
            // in IE throws an error.
            (!elem.getClientRects().length ||
              !elem.getBoundingClientRect().width)
            ? swap(elem, cssShow, function () {
                return getWidthOrHeight(elem, dimension, extra);
              })
            : getWidthOrHeight(elem, dimension, extra);
        }
      },

      set: function (elem, value, extra) {
        var matches,
          styles = getStyles(elem),
          // Only read styles.position if the test has a chance to fail
          // to avoid forcing a reflow.
          scrollboxSizeBuggy =
            !support.scrollboxSize() && styles.position === "absolute",
          // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
          boxSizingNeeded = scrollboxSizeBuggy || extra,
          isBorderBox =
            boxSizingNeeded &&
            jQuery.css(elem, "boxSizing", false, styles) === "border-box",
          subtract = extra
            ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles)
            : 0;

        // Account for unreliable border-box dimensions by comparing offset* to computed and
        // faking a content-box to get border and padding (gh-3699)
        if (isBorderBox && scrollboxSizeBuggy) {
          subtract -= Math.ceil(
            elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
              parseFloat(styles[dimension]) -
              boxModelAdjustment(elem, dimension, "border", false, styles) -
              0.5
          );
        }

        // Convert to pixels if value adjustment is needed
        if (
          subtract &&
          (matches = rcssNum.exec(value)) &&
          (matches[3] || "px") !== "px"
        ) {
          elem.style[dimension] = value;
          value = jQuery.css(elem, dimension);
        }

        return setPositiveNumber(elem, value, subtract);
      },
    };
  });

  jQuery.cssHooks.marginLeft = addGetHookIf(
    support.reliableMarginLeft,
    function (elem, computed) {
      if (computed) {
        return (
          (parseFloat(curCSS(elem, "marginLeft")) ||
            elem.getBoundingClientRect().left -
              swap(elem, { marginLeft: 0 }, function () {
                return elem.getBoundingClientRect().left;
              })) + "px"
        );
      }
    }
  );

  // These hooks are used by animate to expand properties
  jQuery.each(
    {
      margin: "",
      padding: "",
      border: "Width",
    },
    function (prefix, suffix) {
      jQuery.cssHooks[prefix + suffix] = {
        expand: function (value) {
          var i = 0,
            expanded = {},
            // Assumes a single number if not a string
            parts = typeof value === "string" ? value.split(" ") : [value];

          for (; i < 4; i++) {
            expanded[prefix + cssExpand[i] + suffix] =
              parts[i] || parts[i - 2] || parts[0];
          }

          return expanded;
        },
      };

      if (prefix !== "margin") {
        jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
      }
    }
  );

  jQuery.fn.extend({
    css: function (name, value) {
      return access(
        this,
        function (elem, name, value) {
          var styles,
            len,
            map = {},
            i = 0;

          if (Array.isArray(name)) {
            styles = getStyles(elem);
            len = name.length;

            for (; i < len; i++) {
              map[name[i]] = jQuery.css(elem, name[i], false, styles);
            }

            return map;
          }

          return value !== undefined
            ? jQuery.style(elem, name, value)
            : jQuery.css(elem, name);
        },
        name,
        value,
        arguments.length > 1
      );
    },
  });

  function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
  }
  jQuery.Tween = Tween;

  Tween.prototype = {
    constructor: Tween,
    init: function (elem, options, prop, end, easing, unit) {
      this.elem = elem;
      this.prop = prop;
      this.easing = easing || jQuery.easing._default;
      this.options = options;
      this.start = this.now = this.cur();
      this.end = end;
      this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
    },
    cur: function () {
      var hooks = Tween.propHooks[this.prop];

      return hooks && hooks.get
        ? hooks.get(this)
        : Tween.propHooks._default.get(this);
    },
    run: function (percent) {
      var eased,
        hooks = Tween.propHooks[this.prop];

      if (this.options.duration) {
        this.pos = eased = jQuery.easing[this.easing](
          percent,
          this.options.duration * percent,
          0,
          1,
          this.options.duration
        );
      } else {
        this.pos = eased = percent;
      }
      this.now = (this.end - this.start) * eased + this.start;

      if (this.options.step) {
        this.options.step.call(this.elem, this.now, this);
      }

      if (hooks && hooks.set) {
        hooks.set(this);
      } else {
        Tween.propHooks._default.set(this);
      }
      return this;
    },
  };

  Tween.prototype.init.prototype = Tween.prototype;

  Tween.propHooks = {
    _default: {
      get: function (tween) {
        var result;

        // Use a property on the element directly when it is not a DOM element,
        // or when there is no matching style property that exists.
        if (
          tween.elem.nodeType !== 1 ||
          (tween.elem[tween.prop] != null &&
            tween.elem.style[tween.prop] == null)
        ) {
          return tween.elem[tween.prop];
        }

        // Passing an empty string as a 3rd parameter to .css will automatically
        // attempt a parseFloat and fallback to a string if the parse fails.
        // Simple values such as "10px" are parsed to Float;
        // complex values such as "rotate(1rad)" are returned as-is.
        result = jQuery.css(tween.elem, tween.prop, "");

        // Empty strings, null, undefined and "auto" are converted to 0.
        return !result || result === "auto" ? 0 : result;
      },
      set: function (tween) {
        // Use step hook for back compat.
        // Use cssHook if its there.
        // Use .style if available and use plain properties where available.
        if (jQuery.fx.step[tween.prop]) {
          jQuery.fx.step[tween.prop](tween);
        } else if (
          tween.elem.nodeType === 1 &&
          (jQuery.cssHooks[tween.prop] ||
            tween.elem.style[finalPropName(tween.prop)] != null)
        ) {
          jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
        } else {
          tween.elem[tween.prop] = tween.now;
        }
      },
    },
  };

  // Support: IE <=9 only
  // Panic based approach to setting things on disconnected nodes
  Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    set: function (tween) {
      if (tween.elem.nodeType && tween.elem.parentNode) {
        tween.elem[tween.prop] = tween.now;
      }
    },
  };

  jQuery.easing = {
    linear: function (p) {
      return p;
    },
    swing: function (p) {
      return 0.5 - Math.cos(p * Math.PI) / 2;
    },
    _default: "swing",
  };

  jQuery.fx = Tween.prototype.init;

  // Back compat <1.8 extension point
  jQuery.fx.step = {};

  var fxNow,
    inProgress,
    rfxtypes = /^(?:toggle|show|hide)$/,
    rrun = /queueHooks$/;

  function schedule() {
    if (inProgress) {
      if (document.hidden === false && window.requestAnimationFrame) {
        window.requestAnimationFrame(schedule);
      } else {
        window.setTimeout(schedule, jQuery.fx.interval);
      }

      jQuery.fx.tick();
    }
  }

  // Animations created synchronously will run synchronously
  function createFxNow() {
    window.setTimeout(function () {
      fxNow = undefined;
    });
    return (fxNow = Date.now());
  }

  // Generate parameters to create a standard animation
  function genFx(type, includeWidth) {
    var which,
      i = 0,
      attrs = { height: type };

    // If we include width, step value is 1 to do all cssExpand values,
    // otherwise step value is 2 to skip over Left and Right
    includeWidth = includeWidth ? 1 : 0;
    for (; i < 4; i += 2 - includeWidth) {
      which = cssExpand[i];
      attrs["margin" + which] = attrs["padding" + which] = type;
    }

    if (includeWidth) {
      attrs.opacity = attrs.width = type;
    }

    return attrs;
  }

  function createTween(value, prop, animation) {
    var tween,
      collection = (Animation.tweeners[prop] || []).concat(
        Animation.tweeners["*"]
      ),
      index = 0,
      length = collection.length;
    for (; index < length; index++) {
      if ((tween = collection[index].call(animation, prop, value))) {
        // We're done with this property
        return tween;
      }
    }
  }

  function defaultPrefilter(elem, props, opts) {
    var prop,
      value,
      toggle,
      hooks,
      oldfire,
      propTween,
      restoreDisplay,
      display,
      isBox = "width" in props || "height" in props,
      anim = this,
      orig = {},
      style = elem.style,
      hidden = elem.nodeType && isHiddenWithinTree(elem),
      dataShow = dataPriv.get(elem, "fxshow");

    // Queue-skipping animations hijack the fx hooks
    if (!opts.queue) {
      hooks = jQuery._queueHooks(elem, "fx");
      if (hooks.unqueued == null) {
        hooks.unqueued = 0;
        oldfire = hooks.empty.fire;
        hooks.empty.fire = function () {
          if (!hooks.unqueued) {
            oldfire();
          }
        };
      }
      hooks.unqueued++;

      anim.always(function () {
        // Ensure the complete handler is called before this completes
        anim.always(function () {
          hooks.unqueued--;
          if (!jQuery.queue(elem, "fx").length) {
            hooks.empty.fire();
          }
        });
      });
    }

    // Detect show/hide animations
    for (prop in props) {
      value = props[prop];
      if (rfxtypes.test(value)) {
        delete props[prop];
        toggle = toggle || value === "toggle";
        if (value === (hidden ? "hide" : "show")) {
          // Pretend to be hidden if this is a "show" and
          // there is still data from a stopped show/hide
          if (value === "show" && dataShow && dataShow[prop] !== undefined) {
            hidden = true;

            // Ignore all other no-op show/hide data
          } else {
            continue;
          }
        }
        orig[prop] = (dataShow && dataShow[prop]) || jQuery.style(elem, prop);
      }
    }

    // Bail out if this is a no-op like .hide().hide()
    propTween = !jQuery.isEmptyObject(props);
    if (!propTween && jQuery.isEmptyObject(orig)) {
      return;
    }

    // Restrict "overflow" and "display" styles during box animations
    if (isBox && elem.nodeType === 1) {
      // Support: IE <=9 - 11, Edge 12 - 15
      // Record all 3 overflow attributes because IE does not infer the shorthand
      // from identically-valued overflowX and overflowY and Edge just mirrors
      // the overflowX value there.
      opts.overflow = [style.overflow, style.overflowX, style.overflowY];

      // Identify a display type, preferring old show/hide data over the CSS cascade
      restoreDisplay = dataShow && dataShow.display;
      if (restoreDisplay == null) {
        restoreDisplay = dataPriv.get(elem, "display");
      }
      display = jQuery.css(elem, "display");
      if (display === "none") {
        if (restoreDisplay) {
          display = restoreDisplay;
        } else {
          // Get nonempty value(s) by temporarily forcing visibility
          showHide([elem], true);
          restoreDisplay = elem.style.display || restoreDisplay;
          display = jQuery.css(elem, "display");
          showHide([elem]);
        }
      }

      // Animate inline elements as inline-block
      if (
        display === "inline" ||
        (display === "inline-block" && restoreDisplay != null)
      ) {
        if (jQuery.css(elem, "float") === "none") {
          // Restore the original display value at the end of pure show/hide animations
          if (!propTween) {
            anim.done(function () {
              style.display = restoreDisplay;
            });
            if (restoreDisplay == null) {
              display = style.display;
              restoreDisplay = display === "none" ? "" : display;
            }
          }
          style.display = "inline-block";
        }
      }
    }

    if (opts.overflow) {
      style.overflow = "hidden";
      anim.always(function () {
        style.overflow = opts.overflow[0];
        style.overflowX = opts.overflow[1];
        style.overflowY = opts.overflow[2];
      });
    }

    // Implement show/hide animations
    propTween = false;
    for (prop in orig) {
      // General show/hide setup for this element animation
      if (!propTween) {
        if (dataShow) {
          if ("hidden" in dataShow) {
            hidden = dataShow.hidden;
          }
        } else {
          dataShow = dataPriv.access(elem, "fxshow", {
            display: restoreDisplay,
          });
        }

        // Store hidden/visible for toggle so `.stop().toggle()` "reverses"
        if (toggle) {
          dataShow.hidden = !hidden;
        }

        // Show elements before animating them
        if (hidden) {
          showHide([elem], true);
        }

        /* eslint-disable no-loop-func */

        anim.done(function () {
          /* eslint-enable no-loop-func */

          // The final step of a "hide" animation is actually hiding the element
          if (!hidden) {
            showHide([elem]);
          }
          dataPriv.remove(elem, "fxshow");
          for (prop in orig) {
            jQuery.style(elem, prop, orig[prop]);
          }
        });
      }

      // Per-property setup
      propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
      if (!(prop in dataShow)) {
        dataShow[prop] = propTween.start;
        if (hidden) {
          propTween.end = propTween.start;
          propTween.start = 0;
        }
      }
    }
  }

  function propFilter(props, specialEasing) {
    var index, name, easing, value, hooks;

    // camelCase, specialEasing and expand cssHook pass
    for (index in props) {
      name = camelCase(index);
      easing = specialEasing[name];
      value = props[index];
      if (Array.isArray(value)) {
        easing = value[1];
        value = props[index] = value[0];
      }

      if (index !== name) {
        props[name] = value;
        delete props[index];
      }

      hooks = jQuery.cssHooks[name];
      if (hooks && "expand" in hooks) {
        value = hooks.expand(value);
        delete props[name];

        // Not quite $.extend, this won't overwrite existing keys.
        // Reusing 'index' because we have the correct "name"
        for (index in value) {
          if (!(index in props)) {
            props[index] = value[index];
            specialEasing[index] = easing;
          }
        }
      } else {
        specialEasing[name] = easing;
      }
    }
  }

  function Animation(elem, properties, options) {
    var result,
      stopped,
      index = 0,
      length = Animation.prefilters.length,
      deferred = jQuery.Deferred().always(function () {
        // Don't match elem in the :animated selector
        delete tick.elem;
      }),
      tick = function () {
        if (stopped) {
          return false;
        }
        var currentTime = fxNow || createFxNow(),
          remaining = Math.max(
            0,
            animation.startTime + animation.duration - currentTime
          ),
          // Support: Android 2.3 only
          // Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
          temp = remaining / animation.duration || 0,
          percent = 1 - temp,
          index = 0,
          length = animation.tweens.length;

        for (; index < length; index++) {
          animation.tweens[index].run(percent);
        }

        deferred.notifyWith(elem, [animation, percent, remaining]);

        // If there's more to do, yield
        if (percent < 1 && length) {
          return remaining;
        }

        // If this was an empty animation, synthesize a final progress notification
        if (!length) {
          deferred.notifyWith(elem, [animation, 1, 0]);
        }

        // Resolve the animation and report its conclusion
        deferred.resolveWith(elem, [animation]);
        return false;
      },
      animation = deferred.promise({
        elem: elem,
        props: jQuery.extend({}, properties),
        opts: jQuery.extend(
          true,
          {
            specialEasing: {},
            easing: jQuery.easing._default,
          },
          options
        ),
        originalProperties: properties,
        originalOptions: options,
        startTime: fxNow || createFxNow(),
        duration: options.duration,
        tweens: [],
        createTween: function (prop, end) {
          var tween = jQuery.Tween(
            elem,
            animation.opts,
            prop,
            end,
            animation.opts.specialEasing[prop] || animation.opts.easing
          );
          animation.tweens.push(tween);
          return tween;
        },
        stop: function (gotoEnd) {
          var index = 0,
            // If we are going to the end, we want to run all the tweens
            // otherwise we skip this part
            length = gotoEnd ? animation.tweens.length : 0;
          if (stopped) {
            return this;
          }
          stopped = true;
          for (; index < length; index++) {
            animation.tweens[index].run(1);
          }

          // Resolve when we played the last frame; otherwise, reject
          if (gotoEnd) {
            deferred.notifyWith(elem, [animation, 1, 0]);
            deferred.resolveWith(elem, [animation, gotoEnd]);
          } else {
            deferred.rejectWith(elem, [animation, gotoEnd]);
          }
          return this;
        },
      }),
      props = animation.props;

    propFilter(props, animation.opts.specialEasing);

    for (; index < length; index++) {
      result = Animation.prefilters[index].call(
        animation,
        elem,
        props,
        animation.opts
      );
      if (result) {
        if (isFunction(result.stop)) {
          jQuery._queueHooks(animation.elem, animation.opts.queue).stop =
            result.stop.bind(result);
        }
        return result;
      }
    }

    jQuery.map(props, createTween, animation);

    if (isFunction(animation.opts.start)) {
      animation.opts.start.call(elem, animation);
    }

    // Attach callbacks from options
    animation
      .progress(animation.opts.progress)
      .done(animation.opts.done, animation.opts.complete)
      .fail(animation.opts.fail)
      .always(animation.opts.always);

    jQuery.fx.timer(
      jQuery.extend(tick, {
        elem: elem,
        anim: animation,
        queue: animation.opts.queue,
      })
    );

    return animation;
  }

  jQuery.Animation = jQuery.extend(Animation, {
    tweeners: {
      "*": [
        function (prop, value) {
          var tween = this.createTween(prop, value);
          adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
          return tween;
        },
      ],
    },

    tweener: function (props, callback) {
      if (isFunction(props)) {
        callback = props;
        props = ["*"];
      } else {
        props = props.match(rnothtmlwhite);
      }

      var prop,
        index = 0,
        length = props.length;

      for (; index < length; index++) {
        prop = props[index];
        Animation.tweeners[prop] = Animation.tweeners[prop] || [];
        Animation.tweeners[prop].unshift(callback);
      }
    },

    prefilters: [defaultPrefilter],

    prefilter: function (callback, prepend) {
      if (prepend) {
        Animation.prefilters.unshift(callback);
      } else {
        Animation.prefilters.push(callback);
      }
    },
  });

  jQuery.speed = function (speed, easing, fn) {
    var opt =
      speed && typeof speed === "object"
        ? jQuery.extend({}, speed)
        : {
            complete: fn || (!fn && easing) || (isFunction(speed) && speed),
            duration: speed,
            easing: (fn && easing) || (easing && !isFunction(easing) && easing),
          };

    // Go to the end state if fx are off
    if (jQuery.fx.off) {
      opt.duration = 0;
    } else {
      if (typeof opt.duration !== "number") {
        if (opt.duration in jQuery.fx.speeds) {
          opt.duration = jQuery.fx.speeds[opt.duration];
        } else {
          opt.duration = jQuery.fx.speeds._default;
        }
      }
    }

    // Normalize opt.queue - true/undefined/null -> "fx"
    if (opt.queue == null || opt.queue === true) {
      opt.queue = "fx";
    }

    // Queueing
    opt.old = opt.complete;

    opt.complete = function () {
      if (isFunction(opt.old)) {
        opt.old.call(this);
      }

      if (opt.queue) {
        jQuery.dequeue(this, opt.queue);
      }
    };

    return opt;
  };

  jQuery.fn.extend({
    fadeTo: function (speed, to, easing, callback) {
      // Show any hidden elements after setting opacity to 0
      return (
        this.filter(isHiddenWithinTree)
          .css("opacity", 0)
          .show()

          // Animate to the value specified
          .end()
          .animate({ opacity: to }, speed, easing, callback)
      );
    },
    animate: function (prop, speed, easing, callback) {
      var empty = jQuery.isEmptyObject(prop),
        optall = jQuery.speed(speed, easing, callback),
        doAnimation = function () {
          // Operate on a copy of prop so per-property easing won't be lost
          var anim = Animation(this, jQuery.extend({}, prop), optall);

          // Empty animations, or finishing resolves immediately
          if (empty || dataPriv.get(this, "finish")) {
            anim.stop(true);
          }
        };
      doAnimation.finish = doAnimation;

      return empty || optall.queue === false
        ? this.each(doAnimation)
        : this.queue(optall.queue, doAnimation);
    },
    stop: function (type, clearQueue, gotoEnd) {
      var stopQueue = function (hooks) {
        var stop = hooks.stop;
        delete hooks.stop;
        stop(gotoEnd);
      };

      if (typeof type !== "string") {
        gotoEnd = clearQueue;
        clearQueue = type;
        type = undefined;
      }
      if (clearQueue) {
        this.queue(type || "fx", []);
      }

      return this.each(function () {
        var dequeue = true,
          index = type != null && type + "queueHooks",
          timers = jQuery.timers,
          data = dataPriv.get(this);

        if (index) {
          if (data[index] && data[index].stop) {
            stopQueue(data[index]);
          }
        } else {
          for (index in data) {
            if (data[index] && data[index].stop && rrun.test(index)) {
              stopQueue(data[index]);
            }
          }
        }

        for (index = timers.length; index--; ) {
          if (
            timers[index].elem === this &&
            (type == null || timers[index].queue === type)
          ) {
            timers[index].anim.stop(gotoEnd);
            dequeue = false;
            timers.splice(index, 1);
          }
        }

        // Start the next in the queue if the last step wasn't forced.
        // Timers currently will call their complete callbacks, which
        // will dequeue but only if they were gotoEnd.
        if (dequeue || !gotoEnd) {
          jQuery.dequeue(this, type);
        }
      });
    },
    finish: function (type) {
      if (type !== false) {
        type = type || "fx";
      }
      return this.each(function () {
        var index,
          data = dataPriv.get(this),
          queue = data[type + "queue"],
          hooks = data[type + "queueHooks"],
          timers = jQuery.timers,
          length = queue ? queue.length : 0;

        // Enable finishing flag on private data
        data.finish = true;

        // Empty the queue first
        jQuery.queue(this, type, []);

        if (hooks && hooks.stop) {
          hooks.stop.call(this, true);
        }

        // Look for any active animations, and finish them
        for (index = timers.length; index--; ) {
          if (timers[index].elem === this && timers[index].queue === type) {
            timers[index].anim.stop(true);
            timers.splice(index, 1);
          }
        }

        // Look for any animations in the old queue and finish them
        for (index = 0; index < length; index++) {
          if (queue[index] && queue[index].finish) {
            queue[index].finish.call(this);
          }
        }

        // Turn off finishing flag
        delete data.finish;
      });
    },
  });

  jQuery.each(["toggle", "show", "hide"], function (_i, name) {
    var cssFn = jQuery.fn[name];
    jQuery.fn[name] = function (speed, easing, callback) {
      return speed == null || typeof speed === "boolean"
        ? cssFn.apply(this, arguments)
        : this.animate(genFx(name, true), speed, easing, callback);
    };
  });

  // Generate shortcuts for custom animations
  jQuery.each(
    {
      slideDown: genFx("show"),
      slideUp: genFx("hide"),
      slideToggle: genFx("toggle"),
      fadeIn: { opacity: "show" },
      fadeOut: { opacity: "hide" },
      fadeToggle: { opacity: "toggle" },
    },
    function (name, props) {
      jQuery.fn[name] = function (speed, easing, callback) {
        return this.animate(props, speed, easing, callback);
      };
    }
  );

  jQuery.timers = [];
  jQuery.fx.tick = function () {
    var timer,
      i = 0,
      timers = jQuery.timers;

    fxNow = Date.now();

    for (; i < timers.length; i++) {
      timer = timers[i];

      // Run the timer and safely remove it when done (allowing for external removal)
      if (!timer() && timers[i] === timer) {
        timers.splice(i--, 1);
      }
    }

    if (!timers.length) {
      jQuery.fx.stop();
    }
    fxNow = undefined;
  };

  jQuery.fx.timer = function (timer) {
    jQuery.timers.push(timer);
    jQuery.fx.start();
  };

  jQuery.fx.interval = 13;
  jQuery.fx.start = function () {
    if (inProgress) {
      return;
    }

    inProgress = true;
    schedule();
  };

  jQuery.fx.stop = function () {
    inProgress = null;
  };

  jQuery.fx.speeds = {
    slow: 600,
    fast: 200,

    // Default speed
    _default: 400,
  };

  // Based off of the plugin by Clint Helfers, with permission.
  // https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
  jQuery.fn.delay = function (time, type) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || "fx";

    return this.queue(type, function (next, hooks) {
      var timeout = window.setTimeout(next, time);
      hooks.stop = function () {
        window.clearTimeout(timeout);
      };
    });
  };

  (function () {
    var input = document.createElement("input"),
      select = document.createElement("select"),
      opt = select.appendChild(document.createElement("option"));

    input.type = "checkbox";

    // Support: Android <=4.3 only
    // Default value for a checkbox should be "on"
    support.checkOn = input.value !== "";

    // Support: IE <=11 only
    // Must access selectedIndex to make default options select
    support.optSelected = opt.selected;

    // Support: IE <=11 only
    // An input loses its value after becoming a radio
    input = document.createElement("input");
    input.value = "t";
    input.type = "radio";
    support.radioValue = input.value === "t";
  })();

  var boolHook,
    attrHandle = jQuery.expr.attrHandle;

  jQuery.fn.extend({
    attr: function (name, value) {
      return access(this, jQuery.attr, name, value, arguments.length > 1);
    },

    removeAttr: function (name) {
      return this.each(function () {
        jQuery.removeAttr(this, name);
      });
    },
  });

  jQuery.extend({
    attr: function (elem, name, value) {
      var ret,
        hooks,
        nType = elem.nodeType;

      // Don't get/set attributes on text, comment and attribute nodes
      if (nType === 3 || nType === 8 || nType === 2) {
        return;
      }

      // Fallback to prop when attributes are not supported
      if (typeof elem.getAttribute === "undefined") {
        return jQuery.prop(elem, name, value);
      }

      // Attribute hooks are determined by the lowercase version
      // Grab necessary hook if one is defined
      if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
        hooks =
          jQuery.attrHooks[name.toLowerCase()] ||
          (jQuery.expr.match.bool.test(name) ? boolHook : undefined);
      }

      if (value !== undefined) {
        if (value === null) {
          jQuery.removeAttr(elem, name);
          return;
        }

        if (
          hooks &&
          "set" in hooks &&
          (ret = hooks.set(elem, value, name)) !== undefined
        ) {
          return ret;
        }

        elem.setAttribute(name, value + "");
        return value;
      }

      if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret;
      }

      ret = jQuery.find.attr(elem, name);

      // Non-existent attributes return null, we normalize to undefined
      return ret == null ? undefined : ret;
    },

    attrHooks: {
      type: {
        set: function (elem, value) {
          if (
            !support.radioValue &&
            value === "radio" &&
            nodeName(elem, "input")
          ) {
            var val = elem.value;
            elem.setAttribute("type", value);
            if (val) {
              elem.value = val;
            }
            return value;
          }
        },
      },
    },

    removeAttr: function (elem, value) {
      var name,
        i = 0,
        // Attribute names can contain non-HTML whitespace characters
        // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
        attrNames = value && value.match(rnothtmlwhite);

      if (attrNames && elem.nodeType === 1) {
        while ((name = attrNames[i++])) {
          elem.removeAttribute(name);
        }
      }
    },
  });

  // Hooks for boolean attributes
  boolHook = {
    set: function (elem, value, name) {
      if (value === false) {
        // Remove boolean attributes when set to false
        jQuery.removeAttr(elem, name);
      } else {
        elem.setAttribute(name, name);
      }
      return name;
    },
  };

  jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (_i, name) {
    var getter = attrHandle[name] || jQuery.find.attr;

    attrHandle[name] = function (elem, name, isXML) {
      var ret,
        handle,
        lowercaseName = name.toLowerCase();

      if (!isXML) {
        // Avoid an infinite loop by temporarily removing this function from the getter
        handle = attrHandle[lowercaseName];
        attrHandle[lowercaseName] = ret;
        ret = getter(elem, name, isXML) != null ? lowercaseName : null;
        attrHandle[lowercaseName] = handle;
      }
      return ret;
    };
  });

  var rfocusable = /^(?:input|select|textarea|button)$/i,
    rclickable = /^(?:a|area)$/i;

  jQuery.fn.extend({
    prop: function (name, value) {
      return access(this, jQuery.prop, name, value, arguments.length > 1);
    },

    removeProp: function (name) {
      return this.each(function () {
        delete this[jQuery.propFix[name] || name];
      });
    },
  });

  jQuery.extend({
    prop: function (elem, name, value) {
      var ret,
        hooks,
        nType = elem.nodeType;

      // Don't get/set properties on text, comment and attribute nodes
      if (nType === 3 || nType === 8 || nType === 2) {
        return;
      }

      if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
        // Fix name and attach hooks
        name = jQuery.propFix[name] || name;
        hooks = jQuery.propHooks[name];
      }

      if (value !== undefined) {
        if (
          hooks &&
          "set" in hooks &&
          (ret = hooks.set(elem, value, name)) !== undefined
        ) {
          return ret;
        }

        return (elem[name] = value);
      }

      if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret;
      }

      return elem[name];
    },

    propHooks: {
      tabIndex: {
        get: function (elem) {
          // Support: IE <=9 - 11 only
          // elem.tabIndex doesn't always return the
          // correct value when it hasn't been explicitly set
          // https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
          // Use proper attribute retrieval(#12072)
          var tabindex = jQuery.find.attr(elem, "tabindex");

          if (tabindex) {
            return parseInt(tabindex, 10);
          }

          if (
            rfocusable.test(elem.nodeName) ||
            (rclickable.test(elem.nodeName) && elem.href)
          ) {
            return 0;
          }

          return -1;
        },
      },
    },

    propFix: {
      for: "htmlFor",
      class: "className",
    },
  });

  // Support: IE <=11 only
  // Accessing the selectedIndex property
  // forces the browser to respect setting selected
  // on the option
  // The getter ensures a default option is selected
  // when in an optgroup
  // eslint rule "no-unused-expressions" is disabled for this code
  // since it considers such accessions noop
  if (!support.optSelected) {
    jQuery.propHooks.selected = {
      get: function (elem) {
        /* eslint no-unused-expressions: "off" */

        var parent = elem.parentNode;
        if (parent && parent.parentNode) {
          parent.parentNode.selectedIndex;
        }
        return null;
      },
      set: function (elem) {
        /* eslint no-unused-expressions: "off" */

        var parent = elem.parentNode;
        if (parent) {
          parent.selectedIndex;

          if (parent.parentNode) {
            parent.parentNode.selectedIndex;
          }
        }
      },
    };
  }

  jQuery.each(
    [
      "tabIndex",
      "readOnly",
      "maxLength",
      "cellSpacing",
      "cellPadding",
      "rowSpan",
      "colSpan",
      "useMap",
      "frameBorder",
      "contentEditable",
    ],
    function () {
      jQuery.propFix[this.toLowerCase()] = this;
    }
  );

  // Strip and collapse whitespace according to HTML spec
  // https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
  function stripAndCollapse(value) {
    var tokens = value.match(rnothtmlwhite) || [];
    return tokens.join(" ");
  }

  function getClass(elem) {
    return (elem.getAttribute && elem.getAttribute("class")) || "";
  }

  function classesToArray(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return value.match(rnothtmlwhite) || [];
    }
    return [];
  }

  jQuery.fn.extend({
    addClass: function (value) {
      var classes,
        elem,
        cur,
        curValue,
        clazz,
        j,
        finalValue,
        i = 0;

      if (isFunction(value)) {
        return this.each(function (j) {
          jQuery(this).addClass(value.call(this, j, getClass(this)));
        });
      }

      classes = classesToArray(value);

      if (classes.length) {
        while ((elem = this[i++])) {
          curValue = getClass(elem);
          cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

          if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
              if (cur.indexOf(" " + clazz + " ") < 0) {
                cur += clazz + " ";
              }
            }

            // Only assign if different to avoid unneeded rendering.
            finalValue = stripAndCollapse(cur);
            if (curValue !== finalValue) {
              elem.setAttribute("class", finalValue);
            }
          }
        }
      }

      return this;
    },

    removeClass: function (value) {
      var classes,
        elem,
        cur,
        curValue,
        clazz,
        j,
        finalValue,
        i = 0;

      if (isFunction(value)) {
        return this.each(function (j) {
          jQuery(this).removeClass(value.call(this, j, getClass(this)));
        });
      }

      if (!arguments.length) {
        return this.attr("class", "");
      }

      classes = classesToArray(value);

      if (classes.length) {
        while ((elem = this[i++])) {
          curValue = getClass(elem);

          // This expression is here for better compressibility (see addClass)
          cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

          if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
              // Remove *all* instances
              while (cur.indexOf(" " + clazz + " ") > -1) {
                cur = cur.replace(" " + clazz + " ", " ");
              }
            }

            // Only assign if different to avoid unneeded rendering.
            finalValue = stripAndCollapse(cur);
            if (curValue !== finalValue) {
              elem.setAttribute("class", finalValue);
            }
          }
        }
      }

      return this;
    },

    toggleClass: function (value, stateVal) {
      var type = typeof value,
        isValidValue = type === "string" || Array.isArray(value);

      if (typeof stateVal === "boolean" && isValidValue) {
        return stateVal ? this.addClass(value) : this.removeClass(value);
      }

      if (isFunction(value)) {
        return this.each(function (i) {
          jQuery(this).toggleClass(
            value.call(this, i, getClass(this), stateVal),
            stateVal
          );
        });
      }

      return this.each(function () {
        var className, i, self, classNames;

        if (isValidValue) {
          // Toggle individual class names
          i = 0;
          self = jQuery(this);
          classNames = classesToArray(value);

          while ((className = classNames[i++])) {
            // Check each className given, space separated list
            if (self.hasClass(className)) {
              self.removeClass(className);
            } else {
              self.addClass(className);
            }
          }

          // Toggle whole class name
        } else if (value === undefined || type === "boolean") {
          className = getClass(this);
          if (className) {
            // Store className if set
            dataPriv.set(this, "__className__", className);
          }

          // If the element has a class name or if we're passed `false`,
          // then remove the whole classname (if there was one, the above saved it).
          // Otherwise bring back whatever was previously saved (if anything),
          // falling back to the empty string if nothing was stored.
          if (this.setAttribute) {
            this.setAttribute(
              "class",
              className || value === false
                ? ""
                : dataPriv.get(this, "__className__") || ""
            );
          }
        }
      });
    },

    hasClass: function (selector) {
      var className,
        elem,
        i = 0;

      className = " " + selector + " ";
      while ((elem = this[i++])) {
        if (
          elem.nodeType === 1 &&
          (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1
        ) {
          return true;
        }
      }

      return false;
    },
  });

  var rreturn = /\r/g;

  jQuery.fn.extend({
    val: function (value) {
      var hooks,
        ret,
        valueIsFunction,
        elem = this[0];

      if (!arguments.length) {
        if (elem) {
          hooks =
            jQuery.valHooks[elem.type] ||
            jQuery.valHooks[elem.nodeName.toLowerCase()];

          if (
            hooks &&
            "get" in hooks &&
            (ret = hooks.get(elem, "value")) !== undefined
          ) {
            return ret;
          }

          ret = elem.value;

          // Handle most common string cases
          if (typeof ret === "string") {
            return ret.replace(rreturn, "");
          }

          // Handle cases where value is null/undef or number
          return ret == null ? "" : ret;
        }

        return;
      }

      valueIsFunction = isFunction(value);

      return this.each(function (i) {
        var val;

        if (this.nodeType !== 1) {
          return;
        }

        if (valueIsFunction) {
          val = value.call(this, i, jQuery(this).val());
        } else {
          val = value;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (val == null) {
          val = "";
        } else if (typeof val === "number") {
          val += "";
        } else if (Array.isArray(val)) {
          val = jQuery.map(val, function (value) {
            return value == null ? "" : value + "";
          });
        }

        hooks =
          jQuery.valHooks[this.type] ||
          jQuery.valHooks[this.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (
          !hooks ||
          !("set" in hooks) ||
          hooks.set(this, val, "value") === undefined
        ) {
          this.value = val;
        }
      });
    },
  });

  jQuery.extend({
    valHooks: {
      option: {
        get: function (elem) {
          var val = jQuery.find.attr(elem, "value");
          return val != null
            ? val
            : // Support: IE <=10 - 11 only
              // option.text throws exceptions (#14686, #14858)
              // Strip and collapse whitespace
              // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
              stripAndCollapse(jQuery.text(elem));
        },
      },
      select: {
        get: function (elem) {
          var value,
            option,
            i,
            options = elem.options,
            index = elem.selectedIndex,
            one = elem.type === "select-one",
            values = one ? null : [],
            max = one ? index + 1 : options.length;

          if (index < 0) {
            i = max;
          } else {
            i = one ? index : 0;
          }

          // Loop through all the selected options
          for (; i < max; i++) {
            option = options[i];

            // Support: IE <=9 only
            // IE8-9 doesn't update selected after form reset (#2551)
            if (
              (option.selected || i === index) &&
              // Don't return options that are disabled or in a disabled optgroup
              !option.disabled &&
              (!option.parentNode.disabled ||
                !nodeName(option.parentNode, "optgroup"))
            ) {
              // Get the specific value for the option
              value = jQuery(option).val();

              // We don't need an array for one selects
              if (one) {
                return value;
              }

              // Multi-Selects return an array
              values.push(value);
            }
          }

          return values;
        },

        set: function (elem, value) {
          var optionSet,
            option,
            options = elem.options,
            values = jQuery.makeArray(value),
            i = options.length;

          while (i--) {
            option = options[i];

            /* eslint-disable no-cond-assign */

            if (
              (option.selected =
                jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1)
            ) {
              optionSet = true;
            }

            /* eslint-enable no-cond-assign */
          }

          // Force browsers to behave consistently when non-matching value is set
          if (!optionSet) {
            elem.selectedIndex = -1;
          }
          return values;
        },
      },
    },
  });

  // Radios and checkboxes getter/setter
  jQuery.each(["radio", "checkbox"], function () {
    jQuery.valHooks[this] = {
      set: function (elem, value) {
        if (Array.isArray(value)) {
          return (elem.checked =
            jQuery.inArray(jQuery(elem).val(), value) > -1);
        }
      },
    };
    if (!support.checkOn) {
      jQuery.valHooks[this].get = function (elem) {
        return elem.getAttribute("value") === null ? "on" : elem.value;
      };
    }
  });

  // Return jQuery for attributes-only inclusion

  support.focusin = "onfocusin" in window;

  var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    stopPropagationCallback = function (e) {
      e.stopPropagation();
    };

  jQuery.extend(jQuery.event, {
    trigger: function (event, data, elem, onlyHandlers) {
      var i,
        cur,
        tmp,
        bubbleType,
        ontype,
        handle,
        special,
        lastElement,
        eventPath = [elem || document],
        type = hasOwn.call(event, "type") ? event.type : event,
        namespaces = hasOwn.call(event, "namespace")
          ? event.namespace.split(".")
          : [];

      cur = lastElement = tmp = elem = elem || document;

      // Don't do events on text and comment nodes
      if (elem.nodeType === 3 || elem.nodeType === 8) {
        return;
      }

      // focus/blur morphs to focusin/out; ensure we're not firing them right now
      if (rfocusMorph.test(type + jQuery.event.triggered)) {
        return;
      }

      if (type.indexOf(".") > -1) {
        // Namespaced trigger; create a regexp to match event type in handle()
        namespaces = type.split(".");
        type = namespaces.shift();
        namespaces.sort();
      }
      ontype = type.indexOf(":") < 0 && "on" + type;

      // Caller can pass in a jQuery.Event object, Object, or just an event type string
      event = event[jQuery.expando]
        ? event
        : new jQuery.Event(type, typeof event === "object" && event);

      // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
      event.isTrigger = onlyHandlers ? 2 : 3;
      event.namespace = namespaces.join(".");
      event.rnamespace = event.namespace
        ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)")
        : null;

      // Clean up the event in case it is being reused
      event.result = undefined;
      if (!event.target) {
        event.target = elem;
      }

      // Clone any incoming data and prepend the event, creating the handler arg list
      data = data == null ? [event] : jQuery.makeArray(data, [event]);

      // Allow special events to draw outside the lines
      special = jQuery.event.special[type] || {};
      if (
        !onlyHandlers &&
        special.trigger &&
        special.trigger.apply(elem, data) === false
      ) {
        return;
      }

      // Determine event propagation path in advance, per W3C events spec (#9951)
      // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
      if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
        bubbleType = special.delegateType || type;
        if (!rfocusMorph.test(bubbleType + type)) {
          cur = cur.parentNode;
        }
        for (; cur; cur = cur.parentNode) {
          eventPath.push(cur);
          tmp = cur;
        }

        // Only add window if we got to document (e.g., not plain obj or detached DOM)
        if (tmp === (elem.ownerDocument || document)) {
          eventPath.push(tmp.defaultView || tmp.parentWindow || window);
        }
      }

      // Fire handlers on the event path
      i = 0;
      while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
        lastElement = cur;
        event.type = i > 1 ? bubbleType : special.bindType || type;

        // jQuery handler
        handle =
          (dataPriv.get(cur, "events") || Object.create(null))[event.type] &&
          dataPriv.get(cur, "handle");
        if (handle) {
          handle.apply(cur, data);
        }

        // Native handler
        handle = ontype && cur[ontype];
        if (handle && handle.apply && acceptData(cur)) {
          event.result = handle.apply(cur, data);
          if (event.result === false) {
            event.preventDefault();
          }
        }
      }
      event.type = type;

      // If nobody prevented the default action, do it now
      if (!onlyHandlers && !event.isDefaultPrevented()) {
        if (
          (!special._default ||
            special._default.apply(eventPath.pop(), data) === false) &&
          acceptData(elem)
        ) {
          // Call a native DOM method on the target with the same name as the event.
          // Don't do default actions on window, that's where global variables be (#6170)
          if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
            // Don't re-trigger an onFOO event when we call its FOO() method
            tmp = elem[ontype];

            if (tmp) {
              elem[ontype] = null;
            }

            // Prevent re-triggering of the same event, since we already bubbled it above
            jQuery.event.triggered = type;

            if (event.isPropagationStopped()) {
              lastElement.addEventListener(type, stopPropagationCallback);
            }

            elem[type]();

            if (event.isPropagationStopped()) {
              lastElement.removeEventListener(type, stopPropagationCallback);
            }

            jQuery.event.triggered = undefined;

            if (tmp) {
              elem[ontype] = tmp;
            }
          }
        }
      }

      return event.result;
    },

    // Piggyback on a donor event to simulate a different one
    // Used only for `focus(in | out)` events
    simulate: function (type, elem, event) {
      var e = jQuery.extend(new jQuery.Event(), event, {
        type: type,
        isSimulated: true,
      });

      jQuery.event.trigger(e, null, elem);
    },
  });

  jQuery.fn.extend({
    trigger: function (type, data) {
      return this.each(function () {
        jQuery.event.trigger(type, data, this);
      });
    },
    triggerHandler: function (type, data) {
      var elem = this[0];
      if (elem) {
        return jQuery.event.trigger(type, data, elem, true);
      }
    },
  });

  // Support: Firefox <=44
  // Firefox doesn't have focus(in | out) events
  // Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
  //
  // Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
  // focus(in | out) events fire after focus & blur events,
  // which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
  // Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
  if (!support.focusin) {
    jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {
      // Attach a single capturing handler on the document while someone wants focusin/focusout
      var handler = function (event) {
        jQuery.event.simulate(fix, event.target, jQuery.event.fix(event));
      };

      jQuery.event.special[fix] = {
        setup: function () {
          // Handle: regular nodes (via `this.ownerDocument`), window
          // (via `this.document`) & document (via `this`).
          var doc = this.ownerDocument || this.document || this,
            attaches = dataPriv.access(doc, fix);

          if (!attaches) {
            doc.addEventListener(orig, handler, true);
          }
          dataPriv.access(doc, fix, (attaches || 0) + 1);
        },
        teardown: function () {
          var doc = this.ownerDocument || this.document || this,
            attaches = dataPriv.access(doc, fix) - 1;

          if (!attaches) {
            doc.removeEventListener(orig, handler, true);
            dataPriv.remove(doc, fix);
          } else {
            dataPriv.access(doc, fix, attaches);
          }
        },
      };
    });
  }
  var location = window.location;

  var nonce = { guid: Date.now() };

  var rquery = /\?/;

  // Cross-browser xml parsing
  jQuery.parseXML = function (data) {
    var xml;
    if (!data || typeof data !== "string") {
      return null;
    }

    // Support: IE 9 - 11 only
    // IE throws on parseFromString with invalid input.
    try {
      xml = new window.DOMParser().parseFromString(data, "text/xml");
    } catch (e) {
      xml = undefined;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
      jQuery.error("Invalid XML: " + data);
    }
    return xml;
  };

  var rbracket = /\[\]$/,
    rCRLF = /\r?\n/g,
    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    rsubmittable = /^(?:input|select|textarea|keygen)/i;

  function buildParams(prefix, obj, traditional, add) {
    var name;

    if (Array.isArray(obj)) {
      // Serialize array item.
      jQuery.each(obj, function (i, v) {
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v);
        } else {
          // Item is non-scalar (array or object), encode its numeric index.
          buildParams(
            prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
            v,
            traditional,
            add
          );
        }
      });
    } else if (!traditional && toType(obj) === "object") {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
      }
    } else {
      // Serialize scalar item.
      add(prefix, obj);
    }
  }

  // Serialize an array of form elements or a set of
  // key/values into a query string
  jQuery.param = function (a, traditional) {
    var prefix,
      s = [],
      add = function (key, valueOrFunction) {
        // If value is a function, invoke it and use its return value
        var value = isFunction(valueOrFunction)
          ? valueOrFunction()
          : valueOrFunction;

        s[s.length] =
          encodeURIComponent(key) +
          "=" +
          encodeURIComponent(value == null ? "" : value);
      };

    if (a == null) {
      return "";
    }

    // If an array was passed in, assume that it is an array of form elements.
    if (Array.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
      // Serialize the form elements
      jQuery.each(a, function () {
        add(this.name, this.value);
      });
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in a) {
        buildParams(prefix, a[prefix], traditional, add);
      }
    }

    // Return the resulting serialization
    return s.join("&");
  };

  jQuery.fn.extend({
    serialize: function () {
      return jQuery.param(this.serializeArray());
    },
    serializeArray: function () {
      return this.map(function () {
        // Can add propHook for "elements" to filter or add form elements
        var elements = jQuery.prop(this, "elements");
        return elements ? jQuery.makeArray(elements) : this;
      })
        .filter(function () {
          var type = this.type;

          // Use .is( ":disabled" ) so that fieldset[disabled] works
          return (
            this.name &&
            !jQuery(this).is(":disabled") &&
            rsubmittable.test(this.nodeName) &&
            !rsubmitterTypes.test(type) &&
            (this.checked || !rcheckableType.test(type))
          );
        })
        .map(function (_i, elem) {
          var val = jQuery(this).val();

          if (val == null) {
            return null;
          }

          if (Array.isArray(val)) {
            return jQuery.map(val, function (val) {
              return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
            });
          }

          return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
        })
        .get();
    },
  });

  var r20 = /%20/g,
    rhash = /#.*$/,
    rantiCache = /([?&])_=[^&]*/,
    rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
    // #7653, #8125, #8152: local protocol detection
    rlocalProtocol =
      /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    rnoContent = /^(?:GET|HEAD)$/,
    rprotocol = /^\/\//,
    /* Prefilters
     * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
     * 2) These are called:
     *    - BEFORE asking for a transport
     *    - AFTER param serialization (s.data is a string if s.processData is true)
     * 3) key is the dataType
     * 4) the catchall symbol "*" can be used
     * 5) execution will start with transport dataType and THEN continue down to "*" if needed
     */
    prefilters = {},
    /* Transports bindings
     * 1) key is the dataType
     * 2) the catchall symbol "*" can be used
     * 3) selection will start with transport dataType and THEN go to "*" if needed
     */
    transports = {},
    // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
    allTypes = "*/".concat("*"),
    // Anchor tag for parsing the document origin
    originAnchor = document.createElement("a");
  originAnchor.href = location.href;

  // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
  function addToPrefiltersOrTransports(structure) {
    // dataTypeExpression is optional and defaults to "*"
    return function (dataTypeExpression, func) {
      if (typeof dataTypeExpression !== "string") {
        func = dataTypeExpression;
        dataTypeExpression = "*";
      }

      var dataType,
        i = 0,
        dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

      if (isFunction(func)) {
        // For each dataType in the dataTypeExpression
        while ((dataType = dataTypes[i++])) {
          // Prepend if requested
          if (dataType[0] === "+") {
            dataType = dataType.slice(1) || "*";
            (structure[dataType] = structure[dataType] || []).unshift(func);

            // Otherwise append
          } else {
            (structure[dataType] = structure[dataType] || []).push(func);
          }
        }
      }
    };
  }

  // Base inspection function for prefilters and transports
  function inspectPrefiltersOrTransports(
    structure,
    options,
    originalOptions,
    jqXHR
  ) {
    var inspected = {},
      seekingTransport = structure === transports;

    function inspect(dataType) {
      var selected;
      inspected[dataType] = true;
      jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
        var dataTypeOrTransport = prefilterOrFactory(
          options,
          originalOptions,
          jqXHR
        );
        if (
          typeof dataTypeOrTransport === "string" &&
          !seekingTransport &&
          !inspected[dataTypeOrTransport]
        ) {
          options.dataTypes.unshift(dataTypeOrTransport);
          inspect(dataTypeOrTransport);
          return false;
        } else if (seekingTransport) {
          return !(selected = dataTypeOrTransport);
        }
      });
      return selected;
    }

    return inspect(options.dataTypes[0]) || (!inspected["*"] && inspect("*"));
  }

  // A special extend for ajax options
  // that takes "flat" options (not to be deep extended)
  // Fixes #9887
  function ajaxExtend(target, src) {
    var key,
      deep,
      flatOptions = jQuery.ajaxSettings.flatOptions || {};

    for (key in src) {
      if (src[key] !== undefined) {
        (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
      }
    }
    if (deep) {
      jQuery.extend(true, target, deep);
    }

    return target;
  }

  /* Handles responses to an ajax request:
   * - finds the right dataType (mediates between content-type and expected dataType)
   * - returns the corresponding response
   */
  function ajaxHandleResponses(s, jqXHR, responses) {
    var ct,
      type,
      finalDataType,
      firstDataType,
      contents = s.contents,
      dataTypes = s.dataTypes;

    // Remove auto dataType and get content-type in the process
    while (dataTypes[0] === "*") {
      dataTypes.shift();
      if (ct === undefined) {
        ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
      }
    }

    // Check if we're dealing with a known content-type
    if (ct) {
      for (type in contents) {
        if (contents[type] && contents[type].test(ct)) {
          dataTypes.unshift(type);
          break;
        }
      }
    }

    // Check to see if we have a response for the expected dataType
    if (dataTypes[0] in responses) {
      finalDataType = dataTypes[0];
    } else {
      // Try convertible dataTypes
      for (type in responses) {
        if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
          finalDataType = type;
          break;
        }
        if (!firstDataType) {
          firstDataType = type;
        }
      }

      // Or just use first one
      finalDataType = finalDataType || firstDataType;
    }

    // If we found a dataType
    // We add the dataType to the list if needed
    // and return the corresponding response
    if (finalDataType) {
      if (finalDataType !== dataTypes[0]) {
        dataTypes.unshift(finalDataType);
      }
      return responses[finalDataType];
    }
  }

  /* Chain conversions given the request and the original response
   * Also sets the responseXXX fields on the jqXHR instance
   */
  function ajaxConvert(s, response, jqXHR, isSuccess) {
    var conv2,
      current,
      conv,
      tmp,
      prev,
      converters = {},
      // Work with a copy of dataTypes in case we need to modify it for conversion
      dataTypes = s.dataTypes.slice();

    // Create converters map with lowercased keys
    if (dataTypes[1]) {
      for (conv in s.converters) {
        converters[conv.toLowerCase()] = s.converters[conv];
      }
    }

    current = dataTypes.shift();

    // Convert to each sequential dataType
    while (current) {
      if (s.responseFields[current]) {
        jqXHR[s.responseFields[current]] = response;
      }

      // Apply the dataFilter if provided
      if (!prev && isSuccess && s.dataFilter) {
        response = s.dataFilter(response, s.dataType);
      }

      prev = current;
      current = dataTypes.shift();

      if (current) {
        // There's only work to do if current dataType is non-auto
        if (current === "*") {
          current = prev;

          // Convert response if prev dataType is non-auto and differs from current
        } else if (prev !== "*" && prev !== current) {
          // Seek a direct converter
          conv = converters[prev + " " + current] || converters["* " + current];

          // If none found, seek a pair
          if (!conv) {
            for (conv2 in converters) {
              // If conv2 outputs current
              tmp = conv2.split(" ");
              if (tmp[1] === current) {
                // If prev can be converted to accepted input
                conv =
                  converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                if (conv) {
                  // Condense equivalence converters
                  if (conv === true) {
                    conv = converters[conv2];

                    // Otherwise, insert the intermediate dataType
                  } else if (converters[conv2] !== true) {
                    current = tmp[0];
                    dataTypes.unshift(tmp[1]);
                  }
                  break;
                }
              }
            }
          }

          // Apply converter (if not an equivalence)
          if (conv !== true) {
            // Unless errors are allowed to bubble, catch and return them
            if (conv && s.throws) {
              response = conv(response);
            } else {
              try {
                response = conv(response);
              } catch (e) {
                return {
                  state: "parsererror",
                  error: conv
                    ? e
                    : "No conversion from " + prev + " to " + current,
                };
              }
            }
          }
        }
      }
    }

    return { state: "success", data: response };
  }

  jQuery.extend({
    // Counter for holding the number of active queries
    active: 0,

    // Last-Modified header cache for next request
    lastModified: {},
    etag: {},

    ajaxSettings: {
      url: location.href,
      type: "GET",
      isLocal: rlocalProtocol.test(location.protocol),
      global: true,
      processData: true,
      async: true,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",

      /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

      accepts: {
        "*": allTypes,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript",
      },

      contents: {
        xml: /\bxml\b/,
        html: /\bhtml/,
        json: /\bjson\b/,
      },

      responseFields: {
        xml: "responseXML",
        text: "responseText",
        json: "responseJSON",
      },

      // Data converters
      // Keys separate source (or catchall "*") and destination types with a single space
      converters: {
        // Convert anything to text
        "* text": String,

        // Text to html (true = no transformation)
        "text html": true,

        // Evaluate text as a json expression
        "text json": JSON.parse,

        // Parse text as xml
        "text xml": jQuery.parseXML,
      },

      // For options that shouldn't be deep extended:
      // you can add your own custom options here if
      // and when you create one that shouldn't be
      // deep extended (see ajaxExtend)
      flatOptions: {
        url: true,
        context: true,
      },
    },

    // Creates a full fledged settings object into target
    // with both ajaxSettings and settings fields.
    // If target is omitted, writes into ajaxSettings.
    ajaxSetup: function (target, settings) {
      return settings
        ? // Building a settings object
          ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings)
        : // Extending ajaxSettings
          ajaxExtend(jQuery.ajaxSettings, target);
    },

    ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
    ajaxTransport: addToPrefiltersOrTransports(transports),

    // Main method
    ajax: function (url, options) {
      // If url is an object, simulate pre-1.5 signature
      if (typeof url === "object") {
        options = url;
        url = undefined;
      }

      // Force options to be an object
      options = options || {};

      var transport,
        // URL without anti-cache param
        cacheURL,
        // Response headers
        responseHeadersString,
        responseHeaders,
        // timeout handle
        timeoutTimer,
        // Url cleanup var
        urlAnchor,
        // Request state (becomes false upon send and true upon completion)
        completed,
        // To know if global events are to be dispatched
        fireGlobals,
        // Loop variable
        i,
        // uncached part of the url
        uncached,
        // Create the final options object
        s = jQuery.ajaxSetup({}, options),
        // Callbacks context
        callbackContext = s.context || s,
        // Context for global events is callbackContext if it is a DOM node or jQuery collection
        globalEventContext =
          s.context && (callbackContext.nodeType || callbackContext.jquery)
            ? jQuery(callbackContext)
            : jQuery.event,
        // Deferreds
        deferred = jQuery.Deferred(),
        completeDeferred = jQuery.Callbacks("once memory"),
        // Status-dependent callbacks
        statusCode = s.statusCode || {},
        // Headers (they are sent all at once)
        requestHeaders = {},
        requestHeadersNames = {},
        // Default abort message
        strAbort = "canceled",
        // Fake xhr
        jqXHR = {
          readyState: 0,

          // Builds headers hashtable if needed
          getResponseHeader: function (key) {
            var match;
            if (completed) {
              if (!responseHeaders) {
                responseHeaders = {};
                while ((match = rheaders.exec(responseHeadersString))) {
                  responseHeaders[match[1].toLowerCase() + " "] = (
                    responseHeaders[match[1].toLowerCase() + " "] || []
                  ).concat(match[2]);
                }
              }
              match = responseHeaders[key.toLowerCase() + " "];
            }
            return match == null ? null : match.join(", ");
          },

          // Raw string
          getAllResponseHeaders: function () {
            return completed ? responseHeadersString : null;
          },

          // Caches the header
          setRequestHeader: function (name, value) {
            if (completed == null) {
              name = requestHeadersNames[name.toLowerCase()] =
                requestHeadersNames[name.toLowerCase()] || name;
              requestHeaders[name] = value;
            }
            return this;
          },

          // Overrides response content-type header
          overrideMimeType: function (type) {
            if (completed == null) {
              s.mimeType = type;
            }
            return this;
          },

          // Status-dependent callbacks
          statusCode: function (map) {
            var code;
            if (map) {
              if (completed) {
                // Execute the appropriate callbacks
                jqXHR.always(map[jqXHR.status]);
              } else {
                // Lazy-add the new callbacks in a way that preserves old ones
                for (code in map) {
                  statusCode[code] = [statusCode[code], map[code]];
                }
              }
            }
            return this;
          },

          // Cancel the request
          abort: function (statusText) {
            var finalText = statusText || strAbort;
            if (transport) {
              transport.abort(finalText);
            }
            done(0, finalText);
            return this;
          },
        };

      // Attach deferreds
      deferred.promise(jqXHR);

      // Add protocol if not provided (prefilters might expect it)
      // Handle falsy url in the settings object (#10093: consistency with old signature)
      // We also use the url parameter if available
      s.url = ((url || s.url || location.href) + "").replace(
        rprotocol,
        location.protocol + "//"
      );

      // Alias method option to type as per ticket #12004
      s.type = options.method || options.type || s.method || s.type;

      // Extract dataTypes list
      s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [
        "",
      ];

      // A cross-domain request is in order when the origin doesn't match the current origin.
      if (s.crossDomain == null) {
        urlAnchor = document.createElement("a");

        // Support: IE <=8 - 11, Edge 12 - 15
        // IE throws exception on accessing the href property if url is malformed,
        // e.g. http://example.com:80x/
        try {
          urlAnchor.href = s.url;

          // Support: IE <=8 - 11 only
          // Anchor's host property isn't correctly set when s.url is relative
          urlAnchor.href = urlAnchor.href;
          s.crossDomain =
            originAnchor.protocol + "//" + originAnchor.host !==
            urlAnchor.protocol + "//" + urlAnchor.host;
        } catch (e) {
          // If there is an error parsing the URL, assume it is crossDomain,
          // it can be rejected by the transport if it is invalid
          s.crossDomain = true;
        }
      }

      // Convert data if not already a string
      if (s.data && s.processData && typeof s.data !== "string") {
        s.data = jQuery.param(s.data, s.traditional);
      }

      // Apply prefilters
      inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

      // If request was aborted inside a prefilter, stop there
      if (completed) {
        return jqXHR;
      }

      // We can fire global events as of now if asked to
      // Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
      fireGlobals = jQuery.event && s.global;

      // Watch for a new set of requests
      if (fireGlobals && jQuery.active++ === 0) {
        jQuery.event.trigger("ajaxStart");
      }

      // Uppercase the type
      s.type = s.type.toUpperCase();

      // Determine if request has content
      s.hasContent = !rnoContent.test(s.type);

      // Save the URL in case we're toying with the If-Modified-Since
      // and/or If-None-Match header later on
      // Remove hash to simplify url manipulation
      cacheURL = s.url.replace(rhash, "");

      // More options handling for requests with no content
      if (!s.hasContent) {
        // Remember the hash so we can put it back
        uncached = s.url.slice(cacheURL.length);

        // If data is available and should be processed, append data to url
        if (s.data && (s.processData || typeof s.data === "string")) {
          cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

          // #9682: remove data so that it's not used in an eventual retry
          delete s.data;
        }

        // Add or update anti-cache param if needed
        if (s.cache === false) {
          cacheURL = cacheURL.replace(rantiCache, "$1");
          uncached =
            (rquery.test(cacheURL) ? "&" : "?") +
            "_=" +
            nonce.guid++ +
            uncached;
        }

        // Put hash and anti-cache on the URL that will be requested (gh-1732)
        s.url = cacheURL + uncached;

        // Change '%20' to '+' if this is encoded form body content (gh-2658)
      } else if (
        s.data &&
        s.processData &&
        (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0
      ) {
        s.data = s.data.replace(r20, "+");
      }

      // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
      if (s.ifModified) {
        if (jQuery.lastModified[cacheURL]) {
          jqXHR.setRequestHeader(
            "If-Modified-Since",
            jQuery.lastModified[cacheURL]
          );
        }
        if (jQuery.etag[cacheURL]) {
          jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
        }
      }

      // Set the correct header, if data is being sent
      if (
        (s.data && s.hasContent && s.contentType !== false) ||
        options.contentType
      ) {
        jqXHR.setRequestHeader("Content-Type", s.contentType);
      }

      // Set the Accepts header for the server, depending on the dataType
      jqXHR.setRequestHeader(
        "Accept",
        s.dataTypes[0] && s.accepts[s.dataTypes[0]]
          ? s.accepts[s.dataTypes[0]] +
              (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "")
          : s.accepts["*"]
      );

      // Check for headers option
      for (i in s.headers) {
        jqXHR.setRequestHeader(i, s.headers[i]);
      }

      // Allow custom headers/mimetypes and early abort
      if (
        s.beforeSend &&
        (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed)
      ) {
        // Abort if not done already and return
        return jqXHR.abort();
      }

      // Aborting is no longer a cancellation
      strAbort = "abort";

      // Install callbacks on deferreds
      completeDeferred.add(s.complete);
      jqXHR.done(s.success);
      jqXHR.fail(s.error);

      // Get transport
      transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

      // If no transport, we auto-abort
      if (!transport) {
        done(-1, "No Transport");
      } else {
        jqXHR.readyState = 1;

        // Send global event
        if (fireGlobals) {
          globalEventContext.trigger("ajaxSend", [jqXHR, s]);
        }

        // If request was aborted inside ajaxSend, stop there
        if (completed) {
          return jqXHR;
        }

        // Timeout
        if (s.async && s.timeout > 0) {
          timeoutTimer = window.setTimeout(function () {
            jqXHR.abort("timeout");
          }, s.timeout);
        }

        try {
          completed = false;
          transport.send(requestHeaders, done);
        } catch (e) {
          // Rethrow post-completion exceptions
          if (completed) {
            throw e;
          }

          // Propagate others as results
          done(-1, e);
        }
      }

      // Callback for when everything is done
      function done(status, nativeStatusText, responses, headers) {
        var isSuccess,
          success,
          error,
          response,
          modified,
          statusText = nativeStatusText;

        // Ignore repeat invocations
        if (completed) {
          return;
        }

        completed = true;

        // Clear timeout if it exists
        if (timeoutTimer) {
          window.clearTimeout(timeoutTimer);
        }

        // Dereference transport for early garbage collection
        // (no matter how long the jqXHR object will be used)
        transport = undefined;

        // Cache response headers
        responseHeadersString = headers || "";

        // Set readyState
        jqXHR.readyState = status > 0 ? 4 : 0;

        // Determine if successful
        isSuccess = (status >= 200 && status < 300) || status === 304;

        // Get response data
        if (responses) {
          response = ajaxHandleResponses(s, jqXHR, responses);
        }

        // Use a noop converter for missing script
        if (!isSuccess && jQuery.inArray("script", s.dataTypes) > -1) {
          s.converters["text script"] = function () {};
        }

        // Convert no matter what (that way responseXXX fields are always set)
        response = ajaxConvert(s, response, jqXHR, isSuccess);

        // If successful, handle type chaining
        if (isSuccess) {
          // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
          if (s.ifModified) {
            modified = jqXHR.getResponseHeader("Last-Modified");
            if (modified) {
              jQuery.lastModified[cacheURL] = modified;
            }
            modified = jqXHR.getResponseHeader("etag");
            if (modified) {
              jQuery.etag[cacheURL] = modified;
            }
          }

          // if no content
          if (status === 204 || s.type === "HEAD") {
            statusText = "nocontent";

            // if not modified
          } else if (status === 304) {
            statusText = "notmodified";

            // If we have data, let's convert it
          } else {
            statusText = response.state;
            success = response.data;
            error = response.error;
            isSuccess = !error;
          }
        } else {
          // Extract error from statusText and normalize for non-aborts
          error = statusText;
          if (status || !statusText) {
            statusText = "error";
            if (status < 0) {
              status = 0;
            }
          }
        }

        // Set data for the fake xhr object
        jqXHR.status = status;
        jqXHR.statusText = (nativeStatusText || statusText) + "";

        // Success/Error
        if (isSuccess) {
          deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
        } else {
          deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
        }

        // Status-dependent callbacks
        jqXHR.statusCode(statusCode);
        statusCode = undefined;

        if (fireGlobals) {
          globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [
            jqXHR,
            s,
            isSuccess ? success : error,
          ]);
        }

        // Complete
        completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

        if (fireGlobals) {
          globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

          // Handle the global AJAX counter
          if (!--jQuery.active) {
            jQuery.event.trigger("ajaxStop");
          }
        }
      }

      return jqXHR;
    },

    getJSON: function (url, data, callback) {
      return jQuery.get(url, data, callback, "json");
    },

    getScript: function (url, callback) {
      return jQuery.get(url, undefined, callback, "script");
    },
  });

  jQuery.each(["get", "post"], function (_i, method) {
    jQuery[method] = function (url, data, callback, type) {
      // Shift arguments if data argument was omitted
      if (isFunction(data)) {
        type = type || callback;
        callback = data;
        data = undefined;
      }

      // The url can be an options object (which then must have .url)
      return jQuery.ajax(
        jQuery.extend(
          {
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback,
          },
          jQuery.isPlainObject(url) && url
        )
      );
    };
  });

  jQuery.ajaxPrefilter(function (s) {
    var i;
    for (i in s.headers) {
      if (i.toLowerCase() === "content-type") {
        s.contentType = s.headers[i] || "";
      }
    }
  });

  jQuery._evalUrl = function (url, options, doc) {
    return jQuery.ajax({
      url: url,

      // Make this explicit, since user can override this through ajaxSetup (#11264)
      type: "GET",
      dataType: "script",
      cache: true,
      async: false,
      global: false,

      // Only evaluate the response if it is successful (gh-4126)
      // dataFilter is not invoked for failure responses, so using it instead
      // of the default converter is kludgy but it works.
      converters: {
        "text script": function () {},
      },
      dataFilter: function (response) {
        jQuery.globalEval(response, options, doc);
      },
    });
  };

  jQuery.fn.extend({
    wrapAll: function (html) {
      var wrap;

      if (this[0]) {
        if (isFunction(html)) {
          html = html.call(this[0]);
        }

        // The elements to wrap the target around
        wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

        if (this[0].parentNode) {
          wrap.insertBefore(this[0]);
        }

        wrap
          .map(function () {
            var elem = this;

            while (elem.firstElementChild) {
              elem = elem.firstElementChild;
            }

            return elem;
          })
          .append(this);
      }

      return this;
    },

    wrapInner: function (html) {
      if (isFunction(html)) {
        return this.each(function (i) {
          jQuery(this).wrapInner(html.call(this, i));
        });
      }

      return this.each(function () {
        var self = jQuery(this),
          contents = self.contents();

        if (contents.length) {
          contents.wrapAll(html);
        } else {
          self.append(html);
        }
      });
    },

    wrap: function (html) {
      var htmlIsFunction = isFunction(html);

      return this.each(function (i) {
        jQuery(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
      });
    },

    unwrap: function (selector) {
      this.parent(selector)
        .not("body")
        .each(function () {
          jQuery(this).replaceWith(this.childNodes);
        });
      return this;
    },
  });

  jQuery.expr.pseudos.hidden = function (elem) {
    return !jQuery.expr.pseudos.visible(elem);
  };
  jQuery.expr.pseudos.visible = function (elem) {
    return !!(
      elem.offsetWidth ||
      elem.offsetHeight ||
      elem.getClientRects().length
    );
  };

  jQuery.ajaxSettings.xhr = function () {
    try {
      return new window.XMLHttpRequest();
    } catch (e) {}
  };

  var xhrSuccessStatus = {
      // File protocol always yields status code 0, assume 200
      0: 200,

      // Support: IE <=9 only
      // #1450: sometimes IE returns 1223 when it should be 204
      1223: 204,
    },
    xhrSupported = jQuery.ajaxSettings.xhr();

  support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
  support.ajax = xhrSupported = !!xhrSupported;

  jQuery.ajaxTransport(function (options) {
    var callback, errorCallback;

    // Cross domain only allowed if supported through XMLHttpRequest
    if (support.cors || (xhrSupported && !options.crossDomain)) {
      return {
        send: function (headers, complete) {
          var i,
            xhr = options.xhr();

          xhr.open(
            options.type,
            options.url,
            options.async,
            options.username,
            options.password
          );

          // Apply custom fields if provided
          if (options.xhrFields) {
            for (i in options.xhrFields) {
              xhr[i] = options.xhrFields[i];
            }
          }

          // Override mime type if needed
          if (options.mimeType && xhr.overrideMimeType) {
            xhr.overrideMimeType(options.mimeType);
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if (!options.crossDomain && !headers["X-Requested-With"]) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }

          // Set headers
          for (i in headers) {
            xhr.setRequestHeader(i, headers[i]);
          }

          // Callback
          callback = function (type) {
            return function () {
              if (callback) {
                callback =
                  errorCallback =
                  xhr.onload =
                  xhr.onerror =
                  xhr.onabort =
                  xhr.ontimeout =
                  xhr.onreadystatechange =
                    null;

                if (type === "abort") {
                  xhr.abort();
                } else if (type === "error") {
                  // Support: IE <=9 only
                  // On a manual native abort, IE9 throws
                  // errors on any property access that is not readyState
                  if (typeof xhr.status !== "number") {
                    complete(0, "error");
                  } else {
                    complete(
                      // File: protocol always yields status 0; see #8605, #14207
                      xhr.status,
                      xhr.statusText
                    );
                  }
                } else {
                  complete(
                    xhrSuccessStatus[xhr.status] || xhr.status,
                    xhr.statusText,

                    // Support: IE <=9 only
                    // IE9 has no XHR2 but throws on binary (trac-11426)
                    // For XHR2 non-text, let the caller handle it (gh-2498)
                    (xhr.responseType || "text") !== "text" ||
                      typeof xhr.responseText !== "string"
                      ? { binary: xhr.response }
                      : { text: xhr.responseText },
                    xhr.getAllResponseHeaders()
                  );
                }
              }
            };
          };

          // Listen to events
          xhr.onload = callback();
          errorCallback = xhr.onerror = xhr.ontimeout = callback("error");

          // Support: IE 9 only
          // Use onreadystatechange to replace onabort
          // to handle uncaught aborts
          if (xhr.onabort !== undefined) {
            xhr.onabort = errorCallback;
          } else {
            xhr.onreadystatechange = function () {
              // Check readyState before timeout as it changes
              if (xhr.readyState === 4) {
                // Allow onerror to be called first,
                // but that will not handle a native abort
                // Also, save errorCallback to a variable
                // as xhr.onerror cannot be accessed
                window.setTimeout(function () {
                  if (callback) {
                    errorCallback();
                  }
                });
              }
            };
          }

          // Create the abort callback
          callback = callback("abort");

          try {
            // Do send the request (this may raise an exception)
            xhr.send((options.hasContent && options.data) || null);
          } catch (e) {
            // #14683: Only rethrow if this hasn't been notified as an error yet
            if (callback) {
              throw e;
            }
          }
        },

        abort: function () {
          if (callback) {
            callback();
          }
        },
      };
    }
  });

  // Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
  jQuery.ajaxPrefilter(function (s) {
    if (s.crossDomain) {
      s.contents.script = false;
    }
  });

  // Install script dataType
  jQuery.ajaxSetup({
    accepts: {
      script:
        "text/javascript, application/javascript, " +
        "application/ecmascript, application/x-ecmascript",
    },
    contents: {
      script: /\b(?:java|ecma)script\b/,
    },
    converters: {
      "text script": function (text) {
        jQuery.globalEval(text);
        return text;
      },
    },
  });

  // Handle cache's special case and crossDomain
  jQuery.ajaxPrefilter("script", function (s) {
    if (s.cache === undefined) {
      s.cache = false;
    }
    if (s.crossDomain) {
      s.type = "GET";
    }
  });

  // Bind script tag hack transport
  jQuery.ajaxTransport("script", function (s) {
    // This transport only deals with cross domain or forced-by-attrs requests
    if (s.crossDomain || s.scriptAttrs) {
      var script, callback;
      return {
        send: function (_, complete) {
          script = jQuery("<script>")
            .attr(s.scriptAttrs || {})
            .prop({ charset: s.scriptCharset, src: s.url })
            .on(
              "load error",
              (callback = function (evt) {
                script.remove();
                callback = null;
                if (evt) {
                  complete(evt.type === "error" ? 404 : 200, evt.type);
                }
              })
            );

          // Use native DOM manipulation to avoid our domManip AJAX trickery
          document.head.appendChild(script[0]);
        },
        abort: function () {
          if (callback) {
            callback();
          }
        },
      };
    }
  });

  var oldCallbacks = [],
    rjsonp = /(=)\?(?=&|$)|\?\?/;

  // Default jsonp settings
  jQuery.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function () {
      var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce.guid++;
      this[callback] = true;
      return callback;
    },
  });

  // Detect, normalize options and install callbacks for jsonp requests
  jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {
    var callbackName,
      overwritten,
      responseContainer,
      jsonProp =
        s.jsonp !== false &&
        (rjsonp.test(s.url)
          ? "url"
          : typeof s.data === "string" &&
            (s.contentType || "").indexOf(
              "application/x-www-form-urlencoded"
            ) === 0 &&
            rjsonp.test(s.data) &&
            "data");

    // Handle iff the expected data type is "jsonp" or we have a parameter to set
    if (jsonProp || s.dataTypes[0] === "jsonp") {
      // Get callback name, remembering preexisting value associated with it
      callbackName = s.jsonpCallback = isFunction(s.jsonpCallback)
        ? s.jsonpCallback()
        : s.jsonpCallback;

      // Insert callback into url or form data
      if (jsonProp) {
        s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
      } else if (s.jsonp !== false) {
        s.url +=
          (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
      }

      // Use data converter to retrieve json after script execution
      s.converters["script json"] = function () {
        if (!responseContainer) {
          jQuery.error(callbackName + " was not called");
        }
        return responseContainer[0];
      };

      // Force json dataType
      s.dataTypes[0] = "json";

      // Install callback
      overwritten = window[callbackName];
      window[callbackName] = function () {
        responseContainer = arguments;
      };

      // Clean-up function (fires after converters)
      jqXHR.always(function () {
        // If previous value didn't exist - remove it
        if (overwritten === undefined) {
          jQuery(window).removeProp(callbackName);

          // Otherwise restore preexisting value
        } else {
          window[callbackName] = overwritten;
        }

        // Save back as free
        if (s[callbackName]) {
          // Make sure that re-using the options doesn't screw things around
          s.jsonpCallback = originalSettings.jsonpCallback;

          // Save the callback name for future use
          oldCallbacks.push(callbackName);
        }

        // Call if it was a function and we have a response
        if (responseContainer && isFunction(overwritten)) {
          overwritten(responseContainer[0]);
        }

        responseContainer = overwritten = undefined;
      });

      // Delegate to script
      return "script";
    }
  });

  // Support: Safari 8 only
  // In Safari 8 documents created via document.implementation.createHTMLDocument
  // collapse sibling forms: the second one becomes a child of the first one.
  // Because of that, this security measure has to be disabled in Safari 8.
  // https://bugs.webkit.org/show_bug.cgi?id=137337
  support.createHTMLDocument = (function () {
    var body = document.implementation.createHTMLDocument("").body;
    body.innerHTML = "<form></form><form></form>";
    return body.childNodes.length === 2;
  })();

  // Argument "data" should be string of html
  // context (optional): If specified, the fragment will be created in this context,
  // defaults to document
  // keepScripts (optional): If true, will include scripts passed in the html string
  jQuery.parseHTML = function (data, context, keepScripts) {
    if (typeof data !== "string") {
      return [];
    }
    if (typeof context === "boolean") {
      keepScripts = context;
      context = false;
    }

    var base, parsed, scripts;

    if (!context) {
      // Stop scripts or inline event handlers from being executed immediately
      // by using document.implementation
      if (support.createHTMLDocument) {
        context = document.implementation.createHTMLDocument("");

        // Set the base href for the created document
        // so any parsed elements with URLs
        // are based on the document's URL (gh-2965)
        base = context.createElement("base");
        base.href = document.location.href;
        context.head.appendChild(base);
      } else {
        context = document;
      }
    }

    parsed = rsingleTag.exec(data);
    scripts = !keepScripts && [];

    // Single tag
    if (parsed) {
      return [context.createElement(parsed[1])];
    }

    parsed = buildFragment([data], context, scripts);

    if (scripts && scripts.length) {
      jQuery(scripts).remove();
    }

    return jQuery.merge([], parsed.childNodes);
  };

  /**
   * Load a url into a page
   */
  jQuery.fn.load = function (url, params, callback) {
    var selector,
      type,
      response,
      self = this,
      off = url.indexOf(" ");

    if (off > -1) {
      selector = stripAndCollapse(url.slice(off));
      url = url.slice(0, off);
    }

    // If it's a function
    if (isFunction(params)) {
      // We assume that it's the callback
      callback = params;
      params = undefined;

      // Otherwise, build a param string
    } else if (params && typeof params === "object") {
      type = "POST";
    }

    // If we have elements to modify, make the request
    if (self.length > 0) {
      jQuery
        .ajax({
          url: url,

          // If "type" variable is undefined, then "GET" method will be used.
          // Make value of this field explicit since
          // user can override it through ajaxSetup method
          type: type || "GET",
          dataType: "html",
          data: params,
        })
        .done(function (responseText) {
          // Save response for use in complete callback
          response = arguments;

          self.html(
            selector
              ? // If a selector was specified, locate the right elements in a dummy div
                // Exclude scripts to avoid IE 'Permission Denied' errors
                jQuery("<div>")
                  .append(jQuery.parseHTML(responseText))
                  .find(selector)
              : // Otherwise use the full result
                responseText
          );

          // If the request succeeds, this function gets "data", "status", "jqXHR"
          // but they are ignored because response was set above.
          // If it fails, this function gets "jqXHR", "status", "error"
        })
        .always(
          callback &&
            function (jqXHR, status) {
              self.each(function () {
                callback.apply(
                  this,
                  response || [jqXHR.responseText, status, jqXHR]
                );
              });
            }
        );
    }

    return this;
  };

  jQuery.expr.pseudos.animated = function (elem) {
    return jQuery.grep(jQuery.timers, function (fn) {
      return elem === fn.elem;
    }).length;
  };

  jQuery.offset = {
    setOffset: function (elem, options, i) {
      var curPosition,
        curLeft,
        curCSSTop,
        curTop,
        curOffset,
        curCSSLeft,
        calculatePosition,
        position = jQuery.css(elem, "position"),
        curElem = jQuery(elem),
        props = {};

      // Set position first, in-case top/left are set even on static elem
      if (position === "static") {
        elem.style.position = "relative";
      }

      curOffset = curElem.offset();
      curCSSTop = jQuery.css(elem, "top");
      curCSSLeft = jQuery.css(elem, "left");
      calculatePosition =
        (position === "absolute" || position === "fixed") &&
        (curCSSTop + curCSSLeft).indexOf("auto") > -1;

      // Need to be able to calculate position if either
      // top or left is auto and position is either absolute or fixed
      if (calculatePosition) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;
      } else {
        curTop = parseFloat(curCSSTop) || 0;
        curLeft = parseFloat(curCSSLeft) || 0;
      }

      if (isFunction(options)) {
        // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
        options = options.call(elem, i, jQuery.extend({}, curOffset));
      }

      if (options.top != null) {
        props.top = options.top - curOffset.top + curTop;
      }
      if (options.left != null) {
        props.left = options.left - curOffset.left + curLeft;
      }

      if ("using" in options) {
        options.using.call(elem, props);
      } else {
        if (typeof props.top === "number") {
          props.top += "px";
        }
        if (typeof props.left === "number") {
          props.left += "px";
        }
        curElem.css(props);
      }
    },
  };

  jQuery.fn.extend({
    // offset() relates an element's border box to the document origin
    offset: function (options) {
      // Preserve chaining for setter
      if (arguments.length) {
        return options === undefined
          ? this
          : this.each(function (i) {
              jQuery.offset.setOffset(this, options, i);
            });
      }

      var rect,
        win,
        elem = this[0];

      if (!elem) {
        return;
      }

      // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
      // Support: IE <=11 only
      // Running getBoundingClientRect on a
      // disconnected node in IE throws an error
      if (!elem.getClientRects().length) {
        return { top: 0, left: 0 };
      }

      // Get document-relative position by adding viewport scroll to viewport-relative gBCR
      rect = elem.getBoundingClientRect();
      win = elem.ownerDocument.defaultView;
      return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset,
      };
    },

    // position() relates an element's margin box to its offset parent's padding box
    // This corresponds to the behavior of CSS absolute positioning
    position: function () {
      if (!this[0]) {
        return;
      }

      var offsetParent,
        offset,
        doc,
        elem = this[0],
        parentOffset = { top: 0, left: 0 };

      // position:fixed elements are offset from the viewport, which itself always has zero offset
      if (jQuery.css(elem, "position") === "fixed") {
        // Assume position:fixed implies availability of getBoundingClientRect
        offset = elem.getBoundingClientRect();
      } else {
        offset = this.offset();

        // Account for the *real* offset parent, which can be the document or its root element
        // when a statically positioned element is identified
        doc = elem.ownerDocument;
        offsetParent = elem.offsetParent || doc.documentElement;
        while (
          offsetParent &&
          (offsetParent === doc.body || offsetParent === doc.documentElement) &&
          jQuery.css(offsetParent, "position") === "static"
        ) {
          offsetParent = offsetParent.parentNode;
        }
        if (
          offsetParent &&
          offsetParent !== elem &&
          offsetParent.nodeType === 1
        ) {
          // Incorporate borders into its offset, since they are outside its content origin
          parentOffset = jQuery(offsetParent).offset();
          parentOffset.top += jQuery.css(offsetParent, "borderTopWidth", true);
          parentOffset.left += jQuery.css(
            offsetParent,
            "borderLeftWidth",
            true
          );
        }
      }

      // Subtract parent offsets and element margins
      return {
        top:
          offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
        left:
          offset.left -
          parentOffset.left -
          jQuery.css(elem, "marginLeft", true),
      };
    },

    // This method will return documentElement in the following cases:
    // 1) For the element inside the iframe without offsetParent, this method will return
    //    documentElement of the parent window
    // 2) For the hidden or detached element
    // 3) For body or html element, i.e. in case of the html node - it will return itself
    //
    // but those exceptions were never presented as a real life use-cases
    // and might be considered as more preferable results.
    //
    // This logic, however, is not guaranteed and can change at any point in the future
    offsetParent: function () {
      return this.map(function () {
        var offsetParent = this.offsetParent;

        while (
          offsetParent &&
          jQuery.css(offsetParent, "position") === "static"
        ) {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent || documentElement;
      });
    },
  });

  // Create scrollLeft and scrollTop methods
  jQuery.each(
    { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" },
    function (method, prop) {
      var top = "pageYOffset" === prop;

      jQuery.fn[method] = function (val) {
        return access(
          this,
          function (elem, method, val) {
            // Coalesce documents and windows
            var win;
            if (isWindow(elem)) {
              win = elem;
            } else if (elem.nodeType === 9) {
              win = elem.defaultView;
            }

            if (val === undefined) {
              return win ? win[prop] : elem[method];
            }

            if (win) {
              win.scrollTo(
                !top ? val : win.pageXOffset,
                top ? val : win.pageYOffset
              );
            } else {
              elem[method] = val;
            }
          },
          method,
          val,
          arguments.length
        );
      };
    }
  );

  // Support: Safari <=7 - 9.1, Chrome <=37 - 49
  // Add the top/left cssHooks using jQuery.fn.position
  // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
  // Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
  // getComputedStyle returns percent when specified for top/left/bottom/right;
  // rather than make the css module depend on the offset module, just check for it here
  jQuery.each(["top", "left"], function (_i, prop) {
    jQuery.cssHooks[prop] = addGetHookIf(
      support.pixelPosition,
      function (elem, computed) {
        if (computed) {
          computed = curCSS(elem, prop);

          // If curCSS returns percentage, fallback to offset
          return rnumnonpx.test(computed)
            ? jQuery(elem).position()[prop] + "px"
            : computed;
        }
      }
    );
  });

  // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
  jQuery.each({ Height: "height", Width: "width" }, function (name, type) {
    jQuery.each(
      { padding: "inner" + name, content: type, "": "outer" + name },
      function (defaultExtra, funcName) {
        // Margin is only for outerHeight, outerWidth
        jQuery.fn[funcName] = function (margin, value) {
          var chainable =
              arguments.length && (defaultExtra || typeof margin !== "boolean"),
            extra =
              defaultExtra ||
              (margin === true || value === true ? "margin" : "border");

          return access(
            this,
            function (elem, type, value) {
              var doc;

              if (isWindow(elem)) {
                // $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
                return funcName.indexOf("outer") === 0
                  ? elem["inner" + name]
                  : elem.document.documentElement["client" + name];
              }

              // Get document width or height
              if (elem.nodeType === 9) {
                doc = elem.documentElement;

                // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                // whichever is greatest
                return Math.max(
                  elem.body["scroll" + name],
                  doc["scroll" + name],
                  elem.body["offset" + name],
                  doc["offset" + name],
                  doc["client" + name]
                );
              }

              return value === undefined
                ? // Get width or height on the element, requesting but not forcing parseFloat
                  jQuery.css(elem, type, extra)
                : // Set width or height on the element
                  jQuery.style(elem, type, value, extra);
            },
            type,
            chainable ? margin : undefined,
            chainable
          );
        };
      }
    );
  });

  jQuery.each(
    [
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend",
    ],
    function (_i, type) {
      jQuery.fn[type] = function (fn) {
        return this.on(type, fn);
      };
    }
  );

  jQuery.fn.extend({
    bind: function (types, data, fn) {
      return this.on(types, null, data, fn);
    },
    unbind: function (types, fn) {
      return this.off(types, null, fn);
    },

    delegate: function (selector, types, data, fn) {
      return this.on(types, selector, data, fn);
    },
    undelegate: function (selector, types, fn) {
      // ( namespace ) or ( selector, types [, fn] )
      return arguments.length === 1
        ? this.off(selector, "**")
        : this.off(types, selector || "**", fn);
    },

    hover: function (fnOver, fnOut) {
      return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    },
  });

  jQuery.each(
    (
      "blur focus focusin focusout resize scroll click dblclick " +
      "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
      "change select submit keydown keypress keyup contextmenu"
    ).split(" "),
    function (_i, name) {
      // Handle event binding
      jQuery.fn[name] = function (data, fn) {
        return arguments.length > 0
          ? this.on(name, null, data, fn)
          : this.trigger(name);
      };
    }
  );

  // Support: Android <=4.0 only
  // Make sure we trim BOM and NBSP
  var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

  // Bind a function to a context, optionally partially applying any
  // arguments.
  // jQuery.proxy is deprecated to promote standards (specifically Function#bind)
  // However, it is not slated for removal any time soon
  jQuery.proxy = function (fn, context) {
    var tmp, args, proxy;

    if (typeof context === "string") {
      tmp = fn[context];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if (!isFunction(fn)) {
      return undefined;
    }

    // Simulated bind
    args = slice.call(arguments, 2);
    proxy = function () {
      return fn.apply(context || this, args.concat(slice.call(arguments)));
    };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    return proxy;
  };

  jQuery.holdReady = function (hold) {
    if (hold) {
      jQuery.readyWait++;
    } else {
      jQuery.ready(true);
    }
  };
  jQuery.isArray = Array.isArray;
  jQuery.parseJSON = JSON.parse;
  jQuery.nodeName = nodeName;
  jQuery.isFunction = isFunction;
  jQuery.isWindow = isWindow;
  jQuery.camelCase = camelCase;
  jQuery.type = toType;

  jQuery.now = Date.now;

  jQuery.isNumeric = function (obj) {
    // As of jQuery 3.0, isNumeric is limited to
    // strings and numbers (primitives or objects)
    // that can be coerced to finite numbers (gh-2662)
    var type = jQuery.type(obj);
    return (
      (type === "number" || type === "string") &&
      // parseFloat NaNs numeric-cast false positives ("")
      // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
      // subtraction forces infinities to NaN
      !isNaN(obj - parseFloat(obj))
    );
  };

  jQuery.trim = function (text) {
    return text == null ? "" : (text + "").replace(rtrim, "");
  };

  // Register as a named AMD module, since jQuery can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase jquery is used because AMD module names are
  // derived from file names, and jQuery is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of jQuery, it will work.

  // Note that for maximum portability, libraries that are not jQuery should
  // declare themselves as anonymous modules, and avoid setting a global if an
  // AMD loader is present. jQuery is a special case. For more information, see
  // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

  if (typeof define === "function" && define.amd) {
    define("jquery", [], function () {
      return jQuery;
    });
  }

  var // Map over jQuery in case of overwrite
    _jQuery = window.jQuery,
    // Map over the $ in case of overwrite
    _$ = window.$;

  jQuery.noConflict = function (deep) {
    if (window.$ === jQuery) {
      window.$ = _$;
    }

    if (deep && window.jQuery === jQuery) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  };

  // Expose jQuery and $ identifiers, even in AMD
  // (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
  // and CommonJS for browser emulators (#13566)
  if (typeof noGlobal === "undefined") {
    window.jQuery = window.$ = jQuery;
  }

  return jQuery;
});

/*! jQuery UI - v1.11.4 - 2016-03-02
 * http://jqueryui.com
 * Includes: core.js, widget.js, mouse.js, draggable.js, droppable.js, sortable.js, effect.js, effect-slide.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  /*!
   * jQuery UI Core 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/category/ui-core/
   */

  // $.ui might exist from components with no dependencies, e.g., $.ui.position
  $.ui = $.ui || {};

  $.extend($.ui, {
    version: "1.11.4",

    keyCode: {
      BACKSPACE: 8,
      COMMA: 188,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      TAB: 9,
      UP: 38,
    },
  });

  // plugins
  $.fn.extend({
    scrollParent: function (includeHidden) {
      var position = this.css("position"),
        excludeStaticParent = position === "absolute",
        overflowRegex = includeHidden
          ? /(auto|scroll|hidden)/
          : /(auto|scroll)/,
        scrollParent = this.parents()
          .filter(function () {
            var parent = $(this);
            if (excludeStaticParent && parent.css("position") === "static") {
              return false;
            }
            return overflowRegex.test(
              parent.css("overflow") +
                parent.css("overflow-y") +
                parent.css("overflow-x")
            );
          })
          .eq(0);

      return position === "fixed" || !scrollParent.length
        ? $(this[0].ownerDocument || document)
        : scrollParent;
    },

    uniqueId: (function () {
      var uuid = 0;

      return function () {
        return this.each(function () {
          if (!this.id) {
            this.id = "ui-id-" + ++uuid;
          }
        });
      };
    })(),

    removeUniqueId: function () {
      return this.each(function () {
        if (/^ui-id-\d+$/.test(this.id)) {
          $(this).removeAttr("id");
        }
      });
    },
  });

  // selectors
  function focusable(element, isTabIndexNotNaN) {
    var map,
      mapName,
      img,
      nodeName = element.nodeName.toLowerCase();
    if ("area" === nodeName) {
      map = element.parentNode;
      mapName = map.name;
      if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }
      img = $("img[usemap='#" + mapName + "']")[0];
      return !!img && visible(img);
    }
    return (
      (/^(input|select|textarea|button|object)$/.test(nodeName)
        ? !element.disabled
        : "a" === nodeName
        ? element.href || isTabIndexNotNaN
        : isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible(element)
    );
  }

  function visible(element) {
    return (
      $.expr.filters.visible(element) &&
      !$(element)
        .parents()
        .addBack()
        .filter(function () {
          return $.css(this, "visibility") === "hidden";
        }).length
    );
  }

  $.extend($.expr[":"], {
    data: $.expr.createPseudo
      ? $.expr.createPseudo(function (dataName) {
          return function (elem) {
            return !!$.data(elem, dataName);
          };
        })
      : // support: jQuery <1.8
        function (elem, i, match) {
          return !!$.data(elem, match[3]);
        },

    focusable: function (element) {
      return focusable(element, !isNaN($.attr(element, "tabindex")));
    },

    tabbable: function (element) {
      var tabIndex = $.attr(element, "tabindex"),
        isTabIndexNaN = isNaN(tabIndex);
      return (
        (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN)
      );
    },
  });

  // support: jQuery <1.8
  if (!$("<a>").outerWidth(1).jquery) {
    $.each(["Width", "Height"], function (i, name) {
      var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
        type = name.toLowerCase(),
        orig = {
          innerWidth: $.fn.innerWidth,
          innerHeight: $.fn.innerHeight,
          outerWidth: $.fn.outerWidth,
          outerHeight: $.fn.outerHeight,
        };

      function reduce(elem, size, border, margin) {
        $.each(side, function () {
          size -= parseFloat($.css(elem, "padding" + this)) || 0;
          if (border) {
            size -= parseFloat($.css(elem, "border" + this + "Width")) || 0;
          }
          if (margin) {
            size -= parseFloat($.css(elem, "margin" + this)) || 0;
          }
        });
        return size;
      }

      $.fn["inner" + name] = function (size) {
        if (size === undefined) {
          return orig["inner" + name].call(this);
        }

        return this.each(function () {
          $(this).css(type, reduce(this, size) + "px");
        });
      };

      $.fn["outer" + name] = function (size, margin) {
        if (typeof size !== "number") {
          return orig["outer" + name].call(this, size);
        }

        return this.each(function () {
          $(this).css(type, reduce(this, size, true, margin) + "px");
        });
      };
    });
  }

  // support: jQuery <1.8
  if (!$.fn.addBack) {
    $.fn.addBack = function (selector) {
      return this.add(
        selector == null ? this.prevObject : this.prevObject.filter(selector)
      );
    };
  }

  // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
  if ($("<a>").data("a-b", "a").removeData("a-b").data("a-b")) {
    $.fn.removeData = (function (removeData) {
      return function (key) {
        if (arguments.length) {
          return removeData.call(this, $.camelCase(key));
        } else {
          return removeData.call(this);
        }
      };
    })($.fn.removeData);
  }

  // deprecated
  $.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());

  $.fn.extend({
    focus: (function (orig) {
      return function (delay, fn) {
        return typeof delay === "number"
          ? this.each(function () {
              var elem = this;
              setTimeout(function () {
                $(elem).focus();
                if (fn) {
                  fn.call(elem);
                }
              }, delay);
            })
          : orig.apply(this, arguments);
      };
    })($.fn.focus),

    disableSelection: (function () {
      var eventType =
        "onselectstart" in document.createElement("div")
          ? "selectstart"
          : "mousedown";

      return function () {
        return this.bind(eventType + ".ui-disableSelection", function (event) {
          event.preventDefault();
        });
      };
    })(),

    enableSelection: function () {
      return this.unbind(".ui-disableSelection");
    },

    zIndex: function (zIndex) {
      if (zIndex !== undefined) {
        return this.css("zIndex", zIndex);
      }

      if (this.length) {
        var elem = $(this[0]),
          position,
          value;
        while (elem.length && elem[0] !== document) {
          // Ignore z-index if position is set to a value where z-index is ignored by the browser
          // This makes behavior of this function consistent across browsers
          // WebKit always returns auto if the element is positioned
          position = elem.css("position");
          if (
            position === "absolute" ||
            position === "relative" ||
            position === "fixed"
          ) {
            // IE returns 0 when zIndex is not specified
            // other browsers return a string
            // we ignore the case of nested elements with an explicit value of 0
            // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
            value = parseInt(elem.css("zIndex"), 10);
            if (!isNaN(value) && value !== 0) {
              return value;
            }
          }
          elem = elem.parent();
        }
      }

      return 0;
    },
  });

  // $.ui.plugin is deprecated. Use $.widget() extensions instead.
  $.ui.plugin = {
    add: function (module, option, set) {
      var i,
        proto = $.ui[module].prototype;
      for (i in set) {
        proto.plugins[i] = proto.plugins[i] || [];
        proto.plugins[i].push([option, set[i]]);
      }
    },
    call: function (instance, name, args, allowDisconnected) {
      var i,
        set = instance.plugins[name];

      if (!set) {
        return;
      }

      if (
        !allowDisconnected &&
        (!instance.element[0].parentNode ||
          instance.element[0].parentNode.nodeType === 11)
      ) {
        return;
      }

      for (i = 0; i < set.length; i++) {
        if (instance.options[set[i][0]]) {
          set[i][1].apply(instance.element, args);
        }
      }
    },
  };

  /*!
   * jQuery UI Widget 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/jQuery.widget/
   */

  var widget_uuid = 0,
    widget_slice = Array.prototype.slice;

  $.cleanData = (function (orig) {
    return function (elems) {
      var events, elem, i;
      for (i = 0; (elem = elems[i]) != null; i++) {
        try {
          // Only trigger remove when necessary to save time
          events = $._data(elem, "events");
          if (events && events.remove) {
            $(elem).triggerHandler("remove");
          }

          // http://bugs.jquery.com/ticket/8235
        } catch (e) {}
      }
      orig(elems);
    };
  })($.cleanData);

  $.widget = function (name, base, prototype) {
    var fullName,
      existingConstructor,
      constructor,
      basePrototype,
      // proxiedPrototype allows the provided prototype to remain unmodified
      // so that it can be used as a mixin for multiple widgets (#8876)
      proxiedPrototype = {},
      namespace = name.split(".")[0];

    name = name.split(".")[1];
    fullName = namespace + "-" + name;

    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }

    // create selector for plugin
    $.expr[":"][fullName.toLowerCase()] = function (elem) {
      return !!$.data(elem, fullName);
    };

    $[namespace] = $[namespace] || {};
    existingConstructor = $[namespace][name];
    constructor = $[namespace][name] = function (options, element) {
      // allow instantiation without "new" keyword
      if (!this._createWidget) {
        return new constructor(options, element);
      }

      // allow instantiation without initializing for simple inheritance
      // must use "new" keyword (the code above always passes args)
      if (arguments.length) {
        this._createWidget(options, element);
      }
    };
    // extend with the existing constructor to carry over any static properties
    $.extend(constructor, existingConstructor, {
      version: prototype.version,
      // copy the object used to create the prototype in case we need to
      // redefine the widget later
      _proto: $.extend({}, prototype),
      // track widgets that inherit from this widget in case this widget is
      // redefined after a widget inherits from it
      _childConstructors: [],
    });

    basePrototype = new base();
    // we need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, function (prop, value) {
      if (!$.isFunction(value)) {
        proxiedPrototype[prop] = value;
        return;
      }
      proxiedPrototype[prop] = (function () {
        var _super = function () {
            return base.prototype[prop].apply(this, arguments);
          },
          _superApply = function (args) {
            return base.prototype[prop].apply(this, args);
          };
        return function () {
          var __super = this._super,
            __superApply = this._superApply,
            returnValue;

          this._super = _super;
          this._superApply = _superApply;

          returnValue = value.apply(this, arguments);

          this._super = __super;
          this._superApply = __superApply;

          return returnValue;
        };
      })();
    });
    constructor.prototype = $.widget.extend(
      basePrototype,
      {
        // TODO: remove support for widgetEventPrefix
        // always use the name + a colon as the prefix, e.g., draggable:start
        // don't prefix for widgets that aren't DOM-based
        widgetEventPrefix: existingConstructor
          ? basePrototype.widgetEventPrefix || name
          : name,
      },
      proxiedPrototype,
      {
        constructor: constructor,
        namespace: namespace,
        widgetName: name,
        widgetFullName: fullName,
      }
    );

    // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.
    if (existingConstructor) {
      $.each(existingConstructor._childConstructors, function (i, child) {
        var childPrototype = child.prototype;

        // redefine the child widget using the same prototype that was
        // originally used, but inherit from the new version of the base
        $.widget(
          childPrototype.namespace + "." + childPrototype.widgetName,
          constructor,
          child._proto
        );
      });
      // remove the list of existing child constructors from the old constructor
      // so the old child constructors can be garbage collected
      delete existingConstructor._childConstructors;
    } else {
      base._childConstructors.push(constructor);
    }

    $.widget.bridge(name, constructor);

    return constructor;
  };

  $.widget.extend = function (target) {
    var input = widget_slice.call(arguments, 1),
      inputIndex = 0,
      inputLength = input.length,
      key,
      value;
    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[inputIndex]) {
        value = input[inputIndex][key];
        if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
          // Clone objects
          if ($.isPlainObject(value)) {
            target[key] = $.isPlainObject(target[key])
              ? $.widget.extend({}, target[key], value)
              : // Don't extend strings, arrays, etc. with objects
                $.widget.extend({}, value);
            // Copy everything else by reference
          } else {
            target[key] = value;
          }
        }
      }
    }
    return target;
  };

  $.widget.bridge = function (name, object) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[name] = function (options) {
      var isMethodCall = typeof options === "string",
        args = widget_slice.call(arguments, 1),
        returnValue = this;

      if (isMethodCall) {
        this.each(function () {
          var methodValue,
            instance = $.data(this, fullName);
          if (options === "instance") {
            returnValue = instance;
            return false;
          }
          if (!instance) {
            return $.error(
              "cannot call methods on " +
                name +
                " prior to initialization; " +
                "attempted to call method '" +
                options +
                "'"
            );
          }
          if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
            return $.error(
              "no such method '" +
                options +
                "' for " +
                name +
                " widget instance"
            );
          }
          methodValue = instance[options].apply(instance, args);
          if (methodValue !== instance && methodValue !== undefined) {
            returnValue =
              methodValue && methodValue.jquery
                ? returnValue.pushStack(methodValue.get())
                : methodValue;
            return false;
          }
        });
      } else {
        // Allow multiple hashes to be passed on init
        if (args.length) {
          options = $.widget.extend.apply(null, [options].concat(args));
        }

        this.each(function () {
          var instance = $.data(this, fullName);
          if (instance) {
            instance.option(options || {});
            if (instance._init) {
              instance._init();
            }
          } else {
            $.data(this, fullName, new object(options, this));
          }
        });
      }

      return returnValue;
    };
  };

  $.Widget = function (/* options, element */) {};
  $.Widget._childConstructors = [];

  $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      disabled: false,

      // callbacks
      create: null,
    },
    _createWidget: function (options, element) {
      element = $(element || this.defaultElement || this)[0];
      this.element = $(element);
      this.uuid = widget_uuid++;
      this.eventNamespace = "." + this.widgetName + this.uuid;

      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();

      if (element !== this) {
        $.data(element, this.widgetFullName, this);
        this._on(true, this.element, {
          remove: function (event) {
            if (event.target === element) {
              this.destroy();
            }
          },
        });
        this.document = $(
          element.style
            ? // element within the document
              element.ownerDocument
            : // element is window or document
              element.document || element
        );
        this.window = $(
          this.document[0].defaultView || this.document[0].parentWindow
        );
      }

      this.options = $.widget.extend(
        {},
        this.options,
        this._getCreateOptions(),
        options
      );

      this._create();
      this._trigger("create", null, this._getCreateEventData());
      this._init();
    },
    _getCreateOptions: $.noop,
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,

    destroy: function () {
      this._destroy();
      // we can probably remove the unbind calls in 2.0
      // all event bindings should go through this._on()
      this.element
        .unbind(this.eventNamespace)
        .removeData(this.widgetFullName)
        // support: jquery <1.6.3
        // http://bugs.jquery.com/ticket/9413
        .removeData($.camelCase(this.widgetFullName));
      this.widget()
        .unbind(this.eventNamespace)
        .removeAttr("aria-disabled")
        .removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled");

      // clean up events and states
      this.bindings.unbind(this.eventNamespace);
      this.hoverable.removeClass("ui-state-hover");
      this.focusable.removeClass("ui-state-focus");
    },
    _destroy: $.noop,

    widget: function () {
      return this.element;
    },

    option: function (key, value) {
      var options = key,
        parts,
        curOption,
        i;

      if (arguments.length === 0) {
        // don't return a reference to the internal hash
        return $.widget.extend({}, this.options);
      }

      if (typeof key === "string") {
        // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        options = {};
        parts = key.split(".");
        key = parts.shift();
        if (parts.length) {
          curOption = options[key] = $.widget.extend({}, this.options[key]);
          for (i = 0; i < parts.length - 1; i++) {
            curOption[parts[i]] = curOption[parts[i]] || {};
            curOption = curOption[parts[i]];
          }
          key = parts.pop();
          if (arguments.length === 1) {
            return curOption[key] === undefined ? null : curOption[key];
          }
          curOption[key] = value;
        } else {
          if (arguments.length === 1) {
            return this.options[key] === undefined ? null : this.options[key];
          }
          options[key] = value;
        }
      }

      this._setOptions(options);

      return this;
    },
    _setOptions: function (options) {
      var key;

      for (key in options) {
        this._setOption(key, options[key]);
      }

      return this;
    },
    _setOption: function (key, value) {
      this.options[key] = value;

      if (key === "disabled") {
        this.widget().toggleClass(this.widgetFullName + "-disabled", !!value);

        // If the widget is becoming disabled, then nothing is interactive
        if (value) {
          this.hoverable.removeClass("ui-state-hover");
          this.focusable.removeClass("ui-state-focus");
        }
      }

      return this;
    },

    enable: function () {
      return this._setOptions({ disabled: false });
    },
    disable: function () {
      return this._setOptions({ disabled: true });
    },

    _on: function (suppressDisabledCheck, element, handlers) {
      var delegateElement,
        instance = this;

      // no suppressDisabledCheck flag, shuffle arguments
      if (typeof suppressDisabledCheck !== "boolean") {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }

      // no element argument, shuffle and use this.element
      if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
      }

      $.each(handlers, function (event, handler) {
        function handlerProxy() {
          // allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if (
            !suppressDisabledCheck &&
            (instance.options.disabled === true ||
              $(this).hasClass("ui-state-disabled"))
          ) {
            return;
          }
          return (
            typeof handler === "string" ? instance[handler] : handler
          ).apply(instance, arguments);
        }

        // copy the guid so direct unbinding works
        if (typeof handler !== "string") {
          handlerProxy.guid = handler.guid =
            handler.guid || handlerProxy.guid || $.guid++;
        }

        var match = event.match(/^([\w:-]*)\s*(.*)$/),
          eventName = match[1] + instance.eventNamespace,
          selector = match[2];
        if (selector) {
          delegateElement.delegate(selector, eventName, handlerProxy);
        } else {
          element.bind(eventName, handlerProxy);
        }
      });
    },

    _off: function (element, eventName) {
      eventName =
        (eventName || "").split(" ").join(this.eventNamespace + " ") +
        this.eventNamespace;
      element.unbind(eventName).undelegate(eventName);

      // Clear the stack to avoid memory leaks (#10056)
      this.bindings = $(this.bindings.not(element).get());
      this.focusable = $(this.focusable.not(element).get());
      this.hoverable = $(this.hoverable.not(element).get());
    },

    _delay: function (handler, delay) {
      function handlerProxy() {
        return (
          typeof handler === "string" ? instance[handler] : handler
        ).apply(instance, arguments);
      }
      var instance = this;
      return setTimeout(handlerProxy, delay || 0);
    },

    _hoverable: function (element) {
      this.hoverable = this.hoverable.add(element);
      this._on(element, {
        mouseenter: function (event) {
          $(event.currentTarget).addClass("ui-state-hover");
        },
        mouseleave: function (event) {
          $(event.currentTarget).removeClass("ui-state-hover");
        },
      });
    },

    _focusable: function (element) {
      this.focusable = this.focusable.add(element);
      this._on(element, {
        focusin: function (event) {
          $(event.currentTarget).addClass("ui-state-focus");
        },
        focusout: function (event) {
          $(event.currentTarget).removeClass("ui-state-focus");
        },
      });
    },

    _trigger: function (type, event, data) {
      var prop,
        orig,
        callback = this.options[type];

      data = data || {};
      event = $.Event(event);
      event.type = (
        type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type
      ).toLowerCase();
      // the original event may come from any element
      // so we need to reset the target on the new event
      event.target = this.element[0];

      // copy original event properties over to the new event
      orig = event.originalEvent;
      if (orig) {
        for (prop in orig) {
          if (!(prop in event)) {
            event[prop] = orig[prop];
          }
        }
      }

      this.element.trigger(event, data);
      return !(
        ($.isFunction(callback) &&
          callback.apply(this.element[0], [event].concat(data)) === false) ||
        event.isDefaultPrevented()
      );
    },
  };

  $.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
    $.Widget.prototype["_" + method] = function (element, options, callback) {
      if (typeof options === "string") {
        options = { effect: options };
      }
      var hasOptions,
        effectName = !options
          ? method
          : options === true || typeof options === "number"
          ? defaultEffect
          : options.effect || defaultEffect;
      options = options || {};
      if (typeof options === "number") {
        options = { duration: options };
      }
      hasOptions = !$.isEmptyObject(options);
      options.complete = callback;
      if (options.delay) {
        element.delay(options.delay);
      }
      if (hasOptions && $.effects && $.effects.effect[effectName]) {
        element[method](options);
      } else if (effectName !== method && element[effectName]) {
        element[effectName](options.duration, options.easing, callback);
      } else {
        element.queue(function (next) {
          $(this)[method]();
          if (callback) {
            callback.call(element[0]);
          }
          next();
        });
      }
    };
  });

  var widget = $.widget;

  /*!
   * jQuery UI Mouse 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/mouse/
   */

  var mouseHandled = false;
  $(document).mouseup(function () {
    mouseHandled = false;
  });

  var mouse = $.widget("ui.mouse", {
    version: "1.11.4",
    options: {
      cancel: "input,textarea,button,select,option",
      distance: 1,
      delay: 0,
    },
    _mouseInit: function () {
      var that = this;

      this.element
        .bind("mousedown." + this.widgetName, function (event) {
          return that._mouseDown(event);
        })
        .bind("click." + this.widgetName, function (event) {
          if (
            true ===
            $.data(event.target, that.widgetName + ".preventClickEvent")
          ) {
            $.removeData(event.target, that.widgetName + ".preventClickEvent");
            event.stopImmediatePropagation();
            return false;
          }
        });

      this.started = false;
    },

    // TODO: make sure destroying one instance of mouse doesn't mess with
    // other instances of mouse
    _mouseDestroy: function () {
      this.element.unbind("." + this.widgetName);
      if (this._mouseMoveDelegate) {
        this.document
          .unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
          .unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
      }
    },

    _mouseDown: function (event) {
      // don't let more than one widget handle mouseStart
      if (mouseHandled) {
        return;
      }

      this._mouseMoved = false;

      // we may have missed mouseup (out of window)
      this._mouseStarted && this._mouseUp(event);

      this._mouseDownEvent = event;

      var that = this,
        btnIsLeft = event.which === 1,
        // event.target.nodeName works around a bug in IE 8 with
        // disabled inputs (#7620)
        elIsCancel =
          typeof this.options.cancel === "string" && event.target.nodeName
            ? $(event.target).closest(this.options.cancel).length
            : false;
      if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
        return true;
      }

      this.mouseDelayMet = !this.options.delay;
      if (!this.mouseDelayMet) {
        this._mouseDelayTimer = setTimeout(function () {
          that.mouseDelayMet = true;
        }, this.options.delay);
      }

      if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        this._mouseStarted = this._mouseStart(event) !== false;
        if (!this._mouseStarted) {
          event.preventDefault();
          return true;
        }
      }

      // Click event may never have fired (Gecko & Opera)
      if (
        true === $.data(event.target, this.widgetName + ".preventClickEvent")
      ) {
        $.removeData(event.target, this.widgetName + ".preventClickEvent");
      }

      // these delegates are required to keep context
      this._mouseMoveDelegate = function (event) {
        return that._mouseMove(event);
      };
      this._mouseUpDelegate = function (event) {
        return that._mouseUp(event);
      };

      this.document
        .bind("mousemove." + this.widgetName, this._mouseMoveDelegate)
        .bind("mouseup." + this.widgetName, this._mouseUpDelegate);

      event.preventDefault();

      mouseHandled = true;
      return true;
    },

    _mouseMove: function (event) {
      // Only check for mouseups outside the document if you've moved inside the document
      // at least once. This prevents the firing of mouseup in the case of IE<9, which will
      // fire a mousemove event if content is placed under the cursor. See #7778
      // Support: IE <9
      if (this._mouseMoved) {
        // IE mouseup check - mouseup happened when mouse was out of window
        if (
          $.ui.ie &&
          (!document.documentMode || document.documentMode < 9) &&
          !event.button
        ) {
          return this._mouseUp(event);

          // Iframe mouseup check - mouseup occurred in another document
        } else if (!event.which) {
          return this._mouseUp(event);
        }
      }

      if (event.which || event.button) {
        this._mouseMoved = true;
      }

      if (this._mouseStarted) {
        this._mouseDrag(event);
        return event.preventDefault();
      }

      if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        this._mouseStarted =
          this._mouseStart(this._mouseDownEvent, event) !== false;
        this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event);
      }

      return !this._mouseStarted;
    },

    _mouseUp: function (event) {
      this.document
        .unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
        .unbind("mouseup." + this.widgetName, this._mouseUpDelegate);

      if (this._mouseStarted) {
        this._mouseStarted = false;

        if (event.target === this._mouseDownEvent.target) {
          $.data(event.target, this.widgetName + ".preventClickEvent", true);
        }

        this._mouseStop(event);
      }

      mouseHandled = false;
      return false;
    },

    _mouseDistanceMet: function (event) {
      return (
        Math.max(
          Math.abs(this._mouseDownEvent.pageX - event.pageX),
          Math.abs(this._mouseDownEvent.pageY - event.pageY)
        ) >= this.options.distance
      );
    },

    _mouseDelayMet: function (/* event */) {
      return this.mouseDelayMet;
    },

    // These are placeholder methods, to be overriden by extending plugin
    _mouseStart: function (/* event */) {},
    _mouseDrag: function (/* event */) {},
    _mouseStop: function (/* event */) {},
    _mouseCapture: function (/* event */) {
      return true;
    },
  });

  /*!
   * jQuery UI Draggable 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/draggable/
   */

  $.widget("ui.draggable", $.ui.mouse, {
    version: "1.11.4",
    widgetEventPrefix: "drag",
    options: {
      addClasses: true,
      appendTo: "parent",
      axis: false,
      connectToSortable: false,
      containment: false,
      cursor: "auto",
      cursorAt: false,
      grid: false,
      handle: false,
      helper: "original",
      iframeFix: false,
      opacity: false,
      refreshPositions: false,
      revert: false,
      revertDuration: 500,
      scope: "default",
      scroll: true,
      scrollSensitivity: 20,
      scrollSpeed: 20,
      snap: false,
      snapMode: "both",
      snapTolerance: 20,
      stack: false,
      zIndex: false,

      // callbacks
      drag: null,
      start: null,
      stop: null,
    },
    _create: function () {
      if (this.options.helper === "original") {
        this._setPositionRelative();
      }
      if (this.options.addClasses) {
        this.element.addClass("ui-draggable");
      }
      if (this.options.disabled) {
        this.element.addClass("ui-draggable-disabled");
      }
      this._setHandleClassName();

      this._mouseInit();
    },

    _setOption: function (key, value) {
      this._super(key, value);
      if (key === "handle") {
        this._removeHandleClassName();
        this._setHandleClassName();
      }
    },

    _destroy: function () {
      if ((this.helper || this.element).is(".ui-draggable-dragging")) {
        this.destroyOnClear = true;
        return;
      }
      this.element.removeClass(
        "ui-draggable ui-draggable-dragging ui-draggable-disabled"
      );
      this._removeHandleClassName();
      this._mouseDestroy();
    },

    _mouseCapture: function (event) {
      var o = this.options;

      this._blurActiveElement(event);

      // among others, prevent a drag on a resizable-handle
      if (
        this.helper ||
        o.disabled ||
        $(event.target).closest(".ui-resizable-handle").length > 0
      ) {
        return false;
      }

      //Quit if we're not on a valid handle
      this.handle = this._getHandle(event);
      if (!this.handle) {
        return false;
      }

      this._blockFrames(o.iframeFix === true ? "iframe" : o.iframeFix);

      return true;
    },

    _blockFrames: function (selector) {
      this.iframeBlocks = this.document.find(selector).map(function () {
        var iframe = $(this);

        return $("<div>")
          .css("position", "absolute")
          .appendTo(iframe.parent())
          .outerWidth(iframe.outerWidth())
          .outerHeight(iframe.outerHeight())
          .offset(iframe.offset())[0];
      });
    },

    _unblockFrames: function () {
      if (this.iframeBlocks) {
        this.iframeBlocks.remove();
        delete this.iframeBlocks;
      }
    },

    _blurActiveElement: function (event) {
      var document = this.document[0];

      // Only need to blur if the event occurred on the draggable itself, see #10527
      if (!this.handleElement.is(event.target)) {
        return;
      }

      // support: IE9
      // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
      try {
        // Support: IE9, IE10
        // If the <body> is blurred, IE will switch windows, see #9520
        if (
          document.activeElement &&
          document.activeElement.nodeName.toLowerCase() !== "body"
        ) {
          // Blur any element that currently has focus, see #4261
          $(document.activeElement).blur();
        }
      } catch (error) {}
    },

    _mouseStart: function (event) {
      var o = this.options;

      //Create and append the visible helper
      this.helper = this._createHelper(event);

      this.helper.addClass("ui-draggable-dragging");

      //Cache the helper size
      this._cacheHelperProportions();

      //If ddmanager is used for droppables, set the global draggable
      if ($.ui.ddmanager) {
        $.ui.ddmanager.current = this;
      }

      /*
       * - Position generation -
       * This block generates everything position related - it's the core of draggables.
       */

      //Cache the margins of the original element
      this._cacheMargins();

      //Store the helper's css position
      this.cssPosition = this.helper.css("position");
      this.scrollParent = this.helper.scrollParent(true);
      this.offsetParent = this.helper.offsetParent();
      this.hasFixedAncestor =
        this.helper.parents().filter(function () {
          return $(this).css("position") === "fixed";
        }).length > 0;

      //The element's absolute position on the page minus margins
      this.positionAbs = this.element.offset();
      this._refreshOffsets(event);

      //Generate the original position
      this.originalPosition = this.position = this._generatePosition(
        event,
        false
      );
      this.originalPageX = event.pageX;
      this.originalPageY = event.pageY;

      //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
      o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt);

      //Set a containment if given in the options
      this._setContainment();

      //Trigger event + callbacks
      if (this._trigger("start", event) === false) {
        this._clear();
        return false;
      }

      //Recache the helper size
      this._cacheHelperProportions();

      //Prepare the droppable offsets
      if ($.ui.ddmanager && !o.dropBehaviour) {
        $.ui.ddmanager.prepareOffsets(this, event);
      }

      // Reset helper's right/bottom css if they're set and set explicit width/height instead
      // as this prevents resizing of elements with right/bottom set (see #7772)
      this._normalizeRightBottom();

      this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

      //If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
      if ($.ui.ddmanager) {
        $.ui.ddmanager.dragStart(this, event);
      }

      return true;
    },

    _refreshOffsets: function (event) {
      this.offset = {
        top: this.positionAbs.top - this.margins.top,
        left: this.positionAbs.left - this.margins.left,
        scroll: false,
        parent: this._getParentOffset(),
        relative: this._getRelativeOffset(),
      };

      this.offset.click = {
        left: event.pageX - this.offset.left,
        top: event.pageY - this.offset.top,
      };
    },

    _mouseDrag: function (event, noPropagation) {
      // reset any necessary cached properties (see #5009)
      if (this.hasFixedAncestor) {
        this.offset.parent = this._getParentOffset();
      }

      //Compute the helpers position
      this.position = this._generatePosition(event, true);
      this.positionAbs = this._convertPositionTo("absolute");

      //Call plugins and callbacks and use the resulting position if something is returned
      if (!noPropagation) {
        var ui = this._uiHash();
        if (this._trigger("drag", event, ui) === false) {
          this._mouseUp({});
          return false;
        }
        this.position = ui.position;
      }

      this.helper[0].style.left = this.position.left + "px";
      this.helper[0].style.top = this.position.top + "px";

      if ($.ui.ddmanager) {
        $.ui.ddmanager.drag(this, event);
      }

      return false;
    },

    _mouseStop: function (event) {
      //If we are using droppables, inform the manager about the drop
      var that = this,
        dropped = false;
      if ($.ui.ddmanager && !this.options.dropBehaviour) {
        dropped = $.ui.ddmanager.drop(this, event);
      }

      //if a drop comes from outside (a sortable)
      if (this.dropped) {
        dropped = this.dropped;
        this.dropped = false;
      }

      if (
        (this.options.revert === "invalid" && !dropped) ||
        (this.options.revert === "valid" && dropped) ||
        this.options.revert === true ||
        ($.isFunction(this.options.revert) &&
          this.options.revert.call(this.element, dropped))
      ) {
        $(this.helper).animate(
          this.originalPosition,
          parseInt(this.options.revertDuration, 10),
          function () {
            if (that._trigger("stop", event) !== false) {
              that._clear();
            }
          }
        );
      } else {
        if (this._trigger("stop", event) !== false) {
          this._clear();
        }
      }

      return false;
    },

    _mouseUp: function (event) {
      this._unblockFrames();

      //If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
      if ($.ui.ddmanager) {
        $.ui.ddmanager.dragStop(this, event);
      }

      // Only need to focus if the event occurred on the draggable itself, see #10527
      if (this.handleElement.is(event.target)) {
        // The interaction is over; whether or not the click resulted in a drag, focus the element
        this.element.focus();
      }

      return $.ui.mouse.prototype._mouseUp.call(this, event);
    },

    cancel: function () {
      if (this.helper.is(".ui-draggable-dragging")) {
        this._mouseUp({});
      } else {
        this._clear();
      }

      return this;
    },

    _getHandle: function (event) {
      return this.options.handle
        ? !!$(event.target).closest(this.element.find(this.options.handle))
            .length
        : true;
    },

    _setHandleClassName: function () {
      this.handleElement = this.options.handle
        ? this.element.find(this.options.handle)
        : this.element;
      this.handleElement.addClass("ui-draggable-handle");
    },

    _removeHandleClassName: function () {
      this.handleElement.removeClass("ui-draggable-handle");
    },

    _createHelper: function (event) {
      var o = this.options,
        helperIsFunction = $.isFunction(o.helper),
        helper = helperIsFunction
          ? $(o.helper.apply(this.element[0], [event]))
          : o.helper === "clone"
          ? this.element.clone().removeAttr("id")
          : this.element;

      if (!helper.parents("body").length) {
        helper.appendTo(
          o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo
        );
      }

      // http://bugs.jqueryui.com/ticket/9446
      // a helper function can return the original element
      // which wouldn't have been set to relative in _create
      if (helperIsFunction && helper[0] === this.element[0]) {
        this._setPositionRelative();
      }

      if (
        helper[0] !== this.element[0] &&
        !/(fixed|absolute)/.test(helper.css("position"))
      ) {
        helper.css("position", "absolute");
      }

      return helper;
    },

    _setPositionRelative: function () {
      if (!/^(?:r|a|f)/.test(this.element.css("position"))) {
        this.element[0].style.position = "relative";
      }
    },

    _adjustOffsetFromHelper: function (obj) {
      if (typeof obj === "string") {
        obj = obj.split(" ");
      }
      if ($.isArray(obj)) {
        obj = { left: +obj[0], top: +obj[1] || 0 };
      }
      if ("left" in obj) {
        this.offset.click.left = obj.left + this.margins.left;
      }
      if ("right" in obj) {
        this.offset.click.left =
          this.helperProportions.width - obj.right + this.margins.left;
      }
      if ("top" in obj) {
        this.offset.click.top = obj.top + this.margins.top;
      }
      if ("bottom" in obj) {
        this.offset.click.top =
          this.helperProportions.height - obj.bottom + this.margins.top;
      }
    },

    _isRootNode: function (element) {
      return (
        /(html|body)/i.test(element.tagName) || element === this.document[0]
      );
    },

    _getParentOffset: function () {
      //Get the offsetParent and cache its position
      var po = this.offsetParent.offset(),
        document = this.document[0];

      // This is a special case where we need to modify a offset calculated on start, since the following happened:
      // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
      // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
      //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
      if (
        this.cssPosition === "absolute" &&
        this.scrollParent[0] !== document &&
        $.contains(this.scrollParent[0], this.offsetParent[0])
      ) {
        po.left += this.scrollParent.scrollLeft();
        po.top += this.scrollParent.scrollTop();
      }

      if (this._isRootNode(this.offsetParent[0])) {
        po = { top: 0, left: 0 };
      }

      return {
        top:
          po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
        left:
          po.left +
          (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0),
      };
    },

    _getRelativeOffset: function () {
      if (this.cssPosition !== "relative") {
        return { top: 0, left: 0 };
      }

      var p = this.element.position(),
        scrollIsRootNode = this._isRootNode(this.scrollParent[0]);

      return {
        top:
          p.top -
          (parseInt(this.helper.css("top"), 10) || 0) +
          (!scrollIsRootNode ? this.scrollParent.scrollTop() : 0),
        left:
          p.left -
          (parseInt(this.helper.css("left"), 10) || 0) +
          (!scrollIsRootNode ? this.scrollParent.scrollLeft() : 0),
      };
    },

    _cacheMargins: function () {
      this.margins = {
        left: parseInt(this.element.css("marginLeft"), 10) || 0,
        top: parseInt(this.element.css("marginTop"), 10) || 0,
        right: parseInt(this.element.css("marginRight"), 10) || 0,
        bottom: parseInt(this.element.css("marginBottom"), 10) || 0,
      };
    },

    _cacheHelperProportions: function () {
      this.helperProportions = {
        width: this.helper.outerWidth(),
        height: this.helper.outerHeight(),
      };
    },

    _setContainment: function () {
      var isUserScrollable,
        c,
        ce,
        o = this.options,
        document = this.document[0];

      this.relativeContainer = null;

      if (!o.containment) {
        this.containment = null;
        return;
      }

      if (o.containment === "window") {
        this.containment = [
          $(window).scrollLeft() -
            this.offset.relative.left -
            this.offset.parent.left,
          $(window).scrollTop() -
            this.offset.relative.top -
            this.offset.parent.top,
          $(window).scrollLeft() +
            $(window).width() -
            this.helperProportions.width -
            this.margins.left,
          $(window).scrollTop() +
            ($(window).height() || document.body.parentNode.scrollHeight) -
            this.helperProportions.height -
            this.margins.top,
        ];
        return;
      }

      if (o.containment === "document") {
        this.containment = [
          0,
          0,
          $(document).width() -
            this.helperProportions.width -
            this.margins.left,
          ($(document).height() || document.body.parentNode.scrollHeight) -
            this.helperProportions.height -
            this.margins.top,
        ];
        return;
      }

      if (o.containment.constructor === Array) {
        this.containment = o.containment;
        return;
      }

      if (o.containment === "parent") {
        o.containment = this.helper[0].parentNode;
      }

      c = $(o.containment);
      ce = c[0];

      if (!ce) {
        return;
      }

      isUserScrollable = /(scroll|auto)/.test(c.css("overflow"));

      this.containment = [
        (parseInt(c.css("borderLeftWidth"), 10) || 0) +
          (parseInt(c.css("paddingLeft"), 10) || 0),
        (parseInt(c.css("borderTopWidth"), 10) || 0) +
          (parseInt(c.css("paddingTop"), 10) || 0),
        (isUserScrollable
          ? Math.max(ce.scrollWidth, ce.offsetWidth)
          : ce.offsetWidth) -
          (parseInt(c.css("borderRightWidth"), 10) || 0) -
          (parseInt(c.css("paddingRight"), 10) || 0) -
          this.helperProportions.width -
          this.margins.left -
          this.margins.right,
        (isUserScrollable
          ? Math.max(ce.scrollHeight, ce.offsetHeight)
          : ce.offsetHeight) -
          (parseInt(c.css("borderBottomWidth"), 10) || 0) -
          (parseInt(c.css("paddingBottom"), 10) || 0) -
          this.helperProportions.height -
          this.margins.top -
          this.margins.bottom,
      ];
      this.relativeContainer = c;
    },

    _convertPositionTo: function (d, pos) {
      if (!pos) {
        pos = this.position;
      }

      var mod = d === "absolute" ? 1 : -1,
        scrollIsRootNode = this._isRootNode(this.scrollParent[0]);

      return {
        top:
          pos.top + // The absolute mouse position
          this.offset.relative.top * mod + // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.top * mod - // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.offset.scroll.top
            : scrollIsRootNode
            ? 0
            : this.offset.scroll.top) *
            mod,
        left:
          pos.left + // The absolute mouse position
          this.offset.relative.left * mod + // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.left * mod - // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.offset.scroll.left
            : scrollIsRootNode
            ? 0
            : this.offset.scroll.left) *
            mod,
      };
    },

    _generatePosition: function (event, constrainPosition) {
      var containment,
        co,
        top,
        left,
        o = this.options,
        scrollIsRootNode = this._isRootNode(this.scrollParent[0]),
        pageX = event.pageX,
        pageY = event.pageY;

      // Cache the scroll
      if (!scrollIsRootNode || !this.offset.scroll) {
        this.offset.scroll = {
          top: this.scrollParent.scrollTop(),
          left: this.scrollParent.scrollLeft(),
        };
      }

      /*
       * - Position constraining -
       * Constrain the position to a mix of grid, containment.
       */

      // If we are not dragging yet, we won't check for options
      if (constrainPosition) {
        if (this.containment) {
          if (this.relativeContainer) {
            co = this.relativeContainer.offset();
            containment = [
              this.containment[0] + co.left,
              this.containment[1] + co.top,
              this.containment[2] + co.left,
              this.containment[3] + co.top,
            ];
          } else {
            containment = this.containment;
          }

          if (event.pageX - this.offset.click.left < containment[0]) {
            pageX = containment[0] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top < containment[1]) {
            pageY = containment[1] + this.offset.click.top;
          }
          if (event.pageX - this.offset.click.left > containment[2]) {
            pageX = containment[2] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top > containment[3]) {
            pageY = containment[3] + this.offset.click.top;
          }
        }

        if (o.grid) {
          //Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
          top = o.grid[1]
            ? this.originalPageY +
              Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1]
            : this.originalPageY;
          pageY = containment
            ? top - this.offset.click.top >= containment[1] ||
              top - this.offset.click.top > containment[3]
              ? top
              : top - this.offset.click.top >= containment[1]
              ? top - o.grid[1]
              : top + o.grid[1]
            : top;

          left = o.grid[0]
            ? this.originalPageX +
              Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0]
            : this.originalPageX;
          pageX = containment
            ? left - this.offset.click.left >= containment[0] ||
              left - this.offset.click.left > containment[2]
              ? left
              : left - this.offset.click.left >= containment[0]
              ? left - o.grid[0]
              : left + o.grid[0]
            : left;
        }

        if (o.axis === "y") {
          pageX = this.originalPageX;
        }

        if (o.axis === "x") {
          pageY = this.originalPageY;
        }
      }

      return {
        top:
          pageY - // The absolute mouse position
          this.offset.click.top - // Click offset (relative to the element)
          this.offset.relative.top - // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.top + // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.offset.scroll.top
            : scrollIsRootNode
            ? 0
            : this.offset.scroll.top),
        left:
          pageX - // The absolute mouse position
          this.offset.click.left - // Click offset (relative to the element)
          this.offset.relative.left - // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.left + // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.offset.scroll.left
            : scrollIsRootNode
            ? 0
            : this.offset.scroll.left),
      };
    },

    _clear: function () {
      this.helper.removeClass("ui-draggable-dragging");
      if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
        this.helper.remove();
      }
      this.helper = null;
      this.cancelHelperRemoval = false;
      if (this.destroyOnClear) {
        this.destroy();
      }
    },

    _normalizeRightBottom: function () {
      if (this.options.axis !== "y" && this.helper.css("right") !== "auto") {
        this.helper.width(this.helper.width());
        this.helper.css("right", "auto");
      }
      if (this.options.axis !== "x" && this.helper.css("bottom") !== "auto") {
        this.helper.height(this.helper.height());
        this.helper.css("bottom", "auto");
      }
    },

    // From now on bulk stuff - mainly helpers

    _trigger: function (type, event, ui) {
      ui = ui || this._uiHash();
      $.ui.plugin.call(this, type, [event, ui, this], true);

      // Absolute position and offset (see #6884 ) have to be recalculated after plugins
      if (/^(drag|start|stop)/.test(type)) {
        this.positionAbs = this._convertPositionTo("absolute");
        ui.offset = this.positionAbs;
      }
      return $.Widget.prototype._trigger.call(this, type, event, ui);
    },

    plugins: {},

    _uiHash: function () {
      return {
        helper: this.helper,
        position: this.position,
        originalPosition: this.originalPosition,
        offset: this.positionAbs,
      };
    },
  });

  $.ui.plugin.add("draggable", "connectToSortable", {
    start: function (event, ui, draggable) {
      var uiSortable = $.extend({}, ui, {
        item: draggable.element,
      });

      draggable.sortables = [];
      $(draggable.options.connectToSortable).each(function () {
        var sortable = $(this).sortable("instance");

        if (sortable && !sortable.options.disabled) {
          draggable.sortables.push(sortable);

          // refreshPositions is called at drag start to refresh the containerCache
          // which is used in drag. This ensures it's initialized and synchronized
          // with any changes that might have happened on the page since initialization.
          sortable.refreshPositions();
          sortable._trigger("activate", event, uiSortable);
        }
      });
    },
    stop: function (event, ui, draggable) {
      var uiSortable = $.extend({}, ui, {
        item: draggable.element,
      });

      draggable.cancelHelperRemoval = false;

      $.each(draggable.sortables, function () {
        var sortable = this;

        if (sortable.isOver) {
          sortable.isOver = 0;

          // Allow this sortable to handle removing the helper
          draggable.cancelHelperRemoval = true;
          sortable.cancelHelperRemoval = false;

          // Use _storedCSS To restore properties in the sortable,
          // as this also handles revert (#9675) since the draggable
          // may have modified them in unexpected ways (#8809)
          sortable._storedCSS = {
            position: sortable.placeholder.css("position"),
            top: sortable.placeholder.css("top"),
            left: sortable.placeholder.css("left"),
          };

          sortable._mouseStop(event);

          // Once drag has ended, the sortable should return to using
          // its original helper, not the shared helper from draggable
          sortable.options.helper = sortable.options._helper;
        } else {
          // Prevent this Sortable from removing the helper.
          // However, don't set the draggable to remove the helper
          // either as another connected Sortable may yet handle the removal.
          sortable.cancelHelperRemoval = true;

          sortable._trigger("deactivate", event, uiSortable);
        }
      });
    },
    drag: function (event, ui, draggable) {
      $.each(draggable.sortables, function () {
        var innermostIntersecting = false,
          sortable = this;

        // Copy over variables that sortable's _intersectsWith uses
        sortable.positionAbs = draggable.positionAbs;
        sortable.helperProportions = draggable.helperProportions;
        sortable.offset.click = draggable.offset.click;

        if (sortable._intersectsWith(sortable.containerCache)) {
          innermostIntersecting = true;

          $.each(draggable.sortables, function () {
            // Copy over variables that sortable's _intersectsWith uses
            this.positionAbs = draggable.positionAbs;
            this.helperProportions = draggable.helperProportions;
            this.offset.click = draggable.offset.click;

            if (
              this !== sortable &&
              this._intersectsWith(this.containerCache) &&
              $.contains(sortable.element[0], this.element[0])
            ) {
              innermostIntersecting = false;
            }

            return innermostIntersecting;
          });
        }

        if (innermostIntersecting) {
          // If it intersects, we use a little isOver variable and set it once,
          // so that the move-in stuff gets fired only once.
          if (!sortable.isOver) {
            sortable.isOver = 1;

            // Store draggable's parent in case we need to reappend to it later.
            draggable._parent = ui.helper.parent();

            sortable.currentItem = ui.helper
              .appendTo(sortable.element)
              .data("ui-sortable-item", true);

            // Store helper option to later restore it
            sortable.options._helper = sortable.options.helper;

            sortable.options.helper = function () {
              return ui.helper[0];
            };

            // Fire the start events of the sortable with our passed browser event,
            // and our own helper (so it doesn't create a new one)
            event.target = sortable.currentItem[0];
            sortable._mouseCapture(event, true);
            sortable._mouseStart(event, true, true);

            // Because the browser event is way off the new appended portlet,
            // modify necessary variables to reflect the changes
            sortable.offset.click.top = draggable.offset.click.top;
            sortable.offset.click.left = draggable.offset.click.left;
            sortable.offset.parent.left -=
              draggable.offset.parent.left - sortable.offset.parent.left;
            sortable.offset.parent.top -=
              draggable.offset.parent.top - sortable.offset.parent.top;

            draggable._trigger("toSortable", event);

            // Inform draggable that the helper is in a valid drop zone,
            // used solely in the revert option to handle "valid/invalid".
            draggable.dropped = sortable.element;

            // Need to refreshPositions of all sortables in the case that
            // adding to one sortable changes the location of the other sortables (#9675)
            $.each(draggable.sortables, function () {
              this.refreshPositions();
            });

            // hack so receive/update callbacks work (mostly)
            draggable.currentItem = draggable.element;
            sortable.fromOutside = draggable;
          }

          if (sortable.currentItem) {
            sortable._mouseDrag(event);
            // Copy the sortable's position because the draggable's can potentially reflect
            // a relative position, while sortable is always absolute, which the dragged
            // element has now become. (#8809)
            ui.position = sortable.position;
          }
        } else {
          // If it doesn't intersect with the sortable, and it intersected before,
          // we fake the drag stop of the sortable, but make sure it doesn't remove
          // the helper by using cancelHelperRemoval.
          if (sortable.isOver) {
            sortable.isOver = 0;
            sortable.cancelHelperRemoval = true;

            // Calling sortable's mouseStop would trigger a revert,
            // so revert must be temporarily false until after mouseStop is called.
            sortable.options._revert = sortable.options.revert;
            sortable.options.revert = false;

            sortable._trigger("out", event, sortable._uiHash(sortable));
            sortable._mouseStop(event, true);

            // restore sortable behaviors that were modfied
            // when the draggable entered the sortable area (#9481)
            sortable.options.revert = sortable.options._revert;
            sortable.options.helper = sortable.options._helper;

            if (sortable.placeholder) {
              sortable.placeholder.remove();
            }

            // Restore and recalculate the draggable's offset considering the sortable
            // may have modified them in unexpected ways. (#8809, #10669)
            ui.helper.appendTo(draggable._parent);
            draggable._refreshOffsets(event);
            ui.position = draggable._generatePosition(event, true);

            draggable._trigger("fromSortable", event);

            // Inform draggable that the helper is no longer in a valid drop zone
            draggable.dropped = false;

            // Need to refreshPositions of all sortables just in case removing
            // from one sortable changes the location of other sortables (#9675)
            $.each(draggable.sortables, function () {
              this.refreshPositions();
            });
          }
        }
      });
    },
  });

  $.ui.plugin.add("draggable", "cursor", {
    start: function (event, ui, instance) {
      var t = $("body"),
        o = instance.options;

      if (t.css("cursor")) {
        o._cursor = t.css("cursor");
      }
      t.css("cursor", o.cursor);
    },
    stop: function (event, ui, instance) {
      var o = instance.options;
      if (o._cursor) {
        $("body").css("cursor", o._cursor);
      }
    },
  });

  $.ui.plugin.add("draggable", "opacity", {
    start: function (event, ui, instance) {
      var t = $(ui.helper),
        o = instance.options;
      if (t.css("opacity")) {
        o._opacity = t.css("opacity");
      }
      t.css("opacity", o.opacity);
    },
    stop: function (event, ui, instance) {
      var o = instance.options;
      if (o._opacity) {
        $(ui.helper).css("opacity", o._opacity);
      }
    },
  });

  $.ui.plugin.add("draggable", "scroll", {
    start: function (event, ui, i) {
      if (!i.scrollParentNotHidden) {
        i.scrollParentNotHidden = i.helper.scrollParent(false);
      }

      if (
        i.scrollParentNotHidden[0] !== i.document[0] &&
        i.scrollParentNotHidden[0].tagName !== "HTML"
      ) {
        i.overflowOffset = i.scrollParentNotHidden.offset();
      }
    },
    drag: function (event, ui, i) {
      var o = i.options,
        scrolled = false,
        scrollParent = i.scrollParentNotHidden[0],
        document = i.document[0];

      if (scrollParent !== document && scrollParent.tagName !== "HTML") {
        if (!o.axis || o.axis !== "x") {
          if (
            i.overflowOffset.top + scrollParent.offsetHeight - event.pageY <
            o.scrollSensitivity
          ) {
            scrollParent.scrollTop = scrolled =
              scrollParent.scrollTop + o.scrollSpeed;
          } else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
            scrollParent.scrollTop = scrolled =
              scrollParent.scrollTop - o.scrollSpeed;
          }
        }

        if (!o.axis || o.axis !== "y") {
          if (
            i.overflowOffset.left + scrollParent.offsetWidth - event.pageX <
            o.scrollSensitivity
          ) {
            scrollParent.scrollLeft = scrolled =
              scrollParent.scrollLeft + o.scrollSpeed;
          } else if (
            event.pageX - i.overflowOffset.left <
            o.scrollSensitivity
          ) {
            scrollParent.scrollLeft = scrolled =
              scrollParent.scrollLeft - o.scrollSpeed;
          }
        }
      } else {
        if (!o.axis || o.axis !== "x") {
          if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
            scrolled = $(document).scrollTop(
              $(document).scrollTop() - o.scrollSpeed
            );
          } else if (
            $(window).height() - (event.pageY - $(document).scrollTop()) <
            o.scrollSensitivity
          ) {
            scrolled = $(document).scrollTop(
              $(document).scrollTop() + o.scrollSpeed
            );
          }
        }

        if (!o.axis || o.axis !== "y") {
          if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
            scrolled = $(document).scrollLeft(
              $(document).scrollLeft() - o.scrollSpeed
            );
          } else if (
            $(window).width() - (event.pageX - $(document).scrollLeft()) <
            o.scrollSensitivity
          ) {
            scrolled = $(document).scrollLeft(
              $(document).scrollLeft() + o.scrollSpeed
            );
          }
        }
      }

      if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
        $.ui.ddmanager.prepareOffsets(i, event);
      }
    },
  });

  $.ui.plugin.add("draggable", "snap", {
    start: function (event, ui, i) {
      var o = i.options;

      i.snapElements = [];

      $(
        o.snap.constructor !== String
          ? o.snap.items || ":data(ui-draggable)"
          : o.snap
      ).each(function () {
        var $t = $(this),
          $o = $t.offset();
        if (this !== i.element[0]) {
          i.snapElements.push({
            item: this,
            width: $t.outerWidth(),
            height: $t.outerHeight(),
            top: $o.top,
            left: $o.left,
          });
        }
      });
    },
    drag: function (event, ui, inst) {
      var ts,
        bs,
        ls,
        rs,
        l,
        r,
        t,
        b,
        i,
        first,
        o = inst.options,
        d = o.snapTolerance,
        x1 = ui.offset.left,
        x2 = x1 + inst.helperProportions.width,
        y1 = ui.offset.top,
        y2 = y1 + inst.helperProportions.height;

      for (i = inst.snapElements.length - 1; i >= 0; i--) {
        l = inst.snapElements[i].left - inst.margins.left;
        r = l + inst.snapElements[i].width;
        t = inst.snapElements[i].top - inst.margins.top;
        b = t + inst.snapElements[i].height;

        if (
          x2 < l - d ||
          x1 > r + d ||
          y2 < t - d ||
          y1 > b + d ||
          !$.contains(
            inst.snapElements[i].item.ownerDocument,
            inst.snapElements[i].item
          )
        ) {
          if (inst.snapElements[i].snapping) {
            inst.options.snap.release &&
              inst.options.snap.release.call(
                inst.element,
                event,
                $.extend(inst._uiHash(), {
                  snapItem: inst.snapElements[i].item,
                })
              );
          }
          inst.snapElements[i].snapping = false;
          continue;
        }

        if (o.snapMode !== "inner") {
          ts = Math.abs(t - y2) <= d;
          bs = Math.abs(b - y1) <= d;
          ls = Math.abs(l - x2) <= d;
          rs = Math.abs(r - x1) <= d;
          if (ts) {
            ui.position.top = inst._convertPositionTo("relative", {
              top: t - inst.helperProportions.height,
              left: 0,
            }).top;
          }
          if (bs) {
            ui.position.top = inst._convertPositionTo("relative", {
              top: b,
              left: 0,
            }).top;
          }
          if (ls) {
            ui.position.left = inst._convertPositionTo("relative", {
              top: 0,
              left: l - inst.helperProportions.width,
            }).left;
          }
          if (rs) {
            ui.position.left = inst._convertPositionTo("relative", {
              top: 0,
              left: r,
            }).left;
          }
        }

        first = ts || bs || ls || rs;

        if (o.snapMode !== "outer") {
          ts = Math.abs(t - y1) <= d;
          bs = Math.abs(b - y2) <= d;
          ls = Math.abs(l - x1) <= d;
          rs = Math.abs(r - x2) <= d;
          if (ts) {
            ui.position.top = inst._convertPositionTo("relative", {
              top: t,
              left: 0,
            }).top;
          }
          if (bs) {
            ui.position.top = inst._convertPositionTo("relative", {
              top: b - inst.helperProportions.height,
              left: 0,
            }).top;
          }
          if (ls) {
            ui.position.left = inst._convertPositionTo("relative", {
              top: 0,
              left: l,
            }).left;
          }
          if (rs) {
            ui.position.left = inst._convertPositionTo("relative", {
              top: 0,
              left: r - inst.helperProportions.width,
            }).left;
          }
        }

        if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
          inst.options.snap.snap &&
            inst.options.snap.snap.call(
              inst.element,
              event,
              $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })
            );
        }
        inst.snapElements[i].snapping = ts || bs || ls || rs || first;
      }
    },
  });

  $.ui.plugin.add("draggable", "stack", {
    start: function (event, ui, instance) {
      var min,
        o = instance.options,
        group = $.makeArray($(o.stack)).sort(function (a, b) {
          return (
            (parseInt($(a).css("zIndex"), 10) || 0) -
            (parseInt($(b).css("zIndex"), 10) || 0)
          );
        });

      if (!group.length) {
        return;
      }

      min = parseInt($(group[0]).css("zIndex"), 10) || 0;
      $(group).each(function (i) {
        $(this).css("zIndex", min + i);
      });
      this.css("zIndex", min + group.length);
    },
  });

  $.ui.plugin.add("draggable", "zIndex", {
    start: function (event, ui, instance) {
      var t = $(ui.helper),
        o = instance.options;

      if (t.css("zIndex")) {
        o._zIndex = t.css("zIndex");
      }
      t.css("zIndex", o.zIndex);
    },
    stop: function (event, ui, instance) {
      var o = instance.options;

      if (o._zIndex) {
        $(ui.helper).css("zIndex", o._zIndex);
      }
    },
  });

  var draggable = $.ui.draggable;

  /*!
   * jQuery UI Droppable 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/droppable/
   */

  $.widget("ui.droppable", {
    version: "1.11.4",
    widgetEventPrefix: "drop",
    options: {
      accept: "*",
      activeClass: false,
      addClasses: true,
      greedy: false,
      hoverClass: false,
      scope: "default",
      tolerance: "intersect",

      // callbacks
      activate: null,
      deactivate: null,
      drop: null,
      out: null,
      over: null,
    },
    _create: function () {
      var proportions,
        o = this.options,
        accept = o.accept;

      this.isover = false;
      this.isout = true;

      this.accept = $.isFunction(accept)
        ? accept
        : function (d) {
            return d.is(accept);
          };

      this.proportions = function (/* valueToWrite */) {
        if (arguments.length) {
          // Store the droppable's proportions
          proportions = arguments[0];
        } else {
          // Retrieve or derive the droppable's proportions
          return proportions
            ? proportions
            : (proportions = {
                width: this.element[0].offsetWidth,
                height: this.element[0].offsetHeight,
              });
        }
      };

      this._addToManager(o.scope);

      o.addClasses && this.element.addClass("ui-droppable");
    },

    _addToManager: function (scope) {
      // Add the reference and positions to the manager
      $.ui.ddmanager.droppables[scope] = $.ui.ddmanager.droppables[scope] || [];
      $.ui.ddmanager.droppables[scope].push(this);
    },

    _splice: function (drop) {
      var i = 0;
      for (; i < drop.length; i++) {
        if (drop[i] === this) {
          drop.splice(i, 1);
        }
      }
    },

    _destroy: function () {
      var drop = $.ui.ddmanager.droppables[this.options.scope];

      this._splice(drop);

      this.element.removeClass("ui-droppable ui-droppable-disabled");
    },

    _setOption: function (key, value) {
      if (key === "accept") {
        this.accept = $.isFunction(value)
          ? value
          : function (d) {
              return d.is(value);
            };
      } else if (key === "scope") {
        var drop = $.ui.ddmanager.droppables[this.options.scope];

        this._splice(drop);
        this._addToManager(value);
      }

      this._super(key, value);
    },

    _activate: function (event) {
      var draggable = $.ui.ddmanager.current;
      if (this.options.activeClass) {
        this.element.addClass(this.options.activeClass);
      }
      if (draggable) {
        this._trigger("activate", event, this.ui(draggable));
      }
    },

    _deactivate: function (event) {
      var draggable = $.ui.ddmanager.current;
      if (this.options.activeClass) {
        this.element.removeClass(this.options.activeClass);
      }
      if (draggable) {
        this._trigger("deactivate", event, this.ui(draggable));
      }
    },

    _over: function (event) {
      var draggable = $.ui.ddmanager.current;

      // Bail if draggable and droppable are same element
      if (
        !draggable ||
        (draggable.currentItem || draggable.element)[0] === this.element[0]
      ) {
        return;
      }

      if (
        this.accept.call(
          this.element[0],
          draggable.currentItem || draggable.element
        )
      ) {
        if (this.options.hoverClass) {
          this.element.addClass(this.options.hoverClass);
        }
        this._trigger("over", event, this.ui(draggable));
      }
    },

    _out: function (event) {
      var draggable = $.ui.ddmanager.current;

      // Bail if draggable and droppable are same element
      if (
        !draggable ||
        (draggable.currentItem || draggable.element)[0] === this.element[0]
      ) {
        return;
      }

      if (
        this.accept.call(
          this.element[0],
          draggable.currentItem || draggable.element
        )
      ) {
        if (this.options.hoverClass) {
          this.element.removeClass(this.options.hoverClass);
        }
        this._trigger("out", event, this.ui(draggable));
      }
    },

    _drop: function (event, custom) {
      var draggable = custom || $.ui.ddmanager.current,
        childrenIntersection = false;

      // Bail if draggable and droppable are same element
      if (
        !draggable ||
        (draggable.currentItem || draggable.element)[0] === this.element[0]
      ) {
        return false;
      }

      this.element
        .find(":data(ui-droppable)")
        .not(".ui-draggable-dragging")
        .each(function () {
          var inst = $(this).droppable("instance");
          if (
            inst.options.greedy &&
            !inst.options.disabled &&
            inst.options.scope === draggable.options.scope &&
            inst.accept.call(
              inst.element[0],
              draggable.currentItem || draggable.element
            ) &&
            $.ui.intersect(
              draggable,
              $.extend(inst, { offset: inst.element.offset() }),
              inst.options.tolerance,
              event
            )
          ) {
            childrenIntersection = true;
            return false;
          }
        });
      if (childrenIntersection) {
        return false;
      }

      if (
        this.accept.call(
          this.element[0],
          draggable.currentItem || draggable.element
        )
      ) {
        if (this.options.activeClass) {
          this.element.removeClass(this.options.activeClass);
        }
        if (this.options.hoverClass) {
          this.element.removeClass(this.options.hoverClass);
        }
        this._trigger("drop", event, this.ui(draggable));
        return this.element;
      }

      return false;
    },

    ui: function (c) {
      return {
        draggable: c.currentItem || c.element,
        helper: c.helper,
        position: c.position,
        offset: c.positionAbs,
      };
    },
  });

  $.ui.intersect = (function () {
    function isOverAxis(x, reference, size) {
      return x >= reference && x < reference + size;
    }

    return function (draggable, droppable, toleranceMode, event) {
      if (!droppable.offset) {
        return false;
      }

      var x1 =
          (draggable.positionAbs || draggable.position.absolute).left +
          draggable.margins.left,
        y1 =
          (draggable.positionAbs || draggable.position.absolute).top +
          draggable.margins.top,
        x2 = x1 + draggable.helperProportions.width,
        y2 = y1 + draggable.helperProportions.height,
        l = droppable.offset.left,
        t = droppable.offset.top,
        r = l + droppable.proportions().width,
        b = t + droppable.proportions().height;

      switch (toleranceMode) {
        case "fit":
          return l <= x1 && x2 <= r && t <= y1 && y2 <= b;
        case "intersect":
          return (
            l < x1 + draggable.helperProportions.width / 2 && // Right Half
            x2 - draggable.helperProportions.width / 2 < r && // Left Half
            t < y1 + draggable.helperProportions.height / 2 && // Bottom Half
            y2 - draggable.helperProportions.height / 2 < b
          ); // Top Half
        case "pointer":
          return (
            isOverAxis(event.pageY, t, droppable.proportions().height) &&
            isOverAxis(event.pageX, l, droppable.proportions().width)
          );
        case "touch":
          return (
            ((y1 >= t && y1 <= b) || // Top edge touching
              (y2 >= t && y2 <= b) || // Bottom edge touching
              (y1 < t && y2 > b)) && // Surrounded vertically
            ((x1 >= l && x1 <= r) || // Left edge touching
              (x2 >= l && x2 <= r) || // Right edge touching
              (x1 < l && x2 > r)) // Surrounded horizontally
          );
        default:
          return false;
      }
    };
  })();

  /*
	This manager tracks offsets of draggables and droppables
*/
  $.ui.ddmanager = {
    current: null,
    droppables: { default: [] },
    prepareOffsets: function (t, event) {
      var i,
        j,
        m = $.ui.ddmanager.droppables[t.options.scope] || [],
        type = event ? event.type : null, // workaround for #2317
        list = (t.currentItem || t.element)
          .find(":data(ui-droppable)")
          .addBack();

      droppablesLoop: for (i = 0; i < m.length; i++) {
        // No disabled and non-accepted
        if (
          m[i].options.disabled ||
          (t && !m[i].accept.call(m[i].element[0], t.currentItem || t.element))
        ) {
          continue;
        }

        // Filter out elements in the current dragged item
        for (j = 0; j < list.length; j++) {
          if (list[j] === m[i].element[0]) {
            m[i].proportions().height = 0;
            continue droppablesLoop;
          }
        }

        m[i].visible = m[i].element.css("display") !== "none";
        if (!m[i].visible) {
          continue;
        }

        // Activate the droppable if used directly from draggables
        if (type === "mousedown") {
          m[i]._activate.call(m[i], event);
        }

        m[i].offset = m[i].element.offset();
        m[i].proportions({
          width: m[i].element[0].offsetWidth,
          height: m[i].element[0].offsetHeight,
        });
      }
    },
    drop: function (draggable, event) {
      var dropped = false;
      // Create a copy of the droppables in case the list changes during the drop (#9116)
      $.each(
        ($.ui.ddmanager.droppables[draggable.options.scope] || []).slice(),
        function () {
          if (!this.options) {
            return;
          }
          if (
            !this.options.disabled &&
            this.visible &&
            $.ui.intersect(draggable, this, this.options.tolerance, event)
          ) {
            dropped = this._drop.call(this, event) || dropped;
          }

          if (
            !this.options.disabled &&
            this.visible &&
            this.accept.call(
              this.element[0],
              draggable.currentItem || draggable.element
            )
          ) {
            this.isout = true;
            this.isover = false;
            this._deactivate.call(this, event);
          }
        }
      );
      return dropped;
    },
    dragStart: function (draggable, event) {
      // Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
      draggable.element
        .parentsUntil("body")
        .bind("scroll.droppable", function () {
          if (!draggable.options.refreshPositions) {
            $.ui.ddmanager.prepareOffsets(draggable, event);
          }
        });
    },
    drag: function (draggable, event) {
      // If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
      if (draggable.options.refreshPositions) {
        $.ui.ddmanager.prepareOffsets(draggable, event);
      }

      // Run through all droppables and check their positions based on specific tolerance options
      $.each(
        $.ui.ddmanager.droppables[draggable.options.scope] || [],
        function () {
          if (this.options.disabled || this.greedyChild || !this.visible) {
            return;
          }

          var parentInstance,
            scope,
            parent,
            intersects = $.ui.intersect(
              draggable,
              this,
              this.options.tolerance,
              event
            ),
            c =
              !intersects && this.isover
                ? "isout"
                : intersects && !this.isover
                ? "isover"
                : null;
          if (!c) {
            return;
          }

          if (this.options.greedy) {
            // find droppable parents with same scope
            scope = this.options.scope;
            parent = this.element
              .parents(":data(ui-droppable)")
              .filter(function () {
                return $(this).droppable("instance").options.scope === scope;
              });

            if (parent.length) {
              parentInstance = $(parent[0]).droppable("instance");
              parentInstance.greedyChild = c === "isover";
            }
          }

          // we just moved into a greedy child
          if (parentInstance && c === "isover") {
            parentInstance.isover = false;
            parentInstance.isout = true;
            parentInstance._out.call(parentInstance, event);
          }

          this[c] = true;
          this[c === "isout" ? "isover" : "isout"] = false;
          this[c === "isover" ? "_over" : "_out"].call(this, event);

          // we just moved out of a greedy child
          if (parentInstance && c === "isout") {
            parentInstance.isout = false;
            parentInstance.isover = true;
            parentInstance._over.call(parentInstance, event);
          }
        }
      );
    },
    dragStop: function (draggable, event) {
      draggable.element.parentsUntil("body").unbind("scroll.droppable");
      // Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
      if (!draggable.options.refreshPositions) {
        $.ui.ddmanager.prepareOffsets(draggable, event);
      }
    },
  };

  var droppable = $.ui.droppable;

  /*!
   * jQuery UI Sortable 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/sortable/
   */

  var sortable = $.widget("ui.sortable", $.ui.mouse, {
    version: "1.11.4",
    widgetEventPrefix: "sort",
    ready: false,
    options: {
      appendTo: "parent",
      axis: false,
      connectWith: false,
      containment: false,
      cursor: "auto",
      cursorAt: false,
      dropOnEmpty: true,
      forcePlaceholderSize: false,
      forceHelperSize: false,
      grid: false,
      handle: false,
      helper: "original",
      items: "> *",
      opacity: false,
      placeholder: false,
      revert: false,
      scroll: true,
      scrollSensitivity: 20,
      scrollSpeed: 20,
      scope: "default",
      tolerance: "intersect",
      zIndex: 1000,

      // callbacks
      activate: null,
      beforeStop: null,
      change: null,
      deactivate: null,
      out: null,
      over: null,
      receive: null,
      remove: null,
      sort: null,
      start: null,
      stop: null,
      update: null,
    },

    _isOverAxis: function (x, reference, size) {
      return x >= reference && x < reference + size;
    },

    _isFloating: function (item) {
      return (
        /left|right/.test(item.css("float")) ||
        /inline|table-cell/.test(item.css("display"))
      );
    },

    _create: function () {
      this.containerCache = {};
      this.element.addClass("ui-sortable");

      //Get the items
      this.refresh();

      //Let's determine the parent's offset
      this.offset = this.element.offset();

      //Initialize mouse events for interaction
      this._mouseInit();

      this._setHandleClassName();

      //We're ready to go
      this.ready = true;
    },

    _setOption: function (key, value) {
      this._super(key, value);

      if (key === "handle") {
        this._setHandleClassName();
      }
    },

    _setHandleClassName: function () {
      this.element
        .find(".ui-sortable-handle")
        .removeClass("ui-sortable-handle");
      $.each(this.items, function () {
        (this.instance.options.handle
          ? this.item.find(this.instance.options.handle)
          : this.item
        ).addClass("ui-sortable-handle");
      });
    },

    _destroy: function () {
      this.element
        .removeClass("ui-sortable ui-sortable-disabled")
        .find(".ui-sortable-handle")
        .removeClass("ui-sortable-handle");
      this._mouseDestroy();

      for (var i = this.items.length - 1; i >= 0; i--) {
        this.items[i].item.removeData(this.widgetName + "-item");
      }

      return this;
    },

    _mouseCapture: function (event, overrideHandle) {
      var currentItem = null,
        validHandle = false,
        that = this;

      if (this.reverting) {
        return false;
      }

      if (this.options.disabled || this.options.type === "static") {
        return false;
      }

      //We have to refresh the items data once first
      this._refreshItems(event);

      //Find out if the clicked node (or one of its parents) is a actual item in this.items
      $(event.target)
        .parents()
        .each(function () {
          if ($.data(this, that.widgetName + "-item") === that) {
            currentItem = $(this);
            return false;
          }
        });
      if ($.data(event.target, that.widgetName + "-item") === that) {
        currentItem = $(event.target);
      }

      if (!currentItem) {
        return false;
      }
      if (this.options.handle && !overrideHandle) {
        $(this.options.handle, currentItem)
          .find("*")
          .addBack()
          .each(function () {
            if (this === event.target) {
              validHandle = true;
            }
          });
        if (!validHandle) {
          return false;
        }
      }

      this.currentItem = currentItem;
      this._removeCurrentsFromItems();
      return true;
    },

    _mouseStart: function (event, overrideHandle, noActivation) {
      var i,
        body,
        o = this.options;

      this.currentContainer = this;

      //We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
      this.refreshPositions();

      //Create and append the visible helper
      this.helper = this._createHelper(event);

      //Cache the helper size
      this._cacheHelperProportions();

      /*
       * - Position generation -
       * This block generates everything position related - it's the core of draggables.
       */

      //Cache the margins of the original element
      this._cacheMargins();

      //Get the next scrolling parent
      this.scrollParent = this.helper.scrollParent();

      //The element's absolute position on the page minus margins
      this.offset = this.currentItem.offset();
      this.offset = {
        top: this.offset.top - this.margins.top,
        left: this.offset.left - this.margins.left,
      };

      $.extend(this.offset, {
        click: {
          //Where the click happened, relative to the element
          left: event.pageX - this.offset.left,
          top: event.pageY - this.offset.top,
        },
        parent: this._getParentOffset(),
        relative: this._getRelativeOffset(), //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
      });

      // Only after we got the offset, we can change the helper's position to absolute
      // TODO: Still need to figure out a way to make relative sorting possible
      this.helper.css("position", "absolute");
      this.cssPosition = this.helper.css("position");

      //Generate the original position
      this.originalPosition = this._generatePosition(event);
      this.originalPageX = event.pageX;
      this.originalPageY = event.pageY;

      //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
      o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt);

      //Cache the former DOM position
      this.domPosition = {
        prev: this.currentItem.prev()[0],
        parent: this.currentItem.parent()[0],
      };

      //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
      if (this.helper[0] !== this.currentItem[0]) {
        this.currentItem.hide();
      }

      //Create the placeholder
      this._createPlaceholder();

      //Set a containment if given in the options
      if (o.containment) {
        this._setContainment();
      }

      if (o.cursor && o.cursor !== "auto") {
        // cursor option
        body = this.document.find("body");

        // support: IE
        this.storedCursor = body.css("cursor");
        body.css("cursor", o.cursor);

        this.storedStylesheet = $(
          "<style>*{ cursor: " + o.cursor + " !important; }</style>"
        ).appendTo(body);
      }

      if (o.opacity) {
        // opacity option
        if (this.helper.css("opacity")) {
          this._storedOpacity = this.helper.css("opacity");
        }
        this.helper.css("opacity", o.opacity);
      }

      if (o.zIndex) {
        // zIndex option
        if (this.helper.css("zIndex")) {
          this._storedZIndex = this.helper.css("zIndex");
        }
        this.helper.css("zIndex", o.zIndex);
      }

      //Prepare scrolling
      if (
        this.scrollParent[0] !== this.document[0] &&
        this.scrollParent[0].tagName !== "HTML"
      ) {
        this.overflowOffset = this.scrollParent.offset();
      }

      //Call callbacks
      this._trigger("start", event, this._uiHash());

      //Recache the helper size
      if (!this._preserveHelperProportions) {
        this._cacheHelperProportions();
      }

      //Post "activate" events to possible containers
      if (!noActivation) {
        for (i = this.containers.length - 1; i >= 0; i--) {
          this.containers[i]._trigger("activate", event, this._uiHash(this));
        }
      }

      //Prepare possible droppables
      if ($.ui.ddmanager) {
        $.ui.ddmanager.current = this;
      }

      if ($.ui.ddmanager && !o.dropBehaviour) {
        $.ui.ddmanager.prepareOffsets(this, event);
      }

      this.dragging = true;

      this.helper.addClass("ui-sortable-helper");
      this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
      return true;
    },

    _mouseDrag: function (event) {
      var i,
        item,
        itemElement,
        intersection,
        o = this.options,
        scrolled = false;

      //Compute the helpers position
      this.position = this._generatePosition(event);
      this.positionAbs = this._convertPositionTo("absolute");

      if (!this.lastPositionAbs) {
        this.lastPositionAbs = this.positionAbs;
      }

      //Do scrolling
      if (this.options.scroll) {
        if (
          this.scrollParent[0] !== this.document[0] &&
          this.scrollParent[0].tagName !== "HTML"
        ) {
          if (
            this.overflowOffset.top +
              this.scrollParent[0].offsetHeight -
              event.pageY <
            o.scrollSensitivity
          ) {
            this.scrollParent[0].scrollTop = scrolled =
              this.scrollParent[0].scrollTop + o.scrollSpeed;
          } else if (
            event.pageY - this.overflowOffset.top <
            o.scrollSensitivity
          ) {
            this.scrollParent[0].scrollTop = scrolled =
              this.scrollParent[0].scrollTop - o.scrollSpeed;
          }

          if (
            this.overflowOffset.left +
              this.scrollParent[0].offsetWidth -
              event.pageX <
            o.scrollSensitivity
          ) {
            this.scrollParent[0].scrollLeft = scrolled =
              this.scrollParent[0].scrollLeft + o.scrollSpeed;
          } else if (
            event.pageX - this.overflowOffset.left <
            o.scrollSensitivity
          ) {
            this.scrollParent[0].scrollLeft = scrolled =
              this.scrollParent[0].scrollLeft - o.scrollSpeed;
          }
        } else {
          if (event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
            scrolled = this.document.scrollTop(
              this.document.scrollTop() - o.scrollSpeed
            );
          } else if (
            this.window.height() - (event.pageY - this.document.scrollTop()) <
            o.scrollSensitivity
          ) {
            scrolled = this.document.scrollTop(
              this.document.scrollTop() + o.scrollSpeed
            );
          }

          if (event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
            scrolled = this.document.scrollLeft(
              this.document.scrollLeft() - o.scrollSpeed
            );
          } else if (
            this.window.width() - (event.pageX - this.document.scrollLeft()) <
            o.scrollSensitivity
          ) {
            scrolled = this.document.scrollLeft(
              this.document.scrollLeft() + o.scrollSpeed
            );
          }
        }

        if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
          $.ui.ddmanager.prepareOffsets(this, event);
        }
      }

      //Regenerate the absolute position used for position checks
      this.positionAbs = this._convertPositionTo("absolute");

      //Set the helper position
      if (!this.options.axis || this.options.axis !== "y") {
        this.helper[0].style.left = this.position.left + "px";
      }
      if (!this.options.axis || this.options.axis !== "x") {
        this.helper[0].style.top = this.position.top + "px";
      }

      //Rearrange
      for (i = this.items.length - 1; i >= 0; i--) {
        //Cache variables and intersection, continue if no intersection
        item = this.items[i];
        itemElement = item.item[0];
        intersection = this._intersectsWithPointer(item);
        if (!intersection) {
          continue;
        }

        // Only put the placeholder inside the current Container, skip all
        // items from other containers. This works because when moving
        // an item from one container to another the
        // currentContainer is switched before the placeholder is moved.
        //
        // Without this, moving items in "sub-sortables" can cause
        // the placeholder to jitter between the outer and inner container.
        if (item.instance !== this.currentContainer) {
          continue;
        }

        // cannot intersect with itself
        // no useless actions that have been done before
        // no action if the item moved is the parent of the item checked
        if (
          itemElement !== this.currentItem[0] &&
          this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !==
            itemElement &&
          !$.contains(this.placeholder[0], itemElement) &&
          (this.options.type === "semi-dynamic"
            ? !$.contains(this.element[0], itemElement)
            : true)
        ) {
          this.direction = intersection === 1 ? "down" : "up";

          if (
            this.options.tolerance === "pointer" ||
            this._intersectsWithSides(item)
          ) {
            this._rearrange(event, item);
          } else {
            break;
          }

          this._trigger("change", event, this._uiHash());
          break;
        }
      }

      //Post events to containers
      this._contactContainers(event);

      //Interconnect with droppables
      if ($.ui.ddmanager) {
        $.ui.ddmanager.drag(this, event);
      }

      //Call callbacks
      this._trigger("sort", event, this._uiHash());

      this.lastPositionAbs = this.positionAbs;
      return false;
    },

    _mouseStop: function (event, noPropagation) {
      if (!event) {
        return;
      }

      //If we are using droppables, inform the manager about the drop
      if ($.ui.ddmanager && !this.options.dropBehaviour) {
        $.ui.ddmanager.drop(this, event);
      }

      if (this.options.revert) {
        var that = this,
          cur = this.placeholder.offset(),
          axis = this.options.axis,
          animation = {};

        if (!axis || axis === "x") {
          animation.left =
            cur.left -
            this.offset.parent.left -
            this.margins.left +
            (this.offsetParent[0] === this.document[0].body
              ? 0
              : this.offsetParent[0].scrollLeft);
        }
        if (!axis || axis === "y") {
          animation.top =
            cur.top -
            this.offset.parent.top -
            this.margins.top +
            (this.offsetParent[0] === this.document[0].body
              ? 0
              : this.offsetParent[0].scrollTop);
        }
        this.reverting = true;
        $(this.helper).animate(
          animation,
          parseInt(this.options.revert, 10) || 500,
          function () {
            that._clear(event);
          }
        );
      } else {
        this._clear(event, noPropagation);
      }

      return false;
    },

    cancel: function () {
      if (this.dragging) {
        this._mouseUp({ target: null });

        if (this.options.helper === "original") {
          this.currentItem
            .css(this._storedCSS)
            .removeClass("ui-sortable-helper");
        } else {
          this.currentItem.show();
        }

        //Post deactivating events to containers
        for (var i = this.containers.length - 1; i >= 0; i--) {
          this.containers[i]._trigger("deactivate", null, this._uiHash(this));
          if (this.containers[i].containerCache.over) {
            this.containers[i]._trigger("out", null, this._uiHash(this));
            this.containers[i].containerCache.over = 0;
          }
        }
      }

      if (this.placeholder) {
        //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        if (this.placeholder[0].parentNode) {
          this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        }
        if (
          this.options.helper !== "original" &&
          this.helper &&
          this.helper[0].parentNode
        ) {
          this.helper.remove();
        }

        $.extend(this, {
          helper: null,
          dragging: false,
          reverting: false,
          _noFinalSort: null,
        });

        if (this.domPosition.prev) {
          $(this.domPosition.prev).after(this.currentItem);
        } else {
          $(this.domPosition.parent).prepend(this.currentItem);
        }
      }

      return this;
    },

    serialize: function (o) {
      var items = this._getItemsAsjQuery(o && o.connected),
        str = [];
      o = o || {};

      $(items).each(function () {
        var res = ($(o.item || this).attr(o.attribute || "id") || "").match(
          o.expression || /(.+)[\-=_](.+)/
        );
        if (res) {
          str.push(
            (o.key || res[1] + "[]") +
              "=" +
              (o.key && o.expression ? res[1] : res[2])
          );
        }
      });

      if (!str.length && o.key) {
        str.push(o.key + "=");
      }

      return str.join("&");
    },

    toArray: function (o) {
      var items = this._getItemsAsjQuery(o && o.connected),
        ret = [];

      o = o || {};

      items.each(function () {
        ret.push($(o.item || this).attr(o.attribute || "id") || "");
      });
      return ret;
    },

    /* Be careful with the following core functions */
    _intersectsWith: function (item) {
      var x1 = this.positionAbs.left,
        x2 = x1 + this.helperProportions.width,
        y1 = this.positionAbs.top,
        y2 = y1 + this.helperProportions.height,
        l = item.left,
        r = l + item.width,
        t = item.top,
        b = t + item.height,
        dyClick = this.offset.click.top,
        dxClick = this.offset.click.left,
        isOverElementHeight =
          this.options.axis === "x" || (y1 + dyClick > t && y1 + dyClick < b),
        isOverElementWidth =
          this.options.axis === "y" || (x1 + dxClick > l && x1 + dxClick < r),
        isOverElement = isOverElementHeight && isOverElementWidth;

      if (
        this.options.tolerance === "pointer" ||
        this.options.forcePointerForContainers ||
        (this.options.tolerance !== "pointer" &&
          this.helperProportions[this.floating ? "width" : "height"] >
            item[this.floating ? "width" : "height"])
      ) {
        return isOverElement;
      } else {
        return (
          l < x1 + this.helperProportions.width / 2 && // Right Half
          x2 - this.helperProportions.width / 2 < r && // Left Half
          t < y1 + this.helperProportions.height / 2 && // Bottom Half
          y2 - this.helperProportions.height / 2 < b
        ); // Top Half
      }
    },

    _intersectsWithPointer: function (item) {
      var isOverElementHeight =
          this.options.axis === "x" ||
          this._isOverAxis(
            this.positionAbs.top + this.offset.click.top,
            item.top,
            item.height
          ),
        isOverElementWidth =
          this.options.axis === "y" ||
          this._isOverAxis(
            this.positionAbs.left + this.offset.click.left,
            item.left,
            item.width
          ),
        isOverElement = isOverElementHeight && isOverElementWidth,
        verticalDirection = this._getDragVerticalDirection(),
        horizontalDirection = this._getDragHorizontalDirection();

      if (!isOverElement) {
        return false;
      }

      return this.floating
        ? (horizontalDirection && horizontalDirection === "right") ||
          verticalDirection === "down"
          ? 2
          : 1
        : verticalDirection && (verticalDirection === "down" ? 2 : 1);
    },

    _intersectsWithSides: function (item) {
      var isOverBottomHalf = this._isOverAxis(
          this.positionAbs.top + this.offset.click.top,
          item.top + item.height / 2,
          item.height
        ),
        isOverRightHalf = this._isOverAxis(
          this.positionAbs.left + this.offset.click.left,
          item.left + item.width / 2,
          item.width
        ),
        verticalDirection = this._getDragVerticalDirection(),
        horizontalDirection = this._getDragHorizontalDirection();

      if (this.floating && horizontalDirection) {
        return (
          (horizontalDirection === "right" && isOverRightHalf) ||
          (horizontalDirection === "left" && !isOverRightHalf)
        );
      } else {
        return (
          verticalDirection &&
          ((verticalDirection === "down" && isOverBottomHalf) ||
            (verticalDirection === "up" && !isOverBottomHalf))
        );
      }
    },

    _getDragVerticalDirection: function () {
      var delta = this.positionAbs.top - this.lastPositionAbs.top;
      return delta !== 0 && (delta > 0 ? "down" : "up");
    },

    _getDragHorizontalDirection: function () {
      var delta = this.positionAbs.left - this.lastPositionAbs.left;
      return delta !== 0 && (delta > 0 ? "right" : "left");
    },

    refresh: function (event) {
      this._refreshItems(event);
      this._setHandleClassName();
      this.refreshPositions();
      return this;
    },

    _connectWith: function () {
      var options = this.options;
      return options.connectWith.constructor === String
        ? [options.connectWith]
        : options.connectWith;
    },

    _getItemsAsjQuery: function (connected) {
      var i,
        j,
        cur,
        inst,
        items = [],
        queries = [],
        connectWith = this._connectWith();

      if (connectWith && connected) {
        for (i = connectWith.length - 1; i >= 0; i--) {
          cur = $(connectWith[i], this.document[0]);
          for (j = cur.length - 1; j >= 0; j--) {
            inst = $.data(cur[j], this.widgetFullName);
            if (inst && inst !== this && !inst.options.disabled) {
              queries.push([
                $.isFunction(inst.options.items)
                  ? inst.options.items.call(inst.element)
                  : $(inst.options.items, inst.element)
                      .not(".ui-sortable-helper")
                      .not(".ui-sortable-placeholder"),
                inst,
              ]);
            }
          }
        }
      }

      queries.push([
        $.isFunction(this.options.items)
          ? this.options.items.call(this.element, null, {
              options: this.options,
              item: this.currentItem,
            })
          : $(this.options.items, this.element)
              .not(".ui-sortable-helper")
              .not(".ui-sortable-placeholder"),
        this,
      ]);

      function addItems() {
        items.push(this);
      }
      for (i = queries.length - 1; i >= 0; i--) {
        queries[i][0].each(addItems);
      }

      return $(items);
    },

    _removeCurrentsFromItems: function () {
      var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

      this.items = $.grep(this.items, function (item) {
        for (var j = 0; j < list.length; j++) {
          if (list[j] === item.item[0]) {
            return false;
          }
        }
        return true;
      });
    },

    _refreshItems: function (event) {
      this.items = [];
      this.containers = [this];

      var i,
        j,
        cur,
        inst,
        targetData,
        _queries,
        item,
        queriesLength,
        items = this.items,
        queries = [
          [
            $.isFunction(this.options.items)
              ? this.options.items.call(this.element[0], event, {
                  item: this.currentItem,
                })
              : $(this.options.items, this.element),
            this,
          ],
        ],
        connectWith = this._connectWith();

      if (connectWith && this.ready) {
        //Shouldn't be run the first time through due to massive slow-down
        for (i = connectWith.length - 1; i >= 0; i--) {
          cur = $(connectWith[i], this.document[0]);
          for (j = cur.length - 1; j >= 0; j--) {
            inst = $.data(cur[j], this.widgetFullName);
            if (inst && inst !== this && !inst.options.disabled) {
              queries.push([
                $.isFunction(inst.options.items)
                  ? inst.options.items.call(inst.element[0], event, {
                      item: this.currentItem,
                    })
                  : $(inst.options.items, inst.element),
                inst,
              ]);
              this.containers.push(inst);
            }
          }
        }
      }

      for (i = queries.length - 1; i >= 0; i--) {
        targetData = queries[i][1];
        _queries = queries[i][0];

        for (j = 0, queriesLength = _queries.length; j < queriesLength; j++) {
          item = $(_queries[j]);

          item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

          items.push({
            item: item,
            instance: targetData,
            width: 0,
            height: 0,
            left: 0,
            top: 0,
          });
        }
      }
    },

    refreshPositions: function (fast) {
      // Determine whether items are being displayed horizontally
      this.floating = this.items.length
        ? this.options.axis === "x" || this._isFloating(this.items[0].item)
        : false;

      //This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
      if (this.offsetParent && this.helper) {
        this.offset.parent = this._getParentOffset();
      }

      var i, item, t, p;

      for (i = this.items.length - 1; i >= 0; i--) {
        item = this.items[i];

        //We ignore calculating positions of all connected containers when we're not over them
        if (
          item.instance !== this.currentContainer &&
          this.currentContainer &&
          item.item[0] !== this.currentItem[0]
        ) {
          continue;
        }

        t = this.options.toleranceElement
          ? $(this.options.toleranceElement, item.item)
          : item.item;

        if (!fast) {
          item.width = t.outerWidth();
          item.height = t.outerHeight();
        }

        p = t.offset();
        item.left = p.left;
        item.top = p.top;
      }

      if (this.options.custom && this.options.custom.refreshContainers) {
        this.options.custom.refreshContainers.call(this);
      } else {
        for (i = this.containers.length - 1; i >= 0; i--) {
          p = this.containers[i].element.offset();
          this.containers[i].containerCache.left = p.left;
          this.containers[i].containerCache.top = p.top;
          this.containers[i].containerCache.width =
            this.containers[i].element.outerWidth();
          this.containers[i].containerCache.height =
            this.containers[i].element.outerHeight();
        }
      }

      return this;
    },

    _createPlaceholder: function (that) {
      that = that || this;
      var className,
        o = that.options;

      if (!o.placeholder || o.placeholder.constructor === String) {
        className = o.placeholder;
        o.placeholder = {
          element: function () {
            var nodeName = that.currentItem[0].nodeName.toLowerCase(),
              element = $("<" + nodeName + ">", that.document[0])
                .addClass(
                  className ||
                    that.currentItem[0].className + " ui-sortable-placeholder"
                )
                .removeClass("ui-sortable-helper");

            if (nodeName === "tbody") {
              that._createTrPlaceholder(
                that.currentItem.find("tr").eq(0),
                $("<tr>", that.document[0]).appendTo(element)
              );
            } else if (nodeName === "tr") {
              that._createTrPlaceholder(that.currentItem, element);
            } else if (nodeName === "img") {
              element.attr("src", that.currentItem.attr("src"));
            }

            if (!className) {
              element.css("visibility", "hidden");
            }

            return element;
          },
          update: function (container, p) {
            // 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
            // 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
            if (className && !o.forcePlaceholderSize) {
              return;
            }

            //If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
            if (!p.height()) {
              p.height(
                that.currentItem.innerHeight() -
                  parseInt(that.currentItem.css("paddingTop") || 0, 10) -
                  parseInt(that.currentItem.css("paddingBottom") || 0, 10)
              );
            }
            if (!p.width()) {
              p.width(
                that.currentItem.innerWidth() -
                  parseInt(that.currentItem.css("paddingLeft") || 0, 10) -
                  parseInt(that.currentItem.css("paddingRight") || 0, 10)
              );
            }
          },
        };
      }

      //Create the placeholder
      that.placeholder = $(
        o.placeholder.element.call(that.element, that.currentItem)
      );

      //Append it after the actual current item
      that.currentItem.after(that.placeholder);

      //Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
      o.placeholder.update(that, that.placeholder);
    },

    _createTrPlaceholder: function (sourceTr, targetTr) {
      var that = this;

      sourceTr.children().each(function () {
        $("<td>&#160;</td>", that.document[0])
          .attr("colspan", $(this).attr("colspan") || 1)
          .appendTo(targetTr);
      });
    },

    _contactContainers: function (event) {
      var i,
        j,
        dist,
        itemWithLeastDistance,
        posProperty,
        sizeProperty,
        cur,
        nearBottom,
        floating,
        axis,
        innermostContainer = null,
        innermostIndex = null;

      // get innermost container that intersects with item
      for (i = this.containers.length - 1; i >= 0; i--) {
        // never consider a container that's located within the item itself
        if ($.contains(this.currentItem[0], this.containers[i].element[0])) {
          continue;
        }

        if (this._intersectsWith(this.containers[i].containerCache)) {
          // if we've already found a container and it's more "inner" than this, then continue
          if (
            innermostContainer &&
            $.contains(
              this.containers[i].element[0],
              innermostContainer.element[0]
            )
          ) {
            continue;
          }

          innermostContainer = this.containers[i];
          innermostIndex = i;
        } else {
          // container doesn't intersect. trigger "out" event if necessary
          if (this.containers[i].containerCache.over) {
            this.containers[i]._trigger("out", event, this._uiHash(this));
            this.containers[i].containerCache.over = 0;
          }
        }
      }

      // if no intersecting containers found, return
      if (!innermostContainer) {
        return;
      }

      // move the item into the container if it's not there already
      if (this.containers.length === 1) {
        if (!this.containers[innermostIndex].containerCache.over) {
          this.containers[innermostIndex]._trigger(
            "over",
            event,
            this._uiHash(this)
          );
          this.containers[innermostIndex].containerCache.over = 1;
        }
      } else {
        //When entering a new container, we will find the item with the least distance and append our item near it
        dist = 10000;
        itemWithLeastDistance = null;
        floating =
          innermostContainer.floating || this._isFloating(this.currentItem);
        posProperty = floating ? "left" : "top";
        sizeProperty = floating ? "width" : "height";
        axis = floating ? "clientX" : "clientY";

        for (j = this.items.length - 1; j >= 0; j--) {
          if (
            !$.contains(
              this.containers[innermostIndex].element[0],
              this.items[j].item[0]
            )
          ) {
            continue;
          }
          if (this.items[j].item[0] === this.currentItem[0]) {
            continue;
          }

          cur = this.items[j].item.offset()[posProperty];
          nearBottom = false;
          if (event[axis] - cur > this.items[j][sizeProperty] / 2) {
            nearBottom = true;
          }

          if (Math.abs(event[axis] - cur) < dist) {
            dist = Math.abs(event[axis] - cur);
            itemWithLeastDistance = this.items[j];
            this.direction = nearBottom ? "up" : "down";
          }
        }

        //Check if dropOnEmpty is enabled
        if (!itemWithLeastDistance && !this.options.dropOnEmpty) {
          return;
        }

        if (this.currentContainer === this.containers[innermostIndex]) {
          if (!this.currentContainer.containerCache.over) {
            this.containers[innermostIndex]._trigger(
              "over",
              event,
              this._uiHash()
            );
            this.currentContainer.containerCache.over = 1;
          }
          return;
        }

        itemWithLeastDistance
          ? this._rearrange(event, itemWithLeastDistance, null, true)
          : this._rearrange(
              event,
              null,
              this.containers[innermostIndex].element,
              true
            );
        this._trigger("change", event, this._uiHash());
        this.containers[innermostIndex]._trigger(
          "change",
          event,
          this._uiHash(this)
        );
        this.currentContainer = this.containers[innermostIndex];

        //Update the placeholder
        this.options.placeholder.update(
          this.currentContainer,
          this.placeholder
        );

        this.containers[innermostIndex]._trigger(
          "over",
          event,
          this._uiHash(this)
        );
        this.containers[innermostIndex].containerCache.over = 1;
      }
    },

    _createHelper: function (event) {
      var o = this.options,
        helper = $.isFunction(o.helper)
          ? $(o.helper.apply(this.element[0], [event, this.currentItem]))
          : o.helper === "clone"
          ? this.currentItem.clone()
          : this.currentItem;

      //Add the helper to the DOM if that didn't happen already
      if (!helper.parents("body").length) {
        $(
          o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode
        )[0].appendChild(helper[0]);
      }

      if (helper[0] === this.currentItem[0]) {
        this._storedCSS = {
          width: this.currentItem[0].style.width,
          height: this.currentItem[0].style.height,
          position: this.currentItem.css("position"),
          top: this.currentItem.css("top"),
          left: this.currentItem.css("left"),
        };
      }

      if (!helper[0].style.width || o.forceHelperSize) {
        helper.width(this.currentItem.width());
      }
      if (!helper[0].style.height || o.forceHelperSize) {
        helper.height(this.currentItem.height());
      }

      return helper;
    },

    _adjustOffsetFromHelper: function (obj) {
      if (typeof obj === "string") {
        obj = obj.split(" ");
      }
      if ($.isArray(obj)) {
        obj = { left: +obj[0], top: +obj[1] || 0 };
      }
      if ("left" in obj) {
        this.offset.click.left = obj.left + this.margins.left;
      }
      if ("right" in obj) {
        this.offset.click.left =
          this.helperProportions.width - obj.right + this.margins.left;
      }
      if ("top" in obj) {
        this.offset.click.top = obj.top + this.margins.top;
      }
      if ("bottom" in obj) {
        this.offset.click.top =
          this.helperProportions.height - obj.bottom + this.margins.top;
      }
    },

    _getParentOffset: function () {
      //Get the offsetParent and cache its position
      this.offsetParent = this.helper.offsetParent();
      var po = this.offsetParent.offset();

      // This is a special case where we need to modify a offset calculated on start, since the following happened:
      // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
      // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
      //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
      if (
        this.cssPosition === "absolute" &&
        this.scrollParent[0] !== this.document[0] &&
        $.contains(this.scrollParent[0], this.offsetParent[0])
      ) {
        po.left += this.scrollParent.scrollLeft();
        po.top += this.scrollParent.scrollTop();
      }

      // This needs to be actually done for all browsers, since pageX/pageY includes this information
      // with an ugly IE fix
      if (
        this.offsetParent[0] === this.document[0].body ||
        (this.offsetParent[0].tagName &&
          this.offsetParent[0].tagName.toLowerCase() === "html" &&
          $.ui.ie)
      ) {
        po = { top: 0, left: 0 };
      }

      return {
        top:
          po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
        left:
          po.left +
          (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0),
      };
    },

    _getRelativeOffset: function () {
      if (this.cssPosition === "relative") {
        var p = this.currentItem.position();
        return {
          top:
            p.top -
            (parseInt(this.helper.css("top"), 10) || 0) +
            this.scrollParent.scrollTop(),
          left:
            p.left -
            (parseInt(this.helper.css("left"), 10) || 0) +
            this.scrollParent.scrollLeft(),
        };
      } else {
        return { top: 0, left: 0 };
      }
    },

    _cacheMargins: function () {
      this.margins = {
        left: parseInt(this.currentItem.css("marginLeft"), 10) || 0,
        top: parseInt(this.currentItem.css("marginTop"), 10) || 0,
      };
    },

    _cacheHelperProportions: function () {
      this.helperProportions = {
        width: this.helper.outerWidth(),
        height: this.helper.outerHeight(),
      };
    },

    _setContainment: function () {
      var ce,
        co,
        over,
        o = this.options;
      if (o.containment === "parent") {
        o.containment = this.helper[0].parentNode;
      }
      if (o.containment === "document" || o.containment === "window") {
        this.containment = [
          0 - this.offset.relative.left - this.offset.parent.left,
          0 - this.offset.relative.top - this.offset.parent.top,
          o.containment === "document"
            ? this.document.width()
            : this.window.width() -
              this.helperProportions.width -
              this.margins.left,
          (o.containment === "document"
            ? this.document.width()
            : this.window.height() ||
              this.document[0].body.parentNode.scrollHeight) -
            this.helperProportions.height -
            this.margins.top,
        ];
      }

      if (!/^(document|window|parent)$/.test(o.containment)) {
        ce = $(o.containment)[0];
        co = $(o.containment).offset();
        over = $(ce).css("overflow") !== "hidden";

        this.containment = [
          co.left +
            (parseInt($(ce).css("borderLeftWidth"), 10) || 0) +
            (parseInt($(ce).css("paddingLeft"), 10) || 0) -
            this.margins.left,
          co.top +
            (parseInt($(ce).css("borderTopWidth"), 10) || 0) +
            (parseInt($(ce).css("paddingTop"), 10) || 0) -
            this.margins.top,
          co.left +
            (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) -
            (parseInt($(ce).css("borderLeftWidth"), 10) || 0) -
            (parseInt($(ce).css("paddingRight"), 10) || 0) -
            this.helperProportions.width -
            this.margins.left,
          co.top +
            (over
              ? Math.max(ce.scrollHeight, ce.offsetHeight)
              : ce.offsetHeight) -
            (parseInt($(ce).css("borderTopWidth"), 10) || 0) -
            (parseInt($(ce).css("paddingBottom"), 10) || 0) -
            this.helperProportions.height -
            this.margins.top,
        ];
      }
    },

    _convertPositionTo: function (d, pos) {
      if (!pos) {
        pos = this.position;
      }
      var mod = d === "absolute" ? 1 : -1,
        scroll =
          this.cssPosition === "absolute" &&
          !(
            this.scrollParent[0] !== this.document[0] &&
            $.contains(this.scrollParent[0], this.offsetParent[0])
          )
            ? this.offsetParent
            : this.scrollParent,
        scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);

      return {
        top:
          pos.top + // The absolute mouse position
          this.offset.relative.top * mod + // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.top * mod - // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.scrollParent.scrollTop()
            : scrollIsRootNode
            ? 0
            : scroll.scrollTop()) *
            mod,
        left:
          pos.left + // The absolute mouse position
          this.offset.relative.left * mod + // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.left * mod - // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.scrollParent.scrollLeft()
            : scrollIsRootNode
            ? 0
            : scroll.scrollLeft()) *
            mod,
      };
    },

    _generatePosition: function (event) {
      var top,
        left,
        o = this.options,
        pageX = event.pageX,
        pageY = event.pageY,
        scroll =
          this.cssPosition === "absolute" &&
          !(
            this.scrollParent[0] !== this.document[0] &&
            $.contains(this.scrollParent[0], this.offsetParent[0])
          )
            ? this.offsetParent
            : this.scrollParent,
        scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);

      // This is another very weird special case that only happens for relative elements:
      // 1. If the css position is relative
      // 2. and the scroll parent is the document or similar to the offset parent
      // we have to refresh the relative offset during the scroll so there are no jumps
      if (
        this.cssPosition === "relative" &&
        !(
          this.scrollParent[0] !== this.document[0] &&
          this.scrollParent[0] !== this.offsetParent[0]
        )
      ) {
        this.offset.relative = this._getRelativeOffset();
      }

      /*
       * - Position constraining -
       * Constrain the position to a mix of grid, containment.
       */

      if (this.originalPosition) {
        //If we are not dragging yet, we won't check for options

        if (this.containment) {
          if (event.pageX - this.offset.click.left < this.containment[0]) {
            pageX = this.containment[0] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top < this.containment[1]) {
            pageY = this.containment[1] + this.offset.click.top;
          }
          if (event.pageX - this.offset.click.left > this.containment[2]) {
            pageX = this.containment[2] + this.offset.click.left;
          }
          if (event.pageY - this.offset.click.top > this.containment[3]) {
            pageY = this.containment[3] + this.offset.click.top;
          }
        }

        if (o.grid) {
          top =
            this.originalPageY +
            Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
          pageY = this.containment
            ? top - this.offset.click.top >= this.containment[1] &&
              top - this.offset.click.top <= this.containment[3]
              ? top
              : top - this.offset.click.top >= this.containment[1]
              ? top - o.grid[1]
              : top + o.grid[1]
            : top;

          left =
            this.originalPageX +
            Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
          pageX = this.containment
            ? left - this.offset.click.left >= this.containment[0] &&
              left - this.offset.click.left <= this.containment[2]
              ? left
              : left - this.offset.click.left >= this.containment[0]
              ? left - o.grid[0]
              : left + o.grid[0]
            : left;
        }
      }

      return {
        top:
          pageY - // The absolute mouse position
          this.offset.click.top - // Click offset (relative to the element)
          this.offset.relative.top - // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.top + // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.scrollParent.scrollTop()
            : scrollIsRootNode
            ? 0
            : scroll.scrollTop()),
        left:
          pageX - // The absolute mouse position
          this.offset.click.left - // Click offset (relative to the element)
          this.offset.relative.left - // Only for relative positioned nodes: Relative offset from element to offset parent
          this.offset.parent.left + // The offsetParent's offset without borders (offset + border)
          (this.cssPosition === "fixed"
            ? -this.scrollParent.scrollLeft()
            : scrollIsRootNode
            ? 0
            : scroll.scrollLeft()),
      };
    },

    _rearrange: function (event, i, a, hardRefresh) {
      a
        ? a[0].appendChild(this.placeholder[0])
        : i.item[0].parentNode.insertBefore(
            this.placeholder[0],
            this.direction === "down" ? i.item[0] : i.item[0].nextSibling
          );

      //Various things done here to improve the performance:
      // 1. we create a setTimeout, that calls refreshPositions
      // 2. on the instance, we have a counter variable, that get's higher after every append
      // 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
      // 4. this lets only the last addition to the timeout stack through
      this.counter = this.counter ? ++this.counter : 1;
      var counter = this.counter;

      this._delay(function () {
        if (counter === this.counter) {
          this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
        }
      });
    },

    _clear: function (event, noPropagation) {
      this.reverting = false;
      // We delay all events that have to be triggered to after the point where the placeholder has been removed and
      // everything else normalized again
      var i,
        delayedTriggers = [];

      // We first have to update the dom position of the actual currentItem
      // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
      if (!this._noFinalSort && this.currentItem.parent().length) {
        this.placeholder.before(this.currentItem);
      }
      this._noFinalSort = null;

      if (this.helper[0] === this.currentItem[0]) {
        for (i in this._storedCSS) {
          if (
            this._storedCSS[i] === "auto" ||
            this._storedCSS[i] === "static"
          ) {
            this._storedCSS[i] = "";
          }
        }
        this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
      } else {
        this.currentItem.show();
      }

      if (this.fromOutside && !noPropagation) {
        delayedTriggers.push(function (event) {
          this._trigger("receive", event, this._uiHash(this.fromOutside));
        });
      }
      if (
        (this.fromOutside ||
          this.domPosition.prev !==
            this.currentItem.prev().not(".ui-sortable-helper")[0] ||
          this.domPosition.parent !== this.currentItem.parent()[0]) &&
        !noPropagation
      ) {
        delayedTriggers.push(function (event) {
          this._trigger("update", event, this._uiHash());
        }); //Trigger update callback if the DOM position has changed
      }

      // Check if the items Container has Changed and trigger appropriate
      // events.
      if (this !== this.currentContainer) {
        if (!noPropagation) {
          delayedTriggers.push(function (event) {
            this._trigger("remove", event, this._uiHash());
          });
          delayedTriggers.push(
            function (c) {
              return function (event) {
                c._trigger("receive", event, this._uiHash(this));
              };
            }.call(this, this.currentContainer)
          );
          delayedTriggers.push(
            function (c) {
              return function (event) {
                c._trigger("update", event, this._uiHash(this));
              };
            }.call(this, this.currentContainer)
          );
        }
      }

      //Post events to containers
      function delayEvent(type, instance, container) {
        return function (event) {
          container._trigger(type, event, instance._uiHash(instance));
        };
      }
      for (i = this.containers.length - 1; i >= 0; i--) {
        if (!noPropagation) {
          delayedTriggers.push(
            delayEvent("deactivate", this, this.containers[i])
          );
        }
        if (this.containers[i].containerCache.over) {
          delayedTriggers.push(delayEvent("out", this, this.containers[i]));
          this.containers[i].containerCache.over = 0;
        }
      }

      //Do what was originally in plugins
      if (this.storedCursor) {
        this.document.find("body").css("cursor", this.storedCursor);
        this.storedStylesheet.remove();
      }
      if (this._storedOpacity) {
        this.helper.css("opacity", this._storedOpacity);
      }
      if (this._storedZIndex) {
        this.helper.css(
          "zIndex",
          this._storedZIndex === "auto" ? "" : this._storedZIndex
        );
      }

      this.dragging = false;

      if (!noPropagation) {
        this._trigger("beforeStop", event, this._uiHash());
      }

      //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
      this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

      if (!this.cancelHelperRemoval) {
        if (this.helper[0] !== this.currentItem[0]) {
          this.helper.remove();
        }
        this.helper = null;
      }

      if (!noPropagation) {
        for (i = 0; i < delayedTriggers.length; i++) {
          delayedTriggers[i].call(this, event);
        } //Trigger all delayed events
        this._trigger("stop", event, this._uiHash());
      }

      this.fromOutside = false;
      return !this.cancelHelperRemoval;
    },

    _trigger: function () {
      if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
        this.cancel();
      }
    },

    _uiHash: function (_inst) {
      var inst = _inst || this;
      return {
        helper: inst.helper,
        placeholder: inst.placeholder || $([]),
        position: inst.position,
        originalPosition: inst.originalPosition,
        offset: inst.positionAbs,
        item: inst.currentItem,
        sender: _inst ? _inst.element : null,
      };
    },
  });

  /*!
   * jQuery UI Effects 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/category/effects-core/
   */

  var dataSpace = "ui-effects-",
    // Create a local jQuery because jQuery Color relies on it and the
    // global may not exist with AMD and a custom build (#10199)
    jQuery = $;

  $.effects = {
    effect: {},
  };

  /*!
   * jQuery Color Animations v2.1.2
   * https://github.com/jquery/jquery-color
   *
   * Copyright 2014 jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * Date: Wed Jan 16 08:47:09 2013 -0600
   */
  (function (jQuery, undefined) {
    var stepHooks =
        "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",
      // plusequals test for += 100 -= 100
      rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
      // a set of RE's that can match strings and generate color tuples.
      stringParsers = [
        {
          re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
          parse: function (execResult) {
            return [execResult[1], execResult[2], execResult[3], execResult[4]];
          },
        },
        {
          re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
          parse: function (execResult) {
            return [
              execResult[1] * 2.55,
              execResult[2] * 2.55,
              execResult[3] * 2.55,
              execResult[4],
            ];
          },
        },
        {
          // this regex ignores A-F because it's compared against an already lowercased string
          re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
          parse: function (execResult) {
            return [
              parseInt(execResult[1], 16),
              parseInt(execResult[2], 16),
              parseInt(execResult[3], 16),
            ];
          },
        },
        {
          // this regex ignores A-F because it's compared against an already lowercased string
          re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
          parse: function (execResult) {
            return [
              parseInt(execResult[1] + execResult[1], 16),
              parseInt(execResult[2] + execResult[2], 16),
              parseInt(execResult[3] + execResult[3], 16),
            ];
          },
        },
        {
          re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
          space: "hsla",
          parse: function (execResult) {
            return [
              execResult[1],
              execResult[2] / 100,
              execResult[3] / 100,
              execResult[4],
            ];
          },
        },
      ],
      // jQuery.Color( )
      color = (jQuery.Color = function (color, green, blue, alpha) {
        return new jQuery.Color.fn.parse(color, green, blue, alpha);
      }),
      spaces = {
        rgba: {
          props: {
            red: {
              idx: 0,
              type: "byte",
            },
            green: {
              idx: 1,
              type: "byte",
            },
            blue: {
              idx: 2,
              type: "byte",
            },
          },
        },

        hsla: {
          props: {
            hue: {
              idx: 0,
              type: "degrees",
            },
            saturation: {
              idx: 1,
              type: "percent",
            },
            lightness: {
              idx: 2,
              type: "percent",
            },
          },
        },
      },
      propTypes = {
        byte: {
          floor: true,
          max: 255,
        },
        percent: {
          max: 1,
        },
        degrees: {
          mod: 360,
          floor: true,
        },
      },
      support = (color.support = {}),
      // element for support tests
      supportElem = jQuery("<p>")[0],
      // colors = jQuery.Color.names
      colors,
      // local aliases of functions called often
      each = jQuery.each;

    // determine rgba support immediately
    supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
    support.rgba = supportElem.style.backgroundColor.indexOf("rgba") > -1;

    // define cache name and alpha properties
    // for rgba and hsla spaces
    each(spaces, function (spaceName, space) {
      space.cache = "_" + spaceName;
      space.props.alpha = {
        idx: 3,
        type: "percent",
        def: 1,
      };
    });

    function clamp(value, prop, allowEmpty) {
      var type = propTypes[prop.type] || {};

      if (value == null) {
        return allowEmpty || !prop.def ? null : prop.def;
      }

      // ~~ is an short way of doing floor for positive numbers
      value = type.floor ? ~~value : parseFloat(value);

      // IE will pass in empty strings as value for alpha,
      // which will hit this case
      if (isNaN(value)) {
        return prop.def;
      }

      if (type.mod) {
        // we add mod before modding to make sure that negatives values
        // get converted properly: -10 -> 350
        return (value + type.mod) % type.mod;
      }

      // for now all property types without mod have min and max
      return 0 > value ? 0 : type.max < value ? type.max : value;
    }

    function stringParse(string) {
      var inst = color(),
        rgba = (inst._rgba = []);

      string = string.toLowerCase();

      each(stringParsers, function (i, parser) {
        var parsed,
          match = parser.re.exec(string),
          values = match && parser.parse(match),
          spaceName = parser.space || "rgba";

        if (values) {
          parsed = inst[spaceName](values);

          // if this was an rgba parse the assignment might happen twice
          // oh well....
          inst[spaces[spaceName].cache] = parsed[spaces[spaceName].cache];
          rgba = inst._rgba = parsed._rgba;

          // exit each( stringParsers ) here because we matched
          return false;
        }
      });

      // Found a stringParser that handled it
      if (rgba.length) {
        // if this came from a parsed string, force "transparent" when alpha is 0
        // chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
        if (rgba.join() === "0,0,0,0") {
          jQuery.extend(rgba, colors.transparent);
        }
        return inst;
      }

      // named colors
      return colors[string];
    }

    color.fn = jQuery.extend(color.prototype, {
      parse: function (red, green, blue, alpha) {
        if (red === undefined) {
          this._rgba = [null, null, null, null];
          return this;
        }
        if (red.jquery || red.nodeType) {
          red = jQuery(red).css(green);
          green = undefined;
        }

        var inst = this,
          type = jQuery.type(red),
          rgba = (this._rgba = []);

        // more than 1 argument specified - assume ( red, green, blue, alpha )
        if (green !== undefined) {
          red = [red, green, blue, alpha];
          type = "array";
        }

        if (type === "string") {
          return this.parse(stringParse(red) || colors._default);
        }

        if (type === "array") {
          each(spaces.rgba.props, function (key, prop) {
            rgba[prop.idx] = clamp(red[prop.idx], prop);
          });
          return this;
        }

        if (type === "object") {
          if (red instanceof color) {
            each(spaces, function (spaceName, space) {
              if (red[space.cache]) {
                inst[space.cache] = red[space.cache].slice();
              }
            });
          } else {
            each(spaces, function (spaceName, space) {
              var cache = space.cache;
              each(space.props, function (key, prop) {
                // if the cache doesn't exist, and we know how to convert
                if (!inst[cache] && space.to) {
                  // if the value was null, we don't need to copy it
                  // if the key was alpha, we don't need to copy it either
                  if (key === "alpha" || red[key] == null) {
                    return;
                  }
                  inst[cache] = space.to(inst._rgba);
                }

                // this is the only case where we allow nulls for ALL properties.
                // call clamp with alwaysAllowEmpty
                inst[cache][prop.idx] = clamp(red[key], prop, true);
              });

              // everything defined but alpha?
              if (
                inst[cache] &&
                jQuery.inArray(null, inst[cache].slice(0, 3)) < 0
              ) {
                // use the default of 1
                inst[cache][3] = 1;
                if (space.from) {
                  inst._rgba = space.from(inst[cache]);
                }
              }
            });
          }
          return this;
        }
      },
      is: function (compare) {
        var is = color(compare),
          same = true,
          inst = this;

        each(spaces, function (_, space) {
          var localCache,
            isCache = is[space.cache];
          if (isCache) {
            localCache =
              inst[space.cache] || (space.to && space.to(inst._rgba)) || [];
            each(space.props, function (_, prop) {
              if (isCache[prop.idx] != null) {
                same = isCache[prop.idx] === localCache[prop.idx];
                return same;
              }
            });
          }
          return same;
        });
        return same;
      },
      _space: function () {
        var used = [],
          inst = this;
        each(spaces, function (spaceName, space) {
          if (inst[space.cache]) {
            used.push(spaceName);
          }
        });
        return used.pop();
      },
      transition: function (other, distance) {
        var end = color(other),
          spaceName = end._space(),
          space = spaces[spaceName],
          startColor = this.alpha() === 0 ? color("transparent") : this,
          start = startColor[space.cache] || space.to(startColor._rgba),
          result = start.slice();

        end = end[space.cache];
        each(space.props, function (key, prop) {
          var index = prop.idx,
            startValue = start[index],
            endValue = end[index],
            type = propTypes[prop.type] || {};

          // if null, don't override start value
          if (endValue === null) {
            return;
          }
          // if null - use end
          if (startValue === null) {
            result[index] = endValue;
          } else {
            if (type.mod) {
              if (endValue - startValue > type.mod / 2) {
                startValue += type.mod;
              } else if (startValue - endValue > type.mod / 2) {
                startValue -= type.mod;
              }
            }
            result[index] = clamp(
              (endValue - startValue) * distance + startValue,
              prop
            );
          }
        });
        return this[spaceName](result);
      },
      blend: function (opaque) {
        // if we are already opaque - return ourself
        if (this._rgba[3] === 1) {
          return this;
        }

        var rgb = this._rgba.slice(),
          a = rgb.pop(),
          blend = color(opaque)._rgba;

        return color(
          jQuery.map(rgb, function (v, i) {
            return (1 - a) * blend[i] + a * v;
          })
        );
      },
      toRgbaString: function () {
        var prefix = "rgba(",
          rgba = jQuery.map(this._rgba, function (v, i) {
            return v == null ? (i > 2 ? 1 : 0) : v;
          });

        if (rgba[3] === 1) {
          rgba.pop();
          prefix = "rgb(";
        }

        return prefix + rgba.join() + ")";
      },
      toHslaString: function () {
        var prefix = "hsla(",
          hsla = jQuery.map(this.hsla(), function (v, i) {
            if (v == null) {
              v = i > 2 ? 1 : 0;
            }

            // catch 1 and 2
            if (i && i < 3) {
              v = Math.round(v * 100) + "%";
            }
            return v;
          });

        if (hsla[3] === 1) {
          hsla.pop();
          prefix = "hsl(";
        }
        return prefix + hsla.join() + ")";
      },
      toHexString: function (includeAlpha) {
        var rgba = this._rgba.slice(),
          alpha = rgba.pop();

        if (includeAlpha) {
          rgba.push(~~(alpha * 255));
        }

        return (
          "#" +
          jQuery
            .map(rgba, function (v) {
              // default to 0 when nulls exist
              v = (v || 0).toString(16);
              return v.length === 1 ? "0" + v : v;
            })
            .join("")
        );
      },
      toString: function () {
        return this._rgba[3] === 0 ? "transparent" : this.toRgbaString();
      },
    });
    color.fn.parse.prototype = color.fn;

    // hsla conversions adapted from:
    // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

    function hue2rgb(p, q, h) {
      h = (h + 1) % 1;
      if (h * 6 < 1) {
        return p + (q - p) * h * 6;
      }
      if (h * 2 < 1) {
        return q;
      }
      if (h * 3 < 2) {
        return p + (q - p) * (2 / 3 - h) * 6;
      }
      return p;
    }

    spaces.hsla.to = function (rgba) {
      if (rgba[0] == null || rgba[1] == null || rgba[2] == null) {
        return [null, null, null, rgba[3]];
      }
      var r = rgba[0] / 255,
        g = rgba[1] / 255,
        b = rgba[2] / 255,
        a = rgba[3],
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        diff = max - min,
        add = max + min,
        l = add * 0.5,
        h,
        s;

      if (min === max) {
        h = 0;
      } else if (r === max) {
        h = (60 * (g - b)) / diff + 360;
      } else if (g === max) {
        h = (60 * (b - r)) / diff + 120;
      } else {
        h = (60 * (r - g)) / diff + 240;
      }

      // chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
      // otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
      if (diff === 0) {
        s = 0;
      } else if (l <= 0.5) {
        s = diff / add;
      } else {
        s = diff / (2 - add);
      }
      return [Math.round(h) % 360, s, l, a == null ? 1 : a];
    };

    spaces.hsla.from = function (hsla) {
      if (hsla[0] == null || hsla[1] == null || hsla[2] == null) {
        return [null, null, null, hsla[3]];
      }
      var h = hsla[0] / 360,
        s = hsla[1],
        l = hsla[2],
        a = hsla[3],
        q = l <= 0.5 ? l * (1 + s) : l + s - l * s,
        p = 2 * l - q;

      return [
        Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        Math.round(hue2rgb(p, q, h) * 255),
        Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
        a,
      ];
    };

    each(spaces, function (spaceName, space) {
      var props = space.props,
        cache = space.cache,
        to = space.to,
        from = space.from;

      // makes rgba() and hsla()
      color.fn[spaceName] = function (value) {
        // generate a cache for this space if it doesn't exist
        if (to && !this[cache]) {
          this[cache] = to(this._rgba);
        }
        if (value === undefined) {
          return this[cache].slice();
        }

        var ret,
          type = jQuery.type(value),
          arr = type === "array" || type === "object" ? value : arguments,
          local = this[cache].slice();

        each(props, function (key, prop) {
          var val = arr[type === "object" ? key : prop.idx];
          if (val == null) {
            val = local[prop.idx];
          }
          local[prop.idx] = clamp(val, prop);
        });

        if (from) {
          ret = color(from(local));
          ret[cache] = local;
          return ret;
        } else {
          return color(local);
        }
      };

      // makes red() green() blue() alpha() hue() saturation() lightness()
      each(props, function (key, prop) {
        // alpha is included in more than one space
        if (color.fn[key]) {
          return;
        }
        color.fn[key] = function (value) {
          var vtype = jQuery.type(value),
            fn = key === "alpha" ? (this._hsla ? "hsla" : "rgba") : spaceName,
            local = this[fn](),
            cur = local[prop.idx],
            match;

          if (vtype === "undefined") {
            return cur;
          }

          if (vtype === "function") {
            value = value.call(this, cur);
            vtype = jQuery.type(value);
          }
          if (value == null && prop.empty) {
            return this;
          }
          if (vtype === "string") {
            match = rplusequals.exec(value);
            if (match) {
              value = cur + parseFloat(match[2]) * (match[1] === "+" ? 1 : -1);
            }
          }
          local[prop.idx] = value;
          return this[fn](local);
        };
      });
    });

    // add cssHook and .fx.step function for each named hook.
    // accept a space separated string of properties
    color.hook = function (hook) {
      var hooks = hook.split(" ");
      each(hooks, function (i, hook) {
        jQuery.cssHooks[hook] = {
          set: function (elem, value) {
            var parsed,
              curElem,
              backgroundColor = "";

            if (
              value !== "transparent" &&
              (jQuery.type(value) !== "string" || (parsed = stringParse(value)))
            ) {
              value = color(parsed || value);
              if (!support.rgba && value._rgba[3] !== 1) {
                curElem = hook === "backgroundColor" ? elem.parentNode : elem;
                while (
                  (backgroundColor === "" ||
                    backgroundColor === "transparent") &&
                  curElem &&
                  curElem.style
                ) {
                  try {
                    backgroundColor = jQuery.css(curElem, "backgroundColor");
                    curElem = curElem.parentNode;
                  } catch (e) {}
                }

                value = value.blend(
                  backgroundColor && backgroundColor !== "transparent"
                    ? backgroundColor
                    : "_default"
                );
              }

              value = value.toRgbaString();
            }
            try {
              elem.style[hook] = value;
            } catch (e) {
              // wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
            }
          },
        };
        jQuery.fx.step[hook] = function (fx) {
          if (!fx.colorInit) {
            fx.start = color(fx.elem, hook);
            fx.end = color(fx.end);
            fx.colorInit = true;
          }
          jQuery.cssHooks[hook].set(
            fx.elem,
            fx.start.transition(fx.end, fx.pos)
          );
        };
      });
    };

    color.hook(stepHooks);

    jQuery.cssHooks.borderColor = {
      expand: function (value) {
        var expanded = {};

        each(["Top", "Right", "Bottom", "Left"], function (i, part) {
          expanded["border" + part + "Color"] = value;
        });
        return expanded;
      },
    };

    // Basic color names only.
    // Usage of any of the other color names requires adding yourself or including
    // jquery.color.svg-names.js.
    colors = jQuery.Color.names = {
      // 4.1. Basic color keywords
      aqua: "#00ffff",
      black: "#000000",
      blue: "#0000ff",
      fuchsia: "#ff00ff",
      gray: "#808080",
      green: "#008000",
      lime: "#00ff00",
      maroon: "#800000",
      navy: "#000080",
      olive: "#808000",
      purple: "#800080",
      red: "#ff0000",
      silver: "#c0c0c0",
      teal: "#008080",
      white: "#ffffff",
      yellow: "#ffff00",

      // 4.2.3. "transparent" color keyword
      transparent: [null, null, null, 0],

      _default: "#ffffff",
    };
  })(jQuery);

  /******************************************************************************/
  /****************************** CLASS ANIMATIONS ******************************/
  /******************************************************************************/
  (function () {
    var classAnimationActions = ["add", "remove", "toggle"],
      shorthandStyles = {
        border: 1,
        borderBottom: 1,
        borderColor: 1,
        borderLeft: 1,
        borderRight: 1,
        borderTop: 1,
        borderWidth: 1,
        margin: 1,
        padding: 1,
      };

    $.each(
      [
        "borderLeftStyle",
        "borderRightStyle",
        "borderBottomStyle",
        "borderTopStyle",
      ],
      function (_, prop) {
        $.fx.step[prop] = function (fx) {
          if (
            (fx.end !== "none" && !fx.setAttr) ||
            (fx.pos === 1 && !fx.setAttr)
          ) {
            jQuery.style(fx.elem, prop, fx.end);
            fx.setAttr = true;
          }
        };
      }
    );

    function getElementStyles(elem) {
      var key,
        len,
        style = elem.ownerDocument.defaultView
          ? elem.ownerDocument.defaultView.getComputedStyle(elem, null)
          : elem.currentStyle,
        styles = {};

      if (style && style.length && style[0] && style[style[0]]) {
        len = style.length;
        while (len--) {
          key = style[len];
          if (typeof style[key] === "string") {
            styles[$.camelCase(key)] = style[key];
          }
        }
        // support: Opera, IE <9
      } else {
        for (key in style) {
          if (typeof style[key] === "string") {
            styles[key] = style[key];
          }
        }
      }

      return styles;
    }

    function styleDifference(oldStyle, newStyle) {
      var diff = {},
        name,
        value;

      for (name in newStyle) {
        value = newStyle[name];
        if (oldStyle[name] !== value) {
          if (!shorthandStyles[name]) {
            if ($.fx.step[name] || !isNaN(parseFloat(value))) {
              diff[name] = value;
            }
          }
        }
      }

      return diff;
    }

    // support: jQuery <1.8
    if (!$.fn.addBack) {
      $.fn.addBack = function (selector) {
        return this.add(
          selector == null ? this.prevObject : this.prevObject.filter(selector)
        );
      };
    }

    $.effects.animateClass = function (value, duration, easing, callback) {
      var o = $.speed(duration, easing, callback);

      return this.queue(function () {
        var animated = $(this),
          baseClass = animated.attr("class") || "",
          applyClassChange,
          allAnimations = o.children ? animated.find("*").addBack() : animated;

        // map the animated objects to store the original styles.
        allAnimations = allAnimations.map(function () {
          var el = $(this);
          return {
            el: el,
            start: getElementStyles(this),
          };
        });

        // apply class change
        applyClassChange = function () {
          $.each(classAnimationActions, function (i, action) {
            if (value[action]) {
              animated[action + "Class"](value[action]);
            }
          });
        };
        applyClassChange();

        // map all animated objects again - calculate new styles and diff
        allAnimations = allAnimations.map(function () {
          this.end = getElementStyles(this.el[0]);
          this.diff = styleDifference(this.start, this.end);
          return this;
        });

        // apply original class
        animated.attr("class", baseClass);

        // map all animated objects again - this time collecting a promise
        allAnimations = allAnimations.map(function () {
          var styleInfo = this,
            dfd = $.Deferred(),
            opts = $.extend({}, o, {
              queue: false,
              complete: function () {
                dfd.resolve(styleInfo);
              },
            });

          this.el.animate(this.diff, opts);
          return dfd.promise();
        });

        // once all animations have completed:
        $.when.apply($, allAnimations.get()).done(function () {
          // set the final class
          applyClassChange();

          // for each animated element,
          // clear all css properties that were animated
          $.each(arguments, function () {
            var el = this.el;
            $.each(this.diff, function (key) {
              el.css(key, "");
            });
          });

          // this is guarnteed to be there if you use jQuery.speed()
          // it also handles dequeuing the next anim...
          o.complete.call(animated[0]);
        });
      });
    };

    $.fn.extend({
      addClass: (function (orig) {
        return function (classNames, speed, easing, callback) {
          return speed
            ? $.effects.animateClass.call(
                this,
                { add: classNames },
                speed,
                easing,
                callback
              )
            : orig.apply(this, arguments);
        };
      })($.fn.addClass),

      removeClass: (function (orig) {
        return function (classNames, speed, easing, callback) {
          return arguments.length > 1
            ? $.effects.animateClass.call(
                this,
                { remove: classNames },
                speed,
                easing,
                callback
              )
            : orig.apply(this, arguments);
        };
      })($.fn.removeClass),

      toggleClass: (function (orig) {
        return function (classNames, force, speed, easing, callback) {
          if (typeof force === "boolean" || force === undefined) {
            if (!speed) {
              // without speed parameter
              return orig.apply(this, arguments);
            } else {
              return $.effects.animateClass.call(
                this,
                force ? { add: classNames } : { remove: classNames },
                speed,
                easing,
                callback
              );
            }
          } else {
            // without force parameter
            return $.effects.animateClass.call(
              this,
              { toggle: classNames },
              force,
              speed,
              easing
            );
          }
        };
      })($.fn.toggleClass),

      switchClass: function (remove, add, speed, easing, callback) {
        return $.effects.animateClass.call(
          this,
          {
            add: add,
            remove: remove,
          },
          speed,
          easing,
          callback
        );
      },
    });
  })();

  /******************************************************************************/
  /*********************************** EFFECTS **********************************/
  /******************************************************************************/

  (function () {
    $.extend($.effects, {
      version: "1.11.4",

      // Saves a set of properties in a data storage
      save: function (element, set) {
        for (var i = 0; i < set.length; i++) {
          if (set[i] !== null) {
            element.data(dataSpace + set[i], element[0].style[set[i]]);
          }
        }
      },

      // Restores a set of previously saved properties from a data storage
      restore: function (element, set) {
        var val, i;
        for (i = 0; i < set.length; i++) {
          if (set[i] !== null) {
            val = element.data(dataSpace + set[i]);
            // support: jQuery 1.6.2
            // http://bugs.jquery.com/ticket/9917
            // jQuery 1.6.2 incorrectly returns undefined for any falsy value.
            // We can't differentiate between "" and 0 here, so we just assume
            // empty string since it's likely to be a more common value...
            if (val === undefined) {
              val = "";
            }
            element.css(set[i], val);
          }
        }
      },

      setMode: function (el, mode) {
        if (mode === "toggle") {
          mode = el.is(":hidden") ? "show" : "hide";
        }
        return mode;
      },

      // Translates a [top,left] array into a baseline value
      // this should be a little more flexible in the future to handle a string & hash
      getBaseline: function (origin, original) {
        var y, x;
        switch (origin[0]) {
          case "top":
            y = 0;
            break;
          case "middle":
            y = 0.5;
            break;
          case "bottom":
            y = 1;
            break;
          default:
            y = origin[0] / original.height;
        }
        switch (origin[1]) {
          case "left":
            x = 0;
            break;
          case "center":
            x = 0.5;
            break;
          case "right":
            x = 1;
            break;
          default:
            x = origin[1] / original.width;
        }
        return {
          x: x,
          y: y,
        };
      },

      // Wraps the element around a wrapper that copies position properties
      createWrapper: function (element) {
        // if the element is already wrapped, return it
        if (element.parent().is(".ui-effects-wrapper")) {
          return element.parent();
        }

        // wrap the element
        var props = {
            width: element.outerWidth(true),
            height: element.outerHeight(true),
            float: element.css("float"),
          },
          wrapper = $("<div></div>").addClass("ui-effects-wrapper").css({
            fontSize: "100%",
            background: "transparent",
            border: "none",
            margin: 0,
            padding: 0,
          }),
          // Store the size in case width/height are defined in % - Fixes #5245
          size = {
            width: element.width(),
            height: element.height(),
          },
          active = document.activeElement;

        // support: Firefox
        // Firefox incorrectly exposes anonymous content
        // https://bugzilla.mozilla.org/show_bug.cgi?id=561664
        try {
          active.id;
        } catch (e) {
          active = document.body;
        }

        element.wrap(wrapper);

        // Fixes #7595 - Elements lose focus when wrapped.
        if (element[0] === active || $.contains(element[0], active)) {
          $(active).focus();
        }

        wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

        // transfer positioning properties to the wrapper
        if (element.css("position") === "static") {
          wrapper.css({ position: "relative" });
          element.css({ position: "relative" });
        } else {
          $.extend(props, {
            position: element.css("position"),
            zIndex: element.css("z-index"),
          });
          $.each(["top", "left", "bottom", "right"], function (i, pos) {
            props[pos] = element.css(pos);
            if (isNaN(parseInt(props[pos], 10))) {
              props[pos] = "auto";
            }
          });
          element.css({
            position: "relative",
            top: 0,
            left: 0,
            right: "auto",
            bottom: "auto",
          });
        }
        element.css(size);

        return wrapper.css(props).show();
      },

      removeWrapper: function (element) {
        var active = document.activeElement;

        if (element.parent().is(".ui-effects-wrapper")) {
          element.parent().replaceWith(element);

          // Fixes #7595 - Elements lose focus when wrapped.
          if (element[0] === active || $.contains(element[0], active)) {
            $(active).focus();
          }
        }

        return element;
      },

      setTransition: function (element, list, factor, value) {
        value = value || {};
        $.each(list, function (i, x) {
          var unit = element.cssUnit(x);
          if (unit[0] > 0) {
            value[x] = unit[0] * factor + unit[1];
          }
        });
        return value;
      },
    });

    // return an effect options object for the given parameters:
    function _normalizeArguments(effect, options, speed, callback) {
      // allow passing all options as the first parameter
      if ($.isPlainObject(effect)) {
        options = effect;
        effect = effect.effect;
      }

      // convert to an object
      effect = { effect: effect };

      // catch (effect, null, ...)
      if (options == null) {
        options = {};
      }

      // catch (effect, callback)
      if ($.isFunction(options)) {
        callback = options;
        speed = null;
        options = {};
      }

      // catch (effect, speed, ?)
      if (typeof options === "number" || $.fx.speeds[options]) {
        callback = speed;
        speed = options;
        options = {};
      }

      // catch (effect, options, callback)
      if ($.isFunction(speed)) {
        callback = speed;
        speed = null;
      }

      // add options to effect
      if (options) {
        $.extend(effect, options);
      }

      speed = speed || options.duration;
      effect.duration = $.fx.off
        ? 0
        : typeof speed === "number"
        ? speed
        : speed in $.fx.speeds
        ? $.fx.speeds[speed]
        : $.fx.speeds._default;

      effect.complete = callback || options.complete;

      return effect;
    }

    function standardAnimationOption(option) {
      // Valid standard speeds (nothing, number, named speed)
      if (!option || typeof option === "number" || $.fx.speeds[option]) {
        return true;
      }

      // Invalid strings - treat as "normal" speed
      if (typeof option === "string" && !$.effects.effect[option]) {
        return true;
      }

      // Complete callback
      if ($.isFunction(option)) {
        return true;
      }

      // Options hash (but not naming an effect)
      if (typeof option === "object" && !option.effect) {
        return true;
      }

      // Didn't match any standard API
      return false;
    }

    $.fn.extend({
      effect: function (/* effect, options, speed, callback */) {
        var args = _normalizeArguments.apply(this, arguments),
          mode = args.mode,
          queue = args.queue,
          effectMethod = $.effects.effect[args.effect];

        if ($.fx.off || !effectMethod) {
          // delegate to the original method (e.g., .show()) if possible
          if (mode) {
            return this[mode](args.duration, args.complete);
          } else {
            return this.each(function () {
              if (args.complete) {
                args.complete.call(this);
              }
            });
          }
        }

        function run(next) {
          var elem = $(this),
            complete = args.complete,
            mode = args.mode;

          function done() {
            if ($.isFunction(complete)) {
              complete.call(elem[0]);
            }
            if ($.isFunction(next)) {
              next();
            }
          }

          // If the element already has the correct final state, delegate to
          // the core methods so the internal tracking of "olddisplay" works.
          if (elem.is(":hidden") ? mode === "hide" : mode === "show") {
            elem[mode]();
            done();
          } else {
            effectMethod.call(elem[0], args, done);
          }
        }

        return queue === false
          ? this.each(run)
          : this.queue(queue || "fx", run);
      },

      show: (function (orig) {
        return function (option) {
          if (standardAnimationOption(option)) {
            return orig.apply(this, arguments);
          } else {
            var args = _normalizeArguments.apply(this, arguments);
            args.mode = "show";
            return this.effect.call(this, args);
          }
        };
      })($.fn.show),

      hide: (function (orig) {
        return function (option) {
          if (standardAnimationOption(option)) {
            return orig.apply(this, arguments);
          } else {
            var args = _normalizeArguments.apply(this, arguments);
            args.mode = "hide";
            return this.effect.call(this, args);
          }
        };
      })($.fn.hide),

      toggle: (function (orig) {
        return function (option) {
          if (standardAnimationOption(option) || typeof option === "boolean") {
            return orig.apply(this, arguments);
          } else {
            var args = _normalizeArguments.apply(this, arguments);
            args.mode = "toggle";
            return this.effect.call(this, args);
          }
        };
      })($.fn.toggle),

      // helper functions
      cssUnit: function (key) {
        var style = this.css(key),
          val = [];

        $.each(["em", "px", "%", "pt"], function (i, unit) {
          if (style.indexOf(unit) > 0) {
            val = [parseFloat(style), unit];
          }
        });
        return val;
      },
    });
  })();

  /******************************************************************************/
  /*********************************** EASING ***********************************/
  /******************************************************************************/

  (function () {
    // based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

    var baseEasings = {};

    $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
      baseEasings[name] = function (p) {
        return Math.pow(p, i + 2);
      };
    });

    $.extend(baseEasings, {
      Sine: function (p) {
        return 1 - Math.cos((p * Math.PI) / 2);
      },
      Circ: function (p) {
        return 1 - Math.sqrt(1 - p * p);
      },
      Elastic: function (p) {
        return p === 0 || p === 1
          ? p
          : -Math.pow(2, 8 * (p - 1)) *
              Math.sin((((p - 1) * 80 - 7.5) * Math.PI) / 15);
      },
      Back: function (p) {
        return p * p * (3 * p - 2);
      },
      Bounce: function (p) {
        var pow2,
          bounce = 4;

        while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
        return (
          1 / Math.pow(4, 3 - bounce) -
          7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2)
        );
      },
    });

    $.each(baseEasings, function (name, easeIn) {
      $.easing["easeIn" + name] = easeIn;
      $.easing["easeOut" + name] = function (p) {
        return 1 - easeIn(1 - p);
      };
      $.easing["easeInOut" + name] = function (p) {
        return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2;
      };
    });
  })();

  var effect = $.effects;

  /*!
   * jQuery UI Effects Slide 1.11.4
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/slide-effect/
   */

  /*var effectSlide = $.effects.effect.slide = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "width", "height" ],
		mode = $.effects.setMode( el, o.mode || "show" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		distance,
		animation = {};

	// Adjust
	$.effects.save( el, props );
	el.show();
	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true );

	$.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	if ( show ) {
		el.css( ref, positiveMotion ? (isNaN(distance) ? "-" + distance : -distance) : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( positiveMotion ? "+=" : "-=") :
		( positiveMotion ? "-=" : "+=")) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};
*/
});
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.16.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : (global.Popper = factory());
})(this, function () {
  "use strict";

  var isBrowser =
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined";

  var timeoutDuration = (function () {
    var longerTimeoutBrowsers = ["Edge", "Trident", "Firefox"];
    for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
      if (
        isBrowser &&
        navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0
      ) {
        return 1;
      }
    }
    return 0;
  })();

  function microtaskDebounce(fn) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.Promise.resolve().then(function () {
        called = false;
        fn();
      });
    };
  }

  function taskDebounce(fn) {
    var scheduled = false;
    return function () {
      if (!scheduled) {
        scheduled = true;
        setTimeout(function () {
          scheduled = false;
          fn();
        }, timeoutDuration);
      }
    };
  }

  var supportsMicroTasks = isBrowser && window.Promise;

  /**
   * Create a debounced version of a method, that's asynchronously deferred
   * but called in the minimum time possible.
   *
   * @method
   * @memberof Popper.Utils
   * @argument {Function} fn
   * @returns {Function}
   */
  var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction(functionToCheck) {
    var getType = {};
    return (
      functionToCheck &&
      getType.toString.call(functionToCheck) === "[object Function]"
    );
  }

  /**
   * Get CSS computed property of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Eement} element
   * @argument {String} property
   */
  function getStyleComputedProperty(element, property) {
    if (element.nodeType !== 1) {
      return [];
    }
    // NOTE: 1 DOM access here
    var window = element.ownerDocument.defaultView;
    var css = window.getComputedStyle(element, null);
    return property ? css[property] : css;
  }

  /**
   * Returns the parentNode or the host of the element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} parent
   */
  function getParentNode(element) {
    if (element.nodeName === "HTML") {
      return element;
    }
    return element.parentNode || element.host;
  }

  /**
   * Returns the scrolling parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} scroll parent
   */
  function getScrollParent(element) {
    // Return body, `getScroll` will take care to get the correct `scrollTop` from it
    if (!element) {
      return document.body;
    }

    switch (element.nodeName) {
      case "HTML":
      case "BODY":
        return element.ownerDocument.body;
      case "#document":
        return element.body;
    }

    // Firefox want us to check `-x` and `-y` variations as well

    var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      return element;
    }

    return getScrollParent(getParentNode(element));
  }

  /**
   * Returns the reference node of the reference object, or the reference object itself.
   * @method
   * @memberof Popper.Utils
   * @param {Element|Object} reference - the reference element (the popper will be relative to this)
   * @returns {Element} parent
   */
  function getReferenceNode(reference) {
    return reference && reference.referenceNode
      ? reference.referenceNode
      : reference;
  }

  var isIE11 =
    isBrowser && !!(window.MSInputMethodContext && document.documentMode);
  var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

  /**
   * Determines if the browser is Internet Explorer
   * @method
   * @memberof Popper.Utils
   * @param {Number} version to check
   * @returns {Boolean} isIE
   */
  function isIE(version) {
    if (version === 11) {
      return isIE11;
    }
    if (version === 10) {
      return isIE10;
    }
    return isIE11 || isIE10;
  }

  /**
   * Returns the offset parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} offset parent
   */
  function getOffsetParent(element) {
    if (!element) {
      return document.documentElement;
    }

    var noOffsetParent = isIE(10) ? document.body : null;

    // NOTE: 1 DOM access here
    var offsetParent = element.offsetParent || null;
    // Skip hidden elements which don't have an offsetParent
    while (offsetParent === noOffsetParent && element.nextElementSibling) {
      offsetParent = (element = element.nextElementSibling).offsetParent;
    }

    var nodeName = offsetParent && offsetParent.nodeName;

    if (!nodeName || nodeName === "BODY" || nodeName === "HTML") {
      return element
        ? element.ownerDocument.documentElement
        : document.documentElement;
    }

    // .offsetParent will return the closest TH, TD or TABLE in case
    // no offsetParent is present, I hate this job...
    if (
      ["TH", "TD", "TABLE"].indexOf(offsetParent.nodeName) !== -1 &&
      getStyleComputedProperty(offsetParent, "position") === "static"
    ) {
      return getOffsetParent(offsetParent);
    }

    return offsetParent;
  }

  function isOffsetContainer(element) {
    var nodeName = element.nodeName;

    if (nodeName === "BODY") {
      return false;
    }
    return (
      nodeName === "HTML" ||
      getOffsetParent(element.firstElementChild) === element
    );
  }

  /**
   * Finds the root node (document, shadowDOM root) of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} node
   * @returns {Element} root node
   */
  function getRoot(node) {
    if (node.parentNode !== null) {
      return getRoot(node.parentNode);
    }

    return node;
  }

  /**
   * Finds the offset parent common to the two provided nodes
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element1
   * @argument {Element} element2
   * @returns {Element} common offset parent
   */
  function findCommonOffsetParent(element1, element2) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
      return document.documentElement;
    }

    // Here we make sure to give as "start" the element that comes first in the DOM
    var order =
      element1.compareDocumentPosition(element2) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    var start = order ? element1 : element2;
    var end = order ? element2 : element1;

    // Get common ancestor container
    var range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    var commonAncestorContainer = range.commonAncestorContainer;

    // Both nodes are inside #document

    if (
      (element1 !== commonAncestorContainer &&
        element2 !== commonAncestorContainer) ||
      start.contains(end)
    ) {
      if (isOffsetContainer(commonAncestorContainer)) {
        return commonAncestorContainer;
      }

      return getOffsetParent(commonAncestorContainer);
    }

    // one of the nodes is inside shadowDOM, find which one
    var element1root = getRoot(element1);
    if (element1root.host) {
      return findCommonOffsetParent(element1root.host, element2);
    } else {
      return findCommonOffsetParent(element1, getRoot(element2).host);
    }
  }

  /**
   * Gets the scroll value of the given element in the given side (top and left)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {String} side `top` or `left`
   * @returns {number} amount of scrolled pixels
   */
  function getScroll(element) {
    var side =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "top";

    var upperSide = side === "top" ? "scrollTop" : "scrollLeft";
    var nodeName = element.nodeName;

    if (nodeName === "BODY" || nodeName === "HTML") {
      var html = element.ownerDocument.documentElement;
      var scrollingElement = element.ownerDocument.scrollingElement || html;
      return scrollingElement[upperSide];
    }

    return element[upperSide];
  }

  /*
   * Sum or subtract the element scroll values (left and top) from a given rect object
   * @method
   * @memberof Popper.Utils
   * @param {Object} rect - Rect object you want to change
   * @param {HTMLElement} element - The element from the function reads the scroll values
   * @param {Boolean} subtract - set to true if you want to subtract the scroll values
   * @return {Object} rect - The modifier rect object
   */
  function includeScroll(rect, element) {
    var subtract =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var scrollTop = getScroll(element, "top");
    var scrollLeft = getScroll(element, "left");
    var modifier = subtract ? -1 : 1;
    rect.top += scrollTop * modifier;
    rect.bottom += scrollTop * modifier;
    rect.left += scrollLeft * modifier;
    rect.right += scrollLeft * modifier;
    return rect;
  }

  /*
   * Helper to detect borders of a given element
   * @method
   * @memberof Popper.Utils
   * @param {CSSStyleDeclaration} styles
   * Result of `getStyleComputedProperty` on the given element
   * @param {String} axis - `x` or `y`
   * @return {number} borders - The borders size of the given axis
   */

  function getBordersSize(styles, axis) {
    var sideA = axis === "x" ? "Left" : "Top";
    var sideB = sideA === "Left" ? "Right" : "Bottom";

    return (
      parseFloat(styles["border" + sideA + "Width"]) +
      parseFloat(styles["border" + sideB + "Width"])
    );
  }

  function getSize(axis, body, html, computedStyle) {
    return Math.max(
      body["offset" + axis],
      body["scroll" + axis],
      html["client" + axis],
      html["offset" + axis],
      html["scroll" + axis],
      isIE(10)
        ? parseInt(html["offset" + axis]) +
            parseInt(
              computedStyle["margin" + (axis === "Height" ? "Top" : "Left")]
            ) +
            parseInt(
              computedStyle["margin" + (axis === "Height" ? "Bottom" : "Right")]
            )
        : 0
    );
  }

  function getWindowSizes(document) {
    var body = document.body;
    var html = document.documentElement;
    var computedStyle = isIE(10) && getComputedStyle(html);

    return {
      height: getSize("Height", body, html, computedStyle),
      width: getSize("Width", body, html, computedStyle),
    };
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

  /**
   * Given element offsets, generate an output similar to getBoundingClientRect
   * @method
   * @memberof Popper.Utils
   * @argument {Object} offsets
   * @returns {Object} ClientRect like output
   */
  function getClientRect(offsets) {
    return _extends({}, offsets, {
      right: offsets.left + offsets.width,
      bottom: offsets.top + offsets.height,
    });
  }

  /**
   * Get bounding client rect of given element
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} element
   * @return {Object} client rect
   */
  function getBoundingClientRect(element) {
    var rect = {};

    // IE10 10 FIX: Please, don't ask, the element isn't
    // considered in DOM in some circumstances...
    // This isn't reproducible in IE10 compatibility mode of IE11
    try {
      if (isIE(10)) {
        rect = element.getBoundingClientRect();
        var scrollTop = getScroll(element, "top");
        var scrollLeft = getScroll(element, "left");
        rect.top += scrollTop;
        rect.left += scrollLeft;
        rect.bottom += scrollTop;
        rect.right += scrollLeft;
      } else {
        rect = element.getBoundingClientRect();
      }
    } catch (e) {}

    var result = {
      left: rect.left,
      top: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    };

    // subtract scrollbar size from sizes
    var sizes =
      element.nodeName === "HTML" ? getWindowSizes(element.ownerDocument) : {};
    var width = sizes.width || element.clientWidth || result.width;
    var height = sizes.height || element.clientHeight || result.height;

    var horizScrollbar = element.offsetWidth - width;
    var vertScrollbar = element.offsetHeight - height;

    // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
    // we make this check conditional for performance reasons
    if (horizScrollbar || vertScrollbar) {
      var styles = getStyleComputedProperty(element);
      horizScrollbar -= getBordersSize(styles, "x");
      vertScrollbar -= getBordersSize(styles, "y");

      result.width -= horizScrollbar;
      result.height -= vertScrollbar;
    }

    return getClientRect(result);
  }

  function getOffsetRectRelativeToArbitraryNode(children, parent) {
    var fixedPosition =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var isIE10 = isIE(10);
    var isHTML = parent.nodeName === "HTML";
    var childrenRect = getBoundingClientRect(children);
    var parentRect = getBoundingClientRect(parent);
    var scrollParent = getScrollParent(children);

    var styles = getStyleComputedProperty(parent);
    var borderTopWidth = parseFloat(styles.borderTopWidth);
    var borderLeftWidth = parseFloat(styles.borderLeftWidth);

    // In cases where the parent is fixed, we must ignore negative scroll in offset calc
    if (fixedPosition && isHTML) {
      parentRect.top = Math.max(parentRect.top, 0);
      parentRect.left = Math.max(parentRect.left, 0);
    }
    var offsets = getClientRect({
      top: childrenRect.top - parentRect.top - borderTopWidth,
      left: childrenRect.left - parentRect.left - borderLeftWidth,
      width: childrenRect.width,
      height: childrenRect.height,
    });
    offsets.marginTop = 0;
    offsets.marginLeft = 0;

    // Subtract margins of documentElement in case it's being used as parent
    // we do this only on HTML because it's the only element that behaves
    // differently when margins are applied to it. The margins are included in
    // the box of the documentElement, in the other cases not.
    if (!isIE10 && isHTML) {
      var marginTop = parseFloat(styles.marginTop);
      var marginLeft = parseFloat(styles.marginLeft);

      offsets.top -= borderTopWidth - marginTop;
      offsets.bottom -= borderTopWidth - marginTop;
      offsets.left -= borderLeftWidth - marginLeft;
      offsets.right -= borderLeftWidth - marginLeft;

      // Attach marginTop and marginLeft because in some circumstances we may need them
      offsets.marginTop = marginTop;
      offsets.marginLeft = marginLeft;
    }

    if (
      isIE10 && !fixedPosition
        ? parent.contains(scrollParent)
        : parent === scrollParent && scrollParent.nodeName !== "BODY"
    ) {
      offsets = includeScroll(offsets, parent);
    }

    return offsets;
  }

  function getViewportOffsetRectRelativeToArtbitraryNode(element) {
    var excludeScroll =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var html = element.ownerDocument.documentElement;
    var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
    var width = Math.max(html.clientWidth, window.innerWidth || 0);
    var height = Math.max(html.clientHeight, window.innerHeight || 0);

    var scrollTop = !excludeScroll ? getScroll(html) : 0;
    var scrollLeft = !excludeScroll ? getScroll(html, "left") : 0;

    var offset = {
      top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
      left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
      width: width,
      height: height,
    };

    return getClientRect(offset);
  }

  /**
   * Check if the given element is fixed or is inside a fixed parent
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {Element} customContainer
   * @returns {Boolean} answer to "isFixed?"
   */
  function isFixed(element) {
    var nodeName = element.nodeName;
    if (nodeName === "BODY" || nodeName === "HTML") {
      return false;
    }
    if (getStyleComputedProperty(element, "position") === "fixed") {
      return true;
    }
    var parentNode = getParentNode(element);
    if (!parentNode) {
      return false;
    }
    return isFixed(parentNode);
  }

  /**
   * Finds the first parent of an element that has a transformed property defined
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} first transformed parent or documentElement
   */

  function getFixedPositionOffsetParent(element) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element || !element.parentElement || isIE()) {
      return document.documentElement;
    }
    var el = element.parentElement;
    while (el && getStyleComputedProperty(el, "transform") === "none") {
      el = el.parentElement;
    }
    return el || document.documentElement;
  }

  /**
   * Computed the boundaries limits and return them
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} popper
   * @param {HTMLElement} reference
   * @param {number} padding
   * @param {HTMLElement} boundariesElement - Element used to define the boundaries
   * @param {Boolean} fixedPosition - Is in fixed position mode
   * @returns {Object} Coordinates of the boundaries
   */
  function getBoundaries(popper, reference, padding, boundariesElement) {
    var fixedPosition =
      arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    // NOTE: 1 DOM access here

    var boundaries = { top: 0, left: 0 };
    var offsetParent = fixedPosition
      ? getFixedPositionOffsetParent(popper)
      : findCommonOffsetParent(popper, getReferenceNode(reference));

    // Handle viewport case
    if (boundariesElement === "viewport") {
      boundaries = getViewportOffsetRectRelativeToArtbitraryNode(
        offsetParent,
        fixedPosition
      );
    } else {
      // Handle other cases based on DOM element used as boundaries
      var boundariesNode = void 0;
      if (boundariesElement === "scrollParent") {
        boundariesNode = getScrollParent(getParentNode(reference));
        if (boundariesNode.nodeName === "BODY") {
          boundariesNode = popper.ownerDocument.documentElement;
        }
      } else if (boundariesElement === "window") {
        boundariesNode = popper.ownerDocument.documentElement;
      } else {
        boundariesNode = boundariesElement;
      }

      var offsets = getOffsetRectRelativeToArbitraryNode(
        boundariesNode,
        offsetParent,
        fixedPosition
      );

      // In case of HTML, we need a different computation
      if (boundariesNode.nodeName === "HTML" && !isFixed(offsetParent)) {
        var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

        boundaries.top += offsets.top - offsets.marginTop;
        boundaries.bottom = height + offsets.top;
        boundaries.left += offsets.left - offsets.marginLeft;
        boundaries.right = width + offsets.left;
      } else {
        // for all the other DOM elements, this one is good
        boundaries = offsets;
      }
    }

    // Add paddings
    padding = padding || 0;
    var isPaddingNumber = typeof padding === "number";
    boundaries.left += isPaddingNumber ? padding : padding.left || 0;
    boundaries.top += isPaddingNumber ? padding : padding.top || 0;
    boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
    boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

    return boundaries;
  }

  function getArea(_ref) {
    var width = _ref.width,
      height = _ref.height;

    return width * height;
  }

  /**
   * Utility used to transform the `auto` placement to the placement with more
   * available space.
   * @method
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeAutoPlacement(
    placement,
    refRect,
    popper,
    reference,
    boundariesElement
  ) {
    var padding =
      arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    if (placement.indexOf("auto") === -1) {
      return placement;
    }

    var boundaries = getBoundaries(
      popper,
      reference,
      padding,
      boundariesElement
    );

    var rects = {
      top: {
        width: boundaries.width,
        height: refRect.top - boundaries.top,
      },
      right: {
        width: boundaries.right - refRect.right,
        height: boundaries.height,
      },
      bottom: {
        width: boundaries.width,
        height: boundaries.bottom - refRect.bottom,
      },
      left: {
        width: refRect.left - boundaries.left,
        height: boundaries.height,
      },
    };

    var sortedAreas = Object.keys(rects)
      .map(function (key) {
        return _extends(
          {
            key: key,
          },
          rects[key],
          {
            area: getArea(rects[key]),
          }
        );
      })
      .sort(function (a, b) {
        return b.area - a.area;
      });

    var filteredAreas = sortedAreas.filter(function (_ref2) {
      var width = _ref2.width,
        height = _ref2.height;
      return width >= popper.clientWidth && height >= popper.clientHeight;
    });

    var computedPlacement =
      filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

    var variation = placement.split("-")[1];

    return computedPlacement + (variation ? "-" + variation : "");
  }

  /**
   * Get offsets to the reference element
   * @method
   * @memberof Popper.Utils
   * @param {Object} state
   * @param {Element} popper - the popper element
   * @param {Element} reference - the reference element (the popper will be relative to this)
   * @param {Element} fixedPosition - is in fixed position mode
   * @returns {Object} An object containing the offsets which will be applied to the popper
   */
  function getReferenceOffsets(state, popper, reference) {
    var fixedPosition =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var commonOffsetParent = fixedPosition
      ? getFixedPositionOffsetParent(popper)
      : findCommonOffsetParent(popper, getReferenceNode(reference));
    return getOffsetRectRelativeToArbitraryNode(
      reference,
      commonOffsetParent,
      fixedPosition
    );
  }

  /**
   * Get the outer sizes of the given element (offset size + margins)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Object} object containing width and height properties
   */
  function getOuterSizes(element) {
    var window = element.ownerDocument.defaultView;
    var styles = window.getComputedStyle(element);
    var x =
      parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
    var y =
      parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
    var result = {
      width: element.offsetWidth + y,
      height: element.offsetHeight + x,
    };
    return result;
  }

  /**
   * Get the opposite placement of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement
   * @returns {String} flipped placement
   */
  function getOppositePlacement(placement) {
    var hash = { left: "right", right: "left", bottom: "top", top: "bottom" };
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash[matched];
    });
  }

  /**
   * Get offsets to the popper
   * @method
   * @memberof Popper.Utils
   * @param {Object} position - CSS position the Popper will get applied
   * @param {HTMLElement} popper - the popper element
   * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
   * @param {String} placement - one of the valid placement options
   * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
   */
  function getPopperOffsets(popper, referenceOffsets, placement) {
    placement = placement.split("-")[0];

    // Get popper node sizes
    var popperRect = getOuterSizes(popper);

    // Add position, width and height to our offsets object
    var popperOffsets = {
      width: popperRect.width,
      height: popperRect.height,
    };

    // depending by the popper placement we have to compute its offsets slightly differently
    var isHoriz = ["right", "left"].indexOf(placement) !== -1;
    var mainSide = isHoriz ? "top" : "left";
    var secondarySide = isHoriz ? "left" : "top";
    var measurement = isHoriz ? "height" : "width";
    var secondaryMeasurement = !isHoriz ? "height" : "width";

    popperOffsets[mainSide] =
      referenceOffsets[mainSide] +
      referenceOffsets[measurement] / 2 -
      popperRect[measurement] / 2;
    if (placement === secondarySide) {
      popperOffsets[secondarySide] =
        referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
    } else {
      popperOffsets[secondarySide] =
        referenceOffsets[getOppositePlacement(secondarySide)];
    }

    return popperOffsets;
  }

  /**
   * Mimics the `find` method of Array
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function find(arr, check) {
    // use native find if supported
    if (Array.prototype.find) {
      return arr.find(check);
    }

    // use `filter` to obtain the same behavior of `find`
    return arr.filter(check)[0];
  }

  /**
   * Return the index of the matching object
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function findIndex(arr, prop, value) {
    // use native findIndex if supported
    if (Array.prototype.findIndex) {
      return arr.findIndex(function (cur) {
        return cur[prop] === value;
      });
    }

    // use `find` + `indexOf` if `findIndex` isn't supported
    var match = find(arr, function (obj) {
      return obj[prop] === value;
    });
    return arr.indexOf(match);
  }

  /**
   * Loop trough the list of modifiers and run them in order,
   * each of them will then edit the data object.
   * @method
   * @memberof Popper.Utils
   * @param {dataObject} data
   * @param {Array} modifiers
   * @param {String} ends - Optional modifier name used as stopper
   * @returns {dataObject}
   */
  function runModifiers(modifiers, data, ends) {
    var modifiersToRun =
      ends === undefined
        ? modifiers
        : modifiers.slice(0, findIndex(modifiers, "name", ends));

    modifiersToRun.forEach(function (modifier) {
      if (modifier["function"]) {
        // eslint-disable-line dot-notation
        console.warn("`modifier.function` is deprecated, use `modifier.fn`!");
      }
      var fn = modifier["function"] || modifier.fn; // eslint-disable-line dot-notation
      if (modifier.enabled && isFunction(fn)) {
        // Add properties to offsets to make them a complete clientRect object
        // we do this before each modifier to make sure the previous one doesn't
        // mess with these values
        data.offsets.popper = getClientRect(data.offsets.popper);
        data.offsets.reference = getClientRect(data.offsets.reference);

        data = fn(data, modifier);
      }
    });

    return data;
  }

  /**
   * Updates the position of the popper, computing the new offsets and applying
   * the new style.<br />
   * Prefer `scheduleUpdate` over `update` because of performance reasons.
   * @method
   * @memberof Popper
   */
  function update() {
    // if popper is destroyed, don't perform any further update
    if (this.state.isDestroyed) {
      return;
    }

    var data = {
      instance: this,
      styles: {},
      arrowStyles: {},
      attributes: {},
      flipped: false,
      offsets: {},
    };

    // compute reference element offsets
    data.offsets.reference = getReferenceOffsets(
      this.state,
      this.popper,
      this.reference,
      this.options.positionFixed
    );

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    data.placement = computeAutoPlacement(
      this.options.placement,
      data.offsets.reference,
      this.popper,
      this.reference,
      this.options.modifiers.flip.boundariesElement,
      this.options.modifiers.flip.padding
    );

    // store the computed placement inside `originalPlacement`
    data.originalPlacement = data.placement;

    data.positionFixed = this.options.positionFixed;

    // compute the popper offsets
    data.offsets.popper = getPopperOffsets(
      this.popper,
      data.offsets.reference,
      data.placement
    );

    data.offsets.popper.position = this.options.positionFixed
      ? "fixed"
      : "absolute";

    // run the modifiers
    data = runModifiers(this.modifiers, data);

    // the first `update` will call `onCreate` callback
    // the other ones will call `onUpdate` callback
    if (!this.state.isCreated) {
      this.state.isCreated = true;
      this.options.onCreate(data);
    } else {
      this.options.onUpdate(data);
    }
  }

  /**
   * Helper used to know if the given modifier is enabled.
   * @method
   * @memberof Popper.Utils
   * @returns {Boolean}
   */
  function isModifierEnabled(modifiers, modifierName) {
    return modifiers.some(function (_ref) {
      var name = _ref.name,
        enabled = _ref.enabled;
      return enabled && name === modifierName;
    });
  }

  /**
   * Get the prefixed supported property name
   * @method
   * @memberof Popper.Utils
   * @argument {String} property (camelCase)
   * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
   */
  function getSupportedPropertyName(property) {
    var prefixes = [false, "ms", "Webkit", "Moz", "O"];
    var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      var toCheck = prefix ? "" + prefix + upperProp : property;
      if (typeof document.body.style[toCheck] !== "undefined") {
        return toCheck;
      }
    }
    return null;
  }

  /**
   * Destroys the popper.
   * @method
   * @memberof Popper
   */
  function destroy() {
    this.state.isDestroyed = true;

    // touch DOM only if `applyStyle` modifier is enabled
    if (isModifierEnabled(this.modifiers, "applyStyle")) {
      this.popper.removeAttribute("x-placement");
      this.popper.style.position = "";
      this.popper.style.top = "";
      this.popper.style.left = "";
      this.popper.style.right = "";
      this.popper.style.bottom = "";
      this.popper.style.willChange = "";
      this.popper.style[getSupportedPropertyName("transform")] = "";
    }

    this.disableEventListeners();

    // remove the popper if user explicitly asked for the deletion on destroy
    // do not use `remove` because IE11 doesn't support it
    if (this.options.removeOnDestroy) {
      this.popper.parentNode.removeChild(this.popper);
    }
    return this;
  }

  /**
   * Get the window associated with the element
   * @argument {Element} element
   * @returns {Window}
   */
  function getWindow(element) {
    var ownerDocument = element.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView : window;
  }

  function attachToScrollParents(scrollParent, event, callback, scrollParents) {
    var isBody = scrollParent.nodeName === "BODY";
    var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
    target.addEventListener(event, callback, { passive: true });

    if (!isBody) {
      attachToScrollParents(
        getScrollParent(target.parentNode),
        event,
        callback,
        scrollParents
      );
    }
    scrollParents.push(target);
  }

  /**
   * Setup needed event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function setupEventListeners(reference, options, state, updateBound) {
    // Resize event listener on window
    state.updateBound = updateBound;
    getWindow(reference).addEventListener("resize", state.updateBound, {
      passive: true,
    });

    // Scroll event listener on scroll parents
    var scrollElement = getScrollParent(reference);
    attachToScrollParents(
      scrollElement,
      "scroll",
      state.updateBound,
      state.scrollParents
    );
    state.scrollElement = scrollElement;
    state.eventsEnabled = true;

    return state;
  }

  /**
   * It will add resize/scroll events and start recalculating
   * position of the popper element when they are triggered.
   * @method
   * @memberof Popper
   */
  function enableEventListeners() {
    if (!this.state.eventsEnabled) {
      this.state = setupEventListeners(
        this.reference,
        this.options,
        this.state,
        this.scheduleUpdate
      );
    }
  }

  /**
   * Remove event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function removeEventListeners(reference, state) {
    // Remove resize event listener on window
    getWindow(reference).removeEventListener("resize", state.updateBound);

    // Remove scroll event listener on scroll parents
    state.scrollParents.forEach(function (target) {
      target.removeEventListener("scroll", state.updateBound);
    });

    // Reset state
    state.updateBound = null;
    state.scrollParents = [];
    state.scrollElement = null;
    state.eventsEnabled = false;
    return state;
  }

  /**
   * It will remove resize/scroll events and won't recalculate popper position
   * when they are triggered. It also won't trigger `onUpdate` callback anymore,
   * unless you call `update` method manually.
   * @method
   * @memberof Popper
   */
  function disableEventListeners() {
    if (this.state.eventsEnabled) {
      cancelAnimationFrame(this.scheduleUpdate);
      this.state = removeEventListeners(this.reference, this.state);
    }
  }

  /**
   * Tells if a given input is a number
   * @method
   * @memberof Popper.Utils
   * @param {*} input to check
   * @return {Boolean}
   */
  function isNumeric(n) {
    return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Set the style to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the style to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) {
      var unit = "";
      // add unit if the value is numeric and is one of the following
      if (
        ["width", "height", "top", "right", "bottom", "left"].indexOf(prop) !==
          -1 &&
        isNumeric(styles[prop])
      ) {
        unit = "px";
      }
      element.style[prop] = styles[prop] + unit;
    });
  }

  /**
   * Set the attributes to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the attributes to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(function (prop) {
      var value = attributes[prop];
      if (value !== false) {
        element.setAttribute(prop, attributes[prop]);
      } else {
        element.removeAttribute(prop);
      }
    });
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} data.styles - List of style properties - values to apply to popper element
   * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The same data object
   */
  function applyStyle(data) {
    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    setStyles(data.instance.popper, data.styles);

    // any property present in `data.attributes` will be applied to the popper,
    // they will be set as HTML attributes of the element
    setAttributes(data.instance.popper, data.attributes);

    // if arrowElement is defined and arrowStyles has some properties
    if (data.arrowElement && Object.keys(data.arrowStyles).length) {
      setStyles(data.arrowElement, data.arrowStyles);
    }

    return data;
  }

  /**
   * Set the x-placement attribute before everything else because it could be used
   * to add margins to the popper margins needs to be calculated to get the
   * correct popper offsets.
   * @method
   * @memberof Popper.modifiers
   * @param {HTMLElement} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper
   * @param {Object} options - Popper.js options
   */
  function applyStyleOnLoad(
    reference,
    popper,
    options,
    modifierOptions,
    state
  ) {
    // compute reference element offsets
    var referenceOffsets = getReferenceOffsets(
      state,
      popper,
      reference,
      options.positionFixed
    );

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    var placement = computeAutoPlacement(
      options.placement,
      referenceOffsets,
      popper,
      reference,
      options.modifiers.flip.boundariesElement,
      options.modifiers.flip.padding
    );

    popper.setAttribute("x-placement", placement);

    // Apply `position` to popper before anything else because
    // without the position applied we can't guarantee correct computations
    setStyles(popper, {
      position: options.positionFixed ? "fixed" : "absolute",
    });

    return options;
  }

  /**
   * @function
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Boolean} shouldRound - If the offsets should be rounded at all
   * @returns {Object} The popper's position offsets rounded
   *
   * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
   * good as it can be within reason.
   * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
   *
   * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
   * as well on High DPI screens).
   *
   * Firefox prefers no rounding for positioning and does not have blurriness on
   * high DPI screens.
   *
   * Only horizontal placement and left/right values need to be considered.
   */
  function getRoundedOffsets(data, shouldRound) {
    var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
    var round = Math.round,
      floor = Math.floor;

    var noRound = function noRound(v) {
      return v;
    };

    var referenceWidth = round(reference.width);
    var popperWidth = round(popper.width);

    var isVertical = ["left", "right"].indexOf(data.placement) !== -1;
    var isVariation = data.placement.indexOf("-") !== -1;
    var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
    var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

    var horizontalToInteger = !shouldRound
      ? noRound
      : isVertical || isVariation || sameWidthParity
      ? round
      : floor;
    var verticalToInteger = !shouldRound ? noRound : round;

    return {
      left: horizontalToInteger(
        bothOddWidth && !isVariation && shouldRound
          ? popper.left - 1
          : popper.left
      ),
      top: verticalToInteger(popper.top),
      bottom: verticalToInteger(popper.bottom),
      right: horizontalToInteger(popper.right),
    };
  }

  var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeStyle(data, options) {
    var x = options.x,
      y = options.y;
    var popper = data.offsets.popper;

    // Remove this legacy support in Popper.js v2

    var legacyGpuAccelerationOption = find(
      data.instance.modifiers,
      function (modifier) {
        return modifier.name === "applyStyle";
      }
    ).gpuAcceleration;
    if (legacyGpuAccelerationOption !== undefined) {
      console.warn(
        "WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!"
      );
    }
    var gpuAcceleration =
      legacyGpuAccelerationOption !== undefined
        ? legacyGpuAccelerationOption
        : options.gpuAcceleration;

    var offsetParent = getOffsetParent(data.instance.popper);
    var offsetParentRect = getBoundingClientRect(offsetParent);

    // Styles
    var styles = {
      position: popper.position,
    };

    var offsets = getRoundedOffsets(
      data,
      window.devicePixelRatio < 2 || !isFirefox
    );

    var sideA = x === "bottom" ? "top" : "bottom";
    var sideB = y === "right" ? "left" : "right";

    // if gpuAcceleration is set to `true` and transform is supported,
    //  we use `translate3d` to apply the position to the popper we
    // automatically use the supported prefixed version if needed
    var prefixedProperty = getSupportedPropertyName("transform");

    // now, let's make a step back and look at this code closely (wtf?)
    // If the content of the popper grows once it's been positioned, it
    // may happen that the popper gets misplaced because of the new content
    // overflowing its reference element
    // To avoid this problem, we provide two options (x and y), which allow
    // the consumer to define the offset origin.
    // If we position a popper on top of a reference element, we can set
    // `x` to `top` to make the popper grow towards its top instead of
    // its bottom.
    var left = void 0,
      top = void 0;
    if (sideA === "bottom") {
      // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
      // and not the bottom of the html element
      if (offsetParent.nodeName === "HTML") {
        top = -offsetParent.clientHeight + offsets.bottom;
      } else {
        top = -offsetParentRect.height + offsets.bottom;
      }
    } else {
      top = offsets.top;
    }
    if (sideB === "right") {
      if (offsetParent.nodeName === "HTML") {
        left = -offsetParent.clientWidth + offsets.right;
      } else {
        left = -offsetParentRect.width + offsets.right;
      }
    } else {
      left = offsets.left;
    }
    if (gpuAcceleration && prefixedProperty) {
      styles[prefixedProperty] =
        "translate3d(" + left + "px, " + top + "px, 0)";
      styles[sideA] = 0;
      styles[sideB] = 0;
      styles.willChange = "transform";
    } else {
      // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
      var invertTop = sideA === "bottom" ? -1 : 1;
      var invertLeft = sideB === "right" ? -1 : 1;
      styles[sideA] = top * invertTop;
      styles[sideB] = left * invertLeft;
      styles.willChange = sideA + ", " + sideB;
    }

    // Attributes
    var attributes = {
      "x-placement": data.placement,
    };

    // Update `data` attributes, styles and arrowStyles
    data.attributes = _extends({}, attributes, data.attributes);
    data.styles = _extends({}, styles, data.styles);
    data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

    return data;
  }

  /**
   * Helper used to know if the given modifier depends from another one.<br />
   * It checks if the needed modifier is listed and enabled.
   * @method
   * @memberof Popper.Utils
   * @param {Array} modifiers - list of modifiers
   * @param {String} requestingName - name of requesting modifier
   * @param {String} requestedName - name of requested modifier
   * @returns {Boolean}
   */
  function isModifierRequired(modifiers, requestingName, requestedName) {
    var requesting = find(modifiers, function (_ref) {
      var name = _ref.name;
      return name === requestingName;
    });

    var isRequired =
      !!requesting &&
      modifiers.some(function (modifier) {
        return (
          modifier.name === requestedName &&
          modifier.enabled &&
          modifier.order < requesting.order
        );
      });

    if (!isRequired) {
      var _requesting = "`" + requestingName + "`";
      var requested = "`" + requestedName + "`";
      console.warn(
        requested +
          " modifier is required by " +
          _requesting +
          " modifier in order to work, be sure to include it before " +
          _requesting +
          "!"
      );
    }
    return isRequired;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function arrow(data, options) {
    var _data$offsets$arrow;

    // arrow depends on keepTogether in order to work
    if (!isModifierRequired(data.instance.modifiers, "arrow", "keepTogether")) {
      return data;
    }

    var arrowElement = options.element;

    // if arrowElement is a string, suppose it's a CSS selector
    if (typeof arrowElement === "string") {
      arrowElement = data.instance.popper.querySelector(arrowElement);

      // if arrowElement is not found, don't run the modifier
      if (!arrowElement) {
        return data;
      }
    } else {
      // if the arrowElement isn't a query selector we must check that the
      // provided DOM node is child of its popper node
      if (!data.instance.popper.contains(arrowElement)) {
        console.warn(
          "WARNING: `arrow.element` must be child of its popper element!"
        );
        return data;
      }
    }

    var placement = data.placement.split("-")[0];
    var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

    var isVertical = ["left", "right"].indexOf(placement) !== -1;

    var len = isVertical ? "height" : "width";
    var sideCapitalized = isVertical ? "Top" : "Left";
    var side = sideCapitalized.toLowerCase();
    var altSide = isVertical ? "left" : "top";
    var opSide = isVertical ? "bottom" : "right";
    var arrowElementSize = getOuterSizes(arrowElement)[len];

    //
    // extends keepTogether behavior making sure the popper and its
    // reference have enough pixels in conjunction
    //

    // top/left side
    if (reference[opSide] - arrowElementSize < popper[side]) {
      data.offsets.popper[side] -=
        popper[side] - (reference[opSide] - arrowElementSize);
    }
    // bottom/right side
    if (reference[side] + arrowElementSize > popper[opSide]) {
      data.offsets.popper[side] +=
        reference[side] + arrowElementSize - popper[opSide];
    }
    data.offsets.popper = getClientRect(data.offsets.popper);

    // compute center of the popper
    var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

    // Compute the sideValue using the updated popper offsets
    // take popper margin in account because we don't have this info available
    var css = getStyleComputedProperty(data.instance.popper);
    var popperMarginSide = parseFloat(css["margin" + sideCapitalized]);
    var popperBorderSide = parseFloat(
      css["border" + sideCapitalized + "Width"]
    );
    var sideValue =
      center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

    // prevent arrowElement from being placed not contiguously to its popper
    sideValue = Math.max(
      Math.min(popper[len] - arrowElementSize, sideValue),
      0
    );

    data.arrowElement = arrowElement;
    data.offsets.arrow =
      ((_data$offsets$arrow = {}),
      defineProperty(_data$offsets$arrow, side, Math.round(sideValue)),
      defineProperty(_data$offsets$arrow, altSide, ""),
      _data$offsets$arrow);

    return data;
  }

  /**
   * Get the opposite placement variation of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement variation
   * @returns {String} flipped placement variation
   */
  function getOppositeVariation(variation) {
    if (variation === "end") {
      return "start";
    } else if (variation === "start") {
      return "end";
    }
    return variation;
  }

  /**
   * List of accepted placements to use as values of the `placement` option.<br />
   * Valid placements are:
   * - `auto`
   * - `top`
   * - `right`
   * - `bottom`
   * - `left`
   *
   * Each placement can have a variation from this list:
   * - `-start`
   * - `-end`
   *
   * Variations are interpreted easily if you think of them as the left to right
   * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
   * is right.<br />
   * Vertically (`left` and `right`), `start` is top and `end` is bottom.
   *
   * Some valid examples are:
   * - `top-end` (on top of reference, right aligned)
   * - `right-start` (on right of reference, top aligned)
   * - `bottom` (on bottom, centered)
   * - `auto-end` (on the side with more space available, alignment depends by placement)
   *
   * @static
   * @type {Array}
   * @enum {String}
   * @readonly
   * @method placements
   * @memberof Popper
   */
  var placements = [
    "auto-start",
    "auto",
    "auto-end",
    "top-start",
    "top",
    "top-end",
    "right-start",
    "right",
    "right-end",
    "bottom-end",
    "bottom",
    "bottom-start",
    "left-end",
    "left",
    "left-start",
  ];

  // Get rid of `auto` `auto-start` and `auto-end`
  var validPlacements = placements.slice(3);

  /**
   * Given an initial placement, returns all the subsequent placements
   * clockwise (or counter-clockwise).
   *
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement - A valid placement (it accepts variations)
   * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
   * @returns {Array} placements including their variations
   */
  function clockwise(placement) {
    var counter =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var index = validPlacements.indexOf(placement);
    var arr = validPlacements
      .slice(index + 1)
      .concat(validPlacements.slice(0, index));
    return counter ? arr.reverse() : arr;
  }

  var BEHAVIORS = {
    FLIP: "flip",
    CLOCKWISE: "clockwise",
    COUNTERCLOCKWISE: "counterclockwise",
  };

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function flip(data, options) {
    // if `inner` modifier is enabled, we can't use the `flip` modifier
    if (isModifierEnabled(data.instance.modifiers, "inner")) {
      return data;
    }

    if (data.flipped && data.placement === data.originalPlacement) {
      // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
      return data;
    }

    var boundaries = getBoundaries(
      data.instance.popper,
      data.instance.reference,
      options.padding,
      options.boundariesElement,
      data.positionFixed
    );

    var placement = data.placement.split("-")[0];
    var placementOpposite = getOppositePlacement(placement);
    var variation = data.placement.split("-")[1] || "";

    var flipOrder = [];

    switch (options.behavior) {
      case BEHAVIORS.FLIP:
        flipOrder = [placement, placementOpposite];
        break;
      case BEHAVIORS.CLOCKWISE:
        flipOrder = clockwise(placement);
        break;
      case BEHAVIORS.COUNTERCLOCKWISE:
        flipOrder = clockwise(placement, true);
        break;
      default:
        flipOrder = options.behavior;
    }

    flipOrder.forEach(function (step, index) {
      if (placement !== step || flipOrder.length === index + 1) {
        return data;
      }

      placement = data.placement.split("-")[0];
      placementOpposite = getOppositePlacement(placement);

      var popperOffsets = data.offsets.popper;
      var refOffsets = data.offsets.reference;

      // using floor because the reference offsets may contain decimals we are not going to consider here
      var floor = Math.floor;
      var overlapsRef =
        (placement === "left" &&
          floor(popperOffsets.right) > floor(refOffsets.left)) ||
        (placement === "right" &&
          floor(popperOffsets.left) < floor(refOffsets.right)) ||
        (placement === "top" &&
          floor(popperOffsets.bottom) > floor(refOffsets.top)) ||
        (placement === "bottom" &&
          floor(popperOffsets.top) < floor(refOffsets.bottom));

      var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
      var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
      var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
      var overflowsBottom =
        floor(popperOffsets.bottom) > floor(boundaries.bottom);

      var overflowsBoundaries =
        (placement === "left" && overflowsLeft) ||
        (placement === "right" && overflowsRight) ||
        (placement === "top" && overflowsTop) ||
        (placement === "bottom" && overflowsBottom);

      // flip the variation if required
      var isVertical = ["top", "bottom"].indexOf(placement) !== -1;

      // flips variation if reference element overflows boundaries
      var flippedVariationByRef =
        !!options.flipVariations &&
        ((isVertical && variation === "start" && overflowsLeft) ||
          (isVertical && variation === "end" && overflowsRight) ||
          (!isVertical && variation === "start" && overflowsTop) ||
          (!isVertical && variation === "end" && overflowsBottom));

      // flips variation if popper content overflows boundaries
      var flippedVariationByContent =
        !!options.flipVariationsByContent &&
        ((isVertical && variation === "start" && overflowsRight) ||
          (isVertical && variation === "end" && overflowsLeft) ||
          (!isVertical && variation === "start" && overflowsBottom) ||
          (!isVertical && variation === "end" && overflowsTop));

      var flippedVariation = flippedVariationByRef || flippedVariationByContent;

      if (overlapsRef || overflowsBoundaries || flippedVariation) {
        // this boolean to detect any flip loop
        data.flipped = true;

        if (overlapsRef || overflowsBoundaries) {
          placement = flipOrder[index + 1];
        }

        if (flippedVariation) {
          variation = getOppositeVariation(variation);
        }

        data.placement = placement + (variation ? "-" + variation : "");

        // this object contains `position`, we want to preserve it along with
        // any additional property we may add in the future
        data.offsets.popper = _extends(
          {},
          data.offsets.popper,
          getPopperOffsets(
            data.instance.popper,
            data.offsets.reference,
            data.placement
          )
        );

        data = runModifiers(data.instance.modifiers, data, "flip");
      }
    });
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function keepTogether(data) {
    var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

    var placement = data.placement.split("-")[0];
    var floor = Math.floor;
    var isVertical = ["top", "bottom"].indexOf(placement) !== -1;
    var side = isVertical ? "right" : "bottom";
    var opSide = isVertical ? "left" : "top";
    var measurement = isVertical ? "width" : "height";

    if (popper[side] < floor(reference[opSide])) {
      data.offsets.popper[opSide] =
        floor(reference[opSide]) - popper[measurement];
    }
    if (popper[opSide] > floor(reference[side])) {
      data.offsets.popper[opSide] = floor(reference[side]);
    }

    return data;
  }

  /**
   * Converts a string containing value + unit into a px value number
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} str - Value + unit string
   * @argument {String} measurement - `height` or `width`
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @returns {Number|String}
   * Value in pixels, or original string if no values were extracted
   */
  function toValue(str, measurement, popperOffsets, referenceOffsets) {
    // separate value from unit
    var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
    var value = +split[1];
    var unit = split[2];

    // If it's not a number it's an operator, I guess
    if (!value) {
      return str;
    }

    if (unit.indexOf("%") === 0) {
      var element = void 0;
      switch (unit) {
        case "%p":
          element = popperOffsets;
          break;
        case "%":
        case "%r":
        default:
          element = referenceOffsets;
      }

      var rect = getClientRect(element);
      return (rect[measurement] / 100) * value;
    } else if (unit === "vh" || unit === "vw") {
      // if is a vh or vw, we calculate the size based on the viewport
      var size = void 0;
      if (unit === "vh") {
        size = Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        );
      } else {
        size = Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        );
      }
      return (size / 100) * value;
    } else {
      // if is an explicit pixel unit, we get rid of the unit and keep the value
      // if is an implicit unit, it's px, and we return just the value
      return value;
    }
  }

  /**
   * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} offset
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @argument {String} basePlacement
   * @returns {Array} a two cells array with x and y offsets in numbers
   */
  function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
    var offsets = [0, 0];

    // Use height if placement is left or right and index is 0 otherwise use width
    // in this way the first offset will use an axis and the second one
    // will use the other one
    var useHeight = ["right", "left"].indexOf(basePlacement) !== -1;

    // Split the offset string to obtain a list of values and operands
    // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
    var fragments = offset.split(/(\+|\-)/).map(function (frag) {
      return frag.trim();
    });

    // Detect if the offset string contains a pair of values or a single one
    // they could be separated by comma or space
    var divider = fragments.indexOf(
      find(fragments, function (frag) {
        return frag.search(/,|\s/) !== -1;
      })
    );

    if (fragments[divider] && fragments[divider].indexOf(",") === -1) {
      console.warn(
        "Offsets separated by white space(s) are deprecated, use a comma (,) instead."
      );
    }

    // If divider is found, we divide the list of values and operands to divide
    // them by ofset X and Y.
    var splitRegex = /\s*,\s*|\s+/;
    var ops =
      divider !== -1
        ? [
            fragments
              .slice(0, divider)
              .concat([fragments[divider].split(splitRegex)[0]]),
            [fragments[divider].split(splitRegex)[1]].concat(
              fragments.slice(divider + 1)
            ),
          ]
        : [fragments];

    // Convert the values with units to absolute pixels to allow our computations
    ops = ops.map(function (op, index) {
      // Most of the units rely on the orientation of the popper
      var measurement = (index === 1 ? !useHeight : useHeight)
        ? "height"
        : "width";
      var mergeWithPrevious = false;
      return (
        op
          // This aggregates any `+` or `-` sign that aren't considered operators
          // e.g.: 10 + +5 => [10, +, +5]
          .reduce(function (a, b) {
            if (a[a.length - 1] === "" && ["+", "-"].indexOf(b) !== -1) {
              a[a.length - 1] = b;
              mergeWithPrevious = true;
              return a;
            } else if (mergeWithPrevious) {
              a[a.length - 1] += b;
              mergeWithPrevious = false;
              return a;
            } else {
              return a.concat(b);
            }
          }, [])
          // Here we convert the string values into number values (in px)
          .map(function (str) {
            return toValue(str, measurement, popperOffsets, referenceOffsets);
          })
      );
    });

    // Loop trough the offsets arrays and execute the operations
    ops.forEach(function (op, index) {
      op.forEach(function (frag, index2) {
        if (isNumeric(frag)) {
          offsets[index] += frag * (op[index2 - 1] === "-" ? -1 : 1);
        }
      });
    });
    return offsets;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @argument {Number|String} options.offset=0
   * The offset value as described in the modifier description
   * @returns {Object} The data object, properly modified
   */
  function offset(data, _ref) {
    var offset = _ref.offset;
    var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

    var basePlacement = placement.split("-")[0];

    var offsets = void 0;
    if (isNumeric(+offset)) {
      offsets = [+offset, 0];
    } else {
      offsets = parseOffset(offset, popper, reference, basePlacement);
    }

    if (basePlacement === "left") {
      popper.top += offsets[0];
      popper.left -= offsets[1];
    } else if (basePlacement === "right") {
      popper.top += offsets[0];
      popper.left += offsets[1];
    } else if (basePlacement === "top") {
      popper.left += offsets[0];
      popper.top -= offsets[1];
    } else if (basePlacement === "bottom") {
      popper.left += offsets[0];
      popper.top += offsets[1];
    }

    data.popper = popper;
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function preventOverflow(data, options) {
    var boundariesElement =
      options.boundariesElement || getOffsetParent(data.instance.popper);

    // If offsetParent is the reference element, we really want to
    // go one step up and use the next offsetParent as reference to
    // avoid to make this modifier completely useless and look like broken
    if (data.instance.reference === boundariesElement) {
      boundariesElement = getOffsetParent(boundariesElement);
    }

    // NOTE: DOM access here
    // resets the popper's position so that the document size can be calculated excluding
    // the size of the popper element itself
    var transformProp = getSupportedPropertyName("transform");
    var popperStyles = data.instance.popper.style; // assignment to help minification
    var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

    popperStyles.top = "";
    popperStyles.left = "";
    popperStyles[transformProp] = "";

    var boundaries = getBoundaries(
      data.instance.popper,
      data.instance.reference,
      options.padding,
      boundariesElement,
      data.positionFixed
    );

    // NOTE: DOM access here
    // restores the original style properties after the offsets have been computed
    popperStyles.top = top;
    popperStyles.left = left;
    popperStyles[transformProp] = transform;

    options.boundaries = boundaries;

    var order = options.priority;
    var popper = data.offsets.popper;

    var check = {
      primary: function primary(placement) {
        var value = popper[placement];
        if (
          popper[placement] < boundaries[placement] &&
          !options.escapeWithReference
        ) {
          value = Math.max(popper[placement], boundaries[placement]);
        }
        return defineProperty({}, placement, value);
      },
      secondary: function secondary(placement) {
        var mainSide = placement === "right" ? "left" : "top";
        var value = popper[mainSide];
        if (
          popper[placement] > boundaries[placement] &&
          !options.escapeWithReference
        ) {
          value = Math.min(
            popper[mainSide],
            boundaries[placement] -
              (placement === "right" ? popper.width : popper.height)
          );
        }
        return defineProperty({}, mainSide, value);
      },
    };

    order.forEach(function (placement) {
      var side =
        ["left", "top"].indexOf(placement) !== -1 ? "primary" : "secondary";
      popper = _extends({}, popper, check[side](placement));
    });

    data.offsets.popper = popper;

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function shift(data) {
    var placement = data.placement;
    var basePlacement = placement.split("-")[0];
    var shiftvariation = placement.split("-")[1];

    // if shift shiftvariation is specified, run the modifier
    if (shiftvariation) {
      var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

      var isVertical = ["bottom", "top"].indexOf(basePlacement) !== -1;
      var side = isVertical ? "left" : "top";
      var measurement = isVertical ? "width" : "height";

      var shiftOffsets = {
        start: defineProperty({}, side, reference[side]),
        end: defineProperty(
          {},
          side,
          reference[side] + reference[measurement] - popper[measurement]
        ),
      };

      data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function hide(data) {
    if (
      !isModifierRequired(data.instance.modifiers, "hide", "preventOverflow")
    ) {
      return data;
    }

    var refRect = data.offsets.reference;
    var bound = find(data.instance.modifiers, function (modifier) {
      return modifier.name === "preventOverflow";
    }).boundaries;

    if (
      refRect.bottom < bound.top ||
      refRect.left > bound.right ||
      refRect.top > bound.bottom ||
      refRect.right < bound.left
    ) {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === true) {
        return data;
      }

      data.hide = true;
      data.attributes["x-out-of-boundaries"] = "";
    } else {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === false) {
        return data;
      }

      data.hide = false;
      data.attributes["x-out-of-boundaries"] = false;
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function inner(data) {
    var placement = data.placement;
    var basePlacement = placement.split("-")[0];
    var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

    var isHoriz = ["left", "right"].indexOf(basePlacement) !== -1;

    var subtractLength = ["top", "left"].indexOf(basePlacement) === -1;

    popper[isHoriz ? "left" : "top"] =
      reference[basePlacement] -
      (subtractLength ? popper[isHoriz ? "width" : "height"] : 0);

    data.placement = getOppositePlacement(placement);
    data.offsets.popper = getClientRect(popper);

    return data;
  }

  /**
   * Modifier function, each modifier can have a function of this type assigned
   * to its `fn` property.<br />
   * These functions will be called on each update, this means that you must
   * make sure they are performant enough to avoid performance bottlenecks.
   *
   * @function ModifierFn
   * @argument {dataObject} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {dataObject} The data object, properly modified
   */

  /**
   * Modifiers are plugins used to alter the behavior of your poppers.<br />
   * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
   * needed by the library.
   *
   * Usually you don't want to override the `order`, `fn` and `onLoad` props.
   * All the other properties are configurations that could be tweaked.
   * @namespace modifiers
   */
  var modifiers = {
    /**
     * Modifier used to shift the popper on the start or end of its reference
     * element.<br />
     * It will read the variation of the `placement` property.<br />
     * It can be one either `-end` or `-start`.
     * @memberof modifiers
     * @inner
     */
    shift: {
      /** @prop {number} order=100 - Index used to define the order of execution */
      order: 100,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: shift,
    },

    /**
     * The `offset` modifier can shift your popper on both its axis.
     *
     * It accepts the following units:
     * - `px` or unit-less, interpreted as pixels
     * - `%` or `%r`, percentage relative to the length of the reference element
     * - `%p`, percentage relative to the length of the popper element
     * - `vw`, CSS viewport width unit
     * - `vh`, CSS viewport height unit
     *
     * For length is intended the main axis relative to the placement of the popper.<br />
     * This means that if the placement is `top` or `bottom`, the length will be the
     * `width`. In case of `left` or `right`, it will be the `height`.
     *
     * You can provide a single value (as `Number` or `String`), or a pair of values
     * as `String` divided by a comma or one (or more) white spaces.<br />
     * The latter is a deprecated method because it leads to confusion and will be
     * removed in v2.<br />
     * Additionally, it accepts additions and subtractions between different units.
     * Note that multiplications and divisions aren't supported.
     *
     * Valid examples are:
     * ```
     * 10
     * '10%'
     * '10, 10'
     * '10%, 10'
     * '10 + 10%'
     * '10 - 5vh + 3%'
     * '-10px + 5vh, 5px - 6%'
     * ```
     * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
     * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
     * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
     *
     * @memberof modifiers
     * @inner
     */
    offset: {
      /** @prop {number} order=200 - Index used to define the order of execution */
      order: 200,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: offset,
      /** @prop {Number|String} offset=0
       * The offset value as described in the modifier description
       */
      offset: 0,
    },

    /**
     * Modifier used to prevent the popper from being positioned outside the boundary.
     *
     * A scenario exists where the reference itself is not within the boundaries.<br />
     * We can say it has "escaped the boundaries" — or just "escaped".<br />
     * In this case we need to decide whether the popper should either:
     *
     * - detach from the reference and remain "trapped" in the boundaries, or
     * - if it should ignore the boundary and "escape with its reference"
     *
     * When `escapeWithReference` is set to`true` and reference is completely
     * outside its boundaries, the popper will overflow (or completely leave)
     * the boundaries in order to remain attached to the edge of the reference.
     *
     * @memberof modifiers
     * @inner
     */
    preventOverflow: {
      /** @prop {number} order=300 - Index used to define the order of execution */
      order: 300,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: preventOverflow,
      /**
       * @prop {Array} [priority=['left','right','top','bottom']]
       * Popper will try to prevent overflow following these priorities by default,
       * then, it could overflow on the left and on top of the `boundariesElement`
       */
      priority: ["left", "right", "top", "bottom"],
      /**
       * @prop {number} padding=5
       * Amount of pixel used to define a minimum distance between the boundaries
       * and the popper. This makes sure the popper always has a little padding
       * between the edges of its container
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='scrollParent'
       * Boundaries used by the modifier. Can be `scrollParent`, `window`,
       * `viewport` or any DOM element.
       */
      boundariesElement: "scrollParent",
    },

    /**
     * Modifier used to make sure the reference and its popper stay near each other
     * without leaving any gap between the two. Especially useful when the arrow is
     * enabled and you want to ensure that it points to its reference element.
     * It cares only about the first axis. You can still have poppers with margin
     * between the popper and its reference element.
     * @memberof modifiers
     * @inner
     */
    keepTogether: {
      /** @prop {number} order=400 - Index used to define the order of execution */
      order: 400,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: keepTogether,
    },

    /**
     * This modifier is used to move the `arrowElement` of the popper to make
     * sure it is positioned between the reference element and its popper element.
     * It will read the outer size of the `arrowElement` node to detect how many
     * pixels of conjunction are needed.
     *
     * It has no effect if no `arrowElement` is provided.
     * @memberof modifiers
     * @inner
     */
    arrow: {
      /** @prop {number} order=500 - Index used to define the order of execution */
      order: 500,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: arrow,
      /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
      element: "[x-arrow]",
    },

    /**
     * Modifier used to flip the popper's placement when it starts to overlap its
     * reference element.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     *
     * **NOTE:** this modifier will interrupt the current update cycle and will
     * restart it if it detects the need to flip the placement.
     * @memberof modifiers
     * @inner
     */
    flip: {
      /** @prop {number} order=600 - Index used to define the order of execution */
      order: 600,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: flip,
      /**
       * @prop {String|Array} behavior='flip'
       * The behavior used to change the popper's placement. It can be one of
       * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
       * placements (with optional variations)
       */
      behavior: "flip",
      /**
       * @prop {number} padding=5
       * The popper will flip if it hits the edges of the `boundariesElement`
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='viewport'
       * The element which will define the boundaries of the popper position.
       * The popper will never be placed outside of the defined boundaries
       * (except if `keepTogether` is enabled)
       */
      boundariesElement: "viewport",
      /**
       * @prop {Boolean} flipVariations=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the reference element overlaps its boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariations: false,
      /**
       * @prop {Boolean} flipVariationsByContent=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the popper element overlaps its reference boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariationsByContent: false,
    },

    /**
     * Modifier used to make the popper flow toward the inner of the reference element.
     * By default, when this modifier is disabled, the popper will be placed outside
     * the reference element.
     * @memberof modifiers
     * @inner
     */
    inner: {
      /** @prop {number} order=700 - Index used to define the order of execution */
      order: 700,
      /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
      enabled: false,
      /** @prop {ModifierFn} */
      fn: inner,
    },

    /**
     * Modifier used to hide the popper when its reference element is outside of the
     * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
     * be used to hide with a CSS selector the popper when its reference is
     * out of boundaries.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     * @memberof modifiers
     * @inner
     */
    hide: {
      /** @prop {number} order=800 - Index used to define the order of execution */
      order: 800,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: hide,
    },

    /**
     * Computes the style that will be applied to the popper element to gets
     * properly positioned.
     *
     * Note that this modifier will not touch the DOM, it just prepares the styles
     * so that `applyStyle` modifier can apply it. This separation is useful
     * in case you need to replace `applyStyle` with a custom implementation.
     *
     * This modifier has `850` as `order` value to maintain backward compatibility
     * with previous versions of Popper.js. Expect the modifiers ordering method
     * to change in future major versions of the library.
     *
     * @memberof modifiers
     * @inner
     */
    computeStyle: {
      /** @prop {number} order=850 - Index used to define the order of execution */
      order: 850,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: computeStyle,
      /**
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: true,
      /**
       * @prop {string} [x='bottom']
       * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
       * Change this if your popper should grow in a direction different from `bottom`
       */
      x: "bottom",
      /**
       * @prop {string} [x='left']
       * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
       * Change this if your popper should grow in a direction different from `right`
       */
      y: "right",
    },

    /**
     * Applies the computed styles to the popper element.
     *
     * All the DOM manipulations are limited to this modifier. This is useful in case
     * you want to integrate Popper.js inside a framework or view library and you
     * want to delegate all the DOM manipulations to it.
     *
     * Note that if you disable this modifier, you must make sure the popper element
     * has its position set to `absolute` before Popper.js can do its work!
     *
     * Just disable this modifier and define your own to achieve the desired effect.
     *
     * @memberof modifiers
     * @inner
     */
    applyStyle: {
      /** @prop {number} order=900 - Index used to define the order of execution */
      order: 900,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: applyStyle,
      /** @prop {Function} */
      onLoad: applyStyleOnLoad,
      /**
       * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: undefined,
    },
  };

  /**
   * The `dataObject` is an object containing all the information used by Popper.js.
   * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
   * @name dataObject
   * @property {Object} data.instance The Popper.js instance
   * @property {String} data.placement Placement applied to popper
   * @property {String} data.originalPlacement Placement originally defined on init
   * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
   * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
   * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
   * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.boundaries Offsets of the popper boundaries
   * @property {Object} data.offsets The measurements of popper, reference and arrow elements
   * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
   */

  /**
   * Default options provided to Popper.js constructor.<br />
   * These can be overridden using the `options` argument of Popper.js.<br />
   * To override an option, simply pass an object with the same
   * structure of the `options` object, as the 3rd argument. For example:
   * ```
   * new Popper(ref, pop, {
   *   modifiers: {
   *     preventOverflow: { enabled: false }
   *   }
   * })
   * ```
   * @type {Object}
   * @static
   * @memberof Popper
   */
  var Defaults = {
    /**
     * Popper's placement.
     * @prop {Popper.placements} placement='bottom'
     */
    placement: "bottom",

    /**
     * Set this to true if you want popper to position it self in 'fixed' mode
     * @prop {Boolean} positionFixed=false
     */
    positionFixed: false,

    /**
     * Whether events (resize, scroll) are initially enabled.
     * @prop {Boolean} eventsEnabled=true
     */
    eventsEnabled: true,

    /**
     * Set to true if you want to automatically remove the popper when
     * you call the `destroy` method.
     * @prop {Boolean} removeOnDestroy=false
     */
    removeOnDestroy: false,

    /**
     * Callback called when the popper is created.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onCreate}
     */
    onCreate: function onCreate() {},

    /**
     * Callback called when the popper is updated. This callback is not called
     * on the initialization/creation of the popper, but only on subsequent
     * updates.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onUpdate}
     */
    onUpdate: function onUpdate() {},

    /**
     * List of modifiers used to modify the offsets before they are applied to the popper.
     * They provide most of the functionalities of Popper.js.
     * @prop {modifiers}
     */
    modifiers: modifiers,
  };

  /**
   * @callback onCreate
   * @param {dataObject} data
   */

  /**
   * @callback onUpdate
   * @param {dataObject} data
   */

  // Utils
  // Methods
  var Popper = (function () {
    /**
     * Creates a new Popper.js instance.
     * @class Popper
     * @param {Element|referenceObject} reference - The reference element used to position the popper
     * @param {Element} popper - The HTML / XML element used as the popper
     * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
     * @return {Object} instance - The generated Popper.js instance
     */
    function Popper(reference, popper) {
      var _this = this;

      var options =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      classCallCheck(this, Popper);

      this.scheduleUpdate = function () {
        return requestAnimationFrame(_this.update);
      };

      // make update() debounced, so that it only runs at most once-per-tick
      this.update = debounce(this.update.bind(this));

      // with {} we create a new object with the options inside it
      this.options = _extends({}, Popper.Defaults, options);

      // init state
      this.state = {
        isDestroyed: false,
        isCreated: false,
        scrollParents: [],
      };

      // get reference and popper elements (allow jQuery wrappers)
      this.reference = reference && reference.jquery ? reference[0] : reference;
      this.popper = popper && popper.jquery ? popper[0] : popper;

      // Deep merge modifiers options
      this.options.modifiers = {};
      Object.keys(
        _extends({}, Popper.Defaults.modifiers, options.modifiers)
      ).forEach(function (name) {
        _this.options.modifiers[name] = _extends(
          {},
          Popper.Defaults.modifiers[name] || {},
          options.modifiers ? options.modifiers[name] : {}
        );
      });

      // Refactoring modifiers' list (Object => Array)
      this.modifiers = Object.keys(this.options.modifiers)
        .map(function (name) {
          return _extends(
            {
              name: name,
            },
            _this.options.modifiers[name]
          );
        })
        // sort the modifiers by order
        .sort(function (a, b) {
          return a.order - b.order;
        });

      // modifiers have the ability to execute arbitrary code when Popper.js get inited
      // such code is executed in the same order of its modifier
      // they could add new properties to their options configuration
      // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
      this.modifiers.forEach(function (modifierOptions) {
        if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
          modifierOptions.onLoad(
            _this.reference,
            _this.popper,
            _this.options,
            modifierOptions,
            _this.state
          );
        }
      });

      // fire the first update to position the popper in the right place
      this.update();

      var eventsEnabled = this.options.eventsEnabled;
      if (eventsEnabled) {
        // setup event listeners, they will take care of update the position in specific situations
        this.enableEventListeners();
      }

      this.state.eventsEnabled = eventsEnabled;
    }

    // We can't use class properties because they don't get listed in the
    // class prototype and break stuff like Sinon stubs

    createClass(Popper, [
      {
        key: "update",
        value: function update$$1() {
          return update.call(this);
        },
      },
      {
        key: "destroy",
        value: function destroy$$1() {
          return destroy.call(this);
        },
      },
      {
        key: "enableEventListeners",
        value: function enableEventListeners$$1() {
          return enableEventListeners.call(this);
        },
      },
      {
        key: "disableEventListeners",
        value: function disableEventListeners$$1() {
          return disableEventListeners.call(this);
        },

        /**
         * Schedules an update. It will run on the next UI update available.
         * @method scheduleUpdate
         * @memberof Popper
         */

        /**
         * Collection of utilities useful when writing custom modifiers.
         * Starting from version 1.7, this method is available only if you
         * include `popper-utils.js` before `popper.js`.
         *
         * **DEPRECATION**: This way to access PopperUtils is deprecated
         * and will be removed in v2! Use the PopperUtils module directly instead.
         * Due to the high instability of the methods contained in Utils, we can't
         * guarantee them to follow semver. Use them at your own risk!
         * @static
         * @private
         * @type {Object}
         * @deprecated since version 1.8
         * @member Utils
         * @memberof Popper
         */
      },
    ]);
    return Popper;
  })();

  /**
   * The `referenceObject` is an object that provides an interface compatible with Popper.js
   * and lets you use it as replacement of a real DOM node.<br />
   * You can use this method to position a popper relatively to a set of coordinates
   * in case you don't have a DOM node to use as reference.
   *
   * ```
   * new Popper(referenceObject, popperNode);
   * ```
   *
   * NB: This feature isn't supported in Internet Explorer 10.
   * @name referenceObject
   * @property {Function} data.getBoundingClientRect
   * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
   * @property {number} data.clientWidth
   * An ES6 getter that will return the width of the virtual reference element.
   * @property {number} data.clientHeight
   * An ES6 getter that will return the height of the virtual reference element.
   */

  Popper.Utils = (typeof window !== "undefined" ? window : global).PopperUtils;
  Popper.placements = placements;
  Popper.Defaults = Defaults;

  return Popper;
});
//# sourceMappingURL=popper.js.map

/*!
 * Bootstrap v4.5.0 (https://getbootstrap.com/)
 * Copyright 2011-2020 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports, require("jquery"), require("popper.js"))
    : typeof define === "function" && define.amd
    ? define(["exports", "jquery", "popper.js"], factory)
    : ((global = global || self),
      factory((global.bootstrap = {}), global.jQuery, global.Popper));
})(this, function (exports, $, Popper) {
  "use strict";

  $ =
    $ && Object.prototype.hasOwnProperty.call($, "default") ? $["default"] : $;
  Popper =
    Popper && Object.prototype.hasOwnProperty.call(Popper, "default")
      ? Popper["default"]
      : Popper;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly)
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        );
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
      }
    }

    return target;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.5.0): util.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */

  var TRANSITION_END = "transitionend";
  var MAX_UID = 1000000;
  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  function toType(obj) {
    if (obj === null || typeof obj === "undefined") {
      return "" + obj;
    }

    return {}.toString
      .call(obj)
      .match(/\s([a-z]+)/i)[1]
      .toLowerCase();
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined;
      },
    };
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;
    $(this).one(Util.TRANSITION_END, function () {
      called = true;
    });
    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);
    return this;
  }

  function setTransitionEndSupport() {
    $.fn.emulateTransitionEnd = transitionEndEmulator;
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */

  var Util = {
    TRANSITION_END: "bsTransitionEnd",
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));

      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute("data-target");

      if (!selector || selector === "#") {
        var hrefAttr = element.getAttribute("href");
        selector = hrefAttr && hrefAttr !== "#" ? hrefAttr.trim() : "";
      }

      try {
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        return null;
      }
    },
    getTransitionDurationFromElement: function getTransitionDurationFromElement(
      element
    ) {
      if (!element) {
        return 0;
      } // Get transition-duration of the element

      var transitionDuration = $(element).css("transition-duration");
      var transitionDelay = $(element).css("transition-delay");
      var floatTransitionDuration = parseFloat(transitionDuration);
      var floatTransitionDelay = parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // If multiple durations are defined, take the first

      transitionDuration = transitionDuration.split(",")[0];
      transitionDelay = transitionDelay.split(",")[0];
      return (
        (parseFloat(transitionDuration) + parseFloat(transitionDelay)) *
        MILLISECONDS_MULTIPLIER
      );
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    // TODO: Remove in v5
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    typeCheckConfig: function typeCheckConfig(
      componentName,
      config,
      configTypes
    ) {
      for (var property in configTypes) {
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType =
            value && Util.isElement(value) ? "element" : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(
              componentName.toUpperCase() +
                ": " +
                ('Option "' +
                  property +
                  '" provided type "' +
                  valueType +
                  '" ') +
                ('but expected type "' + expectedTypes + '".')
            );
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      if (!document.documentElement.attachShadow) {
        return null;
      } // Can find the shadow root otherwise it'll return the document

      if (typeof element.getRootNode === "function") {
        var root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }

      if (element instanceof ShadowRoot) {
        return element;
      } // when we don't find a shadow root

      if (!element.parentNode) {
        return null;
      }

      return Util.findShadowRoot(element.parentNode);
    },
    jQueryDetection: function jQueryDetection() {
      if (typeof $ === "undefined") {
        throw new TypeError(
          "Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript."
        );
      }

      var version = $.fn.jquery.split(" ")[0].split(".");
      var minMajor = 1;
      var ltMajor = 2;
      var minMinor = 9;
      var minPatch = 1;
      var maxMajor = 4;

      if (
        (version[0] < ltMajor && version[1] < minMinor) ||
        (version[0] === minMajor &&
          version[1] === minMinor &&
          version[2] < minPatch) ||
        version[0] >= maxMajor
      ) {
        throw new Error(
          "Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0"
        );
      }
    },
  };
  Util.jQueryDetection();
  setTransitionEndSupport();

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = "alert";
  var VERSION = "4.5.0";
  var DATA_KEY = "bs.alert";
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = ".data-api";
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var SELECTOR_DISMISS = '[data-dismiss="alert"]';
  var EVENT_CLOSE = "close" + EVENT_KEY;
  var EVENT_CLOSED = "closed" + EVENT_KEY;
  var EVENT_CLICK_DATA_API = "click" + EVENT_KEY + DATA_API_KEY;
  var CLASS_NAME_ALERT = "alert";
  var CLASS_NAME_FADE = "fade";
  var CLASS_NAME_SHOW = "show";
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Alert = /*#__PURE__*/ (function () {
    function Alert(element) {
      this._element = element;
    } // Getters

    var _proto = Alert.prototype;

    // Public
    _proto.close = function close(element) {
      var rootElement = this._element;

      if (element) {
        rootElement = this._getRootElement(element);
      }

      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    }; // Private

    _proto._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = document.querySelector(selector);
      }

      if (!parent) {
        parent = $(element).closest("." + CLASS_NAME_ALERT)[0];
      }

      return parent;
    };

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $.Event(EVENT_CLOSE);
      $(element).trigger(closeEvent);
      return closeEvent;
    };

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      $(element).removeClass(CLASS_NAME_SHOW);

      if (!$(element).hasClass(CLASS_NAME_FADE)) {
        this._destroyElement(element);

        return;
      }

      var transitionDuration = Util.getTransitionDurationFromElement(element);
      $(element)
        .one(Util.TRANSITION_END, function (event) {
          return _this._destroyElement(element, event);
        })
        .emulateTransitionEnd(transitionDuration);
    };

    _proto._destroyElement = function _destroyElement(element) {
      $(element).detach().trigger(EVENT_CLOSED).remove();
    }; // Static

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === "close") {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION;
        },
      },
    ]);

    return Alert;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(
    EVENT_CLICK_DATA_API,
    SELECTOR_DISMISS,
    Alert._handleDismiss(new Alert())
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Alert._jQueryInterface;
  $.fn[NAME].Constructor = Alert;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$1 = "button";
  var VERSION$1 = "4.5.0";
  var DATA_KEY$1 = "bs.button";
  var EVENT_KEY$1 = "." + DATA_KEY$1;
  var DATA_API_KEY$1 = ".data-api";
  var JQUERY_NO_CONFLICT$1 = $.fn[NAME$1];
  var CLASS_NAME_ACTIVE = "active";
  var CLASS_NAME_BUTTON = "btn";
  var CLASS_NAME_FOCUS = "focus";
  var SELECTOR_DATA_TOGGLE_CARROT = '[data-toggle^="button"]';
  var SELECTOR_DATA_TOGGLES = '[data-toggle="buttons"]';
  var SELECTOR_DATA_TOGGLE = '[data-toggle="button"]';
  var SELECTOR_DATA_TOGGLES_BUTTONS = '[data-toggle="buttons"] .btn';
  var SELECTOR_INPUT = 'input:not([type="hidden"])';
  var SELECTOR_ACTIVE = ".active";
  var SELECTOR_BUTTON = ".btn";
  var EVENT_CLICK_DATA_API$1 = "click" + EVENT_KEY$1 + DATA_API_KEY$1;
  var EVENT_FOCUS_BLUR_DATA_API =
    "focus" +
    EVENT_KEY$1 +
    DATA_API_KEY$1 +
    " " +
    ("blur" + EVENT_KEY$1 + DATA_API_KEY$1);
  var EVENT_LOAD_DATA_API = "load" + EVENT_KEY$1 + DATA_API_KEY$1;
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Button = /*#__PURE__*/ (function () {
    function Button(element) {
      this._element = element;
    } // Getters

    var _proto = Button.prototype;

    // Public
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true;
      var rootElement = $(this._element).closest(SELECTOR_DATA_TOGGLES)[0];

      if (rootElement) {
        var input = this._element.querySelector(SELECTOR_INPUT);

        if (input) {
          if (input.type === "radio") {
            if (
              input.checked &&
              this._element.classList.contains(CLASS_NAME_ACTIVE)
            ) {
              triggerChangeEvent = false;
            } else {
              var activeElement = rootElement.querySelector(SELECTOR_ACTIVE);

              if (activeElement) {
                $(activeElement).removeClass(CLASS_NAME_ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            // if it's not a radio button or checkbox don't add a pointless/invalid checked property to the input
            if (input.type === "checkbox" || input.type === "radio") {
              input.checked =
                !this._element.classList.contains(CLASS_NAME_ACTIVE);
            }

            $(input).trigger("change");
          }

          input.focus();
          addAriaPressed = false;
        }
      }

      if (
        !(
          this._element.hasAttribute("disabled") ||
          this._element.classList.contains("disabled")
        )
      ) {
        if (addAriaPressed) {
          this._element.setAttribute(
            "aria-pressed",
            !this._element.classList.contains(CLASS_NAME_ACTIVE)
          );
        }

        if (triggerChangeEvent) {
          $(this._element).toggleClass(CLASS_NAME_ACTIVE);
        }
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$1);
      this._element = null;
    }; // Static

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$1);

        if (!data) {
          data = new Button(this);
          $(this).data(DATA_KEY$1, data);
        }

        if (config === "toggle") {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$1;
        },
      },
    ]);

    return Button;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document)
    .on(EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE_CARROT, function (event) {
      var button = event.target;
      var initialButton = button;

      if (!$(button).hasClass(CLASS_NAME_BUTTON)) {
        button = $(button).closest(SELECTOR_BUTTON)[0];
      }

      if (
        !button ||
        button.hasAttribute("disabled") ||
        button.classList.contains("disabled")
      ) {
        event.preventDefault(); // work around Firefox bug #1540995
      } else {
        var inputBtn = button.querySelector(SELECTOR_INPUT);

        if (
          inputBtn &&
          (inputBtn.hasAttribute("disabled") ||
            inputBtn.classList.contains("disabled"))
        ) {
          event.preventDefault(); // work around Firefox bug #1540995

          return;
        }

        if (
          initialButton.tagName === "LABEL" &&
          inputBtn &&
          inputBtn.type === "checkbox"
        ) {
          event.preventDefault(); // work around event sent to label and input
        }

        Button._jQueryInterface.call($(button), "toggle");
      }
    })
    .on(
      EVENT_FOCUS_BLUR_DATA_API,
      SELECTOR_DATA_TOGGLE_CARROT,
      function (event) {
        var button = $(event.target).closest(SELECTOR_BUTTON)[0];
        $(button).toggleClass(
          CLASS_NAME_FOCUS,
          /^focus(in)?$/.test(event.type)
        );
      }
    );
  $(window).on(EVENT_LOAD_DATA_API, function () {
    // ensure correct active class is set to match the controls' actual values/states
    // find all checkboxes/readio buttons inside data-toggle groups
    var buttons = [].slice.call(
      document.querySelectorAll(SELECTOR_DATA_TOGGLES_BUTTONS)
    );

    for (var i = 0, len = buttons.length; i < len; i++) {
      var button = buttons[i];
      var input = button.querySelector(SELECTOR_INPUT);

      if (input.checked || input.hasAttribute("checked")) {
        button.classList.add(CLASS_NAME_ACTIVE);
      } else {
        button.classList.remove(CLASS_NAME_ACTIVE);
      }
    } // find all button toggles

    buttons = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE));

    for (var _i = 0, _len = buttons.length; _i < _len; _i++) {
      var _button = buttons[_i];

      if (_button.getAttribute("aria-pressed") === "true") {
        _button.classList.add(CLASS_NAME_ACTIVE);
      } else {
        _button.classList.remove(CLASS_NAME_ACTIVE);
      }
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$1] = Button._jQueryInterface;
  $.fn[NAME$1].Constructor = Button;

  $.fn[NAME$1].noConflict = function () {
    $.fn[NAME$1] = JQUERY_NO_CONFLICT$1;
    return Button._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$2 = "carousel";
  var VERSION$2 = "4.5.0";
  var DATA_KEY$2 = "bs.carousel";
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = ".data-api";
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  var SWIPE_THRESHOLD = 40;
  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: "hover",
    wrap: true,
    touch: true,
  };
  var DefaultType = {
    interval: "(number|boolean)",
    keyboard: "boolean",
    slide: "(boolean|string)",
    pause: "(string|boolean)",
    wrap: "boolean",
    touch: "boolean",
  };
  var DIRECTION_NEXT = "next";
  var DIRECTION_PREV = "prev";
  var DIRECTION_LEFT = "left";
  var DIRECTION_RIGHT = "right";
  var EVENT_SLIDE = "slide" + EVENT_KEY$2;
  var EVENT_SLID = "slid" + EVENT_KEY$2;
  var EVENT_KEYDOWN = "keydown" + EVENT_KEY$2;
  var EVENT_MOUSEENTER = "mouseenter" + EVENT_KEY$2;
  var EVENT_MOUSELEAVE = "mouseleave" + EVENT_KEY$2;
  var EVENT_TOUCHSTART = "touchstart" + EVENT_KEY$2;
  var EVENT_TOUCHMOVE = "touchmove" + EVENT_KEY$2;
  var EVENT_TOUCHEND = "touchend" + EVENT_KEY$2;
  var EVENT_POINTERDOWN = "pointerdown" + EVENT_KEY$2;
  var EVENT_POINTERUP = "pointerup" + EVENT_KEY$2;
  var EVENT_DRAG_START = "dragstart" + EVENT_KEY$2;
  var EVENT_LOAD_DATA_API$1 = "load" + EVENT_KEY$2 + DATA_API_KEY$2;
  var EVENT_CLICK_DATA_API$2 = "click" + EVENT_KEY$2 + DATA_API_KEY$2;
  var CLASS_NAME_CAROUSEL = "carousel";
  var CLASS_NAME_ACTIVE$1 = "active";
  var CLASS_NAME_SLIDE = "slide";
  var CLASS_NAME_RIGHT = "carousel-item-right";
  var CLASS_NAME_LEFT = "carousel-item-left";
  var CLASS_NAME_NEXT = "carousel-item-next";
  var CLASS_NAME_PREV = "carousel-item-prev";
  var CLASS_NAME_POINTER_EVENT = "pointer-event";
  var SELECTOR_ACTIVE$1 = ".active";
  var SELECTOR_ACTIVE_ITEM = ".active.carousel-item";
  var SELECTOR_ITEM = ".carousel-item";
  var SELECTOR_ITEM_IMG = ".carousel-item img";
  var SELECTOR_NEXT_PREV = ".carousel-item-next, .carousel-item-prev";
  var SELECTOR_INDICATORS = ".carousel-indicators";
  var SELECTOR_DATA_SLIDE = "[data-slide], [data-slide-to]";
  var SELECTOR_DATA_RIDE = '[data-ride="carousel"]';
  var PointerType = {
    TOUCH: "touch",
    PEN: "pen",
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Carousel = /*#__PURE__*/ (function () {
    function Carousel(element, config) {
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._element = element;
      this._indicatorsElement =
        this._element.querySelector(SELECTOR_INDICATORS);
      this._touchSupported =
        "ontouchstart" in document.documentElement ||
        navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(
        window.PointerEvent || window.MSPointerEvent
      );

      this._addEventListeners();
    } // Getters

    var _proto = Carousel.prototype;

    // Public
    _proto.next = function next() {
      if (!this._isSliding) {
        this._slide(DIRECTION_NEXT);
      }
    };

    _proto.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (
        !document.hidden &&
        $(this._element).is(":visible") &&
        $(this._element).css("visibility") !== "hidden"
      ) {
        this.next();
      }
    };

    _proto.prev = function prev() {
      if (!this._isSliding) {
        this._slide(DIRECTION_PREV);
      }
    };

    _proto.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (this._element.querySelector(SELECTOR_NEXT_PREV)) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    _proto.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval(
          (document.visibilityState ? this.nextWhenVisible : this.next).bind(
            this
          ),
          this._config.interval
        );
      }
    };

    _proto.to = function to(index) {
      var _this = this;

      this._activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $(this._element).one(EVENT_SLID, function () {
          return _this.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? DIRECTION_NEXT : DIRECTION_PREV;

      this._slide(direction, this._items[index]);
    };

    _proto.dispose = function dispose() {
      $(this._element).off(EVENT_KEY$2);
      $.removeData(this._element, DATA_KEY$2);
      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    }; // Private

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(_objectSpread2({}, Default), config);
      Util.typeCheckConfig(NAME$2, config, DefaultType);
      return config;
    };

    _proto._handleSwipe = function _handleSwipe() {
      var absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      var direction = absDeltax / this.touchDeltaX;
      this.touchDeltaX = 0; // swipe left

      if (direction > 0) {
        this.prev();
      } // swipe right

      if (direction < 0) {
        this.next();
      }
    };

    _proto._addEventListeners = function _addEventListeners() {
      var _this2 = this;

      if (this._config.keyboard) {
        $(this._element).on(EVENT_KEYDOWN, function (event) {
          return _this2._keydown(event);
        });
      }

      if (this._config.pause === "hover") {
        $(this._element)
          .on(EVENT_MOUSEENTER, function (event) {
            return _this2.pause(event);
          })
          .on(EVENT_MOUSELEAVE, function (event) {
            return _this2.cycle(event);
          });
      }

      if (this._config.touch) {
        this._addTouchEventListeners();
      }
    };

    _proto._addTouchEventListeners = function _addTouchEventListeners() {
      var _this3 = this;

      if (!this._touchSupported) {
        return;
      }

      var start = function start(event) {
        if (
          _this3._pointerEvent &&
          PointerType[event.originalEvent.pointerType.toUpperCase()]
        ) {
          _this3.touchStartX = event.originalEvent.clientX;
        } else if (!_this3._pointerEvent) {
          _this3.touchStartX = event.originalEvent.touches[0].clientX;
        }
      };

      var move = function move(event) {
        // ensure swiping with one touch and not pinching
        if (
          event.originalEvent.touches &&
          event.originalEvent.touches.length > 1
        ) {
          _this3.touchDeltaX = 0;
        } else {
          _this3.touchDeltaX =
            event.originalEvent.touches[0].clientX - _this3.touchStartX;
        }
      };

      var end = function end(event) {
        if (
          _this3._pointerEvent &&
          PointerType[event.originalEvent.pointerType.toUpperCase()]
        ) {
          _this3.touchDeltaX = event.originalEvent.clientX - _this3.touchStartX;
        }

        _this3._handleSwipe();

        if (_this3._config.pause === "hover") {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          _this3.pause();

          if (_this3.touchTimeout) {
            clearTimeout(_this3.touchTimeout);
          }

          _this3.touchTimeout = setTimeout(function (event) {
            return _this3.cycle(event);
          }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
        }
      };

      $(this._element.querySelectorAll(SELECTOR_ITEM_IMG)).on(
        EVENT_DRAG_START,
        function (e) {
          return e.preventDefault();
        }
      );

      if (this._pointerEvent) {
        $(this._element).on(EVENT_POINTERDOWN, function (event) {
          return start(event);
        });
        $(this._element).on(EVENT_POINTERUP, function (event) {
          return end(event);
        });

        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        $(this._element).on(EVENT_TOUCHSTART, function (event) {
          return start(event);
        });
        $(this._element).on(EVENT_TOUCHMOVE, function (event) {
          return move(event);
        });
        $(this._element).on(EVENT_TOUCHEND, function (event) {
          return end(event);
        });
      }
    };

    _proto._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;

        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;
      }
    };

    _proto._getItemIndex = function _getItemIndex(element) {
      this._items =
        element && element.parentNode
          ? [].slice.call(element.parentNode.querySelectorAll(SELECTOR_ITEM))
          : [];
      return this._items.indexOf(element);
    };

    _proto._getItemByDirection = function _getItemByDirection(
      direction,
      activeElement
    ) {
      var isNextDirection = direction === DIRECTION_NEXT;
      var isPrevDirection = direction === DIRECTION_PREV;

      var activeIndex = this._getItemIndex(activeElement);

      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap =
        (isPrevDirection && activeIndex === 0) ||
        (isNextDirection && activeIndex === lastItemIndex);

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === DIRECTION_PREV ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;
      return itemIndex === -1
        ? this._items[this._items.length - 1]
        : this._items[itemIndex];
    };

    _proto._triggerSlideEvent = function _triggerSlideEvent(
      relatedTarget,
      eventDirectionName
    ) {
      var targetIndex = this._getItemIndex(relatedTarget);

      var fromIndex = this._getItemIndex(
        this._element.querySelector(SELECTOR_ACTIVE_ITEM)
      );

      var slideEvent = $.Event(EVENT_SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex,
      });
      $(this._element).trigger(slideEvent);
      return slideEvent;
    };

    _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(
      element
    ) {
      if (this._indicatorsElement) {
        var indicators = [].slice.call(
          this._indicatorsElement.querySelectorAll(SELECTOR_ACTIVE$1)
        );
        $(indicators).removeClass(CLASS_NAME_ACTIVE$1);

        var nextIndicator =
          this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $(nextIndicator).addClass(CLASS_NAME_ACTIVE$1);
        }
      }
    };

    _proto._slide = function _slide(direction, element) {
      var _this4 = this;

      var activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);

      var activeElementIndex = this._getItemIndex(activeElement);

      var nextElement =
        element ||
        (activeElement && this._getItemByDirection(direction, activeElement));

      var nextElementIndex = this._getItemIndex(nextElement);

      var isCycling = Boolean(this._interval);
      var directionalClassName;
      var orderClassName;
      var eventDirectionName;

      if (direction === DIRECTION_NEXT) {
        directionalClassName = CLASS_NAME_LEFT;
        orderClassName = CLASS_NAME_NEXT;
        eventDirectionName = DIRECTION_LEFT;
      } else {
        directionalClassName = CLASS_NAME_RIGHT;
        orderClassName = CLASS_NAME_PREV;
        eventDirectionName = DIRECTION_RIGHT;
      }

      if (nextElement && $(nextElement).hasClass(CLASS_NAME_ACTIVE$1)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $.Event(EVENT_SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex,
      });

      if ($(this._element).hasClass(CLASS_NAME_SLIDE)) {
        $(nextElement).addClass(orderClassName);
        Util.reflow(nextElement);
        $(activeElement).addClass(directionalClassName);
        $(nextElement).addClass(directionalClassName);
        var nextElementInterval = parseInt(
          nextElement.getAttribute("data-interval"),
          10
        );

        if (nextElementInterval) {
          this._config.defaultInterval =
            this._config.defaultInterval || this._config.interval;
          this._config.interval = nextElementInterval;
        } else {
          this._config.interval =
            this._config.defaultInterval || this._config.interval;
        }

        var transitionDuration =
          Util.getTransitionDurationFromElement(activeElement);
        $(activeElement)
          .one(Util.TRANSITION_END, function () {
            $(nextElement)
              .removeClass(directionalClassName + " " + orderClassName)
              .addClass(CLASS_NAME_ACTIVE$1);
            $(activeElement).removeClass(
              CLASS_NAME_ACTIVE$1 +
                " " +
                orderClassName +
                " " +
                directionalClassName
            );
            _this4._isSliding = false;
            setTimeout(function () {
              return $(_this4._element).trigger(slidEvent);
            }, 0);
          })
          .emulateTransitionEnd(transitionDuration);
      } else {
        $(activeElement).removeClass(CLASS_NAME_ACTIVE$1);
        $(nextElement).addClass(CLASS_NAME_ACTIVE$1);
        this._isSliding = false;
        $(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    }; // Static

    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$2);

        var _config = _objectSpread2(
          _objectSpread2({}, Default),
          $(this).data()
        );

        if (typeof config === "object") {
          _config = _objectSpread2(_objectSpread2({}, _config), config);
        }

        var action = typeof config === "string" ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $(this).data(DATA_KEY$2, data);
        }

        if (typeof config === "number") {
          data.to(config);
        } else if (typeof action === "string") {
          if (typeof data[action] === "undefined") {
            throw new TypeError('No method named "' + action + '"');
          }

          data[action]();
        } else if (_config.interval && _config.ride) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $(selector)[0];

      if (!target || !$(target).hasClass(CLASS_NAME_CAROUSEL)) {
        return;
      }

      var config = _objectSpread2(
        _objectSpread2({}, $(target).data()),
        $(this).data()
      );

      var slideIndex = this.getAttribute("data-slide-to");

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($(target), config);

      if (slideIndex) {
        $(target).data(DATA_KEY$2).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$2;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default;
        },
      },
    ]);

    return Carousel;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(
    EVENT_CLICK_DATA_API$2,
    SELECTOR_DATA_SLIDE,
    Carousel._dataApiClickHandler
  );
  $(window).on(EVENT_LOAD_DATA_API$1, function () {
    var carousels = [].slice.call(
      document.querySelectorAll(SELECTOR_DATA_RIDE)
    );

    for (var i = 0, len = carousels.length; i < len; i++) {
      var $carousel = $(carousels[i]);

      Carousel._jQueryInterface.call($carousel, $carousel.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Carousel._jQueryInterface;
  $.fn[NAME$2].Constructor = Carousel;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Carousel._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$3 = "collapse";
  var VERSION$3 = "4.5.0";
  var DATA_KEY$3 = "bs.collapse";
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var DATA_API_KEY$3 = ".data-api";
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var Default$1 = {
    toggle: true,
    parent: "",
  };
  var DefaultType$1 = {
    toggle: "boolean",
    parent: "(string|element)",
  };
  var EVENT_SHOW = "show" + EVENT_KEY$3;
  var EVENT_SHOWN = "shown" + EVENT_KEY$3;
  var EVENT_HIDE = "hide" + EVENT_KEY$3;
  var EVENT_HIDDEN = "hidden" + EVENT_KEY$3;
  var EVENT_CLICK_DATA_API$3 = "click" + EVENT_KEY$3 + DATA_API_KEY$3;
  var CLASS_NAME_SHOW$1 = "show";
  var CLASS_NAME_COLLAPSE = "collapse";
  var CLASS_NAME_COLLAPSING = "collapsing";
  var CLASS_NAME_COLLAPSED = "collapsed";
  var DIMENSION_WIDTH = "width";
  var DIMENSION_HEIGHT = "height";
  var SELECTOR_ACTIVES = ".show, .collapsing";
  var SELECTOR_DATA_TOGGLE$1 = '[data-toggle="collapse"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Collapse = /*#__PURE__*/ (function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = [].slice.call(
        document.querySelectorAll(
          '[data-toggle="collapse"][href="#' +
            element.id +
            '"],' +
            ('[data-toggle="collapse"][data-target="#' + element.id + '"]')
        )
      );
      var toggleList = [].slice.call(
        document.querySelectorAll(SELECTOR_DATA_TOGGLE$1)
      );

      for (var i = 0, len = toggleList.length; i < len; i++) {
        var elem = toggleList[i];
        var selector = Util.getSelectorFromElement(elem);
        var filterElement = [].slice
          .call(document.querySelectorAll(selector))
          .filter(function (foundElem) {
            return foundElem === element;
          });

        if (selector !== null && filterElement.length > 0) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters

    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      if ($(this._element).hasClass(CLASS_NAME_SHOW$1)) {
        this.hide();
      } else {
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      if (
        this._isTransitioning ||
        $(this._element).hasClass(CLASS_NAME_SHOW$1)
      ) {
        return;
      }

      var actives;
      var activesData;

      if (this._parent) {
        actives = [].slice
          .call(this._parent.querySelectorAll(SELECTOR_ACTIVES))
          .filter(function (elem) {
            if (typeof _this._config.parent === "string") {
              return elem.getAttribute("data-parent") === _this._config.parent;
            }

            return elem.classList.contains(CLASS_NAME_COLLAPSE);
          });

        if (actives.length === 0) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $(actives).not(this._selector).data(DATA_KEY$3);

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $.Event(EVENT_SHOW);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($(actives).not(this._selector), "hide");

        if (!activesData) {
          $(actives).data(DATA_KEY$3, null);
        }
      }

      var dimension = this._getDimension();

      $(this._element)
        .removeClass(CLASS_NAME_COLLAPSE)
        .addClass(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;

      if (this._triggerArray.length) {
        $(this._triggerArray)
          .removeClass(CLASS_NAME_COLLAPSED)
          .attr("aria-expanded", true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $(_this._element)
          .removeClass(CLASS_NAME_COLLAPSING)
          .addClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$1);
        _this._element.style[dimension] = "";

        _this.setTransitioning(false);

        $(_this._element).trigger(EVENT_SHOWN);
      };

      var capitalizedDimension =
        dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension;
      var transitionDuration = Util.getTransitionDurationFromElement(
        this._element
      );
      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration);
      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      if (
        this._isTransitioning ||
        !$(this._element).hasClass(CLASS_NAME_SHOW$1)
      ) {
        return;
      }

      var startEvent = $.Event(EVENT_HIDE);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();

      this._element.style[dimension] =
        this._element.getBoundingClientRect()[dimension] + "px";
      Util.reflow(this._element);
      $(this._element)
        .addClass(CLASS_NAME_COLLAPSING)
        .removeClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$1);
      var triggerArrayLength = this._triggerArray.length;

      if (triggerArrayLength > 0) {
        for (var i = 0; i < triggerArrayLength; i++) {
          var trigger = this._triggerArray[i];
          var selector = Util.getSelectorFromElement(trigger);

          if (selector !== null) {
            var $elem = $([].slice.call(document.querySelectorAll(selector)));

            if (!$elem.hasClass(CLASS_NAME_SHOW$1)) {
              $(trigger)
                .addClass(CLASS_NAME_COLLAPSED)
                .attr("aria-expanded", false);
            }
          }
        }
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this2.setTransitioning(false);

        $(_this2._element)
          .removeClass(CLASS_NAME_COLLAPSING)
          .addClass(CLASS_NAME_COLLAPSE)
          .trigger(EVENT_HIDDEN);
      };

      this._element.style[dimension] = "";
      var transitionDuration = Util.getTransitionDurationFromElement(
        this._element
      );
      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$3);
      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    }; // Private

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(_objectSpread2({}, Default$1), config);
      config.toggle = Boolean(config.toggle); // Coerce string values

      Util.typeCheckConfig(NAME$3, config, DefaultType$1);
      return config;
    };

    _proto._getDimension = function _getDimension() {
      var hasWidth = $(this._element).hasClass(DIMENSION_WIDTH);
      return hasWidth ? DIMENSION_WIDTH : DIMENSION_HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent;

      if (Util.isElement(this._config.parent)) {
        parent = this._config.parent; // It's a jQuery object

        if (typeof this._config.parent.jquery !== "undefined") {
          parent = this._config.parent[0];
        }
      } else {
        parent = document.querySelector(this._config.parent);
      }

      var selector =
        '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
      var children = [].slice.call(parent.querySelectorAll(selector));
      $(children).each(function (i, element) {
        _this3._addAriaAndCollapsedClass(
          Collapse._getTargetFromElement(element),
          [element]
        );
      });
      return parent;
    };

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(
      element,
      triggerArray
    ) {
      var isOpen = $(element).hasClass(CLASS_NAME_SHOW$1);

      if (triggerArray.length) {
        $(triggerArray)
          .toggleClass(CLASS_NAME_COLLAPSED, !isOpen)
          .attr("aria-expanded", isOpen);
      }
    }; // Static

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? document.querySelector(selector) : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$3);

        var _config = _objectSpread2(
          _objectSpread2(_objectSpread2({}, Default$1), $this.data()),
          typeof config === "object" && config ? config : {}
        );

        if (
          !data &&
          _config.toggle &&
          typeof config === "string" &&
          /show|hide/.test(config)
        ) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY$3, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$3;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$1;
        },
      },
    ]);

    return Collapse;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(
    EVENT_CLICK_DATA_API$3,
    SELECTOR_DATA_TOGGLE$1,
    function (event) {
      // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
      if (event.currentTarget.tagName === "A") {
        event.preventDefault();
      }

      var $trigger = $(this);
      var selector = Util.getSelectorFromElement(this);
      var selectors = [].slice.call(document.querySelectorAll(selector));
      $(selectors).each(function () {
        var $target = $(this);
        var data = $target.data(DATA_KEY$3);
        var config = data ? "toggle" : $trigger.data();

        Collapse._jQueryInterface.call($target, config);
      });
    }
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$3] = Collapse._jQueryInterface;
  $.fn[NAME$3].Constructor = Collapse;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Collapse._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$4 = "dropdown";
  var VERSION$4 = "4.5.0";
  var DATA_KEY$4 = "bs.dropdown";
  var EVENT_KEY$4 = "." + DATA_KEY$4;
  var DATA_API_KEY$4 = ".data-api";
  var JQUERY_NO_CONFLICT$4 = $.fn[NAME$4];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

  var REGEXP_KEYDOWN = new RegExp(
    ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE
  );
  var EVENT_HIDE$1 = "hide" + EVENT_KEY$4;
  var EVENT_HIDDEN$1 = "hidden" + EVENT_KEY$4;
  var EVENT_SHOW$1 = "show" + EVENT_KEY$4;
  var EVENT_SHOWN$1 = "shown" + EVENT_KEY$4;
  var EVENT_CLICK = "click" + EVENT_KEY$4;
  var EVENT_CLICK_DATA_API$4 = "click" + EVENT_KEY$4 + DATA_API_KEY$4;
  var EVENT_KEYDOWN_DATA_API = "keydown" + EVENT_KEY$4 + DATA_API_KEY$4;
  var EVENT_KEYUP_DATA_API = "keyup" + EVENT_KEY$4 + DATA_API_KEY$4;
  var CLASS_NAME_DISABLED = "disabled";
  var CLASS_NAME_SHOW$2 = "show";
  var CLASS_NAME_DROPUP = "dropup";
  var CLASS_NAME_DROPRIGHT = "dropright";
  var CLASS_NAME_DROPLEFT = "dropleft";
  var CLASS_NAME_MENURIGHT = "dropdown-menu-right";
  var CLASS_NAME_POSITION_STATIC = "position-static";
  var SELECTOR_DATA_TOGGLE$2 = '[data-toggle="dropdown"]';
  var SELECTOR_FORM_CHILD = ".dropdown form";
  var SELECTOR_MENU = ".dropdown-menu";
  var SELECTOR_NAVBAR_NAV = ".navbar-nav";
  var SELECTOR_VISIBLE_ITEMS =
    ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
  var PLACEMENT_TOP = "top-start";
  var PLACEMENT_TOPEND = "top-end";
  var PLACEMENT_BOTTOM = "bottom-start";
  var PLACEMENT_BOTTOMEND = "bottom-end";
  var PLACEMENT_RIGHT = "right-start";
  var PLACEMENT_LEFT = "left-start";
  var Default$2 = {
    offset: 0,
    flip: true,
    boundary: "scrollParent",
    reference: "toggle",
    display: "dynamic",
    popperConfig: null,
  };
  var DefaultType$2 = {
    offset: "(number|string|function)",
    flip: "boolean",
    boundary: "(string|element)",
    reference: "(string|element)",
    display: "string",
    popperConfig: "(null|object)",
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Dropdown = /*#__PURE__*/ (function () {
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();

      this._addEventListeners();
    } // Getters

    var _proto = Dropdown.prototype;

    // Public
    _proto.toggle = function toggle() {
      if (
        this._element.disabled ||
        $(this._element).hasClass(CLASS_NAME_DISABLED)
      ) {
        return;
      }

      var isActive = $(this._menu).hasClass(CLASS_NAME_SHOW$2);

      Dropdown._clearMenus();

      if (isActive) {
        return;
      }

      this.show(true);
    };

    _proto.show = function show(usePopper) {
      if (usePopper === void 0) {
        usePopper = false;
      }

      if (
        this._element.disabled ||
        $(this._element).hasClass(CLASS_NAME_DISABLED) ||
        $(this._menu).hasClass(CLASS_NAME_SHOW$2)
      ) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element,
      };
      var showEvent = $.Event(EVENT_SHOW$1, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      } // Disable totally Popper.js for Dropdown in Navbar

      if (!this._inNavbar && usePopper) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        if (typeof Popper === "undefined") {
          throw new TypeError(
            "Bootstrap's dropdowns require Popper.js (https://popper.js.org/)"
          );
        }

        var referenceElement = this._element;

        if (this._config.reference === "parent") {
          referenceElement = parent;
        } else if (Util.isElement(this._config.reference)) {
          referenceElement = this._config.reference; // Check if it's jQuery element

          if (typeof this._config.reference.jquery !== "undefined") {
            referenceElement = this._config.reference[0];
          }
        } // If boundary is not `scrollParent`, then set position to `static`
        // to allow the menu to "escape" the scroll parent's boundaries
        // https://github.com/twbs/bootstrap/issues/24251

        if (this._config.boundary !== "scrollParent") {
          $(parent).addClass(CLASS_NAME_POSITION_STATIC);
        }

        this._popper = new Popper(
          referenceElement,
          this._menu,
          this._getPopperConfig()
        );
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if (
        "ontouchstart" in document.documentElement &&
        $(parent).closest(SELECTOR_NAVBAR_NAV).length === 0
      ) {
        $(document.body).children().on("mouseover", null, $.noop);
      }

      this._element.focus();

      this._element.setAttribute("aria-expanded", true);

      $(this._menu).toggleClass(CLASS_NAME_SHOW$2);
      $(parent)
        .toggleClass(CLASS_NAME_SHOW$2)
        .trigger($.Event(EVENT_SHOWN$1, relatedTarget));
    };

    _proto.hide = function hide() {
      if (
        this._element.disabled ||
        $(this._element).hasClass(CLASS_NAME_DISABLED) ||
        !$(this._menu).hasClass(CLASS_NAME_SHOW$2)
      ) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element,
      };
      var hideEvent = $.Event(EVENT_HIDE$1, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      if (this._popper) {
        this._popper.destroy();
      }

      $(this._menu).toggleClass(CLASS_NAME_SHOW$2);
      $(parent)
        .toggleClass(CLASS_NAME_SHOW$2)
        .trigger($.Event(EVENT_HIDDEN$1, relatedTarget));
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$4);
      $(this._element).off(EVENT_KEY$4);
      this._element = null;
      this._menu = null;

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    }; // Private

    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      $(this._element).on(EVENT_CLICK, function (event) {
        event.preventDefault();
        event.stopPropagation();

        _this.toggle();
      });
    };

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(
        _objectSpread2(
          _objectSpread2({}, this.constructor.Default),
          $(this._element).data()
        ),
        config
      );
      Util.typeCheckConfig(NAME$4, config, this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      if (!this._menu) {
        var parent = Dropdown._getParentFromElement(this._element);

        if (parent) {
          this._menu = parent.querySelector(SELECTOR_MENU);
        }
      }

      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      var $parentDropdown = $(this._element.parentNode);
      var placement = PLACEMENT_BOTTOM; // Handle dropup

      if ($parentDropdown.hasClass(CLASS_NAME_DROPUP)) {
        placement = $(this._menu).hasClass(CLASS_NAME_MENURIGHT)
          ? PLACEMENT_TOPEND
          : PLACEMENT_TOP;
      } else if ($parentDropdown.hasClass(CLASS_NAME_DROPRIGHT)) {
        placement = PLACEMENT_RIGHT;
      } else if ($parentDropdown.hasClass(CLASS_NAME_DROPLEFT)) {
        placement = PLACEMENT_LEFT;
      } else if ($(this._menu).hasClass(CLASS_NAME_MENURIGHT)) {
        placement = PLACEMENT_BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      return $(this._element).closest(".navbar").length > 0;
    };

    _proto._getOffset = function _getOffset() {
      var _this2 = this;

      var offset = {};

      if (typeof this._config.offset === "function") {
        offset.fn = function (data) {
          data.offsets = _objectSpread2(
            _objectSpread2({}, data.offsets),
            _this2._config.offset(data.offsets, _this2._element) || {}
          );
          return data;
        };
      } else {
        offset.offset = this._config.offset;
      }

      return offset;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      var popperConfig = {
        placement: this._getPlacement(),
        modifiers: {
          offset: this._getOffset(),
          flip: {
            enabled: this._config.flip,
          },
          preventOverflow: {
            boundariesElement: this._config.boundary,
          },
        },
      }; // Disable Popper.js if we have a static display

      if (this._config.display === "static") {
        popperConfig.modifiers.applyStyle = {
          enabled: false,
        };
      }

      return _objectSpread2(
        _objectSpread2({}, popperConfig),
        this._config.popperConfig
      );
    }; // Static

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$4);

        var _config = typeof config === "object" ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $(this).data(DATA_KEY$4, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (
        event &&
        (event.which === RIGHT_MOUSE_BUTTON_WHICH ||
          (event.type === "keyup" && event.which !== TAB_KEYCODE))
      ) {
        return;
      }

      var toggles = [].slice.call(
        document.querySelectorAll(SELECTOR_DATA_TOGGLE$2)
      );

      for (var i = 0, len = toggles.length; i < len; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);

        var context = $(toggles[i]).data(DATA_KEY$4);
        var relatedTarget = {
          relatedTarget: toggles[i],
        };

        if (event && event.type === "click") {
          relatedTarget.clickEvent = event;
        }

        if (!context) {
          continue;
        }

        var dropdownMenu = context._menu;

        if (!$(parent).hasClass(CLASS_NAME_SHOW$2)) {
          continue;
        }

        if (
          event &&
          ((event.type === "click" &&
            /input|textarea/i.test(event.target.tagName)) ||
            (event.type === "keyup" && event.which === TAB_KEYCODE)) &&
          $.contains(parent, event.target)
        ) {
          continue;
        }

        var hideEvent = $.Event(EVENT_HIDE$1, relatedTarget);
        $(parent).trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
          continue;
        } // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support

        if ("ontouchstart" in document.documentElement) {
          $(document.body).children().off("mouseover", null, $.noop);
        }

        toggles[i].setAttribute("aria-expanded", "false");

        if (context._popper) {
          context._popper.destroy();
        }

        $(dropdownMenu).removeClass(CLASS_NAME_SHOW$2);
        $(parent)
          .removeClass(CLASS_NAME_SHOW$2)
          .trigger($.Event(EVENT_HIDDEN$1, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = document.querySelector(selector);
      }

      return parent || element.parentNode;
    }; // eslint-disable-next-line complexity

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (
        /input|textarea/i.test(event.target.tagName)
          ? event.which === SPACE_KEYCODE ||
            (event.which !== ESCAPE_KEYCODE &&
              ((event.which !== ARROW_DOWN_KEYCODE &&
                event.which !== ARROW_UP_KEYCODE) ||
                $(event.target).closest(SELECTOR_MENU).length))
          : !REGEXP_KEYDOWN.test(event.which)
      ) {
        return;
      }

      if (this.disabled || $(this).hasClass(CLASS_NAME_DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);

      var isActive = $(parent).hasClass(CLASS_NAME_SHOW$2);

      if (!isActive && event.which === ESCAPE_KEYCODE) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (
        !isActive ||
        (isActive &&
          (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE))
      ) {
        if (event.which === ESCAPE_KEYCODE) {
          $(parent.querySelector(SELECTOR_DATA_TOGGLE$2)).trigger("focus");
        }

        $(this).trigger("click");
        return;
      }

      var items = [].slice
        .call(parent.querySelectorAll(SELECTOR_VISIBLE_ITEMS))
        .filter(function (item) {
          return $(item).is(":visible");
        });

      if (items.length === 0) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // Up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // Down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$4;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$2;
        },
      },
      {
        key: "DefaultType",
        get: function get() {
          return DefaultType$2;
        },
      },
    ]);

    return Dropdown;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document)
    .on(
      EVENT_KEYDOWN_DATA_API,
      SELECTOR_DATA_TOGGLE$2,
      Dropdown._dataApiKeydownHandler
    )
    .on(EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown._dataApiKeydownHandler)
    .on(
      EVENT_CLICK_DATA_API$4 + " " + EVENT_KEYUP_DATA_API,
      Dropdown._clearMenus
    )
    .on(EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$2, function (event) {
      event.preventDefault();
      event.stopPropagation();

      Dropdown._jQueryInterface.call($(this), "toggle");
    })
    .on(EVENT_CLICK_DATA_API$4, SELECTOR_FORM_CHILD, function (e) {
      e.stopPropagation();
    });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$4] = Dropdown._jQueryInterface;
  $.fn[NAME$4].Constructor = Dropdown;

  $.fn[NAME$4].noConflict = function () {
    $.fn[NAME$4] = JQUERY_NO_CONFLICT$4;
    return Dropdown._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$5 = "modal";
  var VERSION$5 = "4.5.0";
  var DATA_KEY$5 = "bs.modal";
  var EVENT_KEY$5 = "." + DATA_KEY$5;
  var DATA_API_KEY$5 = ".data-api";
  var JQUERY_NO_CONFLICT$5 = $.fn[NAME$5];
  var ESCAPE_KEYCODE$1 = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default$3 = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true,
  };
  var DefaultType$3 = {
    backdrop: "(boolean|string)",
    keyboard: "boolean",
    focus: "boolean",
    show: "boolean",
  };
  var EVENT_HIDE$2 = "hide" + EVENT_KEY$5;
  var EVENT_HIDE_PREVENTED = "hidePrevented" + EVENT_KEY$5;
  var EVENT_HIDDEN$2 = "hidden" + EVENT_KEY$5;
  var EVENT_SHOW$2 = "show" + EVENT_KEY$5;
  var EVENT_SHOWN$2 = "shown" + EVENT_KEY$5;
  var EVENT_FOCUSIN = "focusin" + EVENT_KEY$5;
  var EVENT_RESIZE = "resize" + EVENT_KEY$5;
  var EVENT_CLICK_DISMISS = "click.dismiss" + EVENT_KEY$5;
  var EVENT_KEYDOWN_DISMISS = "keydown.dismiss" + EVENT_KEY$5;
  var EVENT_MOUSEUP_DISMISS = "mouseup.dismiss" + EVENT_KEY$5;
  var EVENT_MOUSEDOWN_DISMISS = "mousedown.dismiss" + EVENT_KEY$5;
  var EVENT_CLICK_DATA_API$5 = "click" + EVENT_KEY$5 + DATA_API_KEY$5;
  var CLASS_NAME_SCROLLABLE = "modal-dialog-scrollable";
  var CLASS_NAME_SCROLLBAR_MEASURER = "modal-scrollbar-measure";
  var CLASS_NAME_BACKDROP = "modal-backdrop";
  var CLASS_NAME_OPEN = "modal-open";
  var CLASS_NAME_FADE$1 = "fade";
  var CLASS_NAME_SHOW$3 = "show";
  var CLASS_NAME_STATIC = "modal-static";
  var SELECTOR_DIALOG = ".modal-dialog";
  var SELECTOR_MODAL_BODY = ".modal-body";
  var SELECTOR_DATA_TOGGLE$3 = '[data-toggle="modal"]';
  var SELECTOR_DATA_DISMISS = '[data-dismiss="modal"]';
  var SELECTOR_FIXED_CONTENT =
    ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
  var SELECTOR_STICKY_CONTENT = ".sticky-top";
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Modal = /*#__PURE__*/ (function () {
    function Modal(element, config) {
      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = element.querySelector(SELECTOR_DIALOG);
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollbarWidth = 0;
    } // Getters

    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      if (this._isShown || this._isTransitioning) {
        return;
      }

      if ($(this._element).hasClass(CLASS_NAME_FADE$1)) {
        this._isTransitioning = true;
      }

      var showEvent = $.Event(EVENT_SHOW$2, {
        relatedTarget: relatedTarget,
      });
      $(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();

      this._setScrollbar();

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      $(this._element).on(
        EVENT_CLICK_DISMISS,
        SELECTOR_DATA_DISMISS,
        function (event) {
          return _this.hide(event);
        }
      );
      $(this._dialog).on(EVENT_MOUSEDOWN_DISMISS, function () {
        $(_this._element).one(EVENT_MOUSEUP_DISMISS, function (event) {
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      if (event) {
        event.preventDefault();
      }

      if (!this._isShown || this._isTransitioning) {
        return;
      }

      var hideEvent = $.Event(EVENT_HIDE$2);
      $(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;
      var transition = $(this._element).hasClass(CLASS_NAME_FADE$1);

      if (transition) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      $(document).off(EVENT_FOCUSIN);
      $(this._element).removeClass(CLASS_NAME_SHOW$3);
      $(this._element).off(EVENT_CLICK_DISMISS);
      $(this._dialog).off(EVENT_MOUSEDOWN_DISMISS);

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(
          this._element
        );
        $(this._element)
          .one(Util.TRANSITION_END, function (event) {
            return _this2._hideModal(event);
          })
          .emulateTransitionEnd(transitionDuration);
      } else {
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      [window, this._element, this._dialog].forEach(function (htmlElement) {
        return $(htmlElement).off(EVENT_KEY$5);
      });
      /**
       * `document` has 2 events `EVENT_FOCUSIN` and `EVENT_CLICK_DATA_API`
       * Do not move `document` in `htmlElements` array
       * It will remove `EVENT_CLICK_DATA_API` event that should remain
       */

      $(document).off(EVENT_FOCUSIN);
      $.removeData(this._element, DATA_KEY$5);
      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._isTransitioning = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      this._adjustDialog();
    }; // Private

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(_objectSpread2({}, Default$3), config);
      Util.typeCheckConfig(NAME$5, config, DefaultType$3);
      return config;
    };

    _proto._triggerBackdropTransition = function _triggerBackdropTransition() {
      var _this3 = this;

      if (this._config.backdrop === "static") {
        var hideEventPrevented = $.Event(EVENT_HIDE_PREVENTED);
        $(this._element).trigger(hideEventPrevented);

        if (hideEventPrevented.defaultPrevented) {
          return;
        }

        this._element.classList.add(CLASS_NAME_STATIC);

        var modalTransitionDuration = Util.getTransitionDurationFromElement(
          this._element
        );
        $(this._element)
          .one(Util.TRANSITION_END, function () {
            _this3._element.classList.remove(CLASS_NAME_STATIC);
          })
          .emulateTransitionEnd(modalTransitionDuration);

        this._element.focus();
      } else {
        this.hide();
      }
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this4 = this;

      var transition = $(this._element).hasClass(CLASS_NAME_FADE$1);
      var modalBody = this._dialog
        ? this._dialog.querySelector(SELECTOR_MODAL_BODY)
        : null;

      if (
        !this._element.parentNode ||
        this._element.parentNode.nodeType !== Node.ELEMENT_NODE
      ) {
        // Don't move modal's DOM position
        document.body.appendChild(this._element);
      }

      this._element.style.display = "block";

      this._element.removeAttribute("aria-hidden");

      this._element.setAttribute("aria-modal", true);

      if ($(this._dialog).hasClass(CLASS_NAME_SCROLLABLE) && modalBody) {
        modalBody.scrollTop = 0;
      } else {
        this._element.scrollTop = 0;
      }

      if (transition) {
        Util.reflow(this._element);
      }

      $(this._element).addClass(CLASS_NAME_SHOW$3);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $.Event(EVENT_SHOWN$2, {
        relatedTarget: relatedTarget,
      });

      var transitionComplete = function transitionComplete() {
        if (_this4._config.focus) {
          _this4._element.focus();
        }

        _this4._isTransitioning = false;
        $(_this4._element).trigger(shownEvent);
      };

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(
          this._dialog
        );
        $(this._dialog)
          .one(Util.TRANSITION_END, transitionComplete)
          .emulateTransitionEnd(transitionDuration);
      } else {
        transitionComplete();
      }
    };

    _proto._enforceFocus = function _enforceFocus() {
      var _this5 = this;

      $(document)
        .off(EVENT_FOCUSIN) // Guard against infinite focus loop
        .on(EVENT_FOCUSIN, function (event) {
          if (
            document !== event.target &&
            _this5._element !== event.target &&
            $(_this5._element).has(event.target).length === 0
          ) {
            _this5._element.focus();
          }
        });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this6 = this;

      if (this._isShown) {
        $(this._element).on(EVENT_KEYDOWN_DISMISS, function (event) {
          if (_this6._config.keyboard && event.which === ESCAPE_KEYCODE$1) {
            event.preventDefault();

            _this6.hide();
          } else if (
            !_this6._config.keyboard &&
            event.which === ESCAPE_KEYCODE$1
          ) {
            _this6._triggerBackdropTransition();
          }
        });
      } else if (!this._isShown) {
        $(this._element).off(EVENT_KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this7 = this;

      if (this._isShown) {
        $(window).on(EVENT_RESIZE, function (event) {
          return _this7.handleUpdate(event);
        });
      } else {
        $(window).off(EVENT_RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this8 = this;

      this._element.style.display = "none";

      this._element.setAttribute("aria-hidden", true);

      this._element.removeAttribute("aria-modal");

      this._isTransitioning = false;

      this._showBackdrop(function () {
        $(document.body).removeClass(CLASS_NAME_OPEN);

        _this8._resetAdjustments();

        _this8._resetScrollbar();

        $(_this8._element).trigger(EVENT_HIDDEN$2);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this9 = this;

      var animate = $(this._element).hasClass(CLASS_NAME_FADE$1)
        ? CLASS_NAME_FADE$1
        : "";

      if (this._isShown && this._config.backdrop) {
        this._backdrop = document.createElement("div");
        this._backdrop.className = CLASS_NAME_BACKDROP;

        if (animate) {
          this._backdrop.classList.add(animate);
        }

        $(this._backdrop).appendTo(document.body);
        $(this._element).on(EVENT_CLICK_DISMISS, function (event) {
          if (_this9._ignoreBackdropClick) {
            _this9._ignoreBackdropClick = false;
            return;
          }

          if (event.target !== event.currentTarget) {
            return;
          }

          _this9._triggerBackdropTransition();
        });

        if (animate) {
          Util.reflow(this._backdrop);
        }

        $(this._backdrop).addClass(CLASS_NAME_SHOW$3);

        if (!callback) {
          return;
        }

        if (!animate) {
          callback();
          return;
        }

        var backdropTransitionDuration = Util.getTransitionDurationFromElement(
          this._backdrop
        );
        $(this._backdrop)
          .one(Util.TRANSITION_END, callback)
          .emulateTransitionEnd(backdropTransitionDuration);
      } else if (!this._isShown && this._backdrop) {
        $(this._backdrop).removeClass(CLASS_NAME_SHOW$3);

        var callbackRemove = function callbackRemove() {
          _this9._removeBackdrop();

          if (callback) {
            callback();
          }
        };

        if ($(this._element).hasClass(CLASS_NAME_FADE$1)) {
          var _backdropTransitionDuration =
            Util.getTransitionDurationFromElement(this._backdrop);

          $(this._backdrop)
            .one(Util.TRANSITION_END, callbackRemove)
            .emulateTransitionEnd(_backdropTransitionDuration);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    }; // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------

    _proto._adjustDialog = function _adjustDialog() {
      var isModalOverflowing =
        this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = "";
      this._element.style.paddingRight = "";
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      var rect = document.body.getBoundingClientRect();
      this._isBodyOverflowing =
        Math.round(rect.left + rect.right) < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this10 = this;

      if (this._isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
        var fixedContent = [].slice.call(
          document.querySelectorAll(SELECTOR_FIXED_CONTENT)
        );
        var stickyContent = [].slice.call(
          document.querySelectorAll(SELECTOR_STICKY_CONTENT)
        ); // Adjust fixed content padding

        $(fixedContent).each(function (index, element) {
          var actualPadding = element.style.paddingRight;
          var calculatedPadding = $(element).css("padding-right");
          $(element)
            .data("padding-right", actualPadding)
            .css(
              "padding-right",
              parseFloat(calculatedPadding) + _this10._scrollbarWidth + "px"
            );
        }); // Adjust sticky content margin

        $(stickyContent).each(function (index, element) {
          var actualMargin = element.style.marginRight;
          var calculatedMargin = $(element).css("margin-right");
          $(element)
            .data("margin-right", actualMargin)
            .css(
              "margin-right",
              parseFloat(calculatedMargin) - _this10._scrollbarWidth + "px"
            );
        }); // Adjust body padding

        var actualPadding = document.body.style.paddingRight;
        var calculatedPadding = $(document.body).css("padding-right");
        $(document.body)
          .data("padding-right", actualPadding)
          .css(
            "padding-right",
            parseFloat(calculatedPadding) + this._scrollbarWidth + "px"
          );
      }

      $(document.body).addClass(CLASS_NAME_OPEN);
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // Restore fixed content padding
      var fixedContent = [].slice.call(
        document.querySelectorAll(SELECTOR_FIXED_CONTENT)
      );
      $(fixedContent).each(function (index, element) {
        var padding = $(element).data("padding-right");
        $(element).removeData("padding-right");
        element.style.paddingRight = padding ? padding : "";
      }); // Restore sticky content

      var elements = [].slice.call(
        document.querySelectorAll("" + SELECTOR_STICKY_CONTENT)
      );
      $(elements).each(function (index, element) {
        var margin = $(element).data("margin-right");

        if (typeof margin !== "undefined") {
          $(element).css("margin-right", margin).removeData("margin-right");
        }
      }); // Restore body padding

      var padding = $(document.body).data("padding-right");
      $(document.body).removeData("padding-right");
      document.body.style.paddingRight = padding ? padding : "";
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement("div");
      scrollDiv.className = CLASS_NAME_SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth =
        scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }; // Static

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$5);

        var _config = _objectSpread2(
          _objectSpread2(_objectSpread2({}, Default$3), $(this).data()),
          typeof config === "object" && config ? config : {}
        );

        if (!data) {
          data = new Modal(this, _config);
          $(this).data(DATA_KEY$5, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$5;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$3;
        },
      },
    ]);

    return Modal;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(
    EVENT_CLICK_DATA_API$5,
    SELECTOR_DATA_TOGGLE$3,
    function (event) {
      var _this11 = this;

      var target;
      var selector = Util.getSelectorFromElement(this);

      if (selector) {
        target = document.querySelector(selector);
      }

      var config = $(target).data(DATA_KEY$5)
        ? "toggle"
        : _objectSpread2(_objectSpread2({}, $(target).data()), $(this).data());

      if (this.tagName === "A" || this.tagName === "AREA") {
        event.preventDefault();
      }

      var $target = $(target).one(EVENT_SHOW$2, function (showEvent) {
        if (showEvent.isDefaultPrevented()) {
          // Only register focus restorer if modal will actually get shown
          return;
        }

        $target.one(EVENT_HIDDEN$2, function () {
          if ($(_this11).is(":visible")) {
            _this11.focus();
          }
        });
      });

      Modal._jQueryInterface.call($(target), config, this);
    }
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$5] = Modal._jQueryInterface;
  $.fn[NAME$5].Constructor = Modal;

  $.fn[NAME$5].noConflict = function () {
    $.fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return Modal._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.5.0): tools/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  var uriAttrs = [
    "background",
    "cite",
    "href",
    "itemtype",
    "longdesc",
    "poster",
    "src",
    "xlink:href",
  ];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
    a: ["target", "href", "title", "rel"],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ["src", "srcset", "alt", "title", "width", "height"],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: [],
  };
  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var SAFE_URL_PATTERN =
    /^(?:(?:https?|mailto|ftp|tel|file):|[^#&/:?]*(?:[#/?]|$))/gi;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;

  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase();

    if (allowedAttributeList.indexOf(attrName) !== -1) {
      if (uriAttrs.indexOf(attrName) !== -1) {
        return Boolean(
          attr.nodeValue.match(SAFE_URL_PATTERN) ||
            attr.nodeValue.match(DATA_URL_PATTERN)
        );
      }

      return true;
    }

    var regExp = allowedAttributeList.filter(function (attrRegex) {
      return attrRegex instanceof RegExp;
    }); // Check if a regular expression validates the attribute.

    for (var i = 0, len = regExp.length; i < len; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }

    return false;
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    }

    if (sanitizeFn && typeof sanitizeFn === "function") {
      return sanitizeFn(unsafeHtml);
    }

    var domParser = new window.DOMParser();
    var createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
    var whitelistKeys = Object.keys(whiteList);
    var elements = [].slice.call(createdDocument.body.querySelectorAll("*"));

    var _loop = function _loop(i, len) {
      var el = elements[i];
      var elName = el.nodeName.toLowerCase();

      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
        el.parentNode.removeChild(el);
        return "continue";
      }

      var attributeList = [].slice.call(el.attributes);
      var whitelistedAttributes = [].concat(
        whiteList["*"] || [],
        whiteList[elName] || []
      );
      attributeList.forEach(function (attr) {
        if (!allowedAttribute(attr, whitelistedAttributes)) {
          el.removeAttribute(attr.nodeName);
        }
      });
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$6 = "tooltip";
  var VERSION$6 = "4.5.0";
  var DATA_KEY$6 = "bs.tooltip";
  var EVENT_KEY$6 = "." + DATA_KEY$6;
  var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
  var CLASS_PREFIX = "bs-tooltip";
  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", "g");
  var DISALLOWED_ATTRIBUTES = ["sanitize", "whiteList", "sanitizeFn"];
  var DefaultType$4 = {
    animation: "boolean",
    template: "string",
    title: "(string|element|function)",
    trigger: "string",
    delay: "(number|object)",
    html: "boolean",
    selector: "(string|boolean)",
    placement: "(string|function)",
    offset: "(number|string|function)",
    container: "(string|element|boolean)",
    fallbackPlacement: "(string|array)",
    boundary: "(string|element)",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    whiteList: "object",
    popperConfig: "(null|object)",
  };
  var AttachmentMap = {
    AUTO: "auto",
    TOP: "top",
    RIGHT: "right",
    BOTTOM: "bottom",
    LEFT: "left",
  };
  var Default$4 = {
    animation: true,
    template:
      '<div class="tooltip" role="tooltip">' +
      '<div class="arrow"></div>' +
      '<div class="tooltip-inner"></div></div>',
    trigger: "hover focus",
    title: "",
    delay: 0,
    html: false,
    selector: false,
    placement: "top",
    offset: 0,
    container: false,
    fallbackPlacement: "flip",
    boundary: "scrollParent",
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist,
    popperConfig: null,
  };
  var HOVER_STATE_SHOW = "show";
  var HOVER_STATE_OUT = "out";
  var Event = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6,
  };
  var CLASS_NAME_FADE$2 = "fade";
  var CLASS_NAME_SHOW$4 = "show";
  var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
  var SELECTOR_ARROW = ".arrow";
  var TRIGGER_HOVER = "hover";
  var TRIGGER_FOCUS = "focus";
  var TRIGGER_CLICK = "click";
  var TRIGGER_MANUAL = "manual";
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tooltip = /*#__PURE__*/ (function () {
    function Tooltip(element, config) {
      if (typeof Popper === "undefined") {
        throw new TypeError(
          "Bootstrap's tooltips require Popper.js (https://popper.js.org/)"
        );
      } // private

      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = "";
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters

    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(
            event.currentTarget,
            this._getDelegateConfig()
          );
          $(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if ($(this.getTipElement()).hasClass(CLASS_NAME_SHOW$4)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      $.removeData(this.element, this.constructor.DATA_KEY);
      $(this.element).off(this.constructor.EVENT_KEY);
      $(this.element)
        .closest(".modal")
        .off("hide.bs.modal", this._hideModalHandler);

      if (this.tip) {
        $(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      if ($(this.element).css("display") === "none") {
        throw new Error("Please use show on visible elements");
      }

      var showEvent = $.Event(this.constructor.Event.SHOW);

      if (this.isWithContent() && this._isEnabled) {
        $(this.element).trigger(showEvent);
        var shadowRoot = Util.findShadowRoot(this.element);
        var isInTheDom = $.contains(
          shadowRoot !== null
            ? shadowRoot
            : this.element.ownerDocument.documentElement,
          this.element
        );

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);
        tip.setAttribute("id", tipId);
        this.element.setAttribute("aria-describedby", tipId);
        this.setContent();

        if (this.config.animation) {
          $(tip).addClass(CLASS_NAME_FADE$2);
        }

        var placement =
          typeof this.config.placement === "function"
            ? this.config.placement.call(this, tip, this.element)
            : this.config.placement;

        var attachment = this._getAttachment(placement);

        this.addAttachmentClass(attachment);

        var container = this._getContainer();

        $(tip).data(this.constructor.DATA_KEY, this);

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          $(tip).appendTo(container);
        }

        $(this.element).trigger(this.constructor.Event.INSERTED);
        this._popper = new Popper(
          this.element,
          tip,
          this._getPopperConfig(attachment)
        );
        $(tip).addClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ("ontouchstart" in document.documentElement) {
          $(document.body).children().on("mouseover", null, $.noop);
        }

        var complete = function complete() {
          if (_this.config.animation) {
            _this._fixTransition();
          }

          var prevHoverState = _this._hoverState;
          _this._hoverState = null;
          $(_this.element).trigger(_this.constructor.Event.SHOWN);

          if (prevHoverState === HOVER_STATE_OUT) {
            _this._leave(null, _this);
          }
        };

        if ($(this.tip).hasClass(CLASS_NAME_FADE$2)) {
          var transitionDuration = Util.getTransitionDurationFromElement(
            this.tip
          );
          $(this.tip)
            .one(Util.TRANSITION_END, complete)
            .emulateTransitionEnd(transitionDuration);
        } else {
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      var tip = this.getTipElement();
      var hideEvent = $.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        if (_this2._hoverState !== HOVER_STATE_SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this2._cleanTipClass();

        _this2.element.removeAttribute("aria-describedby");

        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

        if (_this2._popper !== null) {
          _this2._popper.destroy();
        }

        if (callback) {
          callback();
        }
      };

      $(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(tip).removeClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ("ontouchstart" in document.documentElement) {
        $(document.body).children().off("mouseover", null, $.noop);
      }

      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;

      if ($(this.tip).hasClass(CLASS_NAME_FADE$2)) {
        var transitionDuration = Util.getTransitionDurationFromElement(tip);
        $(tip)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }

      this._hoverState = "";
    };

    _proto.update = function update() {
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    }; // Protected

    _proto.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var tip = this.getTipElement();
      this.setElementContent(
        $(tip.querySelectorAll(SELECTOR_TOOLTIP_INNER)),
        this.getTitle()
      );
      $(tip).removeClass(CLASS_NAME_FADE$2 + " " + CLASS_NAME_SHOW$4);
    };

    _proto.setElementContent = function setElementContent($element, content) {
      if (typeof content === "object" && (content.nodeType || content.jquery)) {
        // Content is a DOM node or a jQuery
        if (this.config.html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($(content).text());
        }

        return;
      }

      if (this.config.html) {
        if (this.config.sanitize) {
          content = sanitizeHtml(
            content,
            this.config.whiteList,
            this.config.sanitizeFn
          );
        }

        $element.html(content);
      } else {
        $element.text(content);
      }
    };

    _proto.getTitle = function getTitle() {
      var title = this.element.getAttribute("data-original-title");

      if (!title) {
        title =
          typeof this.config.title === "function"
            ? this.config.title.call(this.element)
            : this.config.title;
      }

      return title;
    }; // Private

    _proto._getPopperConfig = function _getPopperConfig(attachment) {
      var _this3 = this;

      var defaultBsConfig = {
        placement: attachment,
        modifiers: {
          offset: this._getOffset(),
          flip: {
            behavior: this.config.fallbackPlacement,
          },
          arrow: {
            element: SELECTOR_ARROW,
          },
          preventOverflow: {
            boundariesElement: this.config.boundary,
          },
        },
        onCreate: function onCreate(data) {
          if (data.originalPlacement !== data.placement) {
            _this3._handlePopperPlacementChange(data);
          }
        },
        onUpdate: function onUpdate(data) {
          return _this3._handlePopperPlacementChange(data);
        },
      };
      return _objectSpread2(
        _objectSpread2({}, defaultBsConfig),
        this.config.popperConfig
      );
    };

    _proto._getOffset = function _getOffset() {
      var _this4 = this;

      var offset = {};

      if (typeof this.config.offset === "function") {
        offset.fn = function (data) {
          data.offsets = _objectSpread2(
            _objectSpread2({}, data.offsets),
            _this4.config.offset(data.offsets, _this4.element) || {}
          );
          return data;
        };
      } else {
        offset.offset = this.config.offset;
      }

      return offset;
    };

    _proto._getContainer = function _getContainer() {
      if (this.config.container === false) {
        return document.body;
      }

      if (Util.isElement(this.config.container)) {
        return $(this.config.container);
      }

      return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this5 = this;

      var triggers = this.config.trigger.split(" ");
      triggers.forEach(function (trigger) {
        if (trigger === "click") {
          $(_this5.element).on(
            _this5.constructor.Event.CLICK,
            _this5.config.selector,
            function (event) {
              return _this5.toggle(event);
            }
          );
        } else if (trigger !== TRIGGER_MANUAL) {
          var eventIn =
            trigger === TRIGGER_HOVER
              ? _this5.constructor.Event.MOUSEENTER
              : _this5.constructor.Event.FOCUSIN;
          var eventOut =
            trigger === TRIGGER_HOVER
              ? _this5.constructor.Event.MOUSELEAVE
              : _this5.constructor.Event.FOCUSOUT;
          $(_this5.element)
            .on(eventIn, _this5.config.selector, function (event) {
              return _this5._enter(event);
            })
            .on(eventOut, _this5.config.selector, function (event) {
              return _this5._leave(event);
            });
        }
      });

      this._hideModalHandler = function () {
        if (_this5.element) {
          _this5.hide();
        }
      };

      $(this.element)
        .closest(".modal")
        .on("hide.bs.modal", this._hideModalHandler);

      if (this.config.selector) {
        this.config = _objectSpread2(
          _objectSpread2({}, this.config),
          {},
          {
            trigger: "manual",
            selector: "",
          }
        );
      } else {
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      var titleType = typeof this.element.getAttribute("data-original-title");

      if (this.element.getAttribute("title") || titleType !== "string") {
        this.element.setAttribute(
          "data-original-title",
          this.element.getAttribute("title") || ""
        );
        this.element.setAttribute("title", "");
      }
    };

    _proto._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(
          event.currentTarget,
          this._getDelegateConfig()
        );
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[
          event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER
        ] = true;
      }

      if (
        $(context.getTipElement()).hasClass(CLASS_NAME_SHOW$4) ||
        context._hoverState === HOVER_STATE_SHOW
      ) {
        context._hoverState = HOVER_STATE_SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HOVER_STATE_SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(
          event.currentTarget,
          this._getDelegateConfig()
        );
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[
          event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER
        ] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HOVER_STATE_OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HOVER_STATE_OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    _proto._getConfig = function _getConfig(config) {
      var dataAttributes = $(this.element).data();
      Object.keys(dataAttributes).forEach(function (dataAttr) {
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          delete dataAttributes[dataAttr];
        }
      });
      config = _objectSpread2(
        _objectSpread2(
          _objectSpread2({}, this.constructor.Default),
          dataAttributes
        ),
        typeof config === "object" && config ? config : {}
      );

      if (typeof config.delay === "number") {
        config.delay = {
          show: config.delay,
          hide: config.delay,
        };
      }

      if (typeof config.title === "number") {
        config.title = config.title.toString();
      }

      if (typeof config.content === "number") {
        config.content = config.content.toString();
      }

      Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);

      if (config.sanitize) {
        config.template = sanitizeHtml(
          config.template,
          config.whiteList,
          config.sanitizeFn
        );
      }

      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr("class").match(BSCLS_PREFIX_REGEX);

      if (tabClass !== null && tabClass.length) {
        $tip.removeClass(tabClass.join(""));
      }
    };

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(
      popperData
    ) {
      this.tip = popperData.instance.popper;

      this._cleanTipClass();

      this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      var tip = this.getTipElement();
      var initConfigAnimation = this.config.animation;

      if (tip.getAttribute("x-placement") !== null) {
        return;
      }

      $(tip).removeClass(CLASS_NAME_FADE$2);
      this.config.animation = false;
      this.hide();
      this.show();
      this.config.animation = initConfigAnimation;
    }; // Static

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$6);

        var _config = typeof config === "object" && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $(this).data(DATA_KEY$6, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$6;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$4;
        },
      },
      {
        key: "NAME",
        get: function get() {
          return NAME$6;
        },
      },
      {
        key: "DATA_KEY",
        get: function get() {
          return DATA_KEY$6;
        },
      },
      {
        key: "Event",
        get: function get() {
          return Event;
        },
      },
      {
        key: "EVENT_KEY",
        get: function get() {
          return EVENT_KEY$6;
        },
      },
      {
        key: "DefaultType",
        get: function get() {
          return DefaultType$4;
        },
      },
    ]);

    return Tooltip;
  })();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$6] = Tooltip._jQueryInterface;
  $.fn[NAME$6].Constructor = Tooltip;

  $.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Tooltip._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$7 = "popover";
  var VERSION$7 = "4.5.0";
  var DATA_KEY$7 = "bs.popover";
  var EVENT_KEY$7 = "." + DATA_KEY$7;
  var JQUERY_NO_CONFLICT$7 = $.fn[NAME$7];
  var CLASS_PREFIX$1 = "bs-popover";
  var BSCLS_PREFIX_REGEX$1 = new RegExp(
    "(^|\\s)" + CLASS_PREFIX$1 + "\\S+",
    "g"
  );

  var Default$5 = _objectSpread2(
    _objectSpread2({}, Tooltip.Default),
    {},
    {
      placement: "right",
      trigger: "click",
      content: "",
      template:
        '<div class="popover" role="tooltip">' +
        '<div class="arrow"></div>' +
        '<h3 class="popover-header"></h3>' +
        '<div class="popover-body"></div></div>',
    }
  );

  var DefaultType$5 = _objectSpread2(
    _objectSpread2({}, Tooltip.DefaultType),
    {},
    {
      content: "(string|element|function)",
    }
  );

  var CLASS_NAME_FADE$3 = "fade";
  var CLASS_NAME_SHOW$5 = "show";
  var SELECTOR_TITLE = ".popover-header";
  var SELECTOR_CONTENT = ".popover-body";
  var Event$1 = {
    HIDE: "hide" + EVENT_KEY$7,
    HIDDEN: "hidden" + EVENT_KEY$7,
    SHOW: "show" + EVENT_KEY$7,
    SHOWN: "shown" + EVENT_KEY$7,
    INSERTED: "inserted" + EVENT_KEY$7,
    CLICK: "click" + EVENT_KEY$7,
    FOCUSIN: "focusin" + EVENT_KEY$7,
    FOCUSOUT: "focusout" + EVENT_KEY$7,
    MOUSEENTER: "mouseenter" + EVENT_KEY$7,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$7,
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Popover = /*#__PURE__*/ (function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    _proto.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var $tip = $(this.getTipElement()); // We use append for html objects to maintain js events

      this.setElementContent($tip.find(SELECTOR_TITLE), this.getTitle());

      var content = this._getContent();

      if (typeof content === "function") {
        content = content.call(this.element);
      }

      this.setElementContent($tip.find(SELECTOR_CONTENT), content);
      $tip.removeClass(CLASS_NAME_FADE$3 + " " + CLASS_NAME_SHOW$5);
    }; // Private

    _proto._getContent = function _getContent() {
      return this.element.getAttribute("data-content") || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr("class").match(BSCLS_PREFIX_REGEX$1);

      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(""));
      }
    }; // Static

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$7);

        var _config = typeof config === "object" ? config : null;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $(this).data(DATA_KEY$7, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    _createClass(Popover, null, [
      {
        key: "VERSION",
        // Getters
        get: function get() {
          return VERSION$7;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$5;
        },
      },
      {
        key: "NAME",
        get: function get() {
          return NAME$7;
        },
      },
      {
        key: "DATA_KEY",
        get: function get() {
          return DATA_KEY$7;
        },
      },
      {
        key: "Event",
        get: function get() {
          return Event$1;
        },
      },
      {
        key: "EVENT_KEY",
        get: function get() {
          return EVENT_KEY$7;
        },
      },
      {
        key: "DefaultType",
        get: function get() {
          return DefaultType$5;
        },
      },
    ]);

    return Popover;
  })(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$7] = Popover._jQueryInterface;
  $.fn[NAME$7].Constructor = Popover;

  $.fn[NAME$7].noConflict = function () {
    $.fn[NAME$7] = JQUERY_NO_CONFLICT$7;
    return Popover._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$8 = "scrollspy";
  var VERSION$8 = "4.5.0";
  var DATA_KEY$8 = "bs.scrollspy";
  var EVENT_KEY$8 = "." + DATA_KEY$8;
  var DATA_API_KEY$6 = ".data-api";
  var JQUERY_NO_CONFLICT$8 = $.fn[NAME$8];
  var Default$6 = {
    offset: 10,
    method: "auto",
    target: "",
  };
  var DefaultType$6 = {
    offset: "number",
    method: "string",
    target: "(string|element)",
  };
  var EVENT_ACTIVATE = "activate" + EVENT_KEY$8;
  var EVENT_SCROLL = "scroll" + EVENT_KEY$8;
  var EVENT_LOAD_DATA_API$2 = "load" + EVENT_KEY$8 + DATA_API_KEY$6;
  var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
  var CLASS_NAME_ACTIVE$2 = "active";
  var SELECTOR_DATA_SPY = '[data-spy="scroll"]';
  var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
  var SELECTOR_NAV_LINKS = ".nav-link";
  var SELECTOR_NAV_ITEMS = ".nav-item";
  var SELECTOR_LIST_ITEMS = ".list-group-item";
  var SELECTOR_DROPDOWN = ".dropdown";
  var SELECTOR_DROPDOWN_ITEMS = ".dropdown-item";
  var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
  var METHOD_OFFSET = "offset";
  var METHOD_POSITION = "position";
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var ScrollSpy = /*#__PURE__*/ (function () {
    function ScrollSpy(element, config) {
      var _this = this;

      this._element = element;
      this._scrollElement = element.tagName === "BODY" ? window : element;
      this._config = this._getConfig(config);
      this._selector =
        this._config.target +
        " " +
        SELECTOR_NAV_LINKS +
        "," +
        (this._config.target + " " + SELECTOR_LIST_ITEMS + ",") +
        (this._config.target + " " + SELECTOR_DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      $(this._scrollElement).on(EVENT_SCROLL, function (event) {
        return _this._process(event);
      });
      this.refresh();

      this._process();
    } // Getters

    var _proto = ScrollSpy.prototype;

    // Public
    _proto.refresh = function refresh() {
      var _this2 = this;

      var autoMethod =
        this._scrollElement === this._scrollElement.window
          ? METHOD_OFFSET
          : METHOD_POSITION;
      var offsetMethod =
        this._config.method === "auto" ? autoMethod : this._config.method;
      var offsetBase =
        offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      var targets = [].slice.call(document.querySelectorAll(this._selector));
      targets
        .map(function (element) {
          var target;
          var targetSelector = Util.getSelectorFromElement(element);

          if (targetSelector) {
            target = document.querySelector(targetSelector);
          }

          if (target) {
            var targetBCR = target.getBoundingClientRect();

            if (targetBCR.width || targetBCR.height) {
              // TODO (fat): remove sketch reliance on jQuery position/offset
              return [
                $(target)[offsetMethod]().top + offsetBase,
                targetSelector,
              ];
            }
          }

          return null;
        })
        .filter(function (item) {
          return item;
        })
        .sort(function (a, b) {
          return a[0] - b[0];
        })
        .forEach(function (item) {
          _this2._offsets.push(item[0]);

          _this2._targets.push(item[1]);
        });
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$8);
      $(this._scrollElement).off(EVENT_KEY$8);
      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    }; // Private

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(
        _objectSpread2({}, Default$6),
        typeof config === "object" && config ? config : {}
      );

      if (typeof config.target !== "string" && Util.isElement(config.target)) {
        var id = $(config.target).attr("id");

        if (!id) {
          id = Util.getUID(NAME$8);
          $(config.target).attr("id", id);
        }

        config.target = "#" + id;
      }

      Util.typeCheckConfig(NAME$8, config, DefaultType$6);
      return config;
    };

    _proto._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window
        ? this._scrollElement.pageYOffset
        : this._scrollElement.scrollTop;
    };

    _proto._getScrollHeight = function _getScrollHeight() {
      return (
        this._scrollElement.scrollHeight ||
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        )
      );
    };

    _proto._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window
        ? window.innerHeight
        : this._scrollElement.getBoundingClientRect().height;
    };

    _proto._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;

      var scrollHeight = this._getScrollHeight();

      var maxScroll =
        this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (
        this._activeTarget &&
        scrollTop < this._offsets[0] &&
        this._offsets[0] > 0
      ) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      for (var i = this._offsets.length; i--; ) {
        var isActiveTarget =
          this._activeTarget !== this._targets[i] &&
          scrollTop >= this._offsets[i] &&
          (typeof this._offsets[i + 1] === "undefined" ||
            scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    _proto._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(",").map(function (selector) {
        return (
          selector +
          '[data-target="' +
          target +
          '"],' +
          selector +
          '[href="' +
          target +
          '"]'
        );
      });

      var $link = $(
        [].slice.call(document.querySelectorAll(queries.join(",")))
      );

      if ($link.hasClass(CLASS_NAME_DROPDOWN_ITEM)) {
        $link
          .closest(SELECTOR_DROPDOWN)
          .find(SELECTOR_DROPDOWN_TOGGLE)
          .addClass(CLASS_NAME_ACTIVE$2);
        $link.addClass(CLASS_NAME_ACTIVE$2);
      } else {
        // Set triggered link as active
        $link.addClass(CLASS_NAME_ACTIVE$2); // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

        $link
          .parents(SELECTOR_NAV_LIST_GROUP)
          .prev(SELECTOR_NAV_LINKS + ", " + SELECTOR_LIST_ITEMS)
          .addClass(CLASS_NAME_ACTIVE$2); // Handle special case when .nav-link is inside .nav-item

        $link
          .parents(SELECTOR_NAV_LIST_GROUP)
          .prev(SELECTOR_NAV_ITEMS)
          .children(SELECTOR_NAV_LINKS)
          .addClass(CLASS_NAME_ACTIVE$2);
      }

      $(this._scrollElement).trigger(EVENT_ACTIVATE, {
        relatedTarget: target,
      });
    };

    _proto._clear = function _clear() {
      [].slice
        .call(document.querySelectorAll(this._selector))
        .filter(function (node) {
          return node.classList.contains(CLASS_NAME_ACTIVE$2);
        })
        .forEach(function (node) {
          return node.classList.remove(CLASS_NAME_ACTIVE$2);
        });
    }; // Static

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$8);

        var _config = typeof config === "object" && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $(this).data(DATA_KEY$8, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$8;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$6;
        },
      },
    ]);

    return ScrollSpy;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(window).on(EVENT_LOAD_DATA_API$2, function () {
    var scrollSpys = [].slice.call(
      document.querySelectorAll(SELECTOR_DATA_SPY)
    );
    var scrollSpysLength = scrollSpys.length;

    for (var i = scrollSpysLength; i--; ) {
      var $spy = $(scrollSpys[i]);

      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$8] = ScrollSpy._jQueryInterface;
  $.fn[NAME$8].Constructor = ScrollSpy;

  $.fn[NAME$8].noConflict = function () {
    $.fn[NAME$8] = JQUERY_NO_CONFLICT$8;
    return ScrollSpy._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$9 = "tab";
  var VERSION$9 = "4.5.0";
  var DATA_KEY$9 = "bs.tab";
  var EVENT_KEY$9 = "." + DATA_KEY$9;
  var DATA_API_KEY$7 = ".data-api";
  var JQUERY_NO_CONFLICT$9 = $.fn[NAME$9];
  var EVENT_HIDE$3 = "hide" + EVENT_KEY$9;
  var EVENT_HIDDEN$3 = "hidden" + EVENT_KEY$9;
  var EVENT_SHOW$3 = "show" + EVENT_KEY$9;
  var EVENT_SHOWN$3 = "shown" + EVENT_KEY$9;
  var EVENT_CLICK_DATA_API$6 = "click" + EVENT_KEY$9 + DATA_API_KEY$7;
  var CLASS_NAME_DROPDOWN_MENU = "dropdown-menu";
  var CLASS_NAME_ACTIVE$3 = "active";
  var CLASS_NAME_DISABLED$1 = "disabled";
  var CLASS_NAME_FADE$4 = "fade";
  var CLASS_NAME_SHOW$6 = "show";
  var SELECTOR_DROPDOWN$1 = ".dropdown";
  var SELECTOR_NAV_LIST_GROUP$1 = ".nav, .list-group";
  var SELECTOR_ACTIVE$2 = ".active";
  var SELECTOR_ACTIVE_UL = "> li > .active";
  var SELECTOR_DATA_TOGGLE$4 =
    '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]';
  var SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
  var SELECTOR_DROPDOWN_ACTIVE_CHILD = "> .dropdown-menu .active";
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tab = /*#__PURE__*/ (function () {
    function Tab(element) {
      this._element = element;
    } // Getters

    var _proto = Tab.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      if (
        (this._element.parentNode &&
          this._element.parentNode.nodeType === Node.ELEMENT_NODE &&
          $(this._element).hasClass(CLASS_NAME_ACTIVE$3)) ||
        $(this._element).hasClass(CLASS_NAME_DISABLED$1)
      ) {
        return;
      }

      var target;
      var previous;
      var listElement = $(this._element).closest(SELECTOR_NAV_LIST_GROUP$1)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        var itemSelector =
          listElement.nodeName === "UL" || listElement.nodeName === "OL"
            ? SELECTOR_ACTIVE_UL
            : SELECTOR_ACTIVE$2;
        previous = $.makeArray($(listElement).find(itemSelector));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $.Event(EVENT_HIDE$3, {
        relatedTarget: this._element,
      });
      var showEvent = $.Event(EVENT_SHOW$3, {
        relatedTarget: previous,
      });

      if (previous) {
        $(previous).trigger(hideEvent);
      }

      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = document.querySelector(selector);
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $.Event(EVENT_HIDDEN$3, {
          relatedTarget: _this._element,
        });
        var shownEvent = $.Event(EVENT_SHOWN$3, {
          relatedTarget: previous,
        });
        $(previous).trigger(hiddenEvent);
        $(_this._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$9);
      this._element = null;
    }; // Private

    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      var activeElements =
        container &&
        (container.nodeName === "UL" || container.nodeName === "OL")
          ? $(container).find(SELECTOR_ACTIVE_UL)
          : $(container).children(SELECTOR_ACTIVE$2);
      var active = activeElements[0];
      var isTransitioning =
        callback && active && $(active).hasClass(CLASS_NAME_FADE$4);

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      };

      if (active && isTransitioning) {
        var transitionDuration = Util.getTransitionDurationFromElement(active);
        $(active)
          .removeClass(CLASS_NAME_SHOW$6)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto._transitionComplete = function _transitionComplete(
      element,
      active,
      callback
    ) {
      if (active) {
        $(active).removeClass(CLASS_NAME_ACTIVE$3);
        var dropdownChild = $(active.parentNode).find(
          SELECTOR_DROPDOWN_ACTIVE_CHILD
        )[0];

        if (dropdownChild) {
          $(dropdownChild).removeClass(CLASS_NAME_ACTIVE$3);
        }

        if (active.getAttribute("role") === "tab") {
          active.setAttribute("aria-selected", false);
        }
      }

      $(element).addClass(CLASS_NAME_ACTIVE$3);

      if (element.getAttribute("role") === "tab") {
        element.setAttribute("aria-selected", true);
      }

      Util.reflow(element);

      if (element.classList.contains(CLASS_NAME_FADE$4)) {
        element.classList.add(CLASS_NAME_SHOW$6);
      }

      if (
        element.parentNode &&
        $(element.parentNode).hasClass(CLASS_NAME_DROPDOWN_MENU)
      ) {
        var dropdownElement = $(element).closest(SELECTOR_DROPDOWN$1)[0];

        if (dropdownElement) {
          var dropdownToggleList = [].slice.call(
            dropdownElement.querySelectorAll(SELECTOR_DROPDOWN_TOGGLE$1)
          );
          $(dropdownToggleList).addClass(CLASS_NAME_ACTIVE$3);
        }

        element.setAttribute("aria-expanded", true);
      }

      if (callback) {
        callback();
      }
    }; // Static

    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$9);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY$9, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config]();
        }
      });
    };

    _createClass(Tab, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$9;
        },
      },
    ]);

    return Tab;
  })();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(
    EVENT_CLICK_DATA_API$6,
    SELECTOR_DATA_TOGGLE$4,
    function (event) {
      event.preventDefault();

      Tab._jQueryInterface.call($(this), "show");
    }
  );
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$9] = Tab._jQueryInterface;
  $.fn[NAME$9].Constructor = Tab;

  $.fn[NAME$9].noConflict = function () {
    $.fn[NAME$9] = JQUERY_NO_CONFLICT$9;
    return Tab._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$a = "toast";
  var VERSION$a = "4.5.0";
  var DATA_KEY$a = "bs.toast";
  var EVENT_KEY$a = "." + DATA_KEY$a;
  var JQUERY_NO_CONFLICT$a = $.fn[NAME$a];
  var EVENT_CLICK_DISMISS$1 = "click.dismiss" + EVENT_KEY$a;
  var EVENT_HIDE$4 = "hide" + EVENT_KEY$a;
  var EVENT_HIDDEN$4 = "hidden" + EVENT_KEY$a;
  var EVENT_SHOW$4 = "show" + EVENT_KEY$a;
  var EVENT_SHOWN$4 = "shown" + EVENT_KEY$a;
  var CLASS_NAME_FADE$5 = "fade";
  var CLASS_NAME_HIDE = "hide";
  var CLASS_NAME_SHOW$7 = "show";
  var CLASS_NAME_SHOWING = "showing";
  var DefaultType$7 = {
    animation: "boolean",
    autohide: "boolean",
    delay: "number",
  };
  var Default$7 = {
    animation: true,
    autohide: true,
    delay: 500,
  };
  var SELECTOR_DATA_DISMISS$1 = '[data-dismiss="toast"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Toast = /*#__PURE__*/ (function () {
    function Toast(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._timeout = null;

      this._setListeners();
    } // Getters

    var _proto = Toast.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      var showEvent = $.Event(EVENT_SHOW$4);
      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE$5);
      }

      var complete = function complete() {
        _this._element.classList.remove(CLASS_NAME_SHOWING);

        _this._element.classList.add(CLASS_NAME_SHOW$7);

        $(_this._element).trigger(EVENT_SHOWN$4);

        if (_this._config.autohide) {
          _this._timeout = setTimeout(function () {
            _this.hide();
          }, _this._config.delay);
        }
      };

      this._element.classList.remove(CLASS_NAME_HIDE);

      Util.reflow(this._element);

      this._element.classList.add(CLASS_NAME_SHOWING);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(
          this._element
        );
        $(this._element)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto.hide = function hide() {
      if (!this._element.classList.contains(CLASS_NAME_SHOW$7)) {
        return;
      }

      var hideEvent = $.Event(EVENT_HIDE$4);
      $(this._element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      this._close();
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      this._timeout = null;

      if (this._element.classList.contains(CLASS_NAME_SHOW$7)) {
        this._element.classList.remove(CLASS_NAME_SHOW$7);
      }

      $(this._element).off(EVENT_CLICK_DISMISS$1);
      $.removeData(this._element, DATA_KEY$a);
      this._element = null;
      this._config = null;
    }; // Private

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread2(
        _objectSpread2(_objectSpread2({}, Default$7), $(this._element).data()),
        typeof config === "object" && config ? config : {}
      );
      Util.typeCheckConfig(NAME$a, config, this.constructor.DefaultType);
      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this2 = this;

      $(this._element).on(
        EVENT_CLICK_DISMISS$1,
        SELECTOR_DATA_DISMISS$1,
        function () {
          return _this2.hide();
        }
      );
    };

    _proto._close = function _close() {
      var _this3 = this;

      var complete = function complete() {
        _this3._element.classList.add(CLASS_NAME_HIDE);

        $(_this3._element).trigger(EVENT_HIDDEN$4);
      };

      this._element.classList.remove(CLASS_NAME_SHOW$7);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(
          this._element
        );
        $(this._element)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    }; // Static

    Toast._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY$a);

        var _config = typeof config === "object" && config;

        if (!data) {
          data = new Toast(this, _config);
          $element.data(DATA_KEY$a, data);
        }

        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError('No method named "' + config + '"');
          }

          data[config](this);
        }
      });
    };

    _createClass(Toast, null, [
      {
        key: "VERSION",
        get: function get() {
          return VERSION$a;
        },
      },
      {
        key: "DefaultType",
        get: function get() {
          return DefaultType$7;
        },
      },
      {
        key: "Default",
        get: function get() {
          return Default$7;
        },
      },
    ]);

    return Toast;
  })();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$a] = Toast._jQueryInterface;
  $.fn[NAME$a].Constructor = Toast;

  $.fn[NAME$a].noConflict = function () {
    $.fn[NAME$a] = JQUERY_NO_CONFLICT$a;
    return Toast._jQueryInterface;
  };

  exports.Alert = Alert;
  exports.Button = Button;
  exports.Carousel = Carousel;
  exports.Collapse = Collapse;
  exports.Dropdown = Dropdown;
  exports.Modal = Modal;
  exports.Popover = Popover;
  exports.Scrollspy = ScrollSpy;
  exports.Tab = Tab;
  exports.Toast = Toast;
  exports.Tooltip = Tooltip;
  exports.Util = Util;

  Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=bootstrap.js.map

/*! @preserve
 * bootbox.js
 * version: 5.1.1
 * author: Nick Payne <nick@kurai.co.uk>
 * license: MIT
 * http://bootboxjs.com/
 */
(function (root, factory) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    // AMD
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // Node, CommonJS-like
    module.exports = factory(require("jquery"));
  } else {
    // Browser globals (root is window)
    root.bootbox = factory(root.jQuery);
  }
})(this, function init($, undefined) {
  "use strict";

  //  Polyfills Object.keys, if necessary.
  //  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"),
        dontEnums = [
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "constructor",
        ],
        dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (
          typeof obj !== "function" &&
          (typeof obj !== "object" || obj === null)
        ) {
          throw new TypeError("Object.keys called on non-object");
        }

        var result = [],
          prop,
          i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }

        return result;
      };
    })();
  }

  var exports = {};

  var VERSION = "5.0.0";
  exports.VERSION = VERSION;

  var locales = {};

  var templates = {
    dialog:
      '<div class="bootbox modal" tabindex="-1" role="dialog" aria-hidden="true">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-body"><div class="bootbox-body"></div></div>' +
      "</div>" +
      "</div>" +
      "</div>",
    header:
      '<div class="modal-header">' + '<h5 class="modal-title"></h5>' + "</div>",
    footer: '<div class="modal-footer"></div>',
    closeButton:
      '<button type="button" class="bootbox-close-button close" aria-hidden="true">&times;</button>',
    form: '<form class="bootbox-form"></form>',
    button: '<button type="button" class="btn"></button>',
    option: "<option></option>",
    promptMessage: '<div class="bootbox-prompt-message"></div>',
    inputs: {
      text: '<input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" />',
      textarea:
        '<textarea class="bootbox-input bootbox-input-textarea form-control"></textarea>',
      email:
        '<input class="bootbox-input bootbox-input-email form-control" autocomplete="off" type="email" />',
      select:
        '<select class="bootbox-input bootbox-input-select form-control"></select>',
      checkbox:
        '<div class="form-check checkbox"><label class="form-check-label"><input class="form-check-input bootbox-input bootbox-input-checkbox" type="checkbox" /></label></div>',
      radio:
        '<div class="form-check radio"><label class="form-check-label"><input class="form-check-input bootbox-input bootbox-input-radio" type="radio" name="bootbox-radio" /></label></div>',
      date: '<input class="bootbox-input bootbox-input-date form-control" autocomplete="off" type="date" />',
      time: '<input class="bootbox-input bootbox-input-time form-control" autocomplete="off" type="time" />',
      number:
        '<input class="bootbox-input bootbox-input-number form-control" autocomplete="off" type="number" />',
      password:
        '<input class="bootbox-input bootbox-input-password form-control" autocomplete="off" type="password" />',
      range:
        '<input class="bootbox-input bootbox-input-range form-control-range" autocomplete="off" type="range" />',
    },
  };

  var defaults = {
    // default language
    locale: "en",
    // show backdrop or not. Default to static so user has to interact with dialog
    backdrop: "static",
    // animate the modal in/out
    animate: true,
    // additional class string applied to the top level dialog
    className: null,
    // whether or not to include a close button
    closeButton: true,
    // show the dialog immediately by default
    show: true,
    // dialog container
    container: "body",
    // default value (used by the prompt helper)
    value: "",
    // default input type (used by the prompt helper)
    inputType: "text",
    // switch button order from cancel/confirm (default) to confirm/cancel
    swapButtonOrder: false,
    // center modal vertically in page
    centerVertical: false,
    // Append "multiple" property to the select when using the "prompt" helper
    multiple: false,
    // Automatically scroll modal content when height exceeds viewport height
    scrollable: false,
  };

  // PUBLIC FUNCTIONS
  // *************************************************************************************************************

  // Return all currently registered locales, or a specific locale if "name" is defined
  exports.locales = function (name) {
    return name ? locales[name] : locales;
  };

  // Register localized strings for the OK, Confirm, and Cancel buttons
  exports.addLocale = function (name, values) {
    $.each(["OK", "CANCEL", "CONFIRM"], function (_, v) {
      if (!values[v]) {
        throw new Error('Please supply a translation for "' + v + '"');
      }
    });

    locales[name] = {
      OK: values.OK,
      CANCEL: values.CANCEL,
      CONFIRM: values.CONFIRM,
    };

    return exports;
  };

  // Remove a previously-registered locale
  exports.removeLocale = function (name) {
    if (name !== "en") {
      delete locales[name];
    } else {
      throw new Error(
        '"en" is used as the default and fallback locale and cannot be removed.'
      );
    }

    return exports;
  };

  // Set the default locale
  exports.setLocale = function (name) {
    return exports.setDefaults("locale", name);
  };

  // Override default value(s) of Bootbox.
  exports.setDefaults = function () {
    var values = {};

    if (arguments.length === 2) {
      // allow passing of single key/value...
      values[arguments[0]] = arguments[1];
    } else {
      // ... and as an object too
      values = arguments[0];
    }

    $.extend(defaults, values);

    return exports;
  };

  exports.setTemplates = function () {
    var values = {};

    if (arguments.length === 3) {
      // allow passing of {key1: {key2: value}} as setTemplates(key1, key2, value)...
      values[arguments[0]] = {};
      values[arguments[0]][arguments[1]] = arguments[2];
    } else if (arguments.length === 2) {
      // ...or allow passing of {key: value} as setTemplates(key, value)...
      values[arguments[0]] = arguments[1];
    } else {
      // ... and as an object too setTemplates(value)
      values = arguments[0];
    }

    $.extend(templates, values);
  };

  // Hides all currently active Bootbox modals
  exports.hideAll = function () {
    $(".bootbox").modal("hide");

    return exports;
  };

  // Allows the base init() function to be overridden
  exports.init = function (_$) {
    return init(_$ || $);
  };

  // CORE HELPER FUNCTIONS
  // *************************************************************************************************************

  // Core dialog function
  exports.dialog = function (options) {
    if ($.fn.modal === undefined) {
      throw new Error(
        '"$.fn.modal" is not defined; please double check you have included ' +
          "the Bootstrap JavaScript library. See http://getbootstrap.com/javascript/ " +
          "for more details."
      );
    }

    options = sanitize(options);

    if ($.fn.modal.Constructor.VERSION) {
      options.fullBootstrapVersion = $.fn.modal.Constructor.VERSION;
      var i = options.fullBootstrapVersion.indexOf(".");
      options.bootstrap = options.fullBootstrapVersion.substring(0, i);
    } else {
      // Assuming version 2.3.2, as that was the last "supported" 2.x version
      options.bootstrap = "2";
      options.fullBootstrapVersion = "2.3.2";
      console.warn(
        "Bootbox will *mostly* work with Bootstrap 2, but we do not officially support it. Please upgrade, if possible."
      );
    }

    var dialog = $(templates.dialog);
    var innerDialog = dialog.find(".modal-dialog");
    var body = dialog.find(".modal-body");
    var header = $(templates.header);
    var footer = $(templates.footer);
    var buttons = options.buttons;

    var callbacks = {
      onEscape: options.onEscape,
    };

    body.find(".bootbox-body").html(options.message);

    // Only attempt to create buttons if at least one has
    // been defined in the options object
    if (getKeyLength(options.buttons) > 0) {
      each(buttons, function (key, b) {
        var button = $(templates.button);
        button.data("bb-handler", key);
        button.addClass(b.className);

        switch (key) {
          case "ok":
          case "confirm":
            button.addClass("bootbox-accept");
            break;

          case "cancel":
            button.addClass("bootbox-cancel");
            break;
        }

        button.html(b.label);
        footer.append(button);

        callbacks[key] = b.callback;
      });

      body.after(footer);
    }

    if (options.animate === true) {
      dialog.addClass("fade");
    }

    if (options.className) {
      dialog.addClass(options.className);
    }

    if (options.size) {
      // Requires Bootstrap 3.1.0 or higher
      if (options.fullBootstrapVersion.substring(0, 3) < "3.1") {
        console.warn(
          '"size" requires Bootstrap 3.1.0 or higher. You appear to be using ' +
            options.fullBootstrapVersion +
            ". Please upgrade to use this option."
        );
      }

      switch (options.size) {
        case "small":
        case "sm":
          innerDialog.addClass("modal-sm");
          break;

        case "large":
        case "lg":
          innerDialog.addClass("modal-lg");
          break;

        case "xl":
        case "extra-large":
          // Requires Bootstrap 4.2.0 or higher
          if (options.fullBootstrapVersion.substring(0, 3) < "4.2") {
            console.warn(
              'Using size "xl"/"extra-large" requires Bootstrap 4.2.0 or higher. You appear to be using ' +
                options.fullBootstrapVersion +
                ". Please upgrade to use this option."
            );
          }
          innerDialog.addClass("modal-xl");
          break;
      }
    }

    if (options.scrollable) {
      // Requires Bootstrap 4.3.0 or higher
      if (options.fullBootstrapVersion.substring(0, 3) < "4.3") {
        console.warn(
          'Using "scrollable" requires Bootstrap 4.3.0 or higher. You appear to be using ' +
            options.fullBootstrapVersion +
            ". Please upgrade to use this option."
        );
      }

      innerDialog.addClass("modal-dialog-scrollable");
    }

    if (options.title) {
      body.before(header);
      dialog.find(".modal-title").html(options.title);
    }

    if (options.closeButton) {
      var closeButton = $(templates.closeButton);

      if (options.title) {
        if (options.bootstrap > 3) {
          dialog.find(".modal-header").append(closeButton);
        } else {
          dialog.find(".modal-header").prepend(closeButton);
        }
      } else {
        closeButton.prependTo(body);
      }
    }

    if (options.centerVertical) {
      // Requires Bootstrap 4.0.0-beta.3 or higher
      if (options.fullBootstrapVersion < "4.0.0") {
        console.warn(
          '"centerVertical" requires Bootstrap 4.0.0-beta.3 or higher. You appear to be using ' +
            options.fullBootstrapVersion +
            ". Please upgrade to use this option."
        );
      }

      innerDialog.addClass("modal-dialog-centered");
    }

    // Bootstrap event listeners; these handle extra
    // setup & teardown required after the underlying
    // modal has performed certain actions.

    // make sure we unbind any listeners once the dialog has definitively been dismissed
    dialog.one("hide.bs.modal", function (e) {
      if (e.target === this) {
        dialog.off("escape.close.bb");
        dialog.off("click");
      }
    });

    dialog.one("hidden.bs.modal", function (e) {
      // ensure we don't accidentally intercept hidden events triggered
      // by children of the current dialog. We shouldn't need to handle this anymore,
      // now that Bootstrap namespaces its events, but still worth doing.
      if (e.target === this) {
        dialog.remove();
      }
    });

    dialog.one("shown.bs.modal", function () {
      dialog.find(".bootbox-accept:first").trigger("focus");
    });

    // Bootbox event listeners; used to decouple some
    // behaviours from their respective triggers

    if (options.backdrop !== "static") {
      // A boolean true/false according to the Bootstrap docs
      // should show a dialog the user can dismiss by clicking on
      // the background.
      // We always only ever pass static/false to the actual
      // $.modal function because with "true" we can't trap
      // this event (the .modal-backdrop swallows it)
      // However, we still want to sort of respect true
      // and invoke the escape mechanism instead
      dialog.on("click.dismiss.bs.modal", function (e) {
        // @NOTE: the target varies in >= 3.3.x releases since the modal backdrop
        // moved *inside* the outer dialog rather than *alongside* it
        if (dialog.children(".modal-backdrop").length) {
          e.currentTarget = dialog.children(".modal-backdrop").get(0);
        }

        if (e.target !== e.currentTarget) {
          return;
        }

        dialog.trigger("escape.close.bb");
      });
    }

    dialog.on("escape.close.bb", function (e) {
      // the if statement looks redundant but it isn't; without it
      // if we *didn't* have an onEscape handler then processCallback
      // would automatically dismiss the dialog
      if (callbacks.onEscape) {
        processCallback(e, dialog, callbacks.onEscape);
      }
    });

    dialog.on("click", ".modal-footer button:not(.disabled)", function (e) {
      var callbackKey = $(this).data("bb-handler");

      processCallback(e, dialog, callbacks[callbackKey]);
    });

    dialog.on("click", ".bootbox-close-button", function (e) {
      // onEscape might be falsy but that's fine; the fact is
      // if the user has managed to click the close button we
      // have to close the dialog, callback or not
      processCallback(e, dialog, callbacks.onEscape);
    });

    dialog.on("keyup", function (e) {
      if (e.which === 27) {
        dialog.trigger("escape.close.bb");
      }
    });

    // the remainder of this method simply deals with adding our
    // dialogent to the DOM, augmenting it with Bootstrap's modal
    // functionality and then giving the resulting object back
    // to our caller

    $(options.container).append(dialog);

    dialog.modal({
      backdrop: options.backdrop ? "static" : false,
      keyboard: false,
      show: false,
    });

    if (options.show) {
      dialog.modal("show");
    }

    return dialog;
  };

  // Helper function to simulate the native alert() behavior. **NOTE**: This is non-blocking, so any
  // code that must happen after the alert is dismissed should be placed within the callback function
  // for this alert.
  exports.alert = function () {
    var options;

    options = mergeDialogOptions(
      "alert",
      ["ok"],
      ["message", "callback"],
      arguments
    );

    // @TODO: can this move inside exports.dialog when we're iterating over each
    // button and checking its button.callback value instead?
    if (options.callback && !$.isFunction(options.callback)) {
      throw new Error(
        'alert requires the "callback" property to be a function when provided'
      );
    }

    // override the ok and escape callback to make sure they just invoke
    // the single user-supplied one (if provided)
    options.buttons.ok.callback = options.onEscape = function () {
      if ($.isFunction(options.callback)) {
        return options.callback.call(this);
      }

      return true;
    };

    return exports.dialog(options);
  };

  // Helper function to simulate the native confirm() behavior. **NOTE**: This is non-blocking, so any
  // code that must happen after the confirm is dismissed should be placed within the callback function
  // for this confirm.
  exports.confirm = function () {
    var options;

    options = mergeDialogOptions(
      "confirm",
      ["cancel", "confirm"],
      ["message", "callback"],
      arguments
    );

    // confirm specific validation; they don't make sense without a callback so make
    // sure it's present
    if (!$.isFunction(options.callback)) {
      throw new Error("confirm requires a callback");
    }

    // overrides; undo anything the user tried to set they shouldn't have
    options.buttons.cancel.callback = options.onEscape = function () {
      return options.callback.call(this, false);
    };

    options.buttons.confirm.callback = function () {
      return options.callback.call(this, true);
    };

    return exports.dialog(options);
  };

  // Helper function to simulate the native prompt() behavior. **NOTE**: This is non-blocking, so any
  // code that must happen after the prompt is dismissed should be placed within the callback function
  // for this prompt.
  exports.prompt = function () {
    var options;
    var promptDialog;
    var form;
    var input;
    var shouldShow;
    var inputOptions;

    // we have to create our form first otherwise
    // its value is undefined when gearing up our options
    // @TODO this could be solved by allowing message to
    // be a function instead...
    form = $(templates.form);

    // prompt defaults are more complex than others in that
    // users can override more defaults
    options = mergeDialogOptions(
      "prompt",
      ["cancel", "confirm"],
      ["title", "callback"],
      arguments
    );

    if (!options.value) {
      options.value = defaults.value;
    }

    if (!options.inputType) {
      options.inputType = defaults.inputType;
    }

    // capture the user's show value; we always set this to false before
    // spawning the dialog to give us a chance to attach some handlers to
    // it, but we need to make sure we respect a preference not to show it
    shouldShow = options.show === undefined ? defaults.show : options.show;
    // This is required prior to calling the dialog builder below - we need to
    // add an event handler just before the prompt is shown
    options.show = false;

    // Handles the 'cancel' action
    options.buttons.cancel.callback = options.onEscape = function () {
      return options.callback.call(this, null);
    };

    // Prompt submitted - extract the prompt value. This requires a bit of work,
    // given the different input types available.
    options.buttons.confirm.callback = function () {
      var value;

      if (options.inputType === "checkbox") {
        value = input
          .find("input:checked")
          .map(function () {
            return $(this).val();
          })
          .get();
      } else if (options.inputType === "radio") {
        value = input.find("input:checked").val();
      } else {
        if (input[0].checkValidity && !input[0].checkValidity()) {
          // prevents button callback from being called
          return false;
        } else {
          if (options.inputType === "select" && options.multiple === true) {
            value = input
              .find("option:selected")
              .map(function () {
                return $(this).val();
              })
              .get();
          } else {
            value = input.val();
          }
        }
      }

      return options.callback.call(this, value);
    };

    // prompt-specific validation
    if (!options.title) {
      throw new Error("prompt requires a title");
    }

    if (!$.isFunction(options.callback)) {
      throw new Error("prompt requires a callback");
    }

    if (!templates.inputs[options.inputType]) {
      throw new Error("Invalid prompt type");
    }

    // create the input based on the supplied type
    input = $(templates.inputs[options.inputType]);

    switch (options.inputType) {
      case "text":
      case "textarea":
      case "email":
      case "password":
        input.val(options.value);

        if (options.placeholder) {
          input.attr("placeholder", options.placeholder);
        }

        if (options.pattern) {
          input.attr("pattern", options.pattern);
        }

        if (options.maxlength) {
          input.attr("maxlength", options.maxlength);
        }

        if (options.required) {
          input.prop({ required: true });
        }

        if (options.rows && !isNaN(parseInt(options.rows))) {
          if (options.inputType === "textarea") {
            input.attr({ rows: options.rows });
          }
        }

        break;

      case "date":
      case "time":
      case "number":
      case "range":
        input.val(options.value);

        if (options.placeholder) {
          input.attr("placeholder", options.placeholder);
        }

        if (options.pattern) {
          input.attr("pattern", options.pattern);
        }

        if (options.required) {
          input.prop({ required: true });
        }

        // These input types have extra attributes which affect their input validation.
        // Warning: For most browsers, date inputs are buggy in their implementation of 'step', so
        // this attribute will have no effect. Therefore, we don't set the attribute for date inputs.
        // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#Setting_maximum_and_minimum_dates
        if (options.inputType !== "date") {
          if (options.step) {
            if (
              options.step === "any" ||
              (!isNaN(options.step) && parseInt(options.step) > 0)
            ) {
              input.attr("step", options.step);
            } else {
              throw new Error(
                '"step" must be a valid positive number or the value "any". See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-step for more information.'
              );
            }
          }
        }

        if (minAndMaxAreValid(options.inputType, options.min, options.max)) {
          if (options.min !== undefined) {
            input.attr("min", options.min);
          }
          if (options.max !== undefined) {
            input.attr("max", options.max);
          }
        }

        break;

      case "select":
        var groups = {};
        inputOptions = options.inputOptions || [];

        if (!$.isArray(inputOptions)) {
          throw new Error("Please pass an array of input options");
        }

        if (!inputOptions.length) {
          throw new Error(
            'prompt with "inputType" set to "select" requires at least one option'
          );
        }

        // placeholder is not actually a valid attribute for select,
        // but we'll allow it, assuming it might be used for a plugin
        if (options.placeholder) {
          input.attr("placeholder", options.placeholder);
        }

        if (options.required) {
          input.prop({ required: true });
        }

        if (options.multiple) {
          input.prop({ multiple: true });
        }

        each(inputOptions, function (_, option) {
          // assume the element to attach to is the input...
          var elem = input;

          if (option.value === undefined || option.text === undefined) {
            throw new Error(
              'each option needs a "value" property and a "text" property'
            );
          }

          // ... but override that element if this option sits in a group

          if (option.group) {
            // initialise group if necessary
            if (!groups[option.group]) {
              groups[option.group] = $("<optgroup />").attr(
                "label",
                option.group
              );
            }

            elem = groups[option.group];
          }

          var o = $(templates.option);
          o.attr("value", option.value).text(option.text);
          elem.append(o);
        });

        each(groups, function (_, group) {
          input.append(group);
        });

        // safe to set a select's value as per a normal input
        input.val(options.value);

        break;

      case "checkbox":
        var checkboxValues = $.isArray(options.value)
          ? options.value
          : [options.value];
        inputOptions = options.inputOptions || [];

        if (!inputOptions.length) {
          throw new Error(
            'prompt with "inputType" set to "checkbox" requires at least one option'
          );
        }

        // checkboxes have to nest within a containing element, so
        // they break the rules a bit and we end up re-assigning
        // our 'input' element to this container instead
        input = $('<div class="bootbox-checkbox-list"></div>');

        each(inputOptions, function (_, option) {
          if (option.value === undefined || option.text === undefined) {
            throw new Error(
              'each option needs a "value" property and a "text" property'
            );
          }

          var checkbox = $(templates.inputs[options.inputType]);

          checkbox.find("input").attr("value", option.value);
          checkbox.find("label").append("\n" + option.text);

          // we've ensured values is an array so we can always iterate over it
          each(checkboxValues, function (_, value) {
            if (value === option.value) {
              checkbox.find("input").prop("checked", true);
            }
          });

          input.append(checkbox);
        });
        break;

      case "radio":
        // Make sure that value is not an array (only a single radio can ever be checked)
        if (options.value !== undefined && $.isArray(options.value)) {
          throw new Error(
            'prompt with "inputType" set to "radio" requires a single, non-array value for "value"'
          );
        }

        inputOptions = options.inputOptions || [];

        if (!inputOptions.length) {
          throw new Error(
            'prompt with "inputType" set to "radio" requires at least one option'
          );
        }

        // Radiobuttons have to nest within a containing element, so
        // they break the rules a bit and we end up re-assigning
        // our 'input' element to this container instead
        input = $('<div class="bootbox-radiobutton-list"></div>');

        // Radiobuttons should always have an initial checked input checked in a "group".
        // If value is undefined or doesn't match an input option, select the first radiobutton
        var checkFirstRadio = true;

        each(inputOptions, function (_, option) {
          if (option.value === undefined || option.text === undefined) {
            throw new Error(
              'each option needs a "value" property and a "text" property'
            );
          }

          var radio = $(templates.inputs[options.inputType]);

          radio.find("input").attr("value", option.value);
          radio.find("label").append("\n" + option.text);

          if (options.value !== undefined) {
            if (option.value === options.value) {
              radio.find("input").prop("checked", true);
              checkFirstRadio = false;
            }
          }

          input.append(radio);
        });

        if (checkFirstRadio) {
          input.find('input[type="radio"]').first().prop("checked", true);
        }
        break;
    }

    // now place it in our form
    form.append(input);

    form.on("submit", function (e) {
      e.preventDefault();
      // Fix for SammyJS (or similar JS routing library) hijacking the form post.
      e.stopPropagation();

      // @TODO can we actually click *the* button object instead?
      // e.g. buttons.confirm.click() or similar
      promptDialog.find(".bootbox-accept").trigger("click");
    });

    if ($.trim(options.message) !== "") {
      // Add the form to whatever content the user may have added.
      var message = $(templates.promptMessage).html(options.message);
      form.prepend(message);
      options.message = form;
    } else {
      options.message = form;
    }

    // Generate the dialog
    promptDialog = exports.dialog(options);

    // clear the existing handler focusing the submit button...
    promptDialog.off("shown.bs.modal");

    // ...and replace it with one focusing our input, if possible
    promptDialog.on("shown.bs.modal", function () {
      // need the closure here since input isn't
      // an object otherwise
      input.focus();
    });

    if (shouldShow === true) {
      promptDialog.modal("show");
    }

    return promptDialog;
  };

  // INTERNAL FUNCTIONS
  // *************************************************************************************************************

  // Map a flexible set of arguments into a single returned object
  // If args.length is already one just return it, otherwise
  // use the properties argument to map the unnamed args to
  // object properties.
  // So in the latter case:
  //  mapArguments(["foo", $.noop], ["message", "callback"])
  //  -> { message: "foo", callback: $.noop }
  function mapArguments(args, properties) {
    var argn = args.length;
    var options = {};

    if (argn < 1 || argn > 2) {
      throw new Error("Invalid argument length");
    }

    if (argn === 2 || typeof args[0] === "string") {
      options[properties[0]] = args[0];
      options[properties[1]] = args[1];
    } else {
      options = args[0];
    }

    return options;
  }

  //  Merge a set of default dialog options with user supplied arguments
  function mergeArguments(defaults, args, properties) {
    return $.extend(
      // deep merge
      true,
      // ensure the target is an empty, unreferenced object
      {},
      // the base options object for this type of dialog (often just buttons)
      defaults,
      // args could be an object or array; if it's an array properties will
      // map it to a proper options object
      mapArguments(args, properties)
    );
  }

  //  This entry-level method makes heavy use of composition to take a simple
  //  range of inputs and return valid options suitable for passing to bootbox.dialog
  function mergeDialogOptions(className, labels, properties, args) {
    var locale;
    if (args && args[0]) {
      locale = args[0].locale || defaults.locale;
      var swapButtons = args[0].swapButtonOrder || defaults.swapButtonOrder;

      if (swapButtons) {
        labels = labels.reverse();
      }
    }

    //  build up a base set of dialog properties
    var baseOptions = {
      className: "bootbox-" + className,
      buttons: createLabels(labels, locale),
    };

    // Ensure the buttons properties generated, *after* merging
    // with user args are still valid against the supplied labels
    return validateButtons(
      // merge the generated base properties with user supplied arguments
      mergeArguments(
        baseOptions,
        args,
        // if args.length > 1, properties specify how each arg maps to an object key
        properties
      ),
      labels
    );
  }

  //  Checks each button object to see if key is valid.
  //  This function will only be called by the alert, confirm, and prompt helpers.
  function validateButtons(options, buttons) {
    var allowedButtons = {};
    each(buttons, function (key, value) {
      allowedButtons[value] = true;
    });

    each(options.buttons, function (key) {
      if (allowedButtons[key] === undefined) {
        throw new Error(
          'button key "' +
            key +
            '" is not allowed (options are ' +
            buttons.join(" ") +
            ")"
        );
      }
    });

    return options;
  }

  //  From a given list of arguments, return a suitable object of button labels.
  //  All this does is normalise the given labels and translate them where possible.
  //  e.g. "ok", "confirm" -> { ok: "OK", cancel: "Annuleren" }
  function createLabels(labels, locale) {
    var buttons = {};

    for (var i = 0, j = labels.length; i < j; i++) {
      var argument = labels[i];
      var key = argument.toLowerCase();
      var value = argument.toUpperCase();

      buttons[key] = {
        label: getText(value, locale),
      };
    }

    return buttons;
  }

  //  Get localized text from a locale. Defaults to 'en' locale if no locale
  //  provided or a non-registered locale is requested
  function getText(key, locale) {
    var labels = locales[locale];

    return labels ? labels[key] : locales.en[key];
  }

  //  Filter and tidy up any user supplied parameters to this dialog.
  //  Also looks for any shorthands used and ensures that the options
  //  which are returned are all normalized properly
  function sanitize(options) {
    var buttons;
    var total;

    if (typeof options !== "object") {
      throw new Error("Please supply an object of options");
    }

    if (!options.message) {
      throw new Error('"message" option must not be null or an empty string.');
    }

    // make sure any supplied options take precedence over defaults
    options = $.extend({}, defaults, options);

    // no buttons is still a valid dialog but it's cleaner to always have
    // a buttons object to iterate over, even if it's empty
    if (!options.buttons) {
      options.buttons = {};
    }

    buttons = options.buttons;

    total = getKeyLength(buttons);

    each(buttons, function (key, button, index) {
      if ($.isFunction(button)) {
        // short form, assume value is our callback. Since button
        // isn't an object it isn't a reference either so re-assign it
        button = buttons[key] = {
          callback: button,
        };
      }

      // before any further checks make sure by now button is the correct type
      if ($.type(button) !== "object") {
        throw new Error('button with key "' + key + '" must be an object');
      }

      if (!button.label) {
        // the lack of an explicit label means we'll assume the key is good enough
        button.label = key;
      }

      if (!button.className) {
        var isPrimary = false;
        if (options.swapButtonOrder) {
          isPrimary = index === 0;
        } else {
          isPrimary = index === total - 1;
        }

        if (total <= 2 && isPrimary) {
          // always add a primary to the main option in a one or two-button dialog
          button.className = "btn-primary";
        } else {
          // adding both classes allows us to target both BS3 and BS4 without needing to check the version
          button.className = "btn-secondary btn-default";
        }
      }
    });

    return options;
  }

  //  Returns a count of the properties defined on the object
  function getKeyLength(obj) {
    return Object.keys(obj).length;
  }

  //  Tiny wrapper function around jQuery.each; just adds index as the third parameter
  function each(collection, iterator) {
    var index = 0;
    $.each(collection, function (key, value) {
      iterator(key, value, index++);
    });
  }

  //  Handle the invoked dialog callback
  function processCallback(e, dialog, callback) {
    e.stopPropagation();
    e.preventDefault();

    // by default we assume a callback will get rid of the dialog,
    // although it is given the opportunity to override this

    // so, if the callback can be invoked and it *explicitly returns false*
    // then we'll set a flag to keep the dialog active...
    var preserveDialog =
      $.isFunction(callback) && callback.call(dialog, e) === false;

    // ... otherwise we'll bin it
    if (!preserveDialog) {
      dialog.modal("hide");
    }
  }

  // Validate `min` and `max` values based on the current `inputType` value
  function minAndMaxAreValid(type, min, max) {
    var result = false;
    var minValid = true;
    var maxValid = true;

    if (type === "date") {
      if (min !== undefined && !(minValid = dateIsValid(min))) {
        console.warn(
          'Browsers which natively support the "date" input type expect date values to be of the form "YYYY-MM-DD" (see ISO-8601 https://www.iso.org/iso-8601-date-and-time-format.html). Bootbox does not enforce this rule, but your min value may not be enforced by this browser.'
        );
      } else if (max !== undefined && !(maxValid = dateIsValid(max))) {
        console.warn(
          'Browsers which natively support the "date" input type expect date values to be of the form "YYYY-MM-DD" (see ISO-8601 https://www.iso.org/iso-8601-date-and-time-format.html). Bootbox does not enforce this rule, but your max value may not be enforced by this browser.'
        );
      }
    } else if (type === "time") {
      if (min !== undefined && !(minValid = timeIsValid(min))) {
        throw new Error(
          '"min" is not a valid time. See https://www.w3.org/TR/2012/WD-html-markup-20120315/datatypes.html#form.data.time for more information.'
        );
      } else if (max !== undefined && !(maxValid = timeIsValid(max))) {
        throw new Error(
          '"max" is not a valid time. See https://www.w3.org/TR/2012/WD-html-markup-20120315/datatypes.html#form.data.time for more information.'
        );
      }
    } else {
      if (min !== undefined && isNaN(min)) {
        throw new Error(
          '"min" must be a valid number. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-min for more information.'
        );
      }

      if (max !== undefined && isNaN(max)) {
        throw new Error(
          '"max" must be a valid number. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-max for more information.'
        );
      }
    }

    if (minValid && maxValid) {
      if (max <= min) {
        throw new Error(
          '"max" must be greater than "min". See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-max for more information.'
        );
      } else {
        result = true;
      }
    }

    return result;
  }

  function timeIsValid(value) {
    return /([01][0-9]|2[0-3]):[0-5][0-9]?:[0-5][0-9]/.test(value);
  }

  function dateIsValid(value) {
    return /(\d{4})-(\d{2})-(\d{2})/.test(value);
  }

  //  Register the default locale
  exports.addLocale("en", {
    OK: "OK",
    CANCEL: "Cancel",
    CONFIRM: "OK",
  });

  //  The Bootbox object
  return exports;
});
// bootbox.setTemplates({
// 	dialog:
// 		'<div class="bootbox modal" tabindex="-1" role="dialog" aria-hidden="true">' +
// 		'<div class="modal-dialog">' +
// 		'<div class="modal-content">' +
// 		'<div class="modal-body"><div class="bootbox-body"></div></div>' +
// 		"</div>" +
// 		"</div>" +
// 		"</div>",
// 	header:
// 		'<div class="modal-header">' + '<h5 class="modal-title"></h5>' + "</div>",
// 	footer: '<div class="modal-footer"></div>',
// 	closeButton:
// 		'<button type="button" class="bootbox-close-button close" aria-hidden="true"><i class="fal fa-times"></i></button>',
// 	form: '<form class="bootbox-form"></form>',
// 	button: '<button type="button" class="btn"></button>',
// 	option: "<option></option>",
// 	promptMessage: '<div class="bootbox-prompt-message"></div>',
// 	inputs: {
// 		text: '<input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" />',
// 		textarea:
// 			'<textarea class="bootbox-input bootbox-input-textarea form-control"></textarea>',
// 		email:
// 			'<input class="bootbox-input bootbox-input-email form-control" autocomplete="off" type="email" />',
// 		select:
// 			'<select class="bootbox-input bootbox-input-select form-control"></select>',
// 		checkbox:
// 			'<div class="form-check checkbox"><label class="form-check-label"><input class="form-check-input bootbox-input bootbox-input-checkbox" type="checkbox" /></label></div>',
// 		radio:
// 			'<div class="form-check radio"><label class="form-check-label"><input class="form-check-input bootbox-input bootbox-input-radio" type="radio" name="bootbox-radio" /></label></div>',
// 		date: '<input class="bootbox-input bootbox-input-date form-control" autocomplete="off" type="date" />',
// 		time: '<input class="bootbox-input bootbox-input-time form-control" autocomplete="off" type="time" />',
// 		number:
// 			'<input class="bootbox-input bootbox-input-number form-control" autocomplete="off" type="number" />',
// 		password:
// 			'<input class="bootbox-input bootbox-input-password form-control" autocomplete="off" type="password" />',
// 		range:
// 			'<input class="bootbox-input bootbox-input-range form-control-range" autocomplete="off" type="range" />',
// 	},
// });
/**
 * author: andreas johan virkus
 * snippet url: https://gist.github.com/andreasvirkus/bfaedc839de0d46ffe4c
 *
 * Remove classes that have given prefix
 * Example: You have an element with classes "apple juiceSmall juiceBig banana"
 * You run:
 *   $elem.removeClassPrefix('juice');
 * The resulting classes are "apple banana"
 */
$.fn.removeClassPrefix = function (prefix) {
  this.each(function (i, it) {
    var classes = it.className.split(" ").map(function (item) {
      return item.indexOf(prefix) === 0 ? "" : item;
    });
    it.className = classes.join(" ");
  });

  return this;
};

/**
 * "http://dummy.com/?technology=jquery&blog=jquerybyexample".
 * 1 var tech = getUrlParameter('technology');
 * 2 var blog = getUrlParameter('blog');
 * note: we are using this inside icon generator page
 */
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
  }

  var trident = ua.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf("rv:");
    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
  }

  var edge = ua.indexOf("Edge/");
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
  }

  // other browser
  return false;
}

/*
 * Toggle text
 * $(".example").toggleText('Initial', 'Secondary');
 * https://stackoverflow.com/questions/2155453/jquery-toggle-text
 */
jQuery.fn.extend({
  toggleText: function (a, b) {
    var that = this;
    if (that.text() != a && that.text() != b) {
      that.text(a);
    } else if (that.text() == a) {
      that.text(b);
    } else if (that.text() == b) {
      that.text(a);
    }
    return this;
  },
});

/*
 * Convert RGB to HEX
 * rgb2hex(hex_value)
 */
function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
//
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
//
// About: Release History
//
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
//
// Topic: Note for non-jQuery users
//
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
//
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function (window, undefined) {
  "$:nomunge"; // Used by YUI compressor.

  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || (window.Cowboy = {}),
    // Internal method reference.
    jq_throttle;

  // Method: jQuery.throttle
  //
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  //
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  //
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // >
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  //
  // Usage:
  //
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, throttled, function.

  $.throttle = jq_throttle = function (
    delay,
    no_trailing,
    callback,
    debounce_mode
  ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      // Keep track of the last time `callback` was executed.
      last_exec = 0;

    // `no_trailing` defaults to falsy.
    if (typeof no_trailing !== "boolean") {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }

    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;

      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply(that, args);
      }

      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      }

      if (debounce_mode && !timeout_id) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }

      // Clear any existing timeout.
      timeout_id && clearTimeout(timeout_id);

      if (debounce_mode === undefined && elapsed > delay) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
      } else if (no_trailing !== true) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        //
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        //
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout(
          debounce_mode ? clear : exec,
          debounce_mode === undefined ? delay - elapsed : delay
        );
      }
    }

    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ($.guid) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }

    // Return the wrapper function.
    return wrapper;
  };

  // Method: jQuery.debounce
  //
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  //
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  //
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // >
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  //
  // Usage:
  //
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, debounced, function.

  $.debounce = function (delay, at_begin, callback) {
    return callback === undefined
      ? jq_throttle(delay, at_begin, false)
      : jq_throttle(delay, callback, at_begin !== false);
  };
})(this);

/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.8
 *
 */
(function ($) {
  $.fn.extend({
    slimScroll: function (options) {
      var defaults = {
        // width in pixels of the visible scroll area
        width: "auto",

        // height in pixels of the visible scroll area
        height: "250px",

        // width in pixels of the scrollbar and rail
        size: "7px",

        // scrollbar color, accepts any hex/color value
        color: "#000",

        // scrollbar position - left/right
        position: "right",

        // distance in pixels between the side edge and the scrollbar
        distance: "1px",

        // default scroll position on load - top / bottom / $('selector')
        start: "top",

        // sets scrollbar opacity
        opacity: 0.4,

        // enables always-on mode for the scrollbar
        alwaysVisible: false,

        // check if we should hide the scrollbar when user is hovering over
        disableFadeOut: false,

        // sets visibility of the rail
        railVisible: false,

        // sets rail color
        railColor: "#333",

        // sets rail opacity
        railOpacity: 0.2,

        // whether  we should use jQuery UI Draggable to enable bar dragging
        railDraggable: true,

        // defautlt CSS class of the slimscroll rail
        railClass: "slimScrollRail",

        // defautlt CSS class of the slimscroll bar
        barClass: "slimScrollBar",

        // defautlt CSS class of the slimscroll wrapper
        wrapperClass: "slimScrollDiv",

        // check if mousewheel should scroll the window if we reach top/bottom
        allowPageScroll: false,

        // scroll amount applied to each mouse wheel step
        wheelStep: 20,

        // scroll amount applied when user is using gestures
        touchScrollStep: 200,

        // sets border radius
        borderRadius: "7px",

        // sets border radius of the rail
        railBorderRadius: "7px",
      };

      var o = $.extend(defaults, options);

      // do it for every element that matches selector
      this.each(function () {
        var isOverPanel,
          isOverBar,
          isDragg,
          queueHide,
          touchDif,
          barHeight,
          percentScroll,
          lastScroll,
          divS = "<div></div>",
          minBarHeight = 30,
          releaseScroll = false;

        // used in event handlers and for better minification
        var me = $(this);

        // ensure we are not binding it again
        if (me.parent().hasClass(o.wrapperClass)) {
          // start from last bar position
          var offset = me.scrollTop();

          // find bar and rail
          bar = me.siblings("." + o.barClass);
          rail = me.siblings("." + o.railClass);

          getBarHeight();

          // check if we should scroll existing instance
          if ($.isPlainObject(options)) {
            // Pass height: auto to an existing slimscroll object to force a resize after contents have changed
            if ("height" in options && options.height == "auto") {
              me.parent().css("height", "auto");
              me.css("height", "auto");
              var height = me.parent().parent().height();
              me.parent().css("height", height);
              me.css("height", height);
            } else if ("height" in options) {
              var h = options.height;
              me.parent().css("height", h);
              me.css("height", h);
            }

            if ("scrollTo" in options) {
              // jump to a static point
              offset = parseInt(o.scrollTo);
            } else if ("scrollBy" in options) {
              // jump by value pixels
              offset += parseInt(o.scrollBy);
            } else if ("destroy" in options) {
              // remove slimscroll elements
              bar.remove();
              rail.remove();
              me.unwrap();
              return;
            }

            // scroll content by the given offset
            scrollContent(offset, false, true);
          }

          return;
        } else if ($.isPlainObject(options)) {
          if ("destroy" in options) {
            return;
          }
        }

        // optionally set height to the parent's height
        o.height = o.height == "auto" ? me.parent().height() : o.height;

        // wrap content
        var wrapper = $(divS).addClass(o.wrapperClass).css({
          position: "relative",
          overflow: "hidden",
          width: o.width,
          height: o.height,
        });

        // update style for the div
        me.css({
          overflow: "hidden",
          width: o.width,
          height: o.height,
        });

        // create scrollbar rail
        var rail = $(divS)
          .addClass(o.railClass)
          .css({
            width: o.size,
            height: "100%",
            position: "absolute",
            top: 0,
            display: o.alwaysVisible && o.railVisible ? "block" : "none",
            "border-radius": o.railBorderRadius,
            background: o.railColor,
            opacity: o.railOpacity,
            zIndex: 90,
          });

        // create scrollbar
        var bar = $(divS)
          .addClass(o.barClass)
          .css({
            background: o.color,
            width: o.size,
            position: "absolute",
            top: 0,
            opacity: o.opacity,
            display: o.alwaysVisible ? "block" : "none",
            "border-radius": o.borderRadius,
            BorderRadius: o.borderRadius,
            MozBorderRadius: o.borderRadius,
            WebkitBorderRadius: o.borderRadius,
            zIndex: 99,
          });

        // set position
        var posCss =
          o.position == "right" ? { right: o.distance } : { left: o.distance };
        rail.css(posCss);
        bar.css(posCss);

        // wrap it
        me.wrap(wrapper);

        // append to parent div
        me.parent().append(bar);
        me.parent().append(rail);

        // make it draggable and no longer dependent on the jqueryUI
        if (o.railDraggable) {
          bar
            .bind("mousedown", function (e) {
              var $doc = $(document);
              isDragg = true;
              t = parseFloat(bar.css("top"));
              pageY = e.pageY;

              $doc.bind("mousemove.slimscroll", function (e) {
                currTop = t + e.pageY - pageY;
                bar.css("top", currTop);
                scrollContent(0, bar.position().top, false); // scroll content
              });

              $doc.bind("mouseup.slimscroll", function (e) {
                isDragg = false;
                hideBar();
                $doc.unbind(".slimscroll");
              });
              return false;
            })
            .bind("selectstart.slimscroll", function (e) {
              e.stopPropagation();
              e.preventDefault();
              return false;
            });
        }

        // on rail over
        rail.hover(
          function () {
            showBar();
          },
          function () {
            hideBar();
          }
        );

        // on bar over
        bar.hover(
          function () {
            isOverBar = true;
          },
          function () {
            isOverBar = false;
          }
        );

        // show on parent mouseover
        me.hover(
          function () {
            isOverPanel = true;
            showBar();
            hideBar();
          },
          function () {
            isOverPanel = false;
            hideBar();
          }
        );

        // support for mobile
        me.bind("touchstart", function (e, b) {
          if (e.originalEvent.touches.length) {
            // record where touch started
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        me.bind("touchmove", function (e) {
          // prevent scrolling the page if necessary
          if (!releaseScroll) {
            e.originalEvent.preventDefault();
          }
          if (e.originalEvent.touches.length) {
            // see how far user swiped
            var diff =
              (touchDif - e.originalEvent.touches[0].pageY) / o.touchScrollStep;
            // scroll content
            scrollContent(diff, true);
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        // set up initial height
        getBarHeight();

        // check start position
        if (o.start === "bottom") {
          // scroll content to bottom
          bar.css({ top: me.outerHeight() - bar.outerHeight() });
          scrollContent(0, true);
        } else if (o.start !== "top") {
          // assume jQuery selector
          scrollContent($(o.start).position().top, null, true);

          // make sure bar stays hidden
          if (!o.alwaysVisible) {
            bar.hide();
          }
        }

        // attach scroll events
        attachWheel(this);

        function _onWheel(e) {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) {
            return;
          }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) {
            delta = -e.wheelDelta / 120;
          }
          if (e.detail) {
            delta = e.detail / 3;
          }

          var target = e.target || e.srcTarget || e.srcElement;
          if (
            $(target)
              .closest("." + o.wrapperClass)
              .is(me.parent())
          ) {
            // scroll content
            scrollContent(delta, true);
          }

          // stop window scroll
          if (e.preventDefault && !releaseScroll) {
            e.preventDefault();
          }
          if (!releaseScroll) {
            e.returnValue = false;
          }
        }

        function scrollContent(y, isWheel, isJump) {
          releaseScroll = false;
          var delta = y;
          var maxTop = me.outerHeight() - bar.outerHeight();

          if (isWheel) {
            // move bar with mouse wheel
            delta =
              parseInt(bar.css("top")) +
              ((y * parseInt(o.wheelStep)) / 100) * bar.outerHeight();

            // move bar, make sure it doesn't go out
            delta = Math.min(Math.max(delta, 0), maxTop);

            // if scrolling down, make sure a fractional change to the
            // scroll position isn't rounded away when the scrollbar's CSS is set
            // this flooring of delta would happened automatically when
            // bar.css is set below, but we floor here for clarity
            delta = y > 0 ? Math.ceil(delta) : Math.floor(delta);

            // scroll the scrollbar
            bar.css({ top: delta + "px" });
          }

          // calculate actual scroll amount
          percentScroll =
            parseInt(bar.css("top")) / (me.outerHeight() - bar.outerHeight());
          delta = percentScroll * (me[0].scrollHeight - me.outerHeight());

          if (isJump) {
            delta = y;
            var offsetTop = (delta / me[0].scrollHeight) * me.outerHeight();
            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
            bar.css({ top: offsetTop + "px" });
          }

          // scroll content
          me.scrollTop(delta);

          // fire scrolling event
          me.trigger("slimscrolling", ~~delta);

          // ensure bar is visible
          showBar();

          // trigger hide when scroll is stopped
          hideBar();
        }

        function attachWheel(target) {
          if (window.addEventListener) {
            target.addEventListener("DOMMouseScroll", _onWheel, false);
            target.addEventListener("mousewheel", _onWheel, false);
          } else {
            document.attachEvent("onmousewheel", _onWheel);
          }
        }

        function getBarHeight() {
          // calculate scrollbar height and make sure it is not too small
          barHeight = Math.max(
            (me.outerHeight() / me[0].scrollHeight) * me.outerHeight(),
            minBarHeight
          );
          bar.css({ height: barHeight + "px" });

          // hide scrollbar if content is not long enough
          var display = barHeight == me.outerHeight() ? "none" : "block";
          bar.css({ display: display });
        }

        function showBar() {
          // recalculate bar height
          getBarHeight();
          clearTimeout(queueHide);

          // when bar reached top or bottom
          if (percentScroll == ~~percentScroll) {
            //release wheel
            releaseScroll = o.allowPageScroll;

            // publish approporiate event
            if (lastScroll != percentScroll) {
              var msg = ~~percentScroll == 0 ? "top" : "bottom";
              me.trigger("slimscroll", msg);
            }
          } else {
            releaseScroll = false;
          }
          lastScroll = percentScroll;

          // show only when required
          if (barHeight >= me.outerHeight()) {
            //allow window scroll
            releaseScroll = true;
            return;
          }
          bar.stop(true, true).fadeIn("fast");
          if (o.railVisible) {
            rail.stop(true, true).fadeIn("fast");
          }
        }

        function hideBar() {
          // only hide when options allow it
          if (!o.alwaysVisible) {
            queueHide = setTimeout(function () {
              if (
                !(o.disableFadeOut && isOverPanel) &&
                !isOverBar &&
                !isDragg
              ) {
                bar.fadeOut("slow");
                rail.fadeOut("slow");
              }
            }, 1000);
          }
        }
      });

      // maintain chainability
      return this;
    },
  });

  $.fn.extend({
    slimscroll: $.fn.slimScroll,
  });
})(jQuery);

/*!
 * Waves v0.7.6
 * http://fian.my.id/Waves
 *
 * Copyright 2014-2018 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

(function (window, factory) {
  "use strict";

  // AMD. Register as an anonymous module.  Wrap in function so we have access
  // to root via `this`.
  if (typeof define === "function" && define.amd) {
    define([], function () {
      window.Waves = factory.call(window);
      return window.Waves;
    });
  }

  // Node. Does not work with strict CommonJS, but only CommonJS-like
  // environments that support module.exports, like Node.
  else if (typeof exports === "object") {
    module.exports = factory.call(window);
  }

  // Browser globals.
  else {
    window.Waves = factory.call(window);
  }
})(typeof global === "object" ? global : this, function () {
  "use strict";

  var Waves = Waves || {};
  var $$ = document.querySelectorAll.bind(document);
  var toString = Object.prototype.toString;
  var isTouchAvailable = "ontouchstart" in window;

  // Find exact position of element
  function isWindow(obj) {
    return obj !== null && obj === obj.window;
  }

  function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }

  function isObject(value) {
    var type = typeof value;
    return type === "function" || (type === "object" && !!value);
  }

  function isDOMNode(obj) {
    return isObject(obj) && obj.nodeType > 0;
  }

  function getWavesElements(nodes) {
    var stringRepr = toString.call(nodes);

    if (stringRepr === "[object String]") {
      return $$(nodes);
    } else if (
      isObject(nodes) &&
      /^\[object (Array|HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
      nodes.hasOwnProperty("length")
    ) {
      return nodes;
    } else if (isDOMNode(nodes)) {
      return [nodes];
    }

    return [];
  }

  function offset(elem) {
    var docElem,
      win,
      box = { top: 0, left: 0 },
      doc = elem && elem.ownerDocument;

    docElem = doc.documentElement;

    if (typeof elem.getBoundingClientRect !== typeof undefined) {
      box = elem.getBoundingClientRect();
    }
    win = getWindow(doc);
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft,
    };
  }

  function convertStyle(styleObj) {
    var style = "";

    for (var prop in styleObj) {
      if (styleObj.hasOwnProperty(prop)) {
        style += prop + ":" + styleObj[prop] + ";";
      }
    }

    return style;
  }

  var Effect = {
    // Effect duration
    duration: 750,

    // Effect delay (check for scroll before showing effect)
    delay: 200,

    show: function (e, element, velocity) {
      // Disable right click
      if (e.button === 2) {
        return false;
      }

      element = element || this;

      // Create ripple
      var ripple = document.createElement("div");
      ripple.className = "waves-ripple waves-rippling";
      element.appendChild(ripple);

      // Get click coordinate and element width
      var pos = offset(element);
      var relativeY = 0;
      var relativeX = 0;
      // Support for touch devices
      if ("touches" in e && e.touches.length) {
        relativeY = e.touches[0].pageY - pos.top;
        relativeX = e.touches[0].pageX - pos.left;
      }
      //Normal case
      else {
        relativeY = e.pageY - pos.top;
        relativeX = e.pageX - pos.left;
      }
      // Support for synthetic events
      relativeX = relativeX >= 0 ? relativeX : 0;
      relativeY = relativeY >= 0 ? relativeY : 0;

      var scale = "scale(" + (element.clientWidth / 100) * 3 + ")";
      var translate = "translate(0,0)";

      if (velocity) {
        translate = "translate(" + velocity.x + "px, " + velocity.y + "px)";
      }

      // Attach data to element
      ripple.setAttribute("data-hold", Date.now());
      ripple.setAttribute("data-x", relativeX);
      ripple.setAttribute("data-y", relativeY);
      ripple.setAttribute("data-scale", scale);
      ripple.setAttribute("data-translate", translate);

      // Set ripple position
      var rippleStyle = {
        top: relativeY + "px",
        left: relativeX + "px",
      };

      ripple.classList.add("waves-notransition");
      ripple.setAttribute("style", convertStyle(rippleStyle));
      ripple.classList.remove("waves-notransition");

      // Scale the ripple
      rippleStyle["-webkit-transform"] = scale + " " + translate;
      rippleStyle["-moz-transform"] = scale + " " + translate;
      rippleStyle["-ms-transform"] = scale + " " + translate;
      rippleStyle["-o-transform"] = scale + " " + translate;
      rippleStyle.transform = scale + " " + translate;
      rippleStyle.opacity = "1";

      var duration = e.type === "mousemove" ? 2500 : Effect.duration;
      rippleStyle["-webkit-transition-duration"] = duration + "ms";
      rippleStyle["-moz-transition-duration"] = duration + "ms";
      rippleStyle["-o-transition-duration"] = duration + "ms";
      rippleStyle["transition-duration"] = duration + "ms";

      ripple.setAttribute("style", convertStyle(rippleStyle));
    },

    hide: function (e, element) {
      element = element || this;

      var ripples = element.getElementsByClassName("waves-rippling");

      for (var i = 0, len = ripples.length; i < len; i++) {
        removeRipple(e, element, ripples[i]);
      }

      if (isTouchAvailable) {
        element.removeEventListener("touchend", Effect.hide);
        element.removeEventListener("touchcancel", Effect.hide);
      }

      element.removeEventListener("mouseup", Effect.hide);
      element.removeEventListener("mouseleave", Effect.hide);
    },
  };

  /**
   * Collection of wrapper for HTML element that only have single tag
   * like <input> and <img>
   */
  var TagWrapper = {
    // Wrap <input> tag so it can perform the effect
    input: function (element) {
      var parent = element.parentNode;

      // If input already have parent just pass through
      if (
        parent.tagName.toLowerCase() === "i" &&
        parent.classList.contains("waves-effect")
      ) {
        return;
      }

      // Put element class and style to the specified parent
      var wrapper = document.createElement("i");
      wrapper.className = element.className + " waves-input-wrapper";
      element.className = "waves-button-input";

      // Put element as child
      parent.replaceChild(wrapper, element);
      wrapper.appendChild(element);

      // Apply element color and background color to wrapper
      var elementStyle = window.getComputedStyle(element, null);
      var color = elementStyle.color;
      var backgroundColor = elementStyle.backgroundColor;

      wrapper.setAttribute(
        "style",
        "color:" + color + ";background:" + backgroundColor
      );
      element.setAttribute("style", "background-color:rgba(0,0,0,0);");
    },

    // Wrap <img> tag so it can perform the effect
    img: function (element) {
      var parent = element.parentNode;

      // If input already have parent just pass through
      if (
        parent.tagName.toLowerCase() === "i" &&
        parent.classList.contains("waves-effect")
      ) {
        return;
      }

      // Put element as child
      var wrapper = document.createElement("i");
      parent.replaceChild(wrapper, element);
      wrapper.appendChild(element);
    },
  };

  /**
   * Hide the effect and remove the ripple. Must be
   * a separate function to pass the JSLint...
   */
  function removeRipple(e, el, ripple) {
    // Check if the ripple still exist
    if (!ripple) {
      return;
    }

    ripple.classList.remove("waves-rippling");

    var relativeX = ripple.getAttribute("data-x");
    var relativeY = ripple.getAttribute("data-y");
    var scale = ripple.getAttribute("data-scale");
    var translate = ripple.getAttribute("data-translate");

    // Get delay beetween mousedown and mouse leave
    var diff = Date.now() - Number(ripple.getAttribute("data-hold"));
    var delay = 350 - diff;

    if (delay < 0) {
      delay = 0;
    }

    if (e.type === "mousemove") {
      delay = 150;
    }

    // Fade out ripple after delay
    var duration = e.type === "mousemove" ? 2500 : Effect.duration;

    setTimeout(function () {
      var style = {
        top: relativeY + "px",
        left: relativeX + "px",
        opacity: "0",

        // Duration
        "-webkit-transition-duration": duration + "ms",
        "-moz-transition-duration": duration + "ms",
        "-o-transition-duration": duration + "ms",
        "transition-duration": duration + "ms",
        "-webkit-transform": scale + " " + translate,
        "-moz-transform": scale + " " + translate,
        "-ms-transform": scale + " " + translate,
        "-o-transform": scale + " " + translate,
        transform: scale + " " + translate,
      };

      ripple.setAttribute("style", convertStyle(style));

      setTimeout(function () {
        try {
          el.removeChild(ripple);
        } catch (e) {
          return false;
        }
      }, duration);
    }, delay);
  }

  /**
   * Disable mousedown event for 500ms during and after touch
   */
  var TouchHandler = {
    /* uses an integer rather than bool so there's no issues with
     * needing to clear timeouts if another touch event occurred
     * within the 500ms. Cannot mouseup between touchstart and
     * touchend, nor in the 500ms after touchend. */
    touches: 0,

    allowEvent: function (e) {
      var allow = true;

      if (/^(mousedown|mousemove)$/.test(e.type) && TouchHandler.touches) {
        allow = false;
      }

      return allow;
    },
    registerEvent: function (e) {
      var eType = e.type;

      if (eType === "touchstart") {
        TouchHandler.touches += 1; // push
      } else if (/^(touchend|touchcancel)$/.test(eType)) {
        setTimeout(function () {
          if (TouchHandler.touches) {
            TouchHandler.touches -= 1; // pop after 500ms
          }
        }, 500);
      }
    },
  };

  /**
   * Delegated click handler for .waves-effect element.
   * returns null when .waves-effect element not in "click tree"
   */
  function getWavesEffectElement(e) {
    if (TouchHandler.allowEvent(e) === false) {
      return null;
    }

    var element = null;
    var target = e.target || e.srcElement;

    while (target.parentElement) {
      if (
        !(target instanceof SVGElement) &&
        target.classList.contains("waves-effect")
      ) {
        element = target;
        break;
      }
      target = target.parentElement;
    }

    return element;
  }

  /**
   * Bubble the click and show effect if .waves-effect elem was found
   */
  function showEffect(e) {
    // Disable effect if element has "disabled" property on it
    // In some cases, the event is not triggered by the current element
    // if (e.target.getAttribute('disabled') !== null) {
    //     return;
    // }

    var element = getWavesEffectElement(e);

    if (element !== null) {
      // Make it sure the element has either disabled property, disabled attribute or 'disabled' class
      if (
        element.disabled ||
        element.getAttribute("disabled") ||
        element.classList.contains("disabled")
      ) {
        return;
      }

      TouchHandler.registerEvent(e);

      if (e.type === "touchstart" && Effect.delay) {
        var hidden = false;

        var timer = setTimeout(function () {
          timer = null;
          Effect.show(e, element);
        }, Effect.delay);

        var hideEffect = function (hideEvent) {
          // if touch hasn't moved, and effect not yet started: start effect now
          if (timer) {
            clearTimeout(timer);
            timer = null;
            Effect.show(e, element);
          }
          if (!hidden) {
            hidden = true;
            Effect.hide(hideEvent, element);
          }

          removeListeners();
        };

        var touchMove = function (moveEvent) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          hideEffect(moveEvent);

          removeListeners();
        };

        element.addEventListener("touchmove", touchMove, false);
        element.addEventListener("touchend", hideEffect, false);
        element.addEventListener("touchcancel", hideEffect, false);

        var removeListeners = function () {
          element.removeEventListener("touchmove", touchMove);
          element.removeEventListener("touchend", hideEffect);
          element.removeEventListener("touchcancel", hideEffect);
        };
      } else {
        Effect.show(e, element);

        if (isTouchAvailable) {
          element.addEventListener("touchend", Effect.hide, false);
          element.addEventListener("touchcancel", Effect.hide, false);
        }

        element.addEventListener("mouseup", Effect.hide, false);
        element.addEventListener("mouseleave", Effect.hide, false);
      }
    }
  }

  Waves.init = function (options) {
    var body = document.body;

    options = options || {};

    if ("duration" in options) {
      Effect.duration = options.duration;
    }

    if ("delay" in options) {
      Effect.delay = options.delay;
    }

    if (isTouchAvailable) {
      body.addEventListener("touchstart", showEffect, false);
      body.addEventListener("touchcancel", TouchHandler.registerEvent, false);
      body.addEventListener("touchend", TouchHandler.registerEvent, false);
    }

    body.addEventListener("mousedown", showEffect, false);
  };

  /**
   * Attach Waves to dynamically loaded inputs, or add .waves-effect and other
   * waves classes to a set of elements. Set drag to true if the ripple mouseover
   * or skimming effect should be applied to the elements.
   */
  Waves.attach = function (elements, classes) {
    elements = getWavesElements(elements);

    if (toString.call(classes) === "[object Array]") {
      classes = classes.join(" ");
    }

    classes = classes ? " " + classes : "";

    var element, tagName;

    for (var i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      tagName = element.tagName.toLowerCase();

      if (["input", "img"].indexOf(tagName) !== -1) {
        TagWrapper[tagName](element);
        element = element.parentElement;
      }

      if (element.className.indexOf("waves-effect") === -1) {
        element.className += " waves-effect" + classes;
      }
    }
  };

  /**
   * Cause a ripple to appear in an element via code.
   */
  Waves.ripple = function (elements, options) {
    elements = getWavesElements(elements);
    var elementsLen = elements.length;

    options = options || {};
    options.wait = options.wait || 0;
    options.position = options.position || null; // default = centre of element

    if (elementsLen) {
      var element,
        pos,
        off,
        centre = {},
        i = 0;
      var mousedown = {
        type: "mousedown",
        button: 1,
      };
      var hideRipple = function (mouseup, element) {
        return function () {
          Effect.hide(mouseup, element);
        };
      };

      for (; i < elementsLen; i++) {
        element = elements[i];
        pos = options.position || {
          x: element.clientWidth / 2,
          y: element.clientHeight / 2,
        };

        off = offset(element);
        centre.x = off.left + pos.x;
        centre.y = off.top + pos.y;

        mousedown.pageX = centre.x;
        mousedown.pageY = centre.y;

        Effect.show(mousedown, element);

        if (options.wait >= 0 && options.wait !== null) {
          var mouseup = {
            type: "mouseup",
            button: 1,
          };

          setTimeout(hideRipple(mouseup, element), options.wait);
        }
      }
    }
  };

  /**
   * Remove all ripples from an element.
   */
  Waves.calm = function (elements) {
    elements = getWavesElements(elements);
    var mouseup = {
      type: "mouseup",
      button: 1,
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      Effect.hide(mouseup, elements[i]);
    }
  };

  /**
   * Deprecated API fallback
   */
  Waves.displayEffect = function (options) {
    console.error(
      "Waves.displayEffect() has been deprecated and will be removed in future version. Please use Waves.init() to initialize Waves effect"
    );
    Waves.init(options);
  };

  return Waves;
});

/*!
 * jQuery SmartPanels v1.0.0
 *
 * Copyright 2019, 2020 SmartAdmin WebApp
 * Released under Marketplace License (see your license details for usage)
 *
 * Publish Date: 2018-01-01T17:42Z
 */

(function ($, window, document, undefined) {
  //"use strict";

  var pluginName = "smartPanel";

  /**
   * Check for touch support and set right click events.
   **/
  /*var clickEvent = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ? 
		'clickEvent' : 'click') + '.' + pluginName;*/

  var clickEvent;

  if (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    clickEvent = "click tap";
  } else {
    clickEvent = "click";
  }

  function Plugin(element, options) {
    /**
     * Variables.
     **/
    this.obj = $(element);
    this.o = $.extend({}, $.fn[pluginName].defaults, options);
    this.objId = this.obj.attr("id");
    this.panel = this.obj.find(this.o.panels);
    this.storage = { enabled: this.o.localStorage };
    this.initialized = false;
    this.init();
  }

  Plugin.prototype = {
    /**
     * Function for the indicator image.
     *
     * @param:
     **/
    _runPanelLoader: function (elm) {
      var self = this;

      if (self.o.localStorage === true) {
        elm
          .closest(self.o.panels)
          .find(".panel-saving")
          .stop(true, true)
          .fadeIn(100)
          .delay(600)
          .fadeOut(100);
      }
    },

    _loadKeys: function () {
      var self = this;
      var panel_url = self.o.pageKey || location.pathname;

      self.storage.keySettings =
        "smartPanel_settings_" + panel_url + "_" + self.objId;
      self.storage.keyPosition =
        "smartPanel_position_" + panel_url + "_" + self.objId;
    },

    /**
     * Save all settings to the localStorage.
     *
     * @param:
     **/
    _savePanelSettings: function () {
      var self = this;
      var storage = self.storage;

      self._loadKeys();

      var storeSettings = self.obj
        .find(self.o.panels)
        .map(function () {
          var storeSettingsStr = {};
          storeSettingsStr.id = $(this).attr("id");
          storeSettingsStr.style = $(this).attr("data-panel-attstyle");
          storeSettingsStr.locked = $(this).hasClass("panel-locked") ? 1 : 0;
          storeSettingsStr.collapsed = $(this).hasClass("panel-collapsed")
            ? 1
            : 0;
          return storeSettingsStr;
        })
        .get();

      var storeSettingsObj = JSON.stringify({
        panel: storeSettings,
      });

      /* Place it in the storage(only if needed) */
      if (storage.enabled && storage.getKeySettings != storeSettingsObj) {
        localStorage.setItem(storage.keySettings, storeSettingsObj);
        storage.getKeySettings = storeSettingsObj;

        if (myapp_config.debugState)
          console.log("storeSettingsObj:" + storeSettingsObj);
      }

      /**
       * Run the callback function.
       **/

      if (typeof self.o.onSave == "function") {
        self.o.onSave.call(this, null, storeSettingsObj, storage.keySettings);

        if (myapp_config.debugState)
          console.log("keySettings: " + storage.keySettings);
      }
    },

    /**
     * Save positions to the localStorage.
     *
     * @param:
     **/
    _savePanelPosition: function () {
      var self = this;
      var storage = self.storage;

      self._loadKeys();

      var mainArr = self.obj
        .find(self.o.grid + ".sortable-grid")
        .map(function () {
          var subArr = $(this)
            .children(self.o.panels)
            .map(function () {
              return {
                id: $(this).attr("id"),
              };
            })
            .get();
          return {
            section: subArr,
          };
        })
        .get();

      var storePositionObj = JSON.stringify({
        grid: mainArr,
      });

      /* Place it in the storage(only if needed) */
      if (storage.enabled && storage.getKeyPosition != storePositionObj) {
        localStorage.setItem(storage.keyPosition, storePositionObj);
        storage.getKeyPosition = storePositionObj;
      }

      /**
       * Run the callback function.
       **/
      if (typeof self.o.onSave == "function") {
        self.o.onSave.call(this, storePositionObj, storage.keyPosition);
      }
    },

    /**
     * Code that we run at the start.
     *
     * @param:
     **/
    init: function () {
      var self = this;

      if (self.initialized) return;

      self._initStorage(self.storage);

      /**
       * Force users to use an id(it's needed for the local storage).
       **/
      if (!$("#" + self.objId).length) {
        //alert('Your panel ID is missing!');
        if (typeof bootbox != "undefined") {
          bootbox.alert("Your panel ID is missing!");
        } else {
          alert("Your panel ID is missing!");
        }
      }

      /**
       * This will add an extra class that we use to store the
       * panels in the right order.(savety)
       **/

      $(self.o.grid).each(function () {
        if ($(this).find(self.o.panels).length) {
          $(this).addClass("sortable-grid");
        }
      });

      /**
       * SET POSITION PANEL
       **/

      /**
       * Run if data is present.
       **/
      if (self.storage.enabled && self.storage.getKeyPosition) {
        var jsonPosition = JSON.parse(self.storage.getKeyPosition);

        /**
         * Loop the data, and put every panels on the right place.
         **/
        for (var key in jsonPosition.grid) {
          var changeOrder = self.obj
            .find(self.o.grid + ".sortable-grid")
            .eq(key);
          for (var key2 in jsonPosition.grid[key].section) {
            changeOrder.append(
              $("#" + jsonPosition.grid[key].section[key2].id)
            );
          }
        }
      }

      /**
       * SET SETTINGS PANEL
       **/

      /**
       * Run if data is present.
       **/
      if (self.storage.enabled && self.storage.getKeySettings) {
        var jsonSettings = JSON.parse(self.storage.getKeySettings);

        if (myapp_config.debugState)
          console.log("Panel settings loaded: " + self.storage.getKeySettings);

        /**
         * Loop the data and hide/show the panels and set the inputs in
         * panel to checked(if hidden) and add an indicator class to the div.
         * Loop all labels and update the panel titles.
         **/
        for (var key in jsonSettings.panel) {
          var panelId = $("#" + jsonSettings.panel[key].id);

          /**
           * Set a style(if present).
           **/
          if (jsonSettings.panel[key].style) {
            panelId
              .attr(
                "data-panel-attstyle",
                "" + jsonSettings.panel[key].style + ""
              )
              .children(".panel-hdr")
              .removeClassPrefix("bg-")
              .addClass(jsonSettings.panel[key].style);
          }

          /**
           * Toggle content panel.
           **/
          if (jsonSettings.panel[key].collapsed == 1) {
            panelId
              .addClass("panel-collapsed")
              .children(".panel-container")
              .addClass("collapse")
              .removeClass("show");
          }

          /**
           * Locked panel from sorting.
           **/
          if (jsonSettings.panel[key].locked == 1) {
            panelId.addClass("panel-locked");
          }
        }
      }

      /**
       * Format colors
       **/

      if (self.o.panelColors && self.o.colorButton) {
        var formatedPanelColors = [];
        for (var key in self.o.panelColors) {
          formatedPanelColors.push(
            '<a href="#" class="btn d-inline-block ' +
              self.o.panelColors[key] +
              ' width-2 height-2 p-0 rounded-0 js-panel-color hover-effect-dot" data-panel-setstyle="' +
              self.o.panelColors[key] +
              '" style="margin:1px;"></a>'
          );
        }
      }

      /**
       * LOOP ALL PANELS
       **/
      self.panel.each(function () {
        var tPanel = $(this),
          closeButton,
          fullscreenButton,
          collapseButton,
          lockedButton,
          refreshButton,
          colorButton,
          resetButton,
          customButton,
          thisHeader = $(this).children(".panel-hdr"),
          thisContainer = $(this).children(".panel-container");

        /**
         * Dont double wrap(check).
         **/
        if (!thisHeader.parent().attr("role")) {
          /**
           * Adding a helper class to all sortable panels, this will be
           * used to find the panels that are sortable, it will skip the panels
           * that have the dataset 'panels-sortable="false"' set to false.
           **/
          if (
            self.o.sortable === true &&
            tPanel.data("panel-sortable") === undefined
          ) {
            tPanel.addClass("panel-sortable");
          }

          /**
           * Add a close button to the panel header (if set to true)
           **/
          if (
            self.o.closeButton === true &&
            tPanel.data("panel-close") === undefined
          ) {
            closeButton =
              '<a href="#" class="btn btn-panel hover-effect-dot js-panel-close" data-toggle="tooltip" data-offset="0,10" data-original-title="Close"></a>';
          } else {
            closeButton = "";
          }

          /**
           * Add a fullscreen button to the panel header (if set to true).
           **/
          if (
            self.o.fullscreenButton === true &&
            tPanel.data("panel-fullscreen") === undefined
          ) {
            fullscreenButton =
              '<a href="#" class="btn btn-panel hover-effect-dot js-panel-fullscreen" data-toggle="tooltip" data-offset="0,10" data-original-title="Fullscreen"></a>';
          } else {
            fullscreenButton = "";
          }

          /**
           * Add a collapse button to the panel header (if set to true).
           **/
          if (
            self.o.collapseButton === true &&
            tPanel.data("panel-collapsed") === undefined
          ) {
            collapseButton =
              '<a href="#" class="btn btn-panel hover-effect-dot js-panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Collapse"></a>';
          } else {
            collapseButton = "";
          }

          /**
           * Add a locked button to the panel header (if set to true).
           **/
          if (
            self.o.lockedButton === true &&
            tPanel.data("panel-locked") === undefined
          ) {
            lockedButton =
              '<a href="#" class="dropdown-item js-panel-locked"><span data-i18n="drpdwn.lockpanel">' +
              self.o.lockedButtonLabel +
              "</span></a>";
          } else {
            lockedButton = "";
          }

          /**
           * Add a refresh button to the panel header (if set to true).
           **/
          if (
            self.o.refreshButton === true &&
            tPanel.data("panel-refresh") === undefined
          ) {
            refreshButton =
              '<a href="#" class="dropdown-item js-panel-refresh"><span data-i18n="drpdwn.refreshpanel">' +
              self.o.refreshButtonLabel +
              "</span></a>";
            thisContainer.prepend(
              '<div class="loader"><i class="fal fa-spinner-third fa-spin-4x fs-xxl"></i></div>'
            );
            //append** conflicts with panel > container > content:last child, so changed to prepend
          } else {
            refreshButton = "";
          }

          /**
           * Add a color select button to the panel header (if set to true).
           **/
          if (
            self.o.colorButton === true &&
            tPanel.data("panel-color") === undefined
          ) {
            colorButton =
              ' <div class="dropdown-multilevel dropdown-multilevel-left">\
											<div class="dropdown-item">\
												<span data-i18n="drpdwn.panelcolor">' +
              self.o.colorButtonLabel +
              '</span>\
											</div>\
											<div class="dropdown-menu d-flex flex-wrap" style="min-width: 9.5rem; width: 9.5rem; padding: 0.5rem">' +
              formatedPanelColors.join(" ") +
              "</div>\
										</div>";
          } else {
            colorButton = "";
          }

          /**
           * Add a reset widget button to the panel header (if set to true).
           **/
          if (
            self.o.resetButton === true &&
            tPanel.data("panel-reset") === undefined
          ) {
            resetButton =
              '<div class="dropdown-divider m-0"></div><a href="#" class="dropdown-item js-panel-reset"><span data-i18n="drpdwn.resetpanel">' +
              self.o.resetButtonLabel +
              "</span></a>";
          } else {
            resetButton = "";
          }

          /**
           * Add a custom button to the panel header (if set to true).
           **/
          if (
            self.o.customButton === true &&
            tPanel.data("panel-custombutton") === undefined
          ) {
            customButton =
              '<a href="#" class="dropdown-item js-panel-custombutton pl-4"><span data-i18n="drpdwn.custombutton">' +
              self.o.customButtonLabel +
              "</span></a>";
          } else {
            customButton = "";
          }

          /**
           * Append the image to the panel header.
           **/
          thisHeader.append(
            '<div class="panel-saving mr-2" style="display:none"><i class="fal fa-spinner-third fa-spin-4x fs-xl"></i></div>'
          );

          /**
           * Set the buttons order.
           **/
          var formatButtons = self.o.buttonOrder
            .replace(/%close%/g, closeButton)
            .replace(/%fullscreen%/g, fullscreenButton)
            .replace(/%collapse%/g, collapseButton);

          /**
           * Add a button wrapper to the header.
           **/
          if (
            closeButton !== "" ||
            fullscreenButton !== "" ||
            collapseButton !== ""
          ) {
            thisHeader.append(
              '<div class="panel-toolbar">' + formatButtons + "</div>"
            );
          }

          /**
           * Set the dropdown buttons order.
           **/
          var formatDropdownButtons = self.o.buttonOrderDropdown
            .replace(/%locked%/g, lockedButton)
            .replace(/%color%/g, colorButton)
            .replace(/%refresh%/g, refreshButton)
            .replace(/%reset%/g, resetButton)
            .replace(/%custom%/g, customButton);

          /**
           * Add a button wrapper to the header.
           **/
          if (
            lockedButton !== "" ||
            colorButton !== "" ||
            refreshButton !== "" ||
            resetButton !== "" ||
            customButton !== ""
          ) {
            thisHeader.append(
              '<div class="panel-toolbar"><a href="#" class="btn btn-toolbar-master" data-toggle="dropdown"><i class="fal fa-ellipsis-v"></i></a><div class="dropdown-menu dropdown-menu-animated dropdown-menu-right p-0">' +
                formatDropdownButtons +
                "</div></div>"
            );
          }

          /**
           * Adding roles to some parts.
           **/
          tPanel
            .attr("role", "widget")
            .children("div")
            .attr("role", "content")
            .prev(".panel-hdr")
            .attr("role", "heading")
            .children(".panel-toolbar")
            .attr("role", "menu");
        }
      });

      /**
       * SORTABLE
       **/
      /**
       * jQuery UI soratble, this allows users to sort the panels.
       * Notice that this part needs the jquery-ui core to work.
       **/
      if (self.o.sortable === true && jQuery.ui) {
        var sortItem = self.obj
          .find(self.o.grid + ".sortable-grid")
          .not("[data-panel-excludegrid]");
        sortItem.sortable({
          items: sortItem.find(self.o.panels + ".panel-sortable"),
          connectWith: sortItem,
          placeholder: self.o.placeholderClass,
          cursor: "move",
          //revert: true,
          opacity: self.o.opacity,
          delay: 0,
          revert: 350,
          cancel:
            ".btn-panel, .panel-fullscreen .panel-fullscreen, .mod-panel-disable .panel-sortable, .panel-locked.panel-sortable",
          zIndex: 10000,
          handle: self.o.dragHandle,
          forcePlaceholderSize: true,
          forceHelperSize: true,
          update: function (event, ui) {
            /* run pre-loader in the panel */
            self._runPanelLoader(ui.item.children());
            /* store the positions of the plugins */
            self._savePanelPosition();
            /**
             * Run the callback function.
             **/
            if (typeof self.o.onChange == "function") {
              self.o.onChange.call(this, ui.item);
            }
          },
        }); //you can add  }).disableSelection() if you don't want text to be selected accidently.
      }

      /**
       * CLICKEVENTS
       **/
      self._clickEvents();

      /**
       * DELETE LOCAL STORAGE KEYS
       **/
      if (self.storage.enabled) {
        // Delete the settings key.
        $(self.o.deleteSettingsKey).on(clickEvent, this, function (e) {
          var cleared = confirm(self.o.settingsKeyLabel);
          if (cleared) {
            localStorage.removeItem(keySettings);
          }
          e.preventDefault();
        });

        // Delete the position key.
        $(self.o.deletePositionKey).on(clickEvent, this, function (e) {
          var cleared = confirm(self.o.positionKeyLabel);
          if (cleared) {
            localStorage.removeItem(keyPosition);
          }
          e.preventDefault();
        });
      }

      initialized = true;
    },

    /**
     * Initialize storage.
     *
     * @param:
     **/
    _initStorage: function (storage) {
      /**
       * LOCALSTORAGE CHECK
       **/
      storage.enabled =
        storage.enabled &&
        !!(function () {
          var result,
            uid = +new Date();
          try {
            localStorage.setItem(uid, uid);
            result = localStorage.getItem(uid) == uid;
            localStorage.removeItem(uid);
            return result;
          } catch (e) {}
        })();

      this._loadKeys();

      if (storage.enabled) {
        storage.getKeySettings = localStorage.getItem(storage.keySettings);
        storage.getKeyPosition = localStorage.getItem(storage.keyPosition);
      } // end if
    },

    /**
     * Register all click events.
     *
     * @param:
     **/
    _clickEvents: function () {
      var self = this;
      var headers = self.panel.children(".panel-hdr");

      /**
       * Allow users to toggle collapse.
       **/
      headers.on(clickEvent, ".js-panel-collapse", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels);

        /**
         * Close tooltip
         **/
        if (
          typeof $.fn.tooltip !== "undefined" &&
          $('[data-toggle="tooltip"]').length
        ) {
          $(this).tooltip("hide");
        } else {
          console.log("bs.tooltip is not loaded");
        }

        /**
         * Run function for the indicator image.
         **/
        // pPanel.toggleClass("panel-collapsed");

        pPanel
          .children(".panel-container")
          .collapse("toggle")
          .on("shown.bs.collapse", function () {
            pPanel.removeClass("panel-collapsed");
            self._savePanelSettings();
          })
          .on("hidden.bs.collapse", function () {
            pPanel.addClass("panel-collapsed");
            self._savePanelSettings();
          });

        /*if (pPanel.hasClass('panel-collapsed')) {
					pPanel.removeClass('panel-collapsed')
						.children('.panel-container')
						.slideDown(400, function () {
							self._savePanelSettings(); 
						});
				} else {
					pPanel.addClass('panel-collapsed')
						.children('.panel-container')
						.slideUp(400, function () {
							self._savePanelSettings(); 
						});
				}*/

        /**
         * Run function for the indicator image.
         **/
        self._runPanelLoader(tPanel);

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onCollapse == "function") {
          self.o.onCollapse.call(this, pPanel);
        }

        /**
         * Lets save the setings.
         **/
        // self._savePanelSettings();

        e.preventDefault();
      });

      /**
       * Allow users to toggle fullscreen.
       **/
      headers.on(clickEvent, ".js-panel-fullscreen", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels);

        /**
         * Close tooltip
         **/
        if (
          typeof $.fn.tooltip !== "undefined" &&
          $('[data-toggle="tooltip"]').length
        ) {
          $(this).tooltip("hide");
        } else {
          console.log("bs.tooltip is not loaded");
        }

        /**
         * Run function for the indicator image.
         **/
        pPanel.toggleClass("panel-fullscreen");
        myapp_config.root_.toggleClass("panel-fullscreen");

        /**
         * Run function for the indicator image.
         **/
        self._runPanelLoader(tPanel);

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onFullscreen == "function") {
          self.o.onFullscreen.call(this, pPanel);
        }

        e.preventDefault();
      });

      /**
       * Allow users to close the panel.
       **/
      headers.on(clickEvent, ".js-panel-close", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels),
          pTitle = pPanel.children(".panel-hdr").children("h2").text().trim();

        /**
         * Close tooltip
         **/
        if (
          typeof $.fn.tooltip !== "undefined" &&
          $('[data-toggle="tooltip"]').length
        ) {
          $(this).tooltip("hide");
        } else {
          console.log("bs.tooltip is not loaded");
        }

        var killPanel = function () {
          /**
           * Run function for the indicator image.
           **/
          pPanel.fadeOut(500, function () {
            /* remove panel */
            $(this).remove();
            /**
             * Run the callback function.
             **/
            if (typeof self.o.onClosepanel == "function") {
              self.o.onClosepanel.call(this, pPanel);
            }
          });

          /**
           * Run function for the indicator image.
           **/
          self._runPanelLoader(tPanel);
        };

        //backdrop sound
        initApp.playSound("media/sound", "messagebox");

        if (typeof bootbox != "undefined") {
          bootbox.confirm({
            title:
              "<i class='fal fa-times-circle text-danger mr-2'></i> Do you wish to delete panel <span class='fw-500'>&nbsp;'" +
              pTitle +
              "'&nbsp;</span>?",
            message:
              "<span><strong>Warning:</strong> This action cannot be undone!</span>",
            centerVertical: true,
            swapButtonOrder: true,
            buttons: {
              confirm: {
                label: "Yes",
                className: "btn-danger shadow-0",
              },
              cancel: {
                label: "No",
                className: "btn-default",
              },
            },
            className: "modal-alert",
            closeButton: false,
            callback: function (result) {
              if (result == true) {
                //close panel
                killPanel();
              }
            },
          });
        } else {
          if (confirm("Do you wish to delete panel " + pTitle + "?")) {
            killPanel();
          }
        }

        e.preventDefault();
      });

      /**
       * Allow users to set widget style (color).
       **/
      headers.on(clickEvent, ".js-panel-color", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels),
          selectedHdr = tPanel.closest(".panel-hdr"),
          val = tPanel.data("panel-setstyle");

        /**
         * Run the callback function.
         **/
        selectedHdr
          .removeClassPrefix("bg-")
          .addClass(val)
          .closest(".panel")
          .attr("data-panel-attstyle", "" + val + "");

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onColor == "function") {
          self.o.onColor.call(this, pPanel);
        }

        /**
         * Run function for the indicator image.
         **/
        self._runPanelLoader(tPanel);

        /**
         * Lets save the setings.
         **/
        self._savePanelSettings();

        e.preventDefault();
      });

      /**
       * Allow users to lock widget to grid - preventing draging.
       **/
      headers.on(clickEvent, ".js-panel-locked", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels);

        /**
         * Run function for the indicator image.
         **/
        pPanel.toggleClass("panel-locked");

        /**
         * Run function for the indicator image.
         **/
        self._runPanelLoader(tPanel);

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onLocked == "function") {
          self.o.onLocked.call(this, pPanel);
        }

        /**
         * Lets save the setings.
         **/
        self._savePanelSettings();

        e.preventDefault();
      });

      /**
       * Allow users to toggle refresh widget content.
       **/
      headers.on(clickEvent, ".js-panel-refresh", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels),
          //pContainer = pPanel.children('.panel-container'),
          dTimer = pPanel.attr("data-refresh-timer") || 1500;

        /**
         * Run function for the indicator image.
         **/
        pPanel
          .addClass("panel-refresh")
          .children(".panel-container")
          .addClass("enable-loader")
          .stop(true, true)
          .delay(dTimer)
          .queue(function () {
            //pContainer.removeClass('enable-spinner').dequeue();
            pPanel
              .removeClass("panel-refresh")
              .children(".panel-container")
              .removeClass("enable-loader")
              .dequeue();
            console.log(pPanel.attr("id") + " refresh complete");
          });

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onRefresh == "function") {
          self.o.onRefresh.call(this, pPanel);
        }

        e.preventDefault();
      });

      /**
       * Allow users to toggle reset widget settings.
       **/
      headers.on(clickEvent, ".js-panel-reset", function (e) {
        var tPanel = $(this),
          pPanel = tPanel.closest(self.o.panels),
          selectedHdr = tPanel.closest(".panel-hdr");

        /**
         * Remove all setting classes.
         **/
        selectedHdr
          .removeClassPrefix("bg-")
          .closest(".panel")
          .removeClass("panel-collapsed panel-fullscreen panel-locked")
          .attr("data-panel-attstyle", "")
          .children(".panel-container")
          .collapse("show");

        /**
         * Run function for the indicator image.
         **/
        self._runPanelLoader(tPanel);

        /**
         * Lets save the setings.
         **/
        self._savePanelSettings();

        /**
         * Run the callback function.
         **/
        if (typeof self.o.onReset == "function") {
          self.o.onReset.call(this, pPanel);
        }

        e.preventDefault();
      });

      headers = null;
    },

    /**
     * Destroy.
     *
     * @param:
     **/
    destroy: function () {
      var self = this,
        namespace = "." + pluginName,
        sortItem = self.obj
          .find(self.o.grid + ".sortable-grid")
          .not("[data-panel-excludegrid]");
      self.panel.removeClass("panel-sortable");
      sortItem.sortable("destroy");
      self.panel.children(".panel-hdr").off(namespace);
      $(self.o.deletePositionKey).off(namespace);
      $(window).off(namespace);
      self.obj.removeData(pluginName);
      self.initialized = false;
    },
  };

  $.fn[pluginName] = function (option) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data(pluginName);

      if (!data) {
        var options = typeof option == "object" && option;
        $this.data(pluginName, (data = new Plugin(this, options)));
      }
      if (typeof option == "string") {
        data[option]();
      }
    });
  };

  /**
   * Default settings(dont change).
   * You can globally override these options
   * by using $.fn.pluginName.key = 'value';
   **/

  $.fn[pluginName].defaults = {
    grid: '[class*="col-"]',
    panels: ".panel",
    placeholderClass: "panel-placeholder",
    dragHandle: "> .panel-hdr > h2",
    localStorage: true,
    onChange: function () {},
    onSave: function () {},
    opacity: 1,
    deleteSettingsKey: "",
    settingsKeyLabel: "Reset settings?",
    deletePositionKey: "",
    positionKeyLabel: "Reset position?",
    sortable: true,
    buttonOrder: "%collapse% %fullscreen% %close%",
    buttonOrderDropdown: "%refresh% %locked% %color% %custom% %reset%",
    customButton: false,
    customButtonLabel: "Custom Label",
    onCustom: function () {},
    closeButton: true,
    onClosepanel: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onClosepanel");
    },
    fullscreenButton: true,
    onFullscreen: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onFullscreen");
    },
    collapseButton: true,
    onCollapse: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onCollapse");
    },
    lockedButton: true,
    lockedButtonLabel: "Lock Position",
    onLocked: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onLocked");
    },
    refreshButton: true,
    refreshButtonLabel: "Refresh Content",
    onRefresh: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onRefresh");
    },
    colorButton: true,
    colorButtonLabel: "Panel Style",
    onColor: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onColor");
    },
    panelColors: [
      "bg-primary-700 bg-success-gradient",
      "bg-primary-500 bg-info-gradient",
      "bg-primary-600 bg-primary-gradient",
      "bg-info-600 bg-primray-gradient",
      "bg-info-600 bg-info-gradient",
      "bg-info-700 bg-success-gradient",
      "bg-success-900 bg-info-gradient",
      "bg-success-700 bg-primary-gradient",
      "bg-success-600 bg-success-gradient",
      "bg-danger-900 bg-info-gradient",
      "bg-fusion-400 bg-fusion-gradient",
      "bg-faded",
    ],
    resetButton: true,
    resetButtonLabel: "Reset Panel",
    onReset: function () {
      if (myapp_config.debugState)
        console.log($(this).closest(".panel").attr("id") + " onReset callback");
    },
  };
})(jQuery, window, document);
