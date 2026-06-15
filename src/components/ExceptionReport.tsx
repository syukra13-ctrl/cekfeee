import React, { useState } from 'react';
import { ValidationResult } from '../types';
import { AlertCircle, ArrowUpDown, ChevronRight, FileX2, Info, Search, List, Layers, User } from 'lucide-react';

interface ExceptionReportProps {
  results: ValidationResult[];
  onSelectJo: (joNo: string) => void;
}

export default function ExceptionReport({ results, onSelectJo }: ExceptionReportProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');

  // Filtering criteria for exception report: only data with issues
  const problematicData = results.filter(row => {
    const isProblem = 
      row.statusValidasiTms === 'TIDAK ADA DI TMS' ||
      row.statusValidasiTms === 'DATA TMS TIDAK COCOK' ||
      row.statusValidasiTms === 'STATUS TMS BELUM CLOSED' ||
      row.statusPembayaran === 'SUDAH DIBAYAR' ||
      row.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN' ||
      row.statusFee === 'FEE LEBIH' ||
      row.statusFee === 'FEE KURANG';

    if (!isProblem) return false;

    if (search.trim() === '') return true;
    const s = search.toLowerCase();
    return (
      row.jobOrderNo.toLowerCase().includes(s) ||
      row.namaDriverPengajuan.toLowerCase().includes(s) ||
      row.platNoPengajuan.toLowerCase().includes(s) ||
      row.customerPengajuan.toLowerCase().includes(s) ||
      row.pengaju.toLowerCase().includes(s)
    );
  });

  // Sort by highest pengajuan fee first
  const sortedProblematicData = [...problematicData].sort((a, b) => b.feeUmkPengajuan - a.feeUmkPengajuan);

  // Totals for Exception Report
  const totalJO = sortedProblematicData.length;
  const totalRupiahBermasalah = sortedProblematicData.reduce((acc, curr) => acc + curr.feeUmkPengajuan, 0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Group by Pengaju (Driver Leader)
  const groupedByPengaju: { [pengaju: string]: ValidationResult[] } = {};
  sortedProblematicData.forEach(row => {
    const p = row.pengaju || 'KOSONG';
    if (!groupedByPengaju[p]) {
      groupedByPengaju[p] = [];
    }
    groupedByPengaju[p].push(row);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl" id="exception-report-view">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            Exception Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar otomatis seluruh Job Order (JO) berisiko tinggi yang terdeteksi bermasalah oleh sistem verifikasi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'grouped' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Grup per Pengaju
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Daftar Semua
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-550" />
            </span>
            <input
              type="text"
              className="w-full bg-slate-950 text-slate-200 pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-slate-700 font-medium"
              placeholder="Cari JO, Driver, Plat, Pengaju..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Exception Specific KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div id="exec-total-jo" className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-widest block mb-1">
            Total JO Bermasalah
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 tracking-tight font-mono">
              {totalJO}
            </span>
            <span className="text-xs text-rose-300">Job Order terdeteksi</span>
          </div>
        </div>

        <div id="exec-total-rupiah" className="p-4 rounded-xl bg-rose-950/35 border border-rose-900/50">
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-widest block mb-1">
            Total Nilai Rupiah Bermasalah
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 tracking-tight font-mono">
              {formatRupiah(totalRupiahBermasalah)}
            </span>
            <span className="text-xs text-rose-300">Rupiah terekspos</span>
          </div>
        </div>
      </div>

      {/* Table Listings / Grouped Cards */}
      {sortedProblematicData.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-800 rounded-lg text-center">
          <FileX2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">Tidak ada perkecualian bermasalah</h3>
          <p className="text-xs text-slate-500 mt-1">
            Semua data bersih dari indikasi duplikasi, mismatch, ataupun status pending.
          </p>
        </div>
      ) : viewMode === 'grouped' ? (
        // Grouped View per Pengaju
        <div className="space-y-6">
          {Object.keys(groupedByPengaju).map(pengajuName => {
            const leaderRows = groupedByPengaju[pengajuName];
            const sumLeaderCost = leaderRows.reduce((sum, r) => sum + r.feeUmkPengajuan, 0);
            return (
              <div 
                key={pengajuName} 
                className="bg-slate-950/70 border border-slate-850 rounded-xl overflow-hidden shadow-md"
                id={`exception-group-${pengajuName.toLowerCase()}`}
              >
                {/* Accordion/Group Header */}
                <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-950/60 rounded border border-rose-900/50 text-rose-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 tracking-tight font-mono uppercase">
                        PENGAJU: {pengajuName}
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Memiliki {leaderRows.length} Job Order dengan kendala validasi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Eksposur Finansial</span>
                      <strong className="text-rose-400">{formatRupiah(sumLeaderCost)}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-1 bg-slate-900/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/90 text-slate-500 border-b border-slate-850 font-semibold text-[10px] uppercase font-sans">
                          <th className="py-2.5 px-4 w-32">JO No</th>
                          <th className="py-2.5 px-4 w-52">Driver & Plat</th>
                          <th className="py-2.5 px-4">Detail Kendala Komparasi</th>
                          <th className="py-2.5 px-4 text-right w-36">Nominal Diajukan</th>
                          <th className="py-2.5 px-4 w-28 text-center border-l border-slate-850/50">Investigasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {leaderRows.map(row => (
                          <tr key={`${row.jobOrderNo}-${row.crewIdPengajuan}`} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-300">
                              {row.jobOrderNo}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-300">{row.namaDriverPengajuan}</div>
                              <div className="text-[10px] text-slate-550 font-mono">{row.platNoPengajuan}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {row.statusValidasiTms === 'TIDAK ADA DI TMS' && (
                                  <span className="bg-red-950/40 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ TIDAK ADA DI TMS</span>
                                )}
                                {row.statusValidasiTms === 'DATA TMS TIDAK COCOK' && (
                                  <span className="bg-amber-950/45 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ DATA MISMATCH</span>
                                )}
                                {row.statusValidasiTms === 'STATUS TMS BELUM CLOSED' && (
                                  <span className="bg-amber-950/45 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ BELUM CLOSED ({row.jobOrderStatusTms})</span>
                                )}
                                {row.statusPembayaran === 'SUDAH DIBAYAR' && (
                                  <span className="bg-rose-950/40 text-rose-400 border border-rose-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ SUDAH DIBAYAR</span>
                                )}
                                {row.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN' && (
                                  <span className="bg-red-950/40 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ DUPLIKAT JO</span>
                                )}
                                {row.statusFee === 'FEE LEBIH' && (
                                  <span className="bg-orange-950/40 text-orange-400 border border-orange-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ LEBIH (+Rp {row.selisihFee.toLocaleString()})</span>
                                )}
                                {row.statusFee === 'FEE KURANG' && (
                                  <span className="bg-pink-950/40 text-pink-400 border border-pink-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold">✗ KURANG (-Rp {Math.abs(row.selisihFee).toLocaleString()})</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 italic mt-1 font-sans">{row.keteranganError}</p>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                              {formatRupiah(row.feeUmkPengajuan)}
                            </td>
                            <td className="py-3 px-4 text-center border-l border-slate-850/50">
                              <button
                                onClick={() => onSelectJo(`${row.jobOrderNo}-${row.crewIdPengajuan}`)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded border border-slate-700 transition-[background]"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat View Mode
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-4">JO No</th>
                <th className="py-3 px-4">Pengaju</th>
                <th className="py-3 px-4">Driver & Plat</th>
                <th className="py-3 px-4">Mergensi Error Utama</th>
                <th className="py-3 px-4 text-right">Nominal Pengajuan</th>
                <th className="py-3 px-4">Keputusan</th>
                <th className="py-3 px-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedProblematicData.map((row) => {
                let badgeStyle = 'bg-rose-950/50 text-rose-400 border-rose-900/50';
                if (row.keputusanSistem === 'REVIEW MANUAL') {
                  badgeStyle = 'bg-amber-950/50 text-amber-400 border-amber-900/50';
                }

                return (
                  <tr 
                    key={`${row.jobOrderNo}-${row.crewIdPengajuan}`} 
                    id={`row-exception-flat-${row.jobOrderNo}-${row.crewIdPengajuan}`}
                    className="hover:bg-slate-900/60 transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {row.jobOrderNo}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-300 uppercase">
                      {row.pengaju}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300">{row.namaDriverPengajuan}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">{row.platNoPengajuan}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm text-slate-400 leading-relaxed break-words">
                      <div className="flex flex-wrap gap-1">
                        {row.statusValidasiTms === 'TIDAK ADA DI TMS' && (
                          <span className="bg-red-950/40 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ TIDAK ADA DI TMS</span>
                        )}
                        {row.statusValidasiTms === 'DATA TMS TIDAK COCOK' && (
                          <span className="bg-amber-950/40 text-amber-400 border border-amber-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ DATA MISMATCH</span>
                        )}
                        {row.statusValidasiTms === 'STATUS TMS BELUM CLOSED' && (
                          <span className="bg-amber-950/40 text-amber-400 border border-amber-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ BELUM CLOSED ({row.jobOrderStatusTms})</span>
                        )}
                        {row.statusPembayaran === 'SUDAH DIBAYAR' && (
                          <span className="bg-rose-950/40 text-rose-400 border border-rose-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ SUDAH DIBAYAR</span>
                        )}
                        {row.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN' && (
                          <span className="bg-red-950/40 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ DUPLIKAT JO</span>
                        )}
                        {row.statusFee === 'FEE LEBIH' && (
                          <span className="bg-orange-950/40 text-orange-400 border border-orange-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ FEE LEBIH (+Rp {row.selisihFee.toLocaleString()})</span>
                        )}
                        {row.statusFee === 'FEE KURANG' && (
                          <span className="bg-pink-950/40 text-pink-400 border border-pink-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium">✗ FEE KURANG (-Rp {Math.abs(row.selisihFee).toLocaleString()})</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                        {row.keteranganError}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                      {formatRupiah(row.feeUmkPengajuan)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold tracking-wider ${badgeStyle}`}>
                        {row.keputusanSistem}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectJo(`${row.jobOrderNo}-${row.crewIdPengajuan}`)}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded hover:text-slate-100 border border-slate-700 transition"
                      >
                        Investigasi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
