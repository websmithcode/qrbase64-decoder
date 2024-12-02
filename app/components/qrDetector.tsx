import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import Webcam from "~/lib/webcam";

interface ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export default function QRDetector() {
    const [webcamIsInitialized, setWebcamIsInitialized] = useState(false);

    const [image, setImage] = useState<string | null>(null);

    const [webcam] = useState<Webcam>(new Webcam());
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [videoResolutions, setVideoResolutions] = useState<[number, number]>([300, 300]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const qrContent = useRef<string | null>(null);



    useEffect(() => {
        webcam.init(async () => {
            setWebcamIsInitialized(true)
            setDeviceId(webcam.devices[0].deviceId);
        });
    }, []);

    useEffect(() => {
        setDeviceId(deviceId);
        playVideo();
    }, [deviceId]);


    const playVideo = async () => {
        const stream = await webcam.getStream(deviceId);

        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.play();
        videoElementRef.current = videoElement;

        videoElementRef.current?.addEventListener("loadedmetadata", () => {
            setVideoResolutions([videoElementRef.current?.videoWidth ?? 0, videoElementRef.current?.videoHeight ?? 0]);
        });


        videoElement.addEventListener("loadedmetadata", () => {
            const drawFrame = () => {
                canvasRef.current?.getContext("2d")?.drawImage(videoElement, 0, 0);
                requestAnimationFrame(drawFrame);
            };
            drawFrame();
        });
    };



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
        const context = canvasRef.current?.getContext("2d");
        if (context && videoElementRef.current && canvasRef.current) {
            context.drawImage(videoElementRef.current, 0, 0);
            const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            setImage(canvasRef.current.toDataURL("image/png"));
            decodeQRCode(imageData);
        } else {
            console.error("Video ref or context is not available.");
        }
    };

    const resetCamera = () => {
        setImage(null);
        qrContent.current = null;
        playVideo();
    };

    if (!webcamIsInitialized) return <div>Loading webcam devices...</div>;

    return (
        <div className="flex flex-col md:flex-row w-full h-full">
            <div className="flex flex-col items-center justify-center md:w-1/2 border border-gray-300 p-4">
                {image ? (
                    <>
                        <img src={image} className="w-full" />
                    </>
                ) : (
                    <>
                        <canvas ref={canvasRef} height={videoResolutions[1]} width={videoResolutions[0]} className="w-full" />
                    </>
                )}
                <div className="flex gap-2 mt-4 justify-center">
                    <select
                        className="w-full p-2 border border-gray-300 rounded "
                        id="device"
                        onChange={e => setDeviceId(e.target.value)}
                        value={deviceId ?? ""}
                    >
                        {webcam.devices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                        ))}
                    </select>
                    {image && (
                        <button onClick={resetCamera} className="p-2 bg-red-500 text-white rounded">
                            Reset
                        </button>
                    )}
                    {!image && (
                        <button onClick={takeScreenshot} className="p-2 bg-blue-500 text-white rounded">
                            Shot
                        </button>
                    )}
                </div>
            </div>
            <div className="md:w-1/2 p-4 border border-gray-300 h-full">
                {qrContent.current && <pre>{atob(qrContent.current)}</pre>}
                {!qrContent.current && <p>No QR code found</p>}
            </div>
        </div>
    );
}