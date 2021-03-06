firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var ambassadorDB = firebase.firestore()
        var adminID = user.uid

        //Check if user is an admin, TODO
        ambassadorDB.collection("users").doc(adminID).get().then(function(doc) {
            console.log(doc.data().admin)
        })

        //Get all ambassadors and build blocks
        var pendingAmbassadorArea = document.getElementById('pending-ambassador-section')
	var approvedAmbassadorSection = document.getElementById('approved-ambassador-section')
    	var rejectedAmbassadorSection = document.getElementById('rejected-ambassador-section')

        ambassadorDB.collection("ambassadors").onSnapshot(function(allAmbassadors) {
            //reinitialize arrays on update
            pendingAmbassadorArray = []
	    approvedAmbassadorArray = []
	    rejectedAmbassadorArray = []
		
	    //remove all children when updated
            while(pendingAmbassadorArea.firstChild) {
                pendingAmbassadorArea.removeChild(pendingAmbassadorArea.firstChild)
            }
	    while(approvedAmbassadorSection.firstChild) {
                approvedAmbassadorSection.removeChild(approvedAmbassadorSection.firstChild)
            }
	    while(rejectedAmbassadorSection.firstChild) {
                rejectedAmbassadorSection.removeChild(rejectedAmbassadorSection.firstChild)
            }
		
            //loop through all ambassadors
            allAmbassadors.forEach(function(doc) {
    		console.log("ambassador found")
                var ambassadorID = doc.id,
                    firstName = doc.data().firstName,
                    lastName = doc.data().lastName,
                    email = doc.data().email,
                    school = doc.data().school,
                    timeApplied = doc.data().metadata.dateApplied,
                    memeURL = doc.data().memeURL,
		    status = doc.data().status
                
                buildAmbassadorBlock(ambassadorID, 
                                      firstName, 
                                      lastName, 
                                      email,
				      school,
                                      timeApplied, 
                                      memeURL,
				      status)
            })
          	appendToPendingAmbassadorArea()
		appendToApprovedAmbassadorArea()
		appendToRejectedAmbassadorArea()
        })
      
    } else {
	location.href = "https://www.jointutortree.com"
    }
})

