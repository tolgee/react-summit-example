import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

export const QRCode = () => {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.href;
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(120);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // 40px for padding (20px on each side), max 205px for QR (245px - 40px padding)
        const newSize = Math.min(containerWidth - 40, 205);
        setQrSize(newSize > 0 ? newSize : 0);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="qr-code-container">
      <div className="qr-code" ref={containerRef}>
        <QRCodeSVG value={appUrl} size={qrSize} />
      </div>
    </div>
  );
};
