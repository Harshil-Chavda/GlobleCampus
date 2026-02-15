"use client";
import dynamic from "next/dynamic";

// These heavy components are lazy-loaded — they don't block initial page render
const Cursor = dynamic(() => import("./Cursor"), { ssr: false });
const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export default function ClientExtras() {
  return (
    <>
      <Cursor />
      <ChatBot />
    </>
  );
}
