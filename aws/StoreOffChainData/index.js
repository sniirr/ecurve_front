const {JsonRpc} = require('eosjs')
const fetch = require('node-fetch')
const _ = require('lodash')

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const CHAIN = {
    host: 'eos.greymass.com',
    port: 443,
    protocol: 'https'
}

const POOLS = [
    {contract: 'ecurve3pool1', pool_id: 'TRIPOOL'},
    {contract: 'ecrvusnpool1', pool_id: 'USNPOOL'},
    {contract: 'ecrveosdtpol', pool_id: 'EOSDTPL'},
    {contract: 'ecrvvigorpol', pool_id: 'VIGORPL'},
]

const FEES_TABLE = 'adminfee'
const BALANCES_TABLE = 'tokenpools1'
const CONFIG_TABLE = 'config'

const ROUNDS_PER_DAY = 24 * 60 / 5

async function handleFees(pool_id, fees, balances, {fee, adminfee}) {
    const currStats = await ddb.get({
        TableName: 'ecurve_stats',
        Key: { pool_id }
    }).promise()

    const sumFees = _.sum(_.map(fees, parseFloat))
    const tvl = _.sum(_.map(_.values(balances), parseFloat))

    const adminPart = fee * adminfee

    if (_.isEmpty(currStats)) {
        // no record yet, create one with 0's, collection will begin in the following run
        const insertRes = await ddb.put({
            TableName: 'ecurve_stats',
            Item: {
                pool_id,
                total_fees: sumFees,
                last_24h_fees: sumFees,
                round_fees: [sumFees, 0],
                balances,
                tvl,
                volume: sumFees / adminPart
            }
        }).promise()
    }
    else {
        // record found
        let {total_fees, last_24h_fees, round_fees} = currStats.Item

        const prev_sum_fees = _.get(round_fees, 0, 0)

        const roundDiff = getDiff([sumFees, prev_sum_fees])

        if (_.size(round_fees) === ROUNDS_PER_DAY + 1) {
            const roundDiffToSub = getDiff(_.takeRight(round_fees, 2))
            last_24h_fees -= roundDiffToSub

            round_fees = _.dropRight(round_fees)
        }
        last_24h_fees += roundDiff
        total_fees += roundDiff
        round_fees.unshift(sumFees)

        const newRecord = {
            pool_id, total_fees, last_24h_fees, round_fees, balances, tvl,
            volume: last_24h_fees / adminPart
        }

        const updateRes = await ddb.put({
            TableName: 'ecurve_stats',
            Item: newRecord,
        }).promise()
    }
}

const fetchTableData = async ({rpc, contract}, opts) => rpc.get_table_rows({
    json: true,
    limit: 10,
    reverse: false,
    show_payer: false,
    code: contract,
    scope: contract,
    ...opts,
})

const fetchOne = async ({rpc, contract}, opts) => {
    const res = await fetchTableData({rpc, contract}, {...opts, limit: 1})
    return _.get(res, ['rows', 0])
}

function getDiff([a, b]) {
    return a < b ? a : a - b
}

async function processPool (rpc, {pool_id, contract}) {
    console.log('processing pool', pool_id)
    const feesRow = await fetchOne({rpc, contract}, {table: FEES_TABLE})
    const fees = _.get(feesRow, 'fees', [])

    const balancesRow = await fetchOne({rpc, contract}, {table: BALANCES_TABLE})
    const balances = _.get(balancesRow, 'liquidblc', [])

    const feeConfig = await fetchOne({rpc, contract}, {table: CONFIG_TABLE})

    if (_.isEmpty(fees) || _.isEmpty(balances)) return false

    await handleFees(pool_id, fees, balances, feeConfig)

    return true
}

exports.handler = async function (event, context) {
    const rpc = new JsonRpc(`${CHAIN.protocol}://${CHAIN.host}:${CHAIN.port}`, {fetch})

    console.log('start')

    try {
        await Promise.allSettled(_.map(POOLS, pool => processPool(rpc, pool)))

        return true
    }
    catch (e) {
        console.log(e)
        return false
    }
}
