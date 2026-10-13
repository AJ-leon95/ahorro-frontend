import api from './axios';
import type { Archivo } from '../types/archivo';

// ============================================
// POST /api/archivos/upload  (multipart/form-data)
// ============================================
export async function subirArchivo(file: File): Promise<Archivo> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<Archivo>('/api/archivos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}