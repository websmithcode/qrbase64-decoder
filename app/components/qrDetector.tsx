import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export default function QRDetector() {
    const [image, setImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLCanvasElement>(null);
    const qrContent = useRef<string | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
    const [videoResolutions, setVideoResolution] = useState<[number, number]>([300, 300]);

    const getVideoDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setVideoDevices(videoDevices);
    };

    const switchCamera = async () => {

        const constraints = {
            video: {
                deviceId: videoDevices[currentDeviceIndex]?.deviceId
                    ? { exact: videoDevices[currentDeviceIndex].deviceId }
                    : undefined
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElementRef.current!.srcObject = stream;
        videoElementRef.current!.play();

        videoElementRef.current!.addEventListener("loadedmetadata", () => {
            setVideoResolution([videoElementRef.current!.videoWidth, videoElementRef.current!.videoHeight]);
        });
    };

    const getVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.play();
        videoElementRef.current = videoElement;


        videoElement.addEventListener("loadedmetadata", () => {
            setVideoResolution([videoElement.videoWidth, videoElement.videoHeight]);
            const drawFrame = () => {
                videoRef.current?.getContext("2d")?.drawImage(videoElement, 0, 0);
                requestAnimationFrame(drawFrame);
            };
            drawFrame();
        });
    };


    useEffect(() => {
        getVideoDevices();
        getVideo();
    }, []);

    useEffect(() => {
        switchCamera();
    }, [currentDeviceIndex]);

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
        const context = videoRef.current?.getContext("2d");
        if (context && videoElementRef.current && videoRef.current) {
            context.drawImage(videoElementRef.current, 0, 0);
            const imageData = context.getImageData(0, 0, videoRef.current.width, videoRef.current.height);
            setImage(videoRef.current.toDataURL("image/png"));
            decodeQRCode(imageData);
        } else {
            console.error("Video ref or context is not available.");
        }
    };

    const resetCamera = () => {
        setImage(null);
        qrContent.current = null;
        getVideo();
    };


    return (
        <div className="flex flex-col md:flex-row w-full h-full">
            <div className="flex flex-col items-center justify-center md:w-1/2 border border-gray-300 p-4">
                {image ? (
                    <>
                        <img src={image} className="w-full" />
                    </>
                ) : (
                    <>
                        <canvas ref={videoRef} height={videoResolutions[1]} width={videoResolutions[0]} className="w-full transform scale-x-[-1]" />
                    </>
                )}
                <div className="flex gap-2">
                    {image && (
                        <button onClick={resetCamera} className="mt-4 p-2 bg-red-500 text-white rounded">
                            Reset
                        </button>
                    )}
                    {!image && (
                        <button onClick={takeScreenshot} className="mt-4 p-2 bg-blue-500 text-white rounded">
                            Shot
                        </button>
                    )}
                    <button onClick={() => setCurrentDeviceIndex((currentDeviceIndex + 1) % videoDevices.length)} className="mt-4 p-2 bg-green-500 text-white rounded">
                        Switch Camera
                    </button>
                </div>
            </div>
            <div className="md:w-1/2 p-4 border border-gray-300 h-full">
                {qrContent.current && <pre>{atob(qrContent.current)}</pre>}
                {!qrContent.current && <p>No QR code found</p>}
            </div>
        </div>
    );
}