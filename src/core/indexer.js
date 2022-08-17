import {Postgres} from "./postgres.js";
import {TransactionsAPI} from "../api/transactions.js";
import {CoinsApi} from "../api/coins.js";
import {ValidatorsApi} from "../api/validators.js";
import {GasApi} from "../api/gas.js";
import {MiscApi} from "../api/misc.js";

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

Object.assign(Indexer.prototype, Postgres, TransactionsAPI, CoinsApi, ValidatorsApi, GasApi, MiscApi)