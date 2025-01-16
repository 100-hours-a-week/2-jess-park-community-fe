import { createPost, updatePost, fetchPostById } from '../api/board-writeRequest.js';

document.addEventListener('DOMContentLoaded', async () => {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitButton = document.getElementById('submit');
    const postId = new URLSearchParams(window.location.search).get('id'); // URL에서 id 파라미터 가져오기

    // 로컬스토리지에서 사용자 정보 가져오기
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || !user.nickname) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login.html';
        return;
    }

    const author = user.nickname;

    // 수정 모드인지 확인
    if (postId) {
        try {
            const post = await fetchPostById(postId); // 데이터 가져오기
            console.log('Fetched Post:', post); // 가져온 데이터 확인

            // 불러온 데이터를 폼에 입력
            titleInput.value = post.data.title || ''; // post.data.title로 접근
            contentInput.value = post.data.content || ''; // post.data.content로 접근
            submitButton.textContent = '수정 완료';
        } catch (error) {
            console.error('Error fetching post:', error);
            alert('게시글 정보를 불러오지 못했습니다.');
        }
    }

    // 저장 버튼 클릭 이벤트
    submitButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }

        try {
            const postData = { title, content, author };
            console.log('Submitting Post Data:', postData); // 요청 데이터 확인

            if (postId) {
                // 수정 요청
                await updatePost(postId, postData);
                alert('게시글이 수정되었습니다.');
            } else {
                // 작성 요청
                await createPost(postData);
                alert('게시글이 작성되었습니다.');
            }

            window.location.href = `board.html?id=${postId || ''}`;
        } catch (error) {
            console.error('Error submitting post:', error);
            alert('게시글 작성/수정 중 오류가 발생했습니다.');
        }
    });
});
