const bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";
const currentYear = new Date().getFullYear();

const isStorageExist = () => {
    if (typeof Storage === undefined) {
        alert("Browser Anda tidak mendukung local storage");
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
        bookObject.isComplete
            ? undoFromCompleteBooks(bookObject.id)
            : moveToCompleteBooks(bookObject.id);
    });

    deleteButton.addEventListener("click", () => removeBook(bookObject.id));
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

const moveToCompleteBooks = (bookId) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const undoFromCompleteBooks = (bookId) => {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const removeBook = (bookId) => {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    bookshelf.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
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

        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));

        document.getElementById("editBookForm").reset();
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

document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY));
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
    // Do nothing if editBookContainer is active
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

// /*
// {
//   id: string | number,
//   title: string,
//   author: string,
//   year: number,
//   isComplete: boolean,
// }
//   */
// const bookshelf = [];
// const RENDER_EVENT = "render-book";

// const SAVED_EVENT = "saved-book";
// const STORAGE_KEY = "BOOKSHELF_APP";

// const currentYear = new Date().getFullYear();

// function isStorageExist() {
//     if (typeof Storage === undefined) {
//         alert("Browser Anda tidak mendukung local storage");
//         return false;
//     }
//     return true;
// }

// function saveData() {
//     if (isStorageExist()) {
//         const parsed = JSON.stringify(bookshelf);
//         localStorage.setItem(STORAGE_KEY, parsed);
//         document.dispatchEvent(new Event(SAVED_EVENT));
//     }
// }

// function loadDataFromStorage() {
//     const serializedData = localStorage.getItem(STORAGE_KEY);
//     let data = JSON.parse(serializedData);

//     if (data !== null) {
//         for (const book of data) {
//             bookshelf.push(book);
//         }
//     }

//     document.dispatchEvent(new Event(RENDER_EVENT));
// }

// function generateId() {
//     return Number(new Date());
// }

// function generateBookObject(id, title, author, year, isComplete) {
//     return {
//         id,
//         title,
//         author,
//         year,
//         isComplete,
//     };
// }

// function addBook() {
//     const bookTitle = document.getElementById("bookFormTitle").value;
//     const bookAuthor = document.getElementById("bookFormAuthor").value;
//     const bookYear = document.getElementById("bookFormYear").value;
//     const isComplete = document.getElementById("bookFormIsComplete").checked;

//     const generateID = generateId();
//     const bookObject = generateBookObject(
//         generateID,
//         bookTitle,
//         bookAuthor,
//         bookYear,
//         isComplete
//     );
//     bookshelf.push(bookObject);

//     document.dispatchEvent(new Event(RENDER_EVENT));
//     saveData();
// }

// function displayBooks(bookObject) {
//     const bookItemTitle = document.createElement("h3");
//     bookItemTitle.innerText = bookObject.title;
//     bookItemTitle.setAttribute("data-testid", "bookItemTitle");

//     const bookItemAuthor = document.createElement("p");
//     bookItemAuthor.innerText = `Penulis: ${bookObject.author}`;
//     bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");

//     const bookItemYear = document.createElement("p");
//     bookItemYear.innerText = `Tahun: ${bookObject.year}`;
//     bookItemYear.setAttribute("data-testid", "bookItemYear");

//     const buttonContainer = document.createElement("div");
//     buttonContainer.classList.add("button-container");

//     const completeButton = document.createElement("div");
//     completeButton.classList.add("button-style", "button-complete");
//     if (bookObject.isComplete) {
//         completeButton.innerText = "Belum selesai dibaca";
//     } else {
//         completeButton.innerText = "Selesai dibaca";
//     }

//     completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
//     buttonContainer.appendChild(completeButton);

//     const deleteButton = document.createElement("div");
//     deleteButton.classList.add("button-style", "button-delete");
//     deleteButton.innerText = "Hapus Buku";
//     deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
//     buttonContainer.appendChild(deleteButton);

//     const editButton = document.createElement("div");
//     editButton.classList.add("button-style", "button-edit");
//     editButton.innerText = "Edit Buku";
//     editButton.setAttribute("data-testid", "bookItemEditButton");
//     buttonContainer.appendChild(editButton);

//     const bookContainer = document.createElement("div");
//     bookContainer.setAttribute("data-bookid", `${bookObject.id}`);
//     bookContainer.setAttribute("data-testid", "bookItem");
//     bookContainer.classList.add("book-item");
//     bookContainer.appendChild(bookItemTitle);
//     bookContainer.appendChild(bookItemAuthor);
//     bookContainer.appendChild(bookItemYear);
//     bookContainer.appendChild(buttonContainer);

//     if (bookObject.isComplete) {
//         completeButton.addEventListener("click", function () {
//             undoFromCompleteBooks(bookObject.id);
//         });
//     } else {
//         completeButton.addEventListener("click", function () {
//             moveToCompleteBooks(bookObject.id);
//         });
//     }

