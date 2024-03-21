const { connectWhatsapp, postSendMessage } = require("../app/index");

const { Router } = require("express");
const router = Router();

connectWhatsapp();

router.post("/webhook/order", postSendMessage);



module.exports = router;
