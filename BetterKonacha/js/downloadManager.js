(function () {
    "use strict";

    var test = [{
        "preview": 'http://konachan.net/data/preview/7b/f5/7bf5a2826cab7b382064166342a0f21a.jpg',
        "picture": '',
        "receiveData": '50',
        "finished": true,
        "guid": "27a82420-df4f-4d0d-9099-5190d027bf0f",
        "error":true
    }];
    WinJS.Namespace.define('Data', {
        downloadItem: new WinJS.Binding.List([])
    });
    WinJS.Namespace.define('DownloadListControl', {
        control: null
    });

    // Global array used to persist operations.
    var downloadOperations = [],
        fileNameUniqueSalt = 1;

    // Class associated with each download.
    function DownloadOperation() {
        var download = null;
        var promise = null;
        var imageStream = null;
        var listViewIndex = null;
        var fileName = null;
        var imageObj = null;

        this.start = function (uriObj, priority, requestUnconstrainedDownload) {
            // Asynchronously create the file in the pictures folder.
            var date = new Date(),
                uri = new Windows.Foundation.Uri(uriObj.picture);
            fileName = date.getTime() + fileNameUniqueSalt + uri.extension;
            imageObj = uriObj;
            fileNameUniqueSalt += 1;
            if (Settings.defaultSetting.savedPath == Windows.Storage.KnownFolders.savedPictures.path) {
                createPrimaryFileAndDownload(Windows.Storage.KnownFolders.savedPictures);
            } else {
                Windows.Storage.StorageFolder.getFolderFromPathAsync(Settings.defaultSetting.savedPath).done(function (folder) {
                    Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.add(folder);
                    createPrimaryFileAndDownload(folder);
                });
            }

            function createPrimaryFileAndDownload(folder){
                folder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.generateUniqueName).done(function (newFile) {
                    var downloader = new Windows.Networking.BackgroundTransfer.BackgroundDownloader();
                    // Create a new download operation.

                    download = downloader.createDownload(uri, newFile);

                    download.priority = priority;

                    if (!requestUnconstrainedDownload) {
                        // Start the download and persist the promise to be able to cancel the download.
                        promise = download.startAsync().then(complete, error, progress);
                        return;
                    }

                    // Create a list of download operations: We'll request that operations in this list will run
                    // unconstrained.
                    var requestOperations = [];
                    requestOperations.push(download);

                    // If the app isn't actively being used, at some point the system may slow down or pause long running
                    // downloads. The purpose of this behavior is to increase the device's battery life.
                    // By requesting unconstrained downloads, the app can request the system to not suspend any of the
                    // downloads in the list for power saving reasons.
                    // Use this API with caution since it not only may reduce battery life, but it may show a prompt to
                    // the user.
                    var requestPromise;
                    try {
                        requestPromise = Windows.Networking.BackgroundTransfer.BackgroundDownloader.requestUnconstrainedDownloadsAsync(requestOperations);
                    } catch (error) {
                        var notImplementedException = -2147467263;
                        if (error.number === notImplementedException) {
                            return;
                        }
                        throw error;
                    }

                    requestPromise.done(function (result) {
                        promise = download.startAsync().then(complete, error, progress);
                        showDownloadItem();
                    }, error);

                }, error);
            }

        };

        // On application activation, reassign callbacks for a download
        // operation persisted from previous application state.
        this.load = function (loadedDownload) {
            download = loadedDownload;
            promise = download.attachAsync().then(complete, error, progress);
        };

        // Cancel download.
        this.cancel = function () {
            if (promise) {
                promise.cancel();
                promise = null;
                removeCancelDownloadFile();
            } else {
                //printLog("Download " + download.guid + " already canceled.<br\>");
            }
        };

        // Resume download - download will restart if server does not allow range-requests.
        this.resume = function () {
            if (download) {
                if (download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedByApplication) {
                    download.resume();
                    //printLog("Resuming download: " + download.guid + "<br\>");
                } else {
                    //printLog("Download " + download.guid +
                    //" is not paused, it may be running, completed, canceled or in error.<br\>");
                }
            }
        };

        // Pause download.
        this.pause = function () {
            if (download) {
                if (download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.running) {
                    download.pause();
                    //printLog("Pausing download: " + download.guid + "<br\>");
                } else {
                    //printLog("Download " + download.guid +
                    //    " is not running, it may be paused, completed, canceled or in error.<br\>");
                }
            }
        };

        // Returns true if this is the download identified by the guid.
        this.hasGuid = function (guid) {
            return download.guid === guid;
        };

        // Removes download operation from global array.
        function removeDownload(guid) {
            downloadOperations.forEach(function (operation, index) {
                if (operation.hasGuid(guid)) {
                    downloadOperations.splice(index, 1);
                }
            });
        }

        // Progress callback.
        function progress() {
            // Output all attributes of the progress parameter.
            //printLog(download.guid + " - progress: ");
            var currentProgress = download.progress;
            showProgressing(currentProgress);

            // Handle various pause status conditions.
            if (currentProgress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedByApplication) {
                //printLog("Download " + download.guid + " paused by application <br\>");
            } else if (currentProgress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedCostedNetwork) {
                //printLog("Download " + download.guid + " paused because of costed network <br\>");
            } else if (currentProgress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedNoNetwork) {
                //printLog("Download " + download.guid + " paused because network is unavailable.<br\>");
            } else {
                // We need a response before assigning the result stream to the image: If we get a response from
                // the server (hasResponseChanged == true) and if we haven't assigned the stream yet
                // (imageStream == null), then assign the stream to the image.
                // There is a second scenario where we need to assign the stream to the image: If a download gets
                // interrupted and cannot be resumed, the request is restarted. In that case we need to re-assign
                // the stream to the image since the requested image may have changed.
                if ((currentProgress.hasResponseChanged && !imageStream) || (currentProgress.hasRestarted)) {
     
                }
            }
        }
        // show the progress bar in listVeiw
        function showDownloadItem() {
            var listData = imageObj;
            //listData['download'] = download;
            listData['receiveData'] = 0;
            listData['finished'] = false;
            listData['guid'] = download.guid;
            var tempLen = Data.downloadItem.push(listData);
            listViewIndex = tempLen - 1;
        }

        function showProgressing(progress) {
            //update the progress data
            var downloadIndexItem = Data.downloadItem.getAt(listViewIndex),
                total = progress.totalBytesToReceive,
                receive = progress.bytesReceived,
                progressValue = receive / total * 100;
            downloadIndexItem.receiveData = progressValue;
            if (DownloadListControl.control) {
                var downloadListView = DownloadListControl.control,
                itemElement = downloadListView.elementFromIndex(listViewIndex),
                progressBar = itemElement.querySelector('progress');
                progressBar.value = progressValue;
            }
        }
        function showProgressed(progress) {
            var downloadIndexItem = Data.downloadItem.getAt(listViewIndex);
            downloadIndexItem.finished = true;
            if (DownloadListControl.control) {
                var downloadListView = DownloadListControl.control,
                itemElement = downloadListView.elementFromIndex(listViewIndex),
                downloadListItemImg = itemElement.querySelector('.downloadListItemImg');
                downloadListItemImg.dataset.finished = 'true';
            }
        }
        function errorAction() {
            var downloadIndexItem = Data.downloadItem.getAt(listViewIndex);
            downloadIndexItem.error = true;
            if (DownloadListControl.control) {
                var downloadListView = DownloadListControl.control,
                itemElement = downloadListView.elementFromIndex(listViewIndex),
                downloadListItemImg = itemElement.querySelector('.downloadListItem');
                downloadListItemImg.dataset.error = 'true';
            }
        }
        //remove the file that is created by the canceled download operation
        function removeCancelDownloadFile() {
            if (Settings.defaultSetting.savedPath == Windows.Storage.KnownFolders.savedPictures.path) {
                Windows.Storage.KnownFolders.savedPictures.getFileAsync(fileName).done(function (file) {
                    file.deleteAsync();
                });
            } else {
                Windows.Storage.StorageFolder.getFolderFromPathAsync(Settings.defaultSetting.savedPath).done(function (folder) {
                    folder.getFileAsync(fileName).done(function (file) {
                        file.deleteAsync();
                    });
                });
            }
        }
        // Completion callback.
        function complete() {
            removeDownload(download.guid);
            showProgressed();
            try {
                var responseInfo = download.getResponseInformation();
                //printLog(download.guid + " - download complete. Status code: " + responseInfo.statusCode + "<br/>");
                //displayStatus("Completed: " + download.guid + ", Status Code: " + responseInfo.statusCode);
            } catch (err) {
                //displayException(err);
            }
        }

        // Error callback.
        function error(err) {
            if (download) {
                if (err.name !== "Canceled") {
                    errorAction();
                }
                removeDownload(download.guid);
                //printLog(download.guid + " - download completed with error.<br/>");
            }
            //displayException(err);
        }
    }

    function downloadFile(uri, priority, requestUnconstrainedTransfer) {
        // Instantiate downloads.
        var newDownload = new DownloadOperation();

        newDownload.start(uri, priority, requestUnconstrainedTransfer);

        // Persist the download operation in the global array.
        downloadOperations.push(newDownload);
    }

    // Cancel all downloads.
    function cancelAll() {
        for (var i = 0; i < downloadOperations.length; i++) {
            downloadOperations[i].cancel();
        }
    }

    // Pause all downloads.
    function pauseAll() {
        for (var i = 0; i < downloadOperations.length; i++) {
            downloadOperations[i].pause();
        }
    }

    // Resume all downloads.
    function resumeAll() {
        for (var i = 0; i < downloadOperations.length; i++) {
            downloadOperations[i].resume();
        }
    }
    function startDownload(uri) {
        downloadFile(uri, Windows.Networking.BackgroundTransfer.BackgroundTransferPriority.default, false);
    }

    function startUnconstrainedDownload(uri) {
        downloadFile(uri, Windows.Networking.BackgroundTransfer.BackgroundTransferPriority.default, true);
    }

    function startHighPriorityDownload(uri) {
        downloadFile(uri, Windows.Networking.BackgroundTransfer.BackgroundTransferPriority.high, false);
    }

    //startUnconstrainedDownload(imgUri);

    WinJS.Namespace.define('DownloadManager', {
        startUnconstrainedDownload: startUnconstrainedDownload,
        downloadOperations: downloadOperations
    });
})();