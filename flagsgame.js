// Depends on: flags.js
// Globals:
var currentCountries = new Array();
var correctCountryId;
var score = 0;
var points = 25; //number of points earned per question
var POINT_INCREASE = 25;
var level = 0;
var question;
var QUESTIONS_PER_ROUND = 10;
var lives = 3;
var infoBombs = 3;
var missed = true; //used to check if player completes a level with no misses
//if the player completes a level with no misses, e will earn an extra life
var continueTimeout = null;
var infoBombActive = false;
var numCountries = 2;

var audioWrongAnswer = new Audio('sounds/wrong_answer.mp3');
var audioCorrectAnswer = new Audio('sounds/correct_answer.mp3');
var audioPowerup = new Audio('sounds/powerup.mp3');
var audioGameOver = new Audio('sounds/game_over.mp3');

$(function(){
    $("#feedbackContainer").hide();
    $(".choice-link").click(choiceLinkClicked);
    $('#infoBombIndicator img').click(function(){
        if (!infoBombActive) {
            activateInfoBomb();
        } else {
            deactivateInfoBomb();
        }
    });
    $('#continue').click(pickCountry);
    setTimeout("startLevel();",500);
});


function activateInfoBomb() {
    $('#infoBombIndicator img').attr('src','img/info_icon_active_48x48.png');
    $('#infoBombIndicator span').html('Click a flag to use the info bomb');
    infoBombActive = true;
}

function deactivateInfoBomb() {
    $('#infoBombIndicator img').attr('src','img/info_icon_48x48.png');
    $('#infoBombIndicator span').html('');
    infoBombActive = false;
}

function startLevel()
{
    if (level > 0) {
        audioPowerup.play();
    }
    level++;
    numCountries++;
    question=1;
    if (level > 1) {
        points += POINT_INCREASE;
    }
    var msg = "";
    if (!missed){
        var livesBonus = 1;
        msg += 'Perfect level bonus: ' + getLivesIndicatorHtml(livesBonus) + "<br>";
        lives += livesBonus;
    }
    if (level > 1) {
        var infoBombsBonus = 1;
        msg += 'Level bonus: ' + getInfoBombsIndicatorHtml(infoBombsBonus) + "<br>";
        infoBombs += infoBombsBonus;	
    }
    msg += "Level " + level + "<br>";
    msg += "Questions are worth " + points + " points. <br>";
    $("#feedbackContainer").html(msg);
    $("#feedbackContainer").show();
    $('#flags').hide();
    $('#continue').show();
    $('#infoBombIndicator').hide();
    updateDivs();
    missed = false;
    continueTimeout = setTimeout(pickCountry, 1500);
}

function gameOver()
{
    audioGameOver.play();
    $('#flags').hide();
    $("#feedbackContainer").show();
    $("#feedbackContainer").html("<br>Game Over<br>"
        + "<a href='#' onclick='location.reload(true);'>Play Again</a>");
}

function getInfoBombsIndicatorHtml(n) {
    var html = '';
    if (n > 0) {
        for (var i=0; i<n; ++i) {
            html += '<img src="img/info_icon_48x48.png" />';
        }
    } else {
        html += '0';
    }
    return html;
}

function getLivesIndicatorHtml(n) {
    var html = '';
    if (n > 0) {
        for (var i=0; i<n; ++i) {
            html += '<img src="img/flag_icon.png" />';
        }
    } else {
        html += '0';
    }
    return html;
}

function updateDivs()
{
    $('#level').html(level);
    $('#levelProgress').html(question + '/' + QUESTIONS_PER_ROUND);
    $('#score').html(score);
    $('#lives').html(getLivesIndicatorHtml(lives));
    $('#info_bombs').html(getInfoBombsIndicatorHtml(infoBombs));
}


function choiceLinkClicked(event) {
    if (infoBombActive) {
        alert(currentCountries[event.target.id].name);
        infoBombs--;
        deactivateInfoBomb();
        updateDivs();
    } else {
        var msg, sleep;
        if (event.target.id == correctCountryId) {
            audioCorrectAnswer.play();
            msg = "+" + points + "<br>"
                + "<table class='flag-table'>"
                + "<tr><td>"
                + currentCountries[correctCountryId].name
                + "</td></tr>"
                + "<tr><td>"
                + currentCountries[correctCountryId].imagehtml
                + "</td></tr>"
                + "</table>";
            score += points;
            continueTimeout = setTimeout(pickCountry, 500);
        } else {
            audioWrongAnswer.play();
            msg = "Incorrect <br>"
                + "<table class='flag-table'>"
                    + "<tr><th>Your Choice:</th><th>Correct Choice:</th></tr>"
                    + "<tr>"
                        + "<td>" + currentCountries[event.target.id].name + "</td>"
                        + "<td>" + currentCountries[correctCountryId].name + "</td>" 
                    + "</tr>"
                    + "<tr>"
                        + "<td>" + currentCountries[event.target.id].imagehtml + "</td>"
                        + "<td>" + currentCountries[correctCountryId].imagehtml + "</td>"
                    + "</tr>" 
                + "</table>";
            lives--;
            missed = true;
            continueTimeout = setTimeout(pickCountry, 3000);
        }
        setTimeout(updateDivs, 1000);
        question++;
        $('#continue').show();
        $('#infoBombIndicator').hide();
        $('#flags').hide();
        $("#feedbackContainer").html(msg);
        $("#feedbackContainer").fadeIn("fast");
    }
}

function randomCountryIdx() {
    return Math.floor(Math.random()*getCountries().length);
}

function randomCountryIdxFromCluster(cluster) {
    //TODO: improve efficiency by building list of countries by cluster
    cIdx = randomCountryIdx();
    while (getClusterByCountry(getCountryByIdx(cIdx).name) != cluster) {
        cIdx = randomCountryIdx();
    }
    return cIdx;
}

function pickCountry()
{
    clearTimeout(continueTimeout);
    updateDivs();
    $('#feedbackContainer').hide();
    $('#continue').show();
    $('#flags').show();
    $('#infoBombIndicator').show();
    if (lives == -1) {
        gameOver();
    } else if (question == 11) {
        startLevel();
    } else {        
        let countryIdxs = [];
        //pick first country (this determines cluster)
        let firstCountryIdx = randomCountryIdx();
        countryIdxs.push(firstCountryIdx);
        let cluster = getClusterByCountryIdx(firstCountryIdx);
        console.log("Chosen cluster: " + cluster);

        //pick n-1 more countries from cluster, no duplicates
        while (countryIdxs.length < numCountries) {
            let countryIdx = randomCountryIdxFromCluster(cluster);
            while (countryIdxs.includes(countryIdx)) {
                countryIdx = randomCountryIdxFromCluster(cluster);
            }
            countryIdxs.push(countryIdx);
        }

        currentCountries = [];
        for (let i = 0; i < countryIdxs.length; i++) {
            currentCountries.push(getCountryByIdx(countryIdxs[i]))
        }
        let html = '';
        for (let i = 0; i < currentCountries.length; i++) {
            html += '<a href="#" class="choice-link">';
            html += '<img class="flag-image" id="' + i + '" src="' + 
                currentCountries[i].filename + '" border="0" />';
            html += '</a>';
        }
        $('#flagTableContainer').html(html);
        //pick which one is to be the correct choice
        correctCountryId = Math.floor(Math.random()*numCountries);
        $("#prompt").html(currentCountries[correctCountryId].name);
        $(".choice-link").click(choiceLinkClicked);
    }
}
