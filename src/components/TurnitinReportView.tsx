import React, { useState } from 'react';
import {
  TurnitinReport,
  MatchedSource,
  ParagraphAnalysis
} from '../types/turnitin';
import {
  getSimilarityColor,
  getSourceColor
} from '../utils/turnitinUtils';
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  Info,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface TurnitinReportViewProps {
  report: TurnitinReport;
  onGoToParaphrase: (paragraphIndex?: number) => void;
  onGoToRevised: () => void;
  acceptedParaphrasesCount: number;
}

export const TurnitinReportView: React.FC<TurnitinReportViewProps> = ({
  report,
  onGoToParaphrase,
  onGoToRevised,
  acceptedParaphrasesCount,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphAnalysis | null>(null);
  const [sideTab, setSideTab] = useState<'sources' | 'paragraphs'>('sources');

  const similarityMeta = getSimilarityColor(report.overallSimilarity);

  // Filter sources if needed
  const sources = report.sources || [];
  const paragraphs = report.paragraphs || [];

  // Critical & high priority paragraphs count
  const criticalParagraphs = paragraphs.filter(
    (p) => p.paraphrasePriority.includes('Tinggi') || p.paraphrasePriority.includes('Kritis')
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Turnitin Official Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 print:p-0 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                Turnitin Originality Report
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ID Pengajuan: {report.submissionId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.documentTitle}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Penulis: <span className="font-semibold text-slate-800">{report.documentAuthor}</span> &bull; Institusi: <span className="text-slate-700">{report.institution}</span> &bull; Tanggal Uji: {new Date(report.checkDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Action buttons (Print & Paraphrase) */}
          <div className="flex items-center gap-2.5 self-stretch md:self-auto print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak / Ekspor PDF</span>
            </button>

            <button
              onClick={() => onGoToParaphrase()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Mulai Parafrase ({criticalParagraphs.length} Kritis)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Turnitin Similarity Gauge & Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
          {/* Main Similarity Score Box */}
          <div className="md:col-span-4 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Similarity Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-5xl font-black tracking-tight ${similarityMeta.textClass}`}>
                    {report.overallSimilarity}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${similarityMeta.badgeClass}`}>
                    {similarityMeta.name}
                  </span>
                </div>
              </div>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${similarityMeta.badgeClass} shadow-xs`}>
                {report.overallSimilarity < 25 ? (
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-700 leading-snug">
                {similarityMeta.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Batas umum toleransi kelulusan skripsi/tesis di universitas Indonesia: &le; 20% - 25%.
              </p>
            </div>
          </div>

          {/* Source Breakdown (Turnitin Trinity) */}
          <div className="md:col-span-4 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
              Distribusi Pangkalan Data Turnitin
            </span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Internet Sources</span>
                  </span>
                  <span className="text-blue-700 font-bold">{report.similarityBreakdown.internetSources}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report.similarityBreakdown.internetSources)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                    <span>Publications & Journals</span>
                  </span>
                  <span className="text-purple-700 font-bold">{report.similarityBreakdown.publications}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report.similarityBreakdown.publications)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Student Papers</span>
                  </span>
                  <span className="text-emerald-700 font-bold">{report.similarityBreakdown.studentPapers}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report.similarityBreakdown.studentPapers)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Document Scope */}
          <div className="md:col-span-4 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Parameter Dokumen
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Jumlah Kata:</span>
                <span className="text-sm font-bold text-slate-800">{report.wordCount.toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Karakter:</span>
                <span className="text-sm font-bold text-slate-800">{report.characterCount.toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total Paragraf:</span>
                <span className="text-sm font-bold text-slate-800">{paragraphs.length} Paragraf</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Sumber Terdeteksi:</span>
                <span className="text-sm font-bold text-red-600">{sources.length} Sumber</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Filter: Exclude Quotes (Aktif)</span>
              <span>&bull;</span>
              <span>Exclude Biblio (Aktif)</span>
            </div>
          </div>
        </div>

        {/* Paraphrase Target Callout Banner */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-emerald-500/10 border border-amber-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Target Penurunan Plagiarisme: {report.overallSimilarity}% &rarr;{' '}
                <span className="text-emerald-700 font-extrabold underline">
                  ~{report.safeTargetEstimate || 8}% (Zona Hijau Lolos)
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {criticalParagraphs.length > 0
                  ? `Sistem mendeteksi ${criticalParagraphs.length} paragraf berkontribusi paling masif. Parafrase paragraf ini untuk memangkas similaritas seketika.`
                  : 'Dokumen Anda sudah memiliki tingkat kemiripan rendah.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onGoToParaphrase()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Buka Asisten Parafrase Kritis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Content: Document Text Viewer & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols): Originality Document Viewer */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                Teks Dokumen & Sorotan Kemiripan
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
              <span>Warna menandai sumber yang cocok</span>
            </div>
          </div>

          {/* Paragraph by Paragraph Viewer with Turnitin highlight styling */}
          <div className="space-y-6 font-serif leading-relaxed text-slate-800 text-[15px]">
            {paragraphs.map((para) => {
              const sourceColor = para.primarySourceId
                ? getSourceColor(para.primarySourceId)
                : getSourceColor(1);

              const isCritical =
                para.paraphrasePriority.includes('Tinggi') ||
                para.paraphrasePriority.includes('Kritis');

              const isHighlightedBySource =
                selectedSourceId === null || para.primarySourceId === selectedSourceId;

              return (
                <div
                  key={para.index}
                  id={`paragraph-${para.index}`}
                  className={`p-4 rounded-xl border transition-all relative ${
                    selectedParagraph?.index === para.index
                      ? 'ring-2 ring-red-500 border-red-300 bg-red-50/20'
                      : isHighlightedBySource && para.isPlagiarized
                      ? 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                      : 'border-transparent'
                  }`}
                >
                  {/* Paragraph Header Badge */}
                  <div className="flex items-center justify-between mb-2 not-italic font-sans text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500">¶ Paragraf {para.index}</span>

                      {para.isPlagiarized ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                            isCritical
                              ? 'bg-red-100 text-red-800 border border-red-200 font-bold'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Similaritas: {para.similarityScore}% &bull; Prioritas {para.paraphrasePriority}
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          Bersih / Orisinil (&le; 10%)
                        </span>
                      )}
                    </div>

                    {para.isPlagiarized && (
                      <button
                        onClick={() => onGoToParaphrase(para.index)}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Parafrase Paragraf Ini</span>
                      </button>
                    )}
                  </div>

                  {/* Paragraph Body with Turnitin-style colored highlight tags */}
                  <div className="text-justify text-slate-800">
                    {para.isPlagiarized ? (
                      <span
                        onClick={() => setSelectedParagraph(para)}
                        className={`cursor-pointer rounded px-1.5 py-0.5 transition-colors inline ${
                          sourceColor.bg
                        } ${sourceColor.text} border-b-2 ${sourceColor.border}`}
                        title={`Klik untuk detail kecocokan sumber #${para.primarySourceId || 1}`}
                      >
                        <sup className={`font-mono font-bold px-1 py-0.2 rounded mr-1 ${sourceColor.badge}`}>
                          [{para.primarySourceId || 1}]
                        </sup>
                        {para.originalText}
                      </span>
                    ) : (
                      <span>{para.originalText}</span>
                    )}
                  </div>

                  {/* Impact note if high */}
                  {isCritical && (
                    <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center gap-2 text-xs font-sans text-red-700 font-medium">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{para.impactDescription}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Turnitin Match Inspector & Source List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Paragraph Match Inspector Card (if clicked) */}
          {selectedParagraph && (
            <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl border border-red-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Inspeksi Kecocokan ¶ Paragraf {selectedParagraph.index}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedParagraph(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  &times; Tutup
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-red-200/60">
                  <span className="text-slate-600">Tingkat Kemiripan:</span>
                  <span className="font-bold text-red-700">{selectedParagraph.similarityScore}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-red-200/60">
                  <span className="text-slate-600">Prioritas Parafrase:</span>
                  <span className="font-bold text-slate-800">{selectedParagraph.paraphrasePriority}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-600 block mb-1">Dampak Perbaikan:</span>
                  <span className="text-slate-800 font-medium">{selectedParagraph.impactDescription}</span>
                </div>
              </div>

              <button
                onClick={() => onGoToParaphrase(selectedParagraph.index)}
                className="w-full mt-4 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka Rekomendasi Parafrase Segera</span>
              </button>
            </div>
          )}

          {/* Side Tab Switcher */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 text-xs font-semibold">
              <button
                onClick={() => setSideTab('sources')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  sideTab === 'sources'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-red-600" />
                <span>Sumber Utama ({sources.length})</span>
              </button>
              <button
                onClick={() => setSideTab('paragraphs')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  sideTab === 'paragraphs'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Urutan Parafrase ({paragraphs.filter(p => p.isPlagiarized).length})</span>
              </button>
            </div>

            {/* TAB 1: Sources List (Authentic Turnitin Primary Sources) */}
            {sideTab === 'sources' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Klik nomor sumber untuk memfilter teks</span>
                  {selectedSourceId && (
                    <button
                      onClick={() => setSelectedSourceId(null)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {sources.map((src) => {
                    const colorMeta = getSourceColor(src.id);
                    const isSelected = selectedSourceId === src.id;

                    return (
                      <div
                        key={src.id}
                        onClick={() => setSelectedSourceId(isSelected ? null : src.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50/50 shadow-xs ring-1 ring-red-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${colorMeta.badge}`}
                            >
                              {src.id}
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                                {src.name}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                <span>{src.type}</span>
                                <span>&bull;</span>
                                <span className="text-slate-400 truncate max-w-[120px]">{src.url}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-slate-800">
                              {src.percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Ranked Paragraphs for Paraphrase */}
            {sideTab === 'paragraphs' && (
              <div className="p-4 space-y-2.5">
                <p className="text-xs text-slate-500">
                  Daftar paragraf diurutkan berdasarkan kontribusi persentase plagiarisme terbesar:
                </p>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {paragraphs
                    .filter((p) => p.isPlagiarized)
                    .sort((a, b) => b.similarityScore - a.similarityScore)
                    .map((p) => {
                      const isCritical =
                        p.paraphrasePriority.includes('Tinggi') ||
                        p.paraphrasePriority.includes('Kritis');

                      return (
                        <div
                          key={p.index}
                          onClick={() => onGoToParaphrase(p.index)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                            isCritical
                              ? 'border-red-200 bg-red-50/40 hover:bg-red-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-800">
                              ¶ Paragraf {p.index}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                              }`}
                            >
                              {p.similarityScore}% mirip
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 italic font-serif">
                            "{p.originalText}"
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-red-700">{p.paraphrasePriority}</span>
                            <span className="text-slate-500 flex items-center gap-0.5">
                              Parafrase <ChevronRight className="w-3 h-3 text-red-600" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Quick status if paraphrases have been accepted */}
          {acceptedParaphrasesCount > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>{acceptedParaphrasesCount}</strong> paragraf telah diparafrase.
                </span>
              </div>
              <button
                onClick={onGoToRevised}
                className="font-bold underline text-emerald-900"
              >
                Lihat Hasil Dokumen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
