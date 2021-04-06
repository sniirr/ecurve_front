import React from 'react'
import StakeForm from 'components/Forms/StakeForm'
import UnlockForm from "components/Forms/UnlockForm";
import IncrLockAmountForm from "components/Forms/IncrLockAmountForm";
import IncrLockPeriodForm from "components/Forms/IncrLockPeriodForm";
import {fetchLockInfo, fetchStakedToken, lock} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import classNames from 'classnames'
import useLocking from "hooks/useLocking";
import ApiSuspense from 'components/Inputs/ApiSuspense'
import {fetchBalance, balanceSelector} from "modules/balances";
import useOnLogin from "hooks/useOnLogin";
import {fetchRewards, maxDADApySelector} from "modules/ecrv";
import config from 'config'

const {MAIN_TOKEN, LOCK_INTERVALS, TOKENS, DAD_TOKEN} = config

export const StakeAndLockDAD = () => {

    const symbol = DAD_TOKEN

    const dispatch = useDispatch()
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const {hasLocked} = useLocking(symbol)
    const stakedBalance = useSelector(balanceSelector('staked', symbol))
    const dadMaxApy = useSelector(maxDADApySelector)

    const hasStaked = stakedBalance > 0

    useOnLogin(() => {
        dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
        dispatch(fetchStakedToken(activeUser, symbol))
        dispatch(fetchLockInfo(activeUser, symbol))
        dispatch(fetchRewards(activeUser))
    })

    const renderTopContent = () => {
        if (hasLocked) return (
            <div className="section-top">
                <UnlockForm symbol={symbol}/>
            </div>
        )
        if (hasStaked) return (
            <div className="section-top">
                <div className="unlock-time">
                    Staked DAD balance {stakedBalance.toFixed(6)} {symbol}
                </div>
            </div>
        )

        return null
    }

    const renderContent = () => {
        if (hasLocked) return (
            <>
                <IncrLockAmountForm symbol={symbol}/>
                <IncrLockPeriodForm symbol={symbol} intervals={LOCK_INTERVALS[symbol]}/>
            </>
        )

        return (
            <>
                <StakeForm symbol={symbol} withTitle/>
                <IncrLockPeriodForm symbol={symbol} title="Lock your staked DAD" buttonText="Lock DAD" apiKey="lock"
                                    intervals={LOCK_INTERVALS[symbol]}
                                    increaseLock={(activeUser, symbol, lockPeriod) => lock(activeUser, 0, symbol, lockPeriod)}/>
            </>
        )
    }

    const renderWarningMessage = () => {
        const warningMessage = hasLocked
            ? ""
            : "Locking DAD will lock all your currently staked DAD"

        return !_.isEmpty(warningMessage) && (
            <div className="submit-container">
                <div className="receive-message error"><span className="exclamation">!</span>{warningMessage}</div>
            </div>
        )
    }

    return (
        <div className="section stake-and-lock boost dad">
            <ApiSuspense apiKey={[`fetch-lock-${symbol}`, `fetch-unlock-${symbol}`]}>
                <div className="section-header">
                    <h3>Lock staked DAD to receive {MAIN_TOKEN} rewards</h3>
                    <div className="apy success">
                        DAD Locking Max APY {dadMaxApy.toFixed(2)}%
                    </div>
                </div>
                {renderTopContent()}
                <div className={classNames("stake-unstake", {'wide-right': true, 'with-columns': true})}>
                    {renderContent()}
                </div>
                {renderWarningMessage()}
            </ApiSuspense>
        </div>
    );
}

export default StakeAndLockDAD