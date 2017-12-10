import Vue from 'vue';
import iView from 'iview';
import Util from '@/libs/util';
import store from '@/vuex/store'
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers, otherRouter, appRouter} from './router';

Vue.use(VueRouter);

/**
 * Token验证，只是对时间验证过期否
 * */
const _checkAuth = () => {
    return new Promise(function (resolve, reject) {
        let authorization = Vue.$localStorage.authorization;
        let time = parseInt(authorization.time);
        if ((new Date().getTime() - time) < 1000 * 60 * 60 * 2) {
            //token有效,能进入
            store.dispatch('setLoginState',true);
            // 设置请求的token
            Vue.http.defaults.headers.common['authorization'] = "Bearer " + authorization.token;
            resolve();
        } else {
            Vue.$localStorage.$delete('authorization');
            Vue.$localStorage.$delete('commentInfo');
            store.dispatch('setLoginState',false);
            reject();
        }
    })
}

const _permissionAuth = (to, from, next) => {
    const curRouterObj = Util.getRouterObjByName([otherRouter, ...appRouter], to.name);
    if (curRouterObj && curRouterObj.access !== undefined) { // 需要判断权限的路由
        if (curRouterObj.access === parseInt(Cookies.get('access'))) {
            Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next); // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
        } else {
            next({
                replace: true,
                name: 'error-403'
            });
        }
    } else { // 没有配置权限的路由, 直接通过
        Util.toDefaultPage([...routers], to.name, router, next);
    }
}

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
        next(false);
    }

    if(to.name !== 'login'){
    // 未登录状态
        if (!store.state.isLogin) {
            //存在authorization信息，则验证下。
            if (!!Vue.$localStorage.authorization) {
                _checkAuth().then(function () {
                    next()
                },function () {
                    next({
                        name: 'login',
                    })
                });
            } else {
                next({
                    name: 'login',
                })
            }
        } else {
            _checkAuth().then(function () {
                next()
            },function () {
                next({
                    name: 'login',
                })
            });
        }
    }else{
        _permissionAuth(to, from, next)
    }


});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
