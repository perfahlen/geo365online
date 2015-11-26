'use strict';

var geo365 = geo365 || {};

geo365.layers = function () {
    var siteLayers = [];

    var noneGeoLists = [];

    /*
    Gets layers from site
    */
    var fetchFromSite = function () {
        //var dfd = jQuery.Deferred();
        var url = geo365.baseServiceUrl + "/web/lists?$expand=Fields&@target='" + geo365.hostWebUrl + "'";
        jQuery.ajax({
            url: url,
            dataType: 'json'
        }).done(function (response) {
            var geomLists = [];
            response.d.results.forEach(function (list) {
                var geometryFields = list.Fields.results.filter(function (field) {
                    return field.Title == "Geometry";
                });

                if (geometryFields.length === 1) {
                    geomLists.push({
                        Title: list.Title,
                        geometryField: true,
                        geometries: []
                    });
                } else {
                    noneGeoLists.push(list.Title);
                }
            });

            siteLayers = geomLists.slice();

            if (geomLists.length > 0) {
                var geoms = getGeometries(geomLists);
                geoms.done(function () {
                    geo365.layerWidget.initLayerWidget(siteLayers);
                });
            } else {
                geo365.layerWidget.initLayerWidget(siteLayers);
            }
        });
    };

    /*
    Loads geometries from site
    */
    var getGeometries = function (layers, dfd) {
        if (!dfd) {
            dfd = jQuery.Deferred();
        }

        var currentLayer = layers.pop();
        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + currentLayer.Title + "')/items?@target='" + geo365.hostWebUrl + "'";
        jQuery.ajax({
            url: url,
            dataType: 'json',
            context: dfd
        }).done(function (response) {
            var siteLayer = siteLayers.filter(function (s) {
                return s.Title === currentLayer.Title;
            })[0];

            response.d.results.forEach(function (item) {
                if (item.Geometry) {
                    var metaData = {};
                    metaData.attributes = {};
                    var metaData = {
                        geometry: item.Geometry,
                        attributes: {
                            id: item.ID,
                            GUID: item.GUID,
                            Title: siteLayer.Title
                        }
                    };
                    siteLayer.geometries.push(metaData);
                }
            });

            if (layers.length > 0) {
                getGeometries(layers, dfd);
            }
            else {
                dfd.resolve();
            }
        });

        return dfd.promise();
    };

    var addFieldToList = function (listName) {
        var dfd = jQuery.Deferred();

        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + listName + "')/fields?@target='" + geo365.hostWebUrl + "'";
        var data = { __metadata: { type: "SP.Field" }, Title: "Geometry", FieldTypeKind: 3 };
        var requestDigest = jQuery("#__REQUESTDIGEST").val();
        jQuery.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json;odata=verbose",
            headers: {
                "X-RequestDigest": requestDigest,
                "Accept": "application/json; odata=verbose"
            },
            success: function (response) {
                getDefautView(listName).done(function (viewName) {
                    updateDefaultView(listName, viewName.Title).done(function () {
                        addJSLinkToView(listName, viewName.Title).done(function () {
                            dfd.resolve();
                        })
                    })
                })
            },
            error: function (response) {

            }
        });
        return dfd.promise();
    };

    var getDefautView = function (listName) {
        var dfd = jQuery.Deferred();

        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + listName + "')/views?@target='" + geo365.hostWebUrl + "'";
        var requestDigest = jQuery("#__REQUESTDIGEST").val();
        jQuery.ajax({
            url: url,
            contentType: "application/json;odata=verbose",
            headers: {
                "X-RequestDigest": requestDigest,
                "Accept": "application/json; odata=verbose"
            },
            success: function (response) {
                var defaultView = response.d.results.filter(function (view) {
                    return view.DefaultView;
                })[0];

                dfd.resolve(defaultView);
            }
        });

        return dfd.promise();
    };

    var updateDefaultView = function (listName, viewName) {
        var dfd = jQuery.Deferred();
        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + listName + "')/views/getbytitle('" + viewName + "')/ViewFields/AddViewField('Geometry')?@target='" + geo365.hostWebUrl + "'";
        var requestDigest = jQuery("#__REQUESTDIGEST").val();
        jQuery.ajax({
            url: url,
            contentType: "application/json;odata=verbose",
            type: "POST",
            headers: {
                "X-RequestDigest": requestDigest,
                "Accept": "application/json; odata=verbose"
            },
            success: function (response) {
                //var defaultView = response.d.results.filter(function (view) {
                //    return view.DefaultView;
                //})[0];

                dfd.resolve();
            },
            error: function (response) {
                console.log(response);
            }
        });
        return dfd.promise();
    };

    var addJSLinkToView = function (listName, viewName) {
        var dfd = jQuery.Deferred();

        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + listName + "')/views/getbytitle('" + viewName + "')?@target='" + geo365.hostWebUrl + "'";
        var requestDigest = jQuery("#__REQUESTDIGEST").val();

        var data = { __metadata: { type: 'SP.View' }, JSLink: "~site/geo365Assets/geo365Map.js" }

        jQuery.ajax({
            url: url,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(data),
            headers: {
                "X-RequestDigest": requestDigest,
                "Accept": "application/json; odata=verbose",
                "X-HTTP-Method": "MERGE",
            },
            success: function (response) {
                dfd.resolve();
                //var defaultView = response.d.results.filter(function (view) {
                //    return view.DefaultView;
                //})[0];

                //dfd.resolve(defaultView);
            },
            error: function (response) {
                console.log(response);
            }
        });
        return dfd.promise();
    };

    var updateForms = function (listName) {
        var dfd = jQuery.Deferred();


        var url = geo365.baseServiceUrl + "/web/lists/GetByTitle('" + listName + "')/Forms?$select=ServerRelativeUrl&@target='" + geo365.hostWebUrl + "'";

        jQuery.ajax({
            url: url,
            contentType: "application/json;odata=verbose",
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function (response) {
                processForms(listName, response.d.results).done(function () {
                    dfd.resolve();
                });
            },
            error: function (response) {
                console.log(response);
            }
        });
        return dfd.promise();
    };

    var processForms = function (listName, forms, dfd) {
        if (!dfd) {
            dfd = jQuery.Deferred();
        }

        var form = forms.pop();
        setFormJSLink(listName, form, dfd).done(function () {
            if (forms.length > 0) {
                processForms(listName, forms, dfd);
            } else {
                dfd.resolve();
            }
        });
        return dfd.promise();
    };

    var setFormJSLink = function (listName, form) {
        var dfd = jQuery.Deferred();

        var validForms = ["EditForm.aspx", "DispForm.aspx", "NewForm.aspx"];
        var isValidForm = validForms.filter(function (validForm) {
            var idx = form.ServerRelativeUrl.indexOf(validForm);
            return idx > -1;
        }).length > 0;

        if (!isValidForm) {
            dfd.resolve();
        }
        else {
            var url = geo365.baseServiceUrl + "/web/GetFileByServerRelativeUrl('" + form.ServerRelativeUrl + "')/GetLimitedWebPartManager(scope=1)/WebParts?$expand=WebPart&@target='" + geo365.hostWebUrl + "'";

            jQuery.ajax({
                url: url,
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function (response) {
                    var forDfd = new JSLink_CSOM(response.d.results[0].Id, form.ServerRelativeUrl, dfd);
                    forDfd.done(function () {
                        dfd.resolve(response);
                    });
                }
            });
        }
        return dfd.promise();
    };

    return {
        load: fetchFromSite,
        noneGeoLists: noneGeoLists,
        addFieldToList: addFieldToList,
        getDefautView: getDefautView,
        updateDefaultView: updateDefaultView,
        addJSLinkToView: addJSLinkToView,
        updateForms: updateForms
    };
}();