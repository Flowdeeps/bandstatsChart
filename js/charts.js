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
    bandName: '',
    bandIds: [],
    chartType: '',
    allRegions: [],
    allGenres: [],
    chartResults: [],
    userRatings: [],
    limit: 400,
    display: 20,
    page: 1,
    format: 'full', 
    defaultChartType: 'bandScore',

    facebookId: '',
    cache: {},
    debug: true,
    initialized: false,

    init: function(callback) {
        bandstatsChart.showSelectedRegions();
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

    setBandIds: function(bandIds) {
        bandstatsChart.bandIds = bandIds;
    },

    setUserRatings: function(ratings) {
        bandstatsChart.userRatings = ratings;
    },

    setFacebookId: function(id) {
        bandstatsChart.facebookId = id;
    },

    addRegion: function(region) {
        bandstatsChart.regions.push(region);
        bandstatsChart.showSelectedRegions();
        console.log(bandstatsChart.regions);
        bandstatsChart.getChart();
    },

    removeRegion: function(region) {
        var index = bandstatsChart.regions.indexOf(region);
        bandstatsChart.regions.splice(index, 1);
        bandstatsChart.showSelectedRegions();
        bandstatsChart.getChart();
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
        $('#modal').empty();
        $('#modal').append("<a href='#' id='close'>Close</a>");
        $('#modal').append("<ul id='bsc-region-grandparents-list'></ul>");

        // add grand parents
        for (var r in results) {
            var region = results[r];
            if (region.regionDesc == "grandparent") {
                var output = "<li class='bsc-region-grandparent'>";
                output += "<h4>" + region.regionName + "</h4>";
                output += "<ul class='bsc-region-grandparent-list' id='bsc-region-parent-" + region.regionId + "'></ul>"; 
                output += "</li>";
                $('#bsc-region-grandparents-list').append(output);
            }
        }

        // add parents 
        for (var r in results) {
            var region = results[r];
            if (region.regionDesc == "parent") {
                var output = "<li class='bsc-region-parent'>";
                output += "<input class='bsc-region-option bsc-region-parent' value='" + region.regionName + "' type='checkbox' data-id='" + region.regionId + "'><label for='" + region.regionName + "'>" + region.regionName + "</label>";
                output += "<ul class='bsc-region-child-list' data-region='" + region.regionName + "' id='bsc-region-parent-" + region.regionId + "'></ul>";
                output += "</li>";
                $('#bsc-region-parent-' + region.parentId).append(output);
            }
        }
        
        // add children
        for (var r in results) {
            var region = results[r];
            if (region.regionDesc != "parent" && region.regionDesc != "grandparent") {
                var output = "<li class='bsc-region-child'>";
                output += "<input class='bsc-region-option' value='" + region.regionName + "' type='checkbox' id='" + region.regionName + "'><label for='" + region.regionName + "'>" + region.regionName + "</label>";
                output += "</li>";
                $('#bsc-region-parent-' + region.parentId).append(output);
            }
        }

        bandstatsChart.showSelectedRegions();
    },

    showSelectedRegions: function() {
        $('#bsc-region-list').empty();
        bandstatsChart.page = 1;
        $('.bsc-region-option').each(function() {
            $(this).attr('checked', false);
        });
        for (var r in bandstatsChart.regions) {
            var region = bandstatsChart.regions[r];
            var output = "<li><a href='#'>" + region + "</a></li>";
            $('#bsc-region-list').append(output);
            $("input:checkbox[value='" + region + "']").attr("checked", true);
        }
    },

    addGenre: function(genre) {
        var index = bandstatsChart.genres.indexOf(genre);
        if (index < 0) {
            bandstatsChart.genres.push(genre);
            bandstatsChart.showSelectedGenres();
            bandstatsChart.getChart();
        }
    },

    resetGenres: function() {
        bandstatsChart.genres = [];
        bandstatsChart.showSelectedGenres();
        bandstatsChart.getChart();
        if (bandstatsChart.facebookId) {
            bandstatsChart.saveGenrePrefs();
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
        bandstatsChart.page = 1;
        $('.bsc-genre-option').each(function() {
            $(this).attr('checked', false);
        });
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

        // first add parent
        for (var g in results) {
            var genre = results[g];
            if (genre.genreId === genre.parentId) {
                var output = "<li data-genre-id='" + genre.genreId + "' class='expandable'>";
                output += "<h2 class='expandable header bsc-genre-parent'><a href='#'>" +  genre.genreName + "</a></h2>";
                output += "<ul id='bsc-genre-children-" + genre.genreId + "' class='bsc-genre-child expandable collapsed'>";
                output += "</ul>";  
                output += "</li>";
                $('#bsc-genre-tree').append(output);
            }
        }

        // now add children
        for (var g in results) {
            var genre = results[g];
            if (genre.parentId != genre.genreId) {
                var output = "<li>";
                output += "<input class='bsc-genre-option' id='" + genre.genreName + "' type='checkbox' name='" + genre.genreName + "' value='" + genre.genreName + "' />";
                output += "<label for='" + genre.genreName + "'>" + genre.genreName + "</label></li>";
                $('#bsc-genre-children-' + genre.parentId).append(output);
            }
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

        if (!params['bandId']) {
            params['bandId'] = bandstatsChart.bandIds.join(',');
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

                if (bandstatsChart.bandName) {
                    var regexp = new RegExp(bandstatsChart.bandName, 'i');
                    if (result.bandName.match(regexp)) {
                        output += "<font color='red'>*" + result.bandName + "</font></h3>";
                    } else {
                        output += result.bandName + "</h3>";
                    }
                } else {
                    output += result.bandName + "</h3>";
                }

                output += "<ul><li class='star4' data-band-id='" + result.bandId + "'>";

                // 5 stars here
                output += "<div class='band_rating'>";
                output += "<div id='bsc-rate-widget-" + result.bandId + "' data-band-id='" + result.bandId + "' class='rate_widget'>";
                output += "<ul class='stars'>";
                output += "<li class='star_1 ratings_stars'></li>";
                output += "<li class='star_2 ratings_stars'></li>";
                output += "<li class='star_3 ratings_stars'></li>";
                output += "<li class='star_4 ratings_stars'></li>";
                output += "<li class='star_5 ratings_stars'></li>";
                output += "<li class='star_0 ratings_delete'></li>";
                output += "</ul>";
                output += "</div>";
                output += "</div>";

                output += "</li>";
                if (result.bandFacebookId) {
                    output += "<li class='facebook' data-href='http://www.facebook.com/" + result.bandFacebookId + "'>Band Facebook Page</li>";
                }
                output += "<li class='listen' data-band-name='" + result.bandName + "'>Listen</li></ul></li>";
                
                $('#bsc-chart').append(output);
            }
            if (score === end) {
                break;
            }
        }

        if (bandstatsChart.facebookId) {
            bandstatsChart.applyUserRatings();
        }
    },
    
    displayNextChart: function() {
        var nextEnd = ((bandstatsChart.page+1) * bandstatsChart.display);
        var total = bandstatsChart.chartResults.length;
        var hasMore = ((nextEnd <= bandstatsChart.limit) && (nextEnd <= total)); 
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

    displayChartForBand: function(bandName) {
        for (var b in bandstatsChart.chartResults) {
            var band = bandstatsChart.chartResults[b];
            var regexp = new RegExp(bandName, 'i');
            if (band.bandName.match(regexp)) {
                var placement = parseInt(b) + 1;
                var page = Math.ceil(placement / bandstatsChart.display);
                bandstatsChart.bandName = bandName;
                bandstatsChart.page = page;
                bandstatsChart.displayChart();
                return true;
            }
        }
        // if not match found
        alert(bandName + ' has not made it into the chart');
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
            url += param + "=" + encodeURIComponent(params[param]);
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
    },

/**
 * user interaction stuff
 */

    applyUserPrefs: function() {
        $.ajax({
            url: bandstatsChart.deliDomain + '/prefs.php',
            type: 'get',
            dataType: 'json',
            success: function(response) {
                if (response) {
                    // apply genres
                    if (response['genre-list']) {
                        var genrePrefs = response['genre-list'].split(',');
                        for (var g in genrePrefs) {
                            var genre = genrePrefs[g];
                            bandstatsChart.addGenre(genre);
                        } 
                    }
                    // apply regions
                    if (response['region-list']) {
                        var regionPrefs = response['region-list'].split(',');
                        for (var g in regionPrefs) {
                            var region = regionPrefs[g];
                            bandstatsChart.addRegion(region);
                        } 
                    }
                    // apply ratings
                    if (response['band_ratings']) {
                        bandstatsChart.setUserRatings(response['band_ratings']);
                        bandstatsChart.applyUserRatings();
                    }
                } 
            },
            error: function() {
                console.log('could not get prefs');
            }
        }); 
 
    },
    
    applyUserRatings: function() {
        var ratings = bandstatsChart.userRatings;
        for (var bandId in ratings) {
            for (var cr in bandstatsChart.chartResults) {
                var chartResult = bandstatsChart.chartResults[cr];
                if (bandId = chartResult.bandId) {
                    var widget = $('#bsc-rate-widget-'+bandId);
                    var rating = { 
                        whole_avg: ratings[bandId],
                        number_votes: 1,
                        dec_avg: ratings[bandId],
                        error: ""
                    }
                    widget.data('fsr', rating);
                    bandstatsChart.setRatingWidgetVotes(widget);
                    // add unstar option to band
                }
            }
        }
    },

    saveRegionPrefs: function() {
        // save the list to the server
        var regionList = [];
        $('.bsc-region-option:checked').each(function() {
            regionList.push($(this).val());
        });
        var regionListString = regionList.join(",");

        var url = bandstatsChart.deliDomain + '/save_prefs.php?name=region-list&value=' + regionListString;
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function(response) {
                bandstatsChart.log(response);
            },
            error: function(errorObj, textStatus, errorMsg) {
                console.log(url + ' -- ' + JSON.stringify(errorMsg));
            }
        });
    },

    saveGenrePrefs: function() {
        // save the list to the server
        var genreList = [];
        $('.bsc-genre-option:checked').each(function() {
            genreList.push($(this).val());
        });
        var genreListString = genreList.join(",");

        var url = bandstatsChart.deliDomain + '/save_prefs.php?name=genre-list&value=' + genreListString;
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function(response) {
                bandstatsChart.log(response);
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
                bandstatsChart.log(response);
                callback(response);
            },
            error: function(errorObj, textStatus, errorMsg) {
                console.log(url + ' -- ' + JSON.stringify(errorMsg));
            }
        });
        
    },
 
    setRatingWidgetVotes: function(widget) {
        if ($(widget).data('fsr')) {
            var avg = $(widget).data('fsr').whole_avg;
            var votes = $(widget).data('fsr').number_votes;
            var exact = $(widget).data('fsr').dec_avg;
            var error = $(widget).data('fsr').error;
            if (votes === 0) {
                $(widget).find('.ratings_stars').each(function() {
                    $(this).removeClass('ratings_vote');
                });
                return false;
            };

            $(widget).find('.star_' + avg).prevAll().andSelf().addClass('ratings_vote');
            $(widget).find('.star_' + avg).nextAll().removeClass('ratings_vote'); 
        }
    },
    
    facebookInit: function() {
        window.fbAsyncInit = function() {
            FB.init({
                //appId      : '115928858587081',
                appId      : '204182706372946',
                channelUrl : '//www.thedelimagazine.com/bandstats/channel.html', 
                status     : true,
                cookie     : true, 
                xfbml      : true 
            });

            // Additional init code here
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    // connected
                    FB.api('/me', function(response) {
                        bandstatsChart.log(response);
                        bandstatsChart.setFacebookId(response.id);
                        bandstatsChart.applyUserPrefs();
                    });
                } else if (response.status === 'not_authorized') {
                    // not_authorized
                    //bandstatsChart.facebookLogin();
                } else {
                    // not_logged_in
                    //bandstatsChart.facebookLogin();
                }
            });

        FB.Event.subscribe('auth.login', function(r) {
            if ( r.status === 'connected' ) {
                // a user has logged in
                FB.api('/me', function(response) {
                    bandstatsChart.setFacebookId(response.id);
                    bandstatsChart.applyUserPrefs();
                });
            }
        });
        }
    },

    facebookLogin: function() {
        FB.login(function(response) {
            if (response.authResponse) {
                // connected
                FB.api('/me', function(response) {
                    bandstatsChart.setFacebookId(response.id);
                    bandstatsChart.applyUserPrefs();
                });
            } else {
                // cancelled
                bandstatsChart.log('error loggin in: '+response);
            }
        });
    },

    facebookLogout: function() {
        FB.logout(function(response) {
            // logged out
            bandstatsChart.facebookId = null;
        });
    },

    /**
     * HTML stuff
     */
    writeMenu: function() {

    },

    writeChart: function() {

    },

    writeAside: function() {

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

    $('#bsc-show-select').change(function() {
        if (bandstatsChart.facebookId) {
            if ($(this).val() === "starred") { 
                var bandIds = [];
                for (var bandId in bandstatsChart.userRatings) {
                    bandIds.push(bandId);
                }
                bandstatsChart.setBandIds(bandIds);
            } else {
                bandstatsChart.setBandIds([]);
            }
            bandstatsChart.getChart();
        } else {
            // show facebook features
            alert('login with facebook');
        }
    });

    $('#bsc-reset-genres').live('click', function() {
        bandstatsChart.resetGenres();
        return false;
    });

    $('.bsc-genre-option').live('click', function() {
        if (bandstatsChart.genres.indexOf($(this).val()) >= 0) {
            bandstatsChart.removeGenre($(this).val());
            bandstatsChart.saveGenrePrefs();
        } else {
            bandstatsChart.addGenre($(this).val());
            bandstatsChart.saveGenrePrefs();
        }
    });

    $('.listen').live('click', function() {
        var url = "http://www.thedelimagazine.com/media_player/media_player.html?band_name=" + $(this).attr('data-band-name');
        window.open(url, 'deliPlayer', 'width=300,height=800,menubar=0,location=0,titlebar=0,toolbar=0,status=0,directories=0, ');
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

    $('.fb-login-button').live('click', function() {
        bandstatsChart.facebookLogin();
    });

    $('#bsc-logout-btn').live('click', function() {
        bandstatsChart.facebookLogout();
    });

    $('.facebook').live('click', function() {
        window.open($(this).attr('data-href'), '_blank');
    });

    $('#bs-band-name').on('keypress', function(e) {
        if(e.keyCode==13){
        // Enter pressed...
            bandstatsChart.displayChartForBand($(this).val());
            return false;
        }
    });

    $('.bsc-region-option').live('click', function() {
        if (bandstatsChart.regions.indexOf($(this).val()) >= 0) {
            bandstatsChart.removeRegion($(this).val());
            if ($(this).hasClass('bsc-region-parent')) {
                var regionId =  $(this).attr('data-id');
                // check all children
                $('#bsc-region-parent-' + regionId).find($('.bsc-region-option')).each(function() {
                    $(this).attr('checked', false);
                    bandstatsChart.removeRegion($(this).val());
                });
            }
            bandstatsChart.saveRegionPrefs();
        } else {
            bandstatsChart.addRegion($(this).val());
            if ($(this).hasClass('bsc-region-parent')) {
                var regionId =  $(this).attr('data-id');
                // check all children
                $('#bsc-region-parent-' + regionId).find($('.bsc-region-option')).each(function() {
                    $(this).attr('checked', true);
                    bandstatsChart.addRegion($(this).val());
                });
            }
            bandstatsChart.saveRegionPrefs();
        }
    });

    $('#select-regions').on('click', function() {
        $('#overlay').fadeIn(function() {
            $('#modal').fadeIn();
            bandstatsChart.showSelectedRegions();
            return false;
        })
    });

    $('#close').live('click', function() {
        $('#modal').fadeOut(function() {
            $('#overlay').fadeOut();
            return false;
        });
    });

    /**
     * 5 star rating functions
     */

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
                bandstatsChart.setRatingWidgetVotes($(this).closest('.rate_widget'));
            }
        }
    );

    // This actually records the vote
    $('.ratings_stars, .ratings_delete').live('click', function() {

        if (!bandstatsChart.facebookId) {
            alert('You must be logged in with facebook to use this feature');
            return false;
        }
        var star = this;
        var widget = $(this).closest('.rate_widget');
        var ratingScore = $(star).attr('class').match(/star_(\d+)/)[1];
        var bandId = widget.attr('data-band-id');
 
        bandstatsChart.saveBandRating(bandId, ratingScore, function(response) {
            widget.data('fsr', response);
            bandstatsChart.setRatingWidgetVotes(widget);
        });
    });

    /**
     * expandable stuff
     */
    $('.bsc-genre-parent').live('click', function() {
        var child = $(this).next('.bsc-genre-child');
        if (child.hasClass('collapsed')) {
            $(this).css("background-image", "url(./images/icon-arrow-down-black.png)");
            child.removeClass('collapsed');
            child.addClass('expanded');
        } else {
            $(this).css("background-image", "url(./images/icon-arrow-top-black-right.png)");
            child.removeClass('expanded');
            child.addClass('collapsed');
        }
        return false;
    });
});
