export interface PengajuanRow {
  pengaju: string;
  jobOrderNo: string;
  crewId: string;
  namaDriver: string;
  division: string;
  jobOrderStatus: string;
  eta: string;
  orderType: string;
  fleetType: string;
  platNo: string;
  subDivision: string;
  homebase: string;
  customer: string;
  durasiPerjalanan: number;
  costType: string;
  jenisHariKerja: number;
  kotaUmk: string;
  nilaiUmk: number;
  feeUmk: number;
  skemaFee?: 'DAILY' | 'RITASE';
  statusWorkflow?: 'DRAFT' | 'VALIDATED' | 'REVIEW' | 'APPROVED' | 'PAID';
}

export interface TmsRow {
  jobOrderNo: string;
  crewId: string;
  namaDriver: string;
  division: string;
  jobOrderStatus: string;
  eta: string;
  orderType: string;
  fleetType: string;
  platNo: string;
  subDivision: string;
  customer: string;
}

export interface AlreadyPaidRow {
  jobOrderNo: string;
  tanggalBayar: string;
  periodeBayar: string;
  crewId: string;
  namaDriver: string;
  nominalDibayar: number;
  batchPembayaran: string;
  keterangan: string;
}

export interface ValidationResult {
  tanggalProses: string;
  pengaju: string;
  jobOrderNo: string;
  // Pengajuan and TMS detail pairs
  crewIdPengajuan: string;
  crewIdTms: string;
  namaDriverPengajuan: string;
  namaDriverTms: string;
  divisionPengajuan: string;
  divisionTms: string;
  jobOrderStatusPengajuan: string;
  jobOrderStatusTms: string;
  etaPengajuan: string;
  etaTms: string;
  orderTypePengajuan: string;
  orderTypeTms: string;
  fleetTypePengajuan: string;
  fleetTypeTms: string;
  platNoPengajuan: string;
  platNoTms: string;
  subDivisionPengajuan: string;
  subDivisionTms: string;
  customerPengajuan: string;
  customerTms: string;
  // Others
  homebase: string;
  durasiPerjalanan: number;
  costType: string;
  jenisHariKerja: number;
  kotaUmk: string;
  nilaiUmk: number;
  feeUmkPengajuan: number;
  feeHitungUlang: number;
  selisihFee: number;
  skemaFee: 'DAILY' | 'RITASE';
  totalJoDalamGroupDaily: number;
  feeHarianDaily: number;
  feeAlokasiPerJo: number;
  dailyUmkTertinggi?: number;
  dailyHkTerpilih?: number;
  dailyFeeGroup?: number;
  // Validation status fields
  statusValidasiTms: 'VALID' | 'TIDAK ADA DI TMS' | 'DATA TMS TIDAK COCOK' | 'STATUS TMS BELUM CLOSED';
  statusFee: 'FEE SESUAI' | 'FEE LEBIH' | 'FEE KURANG';
  statusPembayaran: 'SUDAH DIBAYAR' | 'BELUM DIBAYAR';
  warningDuplikat: 'DUPLIKAT JO DI PENGAJUAN' | '-';
  keteranganError: string;
  
  // High Priority Upgrades
  keputusanSistem: 'SIAP DIBAYAR' | 'REVIEW MANUAL' | 'TOLAK';
  alasanKeputusan: string;
  statusWorkflow: 'DRAFT' | 'VALIDATED' | 'REVIEW' | 'APPROVED' | 'PAID';
}

export interface DashboardStats {
  totalPengajuan: number;
  totalValid: number;
  totalTidakAdaDiTms: number;
  totalDataTidakCocok: number;
  totalBelumClosed: number;
  totalSudahDibayar: number;
  totalFeeSesuai: number;
  totalFeeKurang: number;
  totalFeeLebih: number;
  totalDuplikatJo: number;
  
  // Financial metrics
  totalNominalPengajuan: number;
  totalNominalValid: number;
  totalNominalReviewManual: number;
  totalNominalDitolak: number;
  totalNominalSudahDibayar: number;
  potensiDoublePayment: number;
  potensiSelisihFee: number;
  rataRataFeePerJo: number;
}

export interface DriverLeaderStats {
  pengaju: string;
  totalJoDiajukan: number;
  totalJoValid: number;
  totalJoReviewManual: number;
  totalJoDitolak: number;
  totalJoSudahDibayar: number;
  totalJoTidakAdaDiTms: number;
  totalJoDuplikat: number;
  totalNominalPengajuan: number;
  totalNominalValid: number;
  totalNominalBermasalah: number;
  akurasi: number; // percentage (0 - 100)
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  user: string;
  aktivitas: string;
  jobOrderNo: string;
  statusLama: string;
  statusBaru: string;
}

export interface CostTypeFormula {
  costType: string;
  formulaName: string;
  formulaExpression: string; // e.g. "ROUNDUP((UMK / HK) * Durasi, -3)" or custom text formulas
  type: 'formula' | 'route' | 'manual' | 'custom';
  description: string;
}

export interface MasterUmkMapping {
  id: string;
  division: string;
  subDivision: string;
  skema: 'Daily' | 'Ritase';
  kotaUmk: string;
  nilaiUmk: number;
}

