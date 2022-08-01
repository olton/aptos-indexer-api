export const TransactionsAPI = {
    async transCount () {
        const sql = `
        select * from transaction_status_count
        union
        select * from transaction_type_count 
    `
        return (await this.query(sql)).rows
    }
}

