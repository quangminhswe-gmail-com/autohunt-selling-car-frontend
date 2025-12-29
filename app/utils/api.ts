const getBaseUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.API_URL_INTERNAL;
    }
    return process.env.NEXT_PUBLIC_API_URL;
};

interface ApiOptions extends RequestInit {
    body?: any;
}

export const apiClient = async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { body, headers, ...customConfig } = options;
    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
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
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
};