<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.email" placeholder="请输入用户名">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                    <p class="login-tip">输入任意用户名和密码即可</p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>

import Vue from 'vue';
import Cookies from 'js-cookie';
import {Login} from "../api/api_auth";
import API from "../config";
import {mapState, mapActions} from 'vuex';
export default {
    data () {
        return {
            form: {
                email: '990080536@qq.com',
                password: '123456abc'
            },
            rules: {
                email: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        ...mapActions({
            setLoginState: 'setLoginState',
            setCommentInfoStatus: 'setCommentInfoStatus',
        }),
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {

                    Login(this.form).then((response) => {

                        //权限信息
                        this.$localStorage.$set('authorization', {
                            token: response.token,
                            time: new Date().getTime()
                        });
                        //我进行评论的信息
                        this.$localStorage.$set('commentInfo', {
                            "name": API.MY,
                            "email": API.EMAIL
                        });
                        this.setCommentInfoStatus(true);
                        // 设置请求的token
                        Vue.http.defaults.headers.common['authorization'] = "Bearer " + response.token;
                        this.setLoginState(true);//设置全局登录状态
                        this.$router.replace({//跳转
                            name: 'home_index'
                        });
                    }, (err)=> {
                        this.$Message.warning(err.msg)
                    })
                }
            });
        }
    }
};
</script>

<style>

</style>
