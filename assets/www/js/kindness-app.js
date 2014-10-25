function openDb() {

    var db = window.openDatabase("Database", "1.0", "KindnessApp", 200000);
    db.transaction(checkDatabaseExists);

    function checkDatabaseExists(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS MEDITATION (id unique, startDate, endDate, duration, feeling)');
    }

    return db;
}