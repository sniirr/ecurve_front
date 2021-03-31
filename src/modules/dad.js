import {makeReducer, reduceUpdateFull} from "utils";
import {fetchOne} from "modules/api"
import _ from "lodash";
import config from 'config'

const {CONTRACTS} = config

export const fetchDADStats = () => async dispatch =>{
    try {
        const {oldtotamt: total_dad_locked} = await fetchOne({
            code: CONTRACTS.dadLock,
            scope: CONTRACTS.dadLock,
            table: 'totallock1',
        })

        dispatch({
            type: 'SET_DAD_STATS',
            payload: {
                total_dad_locked: parseFloat(total_dad_locked),
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