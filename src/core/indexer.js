import {Postgres} from "./postgres.js";
import {TransactionsAPI} from "../api/transactions.js";

const defaultIndexerOptions = {
    debug: true,
    max: 20,
    allowExitOnIdle: true,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 0
}

export class Indexer {
    constructor({proto = 'http', host = 'localhost', port = 5432, user, password, database, options = {}}) {
        this.connect = {
            proto, host, port, user, password, database
        }
        this.options = Object.assign({}, defaultIndexerOptions, options)
        this.pool = null

        this.createDBConnection()
    }
}

Object.assign(Indexer.prototype, Postgres, TransactionsAPI)