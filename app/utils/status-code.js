//success response.
exports.SUCCESS = {
    statusCode: 0,
    message: '成功！'
};
//Create user error.
exports.USERNAME_INVALID = {
    statusCode: 10000,
    message: '用户名的格式是无效的。只支持数字和字母,长度必须在6 - 32。'
};

exports.USERNAME_TAKEN = {
    statusCode: 10001,
    message: '用户名已被注册。请选择另一个。'
};

exports.USERNAME_EMPTY = {
    statusCode: 10002,
    message: '用户名不能为空。'
};

exports.PASSWORD_EMPTY = {
    statusCode: 10003,
    message: '密码不能为空。'
};

exports.PASSWORD_INVALID = {
    statusCode: 10004,
    message: '密码长度应该为8--32位。'
};
exports.INVALID_PHONE_NUMBER = {
    statusCode: 10005,
    message: '电话号码格式不对。'
};

exports.PHONE_NUMBER_TAKEN = {
    statusCode: 10006,
    message: '号码已经被注册。'
};

exports.INVALID_EMAIL = {
    statusCode: 10007,
    message: '邮箱格式不正确。'
};

exports.EMAIL_TAKEN = {
    statusCode: 10008,
    message: '邮箱已经被绑定。'
};

exports.CURRENT_LOCATION_NOT_SET = {
    statusCode: 10011,
    message: '当前位置未被设置。'
};

exports.UPDATE_INFO_FAILED = {
    statusCode: 10012,
    message: '更新个人信息失败。'
};

//Auth token error.
exports.INVALID_TOKEN = {
    statusCode: 10100,
    message: '用户无效，请重新登陆。'
};

exports.TOKEN_EXPIRED = {
    statusCode: 10101,
    message: '用户登陆信息过期。'
};

exports.TOKEN_REQUIRED = {
    statusCode: 10102,
    message: '登录后才能执行该操作。'
};

exports.NOT_AUTHORIZED = {
    statusCode: 10103,
    message: '权限不足，无法执行操作。'
};

//Login error.
exports.USER_NOT_EXIST = {
    statusCode: 10200,
    message: '用户不存在。'
};

exports.USERNAME_NOT_EXIST = {
    statusCode: 10201,
    message: '用户名不存在。'
};

exports.PASSWORD_INCORRECT = {
    statusCode: 10202,
    message: '用户名或者密码错误。'
};
exports.LOGIN_REQUIRED = {
    statusCode: 10203,
    message: '请在登录后进行该操作。'
};

//Change password error.
exports.SMS_AUTH_ERR = {
    statusCode: 10300,
    message: '短信验证码错误。'
};

exports.PASSWORD_NOT_MATCH = {
    statusCode: 10301,
    message: '密码不匹配。'
};

exports.UPLOAD_AVATAR_FAILED = {
    statusCode: 11000,
    message: '上传头像失败'
};
exports.UPLOAD_IMAGE_FAILED = {
    statusCode: 11001,
    message: '上传图片失败。'
};

//friend related error
exports.ALREADY_FOLLOWED = {
    statusCode: 12000,
    message: '您已经关注了他，无需再次关注。'
};

//friend related error
exports.NOT_FOLLOWED_YET = {
    statusCode: 12001,
    message: '您还未关注该用户，无法取消关注。'
};

exports.VERIFY_CODE_ERR = {
    statusCode: 54000,
    message: '验证码错误。'
};

exports.HUANXIN_ERROR = {
    statusCode: 83000,
    message: '环信出错了。'
};

//Server Error
exports.DATABASE_ERROR = {
    statusCode: 90000,
    message: '保存数据出错。'
};
exports.INTER_SERVER_ERROR = {
    statusCode: 93000,
    message: '网络连接错误。'
};

//argument err.
exports.PARSING_ERR = {
    statusCode: 91000,
    message: '解析数据时出错。'
};

exports.ARGUMENT_REQUIRED = {
    statusCode: 92000,
    message: '参数出错了，请重新检查一下。'
};

exports.CONTENT_REQUIRED = {
    statusCode: 92001,
    message: '缺少评论信息。'
};

exports.ARGUMENT_ERROR = {
    statusCode: 92002,
    message: '参数类型不正确。'
};

exports.CONTACT_INFO_REQUIRED = {
    statusCode: 92003,
    message: '电话号码或电子邮件不能空白。'
};


