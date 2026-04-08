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

  // 1. Lấy token từ két sắt (chỉ chạy trên trình duyệt)
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  // 2. Gắn token vào Header (Giống hệt tab Auth trong Postman)
  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      // Nếu có token thì tự động thêm dòng Authorization vào
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
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
};