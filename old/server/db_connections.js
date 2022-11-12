const mysql = require('mysql2');
const connections = new Map();

module.exports = {
    /**
     * Log a user into the database.
     * @param {object} LoginCredentials 
     * @param {string} LoginCredentials.hostname Database Host to connect to.
     * @param {string} LoginCredentials.dbname Database Name to use.
     * @param {string} LoginCredentials.username Database User to log in as.
     * @param {string} LoginCredentials.password User Password to authorize.
     */
    async login({ hostname, dbname, username, password }) {

        return new Promise((resolve, reject) => {
            // create database connection
            const con = mysql.createConnection({
                host: hostname,
                database: dbname,
                user: username,
                password
            });

            // connect to the database with credentials
            con.connect((err) => {
                // throw error if unable to connect
                if (err) {
                    console.log('Unable to connect to DB:', err);
                    return resolve({
                        success: false,
                        error_message: err.message
                    });
                }

                // record to connections
                connections.set(con.config.user, con);

                // log successful connection
                console.log(`Connected to DB ${con.config.database} as user ${con.config.user} via host ${con.config.host} with password ${con.config.password}`);

                return resolve({
                    success: true,
                    error_message: null
                });

            });

        })

    }, // end login

    // get()
}