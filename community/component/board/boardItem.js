export function createBoardItem(post) {
    const div = document.createElement('div');
    div.classList.add('boardItem');
    div.dataset.id = post.id;
    div.style.cursor = 'pointer';
    div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p>
            작성일: ${new Date(post.createdAt).toLocaleDateString()} 
            | 조회수: ${post.views || 0}
        </p>
    `;
    return div;
}
