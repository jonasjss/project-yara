import { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
};

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div className={`${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {trend && <p className="text-white/70 text-xs mt-2">{trend}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
