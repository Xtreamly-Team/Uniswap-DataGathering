import { ethers } from 'ethers';
import { computePoolAddress } from '@uniswap/v3-sdk';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json' assert { type: 'json' };
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json' assert { type: 'json' };
import { POOL_FACTORY_CONTRACT_ADDRESS, QUOTER_CONTRACT_ADDRESS, TOKENS, } from './constants.js';
import { getProvider } from './providers.js';
import { toReadableAmount, fromReadableAmount } from './conversion.js';

export async function quote(tokenInAddress, amountIn, decimalIn, tokenOutAddress, decimalOut, fee) {
    const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, Quoter.abi, getProvider());
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(tokenInAddress, tokenOutAddress, fee, fromReadableAmount(amountIn, decimalIn).toString(), 0);
    return toReadableAmount(quotedAmountOut, decimalOut);
}

export function getPoolAddress(tokenIn, tokenOut, fee) {
    const poolAddress = computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: tokenIn,
        tokenB: tokenOut,
        fee: fee,
    });
    return poolAddress
}

async function getPoolConstants(tokenIn, tokenOut, userFee) {
    const poolAddress = getPoolAddress(tokenIn, tokenOut, userFee)
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI.abi, getProvider());
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
    ]);
    return {
        poolAddress,
        token0,
        token1,
        fee: fee,
    };
}

export const handler = async (event, context) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const tokenPair = event['tokenPair']
    const blockNumber = event['blockNumber']
    const fee = event['fee']
    const [token0, token1] = tokenPair.split('-')
    const tokenIn = TOKENS[token0]
    const tokenOut = TOKENS[token1]
    const poolConstants = await getPoolConstants(tokenIn, tokenOut, fee)
    const res = {
        blockNumber: blockNumber,
        tokenPair: tokenPair,
        poolAddress: poolConstants.poolAddress,
        tokenInAddress: tokenIn.address,
        tokenInDecimals: tokenIn.decimals,
        tokenOutAddress: tokenOut.address,
        tokenOutDecimals: tokenOut.decimals,
        fee: poolConstants.fee
    }
    console.log(JSON.stringify(res, null, 2))
    return res
};
