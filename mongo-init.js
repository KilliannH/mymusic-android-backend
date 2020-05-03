db.createUser(
    {
        user: "test-user",
        pwd: "test-password",
        roles: [
            {
                role: "readWrite",
                db: "mymusic-db"
            }
        ]
    }
);