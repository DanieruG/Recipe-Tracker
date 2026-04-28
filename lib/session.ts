const SESSION_STORAGE_KEY = "recipe-tracker-session-id";

export function getOrCreateSessionId(): string | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
        return existing;
    }

    const generated =
        typeof window.crypto?.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
}

export function buildSessionHeaders(baseHeaders?: HeadersInit): Headers {
    const headers = new Headers(baseHeaders ?? {});
    const sessionId = getOrCreateSessionId();

    if (sessionId) {
        headers.set("x-session-id", sessionId);
    }

    return headers;
}
