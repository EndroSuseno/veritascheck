import React from 'react';
import { ShieldCheck, FileText, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'report' | 'paraphrase' | 'revised';
  setActiveTab: (tab: 'upload' | 'report' | 'paraphrase' | 'revised') => void;
  hasReport: boolean;
  onReset: () => void;
  overallSimilarity?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasReport,
  onReset,
  overallSimilarity,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(hasReport ? 'report' : 'upload')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Veritas<span className="text-red-600">Check</span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Turnitin Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Deteksi Originalitas & Asisten Parafrase Penurun Plagiarisme
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Unggah Dokumen</span>
            </button>

            {hasReport && (
              <>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'report'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Laporan Turnitin</span>
                  {overallSimilarity !== undefined && (
                    <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                      {overallSimilarity}%
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('paraphrase')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'paraphrase'
                      ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold">Asisten Parafrase</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('revised')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'revised'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Hasil Revisi</span>
                </button>
              </>
            )}

            {hasReport && (
              <button
                onClick={onReset}
                title="Mulai Dokumen Baru"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
