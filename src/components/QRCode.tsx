import { QRCodeSVG } from 'qrcode.react';

export const QRCode = () => {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.href;
  return (
    <div className="qr-code">
      <QRCodeSVG value={appUrl} size={120} />
    </div>
  );
};
