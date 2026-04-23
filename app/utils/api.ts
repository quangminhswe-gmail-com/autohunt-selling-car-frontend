const getBaseUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.API_URL_INTERNAL || 'http://localhost:8080';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const normalizeEndpoint = (endpoint: string) => (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
const trimSlash = (value: string) => value.replace(/\/+$/, '');
const buildUrl = (baseUrl: string, endpoint: string) => `${trimSlash(baseUrl)}${normalizeEndpoint(endpoint)}`;

const getCandidateBaseUrls = () => {
    const urls: string[] = [];
    const primary = getBaseUrl();
    if (primary) urls.push(primary);

    // Browser fallback for local development when env is missing/misconfigured.
    if (typeof window !== 'undefined') {
        urls.push('http://localhost:8080', 'http://127.0.0.1:8080');
    }

    return Array.from(new Set(urls.filter(Boolean)));
};

interface ApiOptions extends RequestInit {
    body?: any;
    headers?: Record<string, string>;
}

export const apiClient = async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { body, headers, ...customConfig } = options;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    };
    if (body) {
        config.body = JSON.stringify(body);
    }

    const candidateBaseUrls = getCandidateBaseUrls();
    let lastError: unknown = null;

    for (const baseUrl of candidateBaseUrls) {
        const url = buildUrl(baseUrl, endpoint);

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.message;
                const text = Array.isArray(msg)
                    ? msg.join('. ')
                    : (typeof msg === 'string' ? msg : null);
                throw new Error(text || `Error ${response.status}: ${response.statusText}`);
            }

            // Handle empty-body responses (e.g., DELETE endpoints or 204 No Content).
            if (response.status === 204) {
                return undefined as T;
            }

            const responseText = await response.text();
            if (!responseText) {
                return undefined as T;
            }

            try {
                return JSON.parse(responseText) as T;
            } catch {
                // If backend returns plain text, still return safely.
                return responseText as T;
            }
        } catch (err) {
            lastError = err;
            // If request reached backend and returned an API error, don't retry other base URLs.
            if (err instanceof Error && !err.message.toLowerCase().includes('failed to fetch')) {
                throw err;
            }
        }
    }

    const failedEndpoint = normalizeEndpoint(endpoint);
    throw new Error(
        `Cannot connect to API (${failedEndpoint}). Please check backend server and NEXT_PUBLIC_API_URL. ${lastError instanceof Error ? `Details: ${lastError.message}` : ''}`.trim()
    );
};