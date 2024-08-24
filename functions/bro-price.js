import {fetchBroPrice} from "../index.js";

export async function handler(event, context) {
    await fetchBroPrice()
}
