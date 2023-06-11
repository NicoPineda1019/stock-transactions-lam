import { StockSerializable } from "../strategy/StockSerializable.mjs";
import { User } from "../strategy/User.mjs";
import { Material } from "../strategy/Material.mjs";
import { StockNoSerializable } from "../strategy/StockNoSerializable.mjs";
import { Stock } from "../strategy/Stock.mjs";


const strategies = {
    user : new User(),
    material: new Material(),
    'stock-serializable': new StockSerializable(),
    'stock-no-serializable': new StockNoSerializable(),
    all: new Stock()
}
export class StrategyFactory {
    getStrategy(strategy){
        const classStrategy = strategies[strategy]
        if (classStrategy) return classStrategy
        console.error('Strategy not implementented => ' + strategy)
    }
}