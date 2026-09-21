// =================================================================
// Archivo: src/services/api.ts
// Helper central de peticiones consumiendo VITE_API_URL del .env
// Usando sessionStorage por mejores prácticas de seguridad en laboratorios SENA
// =================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // BUENA PRÁCTICA: Usar sessionStorage para aislar el token a la pestaña actual
  const token = sessionStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Adjuntar token JWT en cabecera Bearer si existe en sessionStorage
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la comunicación con la API REST');
  }

  return data as T;
}