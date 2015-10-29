<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>
    <script type="text/javascript" src="../Scripts/libs/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
    <link href="../Content/font-awesome.min.css" rel="stylesheet" />
    
    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/BingMapsExtension.js"
    <script type="text/javascript" src="../Scripts/libs/WKTModule-min.js"></script>
    <script type="text/javascript" src="../Scripts/libs/V7CustomInfobox.min.js"></script>
    <script type="text/javascript" src="../Scripts/app.js"></script>
    <script type="text/javascript" src="../Scripts/ensureConfiguration.js"></script>
    <script type="text/javascript" src="../Scripts/configParser.js"></script>
    <script type="text/javascript" src="../Scripts/layers.js"></script>
    <script type="text/javascript" src="../Scripts/layerWidget.js"></script>
    <script type="text/javascript" src="../Scripts/config.js"></script>
    <script type="text/javascript" src="../Scripts/common.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Page Title
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div id="map">
    </div>

    <div id="layerWidget">
        <div id="spLayers"><span id="layerWidgetHeadline" class="layerWidgetHeaders">SharePoint Layers</span>&nbsp;<span id="layerWidgetIcon" class="fa fa-spinner fa-spin"></span></div>
        <div id="spLayersList">
        <ul></ul>
        </div>
        <div id="layerAdminToolbar" class="layerWidgetHeaders">Add layers
            <i class="fa fa-chevron-right fa-1"></i>
        </div>
        <div id="layerAdminLayerList">
            <ul></ul>
        </div>
    </div>

    <div id="info">
        <p>
            It seems to be the first time you use this app, you need to fill in some configuration including a Bing Maps key. You can get a key from <a target="_blank" href="https://www.bingmapsportal.com">Bing Map Portal</a>.
            This application will create a documentlibrary called SmilOnlineAssets to store configuration on the site. 
            Enjoy.
        </p>
        <input type="button" id="infoOK" value="OK" />
    </div>
    
    <div id="cover">
        <div id="workingWidget" class="centerWidget">
            <div class="widgetForm centerText">
                working on it ...
            </div>
            <div class="centerText"><i class="fa fa-spin fa-spinner" style="font-size: 7em;"></i></div>
        </div>
        <div id="confirmationWidget" class="centerWidget">
            <div class="widgetForm">
                Are you sure you want to add Geometry field to list <i><span id="addToListNameId"></span></i>?
                <p>A multiline text field will be added to the list.</p>
            </div>
            <div>
                <button id="addLayerButton" class="confirmButton">OK</button>
                <button id="addLayerCancelButton" class="cancelButton">Cancel</button>
            </div>
        </div>
        <div id="configWidget" class="centerWidget">
            <div id="configWidgetForm" class="widgetForm">
                <span>Bing maps key: </span>
                <input type="text" placeholder="Your bing maps key." id="configWidgetFormBingKey" />
                <div id="configWidgetFormLocation">
                    <div class="locationInputArea">
                        <span>Latitude:</span>
                        <input type="number" step="any" min="-90" max="90" value="0.0" id="configWidgetFormLatitude" class="locationInput" />
                    </div>
                    <div class="locationInputArea">
                        <span>Longitude:</span>
                        <input type="number" step="any" min="-180" max="180" value="0.0" id="configWidgetFormLongitude" class="locationInput" />
                    </div>
                    <div class="locationInputArea">
                        <span>Zoomlevel:</span>
                        <input type="number" min="1" max="19" id="configWidgetFormZoomLevel" class="locationInput" value="10" />
                    </div>
                </div>
            </div>
            <div>
                <button id="confirmConfigButton" class="confirmButton">OK</button>
            </div>
        </div>
    </div>

</asp:Content>
