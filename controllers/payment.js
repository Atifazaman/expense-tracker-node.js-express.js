const { Cashfree, CFEnvironment } = require("cashfree-pg");
const orderTable = require("../Models/orderModel");
const userTable = require("../Models/usersTable")
const sequelize = require("../Utils/db-connection");

const jwt = require("jsonwebtoken");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);


const createOrder = async (req, res, next) => {
  try {
    const orderId = "order_" + Date.now();

    const request = {
      order_amount: 100,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: `user_${req.user.id}`,
        customer_phone: "8135962614",
      },
  order_meta: {
  return_url: "https://surfer-leggings-lurch.ngrok-free.dev/payment-success?order_id={order_id}",
},
    };

    const response = await cashfree.PGCreateOrder(request);

    await orderTable.create({
      userId: req.user.id,
      orderId,
      amount: request.order_amount,
      currency: request.order_currency,
      status: "PENDING",
    });

    res.json(response.data);
  } catch (err) {
    next(err);
  }
};


const verifyPayment = async (req, res, next) => {
  let t;

  try {
    const { order_id } = req.params;

    const response = await cashfree.PGOrderFetchPayments(order_id);

    const paymentStatus = response.data?.[0]?.payment_status;

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {

      t = await sequelize.transaction();

      await orderTable.update(
        { status: "SUCCESS" },
        {
          where: { orderId: order_id },
          transaction: t
        }
      );

      const order = await orderTable.findOne({
        where: { orderId: order_id },
        transaction: t
      });

      if (!order) {
        await t.rollback();
        return res.status(404).json({
          message: "Order not found"
        });
      }

      await userTable.update(
        { isPremium: true },
        {
          where: { id: order.userId },
          transaction: t
        }
      );

     
      const user = await userTable.findByPk(order.userId, {
  transaction: t
});

console.log("USER PREMIUM:", user.isPremium);

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    isPremium: user.isPremium,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
 await t.commit();
return res.json({
  success: true,
  token,
});
    }

    if (paymentStatus === "FAILED") {
      await orderTable.update(
        { status: "FAILED" },
        { where: { orderId: order_id } }
      );
    }

    res.json({ success: true });

  } catch (err) {

    if (t) {
      await t.rollback();
    }

    next(err);
  }
};


const getPaymentStatus = async (req, res, next) => {
  try {
    const orderId = req.params.order_id;

    const order = await orderTable.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ status: order.status });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentStatus,
};