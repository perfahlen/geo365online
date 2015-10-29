'use strict';

var smilOnline = smilOnline || {};

smilOnline.layers = function () {
    var siteLayers = [];

    var noneGeoLists = [];

    /*
    Gets layers from site
    */
    var fetchFromSite = function () {
        //var dfd = jQuery.Deferred();
        var url = smilOnline.baseServiceUrl + "/web/lists?$expand=Fields&@target='" + smilOnline.hostWebUrl + "'";
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

            var geoms = getGeometries(geomLists);
            geoms.done(function () {
                smilOnline.layerWidget.initLayerWidget(siteLayers);
            });
        });
    };

    /*
    Loads geometries from site
    */
    var getGeometries = function (layers, dfd) {
        if (!dfd) {
            var dfd = jQuery.Deferred();
        }
        var currentLayer = layers.pop();
        var url = smilOnline.baseServiceUrl + "/web/lists/GetByTitle('" + currentLayer.Title + "')/items?@target='" + smilOnline.hostWebUrl + "'";
        jQuery.ajax({
            url: url,
            dataType: 'json',
            context: dfd
        }).done(function (response) {
            var siteLayer = siteLayers.filter(function(s){
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
        console.log(listName);
    };

    return {
        load: fetchFromSite,
        noneGeoLists: noneGeoLists,
        addFieldToList: addFieldToList
    };
}();