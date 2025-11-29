import { Bus, BusLine, Company } from '../lib/supabase';
import { BusMarker } from './BusMarker';

type FleetMapProps = {
  buses: Array<Bus & { line: BusLine; company: Company }>;
  onBusClick: (bus: Bus & { line: BusLine; company: Company }) => void;
};

export function FleetMap({ buses, onBusClick }: FleetMapProps) {
  const centerLat = -3.1150;
  const centerLng = -60.0250;

  const calculatePosition = (lat: number | null, lng: number | null) => {
    if (!lat || !lng) return { x: 50, y: 50 };

    const latDiff = (lat - centerLat) * 8000;
    const lngDiff = (lng - centerLng) * 8000;

    return {
      x: 50 + lngDiff,
      y: 50 - latDiff,
    };
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded-xl overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="text-xs text-gray-600 font-semibold">Mapa em Tempo Real</p>
        <p className="text-lg font-bold text-gray-900">Manaus - Zona Central</p>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-700 font-medium">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-700 font-medium">Alerta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-700 font-medium">Emergência</span>
        </div>
      </div>

      <div className="absolute inset-0 p-8">
        {buses.map((bus) => {
          const position = calculatePosition(bus.latitude, bus.longitude);
          return (
            <div
              key={bus.id}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <BusMarker bus={bus} onClick={() => onBusClick(bus)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
