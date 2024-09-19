const bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";

// Konstanta untuk selektor
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

// Fungsi utilitas
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

// Function to sanitize input
const sanitizeInput = (input) => {
    const element = document.createElement("div");
    element.innerHTML = input;
    return (element.textContent || element.innerText || "").replace(
        /[^a-zA-Z0-9 .,!?'"()-]/g,
        ""
    );
};


// Fungsi penyimpanan dan pemuatan data

const validateTitleInput = (titleInput) => {
    if (!titleInput.value.trim()) {
        createErrorMessage(titleInput, "Judul buku wajib diisi!");
    } else {
        const errorMessage = titleInput.nextElementSibling;
        if (errorMessage && errorMessage.tagName === "SPAN") {
            errorMessage.style.display = "none";
        }
    }
};

const validateAuthorInput = (authorInput) => {
    if (!authorInput.value.trim()) {
        createErrorMessage(authorInput, "Nama Penulis wajib diisi!");
    } else {
        const errorMessage = authorInput.nextElementSibling;
        if (errorMessage && errorMessage.tagName === "SPAN") {
            errorMessage.style.display = "none";
        }
    }
};

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

const displayBooks = (bookObject) => {
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

    const completeButton = createElement(
        "div",
        {
            class: "button-style button-complete",
            "data-testid": "bookItemIsCompleteButton",
        },
        bookObject.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"
    );

    const deleteButton = createElement(
        "div",
        {
            class: "button-style button-delete",
            "data-testid": "bookItemDeleteButton",
        },
        "Hapus Buku"
    );

    const editButton = createElement(
        "div",
        {
            class: "button-style button-edit",
            "data-testid": "bookItemEditButton",
        },
        "Edit Buku"
    );

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
        bookItemTitle,
        bookItemAuthor,
        bookItemYear,
        buttonContainer
    );

    completeButton.addEventListener("click", () => {
        moveBooks(bookObject.id, !bookObject.isComplete);
    });

    deleteButton.addEventListener("click", () => deleteBook(bookObject.id));
    editButton.addEventListener("click", () => editBook(bookObject.id));

    return bookContainer;
};

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

const moveBooks = (bookId, isComplete) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const deleteBook = (bookId) => {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    bookshelf.splice(bookIndex, 1);
    showAlert({
        title: "Anda yakin?",
        text: "Anda tidak akan dapat mengembalikannya!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Hapus!",
        cancelButtonText: "Tidak",
    }).then((result) => {
        if (result.isConfirmed) {
            showAlert({
                title: "Terhapus!",
                text: "Buku berhasil dihapus.",
                icon: "success",
            });
            saveData();
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    });
};

const findBook = (bookId) =>
    bookshelf.find((book) => book.id === bookId) || null;

const findBookIndex = (bookId) =>
    bookshelf.findIndex((book) => book.id === bookId);

const editBook = (bookId) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    const titleInput = document.getElementById("editBookFormTitle");
    const authorInput = document.getElementById("editBookFormAuthor");
    const yearInput = document.getElementById("editBookFormYear");

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

        Swal.fire({
            title: "Anda ingin menyimpan perubahan?",
            showDenyButton: true,
            confirmButtonText: "Simpan",
            denyButtonText: `Tidak`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire("Tersimpan!", "", "success");
                saveData();
                document.dispatchEvent(new Event(RENDER_EVENT));
            } else if (result.isDenied) {
                Swal.fire("Perubahan tidak disimpan", "", "info");
            }
        });

        closeModal();
    });
};

// Event listener
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
    const addBookButton = document.getElementById("addBookButton");
    const modalOverlay = document.querySelector(".modal-overlay");
    const addBookModal = document.querySelector(".add-book");
    const closeModalButton = document.querySelector(".close-modal");
    const submitForm = document.getElementById("bookForm");
    const yearInput = document.getElementById("bookFormYear");
    const titleInput = document.getElementById("bookFormTitle");
    const authorInput = document.getElementById("bookFormAuthor");
    const editBookContainer = document.getElementById("editBookContainer");
    const searchBookForm = document.getElementById("searchBook");

    // Event listener to show add book modal
    addBookButton.addEventListener("click", () => {
        addBookModal.classList.add("show");
        modalOverlay.classList.add("show");
    });

    // Event listener to hide modal when overlay is clicked
    modalOverlay.addEventListener("click", () => {
        if (addBookModal.classList.contains("show")) {
            addBookModal.classList.remove("show");
            modalOverlay.classList.remove("show");
        }
    });

    // Event listener to close modal
    closeModalButton.addEventListener("click", () => {
        addBookModal.classList.remove("show");
        modalOverlay.classList.remove("show");
        editBookContainer.classList.remove("active");
    });

    // Event listener for title input
    titleInput.addEventListener("focus", () => validateTitleInput(titleInput));
    titleInput.addEventListener("input", () => validateTitleInput(titleInput));

    // Event listener for author input
    authorInput.addEventListener("focus", () =>
        validateAuthorInput(authorInput)
    );
    authorInput.addEventListener("input", () =>
        validateAuthorInput(authorInput)
    );

    // Event listener for year input
    yearInput.addEventListener("focus", () => validateYearInput(yearInput));
    yearInput.addEventListener("input", () => validateYearInput(yearInput));

    // Event listener to handle form submission
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const sanitizedTitle = sanitizeInput(titleInput.value);
        const sanitizedAuthor = sanitizeInput(authorInput.value);

        titleInput.value = sanitizedTitle;
        authorInput.value = sanitizedAuthor;

        addBook();
        submitForm.reset();

        // Close the modal after submitting the book
        addBookModal.classList.remove("show");
        modalOverlay.classList.remove("show");
    });

    // Load data from storage if available
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // Event listener to handle book search
    searchBookForm.addEventListener("submit", searchBook);

    // Remove later: log saved data
    document.addEventListener(SAVED_EVENT, () => {
        console.log(localStorage.getItem(STORAGE_KEY));
    });
});
