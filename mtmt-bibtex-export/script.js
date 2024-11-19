const translations = {
    en: {
        title: 'Export MTMT publications to BibTeX',
        searchPlaceholder: 'Enter author name',
        searchButton: 'Search',
        selectedAuthor: 'Selected Author',
        searching: 'Searching...',
        noPapers: 'No papers found for this author.',
        error: 'Error fetching papers. Please try again.',
        darkMode: '🌑 Dark Mode',
        lightMode: '☀️ Light Mode',
        copy: '📋 Copy',
        copied: '✅ Copied!'
    },
    hu: {
        title: 'MTMT publikációk BibTeX exportálása',
        searchPlaceholder: 'Adja meg a szerző nevét',
        searchButton: 'Keresés',
        selectedAuthor: 'Kiválasztott szerző',
        searching: 'Keresés...',
        noPapers: 'Nem található publikáció ettől a szerzőtől.',
        error: 'Hiba történt a keresés során. Kérjük, próbálja újra.',
        darkMode: '🌑 Sötét mód',
        lightMode: '☀️ Világos mód',
        copy: '📋 Másolás',
        copied: '✅ Másolva!'
    }
};

let currentLang = 'en';

function detectLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['en', 'hu'].includes(savedLang)) {
        return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'hu'].includes(browserLang) ? browserLang : 'en';
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    updateUITexts();
}

function detectTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.querySelector('.theme-btn');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = translations[currentLang][isDark ? 'lightMode' : 'darkMode'];
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function updateUITexts() {
    document.title = translations[currentLang].title;
    document.querySelector('h1').textContent = translations[currentLang].title;
    document.getElementById('authorName').placeholder = translations[currentLang].searchPlaceholder;
    document.querySelector('button[type="submit"]').textContent = translations[currentLang].searchButton;
    document.getElementById('copyButton').textContent = translations[currentLang].copy;
    updateThemeButton();
}

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(detectLanguage());
    const savedTheme = localStorage.getItem('theme') || detectTheme();
    setTheme(savedTheme);
});

async function getCitations(authorName, authorMtid) {
    if (!authorMtid) {
        const searchResponse = await fetch(`https://m2.mtmt.hu/api/author/ac/${encodeURIComponent(authorName)}`);
        const searchData = await searchResponse.json();
        const authors = searchData.content;
        if (authors.length > 0) {
            const sortedAuthors = authors.sort((a, b) => {
                const aPriority = getPriority(a.label, authorName);
                const bPriority = getPriority(b.label, authorName);
                return bPriority - aPriority;
            });
            authorName = sortedAuthors[0].label;
            authorMtid = sortedAuthors[0].mtid;
        }
    }
    const resultsElement = document.getElementById('results');
    const authorInfoElement = document.getElementById('authorInfo');

    authorInfoElement.textContent = `${translations[currentLang].selectedAuthor}: ${authorName} (MTID: ${authorMtid})`;
    resultsElement.textContent = translations[currentLang].searching;

    try {
        const response = await fetch(`https://m2.mtmt.hu/api/publication?cond=authorships.author;eq;${encodeURIComponent(authorMtid)}&format=json&size=10000`);
        const data = await response.json();
        const papers = data.content;

        if (papers.length === 0) {
            resultsElement.textContent = translations[currentLang].noPapers;
            document.getElementById('copyButton').classList.remove('visible');
            return;
        }

        const bibtexEntries = papers.map(paper => {
            const authors = paper.authorships.map(authorship => {
                if (authorship.author) {
                    return `${authorship.author.familyName}, ${authorship.author.givenName}`;
                } else {
                    return `${authorship.familyName}, ${authorship.givenName}`;
                }
            });

            // Remove duplicate authors, keeping the longer version
            const uniqueAuthors = authors.reduce((acc, curr) => {
                const currBase = curr.replace(/\.$/, '');
                const existingAuthor = acc.find(a =>
                    a.replace(/\.$/, '').startsWith(currBase) ||
                    currBase.startsWith(a.replace(/\.$/, ''))
                );

                if (!existingAuthor) {
                    acc.push(curr);
                } else if (curr.length > existingAuthor.length) {
                    acc[acc.indexOf(existingAuthor)] = curr;
                }
                return acc;
            }, []);

            const authorString = uniqueAuthors.join(' and ');

            const PublicationType = {
                BOOK_CHAPTER: 'BookChapter',
                THESIS: 'Thesis',
                JOURNAL_ARTICLE: 'JournalArticle',
                BOOK: 'Book',
                OTHER: 'PublicationOther'
            };

            let entry = '@';
            switch (paper.otype) {
                case PublicationType.BOOK_CHAPTER:
                    entry += 'inproceedings';
                    break;
                case PublicationType.THESIS:
                    entry += 'thesis';
                    break;
                case PublicationType.JOURNAL_ARTICLE:
                    entry += 'article';
                    break;
                case PublicationType.BOOK:
                    entry += 'book';
                    break;
                default:
                    entry += 'misc';
            }
            entry += `{${paper.mtid},\n`;

            entry += `    title = {${paper.title}}`;
            entry += authorString ? `,\n    author = {${authorString}}` : '';

            if (paper.otype === PublicationType.BOOK_CHAPTER) {
                entry += paper.book?.title ? `,\n    booktitle = {${paper.book.title}}` : '';
                const publisher = paper.template?.match(/<span class="publisher">(.*?)<\/span>/)?.[1];
                entry += publisher ? `,\n    publisher = {${publisher}}` : '';
            }
            if (paper.otype === PublicationType.JOURNAL_ARTICLE) {
                entry += paper.journal?.label ? `,\n    journal = {${paper.journal.label}}` : '';
            }
            if (paper.otype === PublicationType.BOOK) {
                entry += paper.publishers ? `,\n    publisher = {${paper.publishers.map(p => p.label).join(', ')}}` : '';
            }

            entry += paper.publishedYear ? `,\n    year = {${paper.publishedYear}}` : '';
            entry += paper.volume ? `,\n    volume = {${paper.volume}}` : '';
            entry += paper.issue ? `,\n    number = {${paper.issue}}` : '';
            entry += (paper.firstPage?.match(/\d/) || paper.lastPage?.match(/\d/)) ? `,\n    pages = {${paper.firstPage || ''}${paper.firstPage && paper.lastPage ? '--' : ''}${paper.lastPage || ''}}` : '';
            const doi = paper.identifiers?.find(id => id.label?.includes('DOI'))?.idValue;
            entry += doi ? `,\n    doi = {${doi}}` : '';
            const isbn = paper.book?.identifiers?.find(id => id.source.label === 'ISBN')?.idValue;
            entry += isbn ? `,\n    isbn = {${isbn}}` : '';
            entry += '\n}';

            return entry;
        });

        resultsElement.textContent = bibtexEntries.join('\n\n');
        document.getElementById('copyButton').classList.add('visible');
    } catch (error) {
        resultsElement.textContent = translations[currentLang].error;
        document.getElementById('copyButton').classList.remove('visible');
        console.error('Error:', error);
    }
}

