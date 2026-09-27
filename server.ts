import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import * as pdfParseLib from 'pdf-parse';
const pdfParse: any = (pdfParseLib as any).default || pdfParseLib;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON with generous limits for documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client utility with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper function to extract text from base64 document
async function extractTextFromDocument(fileBase64: string, mimeType: string, filename: string): Promise<string> {
  const buffer = Buffer.from(fileBase64, 'base64');
  
  if (mimeType.includes('pdf') || filename.toLowerCase().endsWith('.pdf')) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.error('PDF parsing error:', err);
      throw new Error('Gagal mengekstrak teks dari file PDF. Pastikan file tidak terkunci atau rusak.');
    }
  } else if (
    mimeType.includes('word') || 
    mimeType.includes('officedocument') || 
    filename.toLowerCase().endsWith('.docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      console.error('DOCX parsing error:', err);
      throw new Error('Gagal mengekstrak teks dari file Word DOCX.');
    }
  } else if (mimeType.includes('text') || filename.toLowerCase().endsWith('.txt')) {
    return buffer.toString('utf-8');
  } else {
    // Default try utf8
    return buffer.toString('utf-8');
  }
}

// 1. Endpoint: Extract text from uploaded document
app.post('/api/extract-document', async (req, res) => {
  try {
    const { fileBase64, mimeType, filename } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'File data tidak ditemukan.' });
    }

    const text = await extractTextFromDocument(fileBase64, mimeType, filename);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const charCount = text.length;

    res.json({
      text,
      wordCount,
      charCount,
      filename,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal memproses dokumen.' });
  }
});

