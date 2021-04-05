import _ from 'lodash'
import config from 'config'
const {POOLS} = config

export const calcD = (xp, {N_COINS, Ann}) => {
    let S = _.sum(xp)

    // console.log('calcD input xp', xp)

    if (S === 0) return 0

    let Dprev = 0
    let D = S

    while (Math.abs(Dprev - D) > 1) {
        let D_P = D
        for (let i = 0; i < N_COINS; i++) {
            D_P = D_P * D / (xp[i] * 3)
        }
        Dprev = D
        D = (Ann * S + D_P * N_COINS) * D / ((Ann - 1) * D + (N_COINS + 1) * D_P)
        // console.log('Dprev=', Dprev ,'D=', D)
    }

    return D
}

const getOrderedAmounts = amounts => {
    const {tokens} = POOLS["3POOL"]
    return _.map(tokens, symbol => _.get(amounts, symbol, 0))
}

// EXCHANGE
const get_y = (i, j, x, {xp, N_COINS, Ann, D}) => {
    // console.log('get_y', 'inputs', {i, j, x})

    let c = D
    let S_ = 0
    let _x = 0

    for (let _i = 0; _i < N_COINS; _i++) {
        if (_i === i)
            _x = x
        else if (_i !== j)
            _x = xp[_i]
        else
            continue

        S_ = S_ + _x
        c = c * D / (_x * N_COINS)
    }

    c = c * D / (Ann * N_COINS)

    let b = S_ + D / Ann
    let y_prev = 0
    let y = D

    while (Math.abs(y - y_prev) > 1) {
        y_prev = y
        y = (y * y + c) / (2 * y + b - D)
        // console.log('get_y iteration', 'y_prev=', y_prev, 'y=', y)
    }

    return y
}

const calcExchangeAmount = common => (i, j, dx, slippage) => {
    // console.log('-------------- START EXCHANGE LOG -----------------')
    const {xp, fee} = common

    // console.log('calcExchangeAmount', 'config', common)
    // console.log('calcExchangeAmount', 'input', {i, j, dx, slippage})

    const x = xp[i] + dx
    const y = get_y(i, j, x, {
        ...common,
        D: calcD(xp, common)
    })

    const dy = xp[j] - y - 1
    // console.log('calcExchangeAmount', 'dy=', dy, 'y=', y)

    const _fee = dy * fee
    // const _fee = dy * fee / 100
    // console.log('calcExchangeAmount', '_fee=', _fee)

    const min_amount = (dy - _fee) * (1 - slippage / 100)

    // console.log('calcExchangeAmount', 'min_amount', min_amount)
    // console.log('--------------- END EXCHANGE LOG ------------------')
    return min_amount / 1000000
}

// DEPOSIT
const calcLPTokenOnDeposit = common => (amounts, slippage) => {
    const {xp, total_supply} = common

    // console.log('calcLPTokenOnDeposit config', common)
    // console.log('calcLPTokenOnDeposit inputs', {amounts, slippage})

    const D0 = calcD(xp, common)
    // const D0 = D
    // console.log('calcLPTokenOnDeposit D0', D0)

    const newBalances = _.map(xp, (b, i) => b + amounts[i])
    // console.log('calcLPTokenOnDeposit newBalances', newBalances)

    const D1 = calcD(newBalances, common)
    // console.log('calcLPTokenOnDeposit D1', D1)

    const withoutSlippage = Math.abs(D0 - D1) * total_supply / D0
    const withSlippage = (1 - slippage / 100) * withoutSlippage
    // console.log('calcLPTokenOnDeposit min_mint_amount', min_mint_amount)

    return {withSlippage, withoutSlippage}
}

const calcDeposit = common => (amounts, slippage) => {
    // console.log('-------------- START DEPOSIT LOG -----------------')
    const {withSlippage, withoutSlippage} = calcLPTokenOnDeposit(common)(amounts, slippage)

    const {xp} = common
    const {tokens} = POOLS["3POOL"]

    const sumDeposited = _.sum(amounts)
    const sumInPool = _.sum(xp)
    const ifWasBalanced =_.map(tokens, (s, i) => sumDeposited * xp[i] / sumInPool)

    const {withSlippage: lpTokenIfBalanced} = calcLPTokenOnDeposit(common)(ifWasBalanced, 0)

    const bonusAmount = 100 * (withoutSlippage - lpTokenIfBalanced) / lpTokenIfBalanced

    // console.log('--------------- END DEPOSIT LOG ------------------')

    return {
        lpTokenAmount: withSlippage,
        withoutSlippage,
        bonusAmount,
        price: common.price,
    }
}

const calcBalancedDeposit = ({xp}) => (amount, tokenIndex) => {
    const sumOfPoolBalance = _.sum(xp)

    const ratios = _.map(xp, (coinAmount, i) => {
        return coinAmount / sumOfPoolBalance / 100
    })

    const x = amount * ratios[tokenIndex]

    return _.map(ratios, (ratio, i) => {
        return i === tokenIndex
            ? amount
            : (x / ratio)
    })
}

