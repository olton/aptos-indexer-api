import {Indexer} from "../src/index.js";
import {db} from "./config.js";

const i = new Indexer({
    ...db
})

let q

// q = await i.mintAddress("0x310dfd70948d6b22c5e6a573719e21f0437d4fa4986a106e439a1f9d44dcae0c")
// console.log(q)
//
// q = await i.mintTransactions()
// console.log(q)

q = await i.payments()
console.log(q)

q = await i.incomingPayments("0x780c1d3d602d7bfe22b2a6c27d77a8f1e6d61c23a123f857b6f64cad9318bf71")
console.log(q)

q = await i.outgoingPayments("0x780c1d3d602d7bfe22b2a6c27d77a8f1e6d61c23a123f857b6f64cad9318bf71")
console.log(q)


