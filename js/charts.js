/**
 *
 * bandstats chart
 *
 * author: Mark Lewis
 */

var bandstatsChart = {
   
    deliDomain: 'http://www.thedelimagazine.com/bandstats/api',

    genres: [],
    regions: [], 
    bandNames: [],
    chartType: '',
    allRegions: [],
    allGenres: [],
    chartResults: [],
    limit: 400,
    display: 20,
    page: 1,
 
    defaultRegion: 'NYC',
    defaultChartType: 'bandScore',

    facebookId: '',
    cache: {},
    debug: true,
    initialized: false,

    init: function(callback) {
        bandstatsChart.setRegion(bandstatsChart.defaultRegion); 
        bandstatsChart.showSelectedRegion();
        bandstatsChart.setChartType(bandstatsChart.defaultChartType);
        bandstatsChart.initialized = true;
        callback();
    },

    setChartType: function(chartType) {
        bandstatsChart.chartType = chartType;
    },

    setLimit: function(limit) {
        bandstatsChart.limi = limit;
    },

    setRegion: function(region) {
        bandstatsChart.regions = [region];
    },

    setFacebookId: function(id) {
        bandstatsChart.facebookId = id;
    },

    addRegion: function(region) {
        bandstatsChart.regions.push(region);
    },

    getAllRegions: function(callback) {
        var url = bandstatsChart.deliDomain + '/regions.php';

        bandstatsChart._send(url, [], 'jsonp', function(results) {
            bandstatsChart.addRegionsOptions(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addRegionsOptions: function(results) {
        $('#bsc-scene-select').empty();
        for (var r in results) {
            var region = results[r];
            $('#bsc-scene-select').append("<option value='" + region.regionName + "'>" + region.regionName + '</option>');
        }
        bandstatsChart.showSelectedRegion();
    },

    showSelectedRegion: function() {
        var region = bandstatsChart.regions;
        $('#bsc-scene-select').val(region);
    },

    addGenre: function(genre) {
        bandstatsChart.genres.push(genre);
        bandstatsChart.showSelectedGenres();
    },

    removeGenre: function(genre) {
        var index = bandstatsChart.genres.indexOf(genre);
        bandstatsChart.genres.splice(index, 1);
        bandstatsChart.showSelectedGenres();
    },

    showSelectedGenres: function() {
        $('#bsc-genre-list').empty();
        for (var g in bandstatsChart.genres) {
            var genre = bandstatsChart.genres[g];
            var output = "<li><a href='#'>" + genre + "</a></li>";
            $('#bsc-genre-list').append(output);
        }
    },

    getAllGenres: function(callback) {
        var url = bandstatsChart.deliDomain + '/genres.php';

        bandstatsChart._send(url, [], 'jsonp', function(results) {
            bandstatsChart.addGenresOptions(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addGenresOptions: function(results) {
        $('#bsc-genre-select').empty();
        for (var g in results) {
            var genre = results[g];
            var output = "<li class='bsc-genre-link'>";
            
            output += "<input type='checkbox' name='" + genre.genreName + "' value='" + genre.genreName + "' />";
            output += genre.genreName + "</li>";
            $('#bsc-genre-select').append(output);
        }
    }, 

    getChart: function(params, callback) {
        var url = bandstatsChart.deliDomain + '/chart.php';

        if (!params) {
            var params = [];
        }

        if (!params['region']) {
            params['region'] = bandstatsChart.regions.join(',');
        }

        if (!params['genre']) {
            params['genre'] = bandstatsChart.genres.join(',');
        }
        
        if (!params['limit']) {
            params['limit'] = bandstatsChart.limit;
        }

        if (!params['orderBy']) {
            params['orderBy'] = bandstatsChart.chartType;
        }

        bandstatsChart._send(url, params, 'jsonp', function(results) {
            bandstatsChart.chartResults = results;
            bandstatsChart.displayChart(results);
            if (callback) {
                callback(results);
            }
        });
    },

    displayChart: function(results) {
        var score = 0;
        var added = 0;
        var half = (bandstatsChart.display / 2);
        var start = (bandstatsChart.page-1) * bandstatsChart.display;
        var end = (start + bandstatsChart.display);

        if (!results) {
            var results = bandstatsChart.chartResults;
        }

        $('#bsc-chart').empty();
        for (var r in results) {
            score++;
            if (score >= (start+1) ) {
                added++;
                console.log('adding '+score);
                var result = results[r];
                var output = '';
           
                if (added <= half) { 
                    output += "<li><h3><span>" + score + "</span>";
                } else {
                    output += "<li class='alt'><h3><span>" + score + "</span>";
                }
                output += result.bandName + "</h3>";
                output += "<ul><li class='star4' data-band-id='" + result.bandId + "'>";
                // slide out 5 star rating
                //output += "<div id='slideout'>";
                //output += "<img src='images/img_icon_star_2.png'>";
                //output += "<div id='slideout_inner'>";

                // 5 stars here
                output += "<div class='band_rating'>";
                output += "<div id='bsc-rating-" + results.bandId + "' class='rate_widget'>";
                output += "<ul class='stars'>";
                output += "<li class='star_1 ratings_stars'></li>";
                output += "<li class='star_2 ratings_stars'></li>";
                output += "<li class='star_3 ratings_stars'></li>";
                output += "<li class='star_4 ratings_stars'></li>";
                output += "<li class='star_5 ratings_stars'></li>";
                output += "</ul>";
                output += "</div>";
                output += "</div>";

                // slide out ends 
                //output += "</div>";
                //output += "</div>";

                output += "</li>";
                output += "<li class='facebook'>Band Facebook Page</li>";
                output += "<li class='listen' data-band-name='" + result.bandName + "'>Listen</li></ul></li>";
                
                $('#bsc-chart').append(output);
            }
            if (score === end) {
                break;
            }
        }
    },
    
    displayNextChart: function() {
        var nextEnd = ((bandstatsChart.page+1) * bandstatsChart.display);
        var total = bandstatsChart.chartResults.length;
        var hasMore = ((nextEnd < bandstatsChart.limit) && (nextEnd < total)); 
        if (hasMore) {
            bandstatsChart.page++;
            bandstatsChart.displayChart();
        }
    },
    
    displayPrevChart: function() {
        if (bandstatsChart.page >= 2) {
            bandstatsChart.page--;
            bandstatsChart.displayChart();
        }
    },

    showLoading: function() {
        
    },

    hideLoading: function() {

    },

    log: function(msg) {
        if (bandstatsChart.debug) {
            console.log(msg);
        }
    },
    
    _send: function(url, params, dataType, callback) {
        var first = true;

        // show loading page
        bandstatsChart.showLoading();

        for (param in params) {
            url += (first) ? '?' : '&';
            first=false;
            url += param + "=" + params[param]
        }

        bandstatsChart.log(url);

        if (this.cache[url]) {
            bandstatsChart.log(url + ' loaded from cache');
            bandstatsChart.hideLoading();
            callback(this.cache[url]);
        } else {
            $.ajax({
                url: url,
                type: 'get',
                dataType: dataType,
                success: function(response) {
                    bandstatsChart.cache[url] = response
                    bandstatsChart.hideLoading();
                    callback(response);
                },
                error: function(errorObj, textStatus, errorMsg) {
                    console.log(url + ' -- ' + JSON.stringify(errorMsg));
                    callback();
                }
            });
        }
    } 
 
};

$(function(){
    /* event handlers */
    $('#bsc-scene-select').change(function() {
        bandstatsChart.setRegion($(this).val());
        bandstatsChart.getChart();
    });

    $('#bsc-orderby-select').change(function() {
        bandstatsChart.setChartType($(this).val());
        bandstatsChart.getChart();
    });

    $('.bsc-genre-link').live('click', function() {
        if (bandstatsChart.genres.indexOf($(this).text()) >= 0) {
            bandstatsChart.removeGenre($(this).text());
        } else {
            bandstatsChart.addGenre($(this).text());
        }
        bandstatsChart.getChart();
    });

    $('.listen').live('click', function() {
        var url = "http://www.thedelimagazine.com/media_player/media_player.html?band_name=" + $(this).attr('data-band-name');
        window.open(url, 'deliPlayer', 'width=270,height=800,menubar=0,location=0,titlebar=0,toolbar=0,status=0,directories=0, ');
    });

    $('.star4').live('click', function() {
        var bandId = $(this).attr('data-band-id');
        var url = '../api/rating.php?bandId=' + bandId + '&rating=1';
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function(response) {
                console.log(response);
            },
            error: function(errorObj, textStatus, errorMsg) {
                console.log(url + ' -- ' + JSON.stringify(errorMsg));
            }
        });
    });

    $('#bsc-prev').live('click', function() {
        bandstatsChart.displayPrevChart();
    });

    $('#bsc-next').live('click', function() {
        bandstatsChart.displayNextChart();
    });

    $('#bsc-limit-select').change(function() {
        bandstatsChart.display = parseInt($(this).val());
        bandstatsChart.displayChart();
    });

});
