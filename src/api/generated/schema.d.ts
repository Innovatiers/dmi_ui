/**
 * Generated from api/openapi-v1.json by `npm run api:generate` (openapi-typescript). Do not edit.
 */

export interface paths {
    "/api/v1/asset-categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the asset categories, ordered by code. */
        get: operations["AssetCategories_GetAssetCategories"];
        put?: never;
        /** Adds an asset category. Honours `Idempotency-Key`; a duplicate code gives 409 `DUPLICATE_CODE`. */
        post: operations["AssetCategories_CreateAssetCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Searches the visible assets, ordered by name. `q` matches part of the name or code, case-insensitively. */
        get: operations["Assets_SearchAssets"];
        put?: never;
        /**
         * Creates an asset. Honours `Idempotency-Key`. A duplicate code gives 409 `DUPLICATE_CODE`; an unknown
         *     site, line, parent or category gives 422 `REFERENCE_NOT_FOUND`.
         */
        post: operations["Assets_CreateAsset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one asset; the response carries its ETag. */
        get: operations["Assets_GetAsset"];
        /**
         * Replaces the changeable fields of an asset. Requires `If-Match`. A parent that would create a cycle gives
         *     422 `ASSET_HIERARCHY_CYCLE`; an archived asset gives 409 `ASSET_ARCHIVED`.
         */
        put: operations["Assets_UpdateAsset"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/assets/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Archives an asset: status archived and end of validity. Nothing is deleted; child assets and linked records
         *     stay. Requires `If-Match` and honours `Idempotency-Key`.
         */
        post: operations["Assets_ArchiveAsset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the decisions within the caller's scope, newest first. */
        get: operations["Decisions_GetDecisions"];
        put?: never;
        /**
         * Proposes a decision. Honours `Idempotency-Key`. A source that does not exist in the caller's tenant gives
         *     422 `DECISION_SOURCE_NOT_FOUND` and nothing is linked; an owner who is not an active member gives 422
         *     `DECISION_OWNER_NOT_MEMBER`; an asset or site that does not exist in the caller's tenant gives 422
         *     `DECISION_ASSET_NOT_FOUND` or `DECISION_SITE_NOT_FOUND`, an asset that is not on the given site 422
         *     `DECISION_ASSET_SITE_MISMATCH`; an asset or site outside the caller's scope gives 422
         *     `DECISION_OUT_OF_SCOPE`.
         */
        post: operations["Decisions_CreateDecision"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/decisions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one decision; the response carries its ETag. */
        get: operations["Decisions_GetDecision"];
        /**
         * Replaces the content of a proposed decision (the sources stay). Requires `If-Match`; a stale ETag gives 409
         *     `CONCURRENCY_CONFLICT`, a decision that is no longer proposed 409 `DECISION_INVALID_TRANSITION`. The
         *     asset and site are checked as when proposing.
         */
        put: operations["Decisions_UpdateDecision"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/decisions/{id}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Marks a proposed decision as reviewed by the caller. Requires `If-Match` and honours
         *     `Idempotency-Key`. A decision that is not proposed gives 409 `DECISION_INVALID_TRANSITION`.
         */
        post: operations["Decisions_ReviewDecision"];
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
         *     references per network status, retention settings and exports. Administrators and, read-only, auditors (permission
         *     `ViewSecurityOverview`); a read by an auditor is recorded as `Read` audit event.
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
        /**
         * Adds a scope grant (tenant, site or asset) to a membership. Honours `Idempotency-Key`. A site or asset
         *     that does not exist in the caller's tenant gives 422 `GRANT_TARGET_NOT_FOUND` and links nothing.
         */
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
    "/api/v1/anylog/networks/{id}/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Discovers the datasets of the network through its provider; new datasets are stored with `allowed = false`.
         *     The discovery itself succeeds (200) whatever the outcome; a partial result is never `ok`. Honours
         *     `Idempotency-Key`.
         */
        post: operations["NetworkDatasets_DiscoverDatasets"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/datasets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the discovered datasets of the network, ordered by dataset identifier. */
        get: operations["NetworkDatasets_GetDatasets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/datasets/{datasetId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one dataset; the response carries its ETag. */
        get: operations["NetworkDatasets_GetDataset"];
        /**
         * Allows a dataset with its allowed fields (`allowed = true`, at least one discovered field) or disallows it
         *     (`allowed = false`, allowed fields cleared). Requires `If-Match`. An empty allowlist gives
         *     422 `ALLOWED_FIELDS_REQUIRED`; a field that was not discovered gives 422 `UNKNOWN_DATASET_FIELD`.
         */
        put: operations["NetworkDatasets_SetDatasetAccess"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Tests the network through its provider and stores the outcome. The test itself succeeds (200) whatever the
         *     outcome: `ok`, `auth`, `network`, `timeout`, `invalid_config`, `unavailable` or
         *     `feature_disabled`, with latency, `diagnosticCode`, `safeMessage`, `correlationId` and
         *     `checkedAt`. Never contains a vendor response, a credential or a stack trace. Honours `Idempotency-Key`.
         */
        post: operations["NetworkHealth_TestNetwork"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/anylog/networks/{id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the latest health of the network, marked `stale` when it is older than the configured threshold
         *     (default 5 minutes) or missing, and one page of the test history, newest first.
         */
        get: operations["NetworkHealth_GetNetworkHealth"];
        put?: never;
        post?: never;
        delete?: never;
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
    "/api/v1/production-lines/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one production line; the response carries its ETag. */
        get: operations["ProductionLines_GetProductionLine"];
        /** Replaces name and code of a production line. Requires `If-Match`. */
        put: operations["ProductionLines_UpdateProductionLine"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/production-lines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a production line in a site. Honours `Idempotency-Key`. */
        post: operations["ProductionLines_CreateProductionLine"];
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
    "/api/v1/sites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the visible sites, ordered by name. */
        get: operations["Sites_GetSites"];
        put?: never;
        /** Creates a site. Needs a grant on the whole tenant (403 otherwise). Honours `Idempotency-Key`. */
        post: operations["Sites_CreateSite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one site; the response carries its ETag. */
        get: operations["Sites_GetSite"];
        /** Replaces name, code and time zone of a site. Requires `If-Match`. */
        put: operations["Sites_UpdateSite"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sites/{id}/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the asset hierarchy of a site: its production lines with their assets, and the assets without a line.
         *     Dependencies between assets are given by `parentAssetId`. With only an asset grant in the site, the tree
         *     holds the granted assets and their production lines only. A tree of more than 5000 nodes (site, lines and
         *     assets) gives 422 `TREE_TOO_LARGE` and no partial tree.
         */
        get: operations["Sites_GetAssetTree"];
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
        /**
         * Creates a tenant with the start set of asset categories (pump, motor, compressor, conveyor). Honours
         *     `Idempotency-Key`.
         */
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
        /** @description An asset category of the tenant. */
        AssetCategoryDto: {
            /**
             * Format: uuid
             * @description The category identifier.
             */
            id: string;
            /** @description The lowercase code that assets refer to. */
            code: string;
            /** @description The display name. */
            name: string;
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description How critical an asset is for the operation. */
        AssetCriticality: number;
        /** @description An asset as returned by the asset hierarchy endpoints. */
        AssetDto: {
            /**
             * Format: uuid
             * @description The asset identifier.
             */
            id: string;
            /**
             * Format: uuid
             * @description The site the asset belongs to.
             */
            siteId: string;
            /**
             * Format: uuid
             * @description The production line, if any.
             */
            productionLineId: null | string;
            /**
             * Format: uuid
             * @description The asset this asset depends on, if any.
             */
            parentAssetId: null | string;
            /** @description The display name. */
            name: string;
            /** @description The code, unique per tenant. */
            code: string;
            /** @description The category code. */
            category: string;
            /** @description The criticality. */
            criticality: components["schemas"]["AssetCriticality"];
            /** @description The subject of the responsible owner, if any. */
            ownerSubjectId: null | string;
            /** @description The lifecycle status. */
            status: components["schemas"]["AssetStatus"];
            /**
             * Format: date-time
             * @description The start of the validity period (UTC).
             */
            validFrom: string;
            /**
             * Format: date-time
             * @description The end of the validity period (UTC); set when archived.
             */
            validTo: null | string;
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description Lifecycle status of an asset. */
        AssetStatus: number;
        /**
         * @description The asset hierarchy of one site: its production lines with their assets, and the assets without a line. Dependencies
         *     between assets are given by Guid? AssetDto.ParentAssetId.
         */
        AssetTreeDto: {
            /** @description The site. */
            site: components["schemas"]["SiteDto"];
            /** @description The production lines of the site, ordered by name. */
            productionLines: components["schemas"]["ProductionLineTreeDto"][];
            /** @description The assets of the site that belong to no production line, ordered by name. */
            unassignedAssets: components["schemas"]["AssetDto"][];
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
        /** @description Request body for creating an asset. */
        CreateAssetBody: {
            /**
             * Format: uuid
             * @description Gets the site the asset belongs to.
             */
            siteId: null | string;
            /**
             * Format: uuid
             * @description Gets the production line within the asset's site, if any.
             */
            productionLineId?: null | string;
            /**
             * Format: uuid
             * @description Gets the asset this asset depends on, if any.
             */
            parentAssetId?: null | string;
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the code, unique per tenant (1–64 letters, digits, dots, hyphens or underscores). */
            code: null | string;
            /** @description Gets the category code of the tenant (see `/api/v1/asset-categories`). */
            category: null | string;
            criticality: null | components["schemas"]["AssetCriticality"];
            /** @description Gets the identity-provider subject of the responsible owner, if any. */
            ownerSubjectId?: null | string;
            /**
             * Format: date-time
             * @description Gets the start of the validity period (UTC); the current time when omitted.
             */
            validFrom?: null | string;
        };
        /** @description Request body for adding an asset category. */
        CreateAssetCategoryBody: {
            /** @description Gets the code (lowercase letters, digits and hyphens; stored in lowercase). */
            code: null | string;
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
        };
        /** @description Request body for proposing a decision. */
        CreateDecisionBody: {
            /**
             * @description Gets the alerts, insights and investigations that gave rise to the decision (at most 20, each once). Each must
             *     exist in the caller's tenant; they cannot be changed afterwards.
             */
            sourceRefs?: null | components["schemas"]["DecisionSourceRefDto"][];
            /** @description Gets the short title (1–200 characters). */
            title: null | string;
            /** @description Gets the problem the decision addresses (1–4000 characters). */
            problemStatement: null | string;
            /**
             * Format: uuid
             * @description Gets the asset the decision concerns, if any.
             */
            assetId?: null | string;
            /**
             * Format: uuid
             * @description Gets the site the decision concerns, if any.
             */
            siteId?: null | string;
            /**
             * @description Gets the subject identifier of the person responsible, who must be an active member of the tenant. When left
             *     out, the creator becomes the owner (on creation) or the owner stays (on update).
             */
            ownerId?: null | string;
        };
        /** @description Request body for creating a production line. */
        CreateProductionLineBody: {
            /**
             * Format: uuid
             * @description Gets the site the line belongs to.
             */
            siteId: null | string;
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the code, unique per tenant (1–64 letters, digits, dots, hyphens or underscores). */
            code: null | string;
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
        CursorPageOfAssetCategoryDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["AssetCategoryDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfAssetDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["AssetDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
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
        CursorPageOfDecisionDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["DecisionDto"][];
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
        CursorPageOfNetworkDatasetDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["NetworkDatasetDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfNetworkHealthCheckDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["NetworkHealthCheckDto"][];
            /** @description The opaque cursor of the next page; `null` when this is the last page. */
            nextCursor: null | string;
        };
        /** @description One page of a cursor-paginated list. */
        CursorPageOfSiteDto: {
            /** @description The items of this page, in the stable order of the list. */
            items: components["schemas"]["SiteDto"][];
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
         * @description The outcome of one dataset discovery (diagnostics, CW-FR-M01-08). Contains only classified, non-secret values.
         *     The discovered datasets themselves are listed by `GET .../datasets`.
         */
        DatasetDiscoveryDto: {
            /**
             * Format: uuid
             * @description The network.
             */
            networkId: string;
            /** @description The classified outcome, one of NetworkHealthStatuses; never `ok` for a partial result. */
            status: string;
            /** @description The stable diagnostic code. */
            diagnosticCode: string;
            /** @description The client-safe explanation. */
            safeMessage: string;
            /** @description The correlation ID of the request. */
            correlationId: string;
            /**
             * Format: date-time
             * @description When the discovery finished (UTC).
             */
            checkedAt: string;
            /**
             * Format: int32
             * @description The measured duration of the provider call; `null` when no call was made.
             */
            latencyMs: null | number;
            /** @description Whether all nodes answered: `complete`, `partial` or `unavailable`. */
            completeness: string;
            /** @description The nodes that did not answer. */
            missingNodes: string[];
            /**
             * Format: int32
             * @description The number of valid datasets the provider reported.
             */
            discoveredCount: number;
            /**
             * Format: int32
             * @description The number of datasets stored for the first time (not allowed).
             */
            newCount: number;
            /**
             * Format: int32
             * @description The number of known datasets whose fields changed.
             */
            updatedCount: number;
            /**
             * Format: int32
             * @description The number of reported datasets that were ignored because their identifier is invalid.
             */
            skippedCount: number;
        };
        /** @description Request body for replacing the content of a proposed decision. */
        DecisionContentBody: {
            /** @description Gets the short title (1–200 characters). */
            title: null | string;
            /** @description Gets the problem the decision addresses (1–4000 characters). */
            problemStatement: null | string;
            /**
             * Format: uuid
             * @description Gets the asset the decision concerns, if any.
             */
            assetId?: null | string;
            /**
             * Format: uuid
             * @description Gets the site the decision concerns, if any.
             */
            siteId?: null | string;
            /**
             * @description Gets the subject identifier of the person responsible, who must be an active member of the tenant. When left
             *     out, the creator becomes the owner (on creation) or the owner stays (on update).
             */
            ownerId?: null | string;
        };
        /** @description A decision as returned by the API. */
        DecisionDto: {
            /**
             * Format: uuid
             * @description The decision identifier.
             */
            id: string;
            /** @description The short title. */
            title: string;
            /** @description The problem the decision addresses. */
            problemStatement: string;
            /** @description The lifecycle status. */
            status: components["schemas"]["DecisionStatus"];
            /**
             * Format: uuid
             * @description The asset the decision concerns, if any.
             */
            assetId: null | string;
            /**
             * Format: uuid
             * @description The site the decision concerns, if any.
             */
            siteId: null | string;
            /** @description The subject identifier of the person responsible. */
            ownerId: string;
            /** @description The subject identifier of the requester. */
            createdBy: string;
            /** @description The subject identifier of the reviewer, once reviewed. */
            reviewedBy: null | string;
            /**
             * Format: date-time
             * @description The time of the review (UTC), once reviewed.
             */
            reviewedAt: null | string;
            /** @description The subject identifier of the person who approved or rejected, once final. */
            decidedBy: null | string;
            /**
             * Format: date-time
             * @description The time of the approval or rejection (UTC), once final.
             */
            decidedAt: null | string;
            /** @description The reason of a rejection. */
            rejectionReason: null | string;
            /** @description The alerts, insights and investigations that gave rise to the decision. */
            sourceRefs: components["schemas"]["DecisionSourceRefDto"][];
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
        /** @description A source (alert, insight or investigation) of a decision. */
        DecisionSourceRefDto: {
            /** @description The kind of source. */
            sourceType: components["schemas"]["DecisionSourceType"];
            /**
             * Format: uuid
             * @description The source identifier.
             */
            sourceId: string;
        };
        /** @description The kind of object that gave rise to a decision. */
        DecisionSourceType: number;
        /**
         * @description Lifecycle status of a Decision: proposed, then reviewed, then approved or rejected. Approved and
         *     rejected are final.
         */
        DecisionStatus: number;
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
        /** @description A discovered dataset of a network and whether it may be used. */
        NetworkDatasetDto: {
            /**
             * Format: uuid
             * @description The dataset identifier.
             */
            id: string;
            /**
             * Format: uuid
             * @description The network.
             */
            networkId: string;
            /** @description The identifier of the dataset in the source network. */
            externalDatasetRef: string;
            /** @description The fields the source reported at the latest discovery. */
            fields: string[];
            /** @description Whether the dataset may be used. */
            allowed: boolean;
            /** @description The fields that may be used (allowlist); empty while not allowed. */
            allowedFields: string[];
            /**
             * Format: date-time
             * @description When the dataset was first discovered (UTC).
             */
            discoveredAt: string;
        };
        /**
         * @description The outcome of one network test (diagnostics, CW-FR-M01-08). Contains only classified, non-secret values: never a
         *     vendor response, an endpoint credential or a stack trace.
         */
        NetworkHealthCheckDto: {
            /**
             * Format: uuid
             * @description The check identifier.
             */
            id: string;
            /**
             * Format: uuid
             * @description The tested network.
             */
            networkId: string;
            /** @description The classified outcome, one of NetworkHealthStatuses. */
            status: string;
            /**
             * Format: int32
             * @description The measured duration of the provider call in milliseconds; `null` when no call was made.
             */
            latencyMs: null | number;
            /** @description The stable diagnostic code. */
            diagnosticCode: string;
            /** @description The client-safe explanation. */
            safeMessage: string;
            /** @description The correlation ID of the request that ran the test. */
            correlationId: string;
            /**
             * Format: date-time
             * @description When the test finished (UTC).
             */
            checkedAt: string;
        };
        /** @description The health of one network: the latest test outcome, whether it is stale, and one page of the test history. */
        NetworkHealthDto: {
            /**
             * Format: uuid
             * @description The network.
             */
            networkId: string;
            latest: null | components["schemas"]["NetworkHealthCheckDto"];
            /**
             * @description `true` when the latest outcome is older than the configured threshold (default 5 minutes) or there is none, so
             *             the status must not be read as current.
             */
            stale: boolean;
            /**
             * Format: date-time
             * @description When staleness was evaluated (UTC).
             */
            evaluatedAt: string;
            /** @description One page of test outcomes, newest first. */
            history: components["schemas"]["CursorPageOfNetworkHealthCheckDto"];
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
        /** @description A production line as returned by the asset hierarchy endpoints. */
        ProductionLineDto: {
            /**
             * Format: uuid
             * @description The production line identifier.
             */
            id: string;
            /**
             * Format: uuid
             * @description The site the line belongs to.
             */
            siteId: string;
            /** @description The display name. */
            name: string;
            /** @description The code, unique per tenant. */
            code: string;
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description A production line with its assets, as part of an AssetTreeDto. */
        ProductionLineTreeDto: {
            /** @description The production line. */
            productionLine: components["schemas"]["ProductionLineDto"];
            /** @description The assets of the line, ordered by name. */
            assets: components["schemas"]["AssetDto"][];
        };
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
        /** @description Request body for allowing or disallowing a discovered dataset. */
        SetDatasetAccessBody: {
            /** @description Gets a value indicating whether the dataset may be used. */
            allowed: null | boolean;
            /**
             * @description Gets the fields that may be used (allowlist). Required with at least one discovered field when
             *     bool? SetDatasetAccessBody.Allowed is `true`; must be empty or absent when it is `false`.
             */
            allowedFields?: null | string[];
        };
        /** @description Request body for creating or replacing a site. */
        SiteBody: {
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the code, unique per tenant (1–64 letters, digits, dots, hyphens or underscores). */
            code: null | string;
            /** @description Gets the IANA time zone, for example `Europe/Amsterdam`. */
            timeZone: null | string;
        };
        /** @description A site as returned by the asset hierarchy endpoints. */
        SiteDto: {
            /**
             * Format: uuid
             * @description The site identifier.
             */
            id: string;
            /** @description The display name. */
            name: string;
            /** @description The code, unique per tenant. */
            code: string;
            /** @description The IANA time zone of the site. */
            timeZone: string;
            /** @description The lifecycle status. */
            status: components["schemas"]["SiteStatus"];
            /**
             * Format: date-time
             * @description The creation time (UTC).
             */
            createdAt: string;
        };
        /** @description Lifecycle status of a site. */
        SiteStatus: number;
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
        /** @description Request body for replacing the changeable fields of an asset. The site cannot change; omitted optional values are cleared. */
        UpdateAssetBody: {
            /**
             * Format: uuid
             * @description Gets the production line within the asset's site, if any.
             */
            productionLineId?: null | string;
            /**
             * Format: uuid
             * @description Gets the asset this asset depends on, if any.
             */
            parentAssetId?: null | string;
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the code, unique per tenant (1–64 letters, digits, dots, hyphens or underscores). */
            code: null | string;
            /** @description Gets the category code of the tenant (see `/api/v1/asset-categories`). */
            category: null | string;
            criticality: null | components["schemas"]["AssetCriticality"];
            /** @description Gets the identity-provider subject of the responsible owner, if any. */
            ownerSubjectId?: null | string;
        };
        /** @description Request body for setting the export policy of one or more export types; types not listed keep their policy. */
        UpdateExportPolicyBody: {
            /** @description Gets the policies to set, at most one per export type. */
            policies: null | components["schemas"]["ExportPolicyEntryBody"][];
        };
        /** @description Request body for replacing name and code of a production line. */
        UpdateProductionLineBody: {
            /** @description Gets the display name (1–200 characters). */
            name: null | string;
            /** @description Gets the code, unique per tenant (1–64 letters, digits, dots, hyphens or underscores). */
            code: null | string;
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
    AssetCategories_GetAssetCategories: {
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
                    "application/json": components["schemas"]["CursorPageOfAssetCategoryDto"];
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
    AssetCategories_CreateAssetCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAssetCategoryBody"];
                "text/json": components["schemas"]["CreateAssetCategoryBody"];
                "application/*+json": components["schemas"]["CreateAssetCategoryBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetCategoryDto"];
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
    Assets_SearchAssets: {
        parameters: {
            query?: {
                /** @description Text contained in the name or code. */
                q?: string;
                /** @description A category code. */
                category?: string;
                /** @description A criticality. */
                criticality?: components["schemas"]["AssetCriticality"];
                /** @description A status; omitted returns active and archived assets. */
                status?: components["schemas"]["AssetStatus"];
                /** @description A site. */
                siteId?: string;
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
                    "application/json": components["schemas"]["CursorPageOfAssetDto"];
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
    Assets_CreateAsset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAssetBody"];
                "text/json": components["schemas"]["CreateAssetBody"];
                "application/*+json": components["schemas"]["CreateAssetBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDto"];
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
    Assets_GetAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The asset identifier. */
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
                    "application/json": components["schemas"]["AssetDto"];
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
    Assets_UpdateAsset: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The asset identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAssetBody"];
                "text/json": components["schemas"]["UpdateAssetBody"];
                "application/*+json": components["schemas"]["UpdateAssetBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDto"];
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
    Assets_ArchiveAsset: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The asset identifier. */
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
                    "application/json": components["schemas"]["AssetDto"];
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
    Decisions_GetDecisions: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
                /** @description Only decisions with this status, if given. */
                status?: components["schemas"]["DecisionStatus"];
                /** @description Only decisions about this asset, if given. */
                assetId?: string;
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
                    "application/json": components["schemas"]["CursorPageOfDecisionDto"];
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
    Decisions_CreateDecision: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDecisionBody"];
                "text/json": components["schemas"]["CreateDecisionBody"];
                "application/*+json": components["schemas"]["CreateDecisionBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DecisionDto"];
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
    Decisions_GetDecision: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The decision identifier. */
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
                    "application/json": components["schemas"]["DecisionDto"];
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
    Decisions_UpdateDecision: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The decision identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["DecisionContentBody"];
                "text/json": components["schemas"]["DecisionContentBody"];
                "application/*+json": components["schemas"]["DecisionContentBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DecisionDto"];
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
    Decisions_ReviewDecision: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The decision identifier. */
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
                    "application/json": components["schemas"]["DecisionDto"];
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
    NetworkDatasets_DiscoverDatasets: {
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
                    "application/json": components["schemas"]["DatasetDiscoveryDto"];
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
    NetworkDatasets_GetDatasets: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["CursorPageOfNetworkDatasetDto"];
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
    NetworkDatasets_GetDataset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The network identifier. */
                id: string;
                /** @description The dataset identifier. */
                datasetId: string;
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
                    "application/json": components["schemas"]["NetworkDatasetDto"];
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
    NetworkDatasets_SetDatasetAccess: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The network identifier. */
                id: string;
                /** @description The dataset identifier. */
                datasetId: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetDatasetAccessBody"];
                "text/json": components["schemas"]["SetDatasetAccessBody"];
                "application/*+json": components["schemas"]["SetDatasetAccessBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NetworkDatasetDto"];
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
    NetworkHealth_TestNetwork: {
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
                    "application/json": components["schemas"]["NetworkHealthCheckDto"];
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
    NetworkHealth_GetNetworkHealth: {
        parameters: {
            query?: {
                /** @description The maximum number of items; `null` uses the configured default. */
                Limit?: number;
                /** @description The opaque cursor returned as `nextCursor` by the previous page; `null` for the first page. */
                Cursor?: string;
            };
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
                    "application/json": components["schemas"]["NetworkHealthDto"];
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
    ProductionLines_GetProductionLine: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The production line identifier. */
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
                    "application/json": components["schemas"]["ProductionLineDto"];
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
    ProductionLines_UpdateProductionLine: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The production line identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProductionLineBody"];
                "text/json": components["schemas"]["UpdateProductionLineBody"];
                "application/*+json": components["schemas"]["UpdateProductionLineBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductionLineDto"];
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
    ProductionLines_CreateProductionLine: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProductionLineBody"];
                "text/json": components["schemas"]["CreateProductionLineBody"];
                "application/*+json": components["schemas"]["CreateProductionLineBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductionLineDto"];
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
    Sites_GetSites: {
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
                    "application/json": components["schemas"]["CursorPageOfSiteDto"];
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
    Sites_CreateSite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["SiteBody"];
                "text/json": components["schemas"]["SiteBody"];
                "application/*+json": components["schemas"]["SiteBody"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDto"];
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
    Sites_GetSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The site identifier. */
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
                    "application/json": components["schemas"]["SiteDto"];
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
    Sites_UpdateSite: {
        parameters: {
            query?: never;
            header: {
                /** @description The ETag of the version being changed, as returned by the API. */
                "If-Match": string;
            };
            path: {
                /** @description The site identifier. */
                id: string;
            };
            cookie?: never;
        };
        /** @description Token that is cancelled when the client disconnects. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["SiteBody"];
                "text/json": components["schemas"]["SiteBody"];
                "application/*+json": components["schemas"]["SiteBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDto"];
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
    Sites_GetAssetTree: {
        parameters: {
            query?: {
                /** @description Whether archived assets are included (default: no). */
                includeArchived?: boolean;
            };
            header?: never;
            path: {
                /** @description The site identifier. */
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
                    "application/json": components["schemas"]["AssetTreeDto"];
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
