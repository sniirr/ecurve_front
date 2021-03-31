import daiImg from 'images/dai.png'
import usdcImg from 'images/usdc.svg'
import usdtImg from 'images/usdt.svg'
import _ from "lodash";

export const ENVIRONMENT = 'development'

export const CHAIN = {
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    rpcEndpoints: [{
        host: 'api.kylin.alohaeos.com',
        port: 443,
        protocol: 'https'
    }]
}

export const ECURVE_API_URL = 'https://iit9dyqn3h.execute-api.us-east-1.amazonaws.com'

export const BLOCKS_URL = 'kylin.bloks.io'

export const MAIN_TOKEN = 'CURVE'
export const DAD_TOKEN = 'DAD'
export const WEIGHT_TOKEN = 'veCRV'

export const CONTRACTS = {
    curveToken: 'curvetoken22',     // ecurvetoken1

    curve3Pool: 'eoscurvecon1',     // ecurve3pool1
    LPDeposit: 'lpstakecon11',      // depositlp111
    LPTokens: 'curvetoken11',       // ecurvelp1111
    curveLock: 'curvelockcon',      // ecrvgovlock1
    dadLock: 'dadgovernanc',        // dadgovernanc

    claimCurveLP: 'curveissue11',   // ecrvclaim111
    claimCurveDAD: 'dadcrvlock11',  // dadlockecrv1
}

export const POOLS = {
    "3POOL": {
        name: "3Pool",
        poolContract: CONTRACTS.curve3Pool,
        tokens: ["USDC", "DAI", "USDT"],
        lpTokenSymbol: 'EPOOL', // TRIPOOL
    }
}

export const LP_TOKENS = _.map(POOLS, 'lpTokenSymbol')

export const TOKENS = {
    USDC: {
        symbol: 'USDC',
        contract: CONTRACTS.LPTokens,
        precision: 6,
        icon: usdcImg,
    },
    DAI: {
        symbol: 'DAI',
        contract: CONTRACTS.LPTokens,
        precision: 6,
        icon: daiImg,
    },
    USDT: {
        symbol: 'USDT',
        contract: 'curvetoken33',
        precision: 4,
        icon: usdtImg,
    },
    EPOOL: {
        symbol: 'EPOOL',
        contract: CONTRACTS.LPTokens,
        stakeContract: CONTRACTS.LPDeposit,
        stakeTable: 'stake',
        precision: 6,
    },

    CURVE: {
        symbol: 'CURVE',
        contract: 'curvetoken22',
        lockContract: CONTRACTS.curveLock,
        lockInfoTable: 'lockinfo',
        unlockInfoTable: 'unlockclaim',
        claimContract: CONTRACTS.claimCurveLP,
        claimTable: 'claimtab',
        precision: 6,

        lockPayload: (lockPeriod, quantity) => ({quantity, maturityinhr: lockPeriod}),
    },


    DAD: {
        symbol: 'DAD',
        contract: 'dadtoken1111',
        stakeContract: CONTRACTS.dadLock,
        lockContract: CONTRACTS.dadLock,
        lockInfoTable: 'lockinfos',
        claimContract: CONTRACTS.claimCurveDAD,
        unlockInfoTable: 'unlockclaim',
        claimTable: 'claimtab',
        stakeTable: 'stake2',
        precision: 6,
        stakeByTransfer: true,

        lockPayload: lockPeriod => ({unlockhrs: lockPeriod}),
    }
}

export const LOCK_INTERVALS = {
    [MAIN_TOKEN]: [
        {text: '1 Hour', interval: {unit: 'hour', value: 1}},
        {text: '2 Hours', value: 2, interval: {unit: 'hour', value: 2}},
        {text: '3 Hours', value: 3, interval: {unit: 'hour', value: 3}},
        {text: '6 Hours', value: 6, interval: {unit: 'hour', value: 6}},
        {text: '12 Hours', value: 12, interval: {unit: 'hour', value: 12}},
        {text: '1 Day', value: 24, interval: {unit: 'day', value: 1}},
    ],
    [DAD_TOKEN]: [
        {text: '1 Hour', interval: {unit: 'hour', value: 1}},
        {text: '2 Hours', value: 2, interval: {unit: 'hour', value: 2}},
        {text: '3 Hours', value: 3, interval: {unit: 'hour', value: 3}},
        {text: '6 Hours', value: 6, interval: {unit: 'hour', value: 6}},
        {text: '12 Hours', value: 12, interval: {unit: 'hour', value: 12}},
        {text: '1 Day', value: 24, interval: {unit: 'day', value: 1}},
    ]
}
