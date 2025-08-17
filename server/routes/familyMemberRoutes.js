import express from "express";
import {
  listFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "../controllers/familyMemberController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(listFamilyMembers).post(addFamilyMember);
router.route("/:id").put(updateFamilyMember).delete(deleteFamilyMember);

export default router;
