'use strict';

var smilOnline = smilOnline || {};

smilOnline.layerWidget = function () {

    var initLayerWidget = function (layers) {
        layers.forEach(function (layer) {
            var postFixId = smilOnline.common.getGuid();
            var elemId = "chkbox_" + postFixId;
            jQuery('<li><input type="checkbox" value="' + layer.Title + '" id="chkbox_' + postFixId + '" />'
                + '<a href="#"><label for="' + elemId + '">' + layer.Title + '</a></label></li>').appendTo("#spLayersList > ul");

            plotGeometries(layer);

        });
        jQuery("#spLayersList > ul > li").on("change", function (evt) {
            for (var i = 0; i < smilOnline.map.entities.getLength() ; i++) {
                var entity = smilOnline.map.entities.get(i);
                var attributes = entity.getAttributes();
                var layerName = attributes.layerName || "";
                if (layerName === evt.target.value) {
                    entity.setOptions({ visible: evt.target.checked });
                }
                smilOnline.customInfobox.hide();
            }
        });
        jQuery("#layerWidgetIcon").removeClass();
        jQuery("#layerWidgetIcon").addClass("fa fa-chevron-down fa-1");

        jQuery("#layerWidgetHeadline").on("click", toggleLayerWidget);
        jQuery("#layerWidgetIcon").on("click", toggleLayerWidget);

        jQuery("#layerAdminToolbar").show();

        jQuery("#layerAdminToolbar > i").on("click", showNoneSmilLayers);

        jQuery("#addLayerCancelButton").on("click", showMap);

        jQuery("#addLayerButton").on("click", addLayer);

    };

    var addLayer = function(evt){
        var layerName = jQuery("#addToListNameId").html();
        evt.preventDefault();

        jQuery("#confirmationWidget").hide();
        jQuery("#workingWidget").show();

        
        smilOnline.layers.addFieldToList(layerName).done(function () {
            
            smilOnline.layers.updateForms(layerName).done(function () {
                jQuery("#workingWidget").hide();
                jQuery("#cover").hide();
                document.location.href = document.location.href;
            });
        });
    };
    
    var showMap = function (evt) {
        jQuery("#confirmationWidget").hide();
        jQuery("#cover").hide();
        evt.preventDefault();
    };

    var showNoneSmilLayers = function () {
        var lists = smilOnline.layers.noneGeoLists;
        if (jQuery("#layerAdminLayerList > ul > li").length === 0) {
            lists.forEach(function (list) {
                jQuery('<li style="margin: 3px;" title="Press + to geo-enable list"><i class="fa fa-plus"></i><span style="padding-left: 4px;">' + list + '</span></li>').appendTo("#layerAdminLayerList > ul");
            });
            jQuery("#layerAdminToolbar > i").removeClass("fa fa-chevron-right fa-1").addClass("fa fa-chevron-down fa-1");
            jQuery("#layerAdminLayerList > ul > li > i").on("click", function (evt) {
                jQuery("#cover").show();
                jQuery("#configWidget").hide();
                jQuery("#confirmationWidget").show();
                var listName = $(evt.target).next().html();
                jQuery("#addToListNameId").html(listName);
            });
               
            return;
        }

        var isVisible = jQuery("#layerAdminLayerList > ul").is(":visible");
        if (isVisible) {
            jQuery("#layerAdminLayerList").hide();
            jQuery("#layerAdminToolbar > i").removeClass("fa fa-chevron-down fa-1").addClass("fa fa-chevron-right fa-1");
        } else {
            jQuery("#layerAdminLayerList").show();
            jQuery("#layerAdminToolbar > i").removeClass("fa fa-chevron-right fa-1").addClass("fa fa-chevron-down fa-1");
        }
    };

    var toggleLayerWidget = function () {
        var isVisible = jQuery("#spLayersList > ul").is(":visible");
        if (isVisible) {
            jQuery(layerWidgetIcon).removeClass();
            jQuery(layerWidgetIcon).addClass("fa fa-chevron-right fa-1");
            jQuery("#spLayersList > ul").hide();
        } else {
            jQuery(layerWidgetIcon).removeClass();
            jQuery(layerWidgetIcon).addClass("fa fa-chevron-down fa-1");
            jQuery("#spLayersList > ul").show();
        }
    };

    var plotGeometries = function (features) {
        features.geometries.forEach(function (feature) {
            var geom = getGeometry(feature.geometry);
            var geomOptions = {
                visible: false
            };
            geom.setOptions(geomOptions);
            geom.setAttributes({
                layerName: feature.attributes.Title,
                GUID: feature.attributes.GUID,
                id: feature.attributes.id
            });
            smilOnline.map.entities.push(geom);
            Microsoft.Maps.Events.addHandler(geom, 'mouseup', displayInfo);
        });
    };

    var displayInfo = function (evt) {
        var infoBoxPosition = smilOnline.map.getTargetCenter();
        var attributes = evt.target.getAttributes();
        var featureData = formatData(attributes);
        smilOnline.customInfobox.show(infoBoxPosition, featureData.segment);
        setItemUrl(featureData, attributes.id);
    };

    var setItemUrl = function (featureData) {
        var spinner = "#" + featureData.elemementID;
        jQuery(spinner).removeClass("fa fa-spinner fa-spin");
        var url = smilOnline.baseServiceUrl + "/web/lists/GetByTitle('" + featureData.listName + "')?$select=EntityTypeName,BaseTemplate&@target='" + smilOnline.hostWebUrl + "'";

        jQuery.ajax({
            url: url,
            dataType: 'json',
            context: featureData
        }).done(function (response) {
            jQuery(spinner).addClass("fa fa-external-link-square");

            var itemUrl = getItemUrl(response, featureData);
            jQuery(spinner).attr("data-itemUrl", itemUrl);
            jQuery(spinner).on("click", function (evt) {
                var url = jQuery(this).attr("data-itemUrl");
                window.open(url, "_blank");
            });
        });


    };

    var getItemUrl = function (response, featureData) {
        var itemUrl;
        if (response.d.BaseTemplate === 101 || response.d.BaseTemplate === 109) {
            var folderName = response.d.EntityTypeName;
            folderName = smilOnline.common.replaceInvalidChars(folderName);
            itemUrl = smilOnline.hostWebUrl + "/" + (folderName.replace("_x0020_", " ")) + "/Forms/DispForm.aspx?ID=" + featureData.id;
        }
        else {
            itemUrl = smilOnline.hostWebUrl + "/Lists/" + featureData.listName + "/DispForm.aspx?ID=" + featureData.id;
        }
        return itemUrl;
    };

    var formatData = function (featureData) {
        var elementId = "linkId_" + featureData.GUID;
        var segment = '<table style="margin: 1em;">';
        for (var p in featureData) {
            if (p !== "GUID") {
                segment += "<tr>";
                segment += "<td>" + p.toUpperCase() + "</td><td>" + featureData[p] + "</td>";
                segment += "</tr>";
            }
        }
        segment += "<tr><td></td>";
        segment += '<td><div id="' + elementId + '" style="float: right; color: blue;" class="fa fa-spinner fa-spin"></div></td>';
        segment += "</tr>";
        segment += "</table>";
        return { listName: featureData.layerName, segment: segment, elemementID: elementId, id: featureData.id };
    };

    var getGeometry = function (wkt) {
        var shape = WKTModule.Read(wkt);
        return shape;
    };

    return {
        initLayerWidget: initLayerWidget
    };
}();