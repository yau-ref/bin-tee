function loadMarks(){
  user = $("#users option:selected" ).text()
    $.ajax({
      url: '/marks/' + user,
      success: function(result){
        $('#marks').text("")
        marks = result.split(";")       
        $.each(marks, function( index, value ) {
          $('#marks')
           .append($('<li class="markLine"></li>')
           .text(value))
        })
        $(".markLine").unbind()
        $(".markLine").click(editMark)
      }
    })
}

function loadUsers(){
    $.ajax({
      url: '/users',
      success: function(result){
        users = result.split(",")       
        $.each(users, function( index, value ) {
          $('#users')
            .append($("<option></option>")
              .attr("value", value)
              .text(value))
        })
        loadMarks()
        $("#lists").css("visibility", "visible")
      }
    })
}

function editMark(e){
  if (!e.shiftKey) {
    $("#marks").hide()
    $("#addmarkForm").show()
    $("#addMark").text("Изменить")
    var data = $(this).text().split(': ')
    $('#subj').attr("readonly",true) 
    $("#subj").val(data[0])
    $("#markVal").val(data[1])
    
    $("#addMark").unbind()
    $("#addMark").click(submitMark(true))
  }else{
     deleteMark(this)
  }
}

function deleteMark(elt){
  var data = $(elt).text().split(': ')
  var user = $("#users option:selected" ).text()
  var subj = data[0]
  var mark = data[1]
  $.ajax({
    url: '/marks/',
    type: 'DELETE',
    data: {
      username: user,
      subject: subj,
      markValue: mark
    },
    success: function(result) {
      $("#marks").hide()
      $("#marks").show()
      loadMarks()
    }
  })
}



function submitMark(update){
  return function(){
    var user = $("#users option:selected" ).text()
    var subj = $("#subj").val()
    var mark = $("#markVal").val()

    $.ajax({
      url: '/marks/',
      type: update ? 'PUT' : 'POST',
      data: {
        username: user,
        subject: subj,
        markValue: mark
      },
      success: function(result) {
        loadMarks()
      }
    })


    $("#addmarkForm").hide()
    $("#marks").show()
    $(this).unbind()
    $(this).click(showAddForm)
    $(this).text("+")
    $('#subj').attr("readonly",false) 
  }
}

function showAddForm(){
  $("#marks").hide()
  $("#addmarkForm").show()
  $("#addMark").text("Добавить")
  $("#addMark").unbind()
  $("#addMark").click(submitMark(false))  
}

 
$(document).ready(function(){
  $("#showIt").click(loadUsers)
  $("#users").click(loadMarks)
  $("#addMark").click(showAddForm)  
})

