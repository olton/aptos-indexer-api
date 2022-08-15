import {Result} from "../helpers/result.js";

export const ValidatorsApi = {
    async currentRound(){
        const sql = `
        select
            coalesce(version, 0) as version,
            coalesce(epoch, 0) as epoch,
            coalesce(round, 0) as current_round
        from block_metadata_transactions bt
        left join transactions t on bt.hash = t.hash
        order by timestamp desc limit 1
        `

        try {
            const result = (await this.query(sql)).rows[0]
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async roundsPerEpoch (epoch_count = 10) {
        const sql = `
            select
                epoch,
                count(round) as rounds
            from block_metadata_transactions
            group by epoch
            order by epoch desc
            limit $1
        `

        try {
            const result = (await this.query(sql, [epoch_count])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async roundsInTime (trunc = 'minute', limit = 60) {
        const sql = `
            select
                date_trunc('%TRUNC%', timestamp) as timestamp,
                count(round) as rounds
            from block_metadata_transactions t
            group by 1
            order by 1 desc
            limit $1
        `.replace('%TRUNC%', trunc)

        try {
            const result = (await this.query(sql, [limit])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    }
}