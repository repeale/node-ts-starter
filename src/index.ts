import http from 'http'

import {
  ApolloServerPluginDrainHttpServer,
  Config,
  gql,
} from 'apollo-server-core'
import {ApolloServer} from 'apollo-server-express'
import express from 'express'

async function startApolloServer(
  typeDefs: Config['typeDefs'],
  resolvers: Config['resolvers']
) {
  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
  })
  await server.start()
  server.applyMiddleware({app})
  await new Promise<void>((resolve) => httpServer.listen({port: 4000}, resolve))
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

const typeDefs = gql`
  type Query {
    hello: String
  }
`
const resolvers = {
  Query: {
    hello: async () => `Hello ${await getRandomName()}!`,
  },
}

startApolloServer(typeDefs, resolvers)

const getRandomName = async () => {
  const res = await fetch('https://randomuser.me/api/')
  const response = await res.json()

  return response.results[0].name.first
}
