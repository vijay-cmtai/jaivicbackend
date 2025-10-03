const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  if (!amount) {
    return res.status(400).json({ message: "Amount is required." });
  }

  const options = {
    amount: Math.round(amount * 100), 
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res
        .status(500)
        .json({ message: "Error creating Razorpay order." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res
      .status(400)
      .json({ message: "Missing payment details for verification." });
  }

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified successfully." });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed." });
  }
};
