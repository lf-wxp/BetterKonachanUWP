(function () {
    "use strict";
    WinJS.Namespace.define('Data', {
        ListItem: new WinJS.Binding.List([])
    })
    var list = Data.ListItem;
    WinJS.UI.Pages.define('/pages/home/home.html', {
        ready: function (element, options) {
            var progress = document.createElement('progress'),
                fragment = element.querySelector('.fragment'),
                imgListView = element.querySelector('.imgListView'),
                fixName = document.querySelector('.fixName'),
                fixNameText = fixName.textContent,
                DeviceFamily = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;//Windows.Mobile,Windows.Desktop
            fixName.textContent = 'Post';
            progress.style.position = 'absolute';
            progress.style.left = '0px';
            progress.style.width = '100%';
            progress.style.top = '5px';


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
                WinJS.Navigation.navigate('/pages/view/view.html', {itemIndex:ev.detail.itemIndex});
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
            selectBar.onclick=function () {
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
            function showTheBottomToolBarMobileOnly() {
                if (DeviceFamily === 'Windows.Mobile' && window.orientation == 0) {
                    animating = animating.then(function () {
                        myToolBar.style.opacity = "1";
                        myToolBar.style.visibility = "visible";
                        return WinJS.UI.Animation.showEdgeUI(myToolBar, {top:'48px',left:'0px'});
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
            if (!Data.ListItem.length) {
                fragment.appendChild(progress);
                WinJS.xhr({ type: 'GET', url: 'http://konachan.com/post.json', responseType: 'json' }).done(function (result) {
                    var data = result.response;
                    fragment.removeChild(progress);
                    data.forEach(function (value, index, arry) {
                        if (value.rating === 's') {
                            Data.ListItem.push(value);
                        }
                    });
                });
            }
        }
    });
})();