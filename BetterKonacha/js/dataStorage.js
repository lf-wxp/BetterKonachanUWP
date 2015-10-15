(function () {
    "use strict";
    var localSettings = Windows.Storage.ApplicationData.current.localSettings,
        localFolder = Windows.Storage.ApplicationData.current.localFolder,
        roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings,
        roamingFolder = Windows.Storage.ApplicationData.current.roamingFolder,
        defaultSetting = {
            'securityMode': true,
            'savedPath': Windows.Storage.KnownFolders.savedPictures.path,
            'backgroundImage': '/images/backgrounds/default0.jpg'
        },
        roamingSettingKeys = ['securityMode'];

    WinJS.Namespace.define('Settings', {
        defaultSetting: defaultSetting,
        getSettingsFromFile: getLocalSettingsFromFile,
        setLocalSettings: setLocalSettings,
        initializeSettings: initializeSettings
    })

    // roaming data changed
    Windows.Storage.ApplicationData.current.addEventListener('datachanged', function () {
        getRoamingSettingsFromFile();
    });

    function writeRoamingSettingsToFile() {
        var composite = new Windows.Storage.ApplicationDataCompositeValue();

        roamingSettingKeys.forEach(function (value, index, array) {
            composite[value] = defaultSetting[value];
        });

        roamingSettings.values["RoamingCompositeSetting"] = composite;
        roamingFolder.createFileAsync('settingRoamingJson.json', Windows.Storage.CreationCollisionOption.replaceExisting).
        then(function (file) {
            return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(roamingSettings.values["RoamingCompositeSetting"]));
        }).done(function () { });
    }

    function getRoamingSettingsFromFile() {
        return roamingFolder.getFileAsync("settingRoamingJson.json")
          .then(function (file) {
              return Windows.Storage.FileIO.readTextAsync(file);
          }).done(function (settingsString) {
              var settingsObject = JSON.parse(settingsString);
              for (var i in settingsObject) {
                  defaultSetting[i] = settingsObject[i];
              }
              writeLocalSettingsToFile();
          });
    }

    //initialize the setting 
    function initializeSettings() {
        return new WinJS.Promise(function (complete) {
            localFolder.getFileAsync('settingLocalJson.json').then(function () {
                //exist
                getLocalSettingsFromFile().done(function () {
                    complete();
                })
            }, function () {
                // doesn't exist
                setLocalSettings();
            })
        });

    }
    function setLocalSettings(setting) {
        //setting param is a object 
        // like  defaultSetting
        var setting = setting ? setting : {};
        for (var i in setting) {
            defaultSetting[i] = setting[i];
        }
        writeLocalSettingsToFile();
    }

    function writeLocalSettingsToFile() {
        var composite = new Windows.Storage.ApplicationDataCompositeValue();

        for (var i in defaultSetting) {
            composite[i] = defaultSetting[i];
        }

        localSettings.values["LocalCompositeSetting"] = composite;

        localFolder.createFileAsync('settingLocalJson.json', Windows.Storage.CreationCollisionOption.replaceExisting).
        then(function (file) {
            return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(localSettings.values["LocalCompositeSetting"]));
        }).done(function () {
            writeRoamingSettingsToFile();
        });
    }
    function getLocalSettingsFromFile() {
        return localFolder.getFileAsync("settingLocalJson.json")
         .then(function (file) {
             return Windows.Storage.FileIO.readTextAsync(file);
         }).then(function (settingsString) {
             var settingsObject = JSON.parse(settingsString);
             for (var i in settingsObject) {
                 defaultSetting[i] = settingsObject[i];
             }
         });
    }

})();