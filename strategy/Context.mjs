export class Context {
    constructor(strategy){
        this.strategy = strategy
    }
    insertItem(){
        this.strategy.insertItem()
    }
}