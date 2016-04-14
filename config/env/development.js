'use strict';

module.exports = {
    db: 'mongodb://120.25.204.174:27017/ilive-dev',
    port: 3000,
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
    qiniu: {
        accessKey: 'u-pNjWIoBvrING05X0eM6cTL1speJsz18FOJbAav',
        secretKey: 'a-BmE3tf6L4yptxhhR3R9buXTny0UX3XUIYse3vD',
        callbackUrl: 'http://dev.goobeam.com:3000/uploaded-callback',
        userCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)',
        returnBody: 'name=$(fname)&hash=$(etag)&guid=$(x:id)&location=$(x:location)',
        publicBucketUrl: 'http://7xrq05.com1.z0.glb.clouddn.com',
        //expire time (days)
        expireSpan: 5,
        publicBucketName: 'iliving-dev',

        bannerCallbackUrl: 'http://dev.goobeam.com:3000/add-banner-image',
        bannerCallbackBody: 'key=$(key)&hash=$(etag)&userId=$(x:userId)&bannerId=$(x:bannerId)',

        giftCallbackUrl: 'http://dev.goobeam.com:3000/add-gift-image',
        giftCallbackBody: 'key=$(key)&hash=$(etag)&&giftId=$(x:giftId)'
    },
    tencentSig: {
        expire: 8640000,
        sdkAppId: '1400007197',
        accountType: '3494'
    },
    mongoose: {
        debugFlag: false
    },
    emailAddress: {
        host: 'smtp.ym.163.com',
        bugSender: {
            account: 'bug-reporter@siyee.org',
            pass: 'siyeeorg'
        },
        adminEmail: '609734312@qq.com'
    }
};
