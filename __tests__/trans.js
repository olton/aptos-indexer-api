import {Indexer} from "../src/index.js";
import {db as DBConfig} from "./config.js";

const i = new Indexer({
    ...DBConfig
})
const q = await i.transactions('0x780c1d3d602d7bfe22b2a6c27d77a8f1e6d61c23a123f857b6f64cad9318bf71')
console.log(q)
