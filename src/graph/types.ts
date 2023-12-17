export interface PoolData {
    // basic token info
    address: string
    feeTier: number

    token0: {
        name: string
        symbol: string
        address: string
        decimals: number
        derivedETH: number
    }

    token1: {
        name: string
        symbol: string
        address: string
        decimals: number
        derivedETH: number
    }

    // for tick math
    liquidity: number
    sqrtPrice: number
    tick: number

    // volume
    volumeUSD: number
    volumeUSDChange: number
    volumeUSDWeek: number

    // liquidity
    tvlUSD: number
    tvlUSDChange: number

    // prices
    token0Price: number
    token1Price: number

    // token amounts
    tvlToken0: number
    tvlToken1: number
}


// The following is the type definition for the data returned by the subgraph.
export interface PoolFields {
    id: string
    feeTier: string
    liquidity: string
    sqrtPrice: string
    tick: string
    token0: {
        id: string
        symbol: string
        name: string
        decimals: string
        derivedETH: string
    }
    token1: {
        id: string
        symbol: string
        name: string
        decimals: string
        derivedETH: string
    }
    token0Price: string
    token1Price: string
    volumeUSD: string
    volumeToken0: string
    volumeToken1: string
    txCount: string
    totalValueLockedToken0: string
    totalValueLockedToken1: string
    totalValueLockedUSD: string
}

export interface BlockFields {
    id: string
    timestamp: string
    gasUsed: string
    gasLimit: string
    number: string
    size: string
}
