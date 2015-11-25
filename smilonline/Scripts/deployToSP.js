smilOnline.deployToSP = (function () {

    var jsFiles = ["smilOnlineMap.js", "config.js", "configParser.js", "libs/DrawingToolsModule.js", "libs/WKTModule-min.js"];
    var imageFiles = ["DrawingTools_ToolbarIcons.png", "marker.png", "polygon.png", "polyline.png"];
    var cssFiles = ["DrawingTools.css"];

    var cTor = function () {
        
    };

    cTor.prototype.deploy = function () {
        var dfd = jQuery.Deferred();
        var deployImages = function () {
            var copyImagesDfd = copyImages();
            copyImagesDfd.done(function () {
                dfd.resolve();
            });
        };

        var deployCss = function () {
            var copyCssFilesDfd = copyTextFiles("/Content/", cssFiles);
            copyCssFilesDfd.done(function () {
                deployImages();
            });
        };

        var deployJS = function () {
            var copyJsFilesDfd = copyTextFiles("/Scripts/", jsFiles);
            copyJsFilesDfd.done(function () {
                deployCss();
            });
        };
        deployJS();

        return dfd;
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

    var copyImages = function (dfd) {
        if (!dfd) {
            dfd = jQuery.Deferred();
        }
        var fileToCopy = imageFiles.pop();
        var fileUrl = decodeURIComponent(smilOnline.getQueryStringParameter("SPAppWebUrl"));
        fileUrl += "/Images/" + fileToCopy;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var uploadBlobDfd = uploadBlob(this.response, fileToCopy);
                uploadBlobDfd.dfd = this.dfd;
                uploadBlobDfd.done(function () {
                    if (imageFiles.length > 0) {
                        copyImages(this.dfd);
                    } else {
                        this.dfd.resolve();
                    }
                });
            }
        }
        xhr.dfd = dfd;
        xhr.open('GET', fileUrl);
        xhr.responseType = 'blob';
        xhr.send();

        return dfd.promise();
    };

    var uploadBlob = function (blob, destinationName) {
        var dfd = jQuery.Deferred();
        var reader = new FileReader();
        reader.onload = function (evt) {
            if (evt.target.readyState === FileReader.DONE) {
                var self = this;
                var content = evt.target.result;
                var url = smilOnline.baseServiceUrl + "/web/getfolderbyserverrelativeurl('" + smilOnline.serverRelativeUrl + "/SmilOnlineAssets')/files/add(overwrite=true,url='" + this.destinationName + "')?@target='" + smilOnline.hostWebUrl + "'";
                var digest = jQuery("#__REQUESTDIGEST").val();
                jQuery.ajax({
                    url: url,
                    type: "POST",
                    data: content,
                    processData: false,
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "X-RequestDigest": digest
                    }
                }).done(function () {
                    self.dfd.resolve();
                });
            }
        };
        reader.destinationName = destinationName;
        reader.dfd = dfd;
        reader.readAsArrayBuffer(blob);
        return dfd.promise();
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