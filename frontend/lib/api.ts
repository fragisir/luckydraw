import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Payment APIs
export const createCheckoutSession = async (ticketData: {
    name: string;
    email: string;
    selectedNumbers: number[];
}) => {
    const response = await api.post('/api/payment/create-checkout', ticketData);
    return response.data;
};

export const verifyPayment = async (sessionId: string) => {
    const response = await api.get(`/api/payment/verify/${sessionId}`);
    return response.data;
};

// Ticket APIs
export const searchTicket = async (ticketNumber: string) => {
    const response = await api.get(`/api/tickets/search/${ticketNumber}`);
    return response.data;
};

export const getAllTickets = async () => {
    const response = await api.get('/api/tickets');
    return response.data;
};

export const getTicketStats = async () => {
    const response = await api.get('/api/tickets/stats');
    return response.data;
};

// Admin APIs
export const runDraw = async () => {
    const response = await api.post('/api/admin/run-draw');
    return response.data;
};

export const getDrawStatus = async () => {
    const response = await api.get('/api/admin/status');
    return response.data;
};

// Public APIs
export const getDrawHistory = async () => {
    const response = await api.get('/api/public/draws');
    return response.data;
};

export const getDrawDetails = async (drawId: string) => {
    const response = await api.get(`/api/public/draws/${drawId}`);
    return response.data;
};

export const getPublicDrawStatus = async () => {
    const response = await api.get('/api/public/status');
    return response.data;
};

// Draw Management
export const startSales = async () => {
    const response = await api.post('/api/admin/start-draw');
    return response.data;
};

export const stopSales = async () => {
    const response = await api.post('/api/admin/stop-draw');
    return response.data;
};

export const createDraw = async (data?: any) => {
    const response = await api.post('/api/admin/create-draw', data);
    return response.data;
};

export const getAllDraws = async () => {
    const response = await api.get('/api/admin/draws');
    return response.data;
};

export const runSpecificDraw = async (drawId: string) => {
    const response = await api.post(`/api/admin/run-draw/${drawId}`);
    return response.data;
};

export const getDrawAnalytics = async (drawId: string) => {
    const response = await api.get(`/api/admin/analytics/${drawId}`);
    return response.data;
};

export default api;
