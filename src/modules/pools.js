import {SECONDS_IN_YEAR, balancesToMap, makeReducer, toFloat} from "utils";
import {
    setStatus,
    fetchOne,
    fetchTokenStats,
    getTableData, requestEcurveApi, requestDefiboxPair
} from "modules/api"
import _ from "lodash";
import config from 'config'
import {createSelector} from "reselect";
import {poolConfigSelector, nextRoundEcrvInUsdtSelector} from './ecrv'
import {tokenPriceSelector} from "./prices";

const {CONTRACTS, POOLS, MAIN_TOKEN} = config

export const fetchPoolBalances = poolId => dispatch => {
    const {tokens: symbols, poolContract} = POOLS[poolId]
    dispatch(getTableData({
        code: poolContract,
        scope: poolContract,
        table: 'tokenpools1',
    }, {
        apiKey: 'fetch-pool-balances',
        callback: tokenPools => {
            dispatch({
                type: 'SET_POOL_BALANCES', payload: {
                    poolId,
                    ...balancesToMap(
                        symbols,
                        _.get(tokenPools, ['rows', 0, 'liquidblc'])
                    ),
                },
            })
        }
    }))
}

export const fetchPoolFeeStats = () => async dispatch => {
    try {
        const data = await requestEcurveApi('/GetEcurveStats')

        _.forEach(data?.data, ({pool_id, ...record}) => {
            dispatch({
                type: 'SET_POOL_FEE_STATS',
                payload: {
                    poolId: pool_id,
                    ...record,
                },
            })
        })
    } catch (e) {

    }
}

export const fetchDefiboxPoolData = poolId => async dispatch => {
    const {pairId, poolContract, name} = POOLS[poolId]

    try {
        const data = await Promise.all([
            requestDefiboxPair(pairId),
            fetchOne({code: poolContract, scope: poolContract, table: 'totalstake'})
        ])

        const {liquidity_token, count0, count1, symbol0} = _.get(data, [0, 'data', 'data', 0], {})
        const {balance: totalStake} = _.get(data, [1], {})

        const balances = [count0, count1]
        const stableIdx = symbol0 === 'USDC' || symbol0 === 'DAI' ? 0 : 1

        const stableBalance = balances[stableIdx]
        const sumPoolUsd = stableBalance * 2

        dispatch({
            type: 'SET_POOL_STATS',
            payload: {
                poolId,
                totalSupply: liquidity_token,
                totalStake: parseFloat(totalStake),
                price: sumPoolUsd / liquidity_token,
            }
        })
    } catch (e) {

    }
}

export const fetchPoolData = poolId => async (dispatch, getState) => {
    const apiKey = `pool-stats-${poolId}`

    try {
        const {lpTokenSymbol, poolContract} = POOLS[poolId]
        const {depositContract} = poolConfigSelector(poolId)(getState())

        dispatch(fetchPoolBalances(poolId))

        const data = await Promise.all([
            fetchTokenStats({contract: CONTRACTS.LPTokens, symbol: lpTokenSymbol}),
            fetchOne({code: poolContract, scope: poolContract, table: 'priceinfo1'}),
            fetchOne({code: poolContract, scope: poolContract, table: 'config'}),
            fetchOne({code: depositContract, scope: depositContract, table: 'totalstake'})
        ])

        const totalSupply = parseFloat(_.get(data, [0, lpTokenSymbol, 'supply'], '0'))
        const {D, price} = _.get(data, [1], {})

        const {future_A: A, fee = 0, adminfee = 0} = _.get(data, [2], {})
        const adminPart = fee * adminfee

        const {balance: totalStake} = _.get(data, [3], {})

        dispatch({
            type: 'SET_POOL_STATS',
            payload: {
                poolId,
                totalSupply,
                totalStake: parseFloat(totalStake),
                D: parseInt(D),
                price: parseFloat(price),
                A,
                fee: {
                    total: toFloat(fee, 4),
                    lpPart: toFloat(fee - adminPart, 4) * 100,
                    adminPart: toFloat(adminPart, 4) * 100,
                },
            }
        })
        dispatch(setStatus(apiKey, {status: 'success'}))
    } catch (e) {
        dispatch(setStatus(apiKey, {status: 'error', error: `Failed to fetch ${poolId} config`}))
    }
}

// SELECTORS
const EMPTY_OBJECT = {}

export const poolInfoSelector = (poolId, key) => state => {
    const path = ['pools', poolId]
    if (!_.isEmpty(key)) {
        path.push(key)
    }
    return _.get(state, path, EMPTY_OBJECT)
}

export const makePoolTVLSelector = poolId => () => createSelector(
    poolInfoSelector(poolId, 'balances'),
    poolBalances => {
        return !_.isEmpty(poolBalances) && _.sum(_.map(_.values(poolBalances), parseFloat))
    }
)

export const poolFeesApySelector = poolId => state => {
    const {totalvcrv} = _.get(state, 'ecrv', {totalvcrv: 0})
    const {fee} = poolInfoSelector(poolId, 'stats')(state)
    const ecrv_usdt_price = tokenPriceSelector(MAIN_TOKEN)(state)
    if (!(ecrv_usdt_price > 0 && totalvcrv > 0 && _.get(fee, 'adminPart') > 0)) return {apy: 0, volume: 0}

    const {last_24h_fees} = poolInfoSelector(poolId, 'feeStats')(state)

    const total_vcrv_in_usdt = totalvcrv / (SECONDS_IN_YEAR * 4) * ecrv_usdt_price

    return {
        apy: 365 * 100 * last_24h_fees * 1000000 / total_vcrv_in_usdt,
        volume: last_24h_fees * 100 / fee.adminPart
    }
}

export const ECRVAggStatsSelector = state => _.reduce(state.pools, (agg, {}, poolId) => {
    const {apy, volume} = poolFeesApySelector(poolId)(state)
    return {
        apy: agg.apy + apy,
        volume: agg.volume + volume,
    }
}, {apy: 0, volume: 0})

export const makePoolMiningApySelector = poolId => () => createSelector(
    nextRoundEcrvInUsdtSelector,
    poolInfoSelector(poolId, 'stats'),
    poolConfigSelector(poolId),
    (next_round_ecrv_in_usdt, {price: lpTokenPrice, totalStake}, {poolMiningWeight}) => {
        if (!(next_round_ecrv_in_usdt > 0 && lpTokenPrice > 0)) return {basePoolApy: 0, maxPoolApy: 0}

        const total_stake_in_usdt = totalStake * lpTokenPrice

        const maxPoolApy = 365 * 100 * 24 * poolMiningWeight * next_round_ecrv_in_usdt / total_stake_in_usdt

        return {
            basePoolApy: maxPoolApy * 0.4,
            maxPoolApy
        }
    }
)

// REDUCER
const INITIAL_STATE = {}

const reduceSetKeyToPoolId = key => (state, action) => {
    const {poolId, ...update} = action.payload
    return {
        ...state,
        [poolId]: {
            ...state[poolId],
            [key]: update,
        }
    }
}

export const poolsReducer = makeReducer({
    SET_POOL_WEIGHTS: reduceSetKeyToPoolId('weights'),
    SET_POOL_STATS: reduceSetKeyToPoolId('stats'),
    SET_POOL_BALANCES: reduceSetKeyToPoolId('balances'),
    SET_POOL_FEE_STATS: reduceSetKeyToPoolId('feeStats'),
}, INITIAL_STATE, false)