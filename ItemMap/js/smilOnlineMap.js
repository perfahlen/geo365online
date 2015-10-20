var smilOnline = smilOnline || {};

var guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
    };
})();

var smilOnline = function () {

    var siteUrl = function () {
        var url = document.location.origin + SP.ClientContext.get_current().get_url();
        return url;
    };

    var loadConfig = function (callback) {
        var req = new XMLHttpRequest();
        var requestUrl = siteUrl() + "/SmilOnlineAssets/smilOnline.jsn";
        req.open("GET", requestUrl);

        req.setRequestHeader("accept", "application/json; odata=verbose");
        req.onreadystatechange = function () {
            if (req.readyState == req.DONE) {
                var config = JSON.parse(req.response);
                callback(config);
            }
        }
        req.send();

    };

    var registerEditFormCallBack = function (formContext) {
        var element = document.getElementById(formContext.fieldSchema.Id + '_' + formContext.fieldName);
        var val = element.value;
        return val;
    };

    // is this really needed
    var getQueryStringParameter = function (param) {
        var params = document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i++) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == param)
                return singleParam[1];
        }
    };

    var displayForm = function (ctx) {
        smilOnline.state = "view";
        var mapElem = createMapElement(ctx);
        return mapElem;
    };

    var editForm = function (ctx) {
        smilOnline.state = "edit";
        var geoElem = createToolbar();
        geoElem += createMapElement(ctx);
        return geoElem;
    };

    var createToolbar = function () {
        var elemID = this.guid();
        var elem = '<div id="' + elemID + '"></div>';
        return elem;
    };

    var createMapElement = function (ctx) {
        var elemID = this.guid();
        var geom = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
        if (geom === '') {
            return '<span></span>';
        }
        var guid = this.guid();

        var elem = geom;
        elem += '<div style="height: 400px; width: 400px; position: relative;" id="' + elemID + '"></div>';
        smilOnline.renderElemId = elemID;
        return elem;
    };

    renderMap = function () {
        var intervalId = setInterval(function () {
            if (smilOnline.bingMaps && Microsoft && Microsoft.Maps && Microsoft.Maps.Map) {

                clearInterval(intervalId);
                loadConfig(function (config) {
                    var mapOptions = smilOnline.configParser.getMapOptions(config);
                    switch (smilOnline.state) {
                        case "edit":
                            loadModule("wkt", function () {
                                loadModule("drawingtools", function () {
                                    renderEditMap(mapOptions);
                                });
                            });

                            break;
                        case "new":
                            renderNewMap(mapOptions);
                            break;
                        case "list":
                            renderListMap(mapOptions);
                            break;
                        default:
                            loadModule("wkt", function () {
                                renderViewMap(mapOptions);
                            });
                            break;
                    }
                });
            }
        }, 50);
    };


    renderViewMap = function (mapOptions) {
        var elem = document.getElementById(smilOnline.renderElemId);
        smilOnline.map = new Microsoft.Maps.Map(elem, mapOptions);
        var wktValue = elem.previousSibling.innerHTML;
        elem.previousSibling.style.display = "none";
        var geom = WKTModule.Read(wktValue);
        smilOnline.map.entities.push(geom);
        zoomToEntity(geom);
    };

    zoomToEntity = function (entity) {
        var locations = getLocations(entity);
        if (locations.length > 0) {
            var locationRect = Microsoft.Maps.LocationRect.fromLocations(locations);
            smilOnline.map.setView({ bounds: locationRect });
        }
    };

    getLocations = function (entity) {
        var locations = [];

        if (entity instanceof Microsoft.Maps.Pushpin) {
            var location = entity.getLocation();
            locations.push(location);
        }
        return locations;
    };

    renderNewMap = function () {
        var elem = document.getElementById(smilOnline.renderElemId);
    };

    renderEditMap = function (mapOptions) {
        var elem = document.getElementById(smilOnline.renderElemId);
        smilOnline.map = new Microsoft.Maps.Map(elem, mapOptions);
        var wktValue = elem.previousSibling;
        var geom = WKTModule.Read(wktValue.data);
        wktValue.remove();
        smilOnline.map.entities.push(geom);
        zoomToEntity(geom);

        var toolbarID = elem.parentNode.firstElementChild.id;
        debugger;
        var drawingTools = new DrawingTools.DrawingManager(smilOnline.map);
    };

    //refactor to be able to send in module[]
    loadModule = function (module, callback) {

        if (module === "wkt") {
            Microsoft.Maps.registerModule("WKTModule", (smilOnline.getSiteUrl() + "/SmilOnlineAssets/WKTModule-min.js"));
            Microsoft.Maps.loadModule("WKTModule", {
                callback: function () {
                    callback();
                }
            });
        }
        else if (module === "drawingtools") {
            Microsoft.Maps.registerModule("DrawingToolsModule", (smilOnline.getSiteUrl() + "/SmilOnlineAssets/DrawingToolsModule.js"));
            Microsoft.Maps.loadModule("DrawingToolsModule", {
                callback: function () {
                    callback();
                }
            });
        }
    };

    var addScript = function (urls, callback) {

        var processQueue = function (urls) {
            urls.length === 0 ? callback() : addScript(urls, callback);
        };

        var url = urls.pop();

        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") { //IE will hit here
                    script.onreadystatechange = null;
                    processQueue(urls);
                }
            };
        } else {
            script.onload = function () {//chrome will hit here
                processQueue(urls);
            };
        }
        script.src = url;
        document.body.appendChild(script);
    };

    return {
        addScript: addScript,
        displayForm: displayForm,
        editForm: editForm,
        renderMap: renderMap,
        getSiteUrl: siteUrl
    };

}();


document.onreadystatechange = function () {
    var state = document.readyState;
    if (state == 'complete') {
        var scriptsToAdd = ["http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0",
                           (smilOnline.getSiteUrl() + "/SmilOnlineAssets/config.js"),
                           (smilOnline.getSiteUrl() + "/SmilOnlineAssets/configParser.js")];

        smilOnline.addScript(scriptsToAdd, function scriptsLoaded() {
            smilOnline.bingMaps = true;
            smilOnline.renderMap();
        });
    }
};

(function () {

    var geometryContext = {};
    geometryContext.Templates = {};
    geometryContext.Templates.Fields = {
        'Geometry': {
            'View': smilOnline.viewList,
            'DisplayForm': smilOnline.displayForm,
            'EditForm': smilOnline.editForm,
            'NewForm': smilOnline.newForm
        }
    };

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(
        geometryContext
    );
})();