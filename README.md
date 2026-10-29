# Platform Asesmen Interaktif Multi-Materi

Aplikasi web modern berbasis Single Page Application (SPA) untuk pembelajaran mandiri, pelaksanaan asesmen diagnostik (**Pre-Test**), dan asesmen sumatif/formatif (**Post-Test**) dengan integrasi penuh ke **Google Sheets** melalui **Google Apps Script (GAS)**.

---

## 🌟 Fitur Utama

### 1. Sisi Siswa (Student Side)
* **Bypass Login:** Siswa langsung melihat katalog kartu materi pembelajaran saat web dibuka.
* **Materi Rich Text:** Menampilkan materi pembelajaran berformat blog (judul, teks tebal/miring, gambar, poin, dan tautan).
* **Modal Identitas:** Mengharuskan pengisian `Nomor Absen`, `Nama Lengkap`, dan `Kelas` sebelum memulai tes (berfungsi sebagai *Primary Key* rekaman nilai).
* **Proteksi Ujian Tunggal (Anti-Ujian Ulang Tanpa Izin):**
  * Siswa yang sudah memiliki nilai Pre-Test atau Post-Test **dilarang mengerjakan ulang tes** tersebut.
  * Sistem akan menolak akses tes dan menampilkan notifikasi peringatan.
  * Ujian ulang **hanya dapat dilakukan jika guru telah me-reset sel nilai siswa** pada portal rekapitulasi guru.
* **Mesin Pengerjaan Soal Pilihan Ganda:**
  * Penomoran dan navigasi soal interaktif.
  * Indikator progres persentase pengerjaan.
  * Kartu pilihan jawaban dengan visual seleksi instan.
* **Penilaian Otomatis & Pembahasan:**
  * Penghitungan skor otomatis skala 0 - 100.
  * Status kelulusan terstandarisasi: Nilai $\ge 75$ (**Pengayaan**) dan $< 75$ (**Remedial**).
  * Review pembahasan kunci jawaban yang benar dan penjelasan materi.
  * Sinkronisasi skor ke Google Sheets secara *real-time*.

### 2. Sisi Guru / Pendidik (Teacher Side)
* **Keamanan Portal Guru:** Akses khusus melalui tombol "Admin Login" di navbar dengan kata sandi: `guru123`.
* **Tab 1: Rekapitulasi Nilai & Delta:**
  * Menampilkan tabel nilai: No Absen, Nama, Kelas, Materi, Pre-Test, Post-Test, Selisih (Delta), dan Status (**Pengayaan** / **Remedial**).
  * **Fitur Reset Sel (Ujian Ulang):** Tombol "Reset Pre" dan "Reset Post" di setiap baris siswa untuk mengosongkan nilai terkait di Google Sheets, sehingga siswa tersebut diizinkan untuk mengulang tes.
  * Filter berdasarkan materi, filter kelas, dan kolom pencarian nama/absen.
* **Tab 2: Kelola Materi & Bank Soal:**
  * Menampilkan daftar seluruh materi yang sudah dipublikasikan ke server.
  * **Fitur Edit Materi & Bank Soal:** Guru dapat mengedit judul materi, konten bacaan blog, serta butir soal pilihan ganda dan kunci jawabannya kapan saja setelah dipublikasikan.
  * **Fitur Hapus Materi:** Guru dapat menghapus materi beserta bank soalnya langsung dari Google Sheets.
* **Tab 3: Tambah / Edit Materi Baru:**
  * Form pembuatan materi baru atau pembaruan materi yang sedang diedit.
  * **Editor Blog (Rich Text):** Bold, Italic, Underline, Heading (H2, H3), Bullet/Numbered list, Link, dan Sisip Gambar via URL.
  * **Builder Soal Pilihan Ganda:** Menambah/menghapus butir soal dinamis, input pilihan A, B, C, D, dan menentukan kunci jawaban benar via radio button.

---

## 🏗️ Struktur & Arsitektur Teknis

* **Frontend:** `index.html` (HTML5, Tailwind CSS CDN, FontAwesome, Vanilla JS SPA).
* **Backend:** `Code.gs` (Google Apps Script).
* **Database:** Google Sheets dengan 2 lembar kerja:
  1. Sheet **`Nilai`**:
     * Kolom: `Timestamp` | `No Absen` | `Nama Siswa` | `Kelas` | `Materi` | `Pre-Test` | `Post-Test` | `Delta` | `Status`
  2. Sheet **`Materi`**:
     * Kolom: `ID Materi` | `Judul Materi` | `Konten Materi` | `Bank Soal (JSON)` | `Dibuat Pada`
* **Metode Komunikasi Anti-CORS:** Menggunakan `fetch()` dengan `POST` berformat `application/x-www-form-urlencoded` (`URLSearchParams`) serta fallback transmisi formulir transparan agar pengiriman nilai tidak terblokir pembatasan browser.

---

## 🚀 Panduan Penerapan Kode Baru di Google Apps Script

Setelah memperbarui file `Code.gs`, lakukan langkah berikut di editor Google Apps Script:

1. Salin seluruh isi file [`Code.gs`](file:///d:/kuliah/PPG%20PRAJAB/semester%202/karya%20inovatif/Code.gs).
2. Buka editor Google Apps Script Anda, tempel (*paste*) kodenya, lalu klik ikon **Simpan (Disket)** (`Ctrl + S`).
3. Klik menu tombol biru **Terapkan (Deploy)** di pojok kanan atas > pilih **Kelola penerapan (Manage deployments)**.
4. Klik ikon **Pensil (Edit)** pada penerapan Web App aktif.
5. Pada bagian **Versi (Version)**, ubah dropdown menjadi: **Versi baru (New version)**.
6. Klik tombol biru **Terapkan (Deploy)**.
