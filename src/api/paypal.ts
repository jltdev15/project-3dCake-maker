import axios from 'axios';

// PayPal Sandbox Configuration
const PAYPAL_CLIENT_ID = 'AbnTUyrjf9HNGPd041AS7o7BI1jxhhQVB6pZG6cKJvUCgUciUjH-NHGVE-4fB9OZUTEamm_vdP_p49y2';
const PAYPAL_CLIENT_SECRET = import.meta.env.VITE_PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getAccessToken() {
  try {
    if (!PAYPAL_CLIENT_SECRET) {
      console.error('PayPal client secret is missing. Please check your .env file and ensure VITE_PAYPAL_CLIENT_SECRET is set.');
      throw new Error('PayPal integration is not properly configured. Please contact support.');
    }

    // Use btoa for browser-compatible base64 encoding
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data.access_token) {
      console.error('PayPal API did not return an access token');
      throw new Error('Unable to authenticate with PayPal. Please try again later.');
    }

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error_description || error.message;
      console.error('PayPal authentication error details:', errorMessage);
      throw new Error('Unable to process payment at this time. Please try again later.');
    }
    throw error;
  }
}

// Create PayPal order
export async function createPayPalOrder(amount: string, currency: string, description: string) {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount
          },
          description: description
        }],
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          brand_name: '3D Cake Maker',
          locale: 'en-PH',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `order_${Date.now()}` // Add unique request ID
        }
      }
    );

    if (!response.data.id) {
      throw new Error('Failed to create PayPal order: No order ID returned');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`PayPal order creation failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required for capture');
    }

    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `capture_${Date.now()}` // Add unique request ID
        }
      }
    );

    if (!response.data.id) {
      throw new Error('Failed to capture PayPal order: No capture ID returned');
    }

    return response.data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`PayPal order capture failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
} 