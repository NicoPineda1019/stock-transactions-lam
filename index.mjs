import { StrategyFactory } from './factory/factoryImpl.mjs';
import { DataBase } from './service/DataBase.mjs';
import { Context } from './strategy/Context.mjs';
const dB = new DataBase()

export const handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; // Permite que se ejecute el callback con conexión abierta de mysql
    console.log('Path => ', event.path)
    console.log('HTTP Method => ', event.httpMethod)
    console.log('Body => ', event.body)
    console.log('Details Connection')
    console.log('State =>', dB.db.state)
    console.log('threadId =>', dB.db.threadId)

    const responseConnection = await dB.connection()
        .then((resp) => console.log('New threadId ', resp['_handshakeInitializationPacket']?.threadId))
        .catch((err) => {
            console.error(err.stack)
            return 500
        })
    if (responseConnection === 500 ) return {
        statusCode: 500,
        body: JSON.stringify('Error with DataBase'),
    }

    const splitPath = event.path.split('/')
    const strategy = splitPath[2]
    const factory = new StrategyFactory().getStrategy(strategy)
    const contextStrategy = new Context(factory)
    const methodExecute = contextStrategy.getMethod(event.httpMethod)
    console.log('STARTED STRATEGY => ', strategy)
    console.log('WITH METHOD => ', methodExecute)
    await contextStrategy[methodExecute](JSON.parse(event.body), callback)
    console.log('FINISHED METHOD => ', methodExecute)
};
