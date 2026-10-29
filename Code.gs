/**
 * =========================================================================
 * PLATFORM ASESMEN INTERAKTIF MULTI-MATERI
 * Backend Google Apps Script (GAS) & Database Google Sheets
 * =========================================================================
 */

// PENTING:
// Jika skrip ini dibuat dari dalam Google Sheets (menu Ekstensi > Apps Script), biarkan SPREADSHEET_ID tetap kosong ("").
// Jika skrip dibuat secara standalone di script.google.com, masukkan ID Spreadsheet Google Sheets Anda di bawah ini:
const SPREADSHEET_ID = "";

// Nama Lembar Kerja
const SHEET_NILAI = "Nilai";
const SHEET_MATERI = "Materi";

/**
 * Helper untuk mendapatkan objek Spreadsheet baik bound maupun standalone
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw new Error("Spreadsheet tidak ditemukan! Pastikan skrip ini dibuka dari Google Sheets (Ekstensi > Apps Script) atau isi konstanta SPREADSHEET_ID di baris atas Code.gs.");
}

/**
 * Inisialisasi otomatis lembar kerja dan header jika belum ada
 */
function setupSheets() {
  const ss = getSpreadsheet();
  
  // 1. Setup Sheet Nilai
  let sheetNilai = ss.getSheetByName(SHEET_NILAI);
  if (!sheetNilai) {
    sheetNilai = ss.insertSheet(SHEET_NILAI);
    sheetNilai.appendRow([
      "Timestamp",
      "No Absen",
      "Nama Siswa",
      "Kelas",
      "Materi",
      "Pre-Test",
      "Post-Test",
      "Delta",
      "Status"
    ]);
    sheetNilai.getRange("A1:I1").setFontWeight("bold").setBackground("#2563eb").setFontColor("#ffffff");
    sheetNilai.setFrozenRows(1);
  }

  // 2. Setup Sheet Materi
  let sheetMateri = ss.getSheetByName(SHEET_MATERI);
  if (!sheetMateri) {
    sheetMateri = ss.insertSheet(SHEET_MATERI);
    sheetMateri.appendRow([
      "ID Materi",
      "Judul Materi",
      "Konten Materi",
      "Bank Soal (JSON)",
      "Dibuat Pada"
    ]);
    sheetMateri.getRange("A1:E1").setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
    sheetMateri.setFrozenRows(1);
    
    // Tambah contoh materi awal jika baru dibuat
    tambahMateriContoh(sheetMateri);
  }
}

/**
 * Menambahkan data materi demo awal
 */
function tambahMateriContoh(sheetMateri) {
  const contohSoal = [
    {
      id: 1,
      pertanyaan: "Organel sel yang berfungsi sebagai tempat utama pembentukan energi (the powerhouse of cell) adalah...",
      pilihan: [
        "Ribosom",
        "Mitokondria",
        "Badan Golgi",
        "Lisosom"
      ],
      kunci: 1,
      pembahasan: "Mitokondria menghasilkan sebagian besar pasokan adenosin trifosfat (ATP) sel melalui proses respirasi seluler."
    },
    {
      id: 2,
      pertanyaan: "Bagian sel yang berfungsi mengatur transportasi zat keluar dan masuk sel secara selektif permeabel adalah...",
      pilihan: [
        "Dinding Sel",
        "Vakuola",
        "Membran Plasma",
        "Sentrosom"
      ],
      kunci: 2,
      pembahasan: "Membran plasma tersusun dari lapisan ganda fosfolipid yang bersifat semi-permeabel."
    },
    {
      id: 3,
      pertanyaan: "Tempat berlangsungnya sintesis protein di dalam sel terjadi pada organel...",
      pilihan: [
        "Ribosom",
        "Sentriol",
        "Kloroplas",
        "Peroksisom"
      ],
      kunci: 0,
      pembahasan: "Ribosom menerjemahkan kode genetik mRNA menjadi rangkaian asam amino pembentuk protein."
    }
  ];

  const contohKonten = `
    <h2>Pengantar Biologi: Struktur dan Fungsi Sel</h2>
    <p>Sel adalah unit fungsional dan struktural terkecil yang menyusun seluruh makhluk hidup. Setiap aktivitas biologis seperti pertumbuhan, reproduksi, dan respon terhadap rangsangan berakar pada fungsi sel.</p>
    <h3>Bagian-Bagian Penting Sel:</h3>
    <ul>
      <li><strong>Membran Plasma:</strong> Melindungi isi sel serta mengatur keluar masuknya nutrisi dan zat sisa secara selektif permeabel.</li>
      <li><strong>Mitokondria:</strong> Pembangkit tenaga sel (the powerhouse of cell) yang memproduksi molekul energi (ATP).</li>
      <li><strong>Nukleus:</strong> Inti sel yang mengendalikan seluruh aktivitas pembelahan dan sintesis genetik.</li>
      <li><strong>Ribosom:</strong> Organel kecil pembuat protein esensial bagi kehidupan sel.</li>
    </ul>
  `;

  sheetMateri.appendRow([
    "MTR-" + new Date().getTime(),
    "Biologi: Struktur dan Organel Sel",
    contohKonten.trim(),
    JSON.stringify(contohSoal),
    new Date()
  ]);
}

