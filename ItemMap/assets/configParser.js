'use strict';

var smilOnline = smilOnline || {};

smilOnline.configParser = function () {

    var parseMapOptions = function (config) {
        var center = getCenter(config);
        var bingConfig = new smilOnline.config();
        bingConfig.setCenter(center);
        bingConfig.setZoom(config.zoom);
        bingConfig.setBingKey(config.credentials);
        var mapOptions = bingConfig.getConfig();

        return mapOptions;
    };

    var getCenter = function (config) {
        var center = new Microsoft.Maps.Location(config.center.lat, config.center.lon);
        return center;
    };

    return {
        getMapOptions: parseMapOptions
    }
}();