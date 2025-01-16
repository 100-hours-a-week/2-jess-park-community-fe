import { getCurrentSession, handleLogout } from '../../utils/function.js';

const initializeHeader = () => {
    const header = document.querySelector('header');
    if (!header) return;

    // 세션 체크
    const session = getCurrentSession();
    if (!session) {
        const profileElements = header.querySelector('.profile');
        if (profileElements) {
            profileElements.style.display = 'none';
        }
        return;
    }

    // 프로필 관련 이벤트 설정
    const profileImg = header.querySelector('.profile img');
    const dropdownMenu = header.querySelector('.drop');

    if (profileImg && dropdownMenu) {
        // 프로필 이미지 클릭 이벤트 수정
        profileImg.addEventListener('click', (event) => {
            event.stopPropagation();
            // none 클래스가 있으면 제거, 없으면 추가
            if (dropdownMenu.classList.contains('none')) {
                dropdownMenu.classList.remove('none');
            } else {
                dropdownMenu.classList.add('none');
            }
        });

        // 문서 클릭 시 드롭다운 메뉴 닫기
        document.addEventListener('click', (event) => {
            const isClickInside = event.target.closest('.profile');
            if (!isClickInside && !dropdownMenu.classList.contains('none')) {
                dropdownMenu.classList.add('none');
            }
        });
    }

    // 로그아웃 버튼 이벤트
    const logoutBtn = header.querySelector('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
};

export default initializeHeader;
