import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { response } from "../utils/response.mjs";
import { transformBase64ToJson } from "../utils/utils.mjs";
import { StockSerializable } from "./StockSerializable.mjs";

export class File extends Context {
    constructor() {
        super()
        this.db = new DataBase()
    }
    async updateItems(request, callback) {
        const excelFile = transformBase64ToJson(request.file)
        if (Object.keys(excelFile) === 0) {
            return callback(null, response(500, 'Error getting File'))
        }
        const seriales = excelFile['Hoja 1'].map((item) => item.Serial)
        const sqlSelect = `SELECT serial
        FROM ${StockSerializable .nameTable} as a 
        WHERE serial IN ?`
        const sqlString = sqlCount + sqlSelect;
        const responseQuery = await this.db.query(sqlString, [seriales])
            .then(resp => {
                console.log(`Response searching seriales in table => ${StockSerializable.nameTable} : ${resp.length} elements`)
                return {
                    code: 200,
                    msg: resp
                }
            })
            .catch(err => {
                console.error(err)
                return {
                    code: 500,
                    msg: err.stack
                }
            })
        callback(null, response(responseQuery.code, responseQuery.msg))
    }

}