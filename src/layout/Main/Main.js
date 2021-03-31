import React from 'react'
import _ from 'lodash'
import ClaimBox from "components/ClaimBox"
import PoolInfo from "components/PoolInfo"
import {useLocation} from "react-router-dom"
import Menu from 'layout/Menu'
import Routes from 'routes'
import Banner from 'components/Banner'

const Main = ({poolId, isLoggedIn, ual}) => {
    let location = useLocation();
    const isPoolView = _.includes(['/', '/deposit', '/withdraw'], location.pathname)

    const renderBanner = () => {
        if (!isLoggedIn) return (
            <Banner className="not-logged-in">
                Wallet not connected, click <span onClick={ual.showModal}>Login</span> to connect
            </Banner>
        )

        if (isPoolView) return (
            <div className="bifrost-border">
                <Banner>
                    Use <a href="https://bifrost.fi" target="_blank" rel="noopener noreferrer">Bifrost.fi</a> to bridge USDC and DAI from Ethereum
                </Banner>
            </div>
        )

        return null
    }

    return (
        <>
            {isPoolView ? <PoolInfo poolId={poolId}/> : <ClaimBox/>}
            <Menu/>
            <div className="main">
                {renderBanner()}
                <Routes/>
            </div>
        </>
    )
}

export default Main
