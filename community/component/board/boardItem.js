import { padTo2Digits } from '../../utils/function.js';

// 날짜 포맷팅 함수 추가
const format = (date) => {
    const newDate = new Date(date);
    return `${newDate.getFullYear()}-${padTo2Digits(newDate.getMonth() + 1)}-${padTo2Digits(newDate.getDate())}`;
};

const BoardItem = (
    postId,
    createdAt,
    postTitle,
    hits,
    profileImagePath,
    nickname,
    commentCount,
    like,
) => {
    const formattedDate = format(createdAt);  // 날짜 포맷팅
    
    return `
        <div class="boardItem" data-post-id="${postId}">
            <div class="boardContent">
                <div class="title">${postTitle}</div>
                <div class="info">
                    <span class="date">${formattedDate}</span>
                    <span class="view">조회 ${hits}</span>
                    <span class="comment">댓글 ${commentCount}</span>
                    <span class="like">좋아요 ${like}</span>
                </div>
            </div>
            <div class="boardProfile">
                <img src="${profileImagePath || './public/image/profile/default.webp'}" alt="프로필 이미지">
                <span>${nickname}</span>
            </div>
        </div>
    `;
};

export default BoardItem;