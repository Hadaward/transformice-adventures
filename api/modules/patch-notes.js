import { TFMAPI } from "../api.js";

TFMAPI.loadMetadata();

document.head.querySelector("style").textContent += `.I_Fenetre .cadre-no-titre {
    width: calc(100% - 100px);
    height: calc(100% - 100px);
    position: absolute;
    top: calc(-10px + -2em);
    left: -50px;
    border-image: url("ressources/cadre2.png") 100 / 1 / 0 repeat;
    border-style: solid;
    border-width: 100px;
}`;

export const PatchNotes = new class {
    constructor() {
        this.parent = null;

        this.container = document.createElement("div");
        this.container.className = "I_Conteneur fond I_Fenetre";
        this.container.style = "user-select: auto; pointer-events: auto; display: flex; align-content: flex-start; flex-flow: column nowrap; align-items: center; min-height: 40px; position: absolute; bottom: 1.5em; left: 0.5em; margin: 0.2;";

        const cadre = document.createElement("div");
        cadre.className = "cadre-no-titre";
        cadre.style = "user-select: none; pointer-events: none;";

        this.notesContainer = document.createElement("div");
        this.notesContainer.style = "min-height: 40px; max-height: 300px; max-width: 400px; overflow-y: auto";

        this.container.append(cadre, this.notesContainer);

        this.notes = [];

        TFMAPI.addEventListener("game-language-changed", () => {
            this.updatePatchNotes();
        });
    }

    updatePatchNotes() {
        for (const note of this.notes)
            this.notesContainer.removeChild(note);

        this.notes = [];

        const patchNotes = TFMAPI.metadata.changelog[TFMAPI.getCurrentLangueCode()] || TFMAPI.metadata.changelog["en"];

        const span = document.createElement("span");
        span.className = "I_Texte";
        span.style = "user-select: auto; pointer-events: auto; display: flex; flex-shrink: 0; cursor: pointer; width: 100%; margin: 0.2em;white-space: pre; color: #D4F98E";
        span.innerHTML = `<b>Patch v${TFMAPI.metadata.version}</b>`;

        this.notes.push(span);


        for (const desc of patchNotes) {
            const span = document.createElement("span");
            span.className = "I_Texte";
            span.style = "user-select: auto; pointer-events: auto; display: flex; flex-shrink: 0; cursor: pointer; width: 100%; margin: 0.2em;white-space: pre;";
            span.innerHTML = `<B>-</B> ${desc.replace(/\<\</g, '<span style="background-color:rgba(97, 68, 47, 0.8);white-space: pre;border-radius: 4.3px">').replace(/\>\>/g, '</span>')}`;

            this.notes.push(span);
        }

        this.notesContainer.append(...this.notes);
    }

    show(parent) {
        if (this.parent !== null)
            return;

        if (this.notes.length === 0)
            this.updatePatchNotes();

        this.parent = parent;
        this.parent.append(this.container);
    }

    dispose() {
        if (this.parent === null)
            return;

        this.parent.removeChild(this.container);
        this.parent = null;
    }
}

TFMAPI.addEventListener("login-screen", (enabled) => {
    if (enabled)
        PatchNotes.show(document.body.querySelector("div"));
});

TFMAPI.addEventListener("login", (enabled) => {
    PatchNotes.dispose();
});