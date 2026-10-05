// Question bank for the WIT for HCI Mojokerto training (6–9 Okt 2026),
// sourced from the training deck. Correct answer = index `a` in `o`;
// options are shuffled per participant at runtime.

export interface QuestionDef {
  q: string;
  o: string[];
  a: number;
}

export interface PracticalDef {
  title: string;
  scenario: string;
  need: string[];
  extra: string;
  rubric: [string, number][];
}

export interface ModuleDef {
  code: string;
  name: string;
  desc: string;
  main: QuestionDef[];
  bonus: QuestionDef[];
  practical: PracticalDef;
}

export type LevelBand = [number, number, string, string];

export const LEVELS: Record<string, LevelBand[]> = {
  m1: [[0,39,'Beginner','Belum memahami konsep dasar AI'],[40,59,'Basic Awareness','Sudah mengenal AI, pemahaman masih terbatas'],[60,79,'AI Ready','Memahami konsep dan penggunaan dasar AI'],[80,89,'AI Proficient','Memahami AI dan mampu menggunakannya secara efektif'],[90,100,'AI Champion','Sangat memahami konsep, penggunaan, dan risiko AI']],
  m2: [[0,39,'Beginner','Belum memahami dasar prompting dan AI tools'],[40,59,'Basic Awareness','Sudah mengenal prompting dan AI tools, pemahaman masih terbatas'],[60,79,'Prompt Ready','Mampu menyusun prompt dan memakai AI tools dasar'],[80,89,'Prompt Proficient','Mampu memakai prompt dan AI tools secara efektif untuk pekerjaan'],[90,100,'Prompt Champion','Sangat memahami prompting, pemilihan tools, dan penggunaan AI yang aman']],
  m3: [[0,39,'Beginner','Belum memahami konsep dasar Agentic AI'],[40,59,'Basic Awareness','Sudah mengenal Agentic AI, pemahaman masih terbatas'],[60,79,'Agent Ready','Memahami konsep dan alur dasar AI Agent'],[80,89,'Agentic Proficient','Memahami Agentic AI dan mampu menerapkannya secara efektif'],[90,100,'Agentic Champion','Sangat memahami tujuan, perencanaan, tools, dan kontrol manusia pada Agent']],
};

