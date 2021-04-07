import React from 'react'
import _ from 'lodash'
import StakeAndLockECRV from "./StakeAndLockECRV"
import StakeLPToken from "./StakeLPToken"
import config from 'config'

const {POOLS} = config

export default () => (
    <>
        <StakeAndLockECRV/>
        {_.map(POOLS, (p, poolId) => (
            <StakeLPToken key={`pool-stake-lp-${poolId}`} poolId={poolId}/>
        ))}
    </>
)