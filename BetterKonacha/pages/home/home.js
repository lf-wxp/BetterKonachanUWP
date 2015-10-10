(function () {
    "use strict";
    WinJS.Namespace.define('Data', {
        ListItem: new WinJS.Binding.List([]),
        currentPage:1
    })
    //
    WinJS.UI.Pages.define('/pages/home/home.html', {
        ready: function (element, options) {
            //reset the DownloadListControl.control to null,
            //prevent from the erros because of the existence of DownloadListControl.control
            // in function showProgressing in downloadManager 
            DownloadListControl.control = null;

            var progress = document.createElement('progress'),
                fragment = element.querySelector('.fragment'),
                imgListView = element.querySelector('.imgListView'),
                fixName = document.querySelector('.fixName'),
                fixNameText = fixName.textContent,
                DeviceFamily = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;//Windows.Mobile,Windows.Desktop
            fixName.textContent = 'Post';
            progress.className = 'win-ring win-medium';


            var myAppBar = document.querySelector('.myAppBar'),
                splitView = document.querySelector('.mySplit'),
                topAppBarContain = document.querySelector('.topAppBarContain');


            if (DeviceFamily === 'Windows.Mobile') {
                splitView.winControl.closedDisplayMode = "none";
            }
            if (DeviceFamily === 'Windows.Desktop') {
                splitView.winControl.closedDisplayMode = "inline";
            }
            myAppBar.style.display = 'inline-block';
            topAppBarContain.style.display = 'block';

            //ListView selectionchanged event 
            imgListView.winControl.addEventListener('selectionchanged', function () {
                var num = imgListView.winControl.selection.count();
                fixName.textContent = num + ' items selected';
            });

            // ListView invoked event 
            imgListView.winControl.addEventListener('iteminvoked', function (ev) {
                WinJS.Navigation.navigate('/pages/view/view.html', { itemIndex: ev.detail.itemIndex });
            });
            //  responsible layout
            if (window.innerWidth < 500) {
                imgListView.winControl.layout.orientation = 'vertical';
            }
            // appbar action 
            var selectBar = myAppBar.winControl.getCommandById('select'),
                searchBoxCon = myAppBar.winControl.getCommandById('searchBoxCon'),
                cancle = myAppBar.winControl.getCommandById('cancle'),
                myToolBar = document.querySelector('.myToolBar'),
                animating = WinJS.Promise.wrap();
            cancle.hidden = true;
            selectBar.hidden = false;
            selectBar.onclick = function () {
                imgListView.winControl.selectionMode = 'multi';
                imgListView.winControl.tapBehavior = 'toggleSelect';
                selectBar.hidden = true;
                cancle.hidden = false;
                showTheBottomToolBarMobileOnly();
            }
            cancle.onclick = function () {
                imgListView.winControl.selectionMode = 'none';
                imgListView.winControl.tapBehavior = 'none';
                imgListView.winControl.selection.clear();
                cancle.hidden = true;
                selectBar.hidden = false;
                hideTheBottomToolBarMobileOnly();
                fixName.textContent = fixNameText;
            }

            // add picture to download list with toolbar and appbar
            var downloadToolBar = myToolBar.winControl.getCommandById('download'),
                downloadAppBar = myAppBar.winControl.getCommandById('download');
            function downloadToListHandle() {
                var count = imgListView.winControl.selection;
                if (imgListView.winControl.selection.count()) {
                    imgListView.winControl.selection.getItems().done(function (items) {
                        items.forEach(function (value, index, array) {
                            var imgUri = {
                                "preview": value.data.preview_url,
                                "picture": value.data.file_url
                            }
                            DownloadManager.startUnconstrainedDownload(imgUri);
                        });
                        cancle.onclick();
                    });
                }
            }
            downloadToolBar.addEventListener('click', downloadToListHandle);

            // use the old way to bind event to the downloadAppBar, 
            //beacuse the new event handle function just rewrite the elder handle instead of as a new one added to the downloadAppBar
            downloadAppBar.onclick = downloadToListHandle;

            function showTheBottomToolBarMobileOnly() {
                if (DeviceFamily === 'Windows.Mobile' && window.orientation == 0) {
                    animating = animating.then(function () {
                        myToolBar.style.opacity = "1";
                        myToolBar.style.visibility = "visible";
                        return WinJS.UI.Animation.showEdgeUI(myToolBar, { top: '48px', left: '0px' });
                    });
                }
            }
            function hideTheBottomToolBarMobileOnly() {
                if (DeviceFamily === 'Windows.Mobile' && window.orientation == 0) {
                    animating = animating.then(function () {
                        return WinJS.UI.Animation.hideEdgeUI(myToolBar, { top: '48px', left: '0px' });
                    }).then(function () {
                        myToolBar.style.opacity = "0";
                        myToolBar.style.visibility = "hidden";
                    });
                }

            }
            function getListData() {
                return WinJS.xhr({ type: 'GET', url: 'http://konachan.com/post.json?page='+Data.currentPage, responseType: 'json' }).then(function (result) {
                    var data = result.response;
                    Data.currentPage += 1;
                    document.querySelector('.fixName').textContent = Data.currentPage;
                    data.forEach(function (value, index, arry) {
                        var sizeInfo = value.width + "/" + value.height;
                        value['sizeInfo'] = sizeInfo;
                        if (Settings.defaultSetting.securityMode) {
                            if (value.rating === 's') {
                                Data.ListItem.push(value);
                            }
                        } else {
                            Data.ListItem.push(value);
                        }
                    });
                });
            }
            function incrementalTemplate(template, data, getMoreData) {
                return function (itemPromise) {
                    var fetching;
                    return itemPromise.then(function (item) {
                        if (item.key === data.getItem(data.length - 1).key) {
                            if (!fetching) {
                                fetching = true;
                                getMoreData().then(function () {
                                    fetching = false;
                                });
                            }
                        }
                        return template(itemPromise);
                    });
                };
            }
            var itemTemplate = imgListView.winControl.itemTemplate;
            imgListView.winControl.itemTemplate = incrementalTemplate(itemTemplate, Data.ListItem, getListData);
            if (!Data.ListItem.length) {
                fragment.appendChild(progress);
                getListData().then(function () {
                    fragment.removeChild(progress);
                });
            }
        }
    });
})();