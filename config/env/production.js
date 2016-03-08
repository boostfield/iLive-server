'use strict';

module.exports = {
    db: 'mongodb://jackfruitUser:siyeeojackfruit@10.169.216.93:5227/jackfruit,10.169.226.136:5227,10.170.14.118:5227',
    port:80,
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-touch/angular-touch.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',

                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/plupload/js/plupload.full.min.js',
                'public/lib/qiniu/qiniu.min.js',
                'public/lib/qiniu/ui.js',
                'public/lib/bootstrap/dist/js/bootstrap.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    qq: {
        clientID: 101188618,
        clientSecret: '4fdd0a816262da5905b676c8156454f3',
        callbackURL: 'http://www.siyee.org:3000/auth/qq/callback'
    },
    weibo: {
        clientID: 3727686665,
        clientSecret: '65813cf612943d1db138333a2094e4ae',
        callbackURL: 'http://www.siyee.org:3000/auth/weibo/callback'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    },
    token: {
        jwtSecret: 'siyeeisgrowing',
        accessTokenExpireAfterDays: 168,
        refreshTokenExpireAfterDays: 30
    },
    qiniu: {
        accessKey: '5_WzphI0csKwzdgUjKEJYWYUjgCVI4sZaeT9E6PM',
        secretKey: 'cMkTZJnXcu9gRnBdK8MLKlRXRhl0_qh-CCnV1yTG',
        testBucketName: 'sail-test-space',
        callbackUrl: 'https://api.duriantrip.cn/uploaded-callback',
        userCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&type=$(x:type)',
        returnBody: 'name=$(fname)&hash=$(etag)&guid=$(x:id)&location=$(x:location)',
        publicBucketUrl: 'http://7xijtn.com1.z0.glb.clouddn.com/',
        //expire time (days)
        expireSpan: 5,

        publicBucketName: 'public-scenic-data',
        cityImageCallbackUrl: 'https://api.duriantrip.cn/addCityImage',
        citiesCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)',

        scenicSpotCallbackUrl: 'https://api.duriantrip.cn/addScenicSpotImage',
        scenicSpotCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&userId=$(x:userId)&type=$(x:type)',

        scenicSpotByMobileCallbackUrl: 'https://api.duriantrip.cn/addScenicSpotImageByMobile',
        scenicSpotByMobileCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&userId=$(x:userId)&type=$(x:type)&pictureMessage=$(x:pictureMessage)',
        //picture
        pictureCallbackUrl: 'https://api.duriantrip.cn/addPicture',
        pictureCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&scenicSpotId=$(x:scenicSpotId)&pictureMessage=$(x:pictureMessage)',

        bannerCallbackUrl: 'https://api.duriantrip.cn/add-banner-image',
        bannerCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&bannerId=$(x:bannerId)',

        taskListCallbackUrl: 'https://api.duriantrip.cn/set-task-list-url',
        taskListCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&taskListId=$(x:taskListId)',

        taskCallbackUrl: 'https://api.duriantrip.cn/addTaskPicture',
        taskCallbackBody: 'key=$(key)&hash=$(etag)&taskId=$(x:taskId)'
    },

    easemod: {
        signUpUrl: 'a1.easemob.com',
        org: 'siyee',
        appName: 'linger',
        //客服id，客服为本地注册的用户。且已在环信客服系统中注册为客服。
        customerServiceId: '559242a8227b4fd97ebfcdfe',
        feedbackServiceId: '55923f82227b4fd97ebfcdfc'
    },
    liulianAdmin: '5548331d9b9da13cd07b714d',
    mongoose: {
        debugFlag: false
    },

    activityAndroidOff: true,
    activityiOSOff: true,
    //Date设置规则：0=1月；10=11月
    activityStartDate: new Date(2015, 10, 31, 20, 0, 0),
    activityEndDate: new Date(2015, 10, 31, 20, 30, 0),

    emailAddress: {
        host: 'smtp.ym.163.com',
        bugSender: {
            account: 'bug-reporter@siyee.org',
            pass: 'siyeeorg'
        },
        adminEmail: '609734312@qq.com,erbing22@126.com'
    },
    currentClientVersion: '2.0.1'
};
