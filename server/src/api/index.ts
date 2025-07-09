import express from 'express';
import optionsRouter from './options';
import voteRouter from './vote';
import adminRouter from './admin';

const router = express.Router();

router.use(optionsRouter);
router.use(voteRouter);
router.use(adminRouter);

export default router;
