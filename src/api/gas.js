import {Result} from "../helpers/result.js";
import {TRANSACTION_TYPE_USER} from "./transactions.js"

export const GasApi = {
    async gasUsageByFunction() {
        const sql = `
            with gas as (select substring((payload -> 'function')::text,
                                               strpos((payload -> 'function')::text, '::') + 2) as func,
                                     gas_used
                              from transactions t
                                left join user_transactions ut on ut.hash = t.hash
                              where type = '${TRANSACTION_TYPE_USER}'
                                and gas_used > 0
                                and payload ->> 'function' != '0x1::code::publish_package_txn')
            select func, round(avg(gas_used)) as gas_avg, min(gas_used) as gas_min, max(gas_used) as gas_max
                from gas
            group by func
        `

        try {
            const result = (await this.query(sql)).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async gasUsage() {
        const sql = `
            with gas as (select substring((payload -> 'function')::text, strpos((payload -> 'function')::text, '::') + 2) as func,
                                     gas_used, max_gas_amount
                              from transactions t
                                left join user_transactions ut on ut.hash = t.hash
                              where type = '${TRANSACTION_TYPE_USER}'
                                and gas_used > 0
                                and payload ->> 'function' != '0x1::code::publish_package_txn')
            select 
                round(avg(gas_used)) as gas_avg, 
                min(gas_used) as gas_min, 
                max(gas_used) as gas_max,
                round(avg(max_gas_amount)) as gas_max_amount
              from gas
        `

        try {
            const result = (await this.query(sql)).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

}