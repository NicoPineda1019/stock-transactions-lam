import { Context } from "./Context.mjs";
import { DataBase } from "../service/DataBase.mjs";
import { response } from "../utils/response.mjs";

export class File extends Context {
    constructor() {
        super()
        this.db = new DataBase()
    }
    async updateItems(request, callback) {
        console.log('UpdateItems from File')
    }

}