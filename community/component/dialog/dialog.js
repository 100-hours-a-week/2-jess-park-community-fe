/**
 * @param {string} title 다이얼로그 제목
 * @param {string} content  다이얼로그 내용
 * @param {Function} callback 확인 버튼을 눌렀을 때 실행 될 콜백 함수, 작성하지 않으면 확인, 취소 동일한 동작으로 다이얼로그를 닫음
 */

const Dialog = (title, content, callback) => {
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    dialog.innerHTML = `
        <div class="dialogContent">
            <h2>${title}</h2>
            <p>${content}</p>
            <div class="buttons">
                <button class="confirmBtn">확인</button>
                ${callback ? '' : '<button class="cancelBtn">취소</button>'}
            </div>
        </div>
    `;

    // 버튼에 이벤트 리스너 추가
    dialog.querySelector('.confirmBtn').addEventListener('click', () => {
        document.body.removeChild(dialog);
        if (callback) callback();
    });

    const cancelBtn = dialog.querySelector('.cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    // dialog를 body에 추가
    document.body.appendChild(dialog);
};

export default Dialog;