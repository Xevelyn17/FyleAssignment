const repositoriesElement = document.getElementById('repositories');
const userDetailsElement = document.getElementById('userDetails');
const loaderElement = document.getElementById('loader');
const paginationElement = document.getElementById('pagination');

let currentPage = 1;
let repositoriesPerPage = 10;

async function getRepositories() {
    repositoriesElement.innerHTML = ''; 
    userDetailsElement.innerHTML = ''; 
    loaderElement.style.display = 'block'; 

    const username = document.getElementById('username').value;
    repositoriesPerPage = +document.getElementById('perPage').value; 
    const search = document.getElementById('search').value.toLowerCase(); 

    try {
        let apiUrl = `https://api.github.com/users/${username}?per_page=${repositoriesPerPage}`;
        const response = await fetch(apiUrl);
        const user = await response.json();

        // Display user details
        userDetailsElement.innerHTML = `
      <img src="${user.avatar_url}" alt="Profile Photo">
      <div>
        <p><strong>${user.name || username}</strong></p>
        <p>${user.bio || 'No bio available'}</p>
        <p>${user.location || 'No location available'}</p>
        <p>${user.email || 'No email available'}</p>
        <p>${user.company || 'No company available'}</p>
        <p>${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : 'No blog available'}</p>
      </div>
    `;

        // Display repositories
        apiUrl = `https://api.github.com/users/${username}/repos?per_page=${repositoriesPerPage}&page=${currentPage}`;
        if (search) {
            apiUrl += `&q=${search}`;
        }

        const repositories = await (await fetch(apiUrl)).json();

        repositories.forEach(repo => {
            const li = document.createElement('li');
            li.className = 'repository';
            li.innerHTML = `
        <div>
          <strong>${repo.name}</strong>
          <p>${repo.description || 'No description available'}</p>
          <p>Topics: ${repo.topics.join(', ')}</p>
        </div>
        <a href="${repo.html_url}" target="_blank">View on GitHub</a>
      `;
            repositoriesElement.appendChild(li);
        });

       
        const totalPages = Math.ceil(user.public_repos / repositoriesPerPage);
        renderPagination(totalPages);
    } catch (error) {
        console.error('Error fetching data:', error);
        userDetailsElement.innerHTML = '<p>Error fetching user details. Please check the username.</p>';
        repositoriesElement.innerHTML = '<p>Error fetching repositories. Please check the username.</p>';
    } finally {
        loaderElement.style.display = 'none'; 
    }
}

function renderPagination(totalPages) {
    paginationElement.innerHTML = '';

    const prevButton = createPaginationButton('Previous', currentPage > 1, () => {
        if (currentPage > 1) {
            currentPage--;
            getRepositories();
        }
    });

    paginationElement.appendChild(prevButton);

    const maxPagesToShow = 4; 
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(currentPage - halfMaxPages, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    if (startPage > 1) {
        const firstPageButton = createPaginationButton(1, true, () => {
            currentPage = 1;
            getRepositories();
        });
        paginationElement.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsisBefore = document.createElement('span');
            ellipsisBefore.textContent = '...';
            ellipsisBefore.classList.add('ellipsis');
            paginationElement.appendChild(ellipsisBefore);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i, true, () => {
            currentPage = i;
            getRepositories();
        });
        paginationElement.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsisAfter = document.createElement('span');
            ellipsisAfter.textContent = '...';
            ellipsisAfter.classList.add('ellipsis');
            paginationElement.appendChild(ellipsisAfter);
        }

        const lastPageButton = createPaginationButton(totalPages, true, () => {
            currentPage = totalPages;
            getRepositories();
        });
        paginationElement.appendChild(lastPageButton);
    }

    const nextButton = createPaginationButton('Next', currentPage < totalPages, () => {
        if (currentPage < totalPages) {
            currentPage++;
            getRepositories();
        }
    });

    paginationElement.appendChild(nextButton);
}

function createPaginationButton(label, enabled, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.disabled = !enabled;
    button.addEventListener('click', onClick);
    button.classList.add('pagination-button');
    return button;
}