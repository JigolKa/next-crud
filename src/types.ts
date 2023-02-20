// Typescript will throw an error since Prisma has not generated any types
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ParsedArgs } from "./helpers/actions";

export type Table = Exclude<keyof PrismaClient, `$${string}`>;

export type Operation<T extends Table = Table> = keyof PrismaClient[T];

export type RoutePayloadObject = {
  req: NextApiRequest;
  res: NextApiResponse;
};

type ModifyValues<O extends object, V extends unknown> = Record<keyof O, V>;

type PrismaParameters<T extends Table, O extends Operation<T>> = Parameters<
  PrismaClient[T][O]
  //@ts-ignore
>[0]["data"];

export type PromiseLike<T> = Promise<T> | T;

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Method = "GET" | "POST" | "PATCH" | "DELETE";

export type SupportedEncryptionAlgorithms =
  | "Triple DES"
  | "AES 128"
  | "AES 256";

type EncryptionCallback = (plainValue: string) => PromiseLike<string>;
type DecryptionCallback = (encryptedValue: string) => PromiseLike<string>;

type TablesArguments<T extends Table, O extends Operation<T>, A> = Partial<{
  [key in Table]: Partial<ModifyValues<PrismaParameters<key, O>, A>>;
}>;

export namespace Api {
  type RowOptions = {
    /**
     * Encryption algorithm used to encrypt your fields
     *
     * You can use one the built-in algorithm or you can make your own implementation:
     *  - Your encrypt callback has the plain text value in paramaters, and **you must return** the *encrypted value*
     *  - Your decrypt callback has the encrypted value in paramaters, and **you must return** the *plain text value*
     */
    encryption?:
      | SupportedEncryptionAlgorithms
      | {
          encrypt: EncryptionCallback;
          decrypt: DecryptionCallback;
        };

    /**
     * Prevents any modification to this property (`PATCH` requests)
     */
    dontUpdate?: boolean;

    /**
     * Hide field from responses body
     */
    hide?: boolean;
  };

  export type MethodArguments = ParsedArgs & {
    requiredFields: {
      name: string;
      type: string;
      isUnique: boolean;
    }[];
    canBeUpdated: {
      name: string;
      type: string;
      isUnique: boolean;
    }[];
  };

  type AuthenticationCallback = (
    request: Pick<RoutePayloadObject, "req">
  ) => PromiseLike<boolean>;

  export type FilterOptions = Record<
    string,
    Record<string, boolean | object | number> | number
  >;

  export type GlobalOptions = WithRequired<
    Partial<{
      callbacks: {
        onRequest?: (payload: RoutePayloadObject) => void;
        onSuccess?: (payload: unknown) => void;
        onError?: <T>(error: Error & T) => void;
      };

      /**
       * Disable `GET /api/table`
       */
      disableGlobalFetching:
        | Partial<
            Record<
              Table,
              {
                statusCodeToReturn: number;
                message: string;
              }
            >
          >
        | boolean;

      /**
       * Add extra options for fields
       *
       * Current features: `encryption`, `hide` and `dontUpdate`
       */
      tables: TablesArguments<Table, "create", RowOptions>;

      /**
       * Main instance of Prisma
       */
      prismaInstance: PrismaClient;

      /**
       * Restrict access of your routes
       */
      authentication: {
        /**
         *  The callback used to authenticate the requests
         *
         * @param request Argument containing request and response objects
         * @returns A boolean. If true the user will have access to the route, otherwise no
         */
        callback?: AuthenticationCallback;

        /**
         * Routes matched by this RegExp will by affected by the authentication
         * callback
         */
        matcher?: RegExp | string;

        /**
         * The list of methods affected by the authentication callback
         *
         * **Default value:** `["POST", "PATCH", "DELETE"]`
         */
        methods?: Method[];

        /**
         * These routes will be ignored by the authentication callback
         * you provided
         */
        ignoredRoutes?: string[];
      };
    }>,
    "prismaInstance"
  >;
}

type ApiWrapper = Api.GlobalOptions;

export default ApiWrapper;
