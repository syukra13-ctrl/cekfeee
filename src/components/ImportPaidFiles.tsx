import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AlreadyPaidRow } from '../types';
import { Upload, FileSpreadsheet, CheckCircle, AlertOctagon, HelpCircle, RefreshCw, Trash2 } from 'lucide-react';

interface ImportPaidFilesProps {
  onImportSuccess: (importedRows: AlreadyPaidRow[]) => void;
  currentPaidCount: number;
  onResetToMock: () => void;
  onClearAll: () => void;
}

export default function ImportPaidFiles({ 
  onImportSuccess, 
  currentPaidCount, 
  onResetToMock, 
  onClearAll 
}: ImportPaidFilesProps) {
  const [dragActive, setDragActive] = useState(false);
  const [report, setReport] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndParseData = (rawJson: any[]) => {
    let successCount = 0;
    let failedCount = 0;
    const errorMessages: string[] = [];
    const validRows: AlreadyPaidRow[] = [];

    rawJson.forEach((row, index) => {
      const rowNum = index + 2; // Assuming 1-based indexing and row 1 was header
      
      const jobOrderNo = row['Job Order No'] || row['jobOrderNo'] || row['JobOrderNo'] || row['JO No'] || row['joNo'] || '';
      const tanggalBayar = String(row['Tanggal Bayar'] || row['tanggalBayar'] || row['Payment Date'] || row['tanggal'] || '13/06/2026').trim();
      const periodeBayar = String(row['Periode Bayar'] || row['periodeBayar'] || row['Periode'] || 'Juni 2026').trim();
      const crewId = String(row['Crew ID'] || row['crewId'] || row['CrewID'] || '').trim();
      const namaDriver = String(row['Nama Driver'] || row['namaDriver'] || row['Driver'] || '').trim();
      const nominalDibayar = Number(row['Nominal Dibayar'] || row['nominalDibayar'] || row['Amount'] || row['nominal'] || 0);
      const batchPembayaran = String(row['Batch Pembayaran'] || row['batchPembayaran'] || row['Batch'] || 'BATCH-PROD').trim();
      const keterangan = String(row['Keterangan'] || row['keterangan'] || row['Notes'] || 'Imported via Production Uploader').trim();

      // Simple structural validation
      if (!jobOrderNo) {
        failedCount++;
        errorMessages.push(`Baris ${rowNum}: Kolom 'Job Order No' kosong.`);
        return;
      }

      successCount++;
      validRows.push({
        jobOrderNo: String(jobOrderNo).trim().toUpperCase(),
        tanggalBayar,
        periodeBayar,
        crewId,
        namaDriver,
        nominalDibayar,
        batchPembayaran,
        keterangan
      });
    });

    onImportSuccess(validRows);
    setReport({
      success: successCount,
      failed: failedCount,
      errors: errorMessages.slice(0, 10) // Show at most 10 error lines to prevent clutter
    });
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        
        // Spec sheet constraint: Sheet named "JO_SUDAH_DIBAYAR" if available, else first sheet
        const sheetName = workbook.SheetNames.includes('JO_SUDAH_DIBAYAR') 
          ? 'JO_SUDAH_DIBAYAR' 
          : workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawJson.length === 0) {
          setReport({
            success: 0,
            failed: 1,
            errors: [`Berkas spreadsheet kosong atau format sheet "${sheetName}" tidak cocok.`]
          });
          return;
        }

        const MAX_ROWS = 10000;
        let finalJson = rawJson;
        if (rawJson.length > MAX_ROWS) {
          alert(`Pemberitahuan: Jumlah baris data dalam berkas (${rawJson.length.toLocaleString()} baris) melebihi batas performa optimal browser. Sistem secara otomatis membatasi hingga ${MAX_ROWS.toLocaleString()} baris teratas demi mencegah lag pada tampilan.`);
          finalJson = rawJson.slice(0, MAX_ROWS);
        }

        validateAndParseData(finalJson);
      } catch (err) {
        console.error(err);
        setReport({
          success: 0,
          failed: 1,
          errors: ['Gagal membaca berkas Excel/CSV. Pastikan format didukung.']
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5" id="paid-importer-widget">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-450" />
            Import Database Pembayaran JO (Already Paid)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unggah rincian Job Order yang sudah ditransfer agar mesin otomatis mendeteksi perlindungan double payment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetToMock}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/20 hover:bg-rose-950 text-rose-400 rounded text-xs border border-rose-900/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan
          </button>
        </div>
      </div>

      {/* Stats counter */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider">Jumlah Data Terdaftar Saat Ini:</span>
        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded">
          {currentPaidCount} JO Sudah Dibayar
        </span>
      </div>

      {/* Drag & Drop Canvas */}
      <div
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center space-y-2 ${
          dragActive ? 'border-indigo-500 bg-indigo-950/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileInputChange}
        />
        <Upload className="w-8 h-8 text-slate-500 mb-1" />
        <p className="text-xs font-bold text-slate-300">
          Klik untuk memilih / Seret berkas spreadsheet ke sini
        </p>
        <p className="text-[10px] text-slate-500 leading-normal max-w-sm">
          Mendukung berkas Excel (.xlsx, .xls) atau CSV. Sistem otomatis mengurai sheet <strong className="text-emerald-400">JO_SUDAH_DIBAYAR</strong> atau sheet utama.
        </p>
      </div>

      {/* Status Upload Report */}
      {report && (
        <div id="import-report-banner" className="p-4 rounded-xl border border-slate-850 bg-slate-950 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            Laporan Hasil Unggahan Berkas
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-2 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400">Berhasil Diunggah</p>
                <p className="font-mono font-bold text-emerald-450 text-base">{report.success} JO</p>
              </div>
            </div>

            <div className="p-2.5 rounded bg-red-950/20 border border-red-900/30 flex items-center gap-2 text-xs">
              <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400">Gagal Dimuat</p>
                <p className="font-mono font-bold text-red-450 text-base">{report.failed} Baris</p>
              </div>
            </div>
          </div>

          {report.errors.length > 0 && (
            <div className="mt-2 text-[10px] text-rose-400 font-mono space-y-1 bg-slate-900 p-2.5 rounded border border-slate-850 max-h-32 overflow-y-auto">
              <p className="font-bold uppercase text-rose-300 mb-1">Daftar Galat Terdeteksi:</p>
              {report.errors.map((err, idx) => (
                <p key={idx}>- {err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions card */}
      <div className="p-3 bg-slate-950/40 rounded border border-slate-850 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-400">CONTOH STRUKTUR KOLOM (HEADER):</span>
          <p className="mt-1 font-mono font-medium text-slate-400">
            Job Order No | Tanggal Bayar | Periode Bayar | Crew ID | Nama Driver | Nominal Dibayar | Batch Pembayaran | Keterangan
          </p>
        </div>
      </div>
    </div>
  );
}
