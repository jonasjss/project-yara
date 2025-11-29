import { useEffect, useState } from 'react';
import { supabase, type EventLog, type Bus, type BusLine, type Company, type Suspect } from '../lib/supabase';
import { CameraFeed } from '../components/CameraFeed';
import { AIAnalysis } from '../components/AIAnalysis';
import { EventLogs } from '../components/EventLogs';
import { ChevronDown, Settings } from 'lucide-react';

type BusWithDetails = Bus & { line: BusLine; company: Company };

export function CameraMonitoring() {
  const [buses, setBuses] = useState<BusWithDetails[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [cameraOnline, setCameraOnline] = useState(true);
  const [lastDetection, setLastDetection] = useState<{
    personName: string;
    confidence: number;
    photo: string;
    riskLevel?: 'baixo' | 'medio' | 'alto' | 'critico';
    isAlert: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadBuses();
  }, []);

  useEffect(() => {
    if (selectedBusId) {
      loadEventLogs();
      simulateAIProcessing();

      const interval = setInterval(() => {
        loadEventLogs();
        const randomProcessing = Math.random() < 0.3;
        if (randomProcessing) {
          simulateAIProcessing();
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedBusId]);

  async function loadBuses() {
    const { data, error } = await supabase
      .from('buses')
      .select(`
        *,
        line:bus_lines(*),
        company:companies(*)
      `)
      .order('status', { ascending: true });

    if (error) {
      console.error('Error loading buses:', error);
      return;
    }

    setBuses(data as BusWithDetails[]);
    if (data && data.length > 0) {
      setSelectedBusId(data[0].id);
    }
  }

  async function loadEventLogs() {
    if (!selectedBusId) return;

    const { data, error } = await supabase
      .from('event_logs')
      .select(`
        *,
        suspect:suspects(*)
      `)
      .eq('bus_id', selectedBusId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading event logs:', error);
      return;
    }

    setEventLogs(data as EventLog[]);

    const lastEvent = data?.[0];
    if (lastEvent && (lastEvent.event_type === 'person_identified' || lastEvent.event_type === 'no_match')) {
      setLastDetection({
        personName: lastEvent.event_type === 'person_identified' ? lastEvent.message.split(': ')[1] || 'Detectado' : 'Desconhecido',
        confidence: lastEvent.confidence_level || 0,
        photo: lastEvent.camera_frame_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAlert: lastEvent.event_type === 'alert_triggered',
        riskLevel: lastEvent.metadata?.risk_level,
      });
    }
  }

  async function simulateAIProcessing() {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
  }

  const selectedBus = buses.find(b => b.id === selectedBusId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="min-h-screen bg-black/30 backdrop-blur-sm">
        <header className="bg-gradient-to-r from-slate-950 to-slate-900 border-b border-white/10 shadow-2xl p-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Monitoramento de Câmera</h1>
                <p className="text-slate-400 text-sm mt-1">Reconhecimento Facial em Tempo Real</p>
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedBusId || ''}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-white/10 appearance-none pr-10 cursor-pointer hover:bg-slate-800/70 transition-colors"
              >
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.company.name} • Linha {bus.line.line_number} • Ônibus #{bus.bus_number} ({bus.plate})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
            <div className="lg:col-span-1 bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Feed da Câmera</h2>
                <div className={`w-3 h-3 rounded-full ${cameraOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex-1">
                <CameraFeed
                  frameUrl={lastDetection?.photo || null}
                  isOnline={cameraOnline}
                />
              </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Análise da IA</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAnalysis lastDetection={lastDetection} isProcessing={isProcessing} />
              </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Log de Eventos</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <EventLogs logs={eventLogs} isLoading={false} />
              </div>
            </div>
          </div>

          {selectedBus && (
            <div className="mt-6 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">Ônibus</p>
                  <p className="text-white font-bold text-lg">#{selectedBus.bus_number}</p>
                  <p className="text-slate-400 text-xs mt-1">{selectedBus.plate}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">Linha</p>
                  <p className="text-white font-bold text-lg">{selectedBus.line.line_number}</p>
                  <p className="text-slate-400 text-xs mt-1">{selectedBus.line.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">Empresa</p>
                  <p className="text-white font-bold text-lg">{selectedBus.company.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedBus.status === 'normal'
                          ? 'bg-green-500'
                          : selectedBus.status === 'alerta'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <p className="text-white font-semibold capitalize">{selectedBus.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
