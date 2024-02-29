// import vue from 'vue';
import axios from '@/plugins/axios';

const exportObject = {
  /**
   * 게시글 한개의 데이타를 가져옵니다.
   * @param boardKey 게시판 고유 키
   * @param id
   * @returns {Promise<*>}
   */
  getPost: async (boardKey, id) => {
    return axios.get(`/board/${boardKey}/posts/${id}`);
  },
  /**
   * 게시글의 조회수를 처리한다.
   * @param boardKey
   * @param postId
   */
  submitHit: (boardKey, postId) => {
    // 생성된 쿠키를 체크하여, 해당 쿠키가 존재한다면 실행하지 않는다.
    // if (vue.$cookies.get('post_hit_' + postId)) return;
    if (this.$cookies.get('post_hit_' + postId)) return;

    axios.post(`/board/${boardKey}/posts/${postId}/hit`).then(() => {
      // vue.$cookies.set(`post_hit_${postId}`, true, 60 * 60 * 24); // 초 단위
      this.$cookies.set(`post_hit_${postId}`, true, 60 * 60 * 24); // 초 단위
    });
  },
};

export default exportObject;
