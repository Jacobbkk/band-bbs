<template>
  <form @submit.prevent="onSubmit">
    <my-text-input label="제목" v-model="formData.title" required />

    <!-- S: 비회원일 경우 닉네임과 비밀번호를 수동으로 입력합니다. -->
    <template v-if="loginUser.id <= 0">
      <my-text-input label="닉네임" v-model.trim="formData.author_name" required />

      <my-text-input type="password" label="비밀번호" v-model.trim="formData.author_pass" required />
    </template>
    <!-- E: 비회원일 경우 닉네임과 비밀번호를 수동으로 입력합니다. -->

    <!-- S: 로그인한 사용자의 auth 값이 10 이상일 경우 공지사항 체크박스 보이기 -->
    <my-input label="공지사항">
      <input type="checkbox" v-model="formData.is_notice" id="is_notice">
      <label for="is_notice">공지사항</label>
    </my-input>
    <!-- E : 로그인한 사용자의 auth 값이 10 이상일 경우 공지사항 체크박스 보이기 -->

    <my-input label="글내용">
      <editor
          height="auto"
          ref="editor"
          v-model="formData.content"
          initialEditType="wysiwyg"
          :options="editorOption"
          @change="onEditorChange"
      />
    </my-input>

    <my-input label="첨부파일">
      <input type="file" id="fileInput" ref="fileInputRef" style="display:none" multiple @change="onFileInputChange" />

      <ul>
        <li v-for="(attach,index) in formData.attach_list" :key="`attach-${index}`">
          <a :href="attach.file_url" target="_blank">{{attach.original_name}}</a>
          <button type="button" @click="removeAttach(index)">파일삭제</button>
        </li>
      </ul>
      <span v-if="ui.isUploading">파일을 업로드 중입니다.</span>
      <label v-else for="fileInput">+ 파일 추가</label>
    </my-input>

    <button type="submit">글 작성하기</button>
  </form>

</template>
<script>
import MyTextInput from "@/components/MyTextInput.vue";
import MyInput from "@/components/MyInput.vue";
import boardModel from '@/models/boardModel'

// TOAST UI 로드
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/editor';
import '@toast-ui/editor/dist/i18n/ko-kr';

