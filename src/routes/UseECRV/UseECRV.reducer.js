import {makeReducer} from "utils"
import _ from 'lodash'

const INITIAL_STATE = {
    tempLockArgs: {
        // lockTimeInHours: 48,
        // lockedBalance: 700000,
    },
    poolTempStake: {
        // TRIPOOL: {
        //     stake: 0,
        //     unstake: 0,
        // }
    }
}

export const getTempLockArgs = state => _.get(state, 'useECRV.tempLockArgs', {})
// export const getTempPoolStake = state => _.get(state, 'useECRV.tempLockArgs', {})
// export const getBalance = (type, symbol) => state => _.get(state.balances, [type, symbol], 0)
// export const getBalanceObject = (type, symbol) => state => _.get(state.balances, [type, symbol], {})

// const reduceSetBalance = (setBalanceFunc = b => b) => (state, action) => {
//     const {type, symbol, balance} = action.payload
//     return {
//         ...state,
//         [type]: {
//             ...state[type],
//             [symbol]: setBalanceFunc(balance),
//         }
//     }
// }

export const setTempLockArgs = update => ({
    type: 'SET_TEMP_LOCK_ARG',
    payload: update,
})

export const setPoolTempStake = (poolId, amount) => ({
    type: 'SET_POOL_TEMP_STAKE',
    payload: {poolId, amount},
})

export const resetTempLockArgs = () => ({
    type: 'RESET_TEMP_LOCK_ARG',
})

export const useECRVReducer = makeReducer({
    SET_TEMP_LOCK_ARG: (state, action) => {
        return {
            ...state,
            tempLockArgs: {
                ...state.tempLockArgs,
                ...action.payload,
            }
        }
    },
    SET_POOL_TEMP_STAKE: (state, action) => {
        const {poolId, amount} = action.payload
        const addStake = amount > 0
        const poolTempStake = addStake ? {
            stake: amount,
            unstake: 0,
        } : {
            stake: 0,
            unstake: 0 - amount,
        }
        return {
            ...state,
            poolTempStake: {
                ...state.poolTempStake,
                [poolId]: poolTempStake,
            }
        }
    },
    RESET_TEMP_LOCK_ARG: () => INITIAL_STATE,
}, INITIAL_STATE)