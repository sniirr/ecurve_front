import React, {useEffect, useRef} from 'react'
import {useDispatch, useSelector} from "react-redux"
import _ from 'lodash'
import config from "config"
import classNames from "classnames";
import {eCRVStatsSelector, fetchEcrvStats, maxDADApySelector} from "modules/ecrv";
import './OverviewBox.scss'
import Countdown from "react-countdown";
import {amountToAsset, dayJS} from "utils";
import {pricesSelector} from "modules/prices";

const {MAIN_TOKEN, DAD_TOKEN} = config

const OverviewBox = () => {

    const dispatch = useDispatch()

    const countdown = useRef(null)

    const {currround, currround_amount, lastupdate, totalSupply} = useSelector(eCRVStatsSelector)
    const prices = useSelector(pricesSelector)
    const dadMaxApy = useSelector(maxDADApySelector)

    useEffect(() => {
        dispatch(fetchEcrvStats())
    }, [])

    useEffect(() => {
        if (!_.isNil(countdown.current)) {
            countdown.current.getApi().start()
        }
    }, [currround])

    const roundEndsAt = dayJS.utc(lastupdate).add(1, 'hour')

    const countdownRenderer = ({hours, minutes, seconds}) => `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`

    const onCountdownComplete = () => {
        setTimeout(() => {
            dispatch(fetchEcrvStats())
        }, 5000)
    }

    return (
        <div className={classNames("top-section overview")}>
            <div className="top-section-title">eCurve</div>
            <div className="top-section-content">
                <div className="overview-box">
                    <div className="left">
                        <div className="text-bold">{MAIN_TOKEN} is distributed every hour!</div>
                        <div className="sbs">
                            <div>
                                <div className="text-small">Current Round</div>
                                <div className="num">{currround}</div>
                            </div>
                            <div>
                                <div className="text-small">Ends in</div>
                                <div className="num">
                                    {!_.isEmpty(lastupdate) ? (
                                        <Countdown ref={countdown} date={roundEndsAt} renderer={countdownRenderer} onComplete={onCountdownComplete}/>
                                    ) : '0:00:00'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-small">Round Distribution</div>
                            <div className="num">{amountToAsset(currround_amount, MAIN_TOKEN, true, true)}</div>
                        </div>
                    </div>
                    <div className="right">
                        <div>&nbsp;</div>
                        <div className="sbs">
                            <div>
                                <div className="text-small">ECRV Price</div>
                                <div className="num">{_.get(prices, MAIN_TOKEN, 0).toFixed(4)}$</div>
                            </div>
                            <div>
                                <div className="text-small">Circulating Supply</div>
                                <div className="num">{amountToAsset(totalSupply, MAIN_TOKEN, true, true)}</div>
                            </div>
                        </div>
                        <div className="sbs">
                            <div>
                                <div className="text-small">DAD Price</div>
                                <div className="num">{_.get(prices, DAD_TOKEN, 0).toFixed(4)}$</div>
                            </div>
                            <div>
                                <div className="text-small">DAD Locking Max APY</div>
                                <div className="num">{dadMaxApy.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverviewBox