import _ from 'lodash'
import {parseAmount, amountToAsset} from "utils";
import {transact, createTransferAction} from './api'
import {fetchAccountPoolBalances} from './balances'
import {fetchPoolData} from './pools'
import config from 'config'

const {CONTRACTS, POOLS, TOKENS} = config

// TXS
const transferToPool = (activeUser, poolContract, amount, symbol, actionName) => {
    return createTransferAction(activeUser.accountName, amountToAsset(amount, symbol), TOKENS[symbol], poolContract, `${actionName} ${symbol}`)
}

// ECURVE INTERACTIONS
const eCurveTxCallback = (activeUser, poolId) => dispatch => {
    // const poolId = "3POOL"
    dispatch(fetchAccountPoolBalances(activeUser.accountName, poolId))
    dispatch(fetchPoolData(poolId))
}

export const deposit = (activeUser, poolId, amounts, minReceiveAmount) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {tokens: symbols, lpTokenSymbol, poolContract} = POOLS[poolId]

    const {transfers, sAmounts} = _.reduce(symbols, ({transfers, sAmounts}, symbol) => {
        const [fAmount, sAmount] = parseAmount(amounts[symbol], symbol)
        return {
            transfers: fAmount > 0 ? [...transfers, transferToPool(activeUser, poolContract, sAmount, symbol, 'Deposit')] : transfers,
            sAmounts: [...sAmounts, sAmount],
        }
    }, {transfers: [], sAmounts: []})

    dispatch(transact(activeUser, [
        ...transfers,
        {
            account: poolContract,
            name: 'deposit',
            data: {
                account: activeUser.accountName,
                amounts: sAmounts,
                minretamt: amountToAsset(minReceiveAmount, lpTokenSymbol),
            },
        }
    ], {
        apiKey: 'deposit',
        callback: eCurveTxCallback(activeUser, poolId),
    }))
}

export const exchange = (activeUser, poolId, from, to) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {poolContract} = POOLS[poolId]

    const sInAmount = amountToAsset(from.amount, from.symbol)
    const sOutAmount = amountToAsset(to.amount, to.symbol)

    dispatch(transact(activeUser, [
        transferToPool(activeUser, poolContract, sInAmount, from.symbol, 'Exchange'),
        {
            account: poolContract,
            name: 'exchange',
            data: {
                account: activeUser.accountName,
                amount: sInAmount,
                minreturn: sOutAmount,
            },
        }
    ], {
        apiKey: 'exchange',
        callback: eCurveTxCallback(activeUser, poolId),
    }))
}

export const withdraw = (activeUser, poolId, sendAmount, receiveAmounts, withdrawOneSymbol, isBalanced) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {tokens: symbols, poolContract, lpTokenSymbol} = POOLS[poolId]

    const sInAmount = amountToAsset(sendAmount, lpTokenSymbol)

    const apiOpts = {
        apiKey: 'withdraw',
        callback: eCurveTxCallback(activeUser, poolId),
    }

    const transfer = transferToPool(activeUser, poolContract, sInAmount, lpTokenSymbol, 'Withdraw')
    let action = null

    if (withdrawOneSymbol) {
        // withdrawone
        const sAmount = amountToAsset(_.get(receiveAmounts, withdrawOneSymbol, 0), withdrawOneSymbol)
        action = transact(activeUser, [
            transfer,
            {
                account: poolContract,
                name: 'withdrawone',
                data: {
                    account: activeUser.accountName,
                    pooltokamt: sInAmount,
                    minamount: sAmount,
                },
            }
        ], apiOpts)
    } else if (isBalanced) {
        // withdraw
        action = transact(activeUser, [
            transfer,
            {
                account: poolContract,
                name: 'withdraw',
                data: {
                    account: activeUser.accountName,
                    pooltokamt: sInAmount,
                    minamounts: _.map(symbols, symbol => amountToAsset(receiveAmounts[symbol], symbol)),
                },
            }
        ], apiOpts)
    } else {
        // withdrawimbl
        action = transact(activeUser, [
            transfer,
            {
                account: poolContract,
                name: 'withdrawimbl',
                data: {
                    account: activeUser.accountName,
                    maxburnamt: sInAmount,
                    minamounts: _.map(POOLS[poolId].tokens, symbol => {
                        return amountToAsset(_.get(receiveAmounts, symbol, 0), symbol)
                    }),
                },
            }
        ], apiOpts)
    }

    dispatch(action)
}