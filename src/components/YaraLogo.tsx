import { Eye } from 'lucide-react';

export function YaraLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 rounded-full blur-md opacity-50"></div>
        <div className="relative bg-gradient-to-br from-green-600 to-blue-700 p-2.5 rounded-full">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">YARA GUARD AI</h1>
        <p className="text-xs text-blue-200">Inteligência Artificial de Reconhecimento e Alerta</p>
      </div>
    </div>
  );
}
