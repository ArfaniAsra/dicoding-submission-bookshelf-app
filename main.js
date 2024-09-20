/*
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
  */

/* Kumpulan Konstanta */
const bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";
const SELECTORS = {
    bookFormTitle: "bookFormTitle",
    bookFormAuthor: "bookFormAuthor",
    bookFormYear: "bookFormYear",
    bookFormIsComplete: "bookFormIsComplete",
    incompleteBookList: "incompleteBookList",
    completeBookList: "completeBookList",
    editBookFormTitle: "editBookFormTitle",
    editBookFormAuthor: "editBookFormAuthor",
    editBookFormYear: "editBookFormYear",
    editBookContainer: "editBookContainer",
    modalOverlay: "modal-overlay",
    addBookButton: "addBookButton",
    addBookModal: "add-book",
    closeModal: "close-modal",
    bookForm: "bookForm",
    searchBook: "searchBook",
    editBookFormSubmit: "editBookFormSubmit",
    searchBookTitle: "searchBookTitle",
};

/* Fungsi utilitas */
const createElement = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    for (const child of children) {
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    }
    return element;
};

const showAlert = (options) => Swal.fire(options);

const showConfirmationAlert = (options, onConfirm, onDeny) => {
    Swal.fire(options).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        } else if (result.isDenied) {
            onDeny();
        }
    });
};

const closeModal = () => {
    document
        .querySelector(`.${SELECTORS.modalOverlay}`)
        .classList.remove("show");
    document
        .getElementById(SELECTORS.editBookContainer)
        .classList.remove("active");
    document
        .querySelector(`.${SELECTORS.addBookModal}`)
        .classList.remove("show");
};

const createErrorMessage = (inputElement, message) => {
    if (!inputElement || !inputElement.parentNode) {
        console.error("Invalid input element or parent node not found.");
        return;
    }

    let errorMessage = inputElement.nextElementSibling;
    if (!errorMessage || errorMessage.tagName !== "SPAN") {
        errorMessage = document.createElement("span");
        errorMessage.style.color = "red";
        errorMessage.style.fontSize = "0.9em";
        errorMessage.style.display = "none";
        errorMessage.style.textAlign = "left";
        inputElement.parentNode.insertBefore(
            errorMessage,
            inputElement.nextSibling
        );
    }
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.style.fontStyle = "italic";
    errorMessage.style.fontWeight = "300";
    inputElement.focus();
    return errorMessage;
};

// Fungsi untuk Membersihkan Input
const sanitizeInput = (input) => {
    const element = document.createElement("div");
    element.innerHTML = input;
    return (element.textContent || element.innerText || "").replace(
        /[^a-zA-Z0-9 .,!?'"()-]/g,
        ""
    );
};

// Fungsi untuk Validasi Input
const validateInput = (inputElement, message) => {
    if (!inputElement.value.trim()) {
        createErrorMessage(inputElement, message);
    } else {
        const errorMessage = inputElement.nextElementSibling;
        if (errorMessage && errorMessage.tagName === "SPAN") {
            errorMessage.style.display = "none";
        }
    }
};

const validateTitleInput = (titleInput) =>
    validateInput(titleInput, "Judul buku wajib diisi!");
const validateAuthorInput = (authorInput) =>
    validateInput(authorInput, "Nama Penulis wajib diisi!");
const validateYearInput = (yearInput) => {
    const currentYear = new Date().getFullYear();
    const yearValue = parseInt(yearInput.value, 10);
    if (isNaN(yearValue) || yearValue < 1 || yearValue > currentYear) {
        createErrorMessage(
            yearInput,
            `Masukkan tahun yang valid antara 1 sampai ${currentYear}!`
        );
    } else {
        const errorMessage = yearInput.nextElementSibling;
        if (errorMessage && errorMessage.tagName === "SPAN") {
            errorMessage.style.display = "none";
        }
    }
};

const findBook = (bookId) =>
    bookshelf.find((book) => book.id === bookId) || null;

const findBookIndex = (bookId) =>
    bookshelf.findIndex((book) => book.id === bookId);

/* Kriteria Wajib 1: Gunakan localStorage sebagai Penyimpanan */
const isStorageExist = () => {
    if (typeof Storage === undefined) {
        showAlert({
            icon: "error",
            title: "Oops...",
            text: "Browser Anda tidak mendukung local storage",
        });
        return false;
    }
    return true;
};

const saveData = () => {
    if (isStorageExist()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookshelf));
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
};

