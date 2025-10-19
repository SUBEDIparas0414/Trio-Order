import "dotenv/config";
import Stripe from "stripe";
import Order from "../models/orderModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }

    const orderItems = items.map(
      ({ item, name, price, imageUrl, quantity }) => {
        const base = item || {};
        return {
          item: {
            name: base.name || name || "unknown",
            price: Number(base.price ?? price) || 0,
            imageUrl: base.imageUrl || imageUrl || "",
          },
          quantity: Number(quantity) || 0,
        };
      }
    );

    const shippingCost = 0;
    let newOrder;

    if (paymentMethod === "online") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: orderItems.map((o) => ({
          price_data: {
            currency: "inr",
            product_data: { name: o.item.name },
            unit_amount: Math.round(o.item.price * 100),
          },
          quantity: o.quantity,
        })),
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
        metadata: { firstName, lastName, email, phone },
      });

      newOrder = new Order({
        user: req.user._id,
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        zipCode,
        paymentMethod,
        subtotal,
        tax,
        total,
        shipping: shippingCost,
        items: orderItems,
        paymentIntentId: session.payment_intent,
        sessionId: session.id,
        paymentStatus: "pending",
      });

      await newOrder.save();
      return res
        .status(201)
        .json({ order: newOrder, checkouturl: session.url });
    }

    // COD orders
    newOrder = new Order({
      user: req.user._id,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      shipping: shippingCost,
      items: orderItems,
      paymentStatus: "succeeded",
    });

    await newOrder.save();
    return res.status(201).json({ order: newOrder, checkouturl: null });
  } catch (error) {
    console.error("CreateOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id)
      return res.status(400).json({ message: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      const order = await Order.findOneAndUpdate(
        { sessionId: session_id },
        { paymentStatus: "succeeded" },
        { new: true }
      );

      if (!order) return res.status(404).json({ message: "order not found" });
      return res.json(order);
    }
    return res.status(400).json({ message: "payment not completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error", error: err.message });
  }
};

// Get orders for user (excluding customer-deleted orders)
export const getOrder = async (req, res) => {
  try {
    console.log('User requesting orders for:', req.user._id);
    const filter = { 
      user: req.user._id,
      deletedByCustomer: { $ne: true }
    };
    const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    console.log(`Found ${rawOrders.length} orders for user (excluding customer-deleted)`);

    const formatted = rawOrders.map((o) => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.phone,
      address: o.address,
      city: o.city,
      zipCode: o.zipCode,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status || 'pending',
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      expectedDelivery: o.expectedDelivery,
      deliveredAt: o.deliveredAt,
      deletedByAdmin: o.deletedByAdmin,
      deletedByCustomer: o.deletedByCustomer,
      items: o.items.map((i) => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity,
      })),
    }));

    res.json({
      success: true,
      orders: formatted,
      count: formatted.length
    });
  } catch (error) {
    console.error("getOrder error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Admin: get all orders with enhanced details (excluding admin-deleted orders)
export const getAllOrders = async (req, res) => {
  try {
    console.log('Admin requesting all orders...');
    const raw = await Order.find({ deletedByAdmin: { $ne: true } }).sort({ createdAt: -1 }).lean();
    console.log(`Found ${raw.length} orders (excluding admin-deleted)`);
    
    const formatted = raw.map((o) => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.phone,
      address: o.address ?? o.shippingAddress?.address ?? "",
      city: o.city ?? o.shippingAddress?.city ?? "",
      zipCode: o.zipCode ?? o.shippingAddress?.zipCode ?? "",
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status || 'pending',
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      expectedDelivery: o.expectedDelivery,
      deliveredAt: o.deliveredAt,
      deletedByAdmin: o.deletedByAdmin,
      deletedByCustomer: o.deletedByCustomer,
      items: o.items.map((i) => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity,
      })),
    }));

    res.json({
      success: true,
      orders: formatted,
      count: formatted.length
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Update any order (Admin) with enhanced status handling
export const updateAnyOrder = async (req, res) => {
  try {
    const { status, expectedDelivery, deliveredAt } = req.body;
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // If status is being updated to delivered, set deliveredAt
    if (status === 'delivered' && !deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    
    // If status is being updated to outForDelivery, set expected delivery
    if (status === 'outForDelivery' && !expectedDelivery) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days from now
      updateData.expectedDelivery = deliveryDate;
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "order not found" });
    }
    
    res.json({
      success: true,
      message: "Order updated successfully",
      order: updated
    });
  } catch (error) {
    console.error("updateAnyOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.query.email && order.email !== req.query.email) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(order);
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Update order by ID
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.body.email && order.email !== req.body.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    console.error("updateOrder error:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Admin: Soft delete order (only completed/cancelled orders)
export const deleteOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Only allow deletion of completed or cancelled orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Only completed or cancelled orders can be deleted" 
      });
    }

    // Check if already deleted by admin
    if (order.deletedByAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Order already deleted by admin" 
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        deletedByAdmin: true,
        adminDeletedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order deleted successfully from admin panel",
      order: updated
    });
  } catch (error) {
    console.error("deleteOrderByAdmin error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};

// Customer: Soft delete their own order (only completed/cancelled orders)
export const deleteOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Check if user owns this order
    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    // Only allow deletion of completed or cancelled orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Only completed or cancelled orders can be deleted" 
      });
    }

    // Check if already deleted by customer
    if (order.deletedByCustomer) {
      return res.status(400).json({ 
        success: false,
        message: "Order already deleted from your history" 
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        deletedByCustomer: true,
        customerDeletedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order deleted successfully from your order history",
      order: updated
    });
  } catch (error) {
    console.error("deleteOrderByCustomer error:", error);
    res.status(500).json({ 
      success: false,
      message: "server error", 
      error: error.message 
    });
  }
};
