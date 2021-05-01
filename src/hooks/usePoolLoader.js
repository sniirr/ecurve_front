import {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import _ from 'lodash'
import {fetchAccountPoolBalances} from "modules/balances";
import {fetchDefiboxPoolData, fetchPoolData} from "modules/pools";
import useOnLogin from "./useOnLogin";
import config from 'config'

const {POOLS} = config

function usePoolLoader(poolId) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const accountName = activeUser?.accountName

    const is3rdPartyPool = _.get(POOLS, [poolId, 'operator']) !== 'eCurve'

    useEffect(() => {
        dispatch(is3rdPartyPool ? fetchDefiboxPoolData(poolId) : fetchPoolData(poolId))
    }, [poolId])

    useOnLogin(() => {
        if (!is3rdPartyPool) {
            dispatch(fetchAccountPoolBalances(accountName, poolId))
        }
    })
}

export default usePoolLoader
