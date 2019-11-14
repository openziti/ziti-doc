# Managing Ziti

Ziti management needs to be hands off. The only times one should be expected to be concerned with managing a Ziti
instance is during the initial installation and when trying to expand the Ziti footprint.

## Installation

### Ziti Edge - Developer Edition

An initial, simple installation of Ziti is already provided for you when using the [Ziti Edge - Developer
Edition](~/ziti/quickstarts/networks-overview.md).  The installation will contain a
[controller](./controller.md), an [edge router](./edge-router.md) and corresponding
[PKI](~/ziti/manage/pki.md). See the corresponding sections for additional details.

### Ziti Installation - the long way

At its most simple, a basic Ziti Network is composed of only two (or three depending on whether you count the database)
components. The [Controller](~/ziti/manage/controller.md) and an [Edge Router](~/ziti/manage/edge-router.md).
(Note: these executables are not currently available for separate download but will be coming in the months ahead.)

### Expanding Ziti

At this time Ziti is only offered as the [Ziti Edge - Developer
Edition](https://aws.amazon.com/marketplace/pp/B07YZLKMLV) which is not expandable beyond a single node at this time. As
you would exepct, allowing Ziti to be expanded past the developer experience is planned. Check back in the coming months for more information.