async function copyResults() {
    const results = document.getElementById('results').textContent;
    await navigator.clipboard.writeText(results);
    const copyBtn = document.getElementById('copyButton');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = translations[currentLang].copied;
    setTimeout(() => {
        copyBtn.textContent = translations[currentLang].copy;
    }, 2000);
}

document.getElementById('authorName').addEventListener('input', async (e) => {
    const searchPrefix = e.target.value;
    const authorName = e.target.value;
    const selectedAuthor = document.querySelector(`#authorSuggestions option[value="${authorName}"]`);

    if (selectedAuthor) {
        const authorMtid = selectedAuthor.dataset.mtid;
        await getCitations(authorName, authorMtid);
        return;
    }

    try {
        const response = await fetch(`https://m2.mtmt.hu/api/author/ac/${encodeURIComponent(searchPrefix)}`);
        const data = await response.json();
        const authors = data.content;

        const datalist = document.getElementById('authorSuggestions');
        datalist.innerHTML = '';

        const sortedAuthors = authors.sort((a, b) => {
            const aPriority = getPriority(a.label, searchPrefix);
            const bPriority = getPriority(b.label, searchPrefix);
            return bPriority - aPriority;
        });

        sortedAuthors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.label;
            option.dataset.mtid = author.mtid;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching author suggestions:', error);
    }
});

// Replace all other event listeners with this single one that handles all cases
document.getElementById('authorName').addEventListener('input', async (e) => {
});

// Keep the keydown listener for Enter key
document.getElementById('authorName').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const authorName = e.target.value;
        const selectedAuthor = document.querySelector(`#authorSuggestions option[value="${authorName}"]`);
        const authorMtid = selectedAuthor ? selectedAuthor.dataset.mtid : null;
        await getCitations(authorName, authorMtid);
    }
});

// Keep the form submit handler as fallback
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const authorName = document.getElementById('authorName').value;
    const selectedAuthor = document.querySelector(`#authorSuggestions option[value="${authorName}"]`);
    const authorMtid = selectedAuthor ? selectedAuthor.dataset.mtid : null;
    await getCitations(authorName, authorMtid);
});

function getPriority(label, searchPrefix) {
    const lowerLabel = label.toLowerCase();
    let priority = 0;

    if (lowerLabel.includes('informatika')) priority += 10;
    if (lowerLabel.includes('szoftver')) priority += 10;
    if (lowerLabel.includes('számítástudomány')) priority += 8;
    if (lowerLabel.includes('matematika')) priority += 6;
    if (lowerLabel.includes('számelmélet')) priority += 6;
    if (lowerLabel.includes('formális')) priority += 5;

    const words = lowerLabel.split(' ');
    words.forEach(word => {
        if (word.startsWith(searchPrefix.toLowerCase())) {
            priority += 5;
        }
    });
    if (lowerLabel.startsWith(searchPrefix.toLowerCase())) {
        priority += 5;
    }

    return priority;
}