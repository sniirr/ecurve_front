import React, {useEffect} from 'react'
import {useDispatch} from "react-redux";
import {fetchPoolFeeStats} from "modules/pools";
import {fetchTokenPrices} from "modules/prices";
import {fetchBoostData} from "modules/boost";
import {fetchDADStats} from "modules/dad";

const Page = ({children}) => {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchPoolFeeStats())
        dispatch(fetchTokenPrices())
        dispatch(fetchBoostData())
        dispatch(fetchDADStats())
    }, [])

    return children
}

export default Page
