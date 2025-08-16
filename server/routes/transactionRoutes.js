import express from "express";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(getTransactions).post(createTransaction);

router.get("/summary", getTransactionSummary);

router.route("/:id").put(updateTransaction).delete(deleteTransaction);

export default router;
