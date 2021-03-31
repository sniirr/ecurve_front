import {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import _ from 'lodash'
import {fetchAccountPoolBalances} from "modules/balances";
import {fetchPoolData} from "modules/pools";
import useOnLogin from "./useOnLogin";

function usePoolLoader(poolId) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const accountName = activeUser?.accountName

    useEffect(() => {
        dispatch(fetchPoolData(poolId))
    }, [])

    useOnLogin(() => {
        dispatch(fetchAccountPoolBalances(accountName, poolId))
    })
}

export default usePoolLoader
