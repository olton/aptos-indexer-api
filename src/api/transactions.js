import {Result} from "../helpers/result.js";

const userTransFields = `
    type,
    payload,
    version,
    t.hash,
    state_root_hash,
    event_root_hash,
    gas_used,
    success,
    vm_status,
    accumulator_root_hash,
    t.inserted_at,
    signature,
    sender,
    sequence_number,
    max_gas_amount,
    expiration_timestamp_secs, gas_unit_price,
    timestamp
`

export const TransactionsAPI = {
    async transCount () {
        const sql = `
            select * from transaction_status_count
            union
            select * from transaction_type_count 
        `
        try {
            const result = (await this.query(sql)).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async minting (addr, coin = "*", {limit = 25, offset = 0} = {}) {
        const sql = `
            select ${userTransFields}
            from transactions t
            left join user_transactions ut on t.hash = ut.hash
            where type = 'user_transaction'
            and payload->>'function' like '%mint%'
            and payload->>'arguments' like $1
            limit $2 offset $3
        `.replace('%mint%', coin === "*" ? '%mint%' : `%${coin}::mint%`)

        try {
            const result = (await this.query(sql, [`%${addr}%`, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async sentTransactions (addr, {limit = 25, offset = 0}) {
        const sql = `
            select ${userTransFields} 
            from transactions t
            left join user_transactions ut on t.hash = ut.hash
            where type = 'user_transaction'
            and sender = $1
            limit $2 offset $3
        `

        try {
            const result = (await this.query(sql, [addr, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async receivedTransactions (addr, {limit = 25, offset = 0}) {
        const sql = `
            select ${userTransFields} 
            from transactions t
            left join user_transactions ut on t.hash = ut.hash
            where type = 'user_transaction'
            and payload->>'to' = $1
            limit $2 offset $3
        `

        try {
            const result = (await this.query(sql, [addr, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    }
}
