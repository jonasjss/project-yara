import { Bus as BusIcon, AlertCircle, AlertTriangle } from 'lucide-react';
import { Bus, BusLine, Company } from '../lib/supabase';

type BusMarkerProps = {
  bus: Bus & { line: BusLine; company: Company };
  onClick: () => void;
};

const statusConfig = {
  normal: {
    bg: 'bg-green-500',
    ring: 'ring-green-300',
    icon: BusIcon,
    pulse: false,
  },
  alerta: {
    bg: 'bg-orange-500',
    ring: 'ring-orange-300',
    icon: AlertCircle,
    pulse: true,
  },
  emergencia: {
    bg: 'bg-red-600',
    ring: 'ring-red-300',
    icon: AlertTriangle,
    pulse: true,
  },
};

export function BusMarker({ bus, onClick }: BusMarkerProps) {
  const config = statusConfig[bus.status];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="relative group"
    >
      {config.pulse && (
        <span className={`absolute inset-0 ${config.bg} rounded-full opacity-75 animate-ping`}></span>
      )}
      <div className={`relative ${config.bg} p-3 rounded-full ring-4 ${config.ring} shadow-xl transition-transform hover:scale-110`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-10">
        <div className="font-bold">{bus.line.line_number} - {bus.company.name}</div>
        <div className="text-gray-300">Ônibus #{bus.bus_number}</div>
        <div className={`mt-1 ${bus.status === 'normal' ? 'text-green-400' : bus.status === 'alerta' ? 'text-orange-400' : 'text-red-400'} font-semibold uppercase text-[10px]`}>
          {bus.status}
        </div>
      </div>
    </button>
  );
}
