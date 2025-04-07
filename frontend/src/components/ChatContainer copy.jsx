import { useChatStore } from "../store/useChatStore";
import { Fragment, useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import {
  compareDate,
  formatDateForChat,
  formatMessageTime,
} from "../lib/utils";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
dayjs.extend(calendar);

const ChatContainer = () => {
  const {
    messages,
    pagination: { hasNextPage },
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMessages({ userId: selectedUser._id, page });
    subscribeToMessages();
    console.log("first");

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    page,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);
  useEffect(() => {
    if (messageEndRef.current && messages) {
      // messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("firstoooo");
    }

    if (messages.length > 0) {
      // Save scroll height before loading new messages
      const container = containerRef.current;
      const oldScrollHeight = container?.scrollHeight;
      // Maintain scroll position after loading older messages
      setTimeout(() => {
        const newScrollHeight = container?.scrollHeight;
        // container.scrollTop = newScrollHeight - oldScrollHeight;
      }, 0);
      // console.log(endRef);
    }
    // endRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMessagesLoading]);

  const handleScroll = () => {
    const container = containerRef.current;
    // console.log(container.scrollTop, hasNextPage, isMessagesLoading);
    if (container.scrollTop === 0 && hasNextPage && !isMessagesLoading) {
      setPage((prevState) => prevState + 1);
    }
  };

  const scrp = () => {
    console.log("opopopopopo");
    setTimeout(() => {
      // endRef?.current?.scrollIntoView({ behavior: "smooth" });
      // messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };
  if (isMessagesLoading) {
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
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={containerRef}
        onScroll={handleScroll}>
        {messages.map((message, i) => {
          const date = compareDate(
            message?.createdAt,
            messages[i - 1]?.createdAt
          );

          // console.log("previous", message.createdAt, messages[i - 1]);
          return (
            <Fragment key={message._id}>
              <div className="text-center">
                {i == 0 && (
                  <div className="badge badge-sm bg-base-300/50 font-bold text-base-content/75">
                    {formatDateForChat(message.createdAt)}
                  </div>
                )}
                {messages[i - 1] !== undefined && date && (
                  <div className="badge badge-sm bg-base-300/50  text-base-content/75 font-bold">
                    {date}
                  </div>
                )}
              </div>
              <div
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end " : "chat-start"
                }`}
                ref={messageEndRef}>
                <div className=" chat-image avatar">
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
                      className="sm:max-w-[200px] w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} hidden />
      </div>

      <MessageInput scrollToEnd={() => scrp()} />
    </div>
  );
};
export default ChatContainer;
