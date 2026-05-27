import Ticket from '../models/Ticket.js';
import { createNotification } from '../utils/notify.js';

const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  return `TKT-${String(count + 1).padStart(5, '0')}`;
};

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createTicket = async (req, res, next) => {
  try {
    const { subject, body, category = 'other', priority = 'medium' } = req.body;
    const ticketNumber = await generateTicketNumber();
    const ticket = await Ticket.create({
      ticketNumber,
      user:     req.user._id,
      subject,
      category,
      priority,
      messages: [{ sender: req.user._id, senderRole: req.user.role, body }],
    });

    createNotification({
      title:   'New support ticket',
      message: `${req.user.name}: ${subject}`,
      type:    'system',
      link:    '/admin/tickets',
    });

    res.status(201).json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-messages');
    res.json({ status: 'success', data: { tickets } });
  } catch (e) { next(e); }
};

export const getMyTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id })
      .populate('messages.sender', 'name avatar role');
    if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    res.json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};

export const replyToTicket = async (req, res, next) => {
  try {
    const { body } = req.body;
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    if (['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({ status: 'error', message: 'This ticket is closed' });
    }
    ticket.messages.push({ sender: req.user._id, senderRole: req.user.role, body });
    if (ticket.status === 'resolved') ticket.status = 'open';
    await ticket.save();
    res.json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const listTickets = async (req, res, next) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-messages'),
      Ticket.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        tickets,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (e) { next(e); }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('messages.sender', 'name avatar role');
    if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    res.json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};

export const adminReplyTicket = async (req, res, next) => {
  try {
    const { body, status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });

    if (body) {
      ticket.messages.push({ sender: req.user._id, senderRole: 'admin', body });
      if (ticket.status === 'open') ticket.status = 'in_progress';
    }

    if (status) {
      ticket.status = status;
      if (status === 'resolved') ticket.resolvedAt = new Date();
    }

    await ticket.save();
    res.json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    if (status)   ticket.status   = status;
    if (priority) ticket.priority = priority;
    if (status === 'resolved') ticket.resolvedAt = new Date();
    await ticket.save();
    res.json({ status: 'success', data: { ticket } });
  } catch (e) { next(e); }
};
