import { lock } from "./utils.js";

export const T_MOD_INFO = function() {
    return lock({
        name: "",
        version: "",
        author: "",
        description: "",
        entry_point: "",
        loader: {}
    });
}