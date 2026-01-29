import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Factory,
  Search,
  Plus,
  Settings,
  Upload,
  Trash2,
  Menu,
  X,
  LogOut,
  Lock,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { TeamLeader, AppView, KAI, KPI } from './types';
import { MOCK_LEADERS, INITIAL_KAIS, INITIAL_KPIS } from './constants';
import { AICoach } from './components/AICoach';

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // App State - Inicialização com LocalStorage ou Mock
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [leaders, setLeaders] = useState<TeamLeader[]>(() => {
    const saved = localStorage.getItem('spw_leaders');
    return saved ? JSON.parse(saved) : MOCK_LEADERS;
  });

  const [globalKais, setGlobalKais] = useState<KAI[]>(() => {
    const saved = localStorage.getItem('spw_global_kais');
    return saved ? JSON.parse(saved) : INITIAL_KAIS;
  });

  const [globalKpis, setGlobalKpis] = useState<KPI[]>(() => {
    const saved = localStorage.getItem('spw_global_kpis');
    return saved ? JSON.parse(saved) : INITIAL_KPIS;
  });

  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsTab, setSettingsTab] = useState<'LEADERS' | 'METRICS'>('LEADERS');
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // --- Persistence Effects ---
  
  useEffect(() => {
    localStorage.setItem('spw_leaders', JSON.stringify(leaders));
  }, [leaders]);

  useEffect(() => {
    localStorage.setItem('spw_global_kais', JSON.stringify(globalKais));
  }, [globalKais]);

  useEffect(() => {
    localStorage.setItem('spw_global_kpis', JSON.stringify(globalKpis));
  }, [globalKpis]);

  // --- Auth Logic ---

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authData.email && authData.password) {
       if (authView === 'REGISTER' && !authData.name) {
           alert("Por favor, insira seu nome.");
           return;
       }
       // Simulating login
       setIsAuthenticated(true);
    } else {
        alert("Por favor, preencha todos os campos.");
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setAuthData({ name: '', email: '', password: '' });
      setCurrentView(AppView.DASHBOARD);
  };

  // --- App Logic ---

  const calculateEfficiency = (leaderKais: KAI[]): number => {
    const total = leaderKais.length;
    if (total === 0) return 0;
    const completed = leaderKais.filter(k => k.isDone).length;
    return Math.round((completed / total) * 100);
  };

  const handleToggleKai = (leaderId: string, kaiId: string) => {
    setLeaders(prev => prev.map(l => {
      if (l.id !== leaderId) return l;
      const updatedKais = l.kais.map(k => k.id === kaiId ? { ...k, isDone: !k.isDone } : k);
      return { ...l, kais: updatedKais, efficiencyScore: calculateEfficiency(updatedKais) };
    }));
  };

  const handleUpdateKpi = (leaderId: string, kpiId: string, value: string) => {
    setLeaders(prev => prev.map(l => {
      if (l.id !== leaderId) return l;
      const updatedKpis = l.kpis.map(k => k.id === kpiId ? { ...k, actual: Number(value) } : k);
      return { ...l, kpis: updatedKpis };
    }));
  };

  const handleAddLeader = () => {
    const newId = `tl-${Date.now()}`;
    const newLeader: TeamLeader = {
      id: newId,
      name: "Novo Team Leader",
      registrationNumber: "SPW-0000",
      shift: 'A',
      avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
      kais: globalKais.map(k => ({...k, isDone: false})),
      kpis: globalKpis.map(k => ({...k, actual: 0})),
      efficiencyScore: 0
    };
    setLeaders([...leaders, newLeader]);
    
    if (currentView !== AppView.SETTINGS) {
        setSelectedLeaderId(newId);
        setCurrentView(AppView.TL_DETAILS);
    }
  };

  const handleUpdateLeaderInfo = (id: string, field: keyof TeamLeader, value: string) => {
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleDeleteLeader = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este Team Leader?")) {
        setLeaders(prev => prev.filter(l => l.id !== id));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, leaderId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLeaders(prev => prev.map(l => l.id === leaderId ? { ...l, avatarUrl: reader.result as string } : l));
      };
      reader.readAsDataURL(file);
    }
  };

  const syncMetricsToLeaders = (newGlobalKais: KAI[], newGlobalKpis: KPI[]) => {
    setLeaders(prevLeaders => prevLeaders.map(leader => {
        const updatedKais = newGlobalKais.map(gKai => {
            const existing = leader.kais.find(lk => lk.id === gKai.id);
            return { ...gKai, isDone: existing ? existing.isDone : false };
        });
        const updatedKpis = newGlobalKpis.map(gKpi => {
            const existing = leader.kpis.find(lp => lp.id === gKpi.id);
            return { ...gKpi, actual: existing ? existing.actual : 0 };
        });
        return {
            ...leader,
            kais: updatedKais,
            kpis: updatedKpis,
            efficiencyScore: calculateEfficiency(updatedKais)
        };
    }));
  };

  const handleAddGlobalKai = () => {
    const newKai: KAI = { id: `k-${Date.now()}`, category: 'Safety', description: 'Nova Tarefa Padrão', isDone: false };
    const updated = [...globalKais, newKai];
    setGlobalKais(updated);
    syncMetricsToLeaders(updated, globalKpis);
  };

  const handleUpdateGlobalKai = (id: string, field: keyof KAI, value: any) => {
    const updated = globalKais.map(k => k.id === id ? { ...k, [field]: value } : k);
    setGlobalKais(updated);
    syncMetricsToLeaders(updated, globalKpis);
  };

  const handleDeleteGlobalKai = (id: string) => {
    const updated = globalKais.filter(k => k.id !== id);
    setGlobalKais(updated);
    syncMetricsToLeaders(updated, globalKpis);
  };

  const handleAddGlobalKpi = () => {
    const newKpi: KPI = { id: `p-${Date.now()}`, name: 'Novo Indicador', target: 0, actual: 0, unit: '#' };
    const updated = [...globalKpis, newKpi];
    setGlobalKpis(updated);
    syncMetricsToLeaders(globalKais, updated);
  };

  const handleUpdateGlobalKpi = (id: string, field: keyof KPI, value: any) => {
    const updated = globalKpis.map(k => k.id === id ? { ...k, [field]: value } : k);
    setGlobalKpis(updated);
    syncMetricsToLeaders(globalKais, updated);
  };

  const handleDeleteGlobalKpi = (id: string) => {
    const updated = globalKpis.filter(k => k.id !== id);
    setGlobalKpis(updated);
    syncMetricsToLeaders(globalKais, updated);
  };

  const filteredLeaders = useMemo(() => {
    return leaders.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaders, searchTerm]);

  const selectedLeader = useMemo(() => 
    leaders.find(l => l.id === selectedLeaderId), 
  [leaders, selectedLeaderId]);

  const globalEfficiency = leaders.length > 0 
    ? Math.round(leaders.reduce((acc, curr) => acc + curr.efficiencyScore, 0) / leaders.length)
    : 0;

  // --- Views ---

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fadeIn">
        <div className="bg-blue-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 relative z-10">
            <Factory className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight relative z-10">SPW Leader Track</h1>
          <p className="text-blue-100 mt-2 text-sm relative z-10">Portal de Supervisão e Performance</p>
        </div>
        
        <div className="p-8">
            <div className="flex justify-center mb-8 border-b border-slate-700">
                <button 
                    onClick={() => setAuthView('LOGIN')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${authView === 'LOGIN' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Login
                    {authView === 'LOGIN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
                <button 
                    onClick={() => setAuthView('REGISTER')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${authView === 'REGISTER' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Cadastro
                    {authView === 'REGISTER' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authView === 'REGISTER' && (
                    <div className="animate-fadeIn">
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                required={authView === 'REGISTER'}
                                value={authData.name}
                                onChange={e => setAuthData({...authData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-500"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>
                )}
                
                <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Corporativo</label>
                    <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="email" 
                            required
                            value={authData.email}
                            onChange={e => setAuthData({...authData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder