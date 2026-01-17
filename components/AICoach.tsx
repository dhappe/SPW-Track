import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TeamLeader } from '../types';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';

interface AICoachProps {
  leader: TeamLeader;
}

export const AICoach: React.FC<AICoachProps> = ({ leader }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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

      setAnalysis(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error("Erro ao gerar relatório", error);
      setAnalysis("Erro ao conectar com o assistente inteligente. Verifique a chave de API.");
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
        {!analysis && (
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Gerar Relatório Inteligente
          </button>
        )}
      </div>

      {loading && (
        <div className="text-slate-300 animate-pulse text-sm">
          Analisando dados de KAIs e KPIs do Team Leader...
        </div>
      )}

      {analysis && (
        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          {analysis}
          <div className="mt-4 flex justify-end">
            <button 
                onClick={() => setAnalysis(null)}
                className="text-xs text-slate-400 hover:text-white underline"
            >
                Gerar nova análise
            </button>
          </div>
        </div>
      )}
    </div>
  );
};