import React, {Fragment} from 'react'
import {claim} from "modules/wallet"
import {useDispatch, useSelector} from "react-redux"
import _ from 'lodash'
import Button from 'components/Inputs/Button'
import {balancesSelector} from "modules/balances"
import config from "config"
import classNames from "classnames";
import './ClaimBox.scss'
import {amountToAsset} from "utils";

const { MAIN_TOKEN, DAD_TOKEN } = config

const ClaimBox = () => {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const claimable = useSelector(state => {
        const claimable = balancesSelector('claimable')(state)

        const fromLP = _.get(claimable, MAIN_TOKEN, 0)
        const fromDAD = _.get(claimable, DAD_TOKEN, 0)
        const symbols = []
        if (fromLP > 0) symbols.push(MAIN_TOKEN)
        if (fromDAD > 0) symbols.push('DAD')

        const adminFees = _.pickBy(claimable, (balance, sym) => sym !== MAIN_TOKEN && sym !== DAD_TOKEN && balance > 0)

        return {
            fromLP,
            fromDAD,
            symbols: [...symbols, ..._.keys(adminFees)],
            adminFees,
        }
    })

    return (
        <div className={classNames("top-section claim")}>
            <div className="top-section-title">{MAIN_TOKEN}</div>
            <div className="top-section-content">
                <div className="claim-box">
                    <div className="claim-rows">
                        <div className="claim-row">
                            Liquidity Mining Rewards:
                            <span className="claim-amount">{amountToAsset(claimable.fromLP, MAIN_TOKEN, false, true)}</span> {MAIN_TOKEN}
                        </div>
                        <div className="claim-row">
                            DAD Locking Rewards:
                            <span className="claim-amount">{amountToAsset(claimable.fromDAD, MAIN_TOKEN, false, true)}</span> {MAIN_TOKEN}
                        </div>
                        <div className="claim-row">
                            Admin Fees:
                            {_.size(claimable.adminFees) > 0 ? _.map(claimable.adminFees, (value, sym) => (
                                <Fragment key={`admin-fee-entry-${sym}`}><span className="claim-amount">{amountToAsset(value, sym, false, true)}</span> {sym}</Fragment>
                            )) : (
                                <><span className="claim-amount">0</span> TRIPOOL</>
                            )}
                        </div>
                    </div>
                    <Button apiKey="claim"
                            disabled={_.isEmpty(claimable.symbols)}
                            onClick={() => dispatch(claim(activeUser, claimable.symbols))}>Claim Rewards</Button>
                </div>
            </div>
        </div>
    );
}

export default ClaimBox