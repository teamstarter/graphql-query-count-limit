GraphQL Query Count Limit
===================

Dead-simple defense against grouped GraphQL queries. Limit the number of the queries per request and the number of selections allowed at the root of each query.


## Why?

Suppose you have an `Album` type that has a list of `Song`s.

```graphql
{
  album(id: 42) {
    songs {
      title
      artists
    }
  }
}
```

And perhaps you have a different entry point for a `Song` and the type allows you to go back up to the `Album`.

```graphql
{
  song(id: 1337) {
    title
    album {
      title
    }
  }
}
```

That opens your server to the possibility of a cyclical query!

```graphql
query evil {
  album(id: 42) {
    songs {
      album {
        songs {
            # Depth is covered by graphql-depth-limit...
          }
        }
      }
    }
  }
  album(id: 41) {
    songs {
      album {
        songs {
            # but one can add as many selection at the root of the query
          }
        }
      }
    }
  }
  # Creating a single-call-ddos
  ...
}
# Also, most engines handles any number queries per request! Making another possible single-call-ddos possibility.
query evil2 {
  album(id: 42) {
    songs {
      album {
        songs {
            ...
          }
        }
      }
    }
  }
  ...
}
```

## Liming root selections and queries

graphql-query-count-limit will limit the number of queries per request and the number of root selections per query.

## Usage

```shell
$ npm install graphql-query-count-limit
```

It works with any library using graphql-server, such as, [apollo-server](https://www.apollographql.com/docs/apollo-server/), [express-graphql](https://github.com/graphql/express-graphql) and [koa-graphql](https://github.com/chentsulin/koa-graphql).

Here is an example with Express.

```js
import queryLimit from 'graphql-query-count-limit'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import schema from './schema'

const app = express()

app.use('/graphql', graphqlHTTP((req, res) => ({
  schema,
  validationRules: [ queryLimit(10) ]
})))
```

The first argument is the maximum number of queries in a single request. This will throw a validation error if more than the allowed amount if queries are specified.<br/>
The second, optional, argument is the maximum amount of root selections on any query<br/>

```js
queryLimit(
  3,
  5
)
```

## References

This library is made thanks to the awesome [graphql-depth-limit](https://github.com/stems/graphql-depth-limit) library that you should always install with graphql-query-count-limit as they are both needed for a better DDOS protection.

Also, once those two librairies are installed, you will still have to make sure that:

* Limits/offset are enforced on all "list" endpoints
* You have a rate limit system put in place