const loadDataFromStorage = () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data) bookshelf.push(...data);
    document.dispatchEvent(new Event(RENDER_EVENT));
};

const generateId = () => Number(new Date());

const generateBookObject = (id, title, author, year, isComplete) => ({
    id,
    title,
    author,
    year,
    isComplete,
});

/* Kriteria Wajib 2: Mampu Menambahkan Buku */
const addBook = () => {
    const bookTitle = document.getElementById(SELECTORS.bookFormTitle).value;
    const bookAuthor = document.getElementById(SELECTORS.bookFormAuthor).value;
    const bookYear = document.getElementById(SELECTORS.bookFormYear).value;
    const isComplete = document.getElementById(
        SELECTORS.bookFormIsComplete
    ).checked;

    const bookObject = generateBookObject(
        generateId(),
        bookTitle,
        bookAuthor,
        bookYear,
        isComplete
    );
    bookshelf.push(bookObject);

    showAlert({
        icon: "success",
        title: "Buku berhasil ditambahkan!",
        showConfirmButton: false,
        timer: 1500,
    });
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

/* Kriteria Wajib 3: Memiliki Dua Rak Buku */
const displayBooks = (bookObject) => {
    const bookImage = createElement("img", {
        src: "img/daria-nepriakhina-xY55bL5mZAM-unsplash.jpg",
        alt: "Book Cover",
        class: "book-cover",
    });
    const bookItemTitle = createElement(
        "h3",
        { "data-testid": "bookItemTitle" },
        bookObject.title
    );
    const bookItemAuthor = createElement(
        "p",
        { "data-testid": "bookItemAuthor" },
        `Penulis: ${bookObject.author}`
    );
    const bookItemYear = createElement(
        "p",
        { "data-testid": "bookItemYear" },
        `Tahun: ${bookObject.year}`
    );

    const bookContentContainer = createElement(
        "div",
        { class: "book-content" },
        bookItemTitle,
        bookItemAuthor,
        bookItemYear
    );

    const completeIcon = createElement("i", {
        class: bookObject.isComplete ? "fas fa-undo" : "fas fa-check",
    });
    const completeButton = createElement("div", {
        class: "button-style button-complete",
        "data-testid": "bookItemIsCompleteButton",
    });
    completeButton.appendChild(completeIcon);
    completeButton.appendChild(
        document.createTextNode(bookObject.isComplete ? "Belum" : "Sudah")
    );

    const deleteIcon = createElement("i", {
        class: "fas fa-trash",
    });
    const deleteButton = createElement("div", {
        class: "button-style button-delete",
        "data-testid": "bookItemDeleteButton",
    });
    deleteButton.appendChild(deleteIcon);
    deleteButton.appendChild(document.createTextNode(" Hapus"));

    const editIcon = createElement("i", {
        class: "fas fa-edit",
    });
    const editButton = createElement("div", {
        class: "button-style button-edit",
        "data-testid": "bookItemEditButton",
    });
    editButton.appendChild(editIcon);
    editButton.appendChild(document.createTextNode(" Edit"));

    const buttonContainer = createElement(
        "div",
        { class: "button-container" },
        completeButton,
        deleteButton,
        editButton
    );

    const bookContainer = createElement(
        "div",
        {
            "data-bookid": `${bookObject.id}`,
            "data-testid": "bookItem",
            class: "book-item",
        },
        bookImage,
        bookContentContainer,
        buttonContainer
    );

    completeButton.addEventListener("click", () => {
        moveBooks(bookObject.id, !bookObject.isComplete);
    });

    deleteButton.addEventListener("click", () => deleteBook(bookObject.id));
    editButton.addEventListener("click", () => editBook(bookObject.id));

    return bookContainer;
};

/* Kriteria Wajib 4: Dapat Memindahkan Buku Antar Rak */
const moveBooks = (bookId, isComplete) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

/* Kriteria Wajib 5: Dapat Menghapus Data Buku */
const deleteBook = (bookId) => {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    showConfirmationAlert(
        {
            title: "Anda yakin?",
            text: "Anda tidak akan dapat mengembalikannya!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Hapus",
            cancelButtonText: "Tidak",
        },
        () => {
            bookshelf.splice(bookIndex, 1);
            showAlert({
                title: "Terhapus!",
                text: "Buku berhasil dihapus.",
                icon: "success",
            });
            saveData();
            document.dispatchEvent(new Event(RENDER_EVENT));
        },
        () => {
            showAlert({
                title: "Dibatalkan",
                text: "Buku tidak jadi dihapus.",
                icon: "info",
            });
        }
    );
};

/* Kriteria Opsional 1: Menambahkan Fitur Pencarian Buku */
const searchBook = (event) => {
    event.preventDefault();
    const searchTitle = document
        .getElementById(SELECTORS.searchBookTitle)
        .value.toLowerCase();
    const filteredBooks = bookshelf.filter((book) =>
        book.title.toLowerCase().includes(searchTitle)
    );

    const incompleteBookList = document.getElementById(
        SELECTORS.incompleteBookList
    );
    const completeBookList = document.getElementById(
        SELECTORS.completeBookList
    );

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    filteredBooks.forEach((bookItem) => {
        const bookElement = displayBooks(bookItem);
        bookItem.isComplete
            ? completeBookList.appendChild(bookElement)
            : incompleteBookList.appendChild(bookElement);
    });
};

/* Kriteria Opsional 2: Menambahkan Fitur Edit Buku */
const editBook = (bookId) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    const titleInput = document.getElementById(SELECTORS.editBookFormTitle);
    const authorInput = document.getElementById(SELECTORS.editBookFormAuthor);
    const yearInput = document.getElementById(SELECTORS.editBookFormYear);

    // Set values to the form inputs
    titleInput.value = bookTarget.title;
    authorInput.value = bookTarget.author;
    yearInput.value = bookTarget.year;

    document.querySelector(`.${SELECTORS.modalOverlay}`).classList.add("show");
    document
        .getElementById(SELECTORS.editBookContainer)
        .classList.add("active");

    const saveButton = document.getElementById(SELECTORS.editBookFormSubmit);
    saveButton.replaceWith(saveButton.cloneNode(true));
    const newSaveButton = document.getElementById(SELECTORS.editBookFormSubmit);

    // Event listener for title input
    titleInput.addEventListener("input", () => validateTitleInput(titleInput));
    titleInput.addEventListener("focus", () => validateTitleInput(titleInput));

    // Event listener for author input
    authorInput.addEventListener("input", () =>
        validateAuthorInput(authorInput)
    );
    authorInput.addEventListener("focus", () =>
        validateAuthorInput(authorInput)
    );

    // Event listener for year input
    yearInput.addEventListener("input", () => validateYearInput(yearInput));
    yearInput.addEventListener("focus", () => validateYearInput(yearInput));

    newSaveButton.addEventListener("click", (event) => {
        event.preventDefault();

        bookTarget.title = titleInput.value.trim();
        bookTarget.author = authorInput.value.trim();
        bookTarget.year = yearInput.value.trim();

        showConfirmationAlert(
            {
                title: "Anda ingin menyimpan perubahan?",
                showDenyButton: true,
                confirmButtonText: "Simpan",
                denyButtonText: "Tidak",
            },
            () => {
                showAlert({
                    title: "Tersimpan!",
                    icon: "success",
                });
                saveData();
                document.dispatchEvent(new Event(RENDER_EVENT));
            },
            () => {
                showAlert({
                    title: "Perubahan tidak disimpan",
                    icon: "info",
                });
            }
        );

        closeModal();
    });
};