const calcMaxBalancedDeposit = common => accountBalances => {
    const orderedAmounts = getOrderedAmounts(accountBalances)

    return _.reduce(orderedAmounts, (res, amount, i) => {
        const balances = calcBalancedDeposit(common)(amount, i)

        const isValid = _.reduce(balances, (isValid, b, j) => {
            return isValid && b <= orderedAmounts[j]
        }, true)

        if (!isValid) return res

        return _.sum(balances) > _.sum(res) ? balances : res

    }, [])
}

// WITHDRAW
const calcWithdraw = ({xp}) => (amount, slippage) => {
    const sumOfPoolBalance = _.sum(xp)

    return _.map(xp, coinAmount => {
        return (1 - slippage / 100) * amount * coinAmount / sumOfPoolBalance
    })
}

const calcWithdrawImbalanced = common => (amounts, slippage) => {
    // console.log('-------------- START WITHDRAW IMBALANCED LOG -----------------')
    const {xp, total_supply} = common

    // const orderedAmounts = getOrderedAmounts(amounts)

    // console.log('calcWithdrawImbalanced config', common)
    // console.log('calcWithdrawImbalanced inputs', {amounts, slippage})

    const D0 = calcD(xp, common)
    // const D0 = D
    // console.log('calcWithdrawImbalanced D0', D0)

    const newBalances = _.map(xp, (b, i) => b - amounts[i])
    // console.log('calcWithdrawImbalanced newBalances', newBalances)

    const D1 = calcD(newBalances, common)
    // console.log('calcWithdrawImbalanced D1', D1)

    const maxBurn = (1 + slippage / 100) * Math.abs(D0 - D1) * total_supply / D0
    // console.log('calcWithdrawImbalanced maxBurn', maxBurn)

    // console.log('-------------- END WITHDRAW IMBALANCED LOG -----------------')
    return maxBurn
}

const get_y_D = (i, xp, D, {N_COINS, Ann}) => {
    // console.log('get_y_D inputs', {i, xp, D})
    let c = D
    let S_ = 0
    let _x = 0

    for (let _i = 0; _i < N_COINS; _i++) {
        if (_i !== i) {
            _x = xp[_i]
        } else {
            continue
        }

        S_ = S_ + _x
        c = c * D / (_x * 3)
    }
    c = c * D / (Ann * 3)

    let b = S_ + D / Ann
    let y_prev = 0
    let y = D

    while (Math.abs(y - y_prev) > 1) {
        y_prev = y
        y = (y * y + c) / (2 * y + b - D)
        // console.log('get_y_D iteration y', y, 'y_prev', y_prev)
    }

    return y
}

export const calcWithdrawOne = common => (token_amount, i, slippage) => {
    // console.log('-------------- START WITHDRAW ONE LOG -----------------')
    // console.log('calcWithdrawOne config', common)
    // console.log('calcWithdrawOne inputs', token_amount, i, slippage)
    const {xp, total_supply, fee, N_COINS} = common
    // const amp = A
    const _fee = fee * N_COINS / (4 * (N_COINS - 1))
    // console.log('calcWithdrawOne _fee', _fee)

    const D0 = calcD(xp, common)
    // const D0 = D
    // console.log('calcWithdrawOne D0', D0)
    const D1 = D0 - token_amount * D0 / total_supply
    // console.log('calcWithdrawOne D1', D1)


    const new_y = get_y_D(i, xp, D1, common)
    // console.log('withdrawOne new_y', new_y)
    // console.log('withdrawOne y', Math.abs(new_y - xp[i]))

    const xp_reduced = _.clone(xp)

    for (let j = 0; j < N_COINS; j++) {
        let dx_expected = 0
        if (j === i) {
            dx_expected = xp[j] * D1 / D0 - new_y
        } else {
            dx_expected = xp[j] - xp[j] * D1 / D0
        }
        xp_reduced[j] -= _fee * dx_expected
    }
    // console.log('withdrawOne xp_reduced', xp_reduced)

    const max_amount_received = (1 - slippage / 100) * (xp_reduced[i] - get_y_D(i, xp_reduced, D1, common) - 1)


    // console.log('withdrawOne max_burn', max_amount_received)
    // console.log('-------------- END WITHDRAW ONE LOG -----------------')
    return max_amount_received
}

export const calc = common => {
    const {xp, total_supply, Ann, D} = common
    return {
        isReady: !_.isEmpty(xp) && total_supply > 0 && D > 0 && Ann > 0,
        common,
        lpTokenOnDeposit: calcDeposit(common),
        balancedDeposit: calcBalancedDeposit(common),
        maxBalancedDeposit: calcMaxBalancedDeposit(common),
        exchangeAmount: calcExchangeAmount(common),
        withdraw: calcWithdraw(common),
        withdrawImbalanced: calcWithdrawImbalanced(common),
        withdrawOne: calcWithdrawOne(common)
    }
}
