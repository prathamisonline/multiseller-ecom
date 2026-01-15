import api from './api';

export interface RazorpayOrderResponse {
    success: boolean;
    data: {
        id: string; // Razorpay Order ID
        amount: number;
        currency: string;
        keyId: string; // Razorpay Key ID for frontend
    };
}

export interface PaymentVerificationData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
}

export const paymentService = {
    createRazorpayOrder: async (orderId: string): Promise<RazorpayOrderResponse> => {
        const response = await api.post('/payments/create-order', { orderId });
        return response.data.data || response.data;
    },

    verifyPayment: async (data: PaymentVerificationData): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/payments/verify', data);
        return response.data.data || response.data;
    },

    getPaymentStatus: async (orderId: string): Promise<{ success: boolean; data: { status: string } }> => {
        const response = await api.get(`/payments/status/${orderId}`);
        return response.data.data || response.data;
    },
};
