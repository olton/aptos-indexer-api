import {Result} from "../helpers/result.js";

export const CoinsApi = {
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

        try {
            const result = (await this.query(sql, [address, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async payments(order = "version", {limit = 25, offset = 0} = {}){
        const sql = `
            select version, hash, amount, receiver, sender, function, timestamp
            from v_payments
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

    async incomingPayments(address, order = "version", {limit = 25, offset = 0} = {}){
        const sql = `
            select version, hash, amount, receiver, sender, function, timestamp
            from v_payments
            where receiver = $1
            order by %ORDER%
            limit $2 offset $3
        `.replace("%ORDER%", order)

        try {
            const result = (await this.query(sql, [address, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },

    async outgoingPayments(address, order = "version", {limit = 25, offset = 0} = {}){
        const sql = `
            select version, hash, amount, receiver, sender, function, timestamp
            from v_payments
            where sender = $1
            order by %ORDER%
            limit $2 offset $3
        `.replace("%ORDER%", order)

        try {
            const result = (await this.query(sql, [address, limit, offset])).rows
            return new Result(true, "OK", result)
        } catch (e) {
            return new Result(false, e.message, e.stack)
        }
    },


}