$(document).ready(function () {
    $('.modal-trigger').leanModal();
    $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: false, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left' // Displays dropdown with edge aligned to the left of button
        }
    );

    if (!localStorage.userLogged)
        $('#login-container').hide();
    $(document).on('click', '#register-btn', function (e) {
        e.preventDefault();
        document.getElementById('register-form').submit();
    });
});

//Listener to add tags from the tag suggeting to the current posts
$("#tag-post-list").on("click", ".tag-post-list-item", function () {
    var html = "<div class='chip'>" + $(this).html() + "<i class='material-icons'>close</i></div>"
    $('#tag-post-selection').append(html);
    console.log($(this));
});

//Listener to open features when cliked on a particular tag

//$(document).on("click", ".user-link", function () {
//    var inMemoryChatModule = peopleChatModule.getContainerList()[$(this).text()];
//    if (inMemoryChatModule) {
//        inMemoryChatModule.renderToDom();
//    }
//    else {
//        var peopleId = $(this).attr('pid');
//        var peopleName = $(this).text();
//        var people = {_id: people, name: peopleName};
//        var chatContainer = peopleChatModule.createTagChatContainer(people, false);
//        peopleChatModule.addToChatContainerList(chatContainer);
//        chatContainer.renderToDom();
//    }
//});

$('#create-ripple').on('click',function(){
    //$(this).removeClass('chip');
    $('.edit-query').show();
    $('.edit-query').focus();
});
$('.edit-query').on('focusout',function(){
    $('.edit-query').hide();
});

$('.edit-query').on('keyup', function (event) {
    if(event.which==13){
        console.log($(this).val());
        twooshSocket.sendRipple($(this).val(), function (res) {

        });
    }
    else if(event.which==27){
        $(this).hide();
    }
});


$('#entry-main-search-btn').on('click', function (e) {
    var ripple = $('#entry-main-search-textarea').val();
    if (ripple.length > 1) {
        window.location.href = '/home?query=' + encodeURIComponent(ripple);
    }
    else{//view mode
        var ripple ='';
        window.location.href = '/home';
    }
});
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#blah').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#imgInp").change(function () {
    readURL(this);
});
