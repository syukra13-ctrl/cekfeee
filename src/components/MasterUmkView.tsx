import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Trash, 
  Edit2, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  Check, 
  RotateCcw,
  X
} from 'lucide-react';
import { MasterUmkMapping } from '../types';
import { DEFAULT_UMK_MAPPINGS } from '../utils/validationEngine';

interface MasterUmkViewProps {
  masterUmkList: MasterUmkMapping[];
  onSetMasterUmkList: React.Dispatch<React.SetStateAction<MasterUmkMapping[]>>;
  onWriteLog: (aktivitas: string, jobOrderNo: string, statusLama: string, statusBaru: string) => void;
}

export default function MasterUmkView({ 
  masterUmkList, 
  onSetMasterUmkList,
  onWriteLog
}: MasterUmkViewProps) {
  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [division, setDivision] = useState('');
  const [subDivision, setSubDivision] = useState('');
  const [skema, setSkema] = useState<'Daily' | 'Ritase'>('Daily');
  const [kotaUmk, setKotaUmk] = useState('');
  const [nilaiUmk, setNilaiUmk] = useState<number>(4541891);
  
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search Results
  const filteredMappings = masterUmkList.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      (item.division || '').toLowerCase().includes(q) ||
      (item.subDivision || '').toLowerCase().includes(q) ||
      (item.skema || '').toLowerCase().includes(q) ||
      (item.kotaUmk || '').toLowerCase().includes(q)
    );
  });

  // Handle Save (Add or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!division.trim()) {
      setFormError('Division wajib diisi.');
      return;
    }
    if (!subDivision.trim()) {
      setFormError('Sub Division wajib diisi.');
      return;
    }
    if (!kotaUmk.trim()) {
      setFormError('Kota UMK wajib diisi.');
      return;
    }
    if (nilaiUmk <= 0) {
      setFormError('Nilai UMK harus lebih besar dari 0.');
      return;
    }

    if (editingId) {
      // Editing Mode
      const original = masterUmkList.find(m => m.id === editingId);
      const updatedList = masterUmkList.map(m => {
        if (m.id === editingId) {
          return {
            ...m,
            division: division.trim().toUpperCase(),
            subDivision: subDivision.trim().toUpperCase(),
            skema,
            kotaUmk: kotaUmk.trim().toUpperCase(),
            nilaiUmk
          };
        }
        return m;
      });
      onSetMasterUmkList(updatedList);
      onWriteLog(
        `Ubah Master UMK: ${subDivision}`,
        '-',
        `Original: Rp ${original?.nilaiUmk.toLocaleString('id-ID')} (${original?.skema})`,
        `Baru: Rp ${nilaiUmk.toLocaleString('id-ID')} (${skema})`
      );
      setSuccessMsg('Konfigurasi UMK berhasil diperbarui.');
      resetForm();
    } else {
      // Addition Mode
      // Check for duplicated Division + Sub Division + Skema
      const isDuplicate = masterUmkList.some(
        m => m.division.toUpperCase() === division.trim().toUpperCase() && 
             m.subDivision.toUpperCase() === subDivision.trim().toUpperCase() &&
             m.skema === skema
      );
      if (isDuplicate) {
        setFormError('Konfigurasi untuk kombinasi Division, Sub Division & Skema tersebut sudah terdaftar.');
        return;
      }

      const newMapping: MasterUmkMapping = {
        id: `umk-custom-${Date.now()}`,
        division: division.trim().toUpperCase(),
        subDivision: subDivision.trim().toUpperCase(),
        skema,
        kotaUmk: kotaUmk.trim().toUpperCase(),
        nilaiUmk
      };

      onSetMasterUmkList(prev => [newMapping, ...prev]);
      onWriteLog(
        `Tambah Master UMK: ${subDivision}`,
        '-',
        '-',
        `UMK: Rp ${nilaiUmk.toLocaleString('id-ID')} / Skema: ${skema}`
      );
      setSuccessMsg('Kombinasi UMK Baru berhasil ditambahkan.');
      resetForm();
    }
  };

  const handleEdit = (item: MasterUmkMapping) => {
    setEditingId(item.id);
    setDivision(item.division);
    setSubDivision(item.subDivision);
    setSkema(item.skema);
    setKotaUmk(item.kotaUmk);
    setNilaiUmk(item.nilaiUmk);
    setFormError('');
    setSuccessMsg('');
  };

  const handleDelete = (id: string, divName: string, subDivName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus konfigurasi UMK untuk [${divName} - ${subDivName}]?`)) {
      onSetMasterUmkList(prev => prev.filter(m => m.id !== id));
      onWriteLog(
        `Hapus Master UMK: ${divName} - ${subDivName}`,
        '-',
        'ADA',
        'DIHAPUS'
      );
      setSuccessMsg('Konfigurasi berhasil dihapus.');
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang seluruh master UMK ke pengaturan bawaan sistem? Semua penyesuaian manual Anda akan digantikan.')) {
      onSetMasterUmkList(DEFAULT_UMK_MAPPINGS);
      onWriteLog('Reset Master UMK ke Setelan Bawaan', '-', 'CUSTOM', 'BAWAAN_SISTEM');
      setSuccessMsg('Berhasil disetel ulang ke bawaan sistem.');
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDivision('');
    setSubDivision('');
    setSkema('Daily');
    setKotaUmk('');
    setNilaiUmk(4541895);
  };

  return (
    <div className="space-y-6" id="master-umk-container">
      {/* Intro Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Master Database UMK 2026 (System Configuration)
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Gunakan panel ini untuk mengelola formula hitung ulang UMK (Pilihan B). 
              Sistem secara otomatis mengabaikan kolom UMK/HK dari file pengunggah dan menggantikannya dengan database master di bawah ini demi menghasilkan akurasi kepatuhan biaya 100%. Hari kerja (HK) dihitung fleksibel dinamis sesuai acuan berkas pengajuan.
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-755 text-slate-300 border border-slate-700 transition self-start md:self-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset ke Bawaan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Addition / Edition */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {editingId ? 'Edit Konfigurasi Master' : 'Tambah Konfigurasi Baru'}
            </h3>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-lg text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-405 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Division <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: JABAR 1, JABAR 2, JAKARTA"
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sub Division <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ANTERAJA - BANDUNG, MAYORA - CICALENGKA"
                  value={subDivision}
                  onChange={e => setSubDivision(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Skema <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={skema}
                    onChange={e => setSkema(e.target.value as 'Daily' | 'Ritase')}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Ritase">Ritase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Kota UMK / Kabupaten <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: KOTA BANDUNG"
                    value={kotaUmk}
                    onChange={e => setKotaUmk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-250 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nilai UMK (Rp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={nilaiUmk}
                  onChange={e => setNilaiUmk(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 font-mono text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                  IDR {nilaiUmk.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded shadow transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Tambah ke Master'}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded border border-slate-700 transition"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: List & Search Panel */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                  Daftar Master Aktif ({filteredMappings.length} Baris Terfilter)
                </h3>
                <p className="text-[10px] text-slate-500">
                  Total item terdaftar dalam system: {masterUmkList.length}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Cari divisi, sub-divisi, kota..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mappings Table */}
            <div className="overflow-x-auto border border-slate-800/85 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850">
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">DIVISION</th>
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUB DIVISION</th>
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKEMA</th>
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">KOTA UMK</th>
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">UMK 2026</th>
                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">OPERASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {filteredMappings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Tidak ada konfigurasi UMK yang ditemukan untuk kata kunci "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredMappings.map(item => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-900/40 transition duration-150 ${
                          editingId === item.id ? 'bg-indigo-950/20 border-l border-l-indigo-500' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-slate-300">
                          {item.division}
                        </td>
                        <td className="p-3 text-slate-100 font-semibold">
                          {item.subDivision}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            item.skema === 'Ritase' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.skema}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 uppercase font-medium">
                          {item.kotaUmk}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          Rp {item.nilaiUmk.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit"
                              className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.division, item.subDivision)}
                              title="Delete"
                              className="p-1 px-2 rounded bg-slate-800 hover:bg-rose-955/40 text-rose-400 hover:text-rose-300 border border-slate-700 hover:border-rose-900 transition cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Hint Box */}
            <div className="p-3 rounded-lg bg-indigo-950/15 border border-indigo-900/20 text-[11px] text-slate-450 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-455 shrink-0 mt-0.5" />
              <span>
                <strong>Bagaimana pencocokan (matching) bekerja?</strong> Saat berkas pengajuan direkonsiliasi, sistem akan secara otomatis melacak data <strong>Division</strong> dan <strong>Customer</strong> (sebagai <strong>Sub Division</strong>). Apabila ditemukan kesesuaian pada database di atas, perhitungan biaya harian untuk Driver akan secara presisi dijalankan menggunakan besaran nominal <strong>UMK</strong> yang tertera, bersanding secara fleksibel dengan Hari Kerja dari berkas pengajuan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
