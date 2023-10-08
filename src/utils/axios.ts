import axios from 'axios';

// Function to create axios instance

export const createInstance = (url: string) => {
  const instance = axios.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};
export default createInstance;
