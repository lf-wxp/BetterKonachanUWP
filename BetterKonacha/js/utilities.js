(function () {
    "use strict";
    function setBackground(url) {
        var existCustomStyle = document.querySelector('.existCustomStyle');
        if (!existCustomStyle) {
            var existCustomStyle = document.createElement("style");
            existCustomStyle.className = 'existCustomStyle';
            document.head.appendChild(existCustomStyle);
        }
        var rules = existCustomStyle.sheet.rules || existCustomStyle.sheet.cssRules;
        if (rules.length) {
            existCustomStyle.sheet.removeRule(0);
        }
        existCustomStyle.sheet.addRule('body:after', 'background-image:url(' + url + ')')
    }

    function messageOutIn() {
        var flyoutMessage = document.querySelector('.messageFlyout'),
            pageContain = document.querySelector('.pageContain');
        flyoutMessage.winControl.show(pageContain);
        WinJS.Promise.timeout(2000).done(function () {
            flyoutMessage.winControl.hide();
        });
    }

    WinJS.Namespace.define('Utilities', {
        setBackground: setBackground,
        messageOutIn: messageOutIn,
        navBarSwitch: WinJS.UI.eventHandler(function (ev) {
            var command = ev.currentTarget,
                parentNode = command.parentNode,
                children = parentNode.children;
            [].forEach.call(children, function (value) {
                value.classList.remove('active');
            });
            command.classList.add('active');
        })
    });
})();