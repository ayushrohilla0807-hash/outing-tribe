import { supabase } from "@/integrations/supabase/client";

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export {
  ensureOutingGroup,
  canAccessGroupChat,
  getOutingGroupChats,
  getGroupMessages,
  sendGroupMessage,
  subscribeGroupMessages,
  getGroupMembers,
  setGroupChatLastRead,
  getChatLastReadMap,
  deleteGroupMessage,
} from "./groupChatService";
