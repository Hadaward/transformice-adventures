import { Events, EventCollection, getTransformiceClass, doFindTransformiceClass, bindKeyboard } from "/tapl/tapl.js";

function patchEmojis() {
    const TFMAdventure = getTransformiceClass("TFMAdventure");
    const recupTextureDistante = TFMAdventure.recupTextureDistante;
    const recupImageDistance = TFMAdventure.recupImageDistance;

    TFMAdventure.recupImageDistance = function(url) {
        if (url.startsWith("interface/emote/")) {
            const id = Number(url.match(/\/T([0-9]+).png/)[1]);
            return `https://api.allorigins.win/raw?url=http://transformice.com/images/x_transformice/x_smiley/${id}.png`
        }

        return recupImageDistance(url);
    }

    TFMAdventure.recupTextureDistante = function(url) {
        if (url.startsWith("interface/emote/")) {
            return PIXI.Texture.fromImage(TFMAdventure.recupImageDistance(url));
        }

        return recupTextureDistante(url);
    }
}

function addNewEmojis(list) {
    const InterfaceEmoteADV = getTransformiceClass("InterfaceEmoteADV");
    const afficher = InterfaceEmoteADV.afficher.bind(InterfaceEmoteADV);

    InterfaceEmoteADV.afficher = function() {
        afficher();

        const Emote = InterfaceEmoteADV.instance.listeBtn[0].constructor;

        list.forEach(code => {
            setTimeout(() => {
                const emote = new Emote(code);
                InterfaceEmoteADV.instance.addChild(emote);
                InterfaceEmoteADV.instance.listeBtn.push(emote);

                if (InterfaceEmoteADV.estAffiche()) {
                    InterfaceEmoteADV.fermer();
                    InterfaceEmoteADV.afficher();
                }
            }, 150);
        })

        InterfaceEmoteADV.afficher = afficher;
    }
}

Events.addEventListener(EventCollection.EVENT_PRE_INIT, function() {
    doFindTransformiceClass({name: "InterfaceEmoteADV", path: "InterfaceEmoteADV", exports: "InterfaceEmoteADV"});
    doFindTransformiceClass({name: "MondeADV", path: "MondeADV", exports: "MondeADV"});
});

Events.addEventListener(EventCollection.EVENT_INIT, function() {
    patchEmojis();
    addNewEmojis([11, 12, 13, 14, 15, 200, 201, 202]);
});

Events.addEventListener(EventCollection.EVENT_LOGIN, function() {
    const InterfaceEmoteADV = getTransformiceClass("InterfaceEmoteADV");
    const MondeADV = getTransformiceClass("MondeADV");

    InterfaceEmoteADV.prototype.initialisation = function () {
        let base = -Math.PI / 2;
        const temps = Date.now();
        const nb = this.listeBtn.length;
        const rayon = Math.floor(nb * 5);
        const quartier = (Math.PI * 2) / nb;

        for (let i = 0; i < nb; i++) {
            const clip = this.listeBtn[i];

            clip.alpha = 0;
            clip.enPauseJusqua = temps + i * 10;
            clip.position.set(0, 0);
            clip.posCibleX = Math.cos(base) * rayon;
            clip.posCibleY = Math.sin(base) * rayon;
            base += quartier;
        }

        MondeADV.instance.ajouterBoucle("InterfaceEmoteADV", this.boucle);
    };

    bindKeyboard("KeyF", () => InterfaceEmoteADV.afficher());
}, true);