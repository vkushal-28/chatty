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

  // function groupMessagesByDate(messages) {
  //   const groups = {};

  //   messages.forEach((msg) => {
  //     const date = parseISO(msg.createdAt);

  //     let label;
  //     if (isToday(date)) {
  //       label = "Today";
  //     } else if (isYesterday(date)) {
  //       label = "Yesterday";
  //     } else if (isThisWeek(date)) {
  //       label = format(date, "EEEE"); // Monday, Tuesday, etc.
  //     } else {
  //       label = format(date, "MMMM d, yyyy"); // e.g., March 25, 2025
  //     }

  //     if (!groups[label]) {
  //       groups[label] = [];
  //     }
  //     groups[label].push(msg);
  //   });

  //   // Sort groups by date descending
  //   const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
  //     const getDateFromLabel = (label) => {
  //       if (label === "Today") return new Date();
  //       if (label === "Yesterday") return new Date(Date.now() - 86400000);
  //       if (
  //         [
  //           "Monday",
  //           "Tuesday",
  //           "Wednesday",
  //           "Thursday",
  //           "Friday",
  //           "Saturday",
  //           "Sunday",
  //         ].includes(label)
  //       ) {
  //         const today = new Date();
  //         const targetDay = label;
  //         const dayIndex = [
  //           "Sunday",
  //           "Monday",
  //           "Tuesday",
  //           "Wednesday",
  //           "Thursday",
  //           "Friday",
  //           "Saturday",
  //         ].indexOf(targetDay);
  //         const daysAgo = (today.getDay() - dayIndex + 7) % 7;
  //         return new Date(
  //           today.getFullYear(),
  //           today.getMonth(),
  //           today.getDate() - daysAgo
  //         );
  //       }
  //       return new Date(label);
  //     };

  //     return getDateFromLabel(b).getTime() - getDateFromLabel(a).getTime();
  //   });

  //   const sortedGroups = {};
  //   sortedGroupKeys.forEach((key) => {
  //     sortedGroups[key] = groups[key];
  //   });

  //   return sortedGroups;
  // }

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
                  {/* <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div> */}
                  <span className="mx-4 text-xs font-medium badge badge-sm bg-base-300/60 text-base-content/75 px-3 py-0 rounded-full shadow-sm animate-fadeIn">
                    {group.label}
                  </span>
                  {/* <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div> */}
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
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatContainer;
