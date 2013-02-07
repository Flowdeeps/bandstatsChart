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
        var index = bandstatsChart.genres.indexOf(genre);
        if (index < 0) {
            bandstatsChart.genres.push(genre);
            bandstatsChart.showSelectedGenres();
            bandstatsChart.getChart();
        }
    },

    removeGenre: function(genre) {
        var index = bandstatsChart.genres.indexOf(genre);
        bandstatsChart.genres.splice(index, 1);
        bandstatsChart.showSelectedGenres();
        bandstatsChart.getChart();
    },

    showSelectedGenres: function() {
        $('#bsc-genre-list').empty();
        for (var g in bandstatsChart.genres) {
            var genre = bandstatsChart.genres[g];
            var output = "<li><a href='#'>" + genre + "</a></li>";
            $('#bsc-genre-list').append(output);
            $("input:checkbox[value='" + genre + "']").attr("checked", true);
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
            var output = "<li>";
            
            output += "<input class='bsc-genre-link' type='checkbox' name='" + genre.genreName + "' value='" + genre.genreName + "' />";
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
                var result = results[r];
                var output = '';
           
                if (added <= half) { 
                    output += "<li><h3><span>" + score + "</span>";
                } else {
                    output += "<li class='alt'><h3><span>" + score + "</span>";
                }
                output += result.bandName + "</h3>";
                output += "<ul><li class='star4' data-band-id='" + result.bandId + "'>";

                // 5 stars here
                output += "<div class='band_rating'>";
                output += "<div data-band-id='" + result.bandId + "' class='rate_widget'>";
                output += "<ul class='stars'>";
                output += "<li class='star_1 ratings_stars'></li>";
                output += "<li class='star_2 ratings_stars'></li>";
                output += "<li class='star_3 ratings_stars'></li>";
                output += "<li class='star_4 ratings_stars'></li>";
                output += "<li class='star_5 ratings_stars'></li>";
                output += "</ul>";
                output += "</div>";
                output += "</div>";

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

    saveUserPrefs: function() {
        // save the list to the server
        var genreList = [];
        $('.bsc-genre-link:checked').each(function() {
            genreList.push($(this).val());
        });
        var genreListString = genreList.join(",");
        var url = bandstats.deliDomain + '/save_prefs.php?name=genre-list&value=' + genreListString;
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
    },

    saveBandRating: function(bandId, ratingScore, callback) {
        var url = bandstatsChart.deliDomain + '/save_rating.php?band_id=' + bandId + '&rating_score=' + ratingScore;
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function(response) {
                console.log(response);
                callback(response);
            },
            error: function(errorObj, textStatus, errorMsg) {
                console.log(url + ' -- ' + JSON.stringify(errorMsg));
            }
        });
        
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
        if (bandstatsChart.genres.indexOf($(this).val()) >= 0) {
            bandstatsChart.removeGenre($(this).val());
            bandstatsChart.saveUserPrefs();
        } else {
            bandstatsChart.addGenre($(this).val());
            bandstatsChart.saveUserPrefs();
        }
    });

    $('.listen').live('click', function() {
        var url = "http://www.thedelimagazine.com/media_player/media_player.html?band_name=" + $(this).attr('data-band-name');
        window.open(url, 'deliPlayer', 'width=270,height=800,menubar=0,location=0,titlebar=0,toolbar=0,status=0,directories=0, ');
    });

    $('#bsc-prev').live('click', function(event) {
        bandstatsChart.displayPrevChart();
        event.preventDefault();
    });

    $('#bsc-next').live('click', function(event) {
        bandstatsChart.displayNextChart();
        event.preventDefault();
    });

    $('#bsc-limit-select').change(function() {
        bandstatsChart.display = parseInt($(this).val());
        bandstatsChart.displayChart();
    });

    /**
     * 5 star rating functions
     */

    // initial setting
    $('.rate_widget').each(function(i) {
        var widget = this;
        var out_data = {
            band_id : $(widget).attr('data-band-id')
        };
        /*  
        $.post(
            '/rating/show',
            out_data,
            function(INFO) {
                $(widget).data( 'fsr', INFO );
                set_votes(widget);
            },
            'json'
        );
        */
    });
    
    $('.ratings_stars').live({ 
        mouseenter:
            function() {
                $(this).prevAll().andSelf().addClass('active');
                //$(this).nextAll().removeClass('ratings_vote'); 
            },
        mouseleave:
            function() {
                $(this).prevAll().andSelf().removeClass('active');
                // can't use 'this' because it wont contain the updated data
                set_votes($(this).closest('.rate_widget'));
            }
        }
    );

    // This actually records the vote
    $('.ratings_stars').live('click', function() {
        var star = this;
        var widget = $(this).closest('.rate_widget');
        var ratingScore = $(star).attr('class').match(/star_(\d+)/)[1];
        var bandId = widget.attr('data-band-id');
 
        bandstatsChart.saveBandRating(bandId, ratingScore, function(response) {
            widget.data('fsr', response);
            set_votes(widget);
        });
    });

    function set_votes(widget) {
        if ($(widget).data('fsr')) {
            var avg = $(widget).data('fsr').whole_avg;
            var votes = $(widget).data('fsr').number_votes;
            var exact = $(widget).data('fsr').dec_avg;
            var error = $(widget).data('fsr').error;

            $(widget).find('.star_' + avg).prevAll().andSelf().addClass('ratings_vote');
            $(widget).find('.star_' + avg).nextAll().removeClass('ratings_vote'); 
        }
    }
});
