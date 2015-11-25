smilOnline.deployToSP = (function () {

    var jsFiles = ["smilOnlineMap.js", "config.js", "configParser.js", "libs/DrawingToolsModule.js", "libs/WKTModule-min.js"];
    var imageFiles = ["DrawingTools_ToolbarIcons.png", "marker.png", "polygon.png", "polyline.png"];
    var cssFiles = ["DrawingTools.css"];

    var cTor = function () {
        
    };

    cTor.prototype.deploy = function () {
        var deployCss = function () {
            var copyTextFilesDfd = copyTextFiles("/Content/", cssFiles);
            copyTextFilesDfd.done(function () {
                
            });
        };

        var deployJS = function () {
            var copyTextFilesDfd = copyTextFiles("/Scripts/", jsFiles);
            copyTextFilesDfd.done(function () {
                deployCss();
            });
        };

        deployJS();
        
    };

    var copyTextFiles = function (prefix, array, dfd) {
        if (!dfd) {
            dfd = jQuery.Deferred();
        }
        var fileToCopy = prefix + array.pop();

        doCopy(fileToCopy).done(function () {
            if (jsFiles.length > 0) {
                copyTextFiles(prefix, array, dfd);
            } else {
                dfd.resolve();
            }
        });

        return dfd;
    };

    var copyImages = function () {
        var fileToCopy = imageFiles.pop();
    };

    var doCopy = function (fileToCopy) {
        var dfd = jQuery.Deferred();
        var sourceDfd = getTextSource(fileToCopy);
        sourceDfd.done(function (data) {
            var copyToDfd = copyTo(data, fileToCopy);
            copyToDfd.done(function () {
                dfd.resolve();
            });
        });
        return dfd.promise();
    };

    var getTextSource = function (fileName) {
        var dfd = jQuery.Deferred();
        var fileUrl = decodeURIComponent(smilOnline.getQueryStringParameter("SPAppWebUrl"));

        fileUrl += fileName;
        console.log(fileUrl);

        jQuery.ajax({
            url: fileUrl,
            dataType: "text"
        }).done(function (content) {
            dfd.resolve(content);
        });

        return dfd.promise();
    };

    var copyTo = function (fileContent, destinationName) {
        var dfd = jQuery.Deferred();
        var pathPieces = destinationName.split("/");
        destinationName = pathPieces[pathPieces.length - 1]; // destinationName.replace("libs/", "");
        var url = smilOnline.baseServiceUrl + "/web/getfolderbyserverrelativeurl('" + smilOnline.serverRelativeUrl + "/SmilOnlineAssets')/files/add(overwrite=true,url='" + destinationName + "')?@target='" + smilOnline.hostWebUrl + "'";

        jQuery.ajax({
            url: url,
            type: "POST",
            //dataType: 'json',
            data: fileContent
        }).done(function (response) {
            dfd.resolve();
        }).fail(function (response) {
            console.log(response);
            dfd.fail();
        });
        return dfd.promise();
    };

    return cTor;

})();