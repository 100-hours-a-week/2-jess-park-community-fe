import Dialog from '../component/dialog/dialog.js';
import {
    authCheck,
    validNickname,
    getCookie,
    deleteCookie,
    getAuthServerUrl,
    handleLogout,
    getCurrentSession
} from '../utils/function.js';
import { userModify, userDelete } from '../api/modifyInfoRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.webp';
const HTTP_OK = 200;

class ModifyInfo {
    constructor() {
        this.elements = {};
        this.authData = null;
        this.changeData = {
            nickname: '',
            profileImagePath: ''
        };
        this.session = getCurrentSession();
    }

    async init() {
        if (!this.session?.userId) {
            location.href = '/login.html';
            return;
        }

        try {
            const authResponse = await authCheck();
            const authData = await authResponse.json();

            if (!authResponse.ok || !authData.success) {
                throw new Error('인증 실패');
            }

            this.authData = {
                nickname: authData.data?.nickname || '',
                profileImagePath: authData.data?.profileImagePath || DEFAULT_PROFILE_IMAGE,
                userName: authData.data?.userName || ''
            };

            this.changeData = {
                nickname: this.authData.nickname,
                profileImagePath: this.authData.profileImagePath
            };

            this.initializeElements();
            this.setInitialData();
            this.addEventListeners();
            this.initializeHeader();
        } catch (error) {
            console.error('초기화 오류:', error);
            if (error.message === '인증 실패') {
                location.href = '/login.html';
            } else {
                Dialog('오류', '페이지 로딩 중 오류가 발생했습니다.');
            }
        }
    }

    initializeElements() {
        this.elements = {
            nickname: document.querySelector('#nickname'),
            profile: document.querySelector('#profile'),
            withdrawBtn: document.querySelector('#withdrawBtn'),
            nicknameHelp: document.querySelector('.inputBox p[name="nickname"]'),
            result: document.querySelector('.inputBox p[name="result"]'),
            modifyBtn: document.querySelector('#signupBtn'),
            profilePreview: document.querySelector('#profilePreview')
        };
    }

    setInitialData() {
        const { profilePreview, nickname } = this.elements;
        if (!profilePreview || !nickname) return;

        profilePreview.src = this.authData.profileImagePath || DEFAULT_PROFILE_IMAGE;
        nickname.value = this.authData.nickname || '';
    }

    addEventListeners() {
        const { nickname, profile, modifyBtn, withdrawBtn } = this.elements;
        
        nickname?.addEventListener('change', e => this.handleNicknameChange(e, 'nickname'));
        profile?.addEventListener('change', e => this.handleNicknameChange(e, 'profile'));
        modifyBtn?.addEventListener('click', async () => this.sendModifyData());
        withdrawBtn?.addEventListener('click', async () => this.deleteAccount());
    }

    handleNicknameChange(event, uid) {
        if (uid === 'nickname') {
            const value = event.target.value;
            const isValidNickname = validNickname(value);
            const helperElement = this.elements.nicknameHelp;
            
            if (!value) {
                this.updateHelperText(helperElement, '*닉네임을 입력해주세요.', true);
            } else if (!isValidNickname) {
                this.updateHelperText(
                    helperElement,
                    '*닉네임은 2~10자의 영문자, 한글 또는 숫자만 사용할 수 있습니다.',
                    true
                );
            } else if (this.authData.userName === value) {
                this.updateHelperText(helperElement, '', true);
            } else {
                this.checkNickname(value, helperElement);
            }
        } else if (uid === 'profile') {
            this.handleProfileUpload(event);
        }
        this.observeData();
    }

    updateHelperText(element, message, isDisabled) {
        element.textContent = message;
        const button = document.querySelector('#signupBtn');
        if (button) {
            button.disabled = isDisabled;
            button.style.backgroundColor = isDisabled ? '#ACA0EB' : '#7F6AEE';
        }
    }

