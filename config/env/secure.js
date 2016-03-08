'use strict';

module.exports = {
    db: 'mongodb://erbingwang:wangerbing@120.24.84.157:27017/jackfruit-server-dev',
    app: {
        title: 'jackfruit-server - Development Environment'
    },
    facebook: {
        clientID: 743461819083584,
        clientSecret: '0a790c42ae58202d31743b94dfebc59a',
        callbackURL: 'http://www.siyee.org:3000/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
        clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
        callbackURL: '/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || 'APP_ID',
        clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
        callbackURL: '/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
        callbackURL: '/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.GITHUB_ID || 'APP_ID',
        clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
        callbackURL: '/auth/github/callback'
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
        accessTokenExpireAfterDays: 7,
        refreshTokenExpireAfterDays: 30
    },
    qiniu: {
        accessKey: '5_WzphI0csKwzdgUjKEJYWYUjgCVI4sZaeT9E6PM',
        secretKey: 'cMkTZJnXcu9gRnBdK8MLKlRXRhl0_qh-CCnV1yTG',
        bucketName: 'sail-test-space',
        callbackUrl: 'http://dev.siyee.org:3000/uploaded-callback',
        userCallbackBody: 'key=$(key)&hash=$(etag)&id=$(x:id)&type=$(x:type)',
        returnBody: 'name=$(fname)&hash=$(etag)&guid=$(x:id)&location=$(x:location)',
        //expire time (days)
        expireSpan: 5
    },

    easemod: {
        signUpUrl: 'a1.easemob.com',
        org: 'siyee',
        appName: 'linger',
        //客服id，客服为本地注册的用户。且已在环信客服系统中注册为客服。
        customerServiceId: '5548331d9b9da13cd07b714d'
    },
    mongoose: {
        debugFlag: false
    }
};
