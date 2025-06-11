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
        // 30px for padding (15px on each side), max 215px for QR (245px - 30px padding)
        const newSize = Math.min(containerWidth - 30, 215);
        setQrSize(newSize > 0 ? newSize : 120);
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
