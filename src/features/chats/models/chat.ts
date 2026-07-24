export type Message = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    sentAt: string;
    isMine: boolean;
  };
  
  export type Chat = {
    id: string;
    outingId: string;
    outingName: string;
    outingImage: string;
  
    status: "accepted" | "pending";
  
    lastMessage: string;
    lastMessageTime: string;
  
    unreadCount: number;
  
    participants: number;
  
    messages: Message[];
  };