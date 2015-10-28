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
        var url = _spPageContextInfo.webAbsoluteUrl;
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

    var getQueryStringParameter = function (param) {
        var params = document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i++) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == param)
                return singleParam[1];
        }
    };

    var registerEditFormCallBack = function (formContext) {
        var element = document.getElementById(formContext.fieldSchema.Id + '_' + formContext.fieldName);
        var val = element.value;
        return val;
    };

    var viewList = function (ctx) {
        smilOnline.state = "list";
        var list = ctx.ListTitle;
        var geom = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
        if (geom && geom != '') {
            var image = /point/i.test(geom) ? (smilOnline.getSiteUrl() + "/SmilOnlineAssets/marker.png") : /polygon/i.test(geom) ?
                (smilOnline.getSiteUrl() + "/SmilOnlineAssets/polygon.png") : (smilOnline.getSiteUrl() + "/SmilOnlineAssets/polyline.png");
            return '<img data-geom="' + geom + '" src="' + image + '"style="position: relative; left : 40%;" onmouseover="smilOnline.displayListMap(this);" />';
        }
        return '<span></span>';
    };

    var displayListMap = function (elem) {
        var top = elem.offsetTop;
        var left = elem.offsetLeft;
        var mapContainer = document.createElement("div");
        var attributeValue = "border: solid 1px lightGray; position: fixed; height: 300px; width: 300px; z-index: 10000; background-color: red; left:" + left + "px; top: " + top + "px;";
        mapContainer.setAttribute("style", attributeValue);
        mapContainer.setAttribute("onmouseleave", "document.body.removeChild(this);");
        document.body.appendChild(mapContainer);
        renderPreviewMap(elem, mapContainer);
    };

    var renderPreviewMap = function (sourceElem, renderElem) {
        var wkt = sourceElem.getAttribute("data-geom");
        var feature = WKTModule.Read(wkt);
        smilOnline.mapOptions.disableZooming = true;
        smilOnline.mapOptions.disablePanning = true;
        smilOnline.mapOptions.enableClickableLogo = false;
        smilOnline.mapOptions.enableSearchLogo = false;
        smilOnline.mapOptions.showDashboard = false;
        smilOnline.map = new Microsoft.Maps.Map(renderElem, smilOnline.mapOptions);
        zoomToEntity(feature);
        smilOnline.map.entities.push(feature);
    };
    
    var displayForm = function (ctx) {
        smilOnline.state = "view";
        var mapElem = createMapElement(ctx);
        return mapElem;
    };

    var newForm = function (ctx) {
        smilOnline.state = "new";
        var geoElem = createNewEditFormMap(ctx);
        geoElem += '<input type="text" id="' + smilOnline.geomTxtfieldId + '" style="visibility: visible;" />';
        return geoElem;
    };

    var editForm = function (ctx) {
        smilOnline.state = "edit";
        var geoElem = createNewEditFormMap(ctx);
        geoElem += '<input type="text" id="' + smilOnline.geomTxtfieldId + '" value="' + ctx.CurrentFieldValue + '" style="visibility: visible;" />';
        return geoElem;
    };

    var createNewEditFormMap = function (ctx) {
        var formContext = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
        formContext.registerGetValueCallback(formContext.fieldName, registerEditFormCallBack.bind(null, formContext));

        var geoElem = "";
        geoElem += createToolbar();
        geoElem += createMapElement(ctx);

        smilOnline.geomTxtfieldId = (formContext.fieldSchema.Id + '_' + formContext.fieldName);
        return geoElem;
    };

    var createToolbar = function () {
        var elemID = this.guid();
        var elem = '<div style="height: 34px; margin-bottom: 5px; width: 400px; position: relative; background-color: #FAF7F5" id="' + elemID + '"></div>';
        smilOnline.toolbarElementId = elemID;
        return elem;
    };

    var createMapElement = function (ctx) {
        var elemID = this.guid();
        var geom = ctx.CurrentFieldValue.replace('<div dir="">', "").replace("</div>", "");
        if (smilOnline.state === "edit" && geom === '') {
            return '<span></span>';
        }
        var elem = '<div data-geom="' + geom + '" style="height: 400px; width: 400px; position: relative;" id="' + elemID + '"></div>';
        smilOnline.renderElemId = elemID;
        return elem;
    };

    var renderMap = function () {
        var intervalId = setInterval(function () {
            if (smilOnline.bingMaps && Microsoft && Microsoft.Maps && Microsoft.Maps.Map) {

                clearInterval(intervalId);
                loadConfig(function (config) {
                    smilOnline.mapOptions = smilOnline.configParser.getMapOptions(config);
                    switch (smilOnline.state) {
                        case "edit":
                            loadModule("wkt", function () {
                                loadModule("drawingtools", function () {
                                    renderEditMap();
                                });
                            });

                            break;
                        case "new":
                            loadModule("wkt", function () {
                                loadModule("drawingtools", function () {
                                    renderEditMap();
                                });
                            });

                            break;
                        case "list":
                            loadModule("wkt"); //, function () { });
                            break;
                        default:
                            loadModule("wkt", function () {
                                renderViewMap();
                            });
                            break;
                    }
                });
            }
        }, 50);
    };


    var renderViewMap = function () {
        var elem = document.getElementById(smilOnline.renderElemId);
        smilOnline.map = new Microsoft.Maps.Map(elem, smilOnline.mapOptions);
        var wktValue = elem.getAttribute("data-geom");
        var geom = WKTModule.Read(wktValue);
        smilOnline.map.entities.push(geom);
        zoomToEntity(geom);
    };

    var zoomToEntity = function (entity) {
        var locations = getLocations(entity);
        if (locations.length === 1) {
            smilOnline.map.setView({center: locations[0], zoom: 13});
        }
        else if (locations.length > 1) {
            var locationRect = Microsoft.Maps.LocationRect.fromLocations(locations);
            smilOnline.map.setView({ bounds: locationRect });
        }
    };

    var getLocations = function (entity) {
        var locations = [];

        if (entity instanceof Microsoft.Maps.Pushpin) {
            var location = entity.getLocation();
            locations.push(location);
        }
        return locations;
    };

    var setDigitizerIcons = function () {
        var imageUrl = (smilOnline.getSiteUrl() + '/SmilOnlineAssets/DrawingTools_ToolbarIcons.png');

        var polyLineElem = document.getElementsByClassName("drawingToolsIcon_polyline")[0];
        polyLineElem.style.backgroundImage = 'url("' + imageUrl + '")';

        var pushpinElem = document.getElementsByClassName("drawingToolsIcon_pushpin")[0];
        pushpinElem.style.backgroundImage = 'url("' + imageUrl + '")';

        var polygonElem = document.getElementsByClassName("drawingToolsIcon_polygon")[0];
        polygonElem.style.backgroundImage = 'url("' + imageUrl + '")';

        var eraseElem = document.getElementsByClassName("drawingToolsIcon_erase")[0];
        eraseElem.style.backgroundImage = 'url("' + imageUrl + '")';

        var editElem = document.getElementsByClassName("drawingToolsIcon_edit")[0];
        editElem.style.backgroundImage = 'url("' + imageUrl + '")';

    };

    var renderEditMap = function () {
        var geom;

        var elem = document.getElementById(smilOnline.renderElemId);
        smilOnline.map = new Microsoft.Maps.Map(elem, smilOnline.mapOptions);


        if (smilOnline.state === "edit") {
            var wktValue = document.getElementById(smilOnline.geomTxtfieldId).value;
            var geom = WKTModule.Read(wktValue);
            zoomToEntity(geom);
        }
        setupToolbar(geom);
    };

    var setupToolbar = function (geom) {
        var toolbarElement = document.getElementById(smilOnline.toolbarElementId);
        Microsoft.Maps.loadModule("DrawingToolsModule", {
            callback: function () {
                drawingTools = new DrawingTools.DrawingManager(smilOnline.map, {
                    toolbarContainer: toolbarElement,
                    toolbarOptions: {
                        drawingModes: ['pushpin', 'polyline', 'polygon', 'edit', 'erase'],
                        styleTools: []
                    },
                    events: {
                        drawingEnded: function (feature) {
                            updateGeomTextField(feature);
                        },
                        drawingChanging: function (feature) {
                            updateGeomTextField(feature);
                        },
                        drawingChanged: function (feature) {
                            updateGeomTextField(feature);
                        },
                        drawingErased: function () {
                            var geoTextField = document.getElementById(smilOnline.geomTxtfieldId);
                            geoTextField.value = "";
                        }
                    }
                });

                setDigitizerIcons();
                if (smilOnline.state === "edit" && geom && geom != "") {
                    var drawingLayer = smilOnline.map.entities.get(0);
                    drawingLayer.push(geom);
                }
            }
        });
    };

    var updateGeomTextField = function (feature) {
        var geoTextField = document.getElementById(smilOnline.geomTxtfieldId);
        var wkt = WKTModule.Write(feature);
        geoTextField.value = wkt;
    };

    //refactor to be able to send in module[]
    var loadModule = function (module, callback) {

        if (module === "wkt") {
            Microsoft.Maps.registerModule("WKTModule", (smilOnline.getSiteUrl() + "/SmilOnlineAssets/WKTModule-min.js"));
            Microsoft.Maps.loadModule("WKTModule", {
                callback: function () {
                    if (callback) {
                        callback();
                    }
                }
            });
        }
        else if (module === "drawingtools") {
            Microsoft.Maps.registerModule("DrawingToolsModule", (smilOnline.getSiteUrl() + "/SmilOnlineAssets/DrawingToolsModule.js"));
            callback();
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

    addCss = function (url) {
        var css = document.createElement("link");
        css.type = "text/css";
        css.rel = "Stylesheet";
        css.href = (smilOnline.getSiteUrl() + "/SmilOnlineAssets/DrawingTools.css");

        document.body.appendChild(css);
    };

    return {
        addScript: addScript,
        displayForm: displayForm,
        editForm: editForm,
        newForm: newForm,
        viewList: viewList,
        renderMap: renderMap,
        getSiteUrl: siteUrl,
        addCss: addCss,
        displayListMap: displayListMap
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
        smilOnline.addCss();
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