import mysql from 'mysql';
export class DataBase {
    constructor() {
        this.db = mysql.createConnection({
            host: 'stock-capired.cu68nawuqxr9.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'CapiredStock2023*',
            database: 'db-capired-dev'
        })
    }
    connection() {
        return new Promise((resolve, reject) => {
            if (this.db.state === 'authenticated' && this.db.threadId) {
                console.log('Already connected')
                return resolve(this)
            }
            this.db.connect(function (err) {
                if (err) reject(err)
                else resolve(this)
            });
        })
    }
    disconnect() {
        return new Promise((resolve, reject) => {
            this.db.end(function (err) {
                if (err) reject(err)
                else resolve('Disconnected successfully!')
            });
        })
    }
}