//     deleteButton.addEventListener("click", function () {
//         removeBook(bookObject.id);
//     });

//     editButton.addEventListener("click", function () {
//         editBook(bookObject.id);
//     });

//     return bookContainer;
// }

// // Optional
// function searchBook(event) {
//     event.preventDefault();

//     const searchTitle = document
//         .getElementById("searchBookTitle")
//         .value.toLowerCase();

//     const filteredBooks = bookshelf.filter((book) =>
//         book.title.toLowerCase().includes(searchTitle)
//     );

//     const incompleteBookList = document.getElementById("incompleteBookList");
//     const completeBookList = document.getElementById("completeBookList");

//     incompleteBookList.innerHTML = "";
//     completeBookList.innerHTML = "";

//     for (const bookItem of filteredBooks) {
//         const bookElement = displayBooks(bookItem);
//         if (!bookItem.isComplete) {
//             incompleteBookList.appendChild(bookElement);
//         } else {
//             completeBookList.appendChild(bookElement);
//         }
//     }
// }

// function moveToCompleteBooks(bookId) {
//     const bookTarget = findBook(bookId);

//     if (bookTarget == null) return;

//     bookTarget.isComplete = true;
//     document.dispatchEvent(new Event(RENDER_EVENT));
//     saveData();
// }

// function undoFromCompleteBooks(bookId) {
//     const bookTarget = findBook(bookId);

//     if (bookTarget == null) return;

//     bookTarget.isComplete = false;
//     document.dispatchEvent(new Event(RENDER_EVENT));
//     saveData();
// }

// function removeBook(bookId) {
//     const bookTarget = findBookIndex(bookId);

//     if (bookTarget === -1) return;

//     bookshelf.splice(bookTarget, 1);
//     document.dispatchEvent(new Event(RENDER_EVENT));
//     saveData();
// }

// function findBook(bookId) {
//     for (const bookItem of bookshelf) {
//         if (bookItem.id === bookId) {
//             return bookItem;
//         }
//     }
//     return null;
// }

// function findBookIndex(bookId) {
//     for (const index in bookshelf) {
//         if (bookshelf[index].id === bookId) {
//             return index;
//         }
//     }

//     return -1;
// }

// // Optional
// // function editBook(bookId) {
// //     const bookTarget = bookshelf.find((book) => book.id === bookId);

// //     document.getElementById("editBookFormTitle").value = bookTarget.title;
// //     document.getElementById("editBookFormAuthor").value = bookTarget.author;
// //     document.getElementById("editBookFormYear").value = bookTarget.year;

// //     document.querySelector(".modal-overlay").style.display = "block";
// //     document.getElementById("editBookContainer").classList.add("active");

// //     const saveButton = document.getElementById("editBookFormSubmit");
// //     saveButton.replaceWith(saveButton.cloneNode(true));
// //     const newSaveButton = document.getElementById("editBookFormSubmit");

// //     newSaveButton.addEventListener("click", function (event) {
// //         event.preventDefault();

// //         bookTarget.title = document.getElementById("editBookFormTitle").value;
// //         bookTarget.author = document.getElementById("editBookFormAuthor").value;
// //         bookTarget.year = document.getElementById("editBookFormYear").value;

// //         saveData();

// //         // Re-render the book list
// //         document.dispatchEvent(new Event(RENDER_EVENT));

// //         // Reset the form and button text after saving
// //         document.getElementById("editBookForm").reset();
// //         document.getElementById("editBookContainer").classList.remove("active");
// //         document.querySelector(".modal-overlay").style.display = "none";
// //     });
// // }

// function editBook(bookId) {
//     const bookTarget = bookshelf.find((book) => book.id === bookId);

//     // Populate the form fields with the book's data
//     document.getElementById("editBookFormTitle").value = bookTarget.title;
//     document.getElementById("editBookFormAuthor").value = bookTarget.author;
//     document.getElementById("editBookFormYear").value = bookTarget.year;

//     // Display the modal overlay and the edit book container
//     document.querySelector(".modal-overlay").style.display = "block";
//     document.getElementById("editBookContainer").classList.add("active");

//     // Clone the save button to remove any previous event listeners
//     const saveButton = document.getElementById("editBookFormSubmit");
//     saveButton.replaceWith(saveButton.cloneNode(true));
//     const newSaveButton = document.getElementById("editBookFormSubmit");

//     // Add a new event listener to handle the form submission
//     newSaveButton.addEventListener("click", function (event) {
//         event.preventDefault();

//         // Validate the form fields
//         const title = document.getElementById("editBookFormTitle").value.trim();
//         const author = document
//             .getElementById("editBookFormAuthor")
//             .value.trim();
//         const year = document.getElementById("editBookFormYear").value.trim();

