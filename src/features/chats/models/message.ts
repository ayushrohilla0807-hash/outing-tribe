export interface MessageReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  seenAt: string;
  userName: string;
  userAvatar: string | null;
}

export interface Message {
  id: string;
  outingId: string;
  senderId: string;
  receiverId?: string | null;
  groupId?: string | null;
  message: string;
  createdAt: string;
  isMine: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  reads?: MessageReadReceipt[];
}

export interface Chat {
  outingId: string;
  otherUserId: string;
  outingName: string;
  outingImage: string | null;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: number;
}

export interface GroupChat {
  id: string; // group_conversations.id
  outingId: string;
  outingTitle: string;
  outingImage: string | null;
  participantCount: number;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderName?: string;
  unreadCount: number;
  isHost: boolean;
  lastMessageCreatedAt?: string | null;
  outingCreatedAt?: string | null;
}

export interface GroupMember {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: "host" | "member";
  joinedAt: string;
}
