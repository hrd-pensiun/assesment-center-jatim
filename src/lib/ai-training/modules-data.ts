// Verbatim question bank ported from wit-assessment.html's MODULES/LEVELS
// consts. Content (questions, options, correct-answer indices, level
// bands, rubrics) is copied as-is — do not "clean up" wording here, it
// changes what counts as a correct answer for already-shuffled clients.

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
  m2: [[0,39,'Beginner','Belum memahami konsep dasar RAG'],[40,59,'Basic Awareness','Sudah mengenal RAG, pemahaman masih terbatas'],[60,79,'RAG Ready','Memahami konsep dan alur dasar RAG'],[80,89,'RAG Proficient','Memahami RAG dan mampu menerapkannya secara efektif'],[90,100,'RAG Champion','Sangat memahami konsep, implementasi, dan evaluasi RAG']],
  m3: [[0,39,'Beginner','Belum memahami konsep dasar Agentic AI'],[40,59,'Basic Awareness','Sudah mengenal Agentic AI, pemahaman masih terbatas'],[60,79,'Agent Ready','Memahami konsep dan alur dasar AI Agent'],[80,89,'Agentic Proficient','Memahami Agentic AI dan mampu menerapkannya secara efektif'],[90,100,'Agentic Champion','Sangat memahami goal, planning, tools, action, dan governance Agent']],
};

