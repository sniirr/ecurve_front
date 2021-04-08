import React from 'react'
import _ from 'lodash'
import ClaimBox from "components/ClaimBox"
import PoolInfo from "components/PoolInfo"
import {useLocation} from "react-router-dom"
import Menu from 'layout/Menu'
import Routes from 'routes'
import Banner from 'components/Banner'
import OverviewBox from "components/OverviewBox";

const Main = ({poolId, isLoggedIn, ual}) => {
    let location = useLocation();
    const showBanner = _.includes(['/', '/exchange', '/deposit', '/withdraw'], location.pathname)

    const renderBanner = () => {
        if (!isLoggedIn) return (
            <Banner className="not-logged-in">
                Wallet not connected, click <span onClick={ual.showModal}>Login</span> to connect
            </Banner>
        )

        if (showBanner) return (
            <div className="bifrost-border">
                <Banner>
                    Use <a href="https://bifrost.fi" target="_blank" rel="noopener noreferrer">Bifrost.fi</a> to bridge USDC and DAI from Ethereum
                </Banner>
            </div>
        )

        return null
    }

    const renderTopBox = () => {
        switch (location.pathname) {
            case '/exchange':
            case '/deposit':
            case '/withdraw':
                return <PoolInfo poolId={poolId}/>
            case '/use-ecrv':
            case '/lock-dad':
                return <ClaimBox/>
            default:
                return <OverviewBox/>
                // return <PoolInfo poolId={poolId}/>
        }
    }

    return (
        <>
            {renderTopBox()}
            <Menu/>
            <div className="main">
                {renderBanner()}
                <Routes/>
            </div>
        </>
    )
}

export default Main
