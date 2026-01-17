import React, { useState, useMemo, useRef } from 'react';
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

  // App State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leaders, setLeaders] = useState<TeamLeader[]>(MOCK_LEADERS);
  const [globalKais, setGlobalKais] = useState<KAI[]>(INITIAL_KAIS);
  const [globalKpis, setGlobalKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsTab, setSettingsTab] = useState<'LEADERS' | 'METRICS'>('LEADERS');
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-500"
                            placeholder="seu.email@empresa.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Senha</label>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="password" 
                            required
                            value={authData.password}
                            onChange={e => setAuthData({...authData, password: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] mt-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    {authView === 'LOGIN' ? 'Entrar no Sistema' : 'Criar Conta'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </form>
            
             <p className="text-center text-xs text-slate-500 mt-6">
                © {new Date().getFullYear()} SPW Leader Track v1.0
            </p>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Factory className="text-white w-6 h-6" />
            </div>
            <div>
                <h1 className="text-white font-bold text-lg tracking-tight">SPW Track</h1>
                <p className="text-xs text-slate-500">Supervisor Portal</p>
            </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
            onClick={() => handleNavClick(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === AppView.DASHBOARD ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
            >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard Geral</span>
            </button>
            <button 
            onClick={() => handleNavClick(AppView.REPORTS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === AppView.REPORTS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
            >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Relatórios</span>
            </button>
            <div className="pt-4 mt-4 border-t border-slate-800">
                <button 
                onClick={() => handleNavClick(AppView.SETTINGS)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === AppView.SETTINGS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Configurações</span>
                </button>
            </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
            <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Média de Eficiência</p>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${globalEfficiency >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                    {globalEfficiency}%
                    </span>
                    <span className="text-xs text-slate-500 mb-1">Total Plant</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                    className={`h-full rounded-full ${globalEfficiency >= 80 ? 'bg-green-500' : 'bg-orange-500'}`} 
                    style={{ width: `${globalEfficiency}%` }}
                    ></div>
                </div>
            </div>
            
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all text-sm font-medium"
            >
                <LogOut className="w-4 h-4" />
                Sair do Sistema
            </button>
        </div>
      </aside>
    </>
  );

  const renderMobileHeader = () => (
    <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Factory className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg">SPW Track</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-slate-300 hover:text-white">
            <Menu className="w-7 h-7" />
        </button>
    </header>
  );

  const renderDashboard = () => (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
          <p className="text-slate-500 text-sm md:text-base">Bem-vindo, {authData.name || 'Supervisor'}</p>
        </div>
        <button 
          onClick={handleAddLeader}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Novo Team Leader
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Líderes</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{leaders.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Críticos (&lt;70%)</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">
                {leaders.filter(l => l.efficiencyScore < 70).length}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Aderência (KAIs)</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">{globalEfficiency}%</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou matrícula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Team Leader</th>
                <th className="p-4 font-semibold">Matrícula</th>
                <th className="p-4 font-semibold text-center">Turno</th>
                <th className="p-4 font-semibold text-center">Eficiência (KAI)</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaders.map(leader => (
                <tr key={leader.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={leader.avatarUrl} alt={leader.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span className="font-medium text-slate-900">{leader.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{leader.registrationNumber}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                      {leader.shift}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${leader.efficiencyScore >= 80 ? 'bg-green-500' : leader.efficiencyScore >= 60 ? 'bg-orange-400' : 'bg-red-500'}`} 
                          style={{ width: `${leader.efficiencyScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-8">{leader.efficiencyScore}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {leader.efficiencyScore >= 80 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Excelente
                      </span>
                    ) : leader.efficiencyScore >= 60 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Atenção
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Crítico
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedLeaderId(leader.id);
                        setCurrentView(AppView.TL_DETAILS);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
          <p className="text-slate-500 text-sm md:text-base">Gerencie equipe e indicadores</p>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {/* Tabs */}
        <div className="flex flex-row border-b border-slate-200 overflow-x-auto">
            <button 
                onClick={() => setSettingsTab('LEADERS')}
                className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${settingsTab === 'LEADERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Users className="w-4 h-4" />
                Líderes
            </button>
            <button 
                onClick={() => setSettingsTab('METRICS')}
                className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${settingsTab === 'METRICS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <BarChart3 className="w-4 h-4" />
                Métricas
            </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
            {settingsTab === 'LEADERS' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-4 rounded-lg border border-slate-100 gap-4 md:gap-0">
                        <p className="text-sm text-slate-600">Adicione ou edite as informações cadastrais dos seus Team Leaders.</p>
                        <button 
                             onClick={handleAddLeader}
                             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm w-full md:w-auto justify-center"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Líder
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {leaders.map(leader => (
                            <div key={leader.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors bg-white">
                                {/* Avatar Upload */}
                                <div className="relative group shrink-0 mx-auto md:mx-0">
                                    <img src={leader.avatarUrl} className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors" />
                                    <button 
                                        onClick={() => fileInputRefs.current[leader.id]?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                                    >
                                        <Upload className="w-6 h-6" />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={el => fileInputRefs.current[leader.id] = el}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoUpload(e, leader.id)}
                                    />
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            value={leader.name}
                                            onChange={(e) => handleUpdateLeaderInfo(leader.id, 'name', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Matrícula</label>
                                        <input 
                                            type="text" 
                                            value={leader.registrationNumber}
                                            onChange={(e) => handleUpdateLeaderInfo(leader.id, 'registrationNumber', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Turno</label>
                                        <select 
                                            value={leader.shift}
                                            onChange={(e) => handleUpdateLeaderInfo(leader.id, 'shift', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            <option value="A">Turno A</option>
                                            <option value="B">Turno B</option>
                                            <option value="C">Turno C</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleDeleteLeader(leader.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full md:w-auto flex justify-center"
                                    title="Remover Líder"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {settingsTab === 'METRICS' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* KAI Management */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                                KAIs (Tarefas)
                            </h3>
                            <button 
                                onClick={handleAddGlobalKai}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {globalKais.map(kai => (
                                <div key={kai.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                                    <textarea 
                                        value={kai.description}
                                        onChange={(e) => handleUpdateGlobalKai(kai.id, 'description', e.target.value)}
                                        className="w-full p-2 mb-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                        rows={2}
                                    />
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                        <select 
                                            value={kai.category}
                                            onChange={(e) => handleUpdateGlobalKai(kai.id, 'category', e.target.value)}
                                            className="text-xs p-1 border border-slate-300 rounded bg-white w-full sm:w-auto"
                                        >
                                            <option value="Safety">Safety</option>
                                            <option value="Quality">Quality</option>
                                            <option value="People">People</option>
                                            <option value="Cost">Cost</option>
                                            <option value="Delivery">Delivery</option>
                                        </select>
                                        <button 
                                            onClick={() => handleDeleteGlobalKai(kai.id)}
                                            className="text-slate-400 hover:text-red-500 w-full sm:w-auto flex justify-end"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KPI Management */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                KPIs (Indicadores)
                            </h3>
                            <button 
                                onClick={handleAddGlobalKpi}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
                            </button>
                        </div>
                         <div className="space-y-3">
                            {globalKpis.map(kpi => (
                                <div key={kpi.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={kpi.name}
                                            onChange={(e) => handleUpdateGlobalKpi(kpi.id, 'name', e.target.value)}
                                            className="flex-1 p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                                            placeholder="Nome do KPI"
                                        />
                                        <button 
                                            onClick={() => handleDeleteGlobalKpi(kpi.id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-1">
                                            <label className="text-xs text-slate-500 whitespace-nowrap">Meta:</label>
                                            <input 
                                                type="number" 
                                                value={kpi.target}
                                                onChange={(e) => handleUpdateGlobalKpi(kpi.id, 'target', Number(e.target.value))}
                                                className="w-full p-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                         <div className="flex items-center gap-1 w-24">
                                            <label className="text-xs text-slate-500">Un:</label>
                                            <input 
                                                type="text" 
                                                value={kpi.unit}
                                                onChange={(e) => handleUpdateGlobalKpi(kpi.id, 'unit', e.target.value)}
                                                className="w-full p-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderTLDetails = () => {
    if (!selectedLeader) return null;

    return (
      <div className="p-4 md:p-8 w-full max-w-6xl mx-auto animate-fadeIn">
        <button 
          onClick={() => setCurrentView(AppView.DASHBOARD)}
          className="mb-6 text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Voltar para Dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Profile & Info */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block group">
                <img src={selectedLeader.avatarUrl} alt={selectedLeader.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4" />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${selectedLeader.efficiencyScore >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedLeader.name}</h2>
              <p className="text-slate-500 font-mono text-sm mt-1">{selectedLeader.registrationNumber} • Turno {selectedLeader.shift}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Eficiência KAI</p>
                  <p className={`text-2xl font-bold mt-1 ${selectedLeader.efficiencyScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                    {selectedLeader.efficiencyScore}%
                  </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">KPIs Críticos</p>
                    <p className="text-2xl font-bold mt-1 text-slate-700">
                        {selectedLeader.kpis.filter(k => k.actual > k.target && k.name !== 'OPE (Eficiência)' || (k.name === 'OPE (Eficiência)' && k.actual < k.target)).length}
                    </p>
                </div>
              </div>
            </div>

            {/* KPI Inputs */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Input de Resultados (KPIs)
              </h3>
              <div className="space-y-4">
                {selectedLeader.kpis.map(kpi => {
                   const isAlert = (kpi.name !== 'OPE (Eficiência)' && kpi.actual > kpi.target) || (kpi.name === 'OPE (Eficiência)' && kpi.actual < kpi.target);
                   return (
                    <div key={kpi.id} className="group">
                        <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-slate-700">{kpi.name}</label>
                        <span className="text-xs text-slate-400">Meta: {kpi.target}{kpi.unit}</span>
                        </div>
                        <div className="relative">
                        <input 
                            type="number" 
                            value={kpi.actual}
                            onChange={(e) => handleUpdateKpi(selectedLeader.id, kpi.id, e.target.value)}
                            className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isAlert ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900' : 'border-slate-300 focus:ring-blue-200'}`}
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-slate-400 font-medium">{kpi.unit}</span>
                        </div>
                    </div>
                   )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: KAIs & AI */}
          <div className="w-full lg:w-2/3 space-y-6">
             {/* KAI Checklist */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Rotina Padrão (KAIs)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedLeader.kais.map(kai => (
                  <div 
                    key={kai.id} 
                    onClick={() => handleToggleKai(selectedLeader.id, kai.id)}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      kai.isDone 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors shrink-0 ${
                      kai.isDone ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    }`}>
                      {kai.isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm md:text-base ${kai.isDone ? 'text-slate-900' : 'text-slate-600'}`}>
                        {kai.description}
                      </p>
                      <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-0.5 block">
                        {kai.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Component */}
            <AICoach leader={selectedLeader} />
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const data = leaders.map(l => ({
        name: l.name.split(' ')[0],
        score: l.efficiencyScore
    }));

    return (
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-6 md:mb-8">
                <div>
                <h2 className="text-2xl font-bold text-slate-900">Relatórios de Eficiência</h2>
                <p className="text-slate-500">Comparativo de performance entre Team Leaders</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 md:h-96">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Eficiência de Processo (KAI Score)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={50}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#fb923c' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
  }

  // --- Main Render ---

  if (!isAuthenticated) {
      return renderAuth();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sidebar is fixed, so it sits "outside" the flow but visually acts as sidebar */}
      {renderSidebar()}
      
      {/* Main Layout Wrapper: pushes content on desktop, stays 0 margin on mobile */}
      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {renderMobileHeader()}
        <main className="flex-1">
            {currentView === AppView.DASHBOARD && renderDashboard()}
            {currentView === AppView.TL_DETAILS && renderTLDetails()}
            {currentView === AppView.REPORTS && renderReports()}
            {currentView === AppView.SETTINGS && renderSettings()}
        </main>
      </div>
    </div>
  );
}

export default App;