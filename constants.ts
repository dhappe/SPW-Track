import { TeamLeader, KAI, KPI } from './types';

export const INITIAL_KAIS: KAI[] = [
  { id: 'k1', category: 'Safety', description: 'Realizar Briefing Diário de Segurança (5 min)', isDone: false },
  { id: 'k2', category: 'Safety', description: 'Auditoria de EPIs da equipe', isDone: false },
  { id: 'k3', category: 'Quality', description: 'Realizar Gemba Walk focado em Qualidade', isDone: false },
  { id: 'k4', category: 'Quality', description: 'Verificar Posto "Red Rabbit" (Dispositivo de erro)', isDone: false },
  { id: 'k5', category: 'People', description: 'Atualizar Matriz de Polivalência', isDone: false },
  { id: 'k6', category: 'Cost', description: 'Verificar desperdícios (Muda) na linha', isDone: false },
  { id: 'k7', category: 'Delivery', description: 'Preencher Quadro de Produção Hora a Hora', isDone: false },
];

export const INITIAL_KPIS: KPI[] = [
  { id: 'p1', name: 'Absenteísmo', target: 2, actual: 0, unit: '%' },
  { id: 'p2', name: 'Segurança (Atos Inseguros)', target: 0, actual: 0, unit: '#' },
  { id: 'p3', name: 'Qualidade (Defeitos)', target: 0, actual: 0, unit: '#' },
  { id: 'p4', name: 'OPE (Eficiência)', target: 85, actual: 0, unit: '%' },
];

export const MOCK_LEADERS: TeamLeader[] = [
  {
    id: 'tl-001',
    name: 'Carlos Mendes',
    registrationNumber: 'SPW-8821',
    shift: 'A',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    efficiencyScore: 85,
    kais: INITIAL_KAIS.map(k => ({...k, isDone: Math.random() > 0.3})), // Random initial state
    kpis: [
      { id: 'p1', name: 'Absenteísmo', target: 2, actual: 1.5, unit: '%' },
      { id: 'p2', name: 'Segurança (Atos Inseguros)', target: 0, actual: 0, unit: '#' },
      { id: 'p3', name: 'Qualidade (Defeitos)', target: 0, actual: 2, unit: '#' },
      { id: 'p4', name: 'OPE (Eficiência)', target: 85, actual: 82, unit: '%' },
    ]
  },
  {
    id: 'tl-002',
    name: 'Ana Souza',
    registrationNumber: 'SPW-9934',
    shift: 'B',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    efficiencyScore: 92,
    kais: INITIAL_KAIS.map(k => ({...k, isDone: Math.random() > 0.2})),
    kpis: [
      { id: 'p1', name: 'Absenteísmo', target: 2, actual: 0, unit: '%' },
      { id: 'p2', name: 'Segurança (Atos Inseguros)', target: 0, actual: 0, unit: '#' },
      { id: 'p3', name: 'Qualidade (Defeitos)', target: 0, actual: 0, unit: '#' },
      { id: 'p4', name: 'OPE (Eficiência)', target: 85, actual: 88, unit: '%' },
    ]
  },
   {
    id: 'tl-003',
    name: 'Roberto Dias',
    registrationNumber: 'SPW-7741',
    shift: 'A',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    efficiencyScore: 60,
    kais: INITIAL_KAIS.map(k => ({...k, isDone: Math.random() > 0.5})),
    kpis: [
      { id: 'p1', name: 'Absenteísmo', target: 2, actual: 5, unit: '%' },
      { id: 'p2', name: 'Segurança (Atos Inseguros)', target: 0, actual: 1, unit: '#' },
      { id: 'p3', name: 'Qualidade (Defeitos)', target: 0, actual: 4, unit: '#' },
      { id: 'p4', name: 'OPE (Eficiência)', target: 85, actual: 75, unit: '%' },
    ]
  }
];
