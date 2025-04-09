# vex-graph-indexer

## Indexed Data

You can see what data is being indexed in this file: [schema.graphql](./schema.graphql)

## Example Queries

You can see how to query the sub graph [here](https://thegraph.com/docs/en/subgraphs/querying/introduction/).

Order by date

```
{
  matches(
    where: { match_state: Future }
    orderBy: date_timestamp
    orderDirection: asc
  ) {
    id
    game
    date_timestamp
    date_string
    team_1
    team_2
    team_1_total_bets
    team_2_total_bets
    match_state
    created_at
  }
}
```

Search for a specific game

```
{
  matches(
    where: { match_state: Future game: "counter-strike-2" }
    orderDirection: asc
  ) {
    id
    game
    date_timestamp
    date_string
    team_1
    team_2
    team_1_total_bets
    team_2_total_bets
    match_state
    created_at
  }
}
```

Find all bets for a user

```
{
  bets(where: {account_id: "example.users.betvex.testnet"} ) {
    id
    account_id
    amount
    match_id
    team
    potential_winnings
    pay_state
    created_at
  }
}
```

All time winnings leaderboard

```graphql
{
  users(
    where: { total_winnings_gt: "0" }
    orderBy: total_winnings
    orderDirection: desc
    first: 10
  ) {
    id
    total_winnings
  }
}
```

All time wins leaderboard

```graphql
{
  users(
    where: { number_of_wins_gt: 0 }
    orderBy: number_of_wins
    orderDirection: desc
    first: 10
  ) {
    id
    number_of_wins
  }
}
```

Get user stake information

```graphql
{
  user(id: "example.users.betvex.testnet") {
    id
    stake_in
    unstaked
    total_winnings
    number_of_wins
  }
}
```

## Time stamp queries

Do not use these queries currently.

The below queries are only orderable by timestamp. As such you will need to query and then sort and filter in the app.

Change the timestamp_gte to the start of a day you want to query from, for example the start of the week and the start of the month. in UTC time. The timestamp is in microseconds.

Use this for testing https://www.epochconverter.com/

I don't believe you can query the current time interval (partially filled hours or days)

Last 24 hours winnings

```graphql
{
  userWinningStats_collection(
    interval: hour
    where: {
      timestamp_gte: "1738846800000000" # start of today UTC time
    }
  ) {
    user
    totalWinnings
  }
}
```

Last 24 hours wins

```graphql
{
  userWinningStats_collection(
    interval: hour
    where: {
      timestamp_gte: "1738847754000000" # start of today UTC time
    }
  ) {
    user
    numberOfWins
  }
}
```


Credit to Lit Tech Studio Limited for which this repo is based upon https://github.com/linear-protocol/linear-subgraph/tree/main?tab=MIT-1-ov-file 