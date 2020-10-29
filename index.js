'use strict';
const searchGenius = 'https://api.genius.com/search?';
const api2URL = 'https://orion.apiseeds.com/api/music/lyric/';
const api2KEY = 'eCZHXQqgx4peFlrrilNN9iDJTyRBRGg6og5XsOL50mTbD69tnEtHSiFftKhWrF0U';
const apiKeyGenius = 'qAkEc2vvpHy6e0yxrKlIvK1scxr3HFEIaBCUnXZr-ZpwL8pLuTLb25aRk9YB6752';

//main process user request
function getAPILyrics(resultsGenius) {
    const api2URLnew = api2URL + `${resultsGenius.result.primary_artist.name}/${resultsGenius.result.title}?apikey=` + api2KEY;
    fetch(api2URLnew)
        .then(response => {
            if (response.ok) {
                return response.json();
            } 
            throw new Error(response.statusText);
        })
        .then(responseJson => { displayLyrics(responseJson); })
        .catch(error => console.log('These Lyrics Were Not Available'));
};

function displayLyrics(api2response) {
    const artistName2 = api2response.result.artist.name.toLowerCase().replace(/ /g, "").replace(/-/g,"");
    $('li').append(function () {
        if (artistName2 === $(this).attr('id')) {
            return `<div class="lyricsFrmArtist hidden">
                        <pre class="lyrics">${formatLyrics(api2response)}</pre>
                    </div>`
        } 
    });
};

//formats the lyrics into preferred format  
function formatLyrics(resultsAPI2) {
    return resultsAPI2.result.track.text;
};

//response when no lyrics are found
function noLyricsFound() {
    setTimeout(function () {
        $('.artistResult').not(':has(.lyricsFrmArtist)').append(`
            <div class="lyricsFrmArtist hidden">
                <pre class="lyrics">Lyrics not currently available</pre>
            </div>`)
    }, 
        3200 //3.2s
    );  
};

//join them with the '&' after URI component after using the encodeURIComponent process
function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

//appends relevant html to show results
function displayResultsArtist(responseJson) {
    $('#results').empty();
    for (let i = 0; (i < responseJson.response.hits.length) && (i <= 14); i++) {    
        const uRLArtist = responseJson.response.hits[i].result.primary_artist.name;
        let titleSelection = responseJson.response.hits[i].result.full_title;
        const artistName = uRLArtist.replace(/ /g, "").replace(/-/g, "").toLowerCase();  //global
        let geniusSelectURL = responseJson.response.hits[i].result.url;    
        //use target blank to open up link in new tab

    $('#results').append(`
        <li class="artistResult" id=${artistName} >
            <div class="resultsArea">
                <div class="addedSavedItems savedListStuff${i}"></div>
                    <div class="artist-song">
                        <p class="user-search-lyrics" id="lyricz${i}">${titleSelection}</p>
                </div>
                <div class='lyricsShowGenius hidden'>
                    <form style="display: inline" action="${geniusSelectURL}" method="get">
                        <button class="geniusButton" type="submit">Genius!</button>
                    </form>
                </div>
            </div>
        </li>`);
        getAPILyrics(responseJson.response.hits[i]);
    };
    $('#results').removeClass('hidden');  //to reveal the search items
};

//to search lyrics user inputted and limit to 15 results
function getInfo(searchLyrics) {
    const params = {
        q: searchLyrics,
        page: 1,
        per_page: 15,
        access_token: apiKeyGenius
    };

    const urlGenius = searchGenius + formatQueryParams(params);

    fetch(urlGenius)
        .then(response => {
            if (response.ok) {
                return response.json();
            } 
            throw new Error(response.statusText);
        })
        .then(responseJson => { 
            displayResultsArtist(responseJson); selectSave(responseJson) 
        })
        .catch(error => {
            console.log("Error, something went wrong");
        });
}

//toggle items
//saved item page show/hide
$(function savedSongsToggle() {
    $('.savedSongsOuter').click(function (event) {
        event.preventDefault();
        $('#savedLyricsPage').toggleClass('hidden');
    });
});

//hide saved item page
$(function savedSongsHideToggle() {
    $('main').click(function () {
        $('#savedLyricsPage').addClass('hidden');
    });
});

//delete saved item once added
$(function deleteSavedSongsFrmList() {
    $('#addedSavedItems1').on('click', '.deleteSaveItem', function (event) { 
        $(this).parent().remove();
    });
});

//display the saved item within the saved item page
function savedSongItem(trackName, albumCover) {
    return `<li class="savedLikes">
                <div class="albumPic">
                    <img src="${albumCover}" alt="Album cover art" class="albumPhoto">
                </div>
                <div class="saveListArtist">
                    <p class="trackName-Liked">${trackName}</p>
                </div>
                <div class="deleteSaveItem"></div>
            </li>`
}

//option to add songs to saved item page
function selectSave(responseJson) {
    $('#addedSaveditems1').empty();
    for (let i = 0; i < responseJson.response.hits.length && i <= 14; i++) {
        $('#results').on('click', `.savedListStuff${i}`, function (event) {
            $('#addedSavedItems1').append(savedSongItem(responseJson.response.hits[i].result.full_title, responseJson.response.hits[i].result.song_art_image_thumbnail_url));
            $('#addedSavedItems1').removeClass('hidden');
        });
    };
};

//toggle home item
$(function homeToggle() {
    $('#homeNav').click(function (event) {
        event.preventDefault();
        $('#results').addClass('hidden'); $('#savedLyricsPage').addClass('hidden');
    });
});

//toggle the lyrics when you click on the track name / artist
$(function toggleLyricDisplay() {
    $('#results').on('click', '.artist-song', function (event) {
        const wantedLyrics = $(this)
        const restLyrics = $('.artist-song').not(wantedLyrics)
        wantedLyrics.parents('.artistResult').find('.lyricsFrmArtist').toggleClass('hidden');
        wantedLyrics.parents('.artistResult').find('.lyricsShowGenius').toggleClass('hidden');
        restLyrics.parents('.artistResult').find('.lyricsFrmArtist').addClass('hidden');
        restLyrics.parents('.artistResult').find('.lyricsShowGenius').addClass('hidden');
    });
});

//Watch form
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        let searchLyrics = $('#js-search-lyrics').val();
        getInfo(searchLyrics); noLyricsFound();
    });
}

$(watchForm);
