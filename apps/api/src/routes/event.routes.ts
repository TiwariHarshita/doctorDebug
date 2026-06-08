import { Router } from "express";
import { createEventController } from "../controllers/event.controller";

const router = Router();
router.get("/api/v1/events/test", (req, res) => {
  res.json({
    success: true,
    message: "Event route is connected"
  });
});
router.post("/api/v1/events", createEventController);

export default router;