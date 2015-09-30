(function () {
    "use strict";
    WinJS.UI.Pages.define('/pages/settings/settings.html', {
        ready: function (element, options) {
            // style the ui 
            var myAppBar = document.querySelector('.myAppBar'),
                fixName = document.querySelector('.fixName');
            fixName.textContent = 'Setting';
            myAppBar.style.display = 'none';

            //background picker

            var backPicker = element.querySelector('.backgroundPicker input'),
                backPickerBtn = element.querySelector('.backgroundPicker button');
            backPickerBtn.addEventListener('click', function () {
                backPicker.click();
            }, false);
         
            // reset the default picture folder
            
            var folderReset = element.querySelector('.folder .reset'),
                folderSpan = element.querySelector('.folder span'),
                folderChange = element.querySelector('.folder .change');
            folderReset.addEventListener('click', function () {
                var value = Windows.Storage.KnownFolders.savedPictures.path;
                folderSpan.textContent = value;
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
                        Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);
                    } else {
                        // The picker was dismissed with no selected file
                    }
                });
            }, false);

        }

    });
})();