export const APPS_SCRIPT_CODE_GS = `/**
 * Google Apps Script - Sistem Verifikasi Fee Driver Otomatis
 * Database: Google Sheets (Berdasarkan 4 sheet: PENGAJUAN_DL, EXPORT_TMS, JO_SUDAH_DIBAYAR, HASIL_VALIDASI)
 * 
 * Cara memasang:
 * 1. Buka Google Sheets Anda.
 * 2. Klik Ekstensi -> Apps Script.
 * 3. Hapus isi Kode.gs bawaan dan ganti dengan kode di bawah ini.
 * 4. Buat file baru berbasis HTML dengan nama "Index" dan tempelkan kode HTML dari file Index.html.
 * 5. Klik Simpan lalu jalankan fungsi 'createInitialSheets' sekali untuk menginisiasi sheet dengan template header.
 */

// Menambahkan Menu di Toolbar Spreadsheet
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sistem Verifikasi Fee')
    .addItem('Jalankan Validasi Otomatis', 'runVerificationInSheets')
    .addItem('Inisiasi Struktur Sheet', 'createInitialSheets')
    .addItem('Buka Dashboard Web App', 'showSidebarDialog')
    .addToUi();
}

// Inisiasi database Sheets dengan Header Kolom standar
function createInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const sheetsConfig = {
    'PENGAJUAN_DL': [
      'Job Order No', 'Crew ID', 'Nama Driver', 'Division', 'Job Order Status', 'ETA',
      'Order Type', 'Fleet Type', 'Plat No', 'Route', 'Homebase', 'Customer',
      'Durasi Perjalanan', 'Cost Type', 'Jenis Hari Kerja', 'Kota UMK', 'Nilai UMK', 'Fee UMK'
    ],
    'EXPORT_TMS': [
      'Job Order No', 'Crew ID', 'Nama Driver', 'Division', 'Job Order Status', 'ETA',
      'Order Type', 'Fleet Type', 'Plat No', 'Route', 'Customer'
    ],
    'JO_SUDAH_DIBAYAR': [
      'Job Order No', 'Tanggal Bayar', 'Periode Bayar', 'Crew ID', 'Nama Driver',
      'Nominal Dibayar', 'Batch Pembayaran', 'Keterangan'
    ],
    'HASIL_VALIDASI': [
      'Tanggal Proses', 'Job Order No', 'Crew ID Pengajuan', 'Crew ID TMS', 
      'Nama Driver Pengajuan', 'Nama Driver TMS', 'Division Pengajuan', 'Division TMS',
      'Job Order Status Pengajuan', 'Job Order Status TMS', 'ETA Pengajuan', 'ETA TMS',
      'Order Type Pengajuan', 'Order Type TMS', 'Fleet Type Pengajuan', 'Fleet Type TMS',
      'Plat No Pengajuan', 'Plat No TMS', 'Route Pengajuan', 'Route TMS',
      'Customer Pengajuan', 'Customer TMS', 'Homebase', 'Durasi Perjalanan',
      'Cost Type', 'Jenis Hari Kerja', 'Kota UMK', 'Nilai UMK',
      'Fee UMK Pengajuan', 'Fee Hitung Ulang', 'Selisih Fee', 'Status Validasi TMS',
      'Status Fee', 'Status Pembayaran', 'Warning Duplikat', 'Keterangan Error'
    ]
  };
  
  for (const sheetName in sheetsConfig) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    sheet.clear();
    const headers = sheetsConfig[sheetName];
    sheet.getRange(1, 1, 1, headers.length)
         .setValues([headers])
         .setFontWeight('bold')
         .setBackground('#F3F4F6');
    sheet.autoResizeColumns(1, headers.length);
  }
  
  ui.alert('Inisiasi Google Sheets Selesai! Empat sheet berhasil dibuat dengan struktur kolom yang sesuai.');
}

// Buka Web App sebagai Modal Dialog dari menu Spreadsheet
function showSidebarDialog() {
  const html = HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setWidth(950)
    .setHeight(650)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sistem Verifikasi Fee Driver');
}

// Handler HTTP GET sebagai Standalone Apps Script Web App
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Verifikasi Fee Driver - Web App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Mengambil seluruh data dari sheet Spreadsheet utama sebagai JSON
function getDatabaseData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    pengajuan: getSheetDataAsJson(ss.getSheetByName('PENGAJUAN_DL')),
    tms: getSheetDataAsJson(ss.getSheetByName('EXPORT_TMS')),
    sudahDibayar: getSheetDataAsJson(ss.getSheetByName('JO_SUDAH_DIBAYAR')),
    hasil: getSheetDataAsJson(ss.getSheetByName('HASIL_VALIDASI'))
  };
}

// Helper: Membaca range baris data Spreadsheet menjadi array JSON objek
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0].map(h => String(h).trim());
  const jsonArray = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    headers.forEach((header, colIndex) => {
      let cellValue = row[colIndex];
      // Format tanggal ke UTC visual jika berupa tipe Date Google
      if (cellValue instanceof Date) {
        cellValue = Utilities.formatDate(cellValue, Session.getScriptTimeZone() || "GMT+7", "dd/MM/yyyy");
      }
      item[header] = cellValue;
    });
    jsonArray.push(item);
  }
  return jsonArray;
}

// FUNGSI UTAMA ENGINE: Validasi Driver Fee
function runVerificationInSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sPengajuan = ss.getSheetByName('PENGAJUAN_DL');
  const sTms = ss.getSheetByName('EXPORT_TMS');
  const sPaid = ss.getSheetByName('JO_SUDAH_DIBAYAR');
  let sHasil = ss.getSheetByName('HASIL_VALIDASI');
  
  if (!sPengajuan || !sTms || !sPaid) {
    throw new Error('Pastikan sheet PENGAJUAN_DL, EXPORT_TMS, dan JO_SUDAH_DIBAYAR sudah ada di dalam Google Sheet Anda!');
  }
  
  if (!sHasil) {
    sHasil = ss.insertSheet('HASIL_VALIDASI');
  }
  
  const pengajuanData = getSheetDataAsJson(sPengajuan);
  const tmsData = getSheetDataAsJson(sTms);
  const paidData = getSheetDataAsJson(sPaid);
  
  const outputHeaders = [
    'Tanggal Proses', 'Job Order No', 'Crew ID Pengajuan', 'Crew ID TMS', 
    'Nama Driver Pengajuan', 'Nama Driver TMS', 'Division Pengajuan', 'Division TMS', 
    'Job Order Status Pengajuan', 'Job Order Status TMS', 'ETA Pengajuan', 'ETA TMS', 
    'Order Type Pengajuan', 'Order Type TMS', 'Fleet Type Pengajuan', 'Fleet Type TMS', 
    'Plat No Pengajuan', 'Plat No TMS', 'Route Pengajuan', 'Route TMS', 
    'Customer Pengajuan', 'Customer TMS', 'Homebase', 'Durasi Perjalanan', 
    'Cost Type', 'Jenis Hari Kerja', 'Kota UMK', 'Nilai UMK', 
    'Fee UMK Pengajuan', 'Fee Hitung Ulang', 'Selisih Fee', 'Status Validasi TMS', 
    'Status Fee', 'Status Pembayaran', 'Warning Duplikat', 'Keterangan Error'
  ];
  
  // Hitung jumlah kemunculan Job Order No untuk deteksi duplikat
  const joCount = {};
  pengajuanData.forEach(row => {
    const jo = String(row['Job Order No'] || '').trim().toUpperCase();
    if (jo) {
      joCount[jo] = (joCount[jo] || 0) + 1;
    }
  });
  
  const results = [];
  const localDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", 'dd/MM/yyyy');
  
  pengajuanData.forEach(row => {
    const joNo = String(row['Job Order No'] || '').trim();
    const joNoKey = joNo.toUpperCase();
    
    // Cari kecocokan relasi data
    const tmsMatch = tmsData.find(t => String(t['Job Order No'] || '').trim().toUpperCase() === joNoKey);
    const paidMatch = paidData.find(p => String(p['Job Order No'] || '').trim().toUpperCase() === joNoKey);
    
    // 1. Deteksi Duplikat di Pengajuan
    const isDuplicated = (joCount[joNoKey] || 0) > 1;
    const warningDuplikat = isDuplicated ? 'DUPLIKAT JO DI PENGAJUAN' : '-';
    
    // 2. Perhitungan UMK dan Validasi Fee pengajuan
    const nilaiUmk = Number(row['Nilai UMK'] || 0);
    const jenisHariKerja = Number(row['Jenis Hari Kerja'] || 1);
    const durasiPerjalanan = Number(row['Durasi Perjalanan'] || 0);
    const feeUmkPengajuan = Number(row['Fee UMK'] || 0);
    
    let feeHitungUlang = 0;
    if (jenisHariKerja > 0) {
      // Formula ROUNDUP(UMK / HK, -3) * Durasi
      const dailyRate = Math.ceil((nilaiUmk / jenisHariKerja) / 1000) * 1000;
      feeHitungUlang = dailyRate * durasiPerjalanan;
    }
    
    const selisihFee = feeUmkPengajuan - feeHitungUlang;
    let statusFee = 'FEE SESUAI';
    if (selisihFee > 0) statusFee = 'FEE LEBIH';
    if (selisihFee < 0) statusFee = 'FEE KURANG';
    
    // 3. Status Pembayaran historis
    const statusPembayaran = paidMatch ? 'SUDAH DIBAYAR' : 'BELUM DIBAYAR';
    
    // 4. Validasi kecocokan data dengan TMS
    let statusValidasiTms = 'VALID';
    const errors = [];
    
    if (!tmsMatch) {
      statusValidasiTms = 'TIDAK ADA DI TMS';
      errors.push('Job Order tidak ditemukan pada export TMS.');
    } else {
      const diffDetails = [];
      const normalizePlat = p => String(p || '').replace(/[\s-]/g, '').toLowerCase();
      const normalizeDate = d => {
        if (!d) return '';
        const str = String(d).trim();
        if (!str) return '';

        // Check if it's a numeric Excel serial date (e.g., 46175 or 46175.625)
        const num = Number(str);
        if (!isNaN(num) && num > 30000 && num < 60000) {
          const integerDay = Math.floor(num);
          const dateObj = new Date(Math.round((integerDay - 25569) * 86400 * 1000));
          const day = String(dateObj.getUTCDate()).padStart(2, '0');
          const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
          const year = dateObj.getUTCFullYear();
          return day + '/' + month + '/' + year;
        }

        // For text dates, strip any time portion (after a space or 'T')
        const datePart = str.split(/[\sT]+/)[0];

        // 1. Already in standard DD/MM/YYYY format with slashes
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(datePart)) {
          const parts = datePart.split('/');
          return parts[0].padStart(2, '0') + '/' + parts[1].padStart(2, '0') + '/' + parts[2];
        }
        // 2. Format YYYY-MM-DD
        const yyyyMmDdMatch = datePart.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (yyyyMmDdMatch) {
          const [, y, m, dVal] = yyyyMmDdMatch;
          return dVal + '/' + m + '/' + y;
        }
        // Fallback
        const replaced = datePart.replace(/[-]/g, '/');
        const genericMatch = replaced.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (genericMatch) {
          const [, dPart, mPart, yPart] = genericMatch;
          const finalYear = yPart.length === 2 ? '20' + yPart : yPart;
          return dPart.padStart(2, '0') + '/' + mPart.padStart(2, '0') + '/' + finalYear;
        }
        return replaced;
      };
      const isMismatched = (v1, v2) => String(v1 || '').trim().toLowerCase() !== String(v2 || '').trim().toLowerCase();
      
      if (isMismatched(row['Crew ID'], tmsMatch['Crew ID'])) {
        diffDetails.push('Crew ID tidak cocok (Pengajuan = ' + row['Crew ID'] + ', TMS = ' + (tmsMatch['Crew ID'] || '-') + ')');
      }
      if (isMismatched(row['Nama Driver'], tmsMatch['Nama Driver'])) {
        diffDetails.push('Nama Driver tidak cocok (Pengajuan = ' + row['Nama Driver'] + ', TMS = ' + (tmsMatch['Nama Driver'] || '-') + ')');
      }
      if (isMismatched(row['Division'], tmsMatch['Division'])) {
        diffDetails.push('Division tidak cocok (Pengajuan = ' + row['Division'] + ', TMS = ' + (tmsMatch['Division'] || '-') + ')');
      }
      if (isMismatched(normalizeDate(row['ETA']), normalizeDate(tmsMatch['ETA']))) {
        diffDetails.push('ETA tidak cocok (Pengajuan = ' + row['ETA'] + ', TMS = ' + (tmsMatch['ETA'] || '-') + ')');
      }
      if (isMismatched(row['Order Type'], tmsMatch['Order Type'])) {
        diffDetails.push('Order Type tidak cocok (Pengajuan = ' + row['Order Type'] + ', TMS = ' + (tmsMatch['Order Type'] || '-') + ')');
      }
      if (isMismatched(row['Fleet Type'], tmsMatch['Fleet Type'])) {
        diffDetails.push('Fleet Type tidak cocok (Pengajuan = ' + row['Fleet Type'] + ', TMS = ' + (tmsMatch['Fleet Type'] || '-') + ')');
      }
      if (isMismatched(normalizePlat(row['Plat No']), normalizePlat(tmsMatch['Plat No']))) {
        diffDetails.push('Plat No tidak cocok (Pengajuan = ' + row['Plat No'] + ', TMS = ' + (tmsMatch['Plat No'] || '-') + ')');
      }
      if (isMismatched(row['Route'], tmsMatch['Route'])) {
        diffDetails.push('Route tidak cocok (Pengajuan = ' + row['Route'] + ', TMS = ' + (tmsMatch['Route'] || '-') + ')');
      }
      if (isMismatched(row['Customer'], tmsMatch['Customer'])) {
        diffDetails.push('Customer tidak cocok (Pengajuan = ' + row['Customer'] + ', TMS = ' + (tmsMatch['Customer'] || '-') + ')');
      }
      
      const tmsStatusVal = String(tmsMatch['Job Order Status'] || '').trim().toUpperCase();
      const isClosedInTms = tmsStatusVal === 'CLOSED';
      
      if (!isClosedInTms) {
        statusValidasiTms = 'STATUS TMS BELUM CLOSED';
        errors.push('Status TMS belum Closed (' + (tmsMatch['Job Order Status'] || 'Kosong') + ').');
      }
      
      if (diffDetails.length > 0) {
        if (statusValidasiTms !== 'STATUS TMS BELUM CLOSED') {
          statusValidasiTms = 'DATA TMS TIDAK COCOK';
        }
        errors.push(...diffDetails);
      }
    }
    
    // Gabungkan keterangan error kontekstual
    if (isDuplicated) {
      errors.push('Terdeteksi nomor JO duplikat di pengajuan.');
    }
    if (paidMatch) {
      errors.push('[SUDAH DIBAYAR] Histori pembayaran ditemukan: Tanggal ' + paidMatch['Tanggal Bayar'] + ', Periode ' + paidMatch['Periode Bayar'] + ' (Batch: ' + paidMatch['Batch Pembayaran'] + ').');
    }
    if (statusFee === 'FEE LEBIH') {
      errors.push('Fee Pengajuan lebih tinggi dari hitung ulang UMK (selisih: +' + selisihFee.toLocaleString('id-ID') + ')');
    } else if (statusFee === 'FEE KURANG') {
      errors.push('Fee Pengajuan kurang dari hitung ulang UMK (selisih: ' + selisihFee.toLocaleString('id-ID') + ')');
    }
    
    const keteranganError = errors.length > 0 ? errors.join('; ') : 'Valid - Seluruh kecocokan data terpenuhi';
    
    const outputRow = [
      localDateStr,
      joNo,
      row['Crew ID'] || '',
      tmsMatch ? (tmsMatch['Crew ID'] || '') : '-',
      row['Nama Driver'] || '',
      tmsMatch ? (tmsMatch['Nama Driver'] || '') : '-',
      row['Division'] || '',
      tmsMatch ? (tmsMatch['Division'] || '') : '-',
      row['Job Order Status'] || '',
      tmsMatch ? (tmsMatch['Job Order Status'] || '') : '-',
      row['ETA'] || '',
      tmsMatch ? (tmsMatch['ETA'] || '') : '-',
      row['Order Type'] || '',
      tmsMatch ? (tmsMatch['Order Type'] || '') : '-',
      row['Fleet Type'] || '',
      tmsMatch ? (tmsMatch['Fleet Type'] || '') : '-',
      row['Plat No'] || '',
      tmsMatch ? (tmsMatch['Plat No'] || '') : '-',
      row['Route'] || '',
      tmsMatch ? (tmsMatch['Route'] || '') : '-',
      row['Customer'] || '',
      tmsMatch ? (tmsMatch['Customer'] || '') : '-',
      row['Homebase'] || '',
      durasiPerjalanan,
      row['Cost Type'] || '',
      jenisHariKerja,
      row['Kota UMK'] || '',
      nilaiUmk,
      feeUmkPengajuan,
      feeHitungUlang,
      selisihFee,
      statusValidasiTms,
      statusFee,
      statusPembayaran,
      warningDuplikat,
      keteranganError
    ];
    results.push(outputRow);
  });
  
  // Reset output Sheet dan isikan seluruh baris validasi
  sHasil.clear();
  sHasil.getRange(1, 1, 1, outputHeaders.length).setValues([outputHeaders]);
  if (results.length > 0) {
    sHasil.getRange(2, 1, results.length, outputHeaders.length).setValues(results);
    sHasil.autoResizeColumns(1, outputHeaders.length);
  }
  
  try {
    SpreadsheetApp.getUi().alert('Proses Validasi Otomatis Selesai! Sebanyak ' + results.length + ' Baris Data telah dicocokkan dan direkam pada sheet HASIL_VALIDASI.');
  } catch(e) {
    Logger.log('Validation completed. Total rows: ' + results.length);
  }
}
`;