function buildAmbassadorBlock(ambassadorID, firstName, lastName, email, school, timeApplied, memeURL, status) {
      var ambassadorInfoBlock = document.createElement('div')
      ambassadorInfoBlock.setAttribute('class', 'ambassador-info-block')
      ambassadorInfoBlock.setAttribute('id', timeApplied)
	console.log("Ambassadors status: " + status)
      	
      //Name block
      var ambassadorNameBlock = document.createElement('div')
      ambassadorNameBlock.setAttribute('class', 'ambassador-name-block')
      ambassadorInfoBlock.appendChild(ambassadorNameBlock)
  
      var ambassadorNameHeader = document.createElement('h3')
      ambassadorNameHeader.setAttribute('class', 'ambapp-header')
      ambassadorNameHeader.innerHTML = firstName + " " + lastName
      ambassadorNameBlock.appendChild(ambassadorNameHeader)
  
      var ambassadorDateApplied = document.createElement('div')
      ambassadorDateApplied.setAttribute('class', 'ambapp-text')
      var applicantDate = new Date(timeApplied * 1000)
      var formattedTimeApplied = applicantDate.toLocaleDateString("en-US", {month:'long', day: 'numeric',
          hour: 'numeric', minute:'numeric'})
      ambassadorDateApplied.innerHTML = formattedTimeApplied
      ambassadorNameBlock.appendChild(ambassadorDateApplied)
  
      var ambassadorEmail = document.createElement('div')      
      ambassadorEmail.setAttribute('class', 'ambapp-text')
      ambassadorEmail.innerHTML = email
      ambassadorNameBlock.appendChild(ambassadorEmail)
  
      //School Block
      var ambassadorSchoolBlock = document.createElement('div')
      ambassadorSchoolBlock.setAttribute('class', 'ambassador-school-block')
      ambassadorInfoBlock.appendChild(ambassadorSchoolBlock)
  
      var ambassadorSchoolHeader = document.createElement('h3')
      ambassadorSchoolHeader.setAttribute('class', 'ambapp-header')
      ambassadorSchoolHeader.innerHTML = "School"
      ambassadorSchoolBlock.appendChild(ambassadorSchoolHeader)
  
      var ambassadorSchool = document.createElement('div')
      ambassadorSchool.setAttribute('class', 'ambapp-text')
      ambassadorSchool.innerHTML = school
      ambassadorSchoolBlock.appendChild(ambassadorSchool)
      
      //Application Block
      var ambassadorApplicationBlock = document.createElement('div')
      ambassadorApplicationBlock.setAttribute('class', 'ambassador-application')
      ambassadorApplicationBlock.setAttribute('onClick', 'showAmbassadorInterview("'+ambassadorID+'")')
      ambassadorInfoBlock.appendChild(ambassadorApplicationBlock)
  
      var ambassadorApplicationHeader = document.createElement('h3')
      ambassadorApplicationHeader.setAttribute('class', 'ambapp-header')
      ambassadorApplicationHeader.innerHTML = "Application"
      ambassadorApplicationBlock.appendChild(ambassadorApplicationHeader)
  
      //Meme Block
      var ambassadorMemeBlock = document.createElement('div')
      ambassadorMemeBlock.setAttribute('class', 'ambassador-meme')
      ambassadorMemeBlock.setAttribute('onClick', 'showMeme("' + ambassadorID + '")')
      ambassadorInfoBlock.appendChild(ambassadorMemeBlock)
  
      var ambassadorMemeHeader = document.createElement('h3')
      ambassadorMemeHeader.setAttribute('class', 'ambapp-header')
      ambassadorMemeHeader.innerHTML = 'Meme'
      ambassadorMemeBlock.appendChild(ambassadorMemeHeader)
      
      var ambassadorPrivilegesBlock = document.createElement('div')
      ambassadorPrivilegesBlock.setAttribute('class', 'ambassador-privileges')
      ambassadorInfoBlock.appendChild(ambassadorPrivilegesBlock)
  
      var ambassadorApproveButton = document.createElement('div')
      ambassadorApproveButton.setAttribute('class', 'ambapp-approve')
      ambassadorApproveButton.setAttribute('onClick', 'setAmbassadorPrivileges("' + ambassadorID + '", "approved")')
      ambassadorApproveButton.innerHTML = 'Approve'
	  
      var ambassadorRejectButton = document.createElement('div')
      ambassadorRejectButton.setAttribute('class', 'ambapp-reject')
      ambassadorRejectButton.setAttribute('onClick', 'setAmbassadorPrivileges("' + ambassadorID + '", "rejected")')
      ambassadorRejectButton.innerHTML = 'Reject'
	
	if (status == "pending") {
		updatePendingAmbassadorArray(timeApplied)
		ambassadorPrivilegesBlock.appendChild(ambassadorApproveButton)
		ambassadorPrivilegesBlock.appendChild(ambassadorRejectButton)

	} else if (status == "approved"){
		updateApprovedAmbassadorArray(timeApplied)
		ambassadorPrivilegesBlock.appendChild(ambassadorRejectButton)

	} else if (status == "rejected") {
		updateRejectedAmbassadorArray(timeApplied)
		ambassadorPrivilegesBlock.appendChild(ambassadorApproveButton)
	}
      document.getElementById('hidden-ambassador-section').appendChild(ambassadorInfoBlock)


}

function setAmbassadorPrivileges(ID, privileges) {
	var ambassadorDB = firebase.firestore()
	ambassadorDB.collection("ambassadors").doc(ID).update( { "status" : privileges } )
	mixpanel.track("Ambassador Privileges Updated",
		       {"Ambassador": ID, 
			"Status": privileges});

}

