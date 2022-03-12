const fs = require('fs')
const path = require('path')
const qiniu = require("qiniu");

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'AYU3ACpXFsI_5lVKreIHXUY8qezTEe9xxRpA3_b3';
qiniu.conf.SECRET_KEY = 'x5YA6zt6A8-R1lDKbE3aHLQNtenhKD5a1_Yt1_bK';
const mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
//要上传的空间
const bucket = 'newsp';

//上传到七牛后保存的文件名
// const key = 'my-nodejs-logo.png';
const config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z0;
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;

//构建上传策略函数
function uptoken(bucket, key) {
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket + ":" + key });
    return putPolicy.uploadToken(mac);
}

//生成上传 Token
//构造上传函数
async function uploadFile(uptoken, key, localFile) {
    return new Promise((resolve, reject) => {
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        // const readableStream = localFile; // 可读的流
        const readableStream = fs.createReadStream(localFile);
        formUploader.putStream(uptoken, key, readableStream, putExtra, function (respErr,
            respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            }

            if (respInfo.statusCode == 200) {
                console.log(respBody);
                const mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
                const config = new qiniu.conf.Config();
                const bucketManager = new qiniu.rs.BucketManager(mac, config);
                const publicBucketDomain = 'http://file.ririxue.cn';

                // 公开空间访问链接
                const publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
                resolve(publicDownloadUrl)

            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
                reject(respBody)
            }
        });
    })


}

//调用uploadFile上传

exports.upload = async ctx => {
    const file = ctx.request.files.file; // 获取上传文件
    const key = ctx.request.files.file.name
    const token = uptoken(bucket, key);
    const url = await uploadFile(token, key, file.path);
    // 创建可读流
    // const reader = fs.createReadStream(file.path);
    // let filePath = path.join(__dirname, 'public/upload/') + `/${file.name}`;
    // // 创建可写流
    // const upStream = fs.createWriteStream(filePath);
    // // 可读流通过管道写入可写流
    // reader.pipe(upStream);
    return ctx.body = {
        code: 200,
        url
    };
}