import React from 'react'
import {unlock} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import {amountToAsset, getVCRVString} from "utils";
import Countdown from "react-countdown";
import useLocking from "hooks/useLocking";
import Button from "../Inputs/Button";
import config from 'config'
const {MAIN_TOKEN} = config

const UnlockForm = ({symbol}) => {
    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const {
        hasUnlocked,
        lockedBalance,
        unlockedBalance,
        unlocksAtUTC,
        remainingLock,
    } = useLocking(symbol)

    const onSubmit = () => {
        dispatch(unlock(activeUser, symbol))
    }

    const {handleSubmit} = useForm();

    const renderContent = () => {
        if (hasUnlocked) {
            return (
                <div className="claim-box">
                    <div>
                        Unlocked {symbol}: <span className="claim-amount">{amountToAsset(unlockedBalance, symbol, true, true)}</span>
                    </div>
                    <Button apiKey="unlock" onClick={handleSubmit(onSubmit)}>Claim</Button>
                </div>
            )
        }

        if (remainingLock === 0) {
            return (
                <div className="unlock-time">
                    Unlocking {amountToAsset(lockedBalance, symbol, true, true)} (<Countdown date={unlocksAtUTC}/>)
                </div>
            )
        }

        if (remainingLock > 0) {
            return (
                <div className="unlock-time">
                    <div>
                        {amountToAsset(lockedBalance, symbol, true, true)} are locked until {unlocksAtUTC.local().format('DD MMM YYYY HH:mm:ss')} (<Countdown date={unlocksAtUTC}/>)
                    </div>
                    {symbol === MAIN_TOKEN && <div className="weight">Your current mining power: {getVCRVString(lockedBalance, remainingLock)}</div>}
                </div>
            )
        }

        return (
            <div className="">You have 0 locked {symbol}</div>
        )
    }

    return (
        <form>
            <div className="form-inputs">
                {renderContent()}
            </div>
        </form>
    )
}

export default UnlockForm