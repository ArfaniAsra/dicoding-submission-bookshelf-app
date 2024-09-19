const bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";
const currentYear = new Date().getFullYear();

const isStorageExist = () => {
    if (typeof Storage === undefined) {
        Swal.fire({
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
    const bookTitle = document.getElementById("bookFormTitle").value;
    const bookAuthor = document.getElementById("bookFormAuthor").value;
    const bookYear = document.getElementById("bookFormYear").value;
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    const bookObject = generateBookObject(
        generateId(),
        bookTitle,
        bookAuthor,
        bookYear,
        isComplete
    );
    bookshelf.push(bookObject);

    Swal.fire({
        icon: "success",
        title: "Data berhasil disimpan!",
        showConfirmButton: false,
        timer: 1500,
    });
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const displayBooks = (bookObject) => {
    const bookItemTitle = document.createElement("h3");
    bookItemTitle.innerText = bookObject.title;
    bookItemTitle.setAttribute("data-testid", "bookItemTitle");

    const bookItemAuthor = document.createElement("p");
    bookItemAuthor.innerText = `Penulis: ${bookObject.author}`;
    bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");

    const bookItemYear = document.createElement("p");
    bookItemYear.innerText = `Tahun: ${bookObject.year}`;
    bookItemYear.setAttribute("data-testid", "bookItemYear");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const completeButton = document.createElement("div");
    completeButton.classList.add("button-style", "button-complete");
    completeButton.innerText = bookObject.isComplete
        ? "Belum selesai dibaca"
        : "Selesai dibaca";
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    buttonContainer.appendChild(completeButton);

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("button-style", "button-delete");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    buttonContainer.appendChild(deleteButton);

    const editButton = document.createElement("div");
    editButton.classList.add("button-style", "button-edit");
    editButton.innerText = "Edit Buku";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    buttonContainer.appendChild(editButton);

    const bookContainer = document.createElement("div");
    bookContainer.setAttribute("data-bookid", `${bookObject.id}`);
    bookContainer.setAttribute("data-testid", "bookItem");
    bookContainer.classList.add("book-item");
    bookContainer.appendChild(bookItemTitle);
    bookContainer.appendChild(bookItemAuthor);
    bookContainer.appendChild(bookItemYear);
    bookContainer.appendChild(buttonContainer);

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
        .getElementById("searchBookTitle")
        .value.toLowerCase();
    const filteredBooks = bookshelf.filter((book) =>
        book.title.toLowerCase().includes(searchTitle)
    );

    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

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
    Swal.fire({
        title: "Anda yakin?",
        text: "Anda tidak akan dapat mengembalikannya!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
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

    document.getElementById("editBookFormTitle").value = bookTarget.title;
    document.getElementById("editBookFormAuthor").value = bookTarget.author;
    document.getElementById("editBookFormYear").value = bookTarget.year;

    document.querySelector(".modal-overlay").classList.add("show");
    document.getElementById("editBookContainer").classList.add("active");

    const saveButton = document.getElementById("editBookFormSubmit");
    saveButton.replaceWith(saveButton.cloneNode(true));
    const newSaveButton = document.getElementById("editBookFormSubmit");

    newSaveButton.addEventListener("click", (event) => {
        event.preventDefault();

        const title = document.getElementById("editBookFormTitle").value.trim();
        const author = document
            .getElementById("editBookFormAuthor")
            .value.trim();
        const year = document.getElementById("editBookFormYear").value.trim();

        if (
            !title ||
            !author ||
            !year ||
            isNaN(year) ||
            year <= 0 ||
            year > currentYear
        ) {
            alert("All fields are required and year must be valid.");
            return;
        }

        bookTarget.title = title;
        bookTarget.author = author;
        bookTarget.year = year;

        Swal.fire({
            title: "Anda ingin menyimpan perubahan?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Simpan",
            denyButtonText: `Tidak`,
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                Swal.fire("Tersimpan!", "", "success");
                saveData();
                document.dispatchEvent(new Event(RENDER_EVENT));
            } else if (result.isDenied) {
                Swal.fire("Perubahan tidak disimpan", "", "info");
            }
        });

        document.getElementById("editBookContainer").classList.remove("active");
        document.querySelector(".modal-overlay").classList.remove("show");
    });
};

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-modal")) {
        document.querySelector(".modal-overlay").classList.remove("show");
        document.getElementById("editBookContainer").classList.remove("active");
        document.querySelector(".add-book").classList.remove("show");
    }
});

document.addEventListener(RENDER_EVENT, () => {
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    bookshelf.forEach((bookItem) => {
        const bookElement = displayBooks(bookItem);
        bookItem.isComplete
            ? completeBookList.appendChild(bookElement)
            : incompleteBookList.appendChild(bookElement);
    });
});

document.getElementById("addBookButton").addEventListener("click", () => {
    document.querySelector(".add-book").classList.add("show");
    document.querySelector(".modal-overlay").classList.add("show");
});

document.querySelector(".modal-overlay").addEventListener("click", () => {
    const addBookModal = document.querySelector(".add-book");

    if (addBookModal.classList.contains("show")) {
        addBookModal.classList.remove("show");
        document.querySelector(".modal-overlay").classList.remove("show");
    }
});

document.querySelector(".close-modal").addEventListener("click", () => {
    document.querySelector(".add-book").classList.remove("show");
    document.querySelector(".modal-overlay").classList.remove("show");
    document.getElementById("editBookContainer").classList.remove("active");
});

document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById("bookForm");
    const yearInput = document.getElementById("bookFormYear");
    const titleInput = document.getElementById("bookFormTitle");
    const authorInput = document.getElementById("bookFormAuthor");

    const yearErrorMessage = document.createElement("span");
    yearErrorMessage.style.color = "red";
    yearErrorMessage.style.fontSize = "0.9em";
    yearErrorMessage.style.display = "none";
    yearErrorMessage.style.textAlign = "left";
    yearInput.parentNode.appendChild(yearErrorMessage);

    const sanitizeInput = (input) => {
        const element = document.createElement("div");
        element.innerHTML = input;
        return (element.textContent || element.innerText || "").replace(
            /[^a-zA-Z0-9 .,!?'"()-]/g,
            ""
        );
    };

    const validateYearInput = () => {
        const yearValue = parseInt(yearInput.value, 10);
        if (isNaN(yearValue) || yearValue < 1 || yearValue > currentYear) {
            yearErrorMessage.textContent = `Please enter a valid year between 1 and ${currentYear}!`;
            yearErrorMessage.style.display = "block";
            yearErrorMessage.style.fontStyle = "italic";
            yearInput.focus();
            return false;
        } else {
            yearErrorMessage.style.display = "none";
            return true;
        }
    };

    yearInput.addEventListener("input", validateYearInput);

    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const sanitizedTitle = sanitizeInput(titleInput.value);
        const sanitizedAuthor = sanitizeInput(authorInput.value);

        if (!sanitizedTitle || !sanitizedAuthor || !validateYearInput()) {
            return;
        }

        titleInput.value = sanitizedTitle;
        authorInput.value = sanitizedAuthor;
        addBook();
        submitForm.reset();

        // Close the modal after submitting the book
        document.querySelector(".add-book").classList.remove("show");
        document.querySelector(".modal-overlay").classList.remove("show");
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.getElementById("searchBook").addEventListener("submit", searchBook);

// Remove Later
document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY));
});
