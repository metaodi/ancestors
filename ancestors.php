<html>
  <head>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
        <!-- <script type="text/javascript" src="https://tools.wmflabs.org/magnustools/resources/js/wikidata.js"></script> -->
        <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
        <script type="text/javascript" src="async.js"></script>
    <script type="text/javascript">
      google.load("visualization", "1", {packages:["orgchart"]});
      google.setOnLoadCallback(drawChart);
      function getLevel(item_id, child_id, lang, level, callback, finalCb) {
        if (level === 0) {
            return;
        }
        $.getJSON( "https://www.wikidata.org/w/api.php?callback=?",{
                                action : 'wbgetentities' ,
                                ids :  item_id ,
                                props : 'labels|descriptions|claims' ,
                                languages : lang,
                                languagefallback : '1',
                                format : 'json'
                }, function (data) {
                    callback(data, item_id, child_id, lang, level, finalCb);
                });
       }

     function processLevel(data, item_id, child_id, lang, level, levelCb) {
           // add a different class for fallback language
           for (label_lang in data.entities[item_id].labels) {
             var label =  data.entities[item_id].labels[label_lang].value;
             break;
           }
           for (descr_lang in data.entities[item_id].descriptions) {
             var descr =  data.entities[item_id].descriptions[descr_lang].value;
             break;
           }
           var claims = data.entities[item_id].claims;
           // mother P25
            if (claims['P25']) {
                var mother_item_id = 'Q' + claims['P25'][0].mainsnak.datavalue.value['numeric-id'] || null;
            }
           // father P22
            if (claims['P22']) {
               var father_item_id = 'Q' + claims['P22'][0].mainsnak.datavalue.value['numeric-id'] || null;
            }
           // image P18
            if (claims['P18']) {
                var image_page = claims['P18'][0].mainsnak.datavalue.value || null;
            }

           // console.log(rows);
           async.series([
            function(callback) {
                if (mother_item_id) {
                    getLevel(mother_item_id, item_id, lang, level-1, function(data, item_id, child_id, lang, level) {
                        processLevel(data, item_id, child_id, lang, level, callback);
                    }); 
                } else {
                    callback();
                }
            },
            function(callback) {
                if (father_item_id) {
                    getLevel(father_item_id, item_id, lang, level-1, function(data, item_id, child_id, lang, level) {
                        processLevel(data, item_id, child_id, lang, level, callback);
                    }); 
                } else {
                    callback();
                }
            },
            function(callback) {
                if (image_page) {
                    // http://www.wikidata.org/w/api.php?action=query&titles=File:Willem-Alexander,%20Prince%20of%20Orange.jpg&prop=imageinfo&iiprop=url&iiurlwidth=100&format=json
                    $.getJSON( "https://www.wikidata.org/w/api.php?callback=?",{
                                            action : 'query' ,
                                            //titles :  'File:' + encodeURIComponent(image_page) ,
                                            titles :  'File:' + image_page,
                                            prop : 'imageinfo' ,
                                            iiprop : 'url',
                                            iiurlwidth : 100,
                                            format : 'json'
                            }, function (data) {
                                rows.push([{v:item_id, f: '<div><a href="' + location.href.replace(location.search, '') + '?q=' + item_id + '">' + label + '</a></div><img alt="File:' + image_page + '" src="' + data.query.pages['-1'].imageinfo[0].thumburl + '">'}, child_id, descr]);
                                callback();
                            });
                } else {
                                rows.push([{v:item_id, f: '<div><a href="' + location.href.replace(location.search, '') + '?q=' + item_id + '">' + label + '</a></div>'}, child_id, descr]);
                    callback();
                }
            }
           ],
           function(err, results) {
                console.log(results);
                levelCb();
           });
           levelCb(null, level);
        } 

      var rows = [];
    
      function drawChart() {
        var root = getParameterByName('q') || 'Q154952';
        var lang = getParameterByName('lang') || 'en';
        var maxLevel = getParameterByName('level') || '5';
        getLevel(root, '', lang, maxLevel, processLevel, function() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Name');
            data.addColumn('string', 'Manager'); // Child == Manager
            data.addColumn('string', 'ToolTip');
        
            data.addRows(rows);
                   
            var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
            chart.draw(data, {allowHtml:true});
        });
      }
       function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
   </script>
    </head>
  <body>
    <div id="chart_div""></div>
  </body>
</html>
