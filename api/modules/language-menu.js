import { TFMAPI } from "../api.js";

export const LanguageMenu = new class {
    constructor() {
        this.parent = null;

        this.icon = document.createElement("img");
        this.icon.className = "I_Image";
        this.icon.style = "user-select: none; pointer-events: auto; background-color: transparent; width: 130px; height: 100px; position: absolute; top: 0.5em; right: 0.5em; cursor: pointer; z-index: 0;";
    
        this.container = document.createElement("div");
        this.container.className = "I_Conteneur fond I_Fenetre";
        this.container.style = "user-select: auto; pointer-events: auto; display: none; align-content: flex-start; flex-flow: column nowrap; align-items: center; min-height: 40px; max-height: 300px; width: 300px; position: absolute; top: 12.5%; right: 0.5em;";
    
        this.title = document.createElement("span");
        this.title.className = "titre";
        this.title.style = "white-space: nowrap; user-select: none; pointer-events: none;";

        const cadre = document.createElement("div");
        cadre.className = "cadre";
        cadre.style = "user-select: none; pointer-events: none;";

        this.iconContainer = document.createElement("div");
        this.iconContainer.style = "min-height: 40px; max-height: 300px; width: 300px; overflow-y: auto";

        this.container.append(this.title, cadre, this.iconContainer);

        this.isMouseOut = {
            container: true,
            icon: true
        }

        this.container.onmouseover = () => {
            this.isMouseOut.container = false;
        }

        this.container.onmouseleave = () => {
            this.isMouseOut.container = true;
        }

        this.icon.onmouseover = () => {
            this.isMouseOut.icon = false;
        }

        this.icon.onmouseleave = () => {
            this.isMouseOut.icon = true;
        }

        this.icon.onclick = () => {
            this.container.style.display = "flex";
        }

        TFMAPI.addEventListener("game-language-changed", () => {
            this.update();
        });
    }

    update() {
        this.icon.src = `https://data.atelier801.com/tfmadv/interface/drapeaux/${TFMAPI.getCurrentLangueCode(true)}.png`;
        this.title.textContent = `${TFMAPI.classes.Trad801.trad('$text.langue')}`;
    }

    async loadLanguageIcons() {
        const loaded = [];
            
        for (const communaute of TFMAPI.classes.Communaute.listeCommunautes) {
            if (loaded.includes(communaute.nomLangue))
                continue;

            loaded.push(communaute.nomLangue);

            try {
                const response = await fetch(`https://data.atelier801.com/trad/tfmadv-${communaute.identifiant}.txt?${Date.now()}`);

                if (!response.ok) {
                    continue;
                }
            } catch {
                continue;
            }

            const icon = document.createElement("img");
            icon.className = "I_Image";
            icon.style = "user-select: auto; float: left; pointer-events: auto; display: flex; flex-shrink: 0; cursor: pointer; width: 100%; margin: 0.2em;white-space: pre; width: 80px; height: 50px";
            icon.src = `https://data.atelier801.com/tfmadv/interface/drapeaux/${communaute.identifiant.toUpperCase()}.png`;

            icon.onclick = async () => {
                const response = await TFMAPI.changeGameLanguage(communaute.identifiant);

                if (!response.ok) {
                    this.iconContainer.removeChild(icon);
                    console.warn(response.error);
                }
            }

            this.iconContainer.append(icon);
        }
    }

    show(parent) {
        if (!TFMAPI.classes.hasOwnProperty('Communaute')) {
            throw new Error('It is not possible to show language menu before the API loads the Communaute class.');
        }

        if (this.parent !== null)
            return;

        this.parent = parent;
        this.parent.append(this.icon, this.container);

        this.parent.onclick = () => {
            if (this.isMouseOut.container && this.isMouseOut.icon) {
                this.container.style.display = "none";
            }
        }

        this.update();
        this.loadLanguageIcons();
    }

    dispose() {
        if (this.parent === null)
            return;

        this.parent.removeChild(this.container);
        this.parent.removeChild(this.icon);
        this.parent.onclick = undefined;
        this.parent = null;
    }
}

TFMAPI.addEventListener("login-screen", (enabled) => {
    if (enabled)
        LanguageMenu.show(document.body.querySelector("div"));
});

TFMAPI.addEventListener("login", (enabled) => {
    LanguageMenu.dispose();
});