db.createUser(
    {
        user: "YourUsername",
        pwd: "YourPasswordHere",
        roles: [
            {
                role: "readWrite",
                db: "your-database-name"
            }
        ]
    }
);