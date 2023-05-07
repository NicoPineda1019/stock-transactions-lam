const methods = {
    POST: 'insertItem',
    PUT: 'updateItem',
    GET: 'getItem',
    DELETE: 'deleteItem'
}
export class Context {
    constructor(strategy){
        this.strategy = strategy
    }
    getMethod(httpMethod) {
        return methods[httpMethod]
    }
    async insertItem(request, callback){
        await this.strategy.insertItem(request, callback)
    }
    async getItem(request, callback){
        await this.strategy.getItem(request, callback)
    }
}