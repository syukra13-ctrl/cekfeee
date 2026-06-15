import React from 'react';
import { DashboardStats } from '../types';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Check, 
  ShieldAlert, 
  Coins, 
  Percent 
} from 'lucide-react';

interface FinancialKPIsProps {
  stats: DashboardStats;
}

export default function FinancialKPIs({ stats }: FinancialKPIsProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const kpis = [
    {
      id: 'kpi-pengajuan',
      title: 'Total Nominal Pengajuan',
      value: formatRupiah(stats.totalNominalPengajuan),
      count: `${stats.totalPengajuan} JO`,
      icon: Coins,
      bgColor: 'bg-slate-900 border-slate-800',
      textColor: 'text-slate-100',
      iconColor: 'text-slate-400'
    },
    {
      id: 'kpi-valid',
      title: 'Total Nominal Valid (Siap Bayar)',
      value: formatRupiah(stats.totalNominalValid),
      count: `${stats.totalValid} JO`,
      icon: CheckCircle,
      bgColor: 'bg-emerald-950/40 border-emerald-900/50',
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400'
    },
    {
      id: 'kpi-review',
      title: 'Total Nominal Review Manual',
      value: formatRupiah(stats.totalNominalReviewManual),
      count: `${stats.totalDataTidakCocok + stats.totalBelumClosed + stats.totalFeeKurang + stats.totalFeeLebih} JO`,
      icon: AlertTriangle,
      bgColor: 'bg-amber-950/30 border-amber-900/40',
      textColor: 'text-amber-400',
      iconColor: 'text-amber-400'
    },
    {
      id: 'kpi-ditolak',
      title: 'Total Nominal Ditolak',
      value: formatRupiah(stats.totalNominalDitolak),
      count: `${stats.totalTidakAdaDiTms + stats.totalDuplikatJo + stats.totalSudahDibayar} JO`,
      icon: XCircle,
      bgColor: 'bg-rose-950/30 border-rose-900/40',
      textColor: 'text-rose-400',
      iconColor: 'text-rose-400'
    },
    {
      id: 'kpi-paid',
      title: 'Total Nominal Sudah Dibayar',
      value: formatRupiah(stats.totalNominalSudahDibayar),
      count: `${stats.totalSudahDibayar} JO Terdeteksi`,
      icon: Check,
      bgColor: 'bg-blue-950/30 border-blue-900/40',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400'
    },
    {
      id: 'kpi-double',
      title: 'Potensi Double Payment',
      value: formatRupiah(stats.potensiDoublePayment),
      count: 'RISIKO TINGGI',
      icon: ShieldAlert,
      bgColor: 'bg-red-950/45 border-red-900/50 blink-border',
      textColor: 'text-red-400',
      iconColor: 'text-red-500'
    },
    {
      id: 'kpi-selisih',
      title: 'Potensi Selisih Fee',
      value: formatRupiah(stats.potensiSelisihFee),
      count: 'Selisih Lebih/Kurang',
      icon: TrendingUp,
      bgColor: 'bg-orange-950/30 border-orange-900/40',
      textColor: 'text-orange-400',
      iconColor: 'text-orange-400'
    },
    {
      id: 'kpi-average',
      title: 'Rata-rata Fee per JO',
      value: formatRupiah(stats.rataRataFeePerJo),
      count: 'Rata-rata Pengajuan',
      icon: Percent,
      bgColor: 'bg-indigo-950/30 border-indigo-900/40',
      textColor: 'text-indigo-400',
      iconColor: 'text-indigo-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div 
            key={kpi.id} 
            id={kpi.id}
            className={`p-4 rounded-xl border ${kpi.bgColor} flex flex-col justify-between transition-transform duration-250 hover:scale-[1.01] shadow-lg`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <IconComponent className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${kpi.textColor} mb-1 font-mono`}>
                {kpi.value}
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-800">
                {kpi.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
