document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("buyPremiumBtn");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/payment/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentSessionId = res.data.payment_session_id;
      const orderId = res.data.order_id;

      console.log("ORDER CREATED:", orderId);

      localStorage.setItem("lastOrderId", orderId);

      window.cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      }).then(() => {
        startPolling(orderId); // 🔥 START POLLING
      });

    } catch (err) {
      console.log(err);
      alert("Payment failed to start");
    } finally {
      btn.disabled = false;
      btn.innerText = "Buy Premium";
    }
  });
});


// 🔥 POLLING FUNCTION
function startPolling(orderId) {
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("Checking payment...");

      // 🔥 VERIFY FIRST (updates DB)
      await axios.get(
        `http://localhost:3000/payment/verify/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 GET STATUS
      const res = await axios.get(
        `http://localhost:3000/payment/status/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const status = res.data.status;
      console.log("STATUS:", status);

      if (status === "SUCCESS") {
        clearInterval(interval);

        alert("🎉 Payment Successful!");

        document.getElementById("buyPremiumBtn").style.display = "none";
        document.getElementById("premiumMessage").style.display = "block";

        localStorage.setItem("isPremiumTemp", "true");
      }

      if (status === "FAILED") {
        clearInterval(interval);
        alert("❌ Payment Failed");
      }

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
    }
  }, 3000); // every 3 sec
}