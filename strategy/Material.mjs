import { Context } from "./Context.mjs";
import { DataBase } from '../service/DataBase.mjs';
export class Material extends Context {
    constructor(){
        super()
        this.db = new DataBase()
    }
    insertItem(){
        console.log('Insert item from Material')
        this.db.query('SELECT * FROM `MATERIAL`')
            .then((resp) => console.log('Response Query => ',resp))
            .catch(err => console.error(err))
       
    }
}