The `geometry` data type is used to encode a variety of geographic data structures.  The [GetJSON](http://geojson.org/) standard is used which can be used to map a single point (longitude and latitude) or a shape.

> GeoJSON is a geospatial data interchange format based on JavaScript Object Notation (JSON).  It defines several types of JSON objects and the manner in which they are combined to represent data about geographic features, their properties, and their spatial extents. This document recommends a single coordinate reference system based on WGS 84.

````json
{
  "type": "Point",
  "coordinates": [174.7730953, -41.2948713]
}
````