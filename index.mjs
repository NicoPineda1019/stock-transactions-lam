import { StrategyFactory } from './factory/factoryImpl.mjs';
import { DataBase } from './service/DataBase.mjs';
import { Context } from './strategy/Context.mjs';
const dB = new DataBase()

export const handler = async (event) => {
    console.log('Event => ', event)
    console.log('Details Connection')
    console.log('State =>', dB.db.state)
    console.log('threadId =>', dB.db.threadId)
    await dB.connection()
        .then((resp) => console.log('resp ', resp.state))
        .catch((err) => console.error(err.stack))
    // TODO implement
    const factory = new StrategyFactory('user')
    const context = new Context(factory)
    context.insertItem()
    await dB.disconnect()
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
