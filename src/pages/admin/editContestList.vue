<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div class="q-pa-md" v-show="!show_loading" style="width: 800px">
      <div style="display: flex">
        <q-btn
          outline
          color="primary"
          label="新增"
          size="lg"
          style="width: 100%"
          padding="xs xs"
          @click="this.$router.push(`/admin/editContest?add=1`)"
        />
      </div>

      <q-markup-table>
        <thead>
          <th class="text-left" style="width: 5%">比赛编号</th>
          <th class="text-left" style="width: 5%">比赛名称</th>
          <th class="text-left" style="width: 5%">开始时间</th>
          <th class="text-left" style="width: 5%">结束时间</th>
          <th class="text-left" style="width: 5%">密码</th>
          <th class="text-left" style="width: 5%">操作</th>
        </thead>
        <tbody>
          <tr v-for="item in contest_list" :key="item">
            <td>{{ item.contestId }}</td>
            <td>
              <a
                class=""
                style="
                  margin: 0;
                  cursor: pointer;
                  text-decoration: none;
                  color: inherit;
                  width: max-content;
                "
                @click="this.$router.push(`/contest?cid=${item.contestId}`)"
                :href="`/#/contest?cid=${item.contestId}`"
              >
                {{ item.contestTitle }}
              </a>
            </td>
            <td>{{ timeStampTostring(item.contestTimeBeginStamp) }}</td>
            <td>
              {{
                timeStampTostring(
                  item.contestTimeBeginStamp + item.contestLength
                )
              }}
            </td>
            <td>
              {{ item.permission.pwdString }}
            </td>
            <td>
              <a
                class=""
                style="
                  margin: 0;
                  cursor: pointer;
                  text-decoration: none;
                  color: inherit;
                  width: max-content;
                "
                @click="
                  this.$router.push(`/admin/add=0&&editContest?id=${item.id}`)
                "
                :href="`/#/admin/editContest?add=0&&id=${item.id}`"
              >
                编辑
              </a>
              <q-btn
                outline
                color="red"
                label="删除"
                size="xs"
                padding="xs xs"
                class="q-ml-md"
                @click="
                  showDeleteForm = true;
                  deleteInfo = item;
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
  </q-page>
  <q-dialog v-model="showDeleteForm" v-if="deleteInfo">
    <q-card class="q-pa-md">
      <div class="text-h4">你确定要删除？</div>
      <div style="display: flex">
        <div
          class="q-my-md"
          style="display: flex; flex-direction: column; flex-wrap: wrap"
        >
          <a
            class=""
            style="
              margin: 0;
              cursor: pointer;
              text-decoration: none;
              color: inherit;
              font-size: 20px;
              width: max-content;
            "
            @click="this.$router.push(`/contest?cid=${deleteInfo.contestId}`)"
            :href="`/#/contest?cid=${deleteInfo.contestId}`"
          >
            {{ deleteInfo.contestTitle }}
          </a>

          <div style="display: flex; flex-wrap: wrap">
            <q-chip
              outline
              size="sm"
              color="primary"
              text-color="white"
              icon="event"
            >
              {{ timeStampTostring(deleteInfo.contestTimeBeginStamp) }}
            </q-chip>
            <q-chip
              outline
              size="sm"
              color="primary"
              text-color="white"
              icon="schedule"
            >
              {{ timeSecondToString(deleteInfo.contestLength) }}
            </q-chip>
          </div>
        </div>
      </div>
      <q-btn
        outline
        :loading="deleteing"
        color="red"
        label="删除"
        padding="xs xs"
        style="width: 100%"
        @click="deleteContest(deleteInfo.id)"
      >
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          删除中
        </template>
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api as axios } from '@/boot/axios';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import LoadingPage from '@/components/loadingPage.vue';

