(function () {
    "use strict";
    WinJS.UI.Pages.define('/pages/download/download.html', {
        ready: function (element, options) {
            // style the ui 
            var myAppBar = document.querySelector('.myAppBar'),
                fixName = document.querySelector('.fixName');
            fixName.textContent = 'Download List';
            myAppBar.style.display = 'none';

        }

    });
})();