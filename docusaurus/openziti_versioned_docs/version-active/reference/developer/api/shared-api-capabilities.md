# Shared API Capabilities

## API Response Envelopes

All responses from APIs have the following outer envelope:

```text
{
  "data": ...,
  "meta": {...},
  "error": {...}
}
```

The `data` and `error` fields are mutually exclusive. Responses are either a data response or an error. The `data`
section represents the subject or output information of the client's request. The `meta` section contains additional
information about the requested entity that may be useful to clients (e.g. pagination, sortable fields, etc.).

The `error` section contains errors in the following format:

```text
{
  "code": "string constant error code",
  "message": "string human readable value",
  "cause": ... //[nested error|field error]
}
```

The `cause` field can either be another nested `error` or a `field error`:

```text
{
  "field": "the name of the field",
  "reason": "a message explaining the issue",
  "value": ... //the provided value
}
```

## Filtering, Sorting, & Pagination

API support rich filtering, sorting and pagination on queries that return lists/arrays of objects in the `data` fields. 
On list responses the `meta` section contains a list of `sortableFields` which can filtered and sorted upon. 
All values are provided in the `filter` URL query field.

Example: `https://my-controller/edge/v1/management/identities?filter=<filterValue>`

The value of `filter` (denoted by `<filterValue>`) is defined by the [ZitiQl grammar definition](https://github.com/openziti/storage/blob/main/zitiql/ZitiQl.g4).

### Pagination

Data can be paginated through by providing a `filter` value with `skip` and/or `limit` clauses. For example to show:

- the first page of 10 items:  `filter=skip 0 limit 10`
- the second page of 10 items:  `filter=skip 10 limit 10`

### Sorting

Data can be sorted on fields by providing a `sort by` clause:

- sort by name ascending: `filter=sort by name asc`
- - sort by name descending: `filter=sort by name dsc`

### Filtering

#### Logical Operations

The following comparisons are allowed:

| Operation                  | Example                                |
|----------------------------|----------------------------------------|
| `=`, `!=`                  | `name = "myName"`, `"isOnline" = true` |
| `<`, `>`, `<=`, `>=`       | `precident > 0`                        |
 | `contains`, `not contains` | `name contains "hi"`                   |


#### Logical Conjunctions
| Conjunction                | Example                                      |
|----------------------------|----------------------------------------------|
| `and`                      | `firstName = "bob" and lastName = "builder"` |
| `or`                       | `firstName = "bob" or firstName = "jim"`     |

Complex conjunction grouping and nesting is supported via `(` and `)`.

**Example:** `firstName = "bob" or (firstName = "jim" and lastName = "john" or ("isOnline" = false))`

#### Types

| Type                    | Example                                                         |                   
|-------------------------|-----------------------------------------------------------------|
| `string`                | `"this is a string"`                                            |
 | `number`                | `1`, `1.555`, `2e5`                                             |
 | `bool`                  | `true`, `false`                                                 |
 | `date_time` (RFC3339) ( | `datetime(2019-10-12T07:20:50.52+07:00)`                        | 
 | `array`                 | `["str", "str"]`, `[1,2,3.5]`, `[datetime(...), datetime(...)]` |

