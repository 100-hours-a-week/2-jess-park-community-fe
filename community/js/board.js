import CommentItem from '../component/comment/comment.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getServerUrl,
    getCurrentSession,
} from '../utils/function.js';
import {
    getPost,
    deletePost,
    writeComment,
    getBoardComment,
    updateComment,
    deleteComment,
    likeComment,
    increaseViewCount
} from '../api/boardRequest.js';
import initializeHeader from '../component/header/header.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.webp';
const MAX_COMMENT_LENGTH = 1000;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_OK = 200;

const getQueryString = name => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

const getBoardDetail = async (postId) => {
    try {
        console.log('게시글 조회 시작:', postId);
        
        const response = await getPost(postId);
        const data = await response.json();
        
        console.log('API 응답 데이터:', data);

        if (!data.success) {
            throw new Error(data.message || '게시글 조회에 실패했습니다.');
        }

        return data.data;
    } catch (error) {
        console.error('게시글 조회 상세 오류:', error);
        throw error;
    }
};

const setBoardDetail = async (data, myInfo) => {
    try {
        console.log('현재 사용자:', myInfo);
        console.log('게시글 작성자:', data.userId);

        // 수정/삭제 버튼 요소
        const modElement = document.querySelector('.mod');
        const modifyBtn = document.querySelector('#modifyBtn');
        const deleteBtn = document.querySelector('#deleteBtn');

        // 작성자 확인 및 버튼 표시
        if (myInfo.userId === data.userId) {
            modElement?.classList.remove('hidden');
            
            // 수정 버튼 이벤트
            modifyBtn?.addEventListener('click', () => {
                window.location.href = `/board-edit.html?post_id=${data.id}`;
            });

            // 삭제 버튼 이벤트
            deleteBtn?.addEventListener('click', async () => {
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    const response = await deletePost(data.id);
                    if (response.success) {
                        // 성공 시 바로 이동
                        window.location.replace('/index.html');
                    } else {
                        throw new Error(response.message || '게시글 삭제에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('삭제 오류:', error);
                    // 404 에러는 무시하고 이동
                    if (error.message.includes('찾을 수 없습니다')) {
                        window.location.replace('/index.html');
                    } else {
                        alert(error.message);
                    }
                }
            });
        } else {
            modElement?.classList.add('hidden');
        }

        // 요소 선택
        const elements = {
            title: document.querySelector('.title'),
            nickname: document.querySelector('.nickname'),
            createdAt: document.querySelector('.createdAt'),
            content: document.querySelector('.content'),
            viewCount: document.querySelector('.viewCount h3'),
            commentCount: document.querySelector('.commentCount h3'),
            modElement: document.querySelector('.mod')
        };

        // 기본 정보 설정
        if (elements.title) elements.title.textContent = data.title;
        if (elements.nickname) elements.nickname.textContent = data.author;
        if (elements.createdAt && data.created_at) {
            elements.createdAt.textContent = new Date(data.created_at).toLocaleString();
        }
        if (elements.content) elements.content.textContent = data.content;
        
        // 조회수 표시
        if (elements.viewCount) {
            const hits = parseInt(data.hits || 0);
            elements.viewCount.textContent = hits.toLocaleString();
            console.log('조회수 설정:', hits);  // 디버깅 로그
        }

        // 댓글 수 설정
        if (elements.commentCount) {
            elements.commentCount.textContent = (data.comment_count || 0).toLocaleString();
        }

        // 작성자 확인 및 수정/삭제 버튼 표시
        if (elements.modElement) {
            console.log('작성자 확인:', {
                currentUser: myInfo.userId,
                postAuthor: data.userId,
                isAuthor: myInfo.userId === data.userId
            });

            if (myInfo.userId === data.userId) {
                elements.modElement.classList.remove('hidden');
            } else {
                elements.modElement.classList.add('hidden');
            }
        }

        console.log('수정/삭제 버튼:', {
            modElement: !!modElement,
            modifyBtn: !!modifyBtn,
            deleteBtn: !!deleteBtn
        });

        // 디버깅 로그
        console.log('받은 데이터:', data);

        // 좋아요 섹션 설정
        const likeButton = document.getElementById('likeButton');
        const likeCount = document.querySelector('.likeCount');
        
        if (likeCount) {
            likeCount.textContent = data.likeCount || '0';
        }

        // 좋아요 버튼 클릭 이벤트
        if (likeButton) {
            likeButton.style.cursor = 'pointer';
            likeButton.addEventListener('click', async () => {
                try {
                    const response = await handleLike(data.id);
                    if (response.success) {
                        // 좋아요 수 업데이트
                        likeCount.textContent = response.likeCount;
                        // 하트 색상 토글
                        const heart = likeButton.querySelector('i');
                        heart.classList.toggle('active');
                    }
                } catch (error) {
                    console.error('좋아요 처리 오류:', error);
                }
            });
        }

    } catch (error) {
        console.error('게시글 데이터 설정 오류:', error);
        throw error;
    }
};

// CommentEditor 클래스 추가
class CommentEditor {
    constructor(commentElement, postId, commentId, originalContent) {
        this.commentElement = commentElement;
        this.postId = postId;
        this.commentId = commentId;
        this.originalContent = originalContent;
        this.isEditing = false;
    }

    startEdit() {
        if (this.isEditing) return;
        
        this.isEditing = true;
        const contentElement = this.commentElement.querySelector('.commentContent');
        const currentContent = contentElement.textContent;

        // 에디터 UI 생성
        const editorHTML = `
            <div class="commentEditWrap">
                <textarea max_comment_length="1000">${currentContent}</textarea>
                <div class="editBtnWrap">
                    <button class="saveBtn">저장</button>
                    <button class="cancelBtn">취소</button>
                </div>
            </div>
        `;

        contentElement.innerHTML = editorHTML;

        // 이벤트 리스너 추가
        const textarea = contentElement.querySelector('textarea');
        const saveBtn = contentElement.querySelector('.saveBtn');
        const cancelBtn = contentElement.querySelector('.cancelBtn');

        textarea.focus();
        
        saveBtn.onclick = () => this.saveEdit(textarea.value);
        cancelBtn.onclick = () => this.cancelEdit();
    }

    async saveEdit(newContent) {
        try {
            if (!newContent.trim()) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            const response = await updateComment(this.postId, this.commentId, newContent);
            
            if (response.success) {
                const contentElement = this.commentElement.querySelector('.commentContent');
                contentElement.textContent = newContent;
                this.isEditing = false;
            } else {
                throw new Error('댓글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 수정 오류:', error);
            alert(error.message);
        }
    }

    cancelEdit() {
        const contentElement = this.commentElement.querySelector('.commentContent');
        contentElement.textContent = this.originalContent;
        this.isEditing = false;
    }
}

// setBoardComment 함수 수정
const setBoardComment = (comments, myInfo) => {
    try {
        const commentList = document.querySelector('.commentList');
        if (!commentList) return;

        commentList.innerHTML = '';
        const postId = getQueryString('id');

        comments.forEach(comment => {
            console.log('댓글 데이터:', comment); // 디버깅용
            
            const commentElement = document.createElement('div');
            commentElement.className = 'commentItem';
            
            // 작성자 확인
            const isAuthor = myInfo.userId === comment.userId;
            
            commentElement.innerHTML = `
                <div class="commentHeader">
                    <span class="author">${comment.author}</span>
                    <span class="date">${new Date(comment.created_at).toLocaleString()}</span>
                    ${isAuthor ? `
                        <div class="commentActions">
                            <button class="editComment">수정</button>
                            <button class="deleteComment">삭제</button>
                        </div>
                    ` : ''}
                </div>
                <div class="commentContent">
                    <p class="commentText">${comment.content}</p>
                </div>
            `;

            // 삭제 버튼 이벤트
            if (isAuthor) {
                const deleteBtn = commentElement.querySelector('.deleteComment');
                if (deleteBtn) {
                    deleteBtn.onclick = async () => {
                        if (!confirm('댓글을 삭제하시겠습니까?')) return;
                        
                        try {
                            const response = await deleteComment(postId, comment.id);
                            
                            if (response.success) {
                                // DOM에서 댓글 요소만 제거
                                commentElement.remove();
                                
                                // 댓글 수 감소
                                const commentCountElement = document.querySelector('.commentCount h3');
                                if (commentCountElement) {
                                    const currentCount = parseInt(commentCountElement.textContent.replace(/,/g, ''));
                                    commentCountElement.textContent = (currentCount - 1).toLocaleString();
                                }
                            } else {
                                throw new Error(response.message || '댓글 삭제에 실패했습니다.');
                            }
                        } catch (error) {
                            console.error('댓글 삭제 오류:', error);
                            alert(error.message);
                        }
                    };
                }
            }

            commentList.appendChild(commentElement);
        });
    } catch (error) {
        console.error('댓글 목록 설정 오류:', error);
    }
};

const addComment = async () => {
    try {
        const textarea = document.querySelector('.commentInputWrap textarea');
        if (!textarea || !textarea.value.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        const postId = getQueryString('id');
        if (!postId) {
            throw new Error('게시글 ID가 없습니다.');
        }

        const response = await writeComment(postId, textarea.value);
        console.log('댓글 작성 응답:', response);

        if (response.success) {
            textarea.value = '';
            await refreshComments(postId);  // 댓글 목록과 카운트 새로고침
        } else {
            throw new Error(response.message || '댓글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 작성 오류:', error);
        alert(error.message || '댓글 작성에 실패했습니다.');
    }
};

const inputComment = (event) => {
    const textarea = event.target;
    const commentBtn = document.querySelector('.commentInputBtn');
    
    // 최대 길이 제한
    if (textarea.value.length > MAX_COMMENT_LENGTH) {
        textarea.value = textarea.value.substring(0, MAX_COMMENT_LENGTH);
    }

    // 버튼 활성화/비활성화
    if (commentBtn) {
        if (textarea.value.trim()) {
            commentBtn.disabled = false;
            commentBtn.style.backgroundColor = '#7F6AEE';
        } else {
            commentBtn.disabled = true;
            commentBtn.style.backgroundColor = '#ACA0EB';
        }
    }
};

const initializeComments = async (postId, myInfo) => {
    try {
        // 댓글 목록 로드
        const comments = await getBoardComment(postId);
        if (comments && comments.data && comments.data.length > 0) {
            setBoardComment(comments.data, myInfo);
        }

        // 댓글 입력 UI 기화
        const commentBtn = document.querySelector('.commentInputBtn');
        const textarea = document.querySelector('.commentInputWrap textarea');
        
        if (commentBtn && textarea) {
            // 초기 버튼 상태 설정
            commentBtn.disabled = true;
            commentBtn.style.backgroundColor = '#ACA0EB';

            // 이벤트 리스너 등록
            textarea.addEventListener('input', inputComment);
            commentBtn.addEventListener('click', addComment);
        }
    } catch (error) {
        console.error('댓글 초기화 오류:', error);
    }
};

const updateCommentCount = (count) => {
    const commentCountElement = document.querySelector('.commentCount h3');
    if (commentCountElement) {
        commentCountElement.textContent = count.toLocaleString();
    }
};

const refreshComments = async (postId) => {
    try {
        const comments = await getBoardComment(postId);
        console.log('댓글 목록 새로고침:', comments);
        
        if (comments && comments.data) {
            const myInfo = await authCheck();
            setBoardComment(comments.data, myInfo);
            updateCommentCount(comments.data.length);
        }
    } catch (error) {
        console.error('댓글 목록 새로고침 오류:', error);
        throw error;
    }
};

// 댓글 입력 관련 요소 선택
const commentTextarea = document.querySelector('.commentInputWrap textarea');
const commentSubmitBtn = document.querySelector('.commentInputBtn');

// 댓글 입력 이벤트 리스너
const initializeCommentInput = () => {
    if (!commentTextarea || !commentSubmitBtn) return;

    // 텍스트 입력 시 버튼 활성화/비활성화
    commentTextarea.addEventListener('input', () => {
        const content = commentTextarea.value.trim();
        commentSubmitBtn.disabled = !content;
        commentSubmitBtn.style.backgroundColor = content ? '#7F6AEE' : '#ACA0EB';
    });

    // 댓글 등록 버튼 클릭 이벤트
    commentSubmitBtn.addEventListener('click', async () => {
        try {
            const postId = getQueryString('id');
            const content = commentTextarea.value.trim();
            
            if (!content) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            console.log('댓글 작성 시도:', { postId, content });
            const response = await writeComment(postId, content);
            console.log('댓글 작성 응답:', response);

            if (response.success) {
                // 댓글 입력창 초기화
                commentTextarea.value = '';
                commentSubmitBtn.disabled = true;
                commentSubmitBtn.style.backgroundColor = '#ACA0EB';
                
                // 댓글 목록 새로고침
                await loadComments(postId);
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            alert(error.message);
        }
    });
};

// 댓글 목록 로드 함수
const loadComments = async (postId) => {
    try {
        console.log('댓글 목록 로드 시도:', postId);
        const response = await getBoardComment(postId);
        console.log('댓글 목록 응답:', response);

        if (response.success) {
            renderComments(response.data);
            setCommentCount(response.data.length);
        }
    } catch (error) {
        console.error('댓글 로드 오류:', error);
        alert(error.message);
    }
};

// 댓글 목록 렌더링 함수
const renderComments = (comments) => {
    const commentList = document.querySelector('.commentList');
    if (!commentList) return;
    
    commentList.innerHTML = '';
    const myInfo = getCurrentSession();
    const postId = getQueryString('id');

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'commentItem';
        
        // 작성자 본인 여부 확인
        const isMine = myInfo.userId === comment.userId;
        
        commentElement.innerHTML = `
            <div class="commentHeader">
                <div class="commentUser">
                    <span class="author">${comment.author}</span>
                    <span class="date">${new Date(comment.created_at).toLocaleString()}</span>
                </div>
                ${isMine ? `
                    <div class="commentActions">
                        <button class="editComment">수정</button>
                        <button class="deleteComment">삭제</button>
                    </div>
                ` : ''}
            </div>
            <div class="commentContent">
                <p class="commentText">${comment.content}</p>
                <div class="editForm" style="display: none;">
                    <textarea>${comment.content}</textarea>
                    <div class="editButtons">
                        <button class="saveEdit">저장</button>
                        <button class="cancelEdit">취소</button>
                    </div>
                </div>
            </div>
        `;

        // 수정 버튼 이벤트 리스너
        if (isMine) {
            const editBtn = commentElement.querySelector('.editComment');
            const deleteBtn = commentElement.querySelector('.deleteComment');
            const commentText = commentElement.querySelector('.commentText');
            const editForm = commentElement.querySelector('.editForm');
            const saveBtn = commentElement.querySelector('.saveEdit');
            const cancelBtn = commentElement.querySelector('.cancelEdit');

            // 수정 버튼 클릭
            editBtn?.addEventListener('click', () => {
                commentText.style.display = 'none';
                editForm.style.display = 'block';
            });

            // 취소 버튼 릭
            cancelBtn?.addEventListener('click', () => {
                commentText.style.display = 'block';
                editForm.style.display = 'none';
            });

            // 저장 버튼 클릭
            saveBtn?.addEventListener('click', async () => {
                try {
                    const newContent = editForm.querySelector('textarea').value.trim();
                    if (!newContent) {
                        alert('댓글 내용을 입력해주세요.');
                        return;
                    }

                    console.log('댓글 수정 시도:', { postId, commentId: comment.id, content: newContent });
                    const response = await updateComment(postId, comment.id, newContent);
                    console.log('댓글 수정 응답:', response);
                    
                    if (response.success) {
                        await loadComments(postId);
                    } else {
                        throw new Error(response.message || '댓글 수정에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('댓글 수정 오류:', error);
                    alert(error.message);
                }
            });

            // 삭제 버튼 클릭
            deleteBtn?.addEventListener('click', async () => {
                if (confirm('댓글을 삭제하시겠습니까?')) {
                    try {
                        console.log('댓글 삭제 시도:', { postId, commentId: comment.id });
                        const response = await deleteComment(postId, comment.id);
                        console.log('댓글 삭제 응답:', response);
                        
                        if (response.success) {
                            await loadComments(postId);
                        } else {
                            throw new Error(response.message || '댓글 삭제에 실패했습니다.');
                        }
                    } catch (error) {
                        console.error('댓글 삭제 오류:', error);
                        alert(error.message);
                    }
                }
            });
        }

        commentList.appendChild(commentElement);
    });
};

// 댓글 수 업데이트 (이름 변경)
const setCommentCount = (count) => {
    const commentCountElement = document.querySelector('.commentCount h3');
    if (commentCountElement) {
        commentCountElement.textContent = count.toLocaleString();
    }
};

// 뒤로가기 버튼 이벤트 핸들러 추가
const initializeBackButton = () => {
    const backButton = document.querySelector('.back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
        
        // 커서 스타일 추가
        backButton.style.cursor = 'pointer';
    }
};

// 헤더의 프로필 드롭다운 초기화
const initializeProfileDropdown = () => {
    const profileImg = document.querySelector('.profile img');
    const dropdownMenu = document.querySelector('.drop');
    
    if (profileImg && dropdownMenu) {
        // 프로필 이미지 클릭 이벤트
        profileImg.addEventListener('click', (event) => {
            event.stopPropagation();  // 이벤트 버블링 방지
            dropdownMenu.classList.toggle('none');
        });

        // 문서 클릭 시 드롭다운 메뉴 닫기
        document.addEventListener('click', () => {
            dropdownMenu.classList.add('none');
        });
    }
};

// init 함수 수정
const init = async () => {
    try {
        // header 초기화
        initializeHeader();
        
        // 뒤로가기 버튼 초기화
        initializeBackButton();
        
        // 프로필 드롭다운 초기화 추가
        initializeProfileDropdown();
        
        const postId = getQueryString('id');
        if (!postId) {
            throw new Error('게시글 ID가 없습니다.');
        }

        // 조회수 증가
        await increaseViewCount(postId);
        
        // 게시글 데이터 로드
        const data = await getBoardDetail(postId);
        const myInfo = getCurrentSession();
        
        // 게시글 데이터 설정
        await setBoardDetail(data, myInfo);
        
        // 댓글 기능 초기화 추가
        initializeCommentInput();
        await loadComments(postId);
        
    } catch (error) {
        console.error('초기화 오류:', error);
        alert(error.message);
    }
};

// 페이지네이션 상태 관리
let page = 1;
const PAGE_SIZE = 10;
let isLoading = false;
let hasMore = true;

// 게시글 목록 로드 함수 수정
const loadPosts = async () => {
    try {
        if (isLoading || !hasMore) return;
        
        isLoading = true;
        console.log(`페이지 ${page} 로드 시작`);
        
        const response = await fetch(`${getServerUrl()}/api/posts?page=${page}&limit=${PAGE_SIZE}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCurrentSession()?.sessionId}`,
                'userId': getCurrentSession()?.userId
            }
        });

        if (!response.ok) {
            throw new Error('게시글 목록을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        console.log('서버 응답:', data); // 디버깅용
        
        if (data.success && Array.isArray(data.data)) {
            // 데이터가 더 있는지 확인 (마지막 페이지 체크)
            hasMore = data.data.length === PAGE_SIZE;
            
            // 게시글 렌더링
            renderPosts(data.data, page === 1);
            
            // 페이지 증가
            page++;
        }
    } catch (error) {
        console.error('게시글 목록 로드 오류:', error);
        alert(error.message);
    } finally {
        isLoading = false;
    }
};

// 게시글 렌더링 함수
const renderPosts = (posts, isFirstPage) => {
    const listElement = document.querySelector('.boardList');
    if (!listElement) return;

    // 첫 페이지일 경우에만 초기화
    if (isFirstPage) {
        listElement.innerHTML = '';
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'boardItem';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class="author">${post.author}</p>
            <p class="date">${new Date(post.created_at).toLocaleString()}</p>
            <div class="stats">
                <span>조회 ${post.hits || 0}</span>
                <span>댓글 ${post.comment_count || 0}</span>
                <span>좋아요 ${post.like_count || 0}</span>
            </div>
        `;

        postElement.onclick = () => {
            window.location.href = `/board.html?id=${post.id}`;
        };

        listElement.appendChild(postElement);
    });
};

// 스크롤 이벤트 핸들러
const initializeInfiniteScroll = () => {
    window.addEventListener('scroll', () => {
        // 스크롤이 페이지 하단에 도달했는지 확인
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            loadPosts();
        }
    });
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadPosts(); // 첫 페이지 로드
    initializeInfiniteScroll(); // 인피니티 스크롤 초기화
});

const handleCommentLike = async (postId, commentId) => {
    try {
        const response = await likeComment(postId, commentId);
        if (response.success) {
            await refreshComments(postId);
        }
    } catch (error) {
        console.error('좋아요 오류:', error);
        alert(error.message);
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

// 좋아요 처리 함수 
const handleLike = async (postId) => {
    try {
        const response = await fetch(`${getServerUrl()}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCurrentSession()?.sessionId}`,
                'userId': getCurrentSession()?.userId
            }
        });

        return await response.json();
    } catch (error) {
        console.error('좋아요 처리 오류:', error);
        throw error;
    }
};


