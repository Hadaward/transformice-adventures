// ==UserScript==
// @name         Transformice Adventures
// @namespace    transformice-adventures.com/
// @run-at       document-idle
// @version      1.0
// @description  Fix Transformice Adventures issues
// @author       Hadaward
// @match        http*://transformice-adventures.com/

// ==/UserScript==
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
