import { PoolData, PoolFields } from "./types.js"
import { callQuery, get2DayChange } from "./utils.js"

const uniswapV3Subgraph = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'

export async function getPoolsRawData(block: number | undefined, pools: string[]) {
    let poolString = `[`
    pools.map((address) => {
        return (poolString += `"${address}",`)
    })
    poolString += ']'
    const queryString =
        `
    query pools {
      pools(where: {id_in: ${poolString}},` +
        (block ? `block: {number: ${block}} ,` : ``) +
        ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        feeTier
        liquidity
        sqrtPrice
        tick
        token0 {
            id
            symbol 
            name
            decimals
            derivedETH
        }
        token1 {
            id
            symbol 
            name
            decimals
            derivedETH
        }
        token0Price
        token1Price
        volumeUSD
        volumeToken0
        volumeToken1
        txCount
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
      }
      bundles (where: {id: "1"}) {
        ethPriceUSD
      }
    }
    `

    const json: any = await callQuery(queryString, uniswapV3Subgraph)
    return json.data
}


export async function parsePools(rawGraphData: any) {
    const res = rawGraphData?.pools
    ? rawGraphData.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
    return res
}

export async function formatPools(poolAddresses: [string], rawData: any, rawData24: any, rawData48: any, rawDataWeek: any) {
    const res = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsePools(rawData)[address]
    const oneDay: PoolFields | undefined = parsePools(rawData24)[address]
    const twoDay: PoolFields | undefined = parsePools(rawData48)[address]
    const week: PoolFields | undefined = parsePools(rawDataWeek)[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]

    const volumeUSDWeek =
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
        ? parseFloat(current.volumeUSD)
        : 0


  const ethPriceUSD = rawData?.bundles?.[0]?.ethPriceUSD ? parseFloat(rawData?.bundles?.[0]?.ethPriceUSD) : 0

    // Hotifx: Subtract fees from TVL to correct data while subgraph is fixed.
    /**
     * Note: see issue desribed here https://github.com/Uniswap/v3-subgraph/issues/74
     * During subgraph deploy switch this month we lost logic to fix this accounting.
     * Grafted sync pending fix now.
     */
    const feePercent = current ? parseFloat(current.feeTier) / 10000 / 100 : 0
    const tvlAdjust0 = current?.volumeToken0 ? (parseFloat(current.volumeToken0) * feePercent) / 2 : 0
    const tvlAdjust1 = current?.volumeToken1 ? (parseFloat(current.volumeToken1) * feePercent) / 2 : 0
    const tvlToken0 = current ? parseFloat(current.totalValueLockedToken0) - tvlAdjust0 : 0
    const tvlToken1 = current ? parseFloat(current.totalValueLockedToken1) - tvlAdjust1 : 0
    let tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0

    const tvlUSDChange =
      current && oneDay
        ? ((parseFloat(current.totalValueLockedUSD) - parseFloat(oneDay.totalValueLockedUSD)) /
            parseFloat(oneDay.totalValueLockedUSD === '0' ? '1' : oneDay.totalValueLockedUSD)) *
          100
        : 0

    // Part of TVL fix
    const tvlUpdated = current
      ? tvlToken0 * parseFloat(current.token0.derivedETH) * ethPriceUSD +
        tvlToken1 * parseFloat(current.token1.derivedETH) * ethPriceUSD
      : undefined
    if (tvlUpdated) {
      tvlUSD = tvlUpdated
    }

    const feeTier = current ? parseInt(current.feeTier) : 0

    if (current) {
      accum[address] = {
        address,
        feeTier,
        liquidity: parseFloat(current.liquidity),
        sqrtPrice: parseFloat(current.sqrtPrice),
        tick: parseFloat(current.tick),
        token0: {
          address: current.token0.id,
          // name: formatTokenName(current.token0.id, current.token0.name, activeNetwork),
          name: current.token0.name,
          // symbol: formatTokenSymbol(current.token0.id, current.token0.symbol, activeNetwork),
          symbol: current.token0.symbol,
          decimals: parseInt(current.token0.decimals),
          derivedETH: parseFloat(current.token0.derivedETH),
        },
        token1: {
          address: current.token1.id,
          // name: formatTokenName(current.token1.id, current.token1.name, activeNetwork),
          // symbol: formatTokenSymbol(current.token1.id, current.token1.symbol, activeNetwork),
          name: current.token1.name,
          symbol: current.token1.symbol,
          decimals: parseInt(current.token1.decimals),
          derivedETH: parseFloat(current.token1.derivedETH),
        },
        token0Price: parseFloat(current.token0Price),
        token1Price: parseFloat(current.token1Price),
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        tvlUSD,
        tvlUSDChange,
        tvlToken0,
        tvlToken1,
      }
    }

    return accum
  }, {})

    return res
}


// export async function get_pools() {
//     const query = `query pools {
//     pools(
//         orderBy: volumeUSD, orderDirection: desc, subgraphError: allow
//     ) {
//         id
//         feeTier
//         liquidity
//         sqrtPrice
//         token0 {
//         tick
//             id
//             symbol 
//             name
//             decimals
//             derivedETH
//         }
//         token1 {
//             id
//             symbol 
//             name
//             decimals
//             derivedETH
//         }
//         token0Price
//         token1Price
//         volumeToken0
//         volumeToken1
//         volumeUSD
//         untrackedVolumeUSD
//         txCount
//         totalValueLockedToken0
//         totalValueLockedToken1
//         totalValueLockedUSD
//         totalValueLockedUSDUntracked
//         totalValueLockedETH
//       }
//       bundles(where: {id: "1"}) {
//         ethPriceUSD
//       }
//     }`
//     const json: any = await query_graph(query)
//     console.log(json.data.pools.length)
//     return json.data.pools
// }

// export async function get_pool(pool_address: string) {
//     const query = `
//     {
//         pools(where: {id: "${pool_address}"}) {
//             id
//             token0 {
//                 id
//                 symbol
//                 name
//             }
//             token1 {
//                 id
//                 symbol
//                 name
//             }
//             feeTier
//             liquidity
//             sqrtPrice
//             tick
//             tickList {
//                 id
//                 liquidityNet
//                 liquidityGross
//                 tick
//             }
//         }
//     }
//     `
//     const json: any = await query_graph(query)
//     return json.data.pools[0]
// }
