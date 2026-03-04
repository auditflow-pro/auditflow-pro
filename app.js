document.addEventListener("DOMContentLoaded", () => {

const dateField = document.getElementById("assessmentDate")

if (dateField) {

const today = new Date()

const yyyy = today.getFullYear()
const mm = String(today.getMonth() + 1).padStart(2,'0')
const dd = String(today.getDate()).padStart(2,'0')

dateField.value = `${yyyy}-${mm}-${dd}`

}

})