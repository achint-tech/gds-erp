# Design Workflow

## Approved V1 flow

Design Task
→ Working Drawing V1
→ Submitted
→ Revision V2/V3 when required
→ Approved

## Design Tasks

- A project may have zero, one, or many Design Tasks.
- Design Type is `2D`, `3D`, `MEP`, `Fixture Drawing`, or `Other`.
- Status is `Not Started`, `In Progress`, `Waiting`, `Approved`, or `Closed`.
- Assignment uses an active internal user with the `designer` capability. Designer names are not hard-coded in the UI.
- When status is `Waiting`, Waiting For is `Client Feedback`, `Site Measurement`, `Inputs`, or `Other`.
- Waiting For is cleared when the task is not Waiting.
- Design activity does not change Project Status, lifecycle, Job Code, or financial-year sequence and does not require a Client PO.

## Drawing versions

- Versions belong to a Design Task and are assigned by the server as V1, V2, V3, and so on.
- Version status is `Working`, `Submitted`, `Superseded`, or `Approved`.
- A Working version may be edited.
- Submitted and Approved drawing links and history are preserved; a revision creates a new version and supersedes the preceding current version.
- Only one version per task may be Approved. Approval supersedes a prior Approved version and sets the task status to Approved.

## Derived health

- Open, Waiting, Approved, and Overdue task counts are derived.
- A task is Overdue when its target date is before today and its status is neither Approved nor Closed.
- Current Version and Latest Submitted Version are derived from version history.

## V1 boundary

- Drawing files remain in Google Drive; ERP stores links only.
- File uploads, previews, comments, approval hierarchy, reminders, notifications, productivity tracking, timesheets, authentication, and automatic Project Status changes are deferred.
