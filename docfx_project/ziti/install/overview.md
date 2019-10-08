# Installation Steps

Installing a Ziti Network from scratch, like anything, is easy once you know how. Getting to knowing how can take some
time.  The goal of these pages are to get you from nothing to network the long way. If you want to take the quick route
you should stop now and follow the [quickstart](../quickstart.md) instead. It is designed to get a Edge-only Ziti
network running in no time.

A basic Edge-only Ziti Network is composed of two (or three depending on how you count the database) pieces. The
Controller and the Edge Router.

## Controller

### Prerequisite - Database

There are a few prerequisites necessary before being able to deploy your first Controller.  The first thing you will
need is a database. At this time the Ziti Controller is using a Postgres instance. Setting up and managing a Postgres
database is a complex task beyond the scope of this guide. This guide is intended to be illustrative of installing and
managing the Ziti Controller and not maintaining a Postgres installation. Refer to the documentation from
[Postgres](https://www.postgresql.org/docs/) for asistance setting up a Postgres database.

### Prerequistie - PKI

Public Key Infrastructure (PKI) is a complex topic.

## Edge Router
