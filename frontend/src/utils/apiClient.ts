/**
 * Tanamur GPS API Client
 * Handles hex-encoding of payloads as per the "Stateless Hex Auth" methodology.
 */

const API_BASE = "/api";

/**
 * Legacy Hex Encoding from global.php
 */
const hexEncode = (str: string): string => {
    let ret = "";
    const max = str.length;
    for (let i = 0; i < max; i++) {
        const c = str.charCodeAt(i);
        const h = (c ^ ((i + 1) * 634 + max)).toString(16);
        ret += h.slice(-2);
    }
    const smax = max.toString();
    return "_0" + smax.length + smax + ret;
};

/**
 * Legacy Hex Decoding from global.php
 */
const hexDecode = (str: string): string => {
    if (!str.includes("_0")) return "";
    const ipos = str.indexOf("_0");
    const ilen = parseInt(str.substr(ipos + 2, 1));
    const m = parseInt(str.substr(ipos + 3, ilen));
    if (m < 1) return "";

    const start = ipos + 3 + ilen;
    const hexPart = str.substr(start, 2 * m);

    let ret = "";
    for (let i = 0; i < m; i++) {
        const c = parseInt(hexPart.substr(i * 2, 2), 16);
        const h = 255 & (c ^ ((i + 1) * 634 + m));
        ret += String.fromCharCode(h);
    }
    return ret;
};

export const apiRequest = async (endpoint: string, payload: any, method: "GET" | "POST" = "GET") => {
    const hexReq = hexEncode(JSON.stringify(payload));
    const url = `${API_BASE}/${endpoint}?req=${encodeURIComponent(hexReq)}`;

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
    });

    const rawJson = await response.json();

    if (rawJson.res) {
        const decoded = hexDecode(rawJson.res);
        return JSON.parse(decoded);
    }

    return rawJson;
};

export const auth = {
    login: (username: string, pass: string) => apiRequest("logon", { u: username, p: pass }),
};

export const tracking = {
    getLastPos: (cid: number, lastCheck: number) => apiRequest("lastpos", { cid, last: lastCheck }),
    getFleet: (cid: number) => apiRequest("readtbl", { cid, tname: "mobil" }),
    getAlerts: (cid: number) => apiRequest("readtbl", { cid, tname: "alerts" }),
    getHistory: (cid: number, mid: number, date: string) => apiRequest("readtbl", { cid, mid, date, tname: "history" }),
    getTrips: (cid: number, mid: number, date: string) => apiRequest("readtbl", { cid, mid, date, tname: "trips" }),
    getStops: (cid: number, mid: number, date: string) => apiRequest("readtbl", { cid, mid, date, tname: "stops" }),
    getFuelHistory: (cid: number) => apiRequest("readtbl", { cid, tname: "fuelhis" }),
};

export const dashboard = {
    getMetrics: (cid: number) => apiRequest("dashboard/metrics", { cid }),
};

export const vehicles = {
    add: (cid: number, data: any) => apiRequest("vehicles/add", { cid, ...data }, "POST"),
};

export const geofences = {
    list: (cid: number) => apiRequest("geofences", { cid }),
    save: (cid: number, data: any) => apiRequest("geofences/save", { cid, ...data }, "POST"),
    delete: (cid: number, id: number) => apiRequest("geofences/delete", { cid, id }, "POST"),
};
