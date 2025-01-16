import {
    fetchPosts,
    addComment,
    removeComment,
    fetchComments,
    updateComment,
    getPostData,
} from '../api/boardRequest.js';

document.addEventListener('DOMContentLoaded', async () => {
    const titleElement = document.querySelector('.title');
    const nicknameElement = document.querySelector('.nickname');
    const dateElement = document.querySelector('.createdAt');
    const contentElement = document.querySelector('.content');
    const modifyBtn = document.getElementById('modifyBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const commentInput = document.querySelector('.commentInputWrap textarea');
    const commentButton = document.querySelector('.commentInputBtn');
    const commentList = document.querySelector('.commentList');

    // URL에서 postId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    console.log('Fetched Post ID:', postId); // 디버깅 로그 추가

    const currentPostId = postId; // 현재 게시글 ID 저장

    const renderPost = async post => {
        if (!post) {
            titleElement.textContent = '게시글을 찾을 수 없습니다.';
            nicknameElement.textContent = '';
            dateElement.textContent = '';
            contentElement.textContent = '';
            modifyBtn.classList.add('hidden');
            deleteBtn.classList.add('hidden');
            return;
        }

        // 제목, 작성자, 날짜, 내용 렌더링
        titleElement.textContent = post.title || '제목 없음';
        nicknameElement.textContent = post.author || '익명';
        dateElement.textContent = new Date(post.createdAt).toLocaleDateString();
        contentElement.textContent = post.content || '내용 없음';

        // 조회수 렌더링
        const viewCountElement = document.querySelector('.viewCount h3');
        viewCountElement.textContent = post.views || 0;

        // 댓글 수 렌더링
        const commentCountElement = document.querySelector('.commentCount h3');
        commentCountElement.textContent = post.commentsCount || 0;

        modifyBtn.classList.remove('hidden');
        deleteBtn.classList.remove('hidden');

        const user = JSON.parse(localStorage.getItem('loggedInUser'));

        if (user && post.usersLikes.includes(user.nickname)) {
            likeButton.classList.add('liked'); // 좋아요 상태
        } else {
            likeButton.classList.remove('liked'); // 좋아요 취소 상태
        }
        await renderComments();
    };

    const renderComments = async () => {
        try {
            const response = await fetchComments(currentPostId);
    
            // 댓글 목록 렌더링
            commentList.innerHTML = response.data
                .map(
                    comment => `
                    <div class="commentItem" data-id="${comment.id}">
                        <p><strong>${comment.author}</strong> (${new Date(comment.createdAt).toLocaleDateString()})</p>
                        <div class="commentContentWrap">
                            <p class="commentContent">${comment.content}</p>
                            <textarea class="editCommentInput hidden"></textarea>
                        </div>
                        <div class="commentActions">
                            <button class="editCommentBtn" data-id="${comment.id}">수정</button>
                            <button class="deleteCommentBtn" data-id="${comment.id}">삭제</button>
                            <button class="saveEditCommentBtn hidden" data-id="${comment.id}">저장</button>
                            <button class="cancelEditCommentBtn hidden">취소</button>
                        </div>
                    </div>
                `,
                )
                .join('');
    
            // 삭제 버튼 클릭 이벤트 등록
            document.querySelectorAll('.deleteCommentBtn').forEach(button => {
                button.addEventListener('click', async () => {
                    try {
                        await removeComment(currentPostId, button.dataset.id);
                    

                        const updatedPost = await getPostData(currentPostId);
                        await renderPost(updatedPost.data);  // 댓글 목록 다시 렌더링
                    } catch (error) {
                        console.error('댓글 삭제 오류:', error);
                        alert('댓글을 삭제할 수 없습니다.');
                    }
                });
            });
    
            // 수정 버튼 클릭 이벤트 등록
            document.querySelectorAll('.editCommentBtn').forEach(button => {
                button.addEventListener('click', () => {
                    const commentId = button.dataset.id;
                    const commentItem = button.closest('.commentItem');
                    const commentContent = commentItem.querySelector('.commentContent');
                    const editInput = commentItem.querySelector('.editCommentInput');
                    const saveBtn = commentItem.querySelector('.saveEditCommentBtn');
                    const cancelBtn = commentItem.querySelector('.cancelEditCommentBtn');
                    const editBtn = button;
    
                    // 기존 내용을 textarea에 표시
                    editInput.value = commentContent.textContent;
                    commentContent.classList.add('hidden');
                    editInput.classList.remove('hidden');
    
                    // 버튼 상태 변경
                    editBtn.classList.add('hidden');
                    saveBtn.classList.remove('hidden');
                    cancelBtn.classList.remove('hidden');
    
                    // 수정 UI에서 삭제 버튼 숨기기
                    const deleteBtn = commentItem.querySelector('.deleteCommentBtn');
                    if (deleteBtn) {
                        deleteBtn.style.display = 'none'; // 삭제 버튼 숨기기
                    }
                });
            });
    
            // 저장 버튼 클릭 이벤트 등록
            document.querySelectorAll('.saveEditCommentBtn').forEach(button => {
                button.addEventListener('click', async () => {
                    const commentId = button.dataset.id;
                    const commentItem = button.closest('.commentItem');
                    const editInput = commentItem.querySelector('.editCommentInput');
                    const updatedContent = editInput.value.trim();
    
                    if (!updatedContent) {
                        alert('댓글 내용을 입력하세요.');
                        return;
                    }
    
                    try {
                        await updateComment(currentPostId, commentId, updatedContent);
                        await renderComments(); // 댓글 목록 다시 렌더링
                    } catch (error) {
                        console.error('댓글 수정 오류:', error);
                        alert('댓글을 수정할 수 없습니다.');
                    }
                });
            });
    
            // 취소 버튼 클릭 이벤트 등록
            document.querySelectorAll('.cancelEditCommentBtn').forEach(button => {
                button.addEventListener('click', () => {
                    const commentItem = button.closest('.commentItem');
                    const commentContent = commentItem.querySelector('.commentContent');
                    const editInput = commentItem.querySelector('.editCommentInput');
                    const saveBtn = commentItem.querySelector('.saveEditCommentBtn');
                    const cancelBtn = button;
                    const editBtn = commentItem.querySelector('.editCommentBtn');
    
                    // textarea 숨기고 원래 내용을 표시
                    editInput.classList.add('hidden');
                    commentContent.classList.remove('hidden');
    
                    // 버튼 상태 원래대로
                    saveBtn.classList.add('hidden');
                    cancelBtn.classList.add('hidden');
                    editBtn.classList.remove('hidden');
    
                    // 숨겨진 삭제 버튼 다시 표시
                    const deleteBtn = commentItem.querySelector('.deleteCommentBtn');
                    if (deleteBtn) {
                        deleteBtn.style.display = ''; // 삭제 버튼 다시 표시
                    }
                });
            });
        } catch (error) {
            console.error('댓글 렌더링 오류:', error);
        }
    };
    
    

    const incrementViewCount = async postId => {
        try {
            const response = await fetch(
                `http://localhost:3002/api/posts/${postId}/views`,
                { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
            );
    
            if (!response.ok) {
                const error = await response.json();
                console.error('조회수 증가 실패:', error.message);
                return null; 
            }
            return await response.json();
        } catch (error) {
            console.error('조회수 증가 중 오류:', error);
            return null;
        }
    };
    
   
    const loadPostById = async () => {
        try {
            if (!postId) {
                console.error('Post ID is missing in URL');
                alert('잘못된 접근입니다.');
                return;
            }
            // 조회수 증가 요청
            await incrementViewCount(postId);
    
            const response = await getPostData(postId);
            
            await renderPost(response.data);
        } catch (error) {
            console.error('Error loading post by ID:', error);
            alert('게시글을 불러올 수 없습니다.');
        }
    };
    

    modifyBtn.addEventListener('click', () => {
        if (!currentPostId) {
            alert('수정할 게시글이 없습니다.');
            return;
        }
        window.location.href = `/board-edit.html?id=${currentPostId}`;
    });

    deleteBtn.addEventListener('click', async () => {
        if (!currentPostId) {
            alert('삭제할 게시글이 없습니다.');
            return;
        }

        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(
                    `http://localhost:3002/api/posts/${currentPostId}`,
                    {
                        method: 'DELETE',
                    },
                );

                if (response.ok) {
                    alert('게시글이 삭제되었습니다.');
                    window.location.href = '/index.html';
                } else {
                    const error = await response.json();
                    alert(`삭제 실패: ${error.message}`);
                }
            } catch (error) {
                console.error('게시글 삭제 중 오류 발생:', error);
                alert('게시글을 삭제할 수 없습니다.');
            }
        }
    });

    commentInput.addEventListener('input', () => {
        commentButton.disabled = !commentInput.value.trim();
    });

    commentButton.addEventListener('click', async () => {
        const content = commentInput.value.trim();
        if (!content) return;

        try {
            await addComment(currentPostId, content);
            commentInput.value = '';
            commentButton.disabled = true;

            // 서버에서 최신 게시글 데이터를 가져와 다시 렌더링
            const updatedPost = await getPostData(currentPostId);
            await renderPost(updatedPost.data);
        } catch (error) {
            console.error('댓글 등록 오류:', error);
            alert('댓글을 등록할 수 없습니다.');
        }
    });

    const likeButton = document.getElementById('likeButton'); // 좋아요 버튼
    const likeCountElement = document.querySelector('.likeCount'); // 좋아요 개수 표시 요소

    // 좋아요 요청 함수
    const handleLikePost = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('loggedInUser')); // 로그인 사용자 정보 가져오기
            if (!user || !user.nickname) {
                alert('로그인이 필요합니다.');
                return;
            }

            const response = await fetch(
                `http://localhost:3002/api/posts/${currentPostId}/likes`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ author: user.nickname }),
                },
            );

            if (response.ok) {
                const data = await response.json();
                console.log('좋아요 상태 변경:', data.message);
                likeCountElement.textContent = data.likes; // 좋아요 개수 업데이트

                // 버튼 상태 업데이트
                if (data.message.includes('취소')) {
                    likeButton.classList.remove('liked'); // 좋아요 취소 상태
                } else {
                    likeButton.classList.add('liked'); // 좋아요 상태
                }
            } else {
                const error = await response.json();
                console.error('좋아요 실패:', error.message);
                alert(error.message);
            }
        } catch (error) {
            console.error('좋아요 요청 중 오류 발생:', error);
            alert('좋아요 요청 중 문제가 발생했습니다.');
        }
    };

    // 좋아요 버튼 클릭 이벤트 등록
    likeButton.addEventListener('click', handleLikePost);

    await loadPostById();
});
