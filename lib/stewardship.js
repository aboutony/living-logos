/**
 * THE LIVING LOGOS — Sovereign Stewardship Engine
 * Phase Two: The Sovereign Treasury
 *
 * 80/20 Micro-Stewardship Routing:
 *   - 80% → Local parish canonical wallet
 *   - 20% → Global Network infrastructure fund
 *   - 0%  → Platform fees (Zero-Ad Covenant)
 *
 * Architecture: In-memory store.
 * Directive 010: Production mainnet activated.
 */

import { v4Stub } from "./utils.js";
import { getStreamById } from "./streams.js";

// ── Constants ──
const PARISH_SHARE = 0.80;
const NETWORK_SHARE = 0.20;
const NETWORK_WALLET = "wallet:network:global-infrastructure-fund";
const TAPER_AMOUNTS = [1, 5, 10, 25]; // Canonical amounts in USD
const ENGINE_MODE = "production"; // Directive 010: Mainnet activated

// ── In-Memory Stores ──
let auditLog = [];          // Immutable append-only transaction log
let parishFunds = {};       // { streamId: { total, parishTotal, networkTotal } }
let believerHistory = {};   // { did: [ ...transactions ] }

/**
 * Execute a Digital Taper transaction with 80/20 sovereign split.
 *
 * @param {string} streamId - Target parish stream ID
 * @param {number} amount   - Transaction amount in USD
 * @param {string} donorDid - Optional DID of the believer (anonymous if absent)
 * @returns {{ success, transaction }}
 */
export function lightCandle(streamId, amount, donorDid) {
    // Validate amount
    if (!amount || amount <= 0) {
        return { success: false, error: "Invalid amount" };
    }

    // Validate stream exists
    const stream = getStreamById(streamId);
    if (!stream) {
        return { success: false, error: `Stream not found: ${streamId}` };
    }

    // Calculate sovereign split
    const parishAmount = Math.round(amount * PARISH_SHARE * 100) / 100;
    const networkAmount = Math.round(amount * NETWORK_SHARE * 100) / 100;

    // Build transaction record
    const txId = `tx-taper-${v4Stub()}`;
    const transaction = {
        id: txId,
        type: "DigitalTaper",
        timestamp: new Date().toISOString(),
        donor: donorDid || "anonymous",
        streamId: stream.id,
        parishName: stream.name,
        parishLocation: stream.location,
        parishWallet: stream.walletAddress || `wallet:parish:${stream.id}`,
        networkWallet: NETWORK_WALLET,
        amount: {
            total: amount,
            currency: "USD",
            parishShare: parishAmount,
            networkShare: networkAmount,
            platformFee: 0.00, // ZERO platform fees — Sovereign Covenant
        },
        split: {
            parishPercent: PARISH_SHARE * 100,
            networkPercent: NETWORK_SHARE * 100,
        },
        status: "confirmed",
        seal: stream.digitalSeal ? "verified" : "pending",
        mode: ENGINE_MODE, // Directive 010: mainnet tag
    };

    // ── Append to immutable audit log ──
    auditLog.push(Object.freeze({ ...transaction }));

    // ── Update parish fund accumulator ──
    if (!parishFunds[streamId]) {
        parishFunds[streamId] = {
            streamId,
            parishName: stream.name,
            parishWallet: transaction.parishWallet,
            totalReceived: 0,
            parishTotal: 0,
            networkTotal: 0,
            transactionCount: 0,
            lastTransaction: null,
        };
    }
    const fund = parishFunds[streamId];
    fund.totalReceived += amount;
    fund.parishTotal += parishAmount;
    fund.networkTotal += networkAmount;
    fund.transactionCount += 1;
    fund.lastTransaction = transaction.timestamp;

    // ── Record believer history ──
    const did = donorDid || "anonymous";
    if (!believerHistory[did]) {
        believerHistory[did] = [];
    }
    believerHistory[did].push({
        id: txId,
        timestamp: transaction.timestamp,
        amount,
        parishName: stream.name,
        parishLocation: stream.location,
        streamId: stream.id,
        status: "confirmed",
    });

    return { success: true, transaction };
}

/**
 * Get the immutable audit log for all 80/20 splits.
 * @param {number} limit - Max records to return (newest first)
 */