/* Event listener */
document.addEventListener("click", (event) => {
    if (event.target.classList.contains(SELECTORS.closeModal)) {
        closeModal();
    }
});

document.addEventListener(RENDER_EVENT, () => {
    const incompleteBookList = document.getElementById(
        SELECTORS.incompleteBookList
    );
    const completeBookList = document.getElementById(
        SELECTORS.completeBookList
    );

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    bookshelf.forEach((bookItem) => {
        const bookElement = displayBooks(bookItem);
        bookItem.isComplete
            ? completeBookList.appendChild(bookElement)
            : incompleteBookList.appendChild(bookElement);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const addBookButton = document.getElementById(SELECTORS.addBookButton);
    const modalOverlay = document.querySelector(`.${SELECTORS.modalOverlay}`);
    const addBookModal = document.querySelector(`.${SELECTORS.addBookModal}`);
    const closeModalButton = document.querySelector(`.${SELECTORS.closeModal}`);
    const submitForm = document.getElementById(SELECTORS.bookForm);
    const yearInput = document.getElementById(SELECTORS.bookFormYear);
    const titleInput = document.getElementById(SELECTORS.bookFormTitle);
    const authorInput = document.getElementById(SELECTORS.bookFormAuthor);
    const editBookContainer = document.getElementById(
        SELECTORS.editBookContainer
    );
    const searchBookForm = document.getElementById(SELECTORS.searchBook);

    // Event listener untuk menampilkan modal
    addBookButton.addEventListener("click", () => {
        addBookModal.classList.add("show");
        modalOverlay.classList.add("show");
    });

    // Event listener untuk menyembunyikan modal
    modalOverlay.addEventListener("click", () => {
        if (addBookModal.classList.contains("show")) {
            addBookModal.classList.remove("show");
            modalOverlay.classList.remove("show");
        }
    });

    // Event listener untuk menutup modal
    closeModalButton.addEventListener("click", () => {
        addBookModal.classList.remove("show");
        modalOverlay.classList.remove("show");
        editBookContainer.classList.remove("active");
    });

    // Event listener untuk setiap input field
    titleInput.addEventListener("focus", () => validateTitleInput(titleInput));
    titleInput.addEventListener("input", () => validateTitleInput(titleInput));

    authorInput.addEventListener("focus", () =>
        validateAuthorInput(authorInput)
    );
    authorInput.addEventListener("input", () =>
        validateAuthorInput(authorInput)
    );

    yearInput.addEventListener("focus", () => validateYearInput(yearInput));
    yearInput.addEventListener("input", () => validateYearInput(yearInput));

    // Event listener untuk menangani submit
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const sanitizedTitle = sanitizeInput(titleInput.value);
        const sanitizedAuthor = sanitizeInput(authorInput.value);

        titleInput.value = sanitizedTitle;
        authorInput.value = sanitizedAuthor;

        addBook();
        submitForm.reset();

        addBookModal.classList.remove("show");
        modalOverlay.classList.remove("show");
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // Event listener untuk menangani pencarian buku
    searchBookForm.addEventListener("submit", searchBook);
});

// Sticky Navigation Menu JS Code
document.addEventListener("DOMContentLoaded", function () {
    let header = document.querySelector("header");
    let scrollBtn = document.querySelector(".scroll-button a");
    console.log(scrollBtn);
    let val;

    window.onscroll = function () {
        if (document.documentElement.scrollTop > 150) {
            header.classList.add("sticky");
            scrollBtn.style.display = "block";
        } else {
            header.classList.remove("sticky");
            scrollBtn.style.display = "none";
        }
    };
});
