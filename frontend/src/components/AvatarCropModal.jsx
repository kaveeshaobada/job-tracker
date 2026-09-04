import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check } from "lucide-react";

function getCroppedImage(imageSrc, croppedAreaPixels, maxSizeBytes) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            // Compress iteratively until under maxSizeBytes
            let quality = 0.92;
            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Failed to process image"));
                        if (blob.size <= maxSizeBytes || quality <= 0.3) {
                            resolve(blob);
                        } else {
                            quality -= 0.1;
                            tryCompress();
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            tryCompress();
        };
        image.onerror = reject;
    });
}

function AvatarCropModal({ imageSrc, onClose, onCropped }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setProcessing(true);
        try {
            const blob = await getCroppedImage(imageSrc, croppedAreaPixels, 2 * 1024 * 1024); // 2MB target
            onCropped(blob);
        } catch {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-surface dark:bg-surface-dark rounded-xl overflow-hidden w-full max-w-md">
                <div className="relative h-80 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <label className="text-xs text-muted dark:text-muted-dark block mb-1">Zoom</label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-accent"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-elevated dark:bg-elevated-dark hover:opacity-80 text-sm font-medium"
                        >
                            <X size={14} /> Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium disabled:opacity-50"
                        >
                            <Check size={14} /> {processing ? "Processing..." : "Use Photo"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AvatarCropModal;