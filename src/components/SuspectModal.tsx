import { X, AlertTriangle, MapPin, Clock, Shield } from 'lucide-react';
import { Suspect, Detection, Bus, BusLine, Company } from '../lib/supabase';

type SuspectModalProps = {
  suspect: Suspect;
  detection: Detection;
  bus: Bus & { line: BusLine; company: Company };
  onClose: () => void;
};

const riskLevelColors = {
  baixo: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  medio: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  alto: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  critico: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-800' },
};

export function SuspectModal({ suspect, detection, bus, onClose }: SuspectModalProps) {
  const riskColors = riskLevelColors[suspect.risk_level];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7" />
            <div>
              <h2 className="text-2xl font-bold">Alerta de Segurança</h2>
              <p className="text-red-100 text-sm">Suspeito detectado em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={suspect.photo_url}
                alt={suspect.name}
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
              <div className={`mt-4 px-4 py-3 rounded-lg border-2 ${riskColors.bg} ${riskColors.border} flex items-center justify-between`}>
                <span className="font-semibold">Nível de Risco:</span>
                <span className={`${riskColors.text} font-bold uppercase text-lg`}>
                  {suspect.risk_level}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{suspect.name}</h3>
                <p className="text-gray-500">ID: {suspect.id.slice(0, 8)}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-900">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Localização Atual</span>
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <p><strong>Ônibus:</strong> #{bus.bus_number} - {bus.plate}</p>
                  <p><strong>Linha:</strong> {bus.line.line_number} - {bus.line.name}</p>
                  <p><strong>Empresa:</strong> {bus.company.name}</p>
                  <p className="text-gray-600">
                    Lat: {detection.latitude?.toFixed(4)}, Long: {detection.longitude?.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-900">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Detecção</span>
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <p><strong>Confiança:</strong> {detection.confidence_level}%</p>
                  <p><strong>Detectado em:</strong> {new Date(detection.detected_at).toLocaleString('pt-BR')}</p>
                  <p><strong>Status:</strong> <span className="capitalize">{detection.status.replace('_', ' ')}</span></p>
                </div>
              </div>

              {suspect.last_seen_at && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Última Vez Visto</span>
                  </div>
                  <p className="ml-7 text-sm">{new Date(suspect.last_seen_at).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Histórico Criminal
            </h3>
            <div className="space-y-3">
              {suspect.criminal_record.length > 0 ? (
                suspect.criminal_record.map((record, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-red-900 text-lg">{record.crime}</p>
                        <p className="text-sm text-red-700 mt-1">
                          <strong>Local:</strong> {record.local}
                        </p>
                      </div>
                      <span className="text-sm text-red-600 font-semibold">
                        {new Date(record.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum registro criminal encontrado</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Acionar Autoridades
          </button>
        </div>
      </div>
    </div>
  );
}
