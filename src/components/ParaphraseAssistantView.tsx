import React, { useState } from 'react';
import {
  TurnitinReport,
  ParagraphAnalysis
} from '../types/turnitin';
import {
  calculateProjectedSimilarity,
  getSimilarityColor
} from '../utils/turnitinUtils';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Check,
  Zap,
  TrendingDown,
  Info,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface ParaphraseAssistantViewProps {
  report: TurnitinReport;
  acceptedMap: Record<number, boolean>;
  onToggleAccept: (paragraphIndex: number) => void;
  onAcceptAllCritical: () => void;
  onUpdateParagraphText: (paragraphIndex: number, newText: string) => void;
  onGoToRevised: () => void;
  targetParagraphIndex?: number | null;
}

export const ParaphraseAssistantView: React.FC<ParaphraseAssistantViewProps> = ({
  report,
  acceptedMap,
  onToggleAccept,
  onAcceptAllCritical,
  onUpdateParagraphText,
  onGoToRevised,
  targetParagraphIndex,
}) => {
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'accepted'>('all');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<Record<number, string>>({});
  const [editingTexts, setEditingTexts] = useState<Record<number, string>>({});

  const initialScore = report.overallSimilarity;
  const projectedScore = calculateProjectedSimilarity(initialScore, report.paragraphs, acceptedMap);
  const initialMeta = getSimilarityColor(initialScore);
  const projectedMeta = getSimilarityColor(projectedScore);

  const plagiarizedParagraphs = (report.paragraphs || []).filter((p) => p.isPlagiarized);
  const criticalParagraphs = plagiarizedParagraphs.filter(
    (p) => p.paraphrasePriority.includes('Tinggi') || p.paraphrasePriority.includes('Kritis')
  );

  const acceptedCount = Object.values(acceptedMap).filter(Boolean).length;
  const totalFixable = plagiarizedParagraphs.length;
  const isSafeZone = projectedScore <= 20;

  // Handle custom paraphrase regeneration
  const handleRegenerate = async (para: ParagraphAnalysis) => {
    setRegeneratingIndex(para.index);
    const style = selectedStyles[para.index] || 'akademis_formal';

    try {
      const response = await fetch('/api/paraphrase-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: para.originalText,
          style,
          focus: 'maksimal_turun',
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal melakukan parafrase.');
      }

      const data = await response.json();
      if (data.paraphrasedText) {
        onUpdateParagraphText(para.index, data.paraphrasedText);
        setEditingTexts((prev) => ({ ...prev, [para.index]: data.paraphrasedText }));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memparafrase ulang.');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // Filter paragraphs
  const displayedParagraphs = plagiarizedParagraphs.filter((p) => {
    if (filterPriority === 'critical') {
      return p.paraphrasePriority.includes('Tinggi') || p.paraphrasePriority.includes('Kritis');
    }
    if (filterPriority === 'accepted') {
      return acceptedMap[p.index];
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Live Plagiarism Reduction Meter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Smart Paraphrase Priority Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Panduan Parafrase Penurun Plagiarisme
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Terapkan parafrase pada paragraf berprioritas tinggi di bawah ini. Indeks similaritas Turnitin akan turun secara drastis hingga mencapai batas hijau aman.
            </p>
          </div>

          {/* 1-Click Batch Fix Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onAcceptAllCritical}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Terapkan Semua Parafrase Kritis ({criticalParagraphs.length} Paragraf)</span>
            </button>

            {acceptedCount > 0 && (
              <button
                onClick={onGoToRevised}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                <span>Lihat Dokumen Hasil Revisi ({acceptedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Similarity Score Drop Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
          {/* Before Score */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Skor Similaritas Awal
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-4xl font-black ${initialMeta.textClass}`}>
                {initialScore}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${initialMeta.badgeClass}`}>
                {initialMeta.name}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Sebelum dilakukan parafrase
            </span>
          </div>

          {/* Drop Indicator */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs mb-2">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              <span>
                Turun sebesar {Math.max(0, initialScore - projectedScore)}%
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {acceptedCount} dari {totalFixable} paragraf telah diparafrase
            </p>
            {isSafeZone ? (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LOLOS STANDAR AKADEMIK (&le; 20%)</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 font-medium mt-1">
                Target kelulusan: &le; 20%
              </span>
            )}
          </div>

          {/* Projected Score */}
          <div className={`rounded-2xl p-4 border text-center transition-all ${
            isSafeZone
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-amber-50/70 border-amber-300'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Proyeksi Skor Setelah Parafrase
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-4xl font-black ${projectedMeta.textClass}`}>
                {projectedScore}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${projectedMeta.badgeClass}`}>
                {projectedMeta.name}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1 block">
              {isSafeZone ? 'Aman untuk Diajukan ke Dosen / Repository' : 'Lanjutkan parafrase paragraf berikutnya'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterPriority === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Semua Paragraf Mirip ({plagiarizedParagraphs.length})
          </button>

          <button
            onClick={() => setFilterPriority('critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterPriority === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 hover:text-red-900 bg-red-50 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Prioritas Kritis ({criticalParagraphs.length})</span>
          </button>

          <button
            onClick={() => setFilterPriority('accepted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterPriority === 'accepted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Telah Diterapkan ({acceptedCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Klik "Terapkan Parafrase Ini" untuk memasukkannya ke dokumen akhir</span>
        </div>
      </div>

      {/* Paragraph Paraphrase Comparison Cards */}
      <div className="space-y-6">
        {displayedParagraphs.map((para) => {
          const isAccepted = !!acceptedMap[para.index];
          const isCritical =
            para.paraphrasePriority.includes('Tinggi') ||
            para.paraphrasePriority.includes('Kritis');
          const isTargeted = targetParagraphIndex === para.index;
          const currentRevisedText = editingTexts[para.index] || para.suggestedParaphrase;
          const isRegenerating = regeneratingIndex === para.index;

          return (
            <div
              key={para.index}
              id={`para-editor-${para.index}`}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isTargeted
                  ? 'ring-2 ring-amber-500 border-amber-300 shadow-md'
                  : isAccepted
                  ? 'border-emerald-300 bg-white shadow-xs'
                  : isCritical
                  ? 'border-red-200 bg-white shadow-xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Card Header Bar */}
              <div
                className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAccepted
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isCritical
                    ? 'bg-red-50/70 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900">
                    ¶ Paragraf {para.index}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    Similaritas: {para.similarityScore}%
                  </span>

                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isCritical
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Prioritas {para.paraphrasePriority}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{para.impactDescription}</span>
                  </span>

                  <button
                    onClick={() => onToggleAccept(para.index)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      isAccepted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Parafrase Diterapkan</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Terapkan Parafrase Ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* LEFT BOX: Original Plagiarized Text (5 cols) */}
                <div className="lg:col-span-5 p-5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <span>Teks Asli (Terdeteksi Plagiat)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Sumber Utama #{para.primarySourceId || 1}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 text-sm font-serif leading-relaxed text-justify">
                    <p>{para.originalText}</p>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Masalah:</span> Banyak kesamaan leksikal dan pola klausa berurutan dengan publikasi sebelumnya.
                  </div>
                </div>

                {/* RIGHT BOX: Recommended Paraphrase (7 cols) */}
                <div className="lg:col-span-7 p-5 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rekomendasi Parafrase Ilmiah (Proyeksi Kemiripan ~3%)</span>
                    </span>

                    {/* Style selector */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedStyles[para.index] || 'akademis_formal'}
                        onChange={(e) =>
                          setSelectedStyles((prev) => ({
                            ...prev,
                            [para.index]: e.target.value,
                          }))
                        }
                        className="text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-700 font-medium"
                      >
                        <option value="akademis_formal">Formal Akademis</option>
                        <option value="rekonstruksi_total">Rekonstruksi Total</option>
                        <option value="sintesis_analitis">Sintesis Kritis</option>
                        <option value="padat_ringkas">Padat & Ringkas</option>
                      </select>

                      <button
                        onClick={() => handleRegenerate(para)}
                        disabled={isRegenerating}
                        title="Regenerasi Parafrase dengan Gaya Baru"
                        className="px-2 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>Ubah</span>
                      </button>
                    </div>
                  </div>

                  {/* Editable Paraphrase Textarea / Preview */}
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={currentRevisedText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingTexts((prev) => ({ ...prev, [para.index]: val }));
                        onUpdateParagraphText(para.index, val);
                      }}
                      className="w-full rounded-xl border border-emerald-300 bg-emerald-50/20 focus:bg-white p-3.5 text-sm text-slate-900 font-serif leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />

                    {isRegenerating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <RotateCcw className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Menyusun Parafrase Akademis Baru...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation of changes */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Teknik Parafrase yang Diterapkan:
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {para.paraphraseExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              Proyeksi Akhir: {projectedScore}% Similaritas (Turun {Math.max(0, initialScore - projectedScore)}%)
            </h4>
            <p className="text-xs text-slate-500">
              {acceptedCount} dari {totalFixable} paragraf telah disetujui untuk dokumen revisi.
            </p>
          </div>
        </div>

        <button
          onClick={onGoToRevised}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Buka & Unduh Dokumen Hasil Revisi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
