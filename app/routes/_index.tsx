import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import QRDetector from "~/components/qrDetector";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <div className="flex flex-col items-center justify-center border border-gray-300 p-4 w-full h-full">
      <button onClick={() => {
        setStarted(true);
      }} className="text-2xl p-4 bg-blue-500 text-white rounded">
        Start
      </button>
    </div>
  }

  return <QRDetector />
}
