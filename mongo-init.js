const {
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = process.env;

db = db.getSiblingDB(DB_NAME);

db.createUser(
    {
        user: DB_USER,
        pwd: DB_PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: DB_NAME
            }
        ]
    }
);