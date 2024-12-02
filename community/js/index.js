import initializeHeader from '../component/header/header.js';
import { getPosts } from '../api/indexRequest.js';
import { authCheck } from '../utils/function.js';

const createBoardItem = (post) => {
    return `
        <div class="boardItem" onclick="location.href='./board.html?id=${post.id}'">
            <div class="boardHeader">
                <h3>${post.title}</h3>
                <span class="date">${new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <p class="content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
            <div class="boardFooter">
                <span class="author">${post.author}</span>
                <div class="stats">
                    <span>조회 ${post.hits || 0}</span>
                    <span>댓글 ${post.comment_count || 0}</span>
                </div>
            </div>
        </div>
    `;
};

const loadPosts = async () => {
    try {
        const response = await getPosts(0, 10);
        const data = await response.json();
        
        console.log('Received data:', data);
        
        const boardListElement = document.querySelector('.boardList');
        if (data.success && data.posts && data.posts.length > 0) {
            const postsHTML = data.posts.map(post => createBoardItem(post)).join('');
            boardListElement.innerHTML = postsHTML;
        } else {
            boardListElement.innerHTML = '<p class="no-posts">게시글이 없습니다.</p>';
        }
    } catch (error) {
        console.error('게시글 로드 중 오류:', error);
        boardListElement.innerHTML = '<p class="error">게시글을 불러오는 중 오류가 발생했습니다.</p>';
    }
};

const init = async () => {
    try {
        await authCheck();  // 인증 체크
        initializeHeader();
        await loadPosts();  // 게시글 로드
    } catch (error) {
        console.error('초기화 중 오류:', error);
        window.location.href = './login.html';
    }
};

document.addEventListener('DOMContentLoaded', init); 
