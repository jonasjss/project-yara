import { Video, Circle } from 'lucide-react';

type CameraFeedProps = {
  frameUrl: string | null;
  isOnline: boolean;
};

export function CameraFeed({ frameUrl, isOnline }: CameraFeedProps) {
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 pointer-events-none"></div>

      {frameUrl ? (
        <img
          src={frameUrl}
          alt="Camera Feed"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center space-y-4">
            <Video className="w-16 h-16 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">Aguardando entrada de câmera...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10">
        <Circle
          className={`w-2.5 h-2.5 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
        />
        <span className={`text-xs font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
        <p className="text-xs text-gray-300">
          {new Date().toLocaleTimeString('pt-BR')} • ID da câmera: CAM-001
        </p>
      </div>
    </div>
  );
}
