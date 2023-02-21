"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiWrapper = void 0;
const routes_1 = require("./core/routes");
const actions_1 = require("./helpers/actions");
const isBodyRequired_1 = require("./helpers/isBodyRequired");
const client_1 = require("@prisma/client");
const url_1 = require("./helpers/url");
const getEndpoint_1 = require("./helpers/getEndpoint");
const exclude_1 = require("./helpers/exclude");
const dmmf_1 = require("./helpers/dmmf");
const logging_1 = require("./helpers/logging");
function ApiWrapper(options) {
    if (typeof client_1.Prisma["dmmf"] === "undefined") {
        (0, logging_1.default)("BgRed", "Prisma types are not generated. Please enter `npx prisma generate` to create new types.");
        throw new Error("Prisma types are not generated. Please enter `npx prisma generate` to create new types.");
    }
    const dmmf = client_1.Prisma.dmmf;
    return async (req, res) => {
        options.callbacks?.onRequest?.({ req, res });
        const { method } = req;
        const url = req.url.split("?")[0];
        if (!method || !url)
            return;
        const args = (0, actions_1.getArguments)(req);
        if (!args || !args.table) {
            (0, logging_1.default)("BgRed", "Invalid url arguments");
            return res
                .status(422)
                .json({ ...(0, url_1.json)(422), errorText: "Invalid url arguments" });
        }
        const currentTable = dmmf["datamodel"].models.filter((v) => v.name.toLowerCase() === args.table.toLowerCase())[0];
        if (!currentTable) {
            (0, logging_1.default)("BgRed", `Table ${args.table} not found`);
            return res.status(404).json({
                ...(0, url_1.json)(404),
                errorText: "Table not found",
            });
        }
        if ((0, isBodyRequired_1.default)(method)) {
            if (req.headers["content-type"] !== "application/json") {
                (0, logging_1.default)("BgRed", "Unsupported Media Type");
                return res.status(415).json({
                    ...(0, url_1.json)(415),
                    errorText: "Unsupported Media Type",
                });
            }
            if (!req.body) {
                (0, logging_1.default)("BgRed", "Malformed body");
                return res.status(400).json({
                    ...(0, url_1.json)(400),
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
                if (!callbackResult) {
                    (0, logging_1.default)("BgRed", "Access forbidden");
                    return res
                        .status(403)
                        .json({ ...(0, url_1.json)(403), errorText: "Access forbidden" });
                }
            }
        }
        const extraOptions = options.extraOptions ?? {};
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
        delete prismaArgs[(0, getEndpoint_1.default)(req)];
        const tableKeys = (0, dmmf_1.getKeys)(args.table);
        for (const filter of Object.keys(prismaArgs)) {
            if (!["include", "select", "skip", "take"].includes(filter))
                continue;
            const arg = req.query[filter];
            let obj = {};
            if (["include", "select"].includes(filter)) {
                for (const _key of arg.split(",")) {
                    const parts = _key.split(".");
                    if (!tableKeys.includes(parts[parts.length - 1])) {
                        (0, logging_1.default)("BgRed", "Key `" +
                            parts[parts.length - 1] +
                            "` not found on table " +
                            currentTable.name);
                        return res.status(404).json({
                            ...(0, url_1.json)(404),
                            errorText: "Key `" +
                                parts[parts.length - 1] +
                                "` not found on table " +
                                currentTable.name,
                        });
                    }
                    if (filter === "include" &&
                        !(0, dmmf_1.getRelationKeys)(currentTable.name.toLowerCase()).includes(_key)) {
                        (0, logging_1.default)("BgRed", "The include filter only accepts fields with a relation");
                        return res.status(422).json({
                            ...(0, url_1.json)(422),
                            errorText: "The include filter only accepts fields with a relation",
                        });
                    }
                    let data = true;
                    if (parts.length > 1) {
                        data = {
                            [filter]: {
                                [parts[1]]: true,
                            },
                        };
                    }
                    //TODO: decomment and fix
                    obj[parts[0]] = data;
                }
            }
            else {
                if (!isNaN(Number(arg))) {
                    obj = Number(arg) || 1;
                }
                else {
                    continue;
                }
            }
            prismaPayload[filter] = obj;
        }
        console.log(prismaPayload);
        if (Object.keys(prismaPayload).includes("include") &&
            Object.keys(prismaPayload).includes("select")) {
            (0, logging_1.default)("BgRed", "Your query cannot contain the select and the include filter. You have to take only one");
            return res.status(422).json({
                ...(0, url_1.json)(422),
                data: "Your query cannot contain the select and the include filter. You have to take only one",
            });
        }
        // ^4.10.1
        const canBeUpdated = currentTable.fields
            .filter((v) => !v.default)
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
            if (!action) {
                (0, logging_1.default)("BgRed", `Method ${method} not allowed`);
                return res
                    .status(405)
                    .json({ ...(0, url_1.json)(405), errorText: "Method not allowed." });
            }
            const response = await action({ req, res }, { ...args, requiredFields: required, canBeUpdated }, options, prismaPayload);
            let data = response.json instanceof Array
                ? [...response.json]
                : { ...response.json };
            if (data instanceof Array) {
                for (let i = 0; i < data.length; i++) {
                    const v = (0, exclude_1.default)(data[i], hiddenKeys.map((v) => v.key));
                    data[i] = v;
                }
            }
            else if (typeof data === "object") {
                const v = { ...data };
                data = (0, exclude_1.default)(v, hiddenKeys.map((v) => v.key));
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
            (0, logging_1.default)("BgRed", error);
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