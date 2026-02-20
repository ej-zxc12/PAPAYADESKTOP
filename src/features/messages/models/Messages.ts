export interface Message {
  id: string
  fromName: string
  fromEmail: string
  subject?: string
  body: string
  receivedAt: string
  read: boolean
  replied: boolean
  replyText?: string
  repliedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MessageReply {
  id: string
  messageId: string
  replyText: string
  repliedBy: string
  repliedAt: string
}
