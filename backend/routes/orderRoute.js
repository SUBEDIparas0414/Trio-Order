import express from "express";
import {
  confirmPayment,
  createOrder,
  getAllOrders,
  getOrder,
  getOrderById,
  updateAnyOrder,
  updateOrder,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.get("/getall", getAllOrders);
orderRouter.put("/getall/:id", updateAnyOrder);

// protected routes
orderRouter.use(authMiddleware);
orderRouter.post("/", createOrder);
orderRouter.get("/", getOrder);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);

export default orderRouter;
