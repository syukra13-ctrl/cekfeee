import { PengajuanRow, TmsRow, AlreadyPaidRow, ValidationResult, DashboardStats, CostTypeFormula, DriverLeaderStats, MasterUmkMapping } from '../types';

// Normalize customer/route strings for resilient substring & fuzzy containment matching
export function cleanSubDiv(str: string): string {
  return String(str || '')
    .toUpperCase()
    .replace(/(PT|CV|TBK|PERSERO|CO|LTD)\.?\s+/gi, '') // remove company qualifiers
    .replace(/[^A-Z0-9]/g, '') // strip all spaces and punctuation
    .trim();
}

// Default UMK Area - Customer mappings containing exact 2026 data provided
export const DEFAULT_UMK_MAPPINGS: MasterUmkMapping[] = [
  { id: 'umk-1', division: 'JABAR 1', subDivision: 'ANTERAJA - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-2', division: 'JABAR 1', subDivision: 'MAYORA - CICALENGKA', skema: 'Ritase', kotaUmk: 'KAB BANDUNG', nilaiUmk: 3807414 },
  { id: 'umk-3', division: 'JABAR 1', subDivision: 'MAYORA - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-4', division: 'JABAR 1', subDivision: 'ANTERAJA - CIREBON', skema: 'Daily', kotaUmk: 'KOTA CIREBON', nilaiUmk: 2747004 },
  { id: 'umk-5', division: 'JABAR 1', subDivision: 'ANTERAJA - TASIKMALAYA', skema: 'Daily', kotaUmk: 'KOTA TASIKMALAYA', nilaiUmk: 2848397 },
  { id: 'umk-6', division: 'JABAR 1', subDivision: 'AOP - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-7', division: 'JABAR 1', subDivision: 'JNE - TASIKMALAYA', skema: 'Daily', kotaUmk: 'KOTA TASIKMALAYA', nilaiUmk: 2848397 },
  { id: 'umk-8', division: 'JABAR 1', subDivision: 'COLDSPACE - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-9', division: 'JABAR 1', subDivision: 'APL - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-10', division: 'JABAR 1', subDivision: 'ASTA001 - JNE', skema: 'Daily', kotaUmk: 'KOTA TASIKMALAYA', nilaiUmk: 2848397 },
  { id: 'umk-11', division: 'JABAR 2', subDivision: 'HMS - KARAWANG', skema: 'Daily', kotaUmk: 'KAB KARAWANG', nilaiUmk: 5657784 },
  { id: 'umk-12', division: 'JABAR 2', subDivision: 'ANTERAJA - KARAWANG', skema: 'Daily', kotaUmk: 'KAB KARAWANG', nilaiUmk: 5657784 },
  { id: 'umk-13', division: 'JABAR 2', subDivision: 'PUNINAR - KARAWANG', skema: 'Daily', kotaUmk: 'KAB KARAWANG', nilaiUmk: 5657784 },
  { id: 'umk-14', division: 'JABAR 2', subDivision: 'APL - CIKARANG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-15', division: 'JABAR 2', subDivision: 'DEKORUMA - CIKARANG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-16', division: 'JABAR 2', subDivision: 'AOP - CIBITUNG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-17', division: 'JABAR 2', subDivision: 'TFJ - CIAWI', skema: 'Ritase', kotaUmk: 'KAB BOGOR', nilaiUmk: 4945073 },
  { id: 'umk-18', division: 'JABAR 2', subDivision: 'COCA COLA - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-19', division: 'JABAR 2', subDivision: 'SOSRO - CIBITUNG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-20', division: 'JABODETABA', subDivision: 'ANTERAJA - SERANG', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-21', division: 'JABODETABA', subDivision: 'CIRCLE K - CAKUNG', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-22', division: 'JABODETABA', subDivision: 'INDORAYA - BOGOR', skema: 'Daily', kotaUmk: 'KAB BOGOR', nilaiUmk: 4945073 },
  { id: 'umk-23', division: 'JABODETABA', subDivision: 'GMI-CIKOKOL', skema: 'Daily', kotaUmk: 'KOTA TANGERANG', nilaiUmk: 5157202 },
  { id: 'umk-24', division: 'JABODETABA', subDivision: 'MAYORA - CIAWI', skema: 'Daily', kotaUmk: 'KOTA BOGOR', nilaiUmk: 5203823 },
  { id: 'umk-25', division: 'JABODETABA', subDivision: 'ANTERAJA - SUKABUMI', skema: 'Daily', kotaUmk: 'KAB SUKABUMI', nilaiUmk: 3663207 },
  { id: 'umk-26', division: 'JABODETABA', subDivision: 'APL - JAKARTA', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-27', division: 'JABODETABA', subDivision: 'INDORAYA - PANCORAN', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-28', division: 'JABODETABA', subDivision: 'AOP - SERANG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-29', division: 'JABODETABA', subDivision: 'MAYORA - BALARAJA', skema: 'Daily', kotaUmk: 'KOTA TANGERANG', nilaiUmk: 5157202 },
  { id: 'umk-30', division: 'JABODETABA', subDivision: 'APL - TANGERANG', skema: 'Daily', kotaUmk: 'KOTA TANGERANG', nilaiUmk: 5157202 },
  { id: 'umk-31', division: 'JABODETABA', subDivision: 'MAYORA MT - BALARAJA', skema: 'Daily', kotaUmk: 'KOTA TANGERANG', nilaiUmk: 5157202 },
  { id: 'umk-32', division: 'JAKARTA', subDivision: 'JNE - POGLAR', skema: 'Daily', kotaUmk: 'DKI JAKARTA JNE', nilaiUmk: 5396761 },
  { id: 'umk-33', division: 'JAKARTA', subDivision: 'JNE - PULOGADUNG', skema: 'Daily', kotaUmk: 'DKI JAKARTA JNE', nilaiUmk: 5396761 },
  { id: 'umk-34', division: 'JAKARTA', subDivision: 'JNE - VETERAN', skema: 'Daily', kotaUmk: 'DKI JAKARTA JNE', nilaiUmk: 5396761 },
  { id: 'umk-35', division: 'JAKARTA', subDivision: 'JNE - SUNTER', skema: 'Daily', kotaUmk: 'DKI JAKARTA JNE', nilaiUmk: 5396761 },
  { id: 'umk-36', division: 'JAKARTA', subDivision: 'JNE - GARUDA', skema: 'Daily', kotaUmk: 'DKI JAKARTA JNE', nilaiUmk: 5396761 },
  { id: 'umk-37', division: 'JAKARTA', subDivision: 'ANTERAJA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-38', division: 'JAKARTA', subDivision: 'ANTERAJA - SUNTER', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-39', division: 'JAKARTA', subDivision: 'JNE - PONPIN', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-40', division: 'JAKARTA', subDivision: 'TWS - TANGERANG', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-41', division: 'JATENG 1', subDivision: 'ANTERAJA - SEMARANG', skema: 'Daily', kotaUmk: 'KOTA SEMARANG', nilaiUmk: 3525554 },
  { id: 'umk-42', division: 'JATENG 1', subDivision: 'ANTERAJA - TEGAL', skema: 'Daily', kotaUmk: 'KOTA TEGAL', nilaiUmk: 2415333 },
  { id: 'umk-43', division: 'JATENG 1', subDivision: 'AOP - SEMARANG', skema: 'Daily', kotaUmk: 'KOTA SEMARANG', nilaiUmk: 3525554 },
  { id: 'umk-44', division: 'JATENG 1', subDivision: 'ANTERAJA - KUDUS', skema: 'Daily', kotaUmk: 'KAB KUDUS', nilaiUmk: 2708636 },
  { id: 'umk-45', division: 'JATENG 1', subDivision: 'BAT - JEPARA', skema: 'Daily', kotaUmk: 'KAB JEPARA', nilaiUmk: 2643535 },
  { id: 'umk-46', division: 'JATENG 1', subDivision: 'VCP - HMS REMBANG', skema: 'Daily', kotaUmk: 'KAB PATI', nilaiUmk: 2373088 },
  { id: 'umk-47', division: 'JATENG 1', subDivision: 'BBI - PEKALONGAN', skema: 'Daily', kotaUmk: 'KAB PEKALONGAN', nilaiUmk: 2584198 },
  { id: 'umk-48', division: 'JATENG 1', subDivision: 'TRS - TEGAL', skema: 'Daily', kotaUmk: 'KOTA TEGAL', nilaiUmk: 2415333 },
  { id: 'umk-49', division: 'JATENG 2', subDivision: 'HMS - SURAKARTA', skema: 'Daily', kotaUmk: 'KOTA SURAKARTA', nilaiUmk: 2456408 },
  { id: 'umk-50', division: 'JATENG 2', subDivision: 'ANTERAJA - YOGYAKARTA', skema: 'Daily', kotaUmk: 'KOTA YOGYAKARTA', nilaiUmk: 2700806 },
  { id: 'umk-51', division: 'JATENG 2', subDivision: 'ANTERAJA - SOLO', skema: 'Daily', kotaUmk: 'KOTA SURAKARTA', nilaiUmk: 2456408 },
  { id: 'umk-52', division: 'JATENG 2', subDivision: 'ANTERAJA - PURWOKERTO', skema: 'Daily', kotaUmk: 'KOTA PURWOKERTO', nilaiUmk: 2370824 },
  { id: 'umk-53', division: 'JATENG 2', subDivision: 'AOP - PURWOKERTO', skema: 'Daily', kotaUmk: 'KOTA PURWOKERTO', nilaiUmk: 2370824 },
  { id: 'umk-54', division: 'JATENG 2', subDivision: 'APL - YOGYAKARTA', skema: 'Daily', kotaUmk: 'KOTA YOGYAKARTA', nilaiUmk: 2700806 },
  { id: 'umk-55', division: 'JATENG 2', subDivision: 'JTI - YOGYAKARTA', skema: 'Daily', kotaUmk: 'KOTA YOGYAKARTA', nilaiUmk: 2700806 },
  { id: 'umk-56', division: 'JATENG 2', subDivision: 'HMS - SALATIGA REE', skema: 'Daily', kotaUmk: 'KOTA SALATIGA', nilaiUmk: 2584262 },
  { id: 'umk-57', division: 'JATENG 2', subDivision: 'HMS - SURAKARTA REE', skema: 'Daily', kotaUmk: 'KOTA SURAKARTA', nilaiUmk: 2456408 },
  { id: 'umk-58', division: 'JATIM 1', subDivision: 'ANTERAJA - SURABAYA', skema: 'Daily', kotaUmk: 'KOTA SURABAYA', nilaiUmk: 5066206 },
  { id: 'umk-59', division: 'JATIM 1', subDivision: 'MAYORA - SURABAYA', skema: 'Daily', kotaUmk: 'KOTA SURABAYA', nilaiUmk: 5066206 },
  { id: 'umk-60', division: 'JATIM 1', subDivision: 'DEKORUMA - SURABAYA', skema: 'Daily', kotaUmk: 'KOTA SURABAYA', nilaiUmk: 5066206 },
  { id: 'umk-61', division: 'JATIM 1', subDivision: 'AOP - SIDOARJO', skema: 'Daily', kotaUmk: 'KAB SIDOARJO', nilaiUmk: 4973044 },
  { id: 'umk-62', division: 'JATIM 1', subDivision: 'ANTERAJA - LAMONGAN', skema: 'Daily', kotaUmk: 'KAB LAMONGAN', nilaiUmk: 3058286 },
  { id: 'umk-63', division: 'JATIM 1', subDivision: 'APL - SURABAYA', skema: 'Daily', kotaUmk: 'KOTA SURABAYA', nilaiUmk: 5066206 },
  { id: 'umk-64', division: 'JATIM 1', subDivision: 'ANTERAJA - MADURA', skema: 'Daily', kotaUmk: 'KAB PAMEKASAN', nilaiUmk: 2407606 },
  { id: 'umk-65', division: 'JATIM 2', subDivision: 'ANTERAJA - KEDIRI', skema: 'Daily', kotaUmk: 'KOTA KEDIRI', nilaiUmk: 2618334 },
  { id: 'umk-66', division: 'JATIM 2', subDivision: 'ANTERAJA - MALANG', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-67', division: 'JATIM 2', subDivision: 'ANTERAJA - JEMBER', skema: 'Daily', kotaUmk: 'KAB JEMBER', nilaiUmk: 2882107 },
  { id: 'umk-68', division: 'JATIM 2', subDivision: 'PUNINAR - PASURUAN', skema: 'Daily', kotaUmk: 'KAB PASURUAN', nilaiUmk: 4969347 },
  { id: 'umk-69', division: 'JATIM 2', subDivision: 'ANTERAJA - MADIUN', skema: 'Daily', kotaUmk: 'KOTA MADIUN', nilaiUmk: 2468493 },
  { id: 'umk-70', division: 'JATIM 2', subDivision: 'NESTLE - GEMPOL', skema: 'Daily', kotaUmk: 'KAB PASURUAN', nilaiUmk: 4969347 },
  { id: 'umk-71', division: 'JATIM 2', subDivision: 'BAT - MALANG', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-72', division: 'JATIM 2', subDivision: 'GACOAN - MALANG', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-73', division: 'JATIM 2', subDivision: 'VCP HMS SUKOREJO', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-74', division: 'JATIM 2', subDivision: 'AOP - JEMBER', skema: 'Daily', kotaUmk: 'KAB JEMBER', nilaiUmk: 2882107 },
  { id: 'umk-75', division: 'JATIM 2', subDivision: 'KT&G JOMBANG', skema: 'Daily', kotaUmk: 'KAB JOMBANG', nilaiUmk: 3228887 },
  { id: 'umk-76', division: 'JATIM 2', subDivision: 'BAT-BDU MALANG', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-77', division: 'JATIM 2', subDivision: 'ULTRAJAYA - MALANG', skema: 'Daily', kotaUmk: 'KOTA MALANG', nilaiUmk: 3568376 },
  { id: 'umk-78', division: 'JATIM 2', subDivision: 'HFMI MOJOKERTO', skema: 'Daily', kotaUmk: 'KAB MOJOKERTO', nilaiUmk: 4958254 },
  { id: 'umk-79', division: 'JATIM 2', subDivision: 'SINAR SOSRO MOJOKERTO', skema: 'Daily', kotaUmk: 'KAB MOJOKERTO', nilaiUmk: 4958254 },
  { id: 'umk-80', division: 'KAL 1', subDivision: 'SAT - BANJARMASIN', skema: 'Daily', kotaUmk: 'KOTA BANJARMASIN', nilaiUmk: 3672622 },
  { id: 'umk-81', division: 'KAL 1', subDivision: 'SAT - PALANGKARAYA', skema: 'Daily', kotaUmk: 'KOTA PALANGKARAYA', nilaiUmk: 3571128 },
  { id: 'umk-82', division: 'KAL 1', subDivision: 'ANTERAJA - PONTIANAK', skema: 'Daily', kotaUmk: 'KOTA PONTIANAK', nilaiUmk: 3068867 },
  { id: 'umk-83', division: 'KAL 1', subDivision: 'ANTERAJA - BANJARMASIN', skema: 'Daily', kotaUmk: 'KOTA BANJARMASIN', nilaiUmk: 3672622 },
  { id: 'umk-84', division: 'KAL 1', subDivision: 'ADARO - BANJARMASIN', skema: 'Daily', kotaUmk: 'KOTA BANJARMASIN', nilaiUmk: 3672622 },
  { id: 'umk-85', division: 'KAL 2', subDivision: 'INDOMARCO - SAMARINDA', skema: 'Daily', kotaUmk: 'KOTA SAMARINDA', nilaiUmk: 3886571 },
  { id: 'umk-86', division: 'KAL 2', subDivision: 'ANTERAJA - BALIKPAPAN', skema: 'Daily', kotaUmk: 'KOTA BALIKPAPAN', nilaiUmk: 3722623 },
  { id: 'umk-87', division: 'KEPRI', subDivision: 'SAT - BATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-88', division: 'KEPRI', subDivision: 'APL - BATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-89', division: 'KEPRI', subDivision: 'INDOMARCO - BATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-90', division: 'KEPRI', subDivision: 'ANTERAJA - BATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-91', division: 'KTI', subDivision: 'CIRCLE K - CANGGU', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-92', division: 'KTI', subDivision: 'CIRCLE K - MTH', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-93', division: 'KTI', subDivision: 'ANTERAJA - BALI', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-94', division: 'KTI', subDivision: 'COLDSPACE - BALI', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-95', division: 'KTI', subDivision: 'ANTERAJA - MAKASSAR', skema: 'Daily', kotaUmk: 'KOTA MAKASSAR', nilaiUmk: 3955224 },
  { id: 'umk-96', division: 'KTI', subDivision: 'APL - MAKASSAR', skema: 'Daily', kotaUmk: 'KOTA MAKASSAR', nilaiUmk: 3955224 },
  { id: 'umk-97', division: 'KTI', subDivision: 'APL - BALI', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-98', division: 'KTI', subDivision: 'ANTERAJA - MANADO', skema: 'Daily', kotaUmk: 'KOTA MANADO', nilaiUmk: 3864789 },
  { id: 'umk-99', division: 'KTI', subDivision: 'ANTERAJA - KENDARI', skema: 'Daily', kotaUmk: 'KOTA KENDARI', nilaiUmk: 3364658 },
  { id: 'umk-100', division: 'KTI', subDivision: 'ANTERAJA - PALU', skema: 'Daily', kotaUmk: 'KOTA PALU', nilaiUmk: 3451243 },
  { id: 'umk-101', division: 'SUMBAGSEL', subDivision: 'ANTERAJA - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-102', division: 'SUMBAGSEL', subDivision: 'KINO - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-103', division: 'SUMBAGSEL', subDivision: 'J&T CARGO - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-104', division: 'SUMBAGSEL', subDivision: 'INDOPAKET - LAMPUNG', skema: 'Daily', kotaUmk: 'KOTA BANDAR LAMPUNG', nilaiUmk: 3348194 },
  { id: 'umk-105', division: 'SUMBAGSEL', subDivision: 'ANTERAJA - LAMPUNG', skema: 'Daily', kotaUmk: 'KOTA BANDAR LAMPUNG', nilaiUmk: 3348194 },
  { id: 'umk-106', division: 'SUMBAGSEL', subDivision: 'APL - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-107', division: 'SUMBAGSEL', subDivision: 'APL - LAMPUNG', skema: 'Daily', kotaUmk: 'KOTA BANDAR LAMPUNG', nilaiUmk: 3348194 },
  { id: 'umk-108', division: 'SUMBAGSEL', subDivision: 'ANTERAJA - JAMBI', skema: 'Daily', kotaUmk: 'KOTA JAMBI', nilaiUmk: 3683053 },
  { id: 'umk-109', division: 'SUMBAGSEL', subDivision: 'ANTERAJA - BENGKULU', skema: 'Daily', kotaUmk: 'KOTA BENGKULU', nilaiUmk: 2965227 },
  { id: 'umk-110', division: 'SUMBAGUT', subDivision: 'MAYORA - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-111', division: 'SUMBAGUT', subDivision: 'ANTERAJA - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-112', division: 'SUMBAGUT', subDivision: 'Aspirasi Hidup Indonesia - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-113', division: 'SUMBAGUT', subDivision: 'APL - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-114', division: 'SUMBAGUT', subDivision: 'ANTERAJA - PADANG', skema: 'Daily', kotaUmk: 'KOTA PADANG', nilaiUmk: 3042889 },
  { id: 'umk-115', division: 'SUMBAGUT', subDivision: 'HCI - PEKANBARU', skema: 'Daily', kotaUmk: 'KOTA PEKANBARU', nilaiUmk: 3780970 },
  { id: 'umk-116', division: 'SUMBAGUT', subDivision: 'HCI - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-117', division: 'SUMBAGUT', subDivision: 'APL - PEKANBARU', skema: 'Daily', kotaUmk: 'KOTA PEKANBARU', nilaiUmk: 3780970 },
  { id: 'umk-118', division: 'SUMBAGUT', subDivision: 'HCI- ACEH', skema: 'Daily', kotaUmk: 'PROV ACEH', nilaiUmk: 3752848 },
  { id: 'umk-119', division: 'SUMBAGUT', subDivision: 'ANTERAJA - PEKANBARU', skema: 'Daily', kotaUmk: 'KOTA PEKANBARU', nilaiUmk: 3780970 },
  { id: 'umk-120', division: 'SUMBAGUT', subDivision: 'KT&G ACEH', skema: 'Daily', kotaUmk: 'KOTA BANDA ACEH', nilaiUmk: 3752848 },
  { id: 'umk-121', division: 'SUMBAGUT', subDivision: 'INDOPAKET - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-122', division: 'SUMBAGUT', subDivision: 'KINO - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-123', division: 'SUMBAGUT', subDivision: 'NESTLE - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-124', division: 'SUMBAGUT', subDivision: 'SARANA PANCA - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-125', division: 'SUMBAGUT', subDivision: 'VCP HMS - MEDAN 2', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-126', division: 'JABAR 1', subDivision: 'ANTERAJA - PURWAKARTA', skema: 'Daily', kotaUmk: 'KAB BOGOR', nilaiUmk: 4945073 },
  { id: 'umk-127', division: 'JABAR 1', subDivision: 'Regular ULTRAJAYA', skema: 'Ritase', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-128', division: 'JABAR 1', subDivision: 'GACOAN - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-129', division: 'JABAR 1', subDivision: 'ULTRAJAYA - BANDUNG', skema: 'Ritase', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-130', division: 'JABAR 1', subDivision: 'PLANET BAN - BANDUNG', skema: 'Ritase', kotaUmk: 'KAB BANDUNG', nilaiUmk: 3807414 },
  { id: 'umk-131', division: 'JABAR 1', subDivision: 'GACOAN - BANDUNG', skema: 'Ritase', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-132', division: 'JABAR 2', subDivision: 'MAYORA - TAMBUN', skema: 'Ritase', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-133', division: 'JABAR 2', subDivision: 'NESTLE - CIKARANG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-134', division: 'JABAR 2', subDivision: 'MULIA ALDANA - BOGOR', skema: 'Ritase', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-135', division: 'JABAR 2', subDivision: 'NESTLE - CIKARANG', skema: 'Ritase', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-136', division: 'JABAR 2', subDivision: 'MIE GACOAN - CIKARANG', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-137', division: 'JABAR 2', subDivision: 'MIE GACOAN - CIKARANG', skema: 'Ritase', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-138', division: 'JABODETABA', subDivision: 'TWS - JABODETABEK', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-139', division: 'JABODETABA', subDivision: 'INDICO - SUKABUMI', skema: 'Ritase', kotaUmk: 'KOTA BOGOR', nilaiUmk: 5203823 },
  { id: 'umk-140', division: 'JABODETABA', subDivision: 'MULIA ALDANA - BOGOR', skema: 'Ritase', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-141', division: 'JABODETABA', subDivision: 'TFJ - CIAWI', skema: 'Ritase', kotaUmk: 'KOTA BOGOR', nilaiUmk: 5203823 },
  { id: 'umk-142', division: 'JAKARTA', subDivision: 'COLD SPACE - PRIOK', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-143', division: 'JAKARTA', subDivision: 'ERHA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-144', division: 'JAKARTA', subDivision: 'GREENFIELDS - JAKARTA', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-145', division: 'JAKARTA', subDivision: 'HARDCORINDO - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-146', division: 'JAKARTA', subDivision: 'JAGAD JAYA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-147', division: 'JAKARTA', subDivision: 'KEDAI SAYUR - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-148', division: 'JAKARTA', subDivision: 'MAYORA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-149', division: 'JAKARTA', subDivision: 'OKI DOKI - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-150', division: 'JAKARTA', subDivision: 'TITIP AJA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-151', division: 'JAKARTA', subDivision: 'HLM-JNE POGLAR', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-152', division: 'JAKARTA', subDivision: 'HLM-JNE GARUDA KEMAYORAN', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-153', division: 'JAKARTA', subDivision: 'IKEA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-154', division: 'JAKARTA', subDivision: 'TOD - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-155', division: 'JAKARTA', subDivision: 'PROJECT CSR - HLM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-156', division: 'JAKARTA', subDivision: 'GMI - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-157', division: 'JAKARTA', subDivision: 'JNE - POGLAR ANGKE', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-158', division: 'JAKARTA', subDivision: 'MULIA ALDANA - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-159', division: 'JATIM 1', subDivision: 'ERHA - SURABAYA', skema: 'Daily', kotaUmk: 'KOTA SURABAYA', nilaiUmk: 5066206 },
  { id: 'umk-160', division: 'KEPRI', subDivision: 'INDOPAKET - BATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-161', division: 'KEPRI', subDivision: 'VCP - HMS PATAM', skema: 'Daily', kotaUmk: 'KOTA BATAM', nilaiUmk: 5097659 },
  { id: 'umk-162', division: 'SUMBAGSEL', subDivision: 'DEKORUMA - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-163', division: 'SUMBAGSEL', subDivision: 'HCI - LAMPUNG', skema: 'Daily', kotaUmk: 'KOTA BANDAR LAMPUNG', nilaiUmk: 3348194 },
  { id: 'umk-164', division: 'SUMBAGSEL', subDivision: 'HCI - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-165', division: 'SUMBAGSEL', subDivision: 'INDOPAKET - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-166', division: 'SUMBAGSEL', subDivision: 'LMU - PALEMBANG', skema: 'Daily', kotaUmk: 'PALEMBANG', nilaiUmk: 3994976 },
  { id: 'umk-167', division: 'SUMBAGUT', subDivision: 'AHI - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-168', division: 'SUMBAGUT', subDivision: 'VCP - HMS MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-169', division: 'SUMBAGUT', subDivision: 'ASTA - MEDAN', skema: 'Daily', kotaUmk: 'KOTA MEDAN', nilaiUmk: 4113388 },
  { id: 'umk-170', division: 'SUMBAGUT', subDivision: 'DEKORUMA - PADANG', skema: 'Daily', kotaUmk: 'KOTA PEKANBARU', nilaiUmk: 3780970 },
  { id: 'umk-171', division: 'SUMBAGUT', subDivision: 'INDOPAKET - PEKANBARU', skema: 'Daily', kotaUmk: 'KOTA PEKANBARU', nilaiUmk: 3780970 },
  { id: 'umk-172', division: 'JABAR 2', subDivision: 'TFJ - TORABIKA', skema: 'Daily', kotaUmk: 'KAB BEKASI', nilaiUmk: 5663888 },
  { id: 'umk-173', division: 'JABAR 1', subDivision: 'KTNG - CIREBON', skema: 'Daily', kotaUmk: 'KOTA CIREBON', nilaiUmk: 2747004 },
  { id: 'umk-174', division: 'JABAR 1', subDivision: 'KTNG - BANDUNG', skema: 'Daily', kotaUmk: 'KOTA BANDUNG', nilaiUmk: 4541895 },
  { id: 'umk-175', division: 'JAKARTA', subDivision: 'KT&G - HALIM', skema: 'Daily', kotaUmk: 'DKI JAKARTA', nilaiUmk: 5480974 },
  { id: 'umk-176', division: 'JABAR 1', subDivision: 'MAYORA - CIANJUR', skema: 'Ritase', kotaUmk: 'KAB BANDUNG', nilaiUmk: 3807414 },
  { id: 'umk-177', division: 'KTI', subDivision: 'MSV BALI', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-178', division: 'KTI', subDivision: 'DEKORUMA - BALI', skema: 'Daily', kotaUmk: 'KOTA DENPASAR', nilaiUmk: 3348674 },
  { id: 'umk-179', division: 'KTI', subDivision: 'KTNG - MAKASSAR', skema: 'Daily', kotaUmk: 'KOTA MAKASSAR', nilaiUmk: 3955224 }
];

// Resolves UMK rate and HK dynamically from Master list using substring normalizations
export function getUmkAndHkFromMaster(
  row: { division?: string; customer?: string; subDivision?: string; skemaFee?: string; jenisHariKerja?: number; kotaUmk?: string; homebase?: string; nilaiUmk?: number },
  masterList: MasterUmkMapping[] = []
): { nilaiUmk: number; jenisHariKerja: number; skema: 'DAILY' | 'RITASE' } {
  const rowCust = String(row.homebase || row.subDivision || row.customer || '').trim().toUpperCase();
  const rowSkema = String(row.skemaFee || '').trim().toUpperCase();
  const rowHk = parseSafeInt(row.jenisHariKerja, 25);

  const cleanRowCust = cleanSubDiv(rowCust);
  const rowDiv = String(row.division || '').trim().toUpperCase();

  let subMatches: MasterUmkMapping[] = [];

  // Prioritize Master UMK entries under the same division to prevent cross-region incorrect matches
  const sameDivMaster = masterList.filter(m => {
    const mDiv = String(m.division || '').trim().toUpperCase();
    return mDiv === rowDiv || mDiv.includes(rowDiv) || rowDiv.includes(mDiv);
  });

  const candidateList = sameDivMaster.length > 0 ? sameDivMaster : masterList;

  // Search the candidate list by subdivision/route name
  if (cleanRowCust) {
    // 1. Exact match on clean name within candidate list
    subMatches = candidateList.filter(m => {
      const cleanMasterSub = cleanSubDiv(m.subDivision);
      return cleanRowCust === cleanMasterSub;
    });

    // 2. Substring matching fallback within candidate list
    if (subMatches.length === 0) {
      subMatches = candidateList.filter(m => {
        const cleanMasterSub = cleanSubDiv(m.subDivision);
        return cleanRowCust.includes(cleanMasterSub) || cleanMasterSub.includes(cleanRowCust);
      });
    }

    // 3. Global fallback to the full master list if we restricted to division but found absolutely nothing
    if (subMatches.length === 0 && candidateList !== masterList) {
      subMatches = masterList.filter(m => {
        const cleanMasterSub = cleanSubDiv(m.subDivision);
        return cleanRowCust === cleanMasterSub;
      });

      if (subMatches.length === 0) {
        subMatches = masterList.filter(m => {
          const cleanMasterSub = cleanSubDiv(m.subDivision);
          return cleanRowCust.includes(cleanMasterSub) || cleanMasterSub.includes(cleanRowCust);
        });
      }
    }
  }

  if (subMatches.length > 0) {
    // If there are multiple matches, prefer the one matching the row's skema
    if (rowSkema) {
      const skemaMatch = subMatches.find(m => {
        return String(m.skema || '').trim().toUpperCase() === rowSkema;
      });
      if (skemaMatch) {
        return {
          nilaiUmk: skemaMatch.nilaiUmk,
          jenisHariKerja: rowHk,
          skema: (skemaMatch.skema.toUpperCase() === 'RITASE' ? 'RITASE' : 'DAILY') as 'DAILY' | 'RITASE'
        };
      }
    }
    
    // Otherwise, return the first match from candidate list
    const m = subMatches[0];
    return {
      nilaiUmk: m.nilaiUmk,
      jenisHariKerja: rowHk, // HK strictly from the submission
      skema: (m.skema.toUpperCase() === 'RITASE' ? 'RITASE' : 'DAILY') as 'DAILY' | 'RITASE' // Schema from Master list
    };
  }

  // Fallback to basic lookup ONLY when no master mappings matched at all
  const fallbackUmk = lookupUmk(rowCust || row.kotaUmk || row.homebase || '');
  return {
    nilaiUmk: fallbackUmk,
    jenisHariKerja: rowHk,
    skema: (rowSkema === 'RITASE' ? 'RITASE' : 'DAILY') as 'DAILY' | 'RITASE'
  };
}

// Default Master Formulas that can be added/edited by admin at runtime
export const DEFAULT_FORMULAS: CostTypeFormula[] = [
  {
    costType: 'FEE FREELANCE',
    formulaName: 'UMK Roundup',
    formulaExpression: 'ROUNDUP((UMK / HK) * Durasi, -3)',
    type: 'formula',
    description: 'Membulatkan hasil pembagian UMK dengan hari kerja dikali durasi ke seribu terdekat ke atas.'
  },
  {
    costType: 'FEE PENGEMUDI',
    formulaName: 'UMK Roundup',
    formulaExpression: 'ROUNDUP((UMK / HK) * Durasi, -3)',
    type: 'formula',
    description: 'Membulatkan hasil pembagian UMK dengan hari kerja dikali durasi ke seribu terdekat ke atas.'
  },
  {
    costType: 'FEE ROUTE',
    formulaName: 'Rute Flat Rate',
    formulaExpression: '150000',
    type: 'route',
    description: 'Biaya flat per perjalanan berdasarkan ketetapan rute.'
  },
  {
    costType: 'FEE KHUSUS',
    formulaName: 'Manual Input',
    formulaExpression: 'MANUAL',
    type: 'manual',
    description: 'Diinput manual secara ad-hoc oleh tim Driver Management.'
  }
];

// Normalize general text (UPPERCASE, remove punctuation like dot, comma, hyphen, trim, consolidate spaces)
export function normalizeGeneralText(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .toUpperCase()
    .replace(/[\-\.\,]/g, ' ') // Replace dot, comma, hyphen with space to avoid word merging
    .replace(/\s+/g, ' ')       // Consolidate multiple spaces into single space
    .trim();
}

// Normalize plat numbers strictly (UPPERCASE, remove spaces, dots, commas, and hyphens completely)
export function normalizePlat(plat: string): string {
  if (!plat) return '';
  return String(plat)
    .toUpperCase()
    .replace(/[\s\-\.\,]/g, '') // Strip all spaces and delimiters completely
    .trim();
}

// Compare two values after normalisation to avoid false mismatches
export function isMismatchedNormalized(val1: any, val2: any, isPlatNo: boolean = false): boolean {
  if (isPlatNo) {
    return normalizePlat(val1) !== normalizePlat(val2);
  }
  return normalizeGeneralText(val1) !== normalizeGeneralText(val2);
}

// Computes the similarity score (0.0 to 1.0) between two strings using Levenshtein distance
export function getStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeGeneralText(str1);
  const s2 = normalizeGeneralText(str2);
  
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  // Quick sub-string containment boost
  if (s1.includes(s2) || s2.includes(s1)) {
    const ratio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    return Math.min(0.95, ratio * 0.9 + 0.1); // capped at 0.95 to encourage full match visual checks if a short word matches
  }
  
  const m = s1.length;
  const n = s2.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = d[m][n];
  const maxLength = Math.max(m, n);
  return (maxLength - distance) / maxLength;
}

// Helper to compare Route values normally
export function isSubDivisionMismatched(sub1: string, sub2: string): boolean {
  return cleanSubDiv(sub1) !== cleanSubDiv(sub2);
}

// Helper to check if Customer names match, with support for specific corporate equivalents like PT TRI ADI BERSAMA = Anteraja
export function isCustomerMatching(cust1: string, cust2: string): boolean {
  const c1 = normalizeGeneralText(cust1);
  const c2 = normalizeGeneralText(cust2);
  
  if (c1 === c2) return true;
  if (!c1 || !c2) return false;

  // Khusus PT TRI ADI BERSAMA = Anteraja
  const isC1Adi = c1.includes('TRI ADI BERSAMA');
  const isC2Adi = c2.includes('TRI ADI BERSAMA');
  const isC1Anteraja = c1.includes('ANTERAJA');
  const isC2Anteraja = c2.includes('ANTERAJA');

  if ((isC1Adi && isC2Anteraja) || (isC2Adi && isC1Anteraja)) {
    return true;
  }

  const sim = getStringSimilarity(cust1, cust2);
  return sim >= 0.75;
}

// Normalize date strings, supporting both standard date formats and Excel date serial numbers (e.g. 46175, 46176)
export function normalizeDate(dateStr: string | number): string {
  if (dateStr === undefined || dateStr === null) return '';
  const str = String(dateStr).trim();
  if (!str) return '';

  // Check if it's a numeric Excel serial date (e.g., 46175 or 46175.625)
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    // Math.floor strips out the fractional part of the day (the hours, minutes, seconds)
    const integerDay = Math.floor(num);
    // Excel's epoch is Dec 30, 1899 to account for the 1900 leap year bug
    // 25569 is Jan 1, 1970
    const date = new Date(Math.round((integerDay - 25569) * 86400 * 1000));
    // Use UTC methods to prevent timezone shifting
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // For text dates, strip any time portion (after a space or 'T')
  // e.g., "16/06/2026 14:30:00" -> "16/06/2026"
  // e.g., "2026-06-16T14:30:00Z" -> "2026-06-16"
  const datePart = str.split(/[\sT]+/)[0];

  // 1. If it's already in DD/MM/YYYY format with slashes
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(datePart)) {
    const parts = datePart.split('/');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }

  // 2. If in YYYY-MM-DD or YYYY/MM/DD with leading 4-digit year
  const yyyyMmDdMatch = datePart.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (yyyyMmDdMatch) {
    const [, y, m, d] = yyyyMmDdMatch;
    return `${d}/${m}/${y}`;
  }

  // Fallback: replace dashes with slashes and attempt padding
  const replaced = datePart.replace(/[-]/g, '/');
  const genericMatch = replaced.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (genericMatch) {
    const [, d, m, y] = genericMatch;
    const finalYear = y.length === 2 ? `20${y}` : y;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${finalYear}`;
  }

  return replaced;
}

// Map Kota name to standard UMK rates
export function lookupUmk(kota: string): number {
  const k = String(kota || '').trim().toUpperCase();
  if (k.includes('SURABAYA')) return 4525879;
  if (k.includes('SIDOARJO')) return 4438500;
  if (k.includes('GRESIK')) return 4432000;
  if (k.includes('JAKARTA')) return 5067381;
  if (k.includes('BEKASI') || k.includes('CIKARANG') || k.includes('CIBITUNG')) return 5663888;
  if (k.includes('TANGERANG')) return 4519799;
  if (k.includes('MALANG')) return 3568376;
  if (k.includes('PONTIANAK')) return 3068867;
  if (k.includes('BALI') || k.includes('DENPASAR')) return 3348674;
  if (k.includes('MAKASSAR')) return 3955224;
  if (k.includes('MANADO')) return 3864789;
  if (k.includes('KENDARI')) return 3364658;
  if (k.includes('PALU')) return 3451243;
  if (k.includes('PALEMBANG')) return 3994976;
  if (k.includes('LAMPUNG')) return 3348194;
  if (k.includes('JAMBI')) return 3683053;
  if (k.includes('BENGKULU')) return 2965227;
  if (k.includes('MEDAN')) return 4113388;
  if (k.includes('PADANG')) return 3042889;
  if (k.includes('PEKANBARU')) return 3780970;
  if (k.includes('BANJARMASIN')) return 3672622;
  if (k.includes('PALANGKARAYA')) return 3571128;
  if (k.includes('SAMARINDA')) return 3886571;
  if (k.includes('BALIKPAPAN')) return 3722623;
  if (k.includes('BATAM')) return 5097659;
  if (k.includes('TEGAL')) return 2415333;
  if (k.includes('KUDUS')) return 2708636;
  if (k.includes('JEPARA')) return 2643535;
  if (k.includes('PATI')) return 2373088;
  if (k.includes('PEKALONGAN')) return 2584198;
  if (k.includes('SURAKARTA') || k.includes('SOLO')) return 2456408;
  if (k.includes('YOGYAKARTA')) return 2700806;
  if (k.includes('PURWOKERTO')) return 2370824;
  if (k.includes('SALATIGA')) return 2584262;
  if (k.includes('KEDIRI')) return 2618334;
  if (k.includes('JEMBER')) return 2882107;
  if (k.includes('PASURUAN')) return 4969347;
  if (k.includes('MADIUN')) return 2468493;
  if (k.includes('JOMBANG')) return 3228887;
  if (k.includes('MOJOKERTO')) return 4958254;
  if (k.includes('BANDUNG')) return 4541895;
  if (k.includes('TASIKMALAYA')) return 2848397;
  if (k.includes('CIREBON')) return 2747004;
  if (k.includes('KARAWANG')) return 5657784;
  if (k.includes('BOGOR') || k.includes('CIAWI')) return 4945073;
  if (k.includes('SUKABUMI')) return 3663207;

  return 0; // standard regional fallback is 0 to monitor unknown subdivisions
}

// Retrieve values from parsed rows dynamically with alternative key searches (case and space insensitive)
export function getFlexibleField(row: any, keys: string[]): any {
  if (!row || typeof row !== 'object') return undefined;
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  const normalizedKeys = keys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rowKeys = Object.keys(row);
  for (const rk of rowKeys) {
    const normalizedRk = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = normalizedKeys.indexOf(normalizedRk);
    if (idx !== -1) {
      return row[rk];
    }
  }
  return undefined;
}

// Safely parse integers (Uang, Hari Kerja, etc.) by stripping currency, spaces, and all dots/commas
export function parseSafeInt(val: any, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    return isNaN(val) ? fallback : Math.round(val);
  }
  const str = String(val).trim();
  if (!str) return fallback;

  // Remove currency, spaces, dots, and commas
  const cleaned = str.replace(/(Rp|IDR|USD|[$€£\s\.\,])/gi, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Safely parse decimals (durasi, etc.) where a single dot or comma might separate decimals
export function parseSafeFloat(val: any, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    return isNaN(val) ? fallback : val;
  }
  let str = String(val).trim();
  if (!str) return fallback;

  // Remove currency and spaces
  str = str.replace(/(Rp|IDR|USD|[$€£\s])/gi, '');

  const dotsCount = (str.match(/\./g) || []).length;
  const commasCount = (str.match(/,/g) || []).length;

  if (dotsCount > 1) str = str.replace(/\./g, '');
  if (commasCount > 1) str = str.replace(/,/g, '');

  if (str.includes('.') && str.includes(',')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    const parts = str.split(',');
    if (parts[1] && parts[1].length === 3 && parseFloat(parts[0]) >= 1) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/,/g, '.');
    }
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? fallback : parsed;
}

// Dynamic Formula Engine
export function evaluateFormula(
  formula: CostTypeFormula,
  params: { nilaiUmk: number; jenisHariKerja: number; durasiPerjalanan: number; feeDraft?: number }
): number {
  let rawNilai = parseSafeInt(params.nilaiUmk, 0);
  if (rawNilai <= 0) {
    rawNilai = 0; // Fallback to 0 to monitor discrepancy
  }
  const rawHK = parseSafeInt(params.jenisHariKerja, 25) || 25;
  const rawDurasi = parseSafeFloat(params.durasiPerjalanan, 1) || 1;
  const rawFeeDraft = parseSafeInt(params.feeDraft ?? 0, 0);

  if (formula.type === 'manual') {
    return rawFeeDraft;
  }
  
  if (formula.type === 'route') {
    const val = parseFloat(formula.formulaExpression);
    return isNaN(val) ? 150000 : val;
  }
  
  if (formula.type === 'formula') {
    try {
      if (rawHK && rawHK > 0) {
        if (formula.formulaExpression.includes('-3') || formula.formulaExpression.toUpperCase().includes('ROUNDUP')) {
          const dailyRate = Math.ceil((rawNilai / rawHK) / 1000) * 1000;
          return dailyRate * rawDurasi;
        }
        const base = (rawNilai / rawHK) * rawDurasi;
        return Math.ceil(base);
      }
    } catch (e) {
      console.error('Error evaluating formula expression:', e);
    }
  }

  // Fallback default formula UMK rounding
  const dailyRateDefault = Math.ceil((rawNilai / rawHK) / 1000) * 1000;
  return dailyRateDefault * rawDurasi;
}

// Custom Roundup for backwards compatibility if needed
export function calculateFeeUMK(nilaiUmk: number, jenisHariKerja: number, durasiPerjalanan: number): number {
  const safeUmk = nilaiUmk > 0 ? nilaiUmk : 0;
  const safeHk = jenisHariKerja > 0 ? jenisHariKerja : 25;
  const safeDurasi = durasiPerjalanan > 0 ? durasiPerjalanan : 1;
  const dailyRate = Math.ceil((safeUmk / safeHk) / 1000) * 1000;
  return dailyRate * safeDurasi;
}

// Main verification process incorporating system decisions and normalisations
export function runValidationProcess(
  pengajuan: PengajuanRow[],
  tms: TmsRow[],
  sudahDibayar: AlreadyPaidRow[],
  formulasList: CostTypeFormula[] = DEFAULT_FORMULAS,
  masterUmkList: MasterUmkMapping[] = []
): ValidationResult[] {
  const localDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Dynamically resolve each row's Nilai UMK and Hari Kerja based on Master UMK - Customer configuration
  const resolvedPengajuan = pengajuan.map(row => {
    const { nilaiUmk: masterUmk, jenisHariKerja: masterHk, skema: masterSkema } = getUmkAndHkFromMaster(row, masterUmkList);
    return {
      ...row,
      nilaiUmk: masterUmk,
      jenisHariKerja: masterHk,
      skemaFee: masterSkema
    };
  });

  const formulaMap = new Map<string, CostTypeFormula>();
  formulasList.forEach(f => {
    formulaMap.set(f.costType.toUpperCase(), f);
  });

  // Highlight duplicates within submission using Job Order No + Crew ID
  const joCrewCount = new Map<string, number>();
  resolvedPengajuan.forEach(row => {
    const jo = String(row.jobOrderNo ?? '').trim().toUpperCase();
    const crew = String(row.crewId ?? '').trim().toUpperCase();
    const key = `${jo}_${crew}`;
    if (jo && crew) {
      joCrewCount.set(key, (joCrewCount.get(key) || 0) + 1);
    }
  });

  // Group DAILY rows
  const dailyGroups: Record<string, { index: number; row: PengajuanRow }[]> = {};
  resolvedPengajuan.forEach((row, index) => {
    const skema = ((row.skemaFee && String(row.skemaFee).trim()) ? String(row.skemaFee).trim().toUpperCase() : 'DAILY') as 'DAILY' | 'RITASE';
    if (skema === 'DAILY') {
      const dateKey = normalizeDate(row.eta);
      const key = `${row.crewId}_${dateKey}_${String(row.costType).toUpperCase()}_DAILY`;
      if (!dailyGroups[key]) {
        dailyGroups[key] = [];
      }
      dailyGroups[key].push({ index, row });
    }
  });

  const dailyAllocations = new Map<number, {
    totalJo: number;
    feeHarian: number;
    feeAlokasi: number;
    dailyUmkTertinggi: number;
    dailyHkTerpilih: number;
    dailyFeeGroup: number;
  }>();

  Object.keys(dailyGroups).forEach(key => {
    const group = dailyGroups[key];
    const N = group.length;
    if (N > 0) {
      let dailyUmkTertinggi = 0;
      let dailyFeeGroup = 0;
      let dailyHkTerpilih = 0;

      // Group scan to find highest UMK and highest potential Daily Fee
      group.forEach(obj => {
        const row = obj.row;
        let rowUmk = row.nilaiUmk;
        if (!rowUmk || rowUmk <= 0) {
          rowUmk = lookupUmk(row.kotaUmk || row.homebase);
        }
        if (rowUmk > dailyUmkTertinggi) {
          dailyUmkTertinggi = rowUmk;
        }

        const matchedFormula = formulaMap.get(String(row.costType ?? '').trim().toUpperCase()) || DEFAULT_FORMULAS[0];
        const jofeeHarian = evaluateFormula(matchedFormula, {
          nilaiUmk: rowUmk,
          jenisHariKerja: row.jenisHariKerja,
          durasiPerjalanan: row.durasiPerjalanan,
          feeDraft: row.feeUmk
        });

        // Use highest fee combination
        if (jofeeHarian > dailyFeeGroup) {
          dailyFeeGroup = jofeeHarian;
          dailyHkTerpilih = row.jenisHariKerja;
        }
      });

      // Fallback if zero daily fee calculated
      if (dailyFeeGroup === 0) {
        const firstRow = group[0].row;
        let firstUmk = firstRow.nilaiUmk;
        if (!firstUmk || firstUmk <= 0) {
          firstUmk = lookupUmk(firstRow.kotaUmk || firstRow.homebase);
        }
        dailyUmkTertinggi = firstUmk;
        dailyHkTerpilih = firstRow.jenisHariKerja || 25;
        const matchedFormula = formulaMap.get(String(firstRow.costType ?? '').trim().toUpperCase()) || DEFAULT_FORMULAS[0];
        dailyFeeGroup = evaluateFormula(matchedFormula, {
          nilaiUmk: firstUmk,
          jenisHariKerja: dailyHkTerpilih,
          durasiPerjalanan: firstRow.durasiPerjalanan,
          feeDraft: firstRow.feeUmk
        });
      }

      // Safeguards
      if (dailyUmkTertinggi === 0) {
        dailyUmkTertinggi = Math.max(...group.map(obj => {
          const uVal = obj.row.nilaiUmk;
          return (!uVal || uVal <= 0) ? lookupUmk(obj.row.kotaUmk || obj.row.homebase) : uVal;
        }), 0);
      }
      if (dailyHkTerpilih === 0) {
        dailyHkTerpilih = group[0].row.jenisHariKerja || 25;
      }

      const base = Math.floor(dailyFeeGroup / N);
      const sisa = dailyFeeGroup - (base * N);

      group.forEach((obj, idx) => {
        const allocated = idx < sisa ? (base + 1) : base;
        dailyAllocations.set(obj.index, {
          totalJo: N,
          feeHarian: dailyFeeGroup,
          feeAlokasi: allocated,
          dailyUmkTertinggi,
          dailyHkTerpilih,
          dailyFeeGroup
        });
      });
    }
  });

  // Index TMS records for fast alignment (O(1) lookup map)
  const tmsByJo = new Map<string, TmsRow[]>();
  const tmsByJoAndCrew = new Map<string, TmsRow>();
  tms.forEach(t => {
    const tJo = String(t.jobOrderNo ?? '').trim().toUpperCase();
    const tCrew = String(t.crewId ?? '').trim().toUpperCase();
    const tKey = `${tJo}_${tCrew}`;
    tmsByJoAndCrew.set(tKey, t);
    
    if (!tmsByJo.has(tJo)) {
      tmsByJo.set(tJo, []);
    }
    tmsByJo.get(tJo)!.push(t);
  });

  // Index Already Paid records for fast alignment (O(1) lookup map)
  const paidByJoAndCrew = new Map<string, AlreadyPaidRow>();
  sudahDibayar.forEach(p => {
    const pJo = String(p.jobOrderNo ?? '').trim().toUpperCase();
    const pCrew = String(p.crewId ?? '').trim().toUpperCase();
    const pKey = `${pJo}_${pCrew}`;
    paidByJoAndCrew.set(pKey, p);
  });

  return resolvedPengajuan.map((row, index) => {
    const joNo = String(row.jobOrderNo ?? '').trim();
    const joNoKey = joNo.toUpperCase();
    const crewIdKey = String(row.crewId ?? '').trim().toUpperCase();
    const uniqueIdentityKey = `${joNoKey}_${crewIdKey}`;

    // Find perfect match (JO + Crew ID) in TMS
    let tmsMatch = tmsByJoAndCrew.get(uniqueIdentityKey);

    const crewOnThisJoInTms = tmsByJo.get(joNoKey) || [];
    const hasJoInTms = crewOnThisJoInTms.length > 0;
    let warningTmsCrewIdMismatch = false;
    let tmsCrewListString = '';

    if (!tmsMatch && hasJoInTms) {
      // Find the first occurrence of this JO in TMS as a fallback comparison model
      tmsMatch = crewOnThisJoInTms[0];
      warningTmsCrewIdMismatch = true;
      tmsCrewListString = crewOnThisJoInTms.map(c => `${c.crewId} (${c.namaDriver})`).join(', ');
    }

    // Find if already paid using JO + Crew ID
    const paidMatch = paidByJoAndCrew.get(uniqueIdentityKey);

    const isDuplicated = (joCrewCount.get(uniqueIdentityKey) || 0) > 1;
    const warningDuplikat: ValidationResult['warningDuplikat'] = isDuplicated ? 'DUPLIKAT JO DI PENGAJUAN' : '-';

    // 1. Solve fee calculation dynamically via Formula Engine with DAILY / RITASE support
    const skemaFee = ((row.skemaFee && String(row.skemaFee).trim()) ? String(row.skemaFee).trim().toUpperCase() : 'DAILY') as 'DAILY' | 'RITASE';
    let feeHitungUlang = 0;
    let totalJoDalamGroupDaily = 1;
    let feeHarianDaily = 0;
    let feeAlokasiPerJo = 0;
    let dailyUmkTertinggi: number | undefined = undefined;
    let dailyHkTerpilih: number | undefined = undefined;
    let dailyFeeGroup: number | undefined = undefined;

    if (skemaFee === 'DAILY') {
      const alloc = dailyAllocations.get(index);
      if (alloc) {
        feeHitungUlang = alloc.feeAlokasi;
        totalJoDalamGroupDaily = alloc.totalJo;
        feeHarianDaily = alloc.feeHarian;
        feeAlokasiPerJo = alloc.feeAlokasi;
        dailyUmkTertinggi = alloc.dailyUmkTertinggi;
        dailyHkTerpilih = alloc.dailyHkTerpilih;
        dailyFeeGroup = alloc.dailyFeeGroup;
      } else {
        const matchedFormula = formulaMap.get(String(row.costType ?? '').trim().toUpperCase()) || DEFAULT_FORMULAS[0];
        let safeUmk = row.nilaiUmk;
        if (!safeUmk || safeUmk <= 0) {
          safeUmk = lookupUmk(row.kotaUmk || row.homebase);
        }
        feeHitungUlang = evaluateFormula(matchedFormula, {
          nilaiUmk: safeUmk,
          jenisHariKerja: row.jenisHariKerja,
          durasiPerjalanan: row.durasiPerjalanan,
          feeDraft: row.feeUmk
        });
        feeAlokasiPerJo = feeHitungUlang;
        feeHarianDaily = feeHitungUlang;
        dailyUmkTertinggi = safeUmk;
        dailyHkTerpilih = row.jenisHariKerja || 25;
        dailyFeeGroup = feeHitungUlang;
      }
    } else {
      const matchedFormula = formulaMap.get(String(row.costType ?? '').trim().toUpperCase()) || DEFAULT_FORMULAS[0];
      let safeUmk = row.nilaiUmk;
      if (!safeUmk || safeUmk <= 0) {
        safeUmk = lookupUmk(row.kotaUmk || row.homebase);
      }
      feeHitungUlang = evaluateFormula(matchedFormula, {
        nilaiUmk: safeUmk,
        jenisHariKerja: row.jenisHariKerja,
        durasiPerjalanan: row.durasiPerjalanan,
        feeDraft: row.feeUmk
      });
      feeAlokasiPerJo = feeHitungUlang;
    }

    const selisihFee = row.feeUmk - feeHitungUlang;
    let statusFee: ValidationResult['statusFee'] = 'FEE SESUAI';
    if (selisihFee > 0) statusFee = 'FEE LEBIH';
    if (selisihFee < 0) statusFee = 'FEE KURANG';

    const statusPembayaran: ValidationResult['statusPembayaran'] = paidMatch ? 'SUDAH DIBAYAR' : 'BELUM DIBAYAR';

    // 2. Perform matches with robust data normalization
    let statusValidasiTms: ValidationResult['statusValidasiTms'] = 'VALID';
    const errors: string[] = [];

    if (!tmsMatch) {
      statusValidasiTms = 'TIDAK ADA DI TMS';
      errors.push('Job Order tidak ditemukan di export TMS');
    } else {
      const mismatches: string[] = [];

      if (warningTmsCrewIdMismatch) {
        mismatches.push(`Sopir & Crew ID tidak terdaftar on JO ini di TMS (Daftar TMS: ${tmsCrewListString})`);
      } else {
        if (isMismatchedNormalized(row.crewId, tmsMatch.crewId)) {
          mismatches.push(`Crew ID beda (Pengajuan: ${row.crewId} vs TMS: ${tmsMatch.crewId || '-'})`);
        }
      }

      const driverSim = getStringSimilarity(row.namaDriver, tmsMatch.namaDriver);
      if (driverSim < 0.80) {
        mismatches.push(`Nama Driver beda (Pengajuan: ${row.namaDriver} vs TMS: ${tmsMatch.namaDriver || '-'})`);
      } else if (driverSim < 1.0) {
        errors.push(`Typo Driver (${Math.round(driverSim * 100)}% mirip: "${row.namaDriver}" ≈ "${tmsMatch.namaDriver}")`);
      }
      if (isMismatchedNormalized(row.division, tmsMatch.division)) {
        mismatches.push(`Division beda (Pengajuan: ${row.division} vs TMS: ${tmsMatch.division || '-'})`);
      }
      if (isMismatchedNormalized(normalizeDate(row.eta), normalizeDate(tmsMatch.eta))) {
        mismatches.push(`ETA beda (Pengajuan: ${row.eta} vs TMS: ${tmsMatch.eta || '-'})`);
      }
      if (isMismatchedNormalized(row.orderType, tmsMatch.orderType)) {
        mismatches.push(`Order Type beda (Pengajuan: ${row.orderType} vs TMS: ${tmsMatch.orderType || '-'})`);
      }
      if (isMismatchedNormalized(row.fleetType, tmsMatch.fleetType)) {
        mismatches.push(`Fleet Type beda (Pengajuan: ${row.fleetType} vs TMS: ${tmsMatch.fleetType || '-'})`);
      }
      if (isMismatchedNormalized(row.platNo, tmsMatch.platNo, true)) {
        mismatches.push(`Plat No beda (Pengajuan: ${row.platNo} vs TMS: ${tmsMatch.platNo || '-'})`);
      }
      // Route pengajuan tidak ada di TMS dan pasti beda, yang benar di pengajuan (lewatkan pengecekan)
      /*
      if (isSubDivisionMismatched(row.subDivision, tmsMatch.subDivision)) {
        mismatches.push(`Route beda (Pengajuan: ${row.subDivision} vs TMS: ${tmsMatch.subDivision || '-'})`);
      }
      */

      const isCustMatch = isCustomerMatching(row.customer, tmsMatch.customer);
      const isC1Adi = normalizeGeneralText(row.customer).includes('TRI ADI BERSAMA');
      const isC2Anteraja = normalizeGeneralText(tmsMatch.customer).includes('ANTERAJA');
      const isC2Adi = normalizeGeneralText(tmsMatch.customer).includes('TRI ADI BERSAMA');
      const isC1Anteraja = normalizeGeneralText(row.customer).includes('ANTERAJA');
      const isSpecialCustomerMatch = (isC1Adi && isC2Anteraja) || (isC2Adi && isC1Anteraja);

      if (!isCustMatch) {
        mismatches.push(`Customer beda (Pengajuan: ${row.customer} vs TMS: ${tmsMatch.customer || '-'})`);
      } else if (isSpecialCustomerMatch) {
        // Khusus PT TRI ADI BERSAMA = Anteraja: Cocok Sempurna
      } else {
        const customerSim = getStringSimilarity(row.customer, tmsMatch.customer);
        if (customerSim < 1.0) {
          errors.push(`Typo Customer (${Math.round(customerSim * 100)}% mirip: "${row.customer}" ≈ "${tmsMatch.customer}")`);
        }
      }

      const tmsStatusVal = String(tmsMatch.jobOrderStatus || '').trim().toUpperCase();
      const isClosedInTms = tmsStatusVal === 'CLOSED';

      if (!isClosedInTms) {
        statusValidasiTms = 'STATUS TMS BELUM CLOSED';
        errors.push(`Status TMS belum Closed (${tmsMatch.jobOrderStatus || 'KOSONG'})`);
      }

      if (mismatches.length > 0) {
        if (statusValidasiTms !== 'STATUS TMS BELUM CLOSED') {
          statusValidasiTms = 'DATA TMS TIDAK COCOK';
        }
        errors.push(...mismatches);
      }
    }

    if (isDuplicated) {
      errors.push('Duplikat JO + Crew ID di berkas pengajuan');
    }
    if (paidMatch) {
      errors.push(`Sudah Dibayar di Batch: ${paidMatch.batchPembayaran} Keterangan: ${paidMatch.keterangan}`);
    }
    if (statusFee === 'FEE LEBIH') {
      errors.push(`Selisih Lebih: +Rp ${selisihFee.toLocaleString('id-ID')}`);
    } else if (statusFee === 'FEE KURANG') {
      errors.push(`Selisih Kurang: -Rp ${Math.abs(selisihFee).toLocaleString('id-ID')}`);
    }

    // 3. SECURE DECISION ENGINE (As specified by rules)
    let keputusanSistem: ValidationResult['keputusanSistem'] = 'SIAP DIBAYAR';
    let alasanKeputusanList: string[] = [];

    // Rule TOLAK: Tidak ada di TMS, Sudah dibayar, Duplikat JO
    if (statusValidasiTms === 'TIDAK ADA DI TMS') {
      keputusanSistem = 'TOLAK';
      alasanKeputusanList.push('JO TIDAK DITEMUKAN DI TMS');
    }
    if (statusPembayaran === 'SUDAH DIBAYAR') {
      keputusanSistem = 'TOLAK';
      alasanKeputusanList.push('JO SUDAH DIBAYAR SEBELUMNYA');
    }
    if (warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN') {
      keputusanSistem = 'TOLAK';
      alasanKeputusanList.push('DUPLIKAT NOMOR JOB ORDER');
    }

    // Rule REVIEW MANUAL: Data TMS tidak cocok, Status TMS belum closed, Fee Lebih/Kurang
    if (keputusanSistem !== 'TOLAK') {
      if (statusValidasiTms === 'DATA TMS TIDAK COCOK') {
        keputusanSistem = 'REVIEW MANUAL';
        alasanKeputusanList.push('KETIDAKCOCOKAN DATA MERGENSI');
      } else if (statusValidasiTms === 'STATUS TMS BELUM CLOSED') {
        keputusanSistem = 'REVIEW MANUAL';
        alasanKeputusanList.push('STATUS TMS BELUM CLOSED');
      } else if (statusFee === 'FEE LEBIH') {
        keputusanSistem = 'REVIEW MANUAL';
        alasanKeputusanList.push(`FEE LEBIH Rp ${selisihFee.toLocaleString('id-ID')}`);
      } else if (statusFee === 'FEE KURANG') {
        keputusanSistem = 'REVIEW MANUAL';
        alasanKeputusanList.push(`FEE KURANG Rp ${Math.abs(selisihFee).toLocaleString('id-ID')}`);
      }
    }

    if (keputusanSistem === 'SIAP DIBAYAR') {
      alasanKeputusanList.push('Data TMS cocok, status closed, nilai sesuai & siap dibayar');
    }

    const alasanKeputusan = alasanKeputusanList.join('; ');

    // Determine default workflow status based on keputusanSistem
    let statusWorkflow: ValidationResult['statusWorkflow'] = 'VALIDATED';
    if (row.statusWorkflow) {
      statusWorkflow = row.statusWorkflow;
    } else {
      if (keputusanSistem === 'SIAP DIBAYAR') {
        statusWorkflow = 'VALIDATED';
      } else if (keputusanSistem === 'REVIEW MANUAL') {
        statusWorkflow = 'REVIEW';
      } else {
        statusWorkflow = 'DRAFT';
      }
    }

    return {
      tanggalProses: localDate,
      pengaju: row.pengaju || 'KOSONG',
      jobOrderNo: row.jobOrderNo,
      crewIdPengajuan: row.crewId,
      crewIdTms: tmsMatch ? tmsMatch.crewId : '-',
      namaDriverPengajuan: row.namaDriver,
      namaDriverTms: tmsMatch ? tmsMatch.namaDriver : '-',
      divisionPengajuan: row.division,
      divisionTms: tmsMatch ? tmsMatch.division : '-',
      jobOrderStatusPengajuan: row.jobOrderStatus,
      jobOrderStatusTms: tmsMatch ? tmsMatch.jobOrderStatus : '-',
      etaPengajuan: row.eta,
      etaTms: tmsMatch ? tmsMatch.eta : '-',
      orderTypePengajuan: row.orderType,
      orderTypeTms: tmsMatch ? tmsMatch.orderType : '-',
      fleetTypePengajuan: row.fleetType,
      fleetTypeTms: tmsMatch ? tmsMatch.fleetType : '-',
      platNoPengajuan: row.platNo,
      platNoTms: tmsMatch ? tmsMatch.platNo : '-',
      subDivisionPengajuan: row.subDivision,
      subDivisionTms: tmsMatch ? tmsMatch.subDivision : '-',
      customerPengajuan: row.customer,
      customerTms: tmsMatch ? tmsMatch.customer : '-',
      homebase: row.homebase,
      durasiPerjalanan: row.durasiPerjalanan,
      costType: row.costType,
      jenisHariKerja: row.jenisHariKerja,
      kotaUmk: row.kotaUmk,
      nilaiUmk: row.nilaiUmk,
      feeUmkPengajuan: row.feeUmk,
      feeHitungUlang,
      selisihFee,
      skemaFee,
      totalJoDalamGroupDaily,
      feeHarianDaily,
      feeAlokasiPerJo,
      dailyUmkTertinggi,
      dailyHkTerpilih,
      dailyFeeGroup,
      statusValidasiTms,
      statusFee,
      statusPembayaran,
      warningDuplikat,
      keteranganError: errors.length > 0 ? errors.join('; ') : 'Valid - Seluruh kecocokan data terpenuhi',
      
      // High Priority Upgrades
      keputusanSistem,
      alasanKeputusan,
      statusWorkflow
    };
  });
}

// Compute aggregate stats for dashboard metrics including Rupiah Nominal
export function getDashboardStats(results: ValidationResult[]): DashboardStats {
  let totalValid = 0;
  let totalTidakAdaDiTms = 0;
  let totalDataTidakCocok = 0;
  let totalBelumClosed = 0;
  let totalSudahDibayar = 0;
  let totalFeeSesuai = 0;
  let totalFeeKurang = 0;
  let totalFeeLebih = 0;
  let totalDuplikatJo = 0;

  // Rupiah trackers
  let totalNominalPengajuan = 0;
  let totalNominalValid = 0;
  let totalNominalReviewManual = 0;
  let totalNominalDitolak = 0;
  let totalNominalSudahDibayar = 0;
  let potensiDoublePayment = 0;
  let potensiSelisihFee = 0;

  results.forEach(res => {
    totalNominalPengajuan += res.feeUmkPengajuan;

    // TMS Status aggregation
    if (res.statusValidasiTms === 'VALID') {
      totalValid++;
    } else if (res.statusValidasiTms === 'TIDAK ADA DI TMS') {
      totalTidakAdaDiTms++;
    } else if (res.statusValidasiTms === 'DATA TMS TIDAK COCOK') {
      totalDataTidakCocok++;
    } else if (res.statusValidasiTms === 'STATUS TMS BELUM CLOSED') {
      totalBelumClosed++;
    }

    // Payment status aggregation
    if (res.statusPembayaran === 'SUDAH DIBAYAR') {
      totalSudahDibayar++;
      totalNominalSudahDibayar += res.feeUmkPengajuan;
    }

    // Fee status aggregation
    if (res.statusFee === 'FEE SESUAI') {
      totalFeeSesuai++;
    } else if (res.statusFee === 'FEE KURANG') {
      totalFeeKurang++;
      potensiSelisihFee += Math.abs(res.selisihFee);
    } else if (res.statusFee === 'FEE LEBIH') {
      totalFeeLebih++;
      potensiSelisihFee += Math.abs(res.selisihFee);
    }

    // Duplicate aggregation
    if (res.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN') {
      totalDuplikatJo++;
    }

    // System decision nominal tracker
    if (res.keputusanSistem === 'SIAP DIBAYAR') {
      totalNominalValid += res.feeUmkPengajuan;
    } else if (res.keputusanSistem === 'REVIEW MANUAL') {
      totalNominalReviewManual += res.feeUmkPengajuan;
    } else if (res.keputusanSistem === 'TOLAK') {
      totalNominalDitolak += res.feeUmkPengajuan;
    }

    // Capture double payment risk
    if (res.statusPembayaran === 'SUDAH DIBAYAR' || res.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN') {
      potensiDoublePayment += res.feeUmkPengajuan;
    }
  });

  const rataRataFeePerJo = results.length > 0 ? Math.round(totalNominalPengajuan / results.length) : 0;

  return {
    totalPengajuan: results.length,
    totalValid,
    totalTidakAdaDiTms,
    totalDataTidakCocok,
    totalBelumClosed,
    totalSudahDibayar,
    totalFeeSesuai,
    totalFeeKurang,
    totalFeeLebih,
    totalDuplikatJo,
    
    // Financials
    totalNominalPengajuan,
    totalNominalValid,
    totalNominalReviewManual,
    totalNominalDitolak,
    totalNominalSudahDibayar,
    potensiDoublePayment,
    potensiSelisihFee,
    rataRataFeePerJo
  };
}

export function getDriverLeaderStatsList(results: ValidationResult[]): DriverLeaderStats[] {
  const groups: Record<string, ValidationResult[]> = {};
  results.forEach(res => {
    const pengaju = res.pengaju || 'KOSONG';
    if (!groups[pengaju]) {
      groups[pengaju] = [];
    }
    groups[pengaju].push(res);
  });

  const statsList: DriverLeaderStats[] = Object.keys(groups).map(pengaju => {
    const rows = groups[pengaju];
    const totalJoDiajukan = rows.length;

    let totalJoValid = 0;
    let totalJoReviewManual = 0;
    let totalJoDitolak = 0;
    let totalJoSudahDibayar = 0;
    let totalJoTidakAdaDiTms = 0;
    let totalJoDuplikat = 0;

    let totalNominalPengajuan = 0;
    let totalNominalValid = 0;
    let totalNominalBermasalah = 0;

    rows.forEach(r => {
      totalNominalPengajuan += r.feeUmkPengajuan;

      if (r.keputusanSistem === 'SIAP DIBAYAR') {
        totalJoValid++;
        totalNominalValid += r.feeUmkPengajuan;
      } else {
        totalNominalBermasalah += r.feeUmkPengajuan;
        if (r.keputusanSistem === 'REVIEW MANUAL') {
          totalJoReviewManual++;
        } else if (r.keputusanSistem === 'TOLAK') {
          totalJoDitolak++;
        }
      }

      if (r.statusPembayaran === 'SUDAH DIBAYAR') {
        totalJoSudahDibayar++;
      }
      if (r.statusValidasiTms === 'TIDAK ADA DI TMS') {
        totalJoTidakAdaDiTms++;
      }
      if (r.warningDuplikat === 'DUPLIKAT JO DI PENGAJUAN') {
        totalJoDuplikat++;
      }
    });

    const akurasi = totalJoDiajukan > 0 ? Math.round((totalJoValid / totalJoDiajukan) * 100) : 0;

    return {
      pengaju,
      totalJoDiajukan,
      totalJoValid,
      totalJoReviewManual,
      totalJoDitolak,
      totalJoSudahDibayar,
      totalJoTidakAdaDiTms,
      totalJoDuplikat,
      totalNominalPengajuan,
      totalNominalValid,
      totalNominalBermasalah,
      akurasi
    };
  });

  return statsList.sort((a, b) => b.akurasi - a.akurasi || b.totalJoDiajukan - a.totalJoDiajukan);
}

// Spark preloaded mock datasets so the user starts with illustrative cases
export const MOCK_PENGAJUAN: PengajuanRow[] = [
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360570',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 47667, // Group total is 143,000. Under DAILY schema, divided by 3, first getting 47667
    skemaFee: 'DAILY'
  },
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360570',
    crewId: '201062',
    namaDriver: 'AGUS',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 143000,
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360570',
    crewId: '201063',
    namaDriver: 'BUDI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 143000,
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360580',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - PLOSOKEREP',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 47667, // Under DAILY schema, second getting 47667
    skemaFee: 'DAILY'
  },
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360581',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - WLINGI',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 47666, // Under DAILY schema, third getting 47666
    skemaFee: 'DAILY'
  },
  {
    pengaju: 'ASEP',
    jobOrderNo: 'JO-360571',
    crewId: '201999',
    namaDriver: 'BAMBANG HERMANTO',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '27/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD',
    platNo: 'B-9141-KCX',
    ruteKeterangan: 'CWH MALANG - PASURUAN',
    homebase: 'BAT - MALANG',
    customer: 'PT. BAT - MALANG',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 145000, // Overpaid (Calculated = 143000)
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'BUDI',
    jobOrderNo: 'JO-360572',
    crewId: '201552',
    namaDriver: 'SUGIARTO',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '28/05/2026',
    orderType: 'Regular',
    fleetType: 'Wingbox',
    platNo: 'B-9223-UCZ',
    ruteKeterangan: 'CWH MALANG - SURABAYA',
    homebase: 'BAT - MALANG',
    customer: 'PT. JAYA INDAH SURABAYA',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA SURABAYA',
    nilaiUmk: 4525879,
    feeUmk: 181000, // Underpaid (Calculated = 182000)
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'RUDI',
    jobOrderNo: 'JO-360573',
    crewId: '201088',
    namaDriver: 'TONY WIJAYA',
    division: 'JATIM 2',
    jobOrderStatus: 'Pending',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'N-8224-UR',
    ruteKeterangan: 'CWH MALANG - KANDANGAN',
    homebase: 'BAT - MALANG',
    customer: 'PT. INDOFOOD JATIM',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KOTA MALANG',
    nilaiUmk: 3568376,
    feeUmk: 143000,
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'BUDI',
    jobOrderNo: 'JO-360574',
    crewId: '201334',
    namaDriver: 'LUKMAN HAKIM',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '28/05/2026',
    orderType: 'Regular',
    fleetType: 'CDE',
    platNo: 'L-1209-XF',
    ruteKeterangan: 'CWH SURABAYA - SIDOARJO',
    homebase: 'BAT - SURABAYA',
    customer: 'CV. AGUNG SENTOSA',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KAB SIDOARJO',
    nilaiUmk: 4438500,
    feeUmk: 178000,
    skemaFee: 'RITASE'
  },
  {
    pengaju: 'RUDI',
    jobOrderNo: 'JO-360575',
    crewId: '201124',
    namaDriver: 'ACHMAD FAUZI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '25/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'L-9255-AU',
    ruteKeterangan: 'CWH SURABAYA - GRESIK',
    homebase: 'BAT - SURABAYA',
    customer: 'PT. SEMEN GRESIK TBK',
    durasiPerjalanan: 1,
    costType: 'FEE FREELANCE',
    jenisHariKerja: 25,
    kotaUmk: 'KAB GRESIK',
    nilaiUmk: 4432000,
    feeUmk: 178000,
    skemaFee: 'RITASE'
  }
].map(r => ({ ...r, subDivision: (r as any).ruteKeterangan || '' })) as any;

export const MOCK_EXPORT_TMS: TmsRow[] = [
  {
    jobOrderNo: 'JO-360570',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    customer: 'PT. BAT MALANG'
  },
  {
    jobOrderNo: 'JO-360570',
    crewId: '201062',
    namaDriver: 'AGUS',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    customer: 'PT. BAT MALANG'
  },
  {
    jobOrderNo: 'JO-360570',
    crewId: '201063',
    namaDriver: 'BUDI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - BLITAR',
    customer: 'PT. BAT MALANG'
  },
  {
    jobOrderNo: 'JO-360580',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - PLOSOKEREP',
    customer: 'PT. BAT MALANG'
  },
  {
    jobOrderNo: 'JO-360581',
    crewId: '201061',
    namaDriver: 'DIDIN HANAFI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'B-9115-NCJ',
    ruteKeterangan: 'CWH MALANG - WLINGI',
    customer: 'PT. BAT MALANG'
  },
  {
    jobOrderNo: 'JO-360571',
    crewId: '201999',
    namaDriver: 'BAMBANG HERMANTO',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '27/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD',
    platNo: 'B-9141-KCX',
    ruteKeterangan: 'CWH MALANG - PASURUAN',
    customer: 'PT. BAT - MALANG'
  },
  {
    jobOrderNo: 'JO-360572',
    crewId: '201552',
    namaDriver: 'SUGIARTO',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '28/05/2026',
    orderType: 'Regular',
    fleetType: 'Wingbox',
    platNo: 'B-9223-UCZ',
    ruteKeterangan: 'CWH MALANG SURABAYA',
    customer: 'PT. JAYA SURABAYA'
  },
  {
    jobOrderNo: 'JO-360573',
    crewId: '201088',
    namaDriver: 'TONY WIJAYA',
    division: 'JATIM 2',
    jobOrderStatus: 'Pending',
    eta: '26/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'N-8224-UR',
    ruteKeterangan: 'CWH MALANG - KANDANGAN',
    customer: 'PT. INDOFOOD JATIM'
  },
  {
    jobOrderNo: 'JO-360575',
    crewId: '201124',
    namaDriver: 'ACHMAD FAUZI',
    division: 'JATIM 2',
    jobOrderStatus: 'Closed',
    eta: '25/05/2026',
    orderType: 'Regular',
    fleetType: 'CDD.L',
    platNo: 'L-9255-AU',
    ruteKeterangan: 'CWH SURABAYA - GRESIK',
    customer: 'PT. SEMEN GRESIK TBK'
  }
].map(r => ({ ...r, subDivision: (r as any).ruteKeterangan || '' })) as any;

export const MOCK_JO_SUDAH_DIBAYAR: AlreadyPaidRow[] = [
  {
    jobOrderNo: 'JO-360575',
    tanggalBayar: '01/06/2026',
    periodeBayar: 'Juni 2026',
    crewId: '201124',
    namaDriver: 'ACHMAD FAUZI',
    nominalDibayar: 178000,
    batchPembayaran: 'BATCH-22',
    keterangan: 'Pembayaran reguler awal bulan'
  }
];
