import React, {useEffect} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import {selectedPoolSelector} from "store/uiReducer";
import {fetchPoolFeeStats} from "modules/pools";
import {fetchTokenPrices} from "modules/prices";
import {fetchBoostData} from "modules/boost";
import {fetchDADStats} from "modules/dad";

const Page = ({children}) => {

    const dispatch = useDispatch()
    const poolId = useSelector(selectedPoolSelector)

    useEffect(() => {
        if (!_.isEmpty(poolId)) {
            dispatch(fetchPoolFeeStats(poolId))
        }
        dispatch(fetchTokenPrices())
        dispatch(fetchBoostData())
        dispatch(fetchDADStats())
    }, [])

    return children
}

export default Page
