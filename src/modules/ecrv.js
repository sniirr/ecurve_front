import {SECONDS_IN_YEAR, makeReducer, reduceUpdateFull, dayJS} from "utils";
import {fetchOne, fetchOneByPk, fetchTokenStats, getTableData} from "modules/api"
import _ from "lodash";
import config from 'config'
import {createSelector} from "reselect";
import {tokenPriceSelector} from "./prices";
import {DADStatsSelector} from './dad'
import {balanceObjectSelector} from "modules/balances";

const {CONTRACTS, LP_TOKENS, MAIN_TOKEN, DAD_TOKEN, TOKENS} = config

export const fetchCurrentRound = () => fetchOne({
    code: CONTRACTS.curveToken,
    scope: CONTRACTS.curveToken,
    table: 'rounddet',
})

export const fetchTotalVECRV = () => fetchOne({
    code: CONTRACTS.curveLock,
    scope: CONTRACTS.curveLock,
    table: 'totalvcrv',
})

export const fetchTotalECRVLocked = () => fetchOne({
    code: CONTRACTS.curveLock,
    scope: CONTRACTS.curveLock,
    table: 'totallock1',
})

export const fetchPoolsConfig = () => async dispatch =>{
    try {

        dispatch(getTableData({
            code: CONTRACTS.claimCurveLP,
            scope: CONTRACTS.claimCurveLP,
            table: 'tokdistr',
            limit: 20,
        }, {
            apiKey: 'fetch-pools-config',
            callback: res => {
                console.log(JSON.stringify(res, null, 2))
                const poolsConfig = _.map(res.rows, ({dtoken, dtokcon, weight}) => {
                    const [precision, symbol] = _.split(dtoken, ',')
                    return {
                        precision: parseInt(precision),
                        symbol,
                        poolMiningWeight: weight / 100,
                        depositContract: dtokcon,
                    }
                })

                dispatch({
                    type: 'SET_TOKEN_STATS',
                    payload: {
                        poolsConfig: _.keyBy(poolsConfig, 'symbol')
                    },
                })
            }
        }))
    } catch (e) {

    }
}

export const fetchEcrvStats = () => async dispatch => {
    try {
        const data = await Promise.all([
            fetchCurrentRound(),
            fetchTokenStats(TOKENS[MAIN_TOKEN]),
        ])

        const {currround, currround_amount} = _.get(data, [0], {currround: 0, currround_amount: 0})
        if (currround === 0) return

        dispatch(fetchVeCRVStats(currround, currround_amount))

        const {supply: totalSupply} = _.get(data, [1, MAIN_TOKEN], {supply: 0})

        dispatch({
            type: 'SET_TOKEN_STATS',
            payload: {
                currround,
                currround_amount: parseFloat(currround_amount),
                totalSupply
            }
        })
    }
    catch (e) {

    }
}

export const fetchVeCRVStats = (currround, currround_amount) => async dispatch =>{
    try {
        const data = await Promise.all([
            fetchTotalVECRV(),
            fetchTotalECRVLocked(),
        ])

        const {totalvcrv, lastupdate} = _.get(data, [0], {})
        const {oldtotamt, newuserwt} = _.get(data, [1], {})

        dispatch({
            type: 'SET_TOKEN_STATS',
            payload: {
                currround,
                currround_amount: parseFloat(currround_amount),
                totalvcrv: parseFloat(totalvcrv),
                lastupdate,
                oldtotamt: parseFloat(oldtotamt) * 1000000,
                newuserwt: parseFloat(newuserwt),
            }
        })
    } catch (e) {

    }
}

export const fetchRewards = (activeUser) => async dispatch => {
    try {
        const data = await Promise.all([
            fetchOneByPk({
                code: CONTRACTS.claimCurveLP,
                scope: CONTRACTS.claimCurveLP,
                table: 'claimtab',
            }, 'owner', activeUser.accountName),
            fetchOneByPk({
                code: CONTRACTS.claimCurveDAD,
                scope: CONTRACTS.claimCurveDAD,
                table: 'claimtab',
            }, 'owner', activeUser.accountName),
            ..._.map(LP_TOKENS, sym => fetchOneByPk({
                code: CONTRACTS.ecrvAdminFee,
                scope: sym,
                table: 'claimtab',
            }, 'owner', activeUser.accountName)),
        ])

        dispatch({
            type: 'SET_BALANCE_GROUP',
            payload: {
                type: 'claimable',
                balances: _.zipObject(
                    [MAIN_TOKEN, DAD_TOKEN, ...LP_TOKENS],
                    _.map(data, res => !_.isNil(res) ? parseFloat(res.issuedamt) : 0),
                )
            }
        })
    } catch (e) {

    }
}

export const eCRVStatsSelector = state => _.get(state, 'ecrv')

export const nextRoundEcrvInUsdtSelector = createSelector(
    tokenPriceSelector(MAIN_TOKEN),
    eCRVStatsSelector,
    (ecrv_usdt_price, {currround_amount}) => {
        if (!(ecrv_usdt_price > 0 && currround_amount > 0)) return 0

        return currround_amount * ecrv_usdt_price
    }
)

export const maxDADApySelector = createSelector(
    nextRoundEcrvInUsdtSelector,
    tokenPriceSelector(DAD_TOKEN),
    DADStatsSelector,
    balanceObjectSelector('locked', DAD_TOKEN),
    (next_round_ecrv_in_usdt, dad_usdt_price, {totalvcrv}, {unlockTime}) => {
        if (!(next_round_ecrv_in_usdt > 0 && dad_usdt_price > 0 && totalvcrv > 0)) return {maxApy: 0, accountApy: 0}

        const total_vcrv_in_usdt = totalvcrv / SECONDS_IN_YEAR * dad_usdt_price

        const maxApy = 365 * 100 * 24 * 0.15 * next_round_ecrv_in_usdt * 1000000 / total_vcrv_in_usdt

        const lockTimeInSeconds = dayJS.utc(unlockTime).diff(dayJS(), 'second')

        return {
            maxApy,
            accountApy: lockTimeInSeconds / SECONDS_IN_YEAR * maxApy
        }
    }
)

export const poolConfigSelector = poolId => state => _.get(state, `ecrv.poolsConfig.${poolId}`, {})

const INITIAL_STATE = {}

export const eCRVReducer = makeReducer({
    SET_TOKEN_STATS: reduceUpdateFull,
}, INITIAL_STATE, false)