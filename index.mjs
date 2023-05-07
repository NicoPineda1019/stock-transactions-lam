import mysql from 'mysql';
var connection = mysql.createConnection({
  host     : 'stock-capired.cu68nawuqxr9.us-east-1.rds.amazonaws.com',
  user     : 'admin',
  password : 'CapiredStock2023*',
  database : 'db-capired-dev'
})

export const handler = async(event) => {
  await new Promise((resolve,reject) => {
    connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    reject(err)
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
  resolve(connection)
});
  }).then((resp) => ({}))
  console.log('Fin')
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
