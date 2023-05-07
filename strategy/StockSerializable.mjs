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
                    msg: 'Item inserted with id => ' + resp?.insertId
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
    async getItem(request, callback) {
        const sqlString = `SELECT c.codigo, c.nombre as 'nombre_equipo', a.fecha_cargue, a.fecha_actualizacion, 
        a.hora_actualizacion, b.nombre as 'estado', d.nombre as 'usuario' 
        FROM ${this.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        INNER JOIN USUARIO as d on a.id_usuario = d.id
        where a.fecha_actualizacion = ? and a.id_estado = ?`
        const values = this.mapGetItem(request)
        const responseQuery = await this.db.query(sqlString, values)
            .then(resp => {
                console.log(`Response getItem in table => ${this.nameTable} : ${resp.length} elements`)
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
    mapGetItem(request) {
        return [
            request.fechaActualizacion,
            request.idEstado
        ]
    }
}