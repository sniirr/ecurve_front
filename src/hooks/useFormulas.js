import {useSelector} from "react-redux";
import {calc} from "modules/formulas";
import _ from 'lodash'
import config from 'config'
import {poolInfoSelector} from 'modules/pools'

const {POOLS} = config

function useFormulas(poolId) {

    const {tokens} = POOLS[poolId]


    const {balances: poolBalances, stats = {}} = useSelector(poolInfoSelector(poolId))

    const {D, A, fee, price, totalSupply: total_supply} = stats

    const N_COINS = _.size(tokens)

    return calc({
        xp: _.map(tokens, symbol => _.get(poolBalances, symbol, 0) * 1000000),
        total_supply: total_supply * 1000000,
        D,
        price,
        fee: fee?.total,
        N_COINS,
        A,
        Ann: A * N_COINS,
    })
}

export default useFormulas
