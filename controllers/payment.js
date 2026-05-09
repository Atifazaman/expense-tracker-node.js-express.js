const { Cashfree, CFEnvironment } = require("cashfree-pg");
const orderTable = require("../Models/orderModel");
const userTable = require("../Models/usersTable")

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

// ✅ CREATE ORDER
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
        return_url: "http://localhost:3000/payment-success?order_id={order_id}",
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

// ✅ VERIFY + UPDATE DB
const verifyPayment = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    console.log("VERIFY CALLED:", order_id);

    const response = await cashfree.PGOrderFetchPayments(order_id);

    console.log("FULL RESPONSE:", JSON.stringify(response.data, null, 2));

      const paymentStatus = response.data?.[0]?.payment_status;

    console.log("STATUS FROM CASHFREE:", paymentStatus);

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
      const result = await orderTable.update(
        { status: "SUCCESS" },
        { where: { orderId: order_id } }
      );

      console.log("UPDATE RESULT:", result);

      const order = await orderTable.findOne({ where: { orderId: order_id } });

      if (order) {
        await userTable.update(
          { isPremium: true },
          { where: { id: order.userId } }
        );
      }
    }

    if (paymentStatus === "FAILED") {
      await orderTable.update(
        { status: "FAILED" },
        { where: { orderId: order_id } }
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    next(err);
  }
};

// ✅ GET STATUS
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