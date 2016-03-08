'use strict';

module.exports = {
    db: 'mongodb://localhost:27017/ilive-dev',

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
        jwtSecret: 'iliving',
        accessTokenExpireAfterDays: 5,
        refreshTokenExpireAfterDays: 30
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
