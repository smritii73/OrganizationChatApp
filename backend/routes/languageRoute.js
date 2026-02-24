import express from "express";
import { setLanguage, getLanguage } from "../controllers/languageController.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();
// ✅ Set user language (PATCH for update)
router.patch("/set-language", setLanguage);
// ✅ Get user language (GET)
router.get("/:userId", getLanguage);
export default router;