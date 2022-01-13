var sqlite3 = require("sqlite3");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // can't open/initialize db
    console.log(err);
    throw err;
  } else {
    // create items table
    db.run(
      `CREATE TABLE items ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            amount INTEGER,
            deleted BOOLEAN NOT NULL DEFAULT 0,
            delete_message TEXT
            )`,
      (err) => {
        if (err) {
          // table already exists
          // don't need to notify user every time server starts
        } else {
          // table created successfully
          console.log("table created");
        }
      }
    );
  }
});

module.exports = db;
