import initializeHeader from '../component/header/header.js';
import { getCurrentSession } from '../utils/function.js';
import { updatePost, getBoardItem } from '../api/board-writeRequest.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // header 초기화 추가
        initializeHeader();
        
        // URL에서 게시글 ID 가져오기
        const postId = new URLSearchParams(window.location.search).get('post_id');
        if (!postId) {
            throw new Error('게시글 ID가 없습니다.');
        }

        // 기존 게시글 데이터 불러오기
        const response = await getBoardItem(postId);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error('게시글을 불러오는데 실패했습니다.');
        }

        // 폼 요소에 기존 데이터 설정
        const titleInput = document.querySelector('#title');
        const contentTextarea = document.querySelector('#content');
        
        if (titleInput) titleInput.value = result.data.title;
        if (contentTextarea) contentTextarea.value = result.data.content;

        // 수정 버튼 이벤트 리스너
        const updateBtn = document.querySelector('#update');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                try {
                    const updatedData = {
                        title: titleInput.value,
                        content: contentTextarea.value
                    };

                    if (!updatedData.title.trim()) {
                        alert('제목을 입력해주세요.');
                        return;
                    }

                    if (!updatedData.content.trim()) {
                        alert('내용을 입력해주세요.');
                        return;
                    }

                    console.log('수정 시도:', {
                        postId,
                        updatedData
                    });

                    const result = await updatePost(postId, updatedData);
                    
                    if (result.success) {
                        alert('게시글이 수정되었습니다.');
                        window.location.href = `/board.html?id=${postId}`;
                    } else {
                        throw new Error(result.message || '게시글 수정에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('게시글 수정 오류:', error);
                    alert(error.message);
                }
            });
        }

        // 뒤로가기 버튼 이벤트
        const backBtn = document.querySelector('.back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = `/board.html?id=${postId}`;
            });
        }

    } catch (error) {
        console.error('초기화 오류:', error);
        alert(error.message);
    }
});
