import {do_auto_pump} from "../index.js";

export default async (req, res) => {
    if (req.method === 'GET') {
        res.send('Price prediction started');
        try {
            await do_auto_pump(); // Ensure do_auto_pump is defined and implemented
        } catch (error) {
            console.error('Error in do_auto_pump:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
