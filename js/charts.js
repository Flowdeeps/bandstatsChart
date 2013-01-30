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
    
    defaultRegion: 'nyc',
    defaultChartType: 'bandScore',
    defaultLimit: 20,

    cache: {},
    debug: true,
    initialized: false,

    init: function(callback) {
        bandstatsChart.setRegion(bandstatsChart.defaultRegion); 
        bandstatsChart.initialized = true;
        callback();
    },

    setChartType: function(chartType) {
        /* available types are:
         * lastFMListeners
         * lastFMListenersIncr
         * webBuzz
         * bandIncrMyspaceProfileViews
         * bandMyspaceProfileViews
         */
        bandstatsChart.chartType = chartType;
    },

    setRegion: function(region) {
        bandstatsChart.regions = [region];
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
            $('#bsc-scene-select').append('<option>' + region.regionName + '</option>');
        }
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
            params['limit'] = bandstatsChart.defaultLimit;
        }

        bandstatsChart._send(url, params, 'jsonp', function(results) {
            bandstatsChart.addChart(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addChart: function(results) {
        var score = 1;
        var half = (results.length / 2);

        $('#bsc-chart').empty();
        for (var r in results) {
            var result = results[r];
            var output = '';
           
            if (score <= half) { 
                output += "<li><h3><span>" + score + "</span>";
            } else {
                output += "<li class='alt'><h3><span>" + score + "</span>";
            }
            output += result.bandName + "</h3>";
            output += "<ul><li class='star4'>Star</li>";
            output += "<li class='facebook'>Band Facebook Page</li>";
            output += "<li class='listen'>Listen</li></ul></li>";
            
            $('#bsc-chart').append(output);
            score++;
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
        var params = [];
        params['region'] = $(this).val();
        bandstatsChart.getChart(params);
    });

    $('.bsc-genre-link').live('click', function() {
        if (bandstatsChart.genres.indexOf($(this).text()) >= 0) {
            bandstatsChart.removeGenre($(this).text());
        } else {
            bandstatsChart.addGenre($(this).text());
        }
        bandstatsChart.getChart();
    });
});
