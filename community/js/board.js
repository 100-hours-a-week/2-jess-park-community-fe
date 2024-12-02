import CommentItem from '../component/comment/comment.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    prependChild,
    padTo2Digits,
} from '../utils/function.js';
import {
    getPost,
    deletePost,
    writeComment,
    getBoardComment,
    updateComment,
    deleteComment,
} from '../api/boardRequest.js';

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
        console.log('API 응답:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        const data = await response.json();
        console.log('응답 데이터:', data);
        
        return data;
    } catch (error) {
        console.error('게시글 조회 오류:', error);
        throw error;
    }
};

const setBoardDetail = async (data, myInfo) => {
    try {
        console.log('게시글 데이터:', data);
        console.log('현재 사용자:', myInfo);

        const titleElement = document.querySelector('.title');
        const nicknameElement = document.querySelector('.nickname');
        const createdAtElement = document.querySelector('.createdAt');
        const profileImgElement = document.querySelector('.profileImg img');
        const contentElement = document.querySelector('.content');
        const viewCountElement = document.querySelector('.viewCount h3');
        const commentCountElement = document.querySelector('.commentCount h3');
        const modElement = document.querySelector('.mod');

        // 기본 정보 설정
        if (titleElement) titleElement.textContent = data.title || '';
        if (nicknameElement) nicknameElement.textContent = data.author || '';
        if (createdAtElement && data.created_at) {
            createdAtElement.textContent = new Date(data.created_at).toLocaleString();
        }
        if (profileImgElement) {
            profileImgElement.onerror = function() {
                this.onerror = null;
                this.src = DEFAULT_PROFILE_IMAGE;
            };
            profileImgElement.src = data.profileImagePath || DEFAULT_PROFILE_IMAGE;
        }
        if (contentElement) contentElement.textContent = data.content || '';
        if (viewCountElement) viewCountElement.textContent = (data.hits || 0).toLocaleString();
        if (commentCountElement) commentCountElement.textContent = (data.comment_count || 0).toLocaleString();

        // 작성자 확인 및 수정/삭제 버튼 표시
        if (modElement) {
            console.log('작성자 확인:', {
                currentUser: myInfo.userId,
                postAuthor: data.userId,
                isAuthor: myInfo.userId === data.userId
            });

            if (myInfo.userId === data.userId) {
                modElement.classList.remove('hidden');
                
                // 삭제 버튼 이벤트
                const deleteBtn = document.getElementById('deleteBtn');
                if (deleteBtn) {
                    deleteBtn.onclick = async () => {
                        try {
                            if (confirm('게시글을 삭제하시겠습니까?')) {
                                const response = await deletePost(data.id);
                                
                                if (response && response.success) {
                                    alert('게시글이 삭제되었습니다.');
                                    window.location.href = '/pages/board-list.html';
                                } else {
                                    throw new Error(response.message || '게시글 삭제에 실패했습니다.');
                                }
                            }
                        } catch (error) {
                            console.error('삭제 오류:', error);
                            alert(error.message);
                        }
                    };
                }

                // 수정 버튼 이벤트
                const modifyBtn = document.getElementById('modifyBtn');
                if (modifyBtn) {
                    modifyBtn.onclick = () => {
                        window.location.href = `/pages/board-write.html?id=${data.id}`;
                    };
                }
            } else {
                modElement.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('게시글 데이터 설정 오류:', error);
        throw error;
    }
};

const setBoardModify = async (data, myInfo) => {
    if (myInfo.idx === data.writeId) {
        const modifyElement = document.querySelector('.hidden');
        modifyElement.classList.remove('hidden');

        const modifyBtnElement = document.querySelector('#deleteBtn');
        const postId = getQueryString('id');
        modifyBtnElement.addEventListener('click', () => {
            Dialog(
                '게시글을 삭제하시겠습니까?',
                '삭제한 내용은 복구 할 수 없습니다',
                async () => {
                    const response = await deletePost(postId);
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        Dialog('삭제 실패', '게시글 삭제에 실패했습니다');
                    }
                },
            );
        });

        const modifyBtnElement2 = document.querySelector('#modifyBtn');
        modifyBtnElement2.addEventListener('click', () => {
            window.location.href = `/board=modify.html?post_id=${data.post_id}`;
        });
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
                <textarea maxlength="1000">${currentContent}</textarea>
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
                        if (confirm('댓글을 삭제하시겠습니까?')) {
                            try {
                                console.log('삭제 시도:', { postId, commentId: comment.id });
                                const response = await deleteComment(postId, comment.id);
                                console.log('삭제 응답:', response);
                                
                                if (response.success) {
                                    await refreshComments(postId);
                                } else {
                                    throw new Error(response.message || '댓글 삭제에 실패했습니다.');
                                }
                            } catch (error) {
                                console.error('댓글 삭제 오류:', error);
                                alert(error.message || '댓글 삭제에 실패했습니다.');
                            }
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

const init = async () => {
    try {
        const myInfo = await authCheck();
        if (!myInfo) {
            throw new Error('인증이 필요합니다.');
        }

        const postId = getQueryString('id');
        if (!postId) {
            throw new Error('게시글 ID가 필요합니다.');
        }

        // 게시글 상세 정보 로드
        const postData = await getBoardDetail(postId);
        console.log('게시글 데이터:', postData);

        if (!postData.success || !postData.data) {
            throw new Error('게시글을 찾을 수 없습니다.');
        }

        // myInfo를 함께 전달하여 setBoardDetail 호출
        await setBoardDetail(postData.data, myInfo);

        // 댓글 목록 로드 및 UI 초기화
        await refreshComments(postId);

    } catch (error) {
        console.error('초기화 오류:', error);
        alert(error.message || '페이지 로드에 실패했습니다.');
        window.location.href = '/';
    }
};

// 페이지 로드 시 한 번만 초기화
document.addEventListener('DOMContentLoaded', init);

const loadPosts = async () => {
    try {
        console.log('게시글 목록 로드 시작');
        
        const response = await fetch(`${getServerUrl()}/api/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCurrentSession()?.sessionId}`,
                'userId': getCurrentSession()?.userId
            }
        });

        console.log('서버 응답:', response);

        if (!response.ok) {
            throw new Error('게시글 목록을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        console.log('받은 데이터:', data);

        if (data.success && data.data) {
            renderPosts(data.data);
        } else {
            throw new Error(data.message || '게시글 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 목록 로드 오류:', error);
        alert(error.message);
    }
};

const renderPosts = (posts) => {
    const listElement = document.querySelector('.boardList');
    if (!listElement) return;

    listElement.innerHTML = '';  // 기존 목록 초기화

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
            </div>
        `;

        postElement.onclick = () => {
            window.location.href = `/board.html?id=${post.id}`;
        };

        listElement.appendChild(postElement);
    });
};


