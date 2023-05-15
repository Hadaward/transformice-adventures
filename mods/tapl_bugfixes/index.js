import { Events, EventCollection, getTransformiceClass } from "/tapl/tapl.js";

function doChatFixes() {
    const protoM801 = getTransformiceClass("ProtoM801");
    const module801 = getTransformiceClass("Module801");

    delete protoM801.indexPaquetLecture[0x606];
    
    protoM801.ajouterPaquet(0x606, function (MSG) {
        const auteur = MSG.lChaine();
        const message = MSG.lChaine().replace(/&lt;/g, "<");
        module801.instance.messageChat(message, auteur);

        /**
         * Trigger EVENT_CHAT_MESSAGE when someone sends a message in chat
         */
        Events.dispatchEvent(
            EventCollection.EVENT_CHAT_MESSAGE,
            auteur,
            message
        );
    });
}

function doCheckBoxesFixes() {
    const CheckBoxClass = getTransformiceClass("I_BoutonEtat");
    CheckBoxClass.prototype.cocher = function (checked, DECLENCHER) {
        if (DECLENCHER === void 0) { DECLENCHER = false; }

        this.estCoche = checked;

        if (!this.croix.parentElement)
            this.fondCroix.appendChild(this.croix);

        if (checked)
            this.croix.classList.add("croix-active");
        else
            this.croix.classList.remove("croix-active");

        if (DECLENCHER && this.fonctionClique)
            this.fonctionClique(this.estCoche);

        return this;
    };
}

function doFixInterfaceTalentsScrollBar() {
    const InterfaceTalentsClass = getTransformiceClass("InterfaceTalents");

    const afficher = InterfaceTalentsClass.afficher.bind(InterfaceTalentsClass);
    InterfaceTalentsClass.afficher = function (MSG) {
        afficher(MSG);
        InterfaceTalentsClass.instance.conteneurListeArbres.defHauteur("50vh");
    }
}

function main() {
    doChatFixes();
    doCheckBoxesFixes();
    doFixInterfaceTalentsScrollBar();
}

Events.addEventListener(EventCollection.EVENT_INIT, main)