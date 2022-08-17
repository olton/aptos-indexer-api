import {Result} from "../helpers/result.js";

export const TRANSACTION_TYPE_USER = 'user_transaction'
export const TRANSACTION_TYPE_META = 'block_metadata_transaction'
export const TRANSACTION_TYPE_CHECK = 'state_checkpoint_transaction'


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
    },

    async proposalTransactions (addr, {limit = 25, offset = 0}={}) {
        const sql = `
            select
                type,
                version,
                t.hash,
                state_root_hash,
                event_root_hash,
                success,
                vm_status,
                accumulator_root_hash,
                t.inserted_at,
                proposer,
                timestamp,
                round,
                id,
                previous_block_votes,
                epoch,
                previous_block_votes_bitmap,
                failed_proposer_indices
            from transactions t
            left join block_metadata_transactions bmt on t.hash = bmt.hash
            where proposer = $1
            limit $2 offset $3
        `

        try {
            const result = (await this.query(sql, [addr, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async roundsPerEpoch (addr) {
        const sql = `
            select
                epoch,
                count(round) rounds
            from transactions t
            left join block_metadata_transactions bmt on t.hash = bmt.hash
            where proposer = $1
            group by epoch
            order by epoch
        `

        try {
            const result = (await this.query(sql, [addr])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async transactions({limit = 25, offset = 0} = {}){
        const sql = `
            select
                t.version,
                t.type,
                t.payload->>'type' as payload_type,
                t.payload->>'function' as payload_func,
                t.payload->>'arguments' as payload_args,
                t.hash,
                t.gas_used,
                t.success,
                t.vm_status,
                coalesce(ut.sender, m.proposer) as sender,
                coalesce(ut.sequence_number, 0) as sequence_number,
                coalesce(ut.gas_unit_price, 0) as gas_unit_price,
                coalesce(ut.timestamp, m.timestamp) at time zone 'utc' as timestamp
            from transactions t
                left join user_transactions ut on t.hash = ut.hash
                left join block_metadata_transactions m on t.hash = m.hash
            where version > 0
            and type != 'state_checkpoint_transaction'
            order by t.version desc
            limit $1 offset $2
        `

        try {
            const result = (await this.query(sql, [limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async transactionsAddress (addr, {order = "timestamp desc", limit = 25, offset = 0}={}) {
        const fields = `
                type, version, t.hash, state_root_hash, event_root_hash, success, vm_status, accumulator_root_hash, 
                coalesce(bmt.proposer, ut.sender) as sender, coalesce(bmt.timestamp, ut.timestamp, t.inserted_at) as timestamp,
                bmt.round, bmt.id, bmt.previous_block_votes, bmt.epoch, bmt.previous_block_votes_bitmap,
                bmt.failed_proposer_indices, ut.signature, ut.sequence_number, ut.expiration_timestamp_secs,
                t.gas_used, ut.max_gas_amount, ut.gas_unit_price, t.inserted_at
        `
        const sql = `
            with transactions as (
            select ${fields}
            from transactions t
            left join block_metadata_transactions bmt on t.hash = bmt.hash
            left join user_transactions ut on t.hash = ut.hash
            where ut.sender = $1
            
            union all
            
            select ${fields}
            from transactions t
            left join block_metadata_transactions bmt on t.hash = bmt.hash
            left join user_transactions ut on t.hash = ut.hash
            where bmt.proposer = $1
            )
            select * from transactions
            order by %ORDER%
            limit $2 offset $3        
        `.replace("%ORDER%", order)

        try {
            const result = (await this.query(sql, [addr, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async transactionsInTimeByType (trunc = 'minute', type = TRANSACTION_TYPE_USER, limit = 60) {
        const sql = `
        with trans as (select
                    t.version,
                    coalesce(ut.timestamp, m.timestamp, t.inserted_at) at time zone 'utc' as timestamp
                from transactions t
                    left join user_transactions ut on t.hash = ut.hash
                    left join block_metadata_transactions m on t.hash = m.hash
                where version > 0
                and t.type = $1 
                order by t.version desc limit 100000)
            select
                date_trunc('%TRUNC%', tr.timestamp) as minute,
                count(tr.version)
            from trans tr
            group by 1
            order by 1 desc
            limit $2
        `.replace("%TRUNC%", trunc)

        try {
            const result = (await this.query(sql, [type, limit])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    }

}
