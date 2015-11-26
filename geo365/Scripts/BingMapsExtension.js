'use strict';

var geo365 = geo365 || {};

geo365.extendBingMaps = function () {
    Microsoft.Maps.Pushpin.prototype.setAttributes = function () {
        this.attributes = arguments[0];
    };

    Microsoft.Maps.Pushpin.prototype.getAttributes = function () {
        return this.attributes;
    };

    Microsoft.Maps.Polygon.prototype.setAttributes = function () {
        this.attributes = arguments[0];
    };

    Microsoft.Maps.Polygon.prototype.getAttributes = function () {
        return this.attributes;
    };

    Microsoft.Maps.Polyline.prototype.setAttributes = function () {
        this.attributes = arguments[0];
    };

    Microsoft.Maps.Polyline.prototype.getAttributes = function () {
        return this.attributes;
    };
}();
