import {makeReducer, reduceSetKey} from "utils";
import _ from "lodash";
import config from 'config'
import {fetchOneByPk, fetchTableData, transact} from "modules/api";

const {CONTRACTS} = config

export const fetchAirdrops = () => async dispatch => {
    try {
        const [airdropdet, diststat] = await Promise.all([
            fetchTableData({
                code: CONTRACTS.airdrops,
                scope: CONTRACTS.airdrops,
                table: 'airdropdet',
            }),
            fetchTableData({
                code: CONTRACTS.airdrops,
                scope: CONTRACTS.airdrops,
                table: 'diststat',
            })
        ])

        const data = _.map(airdropdet.rows, ({airdrop_sym, t_amount, r_amount, number_of_rounds, startround}) => {
            const {round_distributed} = _.find(diststat.rows, {airdropsym: airdrop_sym})
            const [precision, symbol] = _.split(airdrop_sym, ',')
            return {
                symbol, precision,
                airdrop_sym, t_amount, r_amount, number_of_rounds, startround, round_distributed,
                claimable: 0,
            }
        })

        dispatch({
            type: 'SET_AIRDROPS',
            payload: data,
        })
    }
    catch (e) {

    }
}

export const fetchAccountAirdrops = activeUser => async (dispatch, getState) => {
    try {
        const {airdrops} = airdropsSelector(getState())
        const data = await Promise.all(
            _.map(airdrops, ({symbol}) => fetchOneByPk({
                code: CONTRACTS.airdrops,
                scope: symbol,
                table: 'claimtab',
            }, 'owner', activeUser.accountName))
        )

        dispatch({
            type: 'SET_ACCOUNT_AIRDROPS',
            payload: _.map(data, 'issuedamt')
        })
    }
    catch (e) {

    }
}

export const claimAirdrop = (activeUser, symbol) => dispatch => {
    if (_.isEmpty(activeUser)) return

    dispatch(transact(
        activeUser,
        [{
            account: CONTRACTS.airdrops,
            name: 'claim',
            data: {
                owner: activeUser.accountName,
                airdropsym: symbol,
            },
        }],
        {
            apiKey: `claim-airdrop-${symbol}`,
            callback: dispatch => dispatch(fetchAccountAirdrops(activeUser)),
        }
    ))
}

export const airdropsSelector = state => _.get(state, 'airdrops')

const INITIAL_STATE  = {
    airdrops: [],
    claimable: []
}

export const airdropsReducer = makeReducer({
    SET_AIRDROPS: reduceSetKey('airdrops'),
    SET_ACCOUNT_AIRDROPS: reduceSetKey('claimable'),
}, INITIAL_STATE, false)