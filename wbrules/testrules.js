// -*- mode: js2-mode -*-

defineAlias("stabEnabled", "stabSettings/enabled");
defineAlias("temp", "somedev/temp");
defineAlias("sw", "somedev/sw");

defineVirtualDevice("stabSettings", {
  title: "Stabilization Settings",
  cells: {
    enabled: {
      type: "switch",
      value: false
    },
    lowThreshold: {
      type: "range",
      max: 40,
      value: 20
    },
    highThreshold: {
      type: "range",
      max: 50,
      value: 22
    }
  }
});

defineRule("heaterOn", {
  asSoonAs: function () {
    return stabEnabled && temp < dev.stabSettings.lowThreshold;
  },
  then: function () {
    log("heaterOn fired");
    sw = true;
  }
});

defineRule("heaterOff", {
  when: function () {
    return sw && (!stabEnabled || temp >= dev.stabSettings.highThreshold);
  },
  then: function () {
    log("heaterOff fired");
    sw = false;
  }
});

defineRule("initiallyIncompleteLevelTriggered", {
  when: function () {
    return dev.somedev.foobar != "0";
  },
  then: function () {
    log("initiallyIncompleteLevelTriggered fired");
  }
});

defineRule("sendmqtt", {
  asSoonAs: function () {
    return dev.somedev.sendit;
  },
  then: function () {
    publish("/abc/def/ghi", "0", 0);
    publish("/misc/whatever", "abcdef", 1);
    publish("/zzz/foo", "qqq", 2);
    publish("/zzz/foo/qwerty", "42", 2, true);
  }
});

defineRule("cellChange1", {
  onCellChange: "somedev/foobarbaz",
  then: function (devName, cellName, newValue) {
    var v = dev[devName][cellName];
    if (v !== newValue)
      throw new Error("bad newValue! " + newValue);
    log("cellChange1: " + devName + "/" + cellName + "=" + v + " (" + typeof(v) + ")");
  }
});

defineRule("cellChange2", {
  onCellChange: ["somedev/foobarbaz", "somedev/tempx"],
  then: function (devName, cellName, newValue) {
    var v = dev[devName][cellName];
    if (v !== newValue)
      throw new Error("bad newValue! " + newValue);
    log("cellChange2: " + devName + "/" + cellName + "=" + v + " (" + typeof(v) + ")");
  }
});
