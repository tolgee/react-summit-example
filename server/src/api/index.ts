import express from 'express';
import optionsRouter from './options';
import voteRouter from './vote';

const router = express.Router();

router.use(optionsRouter);
router.use(voteRouter);

export default router;