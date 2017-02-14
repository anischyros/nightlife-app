function doLogin()
{
    dialog = $("#login-form").dialog(
    {
        height: 400,
        width: 350,
        modal: true,
        buttons:
        {
            "Login": loginAccount
        }
    });
}

function loginAccountSuccess(json)
{
    if (json.success == true)
    {
        dialog.dialog("close");
        location.reload();
    }
    else
        window.alert("Login and/or password are incorrect.");
}

function loginAccount()
{
    $.ajax("/login",
    {
        data:
        {
            login: $("#login-field").val(),
            password: $("#password-field").val()
        },
        dataType: "json",
        success: loginAccountSuccess,
        error: function(err)
        {
            window.alert("Could not query database.  Try again later.");
        }
    });
}

function doCreateNewLogin()
{
    $("#new-login-form").dialog(
    {
        height: 400,
        width: 350,
        modal: true,
        buttons:
        {
            "Create account": createNewAccount
        }
    });
}

function doLogout()
{
	$.ajax("/logout",
	{
		dataType: "json",
		success: function()
		{
			location.reload();
		},
		error: function(err)
		{
			window.alert("Something went wrong with the logout function");
		}
	});
}

function createNewAccountSuccess(json)
{
    if (json.success == true)
        location.reload();
    else
        window.alert("This account already exists.");
}

function createNewAccount()
{
    $.ajax("/createNewLogin",
    {
        data:
        {
            login: $("#new-login-field").val(),
            password: $("#new-password-field").val()
        },
        dataType: "json",
        success: createNewAccountSuccess,
        error: function()
        {
            window.alert("Could not update database.  Try again later.");
        }
    });
}


