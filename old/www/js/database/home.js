function listTables() {
    // const session = http.get('session', (res) => {

    // });
    // const tables = [
    //     'model',
    //     'display'
    // ]
    const tables = db_connections.login({
        hostname: 'localhost',
        dbname: 'abc_media',
        username: 'root',
        password: 'password'
    });
    const table_list = document.getElementById('table_list');
    tables.forEach(t => {
        let node = document.createElement('li');
        node.appendChild(document.createTextNode(t));
        table_list.appendChild(node);
    });

}

function render(event) {
    listTables();
}