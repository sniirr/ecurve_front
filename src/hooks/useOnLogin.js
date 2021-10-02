import {useEffect} from 'react'
import {useSelector} from "react-redux";
import _ from 'lodash'

function useOnLogin(onLogin, dependencies = []) {

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const accountName = activeUser?.accountName

    useEffect(() => {
        if (!_.isEmpty(accountName)) {
            onLogin()
        }
    }, [accountName, ...dependencies])
}

export default useOnLogin
