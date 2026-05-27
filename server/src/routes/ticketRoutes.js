import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createTicket, getMyTickets, getMyTicketById, replyToTicket,
  listTickets, getTicketById, adminReplyTicket, updateTicketStatus,
} from '../controllers/ticketController.js';

const router = Router();

// ─── Customer (authenticated) ─────────────────────────────────────────────────
router.post('/',            authenticate, createTicket);
router.get('/my',           authenticate, getMyTickets);
router.get('/my/:id',       authenticate, getMyTicketById);
router.post('/my/:id/reply',authenticate, replyToTicket);

// ─── Admin ────────────────────────────────────────────────────────────────────
const admin = [authenticate, authorize('admin')];
router.get('/',              ...admin, listTickets);
router.get('/:id',           ...admin, getTicketById);
router.post('/:id/reply',    ...admin, adminReplyTicket);
router.patch('/:id/status',  ...admin, updateTicketStatus);

export default router;
