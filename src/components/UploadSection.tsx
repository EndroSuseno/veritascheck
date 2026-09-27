import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Database,
  Cpu
} from 'lucide-react';
import { CheckOptions } from '../types/turnitin';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../data/sampleDocuments';

interface UploadSectionProps {
  onAnalyze: (text: string, options: CheckOptions) => void;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Turnitin metadata & filters
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [institution, setInstitution] = useState('Universitas / Institusi Pendidikan');
  const [documentType, setDocumentType] = useState<'skripsi_tesis' | 'jurnal' | 'esai_artikel'>('skripsi_tesis');
  const [excludeQuotes, setExcludeQuotes] = useState(true);
  const [excludeBibliography, setExcludeBibliography] = useState(true);
  const [excludeSmallMatches, setExcludeSmallMatches] = useState(8);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setExtractError(null);
    setFileName(file.name);
    setFileSize(file.size);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch('/api/extract-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || 'application/octet-stream',
              filename: file.name,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Gagal mengekstrak dokumen.');
          }

          const data = await response.json();
          if (!data.text || data.text.trim().length === 0) {
            throw new Error('Dokumen kosong atau tidak memuat teks yang dapat dibaca.');
          }

          setExtractedText(data.text);
        } catch (err: any) {
          console.error(err);
          setExtractError(err.message || 'Terjadi kesalahan saat memproses berkas.');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setExtractError('Gagal membaca berkas di browser.');
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtractError(err.message || 'Gagal mengunggah berkas.');
      setIsExtracting(false);
    }
  };

  const handleSelectSample = (sample: SampleDoc) => {
    setExtractedText(sample.text);
    setTitle(sample.title);
    setAuthor(sample.author);
    setInstitution(sample.institution);
    setDocumentType(sample.type);
    setFileName(`${sample.id}.docx`);
    setExtractError(null);
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedText.trim() || wordCount < 20) {
      setExtractError('Dokumen harus memiliki minimal 20 kata untuk dianalisis.');
      return;
    }

    onAnalyze(extractedText, {
      title: title || 'Dokumen Ilmiah',
      author: author || 'Penulis Mahasiswa',
      institution: institution || 'Institusi Akademik',
      documentType,
      excludeQuotes,
      excludeBibliography,
      excludeSmallMatches,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Sistem Audit Keaslian Dokumen & Rekomendasi Parafrase Ilmiah</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pemeriksaan Plagiarisme <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">Berstandar Turnitin</span>
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Unggah dokumen Word (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">.docx</code>) atau PDF (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">.pdf</code>). Sistem akan memetakan sumber plagiat dan <strong className="text-slate-800">menunjukkan paragraf kunci yang wajib diparafrase</strong> agar indeks similaritas Anda anjlok ke batas aman.
        </p>
      </div>

      {/* Main Upload Box Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Input Method Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveInputTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeInputTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-red-600" />
            <span>Unggah Dokumen (Word / PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('paste')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeInputTab === 'paste'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Salin / Tempel Teks Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('sample')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeInputTab === 'sample'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Contoh Skripsi & Jurnal (Uji Cepat)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: File Upload */}
          {activeInputTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  extractedText
                    ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
                    : 'border-slate-300 hover:border-red-400 hover:bg-red-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.doc,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-red-100 to-amber-100 flex items-center justify-center text-red-600 shadow-xs">
                  {isExtracting ? (
                    <Cpu className="w-8 h-8 animate-spin text-red-600" />
                  ) : extractedText ? (
                    <FileCheck className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-red-600" />
                  )}
                </div>

                {isExtracting ? (
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Mengekstrak Teks Dokumen...
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Membaca susunan paragraf dari {fileName}...
                    </p>
                  </div>
                ) : extractedText ? (
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dokumen Berhasil Diekstrak</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{fileName}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {wordCount.toLocaleString('id-ID')} kata &bull; {charCount.toLocaleString('id-ID')} karakter
                      {fileSize ? ` &bull; ${(fileSize / 1024).toFixed(1)} KB` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Klik untuk mengganti dengan berkas lain
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Tarik & Letakkan Berkas di Sini, atau <span className="text-red-600 underline">Pilih Berkas</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1.5">
                      Mendukung format Microsoft Word (<strong className="font-semibold text-slate-700">.docx</strong>), PDF (<strong className="font-semibold text-slate-700">.pdf</strong>), atau Teks Baku (<strong className="font-semibold text-slate-700">.txt</strong>)
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4 text-xs text-slate-400">
                      <span>Maksimal 50 MB</span>
                      <span>&bull;</span>
                      <span>Ekstraksi Cepat & Privat</span>
                      <span>&bull;</span>
                      <span>Format Paragraf Terpelihara</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview extracted text snippet */}
              {extractedText && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pratinjau Teks Dokumen:
                    </span>
                    <button
                      type="button"
                      onClick={() => setExtractedText('')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Hapus / Reset
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 font-serif leading-relaxed line-clamp-4 bg-white p-3 rounded-lg border border-slate-200">
                    {extractedText}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste Text */}
          {activeInputTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Tempelkan Teks Dokumen Akademik (Skripsi, Tesis, Jurnal, Makalah):
              </label>
              <textarea
                rows={10}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Tempelkan bab pendahuluan, tinjauan pustaka, atau artikel jurnal Anda di sini..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-serif leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Minimal 20 kata. Direkomendasikan 100 - 3.000 kata untuk analisis optimal.</span>
                <span className="font-medium text-slate-700">
                  {wordCount} kata &bull; {charCount} karakter
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Pre-loaded Academic Samples */}
          {activeInputTab === 'sample' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Pilih salah satu dokumen sampel skripsi/jurnal ilmiah berikut untuk langsung mencoba simulasi Turnitin dan melihat cara kerja asisten parafrase:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SAMPLE_DOCUMENTS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                      extractedText === sample.text
                        ? 'border-red-500 bg-red-50/50 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {sample.type === 'skripsi_tesis' ? 'Skripsi / Tesis' : 'Jurnal Ilmiah'}
                        </span>
                        {extractedText === sample.text && (
                          <CheckCircle2 className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {sample.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <span>{sample.author}</span>
                      <span className="font-semibold text-red-600 flex items-center gap-0.5">
                        Pilih <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {extractError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{extractError}</span>
            </div>
          )}

          {/* Turnitin Metadata & Document Settings */}
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Judul Dokumen / Karya
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Skripsi Bab 1 Pendahuluan"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Penulis / Mahasiswa
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipe Dokumen
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="skripsi_tesis">Skripsi / Tesis / Disertasi</option>
                  <option value="jurnal">Artikel Jurnal Ilmiah</option>
                  <option value="esai_artikel">Makalah / Tugas Kuliah</option>
                </select>
              </div>
            </div>

            {/* Filter Turnitin Settings Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 py-1"
              >
                <Sliders className="w-3.5 h-3.5 text-red-600" />
                <span>
                  {showAdvancedSettings ? 'Sembunyikan Pengaturan Filter Turnitin' : 'Pengaturan Filter Turnitin (Exclude Quotes & Bibliography)'}
                </span>
              </button>

              {showAdvancedSettings && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeQuotes}
                      onChange={(e) => setExcludeQuotes(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 mt-1"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Exclude Quotes</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Abaikan kutipan langsung dalam tanda petik ("...")
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeBibliography}
                      onChange={(e) => setExcludeBibliography(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 mt-1"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Exclude Bibliography</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Abaikan daftar pustaka dan referensi akhir
                      </span>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Exclude Matches Kurang Dari:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={3}
                        max={30}
                        value={excludeSmallMatches}
                        onChange={(e) => setExcludeSmallMatches(Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-300 px-2 py-1 text-xs text-center font-bold"
                      />
                      <span className="text-xs text-slate-500">kata berturut-turut</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>
                {extractedText ? `${wordCount} kata siap dianalisis` : 'Pilih berkas atau gunakan sampel untuk memulai'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !extractedText.trim() || isExtracting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 ${
                isLoading || !extractedText.trim() || isExtracting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/25 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menganalisis Kemiripan Turnitin...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Mulai Analisis Keaslian Turnitin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* How Turnitin Works Information Banner */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">3 Database Pangkalan Data</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Memindai terhadap 99+ miliar halaman internet aktif & arsip, 89+ juta artikel jurnal ilmiah, dan repositori tugas mahasiswa global.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Sorotan Warna Berkode</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Setiap kalimat yang cocok ditandai nomor dan warna spesifik sesuai sumber asalnya, memudahkan pelacakan kalimat serupa.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Prioritas Parafrase Terarah</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Menemukan paragraf berbobot plagiasi tertinggi dan menyediakan versi parafrase siap pakai guna merontokkan skor kemiripan secara drastis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
