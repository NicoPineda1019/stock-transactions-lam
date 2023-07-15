import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
import { paginateResponse, response } from "../utils/response.mjs";
import { TOTAL_PAGE_PAGINATION } from "../constants.mjs";
export class StockSerializable extends Context {
    static nameTable = 'INVENTARIO_SERIALIZABLE'
    constructor() {
        super()
        this.db = new DataBase()
    }
    async insertItems(request, callback) {
        const sqlString = `INSERT INTO ${StockSerializable.nameTable} (id_material, fecha_cargue, fecha_actualizacion, hora_actualizacion, serial, id_estado) VALUES ?`
        const values = this.mapInsertItem(request)
        const responseQuery = await this.db.query(sqlString, values)
            .then(resp => {
                console.log(`Response insertItem in table => ${StockSerializable.nameTable} : ${JSON.stringify(resp)}`)
                return {
                    code: 201,
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
    async updateItems(request, callback) {
        const values =  this.mapUpdateItems(request);
        const sqlString = `UPDATE ${StockSerializable.nameTable} SET ? WHERE ID IN ?;`;
        const responseQuery = await this.db.query(sqlString, [values, this.mapMultipleId(request.id)])
        .then(resp => {
            console.log(`Response updateItems in table => ${StockSerializable.nameTable} : ${JSON.stringify(resp)}`)
            return {
                code: 200,
                msg: 'Total Items updated => ' + resp?.changedRows
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
        const page = request.page ? Number(request.page) : 1;
        const totalPage = TOTAL_PAGE_PAGINATION
        const offset = (page*totalPage - totalPage)
        const sqlCount = `SELECT COUNT(*) as Total
        FROM ${StockSerializable.nameTable} as a 
        WHERE a.id_estado IN ?
        ${'AND d.usuario IN ?'};`
        const sqlSelect = `SELECT a.id, c.codigo, c.nombre as 'nombre', a.serial, a.fecha_cargue, a.fecha_actualizacion, 
        a.hora_actualizacion, b.nombre as 'estado', d.nombre as 'usuario' 
        FROM ${StockSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        WHERE a.id_estado IN ?
        ${'AND d.usuario IN ?'}
        ORDER BY a.fecha_cargue DESC
        LIMIT ${offset},${totalPage}`
        const sqlString = sqlCount + sqlSelect;
        const values = this.mapGetItem(request)
        const responseQuery = await this.db.query(sqlString, [values, values])
            .then(resp => {
                console.log(`Response getItem in table => ${StockSerializable.nameTable} : ${resp[1].length} elements`)
                return {
                    code: resp[0][0].Total === 0 ? 404 : 200,
                    msg: paginateResponse(`/stock/stock-serializable?idEstado${request.idEstado}`, page, resp[0][0].Total, totalPage, resp[1])
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
        return [request.map((item) => [
            item.idMaterial,
            item.fechaCargue,
            item.fechaActualizacion,
            item.horaActualizacion,
            item.serial,
            item.idEstado
            ])]
    }
    mapUpdateItems(request) {
        return {
            fecha_actualizacion: request.fechaActualizacion,
            hora_actualizacion: request.horaActualizacion,
            id_estado: request.idEstado,
            id_usuario: request.idUsuario
        }
    }
    mapMultipleId(idArray) {
        const formatStates = idArray.split(',')
        return [
            formatStates
        ]
    }
    mapGetItem(request) {
        const formatStates = request.idEstado.replaceAll(',','')
        // request.fechaActualizacion,
        return [
            Array.from(formatStates),
            request.user
        ]
    }
}