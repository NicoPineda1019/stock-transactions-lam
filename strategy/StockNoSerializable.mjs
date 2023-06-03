import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { paginateResponse, response } from "../utils/response.mjs";
import { TOTAL_PAGE_PAGINATION } from "../constants.mjs";
import { groupById } from "../utils/utils.mjs";
export class StockNoSerializable extends Context {
  constructor() {
    super();
    this.db = new DataBase();
    this.nameTable = "INVENTARIO_NO_SERIALIZABLE";
  }
  async updateItems(request, callback) {
    const dataGroup = groupById(request);
    const idStock = request.idEstado;
    const idUser = request.idUsuario;
    for (const infoMaterial of dataGroup) {
        // ALGORITHM AVOID UPDATE SIMULTANEOSTLY
        for (const triesTimeOut of [50,100]) {
            let mustRetry = false;
            const responseQuery = await this.getItemByConditions(infoMaterial, idStock, idUser);
            if (responseQuery?.error) {
                return callback(null, response(500, responseQuery.error))
            }
            if (responseQuery.response.length === 1) {
                const responseUpdate = await this.updateItem(infoMaterial, responseQuery.response[0], request);
                if (responseUpdate?.error ) return callback(null, response(500, responseQuery.error))
                // IF DIDN'T UPDATE ROWS, MUST RETRY
                mustRetry = responseUpdate?.rows === 0
                if (mustRetry) {
                    await new Promise((resolve) => {
                        // WAIT TIME WHILE ITEM IS UPDATING
                        setTimeout(() => {
                            resolve();
                        }, triesTimeOut);
                    })
                    continue
                }
                // UPDATED WAS SUCCESSFULLY AND MUS NOT RETRY
                else break
            } else {
                await this.inserItem(request, infoMaterial);
                break
            }
            

        }
        
    }
    callback(null, response(200, 'OK'))
    /*
        for (const infoMaterial of dataGroup) {
            for (const tries of [50,50] ) {
                let mustRetry = false;
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
                    const sqlUpdate = `UPDATE ${this.nameTable} SET ? WHERE ID = ? AND cantidad = ?;`
                    const values = {
                        cantidad: newCuantity
                    }
                    const responseUpdate= await this.db.query(sqlUpdate, [values, [responseValues.id], responseValues.cantidad])
                    .then(resp => {
                        console.log(`Response updateItems in table => ${this.nameTable} : ${JSON.stringify(resp)}`)
                        mustRetry = resp?.changedRows === 0
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
                    if (mustRetry) {
                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve();
                            }, tries);
                        })
                        continue
                    }
                    else break
                }
            }
  
        }
        */
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
    callback(null, response(200, "Ok"));
  }
  
  async getItemByConditions(infoMaterial, idStock, idUser) {
    const sqlQUery = `SELECT id, cantidad, id_material FROM ${this.nameTable} WHERE id_material = ? AND id_estado = ? AND id_usuario = ? LIMIT 1;`;
    console.log(
      "SEARCHING INFO WITH ID_MATERIAL -> " + infoMaterial.idMaterial
    );
    const responseQuery = await this.db
      .query(sqlQUery, [[infoMaterial.idMaterial], [idStock], [idUser]])
      .then((resp) => {
        console.log(
          `RESPONSE FOR ID_MATERIAL -> ${infoMaterial.idMaterial} IN TABLE => ${this.nameTable} : ${resp.length} elements`
        );
        console.log(
          `FOUND ELEMENT WITH ID -> ${resp[0].id} AND QUANTITY -> ${resp[0].cantidad}`
        );
        return {
          response: resp,
        };
      })
      .catch((err) => {
        console.error(`FAILED FOR ${infoMaterial.idMaterial}`);
        console.error(err);
        return {
          error: err.stack,
        };
      });
    return responseQuery;
  }
  async updateItem(infoMaterial, infoQuery, request) {
    const newCuantity = infoQuery.cantidad + infoMaterial.cantidad
    const sqlUpdate = `UPDATE ${this.nameTable} SET ? WHERE ID = ? AND cantidad = ?;`
    const values = {
        cantidad: newCuantity,
        fecha_actualizacion: request.fechaActualizacion,
        hora_actualizacion: request.horaActualizacion,
    }
    const responseUpdate = await this.db.query(sqlUpdate,[values, [infoMaterial.id], infoQuery.cantidad])
    .then(resp => {
        console.log(`RESPONSE updateItem FOR ID_MATERIAL -> ${infoMaterial.idMaterial} in table => ${this.nameTable} : ${JSON.stringify(resp)}`)
        mustRetry = resp?.changedRows === 0
        return {
            rows: resp?.changedRows
        }
    })
    .catch(err => {
        console.error(`FAILED FOR ${infoMaterial.idMaterial}`);
        console.error(err)
        return {
            error: err.stack
        }
    })
    return responseUpdate
  }
  async inserItem(request, infoMaterial) {
    const sqlString = `INSERT INTO ${this.nameTable} (id_material, fecha_cargue, fecha_actualizacion, hora_actualizacion, cantidad, id_estado) VALUES ?`
    const values = this.mapInsertItem(request, infoMaterial)
    await this.db.query(sqlString, values)
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
  }
  async getItem(request, callback) {
    const page = request.page ? Number(request.page) : 1;
    const totalPage = TOTAL_PAGE_PAGINATION;
    const offset = page * totalPage - totalPage;
    const sqlCount = `SELECT COUNT(*) as Total
        FROM ${this.nameTable} as a 
        WHERE a.id_estado IN ?;`;
    const sqlSelect = `SELECT a.id, c.codigo, c.nombre as 'nombre', a.cantidad, a.fecha_cargue, a.fecha_actualizacion, 
        a.hora_actualizacion, b.nombre as 'estado', d.nombre as 'usuario' 
        FROM ${this.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        WHERE a.id_estado IN ?
        ORDER BY a.fecha_cargue DESC
        LIMIT ${offset},${totalPage}`;
    const sqlString = sqlCount + sqlSelect;
    const values = this.mapGetItem(request);
    const responseQuery = await this.db
      .query(sqlString, [values, values])
      .then((resp) => {
        console.log(
          `Response getItem in table => ${this.nameTable} : ${resp[1].length} elements`
        );
        return {
          code: resp[0][0].Total === 0 ? 404 : 200,
          msg: paginateResponse(
            `/stock/stock-no-serializable?idEstado${request.idEstado}`,
            page,
            resp[0][0].Total,
            totalPage,
            resp[1]
          ),
        };
      })
      .catch((err) => {
        console.error(err);
        return {
          code: 500,
          msg: err.stack,
        };
      });
    callback(null, response(responseQuery.code, responseQuery.msg));
  }
  mapInsertItem(request, extraData) {
    return [
        extraData.idMaterial,
        (`${request.fechaActualizacion} ${request.horaActualizacion}`),
        request.fechaActualizacion,
        request.horaActualizacion,
        Number(extraData.cantidad),
        request.idEstado,
    ];
  }
  mapGetItem(request) {
    const formatStates = request.idEstado.replaceAll(",", "");
    // request.fechaActualizacion,
    return [Array.from(formatStates)];
  }
}
