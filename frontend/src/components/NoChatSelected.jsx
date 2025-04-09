import React from "react";
import { HiMiniChatBubbleLeft } from "react-icons/hi2";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-5">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce">
              <HiMiniChatBubbleLeft className="w-8 h-8 text-primary " />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold border-base-content/10">
          Welcome to Chatty!
        </h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>

        <div class="bg-base-200/50 border border-base-content/25 text-base-content/70 p-4 rounded-2xl shadow-sm max-w-xl mx-auto mt-10">
          <h2 class=" font-semibold mb-2">💬 Want to test live chatting?</h2>
          <p class="mb-1 text-sm">
            You can log in as any of the listed users using the format below:
          </p>
          <p class="bg-base-300/80 border border-dashed border-base-content/20 rounded-md px-3 py-2 my-2 text-sm">
            <b>Email:</b> firstname.lastname@example.com
            <br />
            <b>Password:</b> firstname@123
          </p>
          <p class="text-xs">
            <em>
              Replace <code>firstname</code> and <code>lastname</code> with the
              actual name of the user you want to log in as.
            </em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
