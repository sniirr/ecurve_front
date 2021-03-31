import React from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import SyncLoader from "react-spinners/SyncLoader";

const ApiSuspense = ({apiKey, children}) => {

    const isPending = useSelector(state => {
        const keys = _.isArray(apiKey) ? apiKey : [apiKey]
        return _.some(keys, key => {
            const {status, fetched} = _.get(state.api, key, {})
            return status === 'pending' && !fetched
        })
    })

    return isPending ? (
        <div className="loading">
            <SyncLoader color="#4c859e" loading css={{}} size={20} margin={3}/>
        </div>
    ) : children
}

export default ApiSuspense