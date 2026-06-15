import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Play, 
  Download, 
  Database, 
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Info, 
  HelpCircle, 
  FileText, 
  History, 
  Shuffle, 
  ChevronRight, 
  Settings,
  HelpCircle as HelpIcon,
  ShieldCheck,
  Building,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';

import { 
  PengajuanRow, 
  TmsRow, 
  AlreadyPaidRow, 
  ValidationResult, 
  DashboardStats,
  AuditTrailEntry,
  CostTypeFormula,
  DriverLeaderStats,
  MasterUmkMapping
} from './types';

import { 
  runValidationProcess, 
  getDashboardStats, 
  getDriverLeaderStatsList,
  MOCK_PENGAJUAN, 
  MOCK_EXPORT_TMS, 
  MOCK_JO_SUDAH_DIBAYAR,
  DEFAULT_FORMULAS,
  DEFAULT_UMK_MAPPINGS,
  parseSafeInt,
  parseSafeFloat,
  getFlexibleField,
  lookupUmk
} from './utils/validationEngine';

import { exportValidationResultToExcel } from './utils/excelExport';
import { APPS_SCRIPT_CODE_GS, APPS_SCRIPT_INDEX_HTML } from './utils/appsScriptCode';

// Imported Modular Subcomponents
import FinancialKPIs from './components/FinancialKPIs';
import ExceptionReport from './components/ExceptionReport';
import InvestigationDetailPanel from './components/InvestigationDetailPanel';
import AuditTrailView from './components/AuditTrailView';
import FormulaEngineView from './components/FormulaEngineView';
import ImportPaidFiles from './components/ImportPaidFiles';
import DriverLeaderMonitoring from './components/DriverLeaderMonitoring';
import MasterUmkView from './components/MasterUmkView';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pengajuan' | 'tms' | 'result_verification' | 'exception_report' | 'paid_database' | 'formulas' | 'umk_master' | 'audit_trail' | 'apps_script'>('dashboard');

  // Datasets State
  const [pengajuanData, setPengajuanData] = useState<PengajuanRow[]>(MOCK_PENGAJUAN);
  const [tmsData, setTmsData] = useState<TmsRow[]>(MOCK_EXPORT_TMS);
  const [sudahDibayarData, setSudahDibayarData] = useState<AlreadyPaidRow[]>(MOCK_JO_SUDAH_DIBAYAR);
  
  // Audits & Formulas
  const [auditLogs, setAuditLogs] = useState<AuditTrailEntry[]>([
    {
      id: 'log-init-1',
      timestamp: '13/06/2026 08:00:00',
      user: 'Sistem',
      aktivitas: 'Inisialisasi Sistem',
      jobOrderNo: '-',
      statusLama: '-',
      statusBaru: 'AKTIF'
    },
    {
      id: 'log-init-2',
      timestamp: '13/06/2026 08:05:12',
      user: 'Syukra',
      aktivitas: 'Ambil Berkas Berkas Demo',
      jobOrderNo: '-',
      statusLama: '-',
      statusBaru: 'DRAFT_SINKRONS'
    }
  ]);

  // Load formulas from localStorage or fallback to defaults
  const [formulas, setFormulas] = useState<CostTypeFormula[]>(() => {
    const saved = localStorage.getItem('master_formulas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_FORMULAS;
  });

  // Save formulas to localStorage on change
  useEffect(() => {
    localStorage.setItem('master_formulas', JSON.stringify(formulas));
  }, [formulas]);

  // Load Master UMK Mappings from localStorage or fallback to defaults (with automated stale cache upgrades)
  const [masterUmkList, setMasterUmkList] = useState<MasterUmkMapping[]>(() => {
    const saved = localStorage.getItem('master_umk_mappings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50 && parsed[0] && 'division' in parsed[0]) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_UMK_MAPPINGS;
  });

  // Save Master UMK to localStorage on change
  useEffect(() => {
    localStorage.setItem('master_umk_mappings', JSON.stringify(masterUmkList));
  }, [masterUmkList]);

  // Validation Results State
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Selected JO for detailed investigation drawer
  const [selectedJo, setSelectedJo] = useState<string | null>(null);

  // Verification process tracking
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  // Search & Filter state for validation table
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [workflowFilter, setWorkflowFilter] = useState<string>('ALL');
  const [pengajuFilter, setPengajuFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [statusValidasiFilter, setStatusValidasiFilter] = useState<string>('ALL');
  const [statusPembayaranFilter, setStatusPembayaranFilter] = useState<string>('ALL');
  const [skemaFeeFilter, setSkemaFeeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Clipboard copies
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // File dragging status for regular uploads
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({
    pengajuan: false,
    tms: false
  });

  const currentUser = 'Syukra';

  // Helper helper audit logger
  const writeLog = (aktivitas: string, jobOrderNo: string, statusLama: string, statusBaru: string) => {
    const timestampStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newLog: AuditTrailEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: timestampStr,
      user: currentUser,
      aktivitas,
      jobOrderNo,
      statusLama,
      statusBaru
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  // Run validation
  const executeEngineValidation = () => {
    const results = runValidationProcess(pengajuanData, tmsData, sudahDibayarData, formulas, masterUmkList);
    setValidationResults(results);
    setStats(getDashboardStats(results));
  };

  // Re-run validation on dataset shift
  useEffect(() => {
    executeEngineValidation();
  }, [pengajuanData, tmsData, sudahDibayarData, formulas]);

  // Handle run validation with interactive loader simulation
  const handleRunValidationClick = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            executeEngineValidation();
            setIsProcessing(false);
            writeLog('Melakukan Rekonsiliasi Otomatis', '-', '-', 'VALIDATED');
            setActiveTab('result_verification');
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  // Excel Excel parsing template handler
  const parseExcelFile = (file: File, type: 'pengajuan' | 'tms') => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawJson.length === 0) {
          alert('Spreadsheet kosong atau format tidak sesuai.');
          return;
        }

        const MAX_ROWS = 10000;
        let finalJson = rawJson;
        if (rawJson.length > MAX_ROWS) {
          alert(`Pemberitahuan: Jumlah baris data dalam berkas (${rawJson.length.toLocaleString()} baris) melebihi batas performa optimal browser. Sistem secara otomatis membatasi hingga ${MAX_ROWS.toLocaleString()} baris teratas demi mencegah lag pada tampilan.`);
          finalJson = rawJson.slice(0, MAX_ROWS);
        }

        if (type === 'pengajuan') {
          const parsed: PengajuanRow[] = finalJson.map(row => {
            const kotaUmk = String(getFlexibleField(row, ['Kota UMK', 'kotaUmk', 'kota_umk', 'kota', 'city']) || '').trim();
            const rawUmk = parseSafeInt(getFlexibleField(row, ['UMK', 'Nilai UMK', 'nilaiUmk', 'value umk', 'nilai_umk', 'nominal umk']), 0);
            const nilaiUmk = rawUmk > 0 ? rawUmk : lookupUmk(kotaUmk);
            
            const subDivisionVal = String(getFlexibleField(row, ['Sub Division', 'Sub-Division', 'Sub Divisi', 'sub_division', 'subdivision', 'Route', 'Rute', 'Rute / Keterangan', 'rute_keterangan', 'rute keterangan']) || '').trim();

            return {
              pengaju: String(getFlexibleField(row, ['Pengaju', 'pengaju', 'requester', 'user', 'nama pengaju']) || 'KOSONG').trim().toUpperCase(),
              jobOrderNo: String(getFlexibleField(row, ['Job Order No', 'jobOrderNo', 'JO No', 'joNo', 'no jo', 'no_jo', 'job order', 'job_order_no']) || '').trim(),
              crewId: String(getFlexibleField(row, ['Crew ID', 'crewId', 'CrewID', 'id driver', 'driver id', 'crew_id', 'id_crew', 'crew']) || '').trim(),
              namaDriver: String(getFlexibleField(row, ['Nama Driver', 'namaDriver', 'Driver Name', 'Nama', 'driver_name', 'nama_driver', 'sopir', 'nama sopir']) || '').trim(),
              division: String(getFlexibleField(row, ['Division', 'division', 'divisi', 'cabang', 'branch']) || '').trim(),
              jobOrderStatus: String(getFlexibleField(row, ['Job Order Status', 'jobOrderStatus', 'status', 'jo_status', 'job_order_status']) || 'Closed').trim(),
              eta: String(getFlexibleField(row, ['Shipment Date', 'ShipmentDate', 'shipment_date', 'ETA', 'eta', 'tanggal', 'date', 'eta_date', 'tanggal_eta']) || '').trim(),
              orderType: String(getFlexibleField(row, ['Order Type', 'orderType', 'order_type', 'tipe_order']) || 'Regular').trim(),
              fleetType: String(getFlexibleField(row, ['Fleet Type', 'fleetType', 'tipe armada', 'armada', 'fleet_type', 'tipe_armada']) || '').trim(),
              platNo: String(getFlexibleField(row, ['Plat No', 'platNo', 'Plat', 'No Plat', 'no plat', 'no_plat', 'plat_no']) || '').trim(),
              subDivision: subDivisionVal,
              homebase: String(getFlexibleField(row, ['Homebase', 'homebase', 'asal']) || '').trim(),
              customer: String(getFlexibleField(row, ['Customer', 'customer', 'pelanggan']) || '').trim(),
              durasiPerjalanan: parseSafeFloat(getFlexibleField(row, ['Durasi', 'Durasi Perjalanan', 'durasiPerjalanan', 'durasi_perjalanan', 'hari', 'days']), 1),
              costType: String(getFlexibleField(row, ['Cost Type', 'costType', 'cost_type', 'tipe_biaya']) || 'FEE FREELANCE').trim(),
              jenisHariKerja: parseSafeInt(getFlexibleField(row, ['Hari Kerja', 'Jenis Hari Kerja', 'jenisHariKerja', 'hari_kerja', 'HK', 'hk']), 25),
              kotaUmk,
              nilaiUmk,
              feeUmk: parseSafeInt(getFlexibleField(row, ['Fee UMK', 'feeUmk', 'Fee', 'fee_umk', 'nominal fee', 'fee pengajuan', 'Fee Pengajuan']), 0),
              skemaFee: ((getFlexibleField(row, ['Skema Fee', 'skemaFee', 'Skema', 'skema_fee', 'payment_scheme']))
                ? (String(getFlexibleField(row, ['Skema Fee', 'skemaFee', 'Skema', 'skema_fee', 'payment_scheme'])).trim().toUpperCase() === 'RITASE' ? 'RITASE' : 'DAILY')
                : 'DAILY') as 'DAILY' | 'RITASE'
            };
          }).filter(row => row.jobOrderNo);
          
          setPengajuanData(parsed);
          writeLog('Unggah Berkas Driver Leader', '-', '-', `${parsed.length} JO`);
        } else if (type === 'tms') {
          const parsed: TmsRow[] = finalJson.map(row => ({
            jobOrderNo: String(getFlexibleField(row, ['Job Order No', 'jobOrderNo', 'JO No', 'joNo', 'no jo', 'no_jo', 'job order', 'job_order_no']) || '').trim(),
            crewId: String(getFlexibleField(row, ['Crew ID', 'crewId', 'CrewID', 'id driver', 'driver id', 'crew_id', 'id_crew', 'crew']) || '').trim(),
            namaDriver: String(getFlexibleField(row, ['Nama Driver', 'namaDriver', 'Driver Name', 'Nama', 'driver_name', 'nama_driver', 'sopir', 'nama sopir']) || '').trim(),
            division: String(getFlexibleField(row, ['Division', 'division', 'divisi', 'cabang', 'branch']) || '').trim(),
            jobOrderStatus: String(getFlexibleField(row, ['Job Order Status', 'jobOrderStatus', 'status', 'jo_status', 'job_order_status']) || '').trim(),
            eta: String(getFlexibleField(row, ['Shipment Date', 'ShipmentDate', 'shipment_date', 'ETA', 'eta', 'tanggal', 'date', 'eta_date', 'tanggal_eta']) || '').trim(),
            orderType: String(getFlexibleField(row, ['Order Type', 'orderType', 'order_type', 'tipe_order']) || '').trim(),
            fleetType: String(getFlexibleField(row, ['Fleet Type', 'fleetType', 'tipe armada', 'armada', 'fleet_type', 'tipe_armada']) || '').trim(),
            platNo: String(getFlexibleField(row, ['Plat No', 'platNo', 'Plat', 'No Plat', 'no plat', 'no_plat', 'plat_no']) || '').trim(),
            subDivision: String(getFlexibleField(row, ['Sub Division', 'Sub-Division', 'Sub Divisi', 'sub_division', 'subdivision', 'Route', 'Rute', 'Rute / Keterangan', 'rute_keterangan', 'rute keterangan', 'keterangan_rute']) || '').trim(),
            customer: String(getFlexibleField(row, ['Customer', 'customer', 'pelanggan']) || '').trim(),
          })).filter(row => row.jobOrderNo);

          setTmsData(parsed);
          writeLog('Unggah Berkas Ekspor TMS', '-', '-', `${parsed.length} JO`);
        }
      } catch (err) {
        alert('Terjadi kesalahan saat menguji file Excel. Pastikan header kolom sesuai.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent, type: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e: React.DragEvent, type: 'pengajuan' | 'tms') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseExcelFile(e.dataTransfer.files[0], type);
    }
  };

  // Callback callbacks
  const handleImportPaidSuccess = (rows: AlreadyPaidRow[]) => {
    setSudahDibayarData(prev => [...prev, ...rows]);
    writeLog(`Unggah Database Pembayaran`, '-', '-', `${rows.length} Pembayaran`);
  };

  const handleAddFormula = (frm: CostTypeFormula) => {
    setFormulas(prev => [...prev, frm]);
    writeLog(`Tambah Cost Type Formula`, '-', '-', frm.costType);
  };

  const handleDeleteFormula = (ct: string) => {
    setFormulas(prev => prev.filter(f => f.costType !== ct));
    writeLog(`Hapus Cost Type Formula`, '-', ct, '-');
  };

  const handleUpdateWorkflowStatus = (joNoOrKey: string, oldStatus: string, newStatus: string) => {
    let joNo = joNoOrKey;
    let crewId: string | undefined = undefined;
    
    // Check if it's a composite key (contains "-")
    const dashIdx = joNoOrKey.indexOf('-');
    if (dashIdx !== -1) {
      joNo = joNoOrKey.substring(0, dashIdx);
      crewId = joNoOrKey.substring(dashIdx + 1);
    }

    setPengajuanData(prev => prev.map(p => {
      const matchJo = p.jobOrderNo === joNo;
      const matchCrew = crewId ? p.crewId === crewId : true;
      if (matchJo && matchCrew) {
        return { ...p, statusWorkflow: newStatus as any };
      }
      return p;
    }));
    writeLog(`Modifikasi Status Workflow`, joNo + (crewId ? ` (${crewId})` : ''), oldStatus, newStatus);
  };

  // Reset/Clear helpers
  const handleClearData = (type: 'pengajuan' | 'tms') => {
    if (type === 'pengajuan') setPengajuanData([]);
    if (type === 'tms') setTmsData([]);
    writeLog(`Bersihkan Seluruh Berkas`, '-', type.toUpperCase(), 'KOSONG');
  };

  const handleResetToMock = (type: 'pengajuan' | 'tms') => {
    if (type === 'pengajuan') setPengajuanData(MOCK_PENGAJUAN);
    if (type === 'tms') setTmsData(MOCK_EXPORT_TMS);
    writeLog(`Pilih Ulang Data Demo`, '-', '-', type.toUpperCase());
  };

  const handleDownloadTemplate = (type: 'pengajuan' | 'tms') => {
    let dataToExport = [];
    let filename = '';
    let sheetName = '';

    if (type === 'pengajuan') {
      dataToExport = [
        {
          'Pengaju': 'ASEP',
          'Job Order No': 'JO-360570',
          'Crew ID': '201061',
          'Nama Driver': 'DIDIN HANAFI',
          'Division': 'JATIM 2',
          'Job Order Status': 'Closed',
          'Shipment Date': '26/05/2026',
          'Order Type': 'Regular',
          'Fleet Type': 'CDD.L',
          'Plat No': 'B-9115-NCJ',
          'Sub Division': 'CWH MALANG - BLITAR',
          'Homebase': 'BAT - MALANG',
          'Customer': 'PT. BAT - MALANG',
          'Durasi Perjalanan': 1,
          'Cost Type': 'FEE FREELANCE',
          'Jenis Hari Kerja': 25,
          'Kota UMK': 'KOTA MALANG',
          'UMK': 3568376,
          'Fee UMK': 47667,
          'Skema Fee': 'DAILY'
        },
        {
          'Pengaju': 'ASEP',
          'Job Order No': 'JO-360570',
          'Crew ID': '201062',
          'Nama Driver': 'AGUS',
          'Division': 'JATIM 2',
          'Job Order Status': 'Closed',
          'Shipment Date': '26/05/2026',
          'Order Type': 'Regular',
          'Fleet Type': 'CDD.L',
          'Plat No': 'B-9115-NCJ',
          'Sub Division': 'CWH MALANG - BLITAR',
          'Homebase': 'BAT - MALANG',
          'Customer': 'PT. BAT - MALANG',
          'Durasi Perjalanan': 1,
          'Cost Type': 'FEE FREELANCE',
          'Jenis Hari Kerja': 25,
          'Kota UMK': 'KOTA MALANG',
          'UMK': 3568376,
          'Fee UMK': 143000,
          'Skema Fee': 'RITASE'
        }
      ];
      filename = 'Template_Pengajuan_Driver_Leader.xlsx';
      sheetName = 'Rekap Pengajuan';
    } else {
      dataToExport = [
        {
          'Job Order No': 'JO-360570',
          'Crew ID': '201061',
          'Nama Driver': 'DIDIN HANAFI',
          'Division': 'JATIM 2',
          'Job Order Status': 'Closed',
          'Shipment Date': '26/05/2026',
          'Order Type': 'Regular',
          'Fleet Type': 'CDD.L',
          'Plat No': 'B-9115-NCJ',
          'Sub Division': 'CWH MALANG - BLITAR',
          'Customer': 'PT. BAT MALANG'
        },
        {
          'Job Order No': 'JO-360570',
          'Crew ID': '201062',
          'Nama Driver': 'AGUS',
          'Division': 'JATIM 2',
          'Job Order Status': 'Closed',
          'Shipment Date': '26/05/2026',
          'Order Type': 'Regular',
          'Fleet Type': 'CDD.L',
          'Plat No': 'B-9115-NCJ',
          'Sub Division': 'CWH MALANG - BLITAR',
          'Customer': 'PT. BAT MALANG'
        }
      ];
      filename = 'Template_Ekspor_TMS.xlsx';
      sheetName = 'Export TMS';
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
    writeLog('Unduh Template Berkas', '-', '-', type.toUpperCase());
  };

  const copyToClipboard = (code: string, type: 'gs' | 'html') => {
    navigator.clipboard.writeText(code).then(() => {
      if (type === 'gs') {
        setCopiedGs(true);
        setTimeout(() => setCopiedGs(false), 2000);
      } else {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      }
    });
  };

  // Filtering validation outputs
  const filteredResults = validationResults.filter(row => {
    const s = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' ? true : (
      row.jobOrderNo.toLowerCase().includes(s) ||
      row.namaDriverPengajuan.toLowerCase().includes(s) ||
      row.platNoPengajuan.toLowerCase().includes(s) ||
      row.customerPengajuan.toLowerCase().includes(s)
    );

    const matchDecision = decisionFilter === 'ALL' ? true : row.keputusanSistem === decisionFilter;
    const matchWorkflow = workflowFilter === 'ALL' ? true : row.statusWorkflow === workflowFilter;
    
    // Upgraded Driver Leader specific filters
    const matchPengaju = pengajuFilter === 'ALL' ? true : row.pengaju === pengajuFilter;
    const matchCustomer = customerFilter === 'ALL' ? true : row.customerPengajuan === customerFilter;
    const matchDivision = divisionFilter === 'ALL' ? true : row.divisionPengajuan === divisionFilter;
    const matchStatusValidasi = statusValidasiFilter === 'ALL' ? true : row.statusValidasiTms === statusValidasiFilter;
    const matchStatusPembayaran = statusPembayaranFilter === 'ALL' ? true : row.statusPembayaran === statusPembayaranFilter;
    const matchSkemaFee = skemaFeeFilter === 'ALL' ? true : row.skemaFee === skemaFeeFilter;

    return matchSearch && matchDecision && matchWorkflow && matchPengaju && matchCustomer && matchDivision && matchStatusValidasi && matchStatusPembayaran && matchSkemaFee;
  });

  // Unique list values for dynamic dropdown filters
  const uniquePengaju = Array.from(new Set(validationResults.map(r => r.pengaju).filter(Boolean))).sort();
  const uniqueCustomer = Array.from(new Set(validationResults.map(r => r.customerPengajuan).filter(Boolean))).sort();
  const uniqueDivision = Array.from(new Set(validationResults.map(r => r.divisionPengajuan).filter(Boolean))).sort();

  // Driver leader performance KPI and metrics list
  const driverLeaderStatsList = getDriverLeaderStatsList(validationResults);

  // Pagination lists
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'light' ? 'light bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'}`} id="application-layout">
      {/* Visual Navigation Header */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-40 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl animate-pulse-subtle">
            <ShieldCheck className="w-6 h-6 text-slate-50" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-1.5 font-mono">
              VALIDATOR OPERASIONAL FEE DRIVER
              <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded font-mono font-bold font-sans">
                v2.0 PROD
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Otomasi Validasi, Keputusan Sistem & Audit Trail Kontrol Akurasi Finansial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-indigo-400 transition duration-150 flex items-center justify-center"
            title={theme === 'light' ? 'Beralih ke Dark Mode' : 'Beralih ke Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
          <span className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-350">
            Operator: <strong className="text-indigo-400">{currentUser}</strong> (Driver Management Team)
          </span>
          <button
            onClick={handleRunValidationClick}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-550 font-black rounded text-xs transition duration-150 animate-pulse-subtle shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? `REKONSILIASI ${processProgress}%` : 'PROSES REKONSILIASI'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Responsive Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-slate-900/40 lg:border-r border-slate-800 p-4 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block p-2">
            Papan Utama
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'dashboard' ? 'bg-indigo-650/15 text-indigo-450 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Finansial
            </span>
          </button>

          <button
            onClick={() => setActiveTab('result_verification')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'result_verification' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Hasil Verifikasi JO
            </span>
            {validationResults.length > 0 && (
              <span className="font-mono text-[9px] bg-slate-850 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                {validationResults.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exception_report')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'exception_report' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Exception Report
            </span>
            {stats && (stats.totalTidakAdaDiTms + stats.totalDataTidakCocok + stats.totalBelumClosed + stats.totalDuplikatJo + stats.totalFeeKurang + stats.totalFeeLebih + stats.totalSudahDibayar) > 0 && (
              <span className="font-mono text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full border border-rose-900">
                {stats.totalTidakAdaDiTms + stats.totalDataTidakCocok + stats.totalBelumClosed + stats.totalDuplikatJo + stats.totalFeeKurang + stats.totalFeeLebih + stats.totalSudahDibayar}
              </span>
            )}
          </button>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block p-2 pt-6">
            Input & Berkas
          </span>

          <button
            onClick={() => setActiveTab('pengajuan')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'pengajuan' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              File Pengajuan Driver
            </span>
            <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 rounded">
              {pengajuanData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tms')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'tms' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              File Ekspor TMS
            </span>
            <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-1 rounded">
              {tmsData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('paid_database')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'paid_database' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Upload Pembayaran
            </span>
            <span className="font-mono text-[9px] text-emerald-500 bg-slate-950 px-1 rounded">
              {sudahDibayarData.length}
            </span>
          </button>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block p-2 pt-6">
            Pengaturan & Validasi
          </span>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'formulas' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-400" />
              Master Formula Fee
            </span>
          </button>

          <button
            onClick={() => setActiveTab('umk_master')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'umk_master' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Master UMK & Customer
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'audit_trail' ? 'bg-indigo-650/15 text-indigo-455 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Audit Trail Logs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('apps_script')}
            className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'apps_script' ? 'bg-indigo-650/15 text-indigo-440 border border-indigo-900/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Integrasi Google Sheets
            </span>
          </button>
        </aside>

        {/* Content canvas */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: FINANCIAL DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6" id="dashboard-tab">
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    Dashboard Keuangan Operasional
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pantauan langsung volume JO, alokasi anggaran, selisih fee, dan pencegahan pembayaran ganda.
                  </p>
                </div>
                <div className="text-xs font-mono font-medium text-slate-500">
                  Refreshed: <span className="text-indigo-400">Baru Saja</span>
                </div>
              </div>

              {/* Rupiah Financial KPIs Widgets */}
              <FinancialKPIs stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual quick guide card */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 lg:col-span-2 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Panduan Alur Sistem Verifikasi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                      <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-slate-400">1. UNGGAH BERKAS</span>
                      <p className="text-slate-300 font-bold">Upload Data Lapangan</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Unggah berkas rekap pengajuan Driver Leader serta berkas dump mentah dari Ekspor TMS.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                      <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-slate-400">2. REKONSILIASI</span>
                      <p className="text-slate-300 font-bold">Kecocokan Otomatis</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Klik tombol <strong>Proses Rekonsiliasi</strong> untuk menjalankan pencocokan plat, driver, customer, & hitung ulang formula.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                      <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-slate-400">3. KEPUTUSAN</span>
                      <p className="text-slate-300 font-bold">Tindakan Cepat</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Masing-masing JO diberi label SIAP DIBAYAR, REVIEW MANUAL, atau TOLAK secara instan.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-lg text-xs leading-relaxed text-slate-400">
                    <strong className="text-slate-300 uppercase block mb-1">Rekomendasi Operasional:</strong>
                    Terdapat <span className="text-rose-400 font-bold">{stats.totalTidakAdaDiTms + stats.totalDuplikatJo + stats.totalSudahDibayar}</span> Job Order yang diputuskan <strong className="text-rose-400">DITOLAK</strong> karena tidak sesuai kepatuhan dasar finansial. Silakan audit selengkapnya di <span className="text-indigo-400 hover:underline cursor-pointer" onClick={() => setActiveTab('exception_report')}>Exception Report</span>.
                  </div>
                </div>

                {/* Database counts and overrides summary */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
                    Profil Dataset Aktif
                  </h3>
                  
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-400">Pengajuan Driver:</span>
                      <span className="font-bold text-slate-200">{pengajuanData.length} Baris</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-400">Database TMS:</span>
                      <span className="font-bold text-slate-200">{tmsData.length} Baris</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-400">Riwayat Bayar:</span>
                      <span className="font-bold text-emerald-450">{sudahDibayarData.length} Baris</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-400">Cost Types Aktif:</span>
                      <span className="font-bold text-indigo-400">{formulas.length} Skema</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('result_verification')}
                    className="w-full text-center py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs font-black rounded transition"
                  >
                    Buka Hasil Validasi →
                  </button>
                </div>
              </div>

              {/* Driver Leader Performance Monitoring Panel */}
              <DriverLeaderMonitoring statsList={driverLeaderStatsList} />
            </div>
          )}

          {/* TAB 2: MAIN VERIFICATION RESULTS */}
          {activeTab === 'result_verification' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl" id="results-table-panel">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                    Hasil Verifikasi & Rekonsiliasi Lapangan
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Uraian komparasi silang berakurasi tinggi antara laporan sopir dan data internal TMS.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => exportValidationResultToExcel(filteredResults)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Ekspor Excel
                  </button>
                </div>
              </div>

              {/* Filters bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850 mb-6 text-xs font-medium" id="verification-filters-bar">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Pencarian Umum</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-550" />
                    </span>
                    <input
                      type="text"
                      className="w-full bg-slate-900 text-slate-200 pl-8 pr-3 py-1 text-xs rounded border border-slate-850 focus:outline-none"
                      placeholder="Cari JO, Plat, Sopir..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Pengaju DL</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={pengajuFilter}
                    onChange={e => setPengajuFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Driver Leader</option>
                    {uniquePengaju.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Customer</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={customerFilter}
                    onChange={e => setCustomerFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Customer</option>
                    {uniqueCustomer.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Division</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={divisionFilter}
                    onChange={e => setDivisionFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Divisi</option>
                    {uniqueDivision.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Status Validasi</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={statusValidasiFilter}
                    onChange={e => setStatusValidasiFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Status Validasi</option>
                    <option value="VALID">VALID</option>
                    <option value="TIDAK ADA DI TMS">TIDAK ADA DI TMS</option>
                    <option value="DATA TMS TIDAK COCOK">DATA TMS TIDAK COCOK</option>
                    <option value="STATUS TMS BELUM CLOSED">STATUS TMS BELUM CLOSED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Status Bayar</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={statusPembayaranFilter}
                    onChange={e => setStatusPembayaranFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Status Bayar</option>
                    <option value="SUDAH DIBAYAR">SUDAH DIBAYAR</option>
                    <option value="BELUM DIBAYAR">BELUM DIBAYAR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Skema Fee</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={skemaFeeFilter}
                    onChange={e => setSkemaFeeFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Skema</option>
                    <option value="DAILY">DAILY</option>
                    <option value="RITASE">RITASE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block text-[10px] uppercase">Keputusan</label>
                  <select
                    className="w-full bg-slate-900 text-slate-200 p-1 rounded border border-slate-850 focus:outline-none text-[11px]"
                    value={decisionFilter}
                    onChange={e => setDecisionFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Keputusan</option>
                    <option value="SIAP DIBAYAR">SIAP DIBAYAR</option>
                    <option value="REVIEW MANUAL">REVIEW MANUAL</option>
                    <option value="TOLAK">TOLAK</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDecisionFilter('ALL');
                      setWorkflowFilter('ALL');
                      setPengajuFilter('ALL');
                      setCustomerFilter('ALL');
                      setDivisionFilter('ALL');
                      setStatusValidasiFilter('ALL');
                      setStatusPembayaranFilter('ALL');
                      setSkemaFeeFilter('ALL');
                    }}
                    className="w-full py-1 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 font-bold rounded border border-slate-850 transition text-[10px] uppercase tracking-wide"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* Verified Results Table */}
              {currentPage > totalPages && currentPage > 1 && setCurrentPage(1)}
              {filteredResults.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-lg text-center font-mono">
                  <HelpIcon className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <h3 className="text-xs font-semibold text-slate-400">Tidak ada pengajuan tervalidasi</h3>
                  <p className="text-[10px] text-slate-550 mt-1">
                    Silakan sesuaikan filter pencarian atau pastikan berkas data lapangan telah diunggah & diproses.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                          <th className="py-3 px-4">Pengaju</th>
                          <th className="py-3 px-4">JO No</th>
                          <th className="py-3 px-4">Identitas Driver</th>
                          <th className="py-3 px-4">Plat Kendaraan</th>
                          <th className="py-3 px-4">Sub Division</th>
                          <th className="py-3 px-4 text-right">Fee Pengajuan</th>
                          <th className="py-3 px-4 text-right">Fee Hitung</th>
                          <th className="py-3 px-4">Keputusan</th>
                          <th className="py-3 px-4">Workflow</th>
                          <th className="py-3 px-4 text-center font-bold">Aksi (Investigasi)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {paginatedResults.map((row) => {
                          let decisionClass = 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40';
                          if (row.keputusanSistem === 'REVIEW MANUAL') {
                            decisionClass = 'text-amber-400 bg-amber-950/30 border-amber-900/40';
                          } else if (row.keputusanSistem === 'TOLAK') {
                            decisionClass = 'text-rose-400 bg-rose-950/30 border-rose-900/40';
                          }

                          let workflowStyle = 'bg-slate-950 text-slate-400';
                          if (row.statusWorkflow === 'PAID') workflowStyle = 'bg-blue-950 text-blue-400 border border-blue-900/30';
                          if (row.statusWorkflow === 'APPROVED') workflowStyle = 'bg-emerald-950 text-emerald-400 border border-emerald-900/30';
                          if (row.statusWorkflow === 'REVIEW') workflowStyle = 'bg-amber-950 text-amber-400 border border-amber-900/30';

                          return (
                            <tr 
                              key={`${row.jobOrderNo}-${row.crewIdPengajuan}`} 
                              id={`row-verification-entry-${row.jobOrderNo}-${row.crewIdPengajuan}`}
                              className="hover:bg-slate-900/50 transition-colors duration-100 group"
                            >
                              <td className="py-3 px-4 font-mono font-black text-rose-400 uppercase text-[10px]">
                                {row.pengaju}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                {row.jobOrderNo}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-300">{row.namaDriverPengajuan}</div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>ID: {row.crewIdPengajuan}</span>
                                  <span className={`text-[8px] uppercase tracking-wide px-1.5 py-0.2 rounded font-sans border ${
                                    row.skemaFee === 'DAILY' 
                                      ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' 
                                      : 'bg-slate-950/40 text-slate-400 border-slate-800'
                                  }`}>
                                    {row.skemaFee || 'DAILY'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-medium text-slate-300">
                                {row.platNoPengajuan}
                              </td>
                              <td className="py-3 px-4 max-w-xs truncate font-medium">
                                <div className="font-semibold text-slate-300 truncate">{row.subDivisionPengajuan}</div>
                                <div className="text-[10px] text-slate-500 truncate">{row.customerPengajuan}</div>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                                {formatRupiah(row.feeUmkPengajuan)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-400">
                                <div className="font-bold">{formatRupiah(row.feeHitungUlang)}</div>
                                {row.skemaFee === 'DAILY' && (
                                  <div className="text-[9px] text-indigo-400 font-sans mt-0.5 leading-tight">
                                    Alokasi ({row.totalJoDalamGroupDaily} JO)
                                    <div className="text-slate-500 font-mono text-[8px]">Harian: {formatRupiah(row.feeHarianDaily)}</div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${decisionClass}`}>
                                  {row.keputusanSistem}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${workflowStyle}`}>
                                  {row.statusWorkflow}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => setSelectedJo(`${row.jobOrderNo}-${row.crewIdPengajuan}`)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 transition"
                                >
                                  Detil Audit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control footer */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-800">
                      <span className="text-slate-500">
                        Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredResults.length)} dari {filteredResults.length} data.
                      </span>

                      <div className="flex items-center gap-1 font-mono">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1 bg-slate-950 rounded border border-slate-800 text-slate-350">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXCEPTION REPORT */}
          {activeTab === 'exception_report' && (
            <ExceptionReport 
              results={validationResults} 
              onSelectJo={(jo) => {
                setSelectedJo(jo);
                // Kita biarkan tab tetap exception report, hanya tampilkan investigasi drawer
              }} 
            />
          )}

          {/* TAB 4: FILE PENGAJUAN Uploader */}
          {activeTab === 'pengajuan' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5" id="pengajuan-uploader-canvas">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                    <Upload className="w-5 h-5 text-indigo-400" />
                    Manajemen File Pengajuan Driver Leader
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Unggah lembar laporan biaya pengikut jalan hasil rekap koordinator Driver Leader.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadTemplate('pengajuan')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/35 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/60 text-xs rounded transition font-semibold"
                    title="Unduh file Excel template pengisian Driver Leader"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template
                  </button>
                  <button
                    onClick={() => handleResetToMock('pengajuan')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs rounded transition"
                  >
                    Reset Data Demo
                  </button>
                  <button
                    onClick={() => handleClearData('pengajuan')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-954/30 hover:bg-rose-950 text-rose-400 border border-rose-900 text-xs rounded transition font-semibold"
                  >
                    Kosongkan Berkas
                  </button>
                </div>
              </div>

              {/* Drag Canvas */}
              <div
                onDragEnter={(e) => handleDrag(e, 'pengajuan', true)}
                onDragOver={(e) => handleDrag(e, 'pengajuan', true)}
                onDragLeave={(e) => handleDrag(e, 'pengajuan', false)}
                onDrop={(e) => handleDrop(e, 'pengajuan')}
                onClick={() => document.getElementById('file-upload-pengajuan')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragActive.pengajuan ? 'border-indigo-500 bg-indigo-950/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900/60'
                }`}
              >
                <input
                  id="file-upload-pengajuan"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      parseExcelFile(e.target.files[0], 'pengajuan');
                    }
                  }}
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Pilih / seret berkas Pengajuan ke sini</p>
                <p className="text-[10px] text-slate-550 mt-1">Tipe berkas: .xlsx, .xls, .csv</p>
              </div>

              {/* Parsed list summary */}
              {pengajuanData.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Data Pengajuan Driver Terdaftar ({pengajuanData.length} records)
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-80 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold font-mono">
                          <th className="py-2.5 px-3">Pengaju</th>
                          <th className="py-2.5 px-3">JO No</th>
                          <th className="py-2.5 px-3">Crew ID</th>
                          <th className="py-2.5 px-3">Nama Driver</th>
                          <th className="py-2.5 px-3 font-mono">No Plat</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Cost Type</th>
                          <th className="py-2.5 px-3 text-right">Fee Pengajuan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                        {pengajuanData.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="py-2.5 px-3 font-mono font-black text-indigo-400 uppercase text-[10px]">{row.pengaju || 'KOSONG'}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{row.jobOrderNo}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{row.crewId}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-300">{row.namaDriver}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">{row.platNo}</td>
                            <td className="py-2.5 px-3 text-slate-400">{row.customer}</td>
                            <td className="py-2.5 px-3 font-mono text-indigo-400 font-medium text-[10px]">{row.costType}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">{formatRupiah(row.feeUmk)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pengajuanData.length > 15 && (
                    <p className="text-[10px] text-slate-500 italic text-right">
                      * Menampilkan 15 records teratas saja dari total {pengajuanData.length}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FILE EXPORT TMS */}
          {activeTab === 'tms' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5" id="tms-uploader-canvas">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                    <Database className="w-5 h-5 text-indigo-400" />
                    Manajemen Ekspor Internal TMS (Transportation Management System)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Unggah berkas rekrutasi JO langsung dari database terpusat TMS perusahaan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadTemplate('tms')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/35 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/60 text-xs rounded transition font-semibold"
                    title="Unduh file Excel template pengisian Dump TMS"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template
                  </button>
                  <button
                    onClick={() => handleResetToMock('tms')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs rounded transition"
                  >
                    Reset Data Demo
                  </button>
                  <button
                    onClick={() => handleClearData('tms')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-954/30 hover:bg-rose-950 text-rose-400 border border-rose-905 text-xs rounded transition font-semibold"
                  >
                    Kosongkan Berkas
                  </button>
                </div>
              </div>

              {/* Drag Canvas */}
              <div
                onDragEnter={(e) => handleDrag(e, 'tms', true)}
                onDragOver={(e) => handleDrag(e, 'tms', true)}
                onDragLeave={(e) => handleDrag(e, 'tms', false)}
                onDrop={(e) => handleDrop(e, 'tms')}
                onClick={() => document.getElementById('file-upload-tms')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragActive.tms ? 'border-indigo-500 bg-indigo-950/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900/60'
                }`}
              >
                <input
                  id="file-upload-tms"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      parseExcelFile(e.target.files[0], 'tms');
                    }
                  }}
                />
                <Database className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Pilih / seret berkas Ekspor TMS ke sini</p>
                <p className="text-[10px] text-slate-550 mt-1">Tipe berkas: .xlsx, .xls, .csv</p>
              </div>

              {/* Parsed list summary */}
              {tmsData.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Dump TMS Terdaftar ({tmsData.length} records)
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-80 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold font-mono">
                          <th className="py-2.5 px-3">JO No</th>
                          <th className="py-2.5 px-3">Crew ID</th>
                          <th className="py-2.5 px-3">Nama Driver</th>
                          <th className="py-2.5 px-3">Status JO</th>
                          <th className="py-2.5 px-3">ETA</th>
                          <th className="py-2.5 px-3">Plat No</th>
                          <th className="py-2.5 px-3">Customer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                        {tmsData.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{row.jobOrderNo}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{row.crewId}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-300">{row.namaDriver}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${row.jobOrderStatus.toUpperCase() === 'CLOSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950 text-amber-400 border border-amber-900/40'}`}>
                                {row.jobOrderStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{row.eta}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">{row.platNo}</td>
                            <td className="py-2.5 px-3 text-slate-400">{row.customer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {tmsData.length > 15 && (
                    <p className="text-[10px] text-slate-500 italic text-right">
                      * Menampilkan 15 records teratas saja dari total {tmsData.length}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: IMPORT PAID DATABASE */}
          {activeTab === 'paid_database' && (
            <ImportPaidFiles 
              onImportSuccess={handleImportPaidSuccess}
              currentPaidCount={sudahDibayarData.length}
              onResetToMock={() => {
                setSudahDibayarData(MOCK_JO_SUDAH_DIBAYAR);
                writeLog('Pilih Ulang Data Demo Pembayaran', '-', '-', 'MOCK');
              }}
              onClearAll={() => {
                setSudahDibayarData([]);
                writeLog('Bersihkan Database Pembayaran', '-', '-', 'KOSONG');
              }}
            />
          )}

          {/* TAB 7: MASTER FORMULA ENGINE Panel */}
          {activeTab === 'formulas' && (
            <FormulaEngineView 
              formulas={formulas}
              onAddFormula={handleAddFormula}
              onDeleteFormula={handleDeleteFormula}
            />
          )}

          {/* TAB 7.5: MASTER UMK CONFIG Panel */}
          {activeTab === 'umk_master' && (
            <MasterUmkView 
              masterUmkList={masterUmkList}
              onSetMasterUmkList={setMasterUmkList}
              onWriteLog={writeLog}
            />
          )}

          {/* TAB 8: AUDIT TRAIL VIEW Panel */}
          {activeTab === 'audit_trail' && (
            <AuditTrailView 
              auditLogs={auditLogs}
              onClearLogs={() => {
                setAuditLogs([
                  {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toLocaleString('id-ID'),
                    user: currentUser,
                    aktivitas: 'Logs Dihapus (Reset Manual)',
                    jobOrderNo: '-',
                    statusLama: '-',
                    statusBaru: 'AKTIF'
                  }
                ]);
              }}
            />
          )}

          {/* TAB 9: GOOGLE SHEETS & SYSTEM DEPLOYMENT */}
          {activeTab === 'apps_script' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6" id="apps-script-panel">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Integrasi Google Sheets & Apps Script Produksi
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Arsitektur Enterprise: Gunakan sistem ini sebagai portal verifikasi utama langsung tersinkronisasi ke Google Sheets Anda sebagai database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    Langkah-langkah Integrasi (5 Menit)
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-400">
                    <li>Buat Spreadsheet Google Baru dengan setidaknya sheet bernama <strong className="text-indigo-400">JO_SUDAH_DIBAYAR</strong>.</li>
                    <li>Di tab Spreadsheet Anda, klik <strong className="text-slate-350">Ekstensi &rarr; Apps Script</strong>.</li>
                    <li>Salin seluruh kode <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-xs text-indigo-400">Code.gs</code> di sebelah kanan dan tempel di editor script Anda.</li>
                    <li>Klik <strong className="text-slate-350">Terapkan &rarr; Penerapan Baru</strong>, pilih jenis <strong className="text-slate-350">Aplikasi Web</strong>, dan setel hak akses ke <strong className="text-indigo-455">Siapa saja (Anyone)</strong>.</li>
                    <li>Salin URL Aplikasi Web yang dihasilkan ke formulir integrasi untuk sinkronisasi cloud real-time.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    Keamanan & Perlindungan Siber
                  </h3>
                  <div className="text-slate-400 leading-relaxed space-y-2">
                    <p>
                      <strong>Proteksi Biaya Ganda:</strong> Kode Apps Script membawa pengecekan atomik yang mencegah satu Job Order disimpan ganda di database pembayaran Spreadsheet Anda.
                    </p>
                    <p>
                      <strong>Kecepatan & Ringkas:</strong> Sistem menggunakan formula roundup dinamis <span className="text-indigo-400 underline font-semibold">ROUNDUP((UMK/HK)*Durasi,-3)</span> yang langsung berjalan di sisi Google Server, membebaskan beban local browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code.gs copy interface */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-300 font-mono">Code.gs (Google Apps Script Engine)</span>
                  <button
                    onClick={() => copyToClipboard(APPS_SCRIPT_CODE_GS, 'gs')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-650 hover:bg-indigo-650 text-slate-100 font-bold rounded text-[10px]"
                  >
                    {copiedGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedGs ? 'Tersalin' : 'Salin Kode Script'}
                  </button>
                </div>
                <div className="relative overflow-hidden rounded-lg border border-slate-900 max-h-52 overflow-y-auto bg-slate-900/50">
                  <pre className="p-3 text-[10px] font-mono leading-normal text-slate-400">
                    {APPS_SCRIPT_CODE_GS}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Embedded style sheets slide in */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-pulse-subtle {
          animation: pulseSubtle 2.5s infinite;
        }
        @keyframes pulseSubtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .blink-border {
          animation: redBlinkBorder 1.5s infinite;
        }
        @keyframes redBlinkBorder {
          0%, 100% { border-color: rgba(220, 38, 38, 0.4); }
          50% { border-color: rgba(220, 38, 38, 0.9); }
        }
      `}</style>

      {/* Investigation Details Side Drawer */}
      {selectedJo && (
        <InvestigationDetailPanel 
          joNo={selectedJo}
          results={validationResults}
          onClose={() => setSelectedJo(null)}
          onUpdateWorkflowStatus={handleUpdateWorkflowStatus}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
