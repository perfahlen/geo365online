'use strict';

var smilOnline = smilOnline || {};

smilOnline.ensureConfiguration = function (tryAttempt) {
    var configDfd = jQuery.Deferred();
    var url = smilOnline.baseServiceUrl + "/web/getfilebyserverrelativeurl('" + smilOnline.serverRelativeUrl + "/assets/smilOnline.jsn')/$value?@target='" + smilOnline.hostWebUrl + "'";
    jQuery.ajax({
        url: url,
        dataType: "json"
    }).done(function (config) {
        configDfd.resolve(config);
    }).fail(function (response) {
        ensureConfigFile(tryAttempt);
    });

    var ensureConfigFolder = function () {

        //assume folder name assets
        var dfd = jQuery.Deferred();
        var folderExist = folderExists();
        folderExist.done(function (folderCreated) {
            if (!folderCreated) {
                var createConfigFolder = createFolder();
                createConfigFolder.done(function (response) {
                    dfd.resolve(true);
                });
            }
            else {
                dfd.resolve(true);
            }
        });
        return dfd.promise();
    };

    var folderExists = function () {
        var url = smilOnline.baseServiceUrl + "/web/GetFolderByServerRelativeUrl('" + smilOnline.serverRelativeUrl + "/assets')?@target='" + smilOnline.hostWebUrl + "'";
        var dfd = jQuery.Deferred();
        jQuery.ajax({
            url: url,
            dataType: 'json'
        }).done(function (response) {
            dfd.resolve(true);
        }).fail(function (response) {
            dfd.resolve(false);
        });
        return dfd.promise();
    };

    var createFolder = function () {
        var dfd = jQuery.Deferred();
        var url = smilOnline.baseServiceUrl + "/web/lists?@target='" + smilOnline.hostWebUrl + "'";

        var postObj = {
            __metadata: { type: 'SP.List' },
            BaseTemplate: 101,
            Description: 'List for smilonline assets',
            Title: 'assets'
        };

        var dataToSend = JSON.stringify(postObj);

        jQuery.ajax({
            url: url,
            contentType: "application/json;odata=verbose",
            dataType: "json",
            data: dataToSend,
            type: "POST",

        }).done(function (response) {
            dfd.resolve(true);
        }).fail(function () {
            // what will happened if this is happens, just prompt the user?
        });
        return dfd.promise();
    };

    var createConfigFile = function () {
        var dfd = jQuery.Deferred();
        jQuery("#cover").show();
        jQuery("#confirmConfigButton").on("click", function () {
            var config = new smilOnline.config();
            var currentConfig = config.getFormConfiguration();
            var url = smilOnline.baseServiceUrl + "/web/getfolderbyserverrelativeurl('" + smilOnline.serverRelativeUrl + "/assets')/files/add(overwrite=true,url='smilOnline.jsn')?@target='" + smilOnline.hostWebUrl + "'";

            var data = JSON.stringify(currentConfig);

            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: 'json',
                data: data
            }).done(function (response) {
                dfd.resolve(true);
            }).fail(function (response) {
                console.log(response);
            });
        });
        return dfd.promise();
    };

    var ensureConfigFile = function (attempt) {

        var dfd = jQuery.Deferred();
        var ensuredConfigFolder = ensureConfigFolder();

        ensuredConfigFolder.done(function () {
            var configFile = createConfigFile();
            configFile.done(function () {
                attempt += 1;
                smilOnline.ensureConfiguration(attempt);
            });
        });

        return dfd.promise();
    };


    return configDfd.promise();

};