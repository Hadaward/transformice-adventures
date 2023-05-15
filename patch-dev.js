'use strict';
(async function() {
    document.head.querySelector("style").textContent += `.I_BoutonEtat .croix-active {position: relative;width:1em;height:1em;min-width:1em;min-height:1em;background-color: #281b12;border-radius: 0.2em;box-shadow: inset 1px 1px 1px #000000CC, inset -1px -1px 1px #927A5A;align-self: center;}.I_BoutonEtat .croix-active::after{position:absolute;content:'\\274c';font-size: 0.7em;margin-left:0.10em;color:#7BBD40;font-weight: bold;}
    .I_Fenetre .cadre.no-title {
        top: calc(-50px);
        height: calc(100% - 100px);
    }
    .I_Fenetre .bouton-fermer.no-title {
        top: calc(50px - 98px - 1.25em);
        right: -65px;
    }`;

    const transformiceClasses = {
        queued: [],
        onPush: null,
        looking: true,
        unqueue: function() {
            if (typeof this.onPush !== 'function')
                return;

            while (this.queued.length > 0 && this.looking) {
                this.looking = this.onPush(this.queued.pop(0));
            }
        },
        push: function(...items) {
            if (!this.looking)
                return;

            if (typeof this.onPush !== 'function') {
                this.queued.push(...items);
            } else {
                this.looking = this.onPush(...items);
            }
        }
    }

    /* Override require.js global define function */
    const _define = define;
    window.define = function(params, callback) {
        return _define(params, function(...defargs) {
            transformiceClasses.push([params, defargs]);
            transformiceClasses.unqueue();
            callback(...defargs);
        });
    }

    /* Override require.js global require function */
    const _require = require;
    window.require = function(params, callback) {
        return _require(params, function(...defargs) {
            callback(...defargs);
            transformiceClasses.push([params, defargs]);
            transformiceClasses.unqueue();
        });
    }

    const currentURL = new URL('.', document.currentScript.src).href;
    const { initPatch, findTransformiceClass } = await import(`${currentURL}tapl/tapl.js`);

    transformiceClasses.onPush = findTransformiceClass;

    await initPatch();

})();