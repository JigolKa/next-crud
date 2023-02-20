"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiWrapper = void 0;
const routes_1 = require("./core/routes");
const actions_1 = require("./helpers/actions");
const isBodyRequired_1 = require("./helpers/isBodyRequired");
const client_1 = require("@prisma/client");
const url_1 = require("./helpers/url");
const getFilename_1 = require("./helpers/getFilename");
const omit_deep_lodash_1 = require("omit-deep-lodash");
function ApiWrapper(options) {
    if (typeof client_1.Prisma["dmmf"] === "undefined") {
        throw new Error("Prisma types are not generated. Please enter `npx prisma generate` to create new types.");
    }
    const dmmf = client_1.Prisma.dmmf;
    return async (req, res) => {
        options.callbacks?.onRequest?.({ req, res });
        const { method } = req;
        const url = req.url.split("?")[0];
        if (!method || !url)
            return;
        if ((0, isBodyRequired_1.default)(method)) {
            if (req.headers["content-type"] !== "application/json") {
                return res.status(415).json({
                    errorText: "Unsupported Media Type",
                });
            }
            if (!req.body) {
                return res.status(400).json({
                    errorText: "Malformed body",
                });
            }
        }
        if (options.authentication?.callback) {
            const regex = RegExp(options.authentication.matcher ?? /.*/gm);
            if (regex.test(url) &&
                (options.authentication.methods || ["POST", "PATCH", "DELETE"]).includes(method) &&
                !(options.authentication.ignoredRoutes || []).includes(url)) {
                const callbackResult = await options.authentication.callback({ req });
                if (!callbackResult)
                    return res.status(403).json({
                        errorText: "Access forbidden",
                    });
            }
        }
        const args = (0, actions_1.getArguments)(req);
        if (!args || !args.table)
            return res.status(422).json({
                errorText: "Missing required url arguments",
            });
        const extraOptions = options.tables ?? {};
        const hiddenKeys = [];
        const dontUpdateKeys = [];
        for (const table of Object.keys(extraOptions)) {
            for (const key of Object.keys(extraOptions[table])) {
                const options = Object.keys(extraOptions[table][key]);
                if (options.includes("hide")) {
                    hiddenKeys.push({ table, key });
                }
                if (options.includes("dontUpdate")) {
                    dontUpdateKeys.push({ table, key });
                }
            }
        }
        const prismaArgs = { ...req.query };
        const prismaPayload = {};
        delete prismaArgs[(0, getFilename_1.default)()];
        // const tableKeys = getKeys(args.table);
        for (const filter of Object.keys(prismaArgs)) {
            if (!["include", "select", "skip", "take"].includes(filter))
                continue;
            const arg = req.query[filter];
            let obj = {};
            if (["include", "select"].includes(filter)) {
                for (const _key of arg.split(",")) {
                    let data = true;
                    const parts = _key.split(".");
                    if (parts.length > 1) {
                        data = {
                            [filter]: {
                                [parts[1]]: true,
                            },
                        };
                    }
                    //TODO: decomment and fix
                    // if (!tableKeys.includes(key)) continue;
                    obj[parts[0]] = data;
                }
            }
            else {
                if (!isNaN(Number(arg))) {
                    obj = Number(arg);
                }
                else {
                    continue;
                }
            }
            prismaPayload[filter] = obj;
        }
        if (Object.keys(prismaPayload).includes("include") &&
            Object.keys(prismaPayload).includes("select")) {
            return res.status(422).json({
                ...(0, url_1.json)(422),
                data: "Your query cannot contain the select and the include filter. You have to take only one",
            });
        }
        // ^4.10.1
        const canBeUpdated = dmmf["datamodel"].models
            .filter((v) => v.name.toLowerCase() === args.table.toLowerCase())[0]
            .fields.filter((v) => !v.default)
            .filter((v) => !v.isReadOnly)
            .filter((v) => !dontUpdateKeys.map((v) => v.key).includes(v.name));
        const listRelations = canBeUpdated
            .filter((v) => v.relationName && v.isList)
            .map((v) => v.name);
        const required = canBeUpdated
            .filter((v) => v.isRequired)
            .filter((v) => !listRelations.includes(v.name))
            .map((v) => ({
            name: v.name,
            type: v.type,
            isUnique: v.isUnique,
        }));
        try {
            const action = (0, routes_1.default)(method.toUpperCase(), /^\/api\/[A-Za-z]+\/verify/g.test(url));
            if (!action)
                return res.status(405).json({
                    errorText: "Method not allowed.",
                });
            const response = await action({ req, res }, { ...args, requiredFields: required, canBeUpdated }, options, prismaPayload);
            let data = response.json instanceof Array
                ? [...response.json]
                : { ...response.json };
            if (data instanceof Array) {
                for (let i = 0; i < data.length; i++) {
                    const v = (0, omit_deep_lodash_1.default)(data[i], ...hiddenKeys.map((v) => v.key));
                    data[i] = v;
                }
            }
            else if (typeof data === "object") {
                const v = { ...data };
                data = (0, omit_deep_lodash_1.default)(v, ...hiddenKeys.map((v) => v.key));
            }
            options.callbacks?.onSuccess?.(data);
            return res.status(response.statusCode).json({
                ...(0, url_1.json)(response.statusCode),
                ...(response.errorText ? { error: response.errorText } : {}),
                ...(data ? { data } : {}),
            });
        }
        catch (e) {
            const error = e;
            options.callbacks?.onError?.(error);
            if ("meta" in error) {
                return res.status(500).json({
                    ...(0, url_1.json)(500),
                    url: url,
                    data: {
                        code: error.code,
                        ...(typeof error === "object" ? error.meta : {}),
                        reference: `https://www.prisma.io/docs/reference/api-reference/error-reference#${error.code.toLowerCase()}`,
                    },
                });
            }
            else {
                return res.status(500).json({
                    ...(0, url_1.json)(500),
                    url: url,
                    data: {
                        ...error,
                    },
                });
            }
        }
    };
}
exports.ApiWrapper = ApiWrapper;
//# sourceMappingURL=index.js.map