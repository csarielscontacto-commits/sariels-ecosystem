import crypto from 'crypto';

export function verifyNowpaymentsSignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');
  return digest === signature;
}
