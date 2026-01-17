export interface KAI {
  id: string;
  category: 'Safety' | 'Quality' | 'People' | 'Cost' | 'Delivery';
  description: string;
  isDone: boolean;
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
}

export interface TeamLeader {
  id: string;
  name: string;
  registrationNumber: string; // Matrícula
  shift: 'A' | 'B' | 'C';
  avatarUrl: string;
  kais: KAI[];
  kpis: KPI[];
  efficiencyScore: number; // 0-100 based on KAI completion
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TL_DETAILS = 'TL_DETAILS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}