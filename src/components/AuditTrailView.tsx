import React, { useState } from 'react';
import { AuditTrailEntry } from '../types';
import { History, Search, Trash2, Calendar, User, FileText } from 'lucide-react';

interface AuditTrailViewProps {
  auditLogs: AuditTrailEntry[];
  onClearLogs?: () => void;
}

export default function AuditTrailView({ auditLogs, onClearLogs }: AuditTrailViewProps) {
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (search.trim() === '') return true;
    const s = search.toLowerCase();
    return (
      log.user.toLowerCase().includes(s) ||
      log.aktivitas.toLowerCase().includes(s) ||
      log.jobOrderNo.toLowerCase().includes(s) ||
      log.statusLama.toLowerCase().includes(s) ||
      log.statusBaru.toLowerCase().includes(s)
    );
  });

  // Reverse list to show the most recent logs first
  const displayLogs = [...filteredLogs].reverse();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl" id="audit-trail-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Audit Trail Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rekam jejak aktivitas tim Driver Management dalam melakukan validasi, override status, dan pengelolaan dana operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              className="w-full bg-slate-950 text-slate-200 pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-slate-700"
              placeholder="Cari logs (User, JO, Aksi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1 px-3 bg-red-950/20 hover:bg-red-950 text-red-400 border border-red-900/40 rounded text-xs transition font-semibold"
            >
              Hapus Logs (Reset)
            </button>
          )}
        </div>
      </div>

      {displayLogs.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-800 rounded-lg text-center font-mono">
          <History className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-400">Log audit kosong</h3>
          <p className="text-xs text-slate-500 mt-1">
            Belum ada aktivitas terekam. Aktivitas validasi & perubahan status workflow akan terekam otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold font-mono">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Aktivitas/Aksi</th>
                <th className="py-3 px-4">Referensi JO</th>
                <th className="py-3 px-4">Status Lama</th>
                <th className="py-3 px-4">Status Baru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px] text-slate-300">
              {displayLogs.map((log) => {
                let badgeLama = 'bg-slate-950/40 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-800';
                let badgeBaru = 'bg-slate-950/40 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-800';

                if (log.statusLama.toUpperCase() === 'REVIEW') badgeLama = 'bg-amber-950/40 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-900/30';
                if (log.statusLama.toUpperCase() === 'APPROVED') badgeLama = 'bg-emerald-950/40 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-900/30';
                if (log.statusLama.toUpperCase() === 'PAID') badgeLama = 'bg-blue-950/40 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-900/30';

                if (log.statusBaru.toUpperCase() === 'REVIEW') badgeBaru = 'bg-amber-950/40 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-900/30 font-bold';
                if (log.statusBaru.toUpperCase() === 'APPROVED') badgeBaru = 'bg-emerald-950/40 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-900/30 font-bold';
                if (log.statusBaru.toUpperCase() === 'PAID') badgeBaru = 'bg-blue-950/40 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-900/30 font-bold';

                return (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition duration-100">
                    <td className="py-3 px-4 text-slate-400 font-normal">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400/85" />
                        {log.user}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {log.aktivitas}
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">
                      {log.jobOrderNo !== '-' ? (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {log.jobOrderNo}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {log.statusLama !== '-' ? (
                        <span className={badgeLama}>{log.statusLama}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {log.statusBaru !== '-' ? (
                        <span className={badgeBaru}>{log.statusBaru}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
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
