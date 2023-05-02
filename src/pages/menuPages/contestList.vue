<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" v-show="!show_loading" style="width: 1000px">
      <div style="display: flex" v-if="false">
        <p class="q-my-auto">搜索</p>
        <q-input rounded outlined v-model="text" class="q-my-auto">
          <template v-slot:prepend>
            <q-icon name="search"></q-icon>
          </template>
        </q-input>
      </div>

      <q-markup-table>
        <tbody>
          <tr v-for="item in contest_list" :key="item">
            <td>
              <div style="display: flex; flex-wrap: wrap">
                <div class="q-my-lg q-ml-lg q-mr-md">
                  <q-icon color="primary" name="article" size="lg"></q-icon>
                </div>

                <div
                  class="q-my-md"
                  style="display: flex; flex-direction: column; flex-wrap: wrap"
                >
                  <a
                    v-if="item.permission && !item.permission.needPwd"
                    class=""
                    style="
                      margin: 0;
                      cursor: pointer;
                      text-decoration: none;
                      color: inherit;
                      font-size: 20px;
                      width: max-content;
                    "
                    @click="this.$router.push(`/contest?cid=${item.contestId}`)"
                    :href="`/contest?cid=${item.contestId}`"
                  >
                    {{ item.contestTitle }}
                  </a>
                  <a
                    v-if="item.permission && item.permission.needPwd"
                    class=""
                    style="
                      margin: 0;
                      cursor: pointer;
                      text-decoration: none;
                      color: inherit;
                      font-size: 20px;
                      width: max-content;
                    "
                    @click="
                      showPwdForm = true;
                      pwdFormInfo = item;
                    "
                  >
                    {{ item.contestTitle }}
                  </a>

                  <div style="display: flex; flex-wrap: wrap">
                    <q-chip
                      outline
                      size="sm"
                      color="primary"
                      text-color="white"
                      icon="event"
                    >
                      {{ timeStampTostring(item.contestTimeBeginStamp) }}
                    </q-chip>
                    <q-chip
                      outline
                      size="sm"
                      color="primary"
                      text-color="white"
                      icon="schedule"
                    >
                      {{ timeSecondToString(item.contestLength) }}
                    </q-chip>
                    <q-chip
                      v-if="item.permission && item.permission.needPwd"
                      outline
                      size="sm"
                      color="primary"
                      text-color="white"
                      icon="lock"
                    >
                      Private
                    </q-chip>
                  </div>
                </div>
                <div class="q-my-auto q-mr-sm" style="margin-left: auto">
                  <q-chip
                    outline
                    size="sm"
                    color="primary"
                    text-color="white"
                    icon="info"
                  >
                    {{ ['Not start', 'Competing', 'Ended'][item.timeStatus] }}
                  </q-chip>
                </div>
              </div>
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

  <q-dialog v-model="showPwdForm" v-if="pwdFormInfo">
    <q-card>
      <div style="display: flex">
        <div class="q-my-lg q-ml-lg q-mr-md">
          <q-icon color="primary" name="article" size="lg"></q-icon>
        </div>
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
          >
            {{ pwdFormInfo.contestTitle }}
          </a>

          <div style="display: flex; flex-wrap: wrap">
            <q-chip
              outline
              size="sm"
              color="primary"
              text-color="white"
              icon="event"
            >
              {{ timeStampTostring(pwdFormInfo.contestTimeBeginStamp) }}
            </q-chip>
            <q-chip
              outline
              size="sm"
              color="primary"
              text-color="white"
              icon="schedule"
            >
              {{ timeSecondToString(pwdFormInfo.contestLength) }}
            </q-chip>
          </div>
        </div>
      </div>

      <q-input
        class="q-ma-md"
        rounded
        outlined
        v-model="pwd_text"
        style="width: 300px"
        label="输入密码"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="pwd_text = ''" class="cursor-pointer" />
        </template>
        <template v-slot:after>
          <q-btn round dense flat icon="send" @click="pwdVerifiy()" />
        </template>
      </q-input>
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
  setup() {
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const contest_list = ref([]);
    const current_page = ref(1);
    const maxPage = ref(1);
    const show_loading = ref(true);
    const showPwdForm = ref(false);
    const pwdFormInfo = ref({});
    const pwd_text = ref('');
    const err_msg = ref('');

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
          var err_msg_notify = '';
          try {
            if (error.response.status === 401)
              this_router.push('/userLogin?type=2');
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
      show_loading.value = false;
      // return;
      show_loading.value = true;
      if (this_route.path.toLowerCase() !== '/contestList'.toLowerCase())
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
          show_loading.value = true;
          err_msg.value = '页码错误';
        }
      }
      console.log(post_data);
      axios({
        method: 'post',
        url: '/contest/getList',
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
  components: { LoadingPage },
});
</script>
