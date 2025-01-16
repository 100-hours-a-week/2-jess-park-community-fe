document.addEventListener('DOMContentLoaded', () => {
    const profile = document.querySelector('.profile');
    const dropMenu = document.querySelector('.drop');
    const logoutButton = document.getElementById('logoutBtn');

    if (!profile || !dropMenu) {
        console.error('프로필 또는 드롭 메뉴 요소를 찾을 수 없습니다.');
        return;
    }

    // 프로필 클릭 시 드롭다운 메뉴 토글
    profile.addEventListener('click', event => {
        dropMenu.classList.toggle('none');
        event.stopPropagation(); // 이벤트 버블링 방지
    });

    // 클릭 외부 시 드롭다운 메뉴 닫기
    document.addEventListener('click', event => {
        if (
            !profile.contains(event.target) &&
            !dropMenu.contains(event.target)
        ) {
            dropMenu.classList.add('none');
        }
    });

    // 로그아웃 버튼 클릭 이벤트
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // 로컬 스토리지에서 사용자 정보 제거
            localStorage.removeItem('user');

            // 알림 메시지 표시
            alert('로그아웃되었습니다.');

            // 로그인 페이지로 리다이렉트
            window.location.href = '/login.html'; // 로그인 페이지 경로에 맞게 수정
        });
    } else {
        console.error('로그아웃 버튼을 찾을 수 없습니다.');
    }
});
