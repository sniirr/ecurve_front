import daiImg from 'images/dai.png'
import usdcImg from 'images/usdc.svg'
import usdtImg from 'images/usdt.svg'
import _ from "lodash";

export const ENVIRONMENT = 'production'

export const CHAIN = {
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    rpcEndpoints: [{
        host: 'eos.greymass.com',
        port: 443,
        protocol: 'https'
    }]
}

export const ECURVE_API_URL = 'https://iit9dyqn3h.execute-api.us-east-1.amazonaws.com'

export const BLOCKS_URL = 'bloks.io'

export const MAIN_TOKEN = 'ECRV'
export const DAD_TOKEN = 'DAD'
export const WEIGHT_TOKEN = 'veCRV'

export const CONTRACTS = {
    curveToken: 'ecurvetoken1',
    curve3Pool: 'ecurve3pool1',     // ecurve3pool1
    LPDeposit: 'depositlp111',      // depositlp111
    LPTokens: 'ecurvelp1111',       // ecurvelp1111
    curveLock: 'ecrvgovlock1',      // ecrvgovlock1
    dadLock: 'dadgovernanc',        // dadgovernanc
    claimCurveLP: 'ecrvclaim111',   // ecrvclaim111
    claimCurveDAD: 'dadlockecrv1',  // dadlockecrv1
    ecrvAdminFee: 'ecrvadminfee',

    dadUsdTokens: 'dadusdtokens',
}

export const POOLS = {
    '3POOL': {
        name: '3Pool',
        poolContract: CONTRACTS.curve3Pool,
        depositContract: CONTRACTS.LPDeposit,
        tokens: ["USDC", "DAI", "USDT"],
        lpTokenSymbol: 'TRIPOOL', // TRIPOOL
        poolMiningWeight: 0.7,
    },
    'BOXAVG': {
        name: 'Defibox EOS/USDC',
        operator: 'defibox',
        poolContract: 'dpositboxavg',
        depositContract: 'dpositboxavg',
        lpTokenSymbol: 'BOXAVG', // TRIPOOL
        pairId: '1255',
        poolMiningWeight: 0.01,
    },
    'BOXAUQ': {
        name: 'Defibox EOS/DAI',
        operator: 'defibox',
        poolContract: 'dpositboxauq',
        depositContract: 'dpositboxauq',
        lpTokenSymbol: 'BOXAUQ', // TRIPOOL
        pairId: '1239',
        poolMiningWeight: 0.01,
    },
    'BOXAYO': {
        name: 'Defibox ECRV/USDC',
        operator: 'defibox',
        poolContract: 'dpositboxayo',
        depositContract: 'dpositboxayo',
        lpTokenSymbol: 'BOXAYO', // TRIPOOL
        pairId: '1341',
        poolMiningWeight: 0.005,
    },
    'BOXAYP': {
        name: 'Defibox ECRV/DAI',
        operator: 'defibox',
        poolContract: 'dpositboxayp',
        depositContract: 'dpositboxayp',
        lpTokenSymbol: 'BOXAYP', // TRIPOOL
        pairId: '1342',
        poolMiningWeight: 0.005,
    },
}

export const LP_TOKENS = ['TRIPOOL']
// export const LP_TOKENS = _.map(POOLS, 'lpTokenSymbol')

export const TOKENS = {
    BOXAVG: {
        symbol: 'BOXAVG',
        contract: 'lptoken.defi',
        precision: 0,
        stakeContract: 'dpositboxavg',
        stakeTable: 'stake',
    },
    BOXAUQ: {
        symbol: 'BOXAUQ',
        contract: 'lptoken.defi',
        precision: 0,
        stakeContract: 'dpositboxauq',
        stakeTable: 'stake',
    },
    BOXAYO: {
        symbol: 'BOXAYO',
        contract: 'lptoken.defi',
        precision: 0,
        stakeContract: 'dpositboxayo',
        stakeTable: 'stake',
    },
    BOXAYP: {
        symbol: 'BOXAYP',
        contract: 'lptoken.defi',
        precision: 0,
        stakeContract: 'dpositboxayp',
        stakeTable: 'stake',
    },
    USDC: {
        symbol: 'USDC',
        contract: CONTRACTS.dadUsdTokens,
        precision: 6,
        icon: usdcImg,
    },
    DAI: {
        symbol: 'DAI',
        contract: CONTRACTS.dadUsdTokens,
        precision: 6,
        icon: daiImg,
    },
    USDT: {
        symbol: 'USDT',
        contract: 'tethertether',
        precision: 4,
        icon: usdtImg,
    },
    TRIPOOL: {
        symbol: 'TRIPOOL',
        contract: CONTRACTS.LPTokens,
        stakeContract: CONTRACTS.LPDeposit,
        stakeTable: 'stake',
        // claimContract: CONTRACTS.claimCurveLP,
        precision: 6,
    },

    ECRV: {
        symbol: 'ECRV',
        contract: CONTRACTS.curveToken,
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
        {text: '1 Week', interval: {unit: 'week', value: 1}},
        {text: '1 Month', interval: {unit: 'month', value: 1}},
        {text: '3 Months', interval: {unit: 'month', value: 3}},
        {text: '6 Months', interval: {unit: 'month', value: 6}},
        {text: '1 Year', interval: {unit: 'year', value: 1}},
        {text: '4 Years', interval: {unit: 'year', value: 4, offsetHours: -24}},
    ],
    [DAD_TOKEN]: [
        {text: '1 Week', interval: {unit: 'week', value: 1}},
        {text: '1 Month', interval: {unit: 'month', value: 1}},
        {text: '2 Months', interval: {unit: 'month', value: 2}},
        {text: '3 Months', interval: {unit: 'month', value: 3}},
        {text: '6 Months', interval: {unit: 'month', value: 6}},
        {text: '1 Year', interval: {unit: 'year', value: 1}},
    ]
}