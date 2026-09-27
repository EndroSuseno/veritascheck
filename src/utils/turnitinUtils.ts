import { MatchedSource, ParagraphAnalysis } from '../types/turnitin';

export const SOURCE_COLORS = [
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', badge: 'bg-red-600 text-white', hex: '#ef4444' },
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400', badge: 'bg-blue-600 text-white', hex: '#3b82f6' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', badge: 'bg-emerald-600 text-white', hex: '#10b981' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', badge: 'bg-amber-600 text-white', hex: '#f59e0b' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400', badge: 'bg-purple-600 text-white', hex: '#8b5cf6' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400', badge: 'bg-pink-600 text-white', hex: '#ec4899' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400', badge: 'bg-cyan-600 text-white', hex: '#06b6d4' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-400', badge: 'bg-indigo-600 text-white', hex: '#6366f1' },
];

export function getSourceColor(sourceId: number) {
  const index = Math.abs(sourceId - 1) % SOURCE_COLORS.length;
  return SOURCE_COLORS[index];
}

export function getSimilarityColor(percent: number) {
  if (percent === 0) {
    return {
      name: 'Biru (0%)',
      code: 'blue',
      badgeClass: 'bg-blue-600 text-white',
      borderClass: 'border-blue-500',
      bgLightClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      label: 'Sangat Bersih / Orisinil',
      status: 'safe',
    };
  } else if (percent < 25) {
    return {
      name: 'Hijau (1-24%)',
      code: 'green',
      badgeClass: 'bg-emerald-600 text-white',
      borderClass: 'border-emerald-500',
      bgLightClass: 'bg-emerald-50',
      textClass: 'text-emerald-700',
      label: 'Aman / Lolos Standar Universitas (<20-25%)',
      status: 'safe',
    };
  } else if (percent < 50) {
    return {
      name: 'Kuning (25-49%)',
      code: 'yellow',
      badgeClass: 'bg-amber-500 text-white',
      borderClass: 'border-amber-500',
      bgLightClass: 'bg-amber-50',
      textClass: 'text-amber-800',
      label: 'Moderat: Memerlukan Parafrase Terarah',
      status: 'warning',
    };
  } else if (percent < 75) {
    return {
      name: 'Oranye (50-74%)',
      code: 'orange',
      badgeClass: 'bg-orange-500 text-white',
      borderClass: 'border-orange-500',
      bgLightClass: 'bg-orange-50',
      textClass: 'text-orange-800',
      label: 'Tinggi: Wajib Revisi Sebelum Pengajuan',
      status: 'danger',
    };
  } else {
    return {
      name: 'Merah (75-100%)',
      code: 'red',
      badgeClass: 'bg-red-600 text-white',
      borderClass: 'border-red-500',
      bgLightClass: 'bg-red-50',
      textClass: 'text-red-800',
      label: 'Kritis: Plagiarisme Masif',
      status: 'danger',
    };
  }
}

export function calculateProjectedSimilarity(
  initialSimilarity: number,
  paragraphs: ParagraphAnalysis[],
  acceptedMap: Record<number, boolean>
): number {
  if (!paragraphs || paragraphs.length === 0) return initialSimilarity;
  
  // Count total plagiarized paragraphs and how many are accepted
  let totalPlagiarizedWeight = 0;
  let resolvedWeight = 0;

  paragraphs.forEach((p) => {
    if (p.similarityScore > 15) {
      const weight = p.similarityScore;
      totalPlagiarizedWeight += weight;
      if (acceptedMap[p.index]) {
        // Reduced to ~3-5%
        resolvedWeight += (weight - 4);
      }
    }
  });

  if (totalPlagiarizedWeight === 0) return initialSimilarity;

  const reductionRatio = resolvedWeight / totalPlagiarizedWeight;
  const maxPossibleDrop = initialSimilarity - 5; // cannot drop below baseline residual ~5%
  const drop = Math.round(maxPossibleDrop * reductionRatio);

  return Math.max(4, initialSimilarity - drop);
}

export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
