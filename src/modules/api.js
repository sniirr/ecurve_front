import React from "react";
import {JsonRpc, RpcError} from 'eosjs';
import _ from 'lodash'
import axios from 'axios'
import {toast} from 'react-toastify';
import {makeReducer} from "utils"
import config from 'config'
const {CHAIN, BLOCKS_URL, ECURVE_API_URL} = config

const {host, port, protocol} = _.get(CHAIN, ['rpcEndpoints', 0])
const rpc = new JsonRpc(`${protocol}://${host}:${port}`)

// fetch
export const fetchTableData = async opts => rpc.get_table_rows({
    json: true,                 // Get the response as json
    limit: 10,                  // Maximum number of rows that we want to get
    reverse: false,             // Optional: Get reversed data
    show_payer: false,          // Optional: Show ram payer
    ...opts,
})

export const fetchOne = async opts => {
    const res = await fetchTableData({...opts, limit: 1})
    return _.get(res, ['rows', 0])
}

export const fetchOneByPk = async (opts, pkFieldName, pk) => {
    const res = await fetchTableData({...opts, lower_bound: pk, limit: 1})

    let processedData = res
    // const {lower_bound: pk} = opts
    const row = _.get(res, ['rows', 0])
    if (!_.isNil(row) && !_.isEmpty(pkFieldName)) {
        if (row[pkFieldName] !== pk) {
            processedData = {rows: []}
        }
    }

    return _.get(processedData, ['rows', 0])
}

export const fetchTokenStats = ({contract, symbol}) => rpc.get_currency_stats(contract, symbol)

export const getTableData = (opts, {apiKey, callback} = {}) => async dispatch => {
    let res
    try {
        dispatch(setStatus(apiKey, {status: 'pending'}))
        res = await rpc.get_table_rows({
            json: true,                 // Get the response as json
            limit: 10,                  // Maximum number of rows that we want to get
            reverse: false,             // Optional: Get reversed data
            show_payer: false,          // Optional: Show ram payer
            ...opts,
        })
        _.isFunction(callback && callback(res))
        dispatch(setStatus(apiKey, {status: 'success', fetched: true}))
    } catch (e) {
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
        dispatch(setStatus(apiKey, {status: 'error', error: 'Failed to fetch data'}))
    }

    return res
}

export const getSingleRow = (opts, pkFieldName, {apiKey, callback} = {}) => {
    return getTableData({...opts, limit: 1}, {
        apiKey,
        callback: data => {
            if (!_.isFunction(callback)) return

            let processedData = data
            const {lower_bound: pk} = opts
            const row = _.get(data, ['rows', 0])
            if (!_.isNil(row)) {
                if (row[pkFieldName] !== pk) {
                    processedData = {rows: []}
                }
            }

            callback(processedData)
        }
    })
}

export const fetchCurrencyBalance = async (accountName, {contract, symbol}) => {
    try {
        return await rpc.get_currency_balance(contract, accountName, symbol)
    } catch (error) {
        return {success: false, error}
    }
}

export const requestEcurveApi = endpoint => axios(`${ECURVE_API_URL}${endpoint}`)

// transact
export const createTransferAction = (from, quantity, {contract, symbol}, to) => {
    return {
        account: contract,
        name: 'transfer',
        data: {
            from,
            to,
            quantity,
            memo: from,
        },
    }
}

export const transact = (activeUser, actions, {apiKey, callback, errorCallback} = {}) => async dispatch => {
    const permission = !_.isNil(activeUser.scatter)
        ? _.get(activeUser.scatter, ['identity', 'accounts', 0, 'authority'])
        : activeUser.requestPermission
    try {
        dispatch(setStatus(apiKey, {status: 'pending'}))
        const response = await activeUser.signTransaction({
            actions: _.map(actions, action => ({
                ...action,
                authorization: [{
                    actor: activeUser.accountName,
                    permission,
                }],
            }))
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        })

        const {transactionId} = response

        dispatch(setStatus(apiKey, {status: 'success'}))

        if (_.isFunction(callback)) {
            setTimeout(() => {
                dispatch(callback)
            }, 1500)
        }

        toast.success(<div onClick={e => e.stopPropagation()}>
            <div>Tx Successful:</div>
            <a target="_blank" rel="noreferrer"
               href={`https://${BLOCKS_URL}/transaction/${transactionId}`}>{transactionId}</a>
        </div>)
    } catch (e) {
        let message = _.get(e, ['cause', 'json', 'error', 'details', 0, 'message'])
        if (_.isEmpty(message)) {
            message = _.get(e, ['cause', 'message'], 'Unknown error')
        }
        dispatch(setStatus(apiKey, {status: 'error', error: message}))
        toast.error(message)
        _.isFunction(errorCallback) && errorCallback()
    }
}

// REDUX
export const setStatus = (apiKey, status) => dispatch => {
    if (_.isEmpty(apiKey)) return
    dispatch({
        type: 'SET_API_STATUS',
        payload: {apiKey, status}
    })
}

export const apiReducer = makeReducer({
    SET_API_STATUS: (state, action) => {
        const {apiKey, status} = action.payload

        return _.isEmpty(apiKey) ? state : {
            ...state,
            [apiKey]: {
                ...state[apiKey],
                ...status,
            },
        }
    },
})











