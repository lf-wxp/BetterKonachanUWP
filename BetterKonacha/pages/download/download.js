(function () {
    "use strict";
    WinJS.UI.Pages.define('/pages/download/download.html', {
        ready: function (element, options) {
            // style the ui 
            WinJS.Resources.processAll(element);
            var myAppBar = document.querySelector('.myAppBar'),
                fixName = document.querySelector('.fixName'),
                downloadListView = element.querySelector('.downloadList'),
                resDownloadList = WinJS.Resources.getString('downloadList');
            fixName.textContent = resDownloadList.value;
            myAppBar.style.display = 'none';
            DownloadListControl.control = downloadListView.winControl;
            var downloadListView = DownloadListControl.control;

            //  responsible layout
            if (window.innerWidth < 500) {
                downloadListView.layout.orientation = 'vertical';
            }

            // downloadListView  delegate event of every download operation ,such as  pause, resume and remove ;
            downloadListView.addEventListener('click', function (ev) {
                var target = ev.target,
                    guid = target.parentNode.dataset.guid;// get the unique guid the locate the download operation
                if (target.dataset.role) {
                    var operations = DownloadManager.downloadOperations,
                        role = target.dataset.role;
                    if (role == "play") {
                        DownloadManager.downloadOperations.forEach(function (downloadOperation, index, array) {
                            if (downloadOperation.hasGuid(guid)) {
                                downloadOperation.resume();
                            }
                        });
                        target.classList.add('hidden');
                        target.nextElementSibling.classList.remove('hidden');
                    }
                    if (role == "pause") {
                        DownloadManager.downloadOperations.forEach(function (downloadOperation, index, array) {
                            if (downloadOperation.hasGuid(guid)) {
                                downloadOperation.pause();
                            }
                        });
                        target.classList.add('hidden');
                        target.previousElementSibling.classList.remove('hidden');
                    }
                    if (role == "clear") {
                        Data.downloadItem.forEach(function (value, index, array) {
                            if (value.guid == guid) {
                                Data.downloadItem.splice(index, 1);
                            }
                        });
                        DownloadManager.downloadOperations.forEach(function (downloadOperation, index, array) {
                            if (downloadOperation.hasGuid(guid)) {
                                downloadOperation.cancel();
                                DownloadManager.downloadOperations.splice(index,1);
                            }
                        });
                    }
                }
            }, false)
        }
    });
})();