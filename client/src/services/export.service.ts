import api from './api';

export const exportService = {
    // Order Exports (Excel)
    exportOrders: async () => {
        const response = await api.get('/exports/seller/orders', {
            responseType: 'blob', // Important for file downloads
        });

        // Create a link and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `orders_export_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Product Exports (Excel)
    exportProducts: async () => {
        const response = await api.get('/exports/seller/products', {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `products_export_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Shipping Label (PDF)
    downloadShippingLabel: async (orderId: string) => {
        const response = await api.get(`/shipping/label/${orderId}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `shipping_label_${orderId.slice(-8).toUpperCase()}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Also open in new tab for direct printing
        window.open(url, '_blank');
    },
};
