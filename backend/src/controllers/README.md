# Controllers

Route handler logic currently lives inside each route file under `routes/`.
This is a common Express pattern for small-to-medium projects.

If the codebase grows, extract handler functions into this directory
(e.g. `authController.js`, `meetingController.js`) and import them in the
corresponding route files to keep routes thin.
