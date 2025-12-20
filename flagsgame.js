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

    alert("If you are experiencing problems with this page, and you have used it previously, try clearing your browser data. This will force it to update the JavaScript to the latest version.");

    $("#feedbackContainer").hide();
    $(".choice-link").click(choiceLinkClicked);
    $('#useInfoBombImg').click(infoBombClicked);
    $('#continue').click(pickCountry);
    setTimeout("startLevel();",500);
});

function infoBombClicked() {
    if (!infoBombActive) {
        if (infoBombs > 0) {
            activateInfoBomb(); // once activated, user must click a flag to actually use it
        } else {
            alert("No info bombs remaining");
        }
    } else {
        cancelInfoBomb(); // one activated, user can cancel by clicking info bomb icon again
    }
}

function activateInfoBomb() {
    $('#useInfoBombImg').attr('src','img/info_icon_active_48x48.png');
    $('#useInfoBombImg').attr('title', 'Cancel info bomb');
    $('#useInfoBombSpan').text('Click a flag to use the info bomb');
    infoBombActive = true;
}

function cancelInfoBomb() {
    $('#useInfoBombImg').attr('src','img/info_icon_48x48.png');
    $('#useInfoBombImg').attr('title', 'Use info bomb');
    $('#useInfoBombSpan').text('');
    infoBombActive = false;
}

function enableInfoBomb() {
    $('#useInfoBombImg').attr('title', 'Use info bomb');
    $('#useInfoBombImg').removeClass("non-clickable");
    $('#useInfoBombImg').addClass("clickable");
    $('#useInfoBombImg').attr('src','img/info_icon_48x48.png');
}

function disableInfoBomb() {
    $('#useInfoBombImg').attr('title', 'No info bombs remaining');
    $('#useInfoBombImg').removeClass("clickable");
    $('#useInfoBombImg').addClass("non-clickable");
    $('#useInfoBombImg').attr('src','img/info_icon_disabled_48x48.png');
}

function decrementInfoBombs() {
    if (infoBombs > 0) {
        --infoBombs;
        if (infoBombs == 0) {
            disableInfoBomb();
        }
    }
}

function incrementInfoBombs(increment) {
    infoBombs = infoBombs + increment;
    if (infoBombs > 0) {
        enableInfoBomb();
    }
}

function useInfoBomb(countryName) {
    alert(currentCountries[countryName].name);
    cancelInfoBomb();
    decrementInfoBombs();
    updateDivs();
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
        incrementInfoBombs(infoBombsBonus);
    }
    msg += "Level " + level + "<br>";
    msg += "Questions are worth " + points + " points. <br>";
    $("#feedbackContainer").html(msg);
    $("#feedbackContainer").show();
    $('#flags').hide();
    $('#continue').show();
    //$('#infoBombIndicator').hide();
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

function getInfoBombsIndicatorHtml(infoBombs) {
    var html = '';
    html += infoBombs;
    return html;
}

function getLivesIndicatorHtml(lives) {
    let displayValue = lives;
    if (lives == -1) {
        displayValue = 0;
    }
    var html = '';
    html += lives;
    return html;
}

function updateLivesIndicatorHtml() {
    $('#lives').html(getLivesIndicatorHtml(lives));
    if (lives <= 0) {
        $("#lives").addClass("warning");
        $("#lives").addClass("blink");
    } else {
        $("#lives").removeClass("warning");
        $("#lives").removeClass("blink");
    }
}

function updateInfoBombsIndicatorHtml() {
    $('#infoBombs').html(getInfoBombsIndicatorHtml(infoBombs));
    if (infoBombs <= 0) {
        $("#infoBombs").addClass("warning");
    } else {
        $("#infoBombs").removeClass("warning");
    }
}

function updateDivs()
{
    $('#level').html(level);
    $('#levelProgress').html(question + '/' + QUESTIONS_PER_ROUND);
    $('#score').html(score);
    updateLivesIndicatorHtml();
    updateInfoBombsIndicatorHtml();
}

function choiceLinkClicked(event) {
    if (infoBombActive) {
        useInfoBomb(event.target.id);
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
        //$('#infoBombIndicator').hide();
        $('#flags').hide();
        $("#feedbackContainer").html(msg);
        $("#feedbackContainer").fadeIn("fast");
    }
}

function randomChoice(choices) {
    return Math.floor(Math.random()*choices.length);
}

function randomCountryIdx() {
    return randomChoice(getCountryIdxs());
}

function randomCountryIdxFromCluster(cluster) {
    let countryIdxs = getClusterCountryIdxs()[cluster];
    return randomChoice(countryIdxs);
}

function pickCountry()
{
    clearTimeout(continueTimeout);
    updateDivs();
    $('#feedbackContainer').hide();
    $('#continue').show();
    $('#flags').show();
    //$('#infoBombIndicator').show();
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
        const MAX_RETRIES = 1000;
        let retryCount = 0;
        while (countryIdxs.length < numCountries && retryCount < MAX_RETRIES) {
            let countryIdx = randomCountryIdxFromCluster(cluster);
            while (countryIdxs.includes(countryIdx) && retryCount < MAX_RETRIES) {
                console.info(`chosen countryIdx ${countryIdx} is already in chosen countryIdxs, trying again...`);
                ++retryCount;
                countryIdx = randomCountryIdxFromCluster(cluster);
            }
            console.log(`Adding chosen countryIdx ${countryIdx} to chosen countryIdxs`);
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
