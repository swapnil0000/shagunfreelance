import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;

if (keyId && keySecret && !keyId.startsWith('your_')) {
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
} else {
  console.log('Razorpay not configured — payment features will be unavailable');
}

export default razorpay;
