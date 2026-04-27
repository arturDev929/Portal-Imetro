import axios from "axios"

// Qualquer arquivo .jsx
const apiUrl = process.env.REACT_APP_API_URL
const apiKey = process.env.REACT_APP_API_KEY

export const api = {
    get(url) {
        return axios.get(`${apiUrl}${url}`, {
            timeout: 8000, // 8 segundos
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
    },

    put(url, data) { 
        return axios.put(`${apiUrl}${url}`, data, { 
            timeout: 8000,
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
    },

    post(url, data) { 
        return axios.post(`${apiUrl}${url}`, data, { 
            timeout: 8000,
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
    },

    delete(url) {
        return axios.delete(`${apiUrl}${url}`, {
            timeout: 8000,
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
    }
}