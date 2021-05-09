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
    curve3Pool: 'ecurve3pool1',
    LPDeposit: 'depositlp111',
    LPTokens: 'ecurvelp1111',
    curveLock: 'ecrvgovlock1',
    dadLock: 'dadgovernanc',
    claimCurveLP: 'ecrvclaim111',
    claimCurveDAD: 'dadlockecrv1',
    ecrvAdminFee: 'ecrvadminfee',

    dadUsdTokens: 'dadusdtokens',

    curveUSNPool: 'ecrvusnpool1',
    depositUSNLP: 'depositlp112',
}

export const POOLS = {
    'TRIPOOL': {
        id: 'TRIPOOL',
        name: '3Pool',
        operator: 'eCurve',
        poolContract: CONTRACTS.curve3Pool,
        tokens: ["USDC", "DAI", "USDT"],
        lpTokenSymbol: 'TRIPOOL',
    },
    'USNPOOL': {
        id: 'USNPOOL',
        name: 'USNPool',
        operator: 'eCurve',
        poolContract: CONTRACTS.curveUSNPool,
        tokens: ["USN", "TRIPOOL"],
        lpTokenSymbol: 'USNPOOL',
        isNew: true,
    },
    'DADGOV': {
        id: 'DADGOV',
        name: 'DAD Governance',
        operator: 'DAD',
        poolContract: CONTRACTS.dadLock,
        depositContract: CONTRACTS.dadLock,
        lpTokenSymbol: 'DAD',
        pairId: '588',
        poolMiningWeight: 0.15,
    },
    'BOXAVG': {
        id: 'BOXAVG',
        name: 'EOS/USDC',
        operator: 'Defibox',
        poolContract: 'dpositboxavg',
        lpTokenSymbol: 'BOXAVG',
        pairId: '1255',
    },
    'BOXAUQ': {
        id: 'BOXAUQ',
        name: 'EOS/DAI',
        operator: 'Defibox',
        poolContract: 'dpositboxauq',
        lpTokenSymbol: 'BOXAUQ',
        pairId: '1239',
    },
    'BOXAYO': {
        id: 'BOXAYO',
        name: 'ECRV/USDC',
        operator: 'Defibox',
        poolContract: 'dpositboxayo',
        lpTokenSymbol: 'BOXAYO',
        pairId: '1341',
        poolMiningWeight: 0.005,
    },
    'BOXAYP': {
        id: 'BOXAYP',
        name: 'ECRV/DAI',
        operator: 'Defibox',
        poolContract: 'dpositboxayp',
        lpTokenSymbol: 'BOXAYP',
        pairId: '1342',
    },
}

export const LP_TOKENS = ['TRIPOOL']

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
    },
    DAI: {
        symbol: 'DAI',
        contract: CONTRACTS.dadUsdTokens,
        precision: 6,
    },
    USDT: {
        symbol: 'USDT',
        contract: 'tethertether',
        precision: 4,
    },
    TRIPOOL: {
        symbol: 'TRIPOOL',
        contract: CONTRACTS.LPTokens,
        stakeContract: CONTRACTS.LPDeposit,
        stakeTable: 'stake',
        precision: 6,
        isLPToken: true,
    },

    USN: {
        symbol: 'USN',
        contract: 'danchortoken',
        precision: 4,
    },
    USNPOOL: {
        symbol: 'USNPOOL',
        contract: CONTRACTS.LPTokens,
        stakeContract: CONTRACTS.depositUSNLP,
        stakeTable: 'stake',
        precision: 6,
        isLPToken: true,
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