import { AlertCircle, CheckCircle, UserCheck, Brain } from 'lucide-react';
import { Suspect } from '../lib/supabase';

type AIAnalysisProps = {
  lastDetection: {
    personName: string;
    confidence: number;
    photo: string;
    riskLevel?: 'baixo' | 'medio' | 'alto' | 'critico';
    isAlert: boolean;
  } | null;
  isProcessing: boolean;
};

const riskColors = {
  baixo: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  medio: 'bg-orange-50 border-orange-200 text-orange-900',
  alto: 'bg-red-50 border-red-200 text-red-900',
  critico: 'bg-red-100 border-red-400 text-red-900',
};

export function AIAnalysis({ lastDetection, isProcessing }: AIAnalysisProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Análise da IA</h3>
          <p className="text-xs text-gray-600">Sistema de Reconhecimento Facial</p>
        </div>
      </div>

      {isProcessing && (
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-blue-900">Processando análise facial...</p>
          <p className="text-xs text-blue-700 mt-1">Tempo: ~200ms</p>
        </div>
      )}

      {!isProcessing && lastDetection ? (
        <>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Nome Detectado</p>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{lastDetection.personName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Confiança da Detecção</p>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-end gap-3">
                <p className="text-4xl font-bold text-indigo-600">{lastDetection.confidence.toFixed(1)}</p>
                <p className="text-gray-600 mb-2">%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${lastDetection.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Foto Comparada</p>
            <img
              src={lastDetection.photo}
              alt={lastDetection.personName}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Status de Alerta</p>
            <div
              className={`rounded-lg p-4 flex items-center gap-3 border-2 ${
                lastDetection.isAlert
                  ? 'bg-red-100 border-red-300'
                  : 'bg-green-100 border-green-300'
              }`}
            >
              {lastDetection.isAlert ? (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-900">Alerta Acionado</p>
                    <p className="text-xs text-red-700">Suspeito identificado</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-green-900">Sem Correspondência</p>
                    <p className="text-xs text-green-700">Pessoa desconhecida</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {lastDetection.riskLevel && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Nível de Risco</p>
              <div
                className={`rounded-lg p-3 text-center font-bold uppercase text-sm border-2 ${
                  riskColors[lastDetection.riskLevel]
                }`}
              >
                {lastDetection.riskLevel}
              </div>
            </div>
          )}
        </>
      ) : !isProcessing ? (
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-700 font-medium">Nenhuma detecção disponível</p>
          <p className="text-xs text-gray-500">Aguarde uma análise facial ser processada</p>
        </div>
      ) : null}
    </div>
  );
}
