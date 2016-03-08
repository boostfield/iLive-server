'use strict';

module.exports = {
    app: {
        title: '爱直播后台管理系统',
        description: '玩鲜商户操作系统',
        keywords: '玩鲜, 商户, 后台, 管理系统'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'iliving',
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
    mongoose: {
        debugFlag: false
    },
    clientUA: 'iLiving',
    iosClientDownloadUrl: 'https://itunes.apple.com/us/app/wan-xian-tan-suo-wei-zhi-hao/id1018136277?l=zh&ls=1&mt=8',
    androidClientDownloadUrl: 'http://www.playfresh.cn/product/playfresh.apk'
};
