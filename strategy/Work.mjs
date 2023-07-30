import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
import { response } from "../utils/response.mjs";

export class Work extends Context {
    constructor(){
        super()
        this.db = new DataBase()
        this.nameTable = 'WORK'
    }
    async getItem(request, callback){
        const sqlSelect = `SELECT id, nombre as tipoTrabajo FROM
        ${this.nameTable};`
        const responseQuery = await this.db.query(sqlSelect)
            .then(resp => {
                console.log(`Response getItem in table => ${this.nameTable} : ${resp.length} elements`)
                return {
                    code: resp.length === 0 ? 404 : 200,
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