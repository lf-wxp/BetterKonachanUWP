(function () {
    "use strict";
    WinJS.Namespace.define('Data', {
        listItem: new WinJS.Binding.List([]),
        searchTag: ''
    })
    WinJS.UI.Pages.define('/pages/home/home.html', {
        ready: function (element, options) {
            //reset the DownloadListControl.control to null,
            //prevent from the erros because of the existence of DownloadListControl.control
            // in function showProgressing in downloadManager 
            DownloadListControl.control = null;
            WinJS.Resources.processAll(element);
            var progress = document.createElement('progress'),
                fragment = element.querySelector('.fragment'),
                imgListView = element.querySelector('.imgListView'),
                fixName = document.querySelector('.fixName'),
                fixNameText = fixName.textContent,
                resPost = WinJS.Resources.getString('post'),
                resItemSelected = WinJS.Resources.getString('itemselected'),
                DeviceFamily = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;//Windows.Mobile,Windows.Desktop
            fixName.textContent = resPost.value;
            progress.className = 'win-ring win-medium';

            // load picture timeout tips contain
            var loadTimeout = document.createElement('div'),
                loadTimeoutSpan = document.createElement('span'),
                loadTimeoutBtn = document.createElement('button');
            loadTimeout.classList.add('loadTimeout');
            loadTimeoutBtn.classList.add('win-button');
            loadTimeoutSpan.textContent = WinJS.Resources.getString('loadTimeout').value;
            loadTimeoutBtn.textContent = WinJS.Resources.getString('loadAgain').value;
            loadTimeout.appendChild(loadTimeoutSpan);
            loadTimeout.appendChild(loadTimeoutBtn);

            loadTimeoutBtn.addEventListener('click', function (evnet) {
                event.preventDefault();
                fragment.removeChild(loadTimeout);
                getFirstData();
            }, false);

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
                fixName.textContent = num + resItemSelected.value;
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
                searchBox = document.querySelector('.searchBox'),
                cancle = myAppBar.winControl.getCommandById('cancle'),
                myToolBar = document.querySelector('.myToolBar'),
                animating = WinJS.Promise.wrap(),
                fixNameTextBackUp;
            cancle.hidden = true;
            selectBar.hidden = false;
            selectBar.onclick = function () {
                imgListView.winControl.selectionMode = 'multi';
                imgListView.winControl.tapBehavior = 'toggleSelect';
                fixNameTextBackUp = fixName.textContent;
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
                fixName.textContent = fixNameTextBackUp;
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
                            Utilities.messageOutIn();
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
            var currentPage = 1;
            function getListData() {
                return WinJS.xhr({ type: 'GET', url: 'http://konachan.net/post.json?page='+currentPage+"&tags="+Data.searchTag, responseType: 'json' }).then(function (result) {
                    var data = result.response;
                    currentPage += 1;
                    data.forEach(function (value, index, arry) {
                        var sizeInfo = value.width + "/" + value.height;
                        value['sizeInfo'] = sizeInfo;
                        if (Settings.defaultSetting.securityMode) {
                            if (value.rating === 's') {
                                Data.listItem.push(value);
                            }
                        } else {
                            Data.listItem.push(value);
                        }
                    });
                });
            }
            function getFirstData() {
                fragment.appendChild(progress);
                getListData().then(function () {
                    fragment.removeChild(progress);
                }, function (error) {
                    fragment.removeChild(progress);
                    fragment.appendChild(loadTimeout);
                });
            }
            function clearUpDataSource() {
                while (Data.listItem.length) {
                    Data.listItem.splice(0, 1);
                }
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
            imgListView.winControl.itemTemplate = incrementalTemplate(itemTemplate, Data.listItem, getListData);
            if (!Data.listItem.length) {
                getFirstData();
            }

            // the search function
            searchBox.winControl.queryText = Data.searchTag;
            searchBox.winControl.onquerychanged = function (ev) {
                Data.searchTag = ev.detail.queryText;
                fixName.textContent = Data.searchTag;
            }
            searchBox.winControl.onquerysubmitted = function (ev) {
                currentPage = 1;
                clearUpDataSource();
                fragment.appendChild(progress);
                getListData().then(function () {
                    var len = Data.listItem.length;
                    fragment.removeChild(progress);
                });
            }
        }
    });
})();