var request  = require('request');
var cheerio  = require("cheerio");
var Knwl 	 = require("knwl.js");
var readline = require("readline-sync");

var knwlInstance = new Knwl('english');

var inputEmail = readline.question("Enter an email you wish to search...\n");
var correctEmail = filterCompanyDomain(inputEmail);
var website = 'http://www.' + correctEmail;

/*
* Filters out popular, generic email address domains that we would like to ignore - such as gmail, hotmail, outlook, and yahoo.
*/

function filterCompanyDomain(input) {
	if(input.toLowerCase().indexOf("outlook") > 0 || input.toLowerCase().indexOf('yahoo') > 0 || input.toLowerCase().indexOf("gmail") > 0 || input.toLowerCase().indexOf('hotmail') > 0) {

		console.log("Couldn't find a valid company domain, please try again...");
	} else {
		var domainName = input.replace(/.*@/, ""); // replace everything before the "@" symbol and the symbol itself to obtain the domain.
		return domainName;
	}
}

request(website, function(err, resp, html) {
	if(!err){
		const $ = cheerio.load(html);
		knwlInstance.init(html);
		var html = $.html(); // Gets a HTML content string

		// Scraping emails
		var companyEmails = knwlInstance.get('emails');
        companyEmails.forEach(function(email){
           console.log("Scraping emails: (" + email.address + ")"); // Using 'email' child from the JSON tree that knwl outputs, we can pick out an email under the 'address' node.
        });

        /* Scraping telephone numbers.
        * Regex allows for +44, or a zero at the start. Then either 3 numbers, followed by white space followed by 3 numbers followed by white space, followed by 4 numbers.
        * Or, 4 followed by white space, followed by 6 numbers.
        */
        var telephoneRegex = "(\\+\\d{1,3}\\s?(\\s\\(0\\))?|0)(\\d{3}\\s?\\d{3}\\s?\\d{4}|\\d{4}\\s?\\d{6})(?![0-9])"; 
		var numbers = html.match(telephoneRegex);
		var slice = numbers.slice(0,1);	// ensure we only have a single occurence of a phone number, otherwise we have repeated strings.
		console.log("Scraping numbers: " + slice);

		// Scraping postcode
		var postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/; // Match any two chars between A-Z, match any char between 0-9, match any char bettwen 0-9 or A-Z, match white space, match 2 chars between 0-9 or A-Z, respectively.
		var matchReg = html.match(postcodeRegex);
		console.log("Scraping addresses: " + matchReg);

		// Scraping social
		console.log("Scraping Social:");
		var twitter  = $('a[href*="twitter.com"]').attr('href');
		var facebook = $('a[href*="facebook.com/pages/"]').attr('href'); 
		var linked   = $('a[href*="linkedin.com/company/"]').attr('href');
		console.log(twitter + "\n" + facebook + "\n" + linked);

	}
});