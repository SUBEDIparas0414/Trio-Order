import express from "express";
import {
  confirmPayment,
  createOrder,
  deleteOrderByAdmin,
  deleteOrderByCustomer,
  getAllOrders,
  getOrder,
  getOrderById,
  updateAnyOrder,
  updateOrder,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

const orderRouter = express.Router();

// Admin routes - protected with admin authentication
orderRouter.get("/getall", adminAuthMiddleware, getAllOrders);
orderRouter.put("/getall/:id", adminAuthMiddleware, updateAnyOrder);
orderRouter.delete("/getall/:id", adminAuthMiddleware, deleteOrderByAdmin);

// protected routes
orderRouter.use(authMiddleware);
orderRouter.post("/", createOrder);
orderRouter.get("/", getOrder);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);
orderRouter.delete("/:id", deleteOrderByCustomer);

export default orderRouter;
