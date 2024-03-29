import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { paginateResponse, response } from "../utils/response.mjs";
import { TOTAL_PAGE_PAGINATION } from "../constants.mjs";
import { groupById } from "../utils/utils.mjs";
export class StockNoSerializable extends Context {
  static nameTable = "INVENTARIO_NO_SERIALIZABLE";
  constructor() {
    super();
    this.db = new DataBase();
  }
  async updateItems(request, callback) {
    const dataGroup = groupById(request.elements);
    const idStock = request.idEstado;
    const idUser = request.idUsuario;
    const errorsList = [];
    const skipUpdateAcumulator = !!request.skipUpdateAcumulator;
    for (const infoMaterial of dataGroup) {
      // ALGORITHM AVOID UPDATE SIMULTANEOSTLY
      if (skipUpdateAcumulator) {
        await this.inserItem(request, infoMaterial);
        continue;
      }
      for (const triesTimeOut of [50, 100]) {
        let mustRetry = false;
        const responseQuery = await this.getItemByConditions(
          infoMaterial,
          idStock,
          idUser
        );
        if (responseQuery?.error) {
          errorsList.push(responseQuery.error);
          break;
        }
        if (responseQuery.response.length === 1) {
          const responseUpdate = await this.updateItem(
            infoMaterial,
            responseQuery.response[0],
            request
          );
          if (responseUpdate?.error) {
            errorsList.push(responseUpdate.error);
            break;
          }
          // IF DIDN'T UPDATE ROWS, MUST RETRY
          mustRetry = responseUpdate?.rows === 0;
          if (mustRetry) {
            await new Promise((resolve) => {
              // WAIT TIME WHILE ITEM IS UPDATING
              setTimeout(() => {
                resolve();
              }, triesTimeOut);
            });
            continue;
          }
          // UPDATED WAS SUCCESSFULLY AND MUS NOT RETRY
          else break;
        } else {
          await this.inserItem(request, infoMaterial);
          break;
        }
      }
    }
    if (errorsList.length > 0)
      return callback(null, response(500, { errors: errorsList }));
    callback(null, response(200, "Ok"));
  }

  async getItemByConditions(infoMaterial, idStock, idUser) {
    const sqlQUery = `SELECT id, cantidad, id_material FROM ${StockNoSerializable.nameTable} WHERE id_material = ? AND id_estado = ? AND id_usuario = ? LIMIT 1;`;
    console.log(
      "SEARCHING INFO WITH ID_MATERIAL -> " + infoMaterial.idMaterial
    );
    const responseQuery = await this.db
      .query(sqlQUery, [[infoMaterial.idMaterial], [idStock], [idUser]])
      .then((resp) => {
        console.log(
          `RESPONSE FOR ID_MATERIAL -> ${infoMaterial.idMaterial} IN TABLE => ${StockNoSerializable.nameTable} : ${resp.length} elements`
        );
        console.log(
          `FOUND ELEMENT WITH ID -> ${resp[0]?.id} AND QUANTITY -> ${resp[0]?.cantidad}`
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
    const newCuantity = infoQuery.cantidad + infoMaterial.cantidad;
    if (newCuantity < 0) {
      console.log("RESULT NEW CUANTITY IS ->", +newCuantity);
      console.error("WILL NOT UPDATE BECAUSE IS INVALID VALUE");
      return {
        error: {
          [infoMaterial.idMaterial]:
            "id material-> " + infoMaterial.idMaterial + " has invalid value",
        },
      };
    }
    const sqlUpdate = `UPDATE ${StockNoSerializable.nameTable} SET ? WHERE ID = ? AND cantidad = ?;`;
    const values = {
      cantidad: newCuantity,
      fecha_actualizacion: request.fechaActualizacion,
      hora_actualizacion: request.horaActualizacion,
      id_work: request.idWork,
      account: request.account,
      work_order: request.workOrder,
      node: request.node,
    };
    const responseUpdate = await this.db
      .query(sqlUpdate, [values, [infoQuery.id], infoQuery.cantidad])
      .then((resp) => {
        console.log(
          `RESPONSE updateItem FOR ID_MATERIAL -> ${
            infoMaterial.idMaterial
          } in table => ${StockNoSerializable.nameTable} : ${JSON.stringify(
            resp
          )}`
        );
        return {
          rows: resp?.changedRows,
        };
      })
      .catch((err) => {
        console.error(`FAILED FOR ${infoMaterial.idMaterial}`);
        console.error(err);
        return {
          error: err.stack,
        };
      });
    return responseUpdate;
  }
  async inserItem(request, infoMaterial) {
    const sqlString = `INSERT INTO ${StockNoSerializable.nameTable} SET ?`;
    const values = this.mapInsertItem(request, infoMaterial);
    await this.db
      .query(sqlString, values)
      .then((resp) => {
        console.log(
          `Response insertItem in table => ${
            StockNoSerializable.nameTable
          } : ${JSON.stringify(resp)}`
        );
        return {
          code: 201,
          msg: "Item inserted with id => " + resp?.insertId,
        };
      })
      .catch((err) => {
        console.error(err);
        return {
          code: 500,
          msg: err.stack,
        };
      });
  }
  async getItem(request, callback) {
    const page = request.page ? Number(request.page) : 1;
    const totalPage = !!request.pageSize
      ? request.pageSize
      : TOTAL_PAGE_PAGINATION;
    const offset = page * totalPage - totalPage;
    const andUser = request.user
      ? "AND d.usuario IN ('" + request.user + "')"
      : "";
    const sqlCount = `SELECT COUNT(*) as Total
        FROM ${StockNoSerializable.nameTable} as a
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        WHERE a.id_estado IN ?
        AND a.cantidad > 0
        ${andUser};`;
    const sqlSelect = `SELECT a.id, c.codigo, c.nombre as 'nombre', a.cantidad, a.fecha_cargue, a.fecha_actualizacion, 
        a.hora_actualizacion, b.nombre as 'estado', d.nombre as 'usuario', a.id_usuario, a.id_material, e.nombre as 'work',
        a.account, a.work_order, a.node
        FROM ${StockNoSerializable.nameTable} as a 
        INNER JOIN ESTADO as b ON a.id_estado = b.id 
        INNER JOIN MATERIAL as c on a.id_material = c.id
        LEFT JOIN USUARIO as d on a.id_usuario = d.id
        LEFT JOIN WORK as e on a.id_work = e.id
        WHERE a.id_estado IN ?
        ${andUser}
        AND a.cantidad > 0
        ORDER BY a.fecha_cargue DESC
        LIMIT ${offset},${totalPage}`;
    const sqlString = sqlCount + sqlSelect;
    const values = this.mapGetItem(request);
    const responseQuery = await this.db
      .query(sqlString, [values, values])
      .then((resp) => {
        console.log(
          `Response getItem in table => ${StockNoSerializable.nameTable} : ${resp[1].length} elements`
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
    const items = {
      id_material: extraData.idMaterial,
      fecha_cargue: `${request.fechaActualizacion} ${request.horaActualizacion}`,
      fecha_actualizacion: request.fechaActualizacion,
      hora_actualizacion: request.horaActualizacion,
      cantidad: Number(extraData.cantidad),
      id_estado: request.idEstado,
      id_usuario: request.idUsuario,
    };
    if (request?.idWork) {
      items["id_work"] = request.idWork;
      items["account"] = request.account;
      items["work_order"] = request.workOrder;
      items["node"] = request.node;
    }
    return items;
  }
  mapGetItem(request) {
    const formatStates = request.idEstado.replaceAll(",", "");
    // request.fechaActualizacion,
    return [Array.from(formatStates)];
  }
}
