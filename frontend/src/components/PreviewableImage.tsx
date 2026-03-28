import { useCallback, useRef } from "react";
import "photoswipe/style.css";

export interface PreviewableImageProps {
    alt: string;
    className?: string;
    src: string;
    wrapperClassName?: string;
}

export function PreviewableImage({
    alt,
    className = "",
    src,
    wrapperClassName = "",
}: Readonly<PreviewableImageProps>) {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const handlePreview = useCallback(async () => {
        const { default: PhotoSwipe } = await import("photoswipe");
        const image = imageRef.current;
        const width = image?.naturalWidth || window.innerWidth;
        const height = image?.naturalHeight || window.innerHeight;

        const viewer = new PhotoSwipe({
            dataSource: [
                {
                    alt,
                    element: image ?? undefined,
                    height,
                    src,
                    width,
                },
            ],
            bgOpacity: 0.88,
            closeOnVerticalDrag: true,
            escKey: true,
            index: 0,
            initialZoomLevel: "fit",
            maxZoomLevel: 4,
            padding: { top: 24, right: 24, bottom: 24, left: 24 },
            secondaryZoomLevel: 1.8,
            showHideAnimationType: "zoom",
            wheelToZoom: true,
        });

        viewer.init();
    }, [alt, src]);

    return (
        <button
            type="button"
            onClick={() => void handlePreview()}
            className={`block w-full cursor-zoom-in bg-transparent p-0 text-left ${wrapperClassName}`}
            aria-label={alt || "预览图片"}
        >
            <img ref={imageRef} src={src} alt={alt} className={className} />
        </button>
    );
}
