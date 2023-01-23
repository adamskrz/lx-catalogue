(function() {
  var FILTER_TEXT, GEL_CONTAINER, GEL_DATA_CODE, GEL_DATA_COLOR, GEL_DATA_DESCRIPTION, GEL_DATA_NAME, GEL_ELEMENTS, GEL_TEMPLATE, SORT_ACTIVE_CLASS, SORT_BUTTONS, SORT_HUE, SORT_NUMERIC, debounce, display_gels, gel_filter, gel_lib, gel_sort, rgb2hue;

  GEL_TEMPLATE = "#gel-template";

  GEL_CONTAINER = "#gels-list";

  GEL_ELEMENTS = "#gels-list li";

  GEL_DATA_CODE = "gel-code";

  GEL_DATA_COLOR = "gel-color";

  GEL_DATA_NAME = "gel-name";

  GEL_DATA_DESCRIPTION = "gel-description";

  SORT_BUTTONS = ".nav-button";

  SORT_NUMERIC = "#gel-sort-numeric";

  SORT_HUE = "#gel-sort-hue";

  FILTER_TEXT = "#q";

  SORT_ACTIVE_CLASS = "active";

  gel_lib = [];

  gel_sort = "sort";

  gel_filter = "";

  debounce = function(fn) {
    var timeout;
    timeout = void 0;
    return function() {
      var args, ctx;
      args = Array.prototype.slice.call(arguments);
      ctx = this;
      clearTimeout(timeout);
      return timeout = setTimeout((function() {
        fn.apply(ctx, args);
      }), 100);
    };
  };

  rgb2hue = function(r, g, b) {
    return Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b);
  };

  display_gels = function(gels, sort, filter, template) {
    var output;
    output = "";
    gels.sort(function(a, b) {
      return a[sort] - b[sort];
    });
    filter = filter.toLowerCase();
    if (filter !== "") {
      gels = gels.filter(function(a) {
        return a.code === filter || a.sort.toString() === filter || a.name.toLowerCase().search(filter) >= 0 || a.description.toLowerCase().search(filter) >= 0;
      });
    }
    $(gels).each(function() {
      return output += template({
        gel: this
      });
    });
    $(GEL_CONTAINER).empty();
    return $(GEL_CONTAINER).html(output);
  };

  $(document).ready(function() {
    var gel_template;
    $(GEL_ELEMENTS).each(function() {
      var b, g, gel, gel_color, r;
      gel_color = String($(this).data(GEL_DATA_COLOR));
      r = parseInt(gel_color.slice(0, 2), 16);
      g = parseInt(gel_color.slice(2, 4), 16);
      b = parseInt(gel_color.slice(4, 6), 16);
      gel = {
        sort: $(this).data(GEL_DATA_CODE).slice(1),
        code: $(this).data(GEL_DATA_CODE),
        color: gel_color,
        hue: rgb2hue(r, g, b),
        name: $(this).data(GEL_DATA_NAME),
        description: $(this).data(GEL_DATA_DESCRIPTION)
      };
      return gel_lib.push(gel);
    });
    gel_template = _.template($(GEL_TEMPLATE).html());
    display_gels(gel_lib, gel_sort, gel_filter, gel_template);
    $(SORT_NUMERIC).click(function() {
      gel_sort = "sort";
      display_gels(gel_lib, gel_sort, gel_filter, gel_template);
      $(SORT_BUTTONS).removeClass(SORT_ACTIVE_CLASS);
      return $(this).addClass(SORT_ACTIVE_CLASS);
    });
    $(SORT_HUE).click(function() {
      gel_sort = "hue";
      display_gels(gel_lib, gel_sort, gel_filter, gel_template);
      $(SORT_BUTTONS).removeClass(SORT_ACTIVE_CLASS);
      return $(this).addClass(SORT_ACTIVE_CLASS);
    });
    $(FILTER_TEXT).keyup(debounce(function() {
      gel_filter = $(this).val();
      return display_gels(gel_lib, gel_sort, gel_filter, gel_template);
    }));
    return window.gl = gel_lib;
  });

}).call(this);
