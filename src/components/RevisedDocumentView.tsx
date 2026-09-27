import React, { useState } from 'react';
import {
  TurnitinReport,
  ParagraphAnalysis
} from '../types/turnitin';
import {
  calculateProjectedSimilarity,
  getSimilarityColor,
  downloadFile
} from '../utils/turnitinUtils';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  FileText,
  TrendingDown
} from 'lucide-react';

interface RevisedDocumentViewProps {
  report: TurnitinReport;
  acceptedMap: Record<number, boolean>;
  customTexts: Record<number, string>;
  onRecheckWithNewText: (text: string) => void;
  onBackToParaphrase: () => void;
}

export const RevisedDocumentView: React.FC<RevisedDocumentViewProps> = ({
  report,
  acceptedMap,
  customTexts,
  onRecheckWithNewText,
  onBackToParaphrase,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRevisionHighlights, setShowRevisionHighlights] = useState(true);

  const initialScore = report.overallSimilarity;
  const projectedScore = calculateProjectedSimilarity(initialScore, report.paragraphs, acceptedMap);
  const initialMeta = getSimilarityColor(initialScore);
  const projectedMeta = getSimilarityColor(projectedScore);

  // Construct full revised text
  const revisedParagraphs = (report.paragraphs || []).map((p) => {
    const isAccepted = acceptedMap[p.index];
    const text = isAccepted
      ? customTexts[p.index] || p.suggestedParaphrase || p.originalText
      : p.originalText;
    return {
      ...p,
      isRevised: isAccepted,
      finalText: text,
    };
  });

  const fullRevisedText = revisedParagraphs.map((p) => p.finalText).join('\n\n');
  const wordCount = fullRevisedText.trim().split(/\s+/).filter(Boolean).length;
  const revisedCount = revisedParagraphs.filter((p) => p.isRevised).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullRevisedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const filename = `${report.documentTitle.replace(/\s+/g, '_')}_Revisi_Turnitin.txt`;
    downloadFile(filename, fullRevisedText);
  };

  const handleDownloadDoc = () => {
    // Generate clean HTML-based doc format that Word opens seamlessly
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${report.documentTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
          h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 24pt; }
          p { text-align: justify; text-indent: 0.5in; margin-bottom: 12pt; }
          .header-info { text-align: center; font-size: 10pt; color: #555; margin-bottom: 24pt; }
        </style>
      </head>
      <body>
        <h1>${report.documentTitle}</h1>
        <div class="header-info">
          Penulis: ${report.documentAuthor} | Institusi: ${report.institution} | Hasil Revisi Parafrase Turnitin (Similaritas: ${projectedScore}%)
        </div>
        ${revisedParagraphs.map((p) => `<p>${p.finalText}</p>`).join('\n')}
      </body>
      </html>
    `;
    const filename = `${report.documentTitle.replace(/\s+/g, '_')}_Revisi.doc`;
    downloadFile(filename, docContent, 'application/msword');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dokumen Telah Sukses Diparafrase Akademis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hasil Dokumen Revisi Siap Diajukan
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
              Sebanyak <strong>{revisedCount} paragraf kunci</strong> telah dimutakhirkan. Indeks similaritas Turnitin berhasil dipangkas drastis ke zona aman.
            </p>
          </div>

          {/* Before vs After Metric Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 self-stretch md:self-auto">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200 block mb-1">
              Perubahan Similaritas
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold line-through text-red-200">
                {initialScore}%
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className="text-4xl font-black text-white">
                {projectedScore}%
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Turun {Math.max(0, initialScore - projectedScore)}%</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-700" />
                  <span>Salin Seluruh Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Microsoft Word (.doc)</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/20"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh .txt</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

          <button
            onClick={() => onRecheckWithNewText(fullRevisedText)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Uji Ulang Dokumen Baru Ini</span>
          </button>
        </div>
      </div>

      {/* Verification Notice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Sertifikasi Perbaikan Keaslian Naskah Ilmiah
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Dokumen: <strong>{report.documentTitle}</strong> &bull; Total Kata:{' '}
              {wordCount.toLocaleString('id-ID')} kata &bull; Status:{' '}
              <span className="text-emerald-700 font-bold">Lolos Uji Toleransi Turnitin (&le; 20%)</span>
            </p>
          </div>
        </div>

        {/* Toggle Highlights */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showRevisionHighlights}
            onChange={(e) => setShowRevisionHighlights(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Tandai Paragraf yang Diparafrase</span>
        </label>
      </div>

      {/* Complete Revised Document Body */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12">
        {/* Academic Paper Cover Info */}
        <div className="text-center mb-10 pb-8 border-b border-slate-200">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-2">
            Naskah Hasil Revisi Parafrase
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-tight">
            {report.documentTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-3 font-serif italic">
            Oleh: {report.documentAuthor} &bull; {report.institution}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Indeks Similaritas Proyeksi: {projectedScore}% (Aman & Lolos)</span>
          </div>
        </div>

        {/* Paragraphs */}
        <div className="space-y-6 font-serif text-[16px] leading-[1.8] text-slate-900 text-justify max-w-3xl mx-auto">
          {revisedParagraphs.map((p) => (
            <div
              key={p.index}
              className={`p-3 rounded-xl transition-all ${
                showRevisionHighlights && p.isRevised
                  ? 'bg-emerald-50/50 border border-emerald-200/80'
                  : ''
              }`}
            >
              {showRevisionHighlights && p.isRevised && (
                <div className="not-italic font-sans text-[11px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>¶ Paragraf {p.index} (Telah Diparafrase)</span>
                </div>
              )}
              <p className="indent-8">{p.finalText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBackToParaphrase}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          &larr; Kembali ke Asisten Parafrase
        </button>

        <button
          onClick={handleCopy}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Copy className="w-4 h-4" />
          <span>{copied ? 'Tersalin!' : 'Salin Semua Teks'}</span>
        </button>
      </div>
    </div>
  );
};
