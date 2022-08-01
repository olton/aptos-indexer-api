import {Indexer} from "../src/index.js";
import {DBConfig} from "./config.js";

const i = new Indexer({
    ...DBConfig
})
const q = await i.transCount()
console.log(q)
