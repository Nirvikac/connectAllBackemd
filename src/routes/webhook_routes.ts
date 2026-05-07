import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();


router.get("/", (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});
 
router.post('/', (req: Request, res: Response) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

export default router;