import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { response } from "../utils/response.mjs";
import { compareStockElements, transformBase64ToJson } from "../utils/utils.mjs";
import { StockSerializable } from "./StockSerializable.mjs";

export class File extends Context {
    constructor() {
        super()
        this.db = new DataBase()
    }
    async updateItems(request, callback) {
        const excelFile = transformBase64ToJson(request.file)
        if (Object.keys(excelFile).length === 0) {
            return callback(null, response(500, 'Error getting File'))
        }
        const seriales = excelFile['Hoja1'].map((item) => item.Serial)
        const sqlSelect = `SELECT id, serial
        FROM ${StockSerializable .nameTable} as a 
        WHERE serial IN (?)`
        const serialesFound = await this.db.query(sqlSelect, [seriales])
            .then(resp => {
                console.log(`Response searching seriales in table => ${StockSerializable.nameTable} : ${resp.length} elements`)
                return resp
            })
            .catch(err => {
                console.error(err)
                return []
            })
        const totalSend = seriales.length;
        const totalFound = serialesFound.length
        if (totalFound === 0 ) {
            return callback(null, response(200, { totalSend, totalFound, serialesRemaining: seriales }))
        }
        const sqlUpdate = `UPDATE ${StockSerializable.nameTable} SET ? WHERE ID IN ?;`
        const values = {
            confirmacion_cargue: 'SI'
        }
        const idsToUpdate = compareStockElements(seriales, serialesFound)
        const responseUpdate = await this.db.query(sqlUpdate, [values, [idsToUpdate] ])
        .then(resp => {
            console.log(`Response updateItems in table => ${StockSerializable.nameTable} : ${JSON.stringify(resp)}`)
            return {
                code: 200,
                msg: {
                    totalSend, totalFound, serialesRemaining: seriales
                }
            }
        })
        .catch(err => {
            console.error(err)
            return {
                code: 500,
                msg: err.stack
            }
        })
        callback(null, response(responseUpdate.code, responseUpdate.msg))
    }

}