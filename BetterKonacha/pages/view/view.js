(function () {
    "use strict";
    WinJS.Namespace.define('Data', {
       flipItem:new WinJS.Binding.List([])
    });

    WinJS.UI.Pages.define('/pages/view/view.html', {
        ready: function (element, options) {
            DownloadListControl.control = null;
            WinJS.Resources.processAll(element);
            // style the ui 
            var appBars = document.querySelector('.appBars'),
                splitView = document.querySelector('.mySplit'),
                topAppBarContain = document.querySelector('.topAppBarContain'),
                flipView = element.querySelector('.myFlipView').winControl,
                flipViewTemplate = element.querySelector('.myFlipViewTemplate'),
                rectField = element.querySelector('.rect'),
                itemInfo = element.querySelector('.itemInfo'),
                itemIndex = options.itemIndex,
                offsetLen = 10;
            topAppBarContain.style.display = 'none';
            splitView.winControl.closedDisplayMode = "none";

            // flipVeiw Control settings
            while (Data.flipItem.length) {
                Data.flipItem.pop();
            }
            function getTheFlipWide() { // always keep the constant datasource of flipview in number(one + 2*offsetlen) 
                var start, end, currentItem = Data.listItem.getAt(itemIndex);
                if (itemIndex - offsetLen >= 0) {
                    start = itemIndex - offsetLen;
                } else {
                    start = 0;
                }
                if (itemIndex + offsetLen < Data.listItem.length) {
                    end = itemIndex + offsetLen;
                } else {
                    end = Data.listItem.lenth - 1;
                }
                for (var i = start; i <= end; i++) {
                    Data.flipItem.push(Data.listItem.getAt(i));
                }
                var newIndex = Data.flipItem.indexOf(currentItem);
                return newIndex;
            }
            function getImgFileSync(src, contain) {
                var imgTag = contain.querySelector('img'),
                    progress = document.createElement("progress");
                progress.className = 'win-ring win-medium';
                contain.appendChild(progress);
                WinJS.xhr({ url: src, responseType: 'blob' }).done(function (result) {
                    var tempUrl = URL.createObjectURL(result.response, { oneTimeOnly: true });
                    imgTag.src = tempUrl;
                    contain.setAttribute('loaded', true);
                    contain.removeChild(progress);
                });
            }

            var firstPage = true;
            flipView.itemDataSource = Data.flipItem.dataSource;
            flipView.currentPage = getTheFlipWide();
            flipView.itemTemplate = flipViewTemplate;
            flipView.addEventListener('pagecompleted', function (ev) {
                // Adding and removing the item in datasource dynamically to keey the 
                // datasource slim
                var item = Data.flipItem.getAt(flipView.currentPage),
                    flipLen = Data.flipItem.length,
                    currentIndex = flipView.currentPage,
                    originalIndex = Data.listItem.indexOf(item),
                    index;

                // get the bigger sample image through xhr
                var imgTagCon = flipView.element.querySelector(".win-template[aria-selected='true']>div");
                if (imgTagCon&&!imgTagCon.getAttribute('loaded')) {
                    getImgFileSync(item.sample_url, imgTagCon);
                }
                rectField.textContent = item.width + " X " + item.height;
                //flip previous to see previous image and remove the last item in flipItem
                // can't update dataSource dynamically because the currentPage must be changed when dataSource changes,
                // the FlipView control must invoke 
                //if (currentIndex === 0 && originalIndex > 0) {
                //    Data.flipItem.unshift(Data.listItem.getAt(originalIndex - i));
                //}
                //flip next to see next image and remove the fisrt item in flipItem
                //if (currentIndex + 1 >= flipLen && originalIndex < Data.listItem.length - 1) {
                //    Data.flipItem.push(Data.listItem.getAt(originalIndex + i));
                //}
            });
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
            

            // the download bar action in ToolBar
            var myViewToolBar = element.querySelector('.myViewToolBar'),
            downloadBar = myViewToolBar.winControl.getCommandById('download');
            downloadBar.addEventListener('click', function () {
                var item = Data.listItem.getAt(options.itemIndex),
                    imgUri = {
                        "preview": item.preview_url,
                        "picture": item.file_url
                    }
                DownloadManager.startUnconstrainedDownload(imgUri);
                Utilities.messageOutIn();
            });
        }

    });
})();