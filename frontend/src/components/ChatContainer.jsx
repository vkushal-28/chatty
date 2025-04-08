import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, groupMessagesByDate } from "../lib/utils";

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
  const sendRef = useRef(null);

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
    if ((messageEndRef.current && messages) || sendMessage) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sendMessage]);

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

  const groupedMessages = groupMessagesByDate(messages);
  const groupedMessagesArray = Object.entries(groupedMessages).map(
    ([label, messages]) => ({
      label,
      messages: messages.reverse(),
      // Optional: Add a date field to sort by
      // sortDate: messages[0]?.createdAt || null,
    })
  );
  // .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate)); // oldest to

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
          position: "relative",
        }}
        id="scrollableDiv"
        ref={messageEndRef}>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreData}
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
          inverse={true}
          hasMore={pagination.hasNextPage}
          loader={<MessageSkeleton count={3} />}
          scrollableTarget="scrollableDiv"
          scrollThreshold={0.9} // Trigger fetching when 90% of the scroll height is reached
          scrollSensitivity={1}>
          {groupedMessagesArray.reverse().map((group) => (
            <div key={group.label}>
              {/* Date Header */}
              <div className="sticky top-0 z-10 my-1 flex items-center justify-center bg-transparent">
                <div className="text-center w-full px-4">
                  <span className="mx-4 text-xs font-medium badge badge-sm bg-base-300/60 text-base-content/75 px-3 py-0 rounded-md shadow-sm ">
                    {group.label}
                  </span>
                </div>
              </div>

              {/* Messages under this date */}
              {group.messages.map((message, i) => (
                <div
                  key={message._id || i}
                  className={`chat ${
                    message.senderId === authUser._id
                      ? "chat-end"
                      : "chat-start"
                  }`}>
                  {/* User image if group message */}
                  {/* <div className="chat-image avatar">
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
                  </div> */}

                  <div className="chat-footer mt-1">
                    <time className="text-xs opacity-50">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>

                  <div
                    className={`chat-bubble flex flex-col p-1 ${
                      message.senderId === authUser._id && "chat-bubble-primary"
                    }`}>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] min-w-[200px] rounded-md "
                      />
                    )}
                    {message.text && <div className="px-2">{message.text}</div>}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={sendRef} />
        </InfiniteScroll>
      </div>
      <MessageInput sendRef={sendRef} />
    </div>
  );
};

export default ChatContainer;
