module.exports = {

    /**
     * Check if a Model exists in the Database.
     * ! This utilizes a prepared statement.
     * @param {string} modelNo 
     */
    modelExists: async (con, modelNo) => (await con.execute(
        'SELECT * FROM Model WHERE (modelNo = ?)', // prepared values populated in ?
        [modelNo] // prepared values
    ))[0].length > 0,

    /**
     *  Remove a Model if modelNo is NOT associated to any DigitalDisplays.
     * ! This utilizes a prepared statement.
     * @param {string} modelNo 
     */
    removeModelIfNotReferenced: async (con, modelNo) => {
        // ! PREPARED
        const remainingDisplays = (await con.execute(
            'SELECT * FROM DigitalDisplay WHERE (modelNo = ?)', // prepared values populated in ?
            [modelNo] // prepared values
        ))[0];

        // if no more Displays are of the original modelNo, delete Model
        if (!remainingDisplays.length) {
            await con.execute(
                'DELETE FROM Model WHERE (modelNo = ?)', // prepared values populated in ?
                [modelNo] // prepared values
            );
        }
    }

}