import { DataBase } from './service/DataBase.mjs';

export const handler = async (event) => {
    const db = new DataBase()
    await db.connection().then((resp) => console.log('resp ', resp))
        .catch((err) => console.error(err))
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
