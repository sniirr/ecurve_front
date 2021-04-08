import React from 'react'
import {useSelector} from "react-redux";
import {poolECRVApySelector} from "modules/pools";

const PoolApy = ({poolId}) => {
    const {basePoolApy, maxPoolApy} = useSelector(poolECRVApySelector(poolId))

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

export default PoolApy