import React, {useEffect} from 'react'
import _ from 'lodash'
import StakeAndLockECRV from "./StakeAndLockECRV"
import StakeLPToken from "./StakeLPToken"
import config from 'config'
import {useLocation} from "react-router-dom"
import './StakeAndLock.scss'

const {POOLS, DAD_TOKEN} = config

export default () => {
    let location = useLocation();

    useEffect(() => {
        if (!_.isEmpty(location.hash)) {
            let objControl = document.getElementById(location.hash.replace('#', ''));
            if (!_.isNil(objControl)) {
                objControl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [])

    return (
        <>
            <StakeAndLockECRV/>
            {_.map(POOLS, (p, poolId) => p.operator !== DAD_TOKEN && (
                <StakeLPToken key={`pool-stake-lp-${poolId}`} poolId={poolId}/>
            ))}
        </>
    )
}