export default {
  components: {MyTextInput, MyInput, Editor},
  data () {
    return {

      ui: {
        isEditorChanging: false,
        isUploading: false
      },
      formData: {
        title: '',
        is_notice: false,
        author_name: '',
        author_pass: '',
        content:'',
        attach_list: []
      },
      editorOption: {
        language: 'ko-KR',
        hideModeSwitch: true,
        initialEditType:'wysiwyg',
      }
    }
  },
  computed: {
    boardKey() {
      return this.$route.params?.boardKey ?? ''
    },
    // 글 수정일 경우 postId 값
    postId () {
      return this.$route.params?.postId ?? 0;
    },
    // 답글일 경우 부모글의 postId값
    postParentId () {
      return this.$route.params?.parentPostId ?? 0;
    },
    // postId 값의 존재여부에 따라 수정인지, 신규작성인지 구분
    isEdit () {
      return this.postId > 0
    },
    // 신규 작성이면서 postParentId 값이 있다면 답글작성으로 구분
    isReply () {
      return !this.isEdit && this.postParentId > 0
    }
  },
  mounted () {
    // Computed가 모두 계산된 이후에 작동시키기 위해 $nextTick 메서드 사용
    this.$nextTick(() => {
      // 글이 수정모드 일경우 원본 데이타를 가져옴
      if(this.isEdit)  {
        // 원본글의 정보를 가져옴
        boardModel.getPostInfo(this.postId)
            .then((res) => {
              for(let key in res.data.result) {
                // 기존 formData 객체에 등록되있는 값을 불러온 값으로 대체합니다.
                if(this.formData[key] !== 'undefined') {
                  this.formData[key] = res.data.result[key]
                }
              }

              // 수정일 경우 비회원 비밀번호는 다시 입력해야 하므로 빈값을 넣어준다.
              this.formData.author_pass = ''
            })
            // 원본글이 없을경우, 예외처리
            .catch(() => {
              alert('수정하려는 글의 정보를 불러올 수 없습니다. 존재하지 않거나, 이미 삭제되었습니다.');
              this.$router.back();
            })
      }
      // 답글 작성일 경우 부모글의 데이타를 가져옴
      else if(this.isReply) {
        // 부모글의 정보를 가져옴
        boardModel.getPostInfo(this.postParentId)
            .then((res) => {
              this.formData.title = "[RE] " + res.data.result.title
            })
            // 부모글이 없을 경우 예외처리
            .catch(() => {
              alert('답글을 달려는 글의 정보를 불러올 수 없습니다. 존재하지 않거나, 이미 삭제되었습니다.');
              //this.$router.back();
            })
      }
    })

  },
  methods: {
    // 에디터 컴포넌트의 값이 변하면, vue 인스턴스의 formData.content 값도 같이 변경해 줍니다.
    onEditorChange() {
      if(this.ui.isEditorChanging) return;

      this.ui.isEditorChanging = true;
      this.formData.content = this.$refs.editor.invoke('getHTML');
      this.ui.isEditorChanging = false;
    },
    // 첨부된 파일을 삭제합니다.
    removeAttach (index) {
      if(this.formData.attach_list.length > index + 1) {
        alert('해당 파일이 존재하지 않거나 이미 삭제되었습니다.');
        return;
      }

      // 서버에서 파일 삭제 처리
      this.$axios.delete('/attaches', {
        params: {
          file: this.formData.attach_list[index].file_path
        }
      }).finally(() => {
        // 첨부파일 목록 배열에서 삭제
        // 서버에서 삭제에 실패한다 하더라도, 현재 게시글의 첨부파일 목록에서는 삭제해야 하므로
        // finally 콜백 안에 작성
        this.formData.attach_list.splice(index, 1);
      })
    },
    // 첨부파일 업로드 처리
    async onFileInputChange () {
      const files = this.$refs.fileInputRef.files

      // 선택된 파일이 있는경우에만 실행한다.
      if(files && files.length > 0)
      {
        // 파일은 binary 형태로 업로드 되기때문에 새 FormData 객체 생성
        const formData = new FormData();

        // 선택한 파일들을 FormData 객체에 배열형태로 추가
        for(let i=0; i<files.length; i++) {
          formData.append('userfile', files[i]);
        }

        // 업로드 중에 또 파일 추가하는것을 막기위해 플래그를 사용
        this.ui.isUploading = true;

        // POST로 파일 전송
        await this.$axios.post(`/attaches`, formData, {
          headers: {
            "Content-Type": "multipart/form-data" // 바이너리 전송을 위해 multipart/form-data 로 선언
          }
        }).then((res) => {
          // 업로드가 완료되면, 첨부파일 목록에 해당 파일을 추가한다.
          for(let i=0; i<res.data.length; i++ ) {
            this.formData.attach_list.push(res.data[i])
          }

          // 기존 파일인풋은 비워준다.
          this.$refs.fileInputRef.value = ''
        }).finally(() => {
          // 모두 완료된 뒤에 업로드중 flag를 false 처리
          this.ui.isUploading = false;
        })
      }
    },
    // 글작성 처리
    onSubmit () {
      if(this.formData.title.length === 0) {
        alert('글 제목은 필수로 입력하셔야 합니다.')
        return;
      }

      if(this.formData.content.length === 0) {
        alert('글 내용은 필수로 입력하셔야 합니다.')
        return;
      }

      // 비회원일 경우 이름과 비밀번호 입력확인
      if(this.loginUser.id <= 0)
      {
        if(this.formData.author_name === '') {
          alert('닉네임은 필수로 입력하셔야 합니다.')
          return;
        }

        if(this.formData.author_pass === '') {
          alert('비밀번호는 필수로 입력하셔야 합니다.')
          return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if(! passwordRegex.test(this.formData.author_pass)) {
          alert('비밀번호는 8자 이상, 하나이상의 문자,숫자 및 특수문자를 사용하셔야 합니다');
          return;
        }
      }

      // 게시글 신규 작성이냐, 수정이냐에 따라 URL이 달라진다. (답글의 경우 로직상으론 신규 등록이다.)
      const requestUri = `/board/${this.boardKey}/posts` + ( this.isEdit ? `/${this.postId}` : '' );

      // 넘겨줄 데이타를 정리한다.
      const formData = this.formData

      // 답글의 경우 추가 패러미터를 집어넣는다.
      if(this.isReply) {
        formData.parent_id = this.postParentId * 1
      }

      this.$axios({
        method: this.isEdit ? 'PUT' : 'POST',
        url: requestUri,
        data: formData
      }).then((res) => {
        const postId = res.data.result?.id ?? 0

        // 작성후 글 고유 번호가 제대로 응답한 경우 작성한 글로 이동
        if(postId > 0) {
          this.$router.replace(`/board/${this.boardKey}/${postId}`);
        } else {
          this.$router.replace(`/board/${this.boardKey}`);
        }
      })
    }
  }
}
</script>