// 2. Endpoint: Check Plagiarism (Turnitin-like Analysis)
app.post('/api/check-plagiarism', async (req, res) => {
  try {
    const {
      text,
      title = 'Dokumen Tanpa Judul',
      author = 'Mahasiswa / Penulis',
      institution = 'Institusi Akademik',
      excludeQuotes = true,
      excludeBibliography = true,
      excludeSmallMatches = 8,
      documentType = 'skripsi_tesis', // 'jurnal', 'skripsi_tesis', 'esai_artikel'
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 40) {
      return res.status(400).json({ error: 'Teks terlalu pendek. Masukkan minimal 40 karakter dokumen akademik.' });
    }

    const systemInstruction = `Anda adalah mesin analisis plagiarisme dan originalitas tingkat lanjut berstandar Turnitin (Turnitin Similarity Report Engine).
Tugas Anda:
1. Menganalisis dokumen masukan secara menyeluruh layaknya laporan keaslian Turnitin.
2. Membagi dokumen menjadi beberapa paragraf bernomor.
3. Mendeteksi indeks similaritas keseluruhan (Overall Similarity Index) dalam persen (misal 35% - 65% jika ada banyak kalimat umum/akademik/klise, atau persentase realistis sesuai kepadatan kemiripan teks).
4. Menghasilkan rincian sumber plagiasi (Primary Sources) yang realistis layaknya database Turnitin (Internet Sources, Publications, Student Papers seperti repository universitas, IEEE, ScienceDirect, ResearchGate, repositori UGM, UI, ITB, dsb.).
5. Menandai segmen teks tertentu di setiap paragraf yang cocok dengan sumber tersebut (highlight segments), lengkap dengan nomor sumber (1, 2, 3...) dan persentase kemiripan paragraf tersebut.
6. PENTING: Urutkan dan prioritaskan paragraf yang PALING KRUSIAL untuk diparafrase (High Impact) guna menurunkan persentase plagiarisme secara drastis!
7. Berikan rekomendasi parafrase profesional berstandar akademik tinggi (bukan sekadar sinonim acak, tapi restrukturisasi klausa, pengubahan sudut pandang gramatikal, pemadatan ide asli) serta estimasi penurunan plagiarisme jika paragraf tersebut diperbaiki.
8. Gunakan Bahasa Indonesia akademis yang baku dan formal.`;

    const prompt = `Analisis teks dokumen berikut layaknya Turnitin Similarity Report:
Judul Dokumen: "${title}"
Penulis: "${author}"
Pengaturan Analisis:
- Exclude Quotes: ${excludeQuotes ? 'Ya' : 'Tidak'}
- Exclude Bibliography: ${excludeBibliography ? 'Ya' : 'Tidak'}
- Exclude Matches < ${excludeSmallMatches} words: Ya
- Tipe Dokumen: ${documentType}

ISI TEKS DOKUMEN:
"""
${text.slice(0, 15000)}
"""

Kembalikan output DALAM FORMAT JSON murni sesuai skema. Pastikan similarity score, sumber kemiripan, dan segmen highlight sangat detail menyerupai lembar laporan Turnitin asli.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSimilarity: {
              type: Type.INTEGER,
              description: 'Persentase total similaritas dokumen (0 - 100), contoh: 42',
            },
            similarityBreakdown: {
              type: Type.OBJECT,
              properties: {
                internetSources: { type: Type.INTEGER, description: 'Persentase dari Internet Sources, contoh: 28' },
                publications: { type: Type.INTEGER, description: 'Persentase dari Publications & Journals, contoh: 18' },
                studentPapers: { type: Type.INTEGER, description: 'Persentase dari Student Papers, contoh: 12' },
              },
              required: ['internetSources', 'publications', 'studentPapers'],
            },
            wordCount: { type: Type.INTEGER },
            characterCount: { type: Type.INTEGER },
            pageCountEstimate: { type: Type.INTEGER },
            submissionId: { type: Type.STRING },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER, description: 'ID nomor urut sumber (1, 2, 3...)' },
                  name: { type: Type.STRING, description: 'Nama sumber, misal repository.ugm.ac.id atau Journal of Education' },
                  type: { type: Type.STRING, description: 'Internet Source | Publication | Student Paper' },
                  percent: { type: Type.INTEGER, description: 'Kontribusi persentase kemiripan dari sumber ini, misal 15' },
                  url: { type: Type.STRING, description: 'Domain atau tautan rujukan' },
                  color: { type: Type.STRING, description: 'Warna kode penanda (misal #ef4444, #3b82f6, #10b981, #f59e0b, #8b5cf6, #ec4899)' },
                },
                required: ['id', 'name', 'type', 'percent', 'url', 'color'],
              },
            },
            paragraphs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER, description: 'Nomor indeks paragraf (mulai 1)' },
                  originalText: { type: Type.STRING, description: 'Teks asli paragraf' },
                  similarityScore: { type: Type.INTEGER, description: 'Tingkat kemiripan paragraf ini (0-100)' },
                  isPlagiarized: { type: Type.BOOLEAN, description: 'True jika memiliki kemiripan signifikan' },
                  primarySourceId: { type: Type.INTEGER, description: 'ID sumber utama yang paling cocok' },
                  paraphrasePriority: { 
                    type: Type.STRING, 
                    description: 'Tinggi (Kritis) | Sedang | Rendah | Bersih' 
                  },
                  impactDescription: { 
                    type: Type.STRING, 
                    description: 'Penjelasan dampak parafrase, misal "Menurunkan ~9% indeks kemiripan dokumen secara instan"' 
                  },
                  suggestedParaphrase: { 
                    type: Type.STRING, 
                    description: 'Teks hasil parafrase akademik berkualitas tinggi yang siap pakai' 
                  },
                  paraphraseExplanation: { 
                    type: Type.STRING, 
                    description: 'Teknik parafrase yang diterapkan (misal: pengubahan diatesis pasif, sinonimi istilah, penggabungan klausa berimbang)' 
                  },
                  matchedSegments: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: 'Potongan kalimat yang terdeteksi mirip' },
                        sourceId: { type: Type.INTEGER, description: 'ID sumber' },
                        similarity: { type: Type.INTEGER, description: 'Persentase kemiripan klausa' },
                      },
                      required: ['text', 'sourceId', 'similarity'],
                    },
                  },
                },
                required: ['index', 'originalText', 'similarityScore', 'isPlagiarized', 'paraphrasePriority', 'impactDescription', 'suggestedParaphrase', 'paraphraseExplanation'],
              },
            },
            summaryVerdict: {
              type: Type.STRING,
              description: 'Kesimpulan dan rekomendasi Turnitin, contoh: "Tingkat plagiarisme moderat-tinggi (42%). Memerlukan parafrase intensif pada 3 paragraf kunci untuk lolos batas toleransi 20%."',
            },
            safeTargetEstimate: {
              type: Type.INTEGER,
              description: 'Estimasi persentase kemiripan akhir jika seluruh paragraf prioritas diparafrase (misal 9%)',
            },
          },
          required: [
            'overallSimilarity',
            'similarityBreakdown',
            'sources',
            'paragraphs',
            'summaryVerdict',
            'safeTargetEstimate',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    
    // Supplement missing metadata if needed
    if (!parsedData.submissionId) {
      parsedData.submissionId = 'TRN-' + Math.floor(10000000 + Math.random() * 90000000);
    }
    parsedData.documentTitle = title;
    parsedData.documentAuthor = author;
    parsedData.institution = institution;
    parsedData.checkDate = new Date().toISOString();

    res.json(parsedData);
  } catch (error: any) {
    console.error('Check Plagiarism Error:', error);
    res.status(500).json({ error: error.message || 'Gagal melakukan analisis plagiarisme.' });
  }
});

// 3. Endpoint: Regenerate Custom Paraphrase for a specific paragraph
app.post('/api/paraphrase-paragraph', async (req, res) => {
  try {
    const { originalText, style = 'akademis_formal', focus = 'maksimal_turun' } = req.body;

    if (!originalText || typeof originalText !== 'string') {
      return res.status(400).json({ error: 'Teks paragraf wajib disertakan.' });
    }

    const systemInstruction = `Anda adalah pakar penulisan ilmiah dan parafrase akademik profesional.
Tugas Anda adalah memparafrase teks akademik agar lolos cek plagiasi Turnitin hingga 0-5% kemiripan, tanpa mengubah arti inti keilmuan dan menjaga tata bahasa baku (PUEBI/KBBI untuk Bahasa Indonesia atau Academic English).
Gaya parafrase:
- akademis_formal: Bahasa ilmiah ketat, kalimat efektif, struktur berbobot.
- sintesis_analitis: Menghubungkan sudut pandang kritis, merombak urutan argumen.
- padat_ringkas: Menghilangkan kata mubazir, menyampaikan ide dengan tajam.
- rekonstruksi_total: Membongkar urutan klausa dan tata kalimat secara menyeluruh.`;

    const prompt = `Lakukan parafrase mendalam pada paragraf berikut:
Gaya: ${style}
Fokus: ${focus}

TEKS ASLI:
"${originalText}"

Kembalikan dalam JSON dengan properti:
- paraphrasedText: teks baru hasil parafrase
- projectedSimilarity: perkiraan sisa kemiripan (misal 2-5%)
- keyChanges: daftar perubahan penting yang dilakukan
- academicToneScore: skor keilmiahan (1-100)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paraphrasedText: { type: Type.STRING },
            projectedSimilarity: { type: Type.INTEGER },
            keyChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            academicToneScore: { type: Type.INTEGER },
          },
          required: ['paraphrasedText', 'projectedSimilarity', 'keyChanges', 'academicToneScore'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Paraphrase Error:', error);
    res.status(500).json({ error: error.message || 'Gagal memparafrase paragraf.' });
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`VeritasCheck Turnitin Engine server listening on port ${port}`);
  });
}

startServer();
