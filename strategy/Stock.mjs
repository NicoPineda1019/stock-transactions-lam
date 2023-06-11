import { StockNoSerializable } from "./StockNoSerializable.mjs";
import { StockSerializable } from "./StockSerializable.mjs";

export class Stock extends Context {

    async getItem(request, callback){
        const sqlSerializable = `SELECT COUNT(*) as total, c.codigo, c.nombre as 'nombre',  b.nombre as 'estado'
        FROM ${StockSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        group by a.id_material, a.id_estado;`
        const sqlNoSerializable = `SELECT COUNT(*) as total, c.codigo, c.nombre as 'nombre',  b.nombre as 'estado'
        FROM ${StockNoSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        group by a.id_material, a.id_estado;`
        const sqlString = sqlSerializable + sqlNoSerializable;
        // const values = this.mapGetItem(request)
        const responseQuery = await this.db.query(sqlString)
            .then(resp => {
                console.log(`Response getItem in table => ${JSON.stringify(resp)}`)
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