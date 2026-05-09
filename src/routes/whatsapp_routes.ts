import express from "express";
import { connectWhatsApp } from "../controllers/whatsapp_controller";

const router = express.Router();

router.post("/connect-whatsapp", connectWhatsApp);
router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  // redirect back to app or return code
  res.json({ code });
});
export default router;
