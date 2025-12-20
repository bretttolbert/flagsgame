// Depends on: flags.js
// Globals:
var currentCountries = new Array();
var correctCountryId = -1; // the id (0-n) of correct flag element, of those currently displayed
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
    $('#continue').click(nextQuestion);
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

function useInfoBomb(countryId) {
    alert(currentCountries[countryId].name);
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
    $("#prompt").hide();
    $('#flags').hide();
    $('#continue').show();
    $('#useInfoBombImg').hide();
    updateDivs();
    missed = false;
    continueTimeout = setTimeout(nextQuestion, 1500);
}

function gameOver()
{
    audioGameOver.play();
    $("#prompt").hide();
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

function getFeedbackIncorrect(clickedCountry, correctCountry) {
    let html = '<span class="incorrect">Incorrect</span><br><br>';
    html += `Your Choice: ${clickedCountry.name}<br>${clickedCountry.imagehtml}<br>`;
    html += `Correct Choice: ${correctCountry.name}<br>${correctCountry.imagehtml}<br>`;
    return html;
}

function getFeedbackCorrect(clickedCountry) {
    let html = `+${points}<br><br>`;
    html += `${clickedCountry.name}<br>${clickedCountry.imagehtml}<br>`;
    return html;
}

function choiceLinkClicked(event) {
    let clickedCountryId = event.target.id;
    let clickedCountry = currentCountries[clickedCountryId]
    let correctCountry = currentCountries[correctCountryId]
    if (infoBombActive) {
        useInfoBomb(clickedCountryId);
    } else {
        var msg, sleep;
        if (clickedCountryId == correctCountryId) {
            audioCorrectAnswer.play();
            msg = getFeedbackCorrect(clickedCountry);
            score += points;
            continueTimeout = setTimeout(nextQuestion, 500);
        } else {
            audioWrongAnswer.play();
            msg = getFeedbackIncorrect(clickedCountry, correctCountry);
            lives--;
            missed = true;
            continueTimeout = setTimeout(nextQuestion, 3000);
        }
        setTimeout(updateDivs, 1000);
        question++;
        $('#continue').show();
        $('#useInfoBombImg').hide();
        $("#prompt").hide();
        $('#flags').hide();
        $("#feedbackContainer").html(msg);
        $("#feedbackContainer").fadeIn("fast");
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a remaining element at a random index 'j' from 0 to 'i'
        const j = Math.floor(Math.random() * (i + 1));

        // Swap the current element (i) with the random element (j)
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomChoice(choices) {
    return Math.floor(Math.random()*choices.length);
}

function randomCountryIdx() {
    return randomChoice(getCountryIdxs());
}

function randomCountryIdxs() {
    let countryIdxs = [];
    //pick first country (this determines cluster)
    let firstCountryIdx = randomCountryIdx();
    countryIdxs.push(firstCountryIdx);
    let cluster = getClusterByCountryIdx(firstCountryIdx);
    console.log("Chosen cluster: " + cluster);
    let clusterCountryIdxs = getClusterCountryIdxsByClusterId(cluster);
    if (numCountries < clusterCountryIdxs.length) {
        console.log(`picking ${numCountries}-1 more countries from cluster ${cluster}, no duplicates`);
        const MAX_RETRIES = 1000;
        let retryCount = 0;
        while (countryIdxs.length < numCountries && retryCount < MAX_RETRIES) {
            let ci = randomChoice(clusterCountryIdxs);
            while (countryIdxs.includes(ci) && retryCount < MAX_RETRIES) {
                console.info(`chosen (from cluster ${cluster}) countryIdx ${ci} is already in chosen countryIdxs, trying again...`);
                ++retryCount;
                ci = randomChoice(clusterCountryIdxs);
            }
            console.log(`Adding chosen (from cluster ${cluster}) countryIdx ${ci} to chosen countryIdxs`);
            countryIdxs.push(ci);
        }
    }
    else
    {
        console.log(`adding the entire cluster (${cluster}) and then however many more`);
        let clusterCountryIdxs = getClusterCountryIdxs()[cluster];
        for (let i=0; i<clusterCountryIdxs.length; ++i) {
            let ci = clusterCountryIdxs[i];
            if (ci != firstCountryIdx) {
                countryIdxs.push(ci);
            }
        }
        const MAX_RETRIES = 1000;
        let retryCount = 0;
        while (countryIdxs.length < numCountries && retryCount < MAX_RETRIES) {
            let ci = randomCountryIdx();
            while (countryIdxs.includes(ci) && retryCount < MAX_RETRIES) {
                console.info(`chosen countryIdx ${ci} is already in chosen countryIdxs, trying again...`);
                ++retryCount;
                ci = randomCountryIdx();
            }
            countryIdxs.push(ci);
            console.log(`Adding chosen countryIdx ${ci} to chosen countryIdxs`);
        }
    }

    return countryIdxs;
}

function nextQuestion()
{
    clearTimeout(continueTimeout);
    updateDivs();
    $('#feedbackContainer').hide();
    $('#continue').show();
    $("#prompt").show();
    $('#flags').show();
    $('#useInfoBombImg').show();
    if (lives == -1) {
        gameOver();
    } else if (question == 11) {
        startLevel();
    } else {        
        let countryIdxs = randomCountryIdxs();
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
