google.load("visualization", "1", {packages:["orgchart"]});
google.setOnLoadCallback(drawChart);

function getLevel(item_id, child_id, lang, level, callback, rows) {
    console.log("getLevel", level);
    if (level === 0) {
        callback();
        return;
    }
    $.getJSON(
        "https://www.wikidata.org/w/api.php?callback=?",
        {
            action : 'wbgetentities' ,
            ids :  item_id ,
            props : 'labels|descriptions|claims' ,
            languages : lang,
            languagefallback : '1',
            format : 'json'
        },
        function (data) {
            processLevel(data, item_id, child_id, lang, level, callback, rows);
        }
    );
}

function processLevel(data, item_id, child_id, lang, level, levelCb, rows) {
    console.log("processLevel", level);
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

    async.parallel(
        [
            function(callback) {
                if (mother_item_id) {
                    getLevel(
                        mother_item_id,
                        item_id,
                        lang,
                        level-1,
                        callback,
                        rows
                    ); 
                } else {
                    callback();
                }
            },
            function(callback) {
                if (father_item_id) {
                    getLevel(
                        father_item_id,
                        item_id,
                        lang,
                        level-1,
                        callback,
                        rows
                    ); 
                } else {
                    callback();
                }
            },
            function(callback) {
                if (image_page) {
                    $.getJSON(
                        "https://www.wikidata.org/w/api.php?callback=?",
                        {
                            action : 'query' ,
                            titles :  'File:' + image_page,
                            prop : 'imageinfo' ,
                            iiprop : 'url',
                            iiurlwidth : 100,
                            format : 'json'
                        },
                        function (data) {
                            rows.push([{v:item_id, f: '<div><a href="' + location.href.replace(location.search, '') + '?q=' + item_id + '">' + label + '</a></div><img alt="File:' + image_page + '" src="' + data.query.pages['-1'].imageinfo[0].thumburl + '">'}, child_id, descr]);
                            callback(null, rows);
                        }
                    );
                } else {
                    rows.push([{v:item_id, f: '<div><a href="' + location.href.replace(location.search, '') + '?q=' + item_id + '">' + label + '</a></div>'}, child_id, descr]);
                    callback(null, rows);
                }
            }
        ],
        function(err, results) {
            console.log("level", level);
            updateRows(rows);
            levelCb();
        }
    );
} 


function drawChart() {
    var rows = [];
    var root = getParameterByName('q') || 'Q154952';
    var lang = getParameterByName('lang') || 'en';
    var maxLevel = getParameterByName('level') || '5';
    getLevel(
        root,
        '',
        lang,
        maxLevel,
        function() {
            console.log("DONE")
        },
        rows
   );
}


function updateRows(rows) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Child');
    data.addColumn('string', 'ToolTip');
    data.addRows(rows);
    var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
    chart.draw(data, {allowHtml:true});
}


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
