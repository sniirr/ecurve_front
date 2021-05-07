import React, {useMemo} from 'react'
import {useSelector} from "react-redux";
import {makePoolMiningApySelector} from "modules/pools";

const PoolAPY = ({poolId}) => {

    const poolMiningApySelector = useMemo(makePoolMiningApySelector(poolId), [poolId])

    const {basePoolApy, maxPoolApy} = useSelector(poolMiningApySelector)

    return (
        <div className="apys">
            <div className="apy-sbs">
                <div className="text">Base</div>
                <div className="num">{basePoolApy.toFixed(2)}%</div>
            </div>
            <div className="apy-sbs">
                <div className="text">Max</div>
                <div className="num">{maxPoolApy.toFixed(2)}%</div>
            </div>
        </div>
    )
}

export default PoolAPY