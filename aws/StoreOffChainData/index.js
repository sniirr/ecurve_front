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
]

const TABLE = 'adminfee'

const ROUNDS_PER_DAY = 24 * 60 / 5

async function handleFees(pool_id, fees) {
    const currStats = await ddb.get({
        TableName: 'ecurve_stats',
        Key: { pool_id }
    }).promise()

    const sumFees = _.sum(_.map(fees, parseFloat))

    if (_.isEmpty(currStats)) {
        // no record yet, create one with 0's, collection will begin in the following run
        const insertRes = await ddb.put({
            TableName: 'ecurve_stats',
            Item: {pool_id, total_fees: sumFees, last_24h_fees: sumFees, round_fees: [sumFees, 0]}
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
            pool_id, total_fees, last_24h_fees, round_fees
        }

        // console.log('newRecord', JSON.stringify(newRecord, null, 2))

        const updateRes = await ddb.put({
            TableName: 'ecurve_stats',
            Item: newRecord,
        }).promise()
    }
}

function getDiff([a, b]) {
    return a < b ? a : a - b
}

async function processPool (rpc, {pool_id, contract}) {
    console.log('processing pool', pool_id)
    const data = await rpc.get_table_rows({
        json: true,                 // Get the response as json
        limit: 1,                  // Maximum number of rows that we want to get
        reverse: false,             // Optional: Get reversed data
        show_payer: false,          // Optional: Show ram payer

        code: contract,
        scope: contract,
        table: TABLE,
    })

    console.log(data)

    const fees = _.get(data, ['rows', 0, 'fees'], [])

    if (_.isEmpty(fees)) return false

    await handleFees(pool_id, fees)

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






















