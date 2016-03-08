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
    message: '权限不够。'
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
    message: '用户没有登陆。'
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

//delete user .
exports.TASK_BOUND = {
    statusCode: 10400,
    message: '删除用户警告：任务。'
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
exports.FRIEND_EXIST = {
    statusCode: 12000,
    message: '他已经为您的好友。'
};

//black list.
exports.ACTION_BLOCKED = {
    statusCode:13000,
    message:'没有权限。'
};

exports.UPDATE_LOCATION_ERROR = {
    statusCode: 15000,
    message: '更新个人位置失败。'
};

exports.SCENIC_SPOT_NOT_EXIST = {
    statusCode: 40001,
    message: '执行地不存在。'
};

exports.PICTURE_NOT_EXIST = {
    statusCode: 41001,
    message: '图片不存在。'
};

//商户验证User验证码出错
exports.TASK_NOT_EXIST = {
    statusCode: 50001,
    message: '任务不存在。'
};
exports.TASK_ALREADY_STARRED = {
    statusCode: 50002,
    message: '您已经领取过任务。'
};
exports.TASK_ARCHIVED = {
    statusCode: 50003,
    message: '任务已经文成，不能取消。'
};
exports.TASK_NOT_STARRED = {
    statusCode: 50004,
    message: '你需要先领取这个任务，然后获取验证码。'
};
exports.TASK_NOT_RATING = {
    statusCode: 50005,
    message: '你需要先评分，然后查看评分。'
};
exports.UNSTAR_ACTIVITY_TASK_WARNING = {
    statusCode: 50006,
    message: '活动任务不能删除'
};
exports.SELECTED_TASK_ENOUGH = {
    statusCode: 50007,
    message: '精选任务数量已满。'
};
exports.TASK_LIST_STARRED_ERROR= {
    statusCode: 51001,
    message: '领取路线失败，请重新试一下。'
};
exports.TASK_LIST_ALREADY_STARRED = {
    statusCode: 51002,
    message: '您已经领取过这个路线。'
};

exports.TASK_LIST_ALREADY_RATED = {
    statusCode: 51003,
    message: '您已经评过分。'
};
exports.VERIFY_CODE_ERR = {
    statusCode: 54000,
    message: '验证码错误。'
};

//vote and comment.
exports.ALREADY_VOTED = {
    statusCode: 60000,
    message: '已经投过票。'
};
exports.CREATE_COMMENT_ERROR = {
    statusCode: 61000,
    message: '创建评论失败。'
};

exports.COMMENT_TYPE_NOT_FOUND = {
    statusCode:61002,
    message: '这种类型的评论不存在。'
};

exports.COMMENT_CONTENT_REQUIRED = {
    statusCode:61003,
    message: '评论内容不能为空。'
};

exports.DELETE_COMMENT_ERROR = {
    statusCode: 61001,
    message: ' 删除评论失败。'
};



//Third party service error.
exports.JPUSH_ERROR = {
    statusCode: 80000,
    message: 'JPush 错误。'
};

exports.JUHE_ERROR ={
    statusCode:81000,
    message:'局和数据错误，无位置信息。'
};

exports.DIANPING_ERROR ={
    statusCode: 82000,
    message:'大众点评错误信息：无位置信息。'
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

//临时活动状态码
exports.ACTIVITY_NOT_BRGIN = {
    statusCode: 70001,
    message: '活动还未开始。'
};
exports.ACTIVITY_PARTICIPATED = {
    statusCode: 70002,
    message: '你已经参加过这个活动。'
};
exports.ACTIVITY_ENDED = {
    statusCode: 70003,
    message: '活动已经结束。'
};
exports.ACTIVITY_TASK_FULL = {
    statusCode: 70004,
    message: '活动任务发放数量已满。'
};

exports.BONUS_ALREADY_GOT = {
    statusCode: 71000,
    message: '该奖励不可重复获取！'
};
