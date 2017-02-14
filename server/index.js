var express = require("express");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var ejs = require("ejs");
var mongo = require("mongodb").MongoClient;
var Yelp = require("yelp");

var yelp = new Yelp(
{
    consumer_key: "Dm_MHkN66twpkBc-UDqfAw",
    consumer_secret: "6_Scnp6Jpkg-FzSis1jz397qYr8",
    token: "o76-56VnD4DQ56igXipvsQAuE1U_23CZ",
    token_secret: "pAlVosIoICIwCwwVs3sKzj_5nno"
});

// Set up cookies
var app = express();
app.use(cookieParser("$0ph13"));
app.use(cookieSession({
    name: "session",
    keys: ["3V1L$0ph13"],
    maxAge: 224 * 60 * 60 * 1000
}));

var db, usersColl, barsColl;

mongo.connect("mongodb://localhost/nightlife-app", function(err, connection)
{
    db = connection;

	initializeCollectionVariables(db);

    app.get("/", function(request, response)
    {
        // Send main page
        var template = fs.readFileSync("./ejs/MainPage.ejs", "utf-8");
        response.end(ejs.render(template,
        {
            loggedIn: request.session.loggedIn,
            login: request.session.login,
			yelp_data: { businesses: [] }
         }));
    });

    app.get("/login.js", function(request, response)
    {
        fs.createReadStream("client/login.js", "utf-8").pipe(response);
    });
    app.get("/table.js", function(request, response)
    {
        fs.createReadStream("client/table.js", "utf-8").pipe(response);
    });

    app.get("/login", doLogin);
    app.get("/logout", doLogout);
    app.get("/createNewLogin", doCreateNewLogin);
	app.get("/searchLocation", doSearchLocation);
	app.get("/registerInterest", doRegisterInterest);
	app.get("/unregisterInterest", doUnregisterInterest);

    app.listen(8080);
    console.log("Listening to port 8080");
});

function initializeCollectionVariables(db)
{
	db.collection("users", function(err, collection)
	{
		usersColl = collection;
		db.collection("bars", function(err, collection)
		{
			barsColl = collection;
		});
	});
}

function doLogin(request, response)
{
    response.setHeader("Content-Type", "text/json");

    usersColl.findOne({ login: request.query.login }, function(err, item)
    {
        var out;
        if (!item || item.password != request.query.password)
        {
            out = { success: false };
        }
        else
        {
            out = { success: true };

            // Indicate that we're now logged in
            request.session.loggedIn = true;
            request.session.login = request.query.login;
        }
        response.end(JSON.stringify(out));
    });
}

function doLogout(request, response)
{
    response.setHeader("Content-Type", "text/json");

    // Clear session
    delete request.session.loggedIn;
    delete request.session.login;

	response.end(JSON.stringify({ success: true }));
}

function doCreateNewLogin(request, response)
{
    response.setHeader("Content-Type", "text/json");

    usersColl.count({ login: request.query.login }, function(err, count)
    {
        var out;
        if (count == 1)
        {
            out = { success: false };
        }
        else
        {
            var obj =
            {
                login: request.query.login,
                password: request.query.password
            };
            usersColl.save(obj);
            out = { success: true };

            // Indicate that we're now logged in
            request.session.loggedIn = true;
            request.session.login = request.query.login;
        }
        response.end(JSON.stringify(out));
    });
}

function doSearchLocation(request, response)
{
    response.setHeader("Content-Type", "text/html");

	var location = request.query.location.trim();

	yelp.search({ term: "bars", location: location }, function(err, data)
	{
		// Build list of Yelp IDs
		var idList = [];
		for (var i = 0; i < data.businesses.length; i++)
			idList.push({ yelp_id: data.businesses[i].id });

		barsColl.find({ $or: idList }, function(err, items)
		{
			var foundAttendees = {};
			items.each(function(err, item)
			{
				if (item)
				{
					foundAttendees[item.yelp_id] = item.attendees;
				}
				else
				{
					var template = 
						fs.readFileSync("./ejs/MainPage.ejs", "utf-8");
					response.end(ejs.render(template,
					{
						loggedIn: request.session.loggedIn,
						login: request.session.login,
						yelp_data: data,
						foundAttendees: foundAttendees
					}));
				}
			});
		});
	});
}

function doRegisterInterest(request, response)
{
    response.setHeader("Content-Type", "text/json");

	var yelpId = request.query.yelp_id;
	var login = request.query.login;

	barsColl.findOne({ "yelp_id": yelpId }, function(err, item)
	{
		if (item)
			item.attendees.push(login);
		else
			item = { yelp_id: yelpId, attendees: [login] };
		barsColl.save(item, function()
		{
			response.end(JSON.stringify({ success: true }));
		});
	});
}

function doUnregisterInterest(request, response)
{
    response.setHeader("Content-Type", "text/json");

	var yelpId = request.query.yelp_id;
	var login = request.query.login;

	barsColl.findOne({ yelp_id: yelpId }, function(err, item)
	{
		if (item)
		{
			item.attendees.splice(item.attendees.indexOf(login), 1);
			barsColl.save(item, function()
			{
				response.end(JSON.stringify({ success: true }));
			});
		}
		else
		{
			// This should never happen
			response.end(JSON.stringify({ success: false }));
		}
	});
}

