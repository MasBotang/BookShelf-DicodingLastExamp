const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';
const RENDER_EVENT = "render-bookShelfs";

let bookShelfs = [];
const bookImages = [
  "../bookshelf-app-design_II/img/bookImage-1.jpg",
  "../bookshelf-app-design_II/img/bookImage-2.jpg",
  "../bookshelf-app-design_II/img/bookImage-3.jpg",
  "../bookshelf-app-design_II/img/bookImage-4.jpg",
  "../bookshelf-app-design_II/img/bookImage-5.jpg",
  "../bookshelf-app-design_II/img/bookImage-6.jpg"
];

let currentImageIndex = 0;

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(bookShelfs);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookShelfs.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.querySelector(".bookForm");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    bookShelfApp();
  });

  loadDataFromStorage(); // Memuat data dari localStorage saat halaman dimuat
});

function bookShelfApp() {
  const judul = document.getElementById("bookFormTitle");
  const penulis = document.getElementById("bookFormAuthor");
  const tahun = document.getElementById("bookFormYear");
  const selesai = document.getElementById("checkBox").checked;

  if (!judul.value || !penulis.value || isNaN(tahun.value) || !tahun.value.trim()) {
    console.error("Salah satu atau lebih input kosong atau tahun tidak valid!");
    return;
  }

  const generatedID = generateID();
  const bookShelfObject = generateShelfObject(
    generatedID,
    judul.value,
    penulis.value,
    tahun.value,
    selesai,
    bookImages[currentImageIndex] // Ambil gambar berdasarkan indeks saat ini
  );

  // Update indeks gambar untuk buku berikutnya
  currentImageIndex = (currentImageIndex + 1) % bookImages.length;

  bookShelfs.push(bookShelfObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData(); // Simpan data ke localStorage setelah menambah buku

  // Reset form setelah submit
  judul.value = "";
  penulis.value = "";
  tahun.value = "";
  document.getElementById("checkBox").checked = false;
}

function generateID() {
  return +new Date();
}

function generateShelfObject(id, judul, penulis, tahun, isCompleted, image) {
  return { id, judul, penulis, tahun, isCompleted, image }; // Tambahkan properti gambar
}

function updateDisplay() {
  const finishContainer = document.getElementById("finish-container");
  const notFinishContainer = document.getElementById("notFinish");

  // Bersihkan kontainer sebelum menambahkan konten baru
  finishContainer.innerHTML = ""; 
  notFinishContainer.innerHTML = ""; 

  // Loop untuk menampilkan semua buku
  bookShelfs.forEach((book) => {
    const bookEntry = document.createElement("div");
    bookEntry.className = "col m-5 d-flex flex-column justify-content-around align-items-center";
    bookEntry.setAttribute("data-bookid", book.id);
    bookEntry.setAttribute("data-testid", "bookItem");

    // Membuat elemen gambar
    const bookImage = document.createElement("img");
    bookImage.src = book.image; // Menggunakan properti image dari objek buku
    bookImage.alt = "img-" + book.id; // Ubah ke id bukunya
    bookImage.className = "mb-1 shadow-lg";
    bookImage.style.width = "11rem";
    bookImage.style.height = "auto";

    // Membuat elemen judul dan penulis
    const titleElement = document.createElement("h3");
    titleElement.className = "d-inline fw-bold spacing";
    titleElement.textContent = `${book.judul} - ${book.penulis}`;
    titleElement.setAttribute("data-testid", "bookItemTitle");

    // Membuat elemen tahun
    const yearElement = document.createElement("p");
    yearElement.className = "fw-bold spacing mb-1";
    yearElement.textContent = `${book.tahun}`;
    yearElement.setAttribute("data-testid", "bookItemYear");

    const buttonContainer = document.createElement("div");

    // Membuat tombol selesai
    const completeButton = document.createElement("button");
    completeButton.className = "btn";
    completeButton.textContent = book.isCompleted ? "Belum Selesai" : "Selesai";
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.addEventListener("click", function () {
      book.isCompleted = !book.isCompleted; // Toggle status selesai
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData(); // Simpan data ke localStorage setelah status selesai diubah
    });

    // Membuat tombol hapus
    const removeButton = document.createElement("button");
    removeButton.className = "btn";
    removeButton.textContent = "Hapus";
    removeButton.setAttribute("data-testid", "bookItemDeleteButton");
    removeButton.addEventListener("click", function () {
      bookShelfs = bookShelfs.filter((item) => item.id !== book.id);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData(); // Simpan data ke localStorage setelah buku dihapus
    });

    // Membuat tombol edit
    const editButton = document.createElement("button");
    editButton.className = "btn";
    editButton.textContent = "Edit";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      document.getElementById("bookFormTitle").value = book.judul;
      document.getElementById("bookFormAuthor").value = book.penulis;
      document.getElementById("bookFormYear").value = book.tahun;
      document.getElementById("checkBox").checked = book.isCompleted;

      // Menghapus buku yang sedang diedit berdasarkan ID
      bookShelfs = bookShelfs.filter((item) => item.id !== book.id);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData(); // Simpan data ke localStorage setelah buku yang sedang diedit dihapus
    });

    // Menambahkan tombol ke kontainer
    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(removeButton);
    buttonContainer.appendChild(editButton);

    // Menambahkan elemen-elemen ke bookEntry
    bookEntry.appendChild(bookImage);
    bookEntry.appendChild(titleElement);
    bookEntry.appendChild(yearElement);
    bookEntry.appendChild(buttonContainer);

    // Menyisipkan ke container yang sesuai
    if (book.isCompleted) {
      finishContainer.appendChild(bookEntry);
    } else {
      notFinishContainer.appendChild(bookEntry);
    }
  });
}

