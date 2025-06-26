import e from "express";
import protectRoute from "../middleware/auth.middleware";
import { getUserForSideBar,getMessages,sendMessage } from "../controllers/message.controller";

const router= e.Router()

router.get('/users',protectRoute,getUserForSideBar)
router.get('/:id',protectRoute,getMessages)
router.post('/send/:id',protectRoute,sendMessage)

export const messageRoute= router;