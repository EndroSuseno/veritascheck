import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { TurnitinReportView } from './components/TurnitinReportView';
import { ParaphraseAssistantView } from './components/ParaphraseAssistantView';
import { RevisedDocumentView } from './components/RevisedDocumentView';
import { TurnitinReport, CheckOptions } from './types/turnitin';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'report' | 'paraphrase' | 'revised'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [report, setReport] = useState<TurnitinReport | null>(null);
  const [acceptedMap, setAcceptedMap] = useState<Record<number, boolean>>({});
  const [customTexts, setCustomTexts] = useState<Record<number, string>>({});
  const [targetParagraphIndex, setTargetParagraphIndex] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, options: CheckOptions) => {
    setIsLoading(true);
    setAnalysisError(null);
    setLoadingStep('Memecah struktur paragraf dan n-gram kalimat...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Memindai 99+ miliar halaman internet & repositori tugas...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Mencocokkan publikasi jurnal ilmiah & database repositori kampus...');
    }, 3200);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep('Menghitung indeks similaritas dan merancang strategi parafrase...');
    }, 5000);

    try {
      const response = await fetch('/api/check-plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title: options.title,
          author: options.author,
          institution: options.institution,
          excludeQuotes: options.excludeQuotes,
          excludeBibliography: options.excludeBibliography,
          excludeSmallMatches: options.excludeSmallMatches,
          documentType: options.documentType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menganalisis plagiarisme.');
      }

      const data: TurnitinReport = await response.json();
      setReport(data);

      // Pre-initialize accepted map (empty at first so user can experience the reduction)
      setAcceptedMap({});
      setCustomTexts({});
      setActiveTab('report');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Terjadi gangguan saat memproses dokumen.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
    }
  };

  const handleToggleAccept = (index: number) => {
    setAcceptedMap((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAcceptAllCritical = () => {
    if (!report) return;
    const newMap: Record<number, boolean> = { ...acceptedMap };
    report.paragraphs.forEach((p) => {
      if (
        p.isPlagiarized &&
        (p.paraphrasePriority.includes('Tinggi') ||
          p.paraphrasePriority.includes('Kritis') ||
          p.similarityScore > 25)
      ) {
        newMap[p.index] = true;
      }
    });
    setAcceptedMap(newMap);
  };

  const handleUpdateParagraphText = (index: number, newText: string) => {
    setCustomTexts((prev) => ({
      ...prev,
      [index]: newText,
    }));
  };

  const handleGoToParaphrase = (index?: number) => {
    if (index !== undefined) {
      setTargetParagraphIndex(index);
    }
    setActiveTab('paraphrase');
    if (index !== undefined) {
      setTimeout(() => {
        const el = document.getElementById(`para-editor-${index}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const handleReset = () => {
    if (window.confirm('Mulai analisis dokumen baru? Data laporan saat ini akan direset.')) {
      setReport(null);
      setAcceptedMap({});
      setCustomTexts({});
      setTargetParagraphIndex(null);
      setAnalysisError(null);
      setActiveTab('upload');
    }
  };

  const acceptedCount = Object.values(acceptedMap).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasReport={!!report}
        onReset={handleReset}
        overallSimilarity={report?.overallSimilarity}
      />

      <main className="flex-1">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-red-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Audit Keaslian Turnitin Sedang Berjalan
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Engine: Turnitin Originality & Paraphrase AI
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                  <Cpu className="w-4 h-4 text-red-600 animate-spin" />
                  <span>{loadingStep || 'Menganalisis dokumen...'}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Mengekstrak teks & metadata dokumen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Mencocokkan database publikasi & repositori kampus</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Mendeteksi segmen n-gram & estimasi similaritas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>Menyusun rekomendasi parafrase terarah per paragraf</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {analysisError && (
          <div className="max-w-5xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Terjadi Kesalahan Analisis</strong>
                <span>{analysisError}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Upload View */}
        {activeTab === 'upload' && (
          <UploadSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {/* TAB 2: Turnitin Report View */}
        {activeTab === 'report' && report && (
          <TurnitinReportView
            report={report}
            onGoToParaphrase={handleGoToParaphrase}
            onGoToRevised={() => setActiveTab('revised')}
            acceptedParaphrasesCount={acceptedCount}
          />
        )}

        {/* TAB 3: Paraphrase Assistant View */}
        {activeTab === 'paraphrase' && report && (
          <ParaphraseAssistantView
            report={report}
            acceptedMap={acceptedMap}
            onToggleAccept={handleToggleAccept}
            onAcceptAllCritical={handleAcceptAllCritical}
            onUpdateParagraphText={handleUpdateParagraphText}
            onGoToRevised={() => setActiveTab('revised')}
            targetParagraphIndex={targetParagraphIndex}
          />
        )}

        {/* TAB 4: Revised Document View */}
        {activeTab === 'revised' && report && (
          <RevisedDocumentView
            report={report}
            acceptedMap={acceptedMap}
            customTexts={customTexts}
            onRecheckWithNewText={(newText) =>
              handleAnalyze(newText, {
                title: `${report.documentTitle} (Hasil Revisi)`,
                author: report.documentAuthor,
                institution: report.institution,
                excludeQuotes: true,
                excludeBibliography: true,
                excludeSmallMatches: 8,
                documentType: 'skripsi_tesis',
              })
            }
            onBackToParaphrase={() => setActiveTab('paraphrase')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="font-semibold text-slate-700">
            VeritasCheck &bull; Sistem Analisis Plagiarisme Mirip Turnitin & Asisten Parafrase Akademis
          </p>
          <p className="mt-1 text-slate-400">
            Mendukung dokumen Microsoft Word (.docx), Adobe PDF (.pdf), serta format teks bebas &bull; Membantu mahasiswa dan akademisi menurunkan persentase kemiripan dokumen secara sah dan berbobot ilmiah.
          </p>
        </div>
      </footer>
    </div>
  );
}
