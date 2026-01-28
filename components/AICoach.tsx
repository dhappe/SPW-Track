import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TeamLeader } from '../types';
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AICoachProps {
  leader: TeamLeader;
}

export const AICoach: React.FC<AICoachProps> = ({ leader }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      // Verificação segura da API Key para evitar crash se process não estiver definido
      let apiKey = '';
      try {
        apiKey = process.env.API_KEY || '';
      } catch (e) {
        console.warn("Não foi possível acessar process.env", e);
      }

      if (!apiKey) {
        throw new Error("Chave de API não configurada (process.env.API_KEY ausente).");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const completedKais = leader.kais.filter(k => k.isDone).map(k => k.description).join(', ');
      const incompleteKais = leader.kais.filter(k => !k.isDone).map(k => k.description).join(', ');
      const kpiSummary = leader.kpis.map(k => `${k.name}: Alvo ${k.target}, Real ${k.actual}`).join('; ');

      const prompt = `
        Aja como um Supervisor de Produção Sênior especialista na metodologia SPW (Stellantis Production Way).
        Analise o desempenho do Team Leader abaixo e gere um feedback curto, profissional e direto (máximo 3 parágrafos).
        
        Nome: ${leader.name}
        Turno: ${leader.shift}
        Eficiência de Rotina (KAI): ${leader.efficiencyScore}%

        Tarefas Realizadas (KAIs): ${completedKais}
        Tarefas Não Realizadas (KAIs): ${incompleteKais}
        
        Resultados (KPIs): ${kpiSummary}

        Estruture a resposta em:
        1. Ponto Forte (Destaque o que foi bom)
        2. Ponto de Atenção (Baseado nos KPIs ruins ou KAIs não feitos)
        3. Ação Recomendada (Sugestão prática baseada em Lean Manufacturing/SPW)
        
        Use tom motivador mas exigente, focado em alta performance.
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
      // Exibe a mensagem real do erro para facilitar o debug
      setError(err.message || "Erro desconhecido ao conectar com o assistente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Assistente de Performance SPW</h3>
        </div>
        {(!analysis && !loading) && (
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md shadow-blue-900/20"
          >
            <Sparkles className="w-4 h-4" />
            Gerar Relatório Inteligente
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700 animate-fadeIn">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm">Analisando dados de KAIs e KPIs do Team Leader...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
             <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
             <div className="flex-1">
                 <p className="text-sm font-medium text-red-200">Erro na Análise</p>
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
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-lg border border-slate-700 shadow-inner">
            {analysis}
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={() => setAnalysis(null)}
                    className="text-xs text-slate-400 hover:text-white underline transition-colors"
                >
                    Gerar nova análise
                </button>
            </div>
        </div>
      )}
    </div>
  );
};