//         if (title === "" || author === "" || year === "") {
//             alert("All fields are required.");
//             return;
//         }

//         if (isNaN(year) || year <= 0 || year > currentYear) {
//             alert("Please enter a valid year.");
//             return;
//         }

//         // Update the book data
//         bookTarget.title = title;
//         bookTarget.author = author;
//         bookTarget.year = year;

//         // Save the updated data
//         saveData();

//         // Re-render the book list
//         document.dispatchEvent(new Event(RENDER_EVENT));

//         // Reset the form and hide the modal after saving
//         document.getElementById("editBookForm").reset();
//         document.getElementById("editBookContainer").classList.remove("active");
//         document.querySelector(".modal-overlay").style.display = "none";
//     });
// }

// // Optionally, if you want to add a close button to hide the form manually
// document.addEventListener("click", function (event) {
//     if (event.target.classList.contains("close-modal")) {
//         document.querySelector(".modal-overlay").style.display = "none";
//         document.getElementById("editBookContainer").classList.remove("active");
//     }
// });

// document.addEventListener(RENDER_EVENT, function () {
//     const incompleteBookList = document.getElementById("incompleteBookList");
//     incompleteBookList.innerHTML = "";

//     const completeBookList = document.getElementById("completeBookList");
//     completeBookList.innerHTML = "";

//     for (const bookItem of bookshelf) {
//         const bookElement = displayBooks(bookItem);
//         if (!bookItem.isComplete) {
//             incompleteBookList.appendChild(bookElement);
//         } else {
//             completeBookList.appendChild(bookElement);
//         }
//     }
// });

// document.addEventListener(SAVED_EVENT, function () {
//     console.log(localStorage.getItem(STORAGE_KEY));
// });

// // scripts.js
// document.getElementById("addBookButton").addEventListener("click", function () {
//     document.querySelector(".add-book").classList.add("show");
//     document.querySelector(".modal-overlay").classList.add("show");
// });

// document.querySelector(".modal-overlay").addEventListener("click", function () {
//     document.querySelector(".add-book").classList.remove("show");
//     document.querySelector(".modal-overlay").classList.remove("show");
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const submitForm = document.getElementById("bookForm");
//     const yearInput = document.getElementById("bookFormYear");
//     const titleInput = document.getElementById("bookFormTitle");
//     const authorInput = document.getElementById("bookFormAuthor");

//     // Create an error message element
//     const yearErrorMessage = document.createElement("span");
//     yearErrorMessage.style.color = "red";
//     yearErrorMessage.style.fontSize = "0.9em";
//     yearErrorMessage.style.display = "none";
//     yearErrorMessage.style.textAlign = "left";
//     yearInput.parentNode.appendChild(yearErrorMessage);

//     // Function to sanitize input
//     function sanitizeInput(input) {
//         const element = document.createElement("div");
//         element.innerHTML = input;
//         const textContent = element.textContent || element.innerText || "";
//         const sanitizedInput = textContent.replace(
//             /[^a-zA-Z0-9 .,!?'"()-]/g,
//             ""
//         );
//         return sanitizedInput;
//     }

//     // Function to validate year input
//     function validateYearInput() {
//         const yearValue = parseInt(yearInput.value, 10);
//         if (isNaN(yearValue) || yearValue < 1 || yearValue > currentYear) {
//             yearErrorMessage.textContent = `Please enter a valid year between 1 and ${currentYear}!`;
//             yearErrorMessage.style.display = "block";
//             yearInput.focus();
//             return false;
//         } else {
//             yearErrorMessage.style.display = "none";
//             return true;
//         }
//     }

//     // Add event listener to year input to hide error message on valid input
//     yearInput.addEventListener("input", function () {
//         validateYearInput();
//     });

//     submitForm.addEventListener("submit", function (event) {
//         let isValid = true;

//         // Sanitize and validate title input
//         const sanitizedTitle = sanitizeInput(titleInput.value);
//         if (sanitizedTitle.trim() === "") {
//             event.preventDefault();
//             titleInput.focus();
//             isValid = false;
//         }

//         // Sanitize and validate author input
//         const sanitizedAuthor = sanitizeInput(authorInput.value);
//         if (sanitizedAuthor.trim() === "") {
//             event.preventDefault();
//             authorInput.focus();
//             isValid = false;
//         }

//         // Validate year input
//         if (!validateYearInput()) {
//             event.preventDefault();
//             isValid = false;
//         }

//         if (isValid) {
//             titleInput.value = sanitizedTitle;
//             authorInput.value = sanitizedAuthor;
//             addBook();
//             submitForm.reset();
//         }
//     });

//     if (isStorageExist()) {
//         loadDataFromStorage();
//     }
// });

// document.getElementById("searchBook").addEventListener("submit", searchBook);
