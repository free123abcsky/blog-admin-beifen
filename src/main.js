import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from '@/libs/util';
import axios from '@/libs/axios';
import vueMoment from 'vue-moment';
import moment from 'moment';
import store from '@/vuex/store';
import vStorage from '@/libs/vStorage'

Vue.use(VueI18n);
Vue.use(iView);

/**
 * 设置本地存储
 * */
Vue.use(vStorage, {
    storageKeyPrefix: 'izl-'
});
/**
 * 时间格式化插件-过滤器
 * */
moment.locale('zh-cn')
Vue.use(vueMoment);

/**
 * axios 配置
 * */
Vue.use(axios);
Vue.http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});
