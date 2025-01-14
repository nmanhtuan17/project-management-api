export enum EmailType {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export enum EmailAddressType {
  Personal = 'personal',
  Group = 'group',
}

export enum EmailSendingType {
  sent = 'sent',
  reply = 'reply',
  replyAll = 'replyAll',
  forward = 'forward',
}

export interface StoredEmailAttachment {
  contentType: string;
  name: string;
  url: string;
  size: number;
  cid: string;
}

export interface EmailFull {
  Email: string
  Name: string
  MailboxHash: string
}
