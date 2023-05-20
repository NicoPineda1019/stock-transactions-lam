import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
export class Material extends Context {
    constructor(){
        super()
        this.db = new DataBase()
        this.nameTable = 'MATERIAL'
    }
    insertItem(){
        console.log('Insert item from Material')
        this.db.query('SELECT * FROM `MATERIAL`')
            .then((resp) => console.log('Response Query => ',resp))
            .catch(err => console.error(err))
       
    }
    getItem(request, callback){
        const sqlSelect = `SELECT A.id as idMaterial, A.codigo as codigo, A.nombre as nombre, B.nombre as categoria, C.nombre as unidad FROM
        ${this.nameTable} A
        INNER JOIN CATEGORIA_MATERIAL B ON A.id_categoria = B.id
        INNER JOIN UNIDAD_MATERIAL C ON A.id_unidad = C.id;`
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