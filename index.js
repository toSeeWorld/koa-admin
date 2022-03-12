const Koa = require('koa');
const path = require('path')
const bodyParser = require('koa-bodyparser');
const ejs = require('ejs');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js');
const router = require('koa-router')
const views = require('koa-views')
// const koaStatic = require('koa-static')
const staticCache = require('koa-static-cache')
const koaBody = require('koa-body');
const app = new Koa()


// session存储配置
const sessionMysqlConfig = {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST,
}

// 配置session中间件
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore(sessionMysqlConfig)
}))

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});
// 配置静态资源加载中间件
// app.use(koaStatic(
//   path.join(__dirname , './public')
// ))
// 缓存
app.use(staticCache(path.join(__dirname, './public'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))

// 配置服务端模板渲染引擎中间件
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
  }
}));

app.use(require('./routers/core/getMaterialList.js').routes())
// app.use(require('./routers/core/getMaterialList.js').routes())
app.use(require('./routers/core/upload.js').routes())
app.use(require('./routers/signin.js').routes())
app.use(require('./routers/signup.js').routes())
app.listen(config.port)

console.log(`listening on port ${config.port}`)
