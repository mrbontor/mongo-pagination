const { MongoClient, ObjectId } = require('mongodb');

const mongoUrl =
    'mongodb+srv://yourUsername:uourPpassword@test/pagination?retryWrites=true&w=majority';
const conOptions = { useNewUrlParser: true };

let client = new MongoClient(mongoUrl, conOptions);

module.exports = {
    connect: async () => {
        try {
            const connection = await client.connect();
            client = connection.db('pagination');

            console.info('[MONGODB] successfully connected!!!');
            return client;
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    },
    ping: async () => await client.db().command({ ping: 1 }),
    getDb: () => client,
};
