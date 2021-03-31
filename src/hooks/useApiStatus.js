import {useState, useEffect} from 'react'
import {useSelector} from "react-redux";
import _ from 'lodash'

function useApiStatus(apiKey, onSuccess) {
    const [prevStatus, setPrevStatus] = useState('')

    const status = useSelector(state => !_.isEmpty(apiKey) ? _.get(state.api, [apiKey, 'status'], '') : '')

    useEffect(() => {
        if (status !== prevStatus){
            setPrevStatus(status)
        }
        _.isFunction(onSuccess) && status === 'success' && onSuccess()
    }, [status])

    return {
        status,
        prevStatus
    }
}

export default useApiStatus
