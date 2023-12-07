import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { AAVE_TOKEN, USDT_TOKEN, WBTC_TOKEN, WETH_TOKEN } from './constants.js'

// Inputs that configure this example to run
export interface ExampleConfig {
  rpc: {
    mainnet: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  rpc: {
    mainnet: 'https://mainnet.infura.io/v3/989a33ef7f114f45b58346df500b9917',
  },
  tokens: {
    in: WETH_TOKEN,
    out: USDT_TOKEN,
    amountIn: 1,
    poolFee: FeeAmount.MEDIUM,
  },
}
