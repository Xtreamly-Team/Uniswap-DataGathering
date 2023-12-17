import { initializeInflux, Point, type WriteApi } from "./influx.js";
import { quote } from "./quote.js";
import { v4 as uuidv4 } from 'uuid';

class ExchangeStatus {
    constructor(
        public id: string = uuidv4(),
        public exchange: string,
        public token_pair: string,
        public price: number,
        public poolAddress: string,
        public fee: number) { }
}

async function saveExchangeStatus(api: WriteApi, exchangeStatus: ExchangeStatus) {
    const point = new Point(exchangeStatus.token_pair)
        .tag('exchange', exchangeStatus.exchange)
        .stringField('id', exchangeStatus.id)
        .floatField('price', exchangeStatus.price)
        .floatField('fee', exchangeStatus.fee)

    api.writePoint(point)
}
const main = async () => {
    // const writeApi = await initializeInflux()
    // const exchangeStatus = ExchangeStatus
    // setInterval(async () => {
    //     console.log(
    //         JSON.stringify({
    //             timestamp: Date.now(),
    //             price: +(await quote())
    //         })
    //     )
    //
    // }, 1000);
}
