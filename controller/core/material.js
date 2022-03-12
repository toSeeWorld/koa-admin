const userModel = require('../../lib/mysql.js')

exports.getMateriaList = async ctx => {
    const { page = 1, pageSize = 20, name = null, major, year, id, subject, } = ctx.request.query
    console.log('name', name);
    let query = `select * from resource where name like "%${name}%"   limit ${(page - 1) * pageSize},${pageSize}; select count(*) as total from resource;`
    await userModel.query(query).then((result) => {
        console.log(':result[1]', result[1]);
        ctx.body = {
            content: result[0],
            code: 200,
            page,
            pageSize,
            total: result[1][0].total
        };
    }).catch((err) => {
        console.log(err);
        ctx.body = 404;
    })
}
exports.addResource = async ctx => {
    console.log(ctx.request.body);
    const { name, year, major, subject, contributor, content } = ctx.request.body;
    const _sql = `insert into resource set name = ?,year = ?,major = ?,subject = ?,contributor = ?,content = ?`
    await userModel.query(_sql, [name, year, major, subject, contributor, content]).then(() => {
        ctx.body = {
            code: 200,
            msg: '添加成功'
        }
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 0,
            msg: '更新失败'
        }
    })
}