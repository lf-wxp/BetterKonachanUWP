// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    // change the background color of the title bar 
    var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    view.titleBar.backgroundColor = Windows.UI.Colors.black;
    view.titleBar.ForegroundColor = Windows.UI.Colors.White;
    view.titleBar.buttonBackgroundColor = Windows.UI.Colors.black;
    view.titleBar.buttonForegroundColor = Windows.UI.Colors.white;
    view.titleBar.foregroundColor = Windows.UI.Colors.white;

    // responsible design function 
    function updateLayoutOneTime() {
        var mySplit = document.querySelector('.mySplit'),
            myAppBar = document.querySelector('.myAppBar'),
            searchBar = document.querySelector('.searchBar'),
            DeviceFamily = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;//Windows.Mobile,Windows.Desktop

        // 

        if (DeviceFamily === 'Windows.Mobile') {
            mySplit.winControl.closedDisplayMode = "none";
        }
        if (window.innerWidth <= 320) {
            var search = myAppBar.winControl.getCommandById('search');
            search.hidden = false;
            searchBar.winControl.addEventListener('click', function () {
                WinJS.Utilities.query('.searchBoxCon').addClass('active');
                myAppBar.style.zIndex = 2;
                this.blur();
                WinJS.Utilities.query('.searchBox input').get(0).focus();
            }, false);
            document.querySelector('.searchBox input').addEventListener('blur', function () {
                WinJS.Utilities.query('.searchBoxCon').removeClass('active');
                myAppBar.style.zIndex = 1;
            }, false);

            // hiding the search box when input pane is hiding
            var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            inputPane.addEventListener("hiding", function () {
                WinJS.Utilities.query('.searchBoxCon').removeClass('active');
                myAppBar.style.zIndex = 1;
            }, false);
        }
    }
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                //TODO: 已经新启动此应用程序。请在此初始化你的应用程序。

                // initialize the settings 
                Settings.initializeSettings().done(function () {
                    // set the background image
                    Utilities.setBackground(Settings.defaultSetting.backgroundImage);
                });

            } else {
                // TODO: 此应用程序已挂起，然后终止。
                // 若要创造顺畅的用户体验，请在此处还原应用程序状态，使应用似乎永不停止运行。
            }


            // Save the previous execution state. 
            WinJS.Application.sessionState.previousExecutionState =
                args.detail.previousExecutionState;

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }

            args.setPromise(WinJS.UI.processAll().done(function () {
                updateLayoutOneTime();

                // when change the mobile device orientation,change the orientation of layout of ListView. 
                window.addEventListener('orientationchange', function (ev) {
                    var listview = document.querySelector('.pageContain .changeLayout');
                    if (listview) {
                        if (window.orientation !== 0) {
                            listview.winControl.layout.orientation = 'horizontal';
                        } else {
                            listview.winControl.layout.orientation = 'vertical';
                        }
                    }
                    
                }, false);

                window.addEventListener('resize', function () {
                    //updateLayout();
                    //log(window.innerWidth);

                    //if (resizeHandle) {
                    //    window.clearTimeout(resizeHandle);
                    //}
                    //resizeHandle = window.setTimeout(function () {
                    //    updateLayout();
                    //}, 50);
                }, false);

                // system goback button
                Windows.UI.Core.SystemNavigationManager.getForCurrentView().addEventListener('backrequested', function () {
                    WinJS.Navigation.back();
                });

                if (nav.location) { // navigate to the home page
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }

            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: 此应用程序将被挂起。请在此保存需要挂起中需要保存的任何状态。
        //你可以使用 WinJS.Application.sessionState 对象，该对象在挂起中会自动保存和还原。
        //如果需要在应用程序被挂起之前完成异步操作，请调用 args.setPromise()。
    };

    app.start();
})();
