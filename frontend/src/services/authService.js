import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/auth';

export const googleSignup = async (token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/google`, { token });
        return response.data;
    } catch (error) {
        console.error("Google Signup Error:", error);
        throw error;
    }
};