/**
 * Handle HTTP GET: Mengembalikan data materi dan riwayat nilai dalam format JSON
 */
function doGet(e) {
  try {
    const ss = getSpreadsheet();
    setupSheets();

    // 1. Ambil data Materi
    const sheetMateri = ss.getSheetByName(SHEET_MATERI);
    const dataMateriRaw = sheetMateri.getDataRange().getValues();
    const materiList = [];

    for (let i = 1; i < dataMateriRaw.length; i++) {
      const row = dataMateriRaw[i];
      if (!row[0] && !row[1]) continue;

      let soalParsed = [];
      try {
        soalParsed = row[3] ? JSON.parse(row[3]) : [];
      } catch (err) {
        soalParsed = [];
      }

      materiList.push({
        id: row[0] ? row[0].toString() : ("MTR-" + i),
        judul: row[1] ? row[1].toString() : "",
        konten: row[2] ? row[2].toString() : "",
        soal: soalParsed,
        dibuatPada: row[4] ? row[4].toString() : ""
      });
    }

    // 2. Ambil data Nilai
    const sheetNilai = ss.getSheetByName(SHEET_NILAI);
    const dataNilaiRaw = sheetNilai.getDataRange().getValues();
    const nilaiList = [];

    for (let i = 1; i < dataNilaiRaw.length; i++) {
      const row = dataNilaiRaw[i];
      if (!row[1] && !row[2]) continue;

      const preVal = (row[5] !== "" && row[5] !== null && row[5] !== undefined) ? Number(row[5]) : null;
      const postVal = (row[6] !== "" && row[6] !== null && row[6] !== undefined) ? Number(row[6]) : null;
      const deltaVal = (row[7] !== "" && row[7] !== null && row[7] !== undefined) ? Number(row[7]) : (
        (preVal !== null && postVal !== null) ? (postVal - preVal) : null
      );

      // Pastikan format status rapi: "Pengayaan" atau "Remedial"
      let statusFormatted = row[8] ? row[8].toString() : "";
      if (postVal !== null) {
        statusFormatted = postVal >= 75 ? "Pengayaan" : "Remedial";
      } else if (preVal !== null) {
        statusFormatted = "Pre-Test Selesai";
      }

      nilaiList.push({
        rowIndex: i + 1,
        timestamp: row[0] ? row[0].toString() : "",
        noAbsen: row[1] !== "" ? row[1].toString() : "",
        nama: row[2] ? row[2].toString() : "",
        kelas: row[3] ? row[3].toString() : "",
        materi: row[4] ? row[4].toString() : "",
        preTest: preVal,
        postTest: postVal,
        delta: deltaVal,
        status: statusFormatted
      });
    }

    return createJsonResponse({
      status: "success",
      materi: materiList,
      nilai: nilaiList
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Handle HTTP POST: Memproses action saveNilai, saveMateri, deleteMateri, dan resetNilai
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "Server sedang sibuk, silakan coba beberapa detik lagi."
    });
  }

  try {
    // Ekstraksi parameter dari e.parameter atau e.postData secara tangguh
    let params = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      params = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        const raw = e.postData.contents;
        const pairs = raw.split('&');
        for (let i = 0; i < pairs.length; i++) {
          const p = pairs[i].split('=');
          if (p[0]) {
            params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
          }
        }
      }
    }

    const action = params.action;
    const ss = getSpreadsheet();
    setupSheets();

    // -------------------------------------------------------------------------
    // ACTION 1: saveNilai
    // -------------------------------------------------------------------------
    if (action === "saveNilai") {
      const noAbsen = (params.noAbsen || "").toString().trim();
      const nama = (params.nama || "").toString().trim();
      const kelas = (params.kelas || "").toString().trim();
      const materi = (params.materi || "").toString().trim();
      const tipeTes = (params.tipeTes || "").toString().toLowerCase().trim();
      const nilai = parseFloat(params.nilai || 0);

      if (!noAbsen || !kelas || !materi) {
        return createJsonResponse({
          status: "error",
          message: "Data wajib (No Absen, Kelas, Materi) tidak boleh kosong!"
        });
      }

      const sheetNilai = ss.getSheetByName(SHEET_NILAI);
      const dataNilai = sheetNilai.getDataRange().getValues();

      let targetRow = -1;
      let existingPre = null;
      let existingPost = null;

      // Cari berdasarkan Primary Key (No Absen + Kelas + Materi)
      for (let i = 1; i < dataNilai.length; i++) {
        const rowAbsen = dataNilai[i][1] ? dataNilai[i][1].toString().trim() : "";
        const rowKelas = dataNilai[i][3] ? dataNilai[i][3].toString().trim() : "";
        const rowMateri = dataNilai[i][4] ? dataNilai[i][4].toString().trim() : "";

        if (rowAbsen.toLowerCase() === noAbsen.toLowerCase() &&
            rowKelas.toLowerCase() === kelas.toLowerCase() &&
            rowMateri.toLowerCase() === materi.toLowerCase()) {
          targetRow = i + 1;
          existingPre = (dataNilai[i][5] !== "" && dataNilai[i][5] !== null) ? Number(dataNilai[i][5]) : null;
          existingPost = (dataNilai[i][6] !== "" && dataNilai[i][6] !== null) ? Number(dataNilai[i][6]) : null;
          break;
        }
      }

      // VALIDASI KETAT: Larang pengerjaan ulang tes yang sudah memiliki nilai tanpa di-reset guru lebih dulu
      if (targetRow !== -1) {
        if (tipeTes === "pre" && existingPre !== null && existingPre !== "") {
          return createJsonResponse({
            status: "error",
            message: "Siswa sudah memiliki nilai Pre-Test (" + existingPre + "). Silakan hubungi guru untuk mereset nilai sebelum ujian ulang."
          });
        }
        if (tipeTes === "post" && existingPost !== null && existingPost !== "") {
          return createJsonResponse({
            status: "error",
            message: "Siswa sudah memiliki nilai Post-Test (" + existingPost + "). Silakan hubungi guru untuk mereset nilai sebelum ujian ulang."
          });
        }
      }

      let preFinal = (tipeTes === "pre") ? nilai : existingPre;
      let postFinal = (tipeTes === "post") ? nilai : existingPost;

      // Hitung Delta jika pre dan post terisi
      let delta = "";
      if (preFinal !== null && postFinal !== null) {
        delta = postFinal - preFinal;
      }

      // Hitung Status Kelulusan: >= 75 Pengayaan, < 75 Remedial
      let status = "";
      if (postFinal !== null) {
        status = postFinal >= 75 ? "Pengayaan" : "Remedial";
      } else if (preFinal !== null) {
        status = "Pre-Test Selesai";
      }

      const now = new Date();

      if (targetRow !== -1) {
        // Update baris yang sudah ada
        sheetNilai.getRange(targetRow, 1).setValue(now);
        if (nama) sheetNilai.getRange(targetRow, 3).setValue(nama);
        if (tipeTes === "pre") {
          sheetNilai.getRange(targetRow, 6).setValue(nilai);
        } else if (tipeTes === "post") {
          sheetNilai.getRange(targetRow, 7).setValue(nilai);
        }
        sheetNilai.getRange(targetRow, 8).setValue(delta);
        sheetNilai.getRange(targetRow, 9).setValue(status);

        return createJsonResponse({
          status: "success",
          message: "Data nilai siswa berhasil diperbarui!",
          action: "update",
          row: targetRow,
          pre: preFinal,
          post: postFinal,
          delta: delta,
          keterangan: status
        });

      } else {
        // Siswa baru, buat baris
        sheetNilai.appendRow([
          now,
          noAbsen,
          nama,
          kelas,
          materi,
          (tipeTes === "pre" ? nilai : ""),
          (tipeTes === "post" ? nilai : ""),
          delta,
          status
        ]);

        return createJsonResponse({
          status: "success",
          message: "Data nilai siswa baru berhasil disimpan!",
          action: "insert",
          pre: preFinal,
          post: postFinal,
          keterangan: status
        });
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 2: saveMateri (Tambah Baru atau Update yang Sudah Ada)
    // -------------------------------------------------------------------------
    if (action === "saveMateri") {
      const judul = (params.judul || "").toString().trim();
      const konten = (params.konten || "").toString().trim();
      const soalRaw = params.soal || "[]";
      const idMateri = params.id ? params.id.toString().trim() : ("MTR-" + new Date().getTime());

      if (!judul || !konten) {
        return createJsonResponse({
          status: "error",
          message: "Judul materi dan isi konten wajib diisi!"
        });
      }

      // Validasi format JSON Soal
      try {
        JSON.parse(soalRaw);
      } catch (e) {
        return createJsonResponse({
          status: "error",
          message: "Format bank soal JSON tidak valid!"
        });
      }

      const sheetMateri = ss.getSheetByName(SHEET_MATERI);
      const dataMateri = sheetMateri.getDataRange().getValues();

      let existingRow = -1;
      for (let i = 1; i < dataMateri.length; i++) {
        if (dataMateri[i][0] && dataMateri[i][0].toString() === idMateri) {
          existingRow = i + 1;
          break;
        }
      }

      if (existingRow !== -1) {
        // Mode Edit: Perbarui data materi & bank soal yang ada
        sheetMateri.getRange(existingRow, 2).setValue(judul);
        sheetMateri.getRange(existingRow, 3).setValue(konten);
        sheetMateri.getRange(existingRow, 4).setValue(soalRaw);
        sheetMateri.getRange(existingRow, 5).setValue(new Date());

        return createJsonResponse({
          status: "success",
          message: "Materi dan bank soal berhasil diperbarui!",
          id: idMateri
        });
      } else {
        // Mode Tambah Baru
        sheetMateri.appendRow([
          idMateri,
          judul,
          konten,
          soalRaw,
          new Date()
        ]);

        return createJsonResponse({
          status: "success",
          message: "Materi baru dan bank soal berhasil disimpan!",
          id: idMateri
        });
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 3: deleteMateri (Hapus Materi & Bank Soalnya)
    // -------------------------------------------------------------------------
    if (action === "deleteMateri") {
      const idMateri = (params.id || "").toString().trim();
      if (!idMateri) {
        return createJsonResponse({
          status: "error",
          message: "ID materi yang akan dihapus tidak disertakan!"
        });
      }

      const sheetMateri = ss.getSheetByName(SHEET_MATERI);
      const dataMateri = sheetMateri.getDataRange().getValues();
      let targetRow = -1;

      for (let i = 1; i < dataMateri.length; i++) {
        if (dataMateri[i][0] && dataMateri[i][0].toString() === idMateri) {
          targetRow = i + 1;
          break;
        }
      }

      if (targetRow !== -1) {
        sheetMateri.deleteRow(targetRow);
        return createJsonResponse({
          status: "success",
          message: "Materi beserta seluruh bank soalnya berhasil dihapus!",
          id: idMateri
        });
      } else {
        return createJsonResponse({
          status: "error",
          message: "Materi dengan ID " + idMateri + " tidak ditemukan di Google Sheets!"
        });
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 4: resetNilai
    // -------------------------------------------------------------------------
    if (action === "resetNilai") {
      const row = parseInt(params.row, 10);
      const col = parseInt(params.col, 10);

      if (!row || !col || isNaN(row) || isNaN(col) || row < 2) {
        return createJsonResponse({
          status: "error",
          message: "Koordinat baris atau kolom reset tidak valid!"
        });
      }

      const sheetNilai = ss.getSheetByName(SHEET_NILAI);
      sheetNilai.getRange(row, col).clearContent();

      // Recalculate Delta & Status
      const preVal = sheetNilai.getRange(row, 6).getValue();
      const postVal = sheetNilai.getRange(row, 7).getValue();

      if (preVal !== "" && postVal !== "") {
        const delta = Number(postVal) - Number(preVal);
        sheetNilai.getRange(row, 8).setValue(delta);
        sheetNilai.getRange(row, 9).setValue(postVal >= 75 ? "Pengayaan" : "Remedial");
      } else if (postVal !== "") {
        sheetNilai.getRange(row, 8).clearContent();
        sheetNilai.getRange(row, 9).setValue(postVal >= 75 ? "Pengayaan" : "Remedial");
      } else if (preVal !== "") {
        sheetNilai.getRange(row, 8).clearContent();
        sheetNilai.getRange(row, 9).setValue("Pre-Test Selesai");
      } else {
        sheetNilai.getRange(row, 8).clearContent();
        sheetNilai.getRange(row, 9).clearContent();
      }

      return createJsonResponse({
        status: "success",
        message: "Nilai berhasil di-reset! Siswa sekarang dapat mengerjakan ujian kembali."
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Action tidak dikenal: " + action
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Standarisasi Output JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
