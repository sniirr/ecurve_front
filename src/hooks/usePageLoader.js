import {useEffect} from 'react'
import {useDispatch} from "react-redux";
import {fetchPoolFeeStats} from "modules/pools";
import {fetchTokenPrices} from 'modules/prices'
import {fetchBoostData} from "modules/boost";
import {fetchDADStats} from "modules/dad";

function usePageLoader(poolId) {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchPoolFeeStats(poolId))
        dispatch(fetchTokenPrices())
        dispatch(fetchBoostData())
        dispatch(fetchDADStats())
    }, [])
}

export default usePageLoader
