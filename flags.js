//class
function Country(name)
{
    this.name = name;
    var filename = name.replace(/ /g,"_"); //replace spaces with underscores
    filename = filename.replace(/'/g,"_"); //replace apostrophies with underscores
    var ocircumflex = new RegExp("\u00F4","g"); //for côte d'ivoire
    filename = filename.replace(ocircumflex,"o");
    this.filename = "flags/png/300x158/Flag_of_" + filename + ".png";
    this.imagehtml = "<img src='" + this.filename + "' width='300' height='158' >";
}

//global variables
var countries = new Array();
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

//load xml
$.get("countries.xml", {}, function(xml){
    $("country",xml).each(function(){
        countries.push(new Country($(this).text()));
    });
});

function choiceLinkClicked(event) {
	if (infoBombActive) {
		alert(currentCountries[event.target.id].name);
		infoBombs--;
		deactivateInfoBomb();
		updateDivs();
	} else {
		var msg, sleep;
		if (event.target.id == correctCountryId) {
			msg = "+" + points + "<br>"
				+ "<table class='flagTable'><tr><td><h3>"
				+ currentCountries[correctCountryId].name
				+ "</h3></td></tr><tr><td>"
				+ currentCountries[correctCountryId].imagehtml
				+ "</td></tr></table>";
			score += points;
			continueTimeout = setTimeout(pickCountry, 1500);
		} else {
			msg = "Incorrect <br>"
				+ "<table class='flagTable'><tr><td>Your Choice:</td><td>Correct Choice:</td></tr>"
				+ "<tr><td><h3>" + currentCountries[event.target.id].name + "</h3></td>"
				+ "<td><h3>" + currentCountries[correctCountryId].name + "</h3></td></tr>"
				+ "<tr><td>" + currentCountries[event.target.id].imagehtml + "</td>"
				+ "<td>" + currentCountries[correctCountryId].imagehtml + "</td></tr></table>";
			lives--;
			missed = true;
		}
		setTimeout(updateDivs, 1000);
		question++;
		$('#continue').show();
		$('#infoBombIndicator').hide();
		$('#flags').hide();
		$("#feedback").html(msg);
		$("#feedback").fadeIn("fast");
	}
}

$(function(){
    $("#feedback").hide();
    $(".choice_link").click(choiceLinkClicked);
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
    level++;
	numCountries++;
    question=1;
    if (level > 1)
        points += POINT_INCREASE;
    var msg = "";
    if (!missed){
        msg += "<h3>Perfect level bonus: +1 lives.<br></h3>";
        lives += 1;
    }
	if (level > 1) {
		msg += "<h3>Level bonus: +1 info bomb.<br></h3>";
		infoBombs += 1;	
	}
    msg += "<h1>Level " + level + "</h1><h3>Questions are worth " + points + " points.</h3>";
	msg += '<br/>';
    $("#feedback").html(msg);
    $("#feedback").show();
	$('#flags').hide();
	$('#continue').show();
	$('#infoBombIndicator').hide();
    updateDivs();
    missed = false;
}

function gameOver()
{
	$('#flags').hide();
    $("#feedback").show();
    $("#feedback").html("<br>Game Over<br><h3>"
        + "<a href='#' onclick='location.reload(true);'>Play Again</a></h3>");
}

function updateDivs()
{
	$('#level').html(level);
	$('#levelProgress').html(question + '/' + QUESTIONS_PER_ROUND);
	$('#score').html(score);
	var livesHtml = '';
	if (lives > 0) {
		for (var i=0; i<lives; ++i) {
			livesHtml += '<img src="img/flag_icon.png" />';
		}
	} else {
		livesHtml += '0';
	}
	$('#lives').html(livesHtml);
	var infoBombsHtml = '';
	if (infoBombs > 0) {
		for (var i=0; i<infoBombs; ++i) {
			infoBombsHtml += '<img src="img/info_icon.png" />';
		}
	} else {
		infoBombsHtml += '0';
	}
	$('#info_bombs').html(infoBombsHtml);
}

function pickCountry()
{
	clearTimeout(continueTimeout);
    updateDivs();
    $('#feedback').hide();
	$('#continue').show();
	$('#flags').show();
	$('#infoBombIndicator').show();
    if (lives == -1) {
        gameOver();
	} else if (question == 11) {
        startLevel();
	} else {
		var html = '';
        //pick n random countries, no duplicates
        for (i=0; i<numCountries; i++) {
            var duplicate;
            do {
                duplicate = false;
                currentCountries[i] = countries[Math.floor(Math.random()*countries.length)];
                for (j=0; j<i; j++) {
                    if (currentCountries[j].name == currentCountries[i].name)
                        duplicate = true;
                }
            } while(duplicate);
			html += '<a href="#" class="choice_link">';
			html += '<img id="' + i + '" src="' + currentCountries[i].filename + '" border="0" src="" width="300" height="158" />';
			html += '</a>';
        }
		$('#flagTable').html(html);
        //pick which one is to be the correct choice
        correctCountryId = Math.floor(Math.random()*numCountries);
        $("#prompt").html('<h3>'+currentCountries[correctCountryId].name+'</h3>');
		$(".choice_link").click(choiceLinkClicked);
    }
}
