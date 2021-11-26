import nextSession from "next-session";
import { expressSession, promisifyStore } from "next-session/lib/compat";
import MongoDBStoreFactory from "connect-mongodb-session";
import { uri } from "./database";

const MongoDBStore = MongoDBStoreFactory(expressSession as any);
const store = promisifyStore(new MongoDBStore({ uri, collection: "sessions" }));
export const getSession = nextSession({ store });