    async checkNickname(value, helperElement) {
        try {
            const response = await fetch(`${getAuthServerUrl()}/api/check-nickname`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.session.sessionId}`
                },
                body: JSON.stringify({ 
                    nickname: value,
                    userId: this.session.userId
                }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || '닉네임 중복 체크 실패');
            }

            const data = await response.json();
            
            if (data.success) {
                this.updateHelperText(helperElement, '', false);
                this.changeData.nickname = value;
            } else {
                this.updateHelperText(
                    helperElement, 
                    data.message || '*중복된 닉네임입니다.', 
                    true
                );
            }
        } catch (error) {
            console.error('닉네임 중복 체크 오류:', error);
            this.updateHelperText(
                helperElement, 
                '*서버 오류가 발생했습니다.', 
                true
            );
        }
    }

    async handleProfileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            this.resetProfileImage();
            return;
        }
        await this.uploadProfileImage(file);
    }

    resetProfileImage() {
        localStorage.removeItem('profilePath');
        this.elements.profilePreview.src = DEFAULT_PROFILE_IMAGE;
        this.changeData.profileImagePath = null;
    }

    async uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch(
                `${getAuthServerUrl()}/api/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) throw new Error('서버 응답 오류');

            const result = await response.json();
            this.updateProfileImage(result.data.filePath);
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
            Dialog('업로드 실패', '이미지 업로드에 실패했습니다.');
        }
    }

    updateProfileImage(filePath) {
        localStorage.setItem('profilePath', filePath);
        this.changeData.profileImagePath = filePath;
        this.elements.profilePreview.src = filePath;
    }

    async sendModifyData() {
        const userId = getCookie('userId');
        const button = document.querySelector('#signupBtn');

        if (!button.disabled) {
            if (this.changeData.nickname === '') {
                Dialog('필수 정보 누락', '닉네임을 입력해주세요.');
            } else {
                try {
                    const response = await userModify(userId, this.changeData);
                    
                    if (response.ok) {
                        localStorage.removeItem('profilePath');
                        Dialog('수정 완료', '정보가 수정되었습니다.', () => {
                            location.href = '/modifyInfo.html';
                        });
                    } else {
                        localStorage.removeItem('profilePath');
                        Dialog('수정 실패', '수정에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('수정 중 오류 발생:', error);
                    Dialog('수정 실패', '서버 오류가 발생했습니다.');
                }
            }
        }
    }

    // 회원 탈퇴
    async deleteAccount() {
        const userId = getCookie('userId');
        const callback = async () => {
            const response = await userDelete(userId);

            if (response.status === HTTP_OK) {
                deleteCookie('session');
                deleteCookie('userId');
                location.href = '/login.html';
            } else {
                Dialog('회원 탈퇴 실패', '회원 탈퇴에 실패했습니다.');
            }
        };

        Dialog(
            '회원탈퇴 하시겠습니까?',
            '작성된 게시글과 댓글은 삭제 됩니다.',
            callback,
        );
    }

    // 헤더 초기화 함수 추가
    initializeHeader() {
        const profileImg = document.querySelector('.profile img');
        const dropdownMenu = document.querySelector('.drop');
        
        if (profileImg && dropdownMenu) {
            // 프로필 이미지 클릭 이벤트
            profileImg.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdownMenu.classList.toggle('none');
            });

            // 문서 클릭 시 드롭다운 메 닫기
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.profile')) {
                    dropdownMenu.classList.add('none');
                }
            });
        }

        // 로그아웃 버튼 이벤트
        const logoutBtn = document.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    observeData() {
        const button = document.querySelector('#signupBtn');
        if (
            this.authData.nickname !== this.changeData.nickname ||
            this.authData.profileImagePath !== this.changeData.profileImagePath
        ) {
            button.disabled = false;
            button.style.backgroundColor = '#7F6AEE';
        } else {
            button.disabled = true;
            button.style.backgroundColor = '#ACA0EB';
        }
    }
}

// 인스턴스 생성과 초기화를 async/await로 처리
(async () => {
    try {
        const session = getCurrentSession();
        if (!session?.userId) {
            location.href = '/login.html';
            return;
        }

        const modifyInfo = new ModifyInfo();
        await modifyInfo.init();
    } catch (error) {
        console.error('페이지 초기화 오류:', error);
        location.href = '/login.html';
    }
})();
