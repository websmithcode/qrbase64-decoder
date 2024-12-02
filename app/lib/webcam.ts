import EventEmitter from "./EventEmitter";

export default class Webcam extends EventEmitter {
    constructor(
        private resolution: [number, number] = [300, 300],
        public devices: MediaDeviceInfo[] = [],
    ) {
        super();
    }

    async init(callback: () => void = () => { }) {
        this.devices = await Webcam.getDevices();
        this.dispatchEvent("devicesLoaded", this.devices);

        this.dispatchEvent("init", this);
        callback();
    }


    // onDeviceChange(deviceId: string) {
    //     this.selectedDeviceId = deviceId;

    //     this.getStream().then(stream => {
    //         const videoElement = document.createElement("video");
    //         videoElement.srcObject = stream;
    //         videoElement.addEventListener("loadedmetadata", () => {
    //             this.resolution = [videoElement.videoWidth, videoElement.videoHeight];
    //             videoElement.remove();
    //         });
    //     });
    // }

    static async getDevices() {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === "videoinput");
            return videoDevices;
        } catch (error) {
            console.error("Error accessing webcams:", error);
            return [];
        }
    }


    async getStream(deviceId: string | null = null) {
        const selectedDeviceId = deviceId ?? this.selectedDeviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                facingMode: "environment",
            }
        });

        return stream;
    }
}
