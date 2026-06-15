import React from 'react';
import { DriverLeaderStats } from '../types';
import { Award, CheckCircle, AlertTriangle, XCircle, DollarSign, Database, Copy, RefreshCw } from 'lucide-react';

interface DriverLeaderMonitoringProps {
  statsList: DriverLeaderStats[];
}

export default function DriverLeaderMonitoring({ statsList }: DriverLeaderMonitoringProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getKPIColor = (accuracy: number) => {
    if (accuracy >= 95) return { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', fill: 'bg-emerald-500', text: 'text-emerald-400' };
    if (accuracy >= 85) return { bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', fill: 'bg-amber-500', text: 'text-amber-400' };
    return { bg: 'bg-rose-950/40 text-rose-400 border-rose-900/30', fill: 'bg-rose-500', text: 'text-rose-400' };
  };

  return (
    <div className="space-y-6" id="driver-leader-monitoring-panel">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Monitoring & Ranking Kualitas Pengajuan Driver Leader
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            KPI akurasi pengajuan dihitung berdasarkan rasio J.O. valid terhadap total pengajuan oleh masing-masing PIC Driver Leader.
          </p>
        </div>
        <div className="text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-500 font-mono">
          Model Urutan: <span className="text-indigo-400 font-bold">Akurasi Terbaik</span>
        </div>
      </div>

      {statsList.length === 0 ? (
        <div className="p-8 border border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
          Belum ada data Driver Leader untuk dimonitor. Selesaikan proses rekonsiliasi berkas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsList.map((leader, idx) => {
            const kpi = getKPIColor(leader.akurasi);
            return (
              <div 
                key={leader.pengaju} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition duration-150 relative overflow-hidden flex flex-col justify-between"
                id={`leader-card-${leader.pengaju.toLowerCase()}`}
              >
                {/* Ranking Emblem */}
                <div className="absolute top-0 right-0 p-3 flex items-center justify-center">
                  <div className="text-[10px] font-mono font-black text-slate-600 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                    RANK #{idx + 1}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Leader Header */}
                  <div>
                    <h4 className="text-lg font-black tracking-tight text-white uppercase font-mono">
                      {leader.pengaju}
                    </h4>
                    <span className="text-[10px] text-slate-550 block font-sans">
                      Driver Leader PIC Pengaju
                    </span>
                  </div>

                  {/* Accuracy Bar/Gauge */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium font-sans">Akurasi Pengajuan</span>
                      <strong className={`text-sm font-black font-mono ${kpi.text}`}>{leader.akurasi}%</strong>
                    </div>
                    {/* Linear Gauge */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${kpi.fill} rounded-full transition-all duration-500`} 
                        style={{ width: `${leader.akurasi}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational Metrics Segment */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans border-b border-slate-850 pb-1">
                      Kuantitas Job Orders (JO)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                      <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-slate-850">
                        <span className="text-slate-400">Diajukan</span>
                        <strong className="text-slate-200 font-mono">{leader.totalJoDiajukan} JO</strong>
                      </div>
                      <div className="flex justify-between items-center p-1.5 bg-emerald-950/10 rounded border border-emerald-900/10">
                        <span className="text-emerald-400/80 font-medium">Valid</span>
                        <strong className="text-emerald-400 font-mono font-bold">{leader.totalJoValid} JO</strong>
                      </div>
                      <div className="flex justify-between items-center p-1.5 bg-amber-950/10 rounded border border-amber-900/10">
                        <span className="text-amber-400/80 font-medium">Review</span>
                        <strong className="text-amber-400 font-mono font-bold">{leader.totalJoReviewManual} JO</strong>
                      </div>
                      <div className="flex justify-between items-center p-1.5 bg-rose-950/10 rounded border border-rose-900/10">
                        <span className="text-rose-400/80 font-medium">Ditolak</span>
                        <strong className="text-rose-400 font-mono font-bold">{leader.totalJoDitolak} JO</strong>
                      </div>
                    </div>
                  </div>

                  {/* Special Status Checks */}
                  <div className="space-y-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/20 p-2.5 rounded border border-slate-850">
                    <div className="flex justify-between">
                      <span>Sudah Dibayar:</span>
                      <span className="text-emerald-450 font-bold">{leader.totalJoSudahDibayar} JO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tidak di TMS:</span>
                      <span className={leader.totalJoTidakAdaDiTms > 0 ? 'text-rose-400 font-bold' : 'text-slate-550'}>
                        {leader.totalJoTidakAdaDiTms} JO
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duplikat internal:</span>
                      <span className={leader.totalJoDuplikat > 0 ? 'text-amber-500 font-bold' : 'text-slate-550'}>
                        {leader.totalJoDuplikat} JO
                      </span>
                    </div>
                  </div>

                  {/* Financial Nominal Tracking */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans border-b border-slate-850 pb-1">
                      Anggaran & Risiko Financial
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-400">Total Pengajuan:</span>
                        <span className="text-slate-200 font-mono">{formatRupiah(leader.totalNominalPengajuan)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Total Valid:</span>
                        <span className="font-mono">{formatRupiah(leader.totalNominalValid)}</span>
                      </div>
                      <div className="flex justify-between text-rose-400 font-semibold text-[11px]">
                        <span>Total Bermasalah:</span>
                        <span className="font-mono">{formatRupiah(leader.totalNominalBermasalah)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
