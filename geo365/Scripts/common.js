'use strict';

var geo365 = geo365 || {};


geo365.common = function () {
    var replaceInvalidChars = function (word) {
        var invalids = [{ invalid: "_x0020_", replacement:  " " }];
        
        invalids.forEach(function (e) {
            word = word.replace(e.invalid, e.replacement);
        })
        return word;
    };

    var getGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    };
    return {
        replaceInvalidChars: replaceInvalidChars,
        getGuid: getGuid
    };
}();