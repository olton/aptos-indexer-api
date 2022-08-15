import {Indexer} from "../src/index.js";
import {db} from "./config.js";

const i = new Indexer({
    ...db
})

let q

q = await i.currentRound()
console.log(q)

q = await i.roundsPerEpoch()
console.log(q)

q = await i.roundsInTime()
console.log(q)


