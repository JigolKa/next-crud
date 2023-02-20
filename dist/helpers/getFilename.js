"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getFilename() {
    const dirname = __filename.split(/(\/|\\)/gm);
    const filename = dirname[dirname.length - 1]
        .replace("[...", "")
        .replace("].js", "");
    return filename;
}
exports.default = getFilename;
//# sourceMappingURL=getFilename.js.map