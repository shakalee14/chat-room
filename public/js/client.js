$(document).ready(() => {
  $('#create').mouseover(() => {
    console.log('mouse over')
    $('body').animate({opacity: .5 })
    $('#create').css('border', '2px solid black')
  })
  $('#create').mouseout(() => {
    console.log('mouse over')
    $('body').animate({opacity: 1})
    $('#create').css('border', '0')
  })
})
