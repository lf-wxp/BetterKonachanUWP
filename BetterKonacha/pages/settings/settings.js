(function () {
    "use strict";
    WinJS.Namespace.define('Data', {
        BackgroundItemList:new WinJS.Binding.List([])
    });
    WinJS.UI.Pages.define('/pages/settings/settings.html', {
        ready: function (element, options) {
            DownloadListControl.control = null;
            // style the ui 
            var myAppBar = document.querySelector('.myAppBar'),
                fixName = document.querySelector('.fixName');
            fixName.textContent = 'Setting';
            myAppBar.style.display = 'none';



            // reset the default picture folder

            var folderReset = element.querySelector('.folder .reset'),
                folderSpan = element.querySelector('.folder span'),
                folderChange = element.querySelector('.folder .change');
            folderSpan.textContent = Settings.defaultSetting.savedPath;
            folderReset.addEventListener('click', function () {
                var value = Windows.Storage.KnownFolders.savedPictures.path;
                folderSpan.textContent = value;
                Settings.setLocalSettings({ 'savedPath': value });
            }, false);
            folderChange.addEventListener('click', function () {
                var folderPicker = new Windows.Storage.Pickers.FolderPicker;
                folderPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
                folderPicker.fileTypeFilter.replaceAll([".png", ".jpeg", ".jpg"]);
                folderPicker.pickSingleFolderAsync().then(function (folder) {
                    if (folder) {
                        // Application now has read/write access to all contents in the picked folder (including sub-folder contents)
                        // Cache folder so the contents can be accessed at a later time
                        folderSpan.textContent = folder.path;
                        Settings.setLocalSettings({ 'savedPath': folder.path });
                        Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);
                    } else {
                        // The picker was dismissed with no selected file
                    }
                });
            }, false);


            // toggle switch 

            var securityToggle = element.querySelector('.securityToggle');
            // initialize the toggleswitch 
            securityToggle.winControl.checked = Settings.defaultSetting.securityMode;
            securityToggle.winControl.addEventListener('change', function (ev) {
                var toggle = securityToggle.winControl.checked;
                Settings.setLocalSettings({ 'securityMode': toggle });
            }, false);


            // background setting
            var root = Windows.ApplicationModel.Package.current.installedLocation.path,
                backgroundImg = '\\images\\backgrounds',
                backgroundList = element.querySelector('.backgroundList');
            if (!Data.BackgroundItemList.length) {
                Windows.Storage.StorageFolder.getFolderFromPathAsync(root+backgroundImg).done(function (folder) {
                    folder.getFilesAsync().done(function (data) {
                        data.forEach(function (value, index, array) {
                            Data.BackgroundItemList.push({ pic: '/images/backgrounds/'+value.name });
                        });
                    }, function () { });
                }, function () { });
            }


            backgroundList.winControl.addEventListener('selectionchanged', function (ev) {
                event.target.winControl.selection.getItems().done(function (items) {
                    var item = items[0].data;
                    Settings.setLocalSettings({ 'backgroundImage': item.pic });
                    Utilities.setBackground(item.pic);
                });
            });


            //background image picker
            var backgroundPicker = element.querySelector('.backgroundPicker');
            backgroundPicker.addEventListener('click', function (ev) {
                ev.preventDefault();
                var fileOpenPicker = new Windows.Storage.Pickers.FileOpenPicker();
                fileOpenPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
                fileOpenPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                fileOpenPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
                fileOpenPicker.pickSingleFileAsync().done(function (file) {
                    Windows.Storage.StorageFolder.getFolderFromPathAsync(root + backgroundImg).done(function (folder) {
                        file.copyAsync(folder).done(function copySuccesss(copyFile) {
                            var date = new Date(),
                                newFileName = date.getTime()+copyFile.fileType
                            copyFile.renameAsync(newFileName).done(function () {
                                Data.BackgroundItemList.push({ pic: '/images/backgrounds/' + newFileName });
                            });
                        });
                    });
                    
                });

            }, false);
            

        }

    });
})();