const router = require('koa-router')();
const controller = require('../../controller/core/upload');
router.post("/upload",controller.upload)
module.exports = router;
