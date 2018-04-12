/**
* Changes made from version one:
* 1. Fixed the issue were the system would allow generic emails to get through.
* 2. Changed naming covention.
* 3. Implemented plugins so that postcodes, and phone numbers can be ran straight from Knwl. Both of which can be viewed in the default_plugins folder in the
*    knwl directory. Named: ukPhone.js, and postcodes.js
*/

var request    = require('request');
var cheerio    = require("cheerio");
var Knwl       = require("knwl.js");
var fnReadline = require("readline-sync");

var objKnwlInstance = new Knwl('english');

objKnwlInstance.register('ukPhones', require("knwl.js/default_plugins/ukPhones"));	// initialising custom plugins.
objKnwlInstance.register('postcodes', require("knwl.js/default_plugins/Postcodes"));

var strInputEmail = fnReadline.question("Enter an email you wish to search...\n");
var strCorrectEmail = filterCompanyDomain(strInputEmail);
var sWebsite = 'http://www.' + strCorrectEmail;
console.log("\n")

/*
* Filters out popular, generic email address domains that we would like to ignore - such as gmail, hotmail, outlook, and yahoo.
*/

function filterCompanyDomain(strInput) {
    if(strInput.toLowerCase().indexOf("outlook") > 0 || strInput.toLowerCase().indexOf('yahoo') > 0 || strInput.toLowerCase().indexOf("gmail") > 0 || strInput.toLowerCase().indexOf('hotmail') > 0) {
	console.log("Couldn't find a valid company domain to scrape, please try again...");
	process.exit(1);
    } else {
	var strDomainName = strInput.replace(/.*@/, ""); // replace everything before the "@" symbol and the symbol itself to obtain the domain.
	return strDomainName;
    }
}

request(sWebsite, function(err, resp, html) {
	
    if(!err){
	const $ = cheerio.load(html);
	objKnwlInstance.init(html);
	var strHtml = $.html(); // Gets a HTML content string

	// Scraping emails
	var arrCompanyEmails = objKnwlInstance.get('emails');
        arrCompanyEmails.forEach(function(email){
           console.log("Scraping emails: [" + email.address + "]\n"); // Using 'email' child from the JSON tree that knwl outputs, we can pick out an email under the 'address' node.
        });

        // Scraping postcodes
        var arrPostcodes = objKnwlInstance.get('postcodes');
	console.log("Scraping addresses: " + JSON.stringify(arrPostcodes) + "\n");

	// Scraping phone numbers
        var arrPhones = objKnwlInstance.get('ukPhones');
        console.log("Scraping numbers: " + JSON.stringify(arrPhones) + "\n");

	// Scraping social
	console.log("Scraping Social:");
	var twitter  = $('a[href*="twitter.com"]').attr('href');
	var facebook = $('a[href*="facebook.com/pages/"]').attr('href'); 
	var linked   = $('a[href*="linkedin.com/company/"]').attr('href');
	console.log(twitter + "\n\n" + facebook + "\n\n" + linked);
    }
});
