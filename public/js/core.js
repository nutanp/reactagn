
!function($) {
    "use strict";

    var Components = function() {};

    //initializing tooltip
    Components.prototype.initTooltipPlugin = function() {
        $.fn.tooltip && $('[data-toggle="tooltip"]').tooltip();
    },

    //initializing popover
    Components.prototype.initPopoverPlugin = function() {
        $.fn.popover && $('[data-toggle="popover"]').popover()
    },


    //initilizing
    Components.prototype.init = function() {
        var $this = this;
        /*this.initTooltipPlugin(),
        this.initPopoverPlugin(),
        this.initSlimScrollPlugin(),
        this.initCustomModalPlugin(),
        this.initRangeSlider(),
        this.initSwitchery(),
        this.initKnob(),
        this.initCounterUp();*/
    },

    $.Components = new Components, $.Components.Constructor = Components;

}(window.jQuery),
    //initializing main application module
function($) {
    "use strict";
    $.Components.init();
}(window.jQuery);



