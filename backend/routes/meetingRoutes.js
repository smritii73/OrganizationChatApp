import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createMeeting,
  generateReport,
  getMeeting,
  getUserMeetings,
} from "../controllers/meetingController.js";

const router = express.Router();

router.post("/create", protectRoute, createMeeting);
router.post("/:id/generate-report", protectRoute, generateReport);
router.get("/", protectRoute, getUserMeetings);
router.get("/:id", protectRoute, getMeeting);

export default router;
