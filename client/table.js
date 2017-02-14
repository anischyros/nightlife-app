function doRegisterInterest(yelpID, login)
{
	$.ajax("/registerInterest",
	{
		data:
		{
			yelp_id: yelpID,
			login: login
		},
		dataType: "json",
		success: function() { location.reload(); },
		error: function() { window.alert("registerInterest failed: " +
			"yelpID = " + yelpID + ", login = " + login); }
	});
}

function doUnregisterInterest(yelpID, login)
{
	$.ajax("/unregisterInterest",
	{
		data:
		{
			yelp_id: yelpID,
			login: login
		},
		dataType: "json",
		success: function() { location.reload(); },
		error: function() { window.alert("unregisterInterest failed: " +
			"yelpID = " + yelpID + ", login = " + login); }
	});
}

