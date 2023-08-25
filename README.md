# Risevest Backend Challenge

## Requirements

1. Node 17 and above
2. NPM
3. Docker
4. Postgres

## Project Installation

1. `cd` into whatever directory you want work from.
2. Run `https://github.com/zerothebahdman/node-postgres.git` then `cd` into the repo.
3. After cloning the project, run `cp .env .env.example` on your terminal to create a new `.env` file from the `.env.example`.
4. Run `yarn install` to install all the dependencies.
5. Run `yarn dev` to start the project in development mode.
6. Run `yarn build` to build the project for production.
7. Run `yarn start` to start the project in production mode.

## Project Setup

1. Create a database on your machine.

- For **PostgreSQL**
  - Navigate into `src/database/prisma/schema.prisma` verify that inside the datasource db object provider is set to postgresql i.e `provider = "postgresql"`

```bash
Your database url in the `.env` file should as follows

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

mydb : The name of the databse you created on your machine
johndoe : The username of the database
randompassword : The password of the database
```

- To migrate the database tables from prisma use `npx prisma migrate dev --name init --schema=./src/database/prisma/schema.prisma`
- To view your database on your browser use prisma studio `npx prisma studio --schema=./src/database/prisma/schema.prisma`

### Query Optimization Task

- Optimize the following query

```sql
SELECT users.id, users.name, posts.title, comments.content
FROM users
LEFT JOIN posts ON users.id = posts.userId
LEFT JOIN comments ON posts.id = comments.postId
WHERE comments.createdAt = (SELECT MAX(createdAt) FROM comments WHERE postId = posts.id)
ORDER BY (SELECT COUNT(posts.id) FROM posts WHERE posts.userId = users.id) DESC
LIMIT 3;
```

- The optimized query is as follows

```sql
WITH LatestComments AS (
    SELECT
        postId,
        MAX(createdAt) AS latestCommentDate
    FROM comments
    GROUP BY postId
),
UserPostCounts AS (
    SELECT
        userId,
        COUNT(id) AS postCount
    FROM posts
    GROUP BY userId
)
SELECT
    users.id,
    users.name,
    posts.title,
    comments.content
FROM
    users
LEFT JOIN
    UserPostCounts ON users.id = UserPostCounts.userId
LEFT JOIN
    posts ON users.id = posts.userId
LEFT JOIN
    comments ON posts.id = comments.postId
    AND comments.createdAt = LatestComments.latestCommentDate
WHERE
    UserPostCounts.postCount IS NOT NULL
ORDER BY
    UserPostCounts.postCount DESC
LIMIT 3;
```

- Break down of the optimized query :-
  - Subquery Reduction: The optimized query reduces the number of subqueries from two to one. This leads to better query optimization because subqueries can be resource-intensive, especially when executed within the context of the main query.
  - JOINs: The optimized query uses a combination of JOIN statements to link the tables. This approach generally performs better than subqueries, as the database optimizer can create more efficient execution plans.
  - Use of Aggregate Functions: Instead of using a correlated subquery to find the maximum createdAt value for each postId, the optimized query uses an aggregate function (MAX) in a subquery to achieve the same result. Aggregate functions are generally more optimized for this kind of calculation.
  - We use two common table expressions (CTEs) to calculate the latest comment date for each post (LatestComments) and the post count for each user (UserPostCounts).
  - Then, we perform the main SELECT query, joining the users table with the UserPostCounts CTE to ensure that we only select users with posts. We left join with posts and comments tables and use the LatestComments CTE to filter comments with the latest date.

### License

[![license](https://img.shields.io/badge/license-GPL-4dc71f.svg)](https://github.com/zerothebahdman/node-postgres/blob/main/LICENCE)

This project is licensed under the terms of the [GPL license](/LICENSE).
