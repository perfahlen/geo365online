var smilOnline = smilOnline || {};

// is this really needed
smilOnline.getQueryStringParameter = function (param) {
    var params = document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i++) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == param)
            return singleParam[1];
    }
};

smilOnline.loadScript = function (url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.body.appendChild(script);
};


document.onreadystatechange = function () {
    var state = document.readyState;
    if (state == 'complete') {
        smilOnline.loadScript('http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0', function loadBingMaps() {
            smilOnline.bingMaps = true;
            smilOnline.loadScript('/_layouts/15/OpenSMIL/js/libs/jquery-1-10-2-min.js', function wktLoaded() {
                smilOnline.WKT = true;
                setTimeout(function () {
                    smilOnline.loadScript('/_layouts/15/OpenSMIL/js/libs/WKTModule-min.js', function jqueryLoad() {
                        smilOnline.jquery = true;
                        smilOnline.loadBingKey();
                        smilOnline.createEditMap();
                    });
                }, 500);
            });
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