function createDb() {
    setHeightWidth();
    dbShell = window.openDatabase("dbv1", 2, "dbv1", 1000000);
    //run transaction to create initial tables
    dbShell.transaction(setupTable, dbErrorHandler, getEntries);

    gSoundMatch.id = "soundMatch";
    gSoundMatch.appendChild(setSoundSource("sound_match"));
    gSoundMatch.preload = "auto";

    gSoundTarget.id = "soundTarget";
    gSoundTarget.appendChild(setSoundSource("sound_target"));
    gSoundTarget.preload = "auto";
}

//I just create our initial table - all one of em
function setupTable(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS setting(id INTEGER PRIMARY KEY,theme)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS levels(id INTEGER PRIMARY KEY,board_row_size INTEGER,board_col_size INTEGER,floor_details,tile_details,powerup_details,max_moves,completed,help_used INTEGER)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS powerup(id INTEGER PRIMARY KEY, details)");
    createSetting();
}