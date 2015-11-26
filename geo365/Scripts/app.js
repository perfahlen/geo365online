'use strict';

var geo365 = geo365 || {};

geo365.getQueryStringParameter = function (param) {
    var params = document.URL.split("?")[1].split("&");

    for (var i = 0; i < params.length; i++) {
        var currentParam = params[i].split("=");
        if (currentParam[0] == param)
            return currentParam[1];
    }
};

geo365.appWebUrl = decodeURIComponent(geo365.getQueryStringParameter("SPAppWebUrl"));
geo365.hostWebUrl = decodeURIComponent(geo365.getQueryStringParameter("SPHostUrl"));
geo365.baseServiceUrl = geo365.appWebUrl + "/_api/SP.AppContextSite(@target)";
geo365.serverRelativeUrl = "";

//geo365.serverRelativeUrl = geo365.hostWebUrl.substring(geo365.hostWebUrl.indexOf('/sites'));

geo365.initMap = function () {

    var windowResize = function () {
        var configWidgetDelta = jQuery("#configWidget").height();
        var windowHeightCenter = jQuery(window).height() / 2;
        var top = Math.ceil(windowHeightCenter - configWidgetDelta);
        jQuery("#configWidget").css("top", top);
        jQuery("#confirmationWidget").css("top", top);
        jQuery("#workingWidget").css("top", top);
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

        jQuery.ajax({
            url: geo365.baseServiceUrl + "/web/serverRelativeUrl?@target='" + geo365.hostWebUrl + "'",
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }).done(function (response) {
            geo365.serverRelativeUrl = response.d.ServerRelativeUrl;

            var configuration = geo365.ensureConfiguration(1);
            configuration.done(function (config) {
                var mapOptions = geo365.configParser.getMapOptions(config);
                var mapContainer = jQuery("#map")[0];
                geo365.map = new Microsoft.Maps.Map(mapContainer, mapOptions);
                Microsoft.Maps.registerModule("WKTModule", "../Scripts/libs/WKTModule-min.js");
                Microsoft.Maps.loadModule("WKTModule");

                Microsoft.Maps.registerModule("CustomInfoboxModule", "../Scripts/libs/V7CustomInfobox.min.js");
                Microsoft.Maps.loadModule("CustomInfoboxModule", {
                    callback: function () {
                        geo365.customInfobox = new CustomInfobox(geo365.map);
                    }
                });

                geo365.layers.load();

            });
        });

        jQuery(window).resize(windowResize);
    });
}();