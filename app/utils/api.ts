const getBaseUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.API_URL_INTERNAL || 'http://localhost:8080';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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

    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, config);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message;
        const text = Array.isArray(msg)
            ? msg.join('. ')
            : (typeof msg === 'string' ? msg : null);
        throw new Error(text || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
};