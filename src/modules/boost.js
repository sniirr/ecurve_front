import {dayJS, toFloat} from "utils";
import _ from "lodash";
import config from 'config'
import {balanceSelector, balanceObjectSelector} from './balances'
import {fetchCurrentRound, fetchVeCRVStats, eCRVStatsSelector} from "./ecrv";
import {fetchPoolWeights, poolInfoSelector} from "./pools";
import {createSelector} from 'reselect'

const {POOLS, MAIN_TOKEN} = config

export const fetchBoostData = activeUser => async dispatch => {

    try {
        const {currround, currround_amount} = await fetchCurrentRound()
        if (currround === 0) return

        const scope = currround % 2 === 0 ? 2 : 1

        dispatch(fetchVeCRVStats(currround, currround_amount))

        if (activeUser) {
            _.forEach(POOLS, (pool, poolId) => {
                dispatch(fetchPoolWeights(activeUser, poolId, scope))
            })
        }
    } catch (e) {

    }
}

// SELECTORS
export const boostSelector = (poolId, overrides = {}) => {
    return createSelector(
        eCRVStatsSelector,
        poolInfoSelector(poolId, "weights"),
        balanceObjectSelector('locked', MAIN_TOKEN),
        balanceSelector('unlocked', MAIN_TOKEN),
        (ecrvStats, poolWeights, locked, unlockedBalance) => {
            const hasTempLockedBalance = overrides.lockedBalance > 0
            const hasTempLockPeriod = overrides.lockTimeInHours > 0
            const hasLocked = !_.isEmpty(locked) && locked.balance > 0

            // validate all data is ready
            if (_.isEmpty(ecrvStats)
                || _.isEmpty(poolWeights)
                || (!hasLocked && !hasTempLockPeriod)
                || unlockedBalance > 0
            ) return {boost: 1, min_veCRV: -1, ecrv_for_max_boost: -1}

            // contracts data
            const {totalvcrv, lastupdate, oldtotamt, newuserwt} = ecrvStats
            let {user_weight, total_weight} = poolWeights
            const {balance: lockedBalance, unlockTime} = locked

            // resolve lockedamt & lockTimeInSeconds according to current timelock and/or temp input
            let lockedamt = lockedBalance * 1000000
            let lockTimeInSeconds

            if (hasTempLockedBalance) {
                const tmplockamt = overrides.lockedBalance * 1000000
                lockedamt = hasLocked ? (lockedamt + tmplockamt) : tmplockamt
            }

            if (hasTempLockPeriod) {
                // when temp lock period selected calculate boost by full hour
                lockTimeInSeconds = overrides.lockTimeInHours * 3600
                console.log('sldfjlsdjflsjdlfksjdf')
            }
            else {
                // use current lock when not overridden - calc by remaining time
                lockTimeInSeconds = dayJS.utc(unlockTime).diff(dayJS(), 'second')
            }

            // resolve total_veCRV, user_veCRV & user_weight according to current/temp stake
            const currentTimeInSecond = dayJS.utc().unix()
            const lastUpdateInSeconds = dayJS.utc(lastupdate).unix()

            let total_veCRV = totalvcrv - oldtotamt * (currentTimeInSecond - lastUpdateInSeconds) + newuserwt
            // let total_veCRV = totalvcrv
            const user_veCRV = lockedamt * lockTimeInSeconds

            // if (hasTempLockedBalance || hasTempLockPeriod) {
            //     total_veCRV += user_veCRV
            // }

            if (!_.isNaN(overrides.stakedAmount) && overrides.stakedAmount !== 0) {
                // subtract previous user_weight
                total_weight -= user_weight
                // calc and add new user_weight
                user_weight += overrides.stakedAmount * 3600 * 1000000
                total_weight += user_weight
            }

            if (user_weight === 0) {
                return {boost: 1, min_veCRV: -1, ecrv_for_max_boost: -1}
            }

            console.log('boostSelector', {lockedamt, lockTimeInSeconds, total_veCRV, user_veCRV, total_weight, user_weight})

            const b = (0.4 * user_weight + (0.6 * total_weight * user_veCRV / total_veCRV)) / (0.4 * user_weight)
            const boost = toFloat(b, 2)

            console.log('calculated boost', boost, b)

            const min_veCRV = user_weight * totalvcrv / total_weight / 1000000

            const ecrv_for_max_boost = min_veCRV / lockTimeInSeconds

            return {
                boost: boost < 2.5 ? boost : 2.5,
                min_veCRV,
                ecrv_for_max_boost,
            }
        }
    )
}
