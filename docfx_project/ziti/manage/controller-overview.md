# Ziti Controller

The Ziti Controller is the process that coordinates a Ziti network. It is responsible for authenticating incoming
connections from identities and authorizing identities to services and provides a ReST-based API for other processes to
interact with it.

# Installation Steps

Installing a Ziti Network from scratch, like most things, is easy once you know how. Getting to knowing how can take some
time.  The goal of these pages are to get you from nothing to network the long way. If you want to take the quick route
you should stop now and follow one of the [quickstart](~/ziti/quickstarts/quickstart-overview.md) instead. It is designed to
get a Edge-only Ziti network running in no time.

A basic Edge-only Ziti Network is composed of two (or three depending on whether you count the database) pieces. The
Controller and an Edge Router.

## Controller

### Prerequisite - Database

There are a few prerequisites necessary before being able to deploy your first Controller.  The first thing you will
need is a database. At this time the Ziti Controller is using a Postgres instance. Setting up and managing a Postgres
database is a complex task beyond the scope of this guide. This guide is intended to be illustrative of installing and
managing the Ziti Controller and not maintaining a Postgres installation. Refer to the documentation from
[Postgres](https://www.postgresql.org/docs/) for asistance setting up a Postgres database.

### Prerequisite - PKI

Public Key Infrastructure (PKI) is a complex topic. See the [pki](~/ziti/manage/pki.md) page for additional details about the sort
of needs and considerations relevant to the Ziti controller.

## Sizing Guidelines

The Ziti network controller and routers have not been stress tested at this time. We recommend starting with a small
scale deployment until key performance indicators start to hint that the server requires more resources. A Ziti network
will have two important metrics: CPU and network capacity.  Modest sized networks require minimal investments in
infrastructure. Start with small machines and increase as needed.

## Configuration

The Ziti Controller is configured using a [yaml](https://yaml.org/) file. The configuration file can be found
[here](~/ziti/manage/sample-controller-config.yaml). Each section is annotated and should provide you enough
information to modify a given setting. Most of the fields are straight-forward. The pki-related fields are the ones you
will need to pay particular attention to. See the [pki](~/ziti/manage/pki.md) page for relevant information on pki
settings.
