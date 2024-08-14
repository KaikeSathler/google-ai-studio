
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://kaikesathler7:g0wvze58TC9CyLWm@cluster0.8eiqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  const db = client.db("gemini_db").collection("usuario")
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  try {
    const buscarUsuarios = await db.find({}).toArray()
    console.log(buscarUsuarios)
  } catch (e) {
    console.error(e)
  }
}
run().catch(console.dir);

