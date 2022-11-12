const mysql = require('mysql2/promise');

/**@type {Map<string, mysql.Connection>} */
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
    login: async ({ hostname, dbname, username, password }) => new Promise(async (resolve, reject) => {

        // create database connection
        const con = await mysql.createConnection({
            host: hostname,
            database: dbname,
            user: username,
            password
        }).catch((err) => {
            // throw error if unable to connect
            console.log('Unable to connect to DB:', err);
            return resolve({
                success: false,
                error_message: err.message
            });
        });
        if (!con) return;

        // connect to the database with credentials
        return con.connect()
            .then(() => {
                // record to connections
                connections.set(con.config.user, con);

                // log successful connection
                console.log(`Connected to DB ${con.config.database} as user ${con.config.user} via host ${con.config.host} with password ${con.config.password}`);

                return resolve({
                    success: true,
                    error_message: null,
                    connection: con
                });
            })
            .catch((err) => {
                // throw error if unable to connect
                console.log('Unable to connect to DB:', err);
                return resolve({
                    success: false,
                    error_message: err.message
                });
            });

    }), // end login

    get(username) {
        return connections.get(username);
    }
}