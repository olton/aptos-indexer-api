import {Indexer} from "../src/index.js";
import {DBConfig} from "./config.js";

const i = new Indexer({
    ...DBConfig
})
const q = await i.proposalTransactions('0xc1452c6f8dc0cf6b6289872c7a885e7b4a4d673074186510da5499390297c7ca')
console.log(q)
