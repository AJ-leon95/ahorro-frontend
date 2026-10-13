import api from './axios';
import type { DashboardKPIs } from '../types/dashboard';

export async function obtenerKPIsDashboard(): Promise<DashboardKPIs> {
  const response = await api.get<DashboardKPIs>('/api/dashboard/kpis');
  return response.data;
}