import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    pagination,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  // Load messages on component mount
  useEffect(() => {
    if (selectedUser) {
      getMessages({ userId: selectedUser._id, page: 1 });
    }
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  const fetchMoreData = () => {
    if (!pagination.hasNextPage) {
      return;
    } else {
      const nextPage = pagination.currentPage + 1;
      getMessages({ userId: selectedUser._id, page: nextPage });
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (
    isMessagesLoading &&
    messages.length == 0 &&
    pagination.currentPage === 1
  ) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        className="p-4 space-y-4"
        style={{
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
        id="scrollableDiv"
        ref={messageEndRef}>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreData}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          hasMore={pagination.hasNextPage}
          loader={<MessageSkeleton count={3} />}
          scrollableTarget="scrollableDiv"
          scrollThreshold={0.9} // Trigger fetching when 90% of the scroll height is reached
          scrollSensitivity={1}>
          {messages.map((message, i) => (
            <div
              key={i}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end " : "chat-start"
              }`}>
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div
                className={`chat-bubble flex flex-col p-2 ${
                  message.senderId === authUser._id && "chat-bubble-primary"
                }`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] min-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatContainer;
