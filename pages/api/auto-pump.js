// import handler from './pages/api/auto-pump';

// Simulate an HTTP request to your API handler
import handler from "../../index.js";

async function triggerAutoPump() {
    const req = {}; // Mock request object
    const res = {
        status: (statusCode) => ({
            json: (responseBody) => console.log('Response:', responseBody),
        }),
    }; // Mock response object

    try {
        await handler(req, res);
    } catch (error) {
        console.error('Error executing handler:', error);
    }
}

// Call the function to trigger the auto-pump
triggerAutoPump();
