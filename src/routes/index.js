import React from 'react'
import Exchange from 'routes/Exchange'
import Deposit from 'routes/Deposit'
import Withdraw from 'routes/Withdraw'
import LockDAD from './LockDAD'
import UseECRV from './UseECRV'
import Pools from './Pools'
import Page from "layout/Page"
import {Switch, Route, Redirect} from "react-router-dom"

const Routes = () => (
    <Switch>
        {/*<Route exact path="/">*/}
        {/*    <Page><Pools/></Page>*/}
        {/*</Route>*/}
        {/*<Route exact path="/exchange">*/}
        {/*    <Page><Exchange/></Page>*/}
        {/*</Route>*/}
        {/*<Route path="/deposit">*/}
        {/*    <Page><Deposit/></Page>*/}
        {/*</Route>*/}
        {/*<Route path="/withdraw">*/}
        {/*    <Page><Withdraw/></Page>*/}
        {/*</Route>*/}
        <Route path="/use-ecrv">
            <Page><UseECRV/></Page>
        </Route>
        <Route path="/lock-dad">
            <Page><LockDAD/></Page>
        </Route>
        <Route path="/" render={() => <Redirect to="/use-ecrv" />}/>
    </Switch>
)

export default Routes
