import initializeHeader from '../component/header/header.js';
import { getPosts } from '../api/indexRequest.js';
import { authCheck, getCurrentSession } from '../utils/function.js';

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
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        const response = await getPosts();
        const data = await response.json();  // response를 JSON으로 파싱
        console.log('불러온 게시글:', data);

        if (data.success) {
            const boardList = document.querySelector('.boardList');
            if (boardList) {
                boardList.innerHTML = data.data.map(post => createBoardItem(post)).join('');
            }
        }
    } catch (error) {
        console.error('게시글 목록 로딩 오류:', error);
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
