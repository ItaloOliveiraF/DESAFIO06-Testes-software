import { createConnection, getConnectionOptions } from 'typeorm';

export default (async (host = "unit_tests_challenge") => {
  const options = await getConnectionOptions();

  Object.assign(options, {
    host: process.env.NODE_ENV === "test" ? "localhost" : host,
    database: process.env.NODE_ENV === "test" ? "fin_api_test" : options.database
  })

  return (await createConnection(options))
})();
