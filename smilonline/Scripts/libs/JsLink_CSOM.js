var JSLink_CSOM = (function () {

    var cTor = function (wpId, pagePath, dfd) {
        if (!dfd) {
            dfd = jQuery.Deferred();
        }

        var ctx = new SP.ClientContext(smilOnline.appWebUrl);
        var factory = new SP.ProxyWebRequestExecutorFactory(smilOnline.appWebUrl);
        ctx.set_webRequestExecutorFactory(factory);
        var appContextSite = new SP.AppContextSite(ctx, smilOnline.hostWebUrl);
        var page = appContextSite.get_web().getFileByServerRelativeUrl(pagePath);
        var wpm = page.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
        var webpartDef = wpm.get_webParts().getById(new SP.Guid(wpId));
        var webpart = webpartDef.get_webPart();
        var properties = webpart.get_properties();
        ctx.load(properties);
        var web = ctx.get_web();

        ctx.executeQueryAsync(function () {
            properties.set_item("JSLink", "~site/SmilOnlineAssets/smilOnlineMap.js");
            webpartDef.saveWebPartChanges();
            ctx.executeQueryAsync(function () {
                dfd.resolve();
            },
            function () {
                console.log("Could not add JSLInk to view " + pagePath);
            });
        },
        function () {
            console.log("Could not add JSLInk to view.");
            dfd.resolve();
        });
        return dfd;
    };
    return cTor;
})();