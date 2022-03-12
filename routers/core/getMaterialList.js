const router = require('koa-router')();
const controller = require('../../controller/core/material')

router.get('/resource/getList', controller.getMateriaList)
router.post('/resource/addResource', controller.addResource)
module.exports = router