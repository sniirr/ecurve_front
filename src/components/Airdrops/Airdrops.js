import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import useOnLogin from "hooks/useOnLogin";
import {airdropsSelector, claimAirdrop, fetchAccountAirdrops, fetchAirdrops} from "modules/airdrops";
import TokenSymbol from "components/TokenSymbol";
import {amountToAsset} from "utils";
import Button from "components/Inputs/Button";
import numeral from 'numeral'
import './Airdrops.scss'

export const Airdrops = () => {
    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const {airdrops, claimable} = useSelector(airdropsSelector)

    useEffect(() => {
        dispatch(fetchAirdrops())
    }, [])

    const adCount = _.size(airdrops)

    useOnLogin(() => {
        dispatch(fetchAccountAirdrops(activeUser))
    }, [adCount])

    if (_.size(airdrops) === 0) return null

    return (
        <div className="section airdrops">
            <div className="section-header">
                <h3>Airdrops</h3>
            </div>
            {_.map(airdrops, ({symbol, precision, airdrop_sym, t_amount, r_amount, number_of_rounds, startround, round_distributed}, i) => {
                const claimableTokens = _.get(claimable, i, 0)
                return (
                    <div key={`airdrop-${i}`} className="airdrop-item">
                        <div className="airdrop-overview">
                            <TokenSymbol symbol={symbol}/>
                            <div>
                                <span className="text-bold">{amountToAsset(t_amount, symbol, true, true, precision)}</span> will be airdropped over {number_of_rounds} rounds starting round {numeral(startround).format('0,0.[0000]')}
                            </div>
                        </div>
                        <div className="airdrop-stats">
                            <div className="sbs">
                                <div>
                                    <div className="text-small">Round Distribution</div>
                                    <div className="num">{r_amount}</div>
                                </div>
                                <div>
                                    <div className="text-small">Current Round</div>
                                    <div className="num">{round_distributed}/{number_of_rounds}</div>
                                </div>
                            </div>
                            <div className="sbs">
                                <div>
                                    <div className="text-small">Claimable Tokens</div>
                                    <div className="num">{amountToAsset(claimableTokens, symbol, true, true, precision)}</div>
                                </div>
                                <div>
                                    <Button apiKey={`claim-airdrop-${airdrop_sym}`}
                                            disabled={claimableTokens === 0}
                                            onClick={() => dispatch(claimAirdrop(activeUser, airdrop_sym))}>Claim</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Airdrops