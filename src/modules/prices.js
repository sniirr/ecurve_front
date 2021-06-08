import {makeReducer, reduceUpdateFull} from "utils";
import {fetchOneByPk} from "modules/api"
import _ from "lodash";
import config from 'config'

const {MAIN_TOKEN, DAD_TOKEN} = config

const fetchDefiboxPair = id => fetchOneByPk({
    code: 'swap.defi',
    scope: 'swap.defi',
    table: 'pairs',
}, 'id', id)

export const fetchTokenPrices = () => async dispatch => {
    try {
        const data = await Promise.all([
            fetchDefiboxPair(1237), // ECRV/EOS
            fetchDefiboxPair(12),   // EOS/USDT
            fetchDefiboxPair(588),  // DAD/EOS
        ])

        let ecrv_eos_price = _.get(data, [0, 'price1_last'], '0')
        let eos_usdt_price = _.get(data, [1, 'price0_last'], '0')
        let dad_eos_price = _.get(data, [2, 'price1_last'], '0')

        ecrv_eos_price = parseFloat(ecrv_eos_price)
        eos_usdt_price = parseFloat(eos_usdt_price)
        dad_eos_price = parseFloat(dad_eos_price)

        dispatch({
            type: 'SET_TOKEN_PRICES',
            payload: {
                EOS: eos_usdt_price,
                [MAIN_TOKEN]: ecrv_eos_price * eos_usdt_price,
                [DAD_TOKEN]: dad_eos_price * eos_usdt_price,
            }
        })
    } catch (e) {

    }
}

export const pricesSelector = state => _.get(state, 'prices')
export const tokenPriceSelector = symbol => state => _.get(state, ['prices', symbol])

const INITIAL_STATE = {}

export const pricesReducer = makeReducer({
    SET_TOKEN_PRICES: reduceUpdateFull,
}, INITIAL_STATE, false)