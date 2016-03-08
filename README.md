
##Jackfruit Server

[![Build Status](https://magnum.travis-ci.com/EthanWu/jackfruit-server.svg?token=oxMUjj3eic3CWpuTMKWL&branch=develop)](https://magnum.travis-ci.com/EthanWu/jackfruit-server)

Jackfruit Server 是信弈公司旗下的API服务器，目前主要用来为信弈的Jackfruit客户端和网站（待开发）提供REST类型的API，该项目基于[MEAN.JS](meanjs.org)（[MongoDB](http://www.mongodb.org/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), 和 [AngularJS](http://angularjs.org/) ）框架。

###部署推荐环境

- ubuntu 14.04
- Mongodb: 2.6.6
- Nodejs: 10.36

###安装方法
1. git clone https://github.com/EthanWu/jackfruit-server.git
2. sudo npm install -g grunt-cli
2. npm install -g bower
2. npm install
3. 修改node_module中七牛模块的配置文件中的appkey和appsecret
4. node server.js

###API使用文档
见[docs](https://github.com/EthanWu/jackfruit-server/tree/master/docs)文件夹下的API文档

**使用说明：**

- URL中加粗的大写单词为REST请求的类型，其后所接的字符串为API路由 如`POST signup`中，POST为请求类型，/signup为请求链接
- Field中为PUT或POST请求中Body体中的参数，**其中name为斜体的参数为必填。**
- Parameters中为附带在URL中的参数。
- 所有请求中默认需要accessToken参数（放在header中）进行鉴权。

**响应体**

~~在出现错误时，响应体会向服务器发送`message`字段，字段内容为错误原因。可通过检测响应体中是否包含`message`字段来判断是否发生了错误。（正常的响应体中不会包含`message`字段）。~~

所有的请求都会返回statusCode字段，用于客户端判断请求的结果是否成功。statusCode的语义见`app/utils/status-code.js`文件中。在请求失败时，服务器会返回请求失败的错误码和失败的原因（在message字段中，成功的请求中不包含message字段）。

**状态码：**
状态码为一个5位的Int类型的数字，其中左起第一位代表错误大类，具体含义如下：

|statusCode|Description|
|:--|:--|:--|
|1XXXX|注册登录、验证鉴权，用户相关信息错误|
|3XXXX|旅行计划和评论错误|
|4XXXX|景区信息错误|
|5XXXX|商家和任务错误|
|6XXXX|点赞和评论错误|
|8XXXX|集成的第三方服务错误|
|9XXXX|数据库错误|

