import React, { useState } from 'react';
import { CostTypeFormula } from '../types';
import { Settings, Plus, Info, LayoutTemplate, Save, Trash, Shuffle } from 'lucide-react';

interface FormulaEngineViewProps {
  formulas: CostTypeFormula[];
  onAddFormula: (newFormula: CostTypeFormula) => void;
  onDeleteFormula: (costType: string) => void;
}

export default function FormulaEngineView({ formulas, onAddFormula, onDeleteFormula }: FormulaEngineViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [costType, setCostType] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [type, setType] = useState<'formula' | 'route' | 'manual' | 'custom'>('formula');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costType || !formulaName || !formulaExpression) {
      setError('Mohon isi semua field wajib.');
      return;
    }

    const uppercaseCostType = costType.trim().toUpperCase();

    // Check pre-existence
    if (formulas.some(f => f.costType.toUpperCase() === uppercaseCostType)) {
      setError(`Cost Type "${uppercaseCostType}" sudah tersedia.`);
      return;
    }

    const newFormula: CostTypeFormula = {
      costType: uppercaseCostType,
      formulaName: formulaName.trim(),
      formulaExpression: formulaExpression.trim(),
      type,
      description: description.trim() || 'Formula kustom yang didefinisikan secara dinamis.'
    };

    onAddFormula(newFormula);

    // Reset Form
    setCostType('');
    setFormulaName('');
    setFormulaExpression('');
    setType('formula');
    setDescription('');
    setError('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl" id="formula-engine-panel">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-indigo-400" />
            Dynamic Formula Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi rumus perhitungan uang jalan (fee) driver dinamis tanpa memodifikasi source-code aplikasi.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold rounded text-xs transition"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Tutup Form' : 'Cost Type Baru'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border border-indigo-900/35 rounded-xl mb-6 space-y-4">
          <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Tambah Kategori Cost Type Baru
          </h3>

          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-900 text-rose-400 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Cost Type Name (e.g. FEE PROJECT) *
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded border border-slate-800 focus:outline-none focus:border-slate-700 font-mono"
                placeholder="FEE_PROJECT_MOCK"
                value={costType}
                onChange={e => setCostType(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Nama Aturan Formula *
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded border border-slate-800 focus:outline-none focus:border-slate-700"
                placeholder="Rasio Project Khusus"
                value={formulaName}
                onChange={e => setFormulaName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Tipe Komputasi *
              </label>
              <select
                className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded border border-slate-800 focus:outline-none focus:border-slate-700"
                value={type}
                onChange={e => setType(e.target.value as any)}
              >
                <option value="formula">Formula Matematika Matematik UMK</option>
                <option value="route">Rute Flat Cost (Flat)</option>
                <option value="manual">Manual Input (Draft Override)</option>
                <option value="custom">Formula Custom Ad-Hoc</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Ekspresi Rumusan Rumus *
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded border border-slate-800 focus:outline-none focus:border-slate-700 font-mono"
                placeholder="ROUNDUP((UMK / HK) * Durasi, -3) ATAU nominal murni 175000"
                value={formulaExpression}
                onChange={e => setFormulaExpression(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Catatan Deskripsi Formula
            </label>
            <textarea
              className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded border border-slate-800 focus:outline-none focus:border-slate-700"
              placeholder="Berikan keterangan mengenai skema klaim fee ini"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-50 font-bold rounded text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Formula
            </button>
          </div>
        </form>
      )}

      {/* Formulas List Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formulas.map((frm) => (
          <div 
            key={frm.costType} 
            id={`formula-card-${frm.costType}`}
            className="p-4 rounded-xl border border-slate-850 bg-slate-950 flex flex-col justify-between hover:border-slate-800 transition"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] bg-indigo-950/60 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-mono font-bold tracking-tight">
                  {frm.costType}
                </span>
                
                {/* Prevent deletion of essential predefined categories */}
                {frm.costType !== 'FEE FREELANCE' && frm.costType !== 'FEE PENGEMUDI' && frm.costType !== 'FEE ROUTE' && frm.costType !== 'FEE KHUSUS' && (
                  <button
                    onClick={() => onDeleteFormula(frm.costType)}
                    className="p-1 rounded bg-rose-950/20 hover:bg-rose-950 text-rose-500 border border-rose-900/30 transition"
                    title="Hapus Cost Type"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-250 mb-1">{frm.formulaName}</h4>
              <p className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-850 mt-2 text-center text-indigo-300 font-semibold leading-relaxed break-all">
                {frm.formulaExpression}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center gap-1.5 text-[10px] text-slate-550 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{frm.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
