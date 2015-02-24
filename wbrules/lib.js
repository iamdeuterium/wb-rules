// rule engine runtime

var _WbRules = {
  ruleMap: {},

  ruleNames: [],

  requireCompleteCells: 0,

  IncompleteCellError: (function () {
    function IncompleteCellError(cellName) {
      this.name = "IncompleteCellError";
      this.message = "incomplete cell encountered: " + cellName;
    }
    IncompleteCellError.prototype = Error.prototype;
    return IncompleteCellError;
  })(),

  autoload: function (target, acquire, setValue) {
    return new Proxy(target, {
      get: function (o, name) {
        if (!(name in o)) {
          o[name] = acquire(name, o);
        }
        return o[name];
      },
      set: function (o, name, value) {
        throw new Error("setting unsupported proxy value: " + name);
      }
    });
  },

  wrapDevice: function (name) {
    return _WbRules.autoload(_wbDevObject(name), _WbRules.wrapCell);
  },

  wrapCell: function (name, dev) {
    var cell = _wbCellObject(dev, name);
    return {
      // TBD: check for completeness
      get v () {
        if (_WbRules.requireCompleteCells && !cell.isComplete())
          throw new _WbRules.IncompleteCellError(name);
        return cell.value().v;
      },
      set v (value) {
        cell.setValue({ v: value });
      }
    };
  },

  defineRule: function (name, def) {
    if (typeof name != "string" || !def)
      throw new Error("invalid rule definition");

    if (!_WbRules.ruleMap.hasOwnProperty(name))
      _WbRules.ruleNames.push(name);
    _WbRules.ruleMap[name] = def;
  },

  runRules: function () {
    alert("runRules()");
    _WbRules.ruleNames.forEach(function (name) {
      alert("running rule: " + name);
      var rule = _WbRules.ruleMap[name];
      try {
        _WbRules.requireCompleteCells++;
        try {
          var shouldFire = rule.when();
        } catch (e) {
          if (e instanceof _WbRules.IncompleteCellError) {
            alert("skipping rule " + name + ": " + e);
            return;
          }
          throw e;
        } finally {
          _WbRules.requireCompleteCells--;
        }
        if (shouldFire) {
          alert("rule fired: " + name);
          rule.then();
        }
      } catch (e) {
        alert("error running rule " + name + ": " + e.stack || e);
      }
    });
  }
};

var dev = _WbRules.autoload({}, _WbRules.wrapDevice);
defineRule = _WbRules.defineRule;
runRules = _WbRules.runRules;
