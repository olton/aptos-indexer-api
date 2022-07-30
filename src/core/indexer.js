import {Postgres} from "./postgres.js";

const defaultIndexerOptions = {
    debug: true
}

export class Indexer {
    constructor({proto = 'http', host = 'localhost', port = 5432, user, password, database, options = {}}) {
        this.connect = {
            proto, host, port, user, password, database
        }
        this.options = Object.assign({}, defaultIndexerOptions, options)
        this.pool = null
    }
}

Object.assign(Indexer.prototype, Postgres)