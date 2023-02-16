'use strict';
{
    const patchMetaData = {
        version: 1.2,
        changelog: [
            "Added command <</langue [code]>>",
            "Press <<F>> to open emoji roulette",
            "Added language selection menu to login screen"
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
            const loginAdv = defargs[params.indexOf(params.find(p => p.endsWith("InterfaceLoginADV")))];
            const communaute = defargs[params.indexOf(params.find(p => p.endsWith("Communaute")))];

            if (loginAdv && loginAdv.default !== undefined && handler.loginAdv === null) {
                handler.loginAdv = loginAdv.default;
                const afficher = handler.loginAdv.afficher.bind(handler.loginAdv);
                handler.loginAdv.afficher = function(...args) {
                    afficher(...args);

                    if (args[0])
                        handler.onLoginScreen();
                }
            }

            if (communaute && communaute.default !== undefined && handler.communaute === null) {
                handler.communaute = communaute.default;
            }

            if (trad801 && trad801.default !== undefined && handler.trad801 === null)
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

    /* Create interface for patch changelog and language menu */
    const interfaces = {
        parent: null,
        elements: {
            patchChangelog: {
                container: null,
                icon: null
            },
            languageMenu: {
                icon: null,
                container: null,
                isMouseOut: {
                    icon: true,
                    container: true
                }
            }
        },

        createPatchChangelog() {
            if (this.elements.patchChangelog.icon !== null)
                return;

            this.elements.patchChangelog.container = document.createElement("div");
            this.elements.patchChangelog.container.className = "I_Conteneur fond I_Fenetre";
            this.elements.patchChangelog.container.style = "user-select: auto; pointer-events: auto; display: none; align-content: flex-start; flex-flow: column nowrap; align-items: center; min-height: 40px; position: absolute; top: 1%; margin-left: 2.5em;";

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

            this.elements.patchChangelog.container.append(title, cadre, ...changelog);

            this.elements.patchChangelog.icon = document.createElement("img");
            this.elements.patchChangelog.icon.className = "I_Image";
            this.elements.patchChangelog.icon.src = "http://data.atelier801.com/tfmadv/interface/metiers/icone-metier-3.png";
            this.elements.patchChangelog.icon.style = "user-select: none; pointer-events: auto; background-color: transparent; width: 32px; height: 32px; position: absolute; top: 0.5em; left: 3em; cursor: pointer; z-index: 0;";

            this.elements.patchChangelog.icon.onmouseover = () => {
                this.elements.patchChangelog.container.style.display = "block";
            }

            this.elements.patchChangelog.container.onmouseleave = () => {
                this.elements.patchChangelog.container.style.display = "none";
            }
        },

        createLanguageMenu() {
            if (this.elements.languageMenu.icon !== null)
                return;

            this.elements.languageMenu.icon = document.createElement("img");
            this.elements.languageMenu.icon.className = "I_Image";
            this.elements.languageMenu.icon.src = `https://data.atelier801.com/tfmadv/interface/drapeaux/${handler.trad801.langueEnCours.code.toUpperCase()}.png`;
            this.elements.languageMenu.icon.style = "user-select: none; pointer-events: auto; background-color: transparent; width: 130px; height: 100px; position: absolute; top: 0.5em; right: 0.5em; cursor: pointer; z-index: 0;";

            this.elements.languageMenu.container = document.createElement("div");
            this.elements.languageMenu.container.className = "I_Conteneur fond I_Fenetre";
            this.elements.languageMenu.container.style = "user-select: auto; pointer-events: auto; display: none; align-content: flex-start; flex-flow: column nowrap; align-items: center; min-height: 40px; max-height: 300px; width: 300px; position: absolute; top: 12.5%; right: 0.5em;";

            const title = document.createElement("span");
            title.className = "titre";
            title.style = "white-space: nowrap; user-select: none; pointer-events: none;";
            title.textContent = `${handler.trad801.trad('$text.langue')}`;

            const cadre = document.createElement("div");
            cadre.className = "cadre";
            cadre.style = "user-select: none; pointer-events: none;";

            const iconContainer = document.createElement("div");
            iconContainer.style = "min-height: 40px; max-height: 300px; width: 300px; overflow-y: auto";

            this.elements.languageMenu.container.append(title, cadre, iconContainer);

            const loaded = [];

            for (const communaute of handler.communaute.listeCommunautes) {
                if (loaded.includes(communaute.nomLangue))
                    continue;

                loaded.push(communaute.nomLangue);

                const icon = document.createElement("img");
                icon.className = "I_Image";
                icon.style = "user-select: auto; float: left; pointer-events: auto; display: flex; flex-shrink: 0; cursor: pointer; width: 100%; margin: 0.2em;white-space: pre; width: 80px; height: 50px";
                icon.src = `https://data.atelier801.com/tfmadv/interface/drapeaux/${communaute.identifiant.toUpperCase()}.png`;

                icon.onclick = () => {
                    handler.changeGameLanguage(communaute.identifiant, (success) => {
                        if (success) {
                            this.elements.languageMenu.icon.src = `https://data.atelier801.com/tfmadv/interface/drapeaux/${handler.trad801.langueEnCours.code.toUpperCase()}.png`;
                            title.textContent = `${handler.trad801.trad('$text.langue')}`;
                        } else {
                            iconContainer.removeChild(icon);
                        }
                    });
                }

                iconContainer.append(icon);
            }

            this.elements.languageMenu.container.onmouseover = () => {
                this.elements.languageMenu.isMouseOut.container = false;
            }

            this.elements.languageMenu.container.onmouseleave = () => {
                this.elements.languageMenu.isMouseOut.container = true;
            }

            this.elements.languageMenu.icon.onmouseover = () => {
                this.elements.languageMenu.isMouseOut.icon = false;
            }

            this.elements.languageMenu.icon.onmouseleave = () => {
                this.elements.languageMenu.isMouseOut.icon = true;
            }

            this.parent.onclick = () => {
                if (this.elements.languageMenu.isMouseOut.container && this.elements.languageMenu.isMouseOut.icon) {
                    this.elements.languageMenu.container.style.display = "none";
                }
            }

            this.elements.languageMenu.icon.onclick = () => {
                this.elements.languageMenu.container.style.display = "flex";
            }
        },

        append() {
            this.createPatchChangelog();
            this.createLanguageMenu();

            this.parent.append(this.elements.patchChangelog.container, this.elements.patchChangelog.icon);
            this.parent.append(this.elements.languageMenu.icon, this.elements.languageMenu.container);
        },

        remove() {
            this.parent.removeChild(this.elements.patchChangelog.container);
            this.parent.removeChild(this.elements.patchChangelog.icon);
            this.parent.removeChild(this.elements.languageMenu.icon);
        }
    }

    /* Responsible for activating hidden features */
    const handler = {
        trad801: null,
        loginAdv: null,
        communaute: null,

        onLoginScreen() {
            interfaces.parent = document.body.querySelector("div");
            interfaces.append();
        },

        changeGameLanguage(id, callback) {
            try {
                this.trad801.chargerFichierLangue(id, "tfmadv", () => {
                    if (Object.keys(this.trad801.indexLangue[id].traductions).length === 0) {
                        if (callback)
                            callback(false);

                        return;
                    }

                    this.trad801.selectionnerLangue(id);

                    for (const element of document.querySelectorAll("*[data-trad]")) {
                        this.trad801.definirTraduction(element, element.dataset.trad);
                    }

                    if (callback)
                        callback(true);
                });
            } catch {
                if (callback)
                    callback(false);
            }
        },

        registerCommands(tfmAdventure) {
            tfmAdventure.default.instance.chat.ajouterCommande("langue", (RESTE) => {
                this.changeGameLanguage(RESTE.join(""), (success) => {
                    tfmAdventure.default.instance.chat.ajouterMessage(`${this.trad801.trad('$text.langue')}: ${this.communaute.recupParIdentifiant(this.trad801.langueEnCours.code).nomLangue}`);
                });
            });
        },

        updateTFMAdventure(tfmAdventure) {
            tfmAdventure.default.DEBUG = true;

            const authFunc = tfmAdventure.default.prototype.authentification.bind(tfmAdventure.default.instance);
            tfmAdventure.default.prototype.authentification = (...args) => {
                authFunc(...args);
                interfaces.remove();
                this.registerCommands(tfmAdventure);
            }
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
