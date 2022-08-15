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

    async transactions (addr, {order = "timestamp desc", limit = 25, offset = 0}={}) {
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

    async mintTransactions (order = "1", {limit = 25, offset = 0} = {}){
        const sql = `
            select hash, mint, sender, receiver, function, timestamp
             from v_minting    
            order by %ORDER%          
            limit $1 offset $2  
        `.replace("%ORDER%", order)

        try {
            const result = (await this.query(sql, [limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async mintAddress (address, order = "1", {limit = 25, offset = 0} = {}){
        const sql = `
            select hash, mint, sender, receiver, function, timestamp
            from v_minting    
            where receiver = $1
            order by %ORDER%          
            limit $2 offset $3      
        `.replace("%ORDER%", order)
        console.log(sql)
        try {
            const result = (await this.query(sql, [address, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    }
}