export const APPS_SCRIPT_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <!-- Tailwind CSS CDN -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f9fafb; }
    .scrollable { overflow-y: auto; max-height: 400px; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-150 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center">
          <i class="fas fa-file-invoice-dollar text-indigo-600 mr-2"></i> Sistem Verifikasi Fee Driver
        </h1>
        <p class="text-sm text-gray-500 mt-1">Google Sheets & Google Apps Script Portal</p>
      </div>
      <div>
        <button onclick="runValidation()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow flex items-center shadow-md">
          <i class="fas fa-play mr-2"></i> Jalankan Validasi Sheet
        </button>
      </div>
    </div>

    <!-- Alert Success / Info -->
    <div id="statusAlert" class="hidden mb-6 p-4 rounded-lg flex items-center">
      <i id="statusIcon" class="fas mr-3 text-lg"></i>
      <span id="statusMessage" class="font-medium text-sm"></span>
    </div>

    <!-- Grid KPI Dashboard -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div class="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
          <i class="fas fa-list text-xl"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase font-bold">Total Pengajuan</p>
          <h3 id="statTotal" class="text-xl font-bold text-gray-800">-</h3>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div class="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
          <i class="fas fa-check-circle text-xl"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase font-bold">Total Valid</p>
          <h3 id="statValid" class="text-xl font-bold text-gray-800">-</h3>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div class="p-3 rounded-lg bg-red-50 text-red-600 mr-4">
          <i class="fas fa-times-circle text-xl"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase font-bold">Tidak Cocok TMS</p>
          <h3 id="statMismatch" class="text-xl font-bold text-gray-800">-</h3>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div class="p-3 rounded-lg bg-yellow-50 text-yellow-600 mr-4">
          <i class="fas fa-exclamation-triangle text-xl"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase font-bold">Fee Selisih / Lebih</p>
          <h3 id="statFeeDiff" class="text-xl font-bold text-gray-800">-</h3>
        </div>
      </div>
    </div>

    <!-- Tabs Content -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="border-b border-gray-200 bg-gray-50 px-4 flex justify-between items-center py-2">
        <span class="text-sm font-semibold text-gray-700">Ringkasan Baris Pengajuan DL & Status Otomatis</span>
        <button onclick="loadStats()" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center">
          <i class="fas fa-sync mr-1"></i> Refresh Data
        </button>
      </div>
      
      <div class="scrollable">
        <table class="min-w-full divide-y divide-gray-250 text-sm">
          <thead class="bg-gray-50 font-semibold text-gray-600 text-left">
            <tr>
              <th class="px-4 py-3">JO No</th>
              <th class="px-4 py-3">Nama Driver</th>
              <th class="px-4 py-3">Plat No</th>
              <th class="px-4 py-3">Status Validasi TMS</th>
              <th class="px-4 py-3">Status Fee</th>
              <th class="px-4 py-3">Status Pembayaran</th>
            </tr>
          </thead>
          <tbody id="tableBody" class="divide-y divide-gray-200">
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">Loading data database Google Sheets...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    // Inisiasi awal saat halaman dimuat
    document.addEventListener("DOMContentLoaded", function() {
      loadStats();
    });

    function showToast(message, type) {
      const alert = document.getElementById("statusAlert");
      const icon = document.getElementById("statusIcon");
      const text = document.getElementById("statusMessage");
      
      alert.classList.remove("hidden", "bg-green-50", "text-green-700", "bg-indigo-50", "text-indigo-700", "bg-red-50", "text-red-700");
      icon.className = "fas mr-3 text-lg";
      
      if (type === 'success') {
        alert.classList.add("bg-green-50", "text-green-700");
        icon.classList.add("fa-check-circle");
      } else if (type === 'error') {
        alert.classList.add("bg-red-50", "text-red-700");
        icon.classList.add("fa-exclamation-circle");
      } else {
        alert.classList.add("bg-indigo-50", "text-indigo-700");
        icon.classList.add("fa-info-circle");
      }
      
      text.innerText = message;
      alert.classList.remove("hidden");
    }

    function loadStats() {
      showToast("Sedang sinkronisasi data Google Sheets...", "info");
      
      google.script.run
        .withSuccessHandler(function(data) {
          document.getElementById("statTotal").innerText = data.pengajuan.length;
          
          let valid = 0;
          let mismatch = 0;
          let feeDiff = 0;
          
          let html = '';
          if (data.hasil.length === 0) {
            html = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">Verifikasi belum dijalankan. Klik "Jalankan Validasi Sheet" untuk memulainya.</td></tr>';
          } else {
            data.hasil.forEach(function(row) {
              const statusTms = row['Status Validasi TMS'] || 'VALID';
              const statusFeeVal = row['Status Fee'] || 'FEE SESUAI';
              const statusBayar = row['Status Pembayaran'] || 'BELUM DIBAYAR';
              
              if (statusTms === 'VALID') valid++;
              if (statusTms === 'DATA TMS TIDAK COCOK' || statusTms === 'TIDAK ADA DI TMS') mismatch++;
              if (statusFeeVal !== 'FEE SESUAI') feeDiff++;
              
              const badgeTmsStyle = statusTms === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              const badgeFeeStyle = statusFeeVal === 'FEE SESUAI' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
              const badgeBayarStyle = statusBayar === 'BELUM DIBAYAR' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
              
              html += '<tr class="hover:bg-gray-50">' +
                '<td class="px-4 py-2 font-mono font-medium">' + (row['Job Order No'] || '-') + '</td>' +
                '<td class="px-4 py-2 font-medium text-gray-700">' + (row['Nama Driver Pengajuan'] || '-') + '</td>' +
                '<td class="px-4 py-2">' + (row['Plat No Pengajuan'] || '-') + '</td>' +
                '<td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-xs ' + badgeTmsStyle + '">' + statusTms + '</span></td>' +
                '<td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-xs ' + badgeFeeStyle + '">' + statusFeeVal + '</span></td>' +
                '<td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-xs ' + badgeBayarStyle + '">' + statusBayar + '</span></td>' +
                '</tr>';
            });
          }
          
          document.getElementById("statValid").innerText = valid;
          document.getElementById("statMismatch").innerText = mismatch;
          document.getElementById("statFeeDiff").innerText = feeDiff;
          document.getElementById("tableBody").innerHTML = html;
          
          showToast("Koneksi Google Sheets berhasil disinkronisasi.", "success");
        })
        .withFailureHandler(function(err) {
          showToast("Gagal membaca Google Sheets: " + err.message, "error");
        })
        .getDatabaseData();
    }

    function runValidation() {
      showToast("Sedang memproses mesin validasi di Google Sheets, mohon tunggu...", "info");
      
      google.script.run
        .withSuccessHandler(function() {
          showToast("Suksese! Seluruh data terverifikasi dan terekam di sheet HASIL_VALIDASI.", "success");
          loadStats();
        })
        .withFailureHandler(function(err) {
          showToast("Proses validasi gagal: " + err.message, "error");
        })
        .runVerificationInSheets();
    }
  </script>
</body>
</html>
`;
