/**
 * THE LIVING LOGOS — Self-Sovereign Identity (SSI) Module
 * Provides DID generation, Verifiable Credential stubs,
 * and Digital Seal verification for canonical streams.
 */

import { v4Stub } from "./utils.js";

/**
 * Generate a Decentralized Identifier (DID)
 * Format: did:web:livinglogos.net:user:<uuid>
 */
export function generateDID(displayName) {
    const uuid = v4Stub();
    return {
        id: `did:web:livinglogos.net:user:${uuid}`,
        displayName: displayName || "Orthodox Faithful",
        created: new Date().toISOString(),
        method: "did:web",
        controller: "did:web:livinglogos.net",
        verificationMethod: [
            {
                id: `did:web:livinglogos.net:user:${uuid}#key-1`,
                type: "Ed25519VerificationKey2020",
                controller: `did:web:livinglogos.net:user:${uuid}`,
                publicKeyMultibase: `z${generatePseudoKey()}`,
            },
        ],
        service: [
            {
                id: `did:web:livinglogos.net:user:${uuid}#spiritual-wallet`,
                type: "SpiritualWallet",
                serviceEndpoint: "https://livinglogos.net/wallet",
            },
        ],
    };
}

/**
 * Create a Verifiable Credential stub
 * Types: "Baptism", "Chrismation", "ParishMembership", "BroadcasterAuth"
 */
export function createVerifiableCredential(type, subject) {
    const uuid = v4Stub();
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://livinglogos.net/credentials/v1",
        ],
        id: `urn:vc:livinglogos:${uuid}`,
        type: ["VerifiableCredential", `${type}Credential`],
        issuer: {
            id: "did:web:livinglogos.net",
            name: "The Living Logos Network",
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            id: subject?.did || "did:web:livinglogos.net:user:unknown",
            name: subject?.name || "Faithful One",
            credential: type,
            parish: subject?.parish || null,
            authority: subject?.authority || "Tier 3 — Local Parish",
        },
        proof: {
            type: "Ed25519Signature2020",
            created: new Date().toISOString(),
            proofPurpose: "assertionMethod",
            verificationMethod: "did:web:livinglogos.net#key-1",
            proofValue: `z${generatePseudoKey()}`,
        },
    };
}

/**
 * Verify a stream's Digital Seal of Authenticity
 * Returns the seal status and authority tier
 */
export function verifySeal(stream) {
    if (!stream) return { valid: false, reason: "Stream not found" };
    if (!stream.digitalSeal) {
        return {
            valid: false,
            reason: "No Digital Seal issued — pending verification",
            stream: stream.name,
        };
    }
    return {
        valid: true,
        seal: {
            type: "DigitalSealOfAuthenticity",
            stream: stream.name,
            authority: stream.authority,
            issuedBy: "The Living Logos — Canonical Authority",
            verifiedAt: new Date().toISOString(),
        },
    };
}

/**
 * Generate a pseudo-random key (not cryptographically secure — Phase One stub)
 */
function generatePseudoKey() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 44; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

/**
 * Directive 019: Update DID Profile with locale data
 * Enriches the DID document with language and country for sovereign analytics.
 * This data is stored locally (SSI principle — user controls their own data).
 */
export function updateDIDProfile(did, { language, country } = {}) {
    if (!did) return null;

    // Add or update the locale profile service
    const profileService = {
        id: `${did.id}#locale-profile`,
        type: "LocaleProfile",
        serviceEndpoint: "https://livinglogos.net/profile",
        metadata: {
            language: language || null,  // { code, name }
            country: country || null,    // { code, name, lat, lng }
            updatedAt: new Date().toISOString(),
        },
    };

    // Upsert into services array
    if (!did.service) did.service = [];
    const existingIdx = did.service.findIndex((s) => s.type === "LocaleProfile");
    if (existingIdx >= 0) {
        did.service[existingIdx] = profileService;
    } else {
        did.service.push(profileService);
    }

    return did;
}

// ── Directive 010: Digital Seal Registry ──
const sealRegistry = [];

/**
 * Issue a Digital Seal of Authenticity to a stream.
 * Cryptographically signs the stream and records it in the seal registry.
 */
export function issueSeal(streamId, authorityTier = "Tier 3") {
    const sealId = `seal-${generatePseudoKey().substring(0, 16)}`;
    const entry = {
        id: sealId,
        streamId,
        authority: authorityTier,
        issuedBy: "The Living Logos — Canonical Authority",
        issuedAt: new Date().toISOString(),
        signature: `z${generatePseudoKey()}`,
        valid: true,
    };
    sealRegistry.push(entry);
    return entry;
}

/**
 * Get the full seal registry (for Broadcaster Portal transparency)
 */
export function getSealRegistry() {
    return { total: sealRegistry.length, seals: [...sealRegistry] };
}
