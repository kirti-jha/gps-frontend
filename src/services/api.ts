import { io, Socket } from 'socket.io-client';

const API_BASE = '/api/v1';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('trackx_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'API Request Failed');
  }

  return json.data as T;
}

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      reconnectionAttempts: 5,
      timeout: 10000
    });
  }
  return socketInstance;
}
