import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TeamLeader } from '../types';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';

interface AICoachProps {
  leader: TeamLeader;
}

export const AICoach: React.FC<AICoachProps> = ({ leader }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const generateMockAnalysis = (leader: TeamLeader) => {
    const kaisNotDone = leader.kais.filter(k => !k.isDone).map(k => k.description);
    const lowKpis = leader.kpis.filter(k => (k.name === 'OPE (Eficiência)' && k.actual < k.target) || (k.name !== 'OPE (Eficiência)' && k.actual > k.target));
    
    let text = `**1. Ponto Forte**\n`;
    if (leader.efficiencyScore >= 80) {
        text += `Excelente disciplina na execução das rotinas padrão (KAI: ${leader.efficiencyScore}%), demonstrando liderança sólida no turno ${leader.shift}.`;
    } else if (leader.efficiencyScore >= 60) {
        text += `Esforço consistente na manutenção das atividades básicas, mantendo a estabilidade do processo.`;
    } else {
        text += `Identificação rápida de problemas na linha, apesar das dificuldades na rotina padrão.`;
    }
    
    text += `\n\n**2. Ponto de Atenção**\n`;
    if (kaisNotDone.length > 0) {
        text += `A execução de "${kaisNotDone[0]}" precisa ser priorizada. `;
    }
    if (lowKpis.length > 0) {
        text += `O indicador de ${lowKpis[0].name} está fora da meta (${lowKpis[0].actual}${lowKpis[0].unit}), impactando o resultado final.`;
    }
    if (kaisNotDone.length === 0 && lowKpis.length === 0) {
        text += `Monitorar a sustentabilidade dos resultados para evitar variabilidade futura.`;
    }

    text += `\n\n**3. Ação Recomendada**\n`;
    if (leader.efficiencyScore < 70) {
        text += `Intensificar o acompanhamento hora-a-hora no posto de trabalho e realizar reciclagem de padrão com a equipe.`;
    } else {
        text += `Desafiar a equipe com metas de melhoria contínua (Kaizen) para otimizar os tempos de ciclo.`;
    }

    return text;
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setIsDemoMode(false);
    
    try {
      let apiKey = '';
      try {
        apiKey = process.env.API_KEY || '';
      } catch (e) {
        console.warn("Ambiente sem acesso a variáveis de processo.");
      }

      // Fallback para Modo Demo se não houver chave
      if (!apiKey) {
        console.warn("Chave de API não detectada. Usando modo de demonstração.");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da rede
        setAnalysis(generateMockAnalysis(leader));
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const completedKais = leader.kais.filter(k => k.isDone).map(k => k.description).join(', ');
      const incompleteKais = leader.kais.filter(k => !k.isDone).map(k => k.description).join(', ');
      const kpiSummary = leader.kpis.map(k => `${k.name}: Alvo ${k.target}, Real ${k.actual}`).join('; ');

      const prompt = `
        Aja como um Supervisor de Produção Sênior especialista na metodologia SPW (Stellantis Production Way).
        Analise o desempenho do Team Leader abaixo e gere um feedback curto, profissional e direto (máximo 3 parágrafos curtos).
        
        Nome: ${leader.name}
        Turno: ${leader.shift}
        Eficiência de Rotina (KAI): ${leader.efficiencyScore}%

        Tarefas Realizadas (KAIs): ${completedKais}
        Tarefas Não Realizadas (KAIs): ${incompleteKais}
        
        Resultados (KPIs): ${kpiSummary}

        Estruture a resposta estritamente em:
        **1. Ponto Forte**
        (Texto aqui)
        
        **2. Ponto de Atenção**
        (Texto aqui)
        
        **3. Ação Recomendada**
        (Texto aqui)
        
        Use tom motivador mas exigente.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (!response.text) {
          throw new Error("A IA não retornou texto na resposta.");
      }

      setAnalysis(response.text);
    } catch (err: any) {
      console.error("Erro ao gerar relatório:", err);
      // Fallback em caso de erro de API (ex: quota, erro de rede)
      // Se quiser forçar demo mode no erro também, descomente as linhas abaixo:
      // setAnalysis(generateMockAnalysis(leader));
      // setIsDemoMode(true);
      setError(err.message || "Erro desconhecido ao conectar com o assistente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Assistente de Performance SPW</h3>
        </div>
        {(!analysis && !loading) && (
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/40 border border-blue-500/50"
          >
            <Sparkles className="w-4 h-4" />
            Gerar Relatório Inteligente
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700 animate-fadeIn">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm">Processando dados de produção e gerando insights...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
             <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
             <div className="flex-1">
                 <p className="text-sm font-medium text-red-200">Erro na Conexão</p>
                 <p className="text-xs text-red-300 mt-1 break-words">{error}</p>
                 <button 
                    onClick={generateReport}
                    className="mt-2 text-xs text-red-200 underline hover:text-white transition-colors"
                >
                    Tentar novamente
                </button>
             </div>
        </div>
      )}

      {analysis && (
        <div className="animate-fadeIn">
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line bg-slate-800/50 p-5 rounded-lg border border-slate-700/50 shadow-inner">
            {analysis}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
                {isDemoMode ? (
                    <div className="flex items-center gap-1.5 text-xs text-orange-300 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                        <Info className="w-3 h-3" />
                        <span>Modo Demonstração (Sem API Key)</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-green-300 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        <Sparkles className="w-3 h-3" />
                        <span>Análise via Gemini AI</span>
                    </div>
                )}
                
                <button 
                    onClick={() => setAnalysis(null)}
                    className="text-xs text-slate-400 hover:text-white underline transition-colors"
                >
                    Nova análise
                </button>
            </div>
        </div>
      )}
    </div>
  );
};