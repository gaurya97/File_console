const mysql=require('mysql2')
module.exports =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gaurav1999',
    database: 'test'
  });