export const MODULES: Record<string, ModuleDef> = {
m1:{code:'WORKSHOP 001',name:'Basic Generative AI',desc:'Fondasi Generative AI, LLM, prompt engineering, hallucination, keamanan data, pengantar RAG & AI Agent.',
main:[
{q:'Apa yang paling tepat menggambarkan Generative AI?',o:['AI yang hanya menyimpan data','AI yang dapat menghasilkan konten baru berdasarkan input','Database otomatis','Sistem untuk menggantikan internet'],a:1},
{q:'Contoh penggunaan Generative AI dalam pekerjaan sehari-hari adalah...',o:['Mengganti password otomatis','Membuat draft email dan merangkum dokumen','Menghapus seluruh data perusahaan','Menggantikan seluruh keputusan manusia'],a:1},
{q:'Large Language Model (LLM) pada dasarnya menghasilkan respons dengan cara...',o:['Mengambil satu jawaban tetap dari database','Memprediksi token/kata berikutnya berdasarkan konteks','Selalu mencari jawaban dari Google','Menghafal seluruh internet secara real-time'],a:1},
{q:'Apa yang dimaksud dengan hallucination pada AI?',o:['AI berhenti bekerja','AI menghasilkan informasi yang terlihat meyakinkan tetapi tidak akurat','AI terlalu lama menjawab','AI tidak memahami bahasa manusia'],a:1},
{q:'Jika ingin meminta AI membuat email profesional, prompt mana yang lebih baik?',o:['Buat email.','Email dong.','Bertindak sebagai business consultant. Buat email follow-up meeting kepada klien, profesional, singkat, maksimal 150 kata.','Tulis sesuatu untuk klien.'],a:2},
{q:'Apa fungsi context dalam sebuah prompt?',o:['Membuat prompt lebih panjang','Memberikan latar belakang agar AI memahami situasi','Menentukan harga AI','Menghapus batasan model'],a:1},
{q:'Zero-shot prompting berarti...',o:['Memberikan banyak contoh sebelum bertanya','Memberikan instruksi tanpa contoh','Tidak memberikan instruksi','Meminta AI menjawab nol kata'],a:1},
{q:'Few-shot prompting berarti...',o:['Memberikan beberapa contoh sebagai referensi sebelum AI mengerjakan tugas','Menggunakan beberapa aplikasi AI','Membatasi AI hanya beberapa kata','Menjalankan beberapa AI sekaligus'],a:0},
{q:'Jika AI memberikan informasi penting untuk keputusan bisnis, tindakan yang paling tepat adalah...',o:['Langsung menggunakannya','Menganggap AI selalu benar','Melakukan review dan verifikasi terhadap hasil AI','Menghapus hasilnya'],a:2},
{q:'Manakah data yang tidak seharusnya sembarangan dimasukkan ke public AI?',o:['Informasi produk yang sudah tersedia di website','Artikel berita publik','Data rahasia perusahaan/customer','Informasi publik pemerintah'],a:2},
{q:'Apa tujuan utama menggunakan AI dalam pekerjaan menurut modul ini?',o:['Menghilangkan kebutuhan manusia','Bekerja lebih cerdas dan meningkatkan produktivitas','Mengurangi jumlah karyawan','Membiarkan AI mengambil semua keputusan'],a:1},
{q:'Apa perbedaan utama Chatbot dengan AI Agent?',o:['Tidak ada perbedaan','Chatbot hanya untuk perusahaan','Agent dapat memiliki goal, planning, memory, dan menggunakan tools untuk melakukan tindakan','Agent hanya menghasilkan gambar'],a:2},
{q:'Dalam konsep RAG, urutan proses yang benar adalah...',o:['Generate → Retrieve → Delete','Retrieve → Augment → Generate','Prompt → Delete → Generate','Search → Train → Deploy'],a:1},
{q:'Apa fungsi Tool Use / Function Calling pada AI Agent?',o:['Membuat jawaban lebih panjang','Memungkinkan AI menggunakan API, menjalankan fungsi/kode, atau menggunakan layanan lain','Mengubah AI menjadi database','Menghapus kebutuhan manusia sepenuhnya'],a:1},
{q:'Manakah pendekatan terbaik ketika menggunakan AI di lingkungan kerja?',o:['Percaya seluruh output AI','Masukkan semua data agar AI semakin pintar','Gunakan AI sebagai asisten, jaga keamanan data, dan manusia tetap memvalidasi hasil akhir','Serahkan seluruh keputusan kepada AI'],a:2}],
bonus:[
{q:'Anda meminta AI membuat laporan, tetapi hasil pertama terlalu umum. Apa langkah terbaik?',o:['Menggunakan hasil apa adanya','Memberikan context, tujuan, format output, dan constraint yang lebih jelas','Mengganti laptop','Mengulang prompt yang sama terus-menerus'],a:1},
{q:'Seorang karyawan ingin menganalisis file berisi data finansial dan data customer menggunakan AI publik. Apa tindakan paling tepat?',o:['Upload langsung karena AI aman','Menghapus nama file saja','Memastikan klasifikasi dan keamanan data serta menggunakan platform AI yang sesuai kebijakan perusahaan','Mengirim datanya melalui email terlebih dahulu'],a:2},
{q:'AI membuat ringkasan meeting dan mencantumkan satu keputusan yang sebenarnya tidak pernah dibahas. Kondisi ini paling tepat disebut...',o:['Automation','Hallucination','Tokenization','Embedding'],a:1},
{q:'Anda ingin AI tidak hanya menjawab pertanyaan, tetapi juga membaca informasi, menentukan langkah berikutnya, kemudian menggunakan sebuah tool untuk menyelesaikan pekerjaan. Konsep yang paling sesuai adalah...',o:['Search Engine','Spreadsheet','AI Agent','Image Generator'],a:2},
{q:'Menurut pendekatan workshop ini, hubungan terbaik antara manusia dan AI dalam pekerjaan adalah...',o:['AI menggantikan seluruh keputusan manusia','Manusia mengerjakan semuanya dan AI hanya untuk hiburan','AI membantu mempercepat pekerjaan, sementara manusia memberikan konteks, melakukan review, dan bertanggung jawab atas keputusan akhir','AI hanya digunakan oleh tim IT'],a:2}],
practical:{title:'Practical AI Challenge',
scenario:'Anda baru selesai meeting selama 60 menit dan memiliki catatan meeting yang masih berantakan. Gunakan pemahaman prompt engineering untuk merancang satu prompt yang meminta Generative AI mengolah catatan tersebut.',
need:['Executive Summary','Key Decisions','Action Items','PIC','Deadline','Risiko atau hal yang masih perlu dikonfirmasi'],
extra:'Prompt harus memiliki context yang jelas, task/instruction, format output, dan constraint.',
rubric:[['Context',2],['Instruction / Task',2],['Output Format',2],['Constraint',2],['Clarity',2]]}},

m2:{code:'WORKSHOP 002',name:'RAG for AI',desc:'Keterbatasan LLM atas data internal, chunking, embedding, vector database, semantic search, dan evaluasi akurasi jawaban.',
main:[
{q:'Apa tujuan utama Retrieval-Augmented Generation (RAG)?',o:['Melatih ulang LLM dari nol','Membantu LLM menjawab menggunakan informasi relevan dari sumber data tertentu','Menggantikan seluruh fungsi database','Mengubah semua dokumen menjadi kode program'],a:1},
{q:'Mengapa LLM umum dapat memberikan jawaban yang tidak sesuai dengan kebijakan internal perusahaan?',o:['Karena LLM hanya dapat membaca gambar','Karena LLM tidak otomatis mengetahui dokumen dan data internal perusahaan','Karena semua LLM selalu offline','Karena LLM tidak dapat memproses bahasa manusia'],a:1},
{q:'Dalam istilah RAG, proses mencari informasi yang relevan disebut...',o:['Retrieval','Augmentation','Generation','Training'],a:0},
{q:'Urutan konsep dasar RAG yang benar adalah...',o:['Generate → Retrieve → Augment','Retrieve → Augment → Generate','Augment → Train → Retrieve','Train → Generate → Retrieve'],a:1},
{q:'Apa yang dimaksud dengan hallucination pada LLM?',o:['LLM menolak semua pertanyaan','LLM menghasilkan jawaban yang terdengar meyakinkan tetapi dapat tidak berdasarkan fakta yang benar','LLM kehilangan koneksi internet','LLM hanya menghasilkan gambar'],a:1},
{q:'Apa fungsi chunking pada pipeline RAG?',o:['Menghapus seluruh dokumen','Membagi dokumen menjadi potongan yang lebih kecil agar dapat dicari dan digunakan sebagai konteks','Menggabungkan semua dokumen menjadi satu kata','Mengenkripsi prompt'],a:1},
{q:'Embedding digunakan untuk...',o:['Mengubah teks menjadi representasi numerik/vector','Mengubah PDF menjadi gambar','Menghapus metadata','Menjalankan aplikasi web'],a:0},
{q:'Vector database terutama digunakan untuk...',o:['Menyimpan password pengguna','Menyimpan dan mencari embedding berdasarkan kemiripan makna','Menggantikan LLM','Mendesain antarmuka pengguna'],a:1},
{q:'Pencarian yang berfokus pada kemiripan makna, bukan hanya kata yang sama, disebut...',o:['Semantic search','Exact file search','Syntax checking','Image rendering'],a:0},
{q:'Manakah contoh tooling vector database/search yang disebut dalam modul?',o:['Pinecone, ChromaDB, dan FAISS','Excel, PowerPoint, dan Word','Photoshop, Figma, dan Canva','Docker, Nginx, dan Apache'],a:0},
{q:'Apa peran Augment dalam RAG?',o:['Menghapus pertanyaan pengguna','Menambahkan konteks hasil retrieval ke prompt/instruksi LLM','Melatih ulang model','Mengubah model menjadi database'],a:1},
{q:'Setelah konteks relevan diberikan, siapa yang merangkai jawaban akhir pada alur RAG?',o:['Vector database','LLM pada tahap Generation','File manager','Embedding model saja'],a:1},
{q:'Mengapa file terstruktur seperti Markdown (.md) berguna sebagai knowledge/context untuk AI?',o:['Karena hanya bisa dibaca komputer','Karena struktur heading, list, tabel, dan teks membantu informasi lebih rapi dan mudah dikelola','Karena otomatis melatih model baru','Karena tidak mengandung teks'],a:1},
{q:'Apa indikator sederhana bahwa sistem RAG bekerja lebih baik?',o:['Jawaban semakin panjang','Jawaban akurat dan relevan terhadap dokumen sumber','Jawaban selalu kreatif','Jumlah token selalu maksimum'],a:1},
{q:'Dalam konteks bisnis, use case RAG paling tepat adalah...',o:['Menjawab pertanyaan karyawan berdasarkan SOP dan kebijakan internal','Mengganti seluruh jaringan kantor','Membuat komputer tanpa sistem operasi','Menghapus kebutuhan terhadap data perusahaan'],a:0}],
bonus:[
{q:'Sebuah chatbot HR menjawab kebijakan cuti menggunakan pengetahuan umum, padahal perusahaan memiliki SOP internal. Apa solusi terbaik?',o:['Meminta AI menebak kebijakan','Menghubungkan knowledge base internal melalui RAG agar konteks relevan diambil sebelum menjawab','Memperpanjang jawaban AI','Menghapus SOP internal'],a:1},
{q:'Urutan indexing yang paling masuk akal dalam sistem RAG adalah...',o:['Data Source → Chunking → Embedding → Vector Database','Vector Database → LLM → Chunking → Data Source','Prompt → Generate → Training → Deploy','LLM → Answer → PDF → Embedding'],a:0},
{q:'Jika retrieval mengambil chunk yang salah, apa dampak paling langsung?',o:['Jawaban LLM dapat menjadi tidak relevan meskipun modelnya bagus','LLM otomatis menjadi lebih pintar','Semua dokumen berubah format','Vector database berhenti permanen'],a:0},
{q:'Mengapa RAG dapat membantu mengurangi hallucination?',o:['Karena LLM diberi konteks dari sumber yang relevan','Karena hallucination menjadi mustahil 100%','Karena RAG menghapus LLM','Karena vector database menghasilkan jawaban akhir'],a:0},
{q:'Tim menemukan jawaban RAG masih salah. Langkah evaluasi pertama yang paling logis adalah...',o:['Periksa apakah chunk yang di-retrieve relevan dengan pertanyaan dan dokumen sumber','Langsung mengganti seluruh model','Menghapus knowledge base','Menambah jumlah halaman dokumen'],a:0}],
practical:{title:'Practical RAG Challenge',
scenario:'Perusahaan memiliki SOP, kebijakan HR, manual produk, dan laporan operasional dalam PDF/Markdown. Manajemen ingin membuat AI Assistant yang menjawab berdasarkan sumber internal tersebut. Buat rancangan singkat.',
need:['Minimal 3 sumber data','Alur Data Source → Chunking → Embedding → Vector Database → Retrieval → Augment → LLM → Answer','Cara memastikan jawaban relevan terhadap sumber','Satu contoh pertanyaan user dan chunk yang seharusnya di-retrieve'],
extra:'',
rubric:[['Data Source',2],['RAG Architecture Flow',3],['Grounding / Evaluation',2],['Retrieval Example',2],['Clarity',1]]}},

m3:{code:'WORKSHOP 003',name:'Agentic AI',desc:'Generative vs Agentic AI, goal, planning, memory, tool use, from prompt to action, human-in-the-loop, dan integrasi komunikasi.',
main:[
{q:'Apa perbedaan utama Traditional/Generative AI dengan Agentic AI menurut modul?',o:['Generative AI hanya dapat bekerja offline','Traditional AI merespons prompt, sedangkan Agentic AI mengejar tujuan dan dapat melakukan pekerjaan','Agentic AI hanya menghasilkan gambar','Tidak ada perbedaan'],a:1},
{q:'Dalam konteks modul, AI Agent lebih tepat digambarkan sebagai...',o:['Sistem pasif yang hanya menyimpan data','Asisten yang dapat menerima tujuan/tugas dan membantu mengeksekusi pekerjaan','Database tanpa LLM','Aplikasi desain grafis'],a:1},
{q:'Komponen utama Agent pada roadmap modul mencakup...',o:['Planning, Memory, dan Tool Use','Keyboard, Mouse, dan Monitor','Logo, Warna, dan Font','PDF, JPG, dan PNG'],a:0},
{q:'Apa fungsi Planning pada AI Agent?',o:['Memecah tujuan atau tugas besar menjadi langkah-langkah kerja','Menghapus seluruh memory','Mengganti sistem operasi','Membuat jawaban selalu lebih panjang'],a:0},
{q:'Apa fungsi Memory pada AI Agent?',o:['Menyimpan konteks atau informasi yang dibutuhkan untuk menjalankan tugas','Mengatur warna antarmuka','Menghapus data pengguna','Membatasi agent agar tidak dapat bekerja'],a:0},
{q:'Tool Use / Function Calling memungkinkan Agent untuk...',o:['Memanggil API, menjalankan fungsi/kode, atau berinteraksi dengan layanan lain','Hanya menjawab pertanyaan teks','Mengubah semua file menjadi gambar','Menghilangkan kebutuhan terhadap instruksi'],a:0},
{q:"Apa makna kalimat 'From Prompt to Action' dalam konteks Agentic AI?",o:['AI hanya membuat prompt','AI bergerak dari sekadar memberikan jawaban menuju melakukan tindakan untuk mencapai outcome','AI tidak lagi menggunakan LLM','AI hanya digunakan untuk coding'],a:1},
{q:'Mengapa Agentic AI relevan untuk produktivitas kerja?',o:['Karena dapat membantu menjalankan beberapa tugas dan proses secara paralel','Karena membuat manusia tidak perlu menentukan tujuan','Karena tidak memerlukan data atau tools','Karena hanya bekerja saat meeting'],a:0},
{q:'Manakah contoh use case harian yang disebutkan dalam modul?',o:['Email, schedule, dan dokumen','Hanya bermain game','Hanya membuat logo','Mengganti hardware laptop'],a:0},
{q:'Dalam workshop, Agent direncanakan dapat diintegrasikan dengan...',o:['Telegram/WhatsApp untuk komunikasi dan pemberian tugas','Hanya printer','Hanya kamera','Tidak dapat terhubung ke aplikasi lain'],a:0},
{q:'Apa hubungan Agent dan LLM dalam analogi modul?',o:["Agent adalah sistem/kerangka yang bekerja, sementara LLM menjadi 'otak' yang membantu reasoning dan bahasa",'Agent dan LLM selalu sama persis','LLM hanya penyimpanan file','Agent tidak membutuhkan model AI'],a:0},
{q:'Manakah yang disebut sebagai contoh Agent populer dalam modul?',o:['OpenClaw, AgentPI, dan Hermes','PowerPoint, Excel, dan Word','Chrome, Safari, dan Firefox','Photoshop, Illustrator, dan Figma'],a:0},
{q:'Apa manfaat menjalankan Agent pada laptop/PC atau server menurut framing modul?',o:['Agent dapat membantu pekerjaan tetap berjalan selama environment aktif','Agent hanya dapat bekerja ketika layar disentuh','Agent tidak dapat menerima task','Agent tidak dapat menggunakan internet atau API'],a:0},
{q:'Mengapa human-in-the-loop tetap penting pada sistem Agentic AI?',o:['Agar manusia dapat memberi intervensi atau persetujuan pada tindakan tertentu','Agar Agent tidak pernah melakukan apa pun','Agar semua tugas dilakukan manual','Agar LLM dihapus'],a:0},
{q:'Apa tujuan akhir pembelajaran Workshop 003 menurut modul?',o:['Membuat Agent yang dapat digunakan di laptop sendiri untuk membantu pekerjaan sehari-hari','Menghafal seluruh jenis LLM','Membuat sistem operasi baru','Mengganti seluruh aplikasi kantor'],a:0}],
bonus:[
{q:'Agent diminta mengatur jadwal meeting, mengirim email, dan menyiapkan dokumen. Konsep apa yang paling penting agar tugas-tugas tersebut dapat dieksekusi?',o:['Tool integration / function calling','Hanya prompt yang sangat panjang','Menghapus memory','Mengubah semua file ke JPG'],a:0},
{q:'Sebelum Agent mengeksekusi tindakan penting seperti mengirim email ke klien, kontrol yang paling tepat adalah...',o:['Human-in-the-loop / approval','Biarkan semua tindakan selalu otomatis tanpa review','Hapus history','Matikan Agent'],a:0},
{q:'Jika Agent menerima goal besar, langkah awal yang paling tepat menurut konsep Agentic adalah...',o:['Memahami goal lalu membuat plan sebelum take action','Langsung mengirim hasil tanpa memahami tujuan','Menghapus semua tool','Mengganti LLM'],a:0},
{q:'Apa risiko jika Agent memiliki tools tetapi goal dan constraint tidak jelas?',o:['Agent dapat mengambil tindakan yang tidak sesuai kebutuhan atau konteks','Agent otomatis selalu benar','Tool menjadi lebih cepat','Memory menjadi tidak diperlukan'],a:0},
{q:'Dalam workflow Agentic, setelah Action sebaiknya ada...',o:['Evaluation/feedback untuk mengecek hasil dan memperbaiki langkah bila diperlukan','Penghapusan seluruh data','Tidak perlu pengecekan apa pun','Pergantian hardware'],a:0}],
practical:{title:'Practical Agentic AI Challenge',
scenario:'Anda ingin membuat AI Agent pribadi yang membantu pekerjaan sehari-hari dari laptop/PC: membaca task, menyusun jadwal, menyiapkan draft email/dokumen, dan berkomunikasi melalui Telegram/WhatsApp. Buat rancangan singkat.',
need:['Nama dan goal utama Agent','Minimal 3 tools/integrasi yang dibutuhkan','Alur Goal → Plan → Action → Evaluate → Deliver Result','Tindakan mana yang harus meminta approval manusia (human-in-the-loop)','Satu contoh task harian yang dapat dikirim ke Agent'],
extra:'',
rubric:[['Agent Goal',2],['Tools / Integration',2],['Agentic Workflow',3],['Human-in-the-loop',2],['Clarity',1]]}}
};
