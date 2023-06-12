import { StockNoSerializable } from "./StockNoSerializable.mjs";
import { StockSerializable } from "./StockSerializable.mjs";
import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { response } from "../utils/response.mjs";

export class Stock extends Context {
        constructor() {
        super()
        this.db = new DataBase()
    }

    async getItem(request, callback){
        const sqlSerializable = `SELECT COUNT(*) as total, c.codigo, c.nombre as 'nombre',  b.nombre as 'estado'
        FROM ${StockSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        group by a.id_material, a.id_estado;`
        const sqlNoSerializable = `SELECT SUM(cantidad) as total, c.codigo, c.nombre as 'nombre',  b.nombre as 'estado'
        FROM ${StockNoSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        group by a.id_material, a.id_estado;`
        const sqlString = sqlSerializable + sqlNoSerializable;
        // const values = this.mapGetItem(request)
        const responseQuery = await this.db.query(sqlString)
            .then(resp => {
                const concatResponse = [...resp[0], ...resp[1]]
                console.log(`Response getItem with => ${concatResponse.length} elements`)
                return {
                    code: 200,
                    msg: concatResponse
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