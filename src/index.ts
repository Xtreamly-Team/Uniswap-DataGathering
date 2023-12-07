import { quote } from "./quote.js";

setInterval(async () => {
    
    console.log({
        timestamp: Date.now(),
        price: await quote()
    })
}, 1000);

