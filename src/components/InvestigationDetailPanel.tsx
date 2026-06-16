import React from 'react';
import { ValidationResult } from '../types';
import { getStringSimilarity, isCustomerMatching, normalizeGeneralText } from '../utils/validationEngine';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRightLeft, 
  FileCheck, 
  CornerDownRight, 
  User, 
  Truck, 
  Building, 
  Calendar, 
  Navigation,
  DollarSign
} from 'lucide-react';

interface InvestigationDetailPanelProps {
  joNo: string;
  results: ValidationResult[];
  onClose: () => void;
  onUpdateWorkflowStatus: (joNo: string, oldStatus: string, newStatus: string) => void;
  currentUser: string;
}

export default function InvestigationDetailPanel({ 
  joNo, 
  results, 
  onClose, 
  onUpdateWorkflowStatus,
  currentUser 
}: InvestigationDetailPanelProps) {
  
  const row = results.find(r => `${r.jobOrderNo}-${r.crewIdPengajuan}` === joNo || r.jobOrderNo === joNo);
  if (!row) return null;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // 1. Detailed Checks Status
  const hasTms = row.statusValidasiTms !== 'TIDAK ADA DI TMS';
  const driverSimilarity = hasTms ? getStringSimilarity(row.namaDriverPengajuan, row.namaDriverTms) : 0;
  const customerSimilarity = hasTms ? getStringSimilarity(row.customerPengajuan, row.customerTms) : 0;

  const driverMatch = hasTms && (row.crewIdPengajuan === row.crewIdTms || driverSimilarity >= 0.80);
  const customerMatch = hasTms && isCustomerMatching(row.customerPengajuan, row.customerTms);
  
  const isC1Adi = normalizeGeneralText(row.customerPengajuan).includes('TRI ADI BERSAMA');
  const isC2Anteraja = normalizeGeneralText(row.customerTms).includes('ANTERAJA');
  const isC2Adi = normalizeGeneralText(row.customerTms).includes('TRI ADI BERSAMA');
  const isC1Anteraja = normalizeGeneralText(row.customerPengajuan).includes('ANTERAJA');
  const isSpecialCustomerMatch = (isC1Adi && isC2Anteraja) || (isC2Adi && isC1Anteraja);

  const platMatch = hasTms && (row.platNoPengajuan.replace(/[\-\.\,\s]/g, '').toUpperCase() === row.platNoTms.replace(/[\-\.\,\s]/g, '').toUpperCase());
  const isClosed = hasTms && row.jobOrderStatusTms.toUpperCase() === 'CLOSED';
  const feeMatch = row.statusFee === 'FEE SESUAI';
  const unpaid = row.statusPembayaran === 'BELUM DIBAYAR';
  const noDup = row.warningDuplikat === '-';

  const checkList = [
    { label: 'JO ditemukan di TMS', passed: hasTms, vital: true },
    { 
      label: `Driver cocok ${driverMatch && driverSimilarity < 1.0 && driverSimilarity >= 0.80 ? `(Fuzzy ${Math.round(driverSimilarity * 100)}% mirip)` : ''}`, 
      passed: driverMatch, 
      vital: false 
    },
    { 
      label: `Customer cocok ${customerMatch && isSpecialCustomerMatch ? '(Aturan Ekuivalen PT TAB = Anteraja)' : (customerMatch && customerSimilarity < 1.0 ? `(Fuzzy ${Math.round(customerSimilarity * 100)}% mirip)` : '')}`, 
      passed: customerMatch, 
      vital: false 
    },
    { label: 'Plat nomor cocok', passed: platMatch, vital: false },
    { label: 'Status TMS sudah CLOSED', passed: isClosed, vital: true },
    { label: 'Fee sesuai hitung ulang', passed: feeMatch, vital: false },
    { label: 'Belum pernah dibayar (Anti Double-Payment)', passed: unpaid, vital: true },
    { label: 'Tidak duplikat di pengajuan', passed: noDup, vital: true },
  ];

  const workflowStatuses: Array<'DRAFT' | 'VALIDATED' | 'REVIEW' | 'APPROVED' | 'PAID'> = [
    'DRAFT', 'VALIDATED', 'REVIEW', 'APPROVED', 'PAID'
  ];

  let decisionBadgeClass = 'bg-emerald-950 text-emerald-400 border-emerald-900';
  let decisionBg = 'bg-emerald-950/20';
  if (row.keputusanSistem === 'REVIEW MANUAL') {
    decisionBadgeClass = 'bg-amber-950 text-amber-400 border-amber-900';
    decisionBg = 'bg-amber-950/20';
  } else if (row.keputusanSistem === 'TOLAK') {
    decisionBadgeClass = 'bg-rose-950 text-rose-400 border-rose-900';
    decisionBg = 'bg-rose-950/20';
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col h-full"
      style={{ animation: 'slideIn 0.3s ease-out' }}
      id="investigation-drawer"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] bg-indigo-950/80 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded border border-indigo-900/40">
              INVESTIGASI DETIL
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded border border-slate-705 uppercase">
              DL: {row.pengaju}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-100 font-mono mt-1">
            {row.jobOrderNo}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Core system decision card */}
        <div className={`p-4 rounded-xl border ${decisionBadgeClass.split(' ')[2]} ${decisionBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-430 uppercase tracking-wider block mb-1">
              Status Keputusan Sistem
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border ${decisionBadgeClass}`}>
              {row.keputusanSistem}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-2">
            Reason: <span className="text-slate-300 font-medium">{row.alasanKeputusan}</span>
          </p>
        </div>

        {/* Workflow Status Controls */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Status Alur Kerja (Workflow Status)
          </span>
          
          <div className="flex flex-wrap gap-1.5">
            {workflowStatuses.map((status) => {
              const isActive = row.statusWorkflow === status;
              let style = 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200';
              if (isActive) {
                if (status === 'PAID') style = 'bg-blue-950 text-blue-400 border-blue-900 font-bold';
                else if (status === 'APPROVED') style = 'bg-emerald-950 text-emerald-400 border-emerald-900 font-bold';
                else if (status === 'REVIEW') style = 'bg-amber-950 text-amber-400 border-amber-900 font-bold';
                else style = 'bg-slate-800 text-slate-100 border-slate-700 font-bold';
              }

              return (
                <button
                  key={status}
                  id={`btn-workflow-${status}`}
                  onClick={() => {
                    if (row.statusWorkflow !== status) {
                      onUpdateWorkflowStatus(`${row.jobOrderNo}-${row.crewIdPengajuan}`, row.statusWorkflow, status);
                    }
                  }}
                  className={`px-2.5 py-1 text-[10px] rounded border transition duration-150 ${style}`}
                >
                  {status}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic leading-tight">
            * Operator {currentUser} dapat mengoverride status manual untuk proses pencairan dana selanjutnya.
          </p>
        </div>

        {/* Checklists results */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Hasil Pemeriksaan Komparasi (Rules Checklist)
          </h3>
          <div className="space-y-2.5">
            {checkList.map((chk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${chk.passed ? 'text-slate-300' : 'text-slate-400'}`}>
                    {chk.label}
                  </span>
                  {!chk.passed && chk.vital && (
                    <span className="ml-1.5 px-1 py-0 bg-red-950 text-red-400 border border-red-900 text-[8px] font-extrabold rounded uppercase tracking-widest">
                      Fatal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-side Mergensi Details Comparison */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detil Komparasi Data Lapangan
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {/* Driver */}
            <div className={`p-2 rounded border transition ${driverMatch ? 'border-slate-800 bg-slate-900/10' : 'border-amber-900/50 bg-amber-950/10'}`}>
              <div className="flex items-center justify-between gap-1.5 text-slate-400 font-semibold mb-1 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  DRIVER IDENTITAS
                </span>
                {driverMatch && driverSimilarity < 1.0 && (
                  <span className="text-[9px] text-amber-400 bg-amber-950/50 px-1 py-0.2 rounded border border-amber-900/50 font-bold">
                    {Math.round(driverSimilarity * 100)}% Match (Fuzzy)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-500">Pengajuan ({row.crewIdPengajuan})</p>
                  <p className="font-bold text-slate-300 truncate">{row.namaDriverPengajuan}</p>
                </div>
                <div>
                  <p className="text-slate-500">Database TMS ({row.crewIdTms})</p>
                  <p className="font-bold text-slate-300 truncate">{row.namaDriverTms}</p>
                </div>
              </div>
            </div>

            {/* Plat No */}
            <div className={`p-2 rounded border transition ${platMatch ? 'border-slate-800 bg-slate-900/10' : 'border-amber-900/50 bg-amber-950/10'}`}>
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 text-[10px]">
                <Truck className="w-3.5 h-3.5" />
                NOMOR PLAT KENDARAAN (NORMALISASI)
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-500">Pengajuan</p>
                  <p className="font-bold text-slate-300">{row.platNoPengajuan}</p>
                </div>
                <div>
                  <p className="text-slate-500">Database TMS</p>
                  <p className="font-bold text-slate-300">{row.platNoTms}</p>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className={`p-2 rounded border transition ${customerMatch ? 'border-slate-800 bg-slate-900/10' : 'border-amber-900/50 bg-amber-950/10'}`}>
              <div className="flex items-center justify-between gap-1.5 text-slate-400 font-semibold mb-1 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  CUSTOMER NAME
                </span>
                {customerMatch && isSpecialCustomerMatch && (
                  <span className="text-[9px] text-indigo-400 bg-indigo-950/50 px-1 py-0.2 rounded border border-indigo-900/50 font-bold">
                    TAB = Anteraja Equivalence
                  </span>
                )}
                {customerMatch && !isSpecialCustomerMatch && customerSimilarity < 1.0 && (
                  <span className="text-[9px] text-amber-400 bg-amber-950/50 px-1 py-0.2 rounded border border-amber-900/50 font-bold">
                    {Math.round(customerSimilarity * 100)}% Match (Fuzzy)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-500">Pengajuan</p>
                  <p className="font-bold text-slate-300 truncate">{row.customerPengajuan}</p>
                </div>
                <div>
                  <p className="text-slate-500">Database TMS</p>
                  <p className="font-bold text-slate-300 truncate">{row.customerTms}</p>
                </div>
              </div>
            </div>

            {/* ETA */}
            <div className="p-2 rounded border border-slate-800 bg-slate-900/10">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 text-[10px]">
                <Calendar className="w-3.5 h-3.5" />
                ESTIMATED TIME OF ARRIVAL (ETA)
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-500">Pengajuan</p>
                  <p className="font-bold text-slate-300">{row.etaPengajuan}</p>
                </div>
                <div>
                  <p className="text-slate-500">Database TMS</p>
                  <p className="font-bold text-slate-300">{row.etaTms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Analysis Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
            Rincian Biaya & Selisih (Financial Summary)
          </h3>

          <div className="space-y-2 pt-1 font-sans">
            {row.skemaFee === 'DAILY' && (
              <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded space-y-1.5 text-[11px] mb-2 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">Skema Pembayaran</span>
                  <span className="font-extrabold text-indigo-455 uppercase">DAILY GROUPING</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total JO dalam Group</span>
                  <span className="font-bold text-slate-200">{row.totalJoDalamGroupDaily} JO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UMK Tertinggi Group</span>
                  <span className="font-bold text-slate-200">{row.dailyUmkTertinggi ? formatRupiah(row.dailyUmkTertinggi) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HK Fee Tertinggi Group</span>
                  <span className="font-bold text-slate-200">{row.dailyHkTerpilih ? `${row.dailyHkTerpilih} HK` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee Daily Group (Maks)</span>
                  <span className="font-semibold text-slate-200">{formatRupiah(row.dailyFeeGroup || row.feeHarianDaily)}</span>
                </div>
                <div className="flex justify-between border-t border-indigo-900/40 pt-1.5 mt-1.5">
                  <span className="text-indigo-300 font-bold">Alokasi per JO (Sistem)</span>
                  <span className="font-black text-indigo-400">{formatRupiah(row.feeAlokasiPerJo)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400">Fee Pengajuan Driver Leader</span>
              <span className="font-bold text-slate-200">{formatRupiah(row.feeUmkPengajuan)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400">Fee Sistem (Hitung Ulang Formula)</span>
              <span className="font-bold text-slate-200">{formatRupiah(row.feeHitungUlang)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded">
              <span className="text-slate-300 font-medium font-sans">Selisih Fee</span>
              <div className="text-right">
                <span className={`font-black ${row.selisihFee === 0 ? 'text-emerald-400' : row.selisihFee > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {row.selisihFee > 0 ? '+' : ''}{formatRupiah(row.selisihFee)}
                </span>
                <span className="block text-[9px] text-slate-500 mt-0.5 font-sans">
                  {row.statusFee}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
