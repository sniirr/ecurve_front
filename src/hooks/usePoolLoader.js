import {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import _ from 'lodash'
import {fetchAccountPoolBalances} from "modules/balances";
import {fetchDefiboxPoolData, fetchHegeosPoolData, fetchPoolData} from "modules/pools";
import useOnLogin from "./useOnLogin";
import config from 'config'
import {tokenPriceSelector} from "modules/prices";

const {POOLS} = config

const getFetchPoolData = ({id: poolId, operator}) => {
    if (operator === 'Defibox') {
        return fetchDefiboxPoolData
    }
    return fetchPoolData
}

function usePoolLoader(poolId) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const accountName = activeUser?.accountName

    const eosPrice = useSelector(tokenPriceSelector('EOS'))

    const isECurvePool = _.get(POOLS, [poolId, 'operator']) === 'eCurve'

    useEffect(() => {
        if (poolId !== POOLS.EHEGIC.id) {
            dispatch(getFetchPoolData(POOLS[poolId])(poolId))
        }
    }, [poolId])

    // specific hook for Hegeos pool, it requires eosPrice to be available
    useEffect(() => {
        if (poolId === POOLS.EHEGIC.id && _.isNumber(eosPrice)) {
            dispatch(fetchHegeosPoolData())
        }
    }, [eosPrice])

    useOnLogin(() => {
        if (isECurvePool) {
            dispatch(fetchAccountPoolBalances(accountName, poolId))
        }
    })
}

export default usePoolLoader
