<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div class="q-pa-md" style="width: 800px" v-if="!show_loading">
      <div class="text-h5">测试点管理</div>
      <p class="q-ma-none q-pa-none">
        请注意，这里只显示文件，并不显示文件夹以及由系统自动生成的配置文件
      </p>
      <p class="q-ma-none q-pa-none">
        请将每对输入输出文件命名为 xxx.in,xxx.out
      </p>
      <p class="q-ma-none q-pa-none">
        文件操作完成后，请务必务必点击应用更改按钮，否则评测数据并不会更新！
      </p>
      <p class="q-ma-none q-pa-none">
        数据点更新后，如果你需要重判，请点击下方重判按钮
      </p>
      <q-btn
        class="q-mt-md"
        outline
        color="primary"
        label="应用更改"
        @click="genConfig"
      />
      <q-btn
        class="q-mt-md"
        outline
        color="primary"
        @click="reJudge"
        :loading="rejudge_running"
      >
        重判提交
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          重判中
        </template>
      </q-btn>
      <p>{{ rejudge_text }}</p>

      <q-uploader
        class="q-my-md"
        :url="`${$api_url}admin/testCase/upload/problem/${$route.query.id}`"
        :headers="[{ name: 'Authorization', value: user.info?.token }]"
        style="max-width: 400px"
        multiple
        field-name="file"
      />

      <!-- <q-file
        class="q-my-md"
        filled
        bottom-slots
        v-model="files_model"
        label="上传文件"
        counter
        max-files="50"
        multiple
      >
        <template v-slot:append>
          <q-icon
            v-if="files_model !== null"
            name="close"
            @click.stop.prevent="files_model = null"
            class="cursor-pointer"
          />
        </template>

        <template v-slot:after>
          <q-btn round dense flat icon="send" @click="fileUpload" />
        </template>
      </q-file> -->
      <q-markup-table>
        <thead>
          <th class="text-left" style="width: 95%">文件名</th>
          <th class="text-left" style="width: 5%">操作</th>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in file_list" :key="idx">
            <td>
              <a
                style="color: inherit; cursor: pointer; text-decoration: none"
                :href="`${$api_url}admin/testCase/problem/${$route.query.id}/file/${item}/token/${user.info?.token}`"
                >{{ item }}</a
              >
            </td>
            <td>
              <!-- <q-btn
              outline
                color="primary"
                label="下载"
                @click="pwdChange"
              /> -->
              <q-btn
                outline
                color="primary"
                label="重命名"
                @click="
                  renameFileName = item;
                  renameFileNameNew = item;
                  showRenameForm = true;
                "
              />
              <q-btn
                outline
                color="red"
                label="删除"
                @click="deleteFile(item)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
    <q-dialog v-model="showRenameForm">
      <q-card class="q-pa-md">
        <div class="text-h5">重命名</div>
        <p>{{ renameFileName }}</p>
        <q-input
          outlined
          v-model="renameFileNameNew"
          style="width: 300px"
          label="输入新文件名"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="renameFileNameNew = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:after>
            <q-btn
              round
              dense
              flat
              icon="send"
              @click="renameFileFun(renameFileName, renameFileNameNew)"
            />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import loadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const user = useUserStore();
const show_loading = ref(true);
const err_msg = ref('');
const file_list = ref([]);
const showRenameForm = ref(false);
const renameFileName = ref('');
const renameFileNameNew = ref('');
const files_model = ref(null);
let check_rejudge_timer = null;
const rejudge_text = ref('');
const rejudge_running = ref(false);
// function fileUpload() {
//   if (files_model.value === null) {
//     $q.notify({
//       type: 'negative',
//       message: '文件未选择',
//       progress: true,
//     });

//     return;
//   }
//   $q.notify({
//     type: 'positive',
//     message: '此操作需要较久时间，请稍后',
//     progress: true,
//   });
//   let formData = new FormData();
//   // formData.append('file', file_xlsx_model.value);
//   console.log(files_model.value);
//   files_model.value.forEach((file) => {
//     formData.append('file', file);
//   });
//   axios
//     .post(`/admin/testCase/upload/problem/${this_route.query.id}`, formData)
//     .then((data) => {
//       console.log('Success:', data);
//       files_model.value = null;
//       $q.notify({
//         type: 'positive',
//         message: '上传成功',
//         progress: true,
//       });
//       getFileList();
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//       var err_msg_notify = '';
//       try {
//         if (error.response.status === 401)
//           this_router.push(
//             `/userLogin?type=2&err=${error.response.data.detail}`
//           );
//         else if (error.response.status === 400)
//           err_msg_notify = error.response.data.detail;
//         else err_msg_notify = '错误码' + error.response.status;
//       } catch {
//         err_msg_notify = '错误码' + error.code;
//       }
//       if (err_msg_notify !== '') {
//         $q.notify({
//           type: 'negative',
//           message: err_msg_notify,
//           progress: true,
//         });
//       }
//     });
// }
function renameFileFun(oldName, newName) {
  axios({
    method: 'post',
    url: '/admin/testCase/renameFile',
    data: {
      idString: this_route.query.id,
      filenameOld: oldName,
      filenameNew: newName,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '重命名成功',
        progress: true,
      });
      showRenameForm.value = false;
      getFileList();
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
function deleteFile(s) {
  axios({
    method: 'post',
    url: '/admin/testCase/deleteFile',
    data: {
      idString: this_route.query.id,
      filename: s,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '删除成功',
        progress: true,
      });
      getFileList();
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
function genConfig() {
  $q.notify({
    type: 'positive',
    message: '此操作需要较久时间，请稍后',
    progress: true,
  });
  axios({
    method: 'post',
    url: '/admin/testCase/genConfig',
    data: {
      idString: this_route.query.id,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '配置文件生成成功',
        progress: true,
      });
      getFileList();
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
function checkRejudgeStatus() {
  if (check_rejudge_timer !== null) clearInterval(check_rejudge_timer);
  if (
    this_route.path.toLowerCase() !== '/admin/editProblemTestData'.toLowerCase()
  )
    return;
  axios({
    method: 'post',
    url: '/admin/problem/rejudgeStatus',
    data: {
      problemId: this_route.query.id,
    },
  })
    .then((data) => {
      rejudge_text.value = data.data.msg;
      if (data.data.status == 1) {
        // finished
        rejudge_running.value = false;
        $q.notify({
          type: 'positive',
          message: '重判结束',
          progress: true,
        });
      } else {
        check_rejudge_timer = setInterval(checkRejudgeStatus, 5 * 1000);
      }
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
      err_msg.value = err_msg_notify;
    });
}
function reJudge() {
  rejudge_running.value = true;
  axios({
    method: 'post',
    url: '/admin/problem/rejudge',
    data: {
      problemId: this_route.query.id,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: data.data.msg,
        progress: true,
      });
      rejudge_text.value = data.data.msg;
      checkRejudgeStatus();
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      rejudge_running.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
function getFileList() {
  axios({
    method: 'post',
    url: '/admin/testCase/getFileList',
    data: {
      idString: this_route.query.id,
    },
  })
    .then((data) => {
      file_list.value = data.data;
      file_list.value.sort((a, b) => a.localeCompare(b, 'zh-CN'));
      show_loading.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
      err_msg.value = err_msg_notify;
    });
}
onMounted(() => {
  getFileList();
});
onUnmounted(() => {
  if (check_rejudge_timer !== null) clearInterval(check_rejudge_timer);
});
</script>

<style scoped></style>
