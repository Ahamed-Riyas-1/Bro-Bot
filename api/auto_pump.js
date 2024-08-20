import express from "express";
import {do_auto_pump} from "../index.js";

const app = express();
const port = process.env.PORT || 3000;

app.get('/auto_pump', async (req, res) => {
    res.send('Price prediction started');
    try {
        await do_auto_pump(); // Ensure async function is awaited
    } catch (error) {
        console.error('Error in do_auto_pump:', error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
