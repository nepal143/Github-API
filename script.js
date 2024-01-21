let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

async function searchRepositories() {
    const username = document.getElementById('usernameInput').value.trim();
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    document.getElementById('loader').classList.remove('d-none');

    try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const user = await userResponse.json();

        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await response.json();


        const filteredRepos = data.filter(repo => repo.name.toLowerCase().includes(searchQuery));

        currentPage = 1;
        await displayRepositories(filteredRepos);


        displayProfileSection(user);
        toggleRepoSearchBar();
    } catch (error) {
        console.error('Error fetching data:', error);

        document.getElementById('loader').classList.add('d-none');

        document.getElementById('repositoriesList').innerHTML = '<p class="text-danger">Error fetching data. Please try again later.</p>';
    }
}

async function displayRepositories(repositories) {
    const repositoriesList = document.getElementById('repositoriesList');
    repositoriesList.innerHTML = '';

    if (repositories.length === 0) {
        repositoriesList.innerHTML = '<p>No repositories found for the given user.</p>';
        return;
    }

    totalPages = Math.ceil(repositories.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, repositories.length);

    const techStackPromises = repositories.slice(startIndex, endIndex).map(async repo => await getTechStack(repo.languages_url));

    try {
        const techStacks = await Promise.all(techStackPromises);

        repositories.slice(startIndex, endIndex).forEach((repo, index) => {
            const techStack = techStacks[index];

            const repoCard = `
        <div class="card mb-3 repo-card">
            <div class="card-body">
                <h5 class="card-title">${repo.name}</h5>
                <p class="card-text"><strong>Description:</strong> ${repo.description || 'No description available'}</p>
                <p class="card-text"> ${displayTechStack(techStack)}</p>
            </div>
        </div>
        `;
            repositoriesList.innerHTML += repoCard;
        });

        displayPagination();
    } catch (error) {
        console.error('Error fetching tech stack:', error);

        repositoriesList.innerHTML = '<p class="text-danger">Error fetching tech stack information. Please try again later.</p>';
    }
}

function displayTechStack(techStack) {
    const techStackArray = Array.isArray(techStack) ? techStack : [techStack];
    return techStackArray.map(language => `<div class="tech-stack-box">${language}</div>`).join(' ');
}

function getTechStack(languagesUrl) {
    return fetch(languagesUrl)
        .then(response => response.json())
        .then(data => {
            const languages = Object.keys(data);
            return languages.length > 0 ? languages.join(', ') : 'Tech stack not available';
        })
        .catch(error => {
            console.error('Error fetching languages:', error);
            return 'Tech stack not available';
        });
}

function displayPagination() {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item', i === currentPage ? 'active' : null);

        const a = document.createElement('a');
        a.classList.add('page-link');
        a.href = '#';
        a.textContent = i;
        a.onclick = () => {
            currentPage = i;
            searchRepositories();
        };

        li.appendChild(a);
        paginationElement.appendChild(li);
    }

    // Previous Button
    const previousButton = document.createElement('li');
    previousButton.classList.add('page-item', currentPage === 1 ? 'disabled' : null);

    const previousLink = document.createElement('a');
    previousLink.classList.add('page-link');
    previousLink.href = '#';
    previousLink.textContent = 'Previous';
    previousLink.onclick = () => {
        displayPreviousRepositories();
    };

    previousButton.appendChild(previousLink);
    paginationElement.appendChild(previousButton);

    // Next Button
    const nextButton = document.createElement('li');
    nextButton.classList.add('page-item', currentPage === totalPages ? 'disabled' : null);

    const nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.href = '#';
    nextLink.textContent = 'Next';
    nextLink.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadNextRepositories();
        }
    };

    nextButton.appendChild(nextLink);
    paginationElement.appendChild(nextButton);
}

function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value, 10);
    searchRepositories();
}

function displayProfileSection(user) {
    const profileSection = document.getElementById('profileSection');
    profileSection.classList.remove('d-none');
    document.getElementById('profileImage').src = user.avatar_url;
    document.getElementById('profileName').textContent = user.name || 'Name not available';
    document.getElementById('profileLocation').textContent = user.location || 'Location not available';

    document.getElementById('loader').classList.add('d-none');
}

async function displayNextRepositories() {
    const username = document.getElementById('usernameInput').value.trim();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    document.getElementById('loader').classList.remove('d-none');

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await response.json();

        await displayRepositories(data);
    } catch (error) {
        console.error('Error fetching repositories:', error);

        document.getElementById('loader').classList.add('d-none');

        document.getElementById('repositoriesList').innerHTML = '<p class="text-danger">Error fetching repositories. Please try again later.</p>';
    }
}
async function loadNextRepositories() {
    const username = document.getElementById('usernameInput').value.trim();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    document.getElementById('loader').classList.remove('d-none');

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await response.json();

        await displayRepositories(data);
    } catch (error) {
        console.error('Error fetching repositories:', error);

        document.getElementById('loader').classList.add('d-none');

        document.getElementById('repositoriesList').innerHTML = '<p class="text-danger">Error fetching repositories. Please try again later.</p>';
    }
}
async function displayPreviousRepositories() {
    const username = document.getElementById('usernameInput').value.trim();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    document.getElementById('loader').classList.remove('d-none');

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await response.json();

        if (currentPage > 1) {
            currentPage--;
            await displayRepositories(data);
        }
    } catch (error) {
        console.error('Error fetching repositories:', error);

        document.getElementById('loader').classList.add('d-none');

        document.getElementById('repositoriesList').innerHTML = '<p class="text-danger">Error fetching repositories. Please try again later.</p>';
    }
}
function toggleRepoSearchBar() {
    const repoSearchContainer = document.getElementById('repoSearchContainer');
    repoSearchContainer.classList.toggle('d-none');
}