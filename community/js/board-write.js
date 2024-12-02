import Dialog from '../component/dialog/dialog.js';
import initializeHeader from '../component/header/header.js';
import {
    authCheck,
    getQueryString,
    prependChild,
} from '../utils/function.js';
import {
    createPost,
    fileUpload,
    updatePost,
    getBoardItem,
} from '../api/board-writeRequest.js';

const HTTP_OK = 200;
const HTTP_CREATED = 201;

const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 1500;

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';

const submitButton = document.querySelector('#submit');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const imageInput = document.querySelector('#image');
const imagePreviewText = document.getElementById('imagePreviewText');
const contentHelpElement = document.querySelector(
    '.inputBox p[name="content"]',
);

const boardWrite = {
    title: '',
    content: '',
};

let isModifyMode = false;
let modifyData = {};

const observeSignupData = () => {
    const { title, content } = boardWrite;
    if (!title || !content || title === '' || content === '') {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#ACA0EB';
    } else {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '#7F6AEE';
    }
};

// 엘리먼트 값 가져오기 title, content
const getBoardData = () => {
    return {
        postTitle: boardWrite.title,
        postContent: boardWrite.content,
        attachFilePath:
            localStorage.getItem('postFilePath') === null
                ? undefined
                : localStorage.getItem('postFilePath'),
    };
};

// 버튼 클릭시 이벤트
const addBoard = async () => {
    try {
        const boardData = getBoardData();

        // 제목과 내용 필수 입력 체크
        if (!boardData.postTitle.trim() || !boardData.postContent.trim()) {
            return Dialog('알림', '제목과 내용을 모두 입력해주세요.');
        }

        if (boardData.postTitle.length > MAX_TITLE_LENGTH) {
            return Dialog('알림', '제목은 26자 이하로 입력해주세요.');
        }

        if (boardData.postContent.length > MAX_CONTENT_LENGTH) {
            return Dialog('알림', '내용은 1500자 이하로 입력해주세요.');
        }

        // 버튼 비활성화 (중복 제출 방지)
        submitButton.disabled = true;

        if (!isModifyMode) {
            try {
                const response = await createPost(boardData);
                const data = await response.json();

                if (response.status === HTTP_CREATED) {
                    alert('게시글이 작성되었습니다.');
                    window.location.href = `/board.html?id=${data.id}`;
                    localStorage.removeItem('postFilePath');
                } else {
                    throw new Error(data.message || '게시글 작성에 실패했습니다.');
                }
            } catch (error) {
                alert(error.message);
                console.error('게시글 작성 중 오류:', error);
            }
        } else {
            try {
                const postId = getQueryString('post_id');
                const response = await updatePost(postId, boardData);

                if (response.ok) {
                    alert('게시글이 수정되었습니다.');
                    window.location.href = `/board.html?id=${postId}`;
                    localStorage.removeItem('postFilePath');
                } else {
                    throw new Error('게시글 수정에 실패했습니다.');
                }
            } catch (error) {
                alert(error.message);
                console.error('게시글 수정 중 오류:', error);
            }
        }
    } catch (error) {
        Dialog('오류', error.message || '게시글 작성에 실패했습니다.');
    } finally {
        // 버튼 다시 활성화
        submitButton.disabled = false;
    }
};
const changeEventHandler = async (event, uid) => {
    if (uid == 'title') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '제목을 입력해주세요.';
        } else if (value.length > MAX_TITLE_LENGTH) {
            helperElement.textContent = '제목은 26자 이하로 입력해주세요.';
            titleInput.value = value.substring(0, MAX_TITLE_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_TITLE_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'content') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '내용을 입력해주세요.';
        } else if (value.length > MAX_CONTENT_LENGTH) {
            helperElement.textContent = '내용은 1500자 이하로 입력해주세요.';
            contentInput.value = value.substring(0, MAX_CONTENT_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_CONTENT_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'image') {
        const file = event.target.files[0];
        if (!file) {
            console.log('파일이 선택되지 않았습니다.');
            return;
        }

        const imagePreview = document.querySelector('#imagePreview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            imagePreview.innerHTML = `
                <div class="preview-container">
                    <img src="${e.target.result}" alt="미리보기" />
                    <button type="button" class="remove-image"></button>
                </div>
            `;

            const removeButton = imagePreview.querySelector('.remove-image');
            removeButton.addEventListener('click', () => {
                imagePreview.innerHTML = '';
                imageInput.value = '';
                localStorage.removeItem('postFilePath');
            });
        };

        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('postFile', file);

        try {
            const response = await fileUpload(formData);
            if (!response.ok) throw new Error('서버 응답 오류');

            const result = await response.json();
            localStorage.setItem('postFilePath', result.data.filePath);
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
            Dialog('오류', '이미지 업로드에 실패했습니다.');
        }
    } else if (uid === 'imagePreviewText') {
        localStorage.removeItem('postFilePath');
        imagePreviewText.style.display = 'none';
    }

    observeSignupData();
};
// 수정모드시 사용하는 게시글 단건 정보 가져오기
const getBoardModifyData = async postId => {
    const response = await getBoardItem(postId);
    if (!response.ok) throw new Error('서버 응답 오류');

    const data = await response.json();
    return data.data;
};

// 수정 모드인지 확인
const checkModifyMode = () => {
    const postId = getQueryString('post_id');
    if (!postId) return false;
    return postId;
};

// 이벤트 등록
const addEvent = () => {
    submitButton.addEventListener('click', addBoard);
    titleInput.addEventListener('input', event =>
        changeEventHandler(event, 'title'),
    );
    contentInput.addEventListener('input', event =>
        changeEventHandler(event, 'content'),
    );
    imageInput.addEventListener('change', event =>
        changeEventHandler(event, 'image'),
    );
    if (imagePreviewText !== null) {
        imagePreviewText.addEventListener('click', event =>
            changeEventHandler(event, 'imagePreviewText'),
        );
    }
};

const setModifyData = data => {
    titleInput.value = data.post_title;
    contentInput.value = data.post_content;

    if (data.filePath) {
        // filePath에서 파일 이름만 추출하여 표시
        const fileName = data.filePath.split('/').pop();
        imagePreviewText.innerHTML =
            fileName + `<span class="deleteFile">X</span>`;
        imagePreviewText.style.display = 'block';
        localStorage.setItem('postFilePath', data.filePath);

        // 이제 추출된 파일명을 사용하여 File 객체를 생성
        const attachFile = new File(
            // 실제 이미지 데이터 대신 URL을 사용
            [data.filePath],
            // 추출된 파일명
            fileName,
            // MIME 타입 지정, 실제 이미지 타입에 맞게 조정 필요
            { type: '' },
        );

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(attachFile);
        imageInput.files = dataTransfer.files;
    } else {
        // 이미지 파일이 없으면 미리보기 숨김
        imagePreviewText.style.display = 'none';
    }

    boardWrite.title = data.post_title;
    boardWrite.content = data.post_content;

    observeSignupData();
};

const init = async () => {
    try {
        const response = await authCheck();
        if (response) {
            const data = await response.json();
            addEvent();
            observeSignupData();
            initializeHeader();
            
            const modifyId = checkModifyMode();
            if (modifyId) {
                isModifyMode = true;
                modifyData = await getBoardModifyData(modifyId);

                if (data.idx !== modifyData.writerId) {
                    Dialog('권한 없음', '권한이 없습니다.', () => {
                        window.location.href = '/';
                    });
                } else {
                    setModifyData(modifyData);
                }
            }
        }
    } catch (error) {
        console.error('Init error:', error);
        location.href = '/login.html';
    }
};

init();