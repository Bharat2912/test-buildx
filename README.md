# Core-API

Serving the core set of requests along with the Food API.


## Setting up Pre commit in the repo

You can install pre commit on your machine so that a few checks can be run before your code is committed.
Pre commit can be installed from (here)[https://pre-commit.com/]
## Linter

ESLint
To fix linting issues, install the VSCode linting extension and use it to fix all auto fixable problems.

# Welcome to SPEEDYY!

## HOW TO INSTALL POSTGRES

 - Click on this link [postgres installation](https://speedyy.atlassian.net/wiki/spaces/SPEEDYY/pages/2621441/PostgreSQL),


# writeen in BOLD letter are commands

# HOW  TO  CREATE  POSTGRES  USER
-  **sudo su postgres**
-  add your Admin password
-  then write **psql**
- now you are in postgres DB.

## TO LIST THE USERS

- **\du**

## TO CREATE A NEW USER IN POSTGRES

-  **CREATE USER username WITH PASSWORD 'password';**
-  list the users now you can find new user here.

## TO GIVE PRIVILAGE/ACCESS  TO USER
- **ALTER USER username WITH SUPERUSER;**
## TO DROP USER FROM
- **DROP USER `username`;**
