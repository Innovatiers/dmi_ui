/**
 * Generated from api/openapi-v1.json by `npm run api:generate` (openapi-typescript). Do not edit.
 */

export interface paths {
    "/api/v1/features": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the known feature flags with their state for the current tenant (names and on/off only). */
        get: operations["Features_GetFeatures"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/system/info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the application name, version and current server time. */
        get: operations["System_GetInfo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenancy/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the memberships of the current tenant. */
        get: operations["Tenancy_GetMemberships"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenancy/memberships/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one membership of the current tenant. */
        get: operations["Tenancy_GetMembership"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description The standard error response of the API. Every error is returned in this shape; it never contains stack traces
         *     or secrets.
         */
        ErrorEnvelope: {
            /** @description Stable machine-readable error code, see ErrorCodes. */
            code: string;
            /** @description Safe human-readable message. */
            message: string;
            /** @description The correlation ID of the request. */
            correlationId: string;
            /** @description Whether repeating the same request may succeed. */
            retriable: boolean;
            /** @description Gets the source network the error relates to, if any. */
            sourceNetworkId?: null | string;
            /** @description Gets the data-completeness indication of a partial result, if any. */
            completeness?: null | string;
            /** @description Gets non-secret details, for example validation errors per field. */
            details?: {
                [key: string]: string[];
            };
            /**
             * Format: int32
             * @description Gets the number of seconds after which a retry makes sense, if known.
             */
            retryAfter?: null | number;
        };
        /** @description One feature flag as reported to clients. */
        FeatureFlagDto: {
            /** @description The flag name. */
            name: string;
            /** @description Whether the flag is on for the current tenant. */
            enabled: boolean;
        };
        /** @description The feature flags of the current tenant: names and on/off only, never configuration details. */
        GetFeatureFlagsQueryResponse: {
            /** @description The flags, in a stable order. */
            items: components["schemas"]["FeatureFlagDto"][];
        };
        /** @description One membership of the current tenant. */
        GetMembershipByIdQueryResponse: {
            /** @description The membership. */
            membership: components["schemas"]["MembershipDto"];
        };
        /** @description Memberships of the current tenant. */
        GetMembershipsQueryResponse: {
            /** @description The memberships, ordered by subject. */
            items: components["schemas"]["MembershipDto"][];
        };
        /** @description Non-sensitive information about the running API. */
        GetSystemInfoQueryResponse: {
            /** @description The application name. */
            applicationName: string;
            /** @description The informational version of the application. */
            version: string;
            /**
             * Format: date-time
             * @description The current server time in UTC.
             */
            serverTimeUtc: string;
        };
        /** @description A membership as returned by tenancy queries. */
        MembershipDto: {
            /**
             * Format: uuid
             * @description The membership identifier.
             */
            id: string;
            /** @description The identity-provider subject identifier. */
            subjectId: string;
            /** @description The role within the tenant. */
            role: components["schemas"]["Role"];
            /** @description The membership status. */
            status: components["schemas"]["MembershipStatus"];
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description Lifecycle status of a membership. */
        MembershipStatus: number;
        /** @description Tenant-scoped roles (AI Coder doc §6). */
        Role: number;
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    Features_GetFeatures: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFeatureFlagsQueryResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    System_GetInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSystemInfoQueryResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Tenancy_GetMemberships: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMembershipsQueryResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Tenancy_GetMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The membership identifier. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMembershipByIdQueryResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
}
