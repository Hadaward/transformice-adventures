# Transformice Adventures
This is my job to help the Transformice Adventures community, a game that was developed in HTML 5 by Atelier 801 and that is still in the demo version, containing several bugs that disturb the players. My efforts are to fix most of the bugs present in the game.

I intend to release extensions for browsers that support Tampermonkey and Greasemonkey, as well as fixes for the steam version and create my own standalone.

## Steam
To fix the bugs in the steam standalone, just download the executable file [win/linux]_tfma_steam.exe and run it only once. It will get the installation location of the game and make the necessary changes to load the patch.js file. The binary was developed in Nim and its code is available at [steam](/../../tree/steam) branch

:warning: Only windows supported atm.

## Browser Extensions
Both GreaseMonkey (FireFox) and TamperMoneky (Chrome) are now supported. The script used is compatible with both extensions and is available to anyone on the [extension](/../../tree/extension) branch

## patch.js
This file is dynamically loaded by extensions and contains code that is injected into the game to make corrections. The steam version has its standalone modified to load this file using the same principle as the extensions.
