document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("buyPremiumBtn");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/payment/create-order",
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
        startPolling(orderId);
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



function startPolling(orderId) {
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("Checking payment...");

      const verifyRes = await axios.get(
        `/payment/verify/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    
   
      const res = await axios.get(
        `/payment/status/${orderId}`,
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

        
      }

      if (status === "FAILED") {
        clearInterval(interval);
        alert("❌ Payment Failed");
      }
  if (verifyRes.data.token) {
  localStorage.setItem("token", verifyRes.data.token);
  window.location.reload();
}
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
    }
  }, 3000); 
}
