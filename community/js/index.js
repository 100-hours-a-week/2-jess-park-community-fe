import { fetchPosts } from '../api/boardRequest.js'; // 조회수 증가 API 함수 제거

document.addEventListener('DOMContentLoaded', async () => {
    const boardList = document.querySelector('.boardList');
    let start = 0;
    const limit = 10;
    let isLoading = false;

    const renderPosts = posts => {
        if (!posts.length) {
            boardList.innerHTML += '<p>더 이상 게시글이 없습니다.</p>';
            return;
        }

        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 최신순 정렬

        const postHTML = posts
            .map(
                post => `
                <div class="boardItem" data-id="${post.id}">
                    <h3>${post.title}</h3>
                    <p>작성일: ${new Date(post.createdAt).toLocaleDateString()} | 조회수: ${post.views || 0}</p>
                </div>
            `,
            )
            .join('');

        boardList.innerHTML += postHTML;

        // 게시글 클릭 이벤트 추가
        document.querySelectorAll('.boardItem').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.dataset.id;

                // 게시글 페이지로 이동
                window.location.href = `/board.html?id=${postId}`;
            });
        });
    };

    const loadMorePosts = async () => {
        if (isLoading) return;
        isLoading = true;

        try {
            const response = await fetchPosts(start, limit);
            renderPosts(response.data);

            start += limit;

            if (!response.hasMore) {
                window.removeEventListener('scroll', handleScroll);
            }
        } catch (error) {
            console.error('게시글 데이터를 불러오는 중 오류 발생:', error);
            alert('게시글을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            isLoading = false;
        }
    };

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMorePosts();
        }
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    window.addEventListener('scroll', debounce(handleScroll, 200));

    await loadMorePosts(); // 초기 데이터 로드
});
