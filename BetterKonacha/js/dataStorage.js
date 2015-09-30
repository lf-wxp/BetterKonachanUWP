(function () {
    "use strict";
    var localSettings = Windows.Storage.ApplicationData.current.localSettings,
        localFolder = Windows.Storage.ApplicationData.current.localFolder;

    setLocalSettings();
    function setLocalSettings() {
        localFolder.getFileAsync('dataFile.json').then(function () {
            //exist
            getSettingsFromFile();
        }, function () {
            // doesn't exist
            var composite = new Windows.Storage.ApplicationDataCompositeValue();
                composite["securityMode"] = true;
                composite["savedPath"] = "";
                composite["backgroundImage"] = "";
                localSettings.values["LocalCompositeSetting"] = composite;
                writeSettingsToFile();
        });
    }

    function writeSettingsToFile() {
        localFolder.createFileAsync('dataFile.json', Windows.Storage.CreationCollisionOption.replaceExisting).
        then(function (file) {
            return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(localSettings.values["CompositeSetting"]));
        }).done(function () { });
    }
    function getSettingsFromFile() {
        localFolder.getFileAsync("dataFile.json")
          .then(function (file) {
              return Windows.Storage.FileIO.readTextAsync(file);
          }).done(function (settings) {
              // Data is contained in timestamp
          }, function () {
              // Timestamp not found
          });
    }

})();