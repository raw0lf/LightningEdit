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

        document.getElementById("loopifyButton").addEventListener("click", function () {
            csInterface.evalScript("loopify()");
        });

        document.getElementById("lilShakeButton").addEventListener("click", function () {
            csInterface.evalScript("lilShake()");
        });
    }

    init();
}());
