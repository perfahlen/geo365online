'use strict';

var smilOnline = smilOnline || {};

smilOnline.config = function () {
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

    return {
        setCenter: center,
        setZoom: zoom,
        setBingKey: bingKey,
        getConfig: getConfig
    };
};