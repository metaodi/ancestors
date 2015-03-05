Ancestors gadget for Wikidata
=============================

The project was initially created during the [1st Swiss Open Cultural Data Hackathon in 2015](http://make.opendata.ch/wiki/event:2015-02).

This simple gadget displays the family tree of a given item from wikidata. It does that by querying Wikidata for the father/mother values.
If you want to use it on Wikidata, you can [enable it in your user settings (enable "Ancestor")](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets).

The tool is available at the following URL: https://tools.wmflabs.org/family/ancestors.php?q=Q7742&lang=en

## Parameters

The gadget takes 3 parameters in the URL:

* `q` (query): this is the root element, it must be a Wikidata ID (e.g. Q7742), default is `Q154952` (Willem-Alexander of the Netherlands)
* `lang` (language): the language in which the data should be displayed, default is `en`
* `level`: the amount of levels of the family tree, default is `5`.

