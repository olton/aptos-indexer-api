import {Indexer} from "../src/index.js";
import {DBConfig} from "./config.js";

const i = new Indexer({
    ...DBConfig
})
const q = (await i.query('select version();')).rows[0]
console.log(q)
