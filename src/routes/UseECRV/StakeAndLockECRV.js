import React, {useEffect} from 'react'
import LockForm from "components/Forms/LockForm";
import UnlockForm from "components/Forms/UnlockForm";
import IncrLockAmountForm from "components/Forms/IncrLockAmountForm";
import IncrLockPeriodForm from "components/Forms/IncrLockPeriodForm";
import {fetchLockInfo, fetchUnlockInfo, lock} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import classNames from 'classnames'
import useLocking from "hooks/useLocking";
import ApiSuspense from 'components/Inputs/ApiSuspense'
import {fetchBalance} from "modules/balances";
import useOnLogin from "hooks/useOnLogin";
import config from 'config'
import {fetchBoostData} from "modules/boost";
import {fetchRewards} from 'modules/ecrv'

const {MAIN_TOKEN, LOCK_INTERVALS, TOKENS} = config

const LockToken = ({symbol}) => {

    const {hasUnlocked, remainingLock} = useLocking(symbol)

    const displayLockForm = remainingLock <= 0

    const renderCover = () => {
        let coverMessage = ''

        if (hasUnlocked) {
            coverMessage = 'You must claim your unlocked tokens before re-initiating a lock'
        } else if (remainingLock === 0) {
            coverMessage = 'Your tokens are Unlocking, you can re-initiate lock once unlocking is done'
        }

        return !_.isEmpty(coverMessage) ? (
            <div className="disable-cover">
                <div className="bg"/>
                <div className="cover-content">{coverMessage}</div>
            </div>
        ) : null
    }

    return (
        <div
            className={classNames("stake-unstake", {'wide-right': !displayLockForm, 'with-columns': !displayLockForm})}>
            {displayLockForm ? (
                <LockForm lock={lock} symbol={symbol} intervals={LOCK_INTERVALS[symbol]}/>
            ) : (
                <>
                    <IncrLockAmountForm symbol={symbol}/>
                    <IncrLockPeriodForm symbol={symbol} intervals={LOCK_INTERVALS[symbol]}/>
                </>
            )}
            {renderCover()}
        </div>
    );
}

const StakeAndLockECRV = () => {

    const symbol = MAIN_TOKEN

    const dispatch = useDispatch()
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const {hasLocked} = useLocking(symbol)

    useOnLogin(async () => {
        dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
        dispatch(fetchLockInfo(activeUser, symbol))
        dispatch(fetchUnlockInfo(activeUser, symbol))
        dispatch(fetchRewards(activeUser))
        dispatch(fetchBoostData(activeUser))
    })

    useEffect(() => {
        return () => {
            dispatch({type: 'RESET_TEMP_LOCK_ARG'})
        }
    }, [])

    return (
        <div className="section stake-and-lock boost">
            <ApiSuspense apiKey={[`fetch-lock-${symbol}`, `fetch-unlock-${symbol}`]}>
                <div className="section-header">
                    <h3>Lock {MAIN_TOKEN} to boost LP mining</h3>
                </div>
                {hasLocked && (
                    <div className="section-top">
                        <UnlockForm symbol={symbol}/>
                    </div>
                )}
                <LockToken symbol={symbol}/>
            </ApiSuspense>
        </div>
    );
}

export default StakeAndLockECRV