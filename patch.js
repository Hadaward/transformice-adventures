{
            const __define = define;
            globalThis.define = function(params, callback) {
                return __define(params, function(...defargs) {
                    const proto801 = defargs[params.indexOf("./reseau/ProtoM801")]?.default;
                    const module801 = defargs[params.indexOf("./Module801")]?.default;
                    const interfaceTalents = defargs[params.indexOf("../interfaces/InterfaceTalents")]?.default;
                    const boutonEtat = defargs[params.indexOf(params.find(p => p.endsWith("I_BoutonEtat")))]?.I_BoutonEtat;
                    
                    if (boutonEtat) {
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
                    if (proto801 && module801) {
                        proto801.ajouterPaquet = function (IDENTIFIANT, FONCTION, ECRASER) {
                            if (IDENTIFIANT == 0x606 && this.indexPaquetLecture[IDENTIFIANT]) {
                                //this.indexPaquetLecture[IDENTIFIANT] = FONCTION;
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
                    }
                    if (interfaceTalents) {
                        interfaceTalents.prototype.initialisation = function (MSG) {
                            var _this = this;
                            var codeTypeArbres = MSG.l8();
                            for (var _i = 0, _a = Object.keys(this.indexTypesArbres); _i < _a.length; _i++) {
                                var codeTypeArbreEnCours = _a[_i];
                                var texteTypeArbre = this.indexTypesArbres[codeTypeArbreEnCours];
                                var estTypeArbreSelectionne = +codeTypeArbreEnCours == codeTypeArbres;
                                texteTypeArbre.style.backgroundColor = estTypeArbreSelectionne ? "#44662c" : "#00000050";
                                texteTypeArbre.activerSouris(!estTypeArbreSelectionne);
                            }
                            var typeArbresDifferent = this.typeArbresEnCours != codeTypeArbres;
                            this.typeArbresEnCours = codeTypeArbres;
                            if (typeArbresDifferent) {
                                this.conteneurListeArbres.vider();
                                this.paliers = {};
                            }
                            this.arbres = {};
                            this.talents = {};
                            this.talentEnCours = MSG.l16();
                            var nbArbres = MSG.l16();
                            for (var i = 0; i < nbArbres; i++) {
                                var infoArbre = {};
                                infoArbre.id = MSG.l16();
                                infoArbre.paliers = [];
                                var nbTalents = MSG.l8();
                                for (var i_1 = 0; i_1 < nbTalents; i_1++) {
                                    var infoTalent = {
                                        talent: MSG.l16(),
                                        arbre: infoArbre.id,
                                        palier: i_1 + 1,
                                        estPossede: MSG.lBool(),
                                        debloquable: MSG.lBool()
                                    };
                                    infoArbre.paliers.push(infoTalent);
                                    this.talents[infoTalent.talent] = infoTalent;
                                }
                                this.arbres[infoArbre.id] = infoArbre;
                                if (typeArbresDifferent) {
                                    var infoConteneurArbre = this.afficherArbre(infoArbre);
                                    this.paliers[infoArbre.id] = infoConteneurArbre.paliers;
                                    this.conteneurListeArbres.ajouterElement(infoConteneurArbre.arbre);
                                }
                                else {
                                    for (var _b = 0, _c = Object.keys(this.paliers[infoArbre.id]); _b < _c.length; _b++) {
                                        var clePalier = _c[_b];
                                        if (isNaN(clePalier)) {
                                            continue;
                                        }
                                        var codePalier = parseInt(clePalier, 10);
                                        var infoTalent = infoArbre.paliers[codePalier - 1];
                                        var infoPaliers = this.paliers[infoArbre.id][codePalier];
                                        this.majApparenceTalent(infoPaliers.image, infoTalent);
                                    }
                                }
                            }
                            if (typeArbresDifferent) {
                                this.conteneurListeArbres.defHauteur(320);
                            }
                            this.pointsADepenser = MSG.l16();
                            this.champNbPointsADepenser.defTexte(this.pointsADepenser);
                            this.niveau = MSG.l16();
                            this.experienceEnCours = MSG.l32s();
                            this.experienceRequise = MSG.l32s();
                            this.champNiveau.defTexte(this.niveau);
                            this.jaugeExperience.defCSS("width", (this.experienceEnCours * 100 / this.experienceRequise) + "%");
                            this.champJauge.defTexte(this.experienceEnCours + " / " + this.experienceRequise);
                            this.conteneurDescriptionTalentEtBoutonDepense.vider();
                            if (this.talentEnCours != 0) {
                                this.imageTalent.chargerImage(TFMAdventure_1.default.recupImageDistance("interface/talent/" + this.talentEnCours + ".png"));
                                this.titreTalent.defTexte(Trad801_1.default.trad("$talent." + this.talentEnCours + ".nom"));
                                this.descriptionTalent.defTexte(Trad801_1.default.trad("$talent." + this.talentEnCours + ".description"));
                                this.conteneurDescriptionTalentEtBoutonDepense.ajouterElement(this.conteneurDescriptionTalent);
                                var infoTalentEnCours = this.talents[this.talentEnCours];
                                if (infoTalentEnCours) {
                                    var palierEnCours = infoTalentEnCours.palier;
                                    var prixTalent = 1 + Math.round(2 * (palierEnCours - 1) / 3);
                                    if ([2, 3, 5, 6].indexOf(palierEnCours) != -1) {
                                        var palierAutreTalentDeMemeNiveau = palierEnCours + ((palierEnCours == 2 || palierEnCours == 5) ? 1 : -1);
                                        if (this.arbres[infoTalentEnCours.arbre].paliers[palierAutreTalentDeMemeNiveau - 1].estPossede) {
                                            prixTalent = 0;
                                        }
                                    }
                                    this.boutonAcquisitionTalent.defTexte("" + prixTalent);
                                    this.conteneurDescriptionTalentEtBoutonDepense.ajouterElement(this.boutonAcquisitionTalent);
                                    if (infoTalentEnCours.debloquable) {
                                        this.boutonAcquisitionTalent.desactiver(false);
                                        this.boutonAcquisitionTalent.rendreCliquable(function () {
                                            var infoTalentEnCours = _this.talents[_this.talentEnCours];
                                            if (infoTalentEnCours) {
                                                TFMAdventure_1.default.envoyer(ProtoADV_1.default.demandeActivationTalent(infoTalentEnCours.arbre, infoTalentEnCours.palier));
                                            }
                                        });
                                    }
                                    else {
                                        this.boutonAcquisitionTalent.desactiver(true);
                                    }
                                }
                            }
                        };
                    }
                    callback(...defargs);
                });
            }
        }