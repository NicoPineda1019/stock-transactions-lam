import mysql from 'mysql';
export class DataBase {
    constructor() {
        return mysql.createConnection({
            host: 'stock-capired.cu68nawuqxr9.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'CapiredStock2023*',
            database: 'db-capired-dev'
        })
    }
    connection() {
        return new Promise((resolve, reject) => {
            this.connect(function (err) {
                if (err) reject(err)
                else resolve(this)
            });
        })
    }
}