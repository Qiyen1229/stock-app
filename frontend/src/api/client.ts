const BASE_URL = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  offline?: boolean;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('stock_app_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('stock_app_token');
      localStorage.removeItem('stock_app_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '請求失敗，請稍後再試');
    }

    return data as T;
  } catch (err: any) {
    if (!navigator.onLine) {
      throw new Error('目前處於離線狀態，行情資料可能不是最新');
    }
    throw err;
  }
}
