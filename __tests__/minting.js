import {Indexer} from "../src/index.js";
import {DBConfig} from "./config.js";

const i = new Indexer({
    ...DBConfig
})
const q = await i.minting("0x310dfd70948d6b22c5e6a573719e21f0437d4fa4986a106e439a1f9d44dcae0c", "moon_coin")
console.log(q)
