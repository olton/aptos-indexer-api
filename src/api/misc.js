import {Result} from "../helpers/result.js";

export const MiscApi = {
    async operationsCount(){
        const sql = `
            select
                payload->'function' as func,
                count(hash) as operations_count
            from transactions
            where substring(payload->>'function', 1, 5) = '0x1::'
            group by payload->'function'
        `

        try {
            const result = (await this.query(sql)).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },
}