import { Clock, AlertTriangle, CheckCircle, Camera, User, Zap } from 'lucide-react';
import { EventLog } from '../lib/supabase';

type EventLogsProps = {
  logs: EventLog[];
  isLoading: boolean;
};

const eventTypeConfig = {
  camera_online: {
    icon: Camera,
    label: 'Câmera Online',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  camera_offline: {
    icon: Camera,
    label: 'Câmera Offline',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  detection_attempt: {
    icon: Zap,
    label: 'Tentativa de Reconhecimento',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  person_identified: {
    icon: User,
    label: 'Pessoa Identificada',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  no_match: {
    icon: CheckCircle,
    label: 'Sem Correspondência',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  alert_triggered: {
    icon: AlertTriangle,
    label: 'Alerta Acionado',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function EventLogs({ logs, isLoading }: EventLogsProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 overflow-y-auto">
      <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-b from-gray-50 to-transparent pb-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Log de Eventos</h3>
          <p className="text-xs text-gray-600">Histórico em tempo real</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((log) => {
            const config = eventTypeConfig[log.event_type];
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className={`rounded-lg p-3 border-l-4 transition-all hover:shadow-md ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${config.color}`}>
                          [{formatTime(log.created_at)}] {log.message}
                        </p>
                        {log.confidence_level !== null && (
                          <p className="text-xs text-gray-600 mt-1">
                            Confiança: {log.confidence_level.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${config.color} whitespace-nowrap`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Nenhum evento registrado</p>
          <p className="text-xs text-gray-500 mt-1">Eventos aparecerão aqui conforme ocorrem</p>
        </div>
      )}
    </div>
  );
}
