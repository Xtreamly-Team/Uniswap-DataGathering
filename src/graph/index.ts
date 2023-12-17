import { getBlockRawByTimestamp, parseBlocks } from "./blocks.js";
import { getPoolsRawData, parsePools, formatPools } from "./pools.js";

async function main() {
    const rawBlocks = await getBlockRawByTimestamp('1702813923', '1702815923')
    const blocks = await parseBlocks(rawBlocks)
    console.log(blocks)
    // const poolAddresses = ['0x4e68ccd3e89f51c3074ca5072bbac773960dfa36']
    // const rawData = await getPoolsRawData(undefined, poolAddresses)
    // const parsedData = await parsePools(rawData)
    // console.log(parsedData)
}

main()
