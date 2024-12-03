// 게시글 클릭 이벤트 처리
const handlePostClick = (postId) => {
    try {
        console.log('게시글 클릭:', postId); // 디버깅용
        if (!postId) {
            throw new Error('게시글 ID가 없습니다.');
        }
        // 상세 페이지로 이동
        window.location.href = `./board.html?id=${postId}`;
    } catch (error) {
        console.error('게시글 클릭 처리 오류:', error);
    }
};

// 게시글 목록 렌더링
const renderPosts = (posts) => {
    const postList = document.querySelector('.post-list'); // 게시글 목록을 표시할 요소
    postList.innerHTML = posts.map(post => `
        <div class="post-item" onclick="handlePostClick(${post.id})">
            <h3>${post.title}</h3>
            <p>${post.author}</p>
            <span>${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
    `).join('');
}; 