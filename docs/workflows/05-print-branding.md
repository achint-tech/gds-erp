# Print / Branding Requests

## Approved V1 flow

Operational requirement → Vendor production → Ready → Dispatched → Installed

- A project may have multiple Print Requests.
- Print Type is Vinyl, Sticker, Flex, Sunboard, Fabric, Backlit, or Other.
- Dimensions are optional structured width, height, and unit values; when used, both positive dimensions and a unit are required.
- Quantity is a positive whole number.
- Requested By references an active internal user.
- Vendor and artwork Drive link are optional.
- Status is Raised, Sent to Vendor, In Production, Ready, Dispatched, Installed, or Cancelled.
- Installed and Cancelled records remain visible as history and are not hard-deleted.
- Open, In Production, Ready, and Installed counts are derived.
- Print Requests contain no costs, rates, quotations, payments, or supplier PO amounts.
- Future Purchase linkage is deferred until Purchase persistence is approved; Purchase remains the separate commercial workflow.
- Artwork remains in Google Drive; ERP stores its link only.
