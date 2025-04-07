import { useChatStore } from "../store/useChatStore";
import { Fragment, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

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
    pagination: { hasNextPage, hasPrevPage, totalMessages, messagesLoaded },
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [load, setload] = useState(true);
  const [page, setPage] = useState(1);
  const scrollableDivRef = useRef(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    if (page === 1 && isMessagesLoading) setload(false);
  }, [page, isMessagesLoading]);

  useEffect(() => {
    getMessages({ userId: selectedUser._id, page });
    subscribeToMessages();

    if (page > 1 && !isMessagesLoading) {
      // Restore scroll to maintain continuity
      const container = document.getElementById("scrollableDiv");
      container?.scrollTo({ top: 1 }); // or whatever helps
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    page,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages && page == 1) {
      messageEndRef.current.scrollIntoView();
      console.log("firstoooo");
    }
  }, [messages]);

  const scrp = () => {
    setTimeout(() => {
      // endRef?.current?.scrollIntoView({ behavior: "smooth" });
      // messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const fetchMore = () => {
    const scrollContainer = scrollableDivRef.current;
    const prevScrollHeight = scrollContainer?.scrollHeight;

    setIsFetchingMore(true);

    setPage((prev) => prev + 1);

    // Wait until messages are fetched and rendered
    setTimeout(() => {
      if (scrollContainer && prevScrollHeight) {
        const newScrollHeight = scrollContainer.scrollHeight;
        scrollContainer.scrollTop = newScrollHeight - prevScrollHeight;
      }
      setIsFetchingMore(false);
    }, 300); // m
  };

  console.log(load);

  // if (isMessagesLoading) {
  //   return (
  //     <div className="flex-1 flex flex-col overflow-auto">
  //       <ChatHeader />
  //       <MessageSkeleton />
  //       <MessageInput />
  //     </div>
  //   );
  // }

  return (
    <div className="flex-1 flex flex-col ">
      {load ? (
        <>
          <ChatHeader />
          <MessageSkeleton />
          <MessageInput />
        </>
      ) : (
        <>
          <ChatHeader />

          <div
            className="overflow-y-auto p-4 space-y-4"
            style={{
              height: "100%", // or whatever height you want
              display: "flex",
              // flexDirection: !hasPrevPage ? "column" : "column-reverse",
              flexDirection: "column-reverse",
            }}
            id="scrollableDiv"
            ref={scrollableDivRef}>
            <InfiniteScroll
              dataLength={totalMessages || messagesLoaded}
              next={fetchMore}
              style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
              inverse={true} //
              hasMore={hasNextPage}
              loader={
                page > 1 && isMessagesLoading ? (
                  <div className="text-center text-sm text-gray-400 py-2">
                    Loading...
                  </div>
                ) : null
              }
              scrollableTarget="scrollableDiv">
              <div>
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
                          message.senderId === authUser._id
                            ? "chat-end "
                            : "chat-start"
                        }`}>
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
                            message.senderId === authUser._id &&
                            "chat-bubble-primary"
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
                <div ref={messageEndRef} />
              </div>
            </InfiniteScroll>

            {/* <div ref={endRef} hidden /> */}
          </div>

          <MessageInput scrollToEnd={() => scrp()} />
        </>
      )}
    </div>
  );
};
export default ChatContainer;
