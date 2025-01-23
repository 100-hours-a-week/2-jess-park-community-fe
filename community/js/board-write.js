import { createPost, updatePost, fetchPostById } from '../api/board-writeRequest.js';

document.addEventListener('DOMContentLoaded', async () => {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitButton = document.getElementById('submit');
    const postId = new URLSearchParams(window.location.search).get('id'); // URL에서 id 가져오기

    let author = '';

    // ✅ 세션에서 사용자 정보 가져오기
    try {
        const response = await fetch('http://localhost:3002/api/session/user', { 
            method: 'GET',
            credentials: 'include'  // 세션 쿠키 포함
        });

        if (!response.ok) throw new Error('세션 정보를 가져올 수 없습니다.');

        const data = await response.json();
        if (!data.success) throw new Error('로그인이 필요합니다.');

        author = data.user.nickname;
        console.log('현재 로그인된 사용자:', author);
    } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        alert('로그인이 필요합니다.');
        window.location.href = '/login.html';
        return;
    }
    
    // ✅ 수정 모드인지 확인
    if (postId) {
        try {
            const post = await fetchPostById(postId);
            if (!post || !post.success || !post.data) throw new Error('게시글을 불러올 수 없음');

            titleInput.value = post.data.title || '';
            contentInput.value = post.data.content || '';
            submitButton.textContent = '수정 완료';
        } catch (error) {
            console.error('게시글 가져오기 실패:', error);
            alert('게시글 정보를 불러올 수 없습니다.');
        }
    }

    // ✅ 저장 버튼 클릭 이벤트
    submitButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }

        try {
            const postData = { title, content, author };

            if (postId) {
                await updatePost(postId, postData);
                alert('게시글이 수정되었습니다.');
                window.location.href = `board.html?id=${postId}`;
            } else {
                const createdPost = await createPost(postData);
                alert('게시글이 작성되었습니다.');
                window.location.href = `board.html?id=${createdPost.data.id}`;
            }
        } catch (error) {
            console.error('게시글 처리 중 오류:', error);
            alert('게시글 저장에 실패했습니다.');
        }
    });
});
