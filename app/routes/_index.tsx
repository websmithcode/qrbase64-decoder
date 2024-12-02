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
  const [platformOS, setPlatformOS] = useState<string | null>(null);

  const detectOS = () => {
    const userAgent = window.navigator.userAgent,
      platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
      macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (/Linux/.test(platform)) {
      os = 'Linux';
    }
    return os;
  };

  useEffect(() => {
    const os = detectOS();
    setPlatformOS(os);

    console.log("platformOS", os);
    if (os !== "iOS") {
      setStarted(true);
    }
  }, []);

  return (
    <>
      {platformOS === "iOS" && !started && (
        <div className="flex flex-col items-center justify-center border border-gray-300 p-4 w-full h-full">
          <button onClick={() => {
            setStarted(true);
          }} className="text-2xl p-4 bg-blue-500 text-white rounded">
            Open Camera
          </button>
        </div>
      )}

      {started && (
        <QRDetector />
      )}
    </>
  );
}
