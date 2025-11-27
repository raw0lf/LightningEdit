(function () {
    'use strict';

    var csInterface = new CSInterface();

    function init() {
        document.getElementById("syncButton").addEventListener("click", function () {
            csInterface.evalScript("rebuildAndSync()");
        });

        document.getElementById("undoButton").addEventListener("click", function () {
            csInterface.evalScript("universalUndo()");
        });

        document.getElementById("blurifyButton").addEventListener("click", function () {
            csInterface.evalScript("blurify()");
        });
    }

    init();
}());
