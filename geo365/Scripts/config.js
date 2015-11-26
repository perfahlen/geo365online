'use strict';

var geo365 = geo365 || {};

geo365.config = function () {
    var _center = {};
    var _zoom = null;
    var _bingKey = "";

    var center = function (location) {
        _center = location;
    };

    var zoom = function (zoomLevel) {
        _zoom = zoomLevel;
    };

    var bingKey = function (bingKey) {
        _bingKey = bingKey;
    };

    var getConfig = function () {
        var mapOptions = {
            credentials: _bingKey,
            center: _center,
            zoom: _zoom
        };
        return mapOptions;
    };

    var getFormConfiguration = function () {
        var latitude = parseFloat(jQuery("#configWidgetFormLatitude").val());
        var longitude = parseFloat(jQuery("#configWidgetFormLongitude").val());
        var bingKey = jQuery("#configWidgetFormBingKey").val();
        var zoomLevel = parseInt(jQuery("#configWidgetFormZoomLevel").val());
        if (bingKey.length > 0) {
            var location = { lat: latitude || 0, lon: longitude || 0 };
            this.setCenter(location);
            this.setZoom(zoomLevel);
            this.setBingKey(bingKey);
            var currentConfig = this.getConfig();
            return currentConfig;
        }
    };

    return {
        setCenter: center,
        setZoom: zoom,
        setBingKey: bingKey,
        getConfig: getConfig,
        getFormConfiguration: getFormConfiguration
    };
};