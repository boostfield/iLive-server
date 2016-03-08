'use strict';

module.exports = {
    db: 'mongodb://localhost/jackfruit-server-test',
    port: 3000,
    app: {
        title: 'jackfruit-server - Test Environment'
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
        accessTokenExpireAfterDays: 5,
        refreshTokenExpireAfterDays: 30
    },
    qiniu: {
        accessKey: '5_WzphI0csKwzdgUjKEJYWYUjgCVI4sZaeT9E6PM',
        secretKey: 'cMkTZJnXcu9gRnBdK8MLKlRXRhl0_qh-CCnV1yTG',
        testBucketName: 'sail-test-space',
        callbackUrl: 'http://dev.siyee.org:3000/uploaded-callback',
        userCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&type=$(x:type)',
        returnBody: 'name=$(fname)&hash=$(etag)&guid=$(x:id)&location=$(x:location)',
        publicBucketUrl: 'http://7xijtn.com1.z0.glb.clouddn.com/',
        //expire time (days)
        expireSpan: 5,

        publicBucketName: 'public-scenic-data',
        cityImageCallbackUrl: 'http://dev.siyee.org:3000/addCityImage',
        citiesCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)',

        scenicSpotCallbackUrl: 'http://dev.siyee.org:3000/addScenicSpotImage',
        scenicSpotCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&userId=$(x:userId)&type=$(x:type)',

        scenicSpotByMobileCallbackUrl: 'http://dev.siyee.org:3000/addScenicSpotImageByMobile',
        scenicSpotByMobileCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&userId=$(x:userId)&type=$(x:type)',
        //picture
        pictureCallbackUrl: 'http://dev.siyee.org:3000/addPicture',
        pictureCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&scenicSpotId=$(x:scenicSpotId)&pictureMessage=$(x:pictureMessage)',

        bannerCallbackUrl: 'http://dev.siyee.org:3000/add-banner-image',
        bannerCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&bannerId=$(x:bannerId)'
    },

    easemod: {
        signUpUrl: 'a1.easemob.com',
        org: 'siyee',
        appName: 'linger',
        //客服id，客服为本地注册的用户。且已在环信客服系统中注册为客服。
        customerServiceId: '559242a8227b4fd97ebfcdfe',
        feedbackServiceId: '55923f82227b4fd97ebfcdfc'
    },
    mongoose: {
        debugFlag: false
    },
    emailAddress: {
        host: 'smtp.ym.163.com',
        bugSender:{
            account:'bug-reporter@siyee.org',
            pass: 'siyeeorg'
        },
        adminEmail: '609734312@qq.com,erbing22@126.com'
    },
    activityAndroidOff: false,
    activityiOSOff: true,
    activityStartDate: new Date(2015, 10, 21, 21, 29, 0),
    activityEndDate: new Date(2015, 11, 18, 21, 0, 0),
    currentClientVersion: '1.0.0'
};
