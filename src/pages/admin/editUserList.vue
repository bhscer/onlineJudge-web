<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div class="q-pa-md" v-show="!show_loading" style="width: fit-content">
      <q-markup-table>
        <thead>
          <th class="text-left" style="width: 5%">账号</th>
          <th class="text-left" style="width: 5%">昵称</th>
          <th class="text-left" style="width: 5%">邮箱</th>
          <th class="text-left" style="width: 5%">注册时间</th>
          <th class="text-left" style="width: 5%">权限组</th>
          <th class="text-left" style="width: 10%">操作</th>
        </thead>
        <tbody>
          <tr v-for="item in user_list" :key="item">
            <td>{{ item.username }}</td>
            <td>{{ item.nickname }}</td>
            <td>{{ item.email }}</td>
            <td>
              {{ $timeStampTostring(parseInt(item.id.substring(0, 8), 16)) }}
            </td>
            <td>{{ item.permission }}</td>
            <td>
              <q-btn
                outline
                color="primary"
                label="编辑"
                size="xs"
                padding="xs xs"
                @click="
                  showEditForm = true;
                  editInfo = item;
                "
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div class="q-pa-lg flex flex-center">
        <q-pagination
          v-model="current_page"
          :max="maxPage"
          :max-pages="6"
          direction-links
          @update:model-value="changePage"
        />
      </div>
    </div>

    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
    <q-dialog v-model="showEditForm" v-if="editInfo">
      <q-card class="q-pa-md">
        <div class="text-h4 q-mb-md">信息编辑</div>
        <!-- <p>{{ editInfo }}</p> -->
        <p class="q-pa-none q-ma-none">{{ `用户名: ${editInfo.username}` }}</p>
        <div v-if="user.info && user.info.permission === 'root'">
          <q-select
            outlined
            dense
            v-model="editInfo.permission"
            :options="['root', 'admin', 'user']"
            label="权限组"
          />
        </div>
        <q-input
          class="q-mt-sm"
          outlined
          dense
          v-model="editInfo.nickname"
          type="text"
          label="昵称"
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          dense
          v-model="editInfo.email"
          type="email"
          label="输入新的邮箱"
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          dense
          v-model="editInfo.pwd"
          label="如需修改密码请输入"
          type="text"
          @update:model-value="
            (newVal) => {
              if (newVal === '') {
                delete editInfo.pwd;
              }
            }
          "
        >
        </q-input>
        <q-btn
          class="q-my-md"
          color="primary"
          label="修改"
          @click="submitEdit"
        />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api as axios } from '@/boot/axios';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import LoadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

export default defineComponent({
  name: 'contestList',
  components: { LoadingPage },
  setup() {
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const user_list = ref([
      /*
      {
        contestId: 66,
        contestTitle: '浙江财经大学新生赛',
        contestTimeBegin: '2022-9-4 13:00',
        contestLength: '1h',
      },
      */
    ]);
    const user = useUserStore();
    const current_page = ref(1);
    const maxPage = ref(1);
    const show_loading = ref(true);
    const err_msg = ref('');
    const showPwdForm = ref(false);
    const pwdFormInfo = ref({});
    const pwd_text = ref('');
    const showEditForm = ref(false);
    const editInfo = ref({});
    const deleteing = ref(false);

    function IsEmail(str) {
      var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      return reg.test(str);
    }

    function submitEdit() {
      if (!IsEmail(editInfo.value.email)) {
        $q.notify({
          type: 'negative',
          message: '邮箱格式错误',
          progress: true,
        });
        return;
      }
      var post_data = JSON.parse(JSON.stringify(editInfo.value));
      if (post_data.pwd) {
        post_data.pwd = md5(post_data.pwd);
      }
      axios({
        method: 'post',
        url: '/admin/user/edit',
        data: post_data,
      })
        .then((data) => {
          $q.notify({
            type: 'positive',
            message: '修改成功',
            progress: true,
          });
          showEditForm.value = false;
          getUserList();
        })
        .catch((error) => {
          // submiting.value = false;
          // console.error('Error:', error);
          // alert(error.response.data.detail);
          var err_msg_notify = '';
          try {
            if (error.response.status === 401)
              this_router.push(
                `/userLogin?type=2&&err=${error.response.data.detail}`
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

    const changePage = (newPage) => {
      console.log('was ee to', newPage);
      this_router.push({
        path: '/admin/editUserList',
        // name: 'index',
        query: {
          page: newPage,
        },
      });
    };
    const getUserList = () => {
      show_loading.value = true;
      if (this_route.path.toLowerCase() !== '/admin/editUserList'.toLowerCase())
        return;
      let post_data = {};
      if (this_route.query.page === undefined) {
        post_data = { page: 1 };
        current_page.value = 1;
        console.log('curr ', current_page.value);
      } else {
        if (parseInt(this_route.query.page)) {
          post_data = { page: parseInt(this_route.query.page) };
          current_page.value = parseInt(this_route.query.page);
        } else {
          err_msg.value = '页码错误';
        }
      }
      console.log(post_data);
      axios({
        method: 'post',
        url: '/admin/user/getList',
        data: post_data,
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            maxPage.value = data.data.maxPage;
            user_list.value = data.data.data;

            show_loading.value = false;
          } else {
            // alert(data.msg)
            // showFailToast(data.data.msg)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          try {
            if (error.response.status === 401)
              this_router.push(
                `/userLogin?type=2&&err=${error.response.data.detail}`
              );
            else if (error.response.status === 400)
              err_msg.value = error.response.data.detail;
            else err_msg.value = error.response.status;
          } catch {
            err_msg.value = error.code;
          }
        });
    };
    return {
      changePage,
      getUserList,
      show_loading,
      maxPage,
      current_page,
      user_list,
      editInfo,
      showEditForm,
      deleteing,
      err_msg,
      submitEdit,
      IsEmail,
      user,
    };
  },
  watch: {
    $route(to, from) {
      this.getUserList();
    },
  },
  mounted() {
    this.getUserList();
  },
});
</script>