function showMeme(ID) {
	var ambassadorDB = firebase.firestore()
	ambassadorDB.collection("ambassadors").doc(ID).get().then(function(doc) {
		var memeLink = doc.data().memeURL
		window.open(memeLink)
	})
}

function showAmbassadorInterview(ambassadorID) {
	document.getElementById("ambassador-application-modal").style.display = "flex"
	
	var ambassadorDB = firebase.firestore()
	ambassadorDB.collection("ambassadors").doc(ambassadorID).get().then(function(doc) {
		document.getElementById("firstName").innerHTML = doc.data().firstName
		document.getElementById("lastName").innerHTML = doc.data().lastName
		document.getElementById("email").innerHTML = doc.data().email
		document.getElementById("phoneNumber").innerHTML = doc.data().phoneNumber
		document.getElementById("school").innerHTML = doc.data().school
		document.getElementById("year").innerHTML = doc.data().year
		document.getElementById("major").innerHTML = doc.data().major
		document.getElementById("live").innerHTML = doc.data().livesNearCampus
		document.getElementById("favorite").innerHTML = doc.data().favoriteOffCampus
		document.getElementById("organizations").innerHTML = doc.data().organizations
		document.getElementById("platform").innerHTML = doc.data().socialMediaField
		document.getElementById("followers").innerHTML = doc.data().numberOfFollowers
		document.getElementById("link").innerHTML = doc.data().socialHandle
		document.getElementById("knowAnyone").innerHTML = doc.data().knowsEmployees
		document.getElementById("howHeard").innerHTML = doc.data().howHeardField
	})
}

//Sort applicants by date applied
function sortNumberApplicant(a,b) {
	return(a-b)
}
//Pending ambassadors
var pendingAmbassadorArray = []
function updatePendingAmbassadorArray(timestamp) {
	pendingAmbassadorArray.push(timestamp)
    	pendingAmbassadorArray.sort(sortNumberApplicant)
}

function appendToPendingAmbassadorArea() {
    var items = pendingAmbassadorArray.length
    var pendingAmbassadorSection = document.getElementById('pending-ambassador-section')
    
    for( i=0 ; i < items ; i++ ) {
    	var timestampID = pendingAmbassadorArray[i]
    	var pendingAmbassadorBlock = document.getElementById(timestampID)
        pendingAmbassadorSection.appendChild(pendingAmbassadorBlock)
    }
}

//Approved ambassadors
var approvedAmbassadorArray = []
function updateApprovedAmbassadorArray(timestamp) {
	approvedAmbassadorArray.push(timestamp)
    	approvedAmbassadorArray.sort(sortNumberApplicant)
}

function appendToApprovedAmbassadorArea() {
    var items = approvedAmbassadorArray.length
    var approvedAmbassadorSection = document.getElementById('approved-ambassador-section')
    
    for( i=0 ; i < items ; i++ ) {
    	var timestampID = approvedAmbassadorArray[i]
    	var approvedAmbassadorBlock = document.getElementById(timestampID)
        approvedAmbassadorSection.appendChild(approvedAmbassadorBlock)
    }
}

//Rejected Ambassadors
var rejectedAmbassadorArray = []
function updateRejectedAmbassadorArray(timestamp) {
	rejectedAmbassadorArray.push(timestamp)
    	rejectedAmbassadorArray.sort(sortNumberApplicant)
}

function appendToRejectedAmbassadorArea() {
    var items = rejectedAmbassadorArray.length
    var rejectedAmbassadorSection = document.getElementById('rejected-ambassador-section')
    
    for( i=0 ; i < items ; i++ ) {
    	var timestampID = rejectedAmbassadorArray[i]
    	var rejectedAmbassadorBlock = document.getElementById(timestampID)
        rejectedAmbassadorSection.appendChild(rejectedAmbassadorBlock)
    }
}

          