// Listener untuk event RENDER_EVENT
document.addEventListener(RENDER_EVENT, function () {
  updateDisplay();
});
function searchBook(event) {
  event.preventDefault();
  const searchInput = document.getElementById("searchBookTitle").value.toLowerCase().trim();
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = ""; 

  if (searchInput === "") {
    resultContainer.innerHTML = "<p>Masukkan judul buku untuk mencari.</p>";
    return;
  } else if (!Array.isArray(bookShelfs) || bookShelfs.length === 0) {
    resultContainer.innerHTML = "<p>Tidak ada buku yang tersedia untuk pencarian.</p>";
    return;
  }

  const searchResults = bookShelfs.filter((book) =>
    book.judul.toLowerCase().includes(searchInput)
  );

  if (searchResults.length === 0) {
    resultContainer.innerHTML = "<p>Buku tidak ditemukan</p>";
  } else {
    searchResults.forEach((book) => {
      const bookEntry = document.createElement("div");
      bookEntry.className = "col d-flex flex-column justify-content-center align-items-center mt-1 mt-lg-4";
      bookEntry.setAttribute("data-bookid", book.id);
      bookEntry.setAttribute("data-testid", "bookItem");

      const bookImage = document.createElement("img");
      bookImage.src = book.image; 
      bookImage.alt = "img-" + book.id; 
      bookImage.className = "mb-1 shadow-lg d-none d-lg-flex";
      bookImage.style.width = "4rem";
      bookImage.style.height = "auto";

      const titleElement = document.createElement("h3");
      titleElement.className = "d-inline fw-bold font-h mb-1";
      titleElement.textContent = `${book.judul} - ${book.penulis}`;
      titleElement.setAttribute("data-testid", "bookItemTitle");

      const yearElement = document.createElement("p");
      yearElement.className = "fw-bold fs-5 spacing d-none d-lg-flex";
      yearElement.textContent = `${book.tahun}`;
      yearElement.setAttribute("data-testid", "bookItemYear");

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "col";

      const completeButton = document.createElement("button");
      completeButton.className = "btn font-h";
      completeButton.textContent = book.isCompleted ? "Belum Selesai" : "Selesai";
      completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
      completeButton.addEventListener("click", function () {
        book.isCompleted = !book.isCompleted;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        resultContainer.removeChild(bookEntry); // Hapus dari hasil pencarian
      });

      const removeButton = document.createElement("button");
      removeButton.className = "btn font-h";
      removeButton.textContent = "Hapus";
      removeButton.setAttribute("data-testid", "bookItemDeleteButton");
      removeButton.addEventListener("click", function () {
        bookShelfs = bookShelfs.filter((item) => item.id !== book.id);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        resultContainer.removeChild(bookEntry); // Hapus dari hasil pencarian
      });

      const editButton = document.createElement("button");
      editButton.className = "btn font-h";
      editButton.textContent = "Edit";
      editButton.setAttribute("data-testid", "bookItemEditButton");
      editButton.addEventListener("click", function () {
        document.getElementById("bookFormTitle").value = book.judul;
        document.getElementById("bookFormAuthor").value = book.penulis;
        document.getElementById("bookFormYear").value = book.tahun;
        document.getElementById("checkBox").checked = book.isCompleted;

        bookShelfs = bookShelfs.filter((item) => item.id !== book.id);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        resultContainer.removeChild(bookEntry); // Hapus dari hasil pencarian
        document.getElementById("addBook").scrollIntoView({ behavior: "smooth" });
      });

      buttonContainer.appendChild(completeButton);
      buttonContainer.appendChild(removeButton);
      buttonContainer.appendChild(editButton);

      bookEntry.appendChild(bookImage);
      bookEntry.appendChild(titleElement);
      bookEntry.appendChild(yearElement);
      bookEntry.appendChild(buttonContainer);

      resultContainer.appendChild(bookEntry);
    });
  }
}


// Listener untuk pencarian buku
document.addEventListener("DOMContentLoaded", function() {
  const searchButton = document.getElementById("searchSubmit");
  if (searchButton) {
    searchButton.addEventListener("click", searchBook);
  } else {
    console.error("Element with ID 'searchSubmit' not found.");
  }
});

