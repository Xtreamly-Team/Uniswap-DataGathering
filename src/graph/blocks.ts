import { BlockFields } from "./types.js"
import { callQuery } from "./utils.js"

const ethereumBlocksSubgraph = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'

export async function getBlockRawByTimestamp(timestamp_start: string, timestamp_end: string) {
    let queryString = `
      query blocks {
        blocks(
        where: {timestamp_gt: "${timestamp_start}", timestamp_lt: "${timestamp_end}"} 
        orderBy: number 
        orderDirection: desc
        ) {
            id
            timestamp
            gasUsed
            gasLimit
            number
            size
          }
        }
    `

    const json: any = await callQuery(queryString, ethereumBlocksSubgraph)
    return json.data
}

export async function parseBlocks(rawBlocksData: any) {
    let blocks: BlockFields[] = []
    rawBlocksData.blocks.forEach((rawBlock: any) => {
        blocks.push(rawBlock)
    })
    return blocks
}
