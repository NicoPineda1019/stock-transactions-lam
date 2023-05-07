import { Context } from "./Context.mjs";

export class StockSerializable extends Context {
    constructor(){
        super()
        this.db = new DataBase()
        this.nameTable = 'INVENTARIO_SERIALIZABLE'
    }
    insertItem(request){
        const sqlString = `INSERT INTO ${this.nameTable} SET ?`
        const values =  {
            id_material : 1,
            fecha_cargue : '2023-05-07 12:15:00',
            fecha_actualizacion : '2023-05-07',
            hora_actualizacion : '12:15:00',
            serial : 'asdg4qwe8g1q98eas',
            id_usuario : 1,
            id_estado : 1,
            serial : 'asdg4qwe8g1q98eas'
        }
        this.db.query(sqlString, values)
            .then(resp => console.log('Resp Insert'))
            .catch(err => console.error(err))
    }
}