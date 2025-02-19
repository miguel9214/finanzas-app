import axios from 'axios';

export const useApi = async function (url, method = 'GET', payload = {}) { 
    url = `https://finanzasbackend-production.up.railway.app/api/${url}`;

    try {
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        const config = {
            method: method,
            url: url,
            data: payload,
            headers: headers,
        };

        const response = await axios(config);
        return response.data;

    } catch (error) {
        if (error.response) {
            throw error.response.data;
        } else {
            throw new Error("Error de conexión con el servidor");
        }
    }
};
