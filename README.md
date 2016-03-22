Ancestors gadget for Wikidata
=============================

This simple gadget displays the family tree of a given item from wikidata. It does that by querying Wikidata for the father/mother values. This is improved version of https://github.com/metaodi/ancestors .

The tool is available at the following URL: https://tools.wmflabs.org/nurni/ancestors2.php?q=Q7742&lang=en

## Parameters

The gadget takes 3 parameters in the URL:

* `q` (query): this is the root element, it must be a Wikidata ID (e.g. Q7742), default is `Q154952` (Willem-Alexander of the Netherlands)
* `lang` (language): the language in which the data should be displayed, default is `en`
* `level`: the amount of levels of the family tree, default is `5`.

