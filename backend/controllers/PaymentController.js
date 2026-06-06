import Stripe from "stripe";
import User from "../models/user.js";
import Appointment from "../models/Appointment.js";
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  doctor: {
    Basic: { monthly: 10, yearly: 100 },
    Professional: { monthly: 29, yearly: 290 },
    Premium: { monthly: 49, yearly: 490 },
  },
  ambulance_driver: {
    Basic: { monthly: 5, yearly: 50 },
    Professional: { monthly: 10, yearly: 100 },
    Premium: { monthly: 20, yearly: 200 },
  },
};

const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { packageName, duration } = req.body;
    const user = req.user;

    if (!["doctor", "ambulance_driver"].includes(user.role)) {
      return res.status(403).json({ message: "Only doctors and drivers can subscribe" });
    }

    const rolePlans = PLANS[user.role];
    if (!rolePlans || !rolePlans[packageName]) {
      return res.status(400).json({ message: "Invalid package selected" });
    }

    const price = duration === "yearly"
      ? rolePlans[packageName].yearly
      : rolePlans[packageName].monthly;

    const months = duration === "yearly" ? 12 : 1;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
           currency: "usd",
unit_amount: price * 100,
            product_data: {
              name: `MediCore ${packageName} Plan`,
              description: `${duration === "yearly" ? "Yearly" : "Monthly"} subscription for ${user.role === "doctor" ? "Doctor" : "Ambulance Driver"}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        packageName,
        months: months.toString(),
        role: user.role,
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const stripe = getStripe();
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { userId, packageName, months } = session.metadata;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(months));

    user.subscriptionStatus = "active";
    user.packageName = packageName;
    user.subscriptionStart = start;
    user.subscriptionEnd = end;
    await user.save();

    res.status(200).json({
      message: "Payment verified and subscription activated",
      subscription: {
        status: user.subscriptionStatus,
        packageName: user.packageName,
        start: user.subscriptionStart,
        end: user.subscriptionEnd,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ message: `Webhook error: ${error.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const { userId, packageName, months } = session.metadata;
      const user = await User.findById(userId);
      if (user) {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + Number(months));
        user.subscriptionStatus = "active";
        user.packageName = packageName;
        user.subscriptionStart = start;
        user.subscriptionEnd = end;
        await user.save();
      }
    }
  }

  res.status(200).json({ received: true });
};
const createAppointmentCheckout = async (req, res) => {
  try {
    const stripe = getStripe();
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name consultationFee")
      .populate("patientId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Appointment already paid" });
    }

    const fee = appointment.consultationFee || 10;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with Dr. ${appointment.doctorId.name}`,
              description: `Appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`,
            },
            unit_amount: fee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentId,
        type: "appointment",
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=appointment`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyAppointmentPayment = async (req, res) => {
  try {
    const stripe = getStripe();
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { appointmentId } = session.metadata;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.paymentStatus = "paid";
    await appointment.save();

    res.status(200).json({
      message: "Payment verified. Doctor can now accept your appointment.",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { createCheckoutSession, verifyPayment, handleWebhook, createAppointmentCheckout, verifyAppointmentPayment  };