const methods = {
    POST: 'insertItems',
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
    async insertItems(request, callback){
        await this.strategy.insertItems(request, callback)
    }
    async getItem(request, callback){
        await this.strategy.getItem(request, callback)
    }
}