import _ from 'lodash'
import {parseAmount, amountToAsset} from "utils";
import {transact, createTransferAction} from './api'
import {fetchAccountPoolBalances} from './balances'
import {fetchPoolData} from './pools'
import config from 'config'

const {CONTRACTS, POOLS, TOKENS} = config

// TXS
const transferToECurve = (activeUser, amount, symbol) => {
    return createTransferAction(activeUser.accountName, amountToAsset(amount, symbol), TOKENS[symbol], CONTRACTS.curve3Pool)
}

// ECURVE INTERACTIONS
const eCurveTxCallback = activeUser => dispatch => {
    const poolId = "3POOL"
    dispatch(fetchAccountPoolBalances(activeUser.accountName, poolId))
    dispatch(fetchPoolData(poolId))
}

export const deposit = (activeUser, amounts, minReceiveAmount) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {tokens: symbols, lpTokenSymbol, poolContract} = POOLS["3POOL"]

    const {transfers, sAmounts} = _.reduce(symbols, ({transfers, sAmounts}, symbol) => {
        const [fAmount, sAmount] = parseAmount(amounts[symbol], symbol)
        return {
            transfers: fAmount > 0 ? [...transfers, transferToECurve(activeUser, sAmount, symbol)] : transfers,
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
        callback: eCurveTxCallback(activeUser),
    }))
}

export const exchange = (activeUser, from, to) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {poolContract} = POOLS["3POOL"]

    const sInAmount = amountToAsset(from.amount, from.symbol)
    const sOutAmount = amountToAsset(to.amount, to.symbol)

    dispatch(transact(activeUser, [
        transferToECurve(activeUser, sInAmount, from.symbol),
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
        callback: eCurveTxCallback(activeUser),
    }))
}

export const withdraw = (activeUser, sendAmount, receiveAmounts, withdrawOneSymbol, isBalanced) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {tokens: symbols, poolContract, lpTokenSymbol} = POOLS["3POOL"]

    const sInAmount = amountToAsset(sendAmount, lpTokenSymbol)

    const apiOpts = {
        apiKey: 'withdraw',
        callback: eCurveTxCallback(activeUser),
    }

    const transfer = transferToECurve(activeUser, sInAmount, lpTokenSymbol)
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
                    minamounts: _.map(POOLS["3POOL"].tokens, symbol => {
                        return amountToAsset(_.get(receiveAmounts, symbol, 0), symbol)
                    }),
                },
            }
        ], apiOpts)
    }

    dispatch(action)
}