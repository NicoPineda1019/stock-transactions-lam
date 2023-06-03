import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
import { paginateResponse, response } from "../utils/response.mjs";
import { TOTAL_PAGE_PAGINATION } from "../constants.mjs";
import { groupById } from "../utils/utils.mjs";
export class StockNoSerializable extends Context {
    constructor() {
        super()
        this.db = new DataBase()
        this.nameTable = 'INVENTARIO_NO_SERIALIZABLE'
    }
    async insertItems(request, callback) {
        const dataGroup = groupById(request);
        const idStock = 1;
        const idNoUser = 0;
        for (const infoMaterial of dataGroup) {
            const sqlQUery = `SELECT id, cantidad, id_material FROM ${this.nameTable} WHERE id_material = ? AND id_estado = ? AND id_usuario = ? LIMIT 1;`
            console.log('SEARCHING INFO WITH ID_MATERIAL -> ' + infoMaterial.idMaterial)
            const responseQuery = await this.db.query(sqlQUery, [[infoMaterial.idMaterial],[idStock],[idNoUser]])
            .then(resp => {
                console.log(`RESPONSE FOR ID_MATERIAL -> ${infoMaterial.idMaterial} IN TABLE => ${this.nameTable} : ${resp.length} elements`)
                console.log(`FOUND ELEMENT WITH ID -> ${resp[0].id} AND QUANTITY -> ${resp[0].cantidad}`)
                return {
                    response: resp
                }
            })
            .catch(err => {
                console.error(`FAILED FOR ${infoMaterial.idMaterial}`)
                console.error(err)
                return {
                    error: err.stack
                }
            })
            if (responseQuery?.error) {
                return callback(null, response(500, responseQuery.error))
            }
            console.log('response', responseQuery.response)
            if (responseQuery.response.length === 1) {
                const responseValues = responseQuery.response[0]
                const newCuantity = responseValues.cantidad + request[0].cantidad
                const sqlUpdate = `UPDATE ${this.nameTable} SET ? WHERE ID = ?;`
                const values = {
                    cantidad: newCuantity
                }
                const responseUpdate= await this.db.query(sqlUpdate, [values, [responseValues.id]])
                .then(resp => {
                    console.log(`Response updateItems in table => ${this.nameTable} : ${JSON.stringify(resp)}`)
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
            }
        }
        
        /*
        const sqlString = `INSERT INTO ${this.nameTable} (id_material, fecha_cargue, fecha_actualizacion, hora_actualizacion, cantidad, id_estado) VALUES ?`
        const values = this.mapInsertItem(request)
        const responseQuery = await this.db.query(sqlString, values)
            .then(resp => {
                console.log(`Response insertItem in table => ${this.nameTable} : ${JSON.stringify(resp)}`)
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
            */
        callback(null, response(200, 'Ok'))
        
    }
    async getItem(request, callback) {
        const page = request.page ? Number(request.page) : 1;
        const totalPage = TOTAL_PAGE_PAGINATION
        const offset = (page*totalPage - totalPage)
        const sqlCount = `SELECT COUNT(*) as Total
        FROM ${this.nameTable} as a 
        WHERE a.id_estado IN ?;`
        const sqlSelect = `SELECT a.id, c.codigo, c.nombre as 'nombre', a.cantidad, a.fecha_cargue, a.fecha_actualizacion, 
        a.hora_actualizacion, b.nombre as 'estado', d.nombre as 'usuario' 
        FROM ${this.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        WHERE a.id_estado IN ?
        ORDER BY a.fecha_cargue DESC
        LIMIT ${offset},${totalPage}`
        const sqlString = sqlCount + sqlSelect;
        const values = this.mapGetItem(request)
        const responseQuery = await this.db.query(sqlString, [values, values])
            .then(resp => {
                console.log(`Response getItem in table => ${this.nameTable} : ${resp[1].length} elements`)
                return {
                    code: resp[0][0].Total === 0 ? 404 : 200,
                    msg: paginateResponse(`/stock/stock-no-serializable?idEstado${request.idEstado}`, page, resp[0][0].Total, totalPage, resp[1])
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
            Number(item.cantidad),
            item.idEstado
            ])]
    }
    mapGetItem(request) {
        const formatStates = request.idEstado.replaceAll(',','')
        // request.fechaActualizacion,
        return [
            Array.from(formatStates)
        ]
    }
}