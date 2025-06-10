import { QRCodeSVG } from 'qrcode.react';

export const QRCode = () => {
  return (
    <div className="qr-code">
      <QRCodeSVG value={window.location.href} size={120} />
    </div>
  );
};