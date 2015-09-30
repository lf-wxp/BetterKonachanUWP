(function () {
    "use strict";
    WinJS.UI.Pages.define('/pages/view/view.html', {
        ready: function (element, options) {
            // style the ui 
            var appBars = document.querySelector('.appBars'),
                splitView = document.querySelector('.mySplit'),
                topAppBarContain = document.querySelector('.topAppBarContain'),
                flipView = element.querySelector('.myFlipView').winControl,
                flipViewTemplate = element.querySelector('.myFlipViewTemplate'),
                rectField = element.querySelector('.rect'),
                itemInfo = element.querySelector('.itemInfo');
            topAppBarContain.style.display = 'none';
            splitView.winControl.closedDisplayMode = "none";
            flipView.itemDataSource = Data.ListItem.dataSource;
            flipView.itemTemplate = flipViewTemplate;
            flipView.currentPage = options.itemIndex;
            var animating = WinJS.Promise.wrap();
            function showInfo() {
                animating = animating.then(function () {
                    itemInfo.style.opacity = "1";
                    itemInfo.style.visibility = "visible";
                    return WinJS.UI.Animation.showEdgeUI(itemInfo);
                });
            }
            function hideInfo() {
                animating = animating.then(function () {
                    return WinJS.UI.Animation.hideEdgeUI(itemInfo);
                }).then(function () {
                    itemInfo.style.opacity = "0";
                    itemInfo.style.visibility = "hidden";
                });
            }
            showInfo();
            flipView.addEventListener('pageselected', function (ev) {
                var item = Data.ListItem.getAt(flipView.currentPage);
                rectField.textContent = item.width + " X " + item.height;
            });
        }

    });
})();