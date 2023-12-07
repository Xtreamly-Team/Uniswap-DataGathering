import { quote } from "./quote.js";

setInterval(async () => {
    console.log(
        JSON.stringify({
            timestamp: Date.now(),
            price: +(await quote())
        })
    )

}, 1000);

