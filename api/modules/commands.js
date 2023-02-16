import { TFMAPI } from "../api.js";


export const Commands = new class {
    constructor() {
        TFMAPI.addEventListener("login", this.register);
    }

    register() {
        TFMAPI.registerCommand("langue", async function(args) {
            const langueCode = args.join("");
            const response = await TFMAPI.changeGameLanguage(langueCode);

            if (response.ok) {
                TFMAPI.sendLocalMessage(`${TFMAPI.classes.Trad801.trad('$text.langue')}: ${TFMAPI.classes.Communaute.recupParIdentifiant(TFMAPI.getCurrentLangueCode()).nomLangue}`);
            } else {
                TFMAPI.sendLocalMessage(response.error.toString());
            }
        });
    }
}