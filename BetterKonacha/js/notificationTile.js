(function () {
    "use strict";
    var notifications = Windows.UI.Notifications,
        imgWideTemplate = notifications.TileTemplateType.tileWide310x150Image,
        imgSquareTemplate = notifications.TileTemplateType.tileSquare150x150Image,
        imgLargeTemplate = notifications.TileTemplateType.tileSquare310x310Image,
        templateArray = [imgSquareTemplate, imgWideTemplate, imgLargeTemplate];
    notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
    function imgTile(template, src) {
        var tileXml = notifications.TileUpdateManager.getTemplateContent(template),
            tileImg = tileXml.getElementsByTagName('image')[0];
        tileImg.setAttribute("src", src);
        tileImg.setAttribute("alt", "test");
        var tileNotification = new notifications.TileNotification(tileXml);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
    }
    var index = 0;
    function updateTile() {
        WinJS.xhr({ type: 'GET', url: 'http://konachan.com/post.json', responseType: 'json' }).then(function (result) {
            var data = result.response;
            for (var i = 0; i < data.length; i++) {
                if (index >= 4) {
                    return false;
                }
                if (data[i].rating === 's') {
                    templateArray.forEach(function (temp) {
                        imgTile(temp, data[i].preview_url);
                    });
                    index += 1;
                }
            }
        });
    }
    WinJS.Namespace.define('TileUpdate', {
        updateTile: updateTile
    })
})();