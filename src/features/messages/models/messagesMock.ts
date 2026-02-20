import type { Message, MessageReply } from '../models/Messages'

export const messagesMock: Message[] = [
  {
    id: 'MSG-001',
    fromName: 'Juan Dela Cruz',
    fromEmail: 'juan@example.com',
    subject: 'Inquiry about Scholarship Program',
    body: 'Good day! I would like to inquire about the available scholarship programs for the upcoming school year. Thank you!',
    receivedAt: '2024-01-15T09:30:00Z',
    read: false,
    replied: false,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },
  {
    id: 'MSG-002',
    fromName: 'Maria Santos',
    fromEmail: 'maria@example.com',
    subject: 'Partnership Proposal',
    body: 'Dear Papaya Academy, Our company would like to propose a partnership for your upcoming feeding program. Please let us know how we can collaborate.',
    receivedAt: '2024-01-14T14:20:00Z',
    read: true,
    replied: true,
    replyText: 'Thank you for your interest! We would be happy to discuss this partnership. Please schedule a meeting with our admin office.',
    repliedAt: '2024-01-15T10:15:00Z',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T10:15:00Z'
  }
]

export const messageRepliesMock: MessageReply[] = [
  {
    id: 'REPLY-001',
    messageId: 'MSG-002',
    replyText: 'Thank you for your interest! We would be happy to discuss this partnership. Please schedule a meeting with our admin office.',
    repliedBy: 'Admin Office',
    repliedAt: '2024-01-15T10:15:00Z'
  }
]
