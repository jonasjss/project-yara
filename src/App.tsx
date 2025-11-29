import { useEffect, useState } from 'react';
import { Bus, Eye, AlertTriangle, Shield, Activity, Monitor } from 'lucide-react';
import { supabase, type Bus as BusType, type BusLine, type Company, type Alert, type Detection, type Suspect } from './lib/supabase';
import { YaraLogo } from './components/YaraLogo';
import { StatsCard } from './components/StatsCard';
import { FleetMap } from './components/FleetMap';
import { AlertCard } from './components/AlertCard';
import { SuspectModal } from './components/SuspectModal';
import { CameraMonitoring } from './pages/CameraMonitoring';

type BusWithDetails = BusType & { line: BusLine; company: Company };
type AlertWithDetails = Alert & {
  detection: Detection & {
    suspect: Suspect;
    bus: BusWithDetails;
  };
};

type AppView = 'dashboard' | 'camera';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [buses, setBuses] = useState<BusWithDetails[]>([]);
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertWithDetails | null>(null);
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeAlerts: 0,
    detections: 0,
    criticalRisk: 0,
  });

  useEffect(() => {
    loadData();

    const busSubscription = supabase
      .channel('buses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buses' }, () => {
        loadBuses();
      })
      .subscribe();

    const alertSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        loadAlerts();
      })
      .subscribe();

    return () => {
      busSubscription.unsubscribe();
      alertSubscription.unsubscribe();
    };
  }, []);

  async function loadData() {
    await Promise.all([loadBuses(), loadAlerts(), loadStats()]);
  }

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
  }

  async function loadAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        detection:detections(
          *,
          suspect:suspects(*),
          bus:buses(
            *,
            line:bus_lines(*),
            company:companies(*)
          )
        )
      `)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading alerts:', error);
      return;
    }

    setAlerts(data as AlertWithDetails[]);
  }

  async function loadStats() {
    const [busesResult, alertsResult, detectionsResult, suspectsResult] = await Promise.all([
      supabase.from('buses').select('id', { count: 'exact', head: true }),
      supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('resolved', false),
      supabase.from('detections').select('id', { count: 'exact', head: true }),
      supabase.from('suspects').select('id', { count: 'exact', head: true }).eq('risk_level', 'critico'),
    ]);

    setStats({
      totalBuses: busesResult.count || 0,
      activeAlerts: alertsResult.count || 0,
      detections: detectionsResult.count || 0,
      criticalRisk: suspectsResult.count || 0,
    });
  }

  const handleBusClick = (bus: BusWithDetails) => {
    const busAlert = alerts.find(a => a.detection.bus.id === bus.id);
    if (busAlert) {
      setSelectedAlert(busAlert);
    }
  };

  if (currentView === 'camera') {
    return <CameraMonitoring />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <header className="bg-gradient-to-r from-blue-950 to-green-950 border-b border-white/10 shadow-2xl">
          <div className="max-w-[1800px] mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <YaraLogo />
                <button
                  onClick={() => setCurrentView('camera')}
                  className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-colors text-white font-medium"
                >
                  <Monitor className="w-4 h-4" />
                  Câmeras
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm font-semibold">Sistema Online</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Central de Monitoramento</p>
                  <p className="text-white font-semibold">{new Date().toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Frota Ativa"
              value={stats.totalBuses}
              icon={Bus}
              trend="4 empresas monitoradas"
              color="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <StatsCard
              title="Alertas Ativos"
              value={stats.activeAlerts}
              icon={AlertTriangle}
              trend="Requer atenção imediata"
              color="bg-gradient-to-br from-orange-600 to-orange-700"
            />
            <StatsCard
              title="Detecções Hoje"
              value={stats.detections}
              icon={Eye}
              trend="Sistema de IA ativo"
              color="bg-gradient-to-br from-green-600 to-green-700"
            />
            <StatsCard
              title="Risco Crítico"
              value={stats.criticalRisk}
              icon={Shield}
              trend="Suspeitos de alta periculosidade"
              color="bg-gradient-to-br from-red-600 to-red-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Monitoramento em Tempo Real
                  </h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-semibold">
                    {buses.length} ônibus
                  </span>
                </div>
                <div className="h-[600px] p-4">
                  <FleetMap buses={buses} onBusClick={handleBusClick} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden h-full">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between sticky top-0">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas Recentes
                  </h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-semibold">
                    {alerts.length}
                  </span>
                </div>
                <div className="p-4 space-y-3 max-h-[550px] overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onClick={() => setSelectedAlert(alert)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum alerta ativo</p>
                      <p className="text-gray-400 text-sm mt-2">Sistema operando normalmente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="max-w-[1800px] mx-auto px-8 py-6 mt-8">
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <p className="text-center text-blue-200 text-sm">
              "O olhar que protege" • YARA GUARD AI © 2025 • Inspirada pela lenda amazônica da Yara
            </p>
          </div>
        </footer>

        {selectedAlert && (
          <SuspectModal
            suspect={selectedAlert.detection.suspect}
            detection={selectedAlert.detection}
            bus={selectedAlert.detection.bus}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
