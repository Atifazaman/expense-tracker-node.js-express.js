const express =require("express")
const { createOrder, verifyPayment,getPaymentStatus }=require("../controllers/payment")
const auth = require("../middleware/authMiddleware"); 
const { webhook } = require("../controllers/webhookController");
const router = express.Router();

router.post("/create-order", auth, createOrder); 
router.get("/verify/:order_id", auth, verifyPayment);

router.get("/status/:order_id", auth, getPaymentStatus); 

router.post("/webhook", webhook);




module.exports=router;