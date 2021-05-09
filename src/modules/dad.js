import {makeReducer, reduceUpdateFull} from "utils";
import {fetchOne} from "modules/api"
import _ from "lodash";
import config from 'config'

const {CONTRACTS} = config

export const fetchDADStats = () => async dispatch =>{
    try {
        const {totalvcrv} = await fetchOne({
            code: CONTRACTS.dadLock,
            scope: CONTRACTS.dadLock,
            table: 'totalvcrv',
        })

        dispatch({
            type: 'SET_DAD_STATS',
            payload: {
                totalvcrv: parseFloat(totalvcrv),
            }
        })
    } catch (e) {

    }
}

export const DADStatsSelector = state => _.get(state, 'dad')

const INITIAL_STATE = {}

export const dadReducer = makeReducer({
    SET_DAD_STATS: reduceUpdateFull,
}, INITIAL_STATE, false)