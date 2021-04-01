import {makeReducer, reduceUpdateFull} from "utils";
import {fetchOne, fetchOneByPk} from "modules/api"
import _ from "lodash";
import config from 'config'
import {createSelector} from "reselect";
import {tokenPriceSelector} from "./prices";
import {DADStatsSelector} from './dad'

const {CONTRACTS, LP_TOKENS, MAIN_TOKEN, DAD_TOKEN} = config

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
    (next_round_ecrv_in_usdt, dad_usdt_price, {total_dad_locked}) => {
        if (!(next_round_ecrv_in_usdt > 0 && dad_usdt_price > 0)) return 0

        const total_stake_in_usdt = total_dad_locked * dad_usdt_price
        return 365 * 100 * 24 * 0.15 * next_round_ecrv_in_usdt / total_stake_in_usdt
    }
)

const INITIAL_STATE = {}

export const eCRVReducer = makeReducer({
    SET_TOKEN_STATS: reduceUpdateFull,
}, INITIAL_STATE, false)