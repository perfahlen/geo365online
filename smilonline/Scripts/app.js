'use strict';

var smilOnline = smilOnline || {};

smilOnline.getQueryStringParameter = function (param) {
    var params = document.URL.split("?")[1].split("&");

    for (var i = 0; i < params.length; i++) {
        var currentParam = params[i].split("=");
        if (currentParam[0] == param)
            return currentParam[1];
    }
};

smilOnline.appWebUrl = decodeURIComponent(smilOnline.getQueryStringParameter("SPAppWebUrl"));
smilOnline.hostWebUrl = decodeURIComponent(smilOnline.getQueryStringParameter("SPHostUrl"));
smilOnline.baseServiceUrl = smilOnline.appWebUrl + "/_api/SP.AppContextSite(@target)";
smilOnline.serverRelativeUrl = smilOnline.hostWebUrl.substring(smilOnline.hostWebUrl.indexOf('/sites'));

smilOnline.initMap = function () {

    var windowResize = function () {
        var configWidgetDelta = jQuery("#configWidget").height();
        var windowHeightCenter = jQuery(window).height() / 2;
        var top = Math.ceil(windowHeightCenter - configWidgetDelta);
        jQuery("#configWidget").css("top", top);
    };

    $(document).ready(function () {
        windowResize();
        var requestDigest = jQuery("#__REQUESTDIGEST").val();
        jQuery.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('ACCEPT', 'application/json;odata=verbose');
                xhr.setRequestHeader("X-RequestDigest", requestDigest);
            }
        });

        var configuration = smilOnline.ensureConfiguration(1);
        configuration.done(function (config) {
            var mapOptions = smilOnline.configParser.getMapOptions(config);
            var mapContainer = jQuery("#map")[0];
            smilOnline.map = new Microsoft.Maps.Map(mapContainer, mapOptions);
            var loadLayers = smilOnline.layers.load();
            loadLayers.done(function (layers) {
                console.log(layers);
            });
        });

        jQuery(window).resize(windowResize);
    });
}();