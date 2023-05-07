import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
import { response } from "../utils/response.mjs";
export class StockSerializable extends Context {
    constructor() {
        super()
        this.db = new DataBase()
        this.nameTable = 'INVENTARIO_SERIALIZABLE'
    }
    async insertItem(request, callback) {
        const sqlString = `INSERT INTO ${this.nameTable} SET ?`
        const values = this.mapInsertItem(request)
        const responseQuery = await this.db.query(sqlString, values)
            .then(resp => {
                console.log(`Response insertItem in table => ${this.nameTable} : ${JSON.stringify(resp)}`)
                return {
                    code: 200,
                    msg: resp.OkPacket?.insertId
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
    mapInsertItem(request) {
        return {
            id_material: request.idMaterial,
            fecha_cargue: request.fechaCargue,
            fecha_actualizacion: request.fechaActualizacion,
            hora_actualizacion: request.horaActualizacion,
            serial: request.serial,
            id_usuario: request.idUsuario,
            id_estado: request.idEstado
        }
    }
}