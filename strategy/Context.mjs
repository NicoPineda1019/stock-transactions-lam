const methods = {
    POST: 'insertItems',
    PUT: 'updateItems',
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
    async updateItems(request, callback){
        await this.strategy.updateItems(request, callback)
    }
    async insertItems(request, callback){
        await this.strategy.insertItems(request, callback)
    }
    async getItem(request, callback){
        await this.strategy.getItem(request, callback)
    }
}