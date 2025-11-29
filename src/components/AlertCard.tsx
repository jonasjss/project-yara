import { AlertTriangle, Eye, Shield } from 'lucide-react';
import { Alert } from '../lib/supabase';

type AlertCardProps = {
  alert: Alert & {
    detection: {
      suspect: { name: string; photo_url: string; risk_level: string };
      bus: { bus_number: string; line: { line_number: string } };
    };
  };
  onClick: () => void;
};

const severityConfig = {
  baixa: { icon: Shield, color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  media: { icon: Eye, color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  alta: { icon: AlertTriangle, color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' },
  critica: { icon: AlertTriangle, color: 'bg-red-700', textColor: 'text-red-700', bgColor: 'bg-red-100' },
};

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const timeAgo = getTimeAgo(alert.created_at);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 ${config.bgColor} hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.color} p-2 rounded-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase ${config.textColor}`}>
              {alert.severity}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <p className="font-semibold text-gray-900 mb-1">{alert.message}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Linha {alert.detection.bus.line.line_number}</span>
            <span>•</span>
            <span>Ônibus #{alert.detection.bus.bus_number}</span>
          </div>
        </div>
        <img
          src={alert.detection.suspect.photo_url}
          alt={alert.detection.suspect.name}
          className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
        />
      </div>
    </button>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d atrás`;
}
