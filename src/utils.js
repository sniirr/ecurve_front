import _ from "lodash"
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import numeral from "numeral";
import config from 'config'
const {LOCK_INTERVALS, MAIN_TOKEN, TOKENS, WEIGHT_TOKEN} = config

dayjs.extend(utc)

export const dayJS = dayjs

export const makeReducer = (actionHandlers={}, initialState={}, globalReset = true) => (state=initialState, action) => {
    if (action.type === 'RESET_STATE' && globalReset) {
        return  initialState
    }
    if (_.isFunction(actionHandlers[action.type])) {
        return actionHandlers[action.type](state, action)
    }
    return state
}

export const reduceSetFull = (state, action) => action.payload

export const reduceUpdateFull = (state, action) => ({...state, ...action.payload})

export const reducePushPayload = (state, action) => ([...state, action.payload])

export const reduceSetKey = key => (state, action) => ({
    ...state,
    [key]: action.payload,
})

export const reduceUpdateInArrayById = (state, itemId, update = {}) => updateInArrayWhere(state, {id: itemId}, update)

export function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

export const replaceInArray = (arr, index, newItem) => {
    return _.map(arr, (o, i) => {
        return i === index ? newItem : o;
    });
}

export const updateInArray = (arr, index, update) => {
    return [
        ...arr.slice(0, index),
        {...arr[index], ...(_.isFunction(update) ? update(arr[index]) : update)},
        ...arr.slice(index + 1)
    ]
}

export const updateInArrayWhere = (arr, predicate, update) => {
    const index = _.findIndex(arr, predicate)
    return updateInArray(arr, index, update)
}

export const removeIndex = (arr, index) => {
    return [
        ...arr.slice(0, index),
        ...arr.slice(index + 1)
    ]
}

export const toFloat = (input, decimal = 6) => {
    let output = input.toString();
    output = output.slice(0, (output.indexOf(".")) + decimal + 1);
    return Number(output);
}

// CURVE specific
export const getMinLockHours = intervals => !_.isEmpty(intervals) ? getTimePeriodHoursValue(_.head(intervals).interval) : -1
export const getMaxLockHours = intervals => !_.isEmpty(intervals) ? getTimePeriodHoursValue(_.takeRight(intervals)[0].interval) : -1

export const balanceToFloat = b => {
    const fb = parseFloat(b)
    return !_.isNaN(fb) ? fb : 0
}

export const balancesToMap = (symbols, balances) => _.zipObject(
    symbols,
    _.map(balances, balanceToFloat)
)


const precisions = _.uniq(_.map(TOKENS, t => t.precision))

const PRECISION_FORMAT = _.zipObject(
    precisions,
    _.map(precisions, p => {
        if (p === 0) return '0'
        let ps = '0.'
        for (let i = 0; i < p; i++) {
            ps += '0'
        }
        return ps
    })
)

export const amountToAsset = (amount, symbol, withSymbol = true, prettify = false) => {
    const precision = _.get(TOKENS, [symbol, 'precision'], 6)
    const format = prettify ? '0,' + PRECISION_FORMAT[precision] : PRECISION_FORMAT[precision]
    return `${numeral(_.isString(amount) ? parseFloat(amount) : amount).format(format)}${withSymbol ? (' ' + symbol) : ''}`
}

export const parseAmount = (amount, symbol) => {
    const fAmount = parseFloat(amount)
    return [fAmount, amountToAsset(fAmount, symbol)]
}

export const getTimePeriodHoursValue = ({unit, value, offsetHours = 0}) => {
    const target = dayJS().add(value, unit)
    return  target.diff(dayJS(), 'hour') + offsetHours
}

// custom strings
export const getVCRVString = (balance, lockHours) => {
    const maxLockHours = getMaxLockHours(LOCK_INTERVALS[MAIN_TOKEN])
    const vecrvAmount = (balance * lockHours / maxLockHours).toFixed(4)
    return `${numeral(vecrvAmount).format('0,0.[0000]')} ${WEIGHT_TOKEN}`
}

export const removeComma = v => v.replace(/\,/g, '')
