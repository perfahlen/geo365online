'use strict';

var geo365 = geo365 || {};

geo365.ensureConfiguration = function (tryAttempt) {
    var configDfd = jQuery.Deferred();
    var url = geo365.baseServiceUrl + "/web/getfilebyserverrelativeurl('" + geo365.serverRelativeUrl + "/geo365Assets/geo365.jsn')/$value?@target='" + geo365.hostWebUrl + "'";
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
        var url = geo365.baseServiceUrl + "/web/GetFolderByServerRelativeUrl('" + geo365.serverRelativeUrl + "/geo365Assets')?@target='" + geo365.hostWebUrl + "'";
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
        var url = geo365.baseServiceUrl + "/web/lists?@target='" + geo365.hostWebUrl + "'";

        var postObj = {
            __metadata: { type: 'SP.List' },
            BaseTemplate: 101,
            Description: 'List for geo365 assets',
            Title: 'geo365Assets'
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
        jQuery("#info").show();
        jQuery("#infoOK").on("click", function () {
            jQuery("#info").hide();
            jQuery("#cover").show();
        });

        jQuery("#confirmConfigButton").on("click", function () {
            var config = new geo365.config();
            var currentConfig = config.getFormConfiguration();
            var url = geo365.baseServiceUrl + "/web/getfolderbyserverrelativeurl('" + geo365.serverRelativeUrl + "/geo365Assets')/files/add(overwrite=true,url='geo365.jsn')?@target='" + geo365.hostWebUrl + "'";

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
            var deployToSP = new geo365.deployToSP();
            var deployDfd = deployToSP.deploy();
            deployDfd.done(function () {
                var configFile = createConfigFile();
                configFile.done(function () {
                    var deployToSP = new geo365.deployToSP();
                    var deployDfd = deployToSP.deploy();
                    attempt += 1;
                    geo365.ensureConfiguration(attempt);
                });
            });
        });

        return dfd.promise();
    };

    return configDfd.promise();

};