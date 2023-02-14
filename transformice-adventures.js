// ==UserScript==
// @name         Transformice Adventures
// @run-at       document-idle
// @version      1.0
// @description  Fix Transformice Adventures issues
// @author       Hadaward
// @match        *://transformice-adventures.com/

(async function() {
    'use strict';
    if (window.location.protocol.startsWith('https')) {
        window.location.protocol = 'http';
        return;
    }

    const requireScript = document.querySelector('script[src*="lib/require.js"]');
    const script = document.createElement('script');
    script.src = 'https://hadaward.github.io/transformice-adventures/patch.js?' + Date.now();
    requireScript.parentNode.insertBefore(script, requireScript);
})();
