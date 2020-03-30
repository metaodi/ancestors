google.load("visualization", "1", {packages:["orgchart"]});
google.setOnLoadCallback(drawChart);

moment.locale('en' , { longDateFormat: {'L': "DD/MM/YYYY" } });


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

function getValue(claim) {
    return (claim && claim[0].mainsnak.datavalue && claim[0].mainsnak.datavalue.value) || null;
}

function getValueData(claim, dataType) {
    var value = getValue(claim);
    return value ? value[dataType] : null;
}

function getValueQid(claim) {
    var numericId = getValueData(claim, 'numeric-id');
    return numericId ? 'Q' + numericId : null;
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
    var mother_item_id = getValueQid(claims['P25']);
    // father P22
    var father_item_id = getValueQid(claims['P22']);
    // image P18
    var image_page = getValue(claims['P18']);
    // gender P21
    if (claims['P21']) {
        var gender_id = getValueData(claims['P21'], 'numeric-id');
        var gender_html = '';
        if (gender_id === 6581097) {
            gender_html = '<i class="fa fa-mars"></i>';
        } else if (gender_id === 6581072) {
            gender_html = '<i class="fa fa-venus"></i>';
        }
    }

    // date of birth P569
    var birth_value = getValueData(claims['P569'], 'time');

    // date of death P570
    var death_value = getValueData(claims['P570'], 'time');

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
                var html = '<div>';
                html += '<a href="' + location.href.replace(location.search, '') + '?q=' + item_id + '">' + label + '</a>';
                html += '<br/>' + gender_html;
                moment.locale(lang);
                if (birth_value) {
                    birth_date_object = moment(birth_value.substr('+'.length));
                    if (birth_date_object.isValid()) {
                        html += '<br/>' + birth_date_object.format('L') + '&nbsp;-&nbsp';
                    } else {
                        html += '<br/>' + birth_value.substr('+'.length, 4) + '&nbsp;-&nbsp';
                    }
                }
                if (death_value) {
                    death_date_object = moment(death_value.substr('+'.length));
                    if (death_date_object.isValid()) {
                        html += death_date_object.format('L');
                    } else {
                        html += death_value.substr('+'.length, 4);
                    }
                }

                html += '</div>';

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
                            html += '<img alt="File:' + image_page + '" src="' + data.query.pages['-1'].imageinfo[0].thumburl + '">';
                            rows.push(
                                [
                                    {
                                        v:item_id,
                                        f: html
                                    },
                                    child_id,
                                    descr
                                ]
                            );
                            callback(null, rows);
                        }
                    );
                } else {
                    rows.push(
                        [
                            {
                                v:item_id,
                                f: html
                            },
                            child_id,
                            descr
                        ]
                    );
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
