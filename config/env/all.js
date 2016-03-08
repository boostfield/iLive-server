'use strict';

module.exports = {
    app: {
        title: '玩鲜商户中心',
        description: '玩鲜商户操作系统',
        keywords: '玩鲜, 商户, 后台, 管理系统'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',

            ],
            js: [
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/jquery/dist/jquery.js',
                'public/lib/plupload/js/plupload.full.min.js',
                'public/lib/qiniu/qiniu.js',
                'public/lib/qiniu/ui.js',
                'public/lib/bootstrap/dist/js/bootstrap.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css',
            'public/css/playfresh.css',
            'public/modules/cities/css/main.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/modules/*/tests/*.js'
        ]
    },
    //Date设置规则：0=1月；10=11月
    activityStartDate: new Date(2015, 10, 6, 15, 0, 0),
    activityEndDate: new Date(2015, 10, 20, 16, 0, 0),
    jpush: {
        appkey: 'a16469b5c59ebbef16e13759',
        secret: '950ff0f81e8313fbec03ce7e'
    },
    BaiDu: {
        AK: 'A5uGTpd4VFQGsngS9d8kuwdG'
    },
    JuHe: {
        AK: '942869d6b2a9fa95d5d9b07489526f91'
    },
    DianPing: {
        appkey: '43127666',
        secret: '74a6d46146ef438e8d7a81284e251fb6'
    },
    smsService: {
        appkeyAndroid: 'b5596b85e7a4',
        appkey: '50b08cd24c6b',
        newAppkey: 'da8a50c57c9e',
        newAppkeyAndroid: 'da9e07a7ca68',
        host: 'https://web.sms.mob.com/sms/verify',
        newHost: 'https://webapi.sms.mob.com/sms/verify'
    },
    editorSelectedCount: 4,
    shareStyle: {
        bgColor: {
            man: '#8aecdd',
            lori: '#ffd5cb',
            lady: '#f2eb75'
        }
    },
    iosClientDownloadUrl: 'https://itunes.apple.com/us/app/wan-xian-tan-suo-wei-zhi-hao/id1018136277?l=zh&ls=1&mt=8',
    androidClientDownloadUrl: 'http://www.playfresh.cn/product/playfresh.apk'
};
