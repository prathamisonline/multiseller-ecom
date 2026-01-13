
import Razorpay from 'razorpay';

/**
 * Razorpay Instance Configuration
 * 
 * This creates a singleton instance of the Razorpay SDK
 * that can be imported and used across the application.
 * 
 * Test Mode:
 * - Uses test API keys (rzp_test_*)
 * - No real money is charged
 * - Can simulate different payment scenarios
 * 
 * Production:
 * - Replace with live keys (rzp_live_*)
 * - Real transactions will occur
 */
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export default razorpayInstance;
