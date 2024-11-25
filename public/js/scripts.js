document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', async function () {
        const authorId = this.id;
        const response = await fetch(`/api/author/${authorId}`);
        const author = await response.json();

        document.getElementById('authorInfo').innerHTML = `
            <h3>${author.firstName} ${author.lastName}</h3>
            <p>${author.bio}</p>
            <img src="/img/${author.imageURL}" alt="${author.firstName}">
        `;
    });
});
