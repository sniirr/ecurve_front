import {makeReducer, reduceSetKey} from "utils";
import _ from "lodash";

export const selectPool = poolId => ({
    type: 'UI.SELECT_POOL',
    payload: poolId
})

export const selectedPoolSelector = state => _.get(state, 'ui.selectedPool')

export const uiReducer = makeReducer({
    'UI.SELECT_POOL': reduceSetKey('selectedPool'),
}, {
    selectedPool: 'TRIPOOL',
}, false)