export interface Message {
  id: string;

  outingId: string;

  senderId: string;
  receiverId: string;

  message: string;

  createdAt: string;

  isMine: boolean;
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
