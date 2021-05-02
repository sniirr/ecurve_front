import React from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import SyncLoader from "react-spinners/SyncLoader";

const ApiSuspense = ({apiKey, withLoader = true, strict = false, children}) => {

    const isPending = useSelector(state => {
        const keys = _.isArray(apiKey) ? apiKey : [apiKey]
        return _.some(keys, key => {
            const {status, fetched} = _.get(state.api, key, {})
            const pending = strict ? _.isEmpty(status) || status === 'pending' : status === 'pending'
            return pending && !fetched
        })
    })

    if (isPending) return withLoader ? (
        <div className="loading">
            <SyncLoader color="#4c859e" loading css={{}} size={20} margin={3}/>
        </div>
    ) : null

    return children
}

export default ApiSuspense