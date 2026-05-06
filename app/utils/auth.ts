export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isLoggedIn(): boolean {
  return Boolean(getAuthToken());
}

export function buildLoginUrl(nextPath?: string): string {
  if (!nextPath) return '/login';
  const encoded = encodeURIComponent(nextPath);
  return `/login?next=${encoded}`;
}

