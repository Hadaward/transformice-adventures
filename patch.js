'use strict';
{
    const patchMetaData = {
        version: 1.1,
        changelog: [
            "Added command <</langue [code]>>",
            "Press <<F>> to open emoji roulette",
            "⚠ <</langue>> still doesn't translate the game completely"
        ]
    }
    /* Fix CheckBox style */
    document.head.querySelector("style").textContent += `.I_BoutonEtat .croix-active {position: relative;width:1em;height:1em;min-width:1em;min-height:1em;background-color: #281b12;border-radius: 0.2em;box-shadow: inset 1px 1px 1px #000000CC, inset -1px -1px 1px #927A5A;align-self: center;}.I_BoutonEtat .croix-active::after{position:absolute;content:'\\274c';font-size: 0.7em;margin-left:0.10em;color:#7BBD40;font-weight: bold;}`;

    /* Search Classes to apply fixes */
    const finder = {
        find(params, defargs) {
            const module801 = defargs[params.indexOf("./Module801")];
            const proto801 = defargs[params.indexOf("./reseau/ProtoM801")];
            const interfaceTalents = defargs[params.indexOf(params.find(p => p.endsWith("InterfaceTalents")))];
            const boutonEtat = defargs[params.indexOf(params.find(p => p.endsWith("I_BoutonEtat")))];
            const trad801 = defargs[params.indexOf(params.find(p => p.endsWith("Trad801")))];

            if (trad801 && trad801.default !== undefined)
                handler.trad801 = trad801.default;

            if (module801 && proto801)
                this.fixChat(module801.default, proto801.default);

            if (interfaceTalents)
                this.fixInterfaceTalents(interfaceTalents.default);

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
            const afficher = interfaceTalents.afficher.bind(interfaceTalents);
            interfaceTalents.afficher = function (MSG) {
                afficher(MSG);
                interfaceTalents.instance.conteneurListeArbres.defHauteur(320);
            }
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

    /* Responsible for activating hidden features */
    const handler = {
        trad801: null,
        patchLogo: {},

        registerCommands(tfmAdventure) {
            tfmAdventure.default.instance.chat.ajouterCommande("langue", (RESTE) => {
                const langue = RESTE.join("");
                this.trad801.chargerFichierLangue(langue, "tfmadv", () => {
                    this.trad801.selectionnerLangue(langue);
                })
            });
        },

        appendPatchLogo() {
            const container = document.createElement("div");
            container.className = "I_Conteneur fond I_Fenetre";
            container.style = "user-select: auto; pointer-events: auto; display: flex; align-content: flex-start; flex-flow: column nowrap; align-items: center; min-height: 40px; position: absolute; top: 1%; margin-left: 2.5em;";
            
            const title = document.createElement("span");
            title.className = "titre";
            title.style = "white-space: nowrap; user-select: none; pointer-events: none;";
            title.textContent = `Patch v${patchMetaData.version}`;

            const cadre = document.createElement("div");
            cadre.className = "cadre";
            cadre.style = "user-select: none; pointer-events: none;";

            const changelog = [];

            for (const desc of patchMetaData.changelog) {
                const span = document.createElement("span");
                span.className = "I_Texte";
                span.style = "user-select: auto; pointer-events: auto; display: flex; flex-shrink: 0; cursor: pointer; width: 100%; margin: 0.2em;white-space: pre;";
                span.innerHTML = `<B>-</B> ${desc.replace(/\<\</g, '<span style="background-color:rgba(97, 68, 47, 0.8);white-space: pre;border-radius: 4.3px">').replace(/\>\>/g, '</span>')}`;

                changelog.push(span);
            }

            container.append(title, cadre, ...changelog);
            container.style.display = "none";

            document.body.append(container);

            const img = document.createElement("img");
            img.className = "I_Image";
            img.src = "http://data.atelier801.com/tfmadv/interface/metiers/icone-metier-3.png";
            img.style = "user-select: none; pointer-events: auto; background-color: transparent; width: 32px; height: 32px; position: absolute; top: 0.5em; left: 3em; cursor: pointer; z-index: 0;";
            document.body.append(img);

            img.onmouseover = function() {
                container.style.display = "block";
            }

            container.onmouseleave = function() {
                container.style.display = "none";
            }

            this.patchLogo.container = container;
            this.patchLogo.image = img;
        },

        removePatchLogo() {
            document.body.removeChild(this.patchLogo.container);
            document.body.removeChild(this.patchLogo.image);
        },

        updateTFMAdventure(tfmAdventure) {
            tfmAdventure.default.DEBUG = true;

            const authFunc = tfmAdventure.default.prototype.authentification.bind(tfmAdventure.default.instance);
            tfmAdventure.default.prototype.authentification = (...args) => {
                authFunc(...args);
                this.removePatchLogo();
                this.registerCommands(tfmAdventure);
            }
            
            this.appendPatchLogo();
        }
    }

    /* Override require.js global define function */
    const _define = define;
    window.define = function(params, callback) {
        return _define(params, function(...defargs) {
            finder.find(params, defargs);
            callback(...defargs);
        });
    }

    /* Override require.js global require function */
    const _require = require;
    window.require = function(params, callback) {
        return _require(params, function(...defargs) {
            callback(...defargs);
            
            if (params[0] === "dist/Transformice-adventure-client/src/_tfmAdventure/TFMAdventure") {
                handler.updateTFMAdventure(defargs[0]);
            }
        });
    }
}
