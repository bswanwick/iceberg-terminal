# eBay Browse Browser Helper

This folder contains the browser-facing wrapper for the eBay Browse API integration. Browser code should call the helpers exported from `src/features/ebay` instead of calling eBay REST endpoints directly.

The wrapper intentionally keeps eBay credentials, OAuth token handling, marketplace defaults, and REST request construction on the Firebase Functions side. The frontend sends typed request data to a callable function and receives a narrowed response shape that still preserves the raw item summary records for application-level interpretation.

## Official eBay References

Use eBay's documentation as the source of truth for request semantics, supported values, response fields, marketplace behavior, and restrictions:

- [Browse API overview](https://developer.ebay.com/develop/api/buy/browse_api)
- [Search for item summaries](https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search)
- [Buy API field filters](https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html)
- [Buying Integration Guide: Browse API](https://developer.ebay.com/api-docs/buy/static/api-browse.html)
- [Buy APIs requirements](https://developer.ebay.com/api-docs/buy/static/buy-requirements.html)

## Local Entry Points

### `searchEbayBrowse(request)`

Defined in `client.ts` and exported through `index.ts`.

Browser code calls:

```ts
import { searchEbayBrowse } from '../../features/ebay'

const response = await searchEbayBrowse({
  q: 'cunard timetable',
  filter: ['price:[10..100]', 'buyingOptions:{FIXED_PRICE}'],
  fieldgroups: ['ASPECT_REFINEMENTS'],
  limit: 25,
  offset: 0,
})
```

That helper calls the Firebase callable function named `searchEbayBrowse`. The callable requires the user to be signed in and authorized as an admin before it forwards the request to eBay.

REST mapping:

| Local helper                | Firebase callable  | eBay REST method                         |
| --------------------------- | ------------------ | ---------------------------------------- |
| `searchEbayBrowse(request)` | `searchEbayBrowse` | `GET /buy/browse/v1/item_summary/search` |

## Request Field Mapping

The browser helper uses camelCase fields. The Functions wrapper converts those fields to the eBay Browse API query parameters below.

| Local request field | eBay query/header         | Notes                                                                                                            |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `q`                 | `q`                       | Keyword search. Cannot be combined locally with `gtin` or `epid`.                                                |
| `categoryIds`       | `category_ids`            | Joined with commas before sending to eBay.                                                                       |
| `aspectFilter`      | `aspect_filter`           | Pass eBay's documented aspect filter expression as a string.                                                     |
| `autoCorrect`       | `auto_correct`            | Locally restricted to `KEYWORD`.                                                                                 |
| `charityIds`        | `charity_ids`             | Joined with commas before sending to eBay.                                                                       |
| `fieldgroups`       | `fieldgroups`             | Joined with commas before sending to eBay. Local types include the field groups currently used by Browse search. |
| `filter`            | `filter`                  | Each array entry is joined with commas. Use eBay's filter syntax from the field filters docs.                    |
| `gtin`              | `gtin`                    | Search by GTIN. Cannot be combined locally with `q`.                                                             |
| `epid`              | `epid`                    | Search by eBay product ID. Cannot be combined locally with `q`.                                                  |
| `limit`             | `limit`                   | Local validation allows integers from 1 through 200.                                                             |
| `offset`            | `offset`                  | Local validation allows integers from 0 through 9,999 and requires a multiple of `limit` when both are present.  |
| `sort`              | `sort`                    | Passed through as documented by eBay.                                                                            |
| `marketplaceId`     | `X-EBAY-C-MARKETPLACE-ID` | Overrides the Functions env default for this request.                                                            |
| `endUserContext`    | `X-EBAY-C-ENDUSERCTX`     | Overrides the optional Functions env default for this request.                                                   |
| `acceptLanguage`    | `Accept-Language`         | Overrides the optional Functions env default for this request.                                                   |

At least one of `q`, `categoryIds`, `gtin`, or `epid` is required by the local wrapper before the REST call is made.

## Response Shape

`EbayBrowseSearchResponse` mirrors the high-level fields the app currently needs from eBay's item summary search response:

- `href`, `total`, `limit`, `offset`, `next`, `prev`
- `itemSummaries`
- `refinement`
- `warnings`

`itemSummaries` are typed as `EbayBrowseItemSummary[]`, but the item summary type is intentionally open with `Record<string, unknown>`. When UI code needs a new eBay response field, prefer consulting the eBay method docs and then narrowing that field in `types.ts` only where the app actually uses it.

## Auth, Credentials, and Environment

The browser helper does not know eBay credentials and should not be changed to read `VITE_*` eBay keys. Credentials live in the Functions environment, and OAuth application tokens are fetched server-side using the client credentials flow.

Functions-side environment values are documented in the root README. The values directly relevant to this wrapper are:

- `EBAY_CLIENT_ID` or `EBAY_APP_ID`
- `EBAY_CLIENT_SECRET` or `EBAY_CERT_ID`
- `EBAY_ENVIRONMENT`
- `EBAY_MARKETPLACE_ID`
- `EBAY_ENDUSERCTX`
- `EBAY_ACCEPT_LANGUAGE`

## Adding Another Browse API Helper

When adding another eBay Browse API operation, keep the same boundary:

1. Add or update shared frontend types in `types.ts` only for fields the app reads or writes.
2. Add a browser helper in `client.ts` that calls a Firebase callable.
3. Add server-side request validation and REST construction under `functions/src/ebay`.
4. Export the callable from `functions/src/index.ts` and enforce the appropriate auth role there.
5. Update this README with a small mapping row from the local helper to the eBay REST method, then link to eBay's official method docs for the details.