export const MODULES: Record<string, ModuleDef> = {
m1:{code:'WORKSHOP 001',name:'Fundamental Generative AI',desc:'Apa itu AI dan LLM, kemampuan Generative AI, evolusi AI, halusinasi, serta penggunaan AI yang aman di kantor.',
main:[
{q:'Menurut materi, apa itu AI?',o:['Robot yang menggantikan semua pekerjaan manusia','Teknologi yang membantu komputer "berpikir" dan mengerjakan tugas yang biasanya butuh kecerdasan manusia','Aplikasi untuk menyimpan file di internet','Mesin pencari seperti Google'],a:1},
{q:'Apa yang paling tepat menggambarkan Generative AI?',o:['AI yang hanya bisa menghitung angka','AI yang hanya menyimpan data','AI yang hanya bekerja jika tidak ada internet','AI yang bisa menghasilkan konten baru seperti teks, gambar, audio, video, dan kode'],a:3},
{q:'LLM adalah singkatan dari...',o:['Large Language Model','Long Learning Machine','Local Language Memory','Logic Language Method'],a:0},
{q:'Bagaimana cara kerja LLM seperti ChatGPT dalam menjawab?',o:['Berpikir dan merasakan seperti manusia','Menyalin jawaban dari satu website tertentu','Memprediksi kata/kalimat berikutnya yang paling relevan berdasarkan pola dari data latih','Menunggu jawaban dari operator manusia'],a:2},
{q:'Pasangan produk AI dan pembuatnya yang benar adalah...',o:['ChatGPT – Google','Claude – Anthropic','Gemini – OpenAI','DeepSeek – Microsoft'],a:1},
{q:'Mana yang bukan kemampuan Generative AI?',o:['Membuat draft dokumen','Membuat gambar dari deskripsi teks','Menjamin semua jawabannya 100% benar','Membantu menulis dan memperbaiki kode'],a:2},
{q:'Apa yang dimaksud dengan "halusinasi" pada AI?',o:['AI memberikan jawaban yang terdengar meyakinkan tetapi salah atau dikarang','AI menolak menjawab pertanyaan','AI berjalan terlalu lambat','AI menampilkan gambar yang buram'],a:0},
{q:'Mana yang termasuk "DO" (dilakukan) saat menggunakan AI di kantor?',o:['Langsung memakai hasil AI tanpa dibaca','Memeriksa hasil AI sebelum digunakan atau dibagikan','Memakai tools AI apa saja yang ditemukan di internet','Menjadikan jawaban AI sebagai keputusan final'],a:1},
{q:'Mana yang termasuk "DON\'T" (dihindari) saat menggunakan AI?',o:['Menggunakan tools AI yang resmi disetujui perusahaan','Menggunakan AI sebagai asisten untuk ide awal','Memasukkan data rahasia perusahaan (keuangan, data karyawan) ke tools AI yang tidak resmi','Memverifikasi angka dari AI ke data sumber'],a:2},
{q:'Dalam AI Data Governance, data dibagi menjadi Public, Internal, dan Confidential. Data Confidential sebaiknya...',o:['Bebas dimasukkan ke AI gratis mana pun','Hanya diproses di platform AI enterprise/private yang disetujui perusahaan dengan kontrol ketat','Dibagikan ke grup chat agar cepat diproses','Tidak perlu diberi label'],a:1},
{q:'Urutan evolusi AI menurut materi (Jensen Huang/NVIDIA) adalah...',o:['Agentic AI → Generative AI → Perception AI → Physical AI','Generative AI → Physical AI → Perception AI → Agentic AI','Physical AI → Agentic AI → Generative AI → Perception AI','Perception AI → Generative AI → Agentic AI → Physical AI'],a:3},
{q:'Kalimat "AI doesn\'t replace people" dalam materi berarti...',o:['AI tidak berguna untuk pekerjaan kantor','AI membantu dan memberdayakan manusia agar bisa mencapai lebih banyak','AI hanya untuk tim IT','AI dilarang dipakai di perusahaan'],a:1},
{q:'Anda memakai AI untuk menyusun laporan, lalu ada angka penjualan yang terlihat janggal. Apa yang sebaiknya dilakukan?',o:['Kirim saja, AI pasti benar','Hapus semua angka dari laporan','Cek ulang angka tersebut ke data sumber sebelum laporan dikirim','Minta AI menebak angka yang lain'],a:2},
{q:'"The Big Shift" dalam materi menggambarkan perubahan AI dari...',o:['AI yang menghasilkan jawaban (generate) menjadi AI yang mengerjakan tugas sampai selesai (execute)','AI yang mahal menjadi AI yang gratis','AI berbasis teks menjadi AI berbasis suara saja','AI di laptop menjadi AI di televisi'],a:0},
{q:'Pada "AI Skill Gap", tahap paling awal adalah AI User. Artinya...',o:['Orang yang membangun produk AI dari nol','Orang yang membuat AI Agent sendiri','Orang yang menjual tools AI','Orang yang menggunakan AI untuk membantu pekerjaan sehari-hari'],a:3}],
bonus:[
{q:'Futurepedia.io digunakan untuk...',o:['Menyimpan dokumen kantor','Mencari dan membandingkan tools AI sesuai kebutuhan','Membuat akun email','Mengedit video'],a:1},
{q:'Contoh penerapan AI di industri manufaktur menurut materi adalah...',o:['Predictive maintenance (memprediksi kapan mesin perlu perawatan)','Menghapus data produksi','Mengganti semua operator dengan robot dalam sehari','Mencetak dokumen otomatis'],a:0},
{q:'Contoh indikator adopsi AI (Adoption Indicators) di perusahaan adalah...',o:['Jumlah printer kantor','Jumlah rapat per minggu','Tingkat pengguna AI (user adoption rate) dan literasi AI karyawan','Jumlah ruang meeting'],a:2},
{q:'Gelombang ketiga AI (Third AI boom) di tahun 2020-an dikenal sebagai era...',o:['Komputer pribadi','Revolusi Generative AI','Internet dial-up','Telepon genggam'],a:1},
{q:'Menurut materi, kapan waktu terbaik memulai perjalanan AI di perusahaan?',o:['Setelah semua kompetitor memakai AI','Menunggu AI sempurna','Sekarang, dimulai dari langkah kecil (Start small, think big)','Tidak perlu dimulai'],a:2}],
practical:{title:'Practical AI Challenge',
scenario:'Tim Anda mulai memakai AI untuk pekerjaan sehari-hari. Susun aturan singkat penggunaan AI yang aman dan bermanfaat untuk tim Anda.',
need:['Minimal 2 contoh pekerjaan yang dibantu AI','Minimal 3 aturan DO','Minimal 3 aturan DON\'T','Cara memeriksa hasil AI sebelum dipakai'],
extra:'Gunakan contoh nyata dari pekerjaan di departemen Anda.',
rubric:[['Contoh Pekerjaan',2],['Aturan DO',2],['Aturan DON\'T',2],['Verifikasi Hasil',2],['Clarity',2]]}},

m2:{code:'WORKSHOP 002',name:'Prompting & AI Tools',desc:'Belajar cara belajar AI, menyusun prompt yang efektif, file .md, MCP & API Key, serta AI tools untuk dokumen, presentasi, gambar, dan video.',
main:[
{q:'Kenapa prompt itu penting?',o:['Karena AI hanya sebaik arahan yang kita berikan','Karena prompt membuat AI lebih murah','Karena tanpa prompt AI bisa membaca pikiran kita','Karena prompt hanya untuk programmer'],a:0},
{q:'Prompt yang baik sebaiknya berisi...',o:['Satu kata saja agar singkat','Konteks, peran, tujuan, dan format hasil yang diinginkan','Bahasa yang sengaja dibuat rumit','Kata-kata kasar agar AI menurut'],a:1},
{q:'Prompt "Buatkan caption Instagram." tanpa keterangan lain biasanya menghasilkan...',o:['Caption yang pasti viral','Caption yang sangat spesifik untuk bisnis kita','Caption yang generik dan kurang sesuai kebutuhan','Tidak ada jawaban sama sekali'],a:2},
{q:'Kenapa kita perlu "belajar cara belajar" AI?',o:['Karena tools AI tidak pernah berubah','Karena tools AI cepat berubah, jadi yang penting adalah cara belajarnya, bukan hafal satu tools','Karena AI hanya bisa dipakai satu kali','Karena belajar AI cukup dengan membaca buku'],a:1},
{q:'Mindset belajar AI yang dianjurkan dalam materi adalah...',o:['Menghafal semua menu aplikasi AI','Menunggu pelatihan berikutnya','Praktik langsung, mulai dari masalah kerja sendiri, dan berani bereksperimen','Menghindari salah agar tidak rugi'],a:2},
{q:'Apa maksud menghindari "FOMO Tools"?',o:['Mencoba semua tools AI baru setiap hari','Memilih sedikit tools yang relevan lalu mempelajarinya dengan mendalam','Tidak memakai tools AI sama sekali','Hanya memakai tools yang paling mahal'],a:1},
{q:'Mana yang bukan kriteria memilih tools AI menurut materi?',o:['Sesuai kebutuhan kerja','Keamanan data','Paling viral di media sosial','Biaya dan kemudahan pakai'],a:2},
{q:'File .md (Markdown) adalah...',o:['Format video untuk presentasi','Format teks ringan yang mudah dibaca manusia dan AI, untuk memberi instruksi dan konteks yang terstruktur','Format gambar beresolusi tinggi','Aplikasi pengganti Microsoft Word'],a:1},
{q:'"Text to Image" artinya...',o:['Mengubah gambar menjadi teks','Mencetak teks ke kertas','Mengirim teks lewat email','Mengubah deskripsi teks menjadi gambar'],a:3},
{q:'Mana prompt yang paling baik untuk caption promosi coffee shop?',o:['"Buatkan caption."','"Buat caption Instagram untuk promo coffee shop baru, target usia 20–35 tahun, tone santai, sertakan ajakan datang minggu ini."','"Caption kopi."','"Tolong."'],a:1},
{q:'Anda punya dokumen PDF 28 halaman dan perlu presentasi ringkas. Cara paling efisien dengan AI adalah...',o:['Mengetik ulang semua isi dokumen ke slide','Unggah dokumen ke tools AI (mis. Gamma/Canva) untuk dibuatkan outline dan slide, lalu direview','Mengirim PDF apa adanya sebagai presentasi','Memotret setiap halaman lalu ditempel ke slide'],a:1},
{q:'NotebookLM paling cocok digunakan untuk...',o:['Mengedit foto produk','Membuat lagu','Mengumpulkan beberapa sumber (dokumen/link), lalu AI merangkum dan menjawab berdasarkan sumber tersebut','Mengirim pesan WhatsApp'],a:2},
{q:'MCP (Model Context Protocol) berfungsi untuk...',o:['Menghubungkan AI dengan tools, data, dan aplikasi lain (Excel, Drive, sistem perusahaan)','Mempercepat koneksi Wi-Fi','Mengganti password akun AI','Membuat AI berjalan tanpa listrik'],a:0},
{q:'Tentang API Key, pernyataan yang benar adalah...',o:['API Key boleh dibagikan di grup publik','API Key adalah "kunci akses" agar aplikasi bisa terhubung ke layanan AI, dan harus dijaga kerahasiaannya','API Key hanya hiasan di aplikasi','API Key sama dengan nama pengguna'],a:1},
{q:'Anda punya data penjualan di spreadsheet dan butuh grafik serta ringkasan tren. Cara yang tepat dengan AI adalah...',o:['Menggambar grafik manual dengan tangan','Menghapus data lama agar tidak bingung','Menunggu tim IT membuatkan laporan','Meminta AI/Copilot di spreadsheet membuat chart dan analisis dari data tersebut'],a:3}],
bonus:[
{q:'Tools yang dicontohkan di materi untuk membuat lagu dari teks adalah...',o:['Suno','Canva','Whimsical','Gamma'],a:0},
{q:'Tools yang dicontohkan untuk mengubah teks menjadi diagram/flowchart adalah...',o:['Suno','Whimsical','Kling','NotebookLM'],a:1},
{q:'Contoh tools untuk membuat video dari teks yang dibahas di materi adalah...',o:['Microsoft Excel','Google Flow','Notepad','Telegram'],a:1},
{q:'Penggunaan "Skill" di AI dengan tanda "/" (contoh: /productshot) berguna untuk...',o:['Menghapus riwayat chat','Mengganti bahasa aplikasi','Menjalankan tugas spesifik dengan perintah singkat, misalnya mengubah foto produk','Logout dari akun'],a:2},
{q:'Salah satu manfaat utama memakai file .md di platform AI adalah...',o:['Membuat file lebih berat','Jawaban AI lebih akurat, relevan, dan terstruktur karena konteksnya jelas','AI tidak perlu internet','File tidak bisa dibuka orang lain'],a:1}],
practical:{title:'Practical Prompt Challenge',
scenario:'Pilih satu tugas nyata di pekerjaan Anda (misalnya membuat laporan, email, atau materi presentasi). Tulis satu prompt lengkap agar AI menghasilkan hasil yang siap dipakai.',
need:['Konteks pekerjaan','Peran yang diminta dari AI','Tugas/tujuan yang jelas','Format hasil yang diinginkan','Batasan (panjang, gaya bahasa, dll.)'],
extra:'Sebutkan juga tools AI yang paling cocok untuk tugas tersebut.',
rubric:[['Context',2],['Role',2],['Task',2],['Output Format',2],['Clarity',2]]}},

m3:{code:'WORKSHOP 003',name:'Agentic AI',desc:'Dari Generative AI ke Agentic AI, cara kerja AI Agent, OpenClaw + Telegram, workflow otomatis, dan human-in-the-loop.',
main:[
{q:'Apa yang dimaksud Agentic AI?',o:['AI yang hanya bisa membuat gambar','Chatbot yang hanya menjawab pertanyaan','Aplikasi untuk menyimpan foto','AI yang bisa berpikir, merencanakan, bertindak, dan menyelesaikan tugas secara mandiri untuk mencapai tujuan'],a:3},
{q:'Perbedaan utama Generative AI dan Agentic AI adalah...',o:['Generative AI merespons prompt, sedangkan Agentic AI mengejar tujuan (goal)','Generative AI lebih baru dari Agentic AI','Agentic AI tidak memakai LLM sama sekali','Keduanya sama persis'],a:0},
{q:'Lengkapi kalimat dari materi: "Jika Generative AI menghasilkan jawaban, Agentic AI menghasilkan ___."',o:['Pertanyaan','Masalah baru','Hasil','Iklan'],a:2},
{q:'Urutan cara kerja AI Agent yang sederhana adalah...',o:['Bertindak → lupa tujuan → berhenti','Memahami tujuan → merencanakan langkah → melakukan tindakan → mengevaluasi hasil','Menunggu prompt → menjawab → selesai','Mengevaluasi → menghapus data → selesai'],a:1},
{q:'Dalam analogi materi, jika Agent adalah "armor", maka LLM adalah...',o:['Baterai','Helm','Jarvis (otak yang berpikir)','Sepatu'],a:2},
{q:'Contoh agent populer yang dibahas di materi adalah...',o:['OpenClaw dan Hermes','Microsoft Paint','Google Maps','Spotify'],a:0},
{q:'Agar bisa mengerjakan tugas nyata, AI Agent dapat menggunakan berbagai tools, contohnya...',o:['Hanya kalkulator','Tidak memakai tools apa pun','Hanya keyboard','Web search, email, kalender, dan spreadsheet'],a:3},
{q:'Manfaat Agentic AI menurut materi adalah...',o:['Membuat pekerjaan berulang dikerjakan otomatis sehingga tim bisa fokus pada strategi','Menggantikan seluruh karyawan','Membuat komputer lebih lambat','Menghapus kebutuhan akan data'],a:0},
{q:'"Human-in-the-loop" artinya...',o:['Manusia tidak terlibat sama sekali','Manusia meninjau atau menyetujui sebelum agent menjalankan tindakan penting','Agent bekerja tanpa batas waktu','Manusia menulis ulang semua hasil agent'],a:1},
{q:'Pada workshop, agent dihubungkan ke chat Telegram. Bot Telegram dibuat melalui...',o:['Google Play Store','@BotFather di Telegram','Website OpenAI','Menu pengaturan WhatsApp'],a:1},
{q:'Agent yang di-install di laptop (seperti OpenClaw) dapat terus bekerja selama...',o:['Laptop/server tetap menyala dan agent berjalan','Layar laptop sedang dilihat','Pengguna sedang mengetik','Ada sinyal TV'],a:0},
{q:'Agent bekerja secara berulang: Plan → Act → Observe → Reflect → Improve. Tujuan tahap "Observe" adalah...',o:['Menghapus hasil sebelumnya','Mematikan agent','Melihat hasil tindakan untuk dipakai memperbaiki langkah berikutnya','Mengganti LLM yang dipakai'],a:2},
{q:'Anda meminta agent mengirim email penawaran harga ke klien. Langkah yang paling aman adalah...',o:['Biarkan agent langsung mengirim tanpa dicek','Minta agent menyiapkan draft, lalu Anda cek dan setujui sebelum dikirim','Berikan password email Anda di grup chat','Kirim ke semua kontak sekaligus'],a:1},
{q:'Tools untuk menyusun workflow otomatis secara visual (tanpa banyak coding) yang dicontohkan di materi adalah...',o:['Notepad dan Paint','Kalkulator','n8n dan Google Opal','Windows Explorer'],a:2},
{q:'Instruksi yang baik untuk AI Agent sebaiknya berisi...',o:['Hanya satu kata perintah','Perintah yang berubah-ubah setiap menit','Tanpa tujuan agar agent bebas','Tujuan yang jelas, tahapan kerja, batasan, dan bentuk hasil yang diinginkan'],a:3}],
bonus:[
{q:'Saat install agent di Windows, langkah yang dibutuhkan terlebih dahulu menurut materi adalah...',o:['Install WSL (Windows Subsystem for Linux)','Install game','Format ulang laptop','Mematikan antivirus selamanya'],a:0},
{q:'Token bot dari @BotFather sebaiknya...',o:['Diunggah ke media sosial','Dijaga kerahasiaannya karena siapa pun yang memilikinya bisa mengendalikan bot','Ditulis di nama grup','Dibagikan ke semua peserta'],a:1},
{q:'Dalam multi-agent, contoh pembagian peran agent adalah...',o:['Semua agent mengerjakan hal yang sama','Agent "Riset", "Penulis", dan "Editor" yang bekerja sama','Satu agent untuk mematikan agent lain','Agent tanpa peran'],a:1},
{q:'Contoh LLM gratis/murah yang bisa dijalankan lokal menurut materi adalah...',o:['Gemma (local)','Microsoft Word','Google Sheets','Instagram'],a:0},
{q:'Hasil akhir Workshop 3 yang diharapkan adalah...',o:['Peserta bisa membuat game','Peserta menyusun alur kerja (workflow) Agentic AI yang siap diterapkan di departemen masing-masing','Peserta bisa mengganti laptop','Peserta hafal semua nama tools AI'],a:1}],
practical:{title:'Practical Agentic AI Challenge',
scenario:'Rancang satu alur kerja AI Agent sederhana untuk membantu pekerjaan rutin di departemen Anda (misalnya rekap laporan, jadwal, atau email).',
need:['Nama dan tujuan Agent','Tugas yang dikerjakan Agent','Tools yang dibutuhkan (mis. email, spreadsheet, Telegram)','Alur Tujuan → Rencana → Tindakan → Evaluasi','Tindakan yang wajib disetujui manusia (human-in-the-loop)'],
extra:'',
rubric:[['Agent Goal',2],['Tools',2],['Agentic Workflow',3],['Human-in-the-loop',2],['Clarity',1]]}}
};
