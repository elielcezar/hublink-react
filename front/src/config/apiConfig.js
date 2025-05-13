const getApiBaseUrl = async () => {
  // Your existing API URL logic
  return 'http://localhost:3002'; // Replace with your actual API base URL
};

// Add a synchronous version that returns the URL directly
const getApiBaseUrlSync = () => {
  return 'http://localhost:3002'; // Replace with your actual API base URL
};

export { getApiBaseUrl, getApiBaseUrlSync };
export default getApiBaseUrlSync;