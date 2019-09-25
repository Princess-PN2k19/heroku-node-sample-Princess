var typing = 0;
var pmTyping = 0;
var stilltying = false;
var listOfUsers = [];
var typer = "";
var uname = "";
var id = "";
var firsttyper = true;
var conversations = [];
var typingNow = " is now typing 💬";
var messageID = 0;

$(document).ready(function () {

    var socket = io();
    $('#inputName').submit(function () {
        for (var i = 0; i < 10; ++i) {
            id += (Math.floor((Math.random() * 9) + 0)).toString();
        }


        socket.on('user login', function (msg) {
            if (!listOfUsers.includes(msg.name + ": " + msg.id) && msg.id != id) {
                listOfUsers.push(msg.name + ": " + msg.id);
                $('#activeUsers').append("<div class='otherUser' id='" + msg.id + msg.name + "'><h3 id='User'>" + msg.name + "</h3><span id='userId'>" + msg.id + "</span></div>");
                socket.emit('user login', { id: id, name: uname });
            }
        });


        socket.on('private message', function (msg) {
            if (msg.receipient == uname + id) {
                if (!conversations.includes(msg.name + msg.id)) {
                    conversations.push(msg.name + msg.id);
                    privateChat(msg.name + msg.id, msg.name, msg.message);
                } else {
                    $("#" + msg.name + msg.id).find("#pmTyping").remove();
                    $("#" + msg.name + msg.id).find("#pm").append("<div class='pmdivh'><div class='pmdiv' id='ntm'><p id='PM'><b>" + msg.name + "</b>: " + msg.message + "</p></div></div>");
                    $("#" + msg.name + msg.id).show();
                }
            } else if (msg.name + msg.id == uname + id) {
                $("#" + msg.receipient).find("#pm").append("<div class='pmdivh'><div class='pmdiv' id='mm'><p id='PM'><b>Me</b>: " + msg.message + "</p></div></div>");
            }
        });



        socket.on('typing', function (msg) {
            if (msg.type == "private") {
                if (msg.receipient == uname + id) {
                    $("#" + msg.name + msg.id).find("#pmTyping").remove();
                    clearInterval(pmTyping);
                    $("#" + msg.name + msg.id).find("#pm").append("<div class='pmdivh' id='pmTyping'><div class='typingPM'><p>" + msg.name + " is typing..." + "</p></div></div>");
                    pmTyping = setInterval(function () { $("#" + msg.name + msg.id).find("#pmTyping").remove(); }, 1000);
                }
            } else if (msg.id != id && msg.name != uname) {
                $("#typing").remove();
                clearInterval(typing);
                if (!typer.includes(msg.name)) {
                    if (firsttyper == true) {
                        firsttyper = false;
                        typer += msg.name;
                    } else {
                        typingNow = " are typing 💬";
                        typer += " & " + msg.name;
                    }
                }
                $('#messages').append("<h5 id='typing'>" + typer + typingNow + "</h5>");
                typing = setInterval(function () { $("#typing").remove(); }, 1000);
            }
        });

        socket.on('logout', function (msg) {
            $("#" + msg.id + msg.name).find("#User").css({ "color": "#cccccc" });
            $("#" + msg.id + msg.name).find("#User").text(msg.name + " left!");
            setInterval(function () { $("#" + msg.id + msg.name).remove(); }, 3000);
            if (msg.id == id && msg.name == uname) {
                location.reload();
            }
        });


        socket.on('chat message', function (msg) {
            $("#messagesHolder").scrollTop($("#messagesHolder")[0].scrollHeight);
            if (msg.id == id && msg.name == uname) {
                publicChat('myMess', "<b>Me</b>: " + msg.message);
            } else {
                typer = "";
                firsttyper = true;
                typingNow = " is typing 💬";
                $("#typing").remove();
                publicChat('othersMess', "<b>" + msg.name + "</b>: " + msg.message);
            }
        });

        uname = $("#username").val().split(" ").join("_");
        if (!uname.includes(": ")) {
            $(".uname").text(uname);
            socket.emit('user login', { id: id, name: uname });
            $("#title").text(uname);
            $("#inputName").hide();
            $(".container").show();
        } else {
            alert("Invalid username!");
        }
        return false;
    });

    $('#chatbox').submit(function (e) {
        e.preventDefault();
        if ($('#m').val() != "") {
            socket.emit('chat message', { id: id, name: uname, message: $('#m').val() });
            $('#m').val('');
        }
    });
});

$(document).ready(function () {
    $('#m').keydown(function () {
        socket.emit('typing', { id: id, name: uname, type: "public" });
    });
});

$(document).on('keydown', "#m2", function () {
    socket.emit('typing', { id: id, name: uname, receipient: $(this).closest("div").closest("div").attr("id"), type: "private" });

});

$(document).on("mouseenter", ".otherUser", function () {
    $(this).css({ "background-color": "grey" });
    $(this).css({ "box-shadow": "-5px 5px 5px #cccccc" });
});

$(document).on("mouseleave", ".otherUser", function () {
    $(this).css({ "background-color": "transparent" });
    $(this).css({ "box-shadow": "none" });
});

$(document).on("mouseenter", ".newMes", function () {
    $(this).css({ "box-shadow": "-5px 5px 5px #cccccc" });
});

$(document).on("mouseleave", ".newMes", function () {
    $(this).css({ "box-shadow": "none" });
});



$(document).on('click', '#close', function () {
    $(this).closest("div").hide();
});

$(document).ready(function () {
    $("#logout").click(function () {
        socket.emit('logout', { id: id, name: uname });
    });
});

$(window).unload(function () {
    socket.emit('logout', { id: id, name: uname });
});

$(window).on('beforeunload', function () {
    socket.emit('logout', { id: id, name: uname });
});

function publicChat(divType, message) {
    $('#messages').append("<div id='mesDivHolder'><div class='newMes' id='" + divType + "'><h5 id='me'>" + message + "</h5></div><div>");
}


$(document).on('click', '.otherUser', function () {
    if (!conversations.includes($(this).find("#User").text() + $(this).find("#userId").text())) {
        conversations.push($(this).find("#User").text() + $(this).find("#userId").text());
        privateChat($(this).find("#User").text() + $(this).find("#userId").text(), $(this).find("#User").text(), "Hi:)");
    } else {
        $("#" + $(this).find("#User").text() + $(this).find("#userId").text()).show();
    }
});

function privateChat(converId, name, pmessage) {
    $('#chatboxes').prepend("<div id='" + converId + "' class='newChatWindow'><p id='close'>x</p><h3 id='chatmateName'>" + name + "</h3><div id='pmholder'><p id='pm'></p></div><form id='chatbox2'><input id='m2' autofocus='' autocomplete='off' placeholder='Send a message'/></form></div>");
    $("#" + converId).find("#pm").append("<div class='pmdivh'><div class='pmdiv' id='ntm'><p id='PM'><b>" + name + "</b>: " + pmessage + "</p></div></div>");
}
$(document).on('submit', "#chatbox2", function (e) {
    e.preventDefault();
    if ($(this).find("#m2").val() != "") {
        socket.emit('private message', { id: id, name: uname, receipient: $(this).closest("div").closest("div").attr("id"), message: $(this).find("#m2").val() });
        $(this).find("#m2").val("");
        var h = $(this).closest("div").find("#pmholder")[0].scrollHeight;
        $(this).closest("div").find("#pmholder").scrollTop(h);
    }
});
