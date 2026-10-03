
// ============================================================
// HAMBURGER MENU
// ============================================================

const hamburger = document.querySelector(".nav__hamburger");
const linksContainer = document.querySelector(".nav__menu");
const links = document.querySelectorAll(".nav__menu__link");

hamburger.addEventListener("click", (event) => {

    event.preventDefault();

    linksContainer.classList.toggle("active");
    hamburger.classList.toggle("active");

});

links.forEach((link) => {

    link.addEventListener("click", closeMenu);

});

window.addEventListener("resize", () => {

    if (!window.matchMedia("(max-width: 550px)").matches) {

        closeMenu();

    }

});

function closeMenu() {

    linksContainer.classList.remove("active");
    hamburger.classList.remove("active");

}


// ============================================================
// SEARCH
// ============================================================

const searchContainer = document.querySelector(".nav__search");
const searchButton = document.querySelector(".nav__search__button");
const searchInput = document.querySelector(".nav__search__input");
const searchResults = document.querySelector(".nav__search__results");


// ------------------------------------------------------------
// Load search index
// ------------------------------------------------------------

let searchIndex = [];
let searchIndexLoaded = false;
let searchIndexLoadFailed = false;

const searchIndexUrl = new URL("../search-index.json", document.currentScript.src);

fetch(searchIndexUrl)
    .then(response => {

        if (!response.ok) {

            throw new Error("Could not load search-index.json");

        }

        return response.json();

    })
    .then(data => {

        if (!Array.isArray(data)) {

            throw new Error("Search index must be an array");

        }

        searchIndex = data;
        searchIndexLoaded = true;

        console.log("Search index loaded:", searchIndex);

        if (searchInput.value.trim()) {

            searchInput.dispatchEvent(new Event("input"));

        }

    })
    .catch(error => {

        searchIndexLoaded = true;
        searchIndexLoadFailed = true;

        console.error("Search index error:", error);

        if (searchInput.value.trim()) {

            searchInput.dispatchEvent(new Event("input"));

        }

    });


// ------------------------------------------------------------
// Open / close search
// ------------------------------------------------------------

searchButton.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    searchContainer.classList.toggle("active");

    const isOpen = searchContainer.classList.contains("active");

    searchButton.setAttribute("aria-expanded", isOpen);

    if (isOpen) {

        searchInput.focus();

    } else {

        searchInput.value = "";
        searchResults.innerHTML = "";

    }

});


// ------------------------------------------------------------
// Prevent clicks inside search box from closing it
// ------------------------------------------------------------

searchInput.addEventListener("click", (event) => {

    event.stopPropagation();

});


// ------------------------------------------------------------
// Close search when clicking outside
// ------------------------------------------------------------

document.addEventListener("click", (event) => {

    if (!searchContainer.contains(event.target)) {

        closeSearch();

    }

});


// ------------------------------------------------------------
// Close search with Escape key
// ------------------------------------------------------------

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeSearch();

    }

});


// ------------------------------------------------------------
// Search blogs while typing
// ------------------------------------------------------------

searchInput.addEventListener("input", () => {

    const query = searchInput.value.trim().toLowerCase();

    // Clear results if search box is empty
    if (query === "") {

        searchResults.innerHTML = "";

        return;

    }

    if (!searchIndexLoaded) {

        searchResults.innerHTML =
            '<div class="search-no-results">Loading blogs...</div>';

        return;

    }

    if (searchIndexLoadFailed) {

        searchResults.innerHTML =
            '<div class="search-no-results">Search is unavailable right now.</div>';

        return;

    }

    // Search title, category and keywords
    const queryTerms = query.match(/[\p{L}\p{N}]+/gu) || [];

    const results = searchIndex.filter(article => {

        const searchableText = [article.title, article.category, article.keywords]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return queryTerms.length > 0 && queryTerms.every(term => searchableText.includes(term));

    });

    displaySearchResults(results);

});


// ------------------------------------------------------------
// Display search results
// ------------------------------------------------------------

function displaySearchResults(results) {

    searchResults.innerHTML = "";

    if (results.length === 0) {

        searchResults.innerHTML =
            '<div class="search-no-results">No blogs found.</div>';

        return;

    }

    results.forEach(article => {

        const result = document.createElement("a");

        result.href = new URL(article.url, searchIndexUrl).href;

        result.classList.add("search-result");

        result.innerHTML = `
            <div class="search-result-title">
                ${article.title}
            </div>

            <div class="search-result-category">
                ${article.category || ""}
            </div>
        `;

        searchResults.appendChild(result);

    });

}


// ------------------------------------------------------------
// Close search
// ------------------------------------------------------------

function closeSearch() {

    searchContainer.classList.remove("active");

    searchButton.setAttribute("aria-expanded", "false");

    searchResults.innerHTML = "";

}
