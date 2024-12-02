import type { MetaFunction } from "@remix-run/node";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export default function Index() {
  const [image, setImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrContent = useRef<string | null>(null);

  const getVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  useEffect(() => {
    getVideo();
  }, []);

  const decodeQRCode = (imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      console.log("QR Code Data:", code.data);
      qrContent.current = code.data;
    } else {
      console.log("No QR code found.");
    }
  };

  const takeScreenshot = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (context) {
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0);
        context.restore();
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/png"));
        decodeQRCode(imageData);
      } else {
        console.error("Failed to get canvas context.");
      }
    }
  };

  const resetCamera = () => {
    setImage(null);
    qrContent.current = null;
    getVideo();
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:h-screen">
      <div className="flex flex-col items-center justify-center md:w-1/2 border border-gray-300 p-4">
        {image ? (
          <>
            <img src={image} className="w-full" />
            <button onClick={resetCamera} className="mt-4 p-2 bg-red-500 text-white rounded">
              Reset
            </button>
          </>
        ) : (
          <>
            <video ref={videoRef} autoPlay className="w-full transform scale-x-[-1]" />
            <button onClick={takeScreenshot} className="mt-4 p-2 bg-blue-500 text-white rounded">
              Shot
            </button>
          </>
        )}
      </div>
      <div className="md:w-1/2 p-4 border border-gray-300">
        {qrContent.current && <pre>{atob(qrContent.current)}</pre>}
        {!qrContent.current && <p>No QR code found</p>}
      </div>
    </div>
  );
}
