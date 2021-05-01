import _ from 'lodash'
import {amountToAsset, balanceToFloat} from "utils";
import {transact, createTransferAction, getSingleRow} from './api'
import {fetchBalance} from './balances'
import config from 'config'

const {CONTRACTS, TOKENS, MAIN_TOKEN, DAD_TOKEN} = config

// FETCH
export const fetchStakedToken = (activeUser, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {stakeContract, stakeTable} = TOKENS[symbol]
    dispatch(getSingleRow({
            code: stakeContract,
            scope: stakeContract,
            table: stakeTable,
            lower_bound: activeUser.accountName,
            limit: 1,
        },
        'account',
        {
            apiKey: `fetch-staked-${symbol}`,
            callback: data => {
                const balance = _.get(data, ['rows', 0, 'balance'], 0)
                dispatch({type: 'SET_BALANCE', payload: {type: 'staked', symbol, balance}})
            }
        }))
}

export const fetchLockInfo = (activeUser, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {lockContract, lockInfoTable} = TOKENS[symbol]
    dispatch(getSingleRow({
            code: lockContract,
            scope: lockContract,
            table: lockInfoTable,
            lower_bound: activeUser.accountName,
            limit: 1,
        },
        'account',
        {
            apiKey: `fetch-lock-${symbol}`,
            callback: data => {
                const balance = {
                    balance: balanceToFloat(_.get(data, ['rows', 0, 'lockedamt'], 0)),
                    unlockTime: _.get(data, ['rows', 0, 'unlocktime'], ''),
                }
                dispatch({type: 'SET_BALANCE_OBJECT', payload: {type: 'locked', symbol, balance}})
            }
        }))
}

export const fetchUnlockInfo = (activeUser, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return

    const {lockContract, unlockInfoTable} = TOKENS[symbol]
    dispatch(getSingleRow({
            code: lockContract,
            scope: lockContract,
            table: unlockInfoTable,
            lower_bound: activeUser.accountName,
            limit: 1,
        },
        'owner',
        {
            apiKey: `fetch-unlock-${symbol}`,
            callback: data => {
                const balance = _.get(data, ['rows', 0, 'unlockedamt'], 0)
                dispatch({type: 'SET_BALANCE', payload: {type: 'unlocked', symbol, balance}})
            }
        }))
}

// TXS
export const getTestTokens = activeUser => dispatch => {
    if (_.isEmpty(activeUser)) return

    dispatch(transact(activeUser, [
        {
            account: 'crvfaucetac1',
            name: 'gettoken',
            data: {
                account: activeUser.accountName
            },
        }
    ], {
        apiKey: 'get-test-tokens',
    }))
}

const claimAction = (activeUser, contract, data = {}) => ({
    account: contract,
    name: 'claim',
    data: {
        owner: activeUser.accountName,
        ...data,
    },
})

export const claim = (activeUser, symbols = []) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const actions = _.map(symbols, symbol => claimAction(
        activeUser,
        TOKENS[symbol].claimContract || CONTRACTS.ecrvAdminFee,
        symbol === MAIN_TOKEN || symbol === DAD_TOKEN ? {} : {lptoksym: `${TOKENS[symbol].precision},${symbol}`}
    ))
    dispatch(transact(
        activeUser,
        actions,
        {
            apiKey: 'claim',
            callback: dispatch => {
                _.forEach(symbols, symbol => {
                    dispatch({type: 'SET_BALANCE', payload: {type: 'claimable', symbol, balance: 0}})
                    dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
                })
            }
        }
    ))
}

export const stake = (activeUser, amount, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {stakeContract} = TOKENS[symbol]

    dispatch(transact(activeUser, [
        createTransferAction(activeUser.accountName, amountToAsset(amount, symbol), TOKENS[symbol], stakeContract, `Stake ${symbol}`)
    ], {
        apiKey: `stake-${symbol}`,
        callback: dispatch => {
            dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
            dispatch(fetchStakedToken(activeUser, symbol))
        },
    }))
}

export const unstake = (activeUser, amount, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {stakeContract} = TOKENS[symbol]

    dispatch(transact(activeUser, [{
        account: stakeContract,
        name: 'unstake',
        data: {
            receiver: activeUser.accountName,
            quantity: amountToAsset(amount, symbol),
            memo: `Unstake ${symbol}`,
        },
    }], {
        apiKey: 'unstake',
        callback: dispatch => {
            dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
            dispatch(fetchStakedToken(activeUser, symbol))
        },
    }))
}

export const lock = (activeUser, amount, symbol, lockPeriod) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {lockContract, lockPayload} = TOKENS[symbol]

    const actions = []
    if (amount > 0) {
        actions.push(createTransferAction(activeUser.accountName, amountToAsset(amount, symbol), TOKENS[symbol], lockContract, `Lock ${symbol}`))
    }

    dispatch(transact(activeUser, [
        ...actions,
        {
            account: lockContract,
            name: 'lock',
            data: {
                account: activeUser.accountName,
                ...lockPayload(lockPeriod, amountToAsset(amount, symbol)),
            },
        }
    ], {
        apiKey: 'lock',
        callback: dispatch => {
            dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
            dispatch(fetchLockInfo(activeUser, symbol))
            dispatch({
                type: 'RESET_TEMP_LOCK_ARG',
            })
        }
    }))
}

export const increaseLockedAmount = (activeUser, amount, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {lockContract, stakeByTransfer} = TOKENS[symbol]

    const actions = [createTransferAction(activeUser.accountName, amountToAsset(amount, symbol), TOKENS[symbol], lockContract, `Increase ${symbol} lock amount`)]
    if (!stakeByTransfer) {
        actions.push({
            account: lockContract,
            name: 'incramt',
            data: {
                account: activeUser.accountName,
                quantity: amountToAsset(amount, symbol),
            },
        })
    }
    dispatch(transact(activeUser, actions, {
        apiKey: 'incr-lock-amount',
        callback: dispatch => {
            dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
            dispatch(fetchLockInfo(activeUser, symbol))
            dispatch({
                type: 'RESET_TEMP_LOCK_ARG',
            })
        },
    }))
}

export const increaseLockPeriod = (activeUser, symbol, lockPeriod) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {lockContract} = TOKENS[symbol]

    dispatch(transact(activeUser, [
        {
            account: lockContract,
            name: 'incrlocktm',
            data: {
                account: activeUser.accountName,
                maturityinhr: lockPeriod,
            },
        }
    ], {
        apiKey: 'incr-lock-period',
        callback: dispatch => {
            dispatch(fetchLockInfo(activeUser, symbol))
            dispatch({
                type: 'RESET_TEMP_LOCK_ARG',
            })
        },
    }))
}

export const unlock = (activeUser, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return
    const {lockContract} = TOKENS[symbol]

    dispatch(transact(activeUser, [{
        account: lockContract,
        name: 'unlock',
        data: {
            account: activeUser.accountName,
        },
    }], {
        apiKey: 'unlock',
        callback: dispatch => {
            dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
            dispatch(fetchLockInfo(activeUser, symbol))
            dispatch(fetchUnlockInfo(activeUser.accountName, symbol))
        },
    }))
}
