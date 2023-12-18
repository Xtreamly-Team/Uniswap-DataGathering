import { getBlockRangeForTimestamps, getBlockRaw, getBlocksForTimestamps, getLastBlocks, getLastBlocksRaw, parseAndFormatBlock } from "./blocks.js";
import { getPoolsForBlock } from "./pools.js";
import { saveToFile, useDeltaTimestamps } from "./utils.js";
import { EthUsdtPoolAddresses } from "../constants.js";
import { PoolData } from "./types.js";

async function getPoolsAtBlockNumber(blockNumber: number, poolAddresses: string[]) {
    const rawBlockData = await getBlockRaw(blockNumber)
    const block = parseAndFormatBlock(rawBlockData)
    if (!block) {
        console.log(`Could not get block ${blockNumber}`)
        return null
    }
    const timestamps = useDeltaTimestamps(block.timestamp)
    const [last24HourBlock, last48HourBlock, lastWeekBlock] = await getBlocksForTimestamps(timestamps)

    const res = await getPoolsForBlock(block, last24HourBlock, last48HourBlock, lastWeekBlock, poolAddresses)

    return res

}

async function getPoolsByTimestampRange(timestamp_start: number, timestamp_end: number, poolAddresses: string[]) {
    const blocks = await getBlockRangeForTimestamps(timestamp_start, timestamp_end)
    const res: { [blockNumber: number]: { [address: string]: PoolData } } = {}
    for (const block of blocks) {
        try {
            const pools = await getPoolsAtBlockNumber(block.number, poolAddresses)
            res[block.number] = pools
            saveToFile(res, `./data/pools.json`)
        } catch (error) {
            console.log(error)
        }
    }
    return res
}

async function getPoolsByBlockRange(block_start: number, block_end: number, poolAddresses: string[]) {
    const res: { [blockNumber: number]: { [address: string]: PoolData } } = {}
    for (let blockNumber = block_start; blockNumber <= block_end; blockNumber++) {
        const progrss = Math.floor(((blockNumber - block_start) * 100) / (block_end - block_start))

        console.log(`Getting block ${blockNumber}: ${progrss}%`)
        try {
            const pools = await getPoolsAtBlockNumber(blockNumber, poolAddresses)
            res[blockNumber] = pools
            saveToFile(res, `./data/pools.json`)
        } catch (error) {
            console.log(error)
        }
    }
    return res
}


async function main() {
    const lastIndexedBlock = (await getLastBlocks(5))[2]
    const res = await getPoolsByBlockRange(lastIndexedBlock.number - 1440, lastIndexedBlock.number, EthUsdtPoolAddresses)
    console.log("Complete")
}

main()