export function getAuditLog(limit = 100) {
    return {
        count: auditLog.length,
        entries: [...auditLog].reverse().slice(0, limit),
        sovereignPolicy: {
            parishShare: `${PARISH_SHARE * 100}%`,
            networkShare: `${NETWORK_SHARE * 100}%`,
            platformFee: "0% — Zero Platform Fees",
        },
    };
}

/**
 * Get accumulated stewardship funds for a parish.
 * @param {string} streamId
 */
export function getParishFunds(streamId) {
    const fund = parishFunds[streamId];
    if (!fund) {
        const stream = getStreamById(streamId);
        return {
            streamId,
            parishName: stream?.name || "Unknown",
            totalReceived: 0,
            parishTotal: 0,
            networkTotal: 0,
            transactionCount: 0,
            recentTransactions: [],
        };
    }

    // Include recent transactions from audit log
    const recentTxs = auditLog
        .filter((tx) => tx.streamId === streamId)
        .reverse()
        .slice(0, 20);

    return {
        ...fund,
        recentTransactions: recentTxs,
    };
}

/**
 * Get stewardship history for a believer (by DID).
 * @param {string} did
 */
export function getBelieverHistory(did) {
    const history = believerHistory[did || "anonymous"] || [];
    const totalGiven = history.reduce((sum, tx) => sum + tx.amount, 0);
    const uniqueParishes = [...new Set(history.map((tx) => tx.parishName))];

    return {
        did: did || "anonymous",
        totalGiven,
        candlesLit: history.length,
        parishesSupported: uniqueParishes.length,
        parishes: uniqueParishes,
        transactions: [...history].reverse(),
    };
}

/**
 * Get summary stats for the global stewardship network.
 */
export function getNetworkStats() {
    const totalTransactions = auditLog.length;
    const totalAmount = auditLog.reduce((sum, tx) => sum + tx.amount.total, 0);
    const totalToParishes = auditLog.reduce((sum, tx) => sum + tx.amount.parishShare, 0);
    const totalToNetwork = auditLog.reduce((sum, tx) => sum + tx.amount.networkShare, 0);
    const uniqueParishes = [...new Set(auditLog.map((tx) => tx.streamId))].length;
    const uniqueDonors = [...new Set(auditLog.map((tx) => tx.donor))].length;

    return {
        totalTransactions,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalToParishes: Math.round(totalToParishes * 100) / 100,
        totalToNetwork: Math.round(totalToNetwork * 100) / 100,
        platformFees: 0.00,
        uniqueParishes,
        uniqueDonors,
    };
}

/**
 * Directive 010: Public Audit Log — sanitized for transparency.
 * Strips donor DIDs for privacy. Published to Broadcaster Portal.
 */
export function getPublicAuditLog(limit = 50) {
    return {
        mode: ENGINE_MODE,
        count: auditLog.length,
        entries: [...auditLog].reverse().slice(0, limit).map((tx) => ({
            id: tx.id,
            timestamp: tx.timestamp,
            parishName: tx.parishName,
            parishLocation: tx.parishLocation,
            amount: tx.amount,
            split: tx.split,
            status: tx.status,
            seal: tx.seal,
            mode: tx.mode,
            // donor DID intentionally omitted for privacy
        })),
        sovereignPolicy: {
            parishShare: `${PARISH_SHARE * 100}%`,
            networkShare: `${NETWORK_SHARE * 100}%`,
            platformFee: "0% — Zero Platform Fees",
            mode: ENGINE_MODE,
        },
    };
}

/**
 * Directive 010: Treasury Stats — global totals for Broadcaster Portal
 */
export function getTreasuryStats() {
    const totalAmount = auditLog.reduce((sum, tx) => sum + tx.amount.total, 0);
    const totalToParishes = auditLog.reduce((sum, tx) => sum + tx.amount.parishShare, 0);
    const totalToNetwork = auditLog.reduce((sum, tx) => sum + tx.amount.networkShare, 0);
    return {
        mode: ENGINE_MODE,
        totalCandles: auditLog.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalToParishes: Math.round(totalToParishes * 100) / 100,
        totalToNetwork: Math.round(totalToNetwork * 100) / 100,
        platformFees: 0.00,
        uniqueParishes: [...new Set(auditLog.map((tx) => tx.streamId))].length,
    };
}

export { PARISH_SHARE, NETWORK_SHARE, TAPER_AMOUNTS, ENGINE_MODE };
