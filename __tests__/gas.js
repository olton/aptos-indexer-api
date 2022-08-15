import {Indexer} from "../src/index.js";
import {db} from "./config.js";

const i = new Indexer({
    ...db
})
let q = await i.gasUsageByFunction()
console.log(q)

q = await i.gasUsage()
console.log(q)

