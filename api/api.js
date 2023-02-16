import { Dispatcher } from './event.js';

export const TFMAPI = new class extends Dispatcher {
    constructor() {
        super();

        this.classes = {};
        this.metadata = null;
        this._searchData = new Map();
        this._callOnFindingClass = new Map();
        this._callOnFindingClasses = new Map();

        this.lookForClass("./Module801", "Module801");
        this.lookForClass("./reseau/ProtoM801", "Proto801");
        this.lookForClass("InterfaceTalents", "InterfaceTalents");
        this.lookForClass("I_BoutonEtat", "I_BoutonEtat", "I_BoutonEtat");
        this.lookForClass("Trad801", "Trad801");
        this.lookForClass("InterfaceLoginADV", "InterfaceLoginADV");
        this.lookForClass("Communaute", "Communaute");
        this.lookForClass("InterfaceQueteADV", "InterfaceQueteADV");
        this.lookForClass("dist/Transformice-adventure-client/src/_tfmAdventure/TFMAdventure", "TFMAdventure");

        this.callOnceWhenFindingClass("InterfaceLoginADV", (login) => {
            const afficher = login.afficher.bind(login);
            login.afficher = (OUI) => {
                afficher(OUI);
    
                if (OUI)
                    this.dispatchEvent("login-screen", OUI);
            }
        });
    
        this.callOnceWhenFindingClass("TFMAdventure", (tfm) => {
            tfm.DEBUG = true;
    
            const authFunc = tfm.prototype.authentification.bind(tfm.instance);
            tfm.prototype.authentification = (...args) => {
                authFunc(...args);
                this.dispatchEvent("login");
            }
        });

        this.callOnceWhenFindingClass("InterfaceTalents", (interfaceTalents) => {
            const afficher = interfaceTalents.afficher.bind(interfaceTalents);
            interfaceTalents.afficher = function (MSG) {
                afficher(MSG);
                interfaceTalents.instance.conteneurListeArbres.defHauteur(320);
            }
        });

        this.callOnceWhenFindingClass("I_BoutonEtat", (boutonEtat) => {
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
        });

        this.callOnceWhenFindingClasses(["Module801", "Proto801"], (module801, proto801) => {
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
        })
    }

    async loadMetadata() {
        if (this.metadata !== null)
            return;

        const baseURL = new URL('..', import.meta.url).href;
        const response = await fetch(`${baseURL}/metadata.json`);
        this.metadata = await response.json();

        for (const modulePath of this.metadata.modules) {
            await import(modulePath);
        }
    }

    sendLocalMessage(message) {
        if (!this.classes.hasOwnProperty('TFMAdventure')) {
            throw new Error('It is not possible to register commands before the API loads the TFMAdventure class.');
        }
        if (!this.classes.TFMAdventure.instance.chat) {
            throw new Error('It is not possible to register commands before the player logs in. Wait for the "login" event to fire.');
        }
        if (typeof message !== 'string') {
            throw new TypeError('Message must be a "string".');
        }
        this.classes.TFMAdventure.instance.chat.ajouterMessage(message);
    }

    registerCommand(name, handler) {
        if (!this.classes.hasOwnProperty('TFMAdventure')) {
            throw new Error('It is not possible to register commands before the API loads the TFMAdventure class.');
        }
        if (!this.classes.TFMAdventure.instance.chat) {
            throw new Error('It is not possible to register commands before the player logs in. Wait for the "login" event to fire.');
        }
        if (typeof name !== 'string') {
            throw new TypeError('Command name must be a "string".');
        }
        if (typeof handler !== 'function') {
            throw new TypeError('Command handler must be a "function(argsArray)".');
        }
        this.classes.TFMAdventure.instance.chat.ajouterCommande(name, handler);
    }

    getCurrentLangueCode(upper = false) {
        if (!this.classes.hasOwnProperty('Trad801')) {
            throw new Error('It is not possible to get current language code before the API loads the Trad801 class.');
        }

        const code = this.classes.Trad801.langueEnCours.code;
        return upper && code.toUpperCase() || code;
    }

    changeGameLanguage(id) {
        if (!this.classes.hasOwnProperty('Trad801')) {
            throw new Error('It is not possible to change game language before the API loads the Trad801 class.');
        }

        if (!TFMAPI.classes.hasOwnProperty('Communaute')) {
            throw new Error('It is not possible to change game language before the API loads the Communaute class.');
        }

        return new Promise(resolve => {
            try {
                this.classes.Trad801.chargerFichierLangue(id, "tfmadv", () => {
                    if (Object.keys(this.classes.Trad801.indexLangue[id].traductions).length === 0) {
                        resolve({ok: false, error: new Error('Unable to get translations for the specified language.')});
                        return;
                    }

                    this.classes.Trad801.selectionnerLangue(id);

                    for (const element of document.querySelectorAll("*[data-trad]")) {
                        this.classes.Trad801.definirTraduction(element, element.dataset.trad, element.dataset.tradType);
                    }

                    resolve({ok: true});

                    this.dispatchEvent("game-language-changed", {code: this.classes.Trad801.langueEnCours.code, name: this.classes.Communaute.recupParIdentifiant(this.classes.Trad801.langueEnCours.code).nomLangue});
                });
            } catch (error) {
                resolve({ok: false, error});
            }
        });
    }

    lookForClass(path, name, exports = "default") {
        this._searchData.set(path, { name, exports });
    }

    callOnceWhenFindingClass(name, callback) {
        this._callOnFindingClass.set(name, callback);
    }

    callOnceWhenFindingClasses(names, callback) {
        this._callOnFindingClasses.set(names, callback);
    }

    doSearch(params, defargs) {
        for(const [path, data] of this._searchData.entries()) {
            const result = defargs[params.indexOf(params.find(p => p.endsWith(path)))];

            if (result && result[data.exports]) {
                this.classes[data.name] = result[data.exports];
                this.dispatchEvent("class-found", data.name, result[data.exports]);
                this._searchData.delete(path);

                if (this._callOnFindingClass.has(data.name)) {
                    this._callOnFindingClass.get(data.name)(result[data.exports]);
                    this._callOnFindingClass.delete(data.name);
                }

                for(const names of this._callOnFindingClasses.keys()) {
                    if (names.includes(data.name) && names.every(name => this.classes[name] !== undefined)) {
                        const classes = names.map(name => this.classes[name]);

                        this._callOnFindingClasses.get(names)(...classes);
                    }
                }
            }
        }
    }
}