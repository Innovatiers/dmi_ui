/**
 * Generated from api/openapi-v1.json by `npm run api:generate` (openapi-typescript). Do not edit.
 */

export interface paths {
    "/api/v1/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Searches the audit trail of the caller's tenant, newest first. Permission `ReadAudit`. */
        get: operations["AuditEvents_GetAuditEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit-events/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Exports the filtered audit trail of the caller's tenant as a CSV or JSON file, streamed in chronological order.
         *     Permission `ExportAudit` and a role allowed by the tenant's export policy for `audit`. More than
         *     50,000 matching events give 422 `EXPORT_TOO_LARGE`. The export is recorded as `Export` audit event
         *     with filter, row count and the SHA-256 of the file.
         */
        post: operations["AuditEvents_ExportAuditEvents"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/export-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the effective export policy, one entry per export type; types that were never configured show their default. */
        get: operations["ExportPolicy_GetExportPolicy"];
        /**
         * Sets the export policy of the listed export types. A role that does not hold the export permission of the type
         *     is refused with 422 `EXPORT_ROLE_NOT_PERMITTED`: the policy can narrow the permission matrix, never widen it.
         */
        put: operations["ExportPolicy_UpdateExportPolicy"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/admin/security-overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the security and privacy figures of the caller's tenant: memberships per role, refused requests, credential
         *     references per network status, retention settings and exports. Administrators only (permission `Administer`).
         */
        get: operations["Governance_GetSecurityOverview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the readiness of the API, the database, the data provider per network of the caller's tenant and the job
         *     host. Administrators and platform operators (permission `ViewServiceHealth`); a read by a platform operator
         *     is recorded in the platform trail.
         */
        get: operations["Governance_GetServiceHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the memberships of the caller's tenant with their grants, ordered by subject. */
        get: operations["Memberships_GetMemberships"];
        put?: never;
        /** Adds a membership (subject and role) to the caller's tenant. Honours `Idempotency-Key`. */
        post: operations["Memberships_AddMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one membership with its grants; the response carries its ETag. */
        get: operations["Memberships_GetMembership"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships/{id}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Changes the role of a membership. Requires `If-Match`. Taking the role from the last active
         *     Administrator is refused with 409 `LAST_ADMIN`.
         */
        put: operations["Memberships_ChangeMembershipRole"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships/{id}/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Disables a membership; the member is refused from its next request on. Requires `If-Match` and honours
         *     `Idempotency-Key`. Disabling the last active Administrator is refused with 409 `LAST_ADMIN`.
         */
        post: operations["Memberships_DisableMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships/{id}/grants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Adds a scope grant (tenant, site or asset) to a membership. Honours `Idempotency-Key`. */
        post: operations["Memberships_AddGrant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/memberships/{id}/grants/{grantId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Removes a scope grant from a membership. */
        delete: operations["Memberships_RemoveGrant"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the networks of the caller's tenant, ordered by external network identifier. */
        get: operations["Networks_GetNetworks"];
        put?: never;
        /**
         * Registers a network. Honours `Idempotency-Key`. Endpoint rules are refused with 422 (for example
         *     `INSECURE_ENDPOINT`, `ENDPOINT_NOT_ALLOWLISTED`, `BLOCKED_ENDPOINT`); activating the live provider
         *     while its feature flag is off gives 422 `FEATURE_DISABLED`; a duplicate identifier gives 409 `NETWORK_EXISTS`.
         */
        post: operations["Networks_RegisterNetwork"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one network; the response carries its ETag. */
        get: operations["Networks_GetNetwork"];
        /**
         * Replaces the settings of a network (the external identifier stays). Requires `If-Match`. The same endpoint
         *     and activation rules as for registration apply.
         */
        put: operations["Networks_UpdateNetwork"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disables a network. Requires `If-Match` and honours `Idempotency-Key`. */
        post: operations["Networks_DisableNetwork"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/credential-ref": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Sets or replaces the credential reference of a network. Requires `If-Match` (the network's ETag). The
         *     reference is stored, not resolved, and is never returned; the response only shows `hasCredentialRef`.
         *     A reference outside the configured secret-store format gives 422 `INVALID_SECRET_REF`.
         */
        put: operations["Networks_SetCredentialRef"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/retention-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the configured retention policies and the protected object types. */
        get: operations["RetentionPolicy_GetRetentionPolicy"];
        /**
         * Sets the retention of the listed object types. A protected object type (`audit_events`, `evidence`)
         *     is refused with 422 `RETENTION_NOT_ALLOWED`.
         */
        put: operations["RetentionPolicy_UpdateRetentionPolicy"];
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
    "/api/v1/admin/tenants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all tenants, ordered by name. */
        get: operations["Tenants_GetTenants"];
        put?: never;
        /** Creates a tenant. Honours `Idempotency-Key`. */
        post: operations["Tenants_CreateTenant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/tenants/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one tenant; the response carries its ETag. */
        get: operations["Tenants_GetTenant"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Changes the name, residency policy or status (active/suspended) of a tenant. Requires `If-Match`. */
        patch: operations["Tenants_UpdateTenant"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Refused requests in the tenant, from the audit trail. */
        AccessDeniedSummaryDto: {
            /**
             * Format: int32
             * @description Requests answered with 403 (missing permission, no active membership, export policy) in the last 24 hours.
             */
            forbiddenLast24Hours: number;
            /**
             * Format: int32
             * @description Requests answered with 403 in the last 7 days.
             */
            forbiddenLast7Days: number;
            /**
             * Format: int32
             * @description Attempts to reach an object of another tenant (answered with 404) in the last 24 hours.
             */
            crossTenantLast24Hours: number;
            /**
             * Format: int32
             * @description Attempts to reach an object of another tenant in the last 7 days.
             */
            crossTenantLast7Days: number;
        };
        /** @description Request body for adding a scope grant to a membership. */
        AddGrantBody: {
            scope: null | components["schemas"]["GrantScope"];
            /**
             * Format: uuid
             * @description Gets the site or asset identifier; omitted for the tenant scope.
             */
            scopeObjectId?: null | string;
        };
        /** @description Request body for adding a membership to the caller's tenant. */
        AddMembershipBody: {
            /** @description Gets the identity-provider subject identifier (1–256 characters). */
            subjectId: null | string;
            role: null | components["schemas"]["Role"];
        };
        /** @description One audit event as returned by the audit query and export. Credential-like fields in the states are masked. */
        AuditEventDto: {
            /**
             * Format: uuid
             * @description The event identifier.
             */
            id: string;
            /**
             * Format: date-time
             * @description The time of the change (UTC).
             */
            occurredAt: string;
            /** @description The subject identifier of the actor, or `system`. */
            actor: string;
            /** @description The action name, for example `Edit`, `Export` or `AccessDenied`. */
            action: string;
            /** @description The kind of object concerned. */
            entityType: string;
            /** @description The identifier of the object concerned. */
            entityId: string;
            /** @description The state before the change as JSON text (masked), or `null`. */
            oldState: null | string;
            /** @description The state after the change as JSON text (masked), or `null`. */
            newState: null | string;
            /** @description The correlation ID of the request that caused the event. */
            correlationId: string;
            /** @description The identifier of the event or command that caused this event, if any. */
            causationId: null | string;
            /** @description The SHA-256 tamper-evidence hash computed over the stored (unmasked) event. */
            payloadHash: string;
        };
        /** @description Request body for changing the role of a membership. */
        ChangeMembershipRoleBody: {
            role: null | components["schemas"]["Role"];
        };
        /** @description The readiness of one platform component. */
        ComponentHealthDto: {
            /** @description The component, see HealthComponents. */
            component: string;
            /** @description The readiness, see HealthStatuses. */
            status: string;
            /** @description Why the component is not ready or has no check, see UnavailableReasons; empty when ready. */
            reason: null | string;
        };
        /** @description Request body for creating a tenant. */
        CreateTenantBody: {
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the data-residency policy code (lowercase letters, digits and hyphens); omitted means `unspecified`. */
            residencyPolicy?: null | string;
        };
        CredentialPurpose: number;
        /** @description Credential references of the networks with one status. Counts and dates only, never a reference. */
        CredentialRefStatusCountDto: {
            /** @description The status of the networks. */
            networkStatus: components["schemas"]["NetworkStatus"];
            /**
             * Format: int32
             * @description The number of credential references set on these networks.
             */
            credentialRefs: number;
            /**
             * Format: int32
             * @description The number of these networks without any credential reference.
             */
            networksWithoutCredentialRef: number;
            /**
             * Format: date-time
             * @description When a credential reference of these networks was last set (UTC); empty when none is set.
             */
            lastRotatedAt: null | string;
        };
        /**
         * @description The credential references of the tenant's networks: counts per network status, the last rotation and one row per
         *     network. Never contains a reference or a secret.
         */
        CredentialRefSummaryDto: {
            /** @description The counts per network status, for every status. */
            byNetworkStatus: components["schemas"]["CredentialRefStatusCountDto"][];
            /**
             * Format: date-time
             * @description When any credential reference of the tenant was last set (UTC); empty when none is set.
             */
            lastRotatedAt: null | string;
            /** @description One row per network, ordered by external network identifier. */
            networks: components["schemas"]["NetworkCredentialDto"][];
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfAuditEventDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["AuditEventDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfDataNetworkDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["DataNetworkDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfMembershipDetailsDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["MembershipDetailsDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfTenantDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["TenantDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description A registered network as returned by the API. It shows whether a credential reference is set, never the reference. */
        DataNetworkDto: {
            /**
             * Format: uuid
             * @description The network identifier.
             */
            id: string;
            /** @description The tenant-chosen network identifier. */
            externalNetworkId: string;
            /** @description The display name. */
            displayName: string;
            /** @description The provider that serves the network. */
            providerType: components["schemas"]["NetworkProviderType"];
            /** @description The endpoint URL. */
            endpointUrl: string;
            /** @description The allowed `host:port` entries. */
            endpointAllowlist: string[];
            /** @description How the endpoint certificate is verified. */
            tlsMode: components["schemas"]["NetworkTlsMode"];
            /** @description The lifecycle status. */
            status: components["schemas"]["NetworkStatus"];
            /** @description Whether a credential reference is set. */
            hasCredentialRef: boolean;
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description The time of the last change (UTC).
             */
            updatedAt: string;
        };
        /** @description The readiness of the data provider of one network of the caller's tenant. */
        DataProviderHealthDto: {
            /**
             * Format: uuid
             * @description The network identifier.
             */
            networkId: string;
            /** @description The tenant-chosen network identifier. */
            externalNetworkId: string;
            /** @description The display name. */
            displayName: string;
            /** @description The provider that serves the network. */
            providerType: components["schemas"]["NetworkProviderType"];
            /** @description The lifecycle status of the network. */
            networkStatus: components["schemas"]["NetworkStatus"];
            /** @description The readiness, see HealthStatuses. */
            status: string;
            /** @description Why the provider is not ready or has no check, see UnavailableReasons; empty when ready. */
            reason: null | string;
        };
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
        /** @description Request body for exporting the audit trail: the file format and the optional filter. */
        ExportAuditEventsBody: {
            /** @description Gets the file format: `csv` or `json`. */
            format: null | string;
            /**
             * Format: date-time
             * @description Gets the earliest event time (inclusive).
             */
            from?: null | string;
            /**
             * Format: date-time
             * @description Gets the latest event time (exclusive).
             */
            to?: null | string;
            /** @description Gets the subject identifier of the actor. */
            actor?: null | string;
            /** @description Gets the kind of object, for example `Membership`. */
            entityType?: null | string;
            /** @description Gets the identifier of the object. */
            entityId?: null | string;
            /** @description Gets the action name, for example `Edit` or `AccessDenied`. */
            action?: null | string;
            /** @description Gets the correlation ID of the request that caused the events. */
            correlationId?: null | string;
        };
        /** @description The effective export policy of one export type. */
        ExportPolicyDto: {
            /** @description The export type code (`audit`, `measurements`, `dashboards`). */
            exportType: string;
            /** @description The roles that may export this type; empty when nobody may. */
            allowedRoles: components["schemas"]["Role"][];
            /** @description Whether the tenant has not configured this type and the default applies. */
            isDefault: boolean;
        };
        /** @description The requested export policy of one export type. */
        ExportPolicyEntryBody: {
            /** @description Gets the export type: `audit`, `measurements` or `dashboards`. */
            exportType: null | string;
            /**
             * @description Gets the roles that may export this type; empty means nobody. Each role must hold the export permission of the
             *     type in the permission matrix.
             */
            allowedRoles: null | components["schemas"]["Role"][];
        };
        /** @description The effective export policy of the current tenant, one entry per known export type. */
        ExportPolicySettingsDto: {
            /** @description The policies, in a stable order of export type. */
            policies: components["schemas"]["ExportPolicyDto"][];
        };
        /** @description Data exports of the tenant in the last 30 days, from the audit trail. */
        ExportSummaryDto: {
            /**
             * Format: int32
             * @description The number of exports in the last 30 days.
             */
            last30Days: number;
            /** @description The exports per kind of data, ordered by kind. */
            byType: components["schemas"]["ExportTypeCountDto"][];
        };
        /** @description The number of exports of one kind of data. */
        ExportTypeCountDto: {
            /** @description The kind of data, for example `audit`. */
            exportType: string;
            /**
             * Format: int32
             * @description The number of exports.
             */
            count: number;
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
        /** @description A scope grant that narrows a membership. */
        GrantDto: {
            /**
             * Format: uuid
             * @description The grant identifier.
             */
            id: string;
            /** @description The scope type. */
            scope: components["schemas"]["GrantScope"];
            /**
             * Format: uuid
             * @description The site or asset; `null` for the tenant scope.
             */
            scopeObjectId: null | string;
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description The kind of object a Grant applies to. */
        GrantScope: number;
        /** @description Users without a recent sign-in. Reported as `not_available` while the platform does not record sign-ins. */
        InactiveUsersDto: {
            /** @description Whether the figure is available, see MetricStatuses. */
            status: string;
            /** @description Why it is not available, see UnavailableReasons; empty when available. */
            reason: null | string;
            /**
             * Format: int32
             * @description The number of users without a sign-in within ThresholdDays; empty when not available.
             */
            count: null | number;
            /**
             * Format: int32
             * @description The period that counts as recent, in days; empty when not available.
             */
            thresholdDays: null | number;
        };
        /** @description A membership with its scope grants, as returned by the membership administration endpoints. */
        MembershipDetailsDto: {
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
            /** @description The scope grants; empty means the whole tenant. */
            grants: components["schemas"]["GrantDto"][];
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
        /** @description Whether a network has a credential reference and when it was last set. The reference itself is never returned. */
        NetworkCredentialDto: {
            /**
             * Format: uuid
             * @description The network identifier.
             */
            networkId: string;
            /** @description The tenant-chosen network identifier. */
            externalNetworkId: string;
            /** @description The display name. */
            displayName: string;
            /** @description The lifecycle status of the network. */
            status: components["schemas"]["NetworkStatus"];
            /** @description Whether a credential reference is set. */
            hasCredentialRef: boolean;
            /**
             * Format: date-time
             * @description When the most recent credential reference was set (UTC); empty when none is set.
             */
            credentialRotatedAt: null | string;
        };
        /**
         * @description Networks whose data provider fails its health check. Reported as `not_available` while network health checks
         *     do not exist.
         */
        NetworkHealthSummaryDto: {
            /** @description Whether the figure is available, see MetricStatuses. */
            status: string;
            /** @description Why it is not available, see UnavailableReasons; empty when available. */
            reason: null | string;
            /**
             * Format: int32
             * @description The number of networks with a failing health check; empty when not available.
             */
            failingNetworks: null | number;
        };
        /** @description The kind of data provider that serves a registered network. Provenance only: the domain holds no provider payloads. */
        NetworkProviderType: number;
        /** @description Request body for replacing the settings of a network. All values are required. */
        NetworkSettingsBody: {
            /** @description Gets the display name (1–200 characters). */
            displayName: null | string;
            providerType: null | components["schemas"]["NetworkProviderType"];
            /**
             * @description Gets the endpoint URL: HTTPS (plain HTTP only to a loopback host in Development), without user information,
             *     query or fragment, and its host and port must be in the allowlist.
             */
            endpointUrl: null | string;
            /** @description Gets the allowed endpoints as `host:port` (IPv6 as `[address]:port`), 1–20 entries. */
            endpointAllowlist: null | string[];
            tlsMode: null | components["schemas"]["NetworkTlsMode"];
            status: null | components["schemas"]["NetworkStatus"];
        };
        /** @description Lifecycle status of a registered network. */
        NetworkStatus: number;
        /** @description How the TLS certificate of a network endpoint is verified. Disabling verification is not an option. */
        NetworkTlsMode: number;
        /** @description Request body for registering a network. */
        RegisterNetworkBody: {
            /**
             * @description Gets the tenant-chosen network identifier (for example `net-a`): 1–64 lowercase letters, digits, '.', '_'
             *     or '-', unique in the tenant and immutable.
             */
            externalNetworkId: null | string;
            /** @description Gets the display name (1–200 characters). */
            displayName: null | string;
            providerType: null | components["schemas"]["NetworkProviderType"];
            /**
             * @description Gets the endpoint URL: HTTPS (plain HTTP only to a loopback host in Development), without user information,
             *     query or fragment, and its host and port must be in the allowlist.
             */
            endpointUrl: null | string;
            /** @description Gets the allowed endpoints as `host:port` (IPv6 as `[address]:port`), 1–20 entries. */
            endpointAllowlist: null | string[];
            tlsMode: null | components["schemas"]["NetworkTlsMode"];
            status: null | components["schemas"]["NetworkStatus"];
        };
        /** @description The configured retention of one object type. Stored and shown only: nothing is removed on the basis of it. */
        RetentionPolicyDto: {
            /** @description The object type code. */
            objectType: string;
            /**
             * Format: int32
             * @description The agreed retention term in days, or `null` when no term is agreed (keep indefinitely).
             */
            retentionDays: null | number;
            /** @description Whether a legal hold applies. */
            legalHold: boolean;
        };
        /** @description The requested retention of one object type. The setting is stored and shown only; nothing is removed by it. */
        RetentionPolicyEntryBody: {
            /**
             * @description Gets the object type code (lowercase letters, digits, underscores). `audit_events` and `evidence` are
             *     protected and refused.
             */
            objectType: null | string;
            /**
             * Format: int32
             * @description Gets the agreed retention term in days, or `null` when no term is agreed (keep indefinitely).
             */
            retentionDays?: null | number;
            /** @description Gets a value indicating whether a legal hold applies. */
            legalHold?: boolean;
        };
        /** @description The retention settings of the current tenant. */
        RetentionPolicySettingsDto: {
            /** @description The configured policies, ordered by object type. */
            policies: components["schemas"]["RetentionPolicyDto"][];
            /** @description Object types that are never removed and cannot get a retention policy. */
            protectedObjectTypes: string[];
        };
        /** @description Tenant-scoped roles (AI Coder doc §6). */
        Role: number;
        /** @description The memberships of one role in the tenant. */
        RoleMembershipCountDto: {
            /** @description The role. */
            role: components["schemas"]["Role"];
            /**
             * Format: int32
             * @description The number of active memberships.
             */
            active: number;
            /**
             * Format: int32
             * @description The number of disabled memberships.
             */
            disabled: number;
        };
        /**
         * @description Security and privacy figures of one tenant for its administrators. Contains counts, dates and names only: never a
         *     secret, a credential reference or a figure of another tenant. A figure without a data source is marked
         *     `not_available` instead of being estimated.
         */
        SecurityOverviewDto: {
            /**
             * Format: date-time
             * @description When the figures were determined (UTC).
             */
            generatedAt: string;
            /** @description The memberships per role, for every role. */
            usersByRole: components["schemas"]["RoleMembershipCountDto"][];
            /** @description Users without a recent sign-in. */
            inactiveUsers: components["schemas"]["InactiveUsersDto"];
            /** @description Refused requests. */
            accessDenied: components["schemas"]["AccessDeniedSummaryDto"];
            /** @description The credential references of the networks. */
            credentialRefs: components["schemas"]["CredentialRefSummaryDto"];
            /** @description Networks with a failing health check. */
            networkHealth: components["schemas"]["NetworkHealthSummaryDto"];
            /** @description The retention settings per object type (stored and shown only, not enforced). */
            retention: components["schemas"]["RetentionPolicySettingsDto"];
            /** @description Data exports in the last 30 days. */
            exports: components["schemas"]["ExportSummaryDto"];
        };
        /**
         * @description The readiness of the platform services. A component without a readiness check is reported as
         *     `not_available`; nothing is claimed about it.
         */
        ServiceHealthDto: {
            /**
             * Format: date-time
             * @description When the readiness was determined (UTC).
             */
            checkedAt: string;
            /** @description The platform components (API, database, job host). */
            components: components["schemas"]["ComponentHealthDto"][];
            /** @description The data provider per network of the caller's tenant, ordered by external network identifier. */
            dataProviders: components["schemas"]["DataProviderHealthDto"][];
        };
        /**
         * @description Request body for setting the credential reference of a network. The reference points to a secret in the secret
         *     store; never send the secret itself. The reference is write-only: no response ever contains it.
         */
        SetCredentialRefBody: {
            /**
             * @description Gets the reference to the secret, in the format of the configured secret store
             *     (`openbao:&lt;tenant path&gt;&lt;path&gt;[#field]`).
             */
            secretRef: null | string;
            purpose?: null | components["schemas"]["CredentialPurpose"];
        };
        /** @description A tenant as returned by the tenant administration endpoints. */
        TenantDto: {
            /**
             * Format: uuid
             * @description The tenant identifier.
             */
            id: string;
            /** @description The display name. */
            name: string;
            /** @description The data-residency policy code. */
            residencyPolicy: string;
            /** @description The lifecycle status. */
            status: components["schemas"]["TenantStatus"];
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description Lifecycle status of a tenant. */
        TenantStatus: number;
        /** @description Request body for setting the export policy of one or more export types; types not listed keep their policy. */
        UpdateExportPolicyBody: {
            /** @description Gets the policies to set, at most one per export type. */
            policies: null | components["schemas"]["ExportPolicyEntryBody"][];
        };
        /** @description Request body for setting the retention of one or more object types; object types not listed keep their setting. */
        UpdateRetentionPolicyBody: {
            /** @description Gets the policies to set, at most one per object type. */
            policies: null | components["schemas"]["RetentionPolicyEntryBody"][];
        };
        /** @description Request body for changing a tenant. Omitted values stay unchanged. */
        UpdateTenantBody: {
            /** @description Gets the new display name (1–200 characters). */
            name?: null | string;
            /** @description Gets the new data-residency policy code. */
            residencyPolicy?: null | string;
            status?: null | components["schemas"]["TenantStatus"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AuditEvents_GetAuditEvents: {
        parameters: {
            query?: {
                /** @description Earliest event time (inclusive, converted to UTC). */
                From?: string;
                /** @description Latest event time (exclusive, converted to UTC). */
                To?: string;
                /** @description The subject identifier of the actor. */
                Actor?: string;
                /** @description The kind of object, for example `Membership`. */
                EntityType?: string;
                /** @description The identifier of the object. */
                EntityId?: string;
                /** @description The action name, for example `Edit` or `AccessDenied` (case-insensitive). */
                Action?: string;
                /** @description The correlation ID of the request that caused the events. */
                CorrelationId?: string;
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["CursorPageOfAuditEventDto"];
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
    AuditEvents_ExportAuditEvents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportAuditEventsBody"];
                "text/json": components["schemas"]["ExportAuditEventsBody"];
                "application/*+json": components["schemas"]["ExportAuditEventsBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditEventDto"][];
                    "text/csv": components["schemas"]["AuditEventDto"][];
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
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    ExportPolicy_GetExportPolicy: {
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
                    "application/json": components["schemas"]["ExportPolicySettingsDto"];
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
    ExportPolicy_UpdateExportPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateExportPolicyBody"];
                "text/json": components["schemas"]["UpdateExportPolicyBody"];
                "application/*+json": components["schemas"]["UpdateExportPolicyBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExportPolicySettingsDto"];
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
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
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
    Governance_GetSecurityOverview: {
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
                    "application/json": components["schemas"]["SecurityOverviewDto"];
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
    Governance_GetServiceHealth: {
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
                    "application/json": components["schemas"]["ServiceHealthDto"];
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
    Memberships_GetMemberships: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["CursorPageOfMembershipDetailsDto"];
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
    Memberships_AddMembership: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddMembershipBody"];
                "text/json": components["schemas"]["AddMembershipBody"];
                "application/*+json": components["schemas"]["AddMembershipBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipDetailsDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Memberships_GetMembership: {
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
                    "application/json": components["schemas"]["MembershipDetailsDto"];
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
    Memberships_ChangeMembershipRole: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The membership identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeMembershipRoleBody"];
                "text/json": components["schemas"]["ChangeMembershipRoleBody"];
                "application/*+json": components["schemas"]["ChangeMembershipRoleBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipDetailsDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Memberships_DisableMembership: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
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
                    "application/json": components["schemas"]["MembershipDetailsDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Memberships_AddGrant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The membership identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddGrantBody"];
                "text/json": components["schemas"]["AddGrantBody"];
                "application/*+json": components["schemas"]["AddGrantBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GrantDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Memberships_RemoveGrant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The membership identifier. */
                id: string;
                /** @description The grant identifier. */
                grantId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
    Networks_GetNetworks: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["CursorPageOfDataNetworkDto"];
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
    Networks_RegisterNetwork: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterNetworkBody"];
                "text/json": components["schemas"]["RegisterNetworkBody"];
                "application/*+json": components["schemas"]["RegisterNetworkBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataNetworkDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Networks_GetNetwork: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The network identifier. */
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
                    "application/json": components["schemas"]["DataNetworkDto"];
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
    Networks_UpdateNetwork: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The network identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["NetworkSettingsBody"];
                "text/json": components["schemas"]["NetworkSettingsBody"];
                "application/*+json": components["schemas"]["NetworkSettingsBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataNetworkDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Networks_DisableNetwork: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The network identifier. */
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
                    "application/json": components["schemas"]["DataNetworkDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Networks_SetCredentialRef: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The network identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetCredentialRefBody"];
                "text/json": components["schemas"]["SetCredentialRefBody"];
                "application/*+json": components["schemas"]["SetCredentialRefBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataNetworkDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    RetentionPolicy_GetRetentionPolicy: {
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
                    "application/json": components["schemas"]["RetentionPolicySettingsDto"];
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
    RetentionPolicy_UpdateRetentionPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateRetentionPolicyBody"];
                "text/json": components["schemas"]["UpdateRetentionPolicyBody"];
                "application/*+json": components["schemas"]["UpdateRetentionPolicyBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetentionPolicySettingsDto"];
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
            /** @description Unprocessable Entity */
            422: {
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
    Tenants_GetTenants: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["CursorPageOfTenantDto"];
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
    Tenants_CreateTenant: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTenantBody"];
                "text/json": components["schemas"]["CreateTenantBody"];
                "application/*+json": components["schemas"]["CreateTenantBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TenantDto"];
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
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    Tenants_GetTenant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The tenant identifier. */
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
                    "application/json": components["schemas"]["TenantDto"];
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
    Tenants_UpdateTenant: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The tenant identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTenantBody"];
                "text/json": components["schemas"]["UpdateTenantBody"];
                "application/*+json": components["schemas"]["UpdateTenantBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TenantDto"];
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
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Precondition Required */
            428: {
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
