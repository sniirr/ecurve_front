const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    const currStats = await ddb.scan({
        TableName: 'ecurve_stats',
    }).promise()

    return currStats.Items.map(item => {
        return {
            pool_id: item.pool_id,
            last_24h_fees: item.last_24h_fees,
            total_fees: item.total_fees,
            tvl: item.tvl,
            last_24h_volume: item.volume,
        }
    })
};
