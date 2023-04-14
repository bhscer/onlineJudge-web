<template>
    <q-page class="flex flex-center">
        <div class="q-pa-md" v-show="!show_loading" style="width: 1000px">
            <div style="display: flex" v-if=false>
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
                            <div style="display: flex;flex-wrap: wrap;">
                                <div class="q-my-lg q-ml-lg q-mr-md">
                                    <q-icon color="primary" name="article" size="lg"></q-icon>
                                </div>

                                <div class="q-my-md"  style="display: flex;flex-direction: column;flex-wrap: wrap">
                                    <a class="" style="margin: 0;cursor:pointer;text-decoration: none;color: inherit;font-size: 20px;width: max-content"
                                        @click="this.$router.push(`/contest?cid=${item.contestId}`)"
                                        :href="`/#/contest?cid=${item.contestId}`">
                                        {{item.contestTitle}}
                                    </a>
                                    <div style="display: flex;flex-wrap: wrap">
                                        <q-chip outline size="sm" color="primary" text-color="white" icon="event">
                                            {{item.contestTimeBegin}}
                                        </q-chip>
                                        <q-chip outline size="sm" color="primary" text-color="white" icon="schedule">
                                            {{item.contestLength}}
                                        </q-chip>
                                        <q-chip outline size="sm" color="primary" text-color="white" icon="lock">
                                            private
                                        </q-chip>
                                    </div>
                                </div>
                                <div class="q-my-auto q-mr-sm" style="margin-left: auto">
                                    <q-chip outline size="sm" color="primary" text-color="white" icon="info">
                                        ended
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
                    :max=maxPage
                    :max-pages="6"
                    direction-links
                    @update:model-value="changePage"
                />
            </div>

        </div>


        <q-inner-loading :showing="show_loading">
            <q-spinner-gears size="50px" color="primary" />
            <p>loading...</p>
        </q-inner-loading>
    </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { apiUrl } from "src/self_configs";

export default defineComponent({
    name: "contestList",
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();
        const contest_list = ref([{ "contestId": 66,"contestTitle": "浙江财经大学新生赛","contestTimeBegin": '2022-9-4 13:00', "contestLength": '1h'},
            { "contestId": 66,"contestTitle": "浙江财经大学新生赛","contestTimeBegin": '2022-9-4 13:00', "contestLength": '1h'}]);
        const current_page = ref(1);
        const maxPage = ref(1);
        const show_loading = ref(true);
        const changePage = (newPage) => {
            this_router.push({
                path: "/contestList",
                // name: 'index',
                query: {
                    page: newPage
                }
            });
        };
        const getProblemList = () => {
            show_loading.value = false;
            // return;
            show_loading.value = true;
            if (this_route.path.toLowerCase() !== "/contestList".toLowerCase()) return;
            let post_data = {};
            if (this_route.query.page === undefined) {
                post_data = { "page": 1 };
                current_page.value = 1;
            } else {
                try {
                    post_data = { "page": parseInt(this_route.query.page) };
                    current_page.value = parseInt(this_route.query.page);
                } catch (e) {
                    alert("页码错误");
                }
            }
            console.log(post_data);
            axios({
                method: "post",
                url: apiUrl + "/contest/getList",
                data: post_data
            }).then(data => {
                console.log("Success:", data);
                if (data.data.status === 1) // 列表获取成功
                {
                    console.log(data);
                    maxPage.value = data.data.maxPage;
                    contest_list.value = data.data.data;
                    show_loading.value = false;
                } else {
                    // alert(data.msg)
                    // showFailToast(data.data.msg)
                }
            })
                .catch((error) => {
                    console.error("Error:", error);
                    if (error.request.status === 401) {
                        // localStorage.removeItem('Authorization');
                        // showFailToast("登录状态失效，请重新登录")
                        // router.push('/login');
                    } else {
                        // showFailToast('获取签到情况失败');
                    }
                });
        };
        return {
            changePage,
            getProblemList,
            show_loading,
            maxPage,
            current_page,
            contest_list
        };
    },
    watch: {
        "$route"(to, from) {
            this.getProblemList();
        }
    },
    mounted() {
        this.getProblemList();
    }
});
</script>
