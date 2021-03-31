import {useSelector} from "react-redux"
import _ from 'lodash'
import {dayJS} from "utils"
import {utcToZonedTime} from "date-fns-tz"
import {balanceSelector, balanceObjectSelector} from "modules/balances";
import config from 'config'
const {MAIN_TOKEN} = config

const getZonedTime = (timestamp) => {
    if (_.isEmpty(timestamp)) return null

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return utcToZonedTime(timestamp, tz)
}

const getUTCTime = (timestamp) => {
    if (_.isEmpty(timestamp)) return null

    return dayJS.utc(timestamp)
}

const getHoursFromNow = date => {
    if (_.isNil(date)) return -1
    return dayJS.utc(date).diff(dayJS(), 'hour')
}

const useLocking = (symbol) => {

    const unlockedBalance = useSelector(balanceSelector('unlocked', symbol))
    const {balance: lockedBalance, unlockTime} = useSelector(balanceObjectSelector('locked', symbol))

    const hasLocked = !_.isEmpty(unlockTime) && lockedBalance > 0

    const unlocksAt = getZonedTime(unlockTime)
    const unlocksAtUTC = getUTCTime(unlockTime)
    const remainingLock = hasLocked ? getHoursFromNow(unlockTime) : -1
    const hasUnlocked = !_.isEmpty(unlockTime) && unlocksAtUTC < dayJS()

    return {
        hasLocked,
        lockedBalance,
        hasUnlocked,
        unlockedBalance,
        unlocksAt,
        unlocksAtUTC,
        remainingLock,
        isMainToken: symbol === MAIN_TOKEN,
    }
}

export default useLocking
