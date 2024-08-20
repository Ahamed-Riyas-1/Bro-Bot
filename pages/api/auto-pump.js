import {do_auto_pump} from "../../index";

export default async function handler(req, res) {
    try {
        await do_auto_pump();
        res.status(200).json({ message: 'Auto-pump executed successfully' });
    } catch (error) {
        console.error('Error during auto-pump:', error);
        res.status(500).json({ error: 'Auto-pump failed' });
    }
}
