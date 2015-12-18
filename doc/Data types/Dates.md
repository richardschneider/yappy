A Date or DateTime always gives problem.  All date-times are stored as an [ISO 8061](https://en.wikipedia.org/wiki/ISO_8601) formatted string that is zero relative to UTC, e.g. `'2015-10-26T05:06:38.260Z'`.  A date is in the form `yyyy-mm-dd` e.g. `'2015-10-26'`.

These formats allow a string compare to determine the ordering of dates no matter what time zone the client (server or database) is running in.

!!! note
    There is an equality issue when mixing 3-digit and 6-digit partial seconds. `2015-10-26T05:06:38.260Z` is **not** considered equal to `2015-10-26T05:06:38.260000Z`

The current time in javascript is

    var now = new Date().toISOString();