export default defineComponent({
  name: 'contestList',
  components: { LoadingPage },
  setup() {
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const contest_list = ref([
      /*
      {
        contestId: 66,
        contestTitle: '浙江财经大学新生赛',
        contestTimeBegin: '2022-9-4 13:00',
        contestLength: '1h',
      },
      */
    ]);
    const current_page = ref(1);
    const maxPage = ref(1);
    const show_loading = ref(true);
    const err_msg = ref('');
    const showPwdForm = ref(false);
    const pwdFormInfo = ref({});
    const pwd_text = ref('');
    const showDeleteForm = ref(false);
    const deleteInfo = ref({});
    const deleteing = ref(false);

    const pwdVerifiy = () => {
      axios({
        method: 'post',
        url: '/contest/pwdVerifiy',
        data: {
          contestId: pwdFormInfo.value.contestId,
          pwd: md5(pwd_text.value),
        },
      })
        .then((data) => {
          console.log('Success:', data);
          this_router.push(
            `/contest?cid=${pwdFormInfo.value.contestId}&&pwd=${md5(
              pwd_text.value
            )}`
          );
        })
        .catch((error) => {
          console.error('Error:', error);
          if (error.response.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.response.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            $q.notify({
              type: 'negative',
              message: '未知错误',
              progress: true,
            });
          }
        });
    };
    const timeSecondToString = (tim) => {
      var s = '';
      if (tim / (60 * 60 * 24)) s += `${parseInt(tim / (60 * 60 * 24))}天`;
      tim %= 60 * 60 * 24;
      if (tim / (60 * 60)) s += `${parseInt(tim / (60 * 60))}小时`;
      tim %= 60 * 60;
      if (tim % 60) s += `${parseInt(tim / 60)}分钟`;
      tim %= 60;
      if (tim) s += `${parseInt(tim)}秒`;
      return s;
    };
    const timeStampTostring = (tim) => {
      var timestamp = tim ? tim : null;
      let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      let Y = date.getFullYear();
      let M =
        date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1;
      let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
      let m =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      let s =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      // return Y + M + D + h + m + s;
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const changePage = (newPage) => {
      this_router.push({
        path: '/contestList',
        // name: 'index',
        query: {
          page: newPage,
        },
      });
    };
    const getContestList = () => {
      show_loading.value = true;
      if (
        this_route.path.toLowerCase() !== '/admin/editContestList'.toLowerCase()
      )
        return;
      let post_data = {};
      if (this_route.query.page === undefined) {
        post_data = { page: 1 };
        current_page.value = 1;
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
        url: '/admin/contest/getList',
        data: post_data,
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            maxPage.value = data.data.maxPage;
            contest_list.value = data.data.data;
            for (var i = 0; i < contest_list.value.length; i++) {
              var tstatus = 0;
              if (
                contest_list.value[i]['contestTimeBeginStamp'] >=
                Date.now() / 1000
              ) {
                tstatus = 0; // 未开始
              } else {
                if (
                  contest_list.value[i]['contestTimeBeginStamp'] +
                    contest_list.value[i]['contestLength'] >=
                  Date.now() / 1000
                ) {
                  tstatus = 1; // 比赛中
                } else {
                  tstatus = 2;
                }
              }
              contest_list.value[i]['timeStatus'] = tstatus;
            }
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
              this_router.push('/userLogin?type=2');
            else if (error.response.status === 400)
              err_msg.value = error.response.data.detail;
            else err_msg.value = error.response.status;
          } catch {
            err_msg.value = error.code;
          }
        });
    };
    const deleteContest = (id) => {
      deleteing.value = true;
      axios({
        method: 'post',
        url: '/admin/contest/delete',
        data: {
          id: id,
        },
      })
        .then((data) => {
          getContestList();
          deleteing.value = false;
          $q.notify({
            type: 'positive',
            message: '删除成功',
            progress: true,
          });
          showDeleteForm.value = false;
        })
        .catch((error) => {
          // submiting.value = false;
          console.error('Error:', error);
          alert(error.response.data.detail);
          if (error.response.status === 401) {
            this_router.push('/userLogin?type=2');
          } else if (error.response.status === 400) {
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            var err_code_info = '';
            try {
              err_code_info = error.response.status;
            } catch {
              err_code_info = error.code;
            }
            $q.notify({
              type: 'negative',
              message: `网络错误,code=${err_code_info}`,
              progress: true,
            });
          }
        });
    };
    return {
      showPwdForm,
      pwdFormInfo,
      changePage,
      getContestList,
      show_loading,
      maxPage,
      current_page,
      contest_list,
      pwd_text,
      pwdVerifiy,
      timeSecondToString,
      timeStampTostring,
      deleteInfo,
      showDeleteForm,
      deleteContest,
      deleteing,
      err_msg,
    };
  },
  watch: {
    $route(to, from) {
      this.getContestList();
    },
  },
  mounted() {
    this.getContestList();
  },
});
</script>
