import { StockSerializable } from "../strategy/StockSerializable.mjs";
import { Material } from "../strategy/material.mjs";
import { User } from "../strategy/user.mjs";

const strategies = {
    user : new User(),
    material: new Material(),
    'stock-serializable': new StockSerializable()
}
export class StrategyFactory {
    getStrategy(strategy){
        const classStrategy = strategies[strategy]
        if (classStrategy) return classStrategy
        console.error('Strategy not implementented => ' + strategy)
    }
}