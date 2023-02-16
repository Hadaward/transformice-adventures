'use strict';
(async () => {
    const { TFMAPI } = await import(new URL('.', document.currentScript.src).href + 'api/api.js');

    await TFMAPI.loadMetadata();

    TFMAPI.addEventListener("game-language-changed", function(langue) {
        localStorage.setItem("game-language", langue.code);
    });

    TFMAPI.addEventListener("login-screen", async function(enabled) {
        if (enabled) {
            const response = await TFMAPI.changeGameLanguage(localStorage.getItem("game-language") || TFMAPI.getCurrentLangueCode());

            if (!response.ok) {
                console.warn(response.error);
            }

            if (localStorage.getItem("patch-load") === null) {
                localStorage.setItem("patch-load", true);
                window.location.reload();
            }
        }
    });

    /* Fix CheckBox style */
    document.head.querySelector("style").textContent += `.I_BoutonEtat .croix-active {position: relative;width:1em;height:1em;min-width:1em;min-height:1em;background-color: #281b12;border-radius: 0.2em;box-shadow: inset 1px 1px 1px #000000CC, inset -1px -1px 1px #927A5A;align-self: center;}.I_BoutonEtat .croix-active::after{position:absolute;content:'\\274c';font-size: 0.7em;margin-left:0.10em;color:#7BBD40;font-weight: bold;}`;

    /* Override require.js global define function */
    const _define = define;
    window.define = function(params, callback) {
        return _define(params, function(...defargs) {
            TFMAPI.doSearch(params, defargs);
            callback(...defargs);
        });
    }

    /* Override require.js global require function */
    const _require = require;
    window.require = function(params, callback) {
        return _require(params, function(...defargs) {
            callback(...defargs);
            TFMAPI.doSearch(params, defargs);
        });
    }
})();
