const $ = require("jquery");
require("../dist/jquery.loading");

// Translate assert functions to jest assertions
// Remove this after migrate to jest assertions
const assert = {
  ok: function(expr) {
    expect(expr).toBeTruthy();
  },
  equal: function(obj1, obj2) {
    expect(obj1).toEqual(obj2);
  },
  notEqual: function(obj1, obj2) {
    expect(obj1).not.toEqual(obj2);
  }
};

describe("jquery-loading", function() {
  var div, div2;

  beforeEach(function() {
    div = $('<div id="test-div">Test div</div>');
    div2 = $('<div style="z-index: 100">Test div #2</div>');
  });

  afterEach(function() {
    div.loading("destroy");
    div2.loading("destroy");
  });

  test("if loading jquery function is chainable", function() {
    assert.ok(div.loading() instanceof $, "loading is chainable");
  });

  test("if loading object is accessible by Loading jquery method", function() {
    div.loading();
    assert.ok(
      div.Loading() instanceof $.Loading,
      "Started elements have a valid Loading object"
    );
    assert.equal(
      div.Loading().element.attr("id"),
      "test-div",
      "Loading object has reference to the right element"
    );
  });

  test("Loading jquery method as plugin initializer", function() {
    var obj = div.Loading();
    assert.ok(
      obj instanceof $.Loading,
      "Plugin is initialized by first Loading call"
    );
    assert.equal(
      div.Loading(),
      obj,
      "Second call to Loading return previously created Loading object"
    );

    assert.equal(obj.active(), true);
    div.loading("stop");
    assert.equal(
      obj.active(),
      false,
      "loading() function has access to same object created by Loading()"
    );
  });

  test("if subsequent calls of Loading with new config options reinitialize the plugin object", function() {
    // Using $.fn.Loading
    var obj1 = div.Loading({
      message: "First call"
    });

    var obj2 = div.Loading({
      message: "Second call"
    });
    assert.notEqual(obj1, obj2, "Underlying plugin object should change");
    assert.equal(
      obj2.settings.message,
      "Second call",
      "New config options should be considered"
    );
  });

  test("if subsequent calls of loading with new config options reinitialize the plugin object", function() {
    // Using $.fn.loading
    div.loading({
      message: "First call"
    });
    var obj1 = div.data("jquery-loading");

    div.loading({
      message: "Second call"
    });
    var obj2 = div.data("jquery-loading");

    assert.notEqual(obj1, obj2, "Underlying plugin object should change");
    assert.equal(
      obj2.settings.message,
      "Second call",
      "New config options should be considered"
    );
  });

  test("events and triggers", function() {
    var mustBeTrueStart = false;
    div.on("loading.start", function(event, loading) {
      mustBeTrueStart = true;
      assert.ok(
        loading instanceof $.Loading,
        "Loading object is send as parameter to loading.start handler"
      );
    });
    div.loading();
    assert.ok(
      mustBeTrueStart,
      "start method trigger the loading.start handlers"
    );

    var mustBeTrueStop = false;
    div.on("loading.stop", function(event, loading) {
      mustBeTrueStop = true;
      assert.ok(
        loading instanceof $.Loading,
        "Loading object is send as parameter to loading.stop handler"
      );
    });
    div.loading("stop");
    assert.ok(mustBeTrueStop, "stop method trigger the loading.stop handlers");

    var mustBeTrueClick = false;
    div.on("loading.click", function(event, loading) {
      mustBeTrueClick = true;
      assert.ok(
        loading instanceof $.Loading,
        "Loading object is send as parameter to loading.click handler"
      );
    });
    div.Loading().overlay.trigger("click");
    assert.ok(
      mustBeTrueClick,
      "click method trigger the loading.click handlers"
    );
  });

  test("active flag", function() {
    div.loading();
    div.off("loading.start").off("loading.stop");

    assert.equal(
      div.Loading().active(),
      true,
      "Active state is turned on on initialization"
    );

    div.loading("stop");
    assert.equal(
      div.Loading().active(),
      false,
      "Active state is turned off if stopped, even with events disabled"
    );

    div.loading("start");
    assert.equal(
      div.Loading().active(),
      true,
      "Active state is turned on if started, even with events disabled"
    );
  });

  test(":loading selector", function() {
    assert.equal(
      div.is(":loading"),
      false,
      "Not loading elements return false to selector"
    );

    div.loading();
    assert.equal(
      div.is(":loading"),
      true,
      "Loading elements return true to selector"
    );

    div.loading("stop");
    assert.equal(
      div.is(":loading"),
      false,
      "Stopped elements return false to selector"
    );
  });

  test("start option", function() {
    div.loading({
      start: false
    });

    assert.equal(
      div.Loading().active(),
      false,
      "Loading object is not started if `start` options is set to false"
    );
  });

  test("if shownClass is applied to overlay elements", function() {
    var shownClass = $.Loading.defaults.shownClass;
    var obj = div.Loading();

    assert.ok(
      !obj.createOverlay().hasClass(shownClass),
      "`shownClass` is not applied to the default overlay when it is created"
    );

    assert.ok(
      obj.overlay.hasClass($.Loading.defaults.shownClass),
      "`shownClass` is applied to overlay at initialization"
    );

    div.loading("stop");
    assert.ok(
      !obj.overlay.hasClass($.Loading.defaults.shownClass),
      "`shownClass` is removed from overlay when loading state is stopped"
    );

    div.loading("start");
    assert.ok(
      obj.overlay.hasClass($.Loading.defaults.shownClass),
      "`shownClass` is applied to overlay when loading state is started again"
    );
  });

  test("if hiddenClass is applied to overlay elements", function() {
    var hiddenClass = $.Loading.defaults.hiddenClass;
    var obj = div.Loading();

    assert.ok(
      obj.createOverlay().hasClass(hiddenClass),
      "`hiddenClass` is applied to the default overlay when it is created"
    );

    assert.ok(
      !obj.overlay.hasClass(hiddenClass),
      "`hiddenClass` is applied to overlay at initialization"
    );

    div.loading("stop");
    assert.ok(
      obj.overlay.hasClass(hiddenClass),
      "`hiddenClass` is applied to overlay when loading state is stopped"
    );

    div.loading("start");
    assert.ok(
      !obj.overlay.hasClass(hiddenClass),
      "`hiddenClass` is removed from overlay when loading state is started again"
    );
  });

  test("if overlay detects z-index of the target element", function() {
    var load = div.Loading();
    assert.equal(
      load.overlay.css("z-index"),
      "1",
      "Overlay z-index set to 1 if target has no index defined"
    );

    var bodyLoad = $("body").Loading();
    assert.equal(
      bodyLoad.overlay.css("z-index"),
      "2",
      "Body overlay z-index set to 2 if body has no index defined"
    );

    var load2 = div2.Loading();
    assert.equal(
      load2.overlay.css("z-index"),
      "101",
      "Overlay z-index set to target z-index + 1"
    );

    div2.css("z-index", 50);
    load2.resize();
    assert.equal(
      load2.overlay.css("z-index"),
      "51",
      "Overlay z-index changed if target element changed"
    );
  });

  test("if zIndex option is used by the default plugin's overlay", function() {
    var obj = div.Loading({
      zIndex: 42
    });
    assert.equal(
      obj.overlay.css("z-index"),
      "42",
      "Overlay z-index should be the one passed as plugin setting"
    );

    obj = div2.Loading({
      zIndex: 1e5
    });
    assert.equal(
      obj.overlay.css("z-index"),
      "100000",
      "Overlay z-index should be the one passed as plugin setting"
    );
  });

  test("first call with different argument types and values", function() {
    var div3 = $("<span></span>");
    var div4 = $("<div></div>");
    var div5 = $("<p></p>");
    var div6 = $("<div></div>");

    assert.ok(div.loading().data("jquery-loading"));
    assert.ok(div2.loading({}).data("jquery-loading"));
    assert.ok(div3.loading("start").data("jquery-loading"));
    assert.ok(div4.loading("toggle").data("jquery-loading"));

    assert.ok(!div5.loading("stop").data("jquery-loading"));
    assert.ok(!div6.loading("test").data("jquery-loading"));
  });

  test("destroy method should remove overlay from DOM", function() {
    div.loading();
    div.loading("stop");
    assert.equal(
      div.Loading().overlay.parents("body").length,
      1,
      "Overlay should be kept attached to body when loading just stopped"
    );

    div.loading("destroy");
    assert.equal(
      div.Loading().overlay.parents("body").length,
      0,
      "Overlay should be removed from body when loading destroyed"
    );
  });

  test("when new settings are passed to element already initialized", function() {
    div.loading();
    var overlay1 = div.Loading().overlay;

    div.loading({ message: "Second message" });
    assert.equal(
      overlay1.parents("body").length,
      0,
      "Old overlay should be destroyed"
    );
    assert.equal(
      div.Loading().overlay.text(),
      "Second message",
      "New config should be used"
    );
  });
});
