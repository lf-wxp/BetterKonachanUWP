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
    
    WinJS.Namespace.define('Utilities', {
        setBackground: setBackground,
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