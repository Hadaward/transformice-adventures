/* DO NOT USE THIS PATCH, MAY CONTAIN BUGS */
/* THIS IS FOR DEV PURPOSES */

'use strict';
{
    /* Fix CheckBox style */
    document.head.querySelector("style").textContent += `.I_BoutonEtat .croix-active {position: relative;width:1em;height:1em;min-width:1em;min-height:1em;background-color: #281b12;border-radius: 0.2em;box-shadow: inset 1px 1px 1px #000000CC, inset -1px -1px 1px #927A5A;align-self: center;}.I_BoutonEtat .croix-active::after{position:absolute;content:'\\274c';font-size: 0.7em;margin-left:0.10em;color:#7BBD40;font-weight: bold;}`;

    /* Search Classes to apply fixes */
    const finder = {
        find(params, defargs) {
            const module801 = defargs[params.indexOf("./Module801")];
            const proto801 = defargs[params.indexOf("./reseau/ProtoM801")];
            const interfaceTalents = defargs[params.indexOf("../interfaces/InterfaceTalents")];
            const boutonEtat = defargs[params.indexOf(params.find(p => p.endsWith("I_BoutonEtat")))];

            if (module801 && proto801)
                this.fixChat(module801.default, proto801.default);

            console.log(params.indexOf(params.find(p => p.endsWith("InterfaceTalents"))));

            if (boutonEtat)
                this.fixCheckBoxes(boutonEtat.I_BoutonEtat);
        },

        fixChat(module801, proto801) {
            proto801.ajouterPaquet = function (IDENTIFIANT, FONCTION, ECRASER) {
                if (IDENTIFIANT == 0x606 && this.indexPaquetLecture[IDENTIFIANT]) {
                    return;
                }
                if (ECRASER === void 0) { ECRASER = false; }
                if (!ECRASER && this.indexPaquetLecture[IDENTIFIANT]) {
                    throw new Error("Impossible d'avoir plusieurs paquets avec le même identifiant : 0x" + IDENTIFIANT.toString(16) + " (" + (IDENTIFIANT >> 8) + ", " + (IDENTIFIANT & 0xFF) + ")");
                }
                this.indexPaquetLecture[IDENTIFIANT] = FONCTION;
            };
            proto801.ajouterPaquet(proto801.fusionCode(6, 6), function (MSG) {
                var auteur = MSG.lChaine();
                var message = MSG.lChaine();
                message = message.replace(/&lt;/g, "<");
                module801.instance.messageChat(message, auteur);
            });
        },

        fixInterfaceTalents(interfaceTalents) {
            console.log(interfaceTalents);
        },

        fixCheckBoxes(boutonEtat) {
            boutonEtat.prototype.cocher = function (OUI, DECLENCHER) {
                if (DECLENCHER === void 0) { DECLENCHER = false; }
                this.estCoche = OUI;
                if (!this.croix.parentElement)
                    this.fondCroix.appendChild(this.croix);
                if (OUI) {
                    this.croix.classList.add("croix-active");
                }
                else {
                    this.croix.classList.remove("croix-active");
                }
                if (DECLENCHER && this.fonctionClique) {
                    this.fonctionClique(this.estCoche);
                }
                return this;
            };
        }
    };

    /* Override require.js global define function */
    const _define = define;
    window.define = function(params, callback) {
        return _define(params, function(...defargs) {
            finder.find(params, defargs);
            callback(...defargs);
        });
    }
}
