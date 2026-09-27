export interface SampleDoc {
  id: string;
  title: string;
  author: string;
  institution: string;
  type: 'skripsi_tesis' | 'jurnal' | 'esai_artikel';
  text: string;
  description: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'skripsi-ai-pendidikan',
    title: 'Penerapan Model Machine Learning dalam Personalisasi Pembelajaran Siswa Sekolah Menengah',
    author: 'Ahmad Faisal Rahman',
    institution: 'Universitas Negeri Yogyakarta',
    type: 'skripsi_tesis',
    description: 'Bab 1 Pendahuluan Skripsi dengan banyak definisi baku dan kutipan umum (~42% similaritas awal)',
    text: `Pendidikan merupakan salah satu pilar fundamental dalam pembangunan sumber daya manusia yang berkualitas di era revolusi industri 4.0. Seiring dengan kemajuan teknologi informasi yang berkembang sangat pesat, sistem pembelajaran konvensional mulai menghadapi tantangan besar dalam mengakomodasi keragaman gaya belajar siswa. Setiap peserta didik memiliki karakteristik kognitif, kecepatan pemahaman, dan preferensi pembelajaran yang berbeda-beda, sehingga model pengajaran satu ukuran untuk semua (one size fits all) dinilai kurang efektif dalam memaksimalkan potensi akademis peserta didik secara optimal.

Kecerdasan buatan atau Artificial Intelligence (AI) didefinisikan sebagai simulasi dari kecerdasan manusia yang dimodelkan di dalam mesin dan diprogram agar mampu berpikir seperti manusia. Menurut Russell dan Norvig (2016), sistem kecerdasan buatan dapat memproses data dalam jumlah besar untuk mengenali pola-pola tersembunyi yang sulit dideteksi oleh manusia secara manual. Dalam domain pendidikan kontemporer, pemanfaatan algoritma machine learning telah membuka peluang besar dalam menciptakan ekosistem pembelajaran adaptif yang mampu menyesuaikan materi, tingkat kesulitan, serta metode evaluasi secara otomatis berdasarkan performa riil peserta didik.

Meskipun demikian, implementasi sistem cerdas ini di lingkungan sekolah menengah di Indonesia masih menghadapi berbagai kendala yang cukup kompleks. Keterbatasan infrastruktur teknologi, disparitas kompetensi digital tenaga pendidik, serta kekhawatiran terkait privasi data siswa menjadi faktor penghambat utama. Banyak institusi pendidikan yang belum memiliki kesiapan matang dalam mengintegrasikan analitik pembelajaran ke dalam kurikulum formal yang sedang berjalan.

Berdasarkan latar belakang permasalahan tersebut di atas, penelitian ini bertujuan untuk merancang dan mengevaluasi prototipe sistem personalisasi pembelajaran berbasis machine learning. Fokus utama penelitian ini adalah menganalisis sejauh mana algoritma klasifikasi dapat memprediksi kesulitan belajar siswa secara dini dan memberikan rekomendasi intervensi pedagogis yang tepat guna meningkatkan capaian hasil belajar siswa secara signifikan.`
  },
  {
    id: 'manajemen-bank-syariah',
    title: 'Analisis Pengaruh Rasio Non-Performing Financing (NPF) dan CAR terhadap Profitabilitas Bank Syariah',
    author: 'Siti Nurhaliza Putri',
    institution: 'Universitas Islam Indonesia',
    type: 'skripsi_tesis',
    description: 'Tesis Manajemen Keuangan Syariah dengan frase regulasi & rasio keuangan perbankan (~36% similaritas awal)',
    text: `Perbankan syariah memiliki peranan yang sangat strategis dalam menopang stabilitas perekonomian nasional di Indonesia. Sebagai lembaga intermediasi keuangan yang beroperasi berdasarkan prinsip-prinsip hukum Islam, bank syariah wajib menghindari unsur maisir, gharar, dan riba dalam setiap transaksi keuangan yang diselenggarakan. Kinerja profitabilitas perbankan syariah seringkali diukur menggunakan indikator Return on Assets (ROA) yang menggambarkan kemampuan manajemen bank dalam menghasilkan laba dari seluruh aset yang dikelola.

Kualitas pembiayaan merupakan faktor determinan yang sangat mempengaruhi tingkat kesehatan suatu bank. Rasio Non-Performing Financing (NPF) mencerminkan perbandingan antara pembiayaan bermasalah dengan total pembiayaan yang disalurkan oleh bank syariah. Tingginya angka NPF mengindikasikan adanya kelemahan dalam prosedur analisis kelayakan pembiayaan atau memburuknya kondisi ekonomi debitur, yang pada gilirannya akan memicu peningkatan pencadangan penghapusan aset produktif dan menurunkan perolehan laba bersih perbankan.

Di samping kualitas pembiayaan, faktor kecukupan modal yang diukur melalui Capital Adequacy Ratio (CAR) memegang peranan krusial sebagai bantalan penyerap risiko kegagalan pembiayaan. Bank Indonesia dan Otoritas Jasa Keuangan menetapkan batas minimum rasio kecukupan modal sebesar 8% guna menjamin ketahanan bank dalam menghadapi gejolak keuangan sistemik. Penelitian ini bertujuan untuk menguji secara empiris pengaruh simultan dan parsial antara NPF dan CAR terhadap ROA pada bank umum syariah yang terdaftar di Bursa Efek Indonesia periode 2020-2024.`
  },
  {
    id: 'jurnal-lingkungan-energi',
    title: 'Strategi Transisi Energi Berkelanjutan Menuju Target Net Zero Emission Indonesia 2060',
    author: 'Dr. Hendra Kurniawan',
    institution: 'Institut Teknologi Bandung',
    type: 'jurnal',
    description: 'Draft Jurnal Ilmiah mengenai kebijakan energi terbarukan (~30% similaritas)',
    text: `Pemanasan global dan perubahan iklim global merupakan ancaman eksistensial paling nyata yang dihadapi oleh peradaban manusia pada abad ke-21. Emisi gas rumah kaca yang dihasilkan dari pembakaran bahan bakar fosil pada sektor ketenagalistrikan dan transportasi menjadi kontributor utama kenaikan temperatur bumi secara global. Kesepakatan Paris (Paris Agreement) mewajibkan seluruh negara penandatangan untuk mempercepat dekarbonisasi industri dan beralih ke sumber energi bersih yang ramah lingkungan.

Indonesia sebagai negara kepulauan tropis memiliki potensi sumber energi baru terbarukan (EBT) yang sangat melimpah, mencakup energi surya, tenaga angin, hidroelektrik, panas bumi, dan biomassa. Namun demikian, bauran energi nasional saat ini masih didominasi secara signifikan oleh batu bara dan minyak bumi karena faktor keekonomian biaya investasi awal pembangkit EBT yang masih relatif tinggi serta stabilitas jaringan transmisi nasional yang belum memadai.

Kajian ini merekomendasikan tiga pilar kebijakan strategis: percepatan pensiun dini pembangkit listrik tenaga uap (PLTU) berbasis batu bara, pemberian insentif fiskal dan kepastian regulasi bagi investor pembangkit energi terbarukan swasta, serta modernisasi jaringan transmisi pintar (smart grid) antarpulau guna mengatasi kendala intermitensi pasokan daya listrik terbarukan.`
  }
];
