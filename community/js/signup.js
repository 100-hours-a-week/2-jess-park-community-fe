import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheckReverse,
    prependChild,
    validEmail,
    validPassword,
    validNickname,
} from '../utils/function.js';
import {
    userSignup,
    checkEmail,
    checkNickname,
    fileUpload,
} from '../api/signupRequest.js';

const MAX_PASSWORD_LENGTH = 20;
const HTTP_OK = 200;
const HTTP_CREATED = 201;

const signupData = {
    email: '',
    password: '',
    nickname: '',
    profileImagePath: undefined,
};

const getSignupData = () => {
    const { email, password, passwordCheck, nickname } = signupData;
    if (!email || !password || !passwordCheck || !nickname) {
        Dialog('필수 입력 사항', '모든 값을 입력해주세요.');
        return false;
    }

    sendSignupData();
};

const sendSignupData = async () => {
    try {
        const { passwordCheck, ...props } = signupData;
        if (localStorage.getItem('profilePath')) {
            props.profileImagePath = localStorage.getItem('profilePath');
        }

        if (props.password.length > MAX_PASSWORD_LENGTH) {
            Dialog('비밀번호', '비밀번호는 20자 이하로 입력해주세요.');
            return;
        }

        const response = await userSignup(props);
        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem('profilePath');
            Dialog('회원가입 성공', '회원가입이 완료되었습니다.', () => {
                location.href = '/login.html';
            });
        } else {
            Dialog('회원 가입 실패', data.message || '잠시 뒤 다시 시도해 주세요', () => {
                localStorage.removeItem('profilePath');
            });
        }
    } catch (error) {
        console.error('Signup error:', error);
        Dialog('회원 가입 실패', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
};

const signupClick = () => {
    const signupBtn = document.querySelector('#signupBtn');
    signupBtn.removeEventListener('click', getSignupData);
    signupBtn.addEventListener('click', getSignupData);
};

const changeEventHandler = async (event, uid) => {
    if (uid == 'profile') {
        const file = event.target.files[0];
        if (!file) return;

        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );
        helperElement.textContent = '';
    }
    observeSignupData();
};

const inputEventHandler = async (event, uid) => {
    if (uid == 'email') {
        const value = event.target.value;
        const isValidEmail = validEmail(value);
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );

        if (!helperElement) {
            console.error('Helper element not found');
            return;
        }

        let isComplete = false;

        if (value == '' || value == null) {
            helperElement.textContent = '*이메일을 입력해주세요.';
        } else if (!isValidEmail) {
            helperElement.textContent =
                '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
        } else {
            try {
                const response = await checkEmail(value);
                const data = await response.json();

                if (data.success && !data.exists) {
                    helperElement.textContent = '';
                    isComplete = true;
                } else if (data.exists) {
                    helperElement.textContent = '*이미 사용 중인 이메일입니다.';
                    isComplete = false;
                } else {
                    helperElement.textContent = '*이메일 중복 확인 중 오류가 발생했습니다.';
                    isComplete = false;
                }
            } catch (error) {
                console.error('Email check error:', error);
                helperElement.textContent = '*서버 오류가 발생했습니다.';
                isComplete = false;
            }
        }

        if (isComplete) {
            signupData.email = value;
        } else {
            signupData.email = '';
        }
    } else if (uid == 'pw') {
        const value = event.target.value;
        const isValidPassword = validPassword(value);
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );
        const helperElementCheck = document.querySelector(
            `.inputBox p[name="pwck"]`,
        );

        if (!helperElement) return;

        if (value == '' || value == null) {
            helperElement.textContent = '*비밀번호를 입력해주세요.';
            helperElementCheck.textContent = '';
        } else if (!isValidPassword) {
            helperElement.textContent =
                '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            helperElementCheck.textContent = '';
        } else {
            helperElement.textContent = '';
            signupData.password = value;
        }
    } else if (uid == 'pwck') {
        const value = event.target.value;
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );

        if (!helperElement) {
            console.error('Helper element not found for password check');
            return;
        }

        const password = signupData.password;

        if (value == '' || value == null) {
            helperElement.textContent = '*비밀번호 한번 더 입력해주세요.';
        } else if (password !== value) {
            helperElement.textContent = '*비밀번호가 다릅니다.';
        } else {
            signupData.passwordCheck = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'nickname') {
        const value = event.target.value;
        const isValidNickname = validNickname(value);
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );
        let isComplete = false;

        if (value == '' || value == null) {
            helperElement.textContent = '*닉네임을 입력해주세요.';
        } else if (value.includes(' ')) {
            helperElement.textContent = '*뛰어쓰기를 없애주세요.';
        } else if (value.length > 10) {
            helperElement.textContent =
                '*닉네임은 최대 10자까지 작성 가능합니다.';
        } else if (!isValidNickname) {
            helperElement.textContent =
                '*닉네임에 특수 문자는 사용할 수 없습니다.';
        } else {
            const response = await checkNickname(value);

            if (response.status === HTTP_OK) {
                helperElement.textContent = '';
                isComplete = true;
            } else {
                helperElement.textContent = '*중복된 닉네임 입니다.';
            }
        }

        if (isComplete) {
            signupData.nickname = value;
        } else {
            signupData.nickname = '';
        }
    }
    observeSignupData();
};

const addEventForInputElements = () => {
    const InputElement = document.querySelectorAll('input');
    InputElement.forEach(element => {
        const id = element.id;
        if (id === 'profile') {
            element.addEventListener('change', event =>
                changeEventHandler(event, id),
            );
        } else {
            element.addEventListener('input', event =>
                inputEventHandler(event, id),
            );
        }
    });
};

const observeSignupData = () => {
    const { email, password, passwordCheck, nickname } = signupData;
    const button = document.querySelector('#signupBtn');

    if (
        !email ||
        !validEmail(email) ||
        !password ||
        !validPassword(password) ||
        !nickname ||
        !validNickname(nickname) ||
        !passwordCheck
    ) {
        button.disabled = true;
        button.style.backgroundColor = '#ACA0EB';
    } else {
        button.disabled = false;
        button.style.backgroundColor = '#7F6AEE';
    }
};

const uploadProfileImage = () => {
    document.getElementById('profile').addEventListener('change', async event => {
        try {
            const file = event.target.files[0];
            if (!file) {
                console.log('파일이 선택되지 않았습니다.');
                return;
            }

            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fileUpload(formData);
            if (!response.ok) throw new Error('서버 응답 오류');

            const responseData = await response.json();
            localStorage.setItem('profilePath', responseData.data.filePath);
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
            Dialog('업로드 실패', '파일 업로드 중 오류가 발생했습니다.');
        }
    });
};

const init = async () => {
    await authCheckReverse();
    prependChild(document.body, Header('커뮤니티', 1));
    observeSignupData();
    addEventForInputElements();
    signupClick();
    uploadProfileImage();
};

init();
