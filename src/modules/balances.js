import {balanceToFloat, makeReducer} from "utils"
import _ from 'lodash'
import {fetchCurrencyBalance} from "./api";
import config from 'config'

const {TOKENS, POOLS} = config

// ACTIONS
export const fetchBalance = (accountName, {contract, symbol}) => async dispatch => {
    const balance = await fetchCurrencyBalance(accountName, {contract, symbol})
    dispatch({type: 'SET_BALANCE', payload: {type: 'current', symbol, balance}})
}

export const fetchBalances = (accountName, symbols) => async dispatch => {
    _.map(symbols, symbol => dispatch(fetchBalance(accountName, TOKENS[symbol])))
}

export const fetchAccountPoolBalances = (accountName, poolId) => {
    const {tokens, lpTokenSymbol} = POOLS[poolId]
    return fetchBalances(accountName, [...tokens, lpTokenSymbol])
}

// SELECTORS
export const balancesSelector = type => state => _.get(state.balances, type, {})
export const balanceSelector = (type, symbol) => state => _.get(state.balances, [type, symbol], 0)
export const balanceObjectSelector = (type, symbol) => state => _.get(state.balances, [type, symbol], {})

// REDUCER
const INITIAL_STATE = {
    current: {},
    claimable: {},
    staked: {},
    locked: {},
    unlocked: {},
}

const reduceSetBalance = (setBalanceFunc = b => b) => (state, action) => {
    const {type, symbol, balance} = action.payload
    return {
        ...state,
        [type]: {
            ...state[type],
            [symbol]: setBalanceFunc(balance),
        }
    }
}

export const balancesReducer = makeReducer({
    SET_BALANCE: reduceSetBalance(balanceToFloat),
    SET_BALANCE_GROUP: (state, action) => {
        const {type, balances} = action.payload
        return {
            ...state,
            [type]: {
                ...state[type],
                ...balances,
            }
        }
    },
    SET_BALANCE_OBJECT: reduceSetBalance(),
}, INITIAL_STATE)