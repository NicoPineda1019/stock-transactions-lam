import mysql from 'mysql';
const dB = mysql.createConnection({
    host: process.env.DB_ENDPOINT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    multipleStatements: true
})

export class DataBase {
    constructor() {
        this.db = dB
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
    query(queryString, values = []) {
        return new Promise((resolve, reject) => {
            this.db.query(queryString, values, function (error, results, fields) {
                if (error) reject(error)
                resolve(results)
            });
        })
    }
}
