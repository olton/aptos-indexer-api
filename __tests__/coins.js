import {Indexer} from "../src/index.js";
import {db} from "./config.js";

const i = new Indexer({
    ...db
})

let q

q = await i.mintAddress("0x310dfd70948d6b22c5e6a573719e21f0437d4fa4986a106e439a1f9d44dcae0c")
console.log(q)

q = await i.mintTransactions()
console.log(q)
