import { combineReducers } from 'redux';
import {makeReducer, reduceSetFull} from "../utils";
import {apiReducer} from 'modules/api'
import {balancesReducer} from "../modules/balances";
import {eCRVReducer} from "modules/ecrv";
import {poolsReducer} from "modules/pools";
import {pricesReducer} from 'modules/prices'
import {dadReducer} from 'modules/dad'
import {useECRVReducer} from 'routes/UseECRV/UseECRV.reducer'

const activeUser = makeReducer({
    SET_ACTIVE_USER: reduceSetFull,
}, {})

const rootReducer = combineReducers({
    activeUser,
    api: apiReducer,
    balances: balancesReducer,
    prices: pricesReducer,
    ecrv: eCRVReducer,
    dad: dadReducer,
    pools: poolsReducer,
    useECRV: useECRVReducer,
});

export default rootReducer;