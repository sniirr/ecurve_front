import React from 'react'
import Exchange from 'routes/Exchange'
import Deposit from 'routes/Deposit'
import Withdraw from 'routes/Withdraw'
import LockDAD from './LockDAD'
import UseECRV from './UseECRV'
import Page from "layout/Page"
import {Switch, Route} from "react-router-dom"

const Routes = () => (
    <Switch>
        <Route exact path="/">
            <Page><Exchange/></Page>
        </Route>
        <Route path="/deposit">
            <Page><Deposit/></Page>
        </Route>
        <Route path="/withdraw">
            <Page><Withdraw/></Page>
        </Route>
        <Route path="/use-ecrv">
            <Page><UseECRV/></Page>
        </Route>
        <Route path="/lock-dad">
            <Page><LockDAD/></Page>
        </Route>
    </Switch>
)

export default Routes
