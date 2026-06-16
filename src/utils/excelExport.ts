import * as XLSX from 'xlsx';
import { ValidationResult } from '../types';

export function exportValidationResultToExcel(results: ValidationResult[]) {
  // Translate fields to the exact columns requested in the brief
  const formattedRows = results.map(row => ({
    'Tanggal Proses': row.tanggalProses,
    'Job Order No': row.jobOrderNo,
    'Crew ID Pengajuan': row.crewIdPengajuan,
    'Crew ID TMS': row.crewIdTms,
    'Nama Driver Pengajuan': row.namaDriverPengajuan,
    'Nama Driver TMS': row.namaDriverTms,
    'Division Pengajuan': row.divisionPengajuan,
    'Division TMS': row.divisionTms,
    'Job Order Status Pengajuan': row.jobOrderStatusPengajuan,
    'Job Order Status TMS': row.jobOrderStatusTms,
    'ETA Pengajuan': row.etaPengajuan,
    'ETA TMS': row.etaTms,
    'Order Type Pengajuan': row.orderTypePengajuan,
    'Order Type TMS': row.orderTypeTms,
    'Fleet Type Pengajuan': row.fleetTypePengajuan,
    'Fleet Type TMS': row.fleetTypeTms,
    'Plat No Pengajuan': row.platNoPengajuan,
    'Plat No TMS': row.platNoTms,
    'Route Pengajuan': row.subDivisionPengajuan,
    'Route TMS': row.subDivisionTms,
    'Customer Pengajuan': row.customerPengajuan,
    'Customer TMS': row.customerTms,
    'Homebase': row.homebase,
    'Durasi Perjalanan': row.durasiPerjalanan,
    'Cost Type': row.costType,
    'Jenis Hari Kerja': row.jenisHariKerja,
    'Kota UMK': row.kotaUmk,
    'Nilai UMK': row.nilaiUmk,
    'Skema Fee': row.skemaFee,
    'Total JO Dalam Group Daily': row.totalJoDalamGroupDaily,
    'Fee Harian Daily': row.feeHarianDaily,
    'Fee Alokasi per JO': row.feeAlokasiPerJo,
    'Fee UMK Pengajuan': row.feeUmkPengajuan,
    'Fee Hitung Ulang': row.feeHitungUlang,
    'Selisih Fee': row.selisihFee,
    'Status Validasi TMS': row.statusValidasiTms,
    'Status Fee': row.statusFee,
    'Status Pembayaran': row.statusPembayaran,
    'Warning Duplikat': row.warningDuplikat,
    'Keterangan Error': row.keteranganError,
    'Keputusan Sistem': row.keputusanSistem,
    'Alasan Keputusan': row.alasanKeputusan,
    'Status Workflow': row.statusWorkflow
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Validasi');

  // Trigger browser download
  XLSX.writeFile(workbook, `Laporan_Validasi_Fee_Driver_${new Date().toISOString().slice(0,10)}.xlsx`);
}
